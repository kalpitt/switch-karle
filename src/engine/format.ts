const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** ₹12,34,567 — Indian lakh/crore digit grouping, no decimals. */
export function formatINR(amount: number): string {
  return `₹${inr.format(Math.round(amount))}`
}

/** Compact Indian units: ₹1.2Cr, ₹24L, ₹80k. */
export function formatCompact(amount: number): string {
  const abs = Math.abs(amount)
  if (abs >= 1_00_00_000) return `₹${trim(amount / 1_00_00_000)}Cr`
  if (abs >= 1_00_000) return `₹${trim(amount / 1_00_000)}L`
  if (abs >= 1_000) return `₹${trim(amount / 1_000)}k`
  return formatINR(amount)
}

/** "24 LPA" style for CTC figures. */
export function formatLPA(annual: number): string {
  return `${trim(annual / 1_00_000)} LPA`
}

function trim(n: number): string {
  const rounded = Math.round(n * 10) / 10
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1)
}
