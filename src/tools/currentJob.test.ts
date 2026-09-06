import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolsDir = dirname(fileURLToPath(import.meta.url))

/**
 * Pins the 2026-09-05 decision (docs/DECISIONS.md, "Current-job pay gets one
 * home"): current-job pay has exactly one shared record, and basic must never
 * merge with basic+DA. gratuity asks for basic + DA (source: the VERIFIED marker in src/engine/gratuity.ts); every other
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

  it('the two seed-only fields are declared seed-only, not shared', () => {
    // notice-buyout's unserved days and fnf-checker's claimed gross are never
    // written back to the record, so re-applying the record over a saved draft
    // destroys what the user typed. Both bugs were reproduced in a browser.
    // The maps are written across several lines, so match the whole call.
    const buyout = read('notice-buyout')
    expect(buyout).toMatch(/seedOnly:\s*\{\s*noticePeriodDays:\s*'unservedDays'/)
    expect(buyout).not.toMatch(/shared:\s*\{[^}]*noticePeriodDays/)

    const fnf = read('fnf-checker')
    expect(fnf).toMatch(/seedOnly:\s*\{\s*monthlyGross:\s*'monthlyGross'/)
    expect(fnf).not.toMatch(/shared:\s*\{[^}]*monthlyGross/)
  })

  it('every tool that fills from the record says whether it has a saved draft', () => {
    // fillFromCurrentJob's last argument is what keeps seed-only fields off a
    // saved draft. A tool that hardcodes `false` there would re-introduce the bug.
    for (const tool of TOOLS_READING_CURRENT_JOB) {
      const src = read(tool)
      if (!src.includes('fillFromCurrentJob')) continue
      expect(src).toMatch(/saved\s*!=\s*null/)
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
