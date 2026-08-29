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

describe('buyoutQuote — leave set against unserved notice', () => {
  const base = {
    basis: 'basic' as const,
    unservedDays: 30,
    monthlyBasic: 80_000,
    monthlyGross: 150_000,
    mode: 'pay' as const,
  }

  it('nets leave days off the bill and keeps the gross quote alongside', () => {
    const r = buyoutQuote({ ...base, leaveDaysApplied: 12 })
    expect(r.unservedDaysNet).toBe(18)
    expect(r.leaveDaysApplied).toBe(12)
    expect(r.amount).toBeCloseTo((80_000 / 30) * 18, 6)
    expect(r.amountBeforeLeave).toBeCloseTo((80_000 / 30) * 30, 6)
  })

  it('cannot apply more leave than there are unserved days', () => {
    const r = buyoutQuote({ ...base, leaveDaysApplied: 100 })
    expect(r.leaveDaysApplied).toBe(30)
    expect(r.unservedDaysNet).toBe(0)
    expect(r.amount).toBe(0)
  })

  it('is unchanged when no leave is applied', () => {
    const without = buyoutQuote(base)
    expect(without.leaveDaysApplied).toBe(0)
    expect(without.amount).toBe(without.amountBeforeLeave)
  })
})
