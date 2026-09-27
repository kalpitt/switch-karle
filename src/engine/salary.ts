import type { OfferInput, Regime, SalaryBreakdown, StateCode } from './types'
import { computeTax, STANDARD_DEDUCTION } from './tax'
import { PROFESSIONAL_TAX_ANNUAL } from './professionalTax'

/**
 * Cities that qualify for the 50%-of-basic HRA limb: Mumbai, Kolkata, Delhi,
 * Chennai, Hyderabad, Pune, Ahmedabad and Bengaluru. Every other city is 40%.
 * State codes are a proxy for cities (MH contains Mumbai *and* Pune; KA, TG
 * and GJ each contain one qualifying city plus non-qualifying places).
 * VERIFIED: 2026-09-27 | Source: Income-tax Rules, 2026 (G.S.R. 198(E))
 * https://www.incometaxindia.gov.in/documents/81799/11848482/En-Notified-IT-Rules-2026-20-03-2026.pdf
 * Rule 279(1)(c) | FY: 2026-27
 */
export const HRA_METRO_STATE_CODES: readonly StateCode[] = ['DL', 'MH', 'WB', 'TN', 'KA', 'TG', 'GJ']

/**
 * EPF wage ceiling: ₹25,000/month, i.e. ₹3,00,000/year of basic, above which
 * PF contributions are optional (each side may still cap at this base).
 * VERIFIED: 2026-09-27 | Source: S.O. 5109(E), 17 Sep 2026, s.2(89) Code on
 * Social Security, 2020 https://egazette.gov.in/WriteReadData/2026/276299.pdf
 * (supersedes S.O. 2702(E), 29 May 2026) | FY: 2026-27
 */
export const EPF_WAGE_CEILING_ANNUAL = 300_000

export function stateHasHraMetroCity(state: StateCode): boolean {
  return (HRA_METRO_STATE_CODES as readonly string[]).includes(state)
}

/**
 * Old-regime HRA exemption: min(actual HRA, rent − 10% of basic, 50%/40% of basic).
 * VERIFIED: 2026-09-27 | Source: Income-tax Rules, 2026 (G.S.R. 198(E))
 * https://www.incometaxindia.gov.in/documents/81799/11848482/En-Notified-IT-Rules-2026-20-03-2026.pdf
 * Rule 279(1) | FY: 2026-27
 */
export function hraExemptionAnnual(
  basic: number,
  hra: number,
  rentPaidMonthly: number,
  metro: boolean,
): number {
  const rentAnnual = rentPaidMonthly * 12
  if (rentAnnual <= 0) return 0
  return Math.max(0, Math.min(hra, rentAnnual - 0.1 * basic, (metro ? 0.5 : 0.4) * basic))
}

/**
 * Decompose a CTC into what actually lands in the bank every month.
 *
 * Deliberate, documented assumptions (shown in the UI's "how we computed"):
 * - In-hand is computed on FIXED pay only. Variable pay and ESOPs are at-risk
 *   money: they're shown separately and never counted in monthly in-hand.
 * - Tax is likewise computed on fixed cash gross. If variable pays out, tax on
 *   it is deducted from that payout, not from the monthly figure shown.
 * - Employer PF and gratuity reduce cash gross only when the offer counts them
 *   inside CTC (they almost always do).
 * - PF: 12% of basic each side; optionally capped at the ₹25,000/mo statutory
 *   wage ceiling (₹3,000/mo each side). VERIFIED: 2026-09-27 | Source: S.O.
 *   5109(E), 17 Sep 2026, s.2(89) Code on Social Security, 2020
 *   https://egazette.gov.in/WriteReadData/2026/276299.pdf | FY: 2026-27
 * - Old regime: 80C is auto-filled with employee PF (capped ₹1.5L with any
 *   extra investments), plus HRA exemption if rent is entered, plus 80D,
 *   plus professional tax. Salary deductions (standard deduction + PT):
 *   s.19 of the ITA 2025; 80C-style cap: s.123.
 */
export function decodeOffer(input: OfferInput): SalaryBreakdown {
  const esopValue = input.esop?.annualValue ?? 0
  const fixedCtc = Math.max(0, input.ctcAnnual - input.variableAnnual - esopValue)

  const basic = (input.basicPercent / 100) * fixedCtc
  const hra = (input.hraPercentOfBasic / 100) * basic

  const pfBase = input.pfOnFullBasic ? basic : Math.min(basic, EPF_WAGE_CEILING_ANNUAL)
  const employeePfAnnual = Math.round(0.12 * pfBase)
  const employerPfAnnual = employeePfAnnual
  const gratuityAnnual = input.gratuityInCtc ? Math.round(0.0481 * basic) : 0

  const grossSalary =
    fixedCtc - (input.employerPfInCtc ? employerPfAnnual : 0) - gratuityAnnual
  const otherAllowances = Math.max(0, grossSalary - basic - hra)

  const professionalTaxAnnual = PROFESSIONAL_TAX_ANNUAL[input.state]

  // New regime (scheme u/s 202 of the ITA 2025): standard deduction u/s 19 only.
  const newTaxable = Math.max(0, Math.round(grossSalary - STANDARD_DEDUCTION.new))
  const newRegime = computeTax(newTaxable, 'new')

  // Old regime: standard deduction + PT + HRA exemption + 80C + 80D.
  const old = input.old ?? { rentPaidMonthly: 0, metro: false, deduction80CExtra: 0, deduction80D: 0 }
  const hraExemption = hraExemptionAnnual(basic, hra, old.rentPaidMonthly, old.metro)
  const ded80C = Math.min(150_000, employeePfAnnual + old.deduction80CExtra)
  const oldTaxable = Math.max(
    0,
    Math.round(
      grossSalary -
        STANDARD_DEDUCTION.old -
        professionalTaxAnnual -
        hraExemption -
        ded80C -
        old.deduction80D,
    ),
  )
  const oldRegime = computeTax(oldTaxable, 'old')

  const recommendedRegime: Regime = newRegime.totalTax <= oldRegime.totalTax ? 'new' : 'old'

  // Professional tax is levied on salary earned. With no salary there is none
  // to levy, and deducting it anyway produced an in-hand of -₹200 a month on a
  // CTC of zero — which is what the Decoder shows the moment a user clears the
  // CTC field.
  const ptDue = grossSalary > 0 ? professionalTaxAnnual : 0
  const inHand = (tax: number) => (grossSalary - tax - employeePfAnnual - ptDue) / 12
  const inHandMonthlyNew = Math.round(inHand(newRegime.totalTax))
  const inHandMonthlyOld = Math.round(inHand(oldRegime.totalTax))
  const inHandMonthly = recommendedRegime === 'new' ? inHandMonthlyNew : inHandMonthlyOld

  return {
    input,
    fixedCtc,
    basic: Math.round(basic),
    hra: Math.round(hra),
    otherAllowances: Math.round(otherAllowances),
    employeePfAnnual,
    employerPfAnnual,
    gratuityAnnual,
    grossSalary: Math.round(grossSalary),
    professionalTaxAnnual,
    hraExemptionAnnual: Math.round(hraExemption),
    newRegime,
    oldRegime,
    recommendedRegime,
    inHandMonthlyNew,
    inHandMonthlyOld,
    inHandMonthly,
    inHandRatio: input.ctcAnnual > 0 ? (inHandMonthly * 12) / input.ctcAnnual : 0,
  }
}
