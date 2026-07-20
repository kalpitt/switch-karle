import type { Regime, TaxBreakdown } from './types'

/**
 * Income-tax computation for FY 2026-27 (AY 2027-28).
 *
 * Sources (verified 2026-07-20):
 * - Budget 2026 made NO changes to slab rates, rebate, surcharge or cess;
 *   FY 2025-26 structure carries forward.
 * - New regime rebate is now s.157 of the Income-tax Act 2026 (the renumbered
 *   s.87A): max ₹60,000, zero tax up to ₹12L taxable income, with marginal
 *   relief just above ₹12L.
 * - Standard deduction on salary: ₹75,000 (new) / ₹50,000 (old).
 */

interface Slab { upTo: number; rate: number }

const NEW_REGIME_SLABS: Slab[] = [
  { upTo: 400_000, rate: 0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.10 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.20 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.30 },
]

const OLD_REGIME_SLABS: Slab[] = [
  { upTo: 250_000, rate: 0 },
  { upTo: 500_000, rate: 0.05 },
  { upTo: 1_000_000, rate: 0.20 },
  { upTo: Infinity, rate: 0.30 },
]

export const STANDARD_DEDUCTION: Record<Regime, number> = {
  new: 75_000,
  old: 50_000,
}

function slabTax(taxable: number, slabs: Slab[]): number {
  let tax = 0
  let lower = 0
  for (const { upTo, rate } of slabs) {
    if (taxable <= lower) break
    tax += (Math.min(taxable, upTo) - lower) * rate
    lower = upTo
  }
  return tax
}

/** Surcharge on (tax after rebate). New regime caps at 25%; old goes to 37%. */
function surchargeRate(taxable: number, regime: Regime): number {
  if (taxable > 50_000_000) return regime === 'new' ? 0.25 : 0.37
  if (taxable > 20_000_000) return 0.25
  if (taxable > 10_000_000) return 0.15
  if (taxable > 5_000_000) return 0.10
  return 0
}

/** Marginal relief for surcharge: total tax must not exceed tax at the threshold plus income above it. */
function surchargeWithMarginalRelief(taxable: number, tax: number, regime: Regime): number {
  const rate = surchargeRate(taxable, regime)
  if (rate === 0) return 0
  const thresholds = [50_000_000, 20_000_000, 10_000_000, 5_000_000]
  const threshold = thresholds.find((t) => taxable > t)!
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS
  const taxAtThreshold = slabTax(threshold, slabs)
  const surchargeAtThreshold = taxAtThreshold * surchargeRate(threshold, regime)
  const uncapped = tax * rate
  const capped = taxAtThreshold + surchargeAtThreshold + (taxable - threshold) - tax
  return Math.max(0, Math.min(uncapped, capped))
}

/**
 * Full tax on a taxable income (i.e. AFTER standard deduction and all
 * applicable deductions/exemptions have been subtracted by the caller).
 */
export function computeTax(taxable: number, regime: Regime): TaxBreakdown {
  const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS
  const gross = slabTax(taxable, slabs)

  let rebate = 0
  if (regime === 'new' && taxable <= 1_200_000) {
    rebate = Math.min(gross, 60_000)
  } else if (regime === 'new' && taxable > 1_200_000) {
    // Marginal relief u/s 157: pay no more than the income above ₹12L.
    const excess = taxable - 1_200_000
    if (gross > excess) rebate = gross - excess
  } else if (regime === 'old' && taxable <= 500_000) {
    rebate = Math.min(gross, 12_500)
  }

  const afterRebate = gross - rebate
  const surcharge = surchargeWithMarginalRelief(taxable, afterRebate, regime)
  const cess = (afterRebate + surcharge) * 0.04
  const totalTax = Math.round(afterRebate + surcharge + cess)

  return {
    regime,
    taxableIncome: taxable,
    slabTax: Math.round(gross),
    rebate: Math.round(rebate),
    surcharge: Math.round(surcharge),
    cess: Math.round(cess),
    totalTax,
  }
}
