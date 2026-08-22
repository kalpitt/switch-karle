/**
 * PROVISIONAL — pending CA R3 review. ESOP perquisite rule is CANDIDATE only.
 */
import { describe, expect, it } from 'vitest'
import { esopReality } from './esop'

describe('esopReality — provisional-pending-CA', () => {
  it('1000 shares @ strike ₹10, FMV ₹110 → perq ₹1L; taxOnPerq at ₹18L new regime', () => {
    const r = esopReality({
      shares: 1_000,
      strike: 10,
      fmv: 110,
      cliffMonths: 12,
      vestMonths: 48,
      liquid: true,
      taxableIncomeWithoutPerq: 1_800_000,
      regime: 'new',
    })

    expect(r.perquisitePerShare).toBe(100)
    expect(r.perquisiteTotal).toBe(100_000)
    expect(r.exerciseCost).toBe(10_000)
    // computeTax(₹19L) − computeTax(₹18L) new regime
    expect(r.taxOnPerq).toBe(20_800)
    expect(r.postExitWindowNote).toBe(false)
  })

  it('vest table at month 0, cliff (12), and full vest (48)', () => {
    const r = esopReality({
      shares: 1_000,
      strike: 10,
      fmv: 110,
      cliffMonths: 12,
      vestMonths: 48,
      liquid: false,
      taxableIncomeWithoutPerq: 1_800_000,
      regime: 'new',
    })

    expect(r.vestTable).toEqual([
      { month: 0, vestedShares: 0, stillCliffed: true },
      { month: 12, vestedShares: 250, stillCliffed: false },
      { month: 48, vestedShares: 1_000, stillCliffed: false },
    ])
    expect(r.postExitWindowNote).toBe(true)
  })
})
