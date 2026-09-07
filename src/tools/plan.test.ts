import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ACTION_IDS } from '../data/plan'
import { en } from '../i18n/en'

const toolsDir = dirname(fileURLToPath(import.meta.url))
const door = readFileSync(join(toolsDir, 'plan', 'index.tsx'), 'utf8')
const home = readFileSync(join(toolsDir, 'home', 'index.tsx'), 'utf8')

/**
 * Source-text guards, in the style of `currentJob.test.ts`. They pin the two
 * splits Phase 0 is easiest to get wrong: one home per fact, and no outbound
 * action before its date.
 */
describe('the door writes each fact to its own record', () => {
  it('join date and notice period go to currentJob, through rememberCurrentJob', () => {
    expect(door).toMatch(/from ['"]\.\.\/\.\.\/data\/currentJob['"]/)
    expect(door).toMatch(/rememberCurrentJob\(\{\s*\n?\s*joinDate: answers\.joinDate/)
    expect(door).toMatch(/noticePeriodDays: answers\.noticePeriodDays/)
  })

  it('the work week and Act coverage are facts about the employer, not the plan', () => {
    expect(door).toMatch(/rememberCurrentJob\(\{ workWeekDays/)
    expect(door).toMatch(/rememberCurrentJob\(\{ coveredByAct/)
  })

  it('never stores join date, notice period, work week or Act coverage in the plan', () => {
    // A second copy is how someone types a join date once and sees two
    // different gratuity dates. Every savePlan call is checked, not just one.
    for (const call of door.match(/savePlan\([\s\S]*?\)\n/g) ?? []) {
      expect(call).not.toMatch(/joinDate|noticePeriodDays|workWeekDays|coveredByAct/)
    }
  })

  it('asks for no money anywhere: rule 11 puts money after a date', () => {
    expect(door).not.toMatch(/MoneyField|monthlyBasic|monthlyGross|formatINR/)
  })
})

describe('Phase 0 renders no outbound action', () => {
  const outbound = ACTION_IDS.slice(4)

  it('the outbound ids exist to be checked against', () => {
    expect(outbound).toContain('message-one-ex-colleague')
    expect(outbound).toContain('update-public-headline')
  })

  it('no action id at all reaches the screen — the tick boxes are Phase 1', () => {
    for (const id of ACTION_IDS) expect(door).not.toContain(id)
  })

  it('and no English copy for one has been written either', () => {
    for (const id of outbound) {
      expect(Object.keys(en).some((key) => key.includes(id))).toBe(false)
    }
  })

  it('the looking tap sets lookingSince and never touches the resign date', () => {
    const looking = door.match(/function startLooking\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(looking).toMatch(/savePlan\(\{ lookingSince: today \}\)/)
    expect(looking).not.toMatch(/resignDate/)
  })
})

describe('the home island is the door', () => {
  it('imports the plan and renders it', () => {
    expect(home).toMatch(/import \{ Plan \} from ['"]\.\.\/plan['"]/)
    expect(home).toMatch(/<Plan\b/)
  })

  it('no longer puts the board in front of a stranger', () => {
    expect(home).not.toMatch(/<Tracker\b/)
    expect(home).not.toMatch(/from ['"]\.\.\/\.\.\/components\/Tracker['"]/)
  })

  it('keeps the tracker one tap away rather than deleting it', () => {
    expect(home).toMatch(/withLang\(lang, 'tracker'\)/)
  })
})
