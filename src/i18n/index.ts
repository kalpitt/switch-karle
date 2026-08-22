import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from './en'
import { hi } from './hi'

export type Lang = 'en' | 'hi'

/** All dictionaries. `en` is canonical — every key used in the UI must exist
 * here. `hi` only needs the keys that differ; missing ones fall back to `en`. */
export const dictionaries: Record<Lang, Record<string, string>> = { en, hi }

const STORAGE_KEY = 'switchkarle.lang'

function loadLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

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

export function LangProvider({ children }: { children: ReactNode }) {
  // Always start at English so SSR HTML matches the first client render.
  // Stored preference is applied after mount — writing it in the initializer
  // would hydrate-mismatch, and a save-on-mount of the default would clobber Hindi.
  const [lang, setLang] = useState<Lang>('en')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLang(loadLang())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* storage unavailable (private mode, quota) — language just won't persist */
    }
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang, hydrated])

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
