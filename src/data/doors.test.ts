import { describe, expect, it } from 'vitest'
import { DOOR_IDS, DOORS, doorListSections, doorPath, doorSections, doorsFor } from './doors'
import { JOURNEY_IDS } from './journey'
import { PLAN_PAGE, TOOLS, toolBySlug } from './tools'

const ids = (doors: { id: string }[]) => doors.map((door) => door.id)

describe('the five doors (visitors call them steps)', () => {
  it('are the five ids, in order, each once', () => {
    expect(ids([...DOORS])).toEqual([...DOOR_IDS])
  })

  it('cover every journey stage 0 to 6 exactly once', () => {
    for (const journey of JOURNEY_IDS) {
      expect(DOORS.filter((door) => door.journeys.includes(journey)).length, `stage ${journey}`).toBe(1)
    }
  })

  it('lead and list only tools that exist, or the plan page', () => {
    for (const door of DOORS) {
      for (const slug of [door.lead, ...door.also]) {
        expect(slug === PLAN_PAGE || toolBySlug(slug) !== undefined, `${door.id}: ${slug}`).toBe(true)
      }
    }
  })

  it('show at most four more tools, never the lead again', () => {
    for (const door of DOORS) {
      expect(door.also.length, door.id).toBeLessThanOrEqual(4)
      expect(door.also, door.id).not.toContain(door.lead)
      expect(new Set(door.also).size, door.id).toBe(door.also.length)
    }
  })

  it('keep the tested choice of lead tool (decision D3, 2026-11-16)', () => {
    expect(DOORS.map((door) => [door.id, door.lead])).toEqual([
      ['leaving', PLAN_PAGE],
      ['applying', 'real-hike'],
      ['offer', 'decoder'],
      ['notice', 'resignation-letter'],
      ['joining', 'epf-transfer'],
    ])
  })

  it('live at /start/<id>/', () => {
    expect(doorPath('offer')).toBe('start/offer')
  })
})

describe('doorSections (the /tools/ page)', () => {
  const sections = doorSections()

  it('lists every tool in at least one section', () => {
    const listed = new Set(sections.flatMap((section) => section.slugs))
    expect(TOOLS.filter((tool) => !listed.has(tool.slug)).map((tool) => tool.slug)).toEqual([])
  })

  it('lists every tool a door page shows in that door’s section, lead first', () => {
    for (const { door, slugs } of sections) {
      expect(slugs[0]).toBe(door.lead)
      for (const slug of door.also) expect(slugs, `${door.id}: ${slug}`).toContain(slug)
    }
    // real-hike leads "applying" and is also shown under "offer": it is in both lists.
    expect(sections.find((s) => s.door.id === 'offer')!.slugs).toContain('real-hike')
  })

  it('has no duplicate rows within a section', () => {
    for (const { door, slugs } of sections) expect(new Set(slugs).size, door.id).toBe(slugs.length)
  })

  it('puts the plan first in "leaving" and nowhere else', () => {
    expect(sections.filter((s) => s.slugs.includes(PLAN_PAGE)).map((s) => s.door.id)).toEqual(['leaving'])
  })
})

describe('doorsFor (the "More for:" line on a tool)', () => {
  it('names every door that shows the tool', () => {
    expect(ids(doorsFor('real-hike'))).toEqual(['applying', 'offer'])
    expect(ids(doorsFor('fnf-checker'))).toEqual(['notice'])
  })

  it('falls back to the door that covers the tool’s stage', () => {
    expect(ids(doorsFor('bonus-clawback'))).toEqual(['leaving'])
    expect(ids(doorsFor('recruiter-followup'))).toEqual(['applying'])
    expect(ids(doorsFor('relieving-chaser'))).toEqual(['notice'])
  })

  it('maps the plan page to "leaving"', () => {
    expect(ids(doorsFor(PLAN_PAGE))).toEqual(['leaving'])
  })

  it('gives every tool at least one door', () => {
    for (const tool of TOOLS) expect(doorsFor(tool.slug).length, tool.slug).toBeGreaterThan(0)
  })
})

describe('doorListSections (/tools/ rows)', () => {
  const rows = (id: string) =>
    doorListSections()
      .find((s) => s.door.id === id)!
      .rows.map((r) => (r.kind === 'plan' ? 'plan' : r.kind === 'tool' ? r.tool.slug : `wts:${r.situations.map((s) => s.slug).join('+')}`))

  it('folds each door’s What to say scripts into one row, named for the door', () => {
    expect(rows('applying').filter((r) => r.startsWith('wts:'))).toEqual(['wts:expected-ctc+recruiter-followup'])
    expect(rows('offer').filter((r) => r.startsWith('wts:'))).toEqual(['wts:decline-accepted'])
    expect(rows('notice').filter((r) => r.startsWith('wts:'))).toEqual([
      'wts:manager-script+counter-offer-reply+early-release+buyout-ask',
    ])
    for (const id of ['leaving', 'joining']) expect(rows(id).some((r) => r.startsWith('wts:')), id).toBe(false)
    const notice = doorListSections().find((s) => s.door.id === 'notice')!.rows.find((r) => r.kind === 'group')
    expect(notice && notice.kind === 'group' && notice.nameKey).toBe('whatToSay.row.notice')
  })

  it('never lists the What to say page itself; its rows stand for it', () => {
    for (const id of DOOR_IDS) expect(rows(id), id).not.toContain('what-to-say')
  })

  it('starts each section with its lead, marked, and the plan leads "leaving"', () => {
    for (const { door, rows: r } of doorListSections()) {
      const first = r[0]!
      expect(first.kind !== 'group' && first.lead, door.id).toBe(true)
      expect(r.slice(1).some((row) => row.kind !== 'group' && row.lead), door.id).toBe(false)
    }
    expect(rows('leaving')[0]).toBe('plan')
  })

  it('lists every page tool and every script somewhere', () => {
    const listed = new Set(doorListSections().flatMap((s) => s.rows.flatMap((r) => (r.kind === 'plan' ? [] : r.kind === 'tool' ? [r.tool.slug] : r.situations.map((x) => x.slug)))))
    expect(TOOLS.filter((t) => t.slug !== 'what-to-say' && !listed.has(t.slug)).map((t) => t.slug)).toEqual([])
  })
})
