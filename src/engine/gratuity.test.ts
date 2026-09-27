import { describe, expect, it } from 'vitest'
import { GRATUITY_CAP, gratuity, gratuityEligibilityDate } from './gratuity'

/**
 * Goldens from the CA-closed G1 spec (master plan §6 PR G1), basic ₹50,000.
 * (15/26) × ₹50,000 = ₹28,846.1538…/year → ×5 = ₹1,44,230.77 → ₹1,44,231;
 * ×6 = ₹1,73,076.92 → ₹1,73,077.
 *
 * Join date 2019-08-01 throughout: the 4th anniversary, 2023-08-01, is a
 * Tuesday. s.54(B)(a) counts days actually worked, so the 240th/190th day
 * into year five is the 240th/190th WORKING day (Mon–Sat / Mon–Fri) counted
 * forward from that Tuesday, not the 240th/190th calendar day — weekly offs
 * do not count. Counting Mon–Sat from 2023-08-01 lands the 240th working day
 * on 2024-05-06; counting Mon–Fri lands the 190th on 2024-04-22.
 */
const BASE = { lastDrawnBasicDA: 50_000, joinDate: '2019-08-01', coveredByAct: true }

describe('gratuity — eligibility vs payable years (Code s.54(B)(a) / s.53(2))', () => {
  it('4y + 239 working days on a 6-day week → not eligible, ₹0', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-05-05' })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(false)
    expect(r.payableYears).toBe(0)
    expect(r.amount).toBe(0)
    expect(r.flipDate).toBe('2024-05-06')
  })

  it('4y + 240 working days on a 6-day week → eligible, 5 payable years, ₹1,44,231', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-05-06' })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(true)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
    expect(r.flipDate).toBeNull()
  })

  it('4y + 190 working days on a 5-day week → eligible, 5 payable years, ₹1,44,231', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-04-22', workWeekDays: 5 })
    expect(r.completedYears).toBe(4)
    expect(r.eligible).toBe(true)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
  })

  it('4y + 189 working days on a 5-day week → not eligible, flip date is the 190th working day', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-04-21', workWeekDays: 5 })
    expect(r.eligible).toBe(false)
    expect(r.amount).toBe(0)
    expect(r.flipDate).toBe('2024-04-22')
  })

  it('a weekend spent past the 6-day threshold does not add eligibility (weekly offs are not worked days)', () => {
    // 2024-05-06 is the 240th working day. The Sunday right after it,
    // 2024-05-12, is one calendar week later but adds no working days: still
    // eligible (already was), and the fast path itself must not have moved.
    const onLine = gratuity({ ...BASE, exitDate: '2024-05-06' })
    const aWeekOfWeekendsLater = gratuity({ ...BASE, exitDate: '2024-05-12' })
    expect(onLine.eligible).toBe(true)
    expect(aWeekOfWeekendsLater.eligible).toBe(true)
    expect(aWeekOfWeekendsLater.completedYears).toBe(4)
  })

  it('exactly 5y → eligible, 5 payable years, ₹1,44,231', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-08-01' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
  })

  it('5y + 6 months exactly → NO bump (s.4(2) says in excess of six months)', () => {
    const r = gratuity({ ...BASE, exitDate: '2025-02-01' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(5)
    expect(r.amount).toBe(144_231)
  })

  it('5y + 6 months + 1 day → bumps to 6 payable years, ₹1,73,077', () => {
    const r = gratuity({ ...BASE, exitDate: '2025-02-02' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(6)
    expect(r.amount).toBe(173_077)
  })

  it('5y + 200d → 6 payable years, ₹1,73,077', () => {
    const r = gratuity({ ...BASE, exitDate: '2025-02-17' })
    expect(r.completedYears).toBe(5)
    expect(r.payableYears).toBe(6)
    expect(r.amount).toBe(173_077)
  })

  it('amount never exceeds the ₹20L statutory cap (s.4(3))', () => {
    const r = gratuity({
      ...BASE,
      lastDrawnBasicDA: 400_000,
      joinDate: '2010-01-01',
      exitDate: '2025-01-01',
    })
    expect(r.amount).toBe(GRATUITY_CAP)
    expect(r.notes.some((n) => n.id === 'cap-applied')).toBe(true)
    expect(r.notes.some((n) => n.id === 'ceiling-omitted')).toBe(false)
  })

  it('an eligible figure says it is the floor under the Code, an ineligible one says nothing', () => {
    // Code on Social Security, 2020 s.53(2) pays on "wages" (s.2(88)), which is
    // basic + DA or more. The engine only ever sees basic + DA.
    const paid = gratuity({ ...BASE, exitDate: '2025-02-17' })
    expect(paid.notes.map((n) => n.id)).toContain('code-wages')
    const short = gratuity({ ...BASE, exitDate: '2024-05-05' })
    expect(short.notes.map((n) => n.id)).not.toContain('code-wages')
  })

  it('not covered by Act → amount 0 with policy note', () => {
    const r = gratuity({ ...BASE, exitDate: '2024-08-01', coveredByAct: false })
    expect(r.amount).toBe(0)
    expect(r.eligible).toBe(false)
    expect(r.notes.some((n) => n.id === 'act-may-not-apply')).toBe(true)
  })
})

describe('gratuityEligibilityDate — the same s.54(B)(a) date, answerable in the past', () => {
  it('agrees with flipDate while the person is still short of the line', () => {
    const short = gratuity({ ...BASE, exitDate: '2024-05-05' })
    expect(gratuityEligibilityDate(BASE.joinDate, 6)).toBe(short.flipDate)
    const shortFive = gratuity({ ...BASE, exitDate: '2024-04-21', workWeekDays: 5 })
    expect(gratuityEligibilityDate(BASE.joinDate, 5)).toBe(shortFive.flipDate)
  })

  it('still answers once eligibility is behind them, where flipDate is null', () => {
    // The plan screen says "safe since 2 October 2026", which needs the date
    // after it has passed. gratuity() has stopped returning one by then.
    expect(gratuity({ ...BASE, exitDate: '2026-01-01' }).flipDate).toBeNull()
    // Joined 2022-01-12: the 4th anniversary, 2026-01-12, is a Monday. The
    // 190th working day (Mon-Fri) from it is 2026-10-02; the 240th (Mon-Sat)
    // is 2026-10-17.
    expect(gratuityEligibilityDate('2022-01-12', 5)).toBe('2026-10-02')
    expect(gratuityEligibilityDate('2022-01-12', 6)).toBe('2026-10-17')
  })

  it('defaults to the six-day week and returns nothing when the Act does not apply', () => {
    expect(gratuityEligibilityDate('2022-01-12')).toBe('2026-10-17')
    expect(gratuityEligibilityDate('2022-01-12', 5, false)).toBeNull()
  })
})

/**
 * Code on Social Security, 2020, First Schedule item V: ten or more employees
 * "on any day of the preceding twelve months"; s.1(8): once covered, still
 * covered if numbers later fall. "Fewer than ten people" today is not the test,
 * and told a shrinking startup's staff that nothing statutory held them.
 */
describe('the ten-employee threshold is asked the way the Code states it', () => {
  it('asks whether the employer has ALWAYS had fewer than ten, not whether it has now', async () => {
    const { en } = await import('../i18n/en')
    const { hiSuite } = await import('../i18n/hi-suite')
    expect(en['plan.act.label']).toMatch(/always had fewer than ten/)
    expect(en['gratuity.coveredHint']).toMatch(/any day of the last twelve months/)
    expect(en['gratuity.coveredHint']).toMatch(/s\.1\(8\)/)
    expect(hiSuite['plan.act.label']).toMatch(/हमेशा/)
    expect(hiSuite['gratuity.coveredHint']).toMatch(/s\.1\(8\)/)
  })
})
