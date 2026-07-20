import type { OfferInput, Regime, SalaryBreakdown } from './types'
import { computeTax, STANDARD_DEDUCTION } from './tax'
import { PROFESSIONAL_TAX_ANNUAL } from './professionalTax'

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
 * - PF: 12% of basic each side; optionally capped at the ₹15,000/mo statutory
 *   wage ceiling (₹1,800/mo each side).
 * - Old regime: 80C is auto-filled with employee PF (capped ₹1.5L with any
 *   extra investments), plus HRA exemption if rent is entered, plus 80D,
 *   plus professional tax u/s 16(iii).
 */
export function decodeOffer(input: OfferInput): SalaryBreakdown {
  const esopValue = input.esop?.annualValue ?? 0
  const fixedCtc = Math.max(0, input.ctcAnnual - input.variableAnnual - esopValue)

  const basic = (input.basicPercent / 100) * fixedCtc
  const hra = (input.hraPercentOfBasic / 100) * basic

  const pfBase = input.pfOnFullBasic ? basic : Math.min(basic, 180_000)
  const employeePfAnnual = Math.round(0.12 * pfBase)
  const employerPfAnnual = employeePfAnnual
  const gratuityAnnual = input.gratuityInCtc ? Math.round(0.0481 * basic) : 0

  const grossSalary =
    fixedCtc - (input.employerPfInCtc ? employerPfAnnual : 0) - gratuityAnnual
  const otherAllowances = Math.max(0, grossSalary - basic - hra)

  const professionalTaxAnnual = PROFESSIONAL_TAX_ANNUAL[input.state]

  // New regime: standard deduction only.
  const newTaxable = Math.max(0, Math.round(grossSalary - STANDARD_DEDUCTION.new))
  const newRegime = computeTax(newTaxable, 'new')

  // Old regime: standard deduction + PT + HRA exemption + 80C + 80D.
  const old = input.old ?? { rentPaidMonthly: 0, metro: false, deduction80CExtra: 0, deduction80D: 0 }
  const rentAnnual = old.rentPaidMonthly * 12
  const hraExemption =
    rentAnnual > 0
      ? Math.max(0, Math.min(hra, rentAnnual - 0.1 * basic, (old.metro ? 0.5 : 0.4) * basic))
      : 0
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

  const inHand = (tax: number) =>
    (grossSalary - tax - employeePfAnnual - professionalTaxAnnual) / 12
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
    newRegime,
    oldRegime,
    recommendedRegime,
    inHandMonthlyNew,
    inHandMonthlyOld,
    inHandMonthly,
    inHandRatio: input.ctcAnnual > 0 ? (inHandMonthly * 12) / input.ctcAnnual : 0,
  }
}
