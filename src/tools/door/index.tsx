import { useLang, useT, type Lang } from '../../i18n'
import { IslandRoot } from '../../components/IslandRoot'
import { EntryRow } from '../../components/ToolRow'
import { ChevronRight } from '../../components/icons'
import { buttonClass } from '../../components/buttonClass'
import { latinLang } from '../../lib/latinLang'
import { withLang } from '../../lib/langPath'
import { toolHref } from '../../lib/toolHref'
import { doorById, doorPath, type Door, type DoorId } from '../../data/doors'
import { PLAN_PAGE, TOOLS_PAGE, toolBySlug } from '../../data/tools'

/**
 * A step page, /start/<id>/ (the front-door rebuild, 2026-11-16): one tool to
 * start with, as the only dark button on the page, then at most four more, then
 * the way to every tool for this step. Short enough that the lead card and the
 * heading of the list under it fit on the first phone screen (plan rule R5).
 */
export default function DoorPage({ lang = 'en', door }: { lang?: Lang; door: DoorId }) {
  return (
    <IslandRoot lang={lang} current={doorPath(door)}>
      <DoorBody door={doorById(door)} />
    </IslandRoot>
  )
}

function DoorBody({ door }: { door: Door }) {
  const t = useT()
  const { lang } = useLang()
  const leadTool = door.lead === PLAN_PAGE ? undefined : toolBySlug(door.lead)
  const leadTitle = leadTool ? t(leadTool.titleKey) : t('door.planTitle')
  const leadHref = leadTool ? toolHref(lang, leadTool.slug) : withLang(lang, PLAN_PAGE)

  return (
    <div data-door={door.id} className="max-w-2xl">
      <a
        href={withLang(lang)}
        className="-ml-1 inline-flex min-h-[44px] items-center gap-1 px-1 text-[15px] font-medium text-ink-soft hover:text-ink"
      >
        <ChevronRight size={16} className="rotate-180" />
        {t('door.back')}
      </a>
      <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[36px]">
        {t(`door.${door.id}.name`)}
      </h1>

      <div className="mt-5 rounded-2xl border border-line-strong bg-card p-5 sm:p-6">
        <h2 lang={latinLang(leadTitle, lang)} className="text-[19px] font-bold leading-snug text-ink">
          {leadTitle}
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{t(`door.${door.id}.leadWhy`)}</p>
        <a href={leadHref} data-door-lead={door.lead} className={`${buttonClass('primary')} mt-4 w-full`}>
          {t('door.start')}
        </a>
      </div>
      {door.id === 'notice' && (
        <p className="mt-3 text-[15px] leading-relaxed">
          <a
            href={toolHref(lang, 'notice-tracker')}
            className="inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline underline-offset-2"
          >
            {t('door.notice.which')}
          </a>
        </p>
      )}

      <h2 className="mt-8 font-display text-[20px] font-bold leading-snug tracking-[-0.01em] text-ink">{t('door.also')}</h2>
      <ul className="mt-2 border-t border-line">
        {door.also.map((slug) => {
          const tool = toolBySlug(slug)
          if (!tool) return null
          const whenKey = `door.${door.id}.when.${slug}`
          const when = t(whenKey)
          return <EntryRow key={slug} entry={{ kind: 'tool', tool }} prefix={when === whenKey ? undefined : when} />
        })}
      </ul>

      <a
        href={`${withLang(lang, TOOLS_PAGE)}#${door.id}`}
        className="mt-5 inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline underline-offset-4"
      >
        {t('door.all')}
      </a>
    </div>
  )
}
