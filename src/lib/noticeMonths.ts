/**
 * Every notice-period field in the app (the door, notice-buyout,
 * notice-tracker, resignation-letter) is typed in days. Indian appointment
 * letters almost always state notice in months ("3 months"), so a user who
 * types the letter's own number verbatim into a days field ends up with a
 * last working day 2 days after resigning instead of ~90.
 *
 * True for the numbers that are almost certainly a months figure carried
 * over by mistake: a whole number from 1 to 12. Above 12 a "months" reading
 * stops being plausible (no one has a year-plus notice period), and a
 * fractional number is never how someone writes a months count from a
 * letter, so it is left alone as a days value.
 */
export function noticeLooksLikeMonths(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 12
}

/** Days implied if `n` is actually months. A copy-only convention (30 days
 * per month) — never used as a statutory figure, never fed into engine math. */
export function noticeMonthsToDays(n: number): number {
  return n * 30
}
