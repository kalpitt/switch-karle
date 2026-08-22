import type { OfferInput, SalaryBreakdown, StateCode } from './types'
import { decodeOffer } from './salary'
import { PROFESSIONAL_TAX_ANNUAL } from './professionalTax'

export interface RelocationTarget {
  state: StateCode
  metro: boolean
  rentPaidMonthly: number
}

export interface RelocationDelta {
  from: SalaryBreakdown
  to: SalaryBreakdown
  ptDeltaAnnual: number
  hraExemptionFrom: number
  hraExemptionTo: number
  inHandDeltaMonthly: number
  /** National income-tax slabs do not vary by state — product rule, always true. */
  nationalSlabDeltaIsNil: true
}

function hraExemption(breakdown: SalaryBreakdown): number {
  const old = breakdown.input.old ?? {
    rentPaidMonthly: 0,
    metro: false,
    deduction80CExtra: 0,
    deduction80D: 0,
  }
  const rentAnnual = old.rentPaidMonthly * 12
  if (rentAnnual <= 0) return 0
  return Math.max(
    0,
    Math.min(
      breakdown.hra,
      rentAnnual - 0.1 * breakdown.basic,
      (old.metro ? 0.5 : 0.4) * breakdown.basic,
    ),
  )
}

function cloneForTarget(input: OfferInput, target: RelocationTarget): OfferInput {
  const old = input.old ?? {
    rentPaidMonthly: 0,
    metro: false,
    deduction80CExtra: 0,
    deduction80D: 0,
  }
  return {
    ...input,
    state: target.state,
    old: {
      rentPaidMonthly: target.rentPaidMonthly,
      metro: target.metro,
      deduction80CExtra: old.deduction80CExtra,
      deduction80D: old.deduction80D,
    },
  }
}

/**
 * Compare in-hand and deductions when relocating: same offer, different city.
 * State PT changes; old-regime HRA exemption changes with metro/rent limbs.
 * New-regime tax is unchanged by metro (HRA exemption is 0 there).
 */
export function relocationDelta(
  input: OfferInput,
  to: RelocationTarget,
): RelocationDelta {
  const from = decodeOffer(input)
  const toBreakdown = decodeOffer(cloneForTarget(input, to))

  const ptDeltaAnnual =
    PROFESSIONAL_TAX_ANNUAL[to.state] - PROFESSIONAL_TAX_ANNUAL[input.state]

  return {
    from,
    to: toBreakdown,
    ptDeltaAnnual,
    hraExemptionFrom: hraExemption(from),
    hraExemptionTo: hraExemption(toBreakdown),
    inHandDeltaMonthly: toBreakdown.inHandMonthly - from.inHandMonthly,
    nationalSlabDeltaIsNil: true,
  }
}
