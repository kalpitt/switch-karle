import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hi } from '../i18n/hi'
import { scanRedFlags } from './redFlags'
import { decodeOffer } from './salary'
import { DEFAULT_OFFER } from '../data/defaults'

/**
 * Decided 2026-11-07 (Kalpit): the offer red-flag scanner named companies
 * ("Cognizant cut to 30 days in 2023; Flipkart, Razorpay and Swiggy…") with no
 * primary source behind any of it. The claims are gone in both languages; the
 * general advice stays.
 */
const NAMED = /Cognizant|Flipkart|Razorpay|Swiggy/

const engineDir = dirname(fileURLToPath(import.meta.url))

describe('the red-flag scanner makes no unsourced company claims', () => {
  it('names no company in the English source or the Hindi flag overrides', () => {
    expect(NAMED.test(readFileSync(join(engineDir, 'redFlags.ts'), 'utf8'))).toBe(false)
    const hits = Object.entries(hi).filter(([k, v]) => k.startsWith('flag.') && NAMED.test(v))
    expect(hits).toEqual([])
  })

  it('still gives the general notice-period advice', () => {
    const b = decodeOffer({ ...DEFAULT_OFFER, noticePeriodDays: 90 })
    const flag = scanRedFlags(b).find((f) => f.id === 'notice-period')
    expect(flag?.detail).toMatch(/No Indian law requires a 90-day notice/)
    expect(hi['flag.notice-period.detail']).toMatch(/कोई भारतीय कानून 90 दिन का notice ज़रूरी नहीं बनाता/)
  })
})
