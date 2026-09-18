import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const engineDir = dirname(fileURLToPath(import.meta.url))

describe('engine purity', () => {
  it('no engine module imports react', () => {
    const files = readdirSync(engineDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    expect(files.length).toBeGreaterThan(0)
    const offenders: string[] = []
    for (const file of files) {
      const src = readFileSync(join(engineDir, file), 'utf8')
      if (/from\s+['"]react(?:\/[\w-]+)?['"]/.test(src) || /from\s+['"]react-dom/.test(src)) {
        offenders.push(file)
      }
    }
    expect(offenders).toEqual([])
  })

  /**
   * The engine may not read the clock or roll dice. `todayUTC(now = new Date())`
   * broke that for months in the one place a React-import check cannot look: a
   * default argument. Comments are blanked out first, keeping line numbers, so a
   * sentence like this one naming `new Date()` does not fail the build. Allowed
   * and deliberately not matched: `Date.UTC(...)` on already-parsed parts, and
   * `new Date(ms)` with an argument. Neither reads the current time.
   */
  it('no engine module reads the clock or randomness', () => {
    const files = readdirSync(engineDir).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    expect(files.length).toBeGreaterThan(0)
    const offenders: string[] = []
    // `new Date()`, `new Date (\n)`, a parens-free `new Date`, a bare `Date()`
    // call, and the two obvious sources of randomness and elapsed time.
    const clockOrRandom =
      /new\s+Date\s*(?:\(\s*\)|(?![\s\S]*?\()|\s*[;,)\]}])|(?<!\w|\.)Date\s*\(\s*\)|Date\.now\s*\(|Math\.random\s*\(|performance\.now\s*\(/
    for (const file of files) {
      const src = readFileSync(join(engineDir, file), 'utf8')
      // Blank the contents of comments but keep every newline, so the line
      // numbers reported below still point at the real line.
      const code = src
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length))
      code.split('\n').forEach((line, idx) => {
        if (clockOrRandom.test(line)) {
          offenders.push(`src/engine/${file}:${idx + 1}`)
        }
      })
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
