import { useT } from '../../i18n'
import { TOOLS } from '../../data/tools'
import { withBase } from '../../lib/base'
import { IslandRoot } from '../../components/IslandRoot'

export default function HomeTool() {
  return (
    <IslandRoot current="home">
      <HomeGrid />
    </IslandRoot>
  )
}

function HomeGrid() {
  const t = useT()

  return (
    <div data-tool="home">
      <p className="mb-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{t('home.kicker')}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <li key={tool.slug}>
            <a
              href={withBase(tool.slug)}
              className="block h-full rounded-2xl border border-line bg-card p-5 shadow-[0_1px_3px_rgba(28,25,23,0.06)] transition-colors hover:border-saffron"
            >
              <h2 className="text-base font-bold">{t(tool.titleKey)}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{t(tool.descKey)}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
