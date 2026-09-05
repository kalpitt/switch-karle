import { beforeEach, describe, expect, it } from 'vitest'
import {
  addApplication,
  addInsight,
  exportAll,
  hasUndo,
  load,
  mergeApplications,
  mergeBackup,
  moveStage,
  parseBackup,
  removeApplication,
  removeInsight,
  restoreAll,
  save,
  snapshotForUndo,
  STAGE_ORDER,
  STORAGE_KEY,
  UNDO_STORAGE_KEY,
  undoLastRestore,
  updateApplication,
  type BackupBundle,
} from './store'
import type { Application } from './types'

/** Minimal localStorage shim with error injection capability for testing full quota / blocked storage. */
class LocalStorageShim {
  private store = new Map<string, string>()
  public shouldThrowOnSet = false
  public throwOnlyOnKeys = new Set<string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }
  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet || this.throwOnlyOnKeys.has(key)) {
      throw new Error('QuotaExceededError: storage is full')
    }
    this.store.set(key, value)
  }
  removeItem(key: string): void {
    this.store.delete(key)
  }
  clear(): void {
    this.store.clear()
    this.shouldThrowOnSet = false
    this.throwOnlyOnKeys.clear()
  }
}

let mem = new LocalStorageShim()

beforeEach(() => {
  mem = new LocalStorageShim()
  Object.defineProperty(globalThis, 'localStorage', {
    value: mem,
    configurable: true,
    writable: true,
  })
})

const DECODER_STORAGE_KEY = 'switchkarle.decoder.v1'

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
    expect(save(list)).toBe(true)
    expect(load()).toEqual(list)
  })
})

describe('save', () => {
  it('returns true on successful write', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    expect(save(list)).toBe(true)
    expect(load()).toEqual(list)
  })

  it('returns false and does not throw when setItem throws', () => {
    mem.shouldThrowOnSet = true
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    expect(() => save(list)).not.toThrow()
    expect(save(list)).toBe(false)
  })

  it('does not create a key for an empty board that was never saved, and reports success', () => {
    // The tracker's boot effect saves right after loading, so every home-page
    // visitor who has added nothing would otherwise get a key written to a
    // disk their employer owns. load() already returns [] for a missing key,
    // so an absent key represents an empty board exactly as well as a stored
    // [] would — and true is the honest answer, not false: nothing was lost.
    expect(save([])).toBe(true)
    expect(mem.getItem(STORAGE_KEY)).toBeNull()
  })

  it('still writes [] once the key already holds a board', () => {
    // Deleting the last card off a stored board is a real edit, not a boot
    // echo, and must persist.
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    save(list)
    expect(mem.getItem(STORAGE_KEY)).not.toBeNull()
    expect(save([])).toBe(true)
    expect(mem.getItem(STORAGE_KEY)).toBe(JSON.stringify([]))
    expect(load()).toEqual([])
  })

  it('a non-empty save is unaffected by the empty-board skip', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    expect(save(list)).toBe(true)
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
    expect(app.appliedOn).toBeUndefined()
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
      appliedOn: '2026-07-20',
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
      appliedOn: '2026-07-20',
      notes: 'Panel round next week',
    })
  })
})

describe('updateApplication', () => {
  it('updates matching fields and bumps updatedAt', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    const orig = list[0]
    const updated = updateApplication(list, orig.id, { role: 'Staff SDE', stage: 'interviewing' })
    expect(updated[0]).toMatchObject({ id: orig.id, company: 'Acme', role: 'Staff SDE', stage: 'interviewing' })
    expect(updated[0].updatedAt >= orig.updatedAt).toBe(true)
  })

  it('leaves other applications untouched', () => {
    let list = addApplication([], { company: 'A', role: 'Dev' })
    list = addApplication(list, { company: 'B', role: 'PM' })
    const updated = updateApplication(list, list[0].id, { company: 'A Prime' })
    expect(updated[1]).toEqual(list[1])
  })

  it('is a no-op for an unknown id', () => {
    const list = addApplication([], { company: 'A', role: 'Dev' })
    const updated = updateApplication(list, 'does-not-exist', { company: 'A Prime' })
    expect(updated).toEqual(list)
  })
})

describe('removeApplication', () => {
  it('removes matching application by id', () => {
    let list = addApplication([], { company: 'A', role: 'Dev' })
    list = addApplication(list, { company: 'B', role: 'PM' })
    const idToRemove = list[0].id
    const updated = removeApplication(list, idToRemove)
    expect(updated).toHaveLength(1)
    expect(updated[0].company).toBe('B')
  })

  it('is a no-op for an unknown id', () => {
    const list = addApplication([], { company: 'A', role: 'Dev' })
    expect(removeApplication(list, 'does-not-exist')).toEqual(list)
  })
})

