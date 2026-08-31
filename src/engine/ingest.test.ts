import { describe, expect, it } from 'vitest'
import type { Application } from '../tracker/types'
import {
  ingest,
  normaliseCompany,
  normaliseRole,
  parseIngestPayload,
  type IngestPayload,
} from './ingest'

describe('parseIngestPayload', () => {
  it('parses a valid payload with version 1', () => {
    const json = JSON.stringify({
      version: 1,
      generatedFor: 'job-applications',
      applications: [
        {
          company: 'Finlytix',
          role: 'Senior Backend Engineer',
          appliedOn: '2026-07-14',
          source: 'Naukri',
          status: 'Interview scheduled',
          ctcDiscussedLPA: 32,
        },
      ],
    })
    const parsed = parseIngestPayload(json)
    expect(parsed.version).toBe(1)
    expect(parsed.applications).toHaveLength(1)
    expect(parsed.applications[0]?.company).toBe('Finlytix')
  })

  it('throws on malformed JSON', () => {
    expect(() => parseIngestPayload('{ not-json')).toThrowError(/not valid JSON/i)
  })

  it('throws on non-object JSON', () => {
    expect(() => parseIngestPayload('null')).toThrowError(/unexpected structure/i)
    expect(() => parseIngestPayload('"hello"')).toThrowError(/unexpected structure/i)
    expect(() => parseIngestPayload('123')).toThrowError(/unexpected structure/i)
    expect(() => parseIngestPayload('[]')).toThrowError(/unexpected structure/i)
  })

  it('throws on missing applications or non-array applications', () => {
    expect(() => parseIngestPayload(JSON.stringify({ version: 1 }))).toThrowError(
      /applications must be an array/i,
    )
    expect(() =>
      parseIngestPayload(JSON.stringify({ version: 1, applications: 'not-an-array' })),
    ).toThrowError(/applications must be an array/i)
    expect(() =>
      parseIngestPayload(JSON.stringify({ version: 1, applications: null })),
    ).toThrowError(/applications must be an array/i)
  })

  it('throws on version other than 1', () => {
    expect(() =>
      parseIngestPayload(JSON.stringify({ version: 2, applications: [] })),
    ).toThrowError(/version 1/i)
    expect(() =>
      parseIngestPayload(JSON.stringify({ version: 0, applications: [] })),
    ).toThrowError(/version 1/i)
    expect(() => parseIngestPayload(JSON.stringify({ applications: [] }))).toThrowError(
      /version 1/i,
    )
  })
})

describe('normalisation', () => {
  it('normalises companies by stripping trailing legal suffixes, non-alphanumerics, and collapsing whitespace', () => {
    expect(normaliseCompany('Finlytix Technologies Pvt Ltd')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Pvt. Ltd.')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Private Limited')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Ltd')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Limited')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Inc.')).toBe('finlytix')
    expect(normaliseCompany('Finlytix LLP')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Technologies')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Technology')).toBe('finlytix')
    expect(normaliseCompany('Finlytix Labs')).toBe('finlytix')
    // 'india' is deliberately not a suffix: it is part of real company names.
    expect(normaliseCompany('Finlytix India')).toBe('finlytix india')
    expect(normaliseCompany('Finlytix India Pvt Ltd')).toBe('finlytix india')
    expect(normaliseCompany('Bank of India')).toBe('bank of india')
    expect(normaliseCompany('Air India')).toBe('air india')
    expect(normaliseCompany('  Finlytix   Technologies  ')).toBe('finlytix')
  })

  it('preserves non-trailing suffix words and single-token names', () => {
    expect(normaliseCompany('India Today')).toBe('india today')
    expect(normaliseCompany('Labs')).toBe('labs')
    expect(normaliseCompany('Technology')).toBe('technology')
    expect(normaliseCompany('Arka Health')).toBe('arka health')
  })

  it('normalises roles preserving seniority and collapsing non-alphanumerics', () => {
    expect(normaliseRole('Senior Backend Engineer')).toBe('senior backend engineer')
    expect(normaliseRole('SDE II')).toBe('sde ii')
    expect(normaliseRole('SDE III')).toBe('sde iii')
    expect(normaliseRole('Staff Engineer (Platform)')).toBe('staff engineer platform')
    expect(normaliseRole('')).toBe('')
    expect(normaliseRole(undefined)).toBe('')
    expect(normaliseRole(null)).toBe('')
  })
})

