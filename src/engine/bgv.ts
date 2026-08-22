export type BgvCompanyType = 'product' | 'services' | 'gcc' | 'startup'

export interface BgvPrepInput {
  gapMonths: number
  dualPf: boolean
  relievingPending: boolean
  companyType: BgvCompanyType
}

export type BgvItemId =
  | 'core-docs'
  | 'employment-gap'
  | 'dual-pf'
  | 'relieving-pending'
  | 'type-product'
  | 'type-services'
  | 'type-gcc'
  | 'type-startup'

export interface BgvItem {
  id: BgvItemId
  severity: 'red' | 'amber' | 'info'
}

export interface BgvPrepResult {
  items: BgvItem[]
  highRisk: boolean
}

function clampMonths(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.round(n))
}

/**
 * What a typical Indian BGV vendor will see, and what to prepare.
 * Not a background-check product — a packing list. Dual-PF is a UAN
 * history fact, not an accusation.
 */
export function bgvPrep(input: BgvPrepInput): BgvPrepResult {
  const gapMonths = clampMonths(input.gapMonths)
  const items: BgvItem[] = [{ id: 'core-docs', severity: 'info' }]

  if (gapMonths >= 6) items.push({ id: 'employment-gap', severity: 'red' })
  else if (gapMonths >= 3) items.push({ id: 'employment-gap', severity: 'amber' })

  if (input.dualPf) items.push({ id: 'dual-pf', severity: 'red' })
  if (input.relievingPending) items.push({ id: 'relieving-pending', severity: 'amber' })

  const typeId = `type-${input.companyType}` as BgvItemId
  items.push({ id: typeId, severity: 'info' })

  return {
    items,
    highRisk: items.some((i) => i.severity === 'red'),
  }
}
