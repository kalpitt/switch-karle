import type { ToolDef } from '../data/tools'

export interface PaletteItem {
  slug: string
  href: string
  titleKey: string
  descKey: string
  keywords?: string[]
}

const NON_ALNUM = /[^\p{L}\p{N}\p{M}]+/gu

export function normalise(text: string): string {
  return text.toLowerCase().replace(NON_ALNUM, '')
}

/**
 * True when the (space-stripped) query starts at the beginning of a word in
 * `text`. "hike" matches "Real hike", "form 13" matches "Form 13 and…", but "hr"
 * does not match "three" and "quit" does not match "equity".
 */
function startsAWord(text: string, qNorm: string): boolean {
  const words = text.toLowerCase().split(NON_ALNUM).filter(Boolean)
  const joined = words.join('')
  let offset = 0
  for (const word of words) {
    if (joined.startsWith(qNorm, offset)) return true
    offset += word.length
  }
  return false
}

/**
 * How well an item answers the query; 0 drops it. A word in the title beats a
 * keyword, which beats a word in the description. A bare substring counts only in
 * the title, or in a keyword when the query is long enough not to be noise.
 */
function score(item: PaletteItem, qNorm: string, label: (key: string) => string): number {
  const title = `${label(item.titleKey)} ${item.slug}`
  if (startsAWord(title, qNorm)) return 100
  if (normalise(title).includes(qNorm)) return 70
  const keywords = item.keywords ?? []
  if (keywords.some((k) => normalise(k) === qNorm || startsAWord(k, qNorm))) return 60
  if (qNorm.length >= 5 && keywords.some((k) => normalise(k).includes(qNorm))) return 25
  if (startsAWord(label(item.descKey), qNorm)) return 15
  return 0
}

export function filterPalette(items: PaletteItem[], query: string, label: (key: string) => string): PaletteItem[] {
  const qNorm = normalise(query)
  if (!qNorm) return items

  return items
    .map((item, index) => ({ item, index, score: score(item, qNorm, label) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.item)
}

/** Words people type when what they want is the home plan (their dates). */
const PLAN_KEYWORDS = [
  'plan',
  'my dates',
  'when to resign',
  'resign date',
  'join date',
  'appraisal',
  'hike month',
  'gratuity date',
  'calendar',
  'quit',
  'kab resign karu',
  'kab chhodu',
  'कब इस्तीफा दूँ',
  'कब छोड़ूँ',
]

export function paletteItems(tools: ToolDef[], homeHref: string, toolHref: (slug: string) => string): PaletteItem[] {
  return [
    { slug: 'home', href: homeHref, titleKey: 'nav.home', descKey: 'palette.plan.desc', keywords: PLAN_KEYWORDS },
    ...tools.map((tool) => ({
      slug: tool.slug,
      href: toolHref(tool.slug),
      titleKey: tool.titleKey,
      descKey: tool.descKey,
      keywords: tool.keywords,
    })),
  ]
}
