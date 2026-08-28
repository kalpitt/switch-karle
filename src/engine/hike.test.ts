import { describe, expect, it } from 'vitest'
import { realHike } from './hike'
import type { OfferInput } from './types'

const base: OfferInput = {
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

describe('realHike', () => {
  it('24L → 31.2L is 30% on paper and ~23% in-hand (KA, PF on full basic, no variable)', () => {
    const r = realHike({
      current: base,
      next: { ...base, ctcAnnual: 3_120_000 },
      variablePayout: 1,
    })
    expect(r.ctcHikePct).toBe(30)
    expect(r.currentRunRateMonthly).toBe(158_721)
    expect(r.nextRunRateMonthly).toBe(195_964)
    expect(r.inHandHikePct).toBeCloseTo(23.464, 3)
    expect(r.regimeFlip).toBe(false)
    expect(r.haircutApplied).toBe(false)
    expect(r.joiningBonusExcluded).toBe(false)
  })

  it('joining bonus does not enter the run-rate', () => {
    const withBonus: OfferInput = {
      ...base,
      joiningBonus: { amount: 200_000, clawbackMonths: 12 },
    }
    const r = realHike({
      current: withBonus,
      next: { ...base, ctcAnnual: 3_120_000, joiningBonus: { amount: 300_000, clawbackMonths: 12 } },
      variablePayout: 1,
    })
    expect(r.joiningBonusExcluded).toBe(true)
    expect(r.ctcHikePct).toBe(30)
    expect(r.currentRunRateMonthly).toBe(158_721)
    expect(r.nextRunRateMonthly).toBe(195_964)
  })

  it('variable haircut at 70% lowers the in-hand hike versus treating variable as certain', () => {
    const current: OfferInput = { ...base, variableAnnual: 240_000 }
    const next: OfferInput = { ...base, ctcAnnual: 3_120_000, variableAnnual: 240_000 }
    const full = realHike({ current, next, variablePayout: 1 })
    const haircut = realHike({ current, next, variablePayout: 0.7 })
    expect(haircut.haircutApplied).toBe(true)
    expect(full.haircutApplied).toBe(false)
    expect(full.ctcHikePct).toBe(haircut.ctcHikePct)
    expect(haircut.currentRunRateMonthly).toBeLessThan(full.currentRunRateMonthly)
    expect(haircut.nextRunRateMonthly).toBeLessThan(full.nextRunRateMonthly)
  })
})
