import { describe, expect, it } from 'vitest'
import { dictionaries, translate, translateOrFallback } from './index'

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
 * `translate()` falls back to English for any missing `hi` key, so a gap is
 * invisible at runtime — the app just quietly speaks English. That is how
 * bilingual products rot. The parity test below turns every gap into a build
 * failure, and this list turns each exception into a decision someone made on
 * purpose.
 *
 * To add a key: state why it stays English. "Not translated yet" is not a
 * reason — that is exactly what the test exists to catch.
 *
 * `flag.*` keys are not listed here and never need to be: they are engine-owned
 * English strings resolved through `translateOrFallback()`, which already falls
 * back to the sentence the engine built rather than to a raw key.
 */
const HINDI_EXEMPT: readonly string[] = []

describe('dictionary integrity', () => {
  it('every en key has a hi translation, or a documented exemption', () => {
    const missing = Object.keys(dictionaries.en).filter(
      (key) => !(key in dictionaries.hi) && !HINDI_EXEMPT.includes(key),
    )
    expect(missing).toEqual([])
  })

  it('has no stale entries in the Hindi exemption list', () => {
    const stale = HINDI_EXEMPT.filter(
      (key) => key in dictionaries.hi || !(key in dictionaries.en),
    )
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
