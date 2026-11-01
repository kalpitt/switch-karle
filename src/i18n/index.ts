import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { englishPath, hindiPath } from '../lib/langPath'

export type Lang = 'en' | 'hi'

/**
 * `en` is canonical. Hindi is `hi.ts` (frozen chrome) plus `hi-suite.ts`
 * (suite tools). `translate()` still falls back to English if a key is missing.
 *
 * In the browser only the page's own language is downloaded: an English page
 * never fetches the Hindi strings and a Hindi page never fetches the English
 * ones (the i18n freeze test guarantees every English key has a Hindi pair, so
 * a Hindi page needs no English fallback). The page language comes from
 * `<html lang>`, which the layout renders on the server. The top-level await
 * below finishes before any island hydrates, so the first client render has
 * the same strings the server rendered. On the server and in tests both load.
 * The language toggle navigates to the other language's URL, which loads that
 * language; `setLang` also loads it on demand if it ever switches in place.
 */
export const dictionaries: Record<Lang, Record<string, string>> = { en: {}, hi: {} }
const loaded = new Set<Lang>()

async function loadDictionary(lang: Lang): Promise<void> {
  if (loaded.has(lang)) return
  dictionaries[lang] = lang === 'hi' ? (await import('./hi-dictionary')).hiDictionary : (await import('./en')).en
  loaded.add(lang)
}

const pageLang: Lang | null =
  typeof document === 'undefined' ? null : document.documentElement.lang === 'hi' ? 'hi' : 'en'
if (pageLang) await loadDictionary(pageLang)
else await Promise.all([loadDictionary('en'), loadDictionary('hi')])

const STORAGE_KEY = 'switchkarle.lang.v1'

/** Replace `{name}` placeholders in `template` with values from `vars`. Any
 * placeholder without a matching var is left untouched (never throws). */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match))
}

/** Pure lookup: `dict[key]`, falling back to English, then to the raw key
 * itself so a missing translation never renders as blank. */
export function translate(
  dict: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const raw = dict[key] ?? dictionaries.en[key] ?? key
  return interpolate(raw, vars)
}

/**
 * For the engine-owned red-flag copy (src/engine/redFlags.ts stays English-
 * canonical so its tests never change): in Hindi, use a `flag.*` override
 * from the hi dictionary if one exists; otherwise fall back to the exact
 * English string the engine already built (never the raw key).
 */
export function translateOrFallback(
  lang: Lang,
  key: string,
  fallback: string,
  vars?: Record<string, string | number>,
): string {
  if (lang !== 'hi') return fallback
  const template = dictionaries.hi[key]
  return template ? interpolate(template, vars) : fallback
}

interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children, initialLang = 'en' }: { children: ReactNode; initialLang?: Lang }) {
  // SSR and the first client render must match. Hindi routes pass initialLang="hi".
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback(
    (next: Lang) => {
      // Written here and only here: on a language the user actually picked.
      // Writing it on every mount instead left a saved key behind for a visitor
      // who had chosen nothing, so the erase dialog opened on someone's first
      // page saying one item was saved. Nothing persists unless the user chose
      // persistence — the language toggle is that choice.
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* storage unavailable (private mode, quota) — language just won't persist */
      }
      if (typeof window !== 'undefined') {
        const base = import.meta.env.BASE_URL || '/'
        const target = next === 'hi' ? hindiPath(window.location.pathname, base) : englishPath(window.location.pathname, base)
        if (target !== window.location.pathname) {
          window.location.assign(target)
          return
        }
      }
      void loadDictionary(next).then(() => setLangState(next))
    },
    [],
  )

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  return createElement(LangContext.Provider, { value: { lang, setLang } }, children)
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LangProvider')
  return ctx
}

/** `t(key, vars?)` bound to the current language, with EN fallback for any
 * missing key and `{var}` interpolation. */
export function useT() {
  const { lang } = useLang()
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(dictionaries[lang], key, vars),
    [lang],
  )
}
