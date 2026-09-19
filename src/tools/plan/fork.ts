import { isIsoDate } from '../../engine/dates'
import type { Cliff, SwitchCalendarInput } from '../../engine/switchCalendar'

/**
 * The work-week fork on screen two, as a pure function so the rule that makes
 * it a fork can be tested rather than read off a component.
 *
 * `cliffs()` returns BOTH gratuity readings until `workWeekDays` says which is
 * the user's, and the screen prints both. What it must NOT print is a sentence
 * about one of them — "your gratuity was already safe on 21 July, 48 days ago"
 * is a countdown to a date a six-day-week employee does not have, and Part 3
 * forbids it before the answer. Taking the first of the two is exactly that
 * bug, and it shipped once in the browser before this function existed.
 */
export function isGratuityCliff(cliff: Cliff): boolean {
  return cliff.id === 'gratuity-5-day' || cliff.id === 'gratuity-6-day'
}

/** The user's own gratuity cliff, or null while the fork is unanswered. */
export function chosenGratuityCliff(
  cliffs: readonly Cliff[],
  workWeekDays: 5 | 6 | undefined,
): Cliff | null {
  if (workWeekDays === undefined) return null
  const wanted = workWeekDays === 5 ? 'gratuity-5-day' : 'gratuity-6-day'
  return cliffs.find((cliff) => cliff.id === wanted) ?? null
}

/**
 * Whether screen three (the trades) can be reached from screen two.
 *
 * Only false while the fork is actually live — Act coverage applies and both
 * gratuity readings exist — and no answer has been given yet. An employer the
 * Act does not cover, or one with only one reading, has nothing to fork: the
 * dates step is reachable straight away.
 */
export function dateStepReachable(
  coveredByAct: boolean,
  hasBothWeekReadings: boolean,
  workWeekDays: 5 | 6 | undefined,
): boolean {
  if (!coveredByAct || !hasBothWeekReadings) return true
  return workWeekDays !== undefined
}

/**
 * Whether the three questions can be submitted. A join date after today is
 * impossible (the browser marks the field invalid but does not stop a tap),
 * and a notice of zero or less is unanswered. `today` is '' before the first
 * effect runs; the date bound is skipped until it is known.
 */
export function questionsSubmittable(joinDate: string, noticePeriodDays: number, today: string): boolean {
  if (!isIsoDate(joinDate) || !(noticePeriodDays >= 1)) return false
  return today === '' || joinDate <= today
}

export interface DoorEngineAnswers {
  joinDate: string
  noticePeriodDays: number
  hikeCreditMonth: number
}

export interface DoorEngineJob {
  workWeekDays?: 5 | 6
  coveredByAct?: boolean
}

export interface DoorEnginePlan {
  resignDate?: string
  hikeCreditMonth?: number | null
  hikeCreditYear?: number | null
}

/**
 * Builds safe engine input from the door's current state.
 *
 * The date engine is a pure function of its inputs. If the notice field is
 * blank (NaN) or invalid while the user is typing, we fall back to a safe
 * display-only value (90 days) so that render-time cliff computations never
 * crash. When answers are submittable, the user's real finite notice is used.
 */
export function doorEngineInput(
  answers: DoorEngineAnswers,
  job: DoorEngineJob,
  plan: DoorEnginePlan,
  today: string,
): SwitchCalendarInput {
  const hikeYear =
    plan.hikeCreditMonth === answers.hikeCreditMonth ? plan.hikeCreditYear ?? undefined : undefined
  const safeNotice =
    Number.isFinite(answers.noticePeriodDays) && answers.noticePeriodDays >= 1
      ? answers.noticePeriodDays
      : 90

  return {
    joinDate: isIsoDate(answers.joinDate) ? answers.joinDate : '2000-01-01',
    noticePeriodDays: safeNotice,
    hikeCreditMonth: answers.hikeCreditMonth > 0 ? answers.hikeCreditMonth : undefined,
    hikeCreditYear: hikeYear,
    workWeekDays: job.workWeekDays,
    coveredByAct: job.coveredByAct ?? true,
    targetResignDate: plan.resignDate,
    asOf: today === '' ? '2000-01-01' : today,
  }
}
