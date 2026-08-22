import { describe, expect, it } from 'vitest'
import { gratuity } from './gratuity'

describe('gratuity', () => {
  it('5 completed years, covered → (15/26)×₹1L×5 = ₹2,88,462', () => {
    const r = gratuity({
      lastDrawnBasicDA: 100_000,
      joinDate: '2019-08-01',
      exitDate: '2024-08-01',
      coveredByAct: true,
    })
    expect(r.completedYears).toBe(5)
    expect(r.daysIntoCurrentYear).toBe(0)
    expect(r.eligible).toBe(true)
    const exact = (15 / 26) * 100_000 * 5
    expect(exact).toBeCloseTo(288_461.53846153844)
    expect(r.amount).toBe(288_462)
    expect(r.flipDate).toBeNull()
    expect(r.notes.some((n) => n.id === 'ceiling-omitted')).toBe(true)
  })

  it('not covered by Act → amount 0 with policy note', () => {
    const r = gratuity({
      lastDrawnBasicDA: 100_000,
      joinDate: '2019-08-01',
      exitDate: '2024-08-01',
      coveredByAct: false,
    })
    expect(r.amount).toBe(0)
    expect(r.eligible).toBe(false)
    expect(r.notes.some((n) => n.id === 'act-may-not-apply')).toBe(true)
  })

  it('4 years + 240 days qualifies before 5-year anniversary', () => {
    const r = gratuity({
      lastDrawnBasicDA: 50_000,
      joinDate: '2019-08-01',
      exitDate: '2024-03-28',
      coveredByAct: true,
    })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(true)
    expect(r.amount).toBe(Math.round((15 / 26) * 50_000 * 4))
  })
})
