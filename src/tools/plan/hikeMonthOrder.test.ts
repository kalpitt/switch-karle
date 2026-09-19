import { describe, expect, it } from 'vitest'
import { hikeMonthOrder } from './hikeMonthOrder'

describe('hikeMonthOrder', () => {
  it('runs from next month for twelve months, today 2026-09-19', () => {
    expect(hikeMonthOrder('2026-09-19')).toEqual([10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('wraps into January of next year when today is in December', () => {
    expect(hikeMonthOrder('2026-12-15')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('always holds exactly the twelve month numbers once each', () => {
    const order = hikeMonthOrder('2026-03-01')
    expect([...order].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })
})
