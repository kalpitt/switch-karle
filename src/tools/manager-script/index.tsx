import { useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, Select, VerdictBanner } from '../../components/ui'
import { useT } from '../../i18n'

type Preset = 'supportive' | 'counter-risk' | 'hostile'

export default function ManagerScriptTool() {
  return (
    <IslandRoot current="manager-script">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [preset, setPreset] = useState<Preset>('supportive')
  const script = useMemo(() => t(`manager-script.body.${preset}`), [t, preset])

  return (
    <div data-tool="manager-script" className="mx-auto grid max-w-3xl gap-4">
      <Card className="space-y-3">
        <h2 className="text-base font-bold">{t('manager-script.formTitle')}</h2>
        <Select
          label={t('manager-script.preset')}
          value={preset}
          onChange={(v) => setPreset(v)}
          options={[
            { value: 'supportive', label: t('manager-script.preset.supportive') },
            { value: 'counter-risk', label: t('manager-script.preset.counter-risk') },
            { value: 'hostile', label: t('manager-script.preset.hostile') },
          ]}
        />
      </Card>
      <VerdictBanner>{t(`manager-script.verdict.${preset}`)}</VerdictBanner>
      <Card>
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{script}</pre>
        <div className="mt-4">
          <CopyButton text={script} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
        </div>
      </Card>
      <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
    </div>
  )
}
