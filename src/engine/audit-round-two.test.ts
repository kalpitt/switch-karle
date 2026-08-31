import { describe, expect, it } from 'vitest'
import { decodeOffer } from './salary'
import { DEFAULT_OFFER } from '../data/defaults'

describe('an empty CTC field does not produce a negative in-hand', () => {
  // Professional tax was subtracted whether or not there was salary to tax, so
  // clearing the CTC field in the Decoder showed "-₹200/month in hand".
  it('zero CTC gives zero in hand, not minus the professional tax', () => {
    expect(decodeOffer({ ...DEFAULT_OFFER, ctcAnnual: 0, variableAnnual: 0 }).inHandMonthly).toBe(0)
  })

  it('holds in a state with a different professional tax', () => {
    expect(
      decodeOffer({ ...DEFAULT_OFFER, ctcAnnual: 0, variableAnnual: 0, state: 'MH' }).inHandMonthly,
    ).toBe(0)
  })

  it('a real salary still pays professional tax', () => {
    const withPt = decodeOffer({ ...DEFAULT_OFFER, ctcAnnual: 2_400_000 })
    const noState = decodeOffer({ ...DEFAULT_OFFER, ctcAnnual: 2_400_000, state: 'MH' })
    expect(withPt.inHandMonthly).toBeGreaterThan(0)
    expect(noState.inHandMonthly).toBeGreaterThan(0)
  })
})
