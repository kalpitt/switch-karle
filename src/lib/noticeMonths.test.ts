import { describe, expect, it } from 'vitest'
import { noticeLooksLikeMonths, noticeMonthsToDays } from './noticeMonths'

/**
 * Indian appointment letters usually state notice in months ("3 months").
 * Every notice-period-days field in the app is typed in days, so a user who
 * carries the letter's number over verbatim gets a last working day that is
 * 2 days after resigning instead of ~90. `noticeLooksLikeMonths` flags the
 * numbers that are almost certainly a months figure typed into a days field.
 */
describe('noticeLooksLikeMonths', () => {
  it('is true for whole numbers 1 through 12', () => {
    for (let n = 1; n <= 12; n++) {
      expect(noticeLooksLikeMonths(n)).toBe(true)
    }
  })

  it('is false for 0 and for anything above 12', () => {
    expect(noticeLooksLikeMonths(0)).toBe(false)
    expect(noticeLooksLikeMonths(13)).toBe(false)
    expect(noticeLooksLikeMonths(30)).toBe(false)
    expect(noticeLooksLikeMonths(90)).toBe(false)
  })

  it('is false for a non-integer, even inside 1..12 (a real days count can be fractional-looking here, a months count never is)', () => {
    expect(noticeLooksLikeMonths(3.5)).toBe(false)
  })

  it('is false for negative numbers and for NaN', () => {
    expect(noticeLooksLikeMonths(-3)).toBe(false)
    expect(noticeLooksLikeMonths(NaN)).toBe(false)
  })
})

describe('noticeMonthsToDays', () => {
  it('multiplies by the 30-days-per-month convention', () => {
    expect(noticeMonthsToDays(1)).toBe(30)
    expect(noticeMonthsToDays(3)).toBe(90)
    expect(noticeMonthsToDays(12)).toBe(360)
  })
})
