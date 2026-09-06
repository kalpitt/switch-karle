import { isIsoDate } from '../engine/dates'
import { readJson, releaseBootEcho, writeJson } from '../lib/storage'

/**
 * The user's current job — one record, separate from the new offer.
 *
 * A notice buyout is owed to the current employer out of current pay. Gratuity,
 * leave encashment and F&F are all computed on current pay. Until 2026-09-05
 * three of those tools seeded themselves from the Decoder — the NEW offer — so
 * decoding a 30 LPA offer inflated the notice buyout. Decided by Kalpit: the
 * current job gets its own home rather than the wrong seed being dropped or the
 * Decoder being extended. See docs/DECISIONS.md.
 *
 * Every field is optional: absent means the user has never typed it anywhere.
 * A tool fills its field from here on boot and writes the field back on the
 * user's keystroke, so the record always holds the latest value typed in any
 * tool. Nothing is written by a tool merely opening.
 */
export const CURRENT_JOB_STORAGE_KEY = 'switchkarle.current-job.v1' as const

export interface CurrentJob {
  /** Plain monthly basic — notice-buyout, leave-encashment, fnf-checker. */
  monthlyBasic?: number
  /**
   * Monthly basic + dearness allowance — gratuity, whose engine carries the verified source. Kept apart
   * from `monthlyBasic` on purpose and never cross-seeded: one shared "basic"
   * would hand a wrong number to anyone with a DA component.
   */
  monthlyBasicDA?: number
  /** Monthly cash gross at the current employer. */
  monthlyGross?: number
  /** Contractual notice period at the current employer, in days. */
  noticePeriodDays?: number
  /**
   * The day the user joined the current employer, ISO `YYYY-MM-DD`. Gratuity,
   * the F&F checker and the EPF transfer tool each still keep their own copy;
   * moving them onto this one is Phase 1. Until then the record's standing rule
   * holds the line: the latest value typed anywhere wins.
   */
  joinDate?: string
  /**
   * 5 or 6. The gratuity fast path is four years and 190 days on a five-day
   * week, 240 on a six-day week — seven weeks apart for a January 2022 joiner.
   * Asked on screen two as a fork, never defaulted into a cliff of its own.
   */
  workWeekDays?: 5 | 6
  /**
   * Whether the Payment of Gratuity Act reaches this employer, which turns on
   * the ten-employee threshold. Asked, not assumed — and `false` is the answer
   * that changes the screen, so it has to survive `sanitise`.
   */
  coveredByAct?: boolean
}

/**
 * Adding an optional field here is backward compatible and needs no key version
 * bump: an old record simply lacks it, and `sanitise` already drops anything it
 * does not know. A version bump is for a field that changes meaning or shape.
 */
const FIELDS = [
  'monthlyBasic',
  'monthlyBasicDA',
  'monthlyGross',
  'noticePeriodDays',
  'joinDate',
  'workWeekDays',
  'coveredByAct',
] as const

function positiveNumber(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v > 0
}

/**
 * What each field has to look like to be kept. Per-field, and it has to be:
 * the single "finite number above zero" test this replaced silently dropped an
 * ISO join date for being a string, and `coveredByAct: false` for being falsy.
 */
const VALID: Record<(typeof FIELDS)[number], (v: unknown) => boolean> = {
  monthlyBasic: positiveNumber,
  monthlyBasicDA: positiveNumber,
  monthlyGross: positiveNumber,
  noticePeriodDays: positiveNumber,
  joinDate: isIsoDate,
  workWeekDays: (v) => v === 5 || v === 6,
  coveredByAct: (v) => typeof v === 'boolean',
}

/** Keep only the known fields, and only values that pass that field's own test. */
function sanitise(raw: unknown): CurrentJob {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Record<string, unknown> = {}
  for (const field of FIELDS) {
    const v = (raw as Record<string, unknown>)[field]
    if (VALID[field](v)) out[field] = v
  }
  return out as CurrentJob
}

export function loadCurrentJob(): CurrentJob {
  const raw = readJson<unknown>(CURRENT_JOB_STORAGE_KEY, null)
  // This record never echoes on mount: it is written only from a keystroke in
  // some tool. Without the release, the boot-echo skip armed by the read above
  // would swallow the user's first-ever entry — the same failure the decoder
  // had when seeded from a tracker card.
  releaseBootEcho(CURRENT_JOB_STORAGE_KEY)
  return sanitise(raw)
}

/**
 * Merge what the user just typed into the record. A field the patch leaves
 * undefined, or sets to a value its own test rejects — zero, NaN, `2022-02-30`,
 * a seven-day week — is not a value, so the field already stored is kept and a
 * cleared input never blanks the number every other tool relies on. A `false`
 * for `coveredByAct` is a value and does overwrite.
 */
export function rememberCurrentJob(patch: Partial<CurrentJob>): void {
  const next = { ...loadCurrentJob(), ...sanitise(patch) }
  writeJson(CURRENT_JOB_STORAGE_KEY, next)
}

/**
 * Overlay the record on a tool's draft: every field the record holds replaces
 * the draft's, everything else is untouched. `pick` names which draft field
 * each record field lands in. Module-private: tools go through
 * `fillFromCurrentJob`, which is the one that knows about seed-only fields.
 */
function applyCurrentJob<D extends object>(
  draft: D,
  job: CurrentJob,
  pick: Partial<Record<keyof CurrentJob, keyof D>>,
): D {
  const next = { ...draft }
  for (const field of FIELDS) {
    const target = pick[field]
    const value = job[field]
    if (target !== undefined && value !== undefined) {
      ;(next as Record<keyof D, unknown>)[target] = value
    }
  }
  return next
}

/**
 * Fill a tool's draft from the record. Two kinds of field, and the difference
 * is not cosmetic — getting it wrong destroys what the user typed.
 *
 * `shared`: the tool also writes this field back on every keystroke, so the
 * record always holds the latest value typed anywhere, this tool included.
 * Overlaying it on a saved draft is how "type it once" works.
 *
 * `seedOnly`: the tool never writes this field back, because in this tool the
 * field means something else — `notice-buyout`'s unserved days is what is left
 * after negotiating, not the contractual notice period; `fnf-checker`'s gross
 * is what the settlement sheet *claims*, which is the thing being audited. The
 * record therefore never learns what the user typed here, so overlaying it on a
 * saved draft would put back a number the user had already replaced, on every
 * single visit. These fill a fresh draft only.
 */
export function fillFromCurrentJob<D extends object>(
  draft: D,
  job: CurrentJob,
  maps: {
    shared?: Partial<Record<keyof CurrentJob, keyof D>>
    seedOnly?: Partial<Record<keyof CurrentJob, keyof D>>
  },
  hasSavedDraft: boolean,
): D {
  const withShared = applyCurrentJob(draft, job, maps.shared ?? {})
  if (hasSavedDraft) return withShared
  return applyCurrentJob(withShared, job, maps.seedOnly ?? {})
}
