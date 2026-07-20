import { describe, expect, it } from 'vitest'
import { parseAiOffer } from './offerImport'

const FULL = `Here's my summary...

\`\`\`json
{
  "switchkarle_offer": 1,
  "ctc_lpa": 28,
  "variable_lpa": 4.2,
  "basic_percent_of_fixed": 38,
  "hra_percent_of_basic": 50,
  "employer_pf_in_ctc": true,
  "gratuity_in_ctc": true,
  "pf_on_full_basic": false,
  "notice_days": 90,
  "bond_amount_lakh": 2,
  "bond_months": 24,
  "joining_bonus_lakh": 3,
  "clawback_months": 12,
  "esop_annual_lakh": null,
  "esop_cliff_months": null,
  "esop_listed": null,
  "state_code": "MH"
}
\`\`\`

ASK HR: ...`

describe('parseAiOffer', () => {
  it('parses a fenced full response into an OfferInput patch', () => {
    const r = parseAiOffer(FULL)
    expect(r.patch.ctcAnnual).toBe(2_800_000)
    expect(r.patch.variableAnnual).toBe(420_000)
    expect(r.patch.basicPercent).toBe(38)
    expect(r.patch.employerPfInCtc).toBe(true)
    expect(r.patch.gratuityInCtc).toBe(true)
    expect(r.patch.pfOnFullBasic).toBe(false)
    expect(r.patch.noticePeriodDays).toBe(90)
    expect(r.patch.bond).toEqual({ amount: 200_000, months: 24 })
    expect(r.patch.joiningBonus).toEqual({ amount: 300_000, clawbackMonths: 12 })
    expect(r.patch.esop).toBeUndefined()
    expect(r.patch.state).toBe('MH')
    expect(r.missing).toContain('esop_annual_lakh')
  })

  it('accepts a bare JSON object without a fence, with string numbers', () => {
    const r = parseAiOffer('{"ctc_lpa": "24", "notice_days": "60", "state_code": "ka"}')
    expect(r.patch.ctcAnnual).toBe(2_400_000)
    expect(r.patch.noticePeriodDays).toBe(60)
    expect(r.patch.state).toBe('KA')
    expect(r.missing.length).toBeGreaterThan(0)
  })

  it('nulls never overwrite: they land in missing, not patch', () => {
    const r = parseAiOffer('{"ctc_lpa": 24, "gratuity_in_ctc": null}')
    expect(r.patch.gratuityInCtc).toBeUndefined()
    expect(r.missing).toContain('gratuity_in_ctc')
  })

  it('clamps out-of-range percents and rejects invalid state codes', () => {
    const r = parseAiOffer('{"ctc_lpa": 24, "basic_percent_of_fixed": 95, "state_code": "XX"}')
    expect(r.patch.basicPercent).toBe(80)
    expect(r.patch.state).toBeUndefined()
    expect(r.missing).toContain('state_code')
  })

  it('throws on prose with no JSON', () => {
    expect(() => parseAiOffer('Sorry, I could not read the document.')).toThrow('no-json')
  })

  it('throws when JSON contains nothing usable', () => {
    expect(() => parseAiOffer('{"switchkarle_offer": 1, "ctc_lpa": null}')).toThrow('no-fields')
  })
})
