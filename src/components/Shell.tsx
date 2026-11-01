import type { MouseEvent, ReactNode } from 'react'
import { useEffect } from 'react'
import type { Lang } from '../i18n'
import { useLang, useT } from '../i18n'
import { TOOLS } from '../data/tools'
import { verifiedRange } from '../data/sources'
import { INFO_PAGES, SOURCE_CODE_URL, type InfoPage } from '../data/infoPages'
import { formatLongDate } from '../lib/formatDate'
import { withLang } from '../lib/langPath'
import { CommandPalette } from './CommandPalette'
import { EraseData } from './EraseData'
import { BackupData } from './BackupData'
import { LogoMark, ShieldCheck } from './icons'

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
  // The pages about the site name themselves with their own <h1>, like tools do.
  const infoPage = (INFO_PAGES as readonly string[]).includes(current)
  const Brand = tool || infoPage || current === '404' ? 'p' : 'h1'
  // The page this one is a twin of. The 404 has no twin, so its toggle goes home.
  const slug = tool ? tool.slug : current === 'home' || current === '404' ? '' : current
  const pick = current === '404' ? undefined : setLang
  const checked = verifiedRange()

  return (
    <div>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-3 focus:text-[14px] focus:font-bold focus:text-white"
      >
        {t('app.skipToContent')}
      </a>
      {/* One compact bar (VIS-04): mark and name, then the tabs, then search and language.
          On a phone the tabs take a second 44px row; from md up it is one 56px row that
          stays at the top while the page scrolls. */}
      <header className="no-print relative z-30 border-b border-line bg-card md:sticky md:top-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4 sm:px-6">
          <a href={withLang(lang)} className="order-1 -ml-1 inline-flex h-14 items-center gap-2 px-1">
            <LogoMark size={24} />
            <Brand lang="en" className="font-display text-[19px] font-bold leading-none tracking-[-0.01em] text-ink">
              Switch Karle
            </Brand>
          </a>

          <div className="order-2 ml-auto flex items-center gap-2 md:order-3">
            <CommandPalette />
            <div role="group" aria-label={t('app.langToggle.label')} className="inline-flex rounded-xl bg-paper p-0">
              <LangLink to="en" label="English" current={lang} slug={slug} onPick={pick}>
                EN
              </LangLink>
              <LangLink to="hi" label="हिन्दी (Hindi)" current={lang} slug={slug} onPick={pick}>
                हिन्दी
              </LangLink>
            </div>
          </div>

          <nav
            aria-label={t('nav.main')}
            className="order-3 -mx-4 flex w-[calc(100%+2rem)] flex-nowrap overflow-x-auto border-t border-line px-2 [scrollbar-width:none] sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-4 md:order-2 md:mx-0 md:w-auto md:border-t-0 md:px-0 [&::-webkit-scrollbar]:hidden"
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
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 pb-16 pt-6 outline-none sm:px-6 sm:pt-10">
        {tool && (
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[36px]">
              {t(tool.titleKey)}
            </h1>
            <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">{t(tool.descKey)}</p>
          </div>
        )}
        {children}
      </main>

      {/* VIS-19: the trust claim leads on the left; the links sit in one list on the right. */}
      <footer className="no-print border-t border-line bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 text-[14px] leading-relaxed text-ink-soft sm:grid-cols-[3fr_2fr] sm:px-6">
          <div>
            <p className="flex items-start gap-2 text-[14px] font-semibold leading-snug text-ink">
              <ShieldCheck size={18} className="mt-px text-leaf" />
              {t('app.privacyBadge')}
            </p>
            <p className="mt-3 max-w-[60ch]">
              {t('app.footer.rules')} {t('app.footer.privacy')}
            </p>
            {/* The dates come from the sources registry: the oldest and newest check of a
                verified rule. One hand-set date for the whole site could not be true. */}
            <a
              href={withLang(lang, 'sources')}
              className="inline-flex min-h-[44px] items-center font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            >
              {t('app.footer.verified', { from: formatLongDate(checked.from, lang), to: formatLongDate(checked.to, lang) })}
            </a>
            <p>
              <a href={withLang(lang, 'about')} className={FOOT_INLINE}>
                {t('app.footer.madeBy')}
              </a>{' '}
              {t('app.footer.feedback')}{' '}
              <a href="mailto:tiwari.kalpit@gmail.com" className={FOOT_INLINE}>
                {t('app.footer.feedbackEmail')}
              </a>{' '}
              ·{' '}
              <a href={`${SOURCE_CODE_URL}/issues`} target="_blank" rel="noreferrer" className={FOOT_INLINE}>
                {t('app.footer.reportGithub')}
              </a>
            </p>
          </div>
          <div>
            <nav aria-label={t('app.footer.pages')}>
              <ul className="grid grid-cols-2 gap-x-6">
                {INFO_PAGES.map((page: InfoPage) => (
                  <li key={page}>
                    <a
                      href={withLang(lang, page)}
                      aria-current={current === page ? 'page' : undefined}
                      className={FOOT_LINK}
                    >
                      {t(`info.${page}.link`)}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer" className={FOOT_LINK}>
                    {t('app.footer.sourceCode')}
                  </a>
                </li>
              </ul>
            </nav>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 border-t border-line pt-2">
              <BackupData className={FOOT_LINK} />
              <EraseData className="inline-flex min-h-[44px] items-center font-medium text-alarm underline-offset-4 hover:underline" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FOOT_INLINE = 'inline-block py-2.5 font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink'
const FOOT_LINK =
  'inline-flex min-h-[44px] items-center font-medium text-ink-soft underline-offset-4 hover:text-ink hover:underline aria-[current=page]:text-ink'

/** A text tab: ink and a saffron underline when it is the page you are on. */
function NavLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative inline-flex h-11 shrink-0 items-center whitespace-nowrap px-3 text-[14px] font-medium transition-colors md:h-14 ${
        active
          ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-saffron-bright'
          : 'text-ink-soft hover:text-ink'
      }`}
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
      className={`inline-flex min-h-[44px] shrink-0 items-center rounded-xl px-3 text-[13px] font-semibold transition-colors ${
        active ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </a>
  )
}
