import { describe, expect, it } from 'vitest'
import { extractJsonObject } from './extractJsonObject'

const JSON_TEXT = '{"version":1,"applications":[]}'

describe('extractJsonObject', () => {
  it('leaves a bare JSON object alone', () => {
    expect(extractJsonObject(JSON_TEXT)).toBe(JSON_TEXT)
  })

  it('trims surrounding whitespace', () => {
    expect(extractJsonObject(`\n\n  ${JSON_TEXT}  \n`)).toBe(JSON_TEXT)
  })

  it('strips a ```json fence', () => {
    expect(extractJsonObject('```json\n' + JSON_TEXT + '\n```')).toBe(JSON_TEXT)
  })

  it('strips a bare triple-backtick fence', () => {
    expect(extractJsonObject('```\n' + JSON_TEXT + '\n```')).toBe(JSON_TEXT)
  })

  it('strips a fence with trailing whitespace after it', () => {
    expect(extractJsonObject('```json\n' + JSON_TEXT + '\n```   \n\n')).toBe(JSON_TEXT)
  })

  // The case that sent a valid answer to the invalid-JSON dead end.
  it('survives a natural-language preamble before the fence', () => {
    expect(extractJsonObject('Here is the JSON search result:\n```json\n' + JSON_TEXT + '\n```')).toBe(
      JSON_TEXT,
    )
  })

  it('survives a postscript after the fence', () => {
    expect(
      extractJsonObject('```json\n' + JSON_TEXT + '\n```\n\nLet me know if you want more detail.'),
    ).toBe(JSON_TEXT)
  })

  it('survives a preamble with no fence at all', () => {
    expect(extractJsonObject('Sure! ' + JSON_TEXT)).toBe(JSON_TEXT)
  })

  it('keeps braces that belong to the object', () => {
    const nested = '{"version":1,"applications":[{"company":"Acme"}]}'
    expect(extractJsonObject('```json\n' + nested + '\n```')).toBe(nested)
  })

  it('leaves text with no object unchanged, so the caller reports it honestly', () => {
    expect(extractJsonObject('I could not find any applications.')).toBe(
      'I could not find any applications.',
    )
  })

  it('does not trip on a backtick inside a value', () => {
    const withTick = '{"company":"O`Brien Labs"}'
    expect(extractJsonObject(withTick)).toBe(withTick)
  })
})