describe('moveStage', () => {
  it('moves an application one stage forward', () => {
    const list = addApplication([], { company: 'A', role: 'Dev', stage: 'researching' })
    const moved = moveStage(list, list[0].id, 1)
    expect(moved[0].stage).toBe('applied')
  })

  it('moves an application one stage back', () => {
    const list = addApplication([], { company: 'A', role: 'Dev', stage: 'applied' })
    const moved = moveStage(list, list[0].id, -1)
    expect(moved[0].stage).toBe('researching')
  })

  it('clamps at the boundaries', () => {
    const list = addApplication([], { company: 'A', role: 'Dev', stage: 'researching' })
    expect(moveStage(list, list[0].id, -1)[0].stage).toBe('researching')

    const decided = addApplication([], { company: 'B', role: 'PM', stage: 'decided' })
    expect(moveStage(decided, decided[0].id, 1)[0].stage).toBe('decided')
  })
})

describe('addInsight / removeInsight', () => {
  it('adds an insight and generates id + timestamp', () => {
    const list = addApplication([], { company: 'Acme', role: 'SDE II' })
    const updated = addInsight(list, list[0].id, {
      templateId: 'counter-offer',
      title: 'Counter pitch',
      content: 'Ask for 15% more',
    })
    expect(updated[0].insights).toHaveLength(1)
    expect(updated[0].insights![0]).toMatchObject({
      templateId: 'counter-offer',
      title: 'Counter pitch',
      content: 'Ask for 15% more',
    })
    expect(updated[0].insights![0].id).toBeTruthy()
    expect(updated[0].insights![0].savedAt).toBeTruthy()
  })

  it('removes matching insight by id', () => {
    let list = addApplication([], { company: 'Acme', role: 'SDE II' })
    list = addInsight(list, list[0].id, { templateId: 'a', title: 'A', content: '1' })
    list = addInsight(list, list[0].id, { templateId: 'b', title: 'B', content: '2' })
    const first = list[0].insights![0]
    const second = list[0].insights![1]
    const updated = removeInsight(list, list[0].id, first.id)
    expect(updated[0].insights).toHaveLength(1)
    expect(updated[0].insights![0].id).toBe(second.id)
  })
})

describe('mergeApplications (pure list transform)', () => {
  const appA: Application = {
    id: 'app-a',
    company: 'Alpha Corp',
    role: 'Staff Engineer',
    stage: 'applied',
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  }
  const appB: Application = {
    id: 'app-b',
    company: 'Beta Inc',
    role: 'Lead PM',
    stage: 'interviewing',
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  }
  const appC: Application = {
    id: 'app-c',
    company: 'Gamma Labs',
    role: 'VP Product',
    stage: 'offer',
    createdAt: '2026-08-03T10:00:00.000Z',
    updatedAt: '2026-08-03T10:00:00.000Z',
  }

  it('an incoming item with a newer updatedAt replaces the current one', () => {
    const newerAppA: Application = {
      ...appA,
      stage: 'offer',
      ctcDiscussedAnnual: 4_500_000,
      updatedAt: '2026-08-10T10:00:00.000Z',
    }
    const current = [appA, appB]
    const incoming = [newerAppA]
    const merged = mergeApplications(current, incoming)
    expect(merged).toHaveLength(2)
    expect(merged[0]).toEqual(newerAppA)
    expect(merged[1]).toEqual(appB)
  })

  it('an incoming item with an older or equal updatedAt does not replace current', () => {
    const olderAppA: Application = {
      ...appA,
      stage: 'researching',
      updatedAt: '2026-07-01T10:00:00.000Z',
    }
    const equalAppB: Application = {
      ...appB,
      stage: 'decided',
      updatedAt: appB.updatedAt,
    }
    const current = [appA, appB]
    const incoming = [olderAppA, equalAppB]
    const merged = mergeApplications(current, incoming)
    expect(merged).toHaveLength(2)
    expect(merged[0]).toEqual(appA)
    expect(merged[1]).toEqual(appB)
  })

  it('an id only in the incoming list is appended', () => {
    const current = [appA, appB]
    const incoming = [appC]
    const merged = mergeApplications(current, incoming)
    expect(merged).toHaveLength(3)
    expect(merged[0]).toEqual(appA)
    expect(merged[1]).toEqual(appB)
    expect(merged[2]).toEqual(appC)
  })

  it('an id only in the current list survives', () => {
    const current = [appA, appB, appC]
    const incoming = [appB]
    const merged = mergeApplications(current, incoming)
    expect(merged).toHaveLength(3)
    expect(merged[0]).toEqual(appA)
    expect(merged[1]).toEqual(appB)
    expect(merged[2]).toEqual(appC)
  })

  it('the current list order is preserved', () => {
    const current = [appB, appA]
    const newerAppA = { ...appA, updatedAt: '2026-08-15T00:00:00.000Z', notes: 'New notes' }
    const incoming = [newerAppA, appC]
    const merged = mergeApplications(current, incoming)
    expect(merged.map((a) => a.id)).toEqual(['app-b', 'app-a', 'app-c'])
    expect(merged[1].notes).toBe('New notes')
  })

  it('merging an empty incoming list is an identity', () => {
    const current = [appA, appB]
    const merged = mergeApplications(current, [])
    expect(merged).toEqual(current)
  })

  it('merging a list into itself is an identity', () => {
    const current = [appA, appB, appC]
    const merged = mergeApplications(current, current)
    expect(merged).toEqual(current)
  })
})

