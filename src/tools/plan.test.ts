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

describe('the calendar download works on phones and says what happened', () => {
  it('downloadDates hands the blob to the shared downloadBlob helper, not a bare createObjectURL/click/revoke', () => {
    expect(door).toMatch(/import \{ downloadBlob \} from ['"]\.\.\/\.\.\/lib\/downloadBlob['"]/)
    const downloadDates = door.match(/function downloadDates\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(downloadDates).toMatch(/downloadBlob\(/)
    expect(downloadDates).not.toMatch(/createObjectURL|revokeObjectURL|\.click\(\)/)
  })

  it('shows plan.calendar.downloaded under the button only after a tap', () => {
    expect(door).toMatch(/downloaded && \(/)
    expect(door).toMatch(/plan\.calendar\.downloaded/)
    expect(en['plan.calendar.downloaded']).toBe(
      'dates.ics is in your downloads. Open it and your calendar app adds the dates.',
    )
  })

  it('startOver resets the downloaded state', () => {
    const startOver = door.match(/function startOver\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(startOver).toMatch(/setDownloaded\(false\)/)
  })

  it("plan.calendar.note no longer calls the dates 'your cliffs'", () => {
    expect(en['plan.calendar.note']).not.toMatch(/your cliffs/)
    expect(en['plan.calendar.note']).toMatch(/the dates above/)
  })
})

describe('the week must be chosen before the dates, and each step opens at its top', () => {
  it('CliffScreen gates "Next" on dateStepReachable instead of calling onNext directly', () => {
    expect(door).toMatch(/import \{ chosenGratuityCliff, dateStepReachable, isGratuityCliff \} from ['"]\.\/fork['"]/)
    const cliffScreen = door.match(/function CliffScreen\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(cliffScreen).toMatch(/dateStepReachable\(/)
    expect(cliffScreen).toMatch(/<PrimaryButton onClick=\{handleNext\}>/)
  })

  it('the blocked re-ask of plan.week.ask uses the alarm colour already used for a late trade', () => {
    const cliffScreen = door.match(/function CliffScreen\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(cliffScreen).toMatch(/blocked[\s\S]*?text-alarm[\s\S]*?plan\.week\.ask/)
  })

  it('shows the plain week ask only when not blocked, and the alarm ask only when blocked', () => {
    const cliffScreen = door.match(/function CliffScreen\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(cliffScreen).toMatch(/!blocked && props\.workWeekDays === undefined[\s\S]*?plan\.week\.ask/)
    expect(cliffScreen).toMatch(/blocked && props\.workWeekDays === undefined[\s\S]*?text-alarm[\s\S]*?plan\.week\.ask/)
  })

  it('every step, repicking and recap swap scrolls the container back to its top, skipping the first mount', () => {
    const scrollEffect = door.match(/\/\/ Every step, repicking and recap swap[\s\S]*?\n  \}, \[[\s\S]*?\]\)/)?.[0] ?? ''
    expect(scrollEffect).toMatch(/mounted\.current = true\s*\n\s*return/)
    expect(scrollEffect).toMatch(/scrollIntoView\(\{ block: 'start' \}\)/)
    expect(scrollEffect).toMatch(/\[step, repicking, returning, hasResignDate\]/)
  })
})

describe('the late warning follows the date in the box, and impossible answers cannot be submitted', () => {
  it('TradeOption computes the late line from startApplyingByPassed(value, today) for a card with a picker', () => {
    expect(door).toMatch(
      /import \{\s*\n?\s*cliffs as computeCliffs,\s*\n?\s*hikeCliffDate,\s*\n?\s*startApplyingByPassed,/,
    )
    const tradeOption = door.match(/function TradeOption\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(tradeOption).toMatch(/startApplyingByPassed\(value, props\.today\)/)
    expect(tradeOption).not.toMatch(/\{trade\.startApplyingByPassed && \(/)
  })

  it('the join date cannot be set in the future', () => {
    expect(door).toMatch(/<DateField[\s\S]*?label=\{t\('plan\.q\.join'\)\}[\s\S]*?max=\{today === '' \? undefined : today\}/)
  })

  it('the notice field cannot go below 1, and 0 or blank keeps "See my dates" disabled', () => {
    expect(door).toMatch(/<NumberField[\s\S]*?label=\{t\('plan\.q\.notice'\)\}[\s\S]*?min=\{1\}/)
    expect(door).toMatch(/disabled=\{!questionsSubmittable\(answers\.joinDate, answers\.noticePeriodDays, today\)\}/)
  })

  it('the notice field on the door opts into allowBlank', () => {
    expect(door).toMatch(/<NumberField[\s\S]*?label=\{t\('plan\.q\.notice'\)\}[\s\S]*?allowBlank/)
  })
})

describe('the hike months run in calendar order from next month', () => {
  it('the Select options come from hikeMonthOrder(today), not a fixed 1-to-12 list', () => {
    expect(door).toMatch(/import \{ hikeMonthOrder \} from ['"]\.\/hikeMonthOrder['"]/)
    expect(door).toMatch(/\.\.\.hikeMonthOrder\(today\)\.map\(\(m\) => \(\{ value: String\(m\), label: monthLabel\(m, today, lang\) \}\)\)/)
    expect(door).not.toMatch(/const MONTHS = /)
  })

  it("'Skip this' is still the first option, values still the bare month numbers", () => {
    const options = door.match(/options=\{\[[\s\S]*?\]\}/)?.[0] ?? ''
    expect(options).toMatch(/\{ value: '0', label: t\('plan\.q\.hikeSkip'\) \},\s*\n\s*\.\.\.hikeMonthOrder/)
  })
})

describe('the reason line saves itself on blur and Enter', () => {
  it('ReasonBox saves on blur, on Enter (without a shift key) and still on the button', () => {
    const reasonBox = door.match(/function ReasonBox\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(reasonBox).toMatch(/onBlur=\{save\}/)
    expect(reasonBox).toMatch(/e\.key !== 'Enter' \|\| e\.shiftKey/)
    expect(reasonBox).toMatch(/onClick=\{save\}/)
    // Exactly one write path, so the untouched-example guard already inside
    // onReason (saveReason) covers all three the same way.
    expect(reasonBox.match(/onReason\(draft\)/g)).toHaveLength(1)
  })

  it('TextArea passes onBlur and onKeyDown through to the textarea itself', () => {
    const ui = readFileSync(join(toolsDir, '..', 'components', 'ui.tsx'), 'utf8')
    const textArea = ui.match(/export function TextArea\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(textArea).toMatch(/onBlur=\{props\.onBlur\}/)
    expect(textArea).toMatch(/onKeyDown=\{props\.onKeyDown\}/)
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
