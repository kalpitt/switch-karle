import { afterEach, describe, expect, it } from 'vitest'
import { resetBootEchoForTests } from '../lib/storage'
import {
  CURRENT_JOB_STORAGE_KEY,
  applyCurrentJob,
  fillFromCurrentJob,
  loadCurrentJob,
  rememberCurrentJob,
} from './currentJob'

class MemoryStorage {
  private readonly data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null
  }
}

const mem = new MemoryStorage()

function install() {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: mem })
  // Every test is a fresh page load, not a continuation of the last one.
  resetBootEchoForTests()
}

afterEach(() => mem.clear())

describe('current job record', () => {
  it('is empty until the user types something', () => {
    install()
    expect(loadCurrentJob()).toEqual({})
    expect(mem.getItem(CURRENT_JOB_STORAGE_KEY)).toBeNull()
  })

  it('persists the very first value typed — the boot-echo skip must not eat it', () => {
    // The trap the design entry warns about: this record never echoes on
    // mount, so the skip armed by the boot read has to be released, or the
    // user's first-ever entry is silently dropped and only the second sticks.
    install()
    loadCurrentJob() // a tool booting: reads, finds nothing
    rememberCurrentJob({ monthlyBasic: 90_000 }) // the user's first keystroke
    expect(mem.getItem(CURRENT_JOB_STORAGE_KEY)).not.toBeNull()
    expect(loadCurrentJob()).toEqual({ monthlyBasic: 90_000 })
  })

  it('persists the first value even when no tool read the record before writing', () => {
    install()
    rememberCurrentJob({ noticePeriodDays: 60 })
    expect(loadCurrentJob()).toEqual({ noticePeriodDays: 60 })
  })

  it('merges a patch into what is already there', () => {
    install()
    rememberCurrentJob({ monthlyBasic: 90_000 })
    rememberCurrentJob({ monthlyGross: 1_60_000 })
    rememberCurrentJob({ monthlyBasic: 95_000 })
    expect(loadCurrentJob()).toEqual({ monthlyBasic: 95_000, monthlyGross: 1_60_000 })
  })

  it('keeps basic and basic+DA apart — remembering one never sets the other', () => {
    install()
    rememberCurrentJob({ monthlyBasicDA: 1_10_000 })
    expect(loadCurrentJob()).toEqual({ monthlyBasicDA: 1_10_000 })
    expect(loadCurrentJob().monthlyBasic).toBeUndefined()
    rememberCurrentJob({ monthlyBasic: 1_00_000 })
    expect(loadCurrentJob()).toEqual({ monthlyBasic: 1_00_000, monthlyBasicDA: 1_10_000 })
  })

  it('a cleared or nonsense input does not blank the stored number', () => {
    install()
    rememberCurrentJob({ monthlyBasic: 90_000, noticePeriodDays: 90 })
    rememberCurrentJob({ monthlyBasic: 0 })
    rememberCurrentJob({ monthlyBasic: Number.NaN })
    rememberCurrentJob({ noticePeriodDays: -5 })
    rememberCurrentJob({ monthlyGross: undefined })
    expect(loadCurrentJob()).toEqual({ monthlyBasic: 90_000, noticePeriodDays: 90 })
  })

  it('ignores corrupt storage and unknown fields', () => {
    install()
    mem.setItem(CURRENT_JOB_STORAGE_KEY, '{not json')
    expect(loadCurrentJob()).toEqual({})
    mem.setItem(CURRENT_JOB_STORAGE_KEY, '"a string"')
    expect(loadCurrentJob()).toEqual({})
    mem.setItem(
      CURRENT_JOB_STORAGE_KEY,
      JSON.stringify({ monthlyBasic: '90000', monthlyGross: 1_50_000, ctcAnnual: 30_00_000 }),
    )
    expect(loadCurrentJob()).toEqual({ monthlyGross: 1_50_000 })
  })

  it('applyCurrentJob overlays only the fields the record holds, where the tool says', () => {
    const draft = { basis: 'basic', unservedDays: 30, monthlyBasic: 80_000, monthlyGross: 1_50_000 }
    const job = { monthlyBasic: 95_000, noticePeriodDays: 90, monthlyBasicDA: 1_10_000 }
    expect(
      applyCurrentJob(draft, job, {
        monthlyBasic: 'monthlyBasic',
        monthlyGross: 'monthlyGross',
        noticePeriodDays: 'unservedDays',
      }),
    ).toEqual({ basis: 'basic', unservedDays: 90, monthlyBasic: 95_000, monthlyGross: 1_50_000 })
    // basic+DA was not asked for, so it does not land anywhere.
    expect(applyCurrentJob(draft, job, { monthlyBasicDA: 'monthlyBasic' }).monthlyBasic).toBe(1_10_000)
    expect(applyCurrentJob(draft, {}, { monthlyBasic: 'monthlyBasic' })).toEqual(draft)
  })

  it('lives under the switchkarle prefix so the erase control sweeps it', () => {
    expect(CURRENT_JOB_STORAGE_KEY.startsWith('switchkarle.')).toBe(true)
  })
})

/**
 * The distinction that cost two bugs, both reproduced in a browser before this
 * was written: a field the tool never writes back to the record must not be
 * put back over a draft the user has already saved.
 *
 * `notice-buyout` seeds unserved days from the notice period, then the user
 * negotiates it down to 10 and saves. `fnf-checker` seeds the claimed gross,
 * then the user replaces it with what the settlement sheet actually says.
 * Neither number ever reaches the record, so re-applying the record on boot
 * silently restored the old value and overwrote the user's on disk — and in
 * the F&F case it made the tool audit the sheet against itself.
 */
describe('fillFromCurrentJob: shared always, seed-only on a fresh draft', () => {
  const draft = { monthlyBasic: 80_000, monthlyGross: 1_50_000, unservedDays: 30 }
  const job = { monthlyBasic: 95_000, monthlyGross: 1_60_000, noticePeriodDays: 60 }
  const maps = {
    shared: { monthlyBasic: 'monthlyBasic' as const },
    seedOnly: { noticePeriodDays: 'unservedDays' as const, monthlyGross: 'monthlyGross' as const },
  }

  it('fills both kinds when the tool has nothing saved', () => {
    expect(fillFromCurrentJob(draft, job, maps, false)).toEqual({
      monthlyBasic: 95_000,
      monthlyGross: 1_60_000,
      unservedDays: 60,
    })
  })

  it('leaves seed-only fields alone once the tool has a saved draft', () => {
    const saved = { monthlyBasic: 80_000, monthlyGross: 1_42_500, unservedDays: 10 }
    expect(fillFromCurrentJob(saved, job, maps, true)).toEqual({
      monthlyBasic: 95_000, // shared: the latest typed anywhere still wins
      monthlyGross: 1_42_500, // seed-only: what the user typed here survives
      unservedDays: 10,
    })
  })

  it('an absent map is not an error, and an empty record changes nothing', () => {
    expect(fillFromCurrentJob(draft, job, {}, false)).toEqual(draft)
    expect(fillFromCurrentJob(draft, {}, maps, false)).toEqual(draft)
  })
})