describe('exportAll / parseBackup', () => {
  it('round-trips both the decoder and tracker stores', () => {
    let tracker = addApplication([], { company: 'Acme', role: 'SDE II' })
    tracker = addApplication(tracker, { company: 'Beta', role: 'PM' })
    save(tracker)
    const decoderState = { ctcAnnual: 2_400_000, state: 'KA' }
    localStorage.setItem(DECODER_STORAGE_KEY, JSON.stringify(decoderState))

    const json = exportAll()
    const parsed = parseBackup(json)
    expect(parsed.version).toBe(1)
    expect(parsed.tracker).toEqual(tracker)
    expect(parsed.decoder).toEqual(decoderState)
  })

  it('handles a missing decoder store gracefully on export', () => {
    save(addApplication([], { company: 'Acme', role: 'SDE II' }))
    const parsed = parseBackup(exportAll())
    expect(parsed.decoder).toBeNull()
  })

  it('parseBackup throws on malformed JSON', () => {
    expect(() => parseBackup('{not valid json')).toThrow('Invalid backup file: not valid JSON.')
  })

  it('parseBackup throws on a valid-JSON non-bundle', () => {
    expect(() => parseBackup(JSON.stringify({ hello: 'world' }))).toThrow('Invalid backup file: unexpected structure.')
    expect(() => parseBackup(JSON.stringify({ version: 2, tracker: [] }))).toThrow()
    expect(() => parseBackup(JSON.stringify({ version: 1, tracker: 'not-an-array' }))).toThrow()
    expect(() => parseBackup(JSON.stringify({ version: 1, tracker: [{ company: 'Only Company' }] }))).toThrow()
  })
})

