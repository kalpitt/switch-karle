import type { RedFlag, SalaryBreakdown } from './types'

/**
 * Table-driven offer red-flag scanner. Every flag carries the legal/market
 * context in plain English and one concrete negotiation line.
 *
 * Legal context sources (2026-07): no statute mandates a 90-day notice — the
 * contract governs (Industrial Disputes Act's 30-day floor applies to
 * "workmen", which typically excludes IT/managerial roles). Employment bonds
 * are enforceable only as a genuine pre-estimate of training cost (Contract
 * Act s.74); blanket penalties and restraints on joining competitors after
 * exit are void (s.27). Practical enforcement is F&F deduction and relieving-
 * letter withholding. Cognizant cut notice to 30 days in 2023; Flipkart,
 * Razorpay, Swiggy run 30-day standards. Pasted-letter bond/probation
 * patterns live in `bondScan.ts`.
 */

interface Rule {
  id: string
  applies: (b: SalaryBreakdown) => boolean
  build: (b: SalaryBreakdown) => Omit<RedFlag, 'id'>
}

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

const RULES: Rule[] = [
  {
    id: 'notice-period',
    applies: (b) => b.input.noticePeriodDays > 60,
    build: (b) => ({
      severity: b.input.noticePeriodDays >= 90 ? 'red' : 'amber',
      title: `${b.input.noticePeriodDays}-day notice period`,
      detail:
        'No Indian law requires a 90-day notice — it is purely contractual. Long notice periods make you less hirable (companies prefer 30-day joiners) and weaken your negotiating power in your NEXT switch. Market has moved: Cognizant cut to 30 days in 2023; Flipkart, Razorpay and Swiggy run 30-day standards.',
      negotiationTip:
        'Ask: "Can we put a 30–60 day notice, or a buyout clause where either side can pay in lieu of notice?" Get the buyout formula in writing.',
    }),
  },
  {
    id: 'bond',
    applies: (b) => !!b.input.bond && b.input.bond.amount > 0,
    build: (b) => ({
      severity: 'red',
      title: `Service bond: ₹${b.input.bond!.amount.toLocaleString('en-IN')} for ${b.input.bond!.months} months`,
      detail:
        'Courts enforce bonds only as a genuine pre-estimate of actual training cost (Contract Act s.74) — arbitrary penalty amounts are not enforceable, and clauses stopping you from joining competitors after you leave are void (s.27). But the practical pain is real: the amount can be deducted from your final settlement and your relieving letter withheld, which hurts background checks.',
      negotiationTip:
        'Ask what specific training the bond covers and request the amount be pro-rated by months served. If there is no real training program, ask for the bond to be dropped.',
    }),
  },
  {
    id: 'variable-heavy',
    applies: (b) => pct(b.input.variableAnnual, b.input.ctcAnnual) > 15,
    build: (b) => {
      const p = pct(b.input.variableAnnual, b.input.ctcAnnual)
      return {
        severity: p > 25 ? 'red' : 'amber',
        title: `${p}% of CTC is variable pay`,
        detail:
          `₹${b.input.variableAnnual.toLocaleString('en-IN')} of this offer is not committed money — it depends on company and individual performance ratings you don't control. Typical payout in an average year is 70–90% of target, and first-year payouts are often pro-rated. Treat CTC minus variable as the real offer.`,
        negotiationTip:
          'Ask: "What was the actual average variable payout % for this band in the last 2 years?" and "Is my first year pro-rated?" Then negotiate fixed, not CTC.',
      }
    },
  },
  {
    id: 'gratuity-in-ctc',
    applies: (b) => b.input.gratuityInCtc,
    build: (b) => ({
      severity: 'info',
      title: 'Gratuity counted inside CTC',
      detail:
        `₹${b.gratuityAnnual.toLocaleString('en-IN')}/year of your CTC is gratuity accrual — money you only receive if you stay 5 years (per the Payment of Gratuity Act). Leave in year 3 and this part of your "CTC" was never yours.`,
      negotiationTip:
        'Nothing to negotiate — just discount it mentally when comparing offers. Compare fixed cash, not CTC.',
    }),
  },
  {
    id: 'employer-pf-in-ctc',
    applies: (b) => b.input.employerPfInCtc,
    build: (b) => ({
      severity: 'info',
      title: "Employer PF is part of the CTC figure",
      detail:
        `₹${b.employerPfAnnual.toLocaleString('en-IN')}/year of the CTC is the employer's PF contribution — your money, but locked in EPF until retirement/withdrawal, not in your bank account. Standard practice, but it inflates the headline number.`,
      negotiationTip:
        'When comparing with an offer that excludes employer PF from CTC, add it back on one side so you compare like with like.',
    }),
  },
  {
    id: 'joining-bonus-clawback',
    // A clawback on a bonus of zero is not a risk, it is arithmetic.
    applies: (b) =>
      !!b.input.joiningBonus &&
      b.input.joiningBonus.clawbackMonths > 0 &&
      b.input.joiningBonus.amount > 0,
    build: (b) => ({
      severity: 'amber',
      title: `Joining bonus with ${b.input.joiningBonus!.clawbackMonths}-month clawback`,
      detail:
        `The ₹${b.input.joiningBonus!.amount.toLocaleString('en-IN')} joining bonus must be repaid — usually in FULL, including the tax that was deducted — if you leave within ${b.input.joiningBonus!.clawbackMonths} months. Combined with a long notice period, this is an exit tax.`,
      negotiationTip:
        'Ask for the clawback to be pro-rated by months served, and get the exact repayment formula (gross vs net) in writing.',
    }),
  },
  {
    id: 'esop-illiquid',
    applies: (b) => !!b.input.esop && b.input.esop.annualValue > 0 && !b.input.esop.liquid,
    build: (b) => {
      const p = pct(b.input.esop!.annualValue, b.input.ctcAnnual)
      return {
        severity: p > 20 ? 'red' : 'amber',
        title: `${p}% of CTC is unlisted ESOPs`,
        detail:
          `₹${b.input.esop!.annualValue.toLocaleString('en-IN')}/year of this offer is equity in a company with no liquidity event — you cannot sell it, and most startup ESOPs expire worthless or get diluted. There is also a tax trap: exercising options triggers tax on paper gains you haven't realized in cash.`,
        negotiationTip:
          'Value unlisted ESOPs at zero for decision-making. Ask about the last 409A/valuation, buyback history, and post-exit exercise window (90 days is hostile; 5+ years is founder-friendly).',
      }
    },
  },
  {
    id: 'esop-cliff',
    applies: (b) => !!b.input.esop && b.input.esop.cliffMonths > 12,
    build: (b) => ({
      severity: 'amber',
      title: `${b.input.esop!.cliffMonths}-month ESOP cliff`,
      detail:
        'The standard vesting cliff is 12 months. A longer cliff means leaving before it vests forfeits ALL equity — it functions as a retention lock on top of notice period and bond.',
      negotiationTip: 'Ask for the standard 12-month cliff with monthly or quarterly vesting after.',
    }),
  },
  {
    id: 'low-basic',
    applies: (b) => b.input.basicPercent < 35,
    build: (b) => ({
      severity: 'amber',
      title: `Basic is only ${b.input.basicPercent}% of fixed pay`,
      detail:
        'A low basic reduces employer PF and gratuity (both computed on basic) — it optimizes the company\'s cost, not your wealth. Some structures use it to make the in-hand look bigger while shrinking retirement money.',
      negotiationTip:
        'Ask for the salary structure sheet before signing and check basic ≥ 40% of fixed.',
    }),
  },
]

export function scanRedFlags(b: SalaryBreakdown): RedFlag[] {
  const severityOrder = { red: 0, amber: 1, info: 2 }
  return RULES.filter((r) => r.applies(b))
    .map((r) => ({ id: r.id, ...r.build(b) }))
    .sort((x, y) => severityOrder[x.severity] - severityOrder[y.severity])
}
