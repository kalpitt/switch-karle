import type { Lang } from '../i18n'
import { WHAT_TO_SAY, toolBySlug } from '../data/tools'
import { withLang } from './langPath'

/**
 * Where a link to a tool goes, in the page's language. A What to say situation
 * has no page of its own (decided 2026-11-07): it is the What to say page with
 * that situation picked, named in the hash (`/what-to-say/#buyout-ask`). The
 * hash names a situation, never anything the person typed.
 */
export function toolHref(lang: Lang, slug: string): string {
  return toolBySlug(slug)?.partOf === WHAT_TO_SAY ? `${withLang(lang, WHAT_TO_SAY)}#${slug}` : withLang(lang, slug)
}
