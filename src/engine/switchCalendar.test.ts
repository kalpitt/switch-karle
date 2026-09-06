import { describe, expect, it } from 'vitest'
import {
  DEFAULT_OFFER_BUFFER_DAYS,
  DEFAULT_OFFER_LEAD_WEEKS,
  cliffs,
  earliestCleanDate,
  hikeCliffDate,
  markForfeited,
  outboundUnlocked,
  switchCalendar,
  timeline,
  trades,
} from './switchCalendar'
import type { Cliff } from './switchCalendar'

/**
 * Goldens hand-worked from docs/DIRECTION.md Part 3 and Part 13.
 *
 * Ravi: joined 12 January 2022, 90 days' notice, hike money reaches his account
 * in May. Today is 6 September 2026.
 *   4y anniversary          12 Jan 2026
 *   + 190 days (5-day week) 21 Jul 2026   (already past — 47 days ago)
 *   + 240 days (6-day week)  9 Sep 2026   (3 days away)
 *   hike cliff              31 May 2027   (last day of the next May)
 *   keep the hike            1 Jun 2027   (the day after that cliff)
 *   offer in hand by        18 May 2027   (14 days before)
 *   start applying by       23 Mar 2027   (8 weeks = 56 days before that)
 */
const RAVI = {
  joinDate: '2022-01-12',
  noticePeriodDays: 90,
  hikeCreditMonth: 5,
  asOf: '2026-09-06',
} as const

function byId(list: readonly Cliff[]): Record<string, Cliff> {
  return Object.fromEntries(list.map((c) => [c.id, c]))
}

describe('cliffs — dated, both work weeks until the user says which is theirs', () => {
  it('Ravi has three, the past one is kept, and neither week is labelled his', () => {
    const found = byId(cliffs(RAVI))
    expect(Object.keys(found).sort()).toEqual(['gratuity-5-day', 'gratuity-6-day', 'hike'])
    expect(found['gratuity-5-day']).toMatchObject({
      date: '2026-07-21',
      kind: 'statutory',
      daysAway: -47,
      passed: true,
      forfeited: null,
    })
    expect(found['gratuity-6-day']).toMatchObject({
      date: '2026-09-09',
      kind: 'statutory',
      daysAway: 3,
      passed: false,
    })
    expect(found['hike']).toMatchObject({
      date: '2027-05-31',
      kind: 'contractual',
      daysAway: 267,
      passed: false,
    })
  })

  it('once the work week is known only that reading is returned', () => {
    expect(cliffs({ ...RAVI, workWeekDays: 5 }).map((c) => c.id)).toEqual([
      'gratuity-5-day',
      'hike',
    ])
    expect(cliffs({ ...RAVI, workWeekDays: 6 }).map((c) => c.id)).toEqual([
      'gratuity-6-day',
      'hike',
    ])
  })

  it('forfeited is null before a date is chosen — it cannot render on screen two', () => {
    for (const cliff of cliffs(RAVI)) expect(cliff.forfeited).toBeNull()
  })

  it('fewer than ten employees: the Act does not cover them, so no gratuity cliff', () => {
    // coveredByAct is asked, never assumed. A statutory cliff for an employer
    // the statute does not reach is exactly the invented number this product
    // exists to be better than.
    expect(cliffs({ ...RAVI, coveredByAct: false }).map((c) => c.id)).toEqual(['hike'])
  })

  it('no optional fields: a join date and a notice period alone give one cliff per week', () => {
    const bare = cliffs({ joinDate: '2022-01-12', noticePeriodDays: 90, asOf: '2026-09-06' })
    expect(bare.map((c) => c.id)).toEqual(['gratuity-5-day', 'gratuity-6-day'])
  })

  it('someone already past both gratuity cliffs invents nothing ahead of them', () => {
    const long = cliffs({ joinDate: '2018-01-12', noticePeriodDays: 60, asOf: '2026-09-06' })
    expect(long.map((c) => c.date)).toEqual(['2022-07-21', '2022-09-09'])
    expect(long.every((c) => c.passed)).toBe(true)
    expect(earliestCleanDate(long, '2026-09-06')).toBe('2026-09-06')
  })

  it('inside the 240-day window on a six-day week, and clear of it on a five-day week', () => {
    // Same person, same join date, 1 August 2026: safe on one schedule and
    // 39 days short on the other. This is why the screen forks.
    const on = { joinDate: '2022-01-12', noticePeriodDays: 90, asOf: '2026-08-01' }
    expect(cliffs({ ...on, workWeekDays: 6 })[0]).toMatchObject({
      date: '2026-09-09',
      passed: false,
      daysAway: 39,
    })
    expect(cliffs({ ...on, workWeekDays: 5 })[0]).toMatchObject({
      date: '2026-07-21',
      passed: true,
      daysAway: -11,
    })
  })

  it('a bond end date and a joining-bonus clawback are contractual cliffs when given', () => {
    const held = byId(
      cliffs({
        ...RAVI,
        bondEndDate: '2027-02-28',
        joiningBonusDate: '2025-11-15',
        clawbackMonths: 24,
      }),
    )
    expect(held['bond-end']).toMatchObject({ date: '2027-02-28', kind: 'contractual' })
    // addMonths(joiningBonusDate, clawbackMonths). bonusClawback() returns
    // rupees and a repayment curve, and no date at all.
    expect(held['bonus-clawback']).toMatchObject({ date: '2027-11-15', kind: 'contractual' })
  })
})

