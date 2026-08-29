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
  /** Which side of the sheet the line sits on. Decides who a gap favours. */
  kind: 'earning' | 'deduction'
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
  /** Gratuity the recomputation found that the sheet never listed. 0 when none. */
  gratuityNotOnSheet: number
}

/**
 * One thing a settlement mail should ask about.
 * `short` — the sheet leaves you worse off: an earning paid under the
 *   recomputation, or a deduction taken over it.
 * `over` — an earning paid above the recomputation; worth naming in writing so
 *   it cannot come back as a recovery later.
 * `missing` — an earning the sheet does not show at all.
 * `notice-recovery` — money taken back, whose basis is worth pinning down.
 */
export type DisputeKind = 'short' | 'over' | 'missing' | 'notice-recovery'

export interface DisputeItem {
  /** Audit-line id, or the flag id for items that are not lines. */
  id: string
  kind: DisputeKind
  claimed: number
  recomputed: number
  /** claimed − recomputed. Negative means the sheet is short. */
  delta: number
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
  let gratuityNotOnSheet = 0
  const flags: FnFFlag[] = []

  for (const line of input.payslipLines) {
    const claimed = clampNonNeg(line.amount)
    const recomputed = recomputedById.has(line.id) ? recomputedById.get(line.id)! : claimed
    if (recomputedById.has(line.id)) recomputedById.delete(line.id)

    lines.push({
      id: line.id,
      label: line.label,
      kind: line.kind,
      claimed,
      recomputed,
      delta: claimed - recomputed,
    })

    if (line.kind === 'earning') earnings += recomputed
    else deductions += recomputed
  }

  for (const [id, recomputed] of recomputedById) {
    // A gratuity the sheet never claimed is money NOT on the sheet: surface it
    // as a flag, never append it into the net (master plan §9.3).
    if (id === 'gratuity') {
      gratuityNotOnSheet = recomputed
      flags.push({
        id: 'gratuity-missing',
        severity: 'amber',
        params: { amount: formatINRPlain(recomputed) },
      })
      continue
    }
    lines.push({ id, label: id, kind: 'deduction', claimed: 0, recomputed, delta: -recomputed })
    if (id === 'unpaid-leave') deductions += recomputed
  }

  const recoveryTotal = input.recoveries.reduce((sum, r) => sum + clampNonNeg(r.amount), 0)
  const netPayable = earnings - deductions - recoveryTotal

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

  return { lines, netPayable, flags, gratuityNotOnSheet }
}

/**
 * What a settlement mail should ask about, in the order it should ask.
 * Every gap between claimed and recomputed, then gratuity the sheet omitted,
 * then any notice recovery. Empty when the sheet reconciles — there is no
 * dispute to draft, and the tool says so rather than inventing one.
 */
export function disputeItems(input: FnFInput, result: FnFResult): DisputeItem[] {
  const items: DisputeItem[] = []

  for (const line of result.lines) {
    const delta = Math.round(line.delta)
    if (delta === 0) continue
    const item = { id: line.id, claimed: line.claimed, recomputed: line.recomputed, delta: line.delta }
    if (line.kind === 'earning') {
      if (line.claimed === 0) items.push({ ...item, kind: 'missing' })
      else if (delta < 0) items.push({ ...item, kind: 'short' })
      else items.push({ ...item, kind: 'over' })
      continue
    }
    // A deduction bigger than the recomputation leaves you short and is worth
    // asking about. One the sheet did not take is money you were not charged:
    // it shows in the audit table, but a mail asking to be charged for it is
    // not a draft this tool will write for you.
    if (delta > 0) items.push({ ...item, kind: 'short' })
  }

  if (result.gratuityNotOnSheet > 0) {
    items.push({
      id: 'gratuity',
      kind: 'missing',
      claimed: 0,
      recomputed: result.gratuityNotOnSheet,
      delta: -result.gratuityNotOnSheet,
    })
  }

  for (const recovery of input.recoveries) {
    const amount = clampNonNeg(recovery.amount)
    if (amount > 0 && (/notice/i.test(recovery.id) || /notice/i.test(recovery.label))) {
      items.push({ id: recovery.id, kind: 'notice-recovery', claimed: amount, recomputed: amount, delta: 0 })
      break
    }
  }

  return items
}

/** Plain en-IN grouping without the ₹ glyph — the i18n string owns the currency mark. */
function formatINRPlain(n: number): string {
  return n.toLocaleString('en-IN')
}
