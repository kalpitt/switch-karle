import { useEffect, useMemo, useState } from 'react'
import { leaveEncash } from '../../engine/leaveEncash'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, MoneyField, NumberField, Select, VerdictBanner } from '../../components/ui'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.leave.v1' as const

interface Draft {
  balanceDays: number
  monthlyBasic: number
  dailyBasis: '26' | '30'
  reason: 'resignation' | 'retirement'
}

const DEFAULT_DRAFT: Draft = {
  balanceDays: 20,
  monthlyBasic: 100_000,
  dailyBasis: '26',
  reason: 'resignation',
}

export default function LeaveEncashmentTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="leave-encashment">
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

  const result = useMemo(() => leaveEncash(draft), [draft])
  const verdict = result.resignationFullyTaxable
    ? t('leave-encashment.verdict.resign', { amount: formatINR(result.gross) })
    : t('leave-encashment.verdict.retire', { amount: formatINR(result.gross) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="leave-encashment" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('leave-encashment.formTitle')}</h2>
        <NumberField label={t('leave-encashment.days')} suffix="days" value={draft.balanceDays} onChange={(v) => set({ balanceDays: v })} />
        <MoneyField label={t('leave-encashment.basic')} hint={t('ui.money.hint')} value={draft.monthlyBasic} onChange={(v) => set({ monthlyBasic: v })} />
        <Select
          label={t('leave-encashment.basis')}
          value={draft.dailyBasis}
          onChange={(v) => set({ dailyBasis: v })}
          options={[
            { value: '26', label: t('leave-encashment.basis.26') },
            { value: '30', label: t('leave-encashment.basis.30') },
          ]}
        />
        <Select
          label={t('leave-encashment.reason')}
          value={draft.reason}
          onChange={(v) => set({ reason: v })}
          options={[
            { value: 'resignation', label: t('leave-encashment.reason.resign') },
            { value: 'retirement', label: t('leave-encashment.reason.retire') },
          ]}
        />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result.resignationFullyTaxable ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        <Card className="space-y-1 tnum text-[13px]">
          <p>
            {t('leave-encashment.gross')}: {formatINR(result.gross)}
          </p>
          <p>
            {t('leave-encashment.exempt')}: {formatINR(result.exempt)}
          </p>
          <p>
            {t('leave-encashment.taxable')}: {formatINR(result.taxable)}
          </p>
        </Card>
        <p className="text-[13px] text-ink-soft">{t('leave-encashment.note')}</p>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
