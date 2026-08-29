export interface NoticeBuyoutInput {
  basis: 'basic' | 'gross'
  unservedDays: number
  /**
   * Accrued leave the employer agrees to set against unserved notice. Zero or
   * absent when they do not. CANDIDATE: whether leave may offset notice at all
   * is a matter of the appointment letter and company policy, never a statute.
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

// CANDIDATE: buyout = (monthly basic|gross)/30 × unserved days. Contract governs; no statute mandates 30-day divisor. Not verified this session.

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
