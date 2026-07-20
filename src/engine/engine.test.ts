import { describe, expect, it } from 'vitest'
import { computeTax } from './tax'
import { decodeOffer } from './salary'
import { scanRedFlags } from './redFlags'
import { formatCompact, formatINR, formatLPA } from './format'
import type { OfferInput } from './types'

/**
 * Golden cases hand-computed from the FY 2026-27 rules (slabs unchanged by
 * Budget 2026; rebate u/s 157 max ₹60k to ₹12L taxable with marginal relief;
 * cess 4%; surcharge 10% above ₹50L taxable).
 */
describe('computeTax — new regime FY 2026-27', () => {
  it('zero tax at ₹12,00,000 taxable (rebate u/s 157)', () => {
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
  it('caps PF at ₹21,600/year when pfOnFullBasic is false', () => {
    const b = decodeOffer({ ...baseOffer, pfOnFullBasic: false })
    expect(b.employeePfAnnual).toBe(21_600)
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
