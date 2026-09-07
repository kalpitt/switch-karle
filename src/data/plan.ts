import { isIsoDate } from '../engine/dates'
import { readJson, releaseBootEcho, writeJson } from '../lib/storage'

/**
 * The saved plan: what the user decided, and nothing about their employer.
 *
 * The split is one home per fact, not a preference (docs/DIRECTION.md Part 5).
 * Join date, notice period, work week, Act coverage and every rupee figure are
 * facts about the current employer and live on `switchkarle.current-job.v1`.
 * This record owns only what the plan invented: the reason, the hike month, the
 * date picked, the day looking started, the ticks, and the company list. An
 * earlier version held join date and notice period in both, which is how
 * someone types a join date twice and sees two different gratuity dates.
 *
 * **No money is stored here at all.** Not a defensive habit — the calendar file
 * built from this record may land in a work calendar.
 */
export const PLAN_STORAGE_KEY = 'switchkarle.plan.v1' as const

/**
 * The ten first actions, in Part 6's order. The first four are private and safe
 * the day they arrive; the last six are outbound and render only once today is
 * on or after `startApplyingBy`, or `lookingSince` is set — see
 * `outboundUnlocked` in `src/engine/switchCalendar.ts`.
 *
 * The tick-boxes themselves are Phase 1. The ids are here now so that shipping
 * them needs no key version bump, and so the UI has one list to write i18n keys
 * against rather than inventing its own.
 */
export const ACTION_IDS = [
  'write-reason',
  'name-five-companies',
  'tell-one-person-outside',
  'read-what-binds-you',
  'research-two-companies',
  'message-one-ex-colleague',
  'update-public-headline',
  'block-saturday',
  'apply-to-one',
  'apply-to-one-more',
] as const

export type ActionId = (typeof ACTION_IDS)[number]

export interface Plan {
  /** One line, why they are leaving. Optional, and it comes back at the top of every visit. */
  reason?: string
  /** 1–12, the month the hike money actually reaches the account. Skippable. */
  hikeCreditMonth?: number
  /**
   * The year that month resolved to when it was first answered. Stored so a
   * saved plan does not quietly slide a year forward on a later visit: "May"
   * answered in September 2026 means May 2027 and must still mean May 2027 in
   * June 2027.
   */
  hikeCreditYear?: number
  /** The date they picked to resign, ISO. */
  resignDate?: string
  /**
   * The day they tapped "I want to start looking now". It unlocks the outbound
   * actions and **does not move the resign date** — someone can be looking in
   * September and still leaving in June.
   */
  lookingSince?: string
  /** Action id to the ISO day it was ticked. An untinked action is simply absent. */
  ticks?: Partial<Record<ActionId, string>>
  /** The five companies they would say yes to. A plain list, no job titles. */
  companies?: string[]
}

/**
 * A patch. `undefined` leaves a field alone; `null` clears it. The plan needs
 * clearing where the current-job record does not: a reason is rewritten and a
 * company list is edited down, and without an explicit clear the only way to
 * empty either would be to erase everything.
 */
export type PlanPatch = { [K in keyof Plan]?: Plan[K] | null }

const FIELDS = [
  'reason',
  'hikeCreditMonth',
  'hikeCreditYear',
  'resignDate',
  'lookingSince',
  'ticks',
  'companies',
] as const

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== ''
}

/** Clean a value for storage, or return undefined when it is not one. */
const CLEAN: { [K in (typeof FIELDS)[number]]: (v: unknown) => Plan[K] | undefined } = {
  // Stored trimmed: a reason that is only whitespace is not a reason, and it
  // renders at the top of every return visit.
  reason: (v) => (nonEmptyString(v) ? v.trim() : undefined),
  hikeCreditMonth: (v) =>
    typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 12 ? v : undefined,
  hikeCreditYear: (v) =>
    typeof v === 'number' && Number.isInteger(v) && v >= 1900 && v <= 3000 ? v : undefined,
  resignDate: (v) => (isIsoDate(v) ? v : undefined),
  lookingSince: (v) => (isIsoDate(v) ? v : undefined),
  ticks: (v) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) return undefined
    const out: Partial<Record<ActionId, string>> = {}
    for (const id of ACTION_IDS) {
      const day = (v as Record<string, unknown>)[id]
      if (isIsoDate(day)) out[id] = day
    }
    return out
  },
  // Entries are trimmed and blanks dropped. The list is not capped at five:
  // silently discarding a sixth name the user typed is worse than showing it.
  companies: (v) =>
    Array.isArray(v) ? v.filter(nonEmptyString).map((name) => name.trim()) : undefined,
}

/** Keep only the known fields, and only values that pass that field's own test. */
function sanitise(raw: unknown): Plan {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Record<string, unknown> = {}
  for (const field of FIELDS) {
    const value = CLEAN[field]((raw as Record<string, unknown>)[field])
    if (value !== undefined) out[field] = value
  }
  return out as Plan
}

export function loadPlan(): Plan {
  const raw = readJson<unknown>(PLAN_STORAGE_KEY, null)
  // Deliberate, and the choice docs/DIRECTION.md Part 13 asks to be made
  // explicitly: this record does NOT echo a draft on mount. It is written from
  // discrete answers — tapping a trade, tapping "start looking", saving a
  // reason — and never from continuous typing, so there is no mount echo to
  // spend the boot-echo skip on. Left armed, the skip would swallow the first
  // real save of the session, which for a first-time visitor is their resign
  // date: the one thing the whole session exists to produce. Released here for
  // the same reason `currentJob.ts` releases it.
  releaseBootEcho(PLAN_STORAGE_KEY)
  return sanitise(raw)
}

/**
 * Merge an answer into the plan. A field the patch leaves undefined, or sets to
 * a value its own test rejects, keeps whatever is already stored; a field set
 * to `null` is removed.
 *
 * Ticks merge per action rather than replacing the whole map, so recording one
 * tick cannot lose another. Pass `ticks: null` to clear them all.
 */
export function savePlan(patch: PlanPatch): void {
  const current = loadPlan()
  const next: Record<string, unknown> = { ...current }
  for (const field of FIELDS) {
    if (!(field in patch)) continue
    const given = patch[field]
    if (given === null) {
      delete next[field]
      continue
    }
    const value = CLEAN[field](given)
    if (value === undefined) continue
    next[field] =
      field === 'ticks'
        ? { ...current.ticks, ...(value as Partial<Record<ActionId, string>>) }
        : value
  }
  writeJson(PLAN_STORAGE_KEY, next)
}

/** Record that `id` was ticked on `day`. */
export function tickAction(id: ActionId, day: string): void {
  savePlan({ ticks: { [id]: day } })
}

/**
 * Forget the plan, and only the plan.
 *
 * The footer's erase control sweeps every `switchkarle.` key by prefix and does
 * not need this — see `src/lib/erase.ts`. This is the narrower door: starting a
 * new plan must not take the user's saved salary numbers with it, because those
 * belong to six other tools that never asked to be reset.
 */
export function erasePlan(): void {
  try {
    localStorage.removeItem(PLAN_STORAGE_KEY)
  } catch {
    /* private mode / quota — nothing was stored to remove */
  }
}
