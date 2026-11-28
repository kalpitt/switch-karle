import { describe, expect, it } from 'vitest'
import { cleanResume, guardFacts, numbersIn, parseProfileFix, resumeProblem, type ProfileFix } from './profileFix'

const RESUME = `Rahul Kumar Sharma
Email: rahul.sharma@example.com | +91 98765 43210 | linkedin.com/in/rahulks
Address: 12 MG Road, Pune 411001
DOB: 12/03/1996

Technology Analyst, Large IT Services Co. (2019 - 2024)
- Responsible for end-to-end delivery of weekly reports for a banking client.
- Built 12 Power BI dashboards used by the risk team.
- Wrote SQL queries to merge 3 data sources.

Skills: SQL, Power BI, Microsoft Excel, Python`

describe('cleanResume', () => {
  const { text, removed } = cleanResume(RESUME)

  it('removes the name line, contact details, address and date of birth', () => {
    expect(text).not.toContain('Rahul Kumar Sharma')
    expect(text).not.toContain('rahul.sharma@example.com')
    expect(text).not.toContain('98765')
    expect(text).not.toContain('linkedin.com')
    expect(text).not.toContain('MG Road')
    expect(text).not.toContain('12/03/1996')
  })

  it('keeps the work, the numbers in it and the skills', () => {
    expect(text).toContain('Technology Analyst, Large IT Services Co. (2019 - 2024)')
    expect(text).toContain('Built 12 Power BI dashboards used by the risk team.')
    expect(text).toContain('Skills: SQL, Power BI, Microsoft Excel, Python')
  })

  it('says what it removed, by kind and count', () => {
    expect(removed).toEqual([
      { kind: 'name', count: 1 },
      { kind: 'phone', count: 1 },
      { kind: 'email', count: 1 },
      { kind: 'link', count: 1 },
      { kind: 'address', count: 1 },
      { kind: 'dob', count: 1 },
    ])
  })

  it('does not take a heading for a name', () => {
    expect(cleanResume('Professional Summary\nSix years in operations.').removed).toEqual([])
    expect(cleanResume('CURRICULUM VITAE\nSix years in operations.').removed).toEqual([])
  })

  it('catches the usual Indian phone shapes, PAN and Aadhaar', () => {
    const r = cleanResume('Work notes\nCall 098765-43210 or (+91) 9876543210 or 9876543210. PAN ABCDE1234F. Aadhaar 2345 6789 0123.')
    expect(r.text).not.toMatch(/\d{5}/)
    expect(r.removed).toEqual([
      { kind: 'phone', count: 3 },
      { kind: 'pan', count: 1 },
      { kind: 'aadhaar', count: 1 },
    ])
  })

  it('leaves years and small counts alone', () => {
    expect(cleanResume('Notes on work\nLed 40 people from 2012 to 2024, cut cost 9%.').text).toBe(
      'Notes on work\nLed 40 people from 2012 to 2024, cut cost 9%.',
    )
  })

  it('is idempotent, so the Worker can run it again', () => {
    expect(cleanResume(text).text).toBe(text)
  })
})

describe('resumeProblem', () => {
  it('flags empty, too short and too long', () => {
    expect(resumeProblem('  ')).toBe('empty')
    expect(resumeProblem('a'.repeat(199))).toBe('tooShort')
    expect(resumeProblem('a'.repeat(12_001))).toBe('tooLong')
    expect(resumeProblem('a'.repeat(500))).toBeNull()
  })
})

describe('numbersIn', () => {
  it('normalises Indian grouping, decimals and percents', () => {
    expect([...numbersIn('₹1,20,000 and 9.5% and 40 and 3.0')]).toEqual(['120000', '9.5', '40', '3'])
    expect([...numbersIn('Five years, a dozen reports, one of them')]).toEqual(['5', '12'])
  })
})

const MODEL_JSON = {
  roles: [
    { title: 'Data Analyst', fit: 'strong', why: 'Five years of SQL and Power BI reporting.' },
    { title: 'BI Developer', fit: 'good', why: 'Built 12 dashboards.' },
    { title: 'MIS Analyst', fit: 'excellent', why: 'Weekly reports for a bank.' },
    { title: 'Fourth', fit: 'good', why: 'cut' },
  ],
  role: 'Data Analyst',
  naukriHeadline: 'Data Analyst | SQL, Power BI | 12 dashboards for a banking client | 6 yrs experience',
  linkedinHeadline: 'Data Analyst | SQL, Power BI, Python',
  skills: ['SQL', 'Power BI', 'Excel', 'Tableau'],
  worthShowing: ['A/B testing'],
  bullets: [
    {
      before: 'Responsible for end-to-end delivery of weekly reports for a banking client.',
      after: 'Delivered weekly risk reports for a banking client, cutting manual work by 40%.',
      hint: 'Add how many hours a week this saved, if you know it.',
    },
    {
      before: 'Built 12 Power BI dashboards used by the risk team.',
      after: 'Built 12 Power BI dashboards that the risk team uses every day.',
      hint: '',
    },
    {
      before: 'Managed a team of 8 analysts.',
      after: 'Led 8 analysts.',
      hint: '',
    },
  ],
  gap: 'Most Data Analyst posts ask for Python projects; yours names Python once.',
  missing: ['How many reports a week?', '', 'How many people used the dashboards?'],
}

