import { describe, expect, it } from 'vitest'
import { formatDateRange } from './formatDate'

describe('formatDateRange', () => {
  it('prints the year once when both dates share it', () => {
    expect(formatDateRange('2026-07-20', '2026-09-28')).toMatch(/^20 Jul – 28 Sept? 2026$/) // en-IN prints Sept in current ICU
  })
  it('keeps both years when they differ', () => {
    expect(formatDateRange('2025-12-30', '2026-01-02')).toBe('30 Dec 2025 – 2 Jan 2026')
  })
  it('prints one date for a span of one day', () => {
    expect(formatDateRange('2026-10-24', '2026-10-24')).toBe('24 Oct 2026')
  })
  it('uses Devanagari month names in Hindi', () => {
    expect(formatDateRange('2026-07-20', '2026-09-28', 'hi')).toMatch(/^20 जुल.* – 28 सित.* 2026$/)
  })
})
