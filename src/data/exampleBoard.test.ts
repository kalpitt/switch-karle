import { describe, expect, it } from 'vitest'
import { exampleApplications, EXAMPLE_IDS } from './exampleBoard'
import { STAGE_ORDER } from '../tracker/store'
import type { Stage } from '../tracker/types'

/** Identity translator — the board's shape does not depend on the language. */
const raw = (key: string) => key

describe('exampleApplications', () => {
  it('returns one application per seed', () => {
    const apps = exampleApplications('2026-08-30', raw)
    expect(apps).toHaveLength(EXAMPLE_IDS.length)
    expect(apps.map((a) => a.id)).toEqual([...EXAMPLE_IDS])
  })

  it('covers every stage, so the empty board shows the whole pipeline', () => {
    const stages = new Set(exampleApplications('2026-08-30', raw).map((a) => a.stage))
    for (const stage of STAGE_ORDER) expect(stages.has(stage)).toBe(true)
  })

  it('is pure — same day in, same board out', () => {
    expect(exampleApplications('2026-08-30', raw)).toEqual(exampleApplications('2026-08-30', raw))
  })

  it('translates next actions through the given translator', () => {
    const apps = exampleApplications('2026-08-30', (key) => `HI:${key}`)
    const withAction = apps.filter((a) => a.nextAction)
    expect(withAction.length).toBeGreaterThan(0)
    for (const app of withAction) expect(app.nextAction).toMatch(/^HI:tracker\.example\.action\./)
  })

  it('converts lakh seeds to annual rupees', () => {
    const offer = exampleApplications('2026-08-30', raw).find((a) => a.stage === 'offer')
    expect(offer?.ctcDiscussedAnnual).toBe(38_00_000)
  })
})

describe('example dates track the day they are built', () => {
  // The board is rendered on an unknown future day. Dates are relative so it
  // cannot age into a board where every card reads as overdue.
  const days = ['2026-08-30', '2027-01-15', '2030-02-28'] as const

  it.each(days)('keeps exactly one card overdue on %s', (today) => {
    const overdue = exampleApplications(today, raw).filter(
      (a) => a.nextActionDate && a.nextActionDate < today,
    )
    expect(overdue).toHaveLength(1)
    expect(overdue[0].id).toBe('example-skydeck')
  })

  it.each(days)('leaves every other dated card in the future on %s', (today) => {
    const dated = exampleApplications(today, raw).filter((a) => a.nextActionDate)
    const upcoming = dated.filter((a) => a.id !== 'example-skydeck')
    expect(upcoming.length).toBeGreaterThan(0)
    for (const app of upcoming) expect(app.nextActionDate! > today).toBe(true)
  })

  it('rolls across a month boundary rather than emitting day 0 or 32', () => {
    const apps = exampleApplications('2026-03-01', raw)
    const overdue = apps.find((a) => a.id === 'example-skydeck')
    expect(overdue?.nextActionDate).toBe('2026-02-25')
  })

  it('rolls across a year boundary', () => {
    const apps = exampleApplications('2026-01-02', raw)
    expect(apps.find((a) => a.id === 'example-skydeck')?.nextActionDate).toBe('2025-12-29')
  })

  it('handles a leap day', () => {
    const apps = exampleApplications('2028-03-01', raw)
    expect(apps.find((a) => a.id === 'example-skydeck')?.nextActionDate).toBe('2028-02-26')
  })

  it('stamps createdAt and updatedAt from the given day', () => {
    for (const app of exampleApplications('2026-08-30', raw)) {
      expect(app.createdAt).toBe('2026-08-30T00:00:00.000Z')
      expect(app.updatedAt).toBe('2026-08-30T00:00:00.000Z')
    }
  })
})

describe('the example never looks like real user data', () => {
  it('uses invented companies, so no real employer carries an invented CTC', () => {
    const companies = exampleApplications('2026-08-30', raw).map((a) => a.company.toLowerCase())
    const realEmployers = ['naukri', 'linkedin', 'infosys', 'accenture', 'deloitte', 'tcs', 'wipro']
    for (const company of companies) {
      for (const real of realEmployers) expect(company).not.toContain(real)
    }
  })

  it('gives every card a stage the tracker knows how to render', () => {
    const known = new Set<Stage>(STAGE_ORDER)
    for (const app of exampleApplications('2026-08-30', raw)) expect(known.has(app.stage)).toBe(true)
  })
})
