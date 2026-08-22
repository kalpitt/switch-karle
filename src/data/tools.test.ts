import { describe, expect, it } from 'vitest'
import { TOOLS } from './tools'

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
