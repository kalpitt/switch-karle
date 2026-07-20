import type { Application, Stage } from './types'

export const STORAGE_KEY = 'chhalaang.tracker.v1'

/** Same key App.tsx uses for the CTC Decoder's saved offer — kept in sync here for export/import. */
const DECODER_STORAGE_KEY = 'chhalaang.decoder.v1'

export const STAGE_ORDER: Stage[] = ['researching', 'applied', 'interviewing', 'offer', 'decided']

function nowIso(): string {
  return new Date().toISOString()
}

/** Read the application list from localStorage. Never throws — corrupted storage → empty list. */
export function load(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Application[]) : []
  } catch {
    return []
  }
}

/** Persist the application list to localStorage. */
export function save(list: Application[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export type NewApplication = Pick<Application, 'company' | 'role'> &
  Partial<Omit<Application, 'id' | 'company' | 'role' | 'createdAt' | 'updatedAt'>>

/** Pure: returns a new list with a new application appended (company + role required, rest optional). */
export function addApplication(list: Application[], partial: NewApplication): Application[] {
  const ts = nowIso()
  const app: Application = {
    id: crypto.randomUUID(),
    company: partial.company,
    role: partial.role,
    stage: partial.stage ?? 'researching',
    ctcDiscussedAnnual: partial.ctcDiscussedAnnual,
    noticePeriodDays: partial.noticePeriodDays,
    source: partial.source,
    nextAction: partial.nextAction,
    nextActionDate: partial.nextActionDate,
    notes: partial.notes,
    createdAt: ts,
    updatedAt: ts,
  }
  return [...list, app]
}

/** Pure: returns a new list with `id`'s application patched and updatedAt bumped. */
export function updateApplication(
  list: Application[],
  id: string,
  patch: Partial<Omit<Application, 'id' | 'createdAt'>>,
): Application[] {
  return list.map((a) => (a.id === id ? { ...a, ...patch, id: a.id, updatedAt: nowIso() } : a))
}

/** Pure: returns a new list with `id`'s application removed. */
export function removeApplication(list: Application[], id: string): Application[] {
  return list.filter((a) => a.id !== id)
}

/** Pure: moves `id`'s application one stage forward (dir=1) or back (dir=-1), clamped at the ends. */
export function moveStage(list: Application[], id: string, dir: -1 | 1): Application[] {
  return list.map((a) => {
    if (a.id !== id) return a
    const idx = STAGE_ORDER.indexOf(a.stage)
    const next = Math.min(STAGE_ORDER.length - 1, Math.max(0, idx + dir))
    if (next === idx) return a
    return { ...a, stage: STAGE_ORDER[next], updatedAt: nowIso() }
  })
}

interface BackupBundle {
  version: 1
  /** Whatever is stored under the decoder's localStorage key — opaque to the tracker. */
  decoder: unknown
  tracker: Application[]
}

/** Bundles both the decoder's saved offer and the tracker's applications into one backup JSON string. */
export function exportAll(): string {
  let decoder: unknown = null
  try {
    const raw = localStorage.getItem(DECODER_STORAGE_KEY)
    decoder = raw ? JSON.parse(raw) : null
  } catch {
    decoder = null
  }
  const bundle: BackupBundle = { version: 1, decoder, tracker: load() }
  return JSON.stringify(bundle, null, 2)
}

/** Restores both stores from a backup JSON string. Throws on anything that isn't a valid bundle. */
export function importAll(json: string): void {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid backup file: not valid JSON.')
  }
  if (!isBackupBundle(parsed)) {
    throw new Error('Invalid backup file: unexpected structure.')
  }
  if (parsed.decoder !== null && parsed.decoder !== undefined) {
    localStorage.setItem(DECODER_STORAGE_KEY, JSON.stringify(parsed.decoder))
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.tracker))
}

function isBackupBundle(v: unknown): v is BackupBundle {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  if (o.version !== 1) return false
  if (!Array.isArray(o.tracker)) return false
  return o.tracker.every(isApplication)
}

function isApplication(v: unknown): v is Application {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.company === 'string' &&
    typeof o.role === 'string' &&
    typeof o.stage === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string'
  )
}
