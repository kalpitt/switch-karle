import type { Cliff } from '../../engine/switchCalendar'

/**
 * The work-week fork on screen two, as a pure function so the rule that makes
 * it a fork can be tested rather than read off a component.
 *
 * `cliffs()` returns BOTH gratuity readings until `workWeekDays` says which is
 * the user's, and the screen prints both. What it must NOT print is a sentence
 * about one of them — "your gratuity was already safe on 21 July, 48 days ago"
 * is a countdown to a date a six-day-week employee does not have, and Part 3
 * forbids it before the answer. Taking the first of the two is exactly that
 * bug, and it shipped once in the browser before this function existed.
 */
export function isGratuityCliff(cliff: Cliff): boolean {
  return cliff.id === 'gratuity-5-day' || cliff.id === 'gratuity-6-day'
}

/** The user's own gratuity cliff, or null while the fork is unanswered. */
export function chosenGratuityCliff(
  cliffs: readonly Cliff[],
  workWeekDays: 5 | 6 | undefined,
): Cliff | null {
  if (workWeekDays === undefined) return null
  const wanted = workWeekDays === 5 ? 'gratuity-5-day' : 'gratuity-6-day'
  return cliffs.find((cliff) => cliff.id === wanted) ?? null
}
