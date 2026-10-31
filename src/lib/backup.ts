/**
 * Backing up and restoring everything Switch Karle saved in this browser.
 *
 * The file is built on the device and saved to it; nothing leaves the device.
 * It covers every `switchkarle.*` key by the same prefix sweep the erase button
 * uses, so a tool added later is backed up without anyone adding it to a list.
 *
 * Values are kept as the exact strings localStorage holds. That is lossless
 * for every key (most are JSON, the language key is a bare word), and a
 * restore puts back byte-for-byte what was there.
 */
import { STORAGE_PREFIX, savedKeys } from './erase'

export const BACKUP_APP = 'switch-karle'

export interface FullBackup {
  app: typeof BACKUP_APP
  version: 2
  /** ISO timestamp, for the user's own reference. */
  exportedAt: string
  keys: Record<string, string>
}

/** Every saved key and its raw value. Blocked storage reads as empty. */
export function collectSaved(): Record<string, string> {
  const keys: Record<string, string> = {}
  for (const key of savedKeys()) {
    try {
      const value = localStorage.getItem(key)
      if (value != null) keys[key] = value
    } catch {
      /* unreadable key: left out rather than written as something it is not */
    }
  }
  return keys
}

export function exportEverything(now: Date = new Date()): string {
  const bundle: FullBackup = {
    app: BACKUP_APP,
    version: 2,
    exportedAt: now.toISOString(),
    keys: collectSaved(),
  }
  return JSON.stringify(bundle, null, 2)
}

const TRACKER_KEY = 'switchkarle.tracker.v1'
const DECODER_KEY = 'switchkarle.decoder.v1'

/**
 * Reads a backup file into `{ key: rawValue }`. Accepts this file (version 2)
 * and the tracker's older export (version 1: `{ version, decoder, tracker }`).
 * Keys outside the `switchkarle.` prefix are dropped, so a file can never
 * write into another site's storage on this origin. Throws on anything else.
 */
export function parseEverything(json: string): Record<string, string> {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid backup file: not valid JSON.')
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Invalid backup file: unexpected structure.')
  }
  const o = parsed as Record<string, unknown>
  if (o.version === 2 && o.app === BACKUP_APP && typeof o.keys === 'object' && o.keys !== null) {
    const out: Record<string, string> = {}
    for (const [k, v] of Object.entries(o.keys as Record<string, unknown>)) {
      if (k.startsWith(STORAGE_PREFIX) && typeof v === 'string') out[k] = v
    }
    return out
  }
  if (o.version === 1 && Array.isArray(o.tracker)) {
    const out: Record<string, string> = { [TRACKER_KEY]: JSON.stringify(o.tracker) }
    if (o.decoder !== null && o.decoder !== undefined) out[DECODER_KEY] = JSON.stringify(o.decoder)
    return out
  }
  throw new Error('Invalid backup file: unexpected structure.')
}

/** How many of the file's keys already hold something in this browser. */
export function countOverlap(incoming: Record<string, string>): number {
  const here = new Set(savedKeys())
  return Object.keys(incoming).filter((k) => here.has(k)).length
}

export interface RestoreResult {
  /** Keys written and read back equal. */
  written: string[]
  /** Keys that were meant to be written and are not there afterwards. */
  failed: string[]
}

/**
 * Writes the file's keys. `keepExisting` leaves every key already in this
 * browser alone and only fills the missing ones; otherwise the file's copy
 * wins for every key it holds. Keys the file does not mention are never
 * touched. Each write is read back: a restore never reports a write that did
 * not land.
 */
export function restoreEverything(incoming: Record<string, string>, keepExisting: boolean): RestoreResult {
  const here = new Set(savedKeys())
  const written: string[] = []
  const failed: string[] = []
  for (const [key, value] of Object.entries(incoming)) {
    if (keepExisting && here.has(key)) continue
    try {
      localStorage.setItem(key, value)
    } catch {
      /* the read-back decides */
    }
    let landed = false
    try {
      landed = localStorage.getItem(key) === value
    } catch {
      landed = false
    }
    ;(landed ? written : failed).push(key)
  }
  return { written, failed }
}
