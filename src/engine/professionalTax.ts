import type { StateCode } from './types'

/**
 * Annual professional tax for a salaried employee at each state's published
 * maximum (true for anyone using a CTC decoder). Not independently
 * primary-sourced this session except where marked VERIFIED below. A few
 * states have month-specific quirks (MH charges ₹300 in February) folded into
 * the annual figure. Tamil Nadu, Kerala and Odisha are local-body levies that
 * can vary by municipality.
 *
 * Punjab's levy is State Development Tax under the Punjab State Development
 * Tax Act, 2018 — not "professional tax": ₹200/month (₹2,400/year) at the top
 * slab for salaried employees.
 * VERIFIED: 2026-08-23 | Source: Punjab State Development Tax Act, 2018 (official reading per master plan §4/D12) | FY: 2026-27
 *
 * Codes in `PT_AMOUNT_UNVERIFIED` levy PT but have no primary-sourced amount
 * in this table — they are 0 and must be labelled approximate. Constitutional
 * ceiling is ₹2,500/year.
 */
export const PROFESSIONAL_TAX_CEILING = 2_500

export const PT_AMOUNT_UNVERIFIED: readonly StateCode[] = [
  'BR',
  'AS',
  'JH',
  'CG',
  'SK',
  'ML',
  'TR',
  'PY',
  'other',
]

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
  PB: 2_400, // Punjab State Development Tax Act, 2018 — see header note.
  BR: 0,
  AS: 0,
  JH: 0,
  CG: 0,
  SK: 0,
  ML: 0,
  TR: 0,
  PY: 0,
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
  PB: 'Punjab',
  BR: 'Bihar',
  AS: 'Assam',
  JH: 'Jharkhand',
  CG: 'Chhattisgarh',
  SK: 'Sikkim',
  ML: 'Meghalaya',
  TR: 'Tripura',
  PY: 'Puducherry',
  other: 'Other / not sure',
}
