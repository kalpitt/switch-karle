import { useEffect, useState } from 'react'
import { useT, useLang, type Lang } from '../../i18n'
import { visibleToolCount } from '../../data/journey'
import { DOORS, LAID_OFF, doorPath } from '../../data/doors'
import { loadPlan } from '../../data/plan'
import { PLAN_PAGE, TOOLS_PAGE } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { formatLongDate } from '../../lib/formatDate'
import { IslandRoot } from '../../components/IslandRoot'
import { ChevronRight, ShieldCheck } from '../../components/icons'

/**
 * The home page (the front-door rebuild, 2026-11-16): what the site is, then
 * which step you are at. No form, no example, no result: each card opens that
 * step's page, where one tool is offered first. The resign-date plan lives on
 * its own page, /resign-date/.
 */
export default function HomeTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="home">
      {/* `data-tool="home"` stays on the page itself: check:base asserts
          dist/index.html is the home island and not some other tool's. */}
      <div data-tool="home" className="max-w-2xl">
        <Home />
      </div>
    </IslandRoot>
  )
}

const QUIET_LINK = 'inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline underline-offset-2'

function Home() {
  const t = useT()
  const { lang } = useLang()

  return (
    <>
      <h1 className="font-display text-[30px] font-bold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[40px]">
        {t('home.headline')}
      </h1>
      <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">{t('home.sub')}</p>
      {/* The badge's wording is an owner decision (2026-11-07): reused, not reworded. */}
      <p data-privacy-line className="mt-3 flex items-start gap-2 text-[14px] font-semibold leading-snug text-ink">
        <ShieldCheck size={18} className="mt-px shrink-0 text-leaf" />
        {t('app.footer.badge')}
      </p>

      <h2 className="mt-8 font-display text-[21px] font-bold leading-snug tracking-[-0.01em] text-ink">{t('home.question')}</h2>
      <ul className="mt-3 space-y-2.5">
        {DOORS.map((door) => (
          <li key={door.id}>
            <a
              href={withLang(lang, doorPath(door.id))}
              data-door-card={door.id}
              className="group flex min-h-[64px] items-center gap-3 rounded-2xl border border-line-strong bg-card px-4 py-3 transition-colors hover:border-field sm:px-5"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold leading-snug text-ink group-hover:underline group-hover:underline-offset-2">
                  {t(`door.${door.id}.name`)}
                </span>
                <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">{t(`door.${door.id}.what`)}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>

      <SavedPlanStrip />

      <ul className="mt-6 divide-y divide-line border-y border-line text-[15px] leading-snug">
        <QuietRow lead={t('home.laid')} cta={t('home.laid.cta')} href={withLang(lang, doorPath(LAID_OFF))} />
        <QuietRow
          lead={t('home.oneTool')}
          cta={t('home.oneTool.cta', { n: visibleToolCount() })}
          href={withLang(lang, TOOLS_PAGE)}
          allTools
        />
        <QuietRow lead={t('home.maker')} cta={t('home.maker.cta')} href={withLang(lang, 'about')} />
      </ul>
    </>
  )
}

function QuietRow({ lead, cta, href, allTools }: { lead: string; cta: string; href: string; allTools?: boolean }) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 py-1.5">
      <span className="text-ink-soft">{lead}</span>
      <a href={href} data-all-tools={allTools ? '' : undefined} className={QUIET_LINK}>
        {cta}
      </a>
    </li>
  )
}

/**
 * A returning visitor's resign date, below the cards so they do not jump under
 * the thumb. Read in an effect: the page is built without storage, and the first
 * client render must match it.
 */
function SavedPlanStrip() {
  const t = useT()
  const { lang } = useLang()
  const [resignDate, setResignDate] = useState<string | undefined>(undefined)
  useEffect(() => {
    setResignDate(loadPlan().resignDate)
  }, [])
  if (!resignDate) return null
  return (
    <p data-saved-plan className="mt-4 flex flex-wrap items-center gap-x-2 rounded-2xl bg-paper px-4 py-2 text-[15px] leading-snug">
      <span className="text-ink">{t('home.saved', { date: formatLongDate(resignDate, lang) })}</span>
      <a href={withLang(lang, PLAN_PAGE)} className={QUIET_LINK}>
        {t('home.saved.cta')}
      </a>
    </p>
  )
}
