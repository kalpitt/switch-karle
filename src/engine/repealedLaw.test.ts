import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { en } from '../i18n/en'
import { hi } from '../i18n/hi'
import { hiSuite } from '../i18n/hi-suite'

/**
 * The Code on Social Security, 2020 repealed the Payment of Gratuity Act, 1972
 * on 21 November 2025 (S.O. 5319(E); s.164(1) item 6). On 23 August 2026 the
 * gratuity engine was marked VERIFIED against the repealed Act, whose PDF link
 * had since gone dead, and six user-facing strings still named it as the law.
 * Checking a number against a document never asked whether the document was
 * still law. This test asks it, for the Act we know is gone.
 *
 * History may name it ("the ceiling notified in 2018 under the old Act");
 * nothing may cite it as current.
 */
const REPEALED = /Payment of Gratuity Act|\bPGA\b|\bGratuity Act\b/

const engineDir = dirname(fileURLToPath(import.meta.url))
const srcDir = join(engineDir, '..')

describe('no copy or VERIFIED marker cites a repealed Act', () => {
  it('no user-facing string names the Payment of Gratuity Act', () => {
    const offenders: string[] = []
    for (const [name, dict] of Object.entries({ en, hi, hiSuite })) {
      for (const [key, value] of Object.entries(dict)) {
        if (REPEALED.test(value)) offenders.push(`${name}:${key}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('the tool registry and the English red flags do not name it either', () => {
    for (const file of ['data/tools.ts', 'engine/redFlags.ts']) {
      const text = readFileSync(join(srcDir, file), 'utf8')
      expect({ file, hit: REPEALED.test(text) }).toEqual({ file, hit: false })
    }
  })

  it('no VERIFIED marker in the engine rests on it', () => {
    const offenders: string[] = []
    for (const file of readdirSync(engineDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))) {
      for (const line of readFileSync(join(engineDir, file), 'utf8').split('\n')) {
        if (/VERIFIED:/.test(line) && (REPEALED.test(line) || /gratuity_2\.pdf/.test(line))) {
          offenders.push(`${file}: ${line.trim().slice(0, 80)}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
