#!/usr/bin/env node
/**
 * Scaffold a micro-tool: engine stub + failing golden, React island,
 * registry row, English i18n keys. Does not write Hindi. Patches the
 * catch-all `src/pages/[tool].astro` with one import + one island line
 * because Astro requires a static import for `client:load`.
 *
 * Usage: node scripts/new-tool.mjs <kebab-slug>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const slug = process.argv[2] ?? ''

if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug) || slug === 'hi' || slug === 'home') {
  console.error('usage: node scripts/new-tool.mjs <kebab-slug>')
  console.error('slug must be English kebab-case and must not be "hi" or "home".')
  process.exit(1)
}

function pascal(s) {
  return s
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('')
}

function camel(s) {
  const p = pascal(s)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

const ident = camel(slug)
const Comp = `${pascal(slug)}Tool`
const engineFile = join(root, 'src/engine', `${slug}.ts`)
const testFile = join(root, 'src/engine', `${slug}.test.ts`)
const islandDir = join(root, 'src/tools', slug)
const islandFile = join(islandDir, 'index.tsx')
const toolsFile = join(root, 'src/data/tools.ts')
const enFile = join(root, 'src/i18n/en.ts')
const astroFile = join(root, 'src/pages/[tool].astro')

if (existsSync(engineFile) || existsSync(islandDir)) {
  console.error(`new-tool: ${slug} already exists`)
  process.exit(1)
}

writeFileSync(
  engineFile,
  `/** ${slug} — replace this stub. Golden in ${slug}.test.ts is the spec. */
export function ${ident}(_input: { amount: number }): { result: number } {
  throw new Error('${slug}: not implemented')
}
`,
)

writeFileSync(
  testFile,
  `import { describe, expect, it } from 'vitest'
import { ${ident} } from './${slug}'

describe('${ident}', () => {
  it('returns 2× the input (replace with a hand-derived golden)', () => {
    expect(${ident}({ amount: 3 }).result).toBe(6)
  })
})
`,
)

mkdirSync(islandDir, { recursive: true })
writeFileSync(
  islandFile,
  `import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, VerdictBanner } from '../../components/ui'
import { useT } from '../../i18n'

export default function ${Comp}() {
  return (
    <IslandRoot current="${slug}">
      <${Comp}Body />
    </IslandRoot>
  )
}

function ${Comp}Body() {
  const t = useT()
  return (
    <div data-tool="${slug}" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card>
        <h2 className="text-base font-bold">{t('${slug}.title')}</h2>
        <p className="mt-2 text-[13px] text-ink-soft">{t('${slug}.lead')}</p>
      </Card>
      <div className="space-y-3">
        <VerdictBanner>{t('${slug}.verdict')}</VerdictBanner>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
`,
)

let tools = readFileSync(toolsFile, 'utf8')
if (tools.includes(`slug: '${slug}'`)) {
  console.error(`new-tool: registry already has ${slug}`)
  process.exit(1)
}
const row = `  {
    slug: '${slug}',
    category: 'offer',
    stage: 1,
    icon: '${slug}',
    titleKey: '${slug}.title',
    descKey: '${slug}.desc',
    seoTitle: '${pascal(slug).replace(/([A-Z])/g, ' $1').trim()}',
    seoDescription: 'TODO: write a unique meta description before shipping.',
    hasIsland: true,
    statutory: false,
  },
`
tools = tools.replace(/export const TOOLS: ToolDef\[\] = \[/, `export const TOOLS: ToolDef[] = [\n${row}`)
writeFileSync(toolsFile, tools)

let en = readFileSync(enFile, 'utf8')
if (!en.includes(`'${slug}.title'`)) {
  const keys = `
  '${slug}.title': '${pascal(slug).replace(/([A-Z])/g, ' $1').trim()}',
  '${slug}.desc': 'Replace this one-line description.',
  '${slug}.lead': 'Replace this lead. Keep the answer above the fold.',
  '${slug}.verdict': 'Replace this verdict.',
`
  en = en.replace(/export const en: Record<string, string> = \{/, (m) => `${m}${keys}`)
  writeFileSync(enFile, en)
}

let astro = readFileSync(astroFile, 'utf8')
if (!astro.includes(`${Comp} from`)) {
  astro = astro.replace(
    `import PromptsTool from '../tools/prompts/index'\n`,
    `import PromptsTool from '../tools/prompts/index'\nimport ${Comp} from '../tools/${slug}/index'\n`,
  )
  astro = astro.replace(
    `{slug === 'prompts' && <PromptsTool client:load />}`,
    `{slug === 'prompts' && <PromptsTool client:load />}\n  {slug === '${slug}' && <${Comp} client:load />}`,
  )
  writeFileSync(astroFile, astro)
}

console.log(`new-tool: scaffolded ${slug}`)
console.log(`  ${engineFile}`)
console.log(`  ${testFile}  (golden should FAIL until you implement)`)
console.log(`  ${islandFile}`)
console.log('  registry + en.ts + [tool].astro patched')
console.log('Next: make the golden pass, then npm test && npm run typecheck && npm run lint && npm run build && npm run check:seo')
