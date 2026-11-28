import { PLAN_PAGE, TOOLS_PAGE, type ToolDef } from '../data/tools'
import { DOORS, LAID_OFF, doorById, doorPath, type DoorId } from '../data/doors'

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

/** Words people type when what they want is the resign-date plan (their dates). */
const PLAN_KEYWORDS = [
  'plan',
  'resign date',
  'my dates',
  'when to resign',
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

export function paletteItems(tools: ToolDef[], toolHref: (slug: string) => string): PaletteItem[] {
  return [
    // The resign-date plan, on its own page since the home page became the front door (2026-11-19).
    // Its slug is `plan`, not the address, so "resign" still finds the resignation letter first.
    { slug: 'plan', href: toolHref(PLAN_PAGE), titleKey: 'nav.plan', descKey: 'palette.plan.desc', keywords: PLAN_KEYWORDS },
    {
      slug: TOOLS_PAGE,
      href: toolHref(TOOLS_PAGE),
      titleKey: 'nav.allTools',
      descKey: 'palette.tools.desc',
      keywords: ['all tools', 'list', 'every tool', 'stages', 'सारे tools', 'सभी tools'],
    },
    ...tools.map((tool) => ({
      slug: tool.slug,
      href: toolHref(tool.slug),
      titleKey: tool.titleKey,
      descKey: tool.descKey,
      keywords: tool.keywords,
    })),
    // The five step pages come after the tools, so "resign" still finds the
    // resignation letter first and a tool's own name always wins a tie.
    ...[...DOORS, doorById(LAID_OFF)].map((door) => ({
      slug: doorPath(door.id),
      href: toolHref(doorPath(door.id)),
      titleKey: `door.${door.id}.name`,
      descKey: door.id === LAID_OFF ? `door.${door.id}.leadWhy` : `door.${door.id}.what`,
      keywords: DOOR_KEYWORDS[door.id],
    })),
  ]
}

/** Words people type when what they want is a whole step, not one tool. */
const DOOR_KEYWORDS: Record<DoorId, string[]> = {
  leaving: ['leave', 'leaving', 'quit job', 'naukri chhodna'],
  applying: ['apply', 'job search', 'interview', 'looking for job'],
  offer: ['offer', 'got an offer', 'offer letter'],
  notice: ['notice', 'resigned', 'serving notice', 'last working day'],
  joining: ['joining', 'new job', 'first day', 'onboarding'],
  'laid-off': ['laid off', 'layoff', 'fired', 'terminated', 'asked to resign', 'job gone', 'naukri gayi'],
}
