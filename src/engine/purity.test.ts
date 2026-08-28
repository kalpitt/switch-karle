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
})
