import { addDays } from '../../engine/dates'
import type { Cliff } from '../../engine/switchCalendar'
import type { IcsEvent } from '../../lib/ics'

/**
 * The event list behind `dates.ics`, kept out of the component so it can be
 * tested without rendering anything.
 *
 * Pure: today, the date the user picked and their cliffs go in, calendar
 * events come out. It never reads the clock, storage or `import.meta.env`.
 *
 * Spec: docs/DIRECTION.md Part 4 ("One file, several events") and Part 13.
 */

/**
 * How far ahead the check-in event sits. Seven days, because the resign date is
 * often a year out and a file downloaded in September that does nothing until
 * next June is a message to 2027. This is the event that can bring someone
 * back.
 */
export const CHECK_IN_DAYS = 7

/** `t` from the i18n context. Titles reach `ics.ts` already translated. */
export type Translate = (key: string, vars?: Record<string, string | number>) => string

export interface PlanEventsInput {
  /** Today, ISO. Injected so this stays a pure function of its input. */
  today: string
  /** The date the user picked. There are no plan events before one exists. */
  resignDate: string
  /**
   * The cliffs as `switchCalendar` returned them for this person. Cliffs
   * already behind are kept: Part 13 says each cliff, and the date gratuity
   * became safe is a fact about the plan, not noise.
   */
  cliffs: readonly Cliff[]
}

/**
 * Check-in, every cliff, then the resign date. All all-day, all dull titles.
 *
 * No rupee figure and no company name reaches a title or a description — this
 * file may land in a work calendar, and `ics.ts` never sees money because
 * nothing here puts any in.
 *
 * No `VALARM` anywhere, deliberately: Google Calendar drops custom alarms on
 * import, so an alarm is not a reminder. The event sitting on the day is the
 * mechanism.
 */
export function planIcsEvents(input: PlanEventsInput, t: Translate): IcsEvent[] {
  const events: IcsEvent[] = [
    {
      uid: 'check-in',
      date: addDays(input.today, CHECK_IN_DAYS),
      title: t('plan.ics.checkIn'),
      description: t('plan.ics.checkIn.note'),
    },
  ]

  for (const cliff of input.cliffs) {
    events.push({
      uid: `cliff-${cliff.id}`,
      date: cliff.date,
      title: t(`plan.ics.cliff.${cliff.id}`),
      description: t('plan.ics.cliff.note'),
    })
  }

  events.push({
    uid: 'resign',
    date: input.resignDate,
    title: t('plan.ics.resign'),
    description: t('plan.ics.resign.note'),
  })

  return events
}

/**
 * The link that goes in every event, built from `SITE` and `BASE` in
 * `site.config.mjs` and never typed. A hardcoded `switchkarle.fyi` would ship a
 * dead link, because that domain is not live; a domain cutover moves this for
 * free.
 *
 * `import.meta.env.SITE` is absent outside an Astro build, so the browser's own
 * origin stands in — a link back to wherever the page is actually running beats
 * a link to `undefined`.
 */
export function planSiteUrl(): string {
  const site = (import.meta.env.SITE as string | undefined) ?? ''
  const origin = site !== '' ? site : typeof window === 'undefined' ? '' : window.location.origin
  const base = import.meta.env.BASE_URL || '/'
  return `${origin.replace(/\/$/, '')}${base.endsWith('/') ? base : `${base}/`}`
}
