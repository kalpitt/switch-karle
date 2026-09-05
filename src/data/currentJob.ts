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
}

const FIELDS = ['monthlyBasic', 'monthlyBasicDA', 'monthlyGross', 'noticePeriodDays'] as const

function read(): CurrentJob {
  const raw = readJson<unknown>(CURRENT_JOB_STORAGE_KEY, null)
  // This record never echoes on mount: it is written only from a keystroke in
  // some tool. Without the release, the boot-echo skip armed by the read above
  // would swallow the user's first-ever entry — the same failure the decoder
  // had when seeded from a tracker card.
  releaseBootEcho(CURRENT_JOB_STORAGE_KEY)
  return sanitise(raw)
}

/** Keep only the known fields, and only finite positive numbers. */
function sanitise(raw: unknown): CurrentJob {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: CurrentJob = {}
  for (const field of FIELDS) {
    const v = (raw as Record<string, unknown>)[field]
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[field] = v
  }
  return out
}

export function loadCurrentJob(): CurrentJob {
  return read()
}

/**
 * Merge what the user just typed into the record. A field the patch leaves
 * undefined, or sets to zero / NaN, is not a value — the field already stored
 * is kept, so a cleared input never blanks the number every other tool relies on.
 */
export function rememberCurrentJob(patch: Partial<CurrentJob>): void {
  const next = { ...read(), ...sanitise(patch) }
  writeJson(CURRENT_JOB_STORAGE_KEY, next)
}

/**
 * Overlay the record on a tool's draft: every field the record holds replaces
 * the draft's, everything else is untouched. `pick` names which draft field
 * each record field lands in.
 */
export function applyCurrentJob<D extends object>(
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
