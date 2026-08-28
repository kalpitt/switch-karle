import { describe, expect, it } from 'vitest'
import { epfGuide } from './epf'

describe('epfGuide', () => {
  it('under 5 years: withdrawing is the premature trap; transfer is recommended', () => {
    const r = epfGuide({
      intent: 'withdraw',
      joinDate: '2023-04-01',
      exitDate: '2026-03-31',
      dateOfExitMarked: true,
      nameMatchesAadhaar: true,
      dobMatchesAadhaar: true,
    })
    expect(r.completedYears).toBe(2)
    expect(r.continuousFiveYears).toBe(false)
    expect(r.prematureWithdrawalTrap).toBe(true)
    expect(r.recommendedIntent).toBe('transfer')
    expect(r.flags.map((f) => f.id)).toEqual(['prefer-transfer', 'premature-withdrawal', 'interest-after-exit'])
  })

  it('5 completed years: withdraw is not the premature trap', () => {
    const r = epfGuide({
      intent: 'withdraw',
      joinDate: '2020-04-01',
      exitDate: '2026-04-01',
      dateOfExitMarked: true,
      nameMatchesAadhaar: true,
      dobMatchesAadhaar: true,
    })
    expect(r.completedYears).toBe(6)
    expect(r.continuousFiveYears).toBe(true)
    expect(r.prematureWithdrawalTrap).toBe(false)
    expect(r.recommendedIntent).toBe('withdraw')
    expect(r.flags.map((f) => f.id)).toEqual(['five-year-exempt', 'interest-after-exit'])
  })

  it('unmarked date of exit and KYC mismatches flag even on a transfer', () => {
    const r = epfGuide({
      intent: 'transfer',
      joinDate: '2018-01-01',
      exitDate: '2026-08-01',
      dateOfExitMarked: false,
      nameMatchesAadhaar: false,
      dobMatchesAadhaar: false,
    })
    expect(r.prematureWithdrawalTrap).toBe(false)
    expect(r.recommendedIntent).toBe('transfer')
    expect(r.flags.map((f) => f.id)).toEqual(['doe-unmarked', 'name-mismatch', 'dob-mismatch'])
    expect(r.stepIds).toEqual(['activate-uan', 'kyc', 'form13', 'track-claim'])
  })
})
