import { Tracker } from '../../components/Tracker'
import { IslandRoot } from '../../components/IslandRoot'

export default function TrackerTool() {
  return (
    <IslandRoot current="tracker">
      <div data-tool="tracker">
        <Tracker />
      </div>
    </IslandRoot>
  )
}
