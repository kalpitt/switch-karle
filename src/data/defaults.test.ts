import { afterEach, describe, expect, it } from 'vitest'
import {
  DECODER_STORAGE_KEY,
  DEFAULT_OFFER,
  HANDOFF_STORAGE_KEY,
  consumeHandoff,
  loadOffer,
  saveOffer,
  writeHandoff,
} from './defaults'
import { releaseBootEcho, resetBootEchoForTests } from '../lib/storage'

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
  // Every test starts as a fresh page load, not a continuation of the last one
  // — otherwise a boot-echo mark armed (or consumed) by one test on
  // DECODER_STORAGE_KEY would leak into the next test that reuses it.
  resetBootEchoForTests()
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

  it('a boot echo of DEFAULT_OFFER creates no key', () => {
    install()
    // loadOffer() is the decoder's boot read: storage is empty, so it falls
    // back to DEFAULT_OFFER. The save effect fires right after with that same
    // object — an echo, not anything the user chose.
    const offer = loadOffer()
    expect(offer).toEqual(DEFAULT_OFFER)
    saveOffer(offer)
    expect(mem.getItem('switchkarle.decoder.v1')).toBeNull()
  })

  it('an offer carrying only esop, with every base field still at its default, is persisted', () => {
    // The regression a field-wise comparison against DEFAULT_OFFER would miss:
    // every one of the nine base fields matches DEFAULT_OFFER exactly, so
    // comparing field by field would call this untouched and drop the ESOP
    // the user actually entered. Mirrors the real boot sequence: the first
    // save after mount is the defaults echo (skipped), and only then does the
    // user's actual edit arrive as a second, distinct save.
    install()
    loadOffer() // boot read, arms the skip
    saveOffer(DEFAULT_OFFER) // the boot echo — skipped
    const offer = { ...DEFAULT_OFFER, esop: { annualValue: 500_000, cliffMonths: 12, liquid: false } }
    saveOffer(offer)
    expect(mem.getItem('switchkarle.decoder.v1')).not.toBeNull()
    expect(loadOffer()).toEqual(offer)
  })

  it('an offer carrying only bond, with every base field still at its default, is persisted', () => {
    install()
    loadOffer() // boot read, arms the skip
    saveOffer(DEFAULT_OFFER) // the boot echo — skipped
    const offer = { ...DEFAULT_OFFER, bond: { amount: 200_000, months: 24 } }
    saveOffer(offer)
    expect(mem.getItem('switchkarle.decoder.v1')).not.toBeNull()
    expect(loadOffer()).toEqual(offer)
  })

  it('spends the skip on the first save after a boot read, whatever that save carries', () => {
    // The constraint this mechanism trades for working across every tool,
    // pinned here rather than left to be discovered. Storage cannot tell an
    // echo of a computed default from a real edit: half the tools boot from a
    // null fallback and build their default themselves, so there is no value
    // to compare against. The skip is therefore spent on the FIRST save after
    // the boot read, whatever it carries. Every tool in this app echoes its
    // draft on mount, which is what makes that safe — a tool that saved only
    // on an explicit user action would lose that first action. A new tool must
    // echo on mount, or it must not rely on this.
    install()
    loadOffer()
    saveOffer({ ...DEFAULT_OFFER, ctcAnnual: 9_900_000 })
    expect(mem.getItem('switchkarle.decoder.v1')).toBeNull()
    saveOffer({ ...DEFAULT_OFFER, ctcAnnual: 9_900_000 })
    expect(mem.getItem('switchkarle.decoder.v1')).not.toBeNull()
  })

  it('a decoder seeded by a handoff still saves the user\u2019s first edit', () => {
    // The sequence that was found broken: a tracker card hands a CTC to a
    // decoder that has never been used, so nothing is stored. The decoder holds
    // its mount write back on purpose \u2014 a handed-in CTC is a suggestion, not a
    // decision \u2014 so no echo ever spends the boot-echo skip. Without
    // releaseBootEcho the still-armed skip swallowed the user's first real edit,
    // and if they navigated away after that single edit it was gone with no
    // error shown.
    install()
    writeHandoff({ to: 'decoder', at: Date.now(), ctcAnnual: 3_000_000 })
    const saved = loadOffer() // boot read: nothing stored, arms the skip
    const handoff = consumeHandoff('decoder')
    expect(handoff?.ctcAnnual).toBe(3_000_000)
    const seededOffer = { ...saved, ctcAnnual: handoff!.ctcAnnual! }
    releaseBootEcho(DECODER_STORAGE_KEY) // the tool declaring it will not echo

    // Seeing a suggestion must still not persist anything on its own.
    expect(mem.getItem(DECODER_STORAGE_KEY)).toBeNull()

    // The user's first edit, and the only one they make before leaving.
    saveOffer({ ...seededOffer, basicPercent: 45 })
    expect(mem.getItem(DECODER_STORAGE_KEY)).not.toBeNull()
    expect(loadOffer().basicPercent).toBe(45)
    expect(loadOffer().ctcAnnual).toBe(3_000_000)
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
