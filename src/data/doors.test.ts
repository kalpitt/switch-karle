import { describe, expect, it } from 'vitest'
import { DOOR_IDS, DOORS, doorPath, doorSections, doorsFor } from './doors'
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
