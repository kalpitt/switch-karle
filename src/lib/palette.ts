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

export function filterPalette(items: PaletteItem[], query: string, label: (key: string) => string): PaletteItem[] {
  const qNorm = normalise(query)
  if (!qNorm) return items

  const titleMatches: PaletteItem[] = []
  const keywordMatches: PaletteItem[] = []

  for (const item of items) {
    const hay = normalise(`${item.slug} ${label(item.titleKey)} ${label(item.descKey)}`)
    if (hay.includes(qNorm)) {
      titleMatches.push(item)
    } else if (item.keywords?.some((k) => normalise(k).includes(qNorm))) {
      keywordMatches.push(item)
    }
  }

  return [...titleMatches, ...keywordMatches]
}

export function paletteItems(tools: ToolDef[], homeHref: string, toolHref: (slug: string) => string): PaletteItem[] {
  return [
    { slug: 'home', href: homeHref, titleKey: 'nav.home', descKey: 'home.kicker' },
    ...tools.map((tool) => ({
      slug: tool.slug,
      href: toolHref(tool.slug),
      titleKey: tool.titleKey,
      descKey: tool.descKey,
      keywords: tool.keywords,
    })),
  ]
}