describe('parseProfileFix', () => {
  it('keeps three roles, maps an unknown fit to good, drops blanks', () => {
    const fix = parseProfileFix(MODEL_JSON)!
    expect(fix.roles.map((r) => [r.title, r.fit])).toEqual([
      ['Data Analyst', 'strong'],
      ['BI Developer', 'good'],
      ['MIS Analyst', 'good'],
    ])
    expect(fix.missing).toEqual(['How many reports a week?', 'How many people used the dashboards?'])
  })

  it('is null for junk or an answer with nothing to show', () => {
    expect(parseProfileFix(null)).toBeNull()
    expect(parseProfileFix('text')).toBeNull()
    expect(parseProfileFix({ role: 'Analyst' })).toBeNull()
    expect(parseProfileFix({ naukriHeadline: 'x' })).toBeNull()
  })

  it('falls back to the first role when role is missing', () => {
    expect(parseProfileFix({ ...MODEL_JSON, role: undefined })!.role).toBe('Data Analyst')
  })

  it('collapses whitespace and caps lengths', () => {
    const fix = parseProfileFix({ ...MODEL_JSON, naukriHeadline: `A\n\n  B ${'x'.repeat(400)}` })!
    expect(fix.naukriHeadline.startsWith('A B ')).toBe(true)
    expect(fix.naukriHeadline.length).toBe(250)
  })
})

describe('guardFacts: only facts already in the resume', () => {
  const cleaned = cleanResume(RESUME).text
  const fix = parseProfileFix(MODEL_JSON) as ProfileFix
  const { fix: out, dropped } = guardFacts(cleaned, fix)

  it('keeps a rewrite whose numbers the resume has', () => {
    expect(out.bullets[1]).toEqual({
      before: 'Built 12 Power BI dashboards used by the risk team.',
      after: 'Built 12 Power BI dashboards that the risk team uses every day.',
      hint: '',
    })
  })

  it('drops a rewrite that invents a number, and keeps the original line', () => {
    expect(out.bullets[0]!.after).toBeNull()
    expect(out.bullets[0]!.before).toBe('Responsible for end-to-end delivery of weekly reports for a banking client.')
    expect(out.bullets[0]!.hint).toBe('Add how many hours a week this saved, if you know it.')
  })

  it('drops a bullet whose "before" is not in the resume at all', () => {
    expect(out.bullets).toHaveLength(2)
    expect(out.bullets.some((b) => b.before.includes('team of 8'))).toBe(false)
  })

  it('cuts the invented part of a headline and keeps the rest', () => {
    expect(out.naukriHeadline).toBe('Data Analyst | SQL, Power BI | 12 dashboards for a banking client')
    expect(out.linkedinHeadline).toBe('Data Analyst | SQL, Power BI, Python')
  })

  it('moves a skill the resume never names to worth showing', () => {
    expect(out.skills).toEqual(['SQL', 'Power BI', 'Excel'])
    expect(out.worthShowing).toEqual(['A/B testing', 'Tableau'])
  })

  it('blanks a role reason that invents a number', () => {
    expect(out.roles[0]!.why).toBe('')
    expect(out.roles[1]!.why).toBe('Built 12 dashboards.')
  })

  it('lets the gap quote a number from the job post, nothing else', () => {
    const withGap = { ...fix, gap: 'This post asks for 5 years of Python.' }
    expect(guardFacts(cleaned, withGap, 'Need 5 years Python').fix.gap).toBe('This post asks for 5 years of Python.')
    expect(guardFacts(cleaned, withGap).fix.gap).toBe('')
  })

  it('records what it dropped', () => {
    expect(dropped).toEqual(['bullet', 'bullet', 'skill', 'headlinePart'])
  })

  it('drops a whole headline when every part is invented', () => {
    const r = guardFacts(cleaned, { ...fix, naukriHeadline: '7 years | 30% growth' })
    expect(r.fix.naukriHeadline).toBe('')
    expect(r.dropped).toContain('naukriHeadline')
  })

  it('drops a hint that asserts an invented number', () => {
    const f = { ...fix, bullets: [{ ...fix.bullets[1]!, hint: 'You saved 20 hours.' }] }
    const r = guardFacts(cleaned, f)
    expect(r.fix.bullets[0]!.hint).toBe('')
    expect(r.dropped).toContain('hint')
  })
})