describe('the hike cliff prints a year, and it is always a month still to come', () => {
  it('May answered in September 2026 means May 2027, not the May that has gone', () => {
    expect(hikeCliffDate(5, '2026-09-06')).toBe('2027-05-31')
  })

  it('the hike month equal to the current month rolls to next year', () => {
    // Answered in September about September: this month's credit may already
    // have landed or may not, and nothing on the screen can tell which. The
    // plan rolls rather than promising a date the user may already be past.
    expect(hikeCliffDate(9, '2026-09-06')).toBe('2027-09-30')
    expect(hikeCliffDate(9, '2026-09-30')).toBe('2027-09-30')
  })

  it('December is a December cliff and March is a March one — never confused', () => {
    expect(hikeCliffDate(12, '2026-09-06')).toBe('2026-12-31')
    expect(hikeCliffDate(3, '2026-09-06')).toBe('2027-03-31')
    expect(hikeCliffDate(3, '2026-12-31')).toBe('2027-03-31')
  })

  it('February lands on the 29th in a leap year', () => {
    expect(hikeCliffDate(2, '2027-06-01')).toBe('2028-02-29')
    expect(hikeCliffDate(2, '2026-06-01')).toBe('2027-02-28')
  })

  it('an explicit stored year wins, so a saved plan does not drift a year on', () => {
    expect(hikeCliffDate(5, '2027-06-02', 2027)).toBe('2027-05-31')
  })
})

describe('earliestCleanDate — the day after the latest cliff still ahead', () => {
  it("is Ravi's 1 June 2027, because the hike is his only cliff still ahead", () => {
    expect(earliestCleanDate(cliffs({ ...RAVI, workWeekDays: 5 }), RAVI.asOf)).toBe('2027-06-01')
  })

  it('is today when every cliff is already behind, and today when there are none', () => {
    const past = cliffs({ joinDate: '2010-04-01', noticePeriodDays: 30, asOf: '2026-09-06' })
    expect(earliestCleanDate(past, '2026-09-06')).toBe('2026-09-06')
    expect(earliestCleanDate([], '2026-09-06')).toBe('2026-09-06')
  })
})

