import type { ReactNode } from 'react'
import type { Lang } from '../i18n'
import { useLang, useT } from '../i18n'
import { CONTACT_EMAIL, INFO_PAGE_UPDATED, INFO_PAGES, SOURCE_CODE_URL, type InfoPage } from '../data/infoPages'
import { CORRECTIONS, SOURCES, TOOL_SOURCES, type SourceEntry, type SourceStatus } from '../data/sources'
import { TOOLS } from '../data/tools'
import { formatLongDate } from '../lib/formatDate'
import { withLang } from '../lib/langPath'
import { IslandRoot } from './IslandRoot'

/**
 * The pages about the site itself: who makes it, how its numbers are checked,
 * what happens to what you type, and the terms. Server-rendered like every
 * island, so the text is in the HTML before any script runs.
 */
export default function InfoPageIsland({ page, lang = 'en' }: { page: InfoPage; lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current={page}>
      {page === 'about' && <About />}
      {page === 'sources' && <Sources />}
      {page === 'privacy' && <Privacy />}
      {page === 'terms' && <Terms />}
    </IslandRoot>
  )
}

const LINK = 'font-semibold text-ink underline'

function Page({ page, children }: { page: InfoPage; children: ReactNode }) {
  const t = useT()
  const { lang } = useLang()
  return (
    <article data-info={page} className="max-w-[65ch] space-y-8 text-[15px] leading-relaxed">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{t(`${page}.title`)}</h1>
      {children}
      <footer className="space-y-2 border-t border-line pt-4 text-[13px] text-ink-soft">
        <p>
          {t('info.contact')}{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>
            {t('info.contactEmail', { email: CONTACT_EMAIL })}
          </a>{' '}
          ·{' '}
          <a href={`${SOURCE_CODE_URL}/issues`} target="_blank" rel="noreferrer" className={LINK}>
            {t('info.contactGithub')}
          </a>
        </p>
        <p>{t('info.updated', { date: formatLongDate(INFO_PAGE_UPDATED[page], lang) })}</p>
      </footer>
    </article>
  )
}

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  )
}

function OtherPages({ page }: { page: InfoPage }) {
  const t = useT()
  const { lang } = useLang()
  return (
    <ul className="list-disc space-y-1 pl-5">
      {INFO_PAGES.filter((p) => p !== page).map((p) => (
        <li key={p}>
          <a href={withLang(lang, p)} className={`inline-block py-1.5 ${LINK}`}>
            {t(`info.${p}.link`)}
          </a>
        </li>
      ))}
    </ul>
  )
}

function About() {
  const t = useT()
  return (
    <Page page="about">
      <div className="space-y-3">
        <p className="font-semibold">{t('about.who')}</p>
        <p>{t('app.tagline')}</p>
        <p>{t('about.free')}</p>
        <p>{t('about.advice')}</p>
        <p>
          {t('about.code')}{' '}
          <a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer" className={LINK}>
            {t('about.codeLink')}
          </a>
        </p>
      </div>
      <Section title={t('about.more')}>
        <OtherPages page="about" />
      </Section>
    </Page>
  )
}

/** Professional tax is added to these tools per state at render time (`ptSourceId`). */
const PT_TOOLS = ['decoder', 'offer-comparison', 'relocation']

function usedBy(id: string): string[] {
  const slugs = Object.entries(TOOL_SOURCES)
    .filter(([, ids]) => (ids as readonly string[]).includes(id))
    .map(([slug]) => slug)
  return id.startsWith('pt-') ? [...new Set([...PT_TOOLS, ...slugs])] : slugs
}

function SourceCard({ entry }: { entry: SourceEntry }) {
  const t = useT()
  const { lang } = useLang()
  const tools = usedBy(entry.id)
    .map((slug) => TOOLS.find((x) => x.slug === slug))
    .filter((x) => x !== undefined)
  const dateKey =
    entry.status === 'verified' ? 'sources.checkedOn' : entry.status === 'convention' ? 'sources.labelledOn' : 'sources.lookedOn'
  return (
    <li id={entry.id} className="scroll-mt-6 rounded-xl border border-line bg-card p-3.5">
      <p className="text-[14px] font-semibold leading-snug">{t(`source.${entry.id}`)}</p>
      {entry.citation && (
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          {entry.url ? (
            <a href={entry.url} target="_blank" rel="noreferrer" className="underline">
              {entry.citation}
            </a>
          ) : (
            entry.citation
          )}
        </p>
      )}
      {entry.note && <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{t(`sourceNote.${entry.id}`)}</p>}
      <p className="mt-1.5 text-xs text-ink-soft">
        <span className="font-semibold">{t(`sources.status.${entry.status}`)}</span> ·{' '}
        {t(dateKey, { date: formatLongDate(entry.checked, lang) })}
        {tools.length > 0 && <> · {t('sources.usedBy', { tools: tools.map((x) => t(x.titleKey)).join(', ') })}</>}
      </p>
    </li>
  )
}

