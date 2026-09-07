import { addDays, addMonths, daysBetween, lastWorkingDay } from './dates'
import { gratuityEligibilityDate } from './gratuity'

/**
 * The switch calendar: the dated cliffs a person is standing between, the
 * trades each date represents, and the plan that works backwards from the date
 * they choose.
 *
 * Pure calendar arithmetic, ISO `YYYY-MM-DD` in and out, all of it through
 * `dates.ts` so it happens in UTC — a phone set to IST must not shift a
 * statutory cliff by a day. No React, no storage, no rupees: this module never
 * sees money, and every label it returns is an id the UI maps through `t()`.
 *
 * Spec: docs/DIRECTION.md Part 3 (the first session) and Part 13 (Phase 0).
 */

/**
 * How long an offer takes from the first application. A convention from
 * ordinary experience, not a statute — exported so the UI can show it as an
 * editable number rather than passing it off as a fact.
 */
export const DEFAULT_OFFER_LEAD_WEEKS = 8

/**
 * Days between having an offer in hand and resigning. Also a convention, and
 * editable for the same reason.
 */
export const DEFAULT_OFFER_BUFFER_DAYS = 14

/** Where a date comes from. Statutory dates carry a section; conventions do not. */
export type DateKind = 'statutory' | 'contractual' | 'convention'

export type CliffId =
  | 'gratuity-5-day'
  | 'gratuity-6-day'
  | 'hike'
  | 'bond-end'
  | 'bonus-clawback'

export interface Cliff {
  /** Label id. The UI maps it through `t()`; this module returns no English. */
  id: CliffId
  /** ISO `YYYY-MM-DD`. */
  date: string
  kind: DateKind
  /** Signed days from today. Negative for a cliff already behind the user. */
  daysAway: number
  /** True when the cliff is strictly behind today, so nothing more is at stake. */
  passed: boolean
  /**
   * True when the chosen resign date falls before this cliff. `null` until a
   * date is chosen — it cannot be answered before then, and screen two must
   * never render it. `markForfeited` is what turns null into a boolean.
   */
  forfeited: boolean | null
}

export type TradeId =
  | 'keep-the-hike'
  | 'keep-what-is-earned'
  | 'own-date'
  | 'runway-3-months'
  | 'runway-6-months'
  | 'runway-financial-year-end'

export interface Trade {
  /** Label id. No option is ever marked recommended — that choice is the user's. */
  id: TradeId
  /** The date this option lands on, or null when the user supplies it. */
  resignDate: string | null
  /**
   * The earliest date this option lets the user pick, when it is a date picker
   * rather than a fixed date. Null when the option has no picker.
   */
  earliestDate: string | null
  offerBy: string | null
  startApplyingBy: string | null
  /**
   * True when a date this option allows already has its start-applying date
   * behind the user. Computed from `earliestDate ?? resignDate`, so a picker
   * that opens at today reports the truth about today. The screen says this in
   * words on the option itself; hiding it would be choosing for the user.
   */
  startApplyingByPassed: boolean
}

export type PlannedDateId = 'last-working-day' | 'need-offer-by' | 'start-applying-by'

export interface PlannedDate {
  id: PlannedDateId
  date: string
  kind: DateKind
  daysAway: number
  passed: boolean
}

export interface Timeline {
  resignDate: string
  /** Days from today to the resign date. Negative once it is behind. */
  daysAway: number
  lastWorkingDay: PlannedDate
  needOfferBy: PlannedDate
  startApplyingBy: PlannedDate
}

export interface Conventions {
  offerLeadWeeks: number
  offerBufferDays: number
}

export interface SwitchCalendarInput {
  joinDate: string
  noticePeriodDays: number
  /** 1–12, the month the hike money reaches the account. Skippable. */
  hikeCreditMonth?: number
  /**
   * The year the hike month resolved to when the user first answered. Stored on
   * the plan so a saved plan does not quietly slide a year forward on a later
   * visit. Absent means resolve it from `asOf`.
   */
  hikeCreditYear?: number
  bondEndDate?: string
  joiningBonusDate?: string
  /** Months of service a joining bonus is clawed back over. */
  clawbackMonths?: number
  /** The date the user picked. Until it exists there is no backward plan. */
  targetResignDate?: string
  offerLeadWeeks?: number
  offerBufferDays?: number
  /** 5 or 6. Asked on screen two, never defaulted into a cliff of its own. */
  workWeekDays?: 5 | 6
  /** 10+ employees. Asked, not assumed. Defaults true. */
  coveredByAct?: boolean
  /** Today, ISO. Injected so the whole module is a pure function of its input. */
  asOf: string
}

export interface SwitchCalendarResult {
  today: string
  /**
   * Every dated cliff, including ones already behind — the screen says "safe
   * since 21 July 2026", which needs the past date. `forfeited` is filled in
   * only when `targetResignDate` is set.
   */
  cliffs: Cliff[]
  earliestCleanDate: string
  trades: Trade[]
  /** Null until the user picks a date. Never substitute `earliestCleanDate`. */
  timeline: Timeline | null
  conventions: Conventions
}

