import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { dictionaries, translate, translateOrFallback } from './index'
import { en } from './en'
import { hi } from './hi'
import { hiSuite } from './hi-suite'
import { HINDI_PENDING } from './hi-pending'

const here = dirname(fileURLToPath(import.meta.url))
const frozenHiKeys: string[] = JSON.parse(readFileSync(join(here, 'hi-freeze.json'), 'utf8'))
/** The English at the start of the front-door rebuild (2026-11-19). The Hindi pass deletes it. */
const enBaseline: Record<string, string> = JSON.parse(readFileSync(join(here, 'en-baseline.json'), 'utf8'))

describe('translate', () => {
  it('returns the English string for the en dictionary', () => {
    expect(translate(dictionaries.en, 'tracker.title')).toBe('Applications')
  })

  it('returns the Hindi string for the hi dictionary when present', () => {
    expect(translate(dictionaries.hi, 'tracker.title')).toBe('Applications')
    expect(translate(dictionaries.hi, 'decoder.title')).toBe('आपका offer')
  })

  it('falls back to English when a key is missing from the hi dictionary', () => {
    const dictWithGap: Record<string, string> = {}
    expect(translate(dictWithGap, 'decoder.title')).toBe(dictionaries.en['decoder.title'])
  })

  it('falls back to the raw key when missing from every dictionary', () => {
    expect(translate(dictionaries.en, 'this.key.does.not.exist')).toBe('this.key.does.not.exist')
  })

  it('interpolates a single {var}', () => {
    expect(translate(dictionaries.en, 'tracker.trackedCount', { n: 3 })).toBe('3 tracked')
  })

  it('interpolates multiple {vars} in one template', () => {
    expect(translate(dictionaries.en, 'promptStudio.pasteSub', { company: 'Acme', role: 'PM' })).toBe(
      'Save the answer against Acme — PM.',
    )
  })

  it('leaves an unmatched placeholder untouched rather than throwing', () => {
    expect(translate(dictionaries.en, 'tracker.trackedCount', {})).toBe('{n} tracked')
  })

  it('does not choke on vars with no placeholder in the template', () => {
    expect(translate(dictionaries.en, 'tracker.title', { unused: 1 })).toBe('Applications')
  })
})

describe('translateOrFallback (red-flag UI overrides)', () => {
  it('uses the English fallback for lang "en" even if a hi override exists', () => {
    const fallback = '60-day notice period'
    expect(translateOrFallback('en', 'flag.notice-period.title', fallback, { days: 60 })).toBe(fallback)
  })

  it('uses the hi override for lang "hi" when present', () => {
    const fallback = '60-day notice period'
    expect(translateOrFallback('hi', 'flag.notice-period.title', fallback, { days: 60 })).toBe(
      '60 दिन का notice period',
    )
  })

  it('falls back to the given English string (not the raw key) when no hi override exists', () => {
    const fallback = 'Some engine-built English sentence with ₹1,23,456.'
    expect(translateOrFallback('hi', 'flag.does-not-exist.detail', fallback)).toBe(fallback)
  })
})

/**
 * Keys that are deliberately English-only in the Hindi UI.
 *
 * New tools add `en.ts` keys; the Hindi pass requires a non-blank `hi` pair
 * for every English key. Frozen keys must also remain present (no-regression).
 */
const HINDI_EXEMPT: readonly string[] = []

