import type { Application, Stage } from '../tracker/types'
import { daysBetween } from './dates'

/** One row as an LLM emitted it: every field may be absent or the wrong type. */
export interface RawApplication {
  company?: unknown
  role?: unknown
  appliedOn?: unknown
  source?: unknown
  status?: unknown
  ctcDiscussedLPA?: unknown
}

export interface IngestPayload {
  version: number
  applications: RawApplication[]
}

/** A row that could not be used, and the plain reason why. */
export interface RejectedRow {
  index: number
  company: string | null
  reason:
    | 'no-company'
    | 'unreadable-date'
    | 'out-of-scope'
    | 'duplicate-in-payload'
    | 'already-on-board'
}

export type IngestCandidate = Pick<
  Application,
  'company' | 'role' | 'stage' | 'ctcDiscussedAnnual' | 'source'
>

export interface IngestResult {
  /** Ready to hand to `addApplication`, in payload order. Carries no ids: the store assigns those. */
  accepted: IngestCandidate[]
  rejected: RejectedRow[]
  /** Counts by reason, so a caller can report honestly without walking the list. */
  counts: Record<RejectedRow['reason'], number>
  /** Rows whose status text reads as closed or rejected. A subset of `accepted`, by index into it. */
  likelyClosed: number[]
}

export interface IngestOptions {
  /** ISO yyyy-mm-dd. Required — the engine has no clock. */
  today: string
  /** Rows applied to more than this many days ago are rejected as out-of-scope. Default 60. */
  withinDays?: number
}

const LEGAL_SUFFIX_PAIRS = ['pvt ltd', 'private limited']
const LEGAL_SUFFIX_SINGLES = new Set([
  'ltd',
  'limited',
  'inc',
  'llp',
  'technologies',
  'technology',
  'labs',
])
// 'india' is deliberately NOT stripped. It merges "Siemens India" into
// "Siemens", which is usually right, but it also turns "Bank of India" into
// "bank of" and "Air India" into "air", where the word is part of the name.
// A wrong merge destroys an application the user really made; a missed merge
// leaves two cards they can delete. Same trade as mergeApplications.

/**
 * Keeps letters and numbers in ANY script, not just Latin.
 *
 * The first version stripped `[^a-z0-9]`, which turned every Devanagari name
 * into the empty string. Two different companies then shared the key `::` and
 * the second was dropped as a duplicate. In an app for the Indian job market
 * that is not an edge case.
 *
 * `\p{M}` is not optional here. Indic scripts carry vowels as combining marks,
 * so letters alone turn मोटर्स into "म टर स" — still lossy, and still enough to
 * collide two names that differ only in their matras.
 */
const NON_ALNUM = /[^\p{L}\p{N}\p{M}]+/gu

export function normaliseCompany(company: string): string {
  const cleaned = company.toLowerCase().replace(NON_ALNUM, ' ').trim()
  const words = cleaned.split(' ').filter(Boolean)
  while (words.length > 1) {
    const len = words.length
    if (len >= 2) {
      const lastTwo = `${words[len - 2]} ${words[len - 1]}`
      if (LEGAL_SUFFIX_PAIRS.includes(lastTwo)) {
        words.splice(len - 2, 2)
        continue
      }
    }
    const lastOne = words[len - 1]!
    if (LEGAL_SUFFIX_SINGLES.has(lastOne)) {
      words.pop()
      continue
    }
    break
  }
  return words.join(' ')
}

export function normaliseRole(role: unknown): string {
  if (typeof role !== 'string') return ''
  return role.toLowerCase().replace(NON_ALNUM, ' ').trim().replace(/\s+/g, ' ')
}

const YMD_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/
// The offset is optional: `2026-08-15T10:30:00` is valid ISO 8601 and is what
// an assistant emits when the source email carried no timezone. Rejecting it
// threw away a date the row really had.
const ISO_TIMESTAMP_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

function daysInMonth(y: number, m: number): number {
  return [0, 31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m] ?? 0
}

type ParsedDate =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'valid'; dateIso: string }

