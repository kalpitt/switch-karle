import type { StateCode } from './types'

/**
 * Annual professional tax for a salaried employee earning above each state's
 * top slab (true for anyone using a CTC decoder). Values are the standard
 * published maxima; a few states have month-specific quirks (MH charges ₹300
 * in February) which are folded into the annual figure.
 *
 * Marked APPROXIMATE in the UI: slabs change by municipal notification.
 */
export const PROFESSIONAL_TAX_ANNUAL: Record<StateCode, number> = {
  KA: 2_400,
  MH: 2_500,
  TN: 2_190,
  TG: 2_400,
  AP: 2_400,
  WB: 2_400,
  GJ: 2_400,
  MP: 2_500,
  KL: 2_500,
  OD: 2_400,
  DL: 0, // no professional tax
  HR: 0,
  UP: 0,
  RJ: 0,
  other: 0,
}

export const STATE_NAMES: Record<StateCode, string> = {
  KA: 'Karnataka',
  MH: 'Maharashtra',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  AP: 'Andhra Pradesh',
  WB: 'West Bengal',
  GJ: 'Gujarat',
  MP: 'Madhya Pradesh',
  KL: 'Kerala',
  OD: 'Odisha',
  DL: 'Delhi',
  HR: 'Haryana',
  UP: 'Uttar Pradesh',
  RJ: 'Rajasthan',
  other: 'Other / not sure',
}
