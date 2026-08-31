import { addDays, addMonths, completedYearsWithDayCount } from './dates'

export interface GratuityInput {
  /** Monthly last-drawn basic + DA. */
  lastDrawnBasicDA: number
  joinDate: string
  exitDate: string
  /** 10+ employees — asked, not assumed. */
  coveredByAct: boolean
  /**
   * Working days per week at the establishment. Sets the s.2A fast-path
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
  /** Years the payout is computed on (PGA s.4(2)) — can exceed completedYears. */
  payableYears: number
  amount: number
  /** Next ISO date at which eligibility (or a rounded-up year) flips, or null. */
  flipDate: string | null
  notes: GratuityNote[]
}

/**
 * Payment of Gratuity Act, 1972 — two separate tests:
 *
 * 1. ELIGIBILITY (s.2A): 5 years of continuous service, or 4 years plus
 *    240 days (6-day week) / 190 days (5-day week) into the fifth year.
 * 2. PAYABLE YEARS (s.4(2)): 15/26 × last-drawn monthly basic+DA for every
 *    completed year, counting any part of a year IN EXCESS OF SIX MONTHS as a
 *    full year. Exactly six months does NOT bump.
 *
 * VERIFIED: 2026-08-23 | Source: PGA 1972 https://labour.gov.in/sites/default/files/gratuity_2.pdf §2A §4(2); ceiling ₹20L per s.4(3) + S.O. 1420(E) 29-Mar-2018
 */

export const GRATUITY_CAP = 2_000_000

const FAST_PATH_DAYS = { 5: 190, 6: 240 } as const

/** s.4(2): a stub beyond six calendar months rounds up to a full payable year. */
function payableYearsFor(joinISO: string, exitISO: string, completedYears: number): number {
  const lastAnniversary = addMonths(joinISO, completedYears * 12)
  const stubBeyondSixMonths = exitISO > addMonths(lastAnniversary, 6)
  return completedYears + (stubBeyondSixMonths ? 1 : 0)
}

function flipDateWhenIneligible(
  joinDate: string,
  tenure: ReturnType<typeof completedYearsWithDayCount>,
  fastPathDays: number,
): string {
  // First date eligibility can flip on: 4 years + the week's fast-path days.
  if (tenure.completedYears < 5) return addDays(addMonths(joinDate, 48), fastPathDays)
  return addMonths(joinDate, 60)
}

export function gratuity(input: GratuityInput): GratuityResult {
  const workWeekDays = input.workWeekDays ?? 6
  const fastPathDays = FAST_PATH_DAYS[workWeekDays]
  const lastDrawnBasicDA = Math.max(0, input.lastDrawnBasicDA)
  // completedYears/daysIntoCurrentYear are threshold-independent; the s.2A
  // fast-path comparison happens here, against this establishment's schedule.
  const tenure = completedYearsWithDayCount(input.joinDate, input.exitDate)
  const notes: GratuityNote[] = [
    {
      id: 's42-rounding',
      detail:
        'Under PGA s.4(2), any part of a year of service beyond six months counts as a full payable year; exactly six months does not.',
    },
  ]

  if (!input.coveredByAct) {
    notes.push({
      id: 'act-may-not-apply',
      detail:
        'Payment of Gratuity Act may not apply (employer below 10-employee threshold). Company policy may still pay gratuity.',
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

  // Eligibility is its own test (s.2A). It must not reuse completedYears as
  // the multiplier — that is what underpaid the 4y+240d case before G1.
  const eligible =
    tenure.completedYears >= 5 ||
    (tenure.completedYears === 4 && tenure.daysIntoCurrentYear >= fastPathDays)

  if (!eligible) {
    notes.push({
      id: 'ineligible-service',
      detail:
        'Service below 5 completed years and below the 4-years-plus fast path (190 days on a 5-day week, 240 on a 6-day week).',
    })
    return {
      completedYears: tenure.completedYears,
      daysIntoCurrentYear: tenure.daysIntoCurrentYear,
      eligible,
      payableYears: 0,
      amount: 0,
      flipDate: flipDateWhenIneligible(input.joinDate, tenure, fastPathDays),
      notes,
    }
  }

  const payableYears = payableYearsFor(input.joinDate, input.exitDate, tenure.completedYears)
  const exact = Math.round((15 / 26) * lastDrawnBasicDA * payableYears)
  const capped = exact > GRATUITY_CAP
  if (capped) {
    notes.push({
      id: 'cap-applied',
      detail: 'Capped at the statutory ₹20,00,000 ceiling (PGA s.4(3)).',
    })
  }

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
