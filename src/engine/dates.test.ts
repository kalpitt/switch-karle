import { describe, expect, it } from 'vitest'
import { addMonths, completedYearsWithDayCount, daysBetween } from './dates'

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
})
