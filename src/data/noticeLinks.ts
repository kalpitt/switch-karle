import type { NoticeItemId } from '../engine/noticeTracker'

/**
 * The tool that actually does the thing each notice-period milestone names, so
 * a row is a doorway and not just a date. `asset-return` is deliberately absent:
 * handing back a laptop is a physical act with no tool behind it, and inventing
 * a link for it would be worse than leaving the row plain.
 */
export const NOTICE_TOOL: Partial<Record<NoticeItemId, string>> = {
  handover: 'handover-doc',
  'fnf-docs': 'fnf-checker',
  'insurance-end': 'insurance-gap',
  'pf-doe': 'epf-transfer',
  'relieving-chase': 'relieving-chaser',
}
