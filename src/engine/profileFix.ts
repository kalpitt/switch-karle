/**
 * The callback fixer's pure half (decided 2026-11-26, PRIVACY.md "The callback
 * fixer"). Three jobs, all without a network:
 *
 * 1. `cleanResume` strips contact details before any text leaves the device,
 *    and says what it stripped. The Worker runs it again, so a modified page
 *    cannot send more than this allows.
 * 2. `parseProfileFix` turns the model's JSON into a known shape, or null.
 * 3. `guardFacts` enforces "only facts already in the resume": a rewrite that
 *    carries a number the resume does not have, or a "before" line the resume
 *    does not contain, is dropped; a skill the resume never names moves to
 *    "worth showing". A small model told not to invent will still invent, so
 *    code checks it rather than trusting the prompt.
 *
 * Returns ids and the model's own text. No English of ours lives here.
 */

export const RESUME_MIN_CHARS = 200
export const RESUME_MAX_CHARS = 12_000
export const ROLE_MAX_CHARS = 80
export const JOB_POST_MAX_CHARS = 6_000

export type RemovedKind = 'email' | 'phone' | 'link' | 'pan' | 'aadhaar' | 'dob' | 'address' | 'name'

export interface Removed {
  kind: RemovedKind
  count: number
}

export interface CleanResult {
  text: string
  removed: Removed[]
}

const LINE_RULES: { kind: RemovedKind; re: RegExp }[] = [
  // A labelled date of birth or address is a whole line of identity, not a fact
  // the rewrite needs. Removed line and all.
  { kind: 'dob', re: /^[^\S\n]*(?:d\.?\s?o\.?\s?b\.?|date of birth|born on)\b.*$/gim },
  { kind: 'address', re: /^[^\S\n]*(?:permanent |current |residential |home )?address\s*[:\-–].*$/gim },
]

