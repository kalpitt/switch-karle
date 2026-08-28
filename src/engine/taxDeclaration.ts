import type { OfferInput, Regime, SalaryBreakdown } from './types'
import { decodeOffer } from './salary'

export type ProofId = 'hra' | '80c' | '80d' | 'form16-prev' | 'form12b'

export interface TaxDeclarationInput {
  offer: OfferInput
  claimingHra: boolean
  extra80C: boolean
}

export interface TaxDeclarationResult {
  breakdown: SalaryBreakdown
  recommendedRegime: Regime
  hraExemptionAnnual: number
  hraUseful: boolean
  proofIds: ProofId[]
  form16DelayNote: true
  form12bNote: true
}

/**
 * New-employer declaration plan from the decoder offer.
 *
 * CANDIDATE: HRA proofs / landlord PAN (recollection Rule 26C / Form 12BB)
 * are employer-process, not independently primary-sourced this session.
 * Form 16 from the previous employer often arrives after you have left —
 * that delay is the point of the tool, not a statute.
 *
 * CANDIDATE: Form 12B (recollection Rule 26A / s.192(2)) is the previous-
 * employer income/TDS declaration to the new payroll. This engine does not
 * assert a "second slab benefit" withholding mechanism — confirm with a CA.
 */
export function taxDeclaration(input: TaxDeclarationInput): TaxDeclarationResult {
  const breakdown = decodeOffer(input.offer)
  const hraExemptionAnnual = breakdown.hraExemptionAnnual
  const hraUseful = breakdown.recommendedRegime === 'old' && hraExemptionAnnual > 0 && input.claimingHra

  const proofIds: ProofId[] = ['form12b', 'form16-prev']
  if (hraUseful) proofIds.push('hra')
  if (input.extra80C) proofIds.push('80c')
  if ((input.offer.old?.deduction80D ?? 0) > 0) proofIds.push('80d')

  return {
    breakdown,
    recommendedRegime: breakdown.recommendedRegime,
    hraExemptionAnnual,
    hraUseful,
    proofIds,
    form16DelayNote: true,
    form12bNote: true,
  }
}
