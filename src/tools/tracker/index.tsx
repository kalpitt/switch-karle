import { Tracker } from '../../components/Tracker'
import { IslandRoot } from '../../components/IslandRoot'
import { NextStep } from '../../components/NextStep'
import type { Lang } from '../../i18n'

export default function TrackerTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="tracker">
      <div data-tool="tracker" className="space-y-6">
        <Tracker />
        <div className="mx-auto max-w-2xl">
          <NextStep from="tracker" />
        </div>
      </div>
    </IslandRoot>
  )
}
