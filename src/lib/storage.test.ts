import { afterEach, describe, expect, it } from 'vitest'
import { migrateJson, readJson, resetBootEchoForTests, writeJson } from './storage'
import type { StorageKey } from './storage'

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
  // Every test starts as a fresh page load, not a continuation of the last one.
  resetBootEchoForTests()
}

afterEach(() => mem.clear())

describe('storage', () => {
  it('round-trips JSON under a versioned key', () => {
    install()
    writeJson('switchkarle.demo.v1', { n: 3 })
    expect(readJson('switchkarle.demo.v1', { n: 0 })).toEqual({ n: 3 })
  })

  it('falls back on missing or corrupt data', () => {
    install()
    expect(readJson('switchkarle.demo.v1', { n: 7 })).toEqual({ n: 7 })
    mem.setItem('switchkarle.demo.v1', '{not json')
    expect(readJson('switchkarle.demo.v1', { n: 7 })).toEqual({ n: 7 })
  })

  it('migrates v1 → v2 once and does not clobber v2', () => {
    install()
    writeJson('switchkarle.demo.v1', { n: 1 })
    const first = migrateJson('switchkarle.demo.v1', 'switchkarle.demo.v2', (old) => {
      const n = typeof old === 'object' && old && 'n' in old ? Number((old as { n: number }).n) : 0
      return { n: n + 10 }
    }, { n: 0 })
    expect(first).toEqual({ n: 11 })
    expect(mem.getItem('switchkarle.demo.v1')).toBeNull()

    writeJson('switchkarle.demo.v1', { n: 99 })
    const second = migrateJson('switchkarle.demo.v1', 'switchkarle.demo.v2', () => ({ n: 0 }), { n: 0 })
    expect(second).toEqual({ n: 11 })
  })

  it('keeps the old key if writing the new key fails', () => {
    install()
    writeJson('switchkarle.demo.v1', { n: 1 })
    const failing = {
      getItem: (k: string) => mem.getItem(k),
      setItem: (k: string, v: string) => {
        if (k.endsWith('.v2')) throw new Error('quota')
        mem.setItem(k, v)
      },
      removeItem: (k: string) => mem.removeItem(k),
    }
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: failing })
    const got = migrateJson(
      'switchkarle.demo.v1',
      'switchkarle.demo.v2',
      () => ({ n: 2 }),
      { n: 0 },
    )
    expect(got).toEqual({ n: 2 })
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: mem })
    expect(mem.getItem('switchkarle.demo.v1')).not.toBeNull()
    expect(mem.getItem('switchkarle.demo.v2')).toBeNull()
  })
})

describe('boot echo skip', () => {
  it('skips the write that echoes a boot read which found nothing', () => {
    install()
    const key: StorageKey = 'switchkarle.boot-echo.v1'
    expect(readJson(key, { n: 0 })).toEqual({ n: 0 }) // boot read: arms the skip
    expect(writeJson(key, { n: 0 })).toBe(false) // the boot echo write: nothing is stored
    expect(mem.getItem(key)).toBeNull()
  })

  it('does not skip the write after the boot echo', () => {
    install()
    const key: StorageKey = 'switchkarle.boot-echo-then-edit.v1'
    readJson(key, { n: 0 })
    writeJson(key, { n: 0 }) // boot echo, skipped, mark consumed
    expect(writeJson(key, { n: 5 })).toBe(true) // the user actually typed something
    expect(readJson(key, { n: 0 })).toEqual({ n: 5 })
  })

  it('a later read finding nothing again does not re-arm the skip', () => {
    // If a second empty read could re-arm the mark, the write that follows it
    // — a real user edit, not an echo — would be swallowed the same way the
    // boot echo was.
    install()
    const key: StorageKey = 'switchkarle.reread.v1'
    readJson(key, { n: 0 }) // boot read: arms the skip
    writeJson(key, { n: 0 }) // boot echo, skipped, mark consumed
    readJson(key, { n: 0 }) // some other consumer reads again — still nothing stored
    expect(writeJson(key, { n: 7 })).toBe(true)
    expect(readJson(key, { n: 0 })).toEqual({ n: 7 })
  })

  it('a key that already holds a value is never treated as a boot echo', () => {
    install()
    const key: StorageKey = 'switchkarle.existing.v1'
    writeJson(key, { n: 1 }) // as if written in an earlier session
    expect(readJson(key, { n: 0 })).toEqual({ n: 1 }) // boot read finds it
    expect(writeJson(key, { n: 2 })).toBe(true) // never skipped
    expect(readJson(key, { n: 0 })).toEqual({ n: 2 })
  })

  it('a corrupted value already occupies the key, so the echo overwrites it instead of being skipped', () => {
    install()
    const key: StorageKey = 'switchkarle.corrupt.v1'
    mem.setItem(key, '{not json')
    expect(readJson(key, { n: 0 })).toEqual({ n: 0 }) // parse failure falls back to defaults
    // The boot read still counts as "found nothing" for what the tool does
    // next, but the key is not absent — something (garbage) was already
    // there — so this is not the fresh-visitor case the skip exists for.
    expect(writeJson(key, { n: 0 })).toBe(true)
    expect(mem.getItem(key)).toBe(JSON.stringify({ n: 0 }))
  })

  it('still migrates when something already probed the destination key and found it empty', () => {
    install()
    writeJson('switchkarle.migrate-probe.v1', { n: 4 })
    // Some other code checks the destination key before migration runs,
    // arming a boot-echo skip on it — migrateJson must not honour that mark.
    readJson('switchkarle.migrate-probe.v2', { n: 0 })
    const migrated = migrateJson(
      'switchkarle.migrate-probe.v1',
      'switchkarle.migrate-probe.v2',
      (old) => ({ n: (old as { n: number }).n + 1 }),
      { n: 0 },
    )
    expect(migrated).toEqual({ n: 5 })
    expect(mem.getItem('switchkarle.migrate-probe.v2')).not.toBeNull()
  })
})
