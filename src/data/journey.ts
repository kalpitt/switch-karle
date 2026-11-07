/**
 * The seven journey stages from PRODUCT.md, and which tools sit in each.
 * Every tool has exactly one `journey` (tools.test.ts holds that).
 */
import { TOOLS, type ToolDef } from './tools'

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
