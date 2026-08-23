/**
 * Calendar-only date math. ISO `YYYY-MM-DD` in, ISO `YYYY-MM-DD` out.
 * No time-of-day, no local timezone — Date.UTC so IST vs UTC cannot shift a day.
 */

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const MS_PER_DAY = 86_400_000

interface Ymd {
  y: number
  m: number
  d: number
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function daysInMonth(y: number, m: number): number {
  return [0, 31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]!
}

function parts(iso: string): Ymd {
  const match = ISO.exec(iso)
  if (!match) throw new Error(`dates: expected YYYY-MM-DD, got ${JSON.stringify(iso)}`)
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) {
    throw new Error(`dates: invalid calendar date ${iso}`)
  }
  return { y, m, d }
}

function toUtcMs(p: Ymd): number {
  return Date.UTC(p.y, p.m - 1, p.d)
}

function formatISO(p: Ymd): string {
  const y = String(p.y).padStart(4, '0')
  const m = String(p.m).padStart(2, '0')
  const d = String(p.d).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Calendar date in UTC from a Date (tests inject `now`). */
export function todayUTC(now = new Date()): string {
  return formatISO({ y: now.getUTCFullYear(), m: now.getUTCMonth() + 1, d: now.getUTCDate() })
}

/** Signed whole days from `from` to `to`, not including the start day. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(parts(to)) - toUtcMs(parts(from))) / MS_PER_DAY)
}

/** Add `months` (may be negative). Excess days clamp to the target month's last day. */
export function addMonths(iso: string, months: number): string {
  if (!Number.isInteger(months) || !Number.isFinite(months)) {
    throw new Error(`dates: months must be a finite integer, got ${String(months)}`)
  }
  const p = parts(iso)
  const total = p.y * 12 + (p.m - 1) + months
  const y = Math.floor(total / 12)
  let monthIndex = total % 12
  if (monthIndex < 0) monthIndex += 12
  const m = monthIndex + 1
  const d = Math.min(p.d, daysInMonth(y, m))
  return formatISO({ y, m, d })
}

/** Add whole days (may be negative). UTC calendar, same rules as `daysBetween`. */
export function addDays(iso: string, days: number): string {
  if (!Number.isInteger(days) || !Number.isFinite(days)) {
    throw new Error(`dates: days must be a finite integer, got ${String(days)}`)
  }
  const ms = toUtcMs(parts(iso)) + days * MS_PER_DAY
  const d = new Date(ms)
  return formatISO({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() })
}

/**
 * Last working day if the full notice is served.
 * CANDIDATE: LWD = resignation date + notice days − 1 (calendar). The letter can count differently.
 */
export function lastWorkingDay(resignDate: string, noticePeriodDays: number): string {
  const n = Number.isInteger(noticePeriodDays) && noticePeriodDays >= 1 ? noticePeriodDays : 1
  return addDays(resignDate, n - 1)
}

/**
 * True when the new join date is on or before LWD. EPFO's member portal often
 * cannot record two employers on overlapping days — portal behaviour, not a named statute.
 */
export function epfoDateOverlap(lwd: string, newJoinDate: string): boolean {
  return daysBetween(lwd, newJoinDate) <= 0
}

export interface Tenure {
  completedYears: number
  /** Elapsed days since the last join-anniversary (0 on an exact anniversary). */
  daysIntoCurrentYear: number
  /** True at 5 completed years, or 4 years plus ≥`fourYearDaysThreshold` days into the fifth. */
  qualifiesFourYear240Day: boolean
}

/**
 * `fourYearDaysThreshold` is the s.2A fast-path day count into year five:
 * 240 for a 6-day week (default), 190 for a 5-day week.
 */
export function completedYearsWithDayCount(
  joinISO: string,
  exitISO: string,
  fourYearDaysThreshold = 240,
): Tenure {
  const join = parts(joinISO)
  const exit = parts(exitISO)
  let completedYears = exit.y - join.y
  if (exit.m < join.m || (exit.m === join.m && exit.d < join.d)) completedYears -= 1
  if (completedYears < 0) {
    return { completedYears: 0, daysIntoCurrentYear: 0, qualifiesFourYear240Day: false }
  }
  const lastAnniversary = addMonths(joinISO, completedYears * 12)
  const daysIntoCurrentYear = daysBetween(lastAnniversary, exitISO)
  const qualifiesFourYear240Day =
    completedYears >= 5 || (completedYears === 4 && daysIntoCurrentYear >= fourYearDaysThreshold)
  return { completedYears, daysIntoCurrentYear, qualifiesFourYear240Day }
}
