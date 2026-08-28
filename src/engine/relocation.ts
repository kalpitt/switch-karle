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
 *
 * CANDIDATE: PT table is approximate (municipal notifications); HRA metro limb
 * is Rule 2A as implemented in `hraExemptionAnnual`. No cost-of-living index.
 */
export function relocationDelta(input: OfferInput, to: RelocationTarget): RelocationDelta {
  const from = decodeOffer(input)
  const toBreakdown = decodeOffer(cloneForTarget(input, to))

  const ptDeltaAnnual = PROFESSIONAL_TAX_ANNUAL[to.state] - PROFESSIONAL_TAX_ANNUAL[input.state]

  return {
    from,
    to: toBreakdown,
    ptDeltaAnnual,
    hraExemptionFrom: from.hraExemptionAnnual,
    hraExemptionTo: toBreakdown.hraExemptionAnnual,
    inHandDeltaMonthly: toBreakdown.inHandMonthly - from.inHandMonthly,
    nationalSlabDeltaIsNil: true,
  }
}
