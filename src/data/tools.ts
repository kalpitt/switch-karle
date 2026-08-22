/**
 * Tool registry — home grid, catch-all routes, sitemap, palette, check-seo.
 */
export interface ToolDef {
  slug: string
  category: 'offer' | 'exit' | 'documents' | 'landing'
  stage: 0 | 1 | 2 | 3 | 4 | 5
  icon: string
  titleKey: string
  descKey: string
  /** English, baked into <title> / OG at build time. Hindi pass adds /hi/ twins. */
  seoTitle: string
  seoDescription: string
  /** Absent ⇒ zero-JS content tool. */
  hasIsland: boolean
  statutory: boolean
  storageKey?: `switchkarle.${string}.v${number}`
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'decoder',
    category: 'offer',
    stage: 0,
    icon: 'decoder',
    titleKey: 'tab.decoder',
    descKey: 'home.decoder.desc',
    seoTitle: 'Offer Decoder',
    seoDescription:
      'Decode your Indian job offer: CTC to real in-hand salary under both tax regimes, plus a red-flag scanner for notice periods, bonds and variable pay.',
    hasIsland: true,
    statutory: true,
    storageKey: 'switchkarle.decoder.v1',
  },
  {
    slug: 'tracker',
    category: 'landing',
    stage: 0,
    icon: 'tracker',
    titleKey: 'tab.tracker',
    descKey: 'home.tracker.desc',
    seoTitle: 'Job Tracker',
    seoDescription:
      'Kanban for your job hunt with India-native fields — CTC discussed, notice period, next action. Stays on this device.',
    hasIsland: true,
    statutory: false,
    storageKey: 'switchkarle.tracker.v1',
  },
  {
    slug: 'prompts',
    category: 'documents',
    stage: 0,
    icon: 'prompts',
    titleKey: 'tab.prompts',
    descKey: 'home.prompts.desc',
    seoTitle: 'Prompt Studio',
    seoDescription:
      'Copy a context-rich prompt into your own ChatGPT, Claude or Gemini tab. This app never sends your data to an AI.',
    hasIsland: true,
    statutory: false,
  },
]

export function toolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function islandTools(): ToolDef[] {
  return TOOLS.filter((t) => t.hasIsland)
}
