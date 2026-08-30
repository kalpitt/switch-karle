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

  it('preserves saved offer in loadOffer', () => {
    install()
    saveOffer({ ...DEFAULT_OFFER, ctcAnnual: 1_800_000, noticePeriodDays: 90, state: 'MH' })
    const loaded = loadOffer()
    expect(loaded.ctcAnnual).toBe(1_800_000)
    expect(loaded.noticePeriodDays).toBe(90)
    expect(loaded.state).toBe('MH')
  })

  it('loadOffer does not consume a handoff and does not change its result when one is present', () => {
    install()
    saveOffer({ ...DEFAULT_OFFER, ctcAnnual: 1_800_000 })
    writeHandoff({ to: 'decoder', at: Date.now(), ctcAnnual: 4_200_000 })
    expect(loadOffer().ctcAnnual).toBe(1_800_000)
    expect(mem.getItem(HANDOFF_STORAGE_KEY)).not.toBeNull()
  })

  it('consumeHandoff("decoder") returns a payload addressed to decoder and clears the key', () => {
    install()
    const now = Date.now()
    writeHandoff({ to: 'decoder', at: now, ctcAnnual: 4_200_000, noticePeriodDays: 60 })
    const consumed = consumeHandoff('decoder')
    expect(consumed).toEqual({ to: 'decoder', at: now, ctcAnnual: 4_200_000, noticePeriodDays: 60 })
    expect(mem.getItem(HANDOFF_STORAGE_KEY)).toBeNull()
    expect(consumeHandoff('decoder')).toBeNull()
  })

  it('consumeHandoff("real-hike") on a payload addressed to decoder returns null and leaves the key in place', () => {
    install()
    const now = Date.now()
    writeHandoff({ to: 'decoder', at: now, ctcAnnual: 4_200_000 })
    expect(consumeHandoff('real-hike')).toBeNull()
    expect(mem.getItem(HANDOFF_STORAGE_KEY)).not.toBeNull()
  })

  it('a payload older than the TTL returns null and the key is cleared', () => {
    install()
    const fiveMinOneSecAgo = Date.now() - (5 * 60 * 1000 + 1000)
    writeHandoff({ to: 'decoder', at: fiveMinOneSecAgo, ctcAnnual: 4_200_000 })
    expect(consumeHandoff('decoder')).toBeNull()
    expect(mem.getItem(HANDOFF_STORAGE_KEY)).toBeNull()
  })
})
