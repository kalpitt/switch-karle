import { describe, expect, it } from 'vitest'
import { TEMPLATES } from './templates'
import type { PromptContext } from './templates'
import type { Application } from '../tracker/types'
import type { RedFlag, SalaryBreakdown } from '../engine/types'
import { formatLPA } from '../engine/format'

const APP: Application = {
  id: 'app-1',
  company: 'Acme Corp',
  role: 'Staff Engineer',
  stage: 'interviewing',
  ctcDiscussedAnnual: 3_600_000,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const FLAGS: RedFlag[] = [
  {
    id: 'notice-period',
    severity: 'red',
    title: '90-day notice period',
    detail: 'Long notice periods reduce your leverage.',
    negotiationTip: 'Ask for a 30-day buyout clause in writing.',
  },
]

const BREAKDOWN = {
  inHandMonthly: 210_000,
  inHandRatio: 0.7,
} as SalaryBreakdown

describe('TEMPLATES', () => {
  it('has exactly six templates covering all four categories', () => {
    expect(TEMPLATES).toHaveLength(6)
    const categories = new Set(TEMPLATES.map((t) => t.category))
    expect(categories).toEqual(new Set(['research', 'prepare', 'negotiate', 'outreach']))
    const ids = TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  for (const template of TEMPLATES) {
    describe(template.id, () => {
      it('builds a non-empty, substantial prompt with an empty context', () => {
        const result = template.build({})
        expect(result.trim().length).toBeGreaterThan(200)
      })

      it('includes the company name when an application is present in context', () => {
        const ctx: PromptContext = { app: APP }
        const result = template.build(ctx)
        expect(result).toContain('Acme Corp')
      })

      it('falls back to generic wording without an application', () => {
        const result = template.build({})
        expect(result.length).toBeGreaterThan(0)
        // Should not throw and should not contain literal "undefined"
        expect(result).not.toContain('undefined')
      })
    })
  }

  it('negotiation template includes the formatted CTC and at least one red-flag negotiation tip', () => {
    const negotiation = TEMPLATES.find((t) => t.id === 'negotiation')!
    const ctx: PromptContext = { app: APP, breakdown: BREAKDOWN, flags: FLAGS }
    const result = negotiation.build(ctx)
    expect(result).toContain(formatLPA(APP.ctcDiscussedAnnual!))
    expect(result).toContain(FLAGS[0].negotiationTip)
    expect(result).toContain(FLAGS[0].title)
  })

  it('offer-compare template includes red-flag titles when flags are present', () => {
    const offerCompare = TEMPLATES.find((t) => t.id === 'offer-compare')!
    const ctx: PromptContext = { app: APP, breakdown: BREAKDOWN, flags: FLAGS }
    const result = offerCompare.build(ctx)
    expect(result).toContain(FLAGS[0].title)
  })
})
