import type { Application, Insight, Stage } from './types'
import type { SweepRecord } from '../engine/coverage'

export const STORAGE_KEY = 'switchkarle.tracker.v1'
export const UNDO_STORAGE_KEY = 'switchkarle.tracker.undo.v1'
export const SWEEPS_STORAGE_KEY = 'switchkarle.sweeps.v1'

function isSweepRecord(v: unknown): v is SweepRecord {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.sweptAt === 'string' &&
    typeof o.windowDays === 'number' &&
    typeof o.added === 'number'
  )
}

/** Every sweep the user has run, oldest first. Corrupted storage reads as none. */
export function loadSweeps(): SweepRecord[] {
  try {
    const raw = localStorage.getItem(SWEEPS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isSweepRecord)
  } catch {
    return []
  }
}

/** Appends one sweep. Returns false when the write did not land. */
export function recordSweep(record: SweepRecord): boolean {
  try {
    const current = loadSweeps()
    const updated = [...current, record]
    localStorage.setItem(SWEEPS_STORAGE_KEY, JSON.stringify(updated))
    return true
  } catch {
    return false
  }
}

/** Same key App.tsx uses for the CTC Decoder's saved offer — kept in sync here for export/import. */
const DECODER_STORAGE_KEY = 'switchkarle.decoder.v1'

export const STAGE_ORDER: Stage[] = ['researching', 'applied', 'interviewing', 'offer', 'decided']

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Read the application list from localStorage. Never throws — corrupted storage
 * → empty list.
 *
 * Every entry is validated, not just the array shape. An application carrying a
 * stage the board cannot render used to crash the whole tracker on load, and
 * because the bad entry was already persisted, every refresh crashed again:
 * a blank screen with no way back in. Filtering here means a board that has
 * already been poisoned recovers on the next load instead of staying dead.
 */
export function load(): Application[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isApplication) : []
  } catch {
    return []
  }
}

/**
 * Persist the application list. Returns false when the write did not land —
 * a full quota, or a browser blocking storage. The caller must surface that:
 * a board that shows unsaved work as saved is the worst failure this app has.
 */
export function save(list: Application[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
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
    appliedOn: partial.appliedOn,
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

/** Pure: appends a new insight to `appId`'s application and bumps updatedAt. No-op for an unknown id. */
export function addInsight(
  list: Application[],
  appId: string,
  insight: Omit<Insight, 'id' | 'savedAt'>,
): Application[] {
  return list.map((a) => {
    if (a.id !== appId) return a
    const ts = nowIso()
    const newInsight: Insight = { ...insight, id: crypto.randomUUID(), savedAt: ts }
    return { ...a, insights: [...(a.insights ?? []), newInsight], updatedAt: ts }
  })
}

/** Pure: removes `insightId` from `appId`'s application and bumps updatedAt. No-op for an unknown id. */
export function removeInsight(list: Application[], appId: string, insightId: string): Application[] {
  return list.map((a) => {
    if (a.id !== appId) return a
    if (!a.insights?.some((i) => i.id === insightId)) return a
    return { ...a, insights: a.insights.filter((i) => i.id !== insightId), updatedAt: nowIso() }
  })
}

/**
 * Pure: merges an incoming list into the current one, without losing anything.
 *
 * Matched by id. An incoming application replaces the current one only when its
 * `updatedAt` is strictly newer. Ids only in the backup are added. Ids only on
 * the board are kept.
 *
 * Consequence worth knowing: restoring a backup taken before a deletion brings
 * the deleted application back. That is the deliberate trade — this function
 * never removes anything, and a surprise reappearance is recoverable while a
 * silent deletion is not.
 */
export function mergeApplications(
  current: Application[],
  incoming: Application[],
): Application[] {
  const incomingMap = new Map(incoming.map((app) => [app.id, app]))
  const merged: Application[] = []

  for (const curr of current) {
    const inc = incomingMap.get(curr.id)
    if (inc) {
      if (inc.updatedAt > curr.updatedAt) {
        merged.push(inc)
      } else {
        merged.push(curr)
      }
      incomingMap.delete(curr.id)
    } else {
      merged.push(curr)
    }
  }

  for (const inc of incomingMap.values()) {
    merged.push(inc)
  }

  return merged
}

export interface BackupBundle {
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

/** Parses and validates a backup JSON string. Throws on anything that is not a valid bundle. */
export function parseBackup(json: string): BackupBundle {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid backup file: not valid JSON.')
  }
  if (!isBackupBundle(parsed)) {
    throw new Error('Invalid backup file: unexpected structure.')
  }
  return parsed
}

/** Snapshots the current board so the next restore or merge can be undone once. */
export function snapshotForUndo(): void {
  try {
    const current = localStorage.getItem(STORAGE_KEY)
    if (current) {
      localStorage.setItem(UNDO_STORAGE_KEY, current)
    } else {
      localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify([]))
    }
  } catch {
    /* an undo snapshot that cannot be written must not block the restore */
  }
}

/**
 * Restores the snapshot and clears it. Returns null when there is nothing to
 * undo, and also when the write back failed — in that case the snapshot is
 * left in place so the user can try again. An undo that reports success
 * without landing is the same lie this increment exists to remove.
 */
export function undoLastRestore(): Application[] | null {
  try {
    const raw = localStorage.getItem(UNDO_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? (parsed as Application[]) : []
    if (!save(list)) return null
    localStorage.removeItem(UNDO_STORAGE_KEY)
    return list
  } catch {
    try {
      localStorage.removeItem(UNDO_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}

/** True when an undo snapshot is available. */
export function hasUndo(): boolean {
  try {
    return localStorage.getItem(UNDO_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/**
 * Replaces both stores from an already-parsed bundle. Destructive by name now,
 * not by surprise. Returns false if either write failed.
 */
export function restoreAll(bundle: BackupBundle): boolean {
  snapshotForUndo()
  let ok = true
  if (bundle.decoder !== null && bundle.decoder !== undefined) {
    try {
      localStorage.setItem(DECODER_STORAGE_KEY, JSON.stringify(bundle.decoder))
    } catch {
      ok = false
    }
  }
  if (!save(bundle.tracker)) {
    ok = false
  }
  return ok
}

/**
 * Merges a parsed bundle's applications into the current board.
 *
 * Deliberately leaves the saved Decoder offer alone. Merge is offered to the
 * user as "keeps everything on your board"; silently replacing the offer they
 * built in the Decoder would make that sentence false. Only `restoreAll` — the
 * button that says it discards — touches it.
 *
 * Returns false if the write failed.
 */
export function mergeBackup(bundle: BackupBundle): boolean {
  snapshotForUndo()
  return save(mergeApplications(load(), bundle.tracker))
}

function isBackupBundle(v: unknown): v is BackupBundle {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  if (o.version !== 1) return false
  if (!Array.isArray(o.tracker)) return false
  return o.tracker.every(isApplication)
}

const KNOWN_STAGES: ReadonlySet<string> = new Set(STAGE_ORDER)

function isApplication(v: unknown): v is Application {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.company === 'string' &&
    typeof o.role === 'string' &&
    // The stage must be one the board can render. `typeof === 'string'` was not
    // enough: the tracker groups by stage into a fixed five-key object, so an
    // unknown stage threw on an undefined bucket and took the page with it.
    typeof o.stage === 'string' &&
    KNOWN_STAGES.has(o.stage) &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string'
  )
}
