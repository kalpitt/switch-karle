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
    slug: 'offer-comparison',
    category: 'offer',
    stage: 1,
    icon: 'compare',
    titleKey: 'offer-comparison.title',
    descKey: 'offer-comparison.desc',
    seoTitle: 'Offer Comparison',
    seoDescription:
      'Compare two or three Indian job offers side by side: real in-hand, CTC stuffing, and a one-line verdict. Paper ESOP cannot swing the call.',
    hasIsland: true,
    statutory: false,
    storageKey: 'switchkarle.compare.v1',
  },
  {
    slug: 'real-hike',
    category: 'offer',
    stage: 1,
    icon: 'hike',
    titleKey: 'real-hike.title',
    descKey: 'real-hike.desc',
    seoTitle: 'Real Hike Calculator',
    seoDescription:
      'See the CTC hike versus the in-hand hike on an Indian job switch. Joining bonus stays out of the run-rate; variable can be haircut to 70%.',
    hasIsland: true,
    statutory: false,
    storageKey: 'switchkarle.hike.v1',
  },
  {
    slug: 'variable-reality',
    category: 'offer',
    stage: 1,
    icon: 'variable',
    titleKey: 'variable-reality.title',
    descKey: 'variable-reality.desc',
    seoTitle: 'Variable Pay Reality Check',
    seoDescription:
      'Monthly in-hand if variable pays 0%, 50% or 100%, plus first-year pro-rating and lump-versus-spread tax.',
    hasIsland: true,
    statutory: false,
    storageKey: 'switchkarle.variable.v1',
  },
  {
    slug: 'bonus-clawback',
    category: 'offer',
    stage: 1,
    icon: 'clawback',
    titleKey: 'bonus-clawback.title',
    descKey: 'bonus-clawback.desc',
    seoTitle: 'Joining Bonus Clawback',
    seoDescription:
      'You received the joining bonus net of tax. Leaving early, Indian letters typically ask for the gross amount back.',
    hasIsland: true,
    statutory: true,
    storageKey: 'switchkarle.clawback.v1',
  },
  {
    slug: 'esop-reality',
    category: 'offer',
    stage: 1,
    icon: 'esop',
    titleKey: 'esop-reality.title',
    descKey: 'esop-reality.desc',
    seoTitle: 'ESOP Reality Check',
    seoDescription:
      'Exercise cost, perquisite tax at your slab, vest and cliff, and a liquidity warning for private-company paper. Provisional.',
    hasIsland: true,
    statutory: true,
    storageKey: 'switchkarle.esop.v1',
  },
  {
    slug: 'relocation',
    category: 'offer',
    stage: 1,
    icon: 'relocation',
    titleKey: 'relocation.title',
    descKey: 'relocation.desc',
    seoTitle: 'Relocation Equivalence',
    seoDescription:
      'Same CTC, new city: state professional tax and old-regime HRA metro limb. National tax slabs do not change. No fake cost-of-living index.',
    hasIsland: true,
    statutory: true,
    storageKey: 'switchkarle.relocation.v1',
  },
  {
    slug: 'fake-offer',
    category: 'offer',
    stage: 1,
    icon: 'scan',
    titleKey: 'fake-offer.title',
    descKey: 'fake-offer.desc',
    seoTitle: 'Fake Offer Scanner',
    seoDescription:
      'Scan an Indian job offer for deposit asks, free-mail recruiters and lookalike domains, with EPFO and MCA verification links. Runs on this device.',
    hasIsland: true,
    statutory: false,
    storageKey: 'switchkarle.fake-offer.v1',
  },
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
