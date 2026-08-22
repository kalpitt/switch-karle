import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLang, useT } from '../i18n'
import { TOOLS } from '../data/tools'
import { RULES_LAST_VERIFIED } from '../data/rules'
import { withBase } from '../lib/base'

export function Shell({ current, children }: { current: string; children: ReactNode }) {
  const t = useT()
  const { lang, setLang } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <header className="no-print mb-6">
        <a href={withBase()} className="inline-block">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Switch <span className="font-semibold text-ink-soft">Karle</span>
          </h1>
        </a>
        <p className="mt-1 text-[15px] text-ink-soft">{t('app.tagline')}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf">
          <span aria-hidden>●</span> {t('app.privacyBadge')}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <nav className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-card p-1">
            <NavLink href={withBase()} active={current === 'home'}>
              {t('nav.home')}
            </NavLink>
            {TOOLS.map((tool) => (
              <NavLink key={tool.slug} href={withBase(tool.slug)} active={current === tool.slug}>
                {t(tool.titleKey)}
              </NavLink>
            ))}
          </nav>

          <div
            role="group"
            aria-label={t('app.langToggle.label')}
            className="inline-flex gap-1 rounded-full border border-line bg-card p-1"
          >
            <NavButton active={lang === 'en'} onClick={() => setLang('en')}>
              EN
            </NavButton>
            <NavButton active={lang === 'hi'} onClick={() => setLang('hi')}>
              हिं
            </NavButton>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="no-print mt-10 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
        {t('app.footer.rules')} <span className="font-semibold">{t('app.footer.privacy')}</span>
        <br />
        <span className="mt-1 inline-flex items-center rounded-full border border-line bg-card px-2.5 py-0.5 font-semibold text-ink-soft">
          {t('app.footer.verified', { date: RULES_LAST_VERIFIED })}
        </span>
        <br />
        {t('app.footer.feedback')}{' '}
        <a href="mailto:tiwari.kalpit@gmail.com" className="font-semibold underline">
          {t('app.footer.feedbackEmail')}
        </a>{' '}
        ·{' '}
        <a
          href="https://github.com/kalpitt/switch-karle/issues"
          target="_blank"
          rel="noreferrer"
          className="font-semibold underline"
        >
          GitHub
        </a>
      </footer>
    </div>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <a
      href={href}
      className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
        active ? 'bg-saffron text-white' : 'text-ink-soft'
      }`}
    >
      {children}
    </a>
  )
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
        active ? 'bg-saffron text-white' : 'text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}
