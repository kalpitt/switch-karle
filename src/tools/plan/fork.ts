import { addDays, isIsoDate } from '../../engine/dates'
import {
  DEFAULT_OFFER_BUFFER_DAYS,
  DEFAULT_OFFER_LEAD_WEEKS,
  markForfeited,
  stillAhead,
  type Cliff,
  type SwitchCalendarInput,
  type Trade,
  type TradeId,
} from '../../engine/switchCalendar'

/**
 * The work-week fork beside the live dates, as a pure function so the rule that makes
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
 * Whether the date-picking screen can be reached from the questions.
 *
 * Only false while the fork is actually live — Act coverage applies, both
 * gratuity readings exist, the answer would change a date — and no answer has
 * been given yet. An employer the Act does not cover, one with only one
 * reading, or one where the week changes nothing has nothing to fork.
 */
export function dateStepReachable(
  coveredByAct: boolean,
  hasBothWeekReadings: boolean,
  workWeekDays: 5 | 6 | undefined,
  weekMatters = true,
): boolean {
  if (!coveredByAct || !hasBothWeekReadings || !weekMatters) return true
  return workWeekDays !== undefined
}

/**
 * Whether the work-week answer would change any date on screen.
 *
 * The fork is asked only when it matters (UX-02): while at least one of the
 * two gratuity readings still holds someone who resigns today. Once both are
 * behind them — or their notice already carries them past both — either week
 * gives the same trades and the same earliest clean date, so the question is
 * noise and is not asked.
 */
export function weekChangesADate(
  forkCliffs: readonly Cliff[],
  today: string,
  noticePeriodDays: number,
): boolean {
  const five = forkCliffs.find((c) => c.id === 'gratuity-5-day')
  const six = forkCliffs.find((c) => c.id === 'gratuity-6-day')
  if (five == null || six == null) return false
  return stillAhead(five, today, noticePeriodDays) || stillAhead(six, today, noticePeriodDays)
}

/**
 * The gratuity reading the screen may speak about in a sentence, or null while
 * the fork is live and unanswered.
 *
 * Their own reading once they have answered. When the week changes nothing,
 * the later of the two (the six-day one): "already safe on" that date is true
 * for both weeks, and no countdown to a date they may not have is printed.
 */
export function gratuityToSpeakOf(
  forkCliffs: readonly Cliff[],
  workWeekDays: 5 | 6 | undefined,
  weekMatters: boolean,
): Cliff | null {
  const chosen = chosenGratuityCliff(forkCliffs, workWeekDays)
  if (chosen != null) return chosen
  if (weekMatters) return null
  return forkCliffs.find((c) => c.id === 'gratuity-6-day') ?? null
}

/**
 * Where the "Leave sooner" picker opens: the soonest resign date whose
 * start-applying day is not already behind today, so the card does not open
 * on a warning the visitor did not cause (UX-05). When even that day is on or
 * after the date that gives up nothing, leaving sooner is necessarily late, and
 * the picker opens at today with the warning shown — hiding it would be
 * choosing for them.
 */
export function soonerDefault(
  today: string,
  earliestClean: string | null,
  conventions: { offerLeadWeeks?: number; offerBufferDays?: number } = {},
): string {
  const lead = (conventions.offerLeadWeeks ?? DEFAULT_OFFER_LEAD_WEEKS) * 7
  const buffer = conventions.offerBufferDays ?? DEFAULT_OFFER_BUFFER_DAYS
  const soonest = addDays(today, lead + buffer)
  if (earliestClean != null && soonest >= earliestClean) return today
  return soonest
}

/**
 * The first fixed-date trade that gives up nothing still ahead, for the
 * "Loses nothing" tag: a fact about that date, never a recommendation. Null
 * when nothing is ahead at all (every runway option loses nothing, so tagging
 * one would read as a pick), and picker cards are never tagged because their
 * date is whatever the visitor types.
 */
export function firstCleanTrade(
  trades: readonly Trade[],
  cliffs: readonly Cliff[],
  today: string,
  noticePeriodDays: number,
): TradeId | null {
  const ahead = cliffs.filter((c) => stillAhead(c, today, noticePeriodDays))
  if (ahead.length === 0) return null
  for (const trade of trades) {
    if (trade.resignDate == null || trade.earliestDate != null || trade.id === 'keep-what-is-earned') continue
    const marked = markForfeited(ahead, trade.resignDate, noticePeriodDays)
    if (marked.every((c) => c.forfeited !== true)) return trade.id
  }
  return null
}

export type AnswerProblem = 'join' | 'notice'

/**
 * What stops the three answers being used, field by field, so the screen can
 * say why under the field instead of greying the button out (A11Y-08, UX-18).
 */
export function answerProblems(joinDate: string, noticePeriodDays: number, today: string): AnswerProblem[] {
  const out: AnswerProblem[] = []
  if (!isIsoDate(joinDate) || (today !== '' && joinDate > today)) out.push('join')
  if (!(noticePeriodDays >= 1)) out.push('notice')
  return out
}

/**
 * Whether the three questions can be submitted. A join date after today is
 * impossible (the browser marks the field invalid but does not stop a tap),
 * and a notice of zero or less is unanswered. `today` is '' before the first
 * effect runs; the date bound is skipped until it is known.
 */
export function questionsSubmittable(joinDate: string, noticePeriodDays: number, today: string): boolean {
  return answerProblems(joinDate, noticePeriodDays, today).length === 0
}

/**
 * The resign dates this visit has moved away from, oldest first.
 *
 * A date already in someone's calendar does not leave it when the date changes
 * here. Every event's UID carries its day (`resign-20270601@…`), so a second
 * `dates.ics` adds the new day beside the old one, and on the old day their
 * phone still says "Resign today" about a date they gave up. The file cannot
 * reach into a calendar to delete anything, so the screen names the old days
 * and the user deletes them.
 *
 * Moving back to a day already on the list takes it off: that day is the plan
 * again, not a leftover.
 */
export function resignDatesMovedFrom(
  movedFrom: readonly string[],
  previous: string | undefined,
  next: string | undefined,
): string[] {
  const kept = movedFrom.filter((date) => date !== next)
  if (previous == null || previous === next || kept.includes(previous)) return kept
  return [...kept, previous]
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
