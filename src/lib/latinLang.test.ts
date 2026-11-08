import { describe, expect, it } from 'vitest'
import { latinLang } from './latinLang'

describe('latinLang', () => {
  it('marks an all-Latin name on a Hindi page as English', () => {
    expect(latinLang('Notice tracker', 'hi')).toBe('en')
    expect(latinLang('F&F checker', 'hi')).toBe('en')
  })

  it('leaves code-mixed and Devanagari text Hindi', () => {
    expect(latinLang('Offers की तुलना', 'hi')).toBeUndefined()
    expect(latinLang('आपका offer', 'hi')).toBeUndefined()
  })

  it('does nothing on an English page, or for text with no letters', () => {
    expect(latinLang('Notice tracker', 'en')).toBeUndefined()
    expect(latinLang('404', 'hi')).toBeUndefined()
  })
})
