import { addMonths, completedYearsWithDayCount, nthWorkingDayFrom, workingDaysBetween } from './dates'

export interface GratuityInput {
  /** Monthly last-drawn basic + DA. */
  lastDrawnBasicDA: number
  joinDate: string
  exitDate: string
  /** 10+ employees — asked, not assumed. */
  coveredByAct: boolean
  /**
   * Working days per week at the establishment. Sets the s.54 fast-path
   * threshold into year five: 190 days on a 5-day week, 240 on a 6-day week.
   * Defaults to 6 (the more common schedule).
   */
  workWeekDays?: 5 | 6
}

export interface GratuityNote {
  id: string
  detail: string
}

export interface GratuityResult {
  completedYears: number
  daysIntoCurrentYear: number
  eligible: boolean
  /** Years the payout is computed on (Code s.53(2)) — can exceed completedYears. */
  payableYears: number
  amount: number
  /** Next ISO date at which eligibility (or a rounded-up year) flips, or null. */
  flipDate: string | null
  notes: GratuityNote[]
}

/**
 * Code on Social Security, 2020, Chapter V. In force from 21 November 2025
 * (S.O. 5319(E)), when it repealed the Payment of Gratuity Act, 1972
 * (s.164(1) item 6). The Code kept the Act's two separate tests:
 *
 * 1. ELIGIBILITY (s.53(1) with s.54): 5 years of continuous service, or 4
 *    years plus 240 days (6-day week) / 190 days (5-day week) into the fifth
 *    year. s.54(B)(a) sets the same 190-day (less-than-six-day week) and
 *    240-day deeming rule as the Act's s.2A; the 4-years-plus reading of it
 *    is the courts', not cited in the section itself.
 *
 *    The count is days the employee "has actually worked under the employer"
 *    (s.54(B)(a)), not calendar days. Its Explanation adds only four kinds of
 *    absence back in: a lay-off, leave with full wages earned in the previous
 *    year, an accident absence arising from the work, and maternity leave up
 *    to 26 weeks. A weekly off is not on that list, so Saturdays and Sundays
 *    (or just Sundays, on a 6-day week) do not count. This engine counts
 *    Mon–Fri / Mon–Sat working days from the fourth anniversary and does not
 *    model public holidays or unearned leave — both would only push the date
 *    later — so `gratuityEligibilityDate()` is always the EARLIEST this test
 *    can be met, never later than the real one.
 * 2. PAYABLE YEARS (s.53(2), Explanation 3): 15/26 × last-drawn monthly wages
 *    for every completed year, counting any part of a year IN EXCESS OF SIX
 *    MONTHS as a full year. Exactly six months does NOT bump.
 *
 * VERIFIED: 2026-09-27 | Source: Code on Social Security, 2020 (Act 36 of 2020) https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf §53(1) §53(2) Expl.3 §54(B)(a) and its Explanation, First Schedule item V; commencement S.O. 5319(E) 21-Nov-2025 https://egazette.gov.in/WriteReadData/2025/267882.pdf
 *
 * The rupee figure is a FLOOR since 21 November 2025. s.53(2) pays on
 * "wages", and s.2(88) defines wages as basic pay, DA and retaining allowance,
 * then adds back whatever the excluded parts of pay (HRA, conveyance and the
 * rest of sub-clauses (a) to (i)) exceed one-half of all remuneration by. This
 * engine is given basic + DA only, so it cannot be higher than the Code's
 * figure and may be lower. Computing the Code's wages from a CTC breakdown is
 * parked for the CA review: which components count is the contested part.
 */

/**
 * CANDIDATE: ₹20,00,000. s.53(3) caps gratuity at "such amount as may be
 * notified by the Central Government". No notification under the Code was
 * found, and the final Social Security (Central) Rules, 2026 (G.S.R. 344(E),
 * 8 May 2026, https://egazette.gov.in/WriteReadData/2026/272366.pdf) set none.
 * ₹20L is S.O. 1420(E) of 29 March 2018 under the repealed Act's s.4(3); it
 * carries over only if s.164(2)(a) saves it. CA R1.
 */
export const GRATUITY_CAP = 2_000_000

const FAST_PATH_DAYS = { 5: 190, 6: 240 } as const

/** s.53(2): a stub beyond six calendar months rounds up to a full payable year. */
function payableYearsFor(joinISO: string, exitISO: string, completedYears: number): number {
  const lastAnniversary = addMonths(joinISO, completedYears * 12)
  const stubBeyondSixMonths = exitISO > addMonths(lastAnniversary, 6)
  return completedYears + (stubBeyondSixMonths ? 1 : 0)
}

/**
 * The calendar date on which s.54 eligibility is reached: four completed years
 * plus this establishment's fast-path count of WORKING days into the fifth
 * (190 on a five-day week, 240 on a six-day week) — s.54(B)(a) counts days
 * "actually worked", not calendar days, so a weekly off does not count. Both
 * day counts are shorter than a fifth full year, so this is always the
 * earliest date eligibility can arrive, and it is the earliest full stop:
 * public holidays and unpaid or unearned leave are unknown here and can only
 * push it later.
 *
 * `gratuity().flipDate` answers the same question but only while the person is
 * still short of the line — it is null once they are eligible. The plan screen
 * needs the date even when it is in the past ("safe since 2 October 2026"), and
 * needs both work weeks' readings before the user has said which is theirs, so
 * it asks here instead. Same statute, same numbers, no second source.
 *
 * Returns null when the Act does not cover the employer: no amount of tenure
 * creates a statutory date for an establishment the statute does not reach.
 */
