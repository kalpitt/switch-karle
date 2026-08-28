import { addDays, daysBetween, lastWorkingDay } from './dates'

export interface NoticeTrackerInput {
  resignDate: string
  noticePeriodDays: number
  asOf: string
}

export type NoticeItemId =
  | 'handover'
  | 'asset-return'
  | 'insurance-end'
  | 'pf-doe'
  | 'fnf-docs'
  | 'relieving-chase'

export interface NoticeMilestone {
  id: NoticeItemId
  dueDate: string
  /** Negative = already due relative to asOf. */
  daysUntilDue: number
}

export interface NoticeTrackerResult {
  lastWorkingDay: string
  daysLeftOnNotice: number
  served: boolean
  milestones: NoticeMilestone[]
}

const OFFSETS: { id: NoticeItemId; fromLwd: number }[] = [
  { id: 'handover', fromLwd: -7 },
  { id: 'fnf-docs', fromLwd: -3 },
  { id: 'asset-return', fromLwd: 0 },
  { id: 'insurance-end', fromLwd: 0 },
  { id: 'pf-doe', fromLwd: 0 },
  { id: 'relieving-chase', fromLwd: 7 },
]

/**
 * Notice-period survival dates. Offsets are a packing list, not a statute.
 * Insurance-end and PF date-of-exit sit on LWD because that is when group
 * cover and the old ECR typically stop — portal/practice, not a named section.
 */
export function noticeTracker(input: NoticeTrackerInput): NoticeTrackerResult {
  const notice = Number.isInteger(input.noticePeriodDays) && input.noticePeriodDays >= 1 ? input.noticePeriodDays : 1
  const lwd = lastWorkingDay(input.resignDate, notice)
  const daysLeftOnNotice = daysBetween(input.asOf, lwd)
  const served = daysLeftOnNotice < 0

  const milestones = OFFSETS.map(({ id, fromLwd }) => {
    const dueDate = addDays(lwd, fromLwd)
    return { id, dueDate, daysUntilDue: daysBetween(input.asOf, dueDate) }
  })

  return { lastWorkingDay: lwd, daysLeftOnNotice, served, milestones }
}
