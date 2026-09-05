/**
 * Erasing everything Switch Karle has saved in this browser.
 *
 * Scoped by key prefix, never `localStorage.clear()`. The site ships from an
 * origin it does not own alone (`kalpit.me/switch-karle/`), where `clear()`
 * would take a neighbouring project's data with it. Scanning the prefix also
 * means a tool added later is erased without anyone remembering to add its key
 * to a list here — a list like that drifts, and a key missed by a drifted list
 * is a saved salary number the user was told had been erased.
 *
 * Scope is deliberately localStorage only. That is where every number, date and
 * letter draft the user types is kept. The PWA precache holds site assets, not
 * user input, and the service worker re-registers on the next page load anyway.
 */
export const STORAGE_PREFIX = 'switchkarle.'

export interface EraseResult {
  /** Keys confirmed gone by reading them back after the delete. */
  removed: string[]
  /** Keys that were there and still are. Non-empty means the button lied. */
  failed: string[]
}

/** Every key this site has saved in this browser. Blocked storage reads as none. */
export function savedKeys(): string[] {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key != null && key.startsWith(STORAGE_PREFIX)) keys.push(key)
    }
    return keys
  } catch {
    return []
  }
}

/** How many saved items the erase dialog is about to remove. */
export function savedCount(): number {
  return savedKeys().length
}

/**
 * Removes every saved key, then reads each one back.
 *
 * The read-back is the point. A private-mode or quota-locked browser can accept
 * `removeItem` and keep the value, and this app's standing rule is that it never
 * reports a storage write it has not confirmed — an erase that says "gone" over
 * a salary number still on the disk is the one failure this button must not have.
 */
export function eraseAll(): EraseResult {
  const removed: string[] = []
  const failed: string[] = []
  // Snapshot first: removing while iterating localStorage by index skips keys.
  for (const key of savedKeys()) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* the read-back below decides, not the throw */
    }
    let stillThere: boolean
    try {
      stillThere = localStorage.getItem(key) !== null
    } catch {
      stillThere = true
    }
    if (stillThere) {
      failed.push(key)
    } else {
      removed.push(key)
    }
  }
  return { removed, failed }
}
