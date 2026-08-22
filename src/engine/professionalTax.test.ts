import { describe, expect, it } from 'vitest'
import { PROFESSIONAL_TAX_ANNUAL, PROFESSIONAL_TAX_CEILING } from './professionalTax'

describe('professional tax table', () => {
  it.each(Object.entries(PROFESSIONAL_TAX_ANNUAL))('%s is within ₹0–₹2,500', (_state, amount) => {
    expect(amount).toBeGreaterThanOrEqual(0)
    expect(amount).toBeLessThanOrEqual(PROFESSIONAL_TAX_CEILING)
  })

  it('other is 0 (approximate — unlisted states that levy PT are missing)', () => {
    expect(PROFESSIONAL_TAX_ANNUAL.other).toBe(0)
  })
})