function parseAppliedOn(val: unknown): ParsedDate {
  if (val === undefined) {
    return { status: 'absent' }
  }
  if (typeof val !== 'string' || val.trim() === '') {
    return { status: 'invalid' }
  }
  const str = val.trim()
  const ymdMatch = YMD_REGEX.exec(str)
  if (ymdMatch) {
    const y = Number(ymdMatch[1])
    const m = Number(ymdMatch[2])
    const d = Number(ymdMatch[3])
    if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) {
      return { status: 'invalid' }
    }
    const dateIso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { status: 'valid', dateIso }
  }

  const isoMatch = ISO_TIMESTAMP_REGEX.exec(str)
  if (isoMatch) {
    const y = Number(isoMatch[1])
    const m = Number(isoMatch[2])
    const d = Number(isoMatch[3])
    if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) {
      return { status: 'invalid' }
    }
    const date = new Date(str)
    if (isNaN(date.getTime())) {
      return { status: 'invalid' }
    }
    const dateIso = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { status: 'valid', dateIso }
  }

  return { status: 'invalid' }
}

function countUsableFields(raw: RawApplication, parsedDate: ParsedDate): number {
  let count = 0
  if (typeof raw.role === 'string' && raw.role.trim().length > 0) count++
  if (parsedDate.status === 'valid') count++
  if (typeof raw.source === 'string' && raw.source.trim().length > 0) count++
  if (typeof raw.status === 'string' && raw.status.trim().length > 0) count++
  if (
    typeof raw.ctcDiscussedLPA === 'number' &&
    Number.isFinite(raw.ctcDiscussedLPA) &&
    raw.ctcDiscussedLPA > 0
  ) {
    count++
  }
  return count
}

function mapStage(status: unknown): Stage {
  if (typeof status !== 'string') return 'applied'
  const s = status.toLowerCase()
  if (s.includes('offer')) return 'offer'
  if (s.includes('interview')) return 'interviewing'
  if (s.includes('applied') || s.includes('application') || s.includes('submitted')) return 'applied'
  return 'applied'
}

const CLOSED_SUBSTRINGS = ['reject', 'closed', 'not selected', 'no longer', 'unfortunately']

function isLikelyClosed(status: unknown): boolean {
  if (typeof status !== 'string') return false
  const s = status.toLowerCase()
  return CLOSED_SUBSTRINGS.some((sub) => s.includes(sub))
}

export function parseIngestPayload(json: string): IngestPayload {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid ingest payload: not valid JSON.')
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid ingest payload: unexpected structure.')
  }
  const obj = parsed as Record<string, unknown>
  if (obj.version !== 1) {
    throw new Error('Invalid ingest payload: expected version 1.')
  }
  if (!Array.isArray(obj.applications)) {
    throw new Error('Invalid ingest payload: applications must be an array.')
  }
  return {
    version: 1,
    applications: obj.applications as RawApplication[],
  }
}

interface ValidatedRow {
  index: number
  company: string
  raw: RawApplication
  parsedDate: ParsedDate
  normKey: string
  infoScore: number
}

