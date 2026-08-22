import { describe, expect, it } from 'vitest'
import { compareOffers } from './compare'
import type { OfferInput } from './types'

const base: OfferInput = {
  ctcAnnual: 2_400_000,
  variableAnnual: 0,
  basicPercent: 40,
  hraPercentOfBasic: 50,
  employerPfInCtc: true,
  gratuityInCtc: false,
  pfOnFullBasic: true,
  noticePeriodDays: 60,
  state: 'KA',
}

describe('compareOffers', () => {
  it('picks the higher in-hand when CTC stuffing differs', () => {
    const stuffed: OfferInput = { ...base, gratuityInCtc: true }
    const r = compareOffers([base, stuffed])
    expect(r.breakdowns).toHaveLength(2)
    expect(r.verdictIndex).toBe(0)
    expect(r.breakdowns[0]!.inHandMonthly).toBeGreaterThan(r.breakdowns[1]!.inHandMonthly)
    expect(r.flags.asymmetricGratuity).toBe(true)
  })

  it('does not let paper ESOP swing the verdict', () => {
    const withPaper: OfferInput = {
      ...base,
      ctcAnnual: 2_900_000,
      esop: { annualValue: 500_000, cliffMonths: 12, liquid: false },
    }
    const r = compareOffers([base, withPaper])
    expect(r.flags.esopZeroed).toBe(true)
    expect(r.verdictIndex).toBeNull()
    expect(r.forVerdict[0]!.inHandMonthly).toBe(r.forVerdict[1]!.inHandMonthly)
  })

  it('flags different PF-ceiling choices', () => {
    const capped: OfferInput = { ...base, pfOnFullBasic: false }
    const r = compareOffers([base, capped])
    expect(r.flags.asymmetricPfCeiling).toBe(true)
  })

  it('state PT shows up in in-hand (KA ₹2,400 vs MH ₹2,500)', () => {
    const mh: OfferInput = { ...base, state: 'MH' }
    const r = compareOffers([base, mh])
    expect(r.breakdowns[0]!.professionalTaxAnnual).toBe(2_400)
    expect(r.breakdowns[1]!.professionalTaxAnnual).toBe(2_500)
    expect(r.verdictIndex).toBe(0)
  })

  it('accepts three offers and can tie', () => {
    const r = compareOffers([base, { ...base, ctcAnnual: 2_400_000 }, { ...base, ctcAnnual: 2_400_000 }])
    expect(r.breakdowns).toHaveLength(3)
    expect(r.verdictIndex).toBeNull()
  })
})
