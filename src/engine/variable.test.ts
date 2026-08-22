import { describe, expect, it } from 'vitest'
import { variableReality } from './variable'
import type { OfferInput } from './types'

const offer: OfferInput = {
  ctcAnnual: 2_400_000,
  variableAnnual: 240_000,
  basicPercent: 40,
  hraPercentOfBasic: 50,
  employerPfInCtc: true,
  gratuityInCtc: false,
  pfOnFullBasic: true,
  noticePeriodDays: 90,
  state: 'KA',
}

describe('variableReality', () => {
  it('24L CTC / 2.4L variable: monthly in-hand at 0 / 50 / 100% if spread', () => {
    const r = variableReality({ offer, monthsInFy: 12 })
    expect(r.fixedCtc).toBe(2_160_000)
    expect(r.firstYearProrate).toBe(false)
    expect(r.inHandMonthlyFixed).toBe(145_510)
    expect(r.rows[0]!.inHandMonthlyIfSpread).toBe(145_510)
    expect(r.rows[1]!.inHandMonthlyIfSpread).toBe(152_991)
    expect(r.rows[2]!.inHandMonthlyIfSpread).toBe(160_391)
    expect(r.rows[1]!.netVariableAnnual).toBe(89_772)
    expect(r.rows[2]!.netVariableAnnual).toBe(178_572)
    expect(r.withheldVsSpread.lumpNet).toBe(178_572)
    expect(r.withheldVsSpread.spreadMonthly).toBe(160_391)
    expect(r.taxedOnFullYearBase).toBe(true)
  })

  it('flags first-year pro-rating when months in FY are under 12', () => {
    const r = variableReality({ offer, monthsInFy: 6 })
    expect(r.firstYearProrate).toBe(true)
    expect(r.proratedVariable).toBe(120_000)
    expect(r.rows[2]!.netVariableAnnual).toBe(89_772)
    expect(r.taxedOnFullYearBase).toBe(true)
  })
})
