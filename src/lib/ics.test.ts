import { describe, expect, it } from 'vitest'
import { DATES_ICS_FILENAME, buildDatesIcs, type IcsEvent } from './ics'

/** The link the UI builds from SITE + BASE in site.config.mjs. Never typed here either. */
const SITE_URL = 'https://kalpit.me/switch-karle/'
const NOW = new Date(Date.UTC(2026, 8, 7, 4, 30, 0))

/** Ravi's file: the check-in that can bring him back, his cliffs, and his date. */
const RAVI: IcsEvent[] = [
  { uid: 'check-in', date: '2026-09-14', title: 'Check my dates' },
  { uid: 'cliff-gratuity', date: '2026-07-21', title: 'Gratuity: safe from today' },
  { uid: 'cliff-hike', date: '2027-05-31', title: 'Hike lands this month' },
  { uid: 'resign', date: '2027-06-01', title: 'Resign today', description: 'Notice: 90 days' },
]

function unfold(ics: string): string {
  return ics.replace(/\r\n /g, '')
}

function lines(ics: string): string[] {
  return unfold(ics).split('\r\n')
}

describe('buildDatesIcs', () => {
  it('is a whole calendar, terminated with CRLF and no bare newline anywhere', () => {
    const ics = buildDatesIcs(RAVI, SITE_URL, NOW)
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('PRODID:-//Switch Karle//dates//EN')
  })

  it('parses: every BEGIN has its END, and there are as many events as dates', () => {
    const ics = buildDatesIcs(RAVI, SITE_URL, NOW)
    const l = lines(ics)
    expect(l.filter((x) => x === 'BEGIN:VEVENT')).toHaveLength(4)
    expect(l.filter((x) => x === 'END:VEVENT')).toHaveLength(4)
    for (const line of l.filter((x) => x !== '')) {
      // Every content line is NAME[;PARAM]:VALUE — the shape a parser needs.
      expect(line).toMatch(/^[A-Z-]+[^:]*:/)
    }
  })

  it('every event is all-day, with DTEND on the day after DTSTART', () => {
    const ics = buildDatesIcs(RAVI, SITE_URL, NOW)
    expect(ics).toContain('DTSTART;VALUE=DATE:20270601')
    expect(ics).toContain('DTEND;VALUE=DATE:20270602')
    // Month end, and a leap day, are where a naive +1 breaks.
    expect(ics).toContain('DTSTART;VALUE=DATE:20270531')
    expect(ics).toContain('DTEND;VALUE=DATE:20270601')
    const leap = buildDatesIcs([{ uid: 'x', date: '2028-02-29', title: 'A' }], SITE_URL, NOW)
    expect(leap).toContain('DTEND;VALUE=DATE:20280301')
    const yearEnd = buildDatesIcs([{ uid: 'x', date: '2026-12-31', title: 'A' }], SITE_URL, NOW)
    expect(yearEnd).toContain('DTEND;VALUE=DATE:20270101')
    expect(ics).not.toContain('DTSTART:')
    expect(ics).not.toMatch(/DTSTART[^\r\n]*T\d{6}/)
  })

  /**
   * Google Calendar drops custom alarms on import, so an alarm is not a
   * reminder. The event on the day is the mechanism, and shipping a VALARM
   * would let someone believe a reminder exists when it does not.
   */
  it('carries no VALARM', () => {
    const ics = buildDatesIcs(RAVI, SITE_URL, NOW)
    expect(ics).not.toContain('VALARM')
    expect(ics).not.toContain('TRIGGER')
  })

  it('gives every event its own stable UID', () => {
    const ics = buildDatesIcs(RAVI, SITE_URL, NOW)
    const uids = lines(ics).filter((l) => l.startsWith('UID:'))
    expect(uids).toHaveLength(4)
    expect(new Set(uids).size).toBe(4)
    expect(uids).toContain('UID:resign-20270601@kalpit.me')
    // The same input twice is the same file: re-importing updates, never duplicates.
    expect(buildDatesIcs(RAVI, SITE_URL, NOW)).toBe(ics)
  })

  it('escapes a comma, a semicolon, a backslash and a newline', () => {
    const ics = buildDatesIcs(
      [
        {
          uid: 'resign',
          date: '2027-06-01',
          title: 'Resign, then serve notice; 90 days',
          description: 'Line one\nLine two \\ end',
        },
      ],
      SITE_URL,
      NOW,
    )
    const l = lines(ics)
    expect(l).toContain('SUMMARY:Resign\\, then serve notice\\; 90 days')
    expect(l.some((x) => x.includes('Line one\\nLine two \\\\ end'))).toBe(true)
    // The escapes are literal text, not real separators: the line count is unchanged.
    expect(l.filter((x) => x === 'BEGIN:VEVENT')).toHaveLength(1)
  })

  it('puts the site link in both the URL property and the description, never a literal', () => {
    const ics = buildDatesIcs(RAVI, SITE_URL, NOW)
    expect(ics).not.toContain('switchkarle.fyi')
    expect(lines(ics).filter((l) => l === `URL:${SITE_URL}`)).toHaveLength(4)
    expect(lines(ics)).toContain(`DESCRIPTION:Notice: 90 days\\n${SITE_URL}`)
    expect(lines(ics)).toContain(`DESCRIPTION:${SITE_URL}`)
    // A cutover moves it for free, including inside the UIDs.
    const moved = buildDatesIcs(RAVI, 'https://switchkarle.example/', NOW)
    expect(moved).toContain('URL:https://switchkarle.example/')
    expect(moved).toContain('@switchkarle.example')
    expect(moved).not.toContain('kalpit.me')
  })

  it('folds a long line at 75 octets without splitting a Hindi character', () => {
    const hindi = 'इस्तीफ़ा देने का दिन, नोटिस पीरियड नब्बे दिन का है और आख़िरी दिन अगस्त में'
    const ics = buildDatesIcs([{ uid: 'resign', date: '2027-06-01', title: hindi }], SITE_URL, NOW)
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
    expect(ics).not.toContain('�')
    expect(unfold(ics)).toContain(`SUMMARY:${hindi.replace(/,/g, '\\,')}`)
  })

  it('is a valid file even with no events, and with an unparseable site URL', () => {
    expect(buildDatesIcs([], SITE_URL, NOW)).toBe(
      'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Switch Karle//dates//EN\r\n' +
        'CALSCALE:GREGORIAN\r\nEND:VCALENDAR\r\n',
    )
    const odd = buildDatesIcs([{ uid: 'x', date: '2027-06-01', title: 'A' }], 'not a url', NOW)
    expect(odd).toContain('UID:x-20270601@switch-karle')
  })

  it('refuses a date that is not ISO rather than writing a broken event', () => {
    expect(() =>
      buildDatesIcs([{ uid: 'x', date: '01/06/2027', title: 'A' }], SITE_URL, NOW),
    ).toThrow(/YYYY-MM-DD/)
  })

  it('downloads as dates.ics', () => {
    expect(DATES_ICS_FILENAME).toBe('dates.ics')
  })
})
