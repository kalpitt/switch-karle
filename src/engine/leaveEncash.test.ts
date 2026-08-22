import { describe, expect, it } from 'vitest'
import { leaveEncash } from './leaveEncash'

describe('leaveEncash', () => {
  it('20 days, ₹1L basic, /26, resignation → gross = 20×(100000/26), fully taxable', () => {
    const r = leaveEncash({
      balanceDays: 20,
      monthlyBasic: 100_000,
      dailyBasis: '26',
      reason: 'resignation',
    })
    expect(r.gross).toBeCloseTo(20 * (100_000 / 26))
    expect(r.exempt).toBe(0)
    expect(r.taxable).toBe(r.gross)
    expect(r.resignationFullyTaxable).toBe(true)
  })

  it('retirement: exempt omitted, still reports gross as taxable', () => {
    const r = leaveEncash({
      balanceDays: 10,
      monthlyBasic: 80_000,
      dailyBasis: '30',
      reason: 'retirement',
    })
    expect(r.gross).toBeCloseTo(10 * (80_000 / 30))
    expect(r.exempt).toBe(0)
    expect(r.taxable).toBe(r.gross)
    expect(r.resignationFullyTaxable).toBe(false)
  })
})
