import { describe, expect, it } from 'vitest'
import { GRATUITY_CAP, gratuity } from './gratuity'

/**
 * Goldens from the CA-closed G1 spec (master plan §6 PR G1), basic ₹50,000.
 * (15/26) × ₹50,000 = ₹28,846.1538…/year → ×5 = ₹1,44,230.77 → ₹1,44,231;
 * ×6 = ₹1,73,076.92 → ₹1,73,077.
 *
 * Join date 2019-08-01 throughout: the 4th anniversary is 2023-08-01,
 * day 240 after it is 2024-03-28, day 190 is 2024-02-07.
 */
const BASE = { lastDrawnBasicDA: 50_000, joinDate: '2019-08-01', coveredByAct: true }

describe('gratuity — eligibility vs payable years (PGA s.2A / s.4(2))', () => {
  it('4y + 239d on a 6-day week → not eligible, ₹0', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-03-27' })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(false)
    expect(r.payableYears).toBe(0)
    expect(r.amount).toBe(0)
    expect(r.flipDate).toBe('2024-03-28')
  })

  it('4y + 240d on a 6-day week → eligible, 5 payable years, ₹1,44,231', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-03-28' })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(true)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
    expect(r.flipDate).toBeNull()
  })

  it('4y + 190d on a 5-day week → eligible, 5 payable years, ₹1,44,231', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-02-07', workWeekDays: 5 })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(true)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
  })

  it('4y + 189d on a 5-day week → not eligible', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-02-06', workWeekDays: 5 })
    expect(r.eligible).toBe(false)
    expect(r.amount).toBe(0)
  })

  it('exactly 5y → eligible, 5 payable years, ₹1,44,231', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-08-01' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
  })

  it('5y + 6 months exactly → NO bump (s.4(2) says in excess of six months)', () => {
    const r = gratuity({ ...BASE, exitDate: '2025-02-01' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
  })

  it('5y + 6 months + 1 day → bumps to 6 payable years, ₹1,73,077', () => {
    const r = gratuity({ ...BASE, exitDate: '2025-02-02' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(6)
    expect(r.amount).toBe(173_077)
  })

  it('5y + 200d → 6 payable years, ₹1,73,077', () => {
    const r = gratuity({ ...BASE, exitDate: '2025-02-17' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(6)
    expect(r.amount).toBe(173_077)
  })

  it('amount never exceeds the ₹20L statutory cap (s.4(3))', () => {
    const r = gratuity({
      ...BASE,
      lastDrawnBasicDA: 400_000,
      joinDate: '2010-01-01',
      exitDate: '2025-01-01',
    })
    expect(r.amount).toBe(GRATUITY_CAP)
    expect(r.notes.some((n) => n.id === 'cap-applied')).toBe(true)
    expect(r.notes.some((n) => n.id === 'ceiling-omitted')).toBe(false)
  })

  it('not covered by Act → amount 0 with policy note', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-08-01', coveredByAct: false })
    expect(r.amount).toBe(0)
    expect(r.eligible).toBe(false)
    expect(r.notes.some((n) => n.id === 'act-may-not-apply')).toBe(true)
  })
})
