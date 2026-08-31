/**
 * Today as a local ISO date, not UTC — an IST user's "overdue" must flip at
 * their midnight, not at 05:30.
 *
 * Lives here rather than in `src/engine/**` because it reads the clock, which
 * the engine is not allowed to do. Engine functions take a day as a parameter;
 * this is what the UI passes them.
 */
export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
