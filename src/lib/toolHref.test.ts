import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCRIPT_SLUGS } from '../data/hrScripts'
import { TOOLS, WHAT_TO_SAY, islandTools, pageTools } from '../data/tools'
import { paletteItems } from './palette'
import { toolHref } from './toolHref'

const srcDir = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Decided 2026-11-07 (Kalpit): no users yet, so the situations' old addresses
 * need not be kept. What to say is the one page; a situation is picked in it.
 */
describe('What to say is the one page for every situation', () => {
  it('builds no page for a situation, in either language', () => {
    const pages = islandTools().map((tool) => tool.slug)
    expect(pages).toContain(WHAT_TO_SAY)
    for (const slug of SCRIPT_SLUGS) expect(pages).not.toContain(slug)
    expect(pageTools().map((tool) => tool.slug)).toEqual(TOOLS.filter((tool) => !tool.partOf).map((tool) => tool.slug))
  })

  it('leaves the situations out of the sitemap', () => {
    expect(readFileSync(join(srcDir, 'pages/sitemap.xml.ts'), 'utf8')).toMatch(/pageTools\(\)\.map/)
  })

  it('links a situation to What to say with it picked, and every other tool to its own page', () => {
    expect(toolHref('en', 'buyout-ask')).toBe('/what-to-say/#buyout-ask')
    expect(toolHref('hi', 'manager-script')).toBe('/hi/what-to-say/#manager-script')
    expect(toolHref('en', WHAT_TO_SAY)).toBe('/what-to-say/')
    expect(toolHref('hi', 'gratuity')).toBe('/hi/gratuity/')
  })

  it('search sends a situation to What to say with it picked', () => {
    const items = paletteItems(TOOLS, '/', (slug) => toolHref('en', slug))
    for (const slug of SCRIPT_SLUGS) {
      expect(items.find((item) => item.slug === slug)?.href).toBe(`/what-to-say/#${slug}`)
    }
  })

  it('every link-building list uses toolHref, not a bare slug path', () => {
    for (const file of [
      'components/NextStep.tsx',
      'components/CommandPalette.tsx',
      'components/Tracker.tsx',
      'tools/all-tools/index.tsx',
      'tools/plan/ActionList.tsx',
      'tools/notice-tracker/index.tsx',
    ]) {
      expect(readFileSync(join(srcDir, file), 'utf8'), file).toMatch(/toolHref\(/)
    }
  })
})
