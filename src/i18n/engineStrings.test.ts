import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { OFFER_SCAM_RULE_IDS } from '../engine/offerScam'
import { dictionaries } from './index'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function listIslands(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...listIslands(p))
    else if (entry === 'index.tsx') out.push(p)
  }
  return out
}

/**
 * Slice 2.1 guard: engines return ids; only i18n strings reach the glass.
 * If an island renders an engine string field raw, this fails — that is how
 * English leaked onto /hi/ pages before.
 */
describe('islands never render engine prose raw', () => {
  const islands = listIslands(join(ROOT, 'tools'))

  it('found the islands under test', () => {
    expect(islands.length).toBeGreaterThan(10)
  })

  it('no island renders .title / .detail / verificationHint / note detail raw', () => {
    const offenders = islands.filter((p) => {
      const src = readFileSync(p, 'utf8')
      return (
        /\{\s*f\.title\s*\}/.test(src) ||
        /\{\s*f\.detail\s*\}/.test(src) ||
        /\{\s*n\.detail\s*\}/.test(src) ||
        /\{\s*line\.label\s*\}/.test(src) ||
        /\.verificationHint\s*\}/.test(src)
      )
    })
    expect(offenders.map((p) => p.replace(ROOT + '/', ''))).toEqual([])
  })

  it('no island hardcodes days/months unit suffixes', () => {
    const offenders = islands.filter((p) => {
      const src = readFileSync(p, 'utf8')
      return /suffix=\{?"(days|months)"\}/.test(src)
    })
    expect(offenders.map((p) => p.replace(ROOT + '/', ''))).toEqual([])
  })
})

/**
 * Every engine-emitted id must have EN + HI strings for all three islands
 * wired to t() in slice 2.1.
 */
describe('engine ids have bilingual strings', () => {
  const FAKE_OFFER_IDS = [...OFFER_SCAM_RULE_IDS]
  const FNF_LINE_IDS = ['salary', 'notice', 'unpaid-leave', 'gratuity']
  const FNF_FLAG_IDS = ['negative-net', 'notice-recovery', 'gratuity-missing']
  const GRATUITY_NOTE_IDS = ['s42-rounding', 'act-may-not-apply', 'ineligible-service', 'cap-applied']

  const required: [string, string[]][] = [
    ['fake-offer.flag.<id>.title', FAKE_OFFER_IDS.flatMap((id) => [`fake-offer.flag.${id}.title`])],
    ['fake-offer.flag.<id>.detail', FAKE_OFFER_IDS.flatMap((id) => [`fake-offer.flag.${id}.detail`])],
    ['fake-offer.flag.<id>.hint', FAKE_OFFER_IDS.flatMap((id) => [`fake-offer.flag.${id}.hint`])],
    ['fnf-checker.line.<id>', FNF_LINE_IDS.map((id) => `fnf-checker.line.${id}`)],
    ['fnf-checker.flag.<id>', FNF_FLAG_IDS.map((id) => `fnf-checker.flag.${id}`)],
    ['gratuity.note.<id>', GRATUITY_NOTE_IDS.map((id) => `gratuity.note.${id}`)],
  ]

  for (const [label, keys] of required) {
    it(`${label} exists non-blank in EN and HI`, () => {
      const missing = keys.filter(
        (k) =>
          !(k in dictionaries.en) ||
          dictionaries.en[k].trim() === '' ||
          !(k in dictionaries.hi) ||
          dictionaries.hi[k].trim() === '',
      )
      expect(missing).toEqual([])
    })
  }
})
