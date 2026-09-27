import { describe, expect, it } from 'vitest'
import { computeTax } from './tax'
import { hraExemptionAnnual, decodeOffer, stateHasHraMetroCity } from './salary'
import { scanRedFlags } from './redFlags'
import { formatCompact, formatINR, formatLPA } from './format'
import type { OfferInput } from './types'

/**
 * Golden cases hand-computed from the FY 2026-27 rules (slabs unchanged by
 * Budget 2026; rebate u/s 156 of the Income-tax Act, 2025 — max ₹60k to ₹12L
 * taxable with marginal relief; cess 4%; surcharge 10% above ₹50L taxable,
 * capped 25% for the new regime above ₹5 Cr).
 */
describe('computeTax — new regime FY 2026-27', () => {
  it('zero tax at ₹12,00,000 taxable (rebate u/s 156)', () => {
    const t = computeTax(1_200_000, 'new')
    expect(t.slabTax).toBe(60_000)
    expect(t.rebate).toBe(60_000)
    expect(t.totalTax).toBe(0)
  })

  it('marginal relief just above ₹12L: ₹12,10,000 → ₹10,400', () => {
    const t = computeTax(1_210_000, 'new')
    expect(t.slabTax).toBe(61_500)
    expect(t.totalTax).toBe(10_400)
  })

  it('₹24,25,000 taxable → ₹3,19,800', () => {
    expect(computeTax(2_425_000, 'new').totalTax).toBe(319_800)
  })

  it('₹60,00,000 taxable → 10% surcharge → ₹15,78,720', () => {
    const t = computeTax(6_000_000, 'new')
    expect(t.slabTax).toBe(1_380_000)
    expect(t.surcharge).toBe(138_000)
    expect(t.totalTax).toBe(1_578_720)
  })

  it('₹51,00,00,000 taxable (above ₹5 Cr) → new-regime surcharge still capped at 25%', () => {
    const t = computeTax(51_000_000, 'new')
    expect(t.slabTax).toBe(14_880_000)
    expect(t.surcharge).toBe(3_720_000)
    expect(t.totalTax).toBe(19_344_000)
  })
})

describe('computeTax — old regime', () => {
  it('₹10,00,000 taxable → ₹1,17,000', () => {
    expect(computeTax(1_000_000, 'old').totalTax).toBe(117_000)
  })

  it('zero tax at ₹4,90,000 taxable (rebate)', () => {
    expect(computeTax(490_000, 'old').totalTax).toBe(0)
  })
})

const baseOffer: OfferInput = {
  ctcAnnual: 2_400_000,
  variableAnnual: 0,
  basicPercent: 40,
  hraPercentOfBasic: 50,
  employerPfInCtc: true,
  gratuityInCtc: false,
  pfOnFullBasic: true,
  noticePeriodDays: 90,
  state: 'KA',
}

describe('decodeOffer — ₹24L CTC golden case (Karnataka, PF on full basic)', () => {
  const b = decodeOffer(baseOffer)

  it('decomposes the structure', () => {
    expect(b.fixedCtc).toBe(2_400_000)
    expect(b.basic).toBe(960_000)
    expect(b.hra).toBe(480_000)
    expect(b.employeePfAnnual).toBe(115_200)
    expect(b.grossSalary).toBe(2_284_800)
    expect(b.professionalTaxAnnual).toBe(2_400)
    expect(b.hraExemptionAnnual).toBe(0)
  })

  it('new regime: taxable ₹22,09,800 → tax ₹2,62,548 → ₹1,58,721/month in hand', () => {
    expect(b.newRegime.taxableIncome).toBe(2_209_800)
    expect(b.newRegime.totalTax).toBe(262_548)
    expect(b.inHandMonthlyNew).toBe(158_721)
  })

  it('old regime (no rent, PF-only 80C): tax ₹4,65,566 — new regime wins', () => {
    expect(b.oldRegime.totalTax).toBe(465_566)
    expect(b.recommendedRegime).toBe('new')
    expect(b.inHandMonthly).toBe(158_721)
  })

  it('truth ratio: ₹24L CTC is ~79% in hand', () => {
    expect(b.inHandRatio).toBeCloseTo(0.7936, 3)
  })
})

describe('decodeOffer — PF wage ceiling cap', () => {
  it('caps PF at ₹36,000/year when pfOnFullBasic is false (basic ₹9.6L > ₹3L ceiling)', () => {
    // basic 960,000 > EPF_WAGE_CEILING_ANNUAL 300,000 → pfBase = 300,000
    // employeePfAnnual = 12% * 300,000 = 36,000
    const b = decodeOffer({ ...baseOffer, pfOnFullBasic: false })
    expect(b.employeePfAnnual).toBe(36_000)
  })

  it('PF-capped golden: basic ₹40,000/month → employee PF ₹3,000/month (₹36,000/yr)', () => {
    // basic = 40,000 * 12 = 480,000 annual; hraPercentOfBasic 50 → hra 240,000
    // fixedCtc must be such that basicPercent 40% of fixedCtc = 480,000 → fixedCtc = 1,200,000
    // pfBase = min(480,000, 300,000) = 300,000 → employeePfAnnual = 12% * 300,000 = 36,000 = ₹3,000/month
    const b = decodeOffer({
      ...baseOffer,
      ctcAnnual: 1_200_000,
      basicPercent: 40,
      pfOnFullBasic: false,
    })
    expect(b.basic).toBe(480_000)
    expect(b.employeePfAnnual).toBe(36_000)
    expect(b.employeePfAnnual / 12).toBe(3_000)
  })
})

