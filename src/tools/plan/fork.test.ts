import { describe, expect, it } from 'vitest'
import { cliffs } from '../../engine/switchCalendar'
import { chosenGratuityCliff, dateStepReachable, doorEngineInput, isGratuityCliff } from './fork'
import { questionsSubmittable } from './fork'

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

describe('questionsSubmittable', () => {
  const today = '2026-09-19'
  it('accepts a past join date and a positive notice', () => {
    expect(questionsSubmittable('2022-01-12', 90, today)).toBe(true)
    expect(questionsSubmittable(today, 1, today)).toBe(true)
  })
  it('refuses a join date after today, which the browser only marks invalid', () => {
    expect(questionsSubmittable('2026-12-25', 90, today)).toBe(false)
  })
  it('refuses a blank date and a notice of zero', () => {
    expect(questionsSubmittable('', 90, today)).toBe(false)
    expect(questionsSubmittable('2022-01-12', 0, today)).toBe(false)
  })
  it('refuses a NaN notice period', () => {
    expect(questionsSubmittable('2022-01-12', NaN, today)).toBe(false)
  })
})

describe('doorEngineInput', () => {
  const today = '2026-09-19'
  it('proves the engine input the door builds is finite when the notice is NaN', () => {
    const input = doorEngineInput(
      { joinDate: '2022-01-12', noticePeriodDays: NaN, hikeCreditMonth: 5 },
      {},
      {},
      today,
    )
    expect(Number.isFinite(input.noticePeriodDays)).toBe(true)
    expect(input.noticePeriodDays).toBeGreaterThanOrEqual(1)
  })

  it('keeps the user notice period when finite and >= 1', () => {
    const input = doorEngineInput(
      { joinDate: '2022-01-12', noticePeriodDays: 60, hikeCreditMonth: 5 },
      {},
      {},
      today,
    )
    expect(input.noticePeriodDays).toBe(60)
  })
})
