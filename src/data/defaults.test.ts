import { afterEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_OFFER,
  HANDOFF_STORAGE_KEY,
  consumeHandoff,
  loadOffer,
  saveOffer,
  writeHandoff,
} from './defaults'

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

describe('defaults and handoff', () => {
  it('returns DEFAULT_OFFER when storage is empty', () => {
    install()
    expect(loadOffer()).toEqual(DEFAULT_OFFER)
  })

  it('consumes handoff and overrides ctcAnnual in loadOffer', () => {
    install()
    writeHandoff({ ctcAnnual: 3_800_000 })
    expect(loadOffer().ctcAnnual).toBe(3_800_000)
    // Read-once: handoff key is cleared
    expect(mem.getItem(HANDOFF_STORAGE_KEY)).toBeNull()
    expect(consumeHandoff()).toBeNull()
  })

  it('preserves saved offer and overrides only ctcAnnual with handoff', () => {
    install()
    saveOffer({ ...DEFAULT_OFFER, noticePeriodDays: 90, state: 'MH' })
    writeHandoff({ ctcAnnual: 4_200_000 })
    const loaded = loadOffer()
    expect(loaded.ctcAnnual).toBe(4_200_000)
    expect(loaded.noticePeriodDays).toBe(90)
    expect(loaded.state).toBe('MH')
  })
})
