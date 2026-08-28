import { Tracker } from '../../components/Tracker'
import { IslandRoot } from '../../components/IslandRoot'
import type { Lang } from '../../i18n'

export default function TrackerTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="tracker">
      <div data-tool="tracker">
        <Tracker />
      </div>
    </IslandRoot>
  )
}
