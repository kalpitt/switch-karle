import { gratuity } from './gratuity'

export interface FnFPayslipLine {
  id: string
  label: string
  amount: number
  kind: 'earning' | 'deduction'
}

export interface FnFInput {
  joinDate: string
  lastWorkingDay: string
  monthlyBasic: number
  monthlyGross: number
  unpaidLeaveDays: number
  payslipLines: FnFPayslipLine[]
  recoveries: FnFPayslipLine[]
  gratuityEligible: boolean
}

export interface FnFAuditLine {
  /** Stable id the island translates (e.g. salary, unpaid-leave, gratuity). */
  id: string
  label: string
  claimed: number
  recomputed: number
  delta: number
}

export interface FnFFlag {
  id: string
  severity: 'red' | 'amber'
  /** Values interpolated into the i18n strings keyed by this flag's id. */
  params?: Record<string, string>
}

export interface FnFResult {
  lines: FnFAuditLine[]
  netPayable: number
  flags: FnFFlag[]
}

// CANDIDATE: unpaid-leave recovery = (monthly gross / 30) × unpaid days. Contract may differ.

const DAYS_IN_MONTH = 30

function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

function unpaidLeaveRecovery(monthlyGross: number, unpaidLeaveDays: number): number {
  return clampNonNeg(unpaidLeaveDays) * (clampNonNeg(monthlyGross) / DAYS_IN_MONTH)
}

export function auditFnF(input: FnFInput): FnFResult {
  const recomputedById = new Map<string, number>()

  if (input.unpaidLeaveDays > 0) {
    recomputedById.set('unpaid-leave', unpaidLeaveRecovery(input.monthlyGross, input.unpaidLeaveDays))
  }

  if (input.gratuityEligible) {
    const g = gratuity({
      lastDrawnBasicDA: input.monthlyBasic,
      joinDate: input.joinDate,
      exitDate: input.lastWorkingDay,
      coveredByAct: true,
    })
    recomputedById.set('gratuity', g.amount)
  }

  const lines: FnFAuditLine[] = []
  let earnings = 0
  let deductions = 0

  for (const line of input.payslipLines) {
    const claimed = clampNonNeg(line.amount)
    const recomputed = recomputedById.has(line.id) ? recomputedById.get(line.id)! : claimed
    if (recomputedById.has(line.id)) recomputedById.delete(line.id)

    lines.push({
      id: line.id,
      label: line.label,
      claimed,
      recomputed,
      delta: claimed - recomputed,
    })

    if (line.kind === 'earning') earnings += recomputed
    else deductions += recomputed
  }

  for (const [id, recomputed] of recomputedById) {
    const label = id === 'unpaid-leave' ? 'Unpaid leave recovery' : id === 'gratuity' ? 'Gratuity' : id
    lines.push({ id, label, claimed: 0, recomputed, delta: -recomputed })
    if (id === 'gratuity') earnings += recomputed
    else if (id === 'unpaid-leave') deductions += recomputed
  }

  const recoveryTotal = input.recoveries.reduce((sum, r) => sum + clampNonNeg(r.amount), 0)
  const netPayable = earnings - deductions - recoveryTotal

  const flags: FnFFlag[] = []

  if (netPayable < 0) {
    flags.push({
      id: 'negative-net',
      severity: 'red',
      params: { amount: formatINRPlain(Math.abs(netPayable)) },
    })
  }

  for (const recovery of input.recoveries) {
    if (/notice/i.test(recovery.id) || /notice/i.test(recovery.label)) {
      flags.push({
        id: 'notice-recovery',
        severity: 'amber',
        params: { amount: formatINRPlain(clampNonNeg(recovery.amount)) },
      })
      break
    }
  }

  return { lines, netPayable, flags }
}

/** Plain en-IN grouping without the ₹ glyph — the i18n string owns the currency mark. */
function formatINRPlain(n: number): string {
  return n.toLocaleString('en-IN')
}
