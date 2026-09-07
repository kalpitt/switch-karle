import { afterEach, describe, expect, it } from 'vitest'
import { resetBootEchoForTests } from '../lib/storage'
import { ACTION_IDS, PLAN_STORAGE_KEY, erasePlan, loadPlan, savePlan, tickAction } from './plan'

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

describe('the saved plan', () => {
  it('is empty until the user decides something, and writes no key by being read', () => {
    install()
    expect(loadPlan()).toEqual({})
    expect(mem.getItem(PLAN_STORAGE_KEY)).toBeNull()
  })

  /**
   * The failure docs/DIRECTION.md Part 13 sends you to ARCHITECTURE for. The
   * boot read arms a skip meant to stop a tool persisting its own defaults, and
   * this record has no mount echo to spend it on. Without `releaseBootEcho` the
   * skip is still armed when the first real save arrives — and for a first-time
   * visitor that save is their resign date, the whole point of the session.
   */
  it('persists the first decision of the session — the boot-echo skip must not eat it', () => {
    install()
    loadPlan() // the page booting: reads, finds nothing
    savePlan({ resignDate: '2027-06-01' }) // the user taps "keep the hike"
    expect(mem.getItem(PLAN_STORAGE_KEY)).not.toBeNull()
    expect(loadPlan()).toEqual({ resignDate: '2027-06-01' })
  })

  it('persists the first decision even when nothing read the record first', () => {
    install()
    savePlan({ resignDate: '2027-06-01' })
    expect(loadPlan().resignDate).toBe('2027-06-01')
  })

  it('holds Part 5s plan table and nothing else', () => {
    install()
    savePlan({
      reason: 'My manager takes credit for my work and I have stopped learning.',
      hikeCreditMonth: 5,
      hikeCreditYear: 2027,
      resignDate: '2027-06-01',
      lookingSince: '2026-09-07',
      companies: ['Zerodha', 'Postman'],
    })
    tickAction('write-reason', '2026-09-07')
    expect(loadPlan()).toEqual({
      reason: 'My manager takes credit for my work and I have stopped learning.',
      hikeCreditMonth: 5,
      hikeCreditYear: 2027,
      resignDate: '2027-06-01',
      lookingSince: '2026-09-07',
      companies: ['Zerodha', 'Postman'],
      ticks: { 'write-reason': '2026-09-07' },
    })
  })

  it('never stores money, whatever the caller passes', () => {
    install()
    mem.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({ resignDate: '2027-06-01', monthlyBasicDA: 72_000, noticePeriodDays: 90 }),
    )
    expect(loadPlan()).toEqual({ resignDate: '2027-06-01' })
  })

  it('merges rather than replaces: one answer never wipes the last one', () => {
    install()
    savePlan({ hikeCreditMonth: 5, hikeCreditYear: 2027 })
    savePlan({ resignDate: '2027-06-01' })
    expect(loadPlan()).toEqual({
      hikeCreditMonth: 5,
      hikeCreditYear: 2027,
      resignDate: '2027-06-01',
    })
  })

  it('merges ticks per action, so recording one never loses another', () => {
    install()
    tickAction('write-reason', '2026-09-07')
    tickAction('name-five-companies', '2026-09-09')
    expect(loadPlan().ticks).toEqual({
      'write-reason': '2026-09-07',
      'name-five-companies': '2026-09-09',
    })
    savePlan({ ticks: null })
    expect(loadPlan().ticks).toBeUndefined()
  })

  it('rejects an unknown action id and a tick that is not a date', () => {
    install()
    tickAction('write-reason', '2026-09-07')
    mem.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({
        ticks: { 'write-reason': '2026-09-07', 'buy-a-yacht': '2026-09-07', 'apply-to-one': 'yes' },
      }),
    )
    expect(loadPlan().ticks).toEqual({ 'write-reason': '2026-09-07' })
  })

  it('drops a junk date rather than storing it, keeping the one already saved', () => {
    install()
    savePlan({ resignDate: '2027-06-01' })
    for (const junk of ['01/06/2027', '2027-6-1', '2027-02-30', 'next June', '']) {
      savePlan({ resignDate: junk })
    }
    expect(loadPlan().resignDate).toBe('2027-06-01')
  })

  it('drops a hike month outside 1 to 12', () => {
    install()
    savePlan({ hikeCreditMonth: 5 })
    for (const junk of [0, 13, 5.5, Number.NaN]) {
      savePlan({ hikeCreditMonth: junk })
    }
    expect(loadPlan().hikeCreditMonth).toBe(5)
  })

  it('trims the reason and refuses one that is only whitespace', () => {
    install()
    savePlan({ reason: '  I have stopped learning.  ' })
    expect(loadPlan().reason).toBe('I have stopped learning.')
    savePlan({ reason: '   ' })
    expect(loadPlan().reason).toBe('I have stopped learning.')
  })

  it('clears a field on an explicit null, which is the only way to empty one', () => {
    install()
    savePlan({ reason: 'I have stopped learning.', companies: ['Zerodha'] })
    savePlan({ reason: null })
    expect(loadPlan()).toEqual({ companies: ['Zerodha'] })
  })

  it('keeps the company list plain: strings, trimmed, blanks dropped', () => {
    install()
    mem.setItem(
      PLAN_STORAGE_KEY,
      JSON.stringify({ companies: [' Zerodha ', '', 42, null, 'Postman'] }),
    )
    expect(loadPlan().companies).toEqual(['Zerodha', 'Postman'])
    savePlan({ companies: 'Zerodha' as unknown as string[] })
    expect(loadPlan().companies).toEqual(['Zerodha', 'Postman'])
  })

  it('lookingSince does not move the resign date', () => {
    install()
    savePlan({ resignDate: '2027-06-01' })
    savePlan({ lookingSince: '2026-09-07' })
    expect(loadPlan().resignDate).toBe('2027-06-01')
  })

  it('survives a corrupt or non-object record without throwing', () => {
    install()
    mem.setItem(PLAN_STORAGE_KEY, 'not json at all')
    expect(loadPlan()).toEqual({})
    mem.setItem(PLAN_STORAGE_KEY, JSON.stringify(['a', 'list']))
    expect(loadPlan()).toEqual({})
    mem.setItem(PLAN_STORAGE_KEY, JSON.stringify(null))
    expect(loadPlan()).toEqual({})
  })

  it('erasePlan forgets the plan and only the plan', () => {
    install()
    mem.setItem('switchkarle.current-job.v1', JSON.stringify({ monthlyBasic: 90_000 }))
    savePlan({ resignDate: '2027-06-01' })
    erasePlan()
    expect(mem.getItem(PLAN_STORAGE_KEY)).toBeNull()
    expect(mem.getItem('switchkarle.current-job.v1')).not.toBeNull()
  })

  it('is on the erasable key prefix, and names all ten actions once each', () => {
    expect(PLAN_STORAGE_KEY).toBe('switchkarle.plan.v1')
    expect(PLAN_STORAGE_KEY.startsWith('switchkarle.')).toBe(true)
    expect(ACTION_IDS).toHaveLength(10)
    expect(new Set(ACTION_IDS).size).toBe(10)
  })
})
