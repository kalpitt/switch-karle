import type { Regime } from './types'
import { computeTax } from './tax'

/**
 * Joining-bonus clawback. Indian letters typically demand the **gross**
 * amount back if you leave before the clawback window, even though tax
 * already went to the government — you received net, you repay gross.
 *
 * Tax on receipt is the `computeTax` delta on the bonus against the
 * supplied taxable income (decoder's recommended-regime taxable), not an
 * invented TDS percentage. `effectiveRate` is taxOnBonus / amount so the
 * rebate zone cannot print "0%" next to a non-zero tax on the bonus.
 *
 * CANDIDATE / not a statute: the gross-repay convention is contractual
 * practice, not a section of the Income-tax Act. Whether the tax already
 * paid can be recovered (same-year revised Form 16, etc.) is fact-specific.
 * `noticeWouldCoverClawback` is cash-flow framing, not legal advice.
 */
export interface ClawbackInput {
  amount: number
  clawbackMonths: number
  plannedTenureMonths: number
  /** Taxable income *without* the bonus, recommended regime. */
  taxableIncome: number
  regime: Regime
  noticePeriodDays: number
}

export interface ClawbackPoint {
  exitMonth: number
  repayGross: number
  /** Net you kept from the bonus minus the gross you must return. */
  netIfExit: number
}

export interface ClawbackResult {
  taxOnBonus: number
  netReceived: number
  /** taxOnBonus / amount (0 if amount is 0). Not the pre-bonus marginal rupee. */
  effectiveRate: number
  curve: ClawbackPoint[]
  repaymentIfLeaveAtPlanned: number
  effectiveValueAtPlanned: number
  /**
   * Remaining clawback is shorter than notice: serving full notice from today
   * may land the last working day after the window. A buyout is the move that
   * can pull the exit back inside.
   */
  noticeWouldCoverClawback: boolean
}

function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

export function bonusClawback(input: ClawbackInput): ClawbackResult {
  const amount = clampNonNeg(input.amount)
  const clawbackMonths = Math.round(clampNonNeg(input.clawbackMonths))
  const plannedTenureMonths = Math.round(clampNonNeg(input.plannedTenureMonths))
  const taxableIncome = clampNonNeg(input.taxableIncome)
  const taxOnBonus =
    amount <= 0
      ? 0
      : computeTax(taxableIncome + amount, input.regime).totalTax -
        computeTax(taxableIncome, input.regime).totalTax
  const netReceived = amount - taxOnBonus
  const effectiveRate = amount > 0 ? taxOnBonus / amount : 0

  const curve: ClawbackPoint[] = []
  for (let m = 0; m <= clawbackMonths; m++) {
    const repayGross = m < clawbackMonths ? amount : 0
    curve.push({ exitMonth: m, repayGross, netIfExit: netReceived - repayGross })
  }

  const repaymentIfLeaveAtPlanned = plannedTenureMonths < clawbackMonths ? amount : 0
  const noticeMonths = clampNonNeg(input.noticePeriodDays) / 30
  const remaining = Math.max(0, clawbackMonths - plannedTenureMonths)
  const noticeWouldCoverClawback = remaining > 0 && remaining <= noticeMonths

  return {
    taxOnBonus,
    netReceived,
    effectiveRate,
    curve,
    repaymentIfLeaveAtPlanned,
    effectiveValueAtPlanned: netReceived - repaymentIfLeaveAtPlanned,
    noticeWouldCoverClawback,
  }
}
