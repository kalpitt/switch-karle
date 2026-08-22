import { describe, expect, it } from 'vitest'
import { parseINRInput } from './money'

describe('parseINRInput', () => {
  it('blank is 0', () => {
    expect(parseINRInput('')).toBe(0)
    expect(parseINRInput('   ')).toBe(0)
  })

  it('accepts raw digits and Indian-grouped strings', () => {
    expect(parseINRInput('1200000')).toBe(1_200_000)
    expect(parseINRInput('12,00,000')).toBe(1_200_000)
    expect(parseINRInput('₹12,00,000')).toBe(1_200_000)
  })

  it('accepts L / lakh and Cr / crore suffixes', () => {
    expect(parseINRInput('12L')).toBe(1_200_000)
    expect(parseINRInput('12l')).toBe(1_200_000)
    expect(parseINRInput('12 Lakh')).toBe(1_200_000)
    expect(parseINRInput('1.5Cr')).toBe(15_000_000)
    expect(parseINRInput('2 crore')).toBe(20_000_000)
  })

  it('rejects junk rather than guessing', () => {
    expect(parseINRInput('foo')).toBeNaN()
    expect(parseINRInput('L')).toBeNaN()
    expect(parseINRInput('-1')).toBeNaN()
  })
})
