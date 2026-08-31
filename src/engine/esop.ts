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
  /**
   * How the grant letter actually vests. `monthly` is straight-line; `annual`
   * releases one equal tranche at the cliff and one on each anniversary after
   * it, which is what most Indian letters say. Defaults to `monthly` — the
   * reading this model had before the option existed.
   */
  vestCadence?: VestCadence
  liquid: boolean
  taxableIncomeWithoutPerq: number
  regime: Regime
}

export type VestCadence = 'monthly' | 'annual'

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

/** Equal annual tranches over the vest period; at least one. */
function trancheCount(vestMonths: number): number {
  return Math.max(1, Math.round(vestMonths / 12))
}

/**
 * Shares vested at `month`. `monthly` is straight-line `shares × month /
 * vestMonths` once the cliff passes.
 *
 * `annual` steps: equal tranches land on each anniversary of the grant, and
 * nothing is released until the cliff passes, at which point everything accrued
 * so far is released at once. Nothing accrues between two anniversaries however
 * long you stayed.
 *
 * The tranches count from the grant, not from the cliff. Counting from the
 * cliff silently lost one tranche on any cliff other than twelve months: a
 * 24-month cliff on a 48-month grant finished at 750 of 1000 shares, and a
 * 6-month cliff skipped the real anniversaries entirely. It was right for the
 * common one-year cliff, which is why nothing caught it.
 *
 * Neither reading parses your grant letter — it is the letter that decides.
 */
function vestedAtMonth(
  shares: number,
  cliffMonths: number,
  vestMonths: number,
  month: number,
  cadence: VestCadence,
): { vestedShares: number; stillCliffed: boolean } {
  const stillCliffed = month < cliffMonths
  if (stillCliffed) return { vestedShares: 0, stillCliffed }
  if (vestMonths <= 0) return { vestedShares: shares, stillCliffed }
  if (cadence === 'annual') {
    const tranches = trancheCount(vestMonths)
    const landed = Math.floor(month / 12)
    const vested = Math.min(tranches, Math.max(0, landed))
    return { vestedShares: Math.min(shares, (shares * vested) / tranches), stillCliffed }
  }
  return { vestedShares: Math.min(shares, shares * (month / vestMonths)), stillCliffed }
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

  const cadence: VestCadence = input.vestCadence ?? 'monthly'
  const anniversaries: number[] = []
  if (cadence === 'annual') {
    for (let m = Math.max(cliffMonths, 12); m < vestMonths; m += 12) anniversaries.push(m)
  }
  const boundaryMonths = [...new Set([0, cliffMonths, ...anniversaries, vestMonths])].sort((a, b) => a - b)
  const vestTable = boundaryMonths.map((month) => ({
    month,
    ...vestedAtMonth(shares, cliffMonths, vestMonths, month, cadence),
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
