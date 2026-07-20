/** Job-application tracker data model. All dates are ISO strings. */

export type Stage = 'researching' | 'applied' | 'interviewing' | 'offer' | 'decided'

/** A pasted-back answer from the user's own AI, saved against an application. */
export interface Insight {
  id: string
  /** id of the PromptTemplate this answer responds to. */
  templateId: string
  title: string
  content: string
  /** ISO timestamp */
  savedAt: string
}

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
  /** Saved AI answers from Prompt Studio, most-recent-last. */
  insights?: Insight[]
  /** ISO timestamp */
  createdAt: string
  /** ISO timestamp */
  updatedAt: string
}
