import { useEffect, useMemo, useState } from 'react'
import { gratuity } from '../../engine/gratuity'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, DateField, Disclaimer, MoneyField, Toggle, VerdictBanner } from '../../components/ui'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.gratuity.v1' as const

interface Draft {
  lastDrawnBasicDA: number
  joinDate: string
  exitDate: string
  coveredByAct: boolean
}

const DEFAULT_DRAFT: Draft = {
  lastDrawnBasicDA: 100_000,
  joinDate: '2019-08-01',
  exitDate: '2024-08-01',
  coveredByAct: true,
}

export default function GratuityTool() {
  return (
    <IslandRoot current="gratuity">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(readJson<Draft>(STORAGE_KEY, DEFAULT_DRAFT))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => gratuity(draft), [draft])
  const verdict = result.eligible
    ? t('gratuity.verdict.yes', { amount: formatINR(result.amount), years: result.completedYears })
    : t('gratuity.verdict.no', { years: result.completedYears })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="gratuity" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('gratuity.formTitle')}</h2>
        <MoneyField
          label={t('gratuity.basic')}
          hint={t('gratuity.basicHint')}
          value={draft.lastDrawnBasicDA}
          onChange={(v) => set({ lastDrawnBasicDA: v })}
        />
        <DateField label={t('gratuity.join')} value={draft.joinDate} onChange={(v) => set({ joinDate: v })} />
        <DateField label={t('gratuity.exit')} value={draft.exitDate} onChange={(v) => set({ exitDate: v })} />
        <Toggle
          label={t('gratuity.covered')}
          hint={t('gratuity.coveredHint')}
          checked={draft.coveredByAct}
          onChange={(v) => set({ coveredByAct: v })}
        />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result.eligible ? 'leaf' : 'amber'}>{verdict}</VerdictBanner>
        {result.flipDate && <p className="text-[13px] text-ink-soft">{t('gratuity.flip', { date: result.flipDate })}</p>}
        {result.notes.map((n) => (
          <p key={n.id} className="text-[13px] text-ink-soft">
            {n.detail}
          </p>
        ))}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
