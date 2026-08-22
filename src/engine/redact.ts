export type RedactKind = 'aadhaar' | 'pan' | 'email' | 'phone' | 'ifsc' | 'rupee'

export interface RedactHit {
  kind: RedactKind
  count: number
}

export interface RedactResult {
  redacted: string
  hits: RedactHit[]
}

const PATTERNS: { kind: RedactKind; re: RegExp; mask: string }[] = [
  { kind: 'aadhaar', re: /\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b/g, mask: 'XXXX XXXX XXXX' },
  { kind: 'pan', re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, mask: 'XXXXX0000X' },
  { kind: 'email', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, mask: '[email]' },
  { kind: 'ifsc', re: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g, mask: 'XXXX0XXXXXX' },
  { kind: 'phone', re: /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g, mask: '[phone]' },
  { kind: 'rupee', re: /(?:₹|Rs\.?\s?)\s?[\d,]+(?:\.\d+)?/gi, mask: '₹[amount]' },
]

/**
 * Mask identity and rupee figures in pasted payslip / offer text.
 * Runs on-device. Not a legal redaction standard — a sharing helper.
 */
export function redactText(input: string): RedactResult {
  let redacted = input
  const hits: RedactHit[] = []
  for (const p of PATTERNS) {
    const matches = redacted.match(p.re)
    const count = matches?.length ?? 0
    if (count > 0) {
      redacted = redacted.replace(p.re, p.mask)
      hits.push({ kind: p.kind, count })
    }
  }
  return { redacted, hits }
}
