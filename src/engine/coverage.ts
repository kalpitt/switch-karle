import { addDays, daysBetween } from "./dates"

/** One sweep, as it happened. Dates are ISO yyyy-mm-dd. */
export interface SweepRecord {
  sweptAt: string
  /** How many days back that sweep's prompt reached. */
  windowDays: number
  /** How many applications the user actually added from it. */
  added: number
}

export interface CoverageState {
  status: "never" | "swept"
  lastSweptAt: string | null
  /** The earliest day the most recent sweep could have seen. */
  coveredFrom: string | null
  /** Days from the last sweep to `today`. Applications sent in this span are unswept. */
  gapDays: number
  /** True once the gap is wide enough that the board is likely behind. */
  stale: boolean
  sweepCount: number
  totalAdded: number
}

export interface CoverageOptions {
  /** ISO yyyy-mm-dd. Required — the engine has no clock. */
  today: string
  /**
   * Days after which the board is called stale. Default 14: an active search
   * produces applications weekly, so a fortnight is long enough that "nothing
   * new" stops being a safe assumption.
   */
  staleAfterDays?: number
}

export function coverageState(records: SweepRecord[], options: CoverageOptions): CoverageState {
  if (records.length === 0) {
    return {
      status: "never",
      lastSweptAt: null,
      coveredFrom: null,
      gapDays: 0,
      stale: false,
      sweepCount: 0,
      totalAdded: 0,
    }
  }

  let latest = records[0]
  let totalAdded = 0

  for (const record of records) {
    totalAdded += record.added
    // `>=`, not `>`. Two sweeps on one day and a strict comparison keeps the
    // first, so a second, narrower sweep would leave the board claiming the
    // wider reach-back of the earlier one. The ledger must never overstate.
    if (record.sweptAt >= latest.sweptAt) {
      latest = record
    }
  }

  const gapDays = Math.max(0, daysBetween(latest.sweptAt, options.today))
  const staleThreshold = options.staleAfterDays ?? 14
  const stale = gapDays > staleThreshold

  return {
    status: "swept",
    lastSweptAt: latest.sweptAt,
    coveredFrom: addDays(latest.sweptAt, -latest.windowDays),
    gapDays,
    stale,
    sweepCount: records.length,
    totalAdded,
  }
}