describe('trades — options that name what each date keeps', () => {
  it('Ravi gets three options and none of them is recommended', () => {
    const options = trades({ ...RAVI, workWeekDays: 5 })
    expect(options.map((o) => o.id)).toEqual(['keep-the-hike', 'keep-what-is-earned', 'own-date'])

    expect(options[0]).toMatchObject({
      resignDate: '2027-06-01',
      offerBy: '2027-05-18',
      startApplyingBy: '2027-03-23',
      startApplyingByPassed: false,
      earliestDate: null,
    })
    // "Keep only what is already earned" shows earliestCleanDate, but the date
    // it invites the user to pick starts at today — which is why the screen
    // says, in words, that they would already be late to start applying.
    expect(options[1]).toMatchObject({
      resignDate: '2027-06-01',
      earliestDate: '2026-09-06',
      startApplyingByPassed: true,
    })
    expect(options[2]).toMatchObject({
      resignDate: null,
      earliestDate: null,
      offerBy: null,
      startApplyingBy: null,
      startApplyingByPassed: false,
    })
  })

  it('with nothing still ahead the options become plain runway, never a blank screen', () => {
    const options = trades({ joinDate: '2018-01-12', noticePeriodDays: 60, asOf: '2026-09-06' })
    expect(options.map((o) => o.id)).toEqual([
      'runway-3-months',
      'runway-6-months',
      'runway-financial-year-end',
      'own-date',
    ])
    expect(options[0]!.resignDate).toBe('2026-12-06')
    expect(options[1]!.resignDate).toBe('2027-03-06')
    expect(options[2]!.resignDate).toBe('2027-03-31')
  })

  it('the financial-year option is the next 31 March, never 31 December', () => {
    const inDecember = trades({ joinDate: '2018-01-12', noticePeriodDays: 60, asOf: '2026-12-31' })
    expect(inDecember[2]).toMatchObject({
      id: 'runway-financial-year-end',
      resignDate: '2027-03-31',
    })
    const onIt = trades({ joinDate: '2018-01-12', noticePeriodDays: 60, asOf: '2027-03-31' })
    expect(onIt[2]!.resignDate).toBe('2028-03-31')
  })

  it('"keep the hike" is absent when the hike month was skipped', () => {
    const options = trades({
      joinDate: '2022-01-12',
      noticePeriodDays: 90,
      asOf: '2026-09-06',
      workWeekDays: 6,
    })
    expect(options.map((o) => o.id)).toEqual(['keep-what-is-earned', 'own-date'])
    // The six-day cliff is 9 September 2026 and still ahead, so the clean date
    // is the day after it — this is not the runway case.
    expect(options[0]!.resignDate).toBe('2026-09-10')
  })
})

describe('timeline — the backward plan, and only once a date exists', () => {
  it("Ravi's dates from 1 June 2027 on 90 days' notice", () => {
    const plan = timeline('2027-06-01', 90, '2026-09-06')
    expect(plan.resignDate).toBe('2027-06-01')
    expect(plan.daysAway).toBe(268)
    expect(plan.needOfferBy).toMatchObject({ date: '2027-05-18', kind: 'convention' })
    expect(plan.startApplyingBy).toMatchObject({ date: '2027-03-23', kind: 'convention' })
    // lastWorkingDay() in dates.ts counts the resignation day as day one of
    // notice and carries its own CANDIDATE marker for that reading.
    expect(plan.lastWorkingDay).toMatchObject({ date: '2027-08-29', kind: 'contractual' })
  })

  it('the conventions are exported constants the UI can show and edit', () => {
    expect(DEFAULT_OFFER_LEAD_WEEKS).toBe(8)
    expect(DEFAULT_OFFER_BUFFER_DAYS).toBe(14)
    const slower = timeline('2027-06-01', 90, '2026-09-06', {
      offerLeadWeeks: 12,
      offerBufferDays: 30,
    })
    expect(slower.needOfferBy.date).toBe('2027-05-02')
    expect(slower.startApplyingBy.date).toBe('2027-02-07')
  })

  it('a start-applying date already behind the user is reported as passed', () => {
    const soon = timeline('2026-10-01', 60, '2026-09-06')
    expect(soon.startApplyingBy).toMatchObject({ date: '2026-07-23', passed: true, daysAway: -45 })
  })

  it('switchCalendar returns no backward plan at all until a date is picked', () => {
    expect(switchCalendar(RAVI).timeline).toBeNull()
    expect(switchCalendar({ ...RAVI, targetResignDate: '2027-06-01' }).timeline).not.toBeNull()
  })
})

