import { useT, useLang, type Lang } from '../../i18n'
import { homeSections, pinnedTools } from '../../data/home'
import type { ToolDef } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { IslandRoot } from '../../components/IslandRoot'
import { Plan } from '../plan'

export default function HomeTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="home">
      {/* The front door is the home page. A stranger lands on three questions,
          not on a board and not on a grid of calculators: they arrive stuck at
          "I want to leave and cannot start", and a Kanban column is an answer
          to a question they have not reached yet (docs/DIRECTION.md Part 13).
          `Plan` shows the saved plan instead once a resign date exists, and
          hides everything below on that screen. */}
      {/* `data-tool="home"` stays on the page itself: check:base asserts
          dist/index.html is the home island and not some other tool's. */}
      <div data-tool="home">
        <Plan belowDoor={<BelowTheDoor />} />
      </div>
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

/**
 * Everything the door pushed down: the board, and the tools behind one tap.
 *
 * The tracker is no longer rendered here — it is the `tracker` page, which is
 * one tap from the nav on every screen and from the link below. Its own erase
 * control travels with it, so the second copy did not vanish in the move.
 * Removing the tool grid is Phase 2, not this one, so it stays where it was:
 * collapsed, under the door.
 */
function BelowTheDoor() {
  const t = useT()
  const { lang } = useLang()
  const pinned = pinnedTools()
  const sections = homeSections()
  // Counted from what the disclosure actually renders, not from TOOLS.length —
  // the registry also carries `tracker` and `prompts`, which live in the nav.
  const toolCount = pinned.length + sections.reduce((n, section) => n + section.tools.length, 0)

  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-ink-faint">
        {t('home.trackerLink')}{' '}
        <a href={withLang(lang, 'tracker')} className="font-semibold text-saffron underline">
          {t('home.trackerLink.cta')}
        </a>
      </p>

      <details className="group rounded-2xl border border-line bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[14px] font-bold">
          <span>{t('home.allTools', { n: toolCount })}</span>
          {/* list-none kills the native marker, so carry an explicit affordance —
              on touch there is no cursor or hover to hint that this opens. */}
          <span
            aria-hidden="true"
            className="text-lg leading-none text-ink-faint transition-transform group-open:rotate-90"
          >
            ›
          </span>
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
