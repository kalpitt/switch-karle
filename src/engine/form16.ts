import type { Regime } from './types'
import { STANDARD_DEDUCTION, computeTax } from './tax'

export interface Form16ShockInput {
  employer1Gross: number
  employer1Tds: number
  employer2Gross: number
  employer2Tds: number
  regime: Regime
}

export interface Form16ShockResult {
  combinedTaxableApprox: number
  taxIfSingleEmployer: number
  tdsTotal: number
  /** Positive = you still owe tax beyond what employers deducted. */
  shock: number
  duplicateStdDeductionNote: true
  sections234Omitted: true
}

// VERIFIED: 2026-11-28 | One standard deduction per person on total salary: s.19(1) Table Sl. 2 ("₹ 75000 or the
// salary, whichever is less" under s.202(1)) with s.15(2) ("employer includes former employer"), Income-tax Act, 2025
// as amended by the Finance Act 2026. Other deductions and exemptions are left out, which can only overstate the gap.
// Advance-tax interest is not computed. When it applies: tax payable after TDS actually deducted is ₹10,000 or more
// (s.404, s.405); none for a resident aged 60+ with no business income (s.403(3)); s.424 charges 1% a month from
// 1 April when advance tax paid is below 90% of assessed tax net of TDS; s.425 charges on missed instalments
// (15/45/75/100% by 15 Jun/Sep/Dec/Mar). Read in ICAI's April 2026 edition of the amended Act.

export function form16Shock(input: Form16ShockInput): Form16ShockResult {
  const combinedGross =
    Math.max(0, input.employer1Gross) + Math.max(0, input.employer2Gross)
  const combinedTaxableApprox = Math.max(0, combinedGross - STANDARD_DEDUCTION[input.regime])
  const taxIfSingleEmployer = computeTax(combinedTaxableApprox, input.regime).totalTax
  const tdsTotal = Math.max(0, input.employer1Tds) + Math.max(0, input.employer2Tds)
  const shock = taxIfSingleEmployer - tdsTotal

  return {
    combinedTaxableApprox,
    taxIfSingleEmployer,
    tdsTotal,
    shock,
    duplicateStdDeductionNote: true,
    sections234Omitted: true,
  }
}
