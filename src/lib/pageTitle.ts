import type { ToolDef } from '../data/tools'
import type { Lang } from '../i18n'

/**
 * The brand as each language writes it in a page title. Hindi pages keep the
 * Latin "Switch Karle" too (decided 2026-11-07): one name, wherever it is read.
 */
export const BRAND: Record<Lang, string> = { en: 'Switch Karle', hi: 'Switch Karle' }

/**
 * A tool page's name in the browser tab, before the brand. English pages use
 * the registry's `seoTitle`; Hindi pages use the Hindi tool name the page shows,
 * so the tab, bookmarks and a shared link's preview speak the page's language.
 */
export function toolTitle(def: Pick<ToolDef, 'seoTitle' | 'titleKey'>, lang: Lang, hi: Record<string, string>): string {
  return lang === 'hi' ? (hi[def.titleKey] ?? def.seoTitle) : def.seoTitle
}

/** The whole <title>: a page's name, then the brand. */
export function withBrand(name: string, lang: Lang): string {
  return `${name} — ${BRAND[lang]}`
}