describe('ingest core rules', () => {
  const defaultToday = '2026-07-14'

  it('maps a clean three-row payload with every field and LPA conversion correctly', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: 'Finlytix',
          role: 'Senior Backend Engineer',
          appliedOn: '2026-07-14',
          source: 'Naukri',
          status: 'Interview scheduled',
          ctcDiscussedLPA: 32,
        },
        {
          company: 'Nivaan Retail',
          role: 'Product Manager',
          appliedOn: '2026-07-10',
          source: 'LinkedIn',
          status: 'Application submitted',
          ctcDiscussedLPA: 28.5,
        },
        {
          company: 'Corevance',
          role: 'Engineering Lead',
          appliedOn: '2026-07-01',
          source: 'Referral',
          status: 'Offer received',
          ctcDiscussedLPA: 45,
        },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })

    expect(res.rejected).toEqual([])
    expect(res.accepted).toHaveLength(3)
    expect(res.accepted[0]).toEqual({
      company: 'Finlytix',
      role: 'Senior Backend Engineer',
      stage: 'interviewing',
      source: 'Naukri',
      ctcDiscussedAnnual: 3200000,
    })
    expect(res.accepted[1]).toEqual({
      company: 'Nivaan Retail',
      role: 'Product Manager',
      stage: 'applied',
      source: 'LinkedIn',
      ctcDiscussedAnnual: 2850000,
    })
    expect(res.accepted[2]).toEqual({
      company: 'Corevance',
      role: 'Engineering Lead',
      stage: 'offer',
      source: 'Referral',
      ctcDiscussedAnnual: 4500000,
    })
    expect(res.counts).toEqual({
      'no-company': 0,
      'unreadable-date': 0,
      'out-of-scope': 0,
      'duplicate-in-payload': 0,
      'already-on-board': 0,
    })
  })

  it('rejects a row with no company as no-company and still imports the rest', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: '',
          role: 'Frontend Engineer',
        },
        {
          company: '   ',
          role: 'QA Engineer',
        },
        {
          role: 'DevOps Engineer',
        },
        {
          company: null,
          role: 'Security Engineer',
        },
        {
          company: 'Skydeck Logistics',
          role: 'Data Engineer',
        },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]?.company).toBe('Skydeck Logistics')
    expect(res.rejected).toHaveLength(4)
    expect(res.rejected).toEqual([
      { index: 0, company: null, reason: 'no-company' },
      { index: 1, company: null, reason: 'no-company' },
      { index: 2, company: null, reason: 'no-company' },
      { index: 3, company: null, reason: 'no-company' },
    ])
    expect(res.counts['no-company']).toBe(4)
  })

  it('parses YYYY-MM-DD and full ISO timestamps, and rejects unreadable dates', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', appliedOn: '2026-07-14' },
        { company: 'Nivaan Retail', appliedOn: '2026-07-14T09:30:00.000Z' },
        { company: 'Skydeck Logistics', appliedOn: '14/07/2026' },
        { company: 'Arka Health', appliedOn: 'July 14' },
        { company: 'Corevance', appliedOn: '' },
        { company: 'Tarkash Labs', appliedOn: 0 },
        { company: 'Zentraco', appliedOn: null },
        { company: 'Vortexia', appliedOn: '2026-02-30' },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(2)
    expect(res.accepted.map((a) => a.company)).toEqual(['Finlytix', 'Nivaan Retail'])
    expect(res.rejected).toEqual([
      { index: 2, company: 'Skydeck Logistics', reason: 'unreadable-date' },
      { index: 3, company: 'Arka Health', reason: 'unreadable-date' },
      { index: 4, company: 'Corevance', reason: 'unreadable-date' },
      { index: 5, company: 'Tarkash Labs', reason: 'unreadable-date' },
      { index: 6, company: 'Zentraco', reason: 'unreadable-date' },
      { index: 7, company: 'Vortexia', reason: 'unreadable-date' },
    ])
    expect(res.counts['unreadable-date']).toBe(6)
  })

  it('accepts a row with no appliedOn at all (undated application)', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: 'Finlytix',
          role: 'Backend Engineer',
        },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]).toEqual({
      company: 'Finlytix',
      role: 'Backend Engineer',
      stage: 'applied',
    })
    expect(res.rejected).toHaveLength(0)
  })

  it('rejects a row 61 days before today as out-of-scope, accepts 60 days, and never rejects undated', () => {
    // today: 2026-07-14
    // 60 days before: 2026-05-15 (May has 31 days: 17 days in May + 30 days in June + 13 days in July = 60)
    // 61 days before: 2026-05-14
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', appliedOn: '2026-05-15' }, // exactly 60 days ago
        { company: 'Nivaan Retail', appliedOn: '2026-05-14' }, // 61 days ago
        { company: 'Skydeck Logistics' }, // undated
      ],
    }

    const res = ingest(payload, [], { today: defaultToday, withinDays: 60 })
    expect(res.accepted).toHaveLength(2)
    expect(res.accepted.map((a) => a.company)).toEqual(['Finlytix', 'Skydeck Logistics'])
    expect(res.rejected).toEqual([
      { index: 1, company: 'Nivaan Retail', reason: 'out-of-scope' },
    ])
    expect(res.counts['out-of-scope']).toBe(1)
  })

  it('supports custom withinDays option', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', appliedOn: '2026-07-04' }, // 10 days ago
        { company: 'Nivaan Retail', appliedOn: '2026-07-01' }, // 13 days ago
      ],
    }

    const res = ingest(payload, [], { today: defaultToday, withinDays: 10 })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]?.company).toBe('Finlytix')
    expect(res.rejected).toEqual([
      { index: 1, company: 'Nivaan Retail', reason: 'out-of-scope' },
    ])
  })

  it('collides Finlytix Technologies Pvt Ltd and finlytix; keeps the one with more fields and rejects the other as duplicate-in-payload', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: 'finlytix',
          role: 'Senior Backend Engineer',
        },
        {
          company: 'Finlytix Technologies Pvt Ltd',
          role: 'Senior Backend Engineer',
          appliedOn: '2026-07-14',
          source: 'Naukri',
          status: 'Interview scheduled',
          ctcDiscussedLPA: 32,
        },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]).toEqual({
      company: 'Finlytix Technologies Pvt Ltd',
      role: 'Senior Backend Engineer',
      stage: 'interviewing',
      source: 'Naukri',
      ctcDiscussedAnnual: 3200000,
    })
    expect(res.rejected).toEqual([
      { index: 0, company: 'finlytix', reason: 'duplicate-in-payload' },
    ])
    expect(res.counts['duplicate-in-payload']).toBe(1)
  })

  it('breaks duplicate ties by keeping the first-seen row in payload order', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: 'Finlytix Pvt Ltd',
          role: 'Backend Engineer',
          source: 'LinkedIn',
        },
        {
          company: 'Finlytix',
          role: 'Backend Engineer',
          source: 'Naukri',
        },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]?.company).toBe('Finlytix Pvt Ltd')
    expect(res.accepted[0]?.source).toBe('LinkedIn')
    expect(res.rejected).toEqual([
      { index: 1, company: 'Finlytix', reason: 'duplicate-in-payload' },
    ])
  })

  it('does NOT collide SDE II and SDE III at the same company', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', role: 'SDE II' },
        { company: 'Finlytix', role: 'SDE III' },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(2)
    expect(res.rejected).toHaveLength(0)
    expect(res.accepted.map((a) => a.role)).toEqual(['SDE II', 'SDE III'])
  })

  it('survives three different roles at one company', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Corevance', role: 'Frontend Engineer' },
        { company: 'Corevance Inc.', role: 'Backend Engineer' },
        { company: 'Corevance LLP', role: 'Engineering Manager' },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(3)
    expect(res.rejected).toHaveLength(0)
    expect(res.accepted.map((a) => a.role)).toEqual([
      'Frontend Engineer',
      'Backend Engineer',
      'Engineering Manager',
    ])
  })

  it('collides two rows with no role for the same company', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Tarkash Labs' },
        { company: 'Tarkash', source: 'LinkedIn' },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]?.company).toBe('Tarkash')
    expect(res.rejected).toEqual([
      { index: 0, company: 'Tarkash Labs', reason: 'duplicate-in-payload' },
    ])
  })

  it('rejects a row matching an existing board application as already-on-board', () => {
    const existing: Application[] = [
      {
        id: 'app-1',
        company: 'Finlytix Pvt Ltd',
        role: 'Senior Backend Engineer',
        stage: 'interviewing',
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
    ]

    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: 'finlytix',
          role: 'Senior Backend Engineer',
        },
        {
          company: 'Nivaan Retail',
          role: 'Product Manager',
        },
      ],
    }

    const res = ingest(payload, existing, { today: defaultToday })
    expect(res.accepted).toHaveLength(1)
    expect(res.accepted[0]?.company).toBe('Nivaan Retail')
    expect(res.rejected).toEqual([
      { index: 0, company: 'finlytix', reason: 'already-on-board' },
    ])
    expect(res.counts['already-on-board']).toBe(1)
  })

  it('counts always sums to rejected.length', () => {
    const existing: Application[] = [
      {
        id: 'app-1',
        company: 'Corevance',
        role: 'Tech Lead',
        stage: 'applied',
        createdAt: '2026-07-01T00:00:00.000Z',
        updatedAt: '2026-07-01T00:00:00.000Z',
      },
    ]

    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: '' }, // no-company
        { company: 'Finlytix', appliedOn: 'invalid-date' }, // unreadable-date
        { company: 'Nivaan Retail', appliedOn: '2025-01-01' }, // out-of-scope
        { company: 'Skydeck Labs', role: 'Analyst' }, // duplicate #1 (less info)
        { company: 'Skydeck', role: 'Analyst', source: 'Referral' }, // duplicate #2 (wins)
        { company: 'Corevance', role: 'Tech Lead' }, // already-on-board
        { company: 'Arka Health', role: 'Designer' }, // accepted
      ],
    }

    const res = ingest(payload, existing, { today: defaultToday })
    expect(res.accepted).toHaveLength(2)
    expect(res.rejected).toHaveLength(5)
    const sum = Object.values(res.counts).reduce((a, b) => a + b, 0)
    expect(sum).toBe(res.rejected.length)
    expect(res.counts).toEqual({
      'no-company': 1,
      'unreadable-date': 1,
      'out-of-scope': 1,
      'duplicate-in-payload': 1,
      'already-on-board': 1,
    })
  })

  it('indexes likelyClosed correctly into accepted without changing their stage from applied', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        {
          company: 'Finlytix',
          role: 'Backend Engineer',
          status: 'Interview scheduled',
        },
        {
          company: 'Nivaan Retail',
          role: 'Product Manager',
          status: 'Rejected by company',
        },
        {
          company: 'Skydeck Logistics',
          role: 'Business Analyst',
          status: 'Position closed',
        },
        {
          company: 'Arka Health',
          role: 'QA Engineer',
          status: 'Unfortunately not selected',
        },
        {
          company: 'Corevance',
          role: 'Frontend Engineer',
          status: 'No longer under consideration',
        },
        {
          company: 'Tarkash Labs',
          role: 'Data Scientist',
          status: 'Offer received',
        },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted).toHaveLength(6)
    // Row indices in accepted:
    // 0: Finlytix -> stage interviewing
    // 1: Nivaan -> stage applied, likelyClosed
    // 2: Skydeck -> stage applied, likelyClosed
    // 3: Arka -> stage applied, likelyClosed
    // 4: Corevance -> stage applied, likelyClosed
    // 5: Tarkash -> stage offer
    expect(res.accepted[0]?.stage).toBe('interviewing')
    expect(res.accepted[1]?.stage).toBe('applied')
    expect(res.accepted[2]?.stage).toBe('applied')
    expect(res.accepted[3]?.stage).toBe('applied')
    expect(res.accepted[4]?.stage).toBe('applied')
    expect(res.accepted[5]?.stage).toBe('offer')
    expect(res.likelyClosed).toEqual([1, 2, 3, 4])
  })

  it('maps stage substrings case-insensitively', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', status: 'Official Offer extended' },
        { company: 'Nivaan Retail', status: 'Round 2 Interview pending' },
        { company: 'Skydeck Logistics', status: 'Application Submitted' },
        { company: 'Arka Health', status: 'Applied on portal' },
        { company: 'Corevance', status: 'Candidate submitted' },
        { company: 'Tarkash Labs', status: 'In review' },
        { company: 'Zentraco' },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted[0]?.stage).toBe('offer')
    expect(res.accepted[1]?.stage).toBe('interviewing')
    expect(res.accepted[2]?.stage).toBe('applied')
    expect(res.accepted[3]?.stage).toBe('applied')
    expect(res.accepted[4]?.stage).toBe('applied')
    expect(res.accepted[5]?.stage).toBe('applied')
    expect(res.accepted[6]?.stage).toBe('applied')
  })

  it('handles CTC conversions and ignores non-positive or non-finite values', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', ctcDiscussedLPA: 24 },
        { company: 'Nivaan Retail', ctcDiscussedLPA: 18.75 },
        { company: 'Skydeck Logistics', ctcDiscussedLPA: 0 },
        { company: 'Arka Health', ctcDiscussedLPA: -15 },
        { company: 'Corevance', ctcDiscussedLPA: NaN },
        { company: 'Tarkash Labs', ctcDiscussedLPA: Infinity },
        { company: 'Zentraco', ctcDiscussedLPA: '30' },
      ],
    }

    const res = ingest(payload, [], { today: defaultToday })
    expect(res.accepted[0]?.ctcDiscussedAnnual).toBe(2400000)
    expect(res.accepted[1]?.ctcDiscussedAnnual).toBe(1875000)
    expect(res.accepted[2]?.ctcDiscussedAnnual).toBeUndefined()
    expect(res.accepted[3]?.ctcDiscussedAnnual).toBeUndefined()
    expect(res.accepted[4]?.ctcDiscussedAnnual).toBeUndefined()
    expect(res.accepted[5]?.ctcDiscussedAnnual).toBeUndefined()
    expect(res.accepted[6]?.ctcDiscussedAnnual).toBeUndefined()
  })

  it('handles empty payload gracefully', () => {
    const res = ingest({ version: 1, applications: [] }, [], { today: defaultToday })
    expect(res.accepted).toEqual([])
    expect(res.rejected).toEqual([])
    expect(res.likelyClosed).toEqual([])
    expect(res.counts).toEqual({
      'no-company': 0,
      'unreadable-date': 0,
      'out-of-scope': 0,
      'duplicate-in-payload': 0,
      'already-on-board': 0,
    })
  })

  it('guarantees purity: calling ingest twice with identical arguments returns deeply equal results, and changing today changes only out-of-scope outcomes', () => {
    const payload: IngestPayload = {
      version: 1,
      applications: [
        { company: 'Finlytix', role: 'Dev', appliedOn: '2026-07-10' },
        { company: 'Nivaan Retail', role: 'PM', appliedOn: '2026-05-20' },
      ],
    }

    const res1 = ingest(payload, [], { today: '2026-07-14' })
    const res2 = ingest(payload, [], { today: '2026-07-14' })
    expect(res1).toEqual(res2)

    // With today = 2026-07-14 (55 days after 2026-05-20), Nivaan is within 60 days
    expect(res1.accepted).toHaveLength(2)
    expect(res1.rejected).toHaveLength(0)

    // With today = 2026-07-25 (66 days after 2026-05-20), Nivaan is out of scope (> 60 days)
    const res3 = ingest(payload, [], { today: '2026-07-25' })
    expect(res3.accepted).toHaveLength(1)
    expect(res3.accepted[0]?.company).toBe('Finlytix')
    expect(res3.rejected).toEqual([
      { index: 1, company: 'Nivaan Retail', reason: 'out-of-scope' },
    ])
  })
})

