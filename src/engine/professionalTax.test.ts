import { describe, expect, it } from 'vitest'
import { PROFESSIONAL_TAX_ANNUAL, PROFESSIONAL_TAX_CEILING, PT_AMOUNT_UNVERIFIED } from './professionalTax'

describe('professional tax table', () => {
  it.each(Object.entries(PROFESSIONAL_TAX_ANNUAL))('%s is within ₹0–₹2,500', (_state, amount) => {
    expect(amount).toBeGreaterThanOrEqual(0)
    expect(amount).toBeLessThanOrEqual(PROFESSIONAL_TAX_CEILING)
  })

  it('unverified levy states are 0 so we do not invent a schedule', () => {
    for (const state of PT_AMOUNT_UNVERIFIED) {
      expect(PROFESSIONAL_TAX_ANNUAL[state]).toBe(0)
    }
  })

  it('Punjab levies State Development Tax at ₹2,400 and is verified, not unverified', () => {
    expect(PROFESSIONAL_TAX_ANNUAL.PB).toBe(2_400)
    expect(PT_AMOUNT_UNVERIFIED).not.toContain('PB')
  })
})
