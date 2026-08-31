import { describe, expect, it } from "vitest"
import { coverageState, type SweepRecord } from "./coverage"

describe("coverageState", () => {
  it("returns never state for the empty list", () => {
    const res = coverageState([], { today: "2026-08-31" })
    expect(res).toEqual({
      status: "never",
      lastSweptAt: null,
      coveredFrom: null,
      gapDays: 0,
      stale: false,
      sweepCount: 0,
      totalAdded: 0,
    })
  })

  it("handles a single sweep today (gapDays: 0, not stale)", () => {
    const records: SweepRecord[] = [{ sweptAt: "2026-08-31", windowDays: 60, added: 4 }]
    const res = coverageState(records, { today: "2026-08-31" })
    expect(res).toEqual({
      status: "swept",
      lastSweptAt: "2026-08-31",
      coveredFrom: "2026-07-02",
      gapDays: 0,
      stale: false,
      sweepCount: 1,
      totalAdded: 4,
    })
  })

  it("handles a sweep 13 days ago (not stale) and 15 days ago (stale) at default threshold", () => {
    const record13: SweepRecord[] = [{ sweptAt: "2026-08-18", windowDays: 60, added: 2 }]
    const res13 = coverageState(record13, { today: "2026-08-31" })
    expect(res13.gapDays).toBe(13)
    expect(res13.stale).toBe(false)

    const record15: SweepRecord[] = [{ sweptAt: "2026-08-16", windowDays: 60, added: 2 }]
    const res15 = coverageState(record15, { today: "2026-08-31" })
    expect(res15.gapDays).toBe(15)
    expect(res15.stale).toBe(true)
  })

  it("handles custom staleAfterDays", () => {
    const record: SweepRecord[] = [{ sweptAt: "2026-08-25", windowDays: 30, added: 1 }]
    // gapDays is 6
    const notStale = coverageState(record, { today: "2026-08-31", staleAfterDays: 7 })
    expect(notStale.gapDays).toBe(6)
    expect(notStale.stale).toBe(false)

    const isStale = coverageState(record, { today: "2026-08-31", staleAfterDays: 5 })
    expect(isStale.gapDays).toBe(6)
    expect(isStale.stale).toBe(true)
  })

  it("picks the true latest from an unsorted array", () => {
    const records: SweepRecord[] = [
      { sweptAt: "2026-08-10", windowDays: 30, added: 1 },
      { sweptAt: "2026-08-25", windowDays: 60, added: 5 },
      { sweptAt: "2026-08-15", windowDays: 45, added: 2 },
    ]
    const res = coverageState(records, { today: "2026-08-31" })
    expect(res.lastSweptAt).toBe("2026-08-25")
    expect(res.coveredFrom).toBe("2026-06-26")
    expect(res.gapDays).toBe(6)
  })

  it("computes coveredFrom across a month and a year boundary", () => {
    // Month boundary: 2026-08-10 minus 20 days -> 2026-07-21
    const recMonth: SweepRecord[] = [{ sweptAt: "2026-08-10", windowDays: 20, added: 1 }]
    const resMonth = coverageState(recMonth, { today: "2026-08-31" })
    expect(resMonth.coveredFrom).toBe("2026-07-21")

    // Year boundary: 2026-01-15 minus 30 days -> 2025-12-16
    const recYear: SweepRecord[] = [{ sweptAt: "2026-01-15", windowDays: 30, added: 1 }]
    const resYear = coverageState(recYear, { today: "2026-01-20" })
    expect(resYear.coveredFrom).toBe("2025-12-16")
  })

  it("sums totals across three records", () => {
    const records: SweepRecord[] = [
      { sweptAt: "2026-08-01", windowDays: 30, added: 3 },
      { sweptAt: "2026-08-10", windowDays: 30, added: 0 },
      { sweptAt: "2026-08-20", windowDays: 30, added: 4 },
    ]
    const res = coverageState(records, { today: "2026-08-31" })
    expect(res.sweepCount).toBe(3)
    expect(res.totalAdded).toBe(7)
  })

  it("clamps gapDays to 0 when sweptAt is in the future", () => {
    const records: SweepRecord[] = [{ sweptAt: "2026-09-05", windowDays: 30, added: 1 }]
    const res = coverageState(records, { today: "2026-08-31" })
    expect(res.gapDays).toBe(0)
    expect(res.stale).toBe(false)
  })

  it("maintains purity — the same arguments twice give deeply equal results", () => {
    const records: SweepRecord[] = [
      { sweptAt: "2026-08-10", windowDays: 30, added: 2 },
      { sweptAt: "2026-08-20", windowDays: 60, added: 3 },
    ]
    const snapshot = JSON.parse(JSON.stringify(records))
    const options = { today: "2026-08-31", staleAfterDays: 10 }

    const res1 = coverageState(records, options)
    const res2 = coverageState(records, options)

    expect(res1).toEqual(res2)
    expect(records).toEqual(snapshot)
  })
})

describe('the ledger never overstates what it covered', () => {
  it('a sweep recorded in the future cannot report a negative gap', () => {
    const state = coverageState(
      [{ sweptAt: '2026-09-10', windowDays: 60, added: 3 }],
      { today: '2026-08-31' },
    )
    expect(state.gapDays).toBe(0)
    expect(state.stale).toBe(false)
  })

  it('reports the widest reach-back of the latest sweep, not the largest window seen', () => {
    // An older sweep with a wider window must not make the board look better
    // covered than the most recent one actually managed.
    const state = coverageState(
      [
        { sweptAt: '2026-06-01', windowDays: 365, added: 40 },
        { sweptAt: '2026-08-30', windowDays: 60, added: 2 },
      ],
      { today: '2026-08-31' },
    )
    expect(state.lastSweptAt).toBe('2026-08-30')
    expect(state.coveredFrom).toBe('2026-07-01')
    expect(state.totalAdded).toBe(42)
    expect(state.sweepCount).toBe(2)
  })
})
