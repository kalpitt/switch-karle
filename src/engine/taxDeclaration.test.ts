import { describe, expect, it } from 'vitest'
import { taxDeclaration } from './taxDeclaration'
import type { OfferInput } from './types'

const base: OfferInput = {
  ctcAnnual: 2_400_000,
  variableAnnual: 0,
  basicPercent: 40,
  hraPercentOfBasic: 50,
  employerPfInCtc: true,
  gratuityInCtc: false,
  pfOnFullBasic: true,
  noticePeriodDays: 90,
  state: 'KA',
}

describe('taxDeclaration', () => {
  it('new-regime 24L KA: HRA proofs are not useful even if the user claims them', () => {
    const r = taxDeclaration({
      offer: {
        ...base,
        old: { rentPaidMonthly: 50_000, metro: true, deduction80CExtra: 0, deduction80D: 0 },
      },
      claimingHra: true,
      extra80C: false,
    })
    expect(r.recommendedRegime).toBe('new')
    expect(r.hraExemptionAnnual).toBe(480_000)
    expect(r.hraUseful).toBe(false)
    expect(r.proofIds).not.toContain('hra')
    expect(r.proofIds).toContain('form12b')
    expect(r.proofIds).toContain('form16-prev')
    expect(r.proofIds).not.toContain('80d')
    expect(r.form16DelayNote).toBe(true)
  })

  it('omits HRA proofs when the user is not claiming HRA', () => {
    const r = taxDeclaration({
      offer: {
        ...base,
        old: { rentPaidMonthly: 50_000, metro: true, deduction80CExtra: 0, deduction80D: 0 },
      },
      claimingHra: false,
      extra80C: false,
    })
    expect(r.proofIds).not.toContain('hra')
  })

  it('lists 80D proofs only when 80D is on the offer', () => {
    const none = taxDeclaration({ offer: base, claimingHra: false, extra80C: false })
    const some = taxDeclaration({
      offer: { ...base, old: { rentPaidMonthly: 0, metro: false, deduction80CExtra: 0, deduction80D: 25_000 } },
      claimingHra: false,
      extra80C: false,
    })
    expect(none.proofIds).not.toContain('80d')
    expect(some.proofIds).toContain('80d')
  })

  it('includes 80C proof only when extra 80C is on', () => {
    const off = taxDeclaration({ offer: base, claimingHra: false, extra80C: false })
    const on = taxDeclaration({ offer: base, claimingHra: false, extra80C: true })
    expect(off.proofIds).not.toContain('80c')
    expect(on.proofIds).toContain('80c')
  })
})
