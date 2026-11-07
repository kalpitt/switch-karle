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

  it('asks for no money on the way to a date: rule 11 puts it behind "what this is worth"', () => {
    // The one money field lives in WorthPanel, and WorthPanel is drawn only
    // where a resign date already exists: the recap and the return screen.
    const worthPanel = door.match(/function WorthPanel\([\s\S]*?\n\}\n/)?.[0] ?? ''
    expect(worthPanel).toMatch(/<MoneyField/)
    expect(door.match(/<MoneyField/g)).toHaveLength(1)
    expect(door).not.toMatch(/monthlyGross|monthlyBasic[^D]/)
    const screens = door.match(/export function Plan\([\s\S]*?\n\}\n/)?.[0] ?? ''
    expect(screens).not.toMatch(/<MoneyField|<WorthPanel/)
    const recap = door.match(/function Recap\([\s\S]*?\n\}\n/)?.[0] ?? ''
    const returnScreen = door.match(/function ReturnScreen\([\s\S]*?\n\}\n/)?.[0] ?? ''
    expect(recap).toMatch(/<WorthPanel/)
    expect(returnScreen).toMatch(/<WorthPanel/)
    // Basic + DA, never plain basic: the gratuity engine is on basic + DA.
    expect(worthPanel).toMatch(/t\('gratuity\.basic'\)/)
    expect(en['gratuity.basic']).toBe('Monthly basic + DA')
  })

  it('the basic + DA figure goes to currentJob, never to the plan, and not while on the example', () => {
    const choose = door.match(/function chooseBasicDA\([\s\S]*?\n  \}/)?.[0] ?? ''
    expect(choose).toMatch(/if \(!touched\) return setJob/)
    expect(choose).toMatch(/rememberCurrentJob\(\{ monthlyBasicDA: amount \}\)/)
    expect(choose).not.toMatch(/savePlan/)
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

describe('outbound actions stay behind the unlock', () => {
  const outbound = ACTION_IDS.slice(4)

  it('the outbound ids exist to be checked against', () => {
    expect(outbound).toContain('message-one-ex-colleague')
    expect(outbound).toContain('update-public-headline')
  })

  it('the door file draws no action itself — ActionList does, off visibleActions', () => {
    for (const id of ACTION_IDS) expect(door).not.toContain(id)
    expect(door).toMatch(/<ActionList/)
  })

  it('ActionList only maps what visibleActions returned, never ACTIONS directly', () => {
    const list = readFileSync(join(toolsDir, 'plan', 'ActionList.tsx'), 'utf8')
    expect(list).toMatch(/visibleActions\(/)
    expect(list).not.toMatch(/ACTIONS\.map|ACTION_IDS/)
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

  it('renders ExampleNote on the questions, and plan.example.laterNote on the dates, recap and return screen when untouched', () => {
    expect(door).toMatch(/step === 'questions'[\s\S]*?!touched && <ExampleNote[\s\S]*?plan\.example\.note/)

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

  it('shows plan.calendar.downloaded under the button only after a tap, in a live region', () => {
    expect(door).toMatch(/role="status"[^>]*>\s*\{downloaded \? t\('plan\.calendar\.downloaded'\) : null\}/)
    expect(door).toMatch(/plan\.calendar\.downloaded/)
    expect(en['plan.calendar.downloaded']).toBe(
      'dates.ics is in your downloads. Open it and your calendar app adds the dates.',
    )
  })

  it('startOver resets the downloaded state', () => {
    const startOver = door.match(/function startOver\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(startOver).toMatch(/setDownloaded\(false\)/)
  })

  it('a moved resign date is named above the button, and the stale download line goes', () => {
    const pick = door.match(/function pickResignDate\(date: string\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(pick).toMatch(/resignDatesMovedFrom\(m, plan\.resignDate, date\)/)
    expect(pick).toMatch(/setDownloaded\(false\)/)
    const startOver = door.match(/function startOver\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(startOver).toMatch(/resignDatesMovedFrom\(m, plan\.resignDate, undefined\)/)
    const button = door.match(/function CalendarButton\([\s\S]*?\n\}\n/)?.[0] ?? ''
    expect(button.indexOf('plan.calendar.moved')).toBeGreaterThan(-1)
    expect(button.indexOf('plan.calendar.moved')).toBeLessThan(button.indexOf('plan.calendar.cta'))
    expect(door.match(/movedFrom=\{props\.movedFrom\}/g)).toHaveLength(2)
  })

  it("plan.calendar.note no longer calls the dates 'your cliffs'", () => {
    expect(en['plan.calendar.note']).not.toMatch(/your cliffs/)
    expect(en['plan.calendar.note']).toMatch(/your resign date/)
  })
})

describe('the week is asked only when it changes a date, and each screen change moves focus', () => {
  it('the questions cannot go on while a live fork is unanswered, and say why instead of greying out', () => {
    expect(door).toMatch(/weekChangesADate\(forkCliffs, input\.asOf, input\.noticePeriodDays\)/)
    expect(door).toMatch(/dateStepReachable\(coveredByAct, forkCliffs\.length === 2, job\.workWeekDays, weekMatters\)/)
    const submit = door.match(/function submitQuestions\(\)[\s\S]*?\n  \}/)?.[0] ?? ''
    expect(submit).toMatch(/if \(!reachable\) \{\s*\n\s*setWeekBlocked\(true\)/)
    expect(submit.indexOf('setWeekBlocked(true)')).toBeLessThan(submit.indexOf("setStep('dates')"))
  })

  it('the fork shows only when the week matters, and the blocked ask uses the alarm colour as an alert', () => {
    const live = door.match(/function LiveDates\([\s\S]*?\n\}\n/)?.[0] ?? ''
    expect(live).toMatch(/const fork = props\.coveredByAct && props\.weekMatters/)
    expect(live).toMatch(/role=\{props\.weekBlocked \? 'alert' : undefined\}[\s\S]*?text-alarm[\s\S]*?plan\.week\.ask/)
  })

  it('never names one gratuity reading before the answer when the answer would change it', () => {
    expect(door).toMatch(/gratuityToSpeakOf\(forkCliffs, job\.workWeekDays, weekMatters\)/)
  })

  it('a screen change scrolls to its top and focuses its heading; loading a saved plan does not', () => {
    const effect = door.match(/\/\/ Every screen change opens at its own top[\s\S]*?\n  \}\)/)?.[0] ?? ''
    expect(effect).toMatch(/scrollIntoView\?\.\(\{ block: 'start' \}\)/)
    expect(effect).toMatch(/\[data-step-heading\]/)
    expect(effect).toMatch(/focus\?\.\(\{ preventScroll: true \}\)/)
    const mount = door.match(/useEffect\(\(\) => \{\s*\n\s*const savedJob = loadCurrentJob\(\)[\s\S]*?\n  \}, \[\]\)/)?.[0] ?? ''
    expect(mount).not.toMatch(/pendingFocus/)
    for (const fn of ['submitQuestions', 'pickResignDate', 'goToQuestions', 'changeDate', 'startOver']) {
      const body = door.match(new RegExp(`function ${fn}\\([\\s\\S]*?\\n  \\}`))?.[0] ?? ''
      expect(body, fn).toMatch(/pendingFocus\.current = 'heading'/)
    }
    expect(door.match(/data-step-heading/g)!.length).toBeGreaterThanOrEqual(3)
  })
})

describe('the late warning follows the date in the box, and impossible answers cannot be submitted', () => {
  it('TradeOption computes the late line from startApplyingByPassed(value, today) for a card with a picker', () => {
    const engineImport = door.match(/import \{[^}]*\} from '\.\.\/\.\.\/engine\/switchCalendar'/)?.[0] ?? ''
    expect(engineImport).toMatch(/\bstartApplyingByPassed,/)
    const tradeOption = door.match(/function TradeOption\([\s\S]*?\)\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
    expect(tradeOption).toMatch(/startApplyingByPassed\(value, props\.today\)/)
    expect(tradeOption).not.toMatch(/\{trade\.startApplyingByPassed && \(/)
  })

  it('the dates judge "ahead" and the gratuity line the way the engine does, notice included', () => {
    for (const name of ['LiveDates', 'DatesSummary']) {
      const screen = door.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}\\n`))?.[0] ?? ''
      expect(screen, name).toMatch(/stillAhead\(c, props\.today, props\.noticePeriodDays\)/)
      expect(screen, name).not.toMatch(/cliffs\.filter\(\(c\) => !c\.passed\)/)
    }
    const screen = door.match(/function DatesSummary\([\s\S]*?\n\}\n/)?.[0] ?? ''
    expect(screen).toMatch(/gratuityResignFrom\(speak\.date, props\.noticePeriodDays\)/)
    expect(screen).toMatch(/plan\.gratuity\.notice/)
    expect(en['plan.gratuity.notice']).toMatch(/you lose it/)
  })

  it('the join date cannot be set in the future', () => {
    expect(door).toMatch(/<DateField[\s\S]*?label=\{t\('plan\.q\.join'\)\}[\s\S]*?max=\{today === '' \? undefined : today\}/)
  })

  it('the notice field cannot go below 1, and a missing answer is named under its field, not hidden behind a greyed button', () => {
    expect(door).toMatch(/<NumberField[\s\S]*?label=\{t\('plan\.q\.notice'\)\}[\s\S]*?min=\{1\}/)
    expect(door).toMatch(/answerProblems\(answers\.joinDate, answers\.noticePeriodDays, today\)/)
    expect(door).toMatch(/error=\{showErrors && problems\.includes\('join'\) \? t\('plan\.q\.err\.join'\) : undefined\}/)
    expect(door).toMatch(/error=\{showErrors && problems\.includes\('notice'\) \? t\('plan\.q\.err\.notice'\) : undefined\}/)
    // Disabled only before the page is live, and then it says so.
    expect(door).toMatch(/disabled=\{today === ''\} aria-busy=\{today === ''\}/)
    expect(door).toMatch(/today === '' \? t\('plan\.q\.loading'\) : t\('plan\.q\.next'\)/)
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
