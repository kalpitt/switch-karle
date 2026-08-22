import { describe, expect, it } from 'vitest'
import { scanBondClause } from './bondScan'

describe('scanBondClause', () => {
  it('empty text is clean', () => {
    expect(scanBondClause('')).toEqual([])
    expect(scanBondClause('   ')).toEqual([])
  })

  it('flags original-certificate retention', () => {
    const flags = scanBondClause(
      'You shall deposit original degree certificates with HR for the duration of the bond.',
    )
    expect(flags.map((f) => f.id)).toContain('original-certificates')
  })

  it('flags a post-exit non-compete', () => {
    const flags = scanBondClause(
      'After leaving the company you shall not join any competitor in India for 12 months.',
    )
    expect(flags.map((f) => f.id)).toContain('post-exit-noncompete')
  })

  it('flags a training bond and liquidated damages', () => {
    const flags = scanBondClause(
      'A service bond of Rs 2,00,000 applies. Liquidated damages of Rs 50,000 if you resign in probation.',
    )
    expect(flags.map((f) => f.id)).toContain('training-bond')
    expect(flags.map((f) => f.id)).toContain('liquidated-damages')
  })

  it('does not treat ordinary notice-in-lieu as a bond', () => {
    const flags = scanBondClause(
      'You will be required to pay salary in lieu of the unserved notice period. Please sign and return this offer.',
    )
    expect(flags.map((f) => f.id)).not.toContain('training-bond')
    expect(flags.map((f) => f.id)).not.toContain('original-certificates')
  })
})
