import { describe, expect, it } from 'vitest'
import { TOOLS } from './tools'
import { NEXT_STEP, PLAN_TARGET, journeySections, nextFor, type NextTarget } from './journey'

const slugs = TOOLS.map((tool) => tool.slug)
const stageOf = (slug: string) => TOOLS.find((tool) => tool.slug === slug)!.journey

describe('journey stages', () => {
  it('keeps the approved mapping (2026-10-31)', () => {
    expect(journeySections().map((section) => section.tools.map((tool) => tool.slug).sort())).toEqual([
      ['bond-scanner', 'bonus-clawback', 'clause-library', 'gratuity', 'leave-encashment', 'notice-buyout'],
      ['prompts', 'redactor', 'tracker'],
      ['expected-ctc', 'real-hike', 'recruiter-followup'],
      ['decline-accepted', 'decoder', 'esop-reality', 'fake-offer', 'offer-comparison', 'relocation', 'variable-reality'],
      ['buyout-ask', 'counter-offer', 'counter-offer-reply', 'early-release', 'manager-script', 'resignation-letter'],
      ['fnf-checker', 'handover-doc', 'insurance-gap', 'notice-tracker', 'offer-goes-cold', 'relieving-chaser'],
      ['bgv-prep', 'epf-transfer', 'form16-shock', 'tax-declaration'],
    ])
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
    // The two side paths are the only tools off the main chain, and both rejoin it.
    expect(slugs.filter((slug) => !walk.includes(slug)).sort()).toEqual(['decline-accepted', 'offer-goes-cold'])
    expect(nextFor('decline-accepted')).toEqual({ kind: 'tool', slug: 'resignation-letter' })
    expect(nextFor('offer-goes-cold')).toEqual({ kind: 'tool', slug: 'notice-tracker' })
    expect(nextFor('form16-shock')).toEqual({ kind: 'plan' })
  })

  it('knows nothing about a slug that is not a tool', () => {
    expect(nextFor('home')).toBeUndefined()
  })
})
