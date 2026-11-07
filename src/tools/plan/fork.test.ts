import { describe, expect, it } from 'vitest'
import { addDays } from '../../engine/dates'
import { cliffs, switchCalendar } from '../../engine/switchCalendar'
import { chosenGratuityCliff, dateStepReachable, doorEngineInput, isGratuityCliff } from './fork'
import { answerProblems, firstCleanTrade, gratuityToSpeakOf, soonerDefault, weekChangesADate } from './fork'
import { questionsSubmittable, resignDatesMovedFrom } from './fork'

describe('a moved resign date is named so it can be deleted from a calendar', () => {
  it('names nothing on the first pick', () => {
    expect(resignDatesMovedFrom([], undefined, '2027-06-01')).toEqual([])
  })

  it('names the old day when the date moves', () => {
    expect(resignDatesMovedFrom([], '2027-06-01', '2027-07-15')).toEqual(['2027-06-01'])
  })

  it('keeps every day moved away from, oldest first', () => {
    const once = resignDatesMovedFrom([], '2027-06-01', '2027-07-15')
    expect(resignDatesMovedFrom(once, '2027-07-15', '2027-08-02')).toEqual(['2027-06-01', '2027-07-15'])
  })

  it('drops a day the user moves back to, because it is the plan again', () => {
    const once = resignDatesMovedFrom([], '2027-06-01', '2027-07-15')
    expect(resignDatesMovedFrom(once, '2027-07-15', '2027-06-01')).toEqual(['2027-07-15'])
  })

  it('does nothing when the same day is picked again', () => {
    expect(resignDatesMovedFrom([], '2027-06-01', '2027-06-01')).toEqual([])
  })

  it('keeps the day after start over clears the plan, since the calendar still has it', () => {
    expect(resignDatesMovedFrom([], '2027-06-01', undefined)).toEqual(['2027-06-01'])
  })
})

/**
 * Ravi: 2 October 2026 on a five-day week, 17 October 2026 on a six-day one
 * (s.54(B)(a) working days from the fourth anniversary, 2026-09-27).
 */
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
    // six-day employee 2 October — two weeks before their real date.
    expect(chosenGratuityCliff(both, 6)?.date).toBe('2026-10-17')
    expect(chosenGratuityCliff(both, 5)?.date).toBe('2026-10-02')
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

  it('is reachable straight away when the week would change no date', () => {
    expect(dateStepReachable(true, true, undefined, false)).toBe(true)
  })
})

/** Both gratuity readings for a join date, as the door computes them. */
const fork = (joinDate: string, asOf: string) =>
  cliffs({ joinDate, noticePeriodDays: 90, asOf }).filter(isGratuityCliff)

describe('the week is asked only when it changes a date', () => {
  it('is not asked when both readings are behind them (Ravi, October 2026)', () => {
    expect(weekChangesADate(fork('2022-01-12', '2026-10-31'), '2026-10-31', 90)).toBe(false)
  })

  it('is asked when both readings are still ahead', () => {
    expect(weekChangesADate(fork('2023-04-10', '2026-10-31'), '2026-10-31', 60)).toBe(true)
  })

  it('is asked when only the five-day reading is behind them', () => {
    const [five, six] = fork('2022-01-12', '2026-01-01')
    expect(five!.date < six!.date).toBe(true)
    const today = addDays(five!.date, 1)
    expect(weekChangesADate(fork('2022-01-12', today), today, 1)).toBe(true)
  })

  it('is not asked when their notice already carries them past both', () => {
    const [, six] = fork('2022-01-12', '2026-01-01')
    const today = addDays(six!.date, -30)
    expect(weekChangesADate(fork('2022-01-12', today), today, 90)).toBe(false)
  })

  it('is not asked when there is no reading at all (Act does not cover them)', () => {
    expect(weekChangesADate([], '2026-10-31', 90)).toBe(false)
  })
})

describe('the gratuity reading the screen may name', () => {
  const both = fork('2022-01-12', '2026-10-31')

  it('is none while the fork is live and unanswered', () => {
    expect(gratuityToSpeakOf(both, undefined, true)).toBeNull()
  })

  it('is their own once they answer', () => {
    expect(gratuityToSpeakOf(both, 5, true)?.id).toBe('gratuity-5-day')
    expect(gratuityToSpeakOf(both, 5, false)?.id).toBe('gratuity-5-day')
  })

  it('is the later reading when the week changes nothing, which is true for either week', () => {
    expect(gratuityToSpeakOf(both, undefined, false)?.id).toBe('gratuity-6-day')
  })
})

describe('where "Leave sooner" opens', () => {
  // 14 days' buffer + 8 weeks' lead = 70 days before the resign date.
  it('opens on the soonest date whose start-applying day is not behind today', () => {
    expect(soonerDefault('2026-10-31', '2027-06-01')).toBe('2027-01-09')
    expect(soonerDefault('2026-10-31', null)).toBe('2027-01-09')
  })

  it('opens at today when that date would not be sooner than the date that gives up nothing', () => {
    expect(soonerDefault('2026-10-31', '2027-01-09')).toBe('2026-10-31')
  })
})

describe('the "Loses nothing" tag', () => {
  const today = '2026-10-31'
  const run = (joinDate: string, noticePeriodDays: number, hikeCreditMonth?: number) => {
    const input = { joinDate, noticePeriodDays, hikeCreditMonth, asOf: today }
    const result = switchCalendar(input)
    return firstCleanTrade(result.trades, result.cliffs, today, noticePeriodDays)
  }

  it('goes on "Wait for the hike" when the hike is the last thing ahead (Ravi)', () => {
    expect(run('2022-01-12', 90, 5)).toBe('keep-the-hike')
  })

  it('goes nowhere when waiting for the hike still gives up the gratuity', () => {
    expect(run('2023-04-10', 60, 5)).toBeNull()
  })

  it('goes nowhere when nothing is ahead, so no runway option reads as the pick', () => {
    expect(run('2018-01-12', 90)).toBeNull()
  })
})

describe('answerProblems names each missing answer', () => {
  it('names nothing for good answers', () => {
    expect(answerProblems('2022-01-12', 90, '2026-10-31')).toEqual([])
  })
  it('names a blank or future join date and a notice under one', () => {
    expect(answerProblems('', 90, '2026-10-31')).toEqual(['join'])
    expect(answerProblems('2027-01-01', 0, '2026-10-31')).toEqual(['join', 'notice'])
    expect(answerProblems('2022-01-12', NaN, '2026-10-31')).toEqual(['notice'])
  })
  it('does not judge the date against a clock it does not have yet', () => {
    expect(answerProblems('2027-01-01', 90, '')).toEqual([])
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
