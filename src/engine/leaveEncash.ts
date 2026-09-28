export interface LeaveEncashInput {
  balanceDays: number
  monthlyBasic: number
  dailyBasis: '26' | '30'
  reason: 'resignation' | 'retirement'
}

export interface LeaveEncashResult {
  gross: number
  exempt: number
  taxable: number
  isResignation: boolean
}

/**
 * VERIFIED: 2026-09-28 | Source: Income-tax Act, 2025 as amended by FA Act 2026
 * https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf
 * s.19(1) Table Sl. No. 14 (non-government employees) + s.536(2) (savings for
 * notifications issued under the repealed Income-tax Act, 1961) + CBDT
 * Notification No. 31/2023, S.O. 2276(E), 24 May 2023 | FY: 2026-27
 *
 * s.19(1) Sl.14 exempts the cash equivalent of leave salary for earned leave
 * at credit "at the time of his retirement, whether on superannuation or
 * otherwise", as the LEAST of four limbs: (a) leave at credit, capped at 30
 * days per year of actual service, (b) 10 months' average salary, (c) this
 * ₹25,00,000 ceiling notified under s.536(2), and (d) the amount actually
 * received. "Retirement ... whether on superannuation or otherwise" reaches
 * resignation too — CIT v. D.P. Malhotra, Bombay High Court, 28 March 1997,
 * holding the phrase covers "all cases of retirement ... even on resignation
 * by the employee".
 */
export const LEAVE_ENCASHMENT_EXEMPTION_CAP = 2_500_000

function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

// This tool computes only limbs (c) and (d) of the least-of test above: the
// notified ceiling and the amount actually received. Limbs (a) (30 days per
// year of actual service) and (b) (10 months' average salary) need service
// history and a salary trend this tool does not collect. Both limbs can only
// LOWER the exempt amount shown here, never raise it — the UI must say so.
export function leaveEncash(input: LeaveEncashInput): LeaveEncashResult {
  const balanceDays = clampNonNeg(input.balanceDays)
  const monthlyBasic = clampNonNeg(input.monthlyBasic)
  const divisor = input.dailyBasis === '26' ? 26 : 30
  const gross = balanceDays * (monthlyBasic / divisor)
  const isResignation = input.reason === 'resignation'
  const exempt = Math.min(gross, LEAVE_ENCASHMENT_EXEMPTION_CAP)
  const taxable = gross - exempt

  return {
    gross,
    exempt,
    taxable,
    isResignation,
  }
}
