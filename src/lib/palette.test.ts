import { describe, expect, it } from 'vitest'
import { filterPalette, paletteItems } from './palette'
import { TOOLS, type ToolDef } from '../data/tools'
import { dictionaries } from '../i18n'

const tools = [
  { slug: 'epf-transfer', titleKey: 'epf-transfer.title', descKey: 'epf-transfer.desc' },
  { slug: 'decoder', titleKey: 'tab.decoder', descKey: 'home.decoder.desc' },
] as ToolDef[]

const labels: Record<string, string> = {
  'nav.home': 'Home',
  'home.kicker': 'A suite of tools',
  'epf-transfer.title': 'EPF transfer',
  'epf-transfer.desc': 'Form 13 and the premature-withdrawal trap',
  'tab.decoder': 'Decoder',
  'home.decoder.desc': 'CTC to in-hand',
}

describe('palette', () => {
  it('puts home first, then every registry tool', () => {
    const items = paletteItems(tools, '/switch-karle/', (s) => `/switch-karle/${s}/`)
    expect(items.map((i) => i.slug)).toEqual(['home', 'epf-transfer', 'decoder'])
    expect(items[0]!.href).toBe('/switch-karle/')
  })

  it('filters on slug, title, or description', () => {
    const items = paletteItems(tools, '/', (s) => `/${s}/`)
    const label = (k: string) => labels[k] ?? k
    expect(filterPalette(items, 'form 13', label).map((i) => i.slug)).toEqual(['epf-transfer'])
    expect(filterPalette(items, 'DECODER', label).map((i) => i.slug)).toEqual(['decoder'])
    expect(filterPalette(items, '  ', label)).toHaveLength(3)
  })

  it('treats hyphens, spaces, and punctuation as equivalent so in-hand, in hand, and inhand match identically', () => {
    const items = paletteItems(tools, '/', (s) => `/${s}/`)
    const label = (k: string) => labels[k] ?? k
    const r1 = filterPalette(items, 'in-hand', label).map((i) => i.slug)
    const r2 = filterPalette(items, 'in hand', label).map((i) => i.slug)
    const r3 = filterPalette(items, 'inhand', label).map((i) => i.slug)
    expect(r1).toEqual(['decoder'])
    expect(r2).toEqual(r1)
    expect(r3).toEqual(r1)
  })

  it('ranks title matches above keyword-only matches regardless of input order', () => {
    const testItems: ToolDef[] = [
      {
        slug: 'keyword-first',
        category: 'exit',
        stage: 2,
        icon: 'test',
        titleKey: 'kf.title',
        descKey: 'kf.desc',
        seoTitle: '',
        seoDescription: '',
        hasIsland: false,
        statutory: false,
        keywords: ['resignation', 'istifa'],
      },
      {
        slug: 'title-second',
        category: 'documents',
        stage: 3,
        icon: 'test',
        titleKey: 'ts.title',
        descKey: 'ts.desc',
        seoTitle: '',
        seoDescription: '',
        hasIsland: false,
        statutory: false,
      },
    ]
    const customLabels: Record<string, string> = {
      'kf.title': 'Notice Recovery',
      'kf.desc': 'Recoveries during exit',
      'ts.title': 'Resignation Letter',
      'ts.desc': 'Three tones for drafting',
    }
    const items = paletteItems(testItems, '/', (s) => `/${s}/`)
    const label = (k: string) => customLabels[k] ?? k
    const results = filterPalette(items, 'resignation', label).map((i) => i.slug)
    expect(results).toEqual(['title-second', 'keyword-first'])
  })

  it('matches Devanagari queries containing combining vowel signs', () => {
    const testTools: ToolDef[] = [
      {
        slug: 'letter',
        category: 'documents',
        stage: 3,
        icon: 'letter',
        titleKey: 'l.title',
        descKey: 'l.desc',
        seoTitle: '',
        seoDescription: '',
        hasIsland: false,
        statutory: false,
        keywords: ['इस्तीफ़ा', 'त्यागपत्र'],
      },
      {
        slug: 'tracker',
        category: 'landing',
        stage: 0,
        icon: 'tracker',
        titleKey: 'tr.title',
        descKey: 'tr.desc',
        seoTitle: '',
        seoDescription: '',
        hasIsland: false,
        statutory: false,
        keywords: ['नौकरी', 'naukri'],
      },
    ]
    const customLabels: Record<string, string> = {
      'l.title': 'Resignation Letter',
      'l.desc': 'Draft your letter',
      'tr.title': 'Job Tracker',
      'tr.desc': 'Track jobs',
    }
    const items = paletteItems(testTools, '/', (s) => `/${s}/`)
    const label = (k: string) => customLabels[k] ?? k
    expect(filterPalette(items, 'इस्तीफ़ा', label).map((i) => i.slug)).toEqual(['letter'])
    expect(filterPalette(items, 'नौकरी', label).map((i) => i.slug)).toEqual(['tracker'])
  })

  it('matches ROADMAP examples across the full tool registry', () => {
    const items = paletteItems(TOOLS, '/', (s) => `/${s}/`)
    const label = (k: string) => dictionaries.en[k] ?? k

    // 'quit' and 'resign' reach resignation-letter, notice-buyout, notice-tracker
    const quitSlugs = filterPalette(items, 'quit', label).map((i) => i.slug)
    expect(quitSlugs).toContain('resignation-letter')
    expect(quitSlugs).toContain('notice-buyout')
    expect(quitSlugs).toContain('notice-tracker')
    expect(quitSlugs[0]).toBe('resignation-letter')

    const resignSlugs = filterPalette(items, 'resign', label).map((i) => i.slug)
    expect(resignSlugs[0]).toBe('resignation-letter')
    expect(resignSlugs).toContain('notice-buyout')
    expect(resignSlugs).toContain('notice-tracker')

    // 'hike' reaches real-hike first, and offer-comparison within results
    const hikeSlugs = filterPalette(items, 'hike', label).map((i) => i.slug)
    expect(hikeSlugs[0]).toBe('real-hike')
    expect(hikeSlugs).toContain('offer-comparison')

    // 'in-hand', 'in hand', 'inhand' all reach decoder first and return the exact same results
    const inHand1 = filterPalette(items, 'in-hand', label).map((i) => i.slug)
    const inHand2 = filterPalette(items, 'in hand', label).map((i) => i.slug)
    const inHand3 = filterPalette(items, 'inhand', label).map((i) => i.slug)
    expect(inHand1[0]).toBe('decoder')
    expect(inHand2).toEqual(inHand1)
    expect(inHand3).toEqual(inHand1)

    // 'job' returns a sensible set rather than every tool
    const jobSlugs = filterPalette(items, 'job', label).map((i) => i.slug)
    expect(jobSlugs.length).toBeGreaterThanOrEqual(2)
    expect(jobSlugs.length).toBeLessThan(TOOLS.length / 2)
  })

  it('has 5 to 15 keywords for every tool in the registry mixing English/Hinglish and Devanagari', () => {
    for (const tool of TOOLS) {
      expect(tool.keywords, `Tool ${tool.slug} must have keywords defined`).toBeDefined()
      expect(tool.keywords!.length, `Tool ${tool.slug} keywords count must be between 5 and 15`).toBeGreaterThanOrEqual(5)
      expect(tool.keywords!.length, `Tool ${tool.slug} keywords count must be between 5 and 15`).toBeLessThanOrEqual(15)

      const hasDevanagari = tool.keywords!.some((k) => /[\u0900-\u097F]/.test(k))
      const hasLatin = tool.keywords!.some((k) => /[a-zA-Z]/.test(k))
      expect(hasDevanagari, `Tool ${tool.slug} must include Devanagari keywords`).toBe(true)
      expect(hasLatin, `Tool ${tool.slug} must include English/Hinglish keywords`).toBe(true)
    }
  })
})



