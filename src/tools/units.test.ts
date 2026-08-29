import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = dirname(dirname(fileURLToPath(import.meta.url)))

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return tsxFiles(full)
    return name.endsWith('.tsx') ? [full] : []
  })
}

/**
 * A card that asks for CTC in rupees and variable pay in lakhs makes the reader
 * do the conversion. `MoneyField` is rupees; a `LPA` or `₹ L` suffix is lakhs.
 * One form, one unit — pick either, never both in the same file.
 */
describe('money units', () => {
  it('no form mixes a rupee field with a lakh field', () => {
    const offenders = tsxFiles(join(srcDir, 'tools'))
      .concat(tsxFiles(join(srcDir, 'components')))
      .filter((file) => {
        const src = readFileSync(file, 'utf8')
        return src.includes('<MoneyField') && /suffix="(?:LPA|₹ L)"/.test(src)
      })
      .map((file) => file.slice(srcDir.length + 1))
    expect(offenders).toEqual([])
  })
})
