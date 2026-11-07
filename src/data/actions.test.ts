import { describe, expect, it } from 'vitest'
import { en } from '../i18n/en'
import { hiSuite } from '../i18n/hi-suite'
import { ACTIONS, nextAction, visibleActions } from './actions'
import { ACTION_IDS } from './plan'
import { TOOLS } from './tools'

const ids = (list: { id: string }[]) => list.map((a) => a.id)

describe('the ten actions', () => {
  it('are the ten ids, in order, split four private then six outbound', () => {
    expect(ids([...ACTIONS])).toEqual([...ACTION_IDS])
    expect(ACTIONS.slice(0, 4).every((a) => a.visibility === 'private')).toBe(true)
    expect(ACTIONS.slice(4).every((a) => a.visibility === 'outbound')).toBe(true)
  })

  it('every action takes fifteen minutes or less', () => {
    for (const a of ACTIONS) expect(a.minutes).toBeLessThanOrEqual(15)
  })

  it('every tool: target is a real registry slug', () => {
    const slugs = new Set(TOOLS.map((t) => t.slug))
    for (const a of ACTIONS) {
      if (a.where.startsWith('tool:')) expect(slugs.has(a.where.slice(5))).toBe(true)
    }
  })

  it('has English and Hindi copy for every title, body and open link', () => {
    const hi = hiSuite as Record<string, string>
    for (const a of ACTIONS) {
      const keys = [`plan.action.${a.id}.title`, `plan.action.${a.id}.body`]
      if (a.where.startsWith('tool:')) keys.push(`plan.action.${a.id}.open`)
      for (const k of keys) {
        expect(en[k], k).toBeTruthy()
        expect(hi[k]?.trim(), k).toBeTruthy()
      }
    }
  })
})

describe('visibleActions', () => {
  const START = '2027-03-23'

  it('shows only the three always-private actions before the apply-by date', () => {
    const v = visibleActions({}, '2026-09-06', START)
    expect(ids(v.shown)).toEqual(['write-reason', 'name-five-companies', 'tell-one-person-outside'])
    expect(v.hiddenOutbound).toBe(6)
  })

  it('renders no outbound action when both unlock conditions are false', () => {
    const v = visibleActions({ hasBond: true }, '2026-09-06', START)
    expect(v.shown.filter((a) => a.visibility === 'outbound')).toEqual([])
  })

  it('unlocks all six on the apply-by day', () => {
    const v = visibleActions({}, START, START)
    expect(v.shown).toHaveLength(9)
    expect(v.hiddenOutbound).toBe(0)
  })

  it('unlocks all six on lookingSince, with the apply-by date still far off', () => {
    const v = visibleActions({ lookingSince: '2026-09-06' }, '2026-09-06', START)
    expect(v.shown).toHaveLength(9)
  })

  it('shows the bond check only when the user said they have one', () => {
    expect(ids(visibleActions({}, '2026-09-06', START).shown)).not.toContain('read-what-binds-you')
    expect(ids(visibleActions({ hasBond: false }, '2026-09-06', START).shown)).not.toContain('read-what-binds-you')
    const v = visibleActions({ hasBond: true }, '2026-09-06', START)
    expect(ids(v.shown)[3]).toBe('read-what-binds-you')
  })
})

describe('nextAction', () => {
  it('is the first shown action without a tick, and null when all are ticked', () => {
    const shown = visibleActions({}, '2026-09-06', null).shown
    expect(nextAction(shown, undefined)).toBe('write-reason')
    expect(nextAction(shown, { 'write-reason': '2026-09-06' })).toBe('name-five-companies')
    const all = Object.fromEntries(shown.map((a) => [a.id, '2026-09-06']))
    expect(nextAction(shown, all)).toBeNull()
  })
})
