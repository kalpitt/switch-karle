import { afterEach, describe, expect, it } from 'vitest'
import { resetBootEchoForTests } from '../lib/storage'
import {
  CURRENT_JOB_STORAGE_KEY,
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

  it('lives under the switchkarle prefix so the erase control sweeps it', () => {
    expect(CURRENT_JOB_STORAGE_KEY.startsWith('switchkarle.')).toBe(true)
  })
})

/**
 * The three fields the plan adds (docs/DIRECTION.md Part 5). All three are
 * facts about the employer, so they live here rather than on the plan.
 *
 * `sanitise` used to keep a field only when it was a finite number above zero,
 * which silently dropped every one of them: a join date is a string, and
 * `coveredByAct: false` — the answer that actually changes the screen — is a
 * boolean that is also falsy. Per-field validation is what these pin.
 */
describe('the employer facts the plan needs: join date, work week, Act coverage', () => {
  it('keeps a valid ISO join date, and a work week of 5 or 6', () => {
    install()
    rememberCurrentJob({ joinDate: '2022-01-12', workWeekDays: 5 })
    expect(loadCurrentJob()).toEqual({ joinDate: '2022-01-12', workWeekDays: 5 })
    rememberCurrentJob({ workWeekDays: 6 })
    expect(loadCurrentJob().workWeekDays).toBe(6)
  })

  it('coveredByAct: false survives — it is the answer that matters', () => {
    install()
    rememberCurrentJob({ coveredByAct: false })
    expect(loadCurrentJob()).toEqual({ coveredByAct: false })
    rememberCurrentJob({ coveredByAct: true })
    expect(loadCurrentJob().coveredByAct).toBe(true)
  })

  it('a junk join date is dropped rather than stored', () => {
    install()
    rememberCurrentJob({ joinDate: '2022-01-12' })
    for (const junk of ['12/01/2022', '2022-1-12', '2022-02-30', '2022-13-01', 'yesterday', '']) {
      rememberCurrentJob({ joinDate: junk })
    }
    expect(loadCurrentJob().joinDate).toBe('2022-01-12')
  })

  it('a work week of 7, or 0, or a string, is dropped', () => {
    install()
    rememberCurrentJob({ workWeekDays: 5 })
    mem.setItem(
      CURRENT_JOB_STORAGE_KEY,
      JSON.stringify({ workWeekDays: 7, joinDate: '2022-01-12' }),
    )
    expect(loadCurrentJob()).toEqual({ joinDate: '2022-01-12' })
    mem.setItem(CURRENT_JOB_STORAGE_KEY, JSON.stringify({ workWeekDays: '5' }))
    expect(loadCurrentJob()).toEqual({})
    mem.setItem(CURRENT_JOB_STORAGE_KEY, JSON.stringify({ coveredByAct: 'no' }))
    expect(loadCurrentJob()).toEqual({})
  })

  it('a number field is still a positive finite number, and nothing else', () => {
    install()
    mem.setItem(
      CURRENT_JOB_STORAGE_KEY,
      JSON.stringify({ monthlyBasic: '90000', noticePeriodDays: 0, monthlyGross: 1_50_000 }),
    )
    expect(loadCurrentJob()).toEqual({ monthlyGross: 1_50_000 })
  })

  it('the key is not versioned up: old records simply lack the new fields', () => {
    install()
    mem.setItem(CURRENT_JOB_STORAGE_KEY, JSON.stringify({ monthlyBasic: 90_000 }))
    expect(CURRENT_JOB_STORAGE_KEY).toBe('switchkarle.current-job.v1')
    expect(loadCurrentJob()).toEqual({ monthlyBasic: 90_000 })
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

  it('a record field lands only where the tool asks for it', () => {
    // basic+DA is in the record but this tool never asks for it, so it must not
    // reach a field of its own accord.
    const filled = fillFromCurrentJob(draft, { ...job, monthlyBasicDA: 1_10_000 }, maps, false)
    expect(filled.monthlyBasic).toBe(95_000)
    expect(Object.keys(filled).sort()).toEqual(['monthlyBasic', 'monthlyGross', 'unservedDays'])
  })
})
