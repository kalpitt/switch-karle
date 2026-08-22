import type { Regime } from './types'
import { computeTax } from './tax'

export interface EsopRealityInput {
  shares: number
  /** Per-share strike / exercise price. */
  strike: number
  /** Per-share fair market value at exercise. */
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
  vestTable: VestRow[]
  /** True when the grant is not liquid (post-exit exercise window caveat). */
  postExitWindowNote: boolean
}

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
 * ESOP exercise economics: perquisite at exercise, marginal tax, vest schedule.
 */
export function esopReality(input: EsopRealityInput): EsopRealityResult {
  // CANDIDATE: ESOP perquisite (FMV−strike)×shares at exercise. Primary source pending CA R3. Not verified this session.
  const perquisitePerShare = Math.max(0, input.fmv - input.strike)
  const perquisiteTotal = perquisitePerShare * input.shares
  const exerciseCost = input.strike * input.shares

  const taxBefore = computeTax(input.taxableIncomeWithoutPerq, input.regime).totalTax
  const taxAfter = computeTax(
    input.taxableIncomeWithoutPerq + perquisiteTotal,
    input.regime,
  ).totalTax
  const taxOnPerq = taxAfter - taxBefore

  const boundaryMonths = [0, input.cliffMonths, input.vestMonths]
  const vestTable = boundaryMonths.map((month) => ({
    month,
    ...vestedAtMonth(
      input.shares,
      input.cliffMonths,
      input.vestMonths,
      month,
    ),
  }))

  return {
    perquisitePerShare,
    perquisiteTotal,
    exerciseCost,
    taxOnPerq,
    vestTable,
    postExitWindowNote: !input.liquid,
  }
}
