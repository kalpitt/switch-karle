import type { OfferInput } from '../engine/types'

export const DECODER_STORAGE_KEY = 'switchkarle.decoder.v1'

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
