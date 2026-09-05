import { afterEach, describe, expect, it } from 'vitest'
import { eraseAll, savedCount, savedKeys } from './erase'

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

function install(store: unknown = mem) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: store })
}

afterEach(() => {
  mem.clear()
  install()
})

describe('savedKeys', () => {
  it('finds every switchkarle key and nothing else', () => {
    install()
    mem.setItem('switchkarle.decoder.v1', '{}')
    mem.setItem('switchkarle.tracker.v1', '[]')
    mem.setItem('some-other-project.state', 'keep me')
    expect(savedKeys().sort()).toEqual(['switchkarle.decoder.v1', 'switchkarle.tracker.v1'])
    expect(savedCount()).toBe(2)
  })

  it('reads as none when storage is blocked', () => {
    install({
      get length(): number {
        throw new Error('blocked')
      },
    })
    expect(savedKeys()).toEqual([])
    expect(savedCount()).toBe(0)
  })
})

describe('eraseAll', () => {
  it('removes every saved key', () => {
    install()
    mem.setItem('switchkarle.decoder.v1', '{"ctcAnnual":3000000}')
    mem.setItem('switchkarle.resignation.v1', '{"text":"I resign"}')
    mem.setItem('switchkarle.lang.v1', 'hi')

    const result = eraseAll()

    expect(result.failed).toEqual([])
    expect(result.removed).toHaveLength(3)
    expect(savedKeys()).toEqual([])
  })

  it('leaves keys belonging to other sites on the same origin alone', () => {
    install()
    mem.setItem('switchkarle.tracker.v1', '[]')
    mem.setItem('other-app.session', 'not ours')

    eraseAll()

    expect(mem.getItem('other-app.session')).toBe('not ours')
  })

  it('erases a tool key it has never heard of', () => {
    // The guard against a hard-coded list drifting behind a newly added tool.
    install()
    mem.setItem('switchkarle.some-tool-shipped-later.v9', '{"salary":1}')

    expect(eraseAll().removed).toEqual(['switchkarle.some-tool-shipped-later.v9'])
    expect(mem.getItem('switchkarle.some-tool-shipped-later.v9')).toBeNull()
  })

  it('reports a key as failed when the browser keeps it despite removeItem', () => {
    install()
    mem.setItem('switchkarle.decoder.v1', '{}')
    mem.setItem('switchkarle.tracker.v1', '[]')
    install({
      get length() {
        return mem.length
      },
      key: (i: number) => mem.key(i),
      getItem: (k: string) => mem.getItem(k),
      // A browser that accepts the call and keeps the value: the exact case the
      // read-back exists for.
      removeItem: (k: string) => {
        if (k === 'switchkarle.decoder.v1') return
        mem.removeItem(k)
      },
    })

    const result = eraseAll()

    expect(result.failed).toEqual(['switchkarle.decoder.v1'])
    expect(result.removed).toEqual(['switchkarle.tracker.v1'])
  })

  it('reports a key as failed when removeItem throws', () => {
    install()
    mem.setItem('switchkarle.decoder.v1', '{}')
    install({
      get length() {
        return mem.length
      },
      key: (i: number) => mem.key(i),
      getItem: (k: string) => mem.getItem(k),
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    expect(eraseAll()).toEqual({ removed: [], failed: ['switchkarle.decoder.v1'] })
  })

  it('is a no-op on empty storage', () => {
    install()
    expect(eraseAll()).toEqual({ removed: [], failed: [] })
  })
})
