import type { ToolDef } from '../data/tools'

export interface PaletteItem {
  slug: string
  href: string
  titleKey: string
  descKey: string
}

export function filterPalette(items: PaletteItem[], query: string, label: (key: string) => string): PaletteItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const hay = `${item.slug} ${label(item.titleKey)} ${label(item.descKey)}`.toLowerCase()
    return hay.includes(q)
  })
}

export function paletteItems(tools: ToolDef[], homeHref: string, toolHref: (slug: string) => string): PaletteItem[] {
  return [
    { slug: 'home', href: homeHref, titleKey: 'nav.home', descKey: 'home.kicker' },
    ...tools.map((tool) => ({
      slug: tool.slug,
      href: toolHref(tool.slug),
      titleKey: tool.titleKey,
      descKey: tool.descKey,
    })),
  ]
}
