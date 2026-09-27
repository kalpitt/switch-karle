import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { en } from '../i18n/en'
import { hiSuite } from '../i18n/hi-suite'

const island = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fnf-checker/index.tsx'), 'utf8')

/**
 * Decided 2026-09-27 (Kalpit): with the work week unknown, the F&F checker
 * keeps the five-day reading, and says so wherever it changes the answer.
 */
describe('the F&F checker says when it assumed a five-day week', () => {
  it('shows the line only when the week is unknown and gratuity is flagged missing', () => {
    expect(island).toMatch(
      /workWeekDays === undefined && result != null && result\.gratuityNotOnSheet > 0 && \([\s\S]*?fnf-checker\.weekAssumed/,
    )
  })

  it('names the assumption and the six-day consequence, in both languages', () => {
    expect(en['fnf-checker.weekAssumed']).toMatch(/assumes a five-day week/)
    expect(en['fnf-checker.weekAssumed']).toMatch(/240 working days/)
    expect(hiSuite['fnf-checker.weekAssumed']).toMatch(/5-day week/)
  })
})
