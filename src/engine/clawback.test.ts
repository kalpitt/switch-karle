import { describe, expect, it } from 'vitest'
import { bonusClawback } from './clawback'
import { computeTax } from './tax'

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
    expect(r.effectiveRate).toBeCloseTo(0.208, 3)
    expect(r.repaymentIfLeaveAtPlanned).toBe(200_000)
    expect(r.effectiveValueAtPlanned).toBe(-41_600)
    expect(r.curve[0]!.repayGross).toBe(200_000)
    expect(r.curve[12]!.repayGross).toBe(0)
    expect(r.curve[12]!.netIfExit).toBe(158_400)
    expect(r.noticeWouldCoverClawback).toBe(false)
  })

  it('flags when serving notice may carry last-working-day past the clawback window', () => {
    const r = bonusClawback({
      amount: 200_000,
      clawbackMonths: 12,
      plannedTenureMonths: 11,
      taxableIncome: 1_800_000,
      regime: 'new',
      noticePeriodDays: 90,
    })
    expect(r.noticeWouldCoverClawback).toBe(true)
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
    expect(r.noticeWouldCoverClawback).toBe(false)
  })

  it('rebate zone: effective rate is taxOnBonus/amount, not the 0% next-rupee rate', () => {
    const taxableIncome = 1_100_000
    const amount = 300_000
    const r = bonusClawback({
      amount,
      clawbackMonths: 12,
      plannedTenureMonths: 6,
      taxableIncome,
      regime: 'new',
      noticePeriodDays: 90,
    })
    const expectedTax =
      computeTax(taxableIncome + amount, 'new').totalTax - computeTax(taxableIncome, 'new').totalTax
    expect(computeTax(taxableIncome, 'new').totalTax).toBe(0)
    expect(r.taxOnBonus).toBe(expectedTax)
    expect(r.taxOnBonus).toBeGreaterThan(0)
    expect(r.effectiveRate).toBeCloseTo(expectedTax / amount, 10)
    expect(r.effectiveRate).not.toBe(0)
  })
})
