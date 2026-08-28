import { describe, expect, it } from 'vitest'
import { insuranceGap } from './insurance'

describe('insuranceGap', () => {
  it('next-day join has zero uncovered days', () => {
    const r = insuranceGap({
      lastWorkingDay: '2026-08-31',
      newJoinDate: '2026-09-01',
      hasPersonalCover: false,
    })
    expect(r.uncoveredDays).toBe(0)
    expect(r.uncovered).toBe(false)
    expect(r.groupCoverEndsOn).toBe('2026-08-31')
    expect(r.joinOverlapsLwd).toBe(false)
  })

  it('15 calendar days later is 14 uncovered days without personal cover', () => {
    const r = insuranceGap({
      lastWorkingDay: '2026-08-31',
      newJoinDate: '2026-09-15',
      hasPersonalCover: false,
    })
    expect(r.uncoveredDays).toBe(14)
    expect(r.uncovered).toBe(true)
  })

  it('personal cover means the gap is still counted but not flagged uncovered', () => {
    const r = insuranceGap({
      lastWorkingDay: '2026-08-31',
      newJoinDate: '2026-09-15',
      hasPersonalCover: true,
    })
    expect(r.uncoveredDays).toBe(14)
    expect(r.uncovered).toBe(false)
  })

  it('joining on LWD is an overlap, not a gap', () => {
    const r = insuranceGap({
      lastWorkingDay: '2026-08-31',
      newJoinDate: '2026-08-31',
      hasPersonalCover: false,
    })
    expect(r.uncoveredDays).toBe(0)
    expect(r.joinOverlapsLwd).toBe(true)
  })
})
