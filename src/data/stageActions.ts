/**
 * Maps each job application tracker stage to the relevant tool slugs.
 *
 * Each card renders doorways to these tools so the tracker acts as the spine
 * of the switch, opening into the right calculator or document at each moment.
 */
import type { Stage } from '../tracker/types'

export const STAGE_ACTIONS: Record<Stage, readonly string[]> = {
  researching: ['expected-ctc'],
  applied: ['recruiter-followup'],
  interviewing: ['expected-ctc', 'real-hike'],
  offer: ['decoder', 'offer-comparison', 'counter-offer'],
  decided: ['resignation-letter', 'notice-buyout'],
} as const
