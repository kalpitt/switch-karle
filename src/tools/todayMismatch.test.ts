import { describe, expect, it, vi } from 'vitest'
import { todayIso } from '../lib/today'
import { noticeTracker } from '../engine/noticeTracker'

describe('Lead 2: one clock, not two', () => {
  it('between 00:00 and 05:30 IST, todayIso() returns the user\'s local calendar day, not the UTC one', () => {
    vi.useFakeTimers()
    // 02:00:00 IST on 2026-03-15 corresponds to 2026-03-14T20:30:00.000Z in UTC
    vi.setSystemTime(new Date('2026-03-14T20:30:00.000Z'))

    expect(todayIso()).toBe('2026-03-15')

    vi.useRealTimers()
  })

  it('at 02:00 IST on the morning after LWD, notice-tracker should mark notice as served', () => {
    vi.useFakeTimers()
    // 02:00:00 IST on 2026-03-15. LWD was 2026-03-14.
    vi.setSystemTime(new Date('2026-03-14T20:30:00.000Z'))

    // notice-tracker seeds and refreshes `asOf` from todayIso() (src/tools/notice-tracker/index.tsx)
    const asOfFromTool = todayIso()

    const result = noticeTracker({
      resignDate: '2025-12-15',
      noticePeriodDays: 90, // LWD is 2026-03-14
      asOf: asOfFromTool,
    })

    // On 2026-03-15, notice has been completed.
    expect(result.served).toBe(true)

    vi.useRealTimers()
  })
})
