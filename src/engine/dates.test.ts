import { describe, expect, it } from 'vitest'
import { addDays, addMonths, completedYearsWithDayCount, daysBetween, epfoDateOverlap, lastWorkingDay, monthsBetween } from './dates'

describe('daysBetween', () => {
  it('is 0 for the same day', () => {
    expect(daysBetween('2026-08-23', '2026-08-23')).toBe(0)
  })

  it('counts elapsed whole days, not including the start', () => {
    expect(daysBetween('2026-01-01', '2026-01-02')).toBe(1)
  })

  it('includes the leap day: 2024-02-28 → 2024-03-01 is 2', () => {
    expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2)
    expect(daysBetween('2024-02-28', '2024-02-29')).toBe(1)
  })

  it('a non-leap Feb 28 → Mar 1 is 1', () => {
    expect(daysBetween('2025-02-28', '2025-03-01')).toBe(1)
  })

  it('is signed when the end is before the start', () => {
    expect(daysBetween('2026-01-10', '2026-01-01')).toBe(-9)
  })
})

describe('addMonths — month-end clamping', () => {
  it('Jan 31 + 1 month in a leap year lands on Feb 29', () => {
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
  })

  it('Jan 31 + 1 month in a common year lands on Feb 28', () => {
    expect(addMonths('2025-01-31', 1)).toBe('2025-02-28')
  })

  it('Feb 29 + 12 months lands on Feb 28 of the following common year', () => {
    expect(addMonths('2024-02-29', 12)).toBe('2025-02-28')
  })

  it('subtracts months and keeps ISO shape', () => {
    expect(addMonths('2026-03-15', -1)).toBe('2026-02-15')
  })

  it('rejects fractional, NaN, and infinite month counts', () => {
    expect(() => addMonths('2026-08-23', 1.5)).toThrow(/finite integer/)
    expect(() => addMonths('2026-08-23', Number.NaN)).toThrow(/finite integer/)
    expect(() => addMonths('2026-08-23', Number.POSITIVE_INFINITY)).toThrow(/finite integer/)
  })
})

describe('addDays and lastWorkingDay', () => {
  it('adds across a month end', () => {
    expect(addDays('2026-08-01', 29)).toBe('2026-08-30')
    expect(addDays('2024-02-01', 29)).toBe('2024-03-01')
  })

  it('LWD is resignation + notice − 1 calendar day', () => {
    expect(lastWorkingDay('2026-08-01', 30)).toBe('2026-08-30')
    expect(lastWorkingDay('2026-08-01', 1)).toBe('2026-08-01')
  })

  it('flags EPFO overlap when the new join is on or before LWD', () => {
    expect(epfoDateOverlap('2026-08-30', '2026-08-30')).toBe(true)
    expect(epfoDateOverlap('2026-08-30', '2026-08-29')).toBe(true)
    expect(epfoDateOverlap('2026-08-30', '2026-08-31')).toBe(false)
  })
})

describe('completedYearsWithDayCount — 4 years 240 days', () => {
  /**
   * Join 2020-01-01, last day 2024-08-28:
   * four anniversaries have passed, and 2024-01-01 → 2024-08-28 is 240 elapsed
   * days in a leap year (Jan 31 + Feb 29 + Mar 31 + Apr 30 + May 31 + Jun 30
   * + Jul 31 + 27 = 240). That is the 4y240d continuity threshold used by
   * later gratuity eligibility — not a statute we assert here, just the date math.
   */
  it('join 2020-01-01 / exit 2024-08-28 → 4 years + 240 days, qualifies', () => {
    const t = completedYearsWithDayCount('2020-01-01', '2024-08-28')
    expect(t.completedYears).toBe(4)
    expect(t.daysIntoCurrentYear).toBe(240)
    expect(t.qualifiesFourYear240Day).toBe(true)
  })

  it('one day short of 240 in the fifth year does not qualify', () => {
    const t = completedYearsWithDayCount('2020-01-01', '2024-08-27')
    expect(t.completedYears).toBe(4)
    expect(t.daysIntoCurrentYear).toBe(239)
    expect(t.qualifiesFourYear240Day).toBe(false)
  })

  it('an exact fifth anniversary is 5 completed years', () => {
    const t = completedYearsWithDayCount('2020-01-01', '2025-01-01')
    expect(t.completedYears).toBe(5)
    expect(t.daysIntoCurrentYear).toBe(0)
    expect(t.qualifiesFourYear240Day).toBe(true)
  })

  it('a 190-day threshold (5-day week) qualifies at 4y + 190d but not a day before', () => {
    expect(completedYearsWithDayCount('2020-01-01', '2024-07-09', 190).qualifiesFourYear240Day).toBe(true)
    expect(completedYearsWithDayCount('2020-01-01', '2024-07-08', 190).qualifiesFourYear240Day).toBe(false)
    // Same tenure stays ineligible at the default 240-day threshold.
    expect(completedYearsWithDayCount('2020-01-01', '2024-07-09').qualifiesFourYear240Day).toBe(false)
  })
})

describe('monthsBetween', () => {
  it('counts a calendar anniversary as exactly one month', () => {
    expect(monthsBetween('2026-01-15', '2026-02-15')).toBe(1)
    expect(monthsBetween('2026-01-15', '2027-01-15')).toBe(12)
  })

  it('does not round a short twelfth month up into a full year', () => {
    // Bonus credited 15 Jan, planned last working day 10 Jan the next year:
    // eleven months and 26 of 31 days. A 12-month clawback still bites.
    const m = monthsBetween('2026-01-15', '2027-01-10')
    expect(m).toBeGreaterThan(11.8)
    expect(m).toBeLessThan(12)
  })

  it('is zero on the same day and negative when the dates are reversed', () => {
    expect(monthsBetween('2026-03-01', '2026-03-01')).toBe(0)
    expect(monthsBetween('2026-02-15', '2026-01-15')).toBe(-1)
  })

  it('treats a clamped month-end as a whole month', () => {
    expect(monthsBetween('2026-01-31', '2026-02-28')).toBe(1)
  })

  it('crosses a leap day without drifting', () => {
    expect(monthsBetween('2028-01-29', '2028-02-29')).toBe(1)
  })
})
