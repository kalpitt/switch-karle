import { useLang, useT, type Lang } from '../../i18n'
import { quietGlyphs } from '../../components/quietGlyphs'
import { doorListSections, DOORS } from '../../data/doors'
import { PLAN_PAGE, TOOLS_PAGE } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { IslandRoot } from '../../components/IslandRoot'
import { EntryRow, RowLink } from '../../components/ToolRow'

/**
 * /tools/: every tool, grouped by the five steps a visitor picks from on the
 * home page (`data/doors.ts`). The one full list of tools on the site. Each
 * section's id is its door id, so a step page can link to `/tools/#offer`.
 * What to say shows once per step it has a situation in, named for the step.
 */
export default function AllToolsPage({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current={TOOLS_PAGE}>
      <AllTools />
    </IslandRoot>
  )
}

function AllTools() {
  const t = useT()
  const { lang } = useLang()
  const sections = doorListSections()

  return (
    <div data-page={TOOLS_PAGE} className="max-w-4xl">
      <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[36px]">
        {t('toolsPage.title')}
      </h1>
      <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-ink-soft">{t('toolsPage.intro')}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">
        {t('toolsPage.plan')}{' '}
        <a href={withLang(lang)} className="inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline">
          {quietGlyphs(t('toolsPage.planCta'))}
        </a>
      </p>

      {/* The header is sticky only from md up (56px tall), so the jump row sits under it there. */}
      <nav
        aria-label={t('toolsPage.jumpLabel')}
        data-jump
        className="sticky top-0 z-20 -mx-4 mt-4 border-b border-line bg-card px-4 sm:-mx-6 sm:px-6 md:top-14 md:mx-0 md:px-0"
      >
        <ul className="flex">
          {DOORS.map((door) => (
            <li key={door.id} className="min-w-0 flex-1">
              <a
                href={`#${door.id}`}
                className="flex min-h-[44px] items-center justify-center px-0.5 text-center text-[12px] font-semibold text-ink-soft hover:text-ink hover:underline min-[360px]:text-[13px] sm:text-[14px]"
              >
                {t(`toolsPage.jump.${door.id}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 space-y-10 sm:mt-8">
        {sections.map(({ door, rows }) => (
          <section key={door.id} aria-labelledby={door.id}>
            <h2
              id={door.id}
              className="scroll-mt-20 font-display text-[22px] font-bold leading-snug tracking-[-0.01em] text-ink md:scroll-mt-32"
            >
              {t(`door.${door.id}.name`)}
            </h2>
            <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{t(`door.${door.id}.what`)}</p>
            <ul className="mt-3 grid gap-x-8 border-t border-line sm:auto-rows-fr sm:grid-cols-2 sm:border-t-0">
              {rows.map((row) => {
                const tag = 'lead' in row && row.lead ? t('toolsPage.startHere') : undefined
                if (row.kind === 'plan') {
                  return (
                    <RowLink
                      key={PLAN_PAGE}
                      href={withLang(lang, PLAN_PAGE)}
                      title={t('door.planTitle')}
                      desc={t('toolsPage.planRow.desc')}
                      entry={PLAN_PAGE}
                      tag={tag}
                    />
                  )
                }
                if (row.kind === 'tool') return <EntryRow key={row.tool.slug} entry={row} tag={tag} />
                return <EntryRow key={`group-${row.situations[0]!.slug}`} entry={row} nameKey={row.nameKey} />
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
