import { PromptStudio } from '../../components/PromptStudio'
import { IslandRoot } from '../../components/IslandRoot'
import { withLang } from '../../lib/langPath'
import { useLang, type Lang } from '../../i18n'

export default function PromptsTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="prompts">
      <PromptsBody />
    </IslandRoot>
  )
}

function PromptsBody() {
  const { lang } = useLang()
  return (
    <div data-tool="prompts">
      <PromptStudio onGoToTracker={() => window.location.assign(withLang(lang, 'tracker'))} />
    </div>
  )
}