describe('forfeited — never silently dropped', () => {
  it('a resign date before the hike cliff forfeits the hike and nothing else', () => {
    const judged = byId(markForfeited(cliffs({ ...RAVI, workWeekDays: 5 }), '2026-11-01'))
    expect(judged['hike']!.forfeited).toBe(true)
    expect(judged['gratuity-5-day']!.forfeited).toBe(false)
  })

  it('resigning on the cliff itself does not forfeit it', () => {
    const judged = byId(markForfeited(cliffs({ ...RAVI, workWeekDays: 5 }), '2027-05-31'))
    expect(judged['hike']!.forfeited).toBe(false)
  })

  it('switchCalendar judges every cliff once the date is on the plan', () => {
    const out = switchCalendar({ ...RAVI, workWeekDays: 5, targetResignDate: '2026-11-01' })
    expect(out.cliffs.map((c) => [c.id, c.forfeited])).toEqual([
      ['gratuity-5-day', false],
      ['hike', true],
    ])
  })
})

describe('outboundUnlocked — two conditions, either one is enough', () => {
  it('locked while the applying date is ahead and nothing has been tapped', () => {
    expect(outboundUnlocked('2026-09-06', '2027-03-23')).toBe(false)
  })

  it('unlocked on the applying date itself, and after it', () => {
    expect(outboundUnlocked('2027-03-23', '2027-03-23')).toBe(true)
    expect(outboundUnlocked('2027-03-24', '2027-03-23')).toBe(true)
  })

  it('unlocked by the looking tap, which does not move the resign date', () => {
    expect(outboundUnlocked('2026-09-06', '2027-03-23', '2026-09-06')).toBe(true)
  })

  it('with no date picked at all, only the looking tap unlocks it', () => {
    expect(outboundUnlocked('2026-09-06', null)).toBe(false)
    expect(outboundUnlocked('2026-09-06', null, '2026-09-06')).toBe(true)
  })
})

describe('the whole calculation, end to end', () => {
  it("Ravi's first session on a five-day week", () => {
    const out = switchCalendar({ ...RAVI, workWeekDays: 5, targetResignDate: '2027-06-01' })
    expect(out.today).toBe('2026-09-06')
    expect(out.earliestCleanDate).toBe('2027-06-01')
    expect(out.conventions).toEqual({ offerLeadWeeks: 8, offerBufferDays: 14 })
    expect(out.timeline!.startApplyingBy.date).toBe('2027-03-23')
    expect(out.timeline!.needOfferBy.date).toBe('2027-05-18')
    expect(out.timeline!.lastWorkingDay.date).toBe('2027-08-29')
  })

  it('someone six years in with no hike month gets the backward plan as the whole output', () => {
    const out = switchCalendar({
      joinDate: '2018-01-12',
      noticePeriodDays: 30,
      asOf: '2026-09-06',
      workWeekDays: 5,
      targetResignDate: '2026-12-01',
    })
    expect(out.cliffs.every((c) => c.passed)).toBe(true)
    expect(out.cliffs.every((c) => c.forfeited === false)).toBe(true)
    expect(out.earliestCleanDate).toBe('2026-09-06')
    expect(out.timeline!.lastWorkingDay.date).toBe('2026-12-30')
  })

  it('a leap-day joiner keeps a real 29 February', () => {
    const out = switchCalendar({
      joinDate: '2020-02-29',
      noticePeriodDays: 90,
      hikeCreditMonth: 2,
      asOf: '2027-06-01',
      workWeekDays: 5,
    })
    const found = byId(out.cliffs)
    // addMonths clamps into the target month, so the fourth anniversary of a
    // 29 February join is 29 February 2024 — itself a leap year — plus 190 days.
    expect(found['gratuity-5-day']!.date).toBe('2024-09-06')
    expect(found['hike']!.date).toBe('2028-02-29')
    expect(out.earliestCleanDate).toBe('2028-03-01')
  })
})
