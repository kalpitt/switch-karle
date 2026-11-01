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

// CANDIDATE: ignores other deductions/exemptions and advance-tax interest; one standard deduction on combined salary, not per employer.
// Interest citations for FY 2026-27 are s.424 (default in advance tax, old §234B: 1% a month when advance tax paid is below
// 90% of assessed tax) and s.425 (deferment, old §234C) of the Income-tax Act, 2025 as enacted (Gazette 21-Aug-2025, ICAI copy https://resource.cdn.icai.org/87647dtc-aps2139-inceome-tax-act-2025.pdf). Whether to model them is open (parked C13, CA).

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
