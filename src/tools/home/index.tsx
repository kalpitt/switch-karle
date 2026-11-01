import { useT, useLang, type Lang } from '../../i18n'
import { homeSections, pinnedTools } from '../../data/home'
import type { ToolDef } from '../../data/tools'
import { withLang } from '../../lib/langPath'
import { IslandRoot } from '../../components/IslandRoot'
import { Plan } from '../plan'
import { ChevronRight } from '../../components/icons'

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

/** A tool as a list row, not a card (VIS-27): name, one line of what it does, a chevron. */
function ToolRow({ tool, lang }: { tool: ToolDef; lang: Lang }) {
  const t = useT()
  return (
    <li>
      <a
        href={withLang(lang, tool.slug)}
        className="group/row flex min-h-[44px] items-start gap-3 border-b border-line py-3 transition-colors hover:border-field"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-ink group-hover/row:underline group-hover/row:underline-offset-2">
            {t(tool.titleKey)}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-ink-soft">{t(tool.descKey)}</span>
        </span>
        <ChevronRight className="mt-1 text-ink-faint" />
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
      <p className="text-[14px] leading-relaxed text-ink-soft">
        {t('home.trackerLink')}{' '}
        <a href={withLang(lang, 'tracker')} className="inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline">
          {t('home.trackerLink.cta')}
        </a>
      </p>

      <details className="group rounded-2xl border border-line bg-card">
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
          <span>{t('home.allTools', { n: toolCount })}</span>
          {/* list-none kills the native marker, so carry an explicit affordance —
              on touch there is no cursor or hover to hint that this opens. */}
          <ChevronRight size={18} className="text-ink-soft transition-transform group-open:rotate-90" />
        </summary>
        <div className="space-y-8 border-t border-line px-5 py-5">
          <ToolGroup title={t('home.pinned')} tools={pinned} lang={lang} />
          {sections.map((section) => (
            <ToolGroup key={section.category} title={t(section.titleKey)} tools={section.tools} lang={lang} />
          ))}
        </div>
      </details>
    </div>
  )
}

function ToolGroup({ title, tools, lang }: { title: string; tools: ToolDef[]; lang: Lang }) {
  return (
    <div>
      <h2 className="mb-1 text-[14px] font-semibold text-ink">
        {title} <span className="tnum font-normal text-ink-faint">· {tools.length}</span>
      </h2>
      <ul className="grid gap-x-8 sm:grid-cols-2">
        {tools.map((tool) => (
          <ToolRow key={tool.slug} tool={tool} lang={lang} />
        ))}
      </ul>
    </div>
  )
}

