const LAKH = 100_000
const CRORE = 10_000_000

/**
 * Parse a rupee field that accepts `12L`, `1.5Cr`, `12,00,000`, `₹1200000`,
 * or raw digits. Returns 0 for blank; `NaN` when the text is not an amount.
 */
export function parseINRInput(raw: string): number {
  const trimmed = raw.trim()
  if (trimmed === '') return 0

  let s = trimmed.replace(/₹/g, '').replace(/,/g, '').replace(/\s+/g, ' ').trim()

  let multiplier = 1
  const cr = /^(.*?)(?:\s*)(cr|crore)s?$/i.exec(s)
  if (cr) {
    s = cr[1].trim()
    multiplier = CRORE
  } else {
    const lakh = /^(.*?)(?:\s*)(l|lakh|lakhs)$/i.exec(s)
    if (lakh) {
      s = lakh[1].trim()
      multiplier = LAKH
    }
  }

  if (s === '') return Number.NaN
  const n = Number(s)
  if (!Number.isFinite(n) || n < 0) return Number.NaN
  return n * multiplier
}
