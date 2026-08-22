import type { Regime } from './types'
import { taxTotalUnrounded } from './tax'

/**
 * Extra tax on the next rupee of taxable income, using the same unrounded
 * total `computeTax` rounds. Includes cess (and surcharge when it applies).
 * Rebate-zone incomes return 0.
 */
export function marginalRate(taxable: number, regime: Regime): number {
  const x = Number.isFinite(taxable) ? Math.max(0, taxable) : 0
  return taxTotalUnrounded(x + 1, regime) - taxTotalUnrounded(x, regime)
}
