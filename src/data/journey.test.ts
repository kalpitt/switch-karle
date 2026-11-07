import { describe, expect, it } from 'vitest'
import { TOOLS, WHAT_TO_SAY } from './tools'
import { SCRIPT_SLUGS } from './hrScripts'
import {
  NEXT_STEP,
  PLAN_TARGET,
  distinctToolCount,
  journeySections,
  listSections,
  nextFor,
  whatToSayGroups,
  type NextTarget,
} from './journey'

const slugs = TOOLS.map((tool) => tool.slug)
const stageOf = (slug: string) => TOOLS.find((tool) => tool.slug === slug)!.journey

describe('journey stages', () => {
  it('keeps the approved mapping (2026-10-31)', () => {
    expect(journeySections().map((section) => section.tools.map((tool) => tool.slug).sort())).toEqual([
      ['bond-scanner', 'bonus-clawback', 'clause-library', 'gratuity', 'leave-encashment', 'notice-buyout'],
      ['prompts', 'redactor', 'tracker'],
      ['expected-ctc', 'real-hike', 'recruiter-followup', 'what-to-say'],
      ['decline-accepted', 'decoder', 'esop-reality', 'fake-offer', 'offer-comparison', 'relocation', 'variable-reality'],
      ['buyout-ask', 'counter-offer', 'counter-offer-reply', 'early-release', 'manager-script', 'resignation-letter'],
      ['fnf-checker', 'handover-doc', 'insurance-gap', 'notice-tracker', 'offer-goes-cold', 'relieving-chaser'],
      ['bgv-prep', 'epf-transfer', 'form16-shock', 'tax-declaration'],
    ])
  })
})

describe('lists (/tools/, home count)', () => {
  const rows = (id: number) =>
    listSections()
      .find((section) => section.id === id)!
      .entries.map((entry) => (entry.kind === 'tool' ? entry.tool.slug : `${entry.group.slug}:${entry.situations.map((s) => s.slug).join('+')}`))

  it('shows What to say once in each stage it has a situation in, never its situations one by one', () => {
    expect(rows(2)).toEqual(['real-hike', 'what-to-say:expected-ctc+recruiter-followup'])
    expect(rows(3).filter((row) => row.startsWith('what-to-say'))).toEqual(['what-to-say:decline-accepted'])
    expect(rows(4)).toEqual([
      'resignation-letter',
      'what-to-say:manager-script+counter-offer-reply+early-release+buyout-ask',
      'counter-offer',
    ])
    for (const id of [0, 1, 5, 6]) expect(rows(id).some((row) => row.startsWith('what-to-say')), String(id)).toBe(false)
  })

  it('lists every tool exactly once, and every situation inside a What to say row', () => {
    const listed = listSections().flatMap((section) =>
      section.entries.flatMap((entry) => (entry.kind === 'tool' ? [entry.tool.slug] : entry.situations.map((s) => s.slug))),
    )
    const expected = TOOLS.filter((tool) => tool.slug !== WHAT_TO_SAY).map((tool) => tool.slug)
    expect(listed.slice().sort()).toEqual(expected.slice().sort())
    expect(new Set(listed).size).toBe(listed.length)
  })

  it('keeps all seven stages, in order', () => {
    expect(listSections().map((section) => section.id)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('marks exactly the seven scripts as What to say situations', () => {
    expect(TOOLS.filter((tool) => tool.partOf === WHAT_TO_SAY).map((tool) => tool.slug).sort()).toEqual(
      [...SCRIPT_SLUGS].sort(),
    )
  })

  it('gives the What to say picker every situation once, stage by stage', () => {
    const groups = whatToSayGroups()
    expect(groups.map((group) => group.id)).toEqual([2, 3, 4])
    expect(groups.flatMap((group) => group.situations.map((s) => s.slug)).sort()).toEqual([...SCRIPT_SLUGS].sort())
  })

  it('counts What to say as one tool', () => {
    expect(distinctToolCount()).toBe(TOOLS.length - SCRIPT_SLUGS.length)
  })
})

describe('one next thing', () => {
  const stageOfTarget = (target: NextTarget) => (target.kind === 'plan' ? 7 : stageOf(target.slug))

  it('gives every tool a next step (add a new tool to NEXT_STEP)', () => {
    expect(slugs.filter((slug) => nextFor(slug) === undefined)).toEqual([])
  })

  it('names only tools that exist, on both sides, and never the plan sentinel as a tool', () => {
    expect(slugs).not.toContain(PLAN_TARGET)
    for (const [from, to] of Object.entries(NEXT_STEP)) {
      expect(slugs, from).toContain(from)
      if (to !== PLAN_TARGET) expect(slugs, `${from} → ${to}`).toContain(to)
      expect(to, `${from} links to itself`).not.toBe(from)
    }
  })

  it('never steps back to an earlier stage', () => {
    for (const slug of slugs) {
      expect(stageOfTarget(nextFor(slug)!), slug).toBeGreaterThanOrEqual(stageOf(slug))
    }
  })

  it('from any tool, reaches the end of stage 6 and the plan without a cycle', () => {
    for (const start of slugs) {
      const seen = new Set<string>()
      let at = start
      let reachedStage6 = false
      for (;;) {
        expect(seen.has(at), `cycle from ${start} at ${at}`).toBe(false)
        seen.add(at)
        if (stageOf(at) === 6) reachedStage6 = true
        const next = nextFor(at)!
        if (next.kind === 'plan') break
        at = next.slug
      }
      expect(reachedStage6, start).toBe(true)
      expect(at, start).toBe('form16-shock')
    }
  })

  it('walks the main chain from gratuity through all 33 main-path tools in stage order', () => {
    const walk: string[] = []
    let at: string | undefined = 'gratuity'
    while (at) {
      walk.push(at)
      const next = nextFor(at)
      at = next?.kind === 'tool' ? next.slug : undefined
    }
    expect(walk.length).toBe(33)
    expect(walk.map(stageOf)).toEqual([...walk.map(stageOf)].sort((a, b) => a - b))
    // The two side paths and the What to say picker page are the only pages off the
    // main chain, and all three rejoin it.
    expect(slugs.filter((slug) => !walk.includes(slug)).sort()).toEqual(['decline-accepted', 'offer-goes-cold', 'what-to-say'])
    expect(nextFor('what-to-say')).toEqual({ kind: 'tool', slug: 'expected-ctc' })
    expect(nextFor('decline-accepted')).toEqual({ kind: 'tool', slug: 'resignation-letter' })
    expect(nextFor('offer-goes-cold')).toEqual({ kind: 'tool', slug: 'notice-tracker' })
    expect(nextFor('form16-shock')).toEqual({ kind: 'plan' })
  })

  it('knows nothing about a slug that is not a tool', () => {
    expect(nextFor('home')).toBeUndefined()
  })
})
