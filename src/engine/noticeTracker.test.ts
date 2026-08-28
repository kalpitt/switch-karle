import { describe, expect, it } from 'vitest'
import { noticeTracker } from './noticeTracker'
import { lastWorkingDay } from './dates'

describe('noticeTracker', () => {
  it('90-day notice from 2026-06-01: LWD 2026-08-29; mid-notice has days left', () => {
    const r = noticeTracker({
      resignDate: '2026-06-01',
      noticePeriodDays: 90,
      asOf: '2026-07-01',
    })
    expect(r.lastWorkingDay).toBe(lastWorkingDay('2026-06-01', 90))
    expect(r.lastWorkingDay).toBe('2026-08-29')
    expect(r.served).toBe(false)
    expect(r.daysLeftOnNotice).toBe(59)
    expect(r.milestones.map((m) => m.id)).toEqual([
      'handover',
      'fnf-docs',
      'asset-return',
      'insurance-end',
      'pf-doe',
      'relieving-chase',
    ])
    expect(r.milestones.find((m) => m.id === 'asset-return')?.dueDate).toBe('2026-08-29')
    expect(r.milestones.find((m) => m.id === 'relieving-chase')?.dueDate).toBe('2026-09-05')
    expect(r.milestones.find((m) => m.id === 'handover')?.dueDate).toBe('2026-08-22')
  })

  it('after LWD the notice is served', () => {
    const r = noticeTracker({
      resignDate: '2026-06-01',
      noticePeriodDays: 90,
      asOf: '2026-08-30',
    })
    expect(r.served).toBe(true)
    expect(r.daysLeftOnNotice).toBe(-1)
  })
})
