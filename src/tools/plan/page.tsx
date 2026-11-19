import type { Lang } from '../../i18n'
import { IslandRoot } from '../../components/IslandRoot'
import { PLAN_PAGE } from '../../data/tools'
import { Plan } from './index'

/**
 * The resign-date plan on its own page, /resign-date/ (the front-door rebuild,
 * 2026-11-16). The first tool for someone thinking of leaving; the home page
 * asks which step a visitor is at instead.
 */
export default function PlanPage({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current={PLAN_PAGE}>
      <div data-tool={PLAN_PAGE}>
        <Plan />
      </div>
    </IslandRoot>
  )
}
