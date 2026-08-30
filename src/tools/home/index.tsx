import { useT, useLang, type Lang } from '../../i18n'
import { homeSections, pinnedTools } from '../../data/home'
import type { ToolDef } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { IslandRoot } from '../../components/IslandRoot'
import { Tracker } from '../../components/Tracker'

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
  // Counted from what the disclosure actually renders, not from TOOLS.length —
  // the registry also carries `tracker` and `prompts`, which live in the nav,
  // and the tracker is now the page itself.
  const toolCount = pinned.length + sections.reduce((n, section) => n + section.tools.length, 0)

  // The board is the page. Research killed the tool-menu home: visitors bounced
  // off a 29-item grid within seconds, and the tracker was the one part they
  // wanted. The tools are not gone, they are one tap down and stage-linked from
  // the cards.
  return (
    <div data-tool="home" className="space-y-8">
      <p className="max-w-2xl text-[15px] leading-relaxed text-ink-soft">{t('home.kicker')}</p>

      <Tracker />

      <details className="rounded-2xl border border-line bg-card">
        <summary className="cursor-pointer list-none px-5 py-4 text-[14px] font-bold">
          {t('home.allTools', { n: toolCount })}
        </summary>
        <div className="space-y-8 border-t border-line px-5 py-5">
          <div>
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink-faint">{t('home.pinned')}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {pinned.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} lang={lang} featured />
              ))}
            </ul>
          </div>
          {sections.map((section) => (
            <div key={section.category}>
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink-faint">
                {t(section.titleKey)}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {section.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} lang={lang} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
