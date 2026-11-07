import { useEffect, useState } from 'react'
import type { Lang } from '../i18n'
import { useLang, useT } from '../i18n'
import { isHiPath, withLang } from '../lib/langPath'
import { IslandRoot } from './IslandRoot'
import { buttonClass } from './buttonClass'

/**
 * The one 404 page. GitHub Pages serves the same 404.html for every missing URL,
 * English or Hindi, so the language is read from the address once the page is
 * running: a miss under /hi/ gets the Hindi page, header and all.
 */
export default function NotFoundPage() {
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => {
    if (isHiPath(window.location.pathname, import.meta.env.BASE_URL || '/')) setLang('hi')
  }, [])
  return (
    <IslandRoot key={lang} current="404" lang={lang}>
      <NotFound />
    </IslandRoot>
  )
}

function NotFound() {
  const t = useT()
  const { lang } = useLang()
  const other: Lang = lang === 'hi' ? 'en' : 'hi'

  useEffect(() => {
    document.title = t('notFound.docTitle')
  }, [t])

  return (
    <div data-tool="404" className="mx-auto max-w-xl py-10 text-center">
      <p aria-hidden className="font-display text-6xl font-bold tracking-tight text-line-strong">
        404
      </p>
      <h1 className="mt-3 font-display text-[28px] font-bold leading-tight tracking-[-0.02em]">{t('notFound.title')}</h1>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">{t('notFound.body')}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={withLang(lang)}
          className={buttonClass('primary')}
        >
          {t('notFound.home')}
        </a>
        <a
          href={withLang(other)}
          lang={other}
          hrefLang={other}
          className={buttonClass('secondary')}
        >
          {t('notFound.otherHome')}
        </a>
      </div>
      <p className="mt-6 text-[13px] text-ink-soft">{t('notFound.searchHint')}</p>
    </div>
  )
}
