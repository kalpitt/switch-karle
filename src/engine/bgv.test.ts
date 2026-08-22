import { describe, expect, it } from 'vitest'
import { bgvPrep } from './bgv'

describe('bgvPrep', () => {
  it('a clean product-company switch is info-only', () => {
    const r = bgvPrep({ gapMonths: 0, dualPf: false, relievingPending: false, companyType: 'product' })
    expect(r.highRisk).toBe(false)
    expect(r.items.map((i) => i.id)).toEqual(['core-docs', 'type-product'])
  })

  it('6-month gap and dual PF are red; pending relieving is amber', () => {
    const r = bgvPrep({ gapMonths: 8, dualPf: true, relievingPending: true, companyType: 'gcc' })
    expect(r.highRisk).toBe(true)
    expect(r.items).toEqual([
      { id: 'core-docs', severity: 'info' },
      { id: 'employment-gap', severity: 'red' },
      { id: 'dual-pf', severity: 'red' },
      { id: 'relieving-pending', severity: 'amber' },
      { id: 'type-gcc', severity: 'info' },
    ])
  })

  it('a 3-month gap is amber, not red', () => {
    const r = bgvPrep({ gapMonths: 3, dualPf: false, relievingPending: false, companyType: 'startup' })
    expect(r.items.find((i) => i.id === 'employment-gap')?.severity).toBe('amber')
    expect(r.highRisk).toBe(false)
  })
})