function SourceList({ statuses }: { statuses: SourceStatus[] }) {
  return (
    <ul className="space-y-2">
      {SOURCES.filter((s) => statuses.includes(s.status)).map((s) => (
        <SourceCard key={s.id} entry={s} />
      ))}
    </ul>
  )
}

function Sources() {
  const t = useT()
  const { lang } = useLang()
  return (
    <Page page="sources">
      <p>{t('sources.intro')}</p>
      <Section id="how" title={t('sources.how.title')}>
        <p>{t('sources.how.p1')}</p>
        <p>{t('sources.how.p2')}</p>
        <p>{t('sources.how.p3')}</p>
        <p>
          {t('sources.how.code')}{' '}
          <a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer" className={LINK}>
            {t('about.codeLink')}
          </a>
        </p>
      </Section>
      <Section id="checked" title={t('sources.checked.title')}>
        <SourceList statuses={['verified']} />
      </Section>
      <Section id="open" title={t('sources.open.title')}>
        <p>{t('sources.open.intro')}</p>
        <SourceList statuses={['awaiting-lawyer', 'awaiting-ca']} />
      </Section>
      <Section id="conventions" title={t('sources.conventions.title')}>
        <p>{t('sources.conventions.intro')}</p>
        <SourceList statuses={['convention']} />
      </Section>
      <Section id="corrections" title={t('sources.corrections.title')}>
        <p>{t('sources.corrections.intro')}</p>
        <ul className="space-y-2">
          {CORRECTIONS.map((c) => (
            <li key={c.id} className="rounded-xl border border-line bg-card p-3.5">
              <p className="text-xs font-semibold text-ink-soft">{formatLongDate(c.date, lang)}</p>
              <p className="mt-1 text-[14px] leading-relaxed">{t(`corrections.${c.id}`)}</p>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  )
}

function Privacy() {
  const t = useT()
  return (
    <Page page="privacy">
      <Section title={t('privacy.short.title')}>
        <ul className="list-disc space-y-1 pl-5 font-semibold">
          <li>{t('privacy.short.1')}</li>
          <li>{t('privacy.short.2')}</li>
          <li>{t('privacy.short.3')}</li>
        </ul>
      </Section>
      <Section id="saved" title={t('privacy.saved.title')}>
        <p>{t('privacy.saved.p1')}</p>
        <p>{t('privacy.saved.p2')}</p>
        <p>{t('privacy.saved.p3')}</p>
      </Section>
      <Section id="never" title={t('privacy.never.title')}>
        <p>{t('privacy.never.p1')}</p>
      </Section>
      <Section id="host" title={t('privacy.host.title')}>
        <p>
          {t('privacy.host.p1')}{' '}
          <a
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            {t('privacy.host.link')}
          </a>
        </p>
      </Section>
      <Section id="out" title={t('privacy.out.title')}>
        <p>{t('privacy.out.p1')}</p>
      </Section>
      <Section id="erase" title={t('privacy.erase.title')}>
        <p>{t('privacy.erase.p1')}</p>
        <p>{t('privacy.erase.p2')}</p>
      </Section>
      <Section id="check" title={t('privacy.check.title')}>
        <p>{t('privacy.check.p1')}</p>
      </Section>
      <Section id="change" title={t('privacy.change.title')}>
        <p>{t('privacy.change.p1')}</p>
        <p>{t('privacy.change.p2')}</p>
        <p>
          <a href={`${SOURCE_CODE_URL}/blob/main/PRIVACY.md`} target="_blank" rel="noreferrer" className={LINK}>
            {t('privacy.rule')}
          </a>
        </p>
      </Section>
    </Page>
  )
}

function Terms() {
  const t = useT()
  const { lang } = useLang()
  return (
    <Page page="terms">
      <div className="space-y-3">
        <p className="font-semibold">{t('terms.estimates')}</p>
        <p>{t('terms.contract')}</p>
        <p>{t('terms.fy')}</p>
        <p>{t('terms.drafts')}</p>
        <p>
          {t('terms.asis')}{' '}
          <a href={`${SOURCE_CODE_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className={LINK}>
            MIT licence
          </a>
        </p>
        <p>
          <a href={withLang(lang, 'sources')} className={LINK}>
            {t('terms.errors')}
          </a>
        </p>
      </div>
    </Page>
  )
}
