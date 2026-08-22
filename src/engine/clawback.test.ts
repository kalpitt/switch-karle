import { describe, expect, it } from 'vitest'
import { bonusClawback } from './clawback'

describe('bonusClawback', () => {
  it('₹2L bonus on ₹18L taxable (new): tax ₹41,600, net ₹1,58,400; leave at month 6 repays gross', () => {
    const r = bonusClawback({
      amount: 200_000,
      clawbackMonths: 12,
      plannedTenureMonths: 6,
      taxableIncome: 1_800_000,
      regime: 'new',
      noticePeriodDays: 90,
    })
    expect(r.taxOnBonus).toBe(41_600)
    expect(r.netReceived).toBe(158_400)
    expect(r.marginal).toBeCloseTo(0.208, 3)
    expect(r.repaymentIfLeaveAtPlanned).toBe(200_000)
    expect(r.effectiveValueAtPlanned).toBe(-41_600)
    expect(r.curve[0]!.repayGross).toBe(200_000)
    expect(r.curve[12]!.repayGross).toBe(0)
    expect(r.curve[12]!.netIfExit).toBe(158_400)
    expect(r.noticeOverlapsClawback).toBe(false)
  })

  it('flags notice overlapping a short remaining clawback window', () => {
    const r = bonusClawback({
      amount: 200_000,
      clawbackMonths: 12,
      plannedTenureMonths: 11,
      taxableIncome: 1_800_000,
      regime: 'new',
      noticePeriodDays: 90,
    })
    expect(r.noticeOverlapsClawback).toBe(true)
    expect(r.repaymentIfLeaveAtPlanned).toBe(200_000)
  })

  it('keeps the bonus once planned tenure reaches the clawback month', () => {
    const r = bonusClawback({
      amount: 200_000,
      clawbackMonths: 12,
      plannedTenureMonths: 12,
      taxableIncome: 1_800_000,
      regime: 'new',
      noticePeriodDays: 90,
    })
    expect(r.repaymentIfLeaveAtPlanned).toBe(0)
    expect(r.effectiveValueAtPlanned).toBe(158_400)
    expect(r.noticeOverlapsClawback).toBe(false)
  })
})
