import { describe, expect, it } from 'vitest'
import { toolTitle, withBrand } from './pageTitle'

const def = { seoTitle: 'Expected CTC reply', titleKey: 'hr.expected-ctc.title' }

describe('page titles', () => {
  it('English uses the registry title, Hindi the Hindi tool name', () => {
    expect(toolTitle(def, 'en', { 'hr.expected-ctc.title': 'Expected CTC का जवाब' })).toBe('Expected CTC reply')
    expect(toolTitle(def, 'hi', { 'hr.expected-ctc.title': 'Expected CTC का जवाब' })).toBe('Expected CTC का जवाब')
  })

  it('falls back to the English title when the Hindi name is missing', () => {
    expect(toolTitle(def, 'hi', {})).toBe('Expected CTC reply')
  })

  it('adds the brand in the page language', () => {
    expect(withBrand('Gratuity calculator', 'en')).toBe('Gratuity calculator — Switch Karle')
    expect(withBrand('Gratuity calculator', 'hi')).toBe('Gratuity calculator — Switch Karle')
  })
})
