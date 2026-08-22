/** All amounts are annual ₹ unless a field name says Monthly. */

export type Regime = 'new' | 'old'

/** States we have a PT slot for; unverified-levy codes are ₹0 and flagged approximate. */
export type StateCode =
  | 'KA'
  | 'MH'
  | 'TN'
  | 'TG'
  | 'AP'
  | 'WB'
  | 'GJ'
  | 'MP'
  | 'KL'
  | 'OD'
  | 'DL'
  | 'HR'
  | 'UP'
  | 'RJ'
  | 'PB'
  | 'BR'
  | 'AS'
  | 'JH'
  | 'CG'
  | 'SK'
  | 'ML'
  | 'TR'
  | 'PY'
  | 'other'

export interface EsopGrant {
  /** Annualized grant value as quoted in the CTC. */
  annualValue: number
  cliffMonths: number
  /** Listed company / has had a liquidity event. */
  liquid: boolean
}

export interface JoiningBonus {
  amount: number
  clawbackMonths: number
}

export interface Bond {
  amount: number
  months: number
}

export interface OfferInput {
  /** Total CTC as quoted, including variable/employer PF/gratuity if the offer counts them. */
  ctcAnnual: number
  /** Variable / performance pay included in the CTC figure. */
  variableAnnual: number
  /** Basic salary as a % of fixed CTC (fixed = CTC − variable − ESOP value). Typical 40–50. */
  basicPercent: number
  /** HRA as a % of basic. Typical 40–50. */
  hraPercentOfBasic: number
  /** Employer PF contribution is counted inside the CTC figure (almost always true). */
  employerPfInCtc: boolean
  /** Gratuity accrual (4.81% of basic) is counted inside the CTC figure. */
  gratuityInCtc: boolean
  /** PF contributions computed on full basic, or capped at the ₹15,000/mo statutory wage ceiling (₹1,800/mo each side). */
  pfOnFullBasic: boolean
  esop?: EsopGrant
  joiningBonus?: JoiningBonus
  bond?: Bond
  noticePeriodDays: number
  state: StateCode
  /** Old-regime inputs; ignored under the new regime. */
  old?: {
    /** Monthly rent actually paid (for HRA exemption). 0 = no rent. */
    rentPaidMonthly: number
    /** Lives in a metro (Delhi/Mumbai/Kolkata/Chennai) → 50% basic HRA limb, else 40%. */
    metro: boolean
    /** 80C investments EXCLUDING employee PF (we add PF ourselves, cap ₹1.5L total). */
    deduction80CExtra: number
    /** 80D health insurance premium. */
    deduction80D: number
  }
}

export interface TaxBreakdown {
  regime: Regime
  taxableIncome: number
  slabTax: number
  rebate: number
  surcharge: number
  cess: number
  totalTax: number
}

export interface SalaryBreakdown {
  input: OfferInput
  /** CTC minus variable minus ESOP value: what the company commits in cash+retirals. */
  fixedCtc: number
  basic: number
  hra: number
  /** Balancing figure: fixed CTC minus basic/HRA/retirals-in-CTC. */
  otherAllowances: number
  employeePfAnnual: number
  employerPfAnnual: number
  gratuityAnnual: number
  /** Annual cash gross salary (excludes employer PF and gratuity). */
  grossSalary: number
  professionalTaxAnnual: number
  /** Old-regime HRA exemption baked into oldRegime.taxableIncome. 0 if no rent. */
  hraExemptionAnnual: number
  newRegime: TaxBreakdown
  oldRegime: TaxBreakdown
  /** The cheaper of the two regimes. */
  recommendedRegime: Regime
  /** Monthly in-hand under each regime. */
  inHandMonthlyNew: number
  inHandMonthlyOld: number
  /** Best-case monthly in-hand (recommended regime). */
  inHandMonthly: number
  /** in-hand annual / CTC — the "truth ratio". */
  inHandRatio: number
}

export type FlagSeverity = 'red' | 'amber' | 'info'

export interface RedFlag {
  id: string
  severity: FlagSeverity
  title: string
  detail: string
  negotiationTip: string
}
