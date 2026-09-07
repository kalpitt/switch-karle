/**
 * A short human date for a card or a panel: "14 Aug".
 *
 * Locale is pinned to en-IN, which means the Hindi UI shows Latin month names.
 * That is a known gap, older than this file, and it belongs to the native-Hindi
 * pass on ROADMAP.md rather than to any one caller.
 */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

/** The locale the UI formats dates in. Hindi routes get Devanagari month names. */
function localeFor(lang: string): string {
  return lang === 'hi' ? 'hi-IN' : 'en-IN'
}

/**
 * A full date for a plan: "21 July 2026".
 *
 * The plan prints dates a user will type into a calendar and read back months
 * later, so the year is never dropped and the month is never abbreviated.
 * Month names come from `Intl`, not from a hardcoded English list, which is
 * what keeps the Hindi twin from printing English months in a Hindi sentence.
 */
export function formatLongDate(iso: string, lang = 'en'): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(localeFor(lang), { day: 'numeric', month: 'long', year: 'numeric' })
}

/** A month on its own: "May". */
export function formatMonthName(month: number, lang = 'en'): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) return String(month)
  return new Date(Date.UTC(2020, month - 1, 1)).toLocaleDateString(localeFor(lang), {
    month: 'long',
    timeZone: 'UTC',
  })
}

/**
 * A month with its year: "May 2027".
 *
 * The year is not decoration. Someone answering "May" in September 2026 means
 * May 2027, and without the year "waiting until June costs you nine months" is
 * arithmetic about a date that has already happened.
 */
export function formatMonthYear(month: number, year: number, lang = 'en'): string {
  return `${formatMonthName(month, lang)} ${year}`
}
