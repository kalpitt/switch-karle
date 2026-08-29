import { describe, expect, it } from 'vitest'
import { TOOLS } from './tools'
import { NAV_SLUGS, homeSections, pinnedTools } from './home'

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