describe('dictionary integrity', () => {
  it('every frozen Hindi key is still present and non-blank (no-regression)', () => {
    const missing = frozenHiKeys.filter(
      (key) => !(key in dictionaries.hi) || dictionaries.hi[key].trim() === '',
    )
    expect(missing).toEqual([])
  })

  it('every English key has a non-blank Hindi pair (full EN→HI parity), except those waiting for the Hindi pass', () => {
    const missing = Object.keys(dictionaries.en).filter(
      (key) => !HINDI_PENDING.includes(key) && (!(key in dictionaries.hi) || dictionaries.hi[key].trim() === ''),
    )
    expect(missing).toEqual([])
  })

  it('Hindi strings do not invent {placeholders} that English does not have', () => {
    const names = (s: string) => new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))
    const invented = Object.keys(dictionaries.en).filter((key) => {
      const enNames = names(dictionaries.en[key])
      const hiNames = names(dictionaries.hi[key] ?? '')
      return [...hiNames].some((name) => !enNames.has(name))
    })
    expect(invented).toEqual([])
  })

  it('has no stale entries in the Hindi exemption list', () => {
    const stale = HINDI_EXEMPT.filter((key) => key in dictionaries.hi || !(key in dictionaries.en))
    expect(stale).toEqual([])
  })

  it('no hi value is an empty string', () => {
    // `translate()` uses `??`, so '' is a hit, not a miss: an empty Hindi value
    // renders as blank text instead of falling back to English.
    const blank = Object.keys(dictionaries.hi).filter((key) => dictionaries.hi[key].trim() === '')
    expect(blank).toEqual([])
  })

  it('every hi key that overrides a flag.* engine string is non-empty', () => {
    const flagKeys = Object.keys(dictionaries.hi).filter((k) => k.startsWith('flag.'))
    expect(flagKeys.length).toBeGreaterThan(0)
    for (const key of flagKeys) {
      expect(dictionaries.hi[key].trim().length).toBeGreaterThan(0)
    }
  })

  it('every key in hi also exists in en (no orphaned Hindi-only UI keys outside flag.*)', () => {
    const orphaned = Object.keys(dictionaries.hi).filter(
      (key) => !key.startsWith('flag.') && !(key in dictionaries.en),
    )
    expect(orphaned).toEqual([])
  })
})

/**
 * Hindi is hidden during the front-door rebuild (Kalpit, 2026-11-19). Every
 * English string that is new or reworded since `en-baseline.json` must be on
 * the Hindi pass's list, so nothing is quietly left untranslated.
 */
describe('Hindi pending list (rebuild, 2026-11-19)', () => {
  it('lists every English key that is new or reworded since the baseline', () => {
    const changed = Object.keys(en).filter((key) => enBaseline[key] !== en[key])
    expect(changed.filter((key) => !HINDI_PENDING.includes(key))).toEqual([])
  })

  it('names only keys that exist in en.ts, each once', () => {
    expect(HINDI_PENDING.filter((key) => !(key in en))).toEqual([])
    expect(new Set(HINDI_PENDING).size).toBe(HINDI_PENDING.length)
  })

  it('lists nothing that is unchanged and already has its Hindi', () => {
    // A key comes off the list when the Hindi pass translates it.
    const done = HINDI_PENDING.filter((key) => enBaseline[key] === en[key] && (key in hi || key in hiSuite))
    expect(done).toEqual([])
  })
})

/**
 * PRODUCT.md rule 4: "Never a '42% hike!' headline above a 6% in-hand delta."
 * The in-hand ({bank}) figure has to lead the sentence in both verdicts, in
 * both languages — the paper ({paper}) figure comes second.
 */
describe('rule 4 — bad news first: in-hand leads, paper follows', () => {
  const VERDICT_KEYS = ['real-hike.verdict', 'counter-offer.verdict.out'] as const

  it('en: {bank} appears before {paper} in each verdict template', () => {
    for (const key of VERDICT_KEYS) {
      const template = dictionaries.en[key]
      expect(template.indexOf('{bank}')).toBeGreaterThanOrEqual(0)
      expect(template.indexOf('{paper}')).toBeGreaterThanOrEqual(0)
      expect(template.indexOf('{bank}')).toBeLessThan(template.indexOf('{paper}'))
    }
  })

  it('hi: {bank} appears before {paper} in each verdict template', () => {
    for (const key of VERDICT_KEYS) {
      const template = dictionaries.hi[key]
      expect(template.indexOf('{bank}')).toBeGreaterThanOrEqual(0)
      expect(template.indexOf('{paper}')).toBeGreaterThanOrEqual(0)
      expect(template.indexOf('{bank}')).toBeLessThan(template.indexOf('{paper}'))
    }
  })
})