const INLINE_RULES: { kind: RemovedKind; re: RegExp }[] = [
  { kind: 'email', re: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
  // Links first, so a phone-like run inside a URL is not counted twice.
  {
    kind: 'link',
    re: /\b(?:https?:\/\/|www\.)\S+|\b(?:linkedin\.com|github\.com|naukri\.com|behance\.net|gitlab\.com)\/\S*/gi,
  },
  { kind: 'pan', re: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
  { kind: 'aadhaar', re: /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g },
  // Indian mobiles with or without +91 / 0, spaced or dashed: +91 98765 43210,
  // 098765-43210, (+91) 9876543210, 98765 43210.
  { kind: 'phone', re: /(?<!\d)(?:\(?\+?91\)?[\s-]*|0)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g },
]

/** Words that open a resume but are not a person's name. */
const NOT_A_NAME =
  /\b(?:resume|résumé|curriculum|vitae|cv|profile|summary|objective|experience|education|skills|contact|professional|career|details)\b/i

/**
 * The first non-empty line, when it reads like a name: two to four words,
 * letters and dots only, no digits, short. Most Indian resumes open with the
 * name, and the rewrite never needs it.
 */
function nameLineIndex(lines: string[]): number {
  const i = lines.findIndex((l) => l.trim() !== '')
  if (i === -1) return -1
  const line = lines[i]!.trim()
  if (line.length > 40 || NOT_A_NAME.test(line)) return -1
  const words = line.split(/\s+/)
  if (words.length < 2 || words.length > 4) return -1
  // Names are written capitalised (or in capitals); "Notes on work" is not one.
  return words.every((w) => /^\p{Lu}[\p{L}.'-]*$/u.test(w)) ? i : -1
}

export function cleanResume(raw: string): CleanResult {
  const counts = new Map<RemovedKind, number>()
  const bump = (kind: RemovedKind, n: number) => {
    if (n > 0) counts.set(kind, (counts.get(kind) ?? 0) + n)
  }

  let text = raw.replace(/\r\n?/g, '\n')
  const lines = text.split('\n')
  const nameAt = nameLineIndex(lines)
  if (nameAt !== -1) {
    lines.splice(nameAt, 1)
    bump('name', 1)
    text = lines.join('\n')
  }

  for (const rule of LINE_RULES) {
    bump(rule.kind, text.match(rule.re)?.length ?? 0)
    text = text.replace(rule.re, '')
  }
  for (const rule of INLINE_RULES) {
    bump(rule.kind, text.match(rule.re)?.length ?? 0)
    text = text.replace(rule.re, ' ')
  }

  // Tidy what the removals left: separators with nothing between them, runs of
  // spaces, and more than one blank line in a row.
  text = text
    .split('\n')
    .map((l) =>
      l
        .replace(/[^\S\n]+/g, ' ')
        .replace(/^(?:\s*[|•·,;:/-]\s*)+|(?:\s*[|•·,;:/-]\s*)+$/g, '')
        .trim(),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const order: RemovedKind[] = ['name', 'phone', 'email', 'link', 'address', 'dob', 'pan', 'aadhaar']
  const removed = order.filter((k) => counts.has(k)).map((kind) => ({ kind, count: counts.get(kind)! }))
  return { text, removed }
}

export type ResumeProblem = 'empty' | 'tooShort' | 'tooLong'

/** Checked on the cleaned text, which is what gets sent. */
export function resumeProblem(cleaned: string): ResumeProblem | null {
  const n = cleaned.trim().length
  if (n === 0) return 'empty'
  if (n < RESUME_MIN_CHARS) return 'tooShort'
  if (n > RESUME_MAX_CHARS) return 'tooLong'
  return null
}

// ---------------------------------------------------------------------------
// The model's answer

export type Fit = 'strong' | 'good'

export interface FixRole {
  title: string
  fit: Fit
  why: string
}

export interface FixBullet {
  before: string
  /** Null when `guardFacts` dropped the rewrite: show `before` as it is. */
  after: string | null
  /** A fact worth adding if the person has it, never a placeholder in `after`. */
  hint: string
}

export interface ProfileFix {
  roles: FixRole[]
  /** The role the fixes below are written for. */
  role: string
  naukriHeadline: string
  linkedinHeadline: string
  skills: string[]
  worthShowing: string[]
  bullets: FixBullet[]
  gap: string
  /** Facts the resume lacks that would make it stronger, phrased as questions. */
  missing: string[]
}

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')

const strList = (v: unknown, maxItems: number, maxLen: number): string[] =>
  Array.isArray(v)
    ? [...new Set(v.map((x) => str(x, maxLen)).filter((x) => x !== ''))].slice(0, maxItems)
    : []

/** Naukri's resume headline field and LinkedIn's headline both cap near here. */
export const NAUKRI_HEADLINE_MAX = 250
export const LINKEDIN_HEADLINE_MAX = 220

/**
 * The model's JSON, made safe to render: every field a string of bounded
 * length, every list bounded. Null when the answer is missing the parts a
 * result cannot do without (a role and at least one headline or bullet).
 */
export function parseProfileFix(json: unknown): ProfileFix | null {
  if (typeof json !== 'object' || json === null) return null
  const o = json as Record<string, unknown>

  const roles: FixRole[] = (Array.isArray(o.roles) ? o.roles : [])
    .map((r): FixRole | null => {
      if (typeof r !== 'object' || r === null) return null
      const x = r as Record<string, unknown>
      const title = str(x.title, 60)
      if (title === '') return null
      return { title, fit: x.fit === 'strong' ? 'strong' : 'good', why: str(x.why, 160) }
    })
    .filter((r): r is FixRole => r !== null)
    .slice(0, 3)

  const bullets: FixBullet[] = (Array.isArray(o.bullets) ? o.bullets : [])
    .map((b): FixBullet | null => {
      if (typeof b !== 'object' || b === null) return null
      const x = b as Record<string, unknown>
      const before = str(x.before, 400)
      const after = str(x.after, 400)
      if (before === '' || after === '') return null
      return { before, after, hint: str(x.hint, 160) }
    })
    .filter((b): b is FixBullet => b !== null)
    .slice(0, 3)

  const role = str(o.role, 60) || roles[0]?.title || ''
  const naukriHeadline = str(o.naukriHeadline, NAUKRI_HEADLINE_MAX)
  const linkedinHeadline = str(o.linkedinHeadline, LINKEDIN_HEADLINE_MAX)
  if (role === '' || (naukriHeadline === '' && linkedinHeadline === '' && bullets.length === 0)) return null

  return {
    roles,
    role,
    naukriHeadline,
    linkedinHeadline,
    skills: strList(o.skills, 15, 40),
    worthShowing: strList(o.worthShowing, 5, 40),
    bullets,
    gap: str(o.gap, 300),
    missing: strList(o.missing, 4, 160),
  }
}

// ---------------------------------------------------------------------------
// Only facts already in the resume

/**
 * Number words a model reaches for when it invents ("five years", "a dozen").
 * "one" is left out: it is mostly not a count ("one of the", "one-stop").
 */
const NUMBER_WORDS: Record<string, string> = {
  two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15', sixteen: '16',
  seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20', thirty: '30', forty: '40',
  fifty: '50', hundred: '100', dozen: '12', double: '2', twice: '2', triple: '3', half: '50',
}

/**
 * Every number in a text, normalised: "1,20,000" → "120000", "9.5%" → "9.5",
 * "five" → "5".
 */
export function numbersIn(text: string): Set<string> {
  const out = new Set<string>()
  for (const m of text.toLowerCase().matchAll(/\b[a-z]+\b/g)) {
    const n = NUMBER_WORDS[m[0]]
    if (n !== undefined) out.add(n)
  }
  for (const m of text.matchAll(/\d+(?:[.,]\d+)*/g)) {
    out.add(m[0].replace(/,/g, '').replace(/\.0+$/, ''))
  }
  return out
}

function unsupportedNumber(text: string, allowed: Set<string>): boolean {
  for (const n of numbersIn(text)) if (!allowed.has(n)) return true
  return false
}

const squash = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, ' ')
    .trim()

/**
 * Keep the parts of a "A | B | C" headline whose numbers the resume has. A
 * headline with an invented "12 yrs" loses that part, not the whole line.
 */
function guardHeadline(headline: string, allowed: Set<string>): string {
  const parts = headline.split('|').map((p) => p.trim())
  return parts.filter((p) => p !== '' && !unsupportedNumber(p, allowed)).join(' | ')
}

export type DroppedId = 'naukriHeadline' | 'linkedinHeadline' | 'headlinePart' | 'bullet' | 'gap' | 'skill' | 'hint'

export interface GuardedFix {
  fix: ProfileFix
  /** What the guard took out, for the tests and for honesty on the page. */
  dropped: DroppedId[]
}

export function guardFacts(resume: string, fix: ProfileFix, jobPost = ''): GuardedFix {
  const dropped: DroppedId[] = []
  const allowed = numbersIn(resume)
  const resumeWords = ` ${squash(resume)} `

  const headline = (h: string, id: 'naukriHeadline' | 'linkedinHeadline') => {
    if (h === '') return ''
    const kept = guardHeadline(h, allowed)
    if (kept === '') dropped.push(id)
    else if (kept !== h) dropped.push('headlinePart')
    return kept
  }

  const bullets = fix.bullets.flatMap((b): FixBullet[] => {
    // A "before" the resume does not contain is itself invented.
    if (!resumeWords.includes(` ${squash(b.before)} `)) {
      dropped.push('bullet')
      return []
    }
    let after: string | null = b.after
    if (after !== null && unsupportedNumber(after, allowed)) {
      dropped.push('bullet')
      after = null
    }
    let hint = b.hint
    // A hint may ask for a number; it must not assert one.
    if (hint !== '' && unsupportedNumber(hint, allowed)) {
      dropped.push('hint')
      hint = ''
    }
    return [{ before: b.before, after, hint }]
  })

  const skills: string[] = []
  const worthShowing = [...fix.worthShowing]
  for (const s of fix.skills) {
    if (resumeWords.includes(` ${squash(s)} `)) skills.push(s)
    else {
      dropped.push('skill')
      if (worthShowing.length < 5 && !worthShowing.includes(s)) worthShowing.push(s)
    }
  }

  // The gap may quote the job post ("asks for 5 years"), never an invented figure.
  const gapAllowed = new Set([...allowed, ...numbersIn(jobPost)])
  let gap = fix.gap
  if (gap !== '' && unsupportedNumber(gap, gapAllowed)) {
    dropped.push('gap')
    gap = ''
  }

  return {
    fix: {
      ...fix,
      naukriHeadline: headline(fix.naukriHeadline, 'naukriHeadline'),
      linkedinHeadline: headline(fix.linkedinHeadline, 'linkedinHeadline'),
      skills,
      worthShowing,
      bullets,
      gap,
      roles: fix.roles.map((r) => (unsupportedNumber(r.why, allowed) ? { ...r, why: '' } : r)),
    },
    dropped,
  }
}
