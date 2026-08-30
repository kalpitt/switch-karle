import type { OfferInput } from '../engine/types'

export const DECODER_STORAGE_KEY = 'switchkarle.decoder.v1'
export const HANDOFF_STORAGE_KEY = 'switchkarle.handoff.v1'

export interface HandoffPayload {
  ctcAnnual?: number
}

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

export function consumeHandoff(): HandoffPayload | null {
  try {
    const raw = localStorage.getItem(HANDOFF_STORAGE_KEY)
    if (!raw) return null
    localStorage.removeItem(HANDOFF_STORAGE_KEY)
    return JSON.parse(raw) as HandoffPayload
  } catch {
    return null
  }
}

export function loadOffer(): OfferInput {
  let offer = DEFAULT_OFFER
  try {
    const raw = localStorage.getItem(DECODER_STORAGE_KEY)
    if (raw) offer = { ...DEFAULT_OFFER, ...JSON.parse(raw) }
  } catch {
    /* corrupted storage → fall through to defaults */
  }
  const handoff = consumeHandoff()
  if (handoff?.ctcAnnual) {
    return { ...offer, ctcAnnual: handoff.ctcAnnual }
  }
  return offer
}

export function saveOffer(offer: OfferInput): void {
  try {
    localStorage.setItem(DECODER_STORAGE_KEY, JSON.stringify(offer))
  } catch {
    /* storage unavailable — decoder just won't persist */
  }
}
