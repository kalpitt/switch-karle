import { describe, expect, it } from 'vitest'
import { computeTax, STANDARD_DEDUCTION } from './tax'
import { form16Shock } from './form16'

describe('form16Shock', () => {
  it('two ₹12L jobs, zero TDS, new regime — one std deduction, full shock', () => {
    const r = form16Shock({
      employer1Gross: 1_200_000,
      employer1Tds: 0,
      employer2Gross: 1_200_000,
      employer2Tds: 0,
      regime: 'new',
    })
    const taxable = 2_400_000 - STANDARD_DEDUCTION.new
    expect(r.combinedTaxableApprox).toBe(taxable)
    expect(r.taxIfSingleEmployer).toBe(computeTax(taxable, 'new').totalTax)
    expect(r.tdsTotal).toBe(0)
    expect(r.shock).toBe(292_500)
    expect(r.duplicateStdDeductionNote).toBe(true)
    expect(r.sections234Omitted).toBe(true)
  })
})
