import type { OfferInput, Regime, SalaryBreakdown } from './types'
import { decodeOffer } from './salary'
import { computeTax } from './tax'

/**
 * Paper CTC hike vs in-hand hike. Joining bonus is a one-off and is excluded
 * from both run-rates (`decodeOffer` never folds it into monthly in-hand;
 * we also refuse to add it to CTC). Variable is optional: pass a payout
 * fraction (the UI's "if variable pays 70%" toggle) so at-risk pay can
 * enter the in-hand run-rate after tax.
 *
 * Tax on the variable slice is `computeTax(taxable + variable) − computeTax(taxable)`
 * under the recommended regime — the same engine as the decoder.
 */
export interface HikeInput {
  current: OfferInput
  next: OfferInput
  /** 0–1. Fraction of quoted variable assumed to pay. 1 = quoted; 0.7 = haircut. */
  variablePayout: number
}

export interface HikeResult {
  ctcHikePct: number
  inHandHikePct: number
  currentCtc: number
  nextCtc: number
  currentRunRateMonthly: number
  nextRunRateMonthly: number
  currentRegime: Regime
  nextRegime: Regime
  regimeFlip: boolean
  joiningBonusExcluded: boolean
  haircutApplied: boolean
}

function clampPayout(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

function taxableOf(b: SalaryBreakdown, regime: Regime): number {
  return regime === 'new' ? b.newRegime.taxableIncome : b.oldRegime.taxableIncome
}

function taxOf(b: SalaryBreakdown, regime: Regime): number {
  return regime === 'new' ? b.newRegime.totalTax : b.oldRegime.totalTax
}

function runRateMonthly(offer: OfferInput, payout: number): { monthly: number; regime: Regime } {
  const b = decodeOffer(offer)
  const regime = b.recommendedRegime
  const extraVar = Math.max(0, offer.variableAnnual) * payout
  if (extraVar <= 0) return { monthly: b.inHandMonthly, regime }
  const extraTax =
    computeTax(taxableOf(b, regime) + extraVar, regime).totalTax - taxOf(b, regime)
  return { monthly: Math.round(b.inHandMonthly + (extraVar - extraTax) / 12), regime }
}

export function realHike(input: HikeInput): HikeResult {
  const payout = clampPayout(input.variablePayout)
  const currentCtc = Math.max(0, input.current.ctcAnnual)
  const nextCtc = Math.max(0, input.next.ctcAnnual)
  const cur = runRateMonthly(input.current, payout)
  const nxt = runRateMonthly(input.next, payout)
  const ctcHikePct = currentCtc === 0 ? 0 : ((nextCtc - currentCtc) / currentCtc) * 100
  const inHandHikePct =
    cur.monthly === 0 ? 0 : ((nxt.monthly - cur.monthly) / cur.monthly) * 100
  const hasVariable = input.current.variableAnnual > 0 || input.next.variableAnnual > 0
  return {
    ctcHikePct,
    inHandHikePct,
    currentCtc,
    nextCtc,
    currentRunRateMonthly: cur.monthly,
    nextRunRateMonthly: nxt.monthly,
    currentRegime: cur.regime,
    nextRegime: nxt.regime,
    regimeFlip: cur.regime !== nxt.regime,
    joiningBonusExcluded:
      (input.current.joiningBonus?.amount ?? 0) > 0 || (input.next.joiningBonus?.amount ?? 0) > 0,
    haircutApplied: payout < 1 && hasVariable,
  }
}
