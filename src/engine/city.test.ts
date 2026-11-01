import { describe, expect, it } from 'vitest'
import {
  HRA_METRO_CITY_STATE,
  cityChoicesFor,
  cityFromLegacyMetro,
  isHraMetro,
  normaliseCity,
  ptVariesByTown,
} from './city'
import { HRA_METRO_STATE_CODES } from './salary'

describe('HRA metro cities (Rule 279(1)(c), Income-tax Rules, 2026)', () => {
  it('lists exactly the eight cities', () => {
    expect(Object.keys(HRA_METRO_CITY_STATE).sort()).toEqual(
      ['ahmedabad', 'bengaluru', 'chennai', 'delhi', 'hyderabad', 'kolkata', 'mumbai', 'pune'],
    )
  })

  it('agrees with the state-level list', () => {
    const states = [...new Set(Object.values(HRA_METRO_CITY_STATE))].sort()
    expect(states).toEqual([...HRA_METRO_STATE_CODES].sort())
  })

  it('offers a state its own cities, then "other"', () => {
    expect(cityChoicesFor('MH')).toEqual(['mumbai', 'pune', 'other'])
    expect(cityChoicesFor('KA')).toEqual(['bengaluru', 'other'])
    expect(cityChoicesFor('KL')).toEqual(['other'])
  })

  it('a city counts only inside its own state', () => {
    expect(isHraMetro('MH', 'pune')).toBe(true)
    expect(isHraMetro('MH', 'other')).toBe(false)
    expect(isHraMetro('KA', 'mumbai')).toBe(false)
    expect(isHraMetro('KA', undefined)).toBe(false)
  })

  it('drops a city that no longer matches the state', () => {
    expect(normaliseCity('KA', 'chennai')).toBe('other')
    expect(normaliseCity('TN', 'chennai')).toBe('chennai')
  })

  it('maps the old metro on/off answer to a city', () => {
    expect(cityFromLegacyMetro('MH', true)).toBe('mumbai')
    expect(cityFromLegacyMetro('MH', false)).toBe('other')
    expect(cityFromLegacyMetro('KL', true)).toBe('other')
  })
})

describe('professional tax set town by town', () => {
  it('Tamil Nadu is exact only for Chennai', () => {
    expect(ptVariesByTown('TN', 'chennai')).toBe(false)
    expect(ptVariesByTown('TN', 'other')).toBe(true)
  })

  it('Kerala always varies; Karnataka never does', () => {
    expect(ptVariesByTown('KL', 'other')).toBe(true)
    expect(ptVariesByTown('KA', 'bengaluru')).toBe(false)
    expect(ptVariesByTown('KA', 'other')).toBe(false)
  })
})
