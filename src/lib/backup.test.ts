import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { countOverlap, exportEverything, parseEverything, restoreEverything } from './backup'

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

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: mem })
})
afterEach(() => mem.clear())

describe('full backup', () => {
  it('exports every switchkarle key, raw, and nothing else', () => {
    mem.setItem('switchkarle.plan.v1', '{"resign":"2026-11-01"}')
    mem.setItem('switchkarle.lang.v1', 'hi')
    mem.setItem('someone-else', 'x')
    const bundle = JSON.parse(exportEverything(new Date('2026-10-31T00:00:00Z')))
    expect(bundle.app).toBe('switch-karle')
    expect(bundle.version).toBe(2)
    expect(bundle.keys).toEqual({
      'switchkarle.plan.v1': '{"resign":"2026-11-01"}',
      'switchkarle.lang.v1': 'hi',
    })
  })

  it('round-trips into an empty browser', () => {
    mem.setItem('switchkarle.plan.v1', '{"a":1}')
    mem.setItem('switchkarle.lang.v1', 'hi')
    const file = exportEverything()
    mem.clear()
    const incoming = parseEverything(file)
    expect(countOverlap(incoming)).toBe(0)
    const result = restoreEverything(incoming, true)
    expect(result.failed).toEqual([])
    expect(result.written.sort()).toEqual(['switchkarle.lang.v1', 'switchkarle.plan.v1'])
    expect(mem.getItem('switchkarle.plan.v1')).toBe('{"a":1}')
  })

  it('keeps what is here when asked, replaces it otherwise, never touches other keys', () => {
    mem.setItem('switchkarle.plan.v1', '"mine"')
    mem.setItem('switchkarle.gratuity.v1', '"untouched"')
    const incoming = { 'switchkarle.plan.v1': '"file"', 'switchkarle.decoder.v1': '"new"' }
    expect(countOverlap(incoming)).toBe(1)

    expect(restoreEverything(incoming, true).written).toEqual(['switchkarle.decoder.v1'])
    expect(mem.getItem('switchkarle.plan.v1')).toBe('"mine"')

    restoreEverything(incoming, false)
    expect(mem.getItem('switchkarle.plan.v1')).toBe('"file"')
    expect(mem.getItem('switchkarle.gratuity.v1')).toBe('"untouched"')
  })

  it('drops keys outside the switchkarle prefix and non-string values', () => {
    const file = JSON.stringify({
      app: 'switch-karle',
      version: 2,
      keys: { 'switchkarle.plan.v1': '{}', 'other.site': 'x', 'switchkarle.bad.v1': 5 },
    })
    expect(parseEverything(file)).toEqual({ 'switchkarle.plan.v1': '{}' })
  })

  it('still reads the tracker’s older backup file', () => {
    const v1 = JSON.stringify({ version: 1, decoder: { ctc: 1 }, tracker: [] })
    expect(parseEverything(v1)).toEqual({
      'switchkarle.tracker.v1': '[]',
      'switchkarle.decoder.v1': '{"ctc":1}',
    })
  })

  it('rejects anything that is not a backup', () => {
    expect(() => parseEverything('not json')).toThrow()
    expect(() => parseEverything('{"hello":1}')).toThrow()
    expect(() => parseEverything('[]')).toThrow()
  })

  it('reports a write that did not land', () => {
    const blocked = new MemoryStorage()
    blocked.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: blocked })
    const result = restoreEverything({ 'switchkarle.plan.v1': '{}' }, false)
    expect(result).toEqual({ written: [], failed: ['switchkarle.plan.v1'] })
  })
})
