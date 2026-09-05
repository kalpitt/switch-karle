import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolsDir = dirname(fileURLToPath(import.meta.url))

/**
 * Pins the 2026-09-05 decision (docs/DECISIONS.md, "Current-job pay gets one
 * home"): current-job pay has exactly one shared record, and basic must never
 * merge with basic+DA. gratuity asks for basic + DA (PGA s.2(s)); every other
 * exit tool asks for plain basic and feeds it raw to its engine. One shared
 * field would hand a DA-drawing employee's wrong number to whichever tool read
 * it, silently.
 */
const TOOLS_READING_CURRENT_JOB = [
  'notice-buyout',
  'resignation-letter',
  'notice-tracker',
  'gratuity',
  'leave-encashment',
  'fnf-checker',
] as const

function read(tool: string): string {
  return readFileSync(join(toolsDir, tool, 'index.tsx'), 'utf8')
}

describe('current-job record: one home, basic and basic+DA never merge', () => {
  it('the three notice tools no longer seed from the Decoder — the wrong seed cannot return', () => {
    for (const tool of ['notice-buyout', 'resignation-letter', 'notice-tracker']) {
      const src = read(tool)
      expect(src.includes('../../data/defaults')).toBe(false)
    }
  })

  it('all six tools remember what the user types into the shared record', () => {
    for (const tool of TOOLS_READING_CURRENT_JOB) {
      const src = read(tool)
      expect(src).toMatch(/rememberCurrentJob/)
      expect(src).toMatch(/from ['"]\.\.\/\.\.\/data\/currentJob['"]/)
    }
  })

  it('gratuity is the only tool that reads or writes monthlyBasicDA', () => {
    for (const tool of TOOLS_READING_CURRENT_JOB) {
      const src = read(tool)
      const mentionsBasicDA = src.includes('monthlyBasicDA')
      expect(mentionsBasicDA).toBe(tool === 'gratuity')
    }
  })

  it('no tool maps monthlyBasicDA to anything other than lastDrawnBasicDA', () => {
    for (const tool of TOOLS_READING_CURRENT_JOB) {
      const src = read(tool)
      const mapping = src.match(/monthlyBasicDA:\s*'([^']+)'/)
      if (mapping) expect(mapping[1]).toBe('lastDrawnBasicDA')
    }
  })
})
