import { addMonths, completedYearsWithDayCount } from './dates'

export interface GratuityInput {
  /** Monthly last-drawn basic + DA. */
  lastDrawnBasicDA: number
  joinDate: string
  exitDate: string
  /** 10+ employees — asked, not assumed. */
  coveredByAct: boolean
}

export interface GratuityNote {
  id: string
  detail: string
}

export interface GratuityResult {
  completedYears: number
  daysIntoCurrentYear: number
  eligible: boolean
  amount: number
  /** Next ISO date at which eligibility (or a rounded-up year) flips, or null. */
  flipDate: string | null
  notes: GratuityNote[]
}

// CANDIDATE: Payment of Gratuity Act 1972 s.4 — gratuity = (15/26) × last-drawn monthly basic+DA × completed years of service. Ceiling omitted pending primary source.

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const MS_PER_DAY = 86_400_000

function addDays(iso: string, days: number): string {
  const match = ISO.exec(iso)
  if (!match) throw new Error(`gratuity: expected YYYY-MM-DD, got ${JSON.stringify(iso)}`)
  const ms = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) + days * MS_PER_DAY
  const d = new Date(ms)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Soonest date after join when the 4-year + 240-day rule qualifies. */
function fourYear240FlipDate(joinDate: string): string {
  const fourthAnniversary = addMonths(joinDate, 48)
  return addDays(fourthAnniversary, 240)
}

function fiveYearFlipDate(joinDate: string): string {
  return addMonths(joinDate, 60)
}

function serviceEligible(tenure: ReturnType<typeof completedYearsWithDayCount>): boolean {
  return tenure.completedYears >= 5 || tenure.qualifiesFourYear240Day
}

function flipDateWhenIneligible(joinDate: string, tenure: ReturnType<typeof completedYearsWithDayCount>): string {
  const fourYear240 = fourYear240FlipDate(joinDate)
  const fiveYear = fiveYearFlipDate(joinDate)
  if (tenure.completedYears < 4) return fourYear240
  if (tenure.completedYears === 4 && !tenure.qualifiesFourYear240Day) {
    const daysNeeded = 240 - tenure.daysIntoCurrentYear
    const lastAnniversary = addMonths(joinDate, 48)
    return addDays(lastAnniversary, daysNeeded)
  }
  return fiveYear
}

export function gratuity(input: GratuityInput): GratuityResult {
  const lastDrawnBasicDA = Math.max(0, input.lastDrawnBasicDA)
  const tenure = completedYearsWithDayCount(input.joinDate, input.exitDate)
  const notes: GratuityNote[] = [{ id: 'ceiling-omitted', detail: 'Statutory gratuity ceiling omitted pending primary source.' }]

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
      amount: 0,
      flipDate: flipDateWhenIneligible(input.joinDate, tenure),
      notes,
    }
  }

  const eligible = serviceEligible(tenure)
  const amount = eligible
    ? Math.round((15 / 26) * lastDrawnBasicDA * tenure.completedYears)
    : 0

  if (!eligible) {
    notes.push({
      id: 'ineligible-service',
      detail: 'Service below 5 completed years and below the 4-year + 240-day threshold.',
    })
  }

  return {
    completedYears: tenure.completedYears,
    daysIntoCurrentYear: tenure.daysIntoCurrentYear,
    eligible,
    amount,
    flipDate: eligible ? null : flipDateWhenIneligible(input.joinDate, tenure),
    notes,
  }
}