/** Last calendar day of `month` (1–12) in `year`. */
function lastDayOfMonth(year: number, month: number): string {
  const first = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`
  return addDays(addMonths(first, 1), -1)
}

function monthOf(iso: string): number {
  return Number(iso.slice(5, 7))
}

function yearOf(iso: string): number {
  return Number(iso.slice(0, 4))
}

/**
 * The hike cliff: the last day of the next occurrence of the hike month.
 *
 * The month prints with a year everywhere. Someone answering "May" in
 * September 2026 means May 2027, and without the year "waiting until June costs
 * you nine months" is arithmetic about a date that has already happened.
 *
 * The current month rolls to next year too. In the month itself we cannot know
 * whether the credit has already landed, and a cliff the user may already be
 * past is worse than one that is honestly a year out.
 *
 * Pass `year` to pin a month the plan already resolved once.
 */
export function hikeCliffDate(hikeCreditMonth: number, today: string, year?: number): string | null {
  if (!Number.isInteger(hikeCreditMonth) || hikeCreditMonth < 1 || hikeCreditMonth > 12) return null
  if (year !== undefined) return lastDayOfMonth(year, hikeCreditMonth)
  const rolls = hikeCreditMonth <= monthOf(today)
  return lastDayOfMonth(yearOf(today) + (rolls ? 1 : 0), hikeCreditMonth)
}

function makeCliff(id: CliffId, date: string, kind: DateKind, today: string): Cliff {
  const daysAway = daysBetween(today, date)
  return { id, date, kind, daysAway, passed: daysAway < 0, forfeited: null }
}

/**
 * Every dated cliff this person is standing between, earliest first.
 *
 * The gratuity cliff is returned for BOTH work weeks until `workWeekDays` says
 * which is theirs, because the two are 190 days and 240 days into year five and
 * for a January 2022 joiner that is 21 July 2026 against 9 September 2026.
 * Defaulting to six is how the screen invents a cliff seven weeks after the
 * real one has already passed.
 *
 * Cliffs already behind are kept, not dropped: "already safe on 21 July" is one
 * thing less holding the user here, and it is only sayable with the date.
 */
export function cliffs(input: SwitchCalendarInput): Cliff[] {
  const today = input.asOf
  const coveredByAct = input.coveredByAct ?? true
  const out: Cliff[] = []

  const weeks: (5 | 6)[] = input.workWeekDays === undefined ? [5, 6] : [input.workWeekDays]
  for (const week of weeks) {
    const date = gratuityEligibilityDate(input.joinDate, week, coveredByAct)
    if (date !== null) {
      out.push(makeCliff(week === 5 ? 'gratuity-5-day' : 'gratuity-6-day', date, 'statutory', today))
    }
  }

  if (input.hikeCreditMonth !== undefined) {
    const date = hikeCliffDate(input.hikeCreditMonth, today, input.hikeCreditYear)
    if (date !== null) out.push(makeCliff('hike', date, 'contractual', today))
  }

  if (input.bondEndDate !== undefined) {
    out.push(makeCliff('bond-end', input.bondEndDate, 'contractual', today))
  }

  if (input.joiningBonusDate !== undefined && input.clawbackMonths !== undefined) {
    // bonusClawback() returns rupees and a repayment curve, and no date at all.
    const date = addMonths(input.joiningBonusDate, input.clawbackMonths)
    out.push(makeCliff('bonus-clawback', date, 'contractual', today))
  }

  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

/**
 * The first day on which nothing still ahead of the user is forfeited: the day
 * after the latest cliff that has not yet passed, or today when every cliff is
 * already behind them (or there are none at all).
 *
 * Information on the date step, never a date the product picks for anyone.
 */
export function earliestCleanDate(list: readonly Cliff[], today: string): string {
  let latest: string | null = null
  for (const cliff of list) {
    if (cliff.passed) continue
    if (latest === null || cliff.date > latest) latest = cliff.date
  }
  return latest === null ? today : addDays(latest, 1)
}

/** Per-cliff `forfeited`: true when the chosen resign date falls before the cliff. */
export function markForfeited(list: readonly Cliff[], resignDate: string): Cliff[] {
  return list.map((cliff) => ({ ...cliff, forfeited: resignDate < cliff.date }))
}

function plannedDate(id: PlannedDateId, date: string, kind: DateKind, today: string): PlannedDate {
  const daysAway = daysBetween(today, date)
  return { id, date, kind, daysAway, passed: daysAway < 0 }
}

/**
 * The plan worked backwards from a resign date: when the last working day
 * falls, when an offer has to be in hand, and the latest safe day to start
 * applying.
 *
 * "Start applying by" is the latest safe start, never an instruction to wait.
 *
 * The last working day comes from `lastWorkingDay` in `dates.ts`, which counts
 * the resignation day as day one of notice and carries its own CANDIDATE
 * marker for that reading. The other two are conventions.
 */
export function timeline(
  resignDate: string,
  noticePeriodDays: number,
  today: string,
  conventions: Partial<Conventions> = {},
): Timeline {
  const offerBufferDays = conventions.offerBufferDays ?? DEFAULT_OFFER_BUFFER_DAYS
  const offerLeadWeeks = conventions.offerLeadWeeks ?? DEFAULT_OFFER_LEAD_WEEKS
  const needOfferBy = addDays(resignDate, -offerBufferDays)
  const startApplyingBy = addDays(needOfferBy, -offerLeadWeeks * 7)
  return {
    resignDate,
    daysAway: daysBetween(today, resignDate),
    lastWorkingDay: plannedDate(
      'last-working-day',
      lastWorkingDay(resignDate, noticePeriodDays),
      'contractual',
      today,
    ),
    needOfferBy: plannedDate('need-offer-by', needOfferBy, 'convention', today),
    startApplyingBy: plannedDate('start-applying-by', startApplyingBy, 'convention', today),
  }
}

/** The next 31 March strictly after `today` — the end of the financial year. */
function nextFinancialYearEnd(today: string): string {
  const candidate = `${String(yearOf(today)).padStart(4, '0')}-03-31`
  return candidate > today ? candidate : `${yearOf(today) + 1}-03-31`
}

function tradeFor(
  id: TradeId,
  resignDate: string | null,
  earliestDate: string | null,
  today: string,
  conventions: Conventions,
): Trade {
  const applyingFor = (date: string): string =>
    addDays(addDays(date, -conventions.offerBufferDays), -conventions.offerLeadWeeks * 7)
  const base = earliestDate ?? resignDate
  return {
    id,
    resignDate,
    earliestDate,
    offerBy: resignDate === null ? null : addDays(resignDate, -conventions.offerBufferDays),
    startApplyingBy: resignDate === null ? null : applyingFor(resignDate),
    startApplyingByPassed: base !== null && applyingFor(base) < today,
  }
}

/**
 * The options for "when do you want to be out?", as trades rather than bare
 * dates. A date on its own says nothing about what it costs, and a stuck person
 * handed an empty date picker has been given homework.
 *
 * With a cliff still ahead: keep the hike (the day after the hike cliff), keep
 * only what is already earned (which shows `earliestCleanDate` and asks for a
 * date), and their own date.
 *
 * With nothing ahead at all — which is most people already past five years —
 * the options become plain runway: three months, six months, the end of the
 * financial year, or their own date. A blank timeline is never shipped.
 */
export function trades(input: SwitchCalendarInput): Trade[] {
  const today = input.asOf
  const conventions: Conventions = {
    offerLeadWeeks: input.offerLeadWeeks ?? DEFAULT_OFFER_LEAD_WEEKS,
    offerBufferDays: input.offerBufferDays ?? DEFAULT_OFFER_BUFFER_DAYS,
  }
  const list = cliffs(input)
  const ahead = list.filter((c) => !c.passed)
  const ownDate = tradeFor('own-date', null, null, today, conventions)

  if (ahead.length === 0) {
    return [
      tradeFor('runway-3-months', addMonths(today, 3), null, today, conventions),
      tradeFor('runway-6-months', addMonths(today, 6), null, today, conventions),
      tradeFor('runway-financial-year-end', nextFinancialYearEnd(today), null, today, conventions),
      ownDate,
    ]
  }

  const out: Trade[] = []
  const hike = ahead.find((c) => c.id === 'hike')
  if (hike !== undefined) {
    out.push(tradeFor('keep-the-hike', addDays(hike.date, 1), null, today, conventions))
  }
  // The picker opens at today: leaving now gives up everything still ahead,
  // which is what this option is for. `earliestCleanDate` is the date it shows.
  out.push(
    tradeFor('keep-what-is-earned', earliestCleanDate(list, today), today, today, conventions),
  )
  out.push(ownDate)
  return out
}

/**
 * Whether the outbound actions render. Two conditions and either one is enough:
 * today is on or after the latest safe day to start applying, or the user has
 * tapped "I want to start looking now".
 *
 * Neither moves the resign date. Someone can be looking in September and still
 * leaving in June.
 */
export function outboundUnlocked(
  today: string,
  startApplyingBy: string | null,
  lookingSince?: string | null,
): boolean {
  if (lookingSince != null && lookingSince !== '') return true
  return startApplyingBy !== null && today >= startApplyingBy
}

/** The whole calculation for one person, on one day. */
export function switchCalendar(input: SwitchCalendarInput): SwitchCalendarResult {
  const today = input.asOf
  const bare = cliffs(input)
  const resignDate = input.targetResignDate
  return {
    today,
    cliffs: resignDate === undefined ? bare : markForfeited(bare, resignDate),
    earliestCleanDate: earliestCleanDate(bare, today),
    trades: trades(input),
    timeline:
      resignDate === undefined
        ? null
        : timeline(resignDate, input.noticePeriodDays, today, {
            offerLeadWeeks: input.offerLeadWeeks,
            offerBufferDays: input.offerBufferDays,
          }),
    conventions: {
      offerLeadWeeks: input.offerLeadWeeks ?? DEFAULT_OFFER_LEAD_WEEKS,
      offerBufferDays: input.offerBufferDays ?? DEFAULT_OFFER_BUFFER_DAYS,
    },
  }
}
