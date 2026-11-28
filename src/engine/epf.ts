import { completedYearsWithDayCount } from './dates'

export const EPFO_MEMBER_PORTAL = 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/'
export const EPFO_HOME = 'https://www.epfindia.gov.in/'

export type EpfIntent = 'transfer' | 'withdraw'

export interface EpfGuideInput {
  intent: EpfIntent
  joinDate: string
  exitDate: string
  dateOfExitMarked: boolean
  nameMatchesAadhaar: boolean
  dobMatchesAadhaar: boolean
}

export type EpfFlagId =
  | 'prefer-transfer'
  | 'premature-withdrawal'
  | 'doe-unmarked'
  | 'name-mismatch'
  | 'dob-mismatch'
  | 'interest-after-exit'
  | 'five-year-exempt'

export interface EpfFlag {
  id: EpfFlagId
  severity: 'red' | 'amber' | 'info'
}

export interface EpfGuideResult {
  completedYears: number
  continuousFiveYears: boolean
  recommendedIntent: EpfIntent
  prematureWithdrawalTrap: boolean
  flags: EpfFlag[]
  /** Ordered Form-13 / portal steps. Copy lives in i18n. */
  stepIds: readonly string[]
  portalUrl: string
}

const TRANSFER_STEPS = [
  'activate-uan',
  'kyc',
  'form13',
  'track-claim',
] as const

/**
 * EPF/UAN switch guide: transfer (Form 13) vs premature withdrawal.
 *
 * The five-year rule is Schedule XI, Part A, para 8 of the Income-tax Act,
 * 2025 (old Fourth Schedule, Part A, rule 8): the accumulated balance is
 * excluded from income "(a) if the employee has rendered continuous service
 * with his employer for five years or more", or (b) if service ended through
 * ill-health, the employer's contraction or closure, or another cause beyond
 * the employee's control, or (c) to the extent it is transferred to the new
 * employer's recognised fund. Para 8(2): when the balance includes a transfer
 * from a previous employer's fund, the service with that employer COUNTS
 * toward the five years. Para 9: if para 8 does not apply, tax is recomputed
 * for each year as if the fund had never been recognised.
 *
 * TDS (old s.192A): s.392(7) — the EPF trustees "deduct income-tax thereon at
 * the rate of 10%, where the aggregate amount of such payment is ₹ 50000 or
 * more" and para 8 does not apply. Without a valid PAN, s.397(2)(b)(i) takes
 * the higher of that rate and 20%.
 * VERIFIED: 2026-10-24 | Source: Income-tax Act, 2025 (No. 30 of 2025) as enacted, Gazette of India Extraordinary Part II s.1 No. 35, 21-Aug-2025 (CG-DL-E-22082025-265620), read from ICAI's copy https://resource.cdn.icai.org/87647dtc-aps2139-inceome-tax-act-2025.pdf Schedule XI Part A paras 8, 9, 10; §392(7); §397(2)(b)(i) | FY: 2026-27
 * 2026-11-28: re-read in ICAI's edition of the Act as amended by the Finance
 * Act 2026; the Act's Schedule XI changes (Finance Bill clause 111) touch
 * contribution caps and investment rules only.
 *
 * Interest credited after leaving is taxable, year by year, as income from
 * other sources: the exemption is for the "accumulated balance due", defined
 * as the balance "on the day he ceases to be an employee" (Sch. XI Pt A para
 * 2(g), para 8(1)).
 * VERIFIED: 2026-11-28 | Source: Income-tax Act, 2025 Sch. XI Pt A paras 2(g),
 * 8(1); ACIT v. Dilip Ranjrekar, ITAT Bangalore ITA 858/Bang/2016, 10 Nov 2017
 * para 6.3.3 (https://indiankanoon.org/doc/187041301/); Anurag Singh v. ACIT,
 * ITAT Lucknow ITA 35/LKW/2014, 27 Nov 2014 (https://indiankanoon.org/doc/87580869/) | FY: 2026-27
 *
 * Known gap: `completedYears` counts this employer only. Para 8(2) also counts
 * an earlier employer's service whose PF was transferred in, so someone this
 * tool calls "under 5 years" may already be past the line. The error is on the
 * safe side: it recommends a transfer. No TDS rupee is computed. Transfer is
 * the non-taxable path this tool recommends whenever service is under 5 years.
 */
export function epfGuide(input: EpfGuideInput): EpfGuideResult {
  const tenure = completedYearsWithDayCount(input.joinDate, input.exitDate)
  const continuousFiveYears = tenure.completedYears >= 5
  const prematureWithdrawalTrap = input.intent === 'withdraw' && !continuousFiveYears
  const recommendedIntent: EpfIntent =
    input.intent === 'withdraw' && continuousFiveYears ? 'withdraw' : 'transfer'

  const flags: EpfFlag[] = []
  if (input.intent === 'withdraw' && !continuousFiveYears) {
    flags.push({ id: 'prefer-transfer', severity: 'red' })
    flags.push({ id: 'premature-withdrawal', severity: 'red' })
  }
  if (input.intent === 'withdraw' && continuousFiveYears) {
    flags.push({ id: 'five-year-exempt', severity: 'info' })
  }
  if (input.intent === 'withdraw') {
    flags.push({ id: 'interest-after-exit', severity: 'amber' })
  }
  if (!input.dateOfExitMarked) flags.push({ id: 'doe-unmarked', severity: 'red' })
  if (!input.nameMatchesAadhaar) flags.push({ id: 'name-mismatch', severity: 'amber' })
  if (!input.dobMatchesAadhaar) flags.push({ id: 'dob-mismatch', severity: 'amber' })

  return {
    completedYears: tenure.completedYears,
    continuousFiveYears,
    recommendedIntent,
    prematureWithdrawalTrap,
    flags,
    stepIds: TRANSFER_STEPS,
    portalUrl: EPFO_MEMBER_PORTAL,
  }
}
