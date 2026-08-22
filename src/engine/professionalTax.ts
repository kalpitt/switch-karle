import type { StateCode } from './types'

/**
 * CANDIDATE: annual professional tax for a salaried employee at each state's
 * published maximum (true for anyone using a CTC decoder). Not independently
 * primary-sourced this session. A few states have month-specific quirks
 * (MH charges ₹300 in February) folded into the annual figure. Tamil Nadu,
 * Kerala and Odisha are local-body levies that can vary by municipality.
 *
 * `'other'` is 0 and is approximate — Punjab, Bihar, Assam, Jharkhand,
 * Chhattisgarh, Sikkim, Meghalaya, Tripura and Puducherry levy PT and are
 * not in this table. Constitutional ceiling is ₹2,500/year.
 */
export const PROFESSIONAL_TAX_CEILING = 2_500

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
