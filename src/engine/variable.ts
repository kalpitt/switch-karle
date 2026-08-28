import type { OfferInput, Regime, SalaryBreakdown } from './types'
import { decodeOffer } from './salary'
import { computeTax } from './tax'

/**
 * What the monthly bank credit looks like if variable pays 0 / 50 / 100%,
 * plus the first-year pro-rate and the lump-vs-spread cashflow split.
 *
 * Tax on a variable slice is a `computeTax` delta against the recommended
 * regime's **full-year** taxable from `decodeOffer` — we do not invent a
 * separate TDS rate, and we do not shrink the tax base when `monthsInFy` < 12
 * (a mid-year switcher usually already has income from the earlier employer).
 */
export interface VariableRealityInput {
  offer: OfferInput
  /** Months of this FY you will be on payroll. 12 = full year, no pro-rate. */
  monthsInFy: number
}

export interface VariablePayoutRow {
  fraction: 0 | 0.5 | 1
  netVariableAnnual: number
  inHandMonthlyIfSpread: number
}

export interface VariableRealityResult {
  fixedCtc: number
  quotedVariable: number
  proratedVariable: number
  firstYearProrate: boolean
  monthsInFy: number
  regime: Regime
  /**
   * Variable slice is pro-rated; tax is still computed on the decoder's
   * full-year taxable (as if this CTC applied all year). Disclose in the UI.
   */
  taxedOnFullYearBase: true
  /** Monthly in-hand on fixed pay only (variable = 0). */
  inHandMonthlyFixed: number
  rows: VariablePayoutRow[]
  /** 100% payout received once, after tax, vs the same net spread over 12 months. */
  withheldVsSpread: {
    lumpNet: number
    spreadMonthly: number
  }
}

function clampMonths(n: number): number {
  if (!Number.isFinite(n)) return 12
  return Math.min(12, Math.max(0, Math.round(n)))
}

function taxableOf(b: SalaryBreakdown, regime: Regime): number {
  return regime === 'new' ? b.newRegime.taxableIncome : b.oldRegime.taxableIncome
}

function taxOf(b: SalaryBreakdown, regime: Regime): number {
  return regime === 'new' ? b.newRegime.totalTax : b.oldRegime.totalTax
}

function netVariable(b: SalaryBreakdown, extraVar: number, regime: Regime): number {
  if (extraVar <= 0) return 0
  const extraTax = computeTax(taxableOf(b, regime) + extraVar, regime).totalTax - taxOf(b, regime)
  return extraVar - extraTax
}

export function variableReality(input: VariableRealityInput): VariableRealityResult {
  const monthsInFy = clampMonths(input.monthsInFy)
  const b = decodeOffer(input.offer)
  const regime = b.recommendedRegime
  const quotedVariable = Math.max(0, input.offer.variableAnnual)
  const proratedVariable = quotedVariable * (monthsInFy / 12)
  const fractions = [0, 0.5, 1] as const
  const rows: VariablePayoutRow[] = fractions.map((fraction) => {
    const extra = proratedVariable * fraction
    const net = netVariable(b, extra, regime)
    return {
      fraction,
      netVariableAnnual: net,
      inHandMonthlyIfSpread: Math.round(b.inHandMonthly + net / 12),
    }
  })
  const full = rows[2]!
  return {
    fixedCtc: b.fixedCtc,
    quotedVariable,
    proratedVariable,
    firstYearProrate: monthsInFy < 12,
    monthsInFy,
    regime,
    taxedOnFullYearBase: true,
    inHandMonthlyFixed: b.inHandMonthly,
    rows,
    withheldVsSpread: {
      lumpNet: full.netVariableAnnual,
      spreadMonthly: full.inHandMonthlyIfSpread,
    },
  }
}