export function gratuityEligibilityDate(
  joinDate: string,
  workWeekDays: 5 | 6 = 6,
  coveredByAct = true,
): string | null {
  if (!coveredByAct) return null
  const fourthAnniversary = addMonths(joinDate, 48)
  return nthWorkingDayFrom(fourthAnniversary, FAST_PATH_DAYS[workWeekDays], workWeekDays)
}

function flipDateWhenIneligible(
  joinDate: string,
  tenure: ReturnType<typeof completedYearsWithDayCount>,
  fastPathDays: number,
  workWeekDays: 5 | 6,
): string {
  // First date eligibility can flip on: the fastPathDays-th working day of year five.
  if (tenure.completedYears < 5) {
    return nthWorkingDayFrom(addMonths(joinDate, 48), fastPathDays, workWeekDays)
  }
  return addMonths(joinDate, 60)
}

export function gratuity(input: GratuityInput): GratuityResult {
  const workWeekDays = input.workWeekDays ?? 6
  const fastPathDays = FAST_PATH_DAYS[workWeekDays]
  const lastDrawnBasicDA = Math.max(0, input.lastDrawnBasicDA)
  // completedYears/daysIntoCurrentYear are threshold-independent; the s.54
  // fast-path comparison happens here, against this establishment's schedule.
  const tenure = completedYearsWithDayCount(input.joinDate, input.exitDate)
  const notes: GratuityNote[] = [
    {
      // The id predates the Code: it named the repealed Act's s.4(2). Kept, so
      // the i18n key stays put; the text cites the Code.
      id: 's42-rounding',
      detail:
        'Under the Code on Social Security, 2020 s.53(2), any part of a year of service beyond six months counts as a full payable year; exactly six months does not.',
    },
  ]

  if (!input.coveredByAct) {
    notes.push({
      id: 'act-may-not-apply',
      detail:
        'The Code on Social Security, 2020 may not cover this employer (it has never had ten or more employees). Company policy may still pay gratuity.',
    })
    return {
      completedYears: tenure.completedYears,
      daysIntoCurrentYear: tenure.daysIntoCurrentYear,
      eligible: false,
      payableYears: 0,
      amount: 0,
      // No date changes this. The Act does not cover this employer, so more
      // tenure grants no statutory gratuity — and the ineligible-path helper
      // was returning the five-year anniversary, which for a long-serving
      // employee is a date already in the past.
      flipDate: null,
      notes,
    }
  }

  // Eligibility is its own test (s.53(1) with s.54). It must not reuse completedYears as
  // the multiplier — that is what underpaid the 4y+240d case before G1.
  //
  // s.54(B)(a) counts days actually worked, not calendar days, so the fast
  // path into year five is measured in working days (Mon–Fri / Mon–Sat) from
  // the fourth anniversary, not tenure.daysIntoCurrentYear (which is
  // calendar days and would put this ~40–76 days too early).
  const fourthAnniversary = addMonths(input.joinDate, 48)
  const workingDaysIntoYearFive =
    tenure.completedYears === 4
      ? workingDaysBetween(fourthAnniversary, input.exitDate, workWeekDays)
      : 0
  const eligible =
    tenure.completedYears >= 5 ||
    (tenure.completedYears === 4 && workingDaysIntoYearFive >= fastPathDays)

  if (!eligible) {
    notes.push({
      id: 'ineligible-service',
      detail:
        'Service below 5 completed years and below the 4-years-plus fast path (190 working days on a 5-day week, 240 on a 6-day week — weekly offs do not count). Public holidays and unpaid or unearned leave are not counted here either, so this reads early rather than late.',
    })
    return {
      completedYears: tenure.completedYears,
      daysIntoCurrentYear: tenure.daysIntoCurrentYear,
      eligible,
      payableYears: 0,
      amount: 0,
      flipDate: flipDateWhenIneligible(input.joinDate, tenure, fastPathDays, workWeekDays),
      notes,
    }
  }

  const payableYears = payableYearsFor(input.joinDate, input.exitDate, tenure.completedYears)
  const exact = Math.round((15 / 26) * lastDrawnBasicDA * payableYears)
  const capped = exact > GRATUITY_CAP
  if (capped) {
    notes.push({
      id: 'cap-applied',
      detail:
        'Capped at ₹20,00,000, the ceiling notified in 2018 under the old Act. The Code (s.53(3)) lets the government notify a new one; none had been found when this was checked.',
    })
  }
  notes.push({
    id: 'code-wages',
    detail:
      'Since 21 November 2025 gratuity is paid on "wages" as the Code on Social Security, 2020 defines them (s.2(88)): basic and DA, plus any amount by which the excluded parts of your pay exceed half of it. This uses basic + DA only, so treat it as the floor.',
  })

  return {
    completedYears: tenure.completedYears,
    daysIntoCurrentYear: tenure.daysIntoCurrentYear,
    eligible,
    payableYears,
    amount: capped ? GRATUITY_CAP : exact,
    flipDate: null,
    notes,
  }
}
