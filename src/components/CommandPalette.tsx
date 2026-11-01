import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { TOOLS } from '../data/tools'
import { withLang } from '../lib/langPath'
import { filterPalette, paletteItems } from '../lib/palette'
import { useLang, useT } from '../i18n'
import { useDialog } from './useDialog'
import { CloseIcon, SearchIcon } from './icons'

export function CommandPalette() {
  const t = useT()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const id = useId()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useDialog(open, panelRef, () => setOpen(false), inputRef)

  const items = useMemo(() => paletteItems(TOOLS, withLang(lang), (slug) => withLang(lang, slug)), [lang])
  const shown = useMemo(() => filterPalette(items, query, t), [items, query, t])

  // A new query starts from the top hit.
  useEffect(() => setActive(0), [query])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const go = (href: string) => {
    setOpen(false)
    window.location.assign(href)
  }

  // Up/Down move the highlight, Enter opens it: the way every ⌘K palette works.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (shown.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % shown.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + shown.length) % shown.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const hit = shown[Math.min(active, shown.length - 1)]
      if (hit) go(hit.href)
    }
  }

  const optionId = (i: number) => `${id}-opt-${i}`

  return (
    <>
      {/* A magnifier on a phone; a field-shaped button with its shortcut on a wide screen. */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={t('nav.search')}
        className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-xl text-ink-soft transition-colors hover:bg-paper hover:text-ink lg:w-56 lg:justify-start lg:bg-paper lg:px-3 lg:text-[14px] lg:font-medium lg:hover:bg-line"
        onClick={() => setOpen(true)}
      >
        <SearchIcon size={18} />
        <span aria-hidden className="hidden lg:inline">
          {t('nav.search')}
        </span>
        <kbd
          aria-hidden
          className="ml-auto hidden rounded border border-line-strong bg-card px-1.5 font-sans text-[12px] font-medium text-ink-faint lg:inline"
        >
          ⌘K
        </kbd>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            ref={panelRef}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-card shadow-float"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.search')}
          >
            <div className="flex items-center border-b border-line">
              <SearchIcon size={18} className="ml-4 text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('nav.searchHint')}
                aria-label={t('nav.search')}
                role="combobox"
                aria-expanded={shown.length > 0}
                aria-controls={`${id}-list`}
                aria-autocomplete="list"
                aria-activedescendant={shown.length > 0 ? optionId(active) : undefined}
                enterKeyHint="go"
                autoComplete="off"
                className="h-14 min-w-0 flex-1 bg-transparent px-3 text-[16px] outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('nav.close')}
                className="mr-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft hover:bg-paper hover:text-ink"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <p role="status" className="sr-only">
              {query.trim() ? t('nav.searchCount', { n: shown.length }) : ''}
            </p>
            {shown.length === 0 ? (
              <p className="px-5 py-4 text-[14px] leading-relaxed text-ink-soft">
                {t('nav.searchEmpty', { q: query.trim() })}
              </p>
            ) : (
              <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label={t('nav.search')} className="max-h-80 overflow-y-auto p-2">
                {shown.map((item, i) => (
                  <li
                    key={item.slug}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                  >
                    <a
                      href={item.href}
                      tabIndex={-1}
                      className={`relative block rounded-lg px-3 py-2.5 ${i === active ? 'bg-paper before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-saffron-bright' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setOpen(false)}
                    >
                      <span className="block text-[14px] font-semibold">{t(item.titleKey)}</span>
                      <span className="mt-0.5 line-clamp-1 block text-[13px] leading-snug text-ink-soft">{t(item.descKey)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p aria-hidden className="hidden h-9 items-center border-t border-line px-4 text-[12px] text-ink-faint sm:flex">
              {t('nav.searchKeys')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
