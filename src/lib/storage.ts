/**
 * Versioned localStorage for Switch Karle tools.
 * Keys are `switchkarle.<tool>.v<N>`. A shape change is a version bump plus
 * an explicit migrate — never a silent rename of fields in the same key.
 */
export type StorageKey = `switchkarle.${string}.v${number}`

export function readJson<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: StorageKey, value: unknown): boolean {
  try {
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
    if (!writeJson(to, next)) return next
    localStorage.removeItem(from)
    return next
  } catch {
    return fallback
  }
}

const SENTINEL = Symbol('empty')
