/** Job-application tracker data model. All dates are ISO strings. */

export type Stage = 'researching' | 'applied' | 'interviewing' | 'offer' | 'decided'

export interface Application {
  id: string
  company: string
  role: string
  stage: Stage
  /** CTC actually discussed with this company, annual ₹ (may differ from a decoded offer). */
  ctcDiscussedAnnual?: number
  noticePeriodDays?: number
  /** Where the lead came from: referral, LinkedIn, naukri, etc. */
  source?: string
  nextAction?: string
  /** ISO yyyy-mm-dd */
  nextActionDate?: string
  notes?: string
  /** ISO timestamp */
  createdAt: string
  /** ISO timestamp */
  updatedAt: string
}
