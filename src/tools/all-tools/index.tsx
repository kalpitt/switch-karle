import { useLang, useT, type Lang } from '../../i18n'
import { latinLang } from '../../lib/latinLang'
import { quietGlyphs } from '../../components/quietGlyphs'
import { listSections, type ListEntry } from '../../data/journey'
import { TOOLS_PAGE } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { IslandRoot } from '../../components/IslandRoot'
import { ChevronRight } from '../../components/icons'
import { toolHref } from '../../lib/toolHref'

/**
 * /tools/: every tool, grouped by the seven journey stages (PRODUCT.md). The one
 * full list of tools on the site: the home page links here instead of keeping
 * its own copy. What to say shows once in each stage it has a situation in,
 * linking straight to that stage's first situation.
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
  const sections = listSections()

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

      <div className="mt-6 space-y-10 sm:mt-8">
        {sections.map((section, index) => (
          <section key={section.id} aria-labelledby={`stage-${section.id}`}>
            {/* Stage headings outrank the 15px tool names under them (R-11). */}
            <p aria-hidden="true" className="tnum text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-faint">
              {t('journey.stage', { n: index + 1 })}
            </p>
            <h2 id={`stage-${section.id}`} className="mt-0.5 font-display text-[22px] font-bold leading-snug tracking-[-0.01em] text-ink">
              {t(section.nameKey)}
            </h2>
            <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{t(section.whatKey)}</p>
            <ul className="mt-3 grid gap-x-8 border-t border-line sm:auto-rows-fr sm:grid-cols-2 sm:border-t-0">
              {section.entries.map((entry) => (
                <EntryRow key={entry.kind === 'tool' ? entry.tool.slug : `group-${entry.situations[0]!.slug}`} entry={entry} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

/** A tool as a list row (VIS-27): name, one line of what it does, a chevron. */
function EntryRow({ entry }: { entry: ListEntry }) {
  const t = useT()
  const { lang } = useLang()
  const target = entry.kind === 'tool' ? entry.tool : entry.situations[0]!
  const title = t(entry.kind === 'tool' ? entry.tool.titleKey : entry.group.titleKey)
  // A What to say row names the situations it holds in this stage.
  const desc =
    entry.kind === 'tool' ? t(entry.tool.descKey) : entry.situations.map((s) => t(s.titleKey)).join(' · ')
  return (
    <li>
      <a
        href={toolHref(lang, target.slug)}
        data-entry={entry.kind === 'tool' ? entry.tool.slug : entry.group.slug}
        className="group/row flex min-h-[44px] items-start gap-3 border-b border-line py-3 transition-colors hover:border-field"
      >
        <span className="min-w-0 flex-1">
          <span
            lang={latinLang(title, lang)}
            className="block text-[15px] font-semibold leading-snug text-ink group-hover/row:underline group-hover/row:underline-offset-2"
          >
            {title}
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{desc}</span>
        </span>
        <ChevronRight className="mt-1 text-ink-faint" />
      </a>
    </li>
  )
}
