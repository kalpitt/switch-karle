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
  resignationFullyTaxable: boolean
}

// CANDIDATE: s.10(10AA) exemption on leave encashment at retirement exists; the rupee cap is omitted pending CA R2. Resignation (the switcher case) is treated as fully taxable salary.

function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, n)
}

export function leaveEncash(input: LeaveEncashInput): LeaveEncashResult {
  const balanceDays = clampNonNeg(input.balanceDays)
  const monthlyBasic = clampNonNeg(input.monthlyBasic)
  const divisor = input.dailyBasis === '26' ? 26 : 30
  const gross = balanceDays * (monthlyBasic / divisor)
  const resignationFullyTaxable = input.reason === 'resignation'
  const exempt = 0
  const taxable = gross

  return {
    gross,
    exempt,
    taxable,
    resignationFullyTaxable,
  }
}