describe('restoreAll / mergeBackup / undo', () => {
  const currentApp: Application = {
    id: 'orig-1',
    company: 'Current Corp',
    role: 'SDE III',
    stage: 'interviewing',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }
  const backupApp1: Application = {
    id: 'orig-1',
    company: 'Current Corp',
    role: 'Staff SDE',
    stage: 'offer',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-05T00:00:00.000Z',
  }
  const backupApp2: Application = {
    id: 'backup-2',
    company: 'New Venture',
    role: 'Founder',
    stage: 'applied',
    createdAt: '2026-08-04T00:00:00.000Z',
    updatedAt: '2026-08-04T00:00:00.000Z',
  }

  it('restoreAll writes a snapshot, and undoLastRestore returns the pre-restore board exactly', () => {
    save([currentApp])
    expect(load()).toEqual([currentApp])

    const bundle: BackupBundle = {
      version: 1,
      decoder: { ctcAnnual: 3_600_000 },
      tracker: [backupApp1, backupApp2],
    }

    const success = restoreAll(bundle)
    expect(success).toBe(true)
    expect(load()).toEqual([backupApp1, backupApp2])
    expect(hasUndo()).toBe(true)

    // Undo restore: returns pre-restore board exactly and clears snapshot
    const undone = undoLastRestore()
    expect(undone).toEqual([currentApp])
    expect(load()).toEqual([currentApp])
    expect(hasUndo()).toBe(false)
    expect(undoLastRestore()).toBeNull()
  })

  it('mergeBackup merges applications and allows undo', () => {
    save([currentApp])
    const bundle: BackupBundle = {
      version: 1,
      decoder: { ctcAnnual: 3_600_000 },
      tracker: [backupApp1, backupApp2],
    }

    const success = mergeBackup(bundle)
    expect(success).toBe(true)
    const merged = load()
    expect(merged).toHaveLength(2)
    expect(merged[0]).toEqual(backupApp1) // updated because newer updatedAt
    expect(merged[1]).toEqual(backupApp2) // added

    const undone = undoLastRestore()
    expect(undone).toEqual([currentApp])
    expect(load()).toEqual([currentApp])
  })

  it('undoLastRestore returns null when there is no snapshot and clears snapshot after undo', () => {
    expect(hasUndo()).toBe(false)
    expect(undoLastRestore()).toBeNull()

    save([currentApp])
    snapshotForUndo()
    expect(hasUndo()).toBe(true)
    expect(undoLastRestore()).toEqual([currentApp])
    expect(hasUndo()).toBe(false)
    expect(undoLastRestore()).toBeNull()
  })

  it('a restore still succeeds when the snapshot write fails', () => {
    save([currentApp])
    // Make snapshot write throw
    mem.throwOnlyOnKeys.add(UNDO_STORAGE_KEY)

    const bundle: BackupBundle = {
      version: 1,
      decoder: null,
      tracker: [backupApp2],
    }

    const ok = restoreAll(bundle)
    expect(ok).toBe(true)
    expect(load()).toEqual([backupApp2])
  })

  it('mergeBackup leaves the saved Decoder offer alone', () => {
    // Merge is offered as "keeps everything on your board". Replacing the offer
    // the user built in the Decoder would make that sentence false.
    save([currentApp])
    mem.setItem(DECODER_STORAGE_KEY, JSON.stringify({ ctcAnnual: 1_800_000 }))

    const bundle: BackupBundle = {
      version: 1,
      decoder: { ctcAnnual: 4_200_000 },
      tracker: [backupApp2],
    }

    expect(mergeBackup(bundle)).toBe(true)
    expect(JSON.parse(mem.getItem(DECODER_STORAGE_KEY)!)).toEqual({ ctcAnnual: 1_800_000 })
  })

  it('restoreAll does replace the saved Decoder offer', () => {
    save([currentApp])
    mem.setItem(DECODER_STORAGE_KEY, JSON.stringify({ ctcAnnual: 1_800_000 }))

    const bundle: BackupBundle = {
      version: 1,
      decoder: { ctcAnnual: 4_200_000 },
      tracker: [backupApp2],
    }

    expect(restoreAll(bundle)).toBe(true)
    expect(JSON.parse(mem.getItem(DECODER_STORAGE_KEY)!)).toEqual({ ctcAnnual: 4_200_000 })
  })

  it('a failed undo keeps the snapshot so the user can try again', () => {
    save([currentApp])
    const bundle: BackupBundle = { version: 1, decoder: null, tracker: [backupApp2] }
    restoreAll(bundle)
    expect(hasUndo()).toBe(true)

    // The board write fails, the snapshot read does not.
    mem.throwOnlyOnKeys.add(STORAGE_KEY)
    expect(undoLastRestore()).toBeNull()
    expect(hasUndo()).toBe(true)

    mem.throwOnlyOnKeys.delete(STORAGE_KEY)
    expect(undoLastRestore()).toEqual([currentApp])
  })
})

describe('a stage the board cannot render never reaches the board', () => {
  // Regression: `typeof stage === 'string'` let an unknown stage through, the
  // tracker grouped into a fixed five-key object, and `g[stage].push` threw on
  // an undefined bucket. The entry was already persisted, so every refresh
  // crashed again — a blank screen the user could not get out of.
  const poisoned = {
    id: 'p1',
    company: 'Acme',
    role: 'Dev',
    stage: 'rejected',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }
  const good: Application = {
    id: 'g1',
    company: 'Finlytix',
    role: 'SDE',
    stage: 'applied',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }

  it('parseBackup rejects a bundle carrying an unknown stage', () => {
    const json = JSON.stringify({ version: 1, decoder: null, tracker: [poisoned] })
    expect(() => parseBackup(json)).toThrow()
  })

  it('load() drops an already-persisted bad entry instead of returning it', () => {
    mem.setItem(STORAGE_KEY, JSON.stringify([good, poisoned]))
    expect(load()).toEqual([good])
  })

  it('every stage the board renders is accepted', () => {
    for (const stage of STAGE_ORDER) {
      const json = JSON.stringify({ version: 1, decoder: null, tracker: [{ ...good, stage }] })
      expect(() => parseBackup(json)).not.toThrow()
    }
  })
})
