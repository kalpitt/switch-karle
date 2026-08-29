import { useT, useLang, type Lang } from '../../i18n'
import { homeSections, pinnedTools } from '../../data/home'
import type { ToolDef } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { IslandRoot } from '../../components/IslandRoot'

export default function HomeTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="home">
      <HomeGrid />
    </IslandRoot>
  )
}

function ToolCard({ tool, lang, featured = false }: { tool: ToolDef; lang: Lang; featured?: boolean }) {
  const t = useT()
  return (
    <li>
      <a
        href={withLang(lang, tool.slug)}
        className={`block h-full rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgba(28,25,23,0.06)] transition-colors hover:border-saffron ${
          featured ? 'border-saffron/40' : 'border-line'
        }`}
      >
        <h3 className="text-base font-bold">{t(tool.titleKey)}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{t(tool.descKey)}</p>
      </a>
    </li>
  )
}

function HomeGrid() {
  const t = useT()
  const { lang } = useLang()
  const pinned = pinnedTools()
  const sections = homeSections()

  return (
    <div data-tool="home" className="space-y-8">
      <div>
        <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{t('home.kicker')}</p>
        <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink-faint">{t('home.pinned')}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {pinned.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} lang={lang} featured />
          ))}
        </ul>
      </div>
      {sections.map((section) => (
        <div key={section.category}>
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink-faint">{t(section.titleKey)}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {section.tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} lang={lang} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
