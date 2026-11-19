/**
 * The five steps a visitor picks from on the home page (the front-door rebuild,
 * 2026-11-16). Visitors see the word "step"; in code they are doors, because
 * "situation" already names a What to say script and "step" a screen of the plan.
 *
 * The seven journey stages (`ToolDef.journey`, `NEXT_STEP`) stay the internal
 * model. Each door covers one or two of them, shows one tool to start with
 * (`lead`) and at most four more (`also`), and is a page at /start/<id>/.
 */
import { DOORS_DIR, PLAN_PAGE, TOOLS, WHAT_TO_SAY, toolBySlug } from './tools'
import type { ToolDef } from './tools'
import type { JourneyId } from './journey'

export const DOOR_IDS = ['leaving', 'applying', 'offer', 'notice', 'joining'] as const
export type DoorId = (typeof DOOR_IDS)[number]

export interface Door {
  id: DoorId
  /** Which of the seven stages it covers. Every stage is covered by exactly one door. */
  journeys: readonly JourneyId[]
  /** A tool slug, or `PLAN_PAGE`. */
  lead: string
  /** Tool slugs, at most four, shown under the lead in this order. */
  also: readonly string[]
}

export const DOORS: readonly Door[] = [
  {
    id: 'leaving',
    journeys: [0],
    lead: PLAN_PAGE,
    also: ['notice-buyout', 'gratuity', 'leave-encashment', 'bond-scanner'],
  },
  {
    id: 'applying',
    journeys: [1, 2],
    lead: 'real-hike',
    also: ['expected-ctc', 'tracker', 'prompts'],
  },
  {
    id: 'offer',
    journeys: [3],
    lead: 'decoder',
    also: ['real-hike', 'offer-comparison', 'fake-offer', 'variable-reality'],
  },
  {
    id: 'notice',
    journeys: [4, 5],
    lead: 'resignation-letter',
    also: ['notice-tracker', 'fnf-checker', 'manager-script', 'offer-goes-cold'],
  },
  {
    id: 'joining',
    journeys: [6],
    lead: 'epf-transfer',
    also: ['bgv-prep', 'tax-declaration', 'form16-shock'],
  },
]

/** A step page's address under the site root, without slashes: `start/offer`. */
export const doorPath = (id: DoorId): string => `${DOORS_DIR}/${id}`

export function doorById(id: DoorId): Door {
  return DOORS.find((door) => door.id === id)!
}

function journeyOf(slug: string): JourneyId | undefined {
  if (slug === PLAN_PAGE) return 0
  return TOOLS.find((tool) => tool.slug === slug)?.journey
}

/**
 * Every door that shows this tool (as lead or also); else the door covering its
 * journey. `PLAN_PAGE` maps to `leaving`. A tool's frame links to these
 * ("More for:"), so a visitor who lands on a tool has one tap to the rest.
 */
export function doorsFor(slug: string): Door[] {
  const showing = DOORS.filter((door) => door.lead === slug || door.also.includes(slug))
  if (showing.length > 0) return showing
  const journey = journeyOf(slug)
  return DOORS.filter((door) => journey !== undefined && door.journeys.includes(journey))
}

/**
 * The rows of one /tools/ section per door: lead, then also, then every other
 * tool whose journey the door covers, in registry order. No duplicates. A slug
 * may be `PLAN_PAGE` (the plan's row) or a What to say script; the list page
 * folds scripts into one row per door.
 */
export function doorSections(tools: readonly ToolDef[] = TOOLS): { door: Door; slugs: string[] }[] {
  return DOORS.map((door) => {
    const rest = tools.filter((tool) => door.journeys.includes(tool.journey)).map((tool) => tool.slug)
    return { door, slugs: [...new Set([door.lead, ...door.also, ...rest])] }
  })
}

/** One row of /tools/: the plan, a tool, or one What to say row holding this door's scripts. */
export type DoorRow =
  | { kind: 'plan'; lead: boolean }
  | { kind: 'tool'; tool: ToolDef; lead: boolean }
  | {
      kind: 'group'
      /** What to say's own page, for its one-liner and as the fallback name. */
      group: ToolDef
      /** This door's scripts, in the order the section lists them. The row links to the first. */
      situations: ToolDef[]
      /** `whatToSay.row.<door>`: the row is named for the door (`listSections` is untouched). */
      nameKey: string
    }

/**
 * `doorSections()` as /tools/ shows it: What to say's scripts folded into one
 * row per door, sitting where the first script sits, named for the door; the
 * What to say page itself is not listed again, its rows stand for it. The lead
 * row is marked so the page can tag it "Start here".
 */
export function doorListSections(tools: readonly ToolDef[] = TOOLS): { door: Door; rows: DoorRow[] }[] {
  const group = tools.find((tool) => tool.slug === WHAT_TO_SAY)
  return doorSections(tools).map(({ door, slugs }) => {
    const rows: DoorRow[] = []
    for (const slug of slugs) {
      const lead = slug === door.lead
      if (slug === PLAN_PAGE) {
        rows.push({ kind: 'plan', lead })
        continue
      }
      if (slug === WHAT_TO_SAY) continue
      const tool = tools.find((t) => t.slug === slug) ?? toolBySlug(slug)
      if (!tool) continue
      if (!tool.partOf) {
        rows.push({ kind: 'tool', tool, lead })
        continue
      }
      const row = rows.find((r) => r.kind === 'group')
      if (row && row.kind === 'group') row.situations.push(tool)
      else if (group) rows.push({ kind: 'group', group, situations: [tool], nameKey: `whatToSay.row.${door.id}` })
    }
    return { door, rows }
  })
}
