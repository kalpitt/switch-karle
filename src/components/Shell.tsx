import type { MouseEvent, ReactNode } from 'react'
import { useEffect } from 'react'
import type { Lang } from '../i18n'
import { useLang, useT } from '../i18n'
import { TOOLS } from '../data/tools'
import { RULES_LAST_VERIFIED } from '../data/rules'
import { formatLongDate } from '../lib/formatDate'
import { withLang } from '../lib/langPath'
import { CommandPalette } from './CommandPalette'
import { EraseData } from './EraseData'
import { BackupData } from './BackupData'

export function Shell({ current, children }: { current: string; children: ReactNode }) {
  const t = useT()
  const { lang, setLang } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  // Tool pages name themselves: the tool is the page's <h1>, the brand is a link.
  // Before this, every page's only <h1> was "Switch Karle" and a visitor landing on
  // /gratuity/ was never told what the page was called.
  const tool = current === 'home' ? undefined : TOOLS.find((x) => x.slug === current)
  const Brand = tool || current === '404' ? 'p' : 'h1'
  // The page this one is a twin of. The 404 has no twin, so its toggle goes home.
  const slug = tool ? tool.slug : current === 'home' || current === '404' ? '' : current
  const pick = current === '404' ? undefined : setLang

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-[14px] focus:font-bold focus:text-white"
      >
        {t('app.skipToContent')}
      </a>
      <header className="no-print mb-6">
        <a href={withLang(lang)} className="inline-block">
          <Brand lang="en" className="text-2xl font-extrabold tracking-tight">
            Switch <span className="font-semibold text-ink-soft">Karle</span>
          </Brand>
        </a>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <nav
            aria-label={t('nav.main')}
            className="inline-flex max-w-full flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1.5 rounded-full border border-line bg-card p-1"
          >
            <NavLink href={withLang(lang)} active={current === 'home'}>
              {t('nav.home')}
            </NavLink>
            {TOOLS.filter((tool) => ['decoder', 'tracker', 'prompts'].includes(tool.slug)).map((tool) => (
              <NavLink key={tool.slug} href={withLang(lang, tool.slug)} active={current === tool.slug}>
                {t(tool.titleKey)}
              </NavLink>
            ))}
          </nav>

          <CommandPalette />

          <div
            role="group"
            aria-label={t('app.langToggle.label')}
            className="inline-flex gap-1.5 rounded-full border border-line bg-card p-1"
          >
            <LangLink to="en" label="English" current={lang} slug={slug} onPick={pick}>
              EN
            </LangLink>
            <LangLink to="hi" label="हिन्दी (Hindi)" current={lang} slug={slug} onPick={pick}>
              हिन्दी
            </LangLink>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {tool && (
          <div className="mb-6">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
              {t(tool.titleKey)}
            </h1>
            <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">{t(tool.descKey)}</p>
          </div>
        )}
        {children}
      </main>

      <footer className="no-print mt-10 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf">
          <span aria-hidden>●</span> {t('app.privacyBadge')}
        </p>
        <br />
        {t('app.footer.rules')} <span className="font-semibold">{t('app.footer.privacy')}</span>
        <br />
        <span className="mt-1 inline-flex items-center rounded-full border border-line bg-card px-2.5 py-0.5 font-semibold text-ink-soft">
          {t('app.footer.verified', { date: formatLongDate(RULES_LAST_VERIFIED, lang) })}
        </span>
        <br />
        {t('app.footer.feedback')}{' '}
        <a href="mailto:tiwari.kalpit@gmail.com" className="inline-block py-3 font-semibold underline">
          {t('app.footer.feedbackEmail')}
        </a>{' '}
        ·{' '}
        <a
          href="https://github.com/kalpitt/switch-karle/issues"
          target="_blank"
          rel="noreferrer"
          className="inline-block py-3 font-semibold underline"
        >
          GitHub
        </a>
        <br />
        <span className="inline-flex flex-wrap items-center gap-x-1.5">
          <BackupData className="inline-block min-h-[44px] py-3 font-semibold text-ink-soft underline" />
          <span aria-hidden>·</span>
          <EraseData className="inline-block min-h-[44px] py-3 pr-2 font-semibold text-alarm underline" />
        </span>
      </footer>
    </div>
  )
}

const PILL = 'inline-flex min-h-[44px] shrink-0 items-center rounded-full px-4 text-[13px] font-bold transition-colors'

function NavLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`${PILL} ${active ? 'bg-saffron text-white' : 'text-ink-soft hover:text-ink'}`}
    >
      {children}
    </a>
  )
}

/**
 * The language switch is navigation to the twin page, so it is a link: it works
 * before hydration, can be opened in a new tab, and tells a screen reader which
 * language is current. A plain click goes through `onPick` so the choice is saved.
 */
function LangLink({
  to,
  label,
  current,
  slug,
  onPick,
  children,
}: {
  to: Lang
  label: string
  current: Lang
  slug: string
  onPick?: (lang: Lang) => void
  children: string
}) {
  const active = current === to
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!onPick || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (!active) onPick(to)
  }
  return (
    <a
      href={withLang(to, slug)}
      hrefLang={to}
      lang={to}
      aria-label={label}
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
      className={`${PILL} ${active ? 'bg-saffron text-white' : 'text-ink-soft hover:text-ink'}`}
    >
      {children}
    </a>
  )
}
