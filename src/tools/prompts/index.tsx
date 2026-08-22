import { PromptStudio } from '../../components/PromptStudio'
import { IslandRoot } from '../../components/IslandRoot'
import { withBase } from '../../lib/base'

export default function PromptsTool() {
  return (
    <IslandRoot current="prompts">
      <div data-tool="prompts">
        <PromptStudio onGoToTracker={() => window.location.assign(withBase('tracker'))} />
      </div>
    </IslandRoot>
  )
}
