import { describe, expect, it } from 'vitest'
import { marginalRate } from './marginal'

describe('marginalRate — extracted from computeTax', () => {
  it('rebate-zone new-regime income has a 0 marginal rate', () => {
    expect(marginalRate(1_000_000, 'new')).toBe(0)
  })

  it('a 20% new-regime slab interior is 20% plus 4% cess', () => {
    // ₹18L sits in the ₹16–20L 20% slab, well above rebate marginal-relief.
    expect(marginalRate(1_800_000, 'new')).toBeCloseTo(0.20 * 1.04, 10)
  })

  it('old-regime rebate zone is 0; 20% slab interior is 20% plus cess', () => {
    expect(marginalRate(400_000, 'old')).toBe(0)
    expect(marginalRate(750_000, 'old')).toBeCloseTo(0.20 * 1.04, 10)
  })
})
