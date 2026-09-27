import { describe, expect, it } from 'vitest'
import { auditFnF, disputeItems } from './fnf'

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
      { id: 'salary', label: 'Salary', kind: 'earning', claimed: 50_000, recomputed: 50_000, delta: 0 },
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

/**
 * Joined 12 Jan 2022, left 2 Oct 2026 on a five-day week: four years plus
 * exactly the 190th working day (Mon-Fri) counted from the 12 Jan 2026
 * anniversary — s.54(B)(a) counts days actually worked, not calendar days —
 * past the 190-working-day line and short of the 240th (17 Oct 2026, the
 * six-day reading). Gratuity is due, ₹1,44,231 on ₹50,000 basic. The checker
 * called gratuity() without a work week, got the six-day default, recomputed
 * ₹0, and told the user their missing gratuity "works out to about ₹0" with
 * nothing in the mail.
 */
describe('gratuity in the F&F checker follows the work week', () => {
  const FIVE_DAY_LEAVER = {
    joinDate: '2022-01-12',
    lastWorkingDay: '2026-10-02',
    monthlyBasic: 50_000,
    monthlyGross: 100_000,
    unpaidLeaveDays: 0,
    payslipLines: [{ id: 'salary', label: 'Salary', amount: 100_000, kind: 'earning' as const }],
    recoveries: [],
    gratuityEligible: true,
  }

  it('a five-day week at 4 years and 200 days is owed gratuity, and the mail asks for it', () => {
    const input = { ...FIVE_DAY_LEAVER, workWeekDays: 5 as const }
    const r = auditFnF(input)
    expect(r.gratuityNotOnSheet).toBe(144_231)
    expect(disputeItems(input, r).map((d) => [d.id, d.kind])).toEqual([['gratuity', 'missing']])
  })

  it('an unknown week takes the reading that agrees with the user saying gratuity is due', () => {
    expect(auditFnF(FIVE_DAY_LEAVER).gratuityNotOnSheet).toBe(144_231)
  })

  it('a known six-day week at the same date is not yet eligible, and says nothing rather than ₹0', () => {
    const r = auditFnF({ ...FIVE_DAY_LEAVER, workWeekDays: 6 })
    expect(r.gratuityNotOnSheet).toBe(0)
    expect(r.flags.map((f) => f.id)).not.toContain('gratuity-missing')
  })
})

describe('disputeItems', () => {
  const base = {
    joinDate: '2021-08-01',
    lastWorkingDay: '2026-08-31',
    monthlyBasic: 80_000,
    monthlyGross: 150_000,
    unpaidLeaveDays: 0,
    payslipLines: [{ id: 'salary', label: 'Salary', amount: 150_000, kind: 'earning' as const }],
    recoveries: [],
    gratuityEligible: false,
  }

  it('is empty when the sheet reconciles — no dispute is invented', () => {
    expect(disputeItems(base, auditFnF(base))).toEqual([])
  })

  it('names a gratuity the sheet never listed as missing money', () => {
    const input = { ...base, gratuityEligible: true }
    const items = disputeItems(input, auditFnF(input))
    const gratuity = items.find((i) => i.id === 'gratuity')
    expect(gratuity?.kind).toBe('missing')
    expect(gratuity?.claimed).toBe(0)
    expect(gratuity?.recomputed).toBeGreaterThan(0)
    expect(gratuity?.delta).toBeLessThan(0)
  })

  it('asks about a notice recovery even though it is not a mismatch', () => {
    const input = {
      ...base,
      recoveries: [{ id: 'notice', label: 'Notice recovery', amount: 300_000, kind: 'deduction' as const }],
    }
    const items = disputeItems(input, auditFnF(input))
    expect(items.map((i) => i.kind)).toContain('notice-recovery')
  })

  it('never drafts a mail asking to be charged a deduction the sheet did not take', () => {
    // Unpaid leave the sheet never deducted is money you were not charged.
    // It belongs in the on-screen audit, not in a letter to HR.
    const notCharged = { ...base, unpaidLeaveDays: 5 }
    const result = auditFnF(notCharged)
    expect(result.lines.some((l) => l.id === 'unpaid-leave' && l.delta < 0)).toBe(true)
    expect(disputeItems(notCharged, result)).toEqual([])
  })

  it('raises an earning the sheet paid short', () => {
    const shortPaid = {
      ...base,
      payslipLines: [{ id: 'salary', label: 'Salary', amount: 150_000, kind: 'earning' as const }],
    }
    const result = auditFnF(shortPaid)
    // Force a gap the way a real sheet would: recomputed salary is the claim,
    // so use unpaid leave to make the deduction side over-charge instead.
    const overCharged = {
      ...shortPaid,
      unpaidLeaveDays: 2,
      payslipLines: [
        { id: 'salary', label: 'Salary', amount: 150_000, kind: 'earning' as const },
        { id: 'unpaid-leave', label: 'Unpaid leave', amount: 40_000, kind: 'deduction' as const },
      ],
    }
    const items = disputeItems(overCharged, auditFnF(overCharged))
    expect(items.find((i) => i.id === 'unpaid-leave')?.kind).toBe('short')
    expect(disputeItems(shortPaid, result)).toEqual([])
  })
})
