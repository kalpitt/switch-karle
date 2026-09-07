import { describe, expect, it } from 'vitest'
import { cliffs, switchCalendar } from '../../engine/switchCalendar'
import { buildDatesIcs } from '../../lib/ics'
import { planIcsEvents, CHECK_IN_DAYS } from './planEvents'

/**
 * Ravi from docs/DIRECTION.md Part 3: joined 12 January 2022, 90 days' notice,
 * the hike money lands in May, five-day week, asking on 6 September 2026.
 */
const RAVI = {
  joinDate: '2022-01-12',
  noticePeriodDays: 90,
  hikeCreditMonth: 5,
  workWeekDays: 5 as const,
  asOf: '2026-09-06',
}

/** Stands in for the i18n `t`: returns the key, so a test can see which ran. */
const t = (key: string) => key

describe('planIcsEvents', () => {
  const list = cliffs(RAVI)
  const events = planIcsEvents({ today: RAVI.asOf, resignDate: '2027-06-01', cliffs: list }, t)

  it('opens with a check-in seven days out, not with a date in 2027', () => {
    expect(events[0].uid).toBe('check-in')
    expect(events[0].date).toBe('2026-09-13')
    expect(CHECK_IN_DAYS).toBe(7)
  })

  it('carries the check-in, every cliff and the resign date', () => {
    expect(events.map((e) => e.uid)).toEqual([
      'check-in',
      'cliff-gratuity-5-day',
      'cliff-hike',
      'resign',
    ])
    expect(events.map((e) => e.date)).toEqual([
      '2026-09-13',
      '2026-07-21',
      '2027-05-31',
      '2027-06-01',
    ])
  })

  it('keeps a cliff that is already behind, because the plan still turns on it', () => {
    const gratuity = events.find((e) => e.uid === 'cliff-gratuity-5-day')
    expect(gratuity?.date).toBe('2026-07-21')
  })

  it('has a title on every event and never an empty one', () => {
    for (const event of events) expect(event.title.trim()).not.toBe('')
  })

  it('grows and shrinks with the cliffs rather than assuming Ravi', () => {
    // Someone six years in who skipped the hike month has no cliff at all:
    // check-in and the resign date, and nothing invented in between.
    const bare = planIcsEvents(
      { today: '2026-09-06', resignDate: '2026-12-01', cliffs: cliffs({ joinDate: '2018-04-01', noticePeriodDays: 60, workWeekDays: 6, asOf: '2026-09-06' }) },
      t,
    )
    expect(bare.map((e) => e.uid)).toEqual(['check-in', 'cliff-gratuity-6-day', 'resign'])
  })
})

describe('the file those events build', () => {
  const out = switchCalendar({ ...RAVI, targetResignDate: '2027-06-01' })
  const text = buildDatesIcs(
    planIcsEvents({ today: RAVI.asOf, resignDate: '2027-06-01', cliffs: out.cliffs }, t),
    'https://kalpit.me/switch-karle/',
    new Date('2026-09-06T09:00:00Z'),
  )

  it('has one VEVENT per event and all of them all-day', () => {
    expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(4)
    expect(text.match(/DTSTART;VALUE=DATE:/g)).toHaveLength(4)
  })

  it('relies on no VALARM, which Google Calendar would drop anyway', () => {
    expect(text).not.toContain('VALARM')
  })

  it('carries the site link in every event and no rupee figure anywhere', () => {
    expect(text.match(/URL:https:\/\/kalpit\.me\/switch-karle\//g)).toHaveLength(4)
    expect(text).not.toContain('₹')
  })
})
