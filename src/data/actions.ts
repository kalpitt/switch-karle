import { outboundUnlocked } from '../engine/switchCalendar'
import { ACTION_IDS, type ActionId, type Plan } from './plan'

/**
 * The ten first actions, as data (docs/DIRECTION.md Part 6). Order is the order
 * on screen. Pure: no React, no storage, so the unlock rule can be tested.
 *
 * `private` actions are safe the day they arrive. `outbound` actions can reach
 * a manager or a recruiter, so they stay hidden until `outboundUnlocked`.
 */
export interface ActionDef {
  id: ActionId
  /** Rough time, 15 or less (Part 8, rule 10). */
  minutes: number
  /** Where the action is done: on this page, in a tool by slug, or off the site. */
  where: 'here' | `tool:${string}` | 'external'
  visibility: 'private' | 'outbound'
  /** Shown only after the user says they have a bond or a joining bonus. */
  needsBond?: boolean
}

const DEFS: Record<ActionId, Omit<ActionDef, 'id'>> = {
  'write-reason': { minutes: 2, where: 'here', visibility: 'private' },
  'name-five-companies': { minutes: 5, where: 'here', visibility: 'private' },
  'tell-one-person-outside': { minutes: 5, where: 'external', visibility: 'private' },
  'read-what-binds-you': { minutes: 10, where: 'tool:bond-scanner', visibility: 'private', needsBond: true },
  'research-two-companies': { minutes: 15, where: 'tool:prompts', visibility: 'outbound' },
  'message-one-ex-colleague': { minutes: 10, where: 'tool:prompts', visibility: 'outbound' },
  'update-public-headline': { minutes: 10, where: 'external', visibility: 'outbound' },
  'block-saturday': { minutes: 2, where: 'external', visibility: 'outbound' },
  'apply-to-one': { minutes: 15, where: 'tool:tracker', visibility: 'outbound' },
  'apply-to-one-more': { minutes: 15, where: 'tool:tracker', visibility: 'outbound' },
}

/** All ten, in `ACTION_IDS` order. */
export const ACTIONS: readonly ActionDef[] = ACTION_IDS.map((id) => ({ id, ...DEFS[id] }))

export interface VisibleActions {
  shown: ActionDef[]
  /** Outbound actions still held back, as a count only: nothing about them renders. */
  hiddenOutbound: number
}

/**
 * Which actions render today. Outbound ones need today on or after
 * `startApplyingBy`, or `plan.lookingSince`. The bond check needs `plan.hasBond`.
 */
export function visibleActions(
  plan: Pick<Plan, 'lookingSince' | 'hasBond'>,
  today: string,
  startApplyingBy: string | null,
): VisibleActions {
  const open = outboundUnlocked(today, startApplyingBy, plan.lookingSince)
  const shown: ActionDef[] = []
  let hiddenOutbound = 0
  for (const a of ACTIONS) {
    if (a.needsBond && plan.hasBond !== true) continue
    if (a.visibility === 'outbound' && !open) {
      hiddenOutbound++
      continue
    }
    shown.push(a)
  }
  return { shown, hiddenOutbound }
}

/** The first shown action not yet ticked: the one "next" thing (Part 8, rule 9). */
export function nextAction(shown: readonly ActionDef[], ticks: Plan['ticks']): ActionId | null {
  return shown.find((a) => ticks?.[a.id] == null)?.id ?? null
}
