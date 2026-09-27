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
 * HRA proofs / landlord PAN: Rule 205 / Form No. 124 (formerly Rule 26C /
 * Form 12BB) under s.392(5)(b) of the Income-tax Act, 2025. VERIFIED:
 * 2026-09-27 | Source: Income-tax Rules, 2026 (G.S.R. 198(E))
 * https://www.incometaxindia.gov.in/documents/81799/11848482/En-Notified-IT-Rules-2026-20-03-2026.pdf
 * Rule 205 | FY: 2026-27. Form 16 from the previous employer often arrives
 * after you have left — that delay is the point of the tool, not a statute.
 *
 * Form 12B (previous-employer income/TDS declaration to the new payroll) is
 * the particulars an employee may furnish under s.392(4)(a)(i) of the
 * Income-tax Act, 2025 (not s.392(2), which does not exist in that Act).
 * This engine does not assert a "second slab benefit" withholding mechanism
 * — confirm with a CA.
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
