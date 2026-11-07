import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dictionaries } from '../i18n'
import { STATE_NAMES } from '../engine/professionalTax'
import type { StateCode } from '../engine/types'
import { INFO_PAGES } from './infoPages'
import { CORRECTIONS, ptSourceId, SOURCES, sourceById, TOOL_SOURCES, verifiedRange } from './sources'
import { TOOLS } from './tools'

const ISO = /^\d{4}-\d{2}-\d{2}$/
const statutory = TOOLS.filter((t) => t.statutory).map((t) => t.slug)
const toolSources = TOOL_SOURCES as Record<string, readonly string[]>

describe('sources registry', () => {
  it('has an entry for every statutory tool', () => {
    expect(statutory.length).toBeGreaterThan(10)
    for (const slug of statutory) expect(toolSources[slug]?.length ?? 0, slug).toBeGreaterThan(0)
  })

  it('names only rules the registry holds', () => {
    for (const [slug, ids] of Object.entries(toolSources)) {
      for (const id of ids) expect(sourceById(id), `${slug} → ${id}`).toBeDefined()
    }
  })

  it('gives every rule a source and a real date', () => {
    for (const s of SOURCES) {
      expect(s.citation.trim() !== '' || s.note === true, `${s.id} has no source`).toBe(true)
      expect(s.checked, s.id).toMatch(ISO)
      expect(Number.isNaN(Date.parse(s.checked)), s.id).toBe(false)
      expect(s.where.trim(), s.id).not.toBe('')
      if (s.status === 'verified') {
        expect(s.doc.trim(), `${s.id}: a verified rule names its document`).not.toBe('')
        expect(s.citation.trim(), `${s.id}: a verified rule has a citation`).not.toBe('')
      }
    }
  })

  it('has no duplicate ids', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length)
  })

  it('has words for every rule, note and correction in both languages', () => {
    const keys = [
      ...SOURCES.map((s) => `source.${s.id}`),
      ...SOURCES.filter((s) => s.note).map((s) => `sourceNote.${s.id}`),
      ...SOURCES.map((s) => `sources.status.${s.status}`),
      ...CORRECTIONS.map((c) => `corrections.${c.id}`),
    ]
    for (const key of keys) {
      expect(dictionaries.en[key]?.trim(), key).toBeTruthy()
      expect(dictionaries.hi[key]?.trim(), key).toBeTruthy()
    }
  })

  it('gives every state a professional-tax entry', () => {
    for (const state of Object.keys(STATE_NAMES) as StateCode[]) {
      expect(sourceById(ptSourceId(state)), state).toBeDefined()
    }
    expect(ptSourceId('KA')).toBe('pt-KA')
    expect(ptSourceId('MH')).toBe('pt-other')
  })

  it('dates the footer chip from verified rules only', () => {
    const { from, to } = verifiedRange()
    const verified = SOURCES.filter((s) => s.status === 'verified').map((s) => s.checked)
    expect(from).toBe([...verified].sort()[0])
    expect(to).toBe([...verified].sort().at(-1))
    expect(from <= to).toBe(true)
  })

  it('dates every correction', () => {
    for (const c of CORRECTIONS) expect(c.date, c.id).toMatch(ISO)
  })
})

/**
 * PRODUCT.md rule 3: a statutory figure shows its receipt. Every statutory
 * tool's screen renders <Receipt> (the Decoder's lives in Results.tsx).
 */
describe('receipts on screen', () => {
  const screenOf = (slug: string) =>
    slug === 'decoder' ? '../components/Results.tsx' : `../tools/${slug}/index.tsx`

  it.each(statutory)('%s renders a receipt', (slug) => {
    const src = readFileSync(new URL(screenOf(slug), import.meta.url), 'utf8')
    expect(src).toMatch(/<Receipt\b/)
  })
})

describe('info pages', () => {
  it('never take a tool slug or the hi slug', () => {
    for (const page of INFO_PAGES) {
      expect(page).not.toBe('hi')
      expect(TOOLS.some((t) => t.slug === page), page).toBe(false)
    }
  })
})
