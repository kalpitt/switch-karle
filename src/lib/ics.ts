/**
 * The calendar file. A pure string builder: iCalendar text in, nothing else.
 *
 * This is the only way the product can reach anyone once the tab is closed, so
 * it ships in Phase 0 rather than being cut (docs/DIRECTION.md Part 13).
 *
 * Two rules the file itself has to keep. **It carries no money and no company
 * name**, because it may land in a work calendar — this module never sees
 * either, and the caller must not put them in a title. And **it does not rely
 * on `VALARM`**: Google Calendar drops custom alarms on import, so an alarm is
 * not a reminder. The all-day event on the day is the mechanism, which is why
 * every event here is `VALUE=DATE`.
 *
 * Titles arrive already translated. Engines and builders return ids, never
 * English, and this file has both languages passing through it.
 */

/** The download name. One file, several events. */
export const DATES_ICS_FILENAME = 'dates.ics'

const PRODID = '-//Switch Karle//dates//EN'

export interface IcsEvent {
  /**
   * Stable per-event fragment of the UID — `resign`, `cliff-hike`, `check-in`.
   * Re-importing the same file must update the event rather than duplicate it,
   * which is what a stable UID buys.
   */
  uid: string
  /** The day it falls on, ISO `YYYY-MM-DD`. Every event is all-day. */
  date: string
  /** Already translated. No rupee figure and no company name. */
  title: string
  /** Already translated, and optional. The site link is appended for you. */
  description?: string
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** `2027-06-01` to `20270601`, the DATE form iCalendar wants. */
function icsDate(iso: string): string {
  const match = ISO.exec(iso)
  if (!match) throw new Error(`ics: expected YYYY-MM-DD, got ${JSON.stringify(iso)}`)
  return `${match[1]}${match[2]}${match[3]}`
}

/** The day after `iso`. DTEND on an all-day event is exclusive. */
function nextDay(iso: string): string {
  const match = ISO.exec(iso)
  if (!match) throw new Error(`ics: expected YYYY-MM-DD, got ${JSON.stringify(iso)}`)
  const ms = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) + 86_400_000
  const d = new Date(ms)
  const y = String(d.getUTCFullYear()).padStart(4, '0')
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/** RFC 5545 §3.3.11 text escaping. Backslash first, or it doubles the others' escapes. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

const encoder = new TextEncoder()

/**
 * Fold a content line to 75 octets, continuation lines starting with a space
 * (RFC 5545 §3.1). Counted in octets rather than characters because a Hindi
 * title is three bytes a character, and split on code-point boundaries because
 * a parser handed half a character shows mojibake.
 */
function fold(line: string): string {
  if (encoder.encode(line).length <= 75) return line
  const out: string[] = []
  let current = ''
  let bytes = 0
  let limit = 75
  for (const char of line) {
    const size = encoder.encode(char).length
    if (bytes + size > limit) {
      out.push(current)
      current = ''
      bytes = 0
      limit = 74 // the leading space of a continuation line costs one octet
    }
    current += char
    bytes += size
  }
  out.push(current)
  return out.join('\r\n ')
}

/**
 * The whole `dates.ics`, as text.
 *
 * `siteUrl` is a parameter and never a literal. It is built from `SITE` and
 * `BASE` in `site.config.mjs`, so a domain cutover moves it for free — a
 * hardcoded `switchkarle.fyi` would ship a dead link, because that domain is
 * not live. It goes in both the `URL` property and the description, since some
 * clients show one and some the other.
 *
 * `now` is injected so the file is a pure function of its input and the tests
 * can pin a byte-for-byte expected output.
 */
export function buildDatesIcs(
  events: readonly IcsEvent[],
  siteUrl: string,
  now: Date = new Date(),
): string {
  const stamp =
    `${String(now.getUTCFullYear()).padStart(4, '0')}` +
    `${String(now.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(now.getUTCDate()).padStart(2, '0')}T` +
    `${String(now.getUTCHours()).padStart(2, '0')}` +
    `${String(now.getUTCMinutes()).padStart(2, '0')}` +
    `${String(now.getUTCSeconds()).padStart(2, '0')}Z`

  // The UID domain: the site's own host, so two people's files never collide.
  let host = 'switch-karle'
  try {
    host = new URL(siteUrl).host || host
  } catch {
    /* a caller passing something unparseable still gets a valid file */
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:${PRODID}`,
    'CALSCALE:GREGORIAN',
  ]

  for (const event of events) {
    const description = event.description == null ? siteUrl : `${event.description}\n${siteUrl}`
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeText(event.uid)}-${icsDate(event.date)}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(event.date)}`,
      `DTEND;VALUE=DATE:${nextDay(event.date)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `URL:${escapeText(siteUrl)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }

  lines.push('END:VCALENDAR')
  // CRLF, and a trailing one: RFC 5545 lines are terminated, not separated.
  return `${lines.map(fold).join('\r\n')}\r\n`
}
