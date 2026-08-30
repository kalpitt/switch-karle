import { describe, expect, it } from 'vitest'
import { TOOLS } from './tools'
import { NAV_SLUGS, homeSections, pinnedTools } from './home'
import { NOTICE_TOOL } from './noticeLinks'
import { STAGE_ACTIONS } from './stageActions'
import { STAGE_ORDER } from '../tracker/store'
import { noticeTracker } from '../engine/noticeTracker'

describe('tool registry', () => {
  it('has unique kebab-case English slugs', () => {
    const slugs = TOOLS.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('does not occupy the hi slug — /hi/ is the language prefix', () => {
    expect(TOOLS.some((t) => t.slug === 'hi' || t.slug.startsWith('hi/'))).toBe(false)
  })
})

describe('home layout', () => {
  it('shows every tool exactly once, except the two the nav already carries', () => {
    const shown = [...pinnedTools(), ...homeSections().flatMap((s) => s.tools)].map((t) => t.slug)
    expect(new Set(shown).size).toBe(shown.length)
    const expected = TOOLS.map((t) => t.slug).filter((slug) => !NAV_SLUGS.includes(slug as never))
    expect(shown.slice().sort()).toEqual(expected.slice().sort())
  })

  it('pins the three starters, in journey order', () => {
    expect(pinnedTools().map((t) => t.slug)).toEqual(['decoder', 'offer-comparison', 'resignation-letter'])
  })

  it('orders the sections offer → exit → documents → landing', () => {
    expect(homeSections().map((s) => s.category)).toEqual(['offer', 'exit', 'documents', 'landing'])
  })
})

describe('notice-tracker cockpit links', () => {
  it('points every linked milestone at a tool that exists', () => {
    for (const slug of Object.values(NOTICE_TOOL)) {
      expect(TOOLS.some((tool) => tool.slug === slug)).toBe(true)
    }
  })

  it('links every milestone the engine emits except the physical hand-back', () => {
    const ids = noticeTracker({ resignDate: '2026-08-01', noticePeriodDays: 90, asOf: '2026-08-01' }).milestones.map(
      (m) => m.id,
    )
    const linked = ids.filter((id) => NOTICE_TOOL[id])
    expect(ids.filter((id) => !NOTICE_TOOL[id])).toEqual(['asset-return'])
    expect(linked.length).toBe(5)
  })
})

describe('tracker stage doorways', () => {
  it('points every stage action at a tool that exists', () => {
    for (const slugs of Object.values(STAGE_ACTIONS)) {
      for (const slug of slugs) {
        expect(TOOLS.some((tool) => tool.slug === slug)).toBe(true)
      }
    }
  })

  it('has an entry for every stage in STAGE_ORDER', () => {
    for (const stage of STAGE_ORDER) {
      expect(STAGE_ACTIONS[stage]).toBeDefined()
      expect(STAGE_ACTIONS[stage].length).toBeGreaterThan(0)
    }
  })
})
