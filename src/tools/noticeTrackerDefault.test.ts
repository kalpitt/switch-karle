import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { noticeTracker } from '../engine/noticeTracker'

const toolsDir = dirname(fileURLToPath(import.meta.url))
const trackerSrc = readFileSync(join(toolsDir, 'notice-tracker', 'index.tsx'), 'utf8')

describe('Lead 4: notice-tracker resign-date default', () => {
  it('untouched initial state should be labeled as an example (e.g. via ExampleNote / isExample)', () => {
    // Like insurance-gap, bonus-clawback, and 14 other tools, unedited defaults
    // must be marked as an example so a user who has not resigned is not shown a live countdown presented as fact.
    expect(trackerSrc).toMatch(/ExampleNote/)
    expect(trackerSrc).toMatch(/isExample/)
  })

  /**
   * The original version of this test called noticeTracker() directly and
   * asserted the *arithmetic* changed for an untouched fixture — 89 days
   * left, not served. That's correct arithmetic for those inputs and the
   * brief for this fix says not to touch it: the engine has no notion of
   * "example", it only takes a resign date, a notice period and asOf. What
   * has to change is whether the UI presents that arithmetic as fact, via
   * the same isExample flag insurance-gap and bonus-clawback use to swap
   * VerdictBanner for ExampleNote. Adjusted to assert that instead.
   */
  it('the engine arithmetic for an untouched fixture is unchanged; only its presentation as fact is', () => {
    const result = noticeTracker({ resignDate: '2026-03-15', noticePeriodDays: 90, asOf: '2026-03-15' })
    expect(result.daysLeftOnNotice).toBe(89)
    expect(result.served).toBe(false)

    // isExample must compare the whole draft against the untouched default
    // (not just resignDate), so it also turns false the moment a save exists
    // or the notice period is inherited from a real, saved job.
    expect(trackerSrc).toMatch(/isExample\s*=\s*JSON\.stringify\(draft\)\s*===\s*JSON\.stringify\(emptyDraft\(\)\)/)
    // And the render swaps ExampleNote in for VerdictBanner while isExample is true.
    expect(trackerSrc).toMatch(/isExample \? \(\s*<ExampleNote/)
  })
})
