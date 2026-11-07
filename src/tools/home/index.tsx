import { useT, useLang, type Lang } from '../../i18n'
import { distinctToolCount } from '../../data/journey'
import { TOOLS_PAGE } from '../../data/tools'
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

/**
 * Everything the door pushed down: the board, and the way to every tool.
 *
 * The tracker is its own page, one tap from the link below and from search.
 * The full list of tools lives on /tools/ (grouped by journey stage,
 * PRODUCT.md), the same page the header's "All tools" opens, so there is one
 * list to keep, not two.
 */
function BelowTheDoor() {
  const t = useT()
  const { lang } = useLang()

  return (
    <div className="space-y-4">
      <p className="text-[14px] leading-relaxed text-ink-soft">
        {t('home.trackerLink')}{' '}
        <a href={withLang(lang, 'tracker')} className="inline-flex min-h-[44px] items-center font-semibold text-saffron-strong underline">
          {t('home.trackerLink.cta')}
        </a>
      </p>

      <a
        href={withLang(lang, TOOLS_PAGE)}
        data-all-tools
        className="group flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-4 text-[15px] font-semibold transition-colors hover:border-field"
      >
        <span className="group-hover:underline group-hover:underline-offset-2">{t('home.allTools', { n: distinctToolCount() })}</span>
        <ChevronRight size={18} className="shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
      </a>
    </div>
  )
}
