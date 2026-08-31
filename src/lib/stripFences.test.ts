import { describe, expect, it } from 'vitest'
import { stripFences } from '../lib/stripFences'

describe('stripFences', () => {
  it('handles a bare JSON string without fences', () => {
    const raw = '{"version":1,"applications":[]}'
    expect(stripFences(raw)).toBe('{"version":1,"applications":[]}')
  })

  it('strips ```json code fences', () => {
    const raw = '```json\n{"version":1,"applications":[]}\n```'
    expect(stripFences(raw)).toBe('{"version":1,"applications":[]}')
  })

  it('strips a bare triple-backtick fence', () => {
    const raw = '```\n{"version":1,"applications":[]}\n```'
    expect(stripFences(raw)).toBe('{"version":1,"applications":[]}')
  })

  it('strips fences with leading and trailing whitespace', () => {
    const raw = '  \n```json\n{"version":1,"applications":[]}\n```  \n\n'
    expect(stripFences(raw)).toBe('{"version":1,"applications":[]}')
  })

  it('preserves text that merely contains backticks mid-string', () => {
    const raw = '{"version":1,"applications":[{"company":"Foo`s Bar","role":"Engineer`"}]}'
    expect(stripFences(raw)).toBe(
      '{"version":1,"applications":[{"company":"Foo`s Bar","role":"Engineer`"}]}',
    )
  })
})
