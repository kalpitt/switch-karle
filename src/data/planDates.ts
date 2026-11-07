import { isIsoDate, lastWorkingDay } from '../engine/dates'
import { loadCurrentJob, type CurrentJob } from './currentJob'
import { loadPlan, type Plan } from './plan'

/**
 * The dates the home plan already knows, handed to the tools that need them
 * (PRODUCT.md rule 7: type a date once). Read-only: nothing here writes either
 * record.
 *
 * Two homes, one per fact. The join date and notice period are facts about the
 * current employer and live on `switchkarle.current-job.v1`; the resign date is
 * what the plan invented and lives on `switchkarle.plan.v1`. The home plan is
 * the only screen that writes a join date to the current-job record, which is
 * why a tool can honestly say "from your plan" about it.
 *
 * The last working day is derived, never stored: `lastWorkingDay()` counts the
 * resignation day as day one, which is our reading and not a rule of law (the
 * CANDIDATE marker in `src/engine/dates.ts`). A tool that shows it must keep
 * the `last-working-day` source on its receipt so that reading is labelled.
 */
export interface PlanDates {
  joinDate?: string
  resignDate?: string
  /** Only when both the resign date and the notice period are known. */
  lastWorkingDay?: string
}

export type PlanDateField = keyof PlanDates

export function planDates(plan: Plan, job: CurrentJob): PlanDates {
  const out: PlanDates = {}
  if (isIsoDate(job.joinDate)) out.joinDate = job.joinDate
  if (isIsoDate(plan.resignDate)) {
    out.resignDate = plan.resignDate
    const notice = job.noticePeriodDays
    if (typeof notice === 'number' && Number.isFinite(notice) && notice >= 1) {
      out.lastWorkingDay = lastWorkingDay(plan.resignDate, Math.round(notice))
    }
  }
  return out
}

/** The saved plan's dates, through the records' own loaders. */
export function loadPlanDates(): PlanDates {
  return planDates(loadPlan(), loadCurrentJob())
}

/** Which plan date lands in which draft field. */
export type PlanDateMap<D> = Partial<Record<PlanDateField, keyof D>>

/**
 * Seed a tool's draft from the plan. Seed-only, like the current-job record's
 * `seedOnly` fields: a tool with its own saved draft keeps every date the
 * person typed there, so the draft is returned untouched and nothing is marked
 * as coming from the plan.
 *
 * Returns the draft and the plan dates that were actually placed, so the tool
 * can say where they came from.
 */
export function seedFromPlan<D extends object>(
  draft: D,
  dates: PlanDates,
  map: PlanDateMap<D>,
  hasSavedDraft: boolean,
): { draft: D; seeded: PlanDates } {
  if (hasSavedDraft) return { draft, seeded: {} }
  const next = { ...draft }
  const seeded: PlanDates = {}
  for (const field of Object.keys(map) as PlanDateField[]) {
    const target = map[field]
    const value = dates[field]
    if (target === undefined || value === undefined) continue
    ;(next as Record<keyof D, unknown>)[target] = value
    seeded[field] = value
  }
  return { draft: next, seeded }
}

/**
 * The seeded dates the draft still holds. Once the person edits a date in the
 * tool it is theirs, and the "from your plan" line stops claiming it.
 */
export function stillFromPlan<D extends object>(draft: D, seeded: PlanDates, map: PlanDateMap<D>): PlanDates {
  const out: PlanDates = {}
  for (const field of Object.keys(seeded) as PlanDateField[]) {
    const target = map[field]
    if (target !== undefined && seeded[field] !== undefined && draft[target] === seeded[field]) {
      out[field] = seeded[field]
    }
  }
  return out
}
