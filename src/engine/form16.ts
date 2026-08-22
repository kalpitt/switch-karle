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

// CANDIDATE: ignores other deductions/exemptions and §234B/§234C interest; one standard deduction on combined salary, not per employer.

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
