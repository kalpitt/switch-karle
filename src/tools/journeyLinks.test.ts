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

describe('plan dates reach the tools (UX-15, UX-16)', () => {
  const PLAN_TOOLS = ['resignation-letter', 'notice-tracker', 'gratuity', 'fnf-checker'] as const

  it('the four date tools seed from the plan through data/planDates, never by parsing storage', () => {
    for (const tool of PLAN_TOOLS) {
      const src = read(`${tool}/index.tsx`)
      expect(src, tool).toMatch(/from '\.\.\/\.\.\/data\/planDates'/)
      expect(src, tool).toMatch(/seedFromPlan\([\s\S]*?loadPlanDates\(\),\s*PLAN_MAP,\s*false,?\s*\)/)
      expect(src, tool).toMatch(/<PlanDatesNote dates=\{fromPlan\} \/>/)
      expect(src, tool).not.toMatch(/switchkarle\.plan\.v1/)
    }
  })

  it('seeds only when the tool has no saved draft of its own', () => {
    for (const tool of PLAN_TOOLS) {
      const src = read(`${tool}/index.tsx`)
      // The only seedFromPlan call sits in the branch for "nothing saved here".
      expect(src.match(/seedFromPlan\(/g)?.length, tool).toBe(1)
      expect(src, tool).toMatch(/else \{[\s\S]{0,400}seedFromPlan\(/)
    }
  })

  it('a plan-derived last working day keeps its "our reading" source on the receipt', () => {
    for (const tool of ['gratuity', 'fnf-checker']) {
      const src = read(`${tool}/index.tsx`)
      expect(src, tool).toMatch(/fromPlan\.lastWorkingDay\s*\?\s*\[\.\.\.TOOL_SOURCES\['[a-z-]+'\], 'last-working-day'\]/)
    }
  })
})
