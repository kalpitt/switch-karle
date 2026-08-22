export interface NoticeBuyoutInput {
  basis: 'basic' | 'gross'
  unservedDays: number
  monthlyBasic: number
  monthlyGross: number
  /** Employee pays to leave early vs employer recovers unserved notice from F&F. */
  mode: 'pay' | 'recover'
}

export interface NoticeBuyoutResult {
  dailyRate: number
  amount: number
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
  const monthly =
    input.basis === 'basic' ? clampNonNeg(input.monthlyBasic) : clampNonNeg(input.monthlyGross)
  const dailyRate = monthly / DAYS_IN_MONTH
  const amount = dailyRate * unservedDays

  return {
    dailyRate,
    amount,
    basis: input.basis,
    calendarDaysInMonth: DAYS_IN_MONTH,
  }
}
