import { describe, expect, it } from 'vitest'
import type { OfferInput } from './types'
import { relocationDelta } from './relocation'
import { stateHasHraMetroCity } from './salary'

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
  old: {
    rentPaidMonthly: 50_000,
    metro: true,
    deduction80CExtra: 0,
    deduction80D: 0,
  },
}

describe('relocationDelta — hand-derived from decodeOffer', () => {
  it('KA metro → non-metro same rent: HRA exemption drops, in-hand unchanged under new regime', () => {
    const d = relocationDelta(baseOffer, {
      state: 'KA',
      metro: false,
      rentPaidMonthly: 50_000,
    })

    // basic ₹9.6L, hra ₹4.8L; rent ₹6L/a → rent limb ₹5.04L
    // metro 50% basic = ₹4.8L; non-metro 40% = ₹3.84L
    expect(d.hraExemptionFrom).toBe(480_000)
    expect(d.hraExemptionTo).toBe(384_000)
    expect(d.ptDeltaAnnual).toBe(0)
    expect(d.from.recommendedRegime).toBe('new')
    expect(d.inHandDeltaMonthly).toBe(0)
    expect(d.nationalSlabDeltaIsNil).toBe(true)
  })

  it('KA → TG: PT delta −₹100/a → +₹8/month in-hand (new regime)', () => {
    const d = relocationDelta(baseOffer, {
      state: 'TG',
      metro: true,
      rentPaidMonthly: 50_000,
    })

    // PROFESSIONAL_TAX_ANNUAL: KA ₹2,500 vs TG ₹2,400.
    // Hand-derived: gross ₹22,84,800 (24L − employer PF ₹1,15,200); new-regime
    // taxable ₹22,09,800 → tax ₹2,52,450 + 4% cess = ₹2,62,548 in both states.
    // KA in-hand (22,84,800 − 2,62,548 − 1,15,200 − 2,500) / 12 = 1,58,712.67 → 1,58,713
    // TG in-hand (22,84,800 − 2,62,548 − 1,15,200 − 2,400) / 12 = 1,58,721
    expect(d.ptDeltaAnnual).toBe(-100)
    expect(d.inHandDeltaMonthly).toBe(8)
    expect(d.nationalSlabDeltaIsNil).toBe(true)
  })

  it('KA → TN (Chennai top slab ₹1,250 × 2): PT delta is nil', () => {
    const d = relocationDelta(baseOffer, {
      state: 'TN',
      metro: true,
      rentPaidMonthly: 50_000,
    })
    expect(d.ptDeltaAnnual).toBe(0)
    expect(d.inHandDeltaMonthly).toBe(0)
  })

  it('KA (Bengaluru) is now a metro state under Rule 279, Income-tax Rules, 2026', () => {
    expect(stateHasHraMetroCity('KA')).toBe(true)
    const d = relocationDelta(baseOffer, {
      state: 'DL',
      metro: true,
      rentPaidMonthly: 50_000,
    })
    expect(d.hraExemptionTo).toBe(480_000)
    expect(stateHasHraMetroCity('DL')).toBe(true)
  })
})