export function ingest(
  payload: IngestPayload,
  existing: Application[],
  options: IngestOptions,
): IngestResult {
  const withinDays = options.withinDays ?? 60
  const counts: Record<RejectedRow['reason'], number> = {
    'no-company': 0,
    'unreadable-date': 0,
    'out-of-scope': 0,
    'duplicate-in-payload': 0,
    'already-on-board': 0,
  }
  const rejected: RejectedRow[] = []

  const rejectRow = (index: number, company: string | null, reason: RejectedRow['reason']) => {
    rejected.push({ index, company, reason })
    counts[reason]++
  }

  const validRows: ValidatedRow[] = []

  // Rules 1, 2, 3 per row in payload order
  for (let i = 0; i < payload.applications.length; i++) {
    const raw = payload.applications[i]!

    // 1. Company is required
    if (typeof raw.company !== 'string' || raw.company.trim().length === 0) {
      rejectRow(i, null, 'no-company')
      continue
    }
    const company = raw.company.trim()

    // 2. Dates are parsed strictly
    const parsedDate = parseAppliedOn(raw.appliedOn)
    if (parsedDate.status === 'invalid') {
      rejectRow(i, company, 'unreadable-date')
      continue
    }

    // 3. Scope. Negative elapsed means the row claims a future application
    // date, which is not real data — an LLM filling a gap, or a year typo.
    // Outside the window in either direction is out of scope.
    if (parsedDate.status === 'valid') {
      const elapsed = daysBetween(parsedDate.dateIso, options.today)
      if (elapsed > withinDays || elapsed < 0) {
        rejectRow(i, company, 'out-of-scope')
        continue
      }
    }

    const normKey = `${normaliseCompany(company)}::${normaliseRole(raw.role)}`
    const infoScore = countUsableFields(raw, parsedDate)

    validRows.push({
      index: i,
      company,
      raw,
      parsedDate,
      normKey,
      infoScore,
    })
  }

  // 4. Deduplicate within the payload
  const groups = new Map<string, ValidatedRow[]>()
  for (const row of validRows) {
    const group = groups.get(row.normKey)
    if (!group) {
      groups.set(row.normKey, [row])
    } else {
      group.push(row)
    }
  }

  const payloadSurvivors: ValidatedRow[] = []
  const duplicateRejections: RejectedRow[] = []

  for (const group of groups.values()) {
    if (group.length === 1) {
      payloadSurvivors.push(group[0]!)
    } else {
      let best = group[0]!
      for (let j = 1; j < group.length; j++) {
        const candidate = group[j]!
        if (candidate.infoScore > best.infoScore) {
          best = candidate
        }
      }
      payloadSurvivors.push(best)
      for (const row of group) {
        if (row !== best) {
          duplicateRejections.push({
            index: row.index,
            company: row.company,
            reason: 'duplicate-in-payload',
          })
        }
      }
    }
  }

  for (const dup of duplicateRejections) {
    rejectRow(dup.index, dup.company, dup.reason)
  }

  // 5. Deduplicate against the board
  const existingKeys = new Set(
    existing.map((app) => `${normaliseCompany(app.company)}::${normaliseRole(app.role)}`),
  )

  const finalSurvivors: ValidatedRow[] = []
  const boardRejections: RejectedRow[] = []

  for (const row of payloadSurvivors) {
    if (existingKeys.has(row.normKey)) {
      boardRejections.push({
        index: row.index,
        company: row.company,
        reason: 'already-on-board',
      })
    } else {
      finalSurvivors.push(row)
    }
  }

  for (const b of boardRejections) {
    rejectRow(b.index, b.company, b.reason)
  }

  // Sort rejected and survivors by payload index
  rejected.sort((a, b) => a.index - b.index)
  finalSurvivors.sort((a, b) => a.index - b.index)

  // Map the survivors
  const accepted: IngestCandidate[] = []
  const likelyClosed: number[] = []

  for (let idx = 0; idx < finalSurvivors.length; idx++) {
    const row = finalSurvivors[idx]!
    const raw = row.raw

    const stage = mapStage(raw.status)
    const role = typeof raw.role === 'string' && raw.role.trim().length > 0 ? raw.role.trim() : ''
    const source =
      typeof raw.source === 'string' && raw.source.trim().length > 0 ? raw.source.trim() : undefined

    let ctcDiscussedAnnual: number | undefined
    if (
      typeof raw.ctcDiscussedLPA === 'number' &&
      Number.isFinite(raw.ctcDiscussedLPA) &&
      raw.ctcDiscussedLPA > 0
    ) {
      ctcDiscussedAnnual = Math.round(raw.ctcDiscussedLPA * 100_000)
    }

    const candidate: IngestCandidate = {
      company: row.company,
      role,
      stage,
      ...(ctcDiscussedAnnual !== undefined ? { ctcDiscussedAnnual } : {}),
      ...(source !== undefined ? { source } : {}),
    }

    if (isLikelyClosed(raw.status)) {
      likelyClosed.push(idx)
    }

    accepted.push(candidate)
  }

  return {
    accepted,
    rejected,
    counts,
    likelyClosed,
  }
}
