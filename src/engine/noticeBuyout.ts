export interface NoticeBuyoutInput {
  basis: 'basic' | 'gross'
  unservedDays: number
  /**
   * Accrued leave the employer agrees to set against unserved notice. Zero or
   * absent when they do not. CANDIDATE: whether leave may offset notice at all
   * is a matter of the appointment letter and company policy, never a statute.
   * 2026-11-28: the Delhi High Court held a request to adjust notice against
   * earned leave is only a request; leave cannot be "unilaterally substituted"
   * for unserved notice (Adarsh Kalhia v. WAPCOS, W.P.(C) 8328/2026, 31 Aug
   * 2026, https://indiankanoon.org/doc/53365697/).
   */
  leaveDaysApplied?: number
  monthlyBasic: number
  monthlyGross: number
  /** Employee pays to leave early vs employer recovers unserved notice from F&F. */
  mode: 'pay' | 'recover'
}

export interface NoticeBuyoutResult {
  dailyRate: number
  /** Payable after leave is set against the unserved days. */
  amount: number
  /** What the same quote costs with no leave applied. */
  amountBeforeLeave: number
  /** Leave days actually used — never more than the unserved days. */
  leaveDaysApplied: number
  /** Unserved days left once leave has been applied. */
  unservedDaysNet: number
  basis: 'basic' | 'gross'
  calendarDaysInMonth: 30
}

// CANDIDATE: buyout = (monthly basic|gross)/30 × unserved days. Contract governs; no statute mandates 30-day divisor.
// 2026-10-24: no statute found that fixes the basis or divisor for a white-collar notice buyout. The Code on Wages
// s.20(2) proviso allows a notice-in-lieu deduction only for ten or more employees absenting in concert (up to
// eight days' wages) — not an individual resignation. "Contract governs" stands.

const DAYS_IN_MONTH = 30 as const

function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

export function buyoutQuote(input: NoticeBuyoutInput): NoticeBuyoutResult {
  const unservedDays = clampNonNeg(input.unservedDays)
  const leaveDaysApplied = Math.min(unservedDays, clampNonNeg(input.leaveDaysApplied ?? 0))
  const unservedDaysNet = unservedDays - leaveDaysApplied
  const monthly =
    input.basis === 'basic' ? clampNonNeg(input.monthlyBasic) : clampNonNeg(input.monthlyGross)
  const dailyRate = monthly / DAYS_IN_MONTH

  return {
    dailyRate,
    amount: dailyRate * unservedDaysNet,
    amountBeforeLeave: dailyRate * unservedDays,
    leaveDaysApplied,
    unservedDaysNet,
    basis: input.basis,
    calendarDaysInMonth: DAYS_IN_MONTH,
  }
}
