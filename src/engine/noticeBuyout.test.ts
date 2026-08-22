import { describe, expect, it } from 'vitest'
import { buyoutQuote } from './noticeBuyout'

describe('buyoutQuote', () => {
  it('basic ₹1L/mo, 30 unserved days → ₹1,00,000', () => {
    const r = buyoutQuote({
      basis: 'basic',
      unservedDays: 30,
      monthlyBasic: 100_000,
      monthlyGross: 150_000,
      mode: 'pay',
    })
    expect(r.dailyRate).toBeCloseTo(100_000 / 30)
    expect(r.amount).toBe(100_000)
    expect(r.basis).toBe('basic')
    expect(r.calendarDaysInMonth).toBe(30)
  })

  it('basic ₹1L/mo, 15 unserved days → ₹50,000', () => {
    const r = buyoutQuote({
      basis: 'basic',
      unservedDays: 15,
      monthlyBasic: 100_000,
      monthlyGross: 150_000,
      mode: 'recover',
    })
    expect(r.amount).toBe(50_000)
  })

  it('gross basis uses monthlyGross', () => {
    const r = buyoutQuote({
      basis: 'gross',
      unservedDays: 30,
      monthlyBasic: 100_000,
      monthlyGross: 120_000,
      mode: 'pay',
    })
    expect(r.amount).toBe(120_000)
    expect(r.basis).toBe('gross')
  })
})
