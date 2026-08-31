import { describe, expect, it } from 'vitest'
import { esopReality } from './esop'
import { gratuity } from './gratuity'
import { decodeOffer } from './salary'
import { scanRedFlags } from './redFlags'
import { formatINR, formatCompact } from './format'
import { DEFAULT_OFFER } from '../data/defaults'

/**
 * Every case here was found by an independent review agent auditing the repo
 * slice by slice, and reproduced before the fix. They live together because
 * they share a cause: each was right for the common input and wrong for a
 * perfectly ordinary one beside it.
 */

const grant = {
  shares: 1000,
  strike: 10,
  fmv: 110,
  liquid: true,
  taxableIncomeWithoutPerq: 1_800_000,
  regime: 'new' as const,
  vestCadence: 'annual' as const,
}

describe('annual ESOP vesting counts tranches from the grant, not the cliff', () => {
  it('a 24-month cliff on a 48-month grant still finishes at 100%', () => {
    const r = esopReality({ ...grant, cliffMonths: 24, vestMonths: 48 })
    expect(r.vestTable.at(-1)).toMatchObject({ month: 48, vestedShares: 1000 })
  })

  it('releases everything accrued when a long cliff passes', () => {
    const r = esopReality({ ...grant, cliffMonths: 24, vestMonths: 48 })
    const atCliff = r.vestTable.find((row) => row.month === 24)
    expect(atCliff?.vestedShares).toBe(500)
  })

  it('the common one-year cliff is unchanged', () => {
    const r = esopReality({ ...grant, cliffMonths: 12, vestMonths: 48 })
    expect(r.vestTable.map((row) => row.vestedShares)).toEqual([0, 250, 500, 750, 1000])
  })

  it('a 6-month cliff releases nothing before the first anniversary', () => {
    const r = esopReality({ ...grant, cliffMonths: 6, vestMonths: 48 })
    expect(r.vestTable.find((row) => row.month === 6)?.vestedShares).toBe(0)
    expect(r.vestTable.find((row) => row.month === 12)?.vestedShares).toBe(250)
    expect(r.vestTable.at(-1)?.vestedShares).toBe(1000)
  })
})

describe('gratuity offers no flip date when the Act does not cover the employer', () => {
  it('returns null rather than a date already in the past', () => {
    const g = gratuity({
      lastDrawnBasicDA: 50_000,
      joinDate: '2018-01-01',
      exitDate: '2024-01-01',
      coveredByAct: false,
    })
    expect(g.eligible).toBe(false)
    expect(g.flipDate).toBeNull()
  })

  it('still offers a flip date to someone merely short of five years', () => {
    const g = gratuity({
      lastDrawnBasicDA: 50_000,
      joinDate: '2022-01-01',
      exitDate: '2024-01-01',
      coveredByAct: true,
    })
    expect(g.eligible).toBe(false)
    expect(g.flipDate).not.toBeNull()
  })
})

describe('a joining bonus of zero raises no clawback flag', () => {
  it('does not warn about clawing back nothing', () => {
    const b = decodeOffer({ ...DEFAULT_OFFER, joiningBonus: { amount: 0, clawbackMonths: 12 } })
    expect(scanRedFlags(b).map((f) => f.id)).not.toContain('joining-bonus-clawback')
  })

  it('still warns when there is a bonus to claw back', () => {
    const b = decodeOffer({ ...DEFAULT_OFFER, joiningBonus: { amount: 200_000, clawbackMonths: 12 } })
    expect(scanRedFlags(b).map((f) => f.id)).toContain('joining-bonus-clawback')
  })
})

describe('a negative amount puts the sign outside the rupee symbol', () => {
  it('formatINR', () => {
    expect(formatINR(-5000)).toBe('-₹5,000')
    expect(formatINR(5000)).toBe('₹5,000')
    expect(formatINR(0)).toBe('₹0')
  })

  it('formatCompact falls through to the same rule', () => {
    expect(formatCompact(-500)).toBe('-₹500')
  })
})
