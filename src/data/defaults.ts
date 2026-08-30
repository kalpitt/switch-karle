import type { OfferInput } from '../engine/types'

export const DECODER_STORAGE_KEY = 'switchkarle.decoder.v1'
export const HANDOFF_STORAGE_KEY = 'switchkarle.handoff.v1'

export interface HandoffPayload {
  /** Tool slug this payload is for. Only that tool may consume it. */
  to: string
  /** Epoch ms. A handoff is meant to survive one navigation, nothing longer. */
  at: number
  ctcAnnual?: number
  noticePeriodDays?: number
}

const HANDOFF_TTL_MS = 5 * 60 * 1000

export const DEFAULT_OFFER: OfferInput = {
  ctcAnnual: 2_400_000,
  variableAnnual: 240_000,
  basicPercent: 40,
  hraPercentOfBasic: 50,
  employerPfInCtc: true,
  gratuityInCtc: false,
  pfOnFullBasic: true,
  noticePeriodDays: 60,
  state: 'KA',
}

export function writeHandoff(payload: HandoffPayload): void {
  try {
    localStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* storage unavailable */
  }
}

export function consumeHandoff(to: string): HandoffPayload | null {
  try {
    const raw = localStorage.getItem(HANDOFF_STORAGE_KEY)
    if (!raw) return null
    const payload = JSON.parse(raw) as HandoffPayload
    if (typeof payload !== 'object' || payload === null) {
      localStorage.removeItem(HANDOFF_STORAGE_KEY)
      return null
    }
    if (payload.to !== to) {
      return null
    }
    localStorage.removeItem(HANDOFF_STORAGE_KEY)
    if (Date.now() - payload.at > HANDOFF_TTL_MS) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function loadOffer(): OfferInput {
  try {
    const raw = localStorage.getItem(DECODER_STORAGE_KEY)
    if (raw) return { ...DEFAULT_OFFER, ...JSON.parse(raw) }
  } catch {
    /* corrupted storage → fall through to defaults */
  }
  return DEFAULT_OFFER
}

export function saveOffer(offer: OfferInput): void {
  try {
    localStorage.setItem(DECODER_STORAGE_KEY, JSON.stringify(offer))
  } catch {
    /* storage unavailable — decoder just won't persist */
  }
}
