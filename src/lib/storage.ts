/**
 * Versioned localStorage for Switch Karle tools.
 * Keys are `switchkarle.<tool>.v<N>`. A shape change is a version bump plus
 * an explicit migrate — never a silent rename of fields in the same key.
 */
export type StorageKey = `switchkarle.${string}.v${number}`

/**
 * A tool boots by reading its key and echoing what it loaded straight back
 * (`setDraft(readJson(...))` followed by a save effect on every change,
 * including the first one). When that read found nothing, the echo is the
 * tool's own defaults — not anything the user chose — so the write that
 * follows must not create the key. Every write after that first one behaves
 * exactly as it does today.
 *
 * Tracked by shape, not by value: comparing the echoed value against a
 * remembered default string only worked for tools that pass their real
 * default as the `readJson` fallback, and silently kept re-seeding the rest.
 */
const readOnce = new Set<string>()
const bootEcho = new Set<string>()

/** Record the first read of `key` this page load. `found` = a stored value existed. */
export function noteBootRead(key: string, found: boolean): void {
  if (readOnce.has(key)) return // only the boot read arms it; a later
  readOnce.add(key) // re-read must never re-arm and swallow a real user write
  if (!found) bootEcho.add(key)
}

/** True once, for the write that echoes a boot read which found nothing. Consumes the mark. */
export function isBootEchoWrite(key: string): boolean {
  return bootEcho.delete(key)
}

/**
 * Test-only: forgets every key this module has seen a boot read for. A real
 * page load gets a fresh module instance, so `readOnce`/`bootEcho` start
 * empty; a test file reuses the same module across every `it()`, so without
 * this a key armed — or consumed — by one test would leak into the next one
 * that happens to reuse the same storage key.
 */
export function resetBootEchoForTests(): void {
  readOnce.clear()
  bootEcho.clear()
}

export function readJson<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) {
      noteBootRead(key, false)
      return fallback
    }
    const parsed = JSON.parse(raw) as T
    noteBootRead(key, true)
    return parsed
  } catch {
    // getItem threw, or the stored value was not valid JSON — either way the
    // tool falls back to its own defaults, so this read counts as empty, not
    // as a value the user actually has.
    noteBootRead(key, false)
    return fallback
  }
}

export function writeJson(key: StorageKey, value: unknown): boolean {
  try {
    // Skip the boot echo — see the comment above `readOnce`. Returning false
    // is the truth: nothing is stored. Re-check `getItem` rather than trusting
    // the mark alone, in case the key gained a real value since the boot read
    // (another tab, an import) that this write would otherwise clobber.
    if (isBootEchoWrite(key) && localStorage.getItem(key) == null) return false
    localStorage.setItem(key, JSON.stringify(value))
    return localStorage.getItem(key) != null
  } catch {
    /* private mode / quota — tool just will not persist */
    return false
  }
}

/**
 * If `to` is empty, read `from`, run `map`, write `to`, delete `from`.
 * If `to` already has data, leave `from` alone (the new version won).
 * The old key is removed only after the new key is confirmed written —
 * a quota/private-mode failure must not destroy the only copy.
 */
export function migrateJson<T>(
  from: StorageKey,
  to: StorageKey,
  map: (old: unknown) => T,
  fallback: T,
): T {
  const existing = readJson<T | typeof SENTINEL>(to, SENTINEL)
  if (existing !== SENTINEL) return existing as T
  try {
    const raw = localStorage.getItem(from)
    if (raw == null) return fallback
    const next = map(JSON.parse(raw))
    // The readJson probe above found `to` empty too, and armed a boot-echo
    // skip for it. This write is a real migration, not a tool echoing its own
    // defaults, so clear the mark before writeJson can see it — otherwise a
    // migration into an untouched `to` key would be silently dropped.
    isBootEchoWrite(to)
    if (!writeJson(to, next)) return next
    localStorage.removeItem(from)
    return next
  } catch {
    return fallback
  }
}

const SENTINEL = Symbol('empty')
