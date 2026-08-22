import { useEffect, useMemo, useRef, useState } from 'react'
import { TOOLS } from '../data/tools'
import { withLang } from '../lib/langPath'
import { filterPalette, paletteItems } from '../lib/palette'
import { useLang, useT } from '../i18n'

export function CommandPalette() {
  const t = useT()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    inputRef.current?.focus()
  }, [open])

  const items = useMemo(() => paletteItems(TOOLS, withLang(lang), (slug) => withLang(lang, slug)), [lang])
  const shown = useMemo(() => filterPalette(items, query, t), [items, query, t])

  return (
    <>
      <button
        type="button"
        className="rounded-full border border-line bg-card px-4 py-1.5 text-[13px] font-bold text-ink-soft"
        onClick={() => setOpen(true)}
      >
        {t('nav.search')}
        <span className="ml-2 hidden font-semibold text-ink-faint sm:inline">⌘K</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-paper shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={t('nav.search')}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('nav.searchHint')}
              className="w-full border-b border-line bg-transparent px-4 py-3 text-[15px] outline-none"
            />
            <ul className="max-h-80 overflow-y-auto p-2">
              {shown.length === 0 && <li className="px-3 py-2 text-[13px] text-ink-soft">{t('nav.searchEmpty')}</li>}
              {shown.map((item) => (
                <li key={item.slug}>
                  <a
                    href={item.href}
                    className="block rounded-xl px-3 py-2 hover:bg-card"
                    onClick={() => setOpen(false)}
                  >
                    <span className="block text-[14px] font-bold">{t(item.titleKey)}</span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-ink-soft">{t(item.descKey)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