describe('decodeOffer — HRA Bengaluru (KA) getting the 50% limb', () => {
  it('KA with metro=true gets the 50% limb (Rule 279, Income-tax Rules, 2026)', () => {
    // basic ₹9.6L, hra ₹4.8L, rent ₹1L/month = ₹12L/yr annual rent
    // (a) actual HRA = 480,000
    // (b) rent − 10% basic = 1,200,000 − 96,000 = 1,104,000
    // (c) 50% of basic (metro) = 480,000
    // least of the three = 480,000
    const b = decodeOffer({
      ...baseOffer,
      state: 'KA',
      old: { rentPaidMonthly: 100_000, metro: true, deduction80CExtra: 0, deduction80D: 0 },
    })
    expect(stateHasHraMetroCity('KA')).toBe(true)
    expect(b.hraExemptionAnnual).toBe(480_000)
  })
})

describe('scanRedFlags', () => {
  it('flags a hostile offer: 90-day notice, bond, 30% variable, low basic', () => {
    const b = decodeOffer({
      ...baseOffer,
      ctcAnnual: 2_800_000,
      variableAnnual: 840_000, // 30%
      basicPercent: 30,
      bond: { amount: 200_000, months: 24 },
    })
    const ids = scanRedFlags(b).map((f) => f.id)
    expect(ids).toContain('notice-period')
    expect(ids).toContain('bond')
    expect(ids).toContain('variable-heavy')
    expect(ids).toContain('low-basic')
    // reds sort before ambers/infos
    expect(scanRedFlags(b)[0].severity).toBe('red')
  })

  it('a clean offer produces only the employer-PF info note', () => {
    const flags = scanRedFlags(
      decodeOffer({ ...baseOffer, noticePeriodDays: 30 }),
    )
    expect(flags.map((f) => f.id)).toEqual(['employer-pf-in-ctc'])
    expect(flags[0].severity).toBe('info')
  })
})

describe('hraExemptionAnnual — Rule 2A limbs (₹24L KA: basic ₹9.6L, HRA ₹4.8L)', () => {
  const basic = 960_000
  const hra = 480_000

  it('actual HRA received caps when rent is high', () => {
    expect(hraExemptionAnnual(basic, hra, 100_000, true)).toBe(480_000)
  })

  it('rent − 10% of basic binds on modest rent', () => {
    // ₹30k × 12 − 10% of ₹9.6L = ₹3.6L − ₹96k = ₹2.64L
    expect(hraExemptionAnnual(basic, hra, 30_000, true)).toBe(264_000)
  })

  it('40% of basic binds non-metro when rent is high enough to skip the rent limb', () => {
    expect(hraExemptionAnnual(basic, hra, 50_000, false)).toBe(384_000)
  })

  it('50% of basic binds metro (and equals actual HRA) at the same rent', () => {
    expect(hraExemptionAnnual(basic, hra, 50_000, true)).toBe(480_000)
  })
})

describe('decodeOffer — HRA exemption on old-regime taxable only', () => {
  it('applies the Rule 2A result and does not change new-regime taxable', () => {
    const none = decodeOffer(baseOffer)
    const withRent = decodeOffer({
      ...baseOffer,
      old: { rentPaidMonthly: 50_000, metro: true, deduction80CExtra: 0, deduction80D: 0 },
    })
    expect(none.hraExemptionAnnual).toBe(0)
    expect(withRent.hraExemptionAnnual).toBe(480_000)
    expect(withRent.newRegime.taxableIncome).toBe(none.newRegime.taxableIncome)
    expect(withRent.oldRegime.taxableIncome).toBe(none.oldRegime.taxableIncome - 480_000)
  })
})

describe('HRA metro cities', () => {
  it('eight-city state codes qualify (Rule 279, Income-tax Rules, 2026)', () => {
    expect(stateHasHraMetroCity('DL')).toBe(true)
    expect(stateHasHraMetroCity('MH')).toBe(true)
    expect(stateHasHraMetroCity('WB')).toBe(true)
    expect(stateHasHraMetroCity('TN')).toBe(true)
    expect(stateHasHraMetroCity('KA')).toBe(true)
    expect(stateHasHraMetroCity('TG')).toBe(true)
    expect(stateHasHraMetroCity('GJ')).toBe(true)
    expect(stateHasHraMetroCity('other')).toBe(false)
  })
})

describe('format', () => {
  it('Indian digit grouping', () => {
    expect(formatINR(1_234_567)).toBe('₹12,34,567')
  })
  it('compact units', () => {
    expect(formatCompact(2_400_000)).toBe('₹24L')
    expect(formatCompact(12_500_000)).toBe('₹1.3Cr')
  })
  it('LPA', () => {
    expect(formatLPA(2_450_000)).toBe('24.5 LPA')
  })
})
