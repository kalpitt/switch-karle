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
    expect(r.cashNeeded).toBe(30_800)
    expect(r.underwater).toBe(false)
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

  it('underwater grant: perquisite 0, cashNeeded is still the strike cost', () => {
    const r = esopReality({
      shares: 1_000,
      strike: 110,
      fmv: 10,
      cliffMonths: 12,
      vestMonths: 48,
      liquid: true,
      taxableIncomeWithoutPerq: 1_800_000,
      regime: 'new',
    })
    expect(r.perquisiteTotal).toBe(0)
    expect(r.taxOnPerq).toBe(0)
    expect(r.underwater).toBe(true)
    expect(r.cashNeeded).toBe(110_000)
  })

  it('dedupes vest-table months when cliff is 0', () => {
    const r = esopReality({
      shares: 1_000,
      strike: 10,
      fmv: 110,
      cliffMonths: 0,
      vestMonths: 48,
      liquid: true,
      taxableIncomeWithoutPerq: 1_800_000,
      regime: 'new',
    })
    expect(r.vestTable.map((row) => row.month)).toEqual([0, 48])
  })
})

describe('esopReality — annual vest cadence', () => {
  const base = {
    shares: 1_000,
    strike: 10,
    fmv: 110,
    cliffMonths: 12,
    vestMonths: 48,
    liquid: false,
    taxableIncomeWithoutPerq: 1_800_000,
    regime: 'new' as const,
  }

  it('steps in four equal tranches: 25% at the cliff, 100% at the end', () => {
    const r = esopReality({ ...base, vestCadence: 'annual' })
    const at = (month: number) => r.vestTable.find((row) => row.month === month)?.vestedShares
    expect(r.vestTable.map((row) => row.month)).toEqual([0, 12, 24, 36, 48])
    expect(at(0)).toBe(0)
    expect(at(12)).toBe(250)
    expect(at(24)).toBe(500)
    expect(at(36)).toBe(750)
    expect(at(48)).toBe(1_000)
  })

  it('holds flat between anniversaries — eleven extra months vest nothing', () => {
    const r = esopReality({ ...base, vestMonths: 24, vestCadence: 'annual' })
    const cliff = r.vestTable.find((row) => row.month === 12)?.vestedShares
    expect(cliff).toBe(500)
    // Monthly would have credited 23/24 of the grant by month 23; annual has not.
    const monthly = esopReality({ ...base, vestMonths: 24 })
    expect(monthly.vestTable.find((row) => row.month === 24)?.vestedShares).toBe(1_000)
  })

  it('defaults to the monthly reading when no cadence is given', () => {
    const implicit = esopReality(base)
    const explicit = esopReality({ ...base, vestCadence: 'monthly' })
    expect(implicit.vestTable).toEqual(explicit.vestTable)
  })

  it('changes no money — cadence is a schedule, not a tax input', () => {
    const monthly = esopReality(base)
    const annual = esopReality({ ...base, vestCadence: 'annual' })
    expect(annual.perquisiteTotal).toBe(monthly.perquisiteTotal)
    expect(annual.taxOnPerq).toBe(monthly.taxOnPerq)
    expect(annual.cashNeeded).toBe(monthly.cashNeeded)
  })
})
