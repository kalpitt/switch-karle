import { describe, expect, it } from 'vitest'
import { auditFnF } from './fnf'

describe('auditFnF', () => {
  it('₹50k salary, ₹25k notice recovery, no gratuity → net ₹25k + notice flag', () => {
    const r = auditFnF({
      joinDate: '2020-01-01',
      lastWorkingDay: '2024-06-30',
      monthlyBasic: 40_000,
      monthlyGross: 50_000,
      unpaidLeaveDays: 0,
      payslipLines: [{ id: 'salary', label: 'Salary', amount: 50_000, kind: 'earning' }],
      recoveries: [{ id: 'notice-recovery', label: 'Notice recovery', amount: 25_000, kind: 'deduction' }],
      gratuityEligible: false,
    })
    expect(r.lines).toEqual([
      { id: 'salary', label: 'Salary', claimed: 50_000, recomputed: 50_000, delta: 0 },
    ])
    expect(r.netPayable).toBe(25_000)
    expect(r.flags.some((f) => f.id === 'notice-recovery')).toBe(true)
    expect(r.flags.some((f) => f.id === 'negative-net')).toBe(false)
  })

  it('adds gratuity earning when eligible and recomputes unpaid leave', () => {
    const r = auditFnF({
      joinDate: '2019-08-01',
      lastWorkingDay: '2024-08-01',
      monthlyBasic: 100_000,
      monthlyGross: 120_000,
      unpaidLeaveDays: 2,
      payslipLines: [
        { id: 'salary', label: 'Salary', amount: 100_000, kind: 'earning' },
        { id: 'unpaid-leave', label: 'Unpaid leave', amount: 8_500, kind: 'deduction' },
      ],
      recoveries: [],
      gratuityEligible: true,
    })
    const unpaidRecomputed = 2 * (120_000 / 30)
    const unpaidLine = r.lines.find((l) => l.id === 'unpaid-leave')
    expect(unpaidLine?.recomputed).toBeCloseTo(unpaidRecomputed)
    // Gratuity is eligible but NOT on the claimed sheet: it must surface as a
    // flag and never be appended into the lines or the net (master plan 3.2).
    expect(r.lines.some((l) => l.id === 'gratuity')).toBe(false)
    const missing = r.flags.find((f) => f.id === 'gratuity-missing')!
    expect(missing.severity).toBe('amber')
    expect(missing.params?.amount).toBe('2,88,462')
    // Net excludes the unclaimed gratuity: salary − unpaid leave only.
    expect(r.netPayable).toBe(100_000 - unpaidRecomputed)
  })
})
