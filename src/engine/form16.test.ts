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

/**
 * TRUST-07: the Form-16 tool's worked example has two employers, each of whom
 * withheld as if it were the only one. Hand-derived, new regime:
 * - Employer 1, ₹10,00,000 (April–September): taxable ₹9,25,000, slab tax
 *   ₹32,500, fully rebated under s.156 → TDS ₹0.
 * - Employer 2, ₹13,00,000 (October–March): taxable ₹12,25,000, slab tax
 *   ₹63,750, marginal relief caps it at the ₹25,000 above ₹12L, + 4% cess →
 *   TDS ₹26,000.
 * - Combined ₹23,00,000: taxable ₹22,25,000, slab tax ₹2,56,250 + 4% cess →
 *   ₹2,66,500. Still due: ₹2,66,500 − ₹26,000 = ₹2,40,500.
 */
describe('form16Shock — two-employer worked example', () => {
  it('each employer withholding alone leaves ₹2,40,500 due', () => {
    const tds1 = computeTax(1_000_000 - STANDARD_DEDUCTION.new, 'new').totalTax
    const tds2 = computeTax(1_300_000 - STANDARD_DEDUCTION.new, 'new').totalTax
    expect(tds1).toBe(0)
    expect(tds2).toBe(26_000)
    const r = form16Shock({
      employer1Gross: 1_000_000,
      employer1Tds: tds1,
      employer2Gross: 1_300_000,
      employer2Tds: tds2,
      regime: 'new',
    })
    expect(r.combinedTaxableApprox).toBe(2_225_000)
    expect(r.taxIfSingleEmployer).toBe(266_500)
    expect(r.tdsTotal).toBe(26_000)
    expect(r.shock).toBe(240_500)
  })
})
