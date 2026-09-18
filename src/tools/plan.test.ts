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

  it('reads a skipped hike month back as skipped, not as the example month', () => {
    // Rule 7. Someone who tapped "skip this" and closed the tab has answered
    // the question; the plan simply holds no month for them. Falling back to
    // EXAMPLE on the next visit shows May with no Example chip beside it and
    // invents a cliff that moves their earliest clean date.
    const mount = door.match(/setAnswers\(\{[\s\S]*?\}\)/)?.[0] ?? ''
    expect(mount).toMatch(/hikeCreditMonth:\s*\n?\s*savedPlan\.hikeCreditMonth \?\? \(answeredBefore \? 0 : EXAMPLE\.hikeCreditMonth\)/)
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

describe('an untouched example is marked as an example on every screen, and never saved', () => {
  it('guards every savePlan call with touched', () => {
    const submitQuestions = door.match(/function submitQuestions\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    const pickResignDate = door.match(/function pickResignDate\([\s\S]*?\n  \}/)?.[0] ?? ''
    const startLooking = door.match(/function startLooking\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    const saveReason = door.match(/function saveReason\([\s\S]*?\n  \}/)?.[0] ?? ''

    expect(submitQuestions).toMatch(/if\s*\(touched\)\s*\{[\s\S]*?savePlan\(/)
    expect(pickResignDate).toMatch(/if\s*\(touched\)\s*\{?[\s\S]*?savePlan\(/)
    expect(startLooking).toMatch(/if\s*\(touched\)\s*\{?[\s\S]*?savePlan\(/)
    expect(saveReason).toMatch(/if\s*\(touched\)\s*\{?[\s\S]*?savePlan\(/)
  })

  it('renders ExampleNote with plan.example.laterNote on cliffs, dates, recap and return screen when untouched', () => {
    expect(door).toMatch(/plan\.example\.laterNote/)

    const cliffScreen = door.match(/function CliffScreen\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(cliffScreen).toMatch(/ExampleNote[\s\S]*?plan\.example\.laterNote/)

    expect(door).toMatch(/step === 'dates'[\s\S]*?ExampleNote[\s\S]*?plan\.example\.laterNote/)

    const recap = door.match(/function Recap\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(recap).toMatch(/ExampleNote[\s\S]*?plan\.example\.laterNote/)

    const returnScreen = door.match(/function ReturnScreen\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(returnScreen).toMatch(/ExampleNote[\s\S]*?plan\.example\.laterNote/)
  })

  it('the Example chip on later screens is tappable back to questions', () => {
    expect(door).toMatch(/onChipClick/)
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
