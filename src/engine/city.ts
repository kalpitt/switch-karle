import type { StateCode } from './types'

/**
 * The eight cities that get the 50%-of-basic HRA limb, and "anywhere else".
 * Asking for the city, not just the state, is what makes the limb exact: a
 * state can hold a qualifying city and non-qualifying towns (MH holds Mumbai
 * and Pune but also Nagpur; KA holds Bengaluru but also Mysuru).
 * VERIFIED: 2026-09-27 | Source: Income-tax Rules, 2026 (G.S.R. 198(E))
 * https://www.incometaxindia.gov.in/documents/81799/11848482/En-Notified-IT-Rules-2026-20-03-2026.pdf
 * Rule 279(1)(c) | FY: 2026-27
 */
export type HraMetroCity =
  | 'mumbai'
  | 'pune'
  | 'kolkata'
  | 'delhi'
  | 'chennai'
  | 'hyderabad'
  | 'ahmedabad'
  | 'bengaluru'

export type CityChoice = HraMetroCity | 'other'

export const HRA_METRO_CITY_STATE: Record<HraMetroCity, StateCode> = {
  mumbai: 'MH',
  pune: 'MH',
  kolkata: 'WB',
  delhi: 'DL',
  chennai: 'TN',
  hyderabad: 'TG',
  ahmedabad: 'GJ',
  bengaluru: 'KA',
}

/** City options for a state: its qualifying cities first, then "anywhere else". */
export function cityChoicesFor(state: StateCode): CityChoice[] {
  const metros = (Object.keys(HRA_METRO_CITY_STATE) as HraMetroCity[]).filter(
    (c) => HRA_METRO_CITY_STATE[c] === state,
  )
  return [...metros, 'other']
}

/** A city that does not belong to the state (e.g. after the state changed) becomes "other". */
export function normaliseCity(state: StateCode, city: CityChoice | undefined): CityChoice {
  if (!city || city === 'other') return 'other'
  return HRA_METRO_CITY_STATE[city] === state ? city : 'other'
}

/** True only for one of the eight cities, and only inside its own state. */
export function isHraMetro(state: StateCode, city: CityChoice | undefined): boolean {
  return normaliseCity(state, city) !== 'other'
}

/**
 * Best guess at a city from the older metro on/off answer, for data saved
 * before the city field existed: metro on → the state's first qualifying city.
 */
export function cityFromLegacyMetro(state: StateCode, metro: boolean): CityChoice {
  return metro ? cityChoicesFor(state)[0] : 'other'
}

/**
 * Professional tax set town by town, so the state figure is only a stand-in.
 * Tamil Nadu: the table holds Chennai's rate, so any other town varies. Kerala:
 * every municipality and panchayat sets its own, and none is verified here.
 * See the header of `professionalTax.ts` for the sources.
 */
export function ptVariesByTown(state: StateCode, city: CityChoice | undefined): boolean {
  if (state === 'KL') return true
  if (state === 'TN') return normaliseCity(state, city) !== 'chennai'
  return false
}
