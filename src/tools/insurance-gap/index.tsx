import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, DateField, Disclaimer, Toggle, VerdictBanner } from '../../components/ui'
import { todayUTC, addDays } from '../../engine/dates'
import { insuranceGap } from '../../engine/insurance'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.insurance.v1' as const

interface Draft {
  lastWorkingDay: string
  newJoinDate: string
  hasPersonalCover: boolean
}

function skeleton(): Draft {
  const today = todayUTC()
  return { lastWorkingDay: today, newJoinDate: addDays(today, 15), hasPersonalCover: false }
}

export default function InsuranceGapTool() {
  return (
    <IslandRoot current="insurance-gap">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(skeleton)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(saved ?? skeleton())
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => {
    try {
      return insuranceGap(draft)
    } catch {
      return null
    }
  }, [draft])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const verdict =
    !result
      ? t('insurance-gap.verdict.none')
      : result.uncoveredDays === 0
        ? t('insurance-gap.verdict.none')
        : result.uncovered
          ? t('insurance-gap.verdict.gap', { days: result.uncoveredDays, lwd: result.groupCoverEndsOn })
          : t('insurance-gap.verdict.covered', { days: result.uncoveredDays })

  return (
    <div data-tool="insurance-gap" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('insurance-gap.formTitle')}</h2>
        <DateField label={t('insurance-gap.lwd')} value={draft.lastWorkingDay} onChange={(v) => set({ lastWorkingDay: v })} />
        <DateField label={t('insurance-gap.join')} value={draft.newJoinDate} onChange={(v) => set({ newJoinDate: v })} />
        <Toggle label={t('insurance-gap.personal')} checked={draft.hasPersonalCover} onChange={(v) => set({ hasPersonalCover: v })} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result?.uncovered ? 'alarm' : 'leaf'}>{verdict}</VerdictBanner>
        {result?.joinOverlapsLwd && <p className="text-[13px] text-amberflag">{t('insurance-gap.overlap')}</p>}
        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('insurance-gap.factors')}</h3>
          {result?.factorIds.map((id) => (
            <p key={id} className="text-[13px] leading-relaxed text-ink-soft">
              {t(`insurance-gap.factor.${id}`)}
            </p>
          ))}
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
