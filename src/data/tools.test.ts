import { describe, expect, it } from 'vitest'
import { TOOLS, TOOLS_PAGE } from './tools'
import { INFO_PAGES } from './infoPages'
import { JOURNEY_IDS, journeySections } from './journey'
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

  it('does not take the all-tools page’s or an info page’s address', () => {
    for (const slug of [TOOLS_PAGE, ...INFO_PAGES]) expect(TOOLS.some((t) => t.slug === slug), slug).toBe(false)
  })

  it('does not occupy the hi slug — /hi/ is the language prefix', () => {
    expect(TOOLS.some((t) => t.slug === 'hi' || t.slug.startsWith('hi/'))).toBe(false)
  })
})

describe('journey stages', () => {
  it('gives every tool exactly one of the seven stages', () => {
    for (const tool of TOOLS) {
      expect(JOURNEY_IDS).toContain(tool.journey)
    }
    const shown = journeySections().flatMap((s) => s.tools.map((t) => t.slug))
    expect(shown.slice().sort()).toEqual(TOOLS.map((t) => t.slug).sort())
  })

  it('has at least one tool in every stage, in stage order', () => {
    expect(journeySections().map((s) => s.id)).toEqual([...JOURNEY_IDS])
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
