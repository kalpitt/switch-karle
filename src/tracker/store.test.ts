import { beforeEach, describe, expect, it } from 'vitest'
import {
  addApplication,
  exportAll,
  importAll,
  load,
  moveStage,
  removeApplication,
  save,
  STORAGE_KEY,
  updateApplication,
} from './store'
import type { Application } from './types'

/** Minimal localStorage shim — the vitest environment is 'node', so there's no real DOM storage. */
class LocalStorageShim {
  private store = new Map<string, string>()
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  clear(): void {
    this.store.clear()
  }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new LocalStorageShim(),
    configurable: true,
    writable: true,
  })
})

const DECODER_STORAGE_KEY = 'chhalaang.decoder.v1'

describe('load', () => {
  it('returns [] when nothing is stored', () => {
    expect(load()).toEqual([])
  })

  it('returns [] when storage holds corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(load()).toEqual([])
  })

  it('returns [] when storage holds a non-array value', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ oops: true }))
    expect(load()).toEqual([])
  })

  it('round-trips what save() wrote', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    save(list)
    expect(load()).toEqual(list)
  })
})

describe('addApplication', () => {
  it('appends a new application with defaults filled in', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    expect(list).toHaveLength(1)
    const app = list[0]
    expect(app.company).toBe('Acme')
    expect(app.role).toBe('SDE II')
    expect(app.stage).toBe('researching')
    expect(app.id).toBeTruthy()
    expect(app.createdAt).toBeTruthy()
    expect(app.updatedAt).toBe(app.createdAt)
  })

  it('carries through optional fields and an explicit stage', () => {
    const list = addApplication([], {
      company: 'Beta',
      role: 'PM',
      stage: 'interviewing',
      ctcDiscussedAnnual: 2_400_000,
      noticePeriodDays: 60,
      source: 'referral',
      nextAction: 'Follow up with recruiter',
      nextActionDate: '2026-08-01',
      notes: 'Panel round next week',
    })
    expect(list[0]).toMatchObject({
      company: 'Beta',
      role: 'PM',
      stage: 'interviewing',
      ctcDiscussedAnnual: 2_400_000,
      noticePeriodDays: 60,
      source: 'referral',
      nextAction: 'Follow up with recruiter',
      nextActionDate: '2026-08-01',
      notes: 'Panel round next week',
    })
  })

  it('does not mutate the input list', () => {
    const original: Application[] = []
    addApplication(original, { company: 'Acme', role: 'SDE II' })
    expect(original).toEqual([])
  })

  it('assigns distinct ids across calls', () => {
    let list = addApplication([], { company: 'A', role: 'X' })
    list = addApplication(list, { company: 'B', role: 'Y' })
    expect(list[0].id).not.toBe(list[1].id)
  })
})

describe('updateApplication', () => {
  it('patches the matching application and bumps updatedAt', async () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    const before = list[0].updatedAt
    await new Promise((r) => setTimeout(r, 2))
    const updated = updateApplication(list, list[0].id, { role: 'Staff SDE', notes: 'promoted role' })
    expect(updated[0].role).toBe('Staff SDE')
    expect(updated[0].notes).toBe('promoted role')
    expect(updated[0].updatedAt).not.toBe(before)
  })

  it('leaves other applications untouched', () => {
    let list = addApplication([], { company: 'A', role: 'X' })
    list = addApplication(list, { company: 'B', role: 'Y' })
    const targetId = list[0].id
    const updated = updateApplication(list, targetId, { company: 'A2' })
    expect(updated[1]).toEqual(list[1])
  })

  it('is a no-op (returns list of same shape) for an unknown id', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    const updated = updateApplication(list, 'does-not-exist', { company: 'Nope' })
    expect(updated).toEqual(list)
  })
})

describe('removeApplication', () => {
  it('removes only the matching application', () => {
    let list = addApplication([], { company: 'A', role: 'X' })
    list = addApplication(list, { company: 'B', role: 'Y' })
    const removed = removeApplication(list, list[0].id)
    expect(removed).toHaveLength(1)
    expect(removed[0].company).toBe('B')
  })

  it('is a no-op for an unknown id', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    expect(removeApplication(list, 'does-not-exist')).toEqual(list)
  })
})

describe('moveStage', () => {
  it('advances a stage forward', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    const moved = moveStage(list, list[0].id, 1)
    expect(moved[0].stage).toBe('applied')
  })

  it('moves a stage backward', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II', stage: 'interviewing' })
    const moved = moveStage(list, list[0].id, -1)
    expect(moved[0].stage).toBe('applied')
  })

  it('clamps at the last stage', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II', stage: 'decided' })
    const moved = moveStage(list, list[0].id, 1)
    expect(moved[0].stage).toBe('decided')
  })

  it('clamps at the first stage', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II', stage: 'researching' })
    const moved = moveStage(list, list[0].id, -1)
    expect(moved[0].stage).toBe('researching')
  })

  it('does not bump updatedAt when clamped (no actual change)', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II', stage: 'researching' })
    const before = list[0].updatedAt
    const moved = moveStage(list, list[0].id, -1)
    expect(moved[0].updatedAt).toBe(before)
  })
})

describe('exportAll / importAll', () => {
  it('round-trips both the decoder and tracker stores', () => {
    let tracker = addApplication([], { company: 'Acme', role: 'SDE II' })
    tracker = addApplication(tracker, { company: 'Beta', role: 'PM' })
    save(tracker)
    const decoderState = { ctcAnnual: 2_400_000, state: 'KA' }
    localStorage.setItem(DECODER_STORAGE_KEY, JSON.stringify(decoderState))

    const json = exportAll()
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe(1)
    expect(parsed.tracker).toEqual(tracker)
    expect(parsed.decoder).toEqual(decoderState)

    // Wipe both stores, then restore from the export.
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(DECODER_STORAGE_KEY)
    expect(load()).toEqual([])

    importAll(json)
    expect(load()).toEqual(tracker)
    expect(JSON.parse(localStorage.getItem(DECODER_STORAGE_KEY)!)).toEqual(decoderState)
  })

  it('handles a missing decoder store gracefully on export', () => {
    save(addApplication([], { company: 'Acme', role: 'SDE II' }))
    const parsed = JSON.parse(exportAll())
    expect(parsed.decoder).toBeNull()
  })

  it('throws on invalid JSON', () => {
    expect(() => importAll('{not json')).toThrow()
  })

  it('throws on well-formed JSON with the wrong shape', () => {
    expect(() => importAll(JSON.stringify({ hello: 'world' }))).toThrow()
    expect(() => importAll(JSON.stringify({ version: 1, tracker: 'not-an-array' }))).toThrow()
    expect(() => importAll(JSON.stringify({ version: 2, tracker: [] }))).toThrow()
  })

  it('throws when tracker entries are missing required fields', () => {
    const garbage = JSON.stringify({ version: 1, decoder: null, tracker: [{ company: 'Acme' }] })
    expect(() => importAll(garbage)).toThrow()
  })

  it('does not touch existing storage when import throws', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    save(list)
    expect(() => importAll('garbage')).toThrow()
    expect(load()).toEqual(list)
  })
})
