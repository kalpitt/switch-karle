import type { OfferInput, StateCode } from '../engine/types'
import { PROFESSIONAL_TAX_ANNUAL } from '../engine/professionalTax'

/**
 * Parses the JSON block the 'offer-extract' prompt asks the user's AI to
 * produce, and maps it onto a partial OfferInput. Tolerant by design: the
 * text may contain prose, a ```json fence, or a bare object; numbers may
 * arrive as strings; unknown fields are ignored; null/absent fields are
 * reported as `missing` and never overwrite the user's current values.
 */

const L = 100_000

export interface OfferImportResult {
  patch: Partial<OfferInput>
  /** Human-readable names of fields that were filled. */
  filled: string[]
  /** Schema keys the AI left null — the "ask HR" list. */
  missing: string[]
}

const STATE_CODES = new Set(Object.keys(PROFESSIONAL_TAX_ANNUAL))

function extractJson(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  const candidates: string[] = []
  if (fenced) candidates.push(fenced[1])
  const bare = text.match(/\{[\s\S]*\}/)
  if (bare) candidates.push(bare[0])
  for (const c of candidates) {
    try {
      const obj = JSON.parse(c)
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj as Record<string, unknown>
    } catch {
      /* try next candidate */
    }
  }
  throw new Error('no-json')
}

function num(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[₹,\s]/g, ''))
  return Number.isFinite(n) ? n : undefined
}

function bool(v: unknown): boolean | undefined {
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === 'yes') return true
  if (v === 'false' || v === 'no') return false
  return undefined
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export function parseAiOffer(text: string): OfferImportResult {
  const raw = extractJson(text)
  const patch: Partial<OfferInput> = {}
  const filled: string[] = []
  const missing: string[] = []

  const take = (key: string, label: string, apply: (v: unknown) => boolean) => {
    const v = raw[key]
    if (v === null || v === undefined) {
      missing.push(key)
      return
    }
    if (apply(v)) filled.push(label)
    else missing.push(key)
  }

  take('ctc_lpa', 'CTC', (v) => {
    const n = num(v)
    if (n === undefined || n <= 0 || n > 10_000) return false
    patch.ctcAnnual = Math.round(n * L)
    return true
  })
  take('variable_lpa', 'Variable', (v) => {
    const n = num(v)
    if (n === undefined || n < 0) return false
    patch.variableAnnual = Math.round(n * L)
    return true
  })
  take('basic_percent_of_fixed', 'Basic %', (v) => {
    const n = num(v)
    if (n === undefined || n <= 0) return false
    patch.basicPercent = clamp(Math.round(n), 10, 80)
    return true
  })
  take('hra_percent_of_basic', 'HRA %', (v) => {
    const n = num(v)
    if (n === undefined || n < 0) return false
    patch.hraPercentOfBasic = clamp(Math.round(n), 0, 60)
    return true
  })
  take('employer_pf_in_ctc', 'Employer PF in CTC', (v) => {
    const b = bool(v)
    if (b === undefined) return false
    patch.employerPfInCtc = b
    return true
  })
  take('gratuity_in_ctc', 'Gratuity in CTC', (v) => {
    const b = bool(v)
    if (b === undefined) return false
    patch.gratuityInCtc = b
    return true
  })
  take('pf_on_full_basic', 'PF basis', (v) => {
    const b = bool(v)
    if (b === undefined) return false
    patch.pfOnFullBasic = b
    return true
  })
  take('notice_days', 'Notice period', (v) => {
    const n = num(v)
    if (n === undefined || n < 0 || n > 365) return false
    patch.noticePeriodDays = Math.round(n)
    return true
  })
  take('state_code', 'Work state', (v) => {
    const s = String(v).toUpperCase()
    if (!STATE_CODES.has(s)) return false
    patch.state = s as StateCode
    return true
  })

  // Grouped optionals: only meaningful when the primary amount is present.
  const bondAmount = num(raw['bond_amount_lakh'])
  if (bondAmount !== undefined && bondAmount > 0) {
    patch.bond = { amount: Math.round(bondAmount * L), months: Math.round(num(raw['bond_months']) ?? 12) }
    filled.push('Bond')
  } else if (raw['bond_amount_lakh'] === null) {
    missing.push('bond_amount_lakh')
  }

  const jbAmount = num(raw['joining_bonus_lakh'])
  if (jbAmount !== undefined && jbAmount > 0) {
    patch.joiningBonus = {
      amount: Math.round(jbAmount * L),
      clawbackMonths: Math.round(num(raw['clawback_months']) ?? 12),
    }
    filled.push('Joining bonus')
  } else if (raw['joining_bonus_lakh'] === null) {
    missing.push('joining_bonus_lakh')
  }

  const esopAmount = num(raw['esop_annual_lakh'])
  if (esopAmount !== undefined && esopAmount > 0) {
    patch.esop = {
      annualValue: Math.round(esopAmount * L),
      cliffMonths: Math.round(num(raw['esop_cliff_months']) ?? 12),
      liquid: bool(raw['esop_listed']) ?? false,
    }
    filled.push('ESOPs')
  } else if (raw['esop_annual_lakh'] === null) {
    missing.push('esop_annual_lakh')
  }

  if (filled.length === 0) throw new Error('no-fields')
  return { patch, filled, missing }
}
