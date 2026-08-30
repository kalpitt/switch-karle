/**
 * The worked-example board shown when the tracker is empty.
 *
 * The empty tracker is the first thing a new visitor sees now that the board is
 * the home page, so it shows a filled board rather than an invitation to fill
 * one. Same convention as the calculators' Example chip: sample data, labelled,
 * nothing of the user's touched.
 *
 * Companies are invented. Real employer names carrying invented CTC figures
 * would read as a claim about what those companies pay.
 *
 * Pure and React-free so it can be tested without rendering: `today` is passed
 * in rather than read from the clock, which also keeps the relative dates from
 * going stale and every card from eventually rendering as overdue.
 */
import type { Application, Stage } from '../tracker/types'

const L = 100_000

interface ExampleSeed {
  id: string
  company: string
  role: string
  stage: Stage
  ctcDiscussedLakh?: number
  noticePeriodDays?: number
  source?: string
  /** i18n key — the next action is UI copy and needs a Hindi pair. */
  nextActionKey?: string
  /** Days from today. Negative is deliberately overdue. */
  nextActionInDays?: number
}

const SEEDS: readonly ExampleSeed[] = [
  {
    id: 'example-finlytix',
    company: 'Finlytix',
    role: 'Senior Business Analyst',
    stage: 'researching',
    source: 'LinkedIn',
    nextActionKey: 'tracker.example.action.referral',
    nextActionInDays: 2,
  },
  {
    id: 'example-nivaan',
    company: 'Nivaan Retail',
    role: 'Product Manager',
    stage: 'applied',
    ctcDiscussedLakh: 28,
    source: 'Naukri',
  },
  {
    id: 'example-skydeck',
    company: 'Skydeck Logistics',
    role: 'Business Analyst',
    stage: 'applied',
    source: 'Naukri',
    nextActionKey: 'tracker.example.action.chase',
    nextActionInDays: -4,
  },
  {
    id: 'example-arka',
    company: 'Arka Health',
    role: 'Senior Product Analyst',
    stage: 'interviewing',
    ctcDiscussedLakh: 32,
    noticePeriodDays: 60,
    nextActionKey: 'tracker.example.action.round2',
    nextActionInDays: 3,
  },
  {
    id: 'example-corevance',
    company: 'Corevance',
    role: 'Product Manager',
    stage: 'offer',
    ctcDiscussedLakh: 38,
    noticePeriodDays: 90,
    source: 'Referral',
    nextActionKey: 'tracker.example.action.decode',
    nextActionInDays: 1,
  },
  {
    id: 'example-tarkash',
    company: 'Tarkash Labs',
    role: 'Business Analyst',
    stage: 'decided',
    source: 'Naukri',
  },
]

function shiftIso(todayIso: string, days: number): string {
  const [y, m, d] = todayIso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

/**
 * Builds the example applications for a given day. `translate` maps the action
 * keys so the board reads in the visitor's language.
 */
export function exampleApplications(
  todayIso: string,
  translate: (key: string) => string,
): Application[] {
  const stamp = `${todayIso}T00:00:00.000Z`
  return SEEDS.map((seed) => ({
    id: seed.id,
    company: seed.company,
    role: seed.role,
    stage: seed.stage,
    ctcDiscussedAnnual: seed.ctcDiscussedLakh ? seed.ctcDiscussedLakh * L : undefined,
    noticePeriodDays: seed.noticePeriodDays,
    source: seed.source,
    nextAction: seed.nextActionKey ? translate(seed.nextActionKey) : undefined,
    nextActionDate:
      seed.nextActionInDays === undefined ? undefined : shiftIso(todayIso, seed.nextActionInDays),
    createdAt: stamp,
    updatedAt: stamp,
  }))
}

/** Slugs of the example seeds, for tests that assert the board's shape. */
export const EXAMPLE_IDS: readonly string[] = SEEDS.map((s) => s.id)
