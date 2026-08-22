import { daysBetween, epfoDateOverlap } from './dates'

export interface InsuranceGapInput {
  lastWorkingDay: string
  newJoinDate: string
  hasPersonalCover: boolean
}

export interface InsuranceGapResult {
  /** Days strictly after LWD and before the new join date. 0 = next-day join. */
  uncoveredDays: number
  groupCoverEndsOn: string
  uncovered: boolean
  joinOverlapsLwd: boolean
  /** Factor ids for UI copy — no invented premium rupees. */
  factorIds: readonly string[]
}

const FACTORS = ['floater-waiting', 'pre-existing', 'age-band', 'city'] as const

/**
 * Group mediclaim typically ends on the last working day. This tool counts
 * the uncovered calendar days until the next employer’s cover starts.
 * It does not scrape insurer quotes.
 */
export function insuranceGap(input: InsuranceGapInput): InsuranceGapResult {
  const elapsed = daysBetween(input.lastWorkingDay, input.newJoinDate)
  const uncoveredDays = Math.max(0, elapsed - 1)
  const joinOverlapsLwd = epfoDateOverlap(input.lastWorkingDay, input.newJoinDate)
  const uncovered = uncoveredDays > 0 && !input.hasPersonalCover
  return {
    uncoveredDays,
    groupCoverEndsOn: input.lastWorkingDay,
    uncovered,
    joinOverlapsLwd,
    factorIds: FACTORS,
  }
}
