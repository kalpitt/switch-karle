import { afterEach, describe, expect, it } from 'vitest'
import { resetBootEchoForTests } from '../lib/storage'
import { CURRENT_JOB_STORAGE_KEY } from './currentJob'
import { PLAN_STORAGE_KEY } from './plan'
import { loadPlanDates, planDates, seedFromPlan, stillFromPlan } from './planDates'

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
  resetBootEchoForTests()
}

afterEach(() => mem.clear())

interface GratuityLike {
  basic: number
  joinDate: string
  exitDate: string
}
const SAMPLE: GratuityLike = { basic: 100_000, joinDate: '2021-08-01', exitDate: '2026-08-31' }
const MAP = { joinDate: 'joinDate', lastWorkingDay: 'exitDate' } as const

describe('planDates', () => {
  it('is empty when nothing is saved', () => {
    expect(planDates({}, {})).toEqual({})
  })

  it('takes the join date from the current job and the resign date from the plan', () => {
    expect(planDates({ resignDate: '2027-06-01' }, { joinDate: '2022-01-12' })).toEqual({
      joinDate: '2022-01-12',
      resignDate: '2027-06-01',
    })
  })

  it('derives the last working day only when the notice period is known too', () => {
    // Resignation day counts as day one: 1 June + 90 − 1 = 29 August (our reading, see dates.ts).
    expect(planDates({ resignDate: '2027-06-01' }, { noticePeriodDays: 90 })).toEqual({
      resignDate: '2027-06-01',
      lastWorkingDay: '2027-08-29',
    })
    expect(planDates({}, { noticePeriodDays: 90 })).toEqual({})
  })

  it('reads both records through their own loaders, and writes nothing', () => {
    install()
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ resignDate: '2027-06-01', reason: 'x' }))
    localStorage.setItem(CURRENT_JOB_STORAGE_KEY, JSON.stringify({ joinDate: '2022-01-12', noticePeriodDays: 60 }))
    expect(loadPlanDates()).toEqual({
      joinDate: '2022-01-12',
      resignDate: '2027-06-01',
      lastWorkingDay: '2027-07-30',
    })
    expect(localStorage.length).toBe(2)
  })

  it('ignores a malformed stored date instead of seeding it', () => {
    install()
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({ resignDate: '2027-02-30' }))
    localStorage.setItem(CURRENT_JOB_STORAGE_KEY, JSON.stringify({ joinDate: 'soon' }))
    expect(loadPlanDates()).toEqual({})
  })
})

describe('seedFromPlan', () => {
  const dates = { joinDate: '2022-01-12', resignDate: '2027-06-01', lastWorkingDay: '2027-08-29' }

  it('fills a fresh draft and says which dates it placed', () => {
    const { draft, seeded } = seedFromPlan(SAMPLE, dates, MAP, false)
    expect(draft).toEqual({ basic: 100_000, joinDate: '2022-01-12', exitDate: '2027-08-29' })
    expect(seeded).toEqual({ joinDate: '2022-01-12', lastWorkingDay: '2027-08-29' })
  })

  it('never touches a draft the person saved in the tool', () => {
    const saved = { basic: 90_000, joinDate: '2020-03-01', exitDate: '2026-12-31' }
    const { draft, seeded } = seedFromPlan(saved, dates, MAP, true)
    expect(draft).toBe(saved)
    expect(seeded).toEqual({})
  })

  it('keeps the sample for a date the plan does not have', () => {
    const { draft, seeded } = seedFromPlan(SAMPLE, { joinDate: '2022-01-12' }, MAP, false)
    expect(draft.exitDate).toBe(SAMPLE.exitDate)
    expect(seeded).toEqual({ joinDate: '2022-01-12' })
  })

  it('with no plan at all, leaves the sample answer exactly as it was', () => {
    const { draft, seeded } = seedFromPlan(SAMPLE, {}, MAP, false)
    expect(draft).toEqual(SAMPLE)
    expect(seeded).toEqual({})
  })
})

describe('stillFromPlan', () => {
  const seeded = { joinDate: '2022-01-12', lastWorkingDay: '2027-08-29' }

  it('claims a date only while the draft still holds it', () => {
    const draft = { basic: 1, joinDate: '2022-01-12', exitDate: '2027-08-29' }
    expect(stillFromPlan(draft, seeded, MAP)).toEqual(seeded)
    expect(stillFromPlan({ ...draft, exitDate: '2027-09-15' }, seeded, MAP)).toEqual({ joinDate: '2022-01-12' })
    expect(stillFromPlan({ ...draft, joinDate: '2022-02-01', exitDate: '2027-09-15' }, seeded, MAP)).toEqual({})
  })
})
