import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOOLS } from '../data/tools'
import { SCRIPT_SLUGS } from '../data/hrScripts'

const toolsDir = dirname(fileURLToPath(import.meta.url))
const read = (path: string) => readFileSync(join(toolsDir, path), 'utf8')

/** The file that draws a tool's result column. */
function sourceFor(slug: string): string {
  if ((SCRIPT_SLUGS as readonly string[]).includes(slug)) return read('scripts/index.tsx')
  if (slug === 'decoder') return read('../components/Results.tsx')
  return read(`${slug}/index.tsx`)
}

describe('one next thing under every result (UX-14, IA-02)', () => {
  it('every tool renders the shared NextStep, naming itself', () => {
    for (const { slug } of TOOLS) {
      const src = sourceFor(slug)
      const named = (SCRIPT_SLUGS as readonly string[]).includes(slug)
        ? /<NextStep from=\{slug\}/
        : new RegExp(`<NextStep from="${slug}"`)
      expect(src, slug).toMatch(named)
    }
  })

  it('no tool hand-rolls its own next link target', () => {
    for (const { slug } of TOOLS) {
      expect(sourceFor(slug), slug).not.toMatch(/data-next-step=/)
    }
  })
})
