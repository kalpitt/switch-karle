/**
 * The seven journey stages from PRODUCT.md, and which tools sit in each.
 * Every tool has exactly one `journey` (tools.test.ts holds that).
 */
import { TOOLS, WHAT_TO_SAY, type ToolDef } from './tools'

export type JourneyId = ToolDef['journey']

export const JOURNEY_IDS: readonly JourneyId[] = [0, 1, 2, 3, 4, 5, 6]

export interface JourneySection {
  id: JourneyId
  nameKey: string
  whatKey: string
  tools: ToolDef[]
}

export function journeySections(tools: readonly ToolDef[] = TOOLS): JourneySection[] {
  return JOURNEY_IDS.map((id) => ({
    id,
    nameKey: `journey.${id}.name`,
    whatKey: `journey.${id}.what`,
    tools: tools.filter((tool) => tool.journey === id),
  })).filter((section) => section.tools.length > 0)
}

/** One row in a list of tools: a tool, or a group shown once in this stage. */
export type ListEntry =
  | { kind: 'tool'; tool: ToolDef }
  | {
      kind: 'group'
      /** The group's own page (What to say), for its name and one-liner. */
      group: ToolDef
      /** The group's situations in this stage, in registry order. The row links to the first. */
      situations: ToolDef[]
    }

export interface ListSection {
  id: JourneyId
  nameKey: string
  whatKey: string
  entries: ListEntry[]
}

/**
 * The seven stages as the lists show them (/tools/, the home link count).
 * A situation of What to say is folded into one "What to say" row per stage it
 * appears in, sitting where its first situation sits and linking straight to
 * it. The What to say page itself is not listed again: its rows stand for it.
 */
export function listSections(tools: readonly ToolDef[] = TOOLS): ListSection[] {
  const group = tools.find((tool) => tool.slug === WHAT_TO_SAY)
  return journeySections(tools.filter((tool) => tool.slug !== WHAT_TO_SAY))
    .map(({ id, nameKey, whatKey, tools: inStage }) => {
      const entries: ListEntry[] = []
      for (const tool of inStage) {
        if (!tool.partOf) {
          entries.push({ kind: 'tool', tool })
          continue
        }
        const row = entries.find((entry) => entry.kind === 'group')
        if (row && row.kind === 'group') row.situations.push(tool)
        else if (group) entries.push({ kind: 'group', group, situations: [tool] })
      }
      return { id, nameKey, whatKey, entries }
    })
    .filter((section) => section.entries.length > 0)
}

/** What to say's situations, stage by stage: the picker on that page. */
export function whatToSayGroups(tools: readonly ToolDef[] = TOOLS): { id: JourneyId; nameKey: string; situations: ToolDef[] }[] {
  return listSections(tools).flatMap(({ id, nameKey, entries }) =>
    entries.flatMap((entry) => (entry.kind === 'group' ? [{ id, nameKey, situations: entry.situations }] : [])),
  )
}

/** How many things the lists show: every tool, with What to say counted once. */
export function distinctToolCount(tools: readonly ToolDef[] = TOOLS): number {
  return tools.filter((tool) => !tool.partOf).length
}

/** Where a "Next" link goes: another tool, or back to the plan on the home page. */
export type NextTarget = { kind: 'tool'; slug: string } | { kind: 'plan' }

/** The sentinel in `NEXT_STEP` for "back to the plan". No tool may take this slug. */
export const PLAN_TARGET = 'plan' as const

/**
 * Each tool's one next thing (PRODUCT.md rule 9, UX-14), hand-picked so that
 * following "Next" from any tool walks forward through the stages and ends
 * back at the plan (IA-02). Stage membership stays on `ToolDef.journey`; this
 * map holds only the order of the walk. `journey.test.ts` checks that every
 * tool has an entry, that no link steps back a stage, and that no chain cycles.
 *
 * Two side paths join the main chain rather than sit on it: decline-accepted
 * (backing out of an accepted offer) and offer-goes-cold (an offer going quiet
 * during notice). fake-offer and relieving-chaser skip past them.
 */
export const NEXT_STEP: Readonly<Record<string, string>> = {
  // 0 I'm done here
  gratuity: 'leave-encashment',
  'leave-encashment': 'notice-buyout',
  'notice-buyout': 'bond-scanner',
  'bond-scanner': 'bonus-clawback',
  'bonus-clawback': 'clause-library',
  'clause-library': 'tracker',
  // 1 Looking, quietly
  tracker: 'prompts',
  prompts: 'redactor',
  redactor: 'expected-ctc',
  // 2 Talking to them
  // The What to say page with no situation picked shows no Next link (the
  // picker is the next thing); this entry keeps the chain whole for tests.
  [WHAT_TO_SAY]: 'expected-ctc',
  'expected-ctc': 'recruiter-followup',
  'recruiter-followup': 'real-hike',
  'real-hike': 'decoder',
  // 3 The number on the table
  decoder: 'offer-comparison',
  'offer-comparison': 'variable-reality',
  'variable-reality': 'esop-reality',
  'esop-reality': 'relocation',
  relocation: 'fake-offer',
  'fake-offer': 'resignation-letter',
  'decline-accepted': 'resignation-letter',
  // 4 Telling them
  'resignation-letter': 'manager-script',
  'manager-script': 'counter-offer',
  'counter-offer': 'counter-offer-reply',
  'counter-offer-reply': 'early-release',
  'early-release': 'buyout-ask',
  'buyout-ask': 'notice-tracker',
  // 5 Serving it out
  'notice-tracker': 'handover-doc',
  'handover-doc': 'insurance-gap',
  'insurance-gap': 'fnf-checker',
  'fnf-checker': 'relieving-chaser',
  'relieving-chaser': 'bgv-prep',
  'offer-goes-cold': 'notice-tracker',
  // 6 The first 90 days
  'bgv-prep': 'epf-transfer',
  'epf-transfer': 'tax-declaration',
  'tax-declaration': 'form16-shock',
  'form16-shock': PLAN_TARGET,
}

/** The one next thing after `slug`, or undefined for a slug that has none. */
export function nextFor(slug: string): NextTarget | undefined {
  const target = NEXT_STEP[slug]
  if (target === undefined) return undefined
  return target === PLAN_TARGET ? { kind: 'plan' } : { kind: 'tool', slug: target }
}
