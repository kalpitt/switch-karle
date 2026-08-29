/**
 * How the home page orders the registry: three pinned starters, then the four
 * journey phases. Pure so it can be tested without rendering the page.
 */
import { TOOLS, type ToolDef } from './tools'

/** Already one tap away in the top nav, so the grid does not repeat them. */
export const NAV_SLUGS = ['tracker', 'prompts'] as const

/** Where the switch actually starts. Pinned above the phases. */
export const PINNED_SLUGS = ['decoder', 'offer-comparison', 'resignation-letter'] as const

/** Journey order, not the registry's. */
export const CATEGORY_ORDER = ['offer', 'exit', 'documents', 'landing'] as const

export interface HomeSection {
  category: ToolDef['category']
  titleKey: string
  tools: ToolDef[]
}

export function pinnedTools(tools: readonly ToolDef[] = TOOLS): ToolDef[] {
  return PINNED_SLUGS.map((slug) => tools.find((tool) => tool.slug === slug)).filter(
    (tool): tool is ToolDef => tool != null,
  )
}

export function homeSections(tools: readonly ToolDef[] = TOOLS): HomeSection[] {
  const hidden = new Set<string>([...NAV_SLUGS, ...PINNED_SLUGS])
  const rest = tools.filter((tool) => !hidden.has(tool.slug))
  return CATEGORY_ORDER.map((category) => ({
    category,
    titleKey: `home.cat.${category}`,
    tools: rest.filter((tool) => tool.category === category).sort((a, b) => a.stage - b.stage),
  })).filter((section) => section.tools.length > 0)
}
