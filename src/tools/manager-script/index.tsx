import { useEffect, useMemo, useState } from 'react'
import { lastWorkingDay } from '../../engine/dates'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, Select, VerdictBanner } from '../../components/ui'
import { readJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

/** Read-only pull from the resignation island's own key (allowed per D10). */
const RESIGNATION_KEY = 'switchkarle.resignation.v1' as const

type Preset = 'supportive' | 'counter-risk' | 'hostile'

export default function ManagerScriptTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="manager-script">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [preset, setPreset] = useState<Preset>('supportive')
  /** LWD from a stored resignation letter, if the user already made one. */
  const [lwd, setLwd] = useState('')

  useEffect(() => {
    const res = readJson<{ resignDate?: string; noticeDays?: number } | null>(RESIGNATION_KEY, null)
    if (res?.resignDate && res.noticeDays) {
      try {
        setLwd(lastWorkingDay(res.resignDate, Math.max(1, Math.round(res.noticeDays))))
      } catch {
        /* malformed stored dates — leave LWD empty */
      }
    }
  }, [])

  const script = useMemo(
    () => t(`manager-script.body.${preset}`).replaceAll('[LWD]', lwd || '[LWD]'),
    [t, preset, lwd],
  )
  const canCopy = !script.includes('[')

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
          {canCopy ? (
            <CopyButton text={script} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
          ) : (
            <p className="text-[13px] font-semibold text-amberflag">{t('manager-script.copyBlocked')}</p>
          )}
        </div>
      </Card>
      <Disclaimer>{t('hr.disclaimer')}</Disclaimer>
    </div>
  )
}
