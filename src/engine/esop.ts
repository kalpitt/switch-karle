import type { Regime } from './types'
import { computeTax } from './tax'

export interface EsopRealityInput {
  shares: number
  /** Per-share strike / exercise price. */
  strike: number
  /**
   * Per-share fair market value at exercise. For unlisted shares the number
   * that appears on Form 16 is a Rule-3 valuation, not the last funding round
   * and not the employee’s guess. CANDIDATE: Rule 3 / merchant-banker FMV.
   */
  fmv: number
  cliffMonths: number
  /** Total vest period from grant (months). */
  vestMonths: number
  liquid: boolean
  taxableIncomeWithoutPerq: number
  regime: Regime
}

export interface VestRow {
  month: number
  vestedShares: number
  stillCliffed: boolean
}

export interface EsopRealityResult {
  perquisitePerShare: number
  perquisiteTotal: number
  exerciseCost: number
  /** Marginal tax on the perquisite via computeTax difference. */
  taxOnPerq: number
  /** Cash you must find at exercise: strike × shares + tax on perquisite. */
  cashNeeded: number
  underwater: boolean
  vestTable: VestRow[]
  /** True when the grant is not liquid (post-exit exercise window caveat). */
  postExitWindowNote: boolean
}

function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

/**
 * Linear monthly vest: `shares × month / vestMonths` once the cliff has passed.
 * Common Indian letters vest annually (0 until the next anniversary). This
 * model is the monthly-vest reading; it is not a grant-letter parser.
 */
function vestedAtMonth(
  shares: number,
  cliffMonths: number,
  vestMonths: number,
  month: number,
): { vestedShares: number; stillCliffed: boolean } {
  const vestedShares =
    month < cliffMonths
      ? 0
      : vestMonths <= 0
        ? shares
        : Math.min(shares, shares * (month / vestMonths))
  return { vestedShares, stillCliffed: month < cliffMonths }
}

/**
 * ESOP exercise economics: perquisite at exercise, tax, vest schedule.
 *
 * CANDIDATE: perquisite (FMV−strike)×shares at exercise (s.17(2)(vi) recollection).
 * Stops at exercise — sale is a separate capital-gains event. Eligible-startup
 * TDS deferral (s.192(1C) recollection) is not modelled. Primary source pending CA R3.
 */
export function esopReality(input: EsopRealityInput): EsopRealityResult {
  const shares = clampNonNeg(input.shares)
  const strike = clampNonNeg(input.strike)
  const fmv = clampNonNeg(input.fmv)
  const cliffMonths = Math.round(clampNonNeg(input.cliffMonths))
  const vestMonths = Math.max(cliffMonths, Math.round(clampNonNeg(input.vestMonths)))
  const taxableIncomeWithoutPerq = clampNonNeg(input.taxableIncomeWithoutPerq)

  const perquisitePerShare = Math.max(0, fmv - strike)
  const perquisiteTotal = perquisitePerShare * shares
  const exerciseCost = strike * shares
  const underwater = fmv < strike && shares > 0

  const taxBefore = computeTax(taxableIncomeWithoutPerq, input.regime).totalTax
  const taxAfter = computeTax(taxableIncomeWithoutPerq + perquisiteTotal, input.regime).totalTax
  const taxOnPerq = taxAfter - taxBefore

  const boundaryMonths = [...new Set([0, cliffMonths, vestMonths])]
  const vestTable = boundaryMonths.map((month) => ({
    month,
    ...vestedAtMonth(shares, cliffMonths, vestMonths, month),
  }))

  return {
    perquisitePerShare,
    perquisiteTotal,
    exerciseCost,
    taxOnPerq,
    cashNeeded: exerciseCost + taxOnPerq,
    underwater,
    vestTable,
    postExitWindowNote: !input.liquid,
  }
}
