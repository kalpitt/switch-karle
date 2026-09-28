import { describe, expect, it } from 'vitest'
import { leaveEncash, LEAVE_ENCASHMENT_EXEMPTION_CAP } from './leaveEncash'

describe('leaveEncash', () => {
  it('30 days, ₹1L basic, /30, resignation → gross = exempt (under the ₹25L cap), taxable = 0', () => {
    const r = leaveEncash({
      balanceDays: 30,
      monthlyBasic: 100_000,
      dailyBasis: '30',
      reason: 'resignation',
    })
    expect(r.gross).toBe(100_000)
    expect(r.exempt).toBe(100_000)
    expect(r.taxable).toBe(0)
    expect(r.isResignation).toBe(true)
  })

  it('20 days, ₹1L basic, /26, resignation → gross = 20×(100000/26), fully exempt (under cap)', () => {
    const r = leaveEncash({
      balanceDays: 20,
      monthlyBasic: 100_000,
      dailyBasis: '26',
      reason: 'resignation',
    })
    expect(r.gross).toBeCloseTo(20 * (100_000 / 26))
    expect(r.exempt).toBeCloseTo(r.gross)
    expect(r.taxable).toBeCloseTo(0)
    expect(r.isResignation).toBe(true)
  })

  it('gross above ₹25L, resignation → exempt caps at ₹25,00,000, remainder taxable', () => {
    const r = leaveEncash({
      balanceDays: 100,
      monthlyBasic: 1_000_000,
      dailyBasis: '30',
      reason: 'resignation',
    })
    expect(r.gross).toBeCloseTo((100 * 1_000_000) / 30)
    expect(r.exempt).toBe(LEAVE_ENCASHMENT_EXEMPTION_CAP)
    expect(r.taxable).toBeCloseTo(r.gross - LEAVE_ENCASHMENT_EXEMPTION_CAP)
    expect(r.isResignation).toBe(true)
  })

  it('retirement gets the same computable exemption as resignation (s.19(1) Sl.14 covers both)', () => {
    const r = leaveEncash({
      balanceDays: 10,
      monthlyBasic: 80_000,
      dailyBasis: '30',
      reason: 'retirement',
    })
    expect(r.gross).toBeCloseTo(10 * (80_000 / 30))
    expect(r.exempt).toBeCloseTo(r.gross)
    expect(r.taxable).toBeCloseTo(0)
    expect(r.isResignation).toBe(false)
  })
})
