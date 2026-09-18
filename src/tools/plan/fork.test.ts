import { describe, expect, it } from 'vitest'
import { cliffs } from '../../engine/switchCalendar'
import { chosenGratuityCliff, dateStepReachable, isGratuityCliff } from './fork'

/** Ravi: 21 July 2026 on a five-day week, 9 September 2026 on a six-day one. */
const RAVI = { joinDate: '2022-01-12', noticePeriodDays: 90, asOf: '2026-09-06' }

describe('the work-week fork', () => {
  it('names neither reading as the user’s until they answer', () => {
    const both = cliffs(RAVI)
    expect(both.filter(isGratuityCliff)).toHaveLength(2)
    expect(chosenGratuityCliff(both, undefined)).toBeNull()
  })

  it('picks the answer, not the first of the two', () => {
    const both = cliffs(RAVI)
    // The five-day cliff sorts first, so `find(isGratuityCliff)` would hand a
    // six-day employee 21 July — seven weeks before their real date.
    expect(chosenGratuityCliff(both, 6)?.date).toBe('2026-09-09')
    expect(chosenGratuityCliff(both, 5)?.date).toBe('2026-07-21')
  })

  it('is null when the Act does not reach the employer at all', () => {
    const none = cliffs({ ...RAVI, coveredByAct: false })
    expect(none.filter(isGratuityCliff)).toEqual([])
    expect(chosenGratuityCliff(none, 5)).toBeNull()
  })
})

describe('dateStepReachable', () => {
  it('blocks the dates step while the fork is live and unanswered', () => {
    expect(dateStepReachable(true, true, undefined)).toBe(false)
  })

  it('opens up the moment either week is chosen', () => {
    expect(dateStepReachable(true, true, 5)).toBe(true)
    expect(dateStepReachable(true, true, 6)).toBe(true)
  })

  it('is reachable straight away when the Act does not cover the employer', () => {
    expect(dateStepReachable(false, true, undefined)).toBe(true)
  })

  it('is reachable straight away when there is only one reading', () => {
    expect(dateStepReachable(true, false, undefined)).toBe(true)
  })
})
