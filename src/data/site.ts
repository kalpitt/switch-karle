/**
 * Whether visitors are offered the Hindi site (decided by Kalpit, 2026-11-19).
 *
 * Off during the front-door rebuild: the English site and its words are
 * finished first, then Hindi is switched back on as one translation pass. While
 * it is off, no English page links to Hindi (no language toggle, no "हिन्दी"
 * link on the 404). The `/hi/` pages still build, stay in the sitemap and
 * `hreflang`, and are tested, so switching back on is the translation plus this
 * flag. What still needs Hindi is listed in `src/i18n/hi-pending.ts`.
 */
export const HINDI_ON: boolean = false
