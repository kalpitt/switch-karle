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
 * CANDIDATE: tax on premature withdrawal of a recognised provident fund
 * (recollection: s.192A / now s.392(7) of the 2025 Act; Fourth Schedule
 * five-year continuous-service rule; interest after leaving employment).
 * No TDS rupee is computed — primary source pending CA R3. Transfer is the
 * non-taxable path this tool recommends whenever service is under 5 years.
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
