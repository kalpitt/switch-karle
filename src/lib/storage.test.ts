import { afterEach, describe, expect, it } from 'vitest'
import { migrateJson, readJson, writeJson } from './storage'

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
