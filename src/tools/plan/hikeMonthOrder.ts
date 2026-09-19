/**
 * The hike-month dropdown, in the order a person actually reads a calendar in
 * — next month first, wrapping through December and back to the month
 * `today` is in last — rather than always January to December, which prints
 * whatever's left of the current year AFTER the months that have already
 * passed, out of order underneath it.
 *
 * `today` is an argument, never read inside it, so this stays a pure function
 * of its input like the rest of the plan tool's helpers.
 */
export function hikeMonthOrder(today: string): number[] {
  const currentMonth = Number(today.slice(5, 7))
  const nextMonth = (currentMonth % 12) + 1
  return Array.from({ length: 12 }, (_, i) => ((nextMonth - 1 + i) % 12) + 1)
}