describe('scope rejects a future date', () => {
  // An appliedOn after `today` is not real data: an LLM filling a gap, or a
  // year typo. Outside the window in either direction is out of scope.
  it('rejects an application dated after today', () => {
    const result = ingest(
      { version: 1, applications: [{ company: 'Finlytix', appliedOn: '2027-12-25' }] },
      [],
      { today: '2026-08-31' },
    )
    expect(result.accepted).toHaveLength(0)
    expect(result.counts['out-of-scope']).toBe(1)
  })

  it('accepts an application dated today', () => {
    const result = ingest(
      { version: 1, applications: [{ company: 'Finlytix', appliedOn: '2026-08-31' }] },
      [],
      { today: '2026-08-31' },
    )
    expect(result.accepted).toHaveLength(1)
  })
})

describe('names outside the Latin alphabet', () => {
  // Regression: normalisation stripped [^a-z0-9], so every Devanagari name
  // became the empty string, two different companies shared the key `::`, and
  // the second was dropped as a duplicate. In an app for the Indian job market
  // that is not an edge case.
  it('keeps two different Devanagari companies apart', () => {
    const result = ingest(
      {
        version: 1,
        applications: [
          { company: 'टाटा मोटर्स', role: 'अभियंता' },
          { company: 'रिलायंस इंडस्ट्रीज', role: 'अभियंता' },
        ],
      },
      [],
      { today: '2026-08-31' },
    )
    expect(result.accepted).toHaveLength(2)
    expect(result.counts['duplicate-in-payload']).toBe(0)
  })

  it('still collapses the same Devanagari company written twice', () => {
    const result = ingest(
      {
        version: 1,
        applications: [
          { company: 'टाटा मोटर्स', role: 'अभियंता' },
          { company: '  टाटा  मोटर्स ', role: 'अभियंता' },
        ],
      },
      [],
      { today: '2026-08-31' },
    )
    expect(result.accepted).toHaveLength(1)
  })

  it('normalises a mixed-script name without emptying it', () => {
    expect(normaliseCompany('Tata मोटर्स Pvt Ltd')).toBe('tata मोटर्स')
  })
})

describe('an ISO timestamp with no offset is still a date', () => {
  it('reads 2026-08-15T10:30:00 as 15 August', () => {
    const result = ingest(
      { version: 1, applications: [{ company: 'Finlytix', appliedOn: '2026-08-15T10:30:00' }] },
      [],
      { today: '2026-08-31' },
    )
    // appliedOn reaches the candidate only once feat/applied-on lands; here the
    // point is that the row is accepted rather than rejected as unreadable.
    expect(result.accepted).toHaveLength(1)
    expect(result.counts['unreadable-date']).toBe(0)
  })

  it('still rejects a day-first date', () => {
    const result = ingest(
      { version: 1, applications: [{ company: 'Finlytix', appliedOn: '15/08/2026' }] },
      [],
      { today: '2026-08-31' },
    )
    expect(result.counts['unreadable-date']).toBe(1)
  })
})
