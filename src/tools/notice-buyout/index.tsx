import { useEffect, useMemo, useState } from 'react'
import { buyoutQuote } from '../../engine/noticeBuyout'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, MoneyField, NumberField, Select, VerdictBanner } from '../../components/ui'
import { loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.notice-buyout.v1' as const

interface Draft {
  basis: 'basic' | 'gross'
  mode: 'pay' | 'recover'
  unservedDays: number
  monthlyBasic: number
  monthlyGross: number
}

export default function NoticeBuyoutTool() {
  return (
    <IslandRoot current="notice-buyout">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    basis: 'basic',
    mode: 'pay',
    unservedDays: 30,
    monthlyBasic: 80_000,
    monthlyGross: 150_000,
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const o = loadOffer()
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(
      saved ?? {
        basis: 'basic',
        mode: 'pay',
        unservedDays: o.noticePeriodDays,
        monthlyBasic: Math.round((o.ctcAnnual * (o.basicPercent / 100)) / 12),
        monthlyGross: Math.round(o.ctcAnnual / 12),
      },
    )
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => buyoutQuote(draft), [draft])
  const verdict =
    draft.mode === 'pay'
      ? t('notice-buyout.verdict.pay', { amount: formatINR(result.amount) })
      : t('notice-buyout.verdict.recover', { amount: formatINR(result.amount) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="notice-buyout" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('notice-buyout.formTitle')}</h2>
        <Select
          label={t('notice-buyout.basis')}
          value={draft.basis}
          onChange={(v) => set({ basis: v })}
          options={[
            { value: 'basic', label: t('notice-buyout.basis.basic') },
            { value: 'gross', label: t('notice-buyout.basis.gross') },
          ]}
        />
        <Select
          label={t('notice-buyout.mode')}
          value={draft.mode}
          onChange={(v) => set({ mode: v })}
          options={[
            { value: 'pay', label: t('notice-buyout.mode.pay') },
            { value: 'recover', label: t('notice-buyout.mode.recover') },
          ]}
        />
        <NumberField label={t('notice-buyout.days')} suffix="days" value={draft.unservedDays} onChange={(v) => set({ unservedDays: v })} />
        <MoneyField label={t('notice-buyout.basic')} hint={t('ui.money.hint')} value={draft.monthlyBasic} onChange={(v) => set({ monthlyBasic: v })} />
        <MoneyField label={t('notice-buyout.gross')} hint={t('ui.money.hint')} value={draft.monthlyGross} onChange={(v) => set({ monthlyGross: v })} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner>{verdict}</VerdictBanner>
        <p className="text-[13px] text-ink-soft">{t('notice-buyout.divisor')}</p>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
