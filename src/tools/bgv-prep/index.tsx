import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, NumberField, Select, Toggle, VerdictBanner } from '../../components/ui'
import { bgvPrep, type BgvCompanyType } from '../../engine/bgv'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.bgv.v1' as const

interface Draft {
  gapMonths: number
  dualPf: boolean
  relievingPending: boolean
  companyType: BgvCompanyType
}

const DEFAULT: Draft = { gapMonths: 0, dualPf: false, relievingPending: false, companyType: 'product' }

export default function BgvPrepTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="bgv-prep">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(DEFAULT)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setDraft(readJson<Draft>(STORAGE_KEY, DEFAULT))
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => bgvPrep(draft), [draft])
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="bgv-prep" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('bgv-prep.formTitle')}</h2>
        <NumberField label={t('bgv-prep.gap')} hint={t('bgv-prep.gapHint')} suffix={t('unit.months')} value={draft.gapMonths} onChange={(v) => set({ gapMonths: v })} />
        <Toggle label={t('bgv-prep.dualPf')} checked={draft.dualPf} onChange={(v) => set({ dualPf: v })} />
        <Toggle label={t('bgv-prep.relieving')} checked={draft.relievingPending} onChange={(v) => set({ relievingPending: v })} />
        <Select
          label={t('bgv-prep.company')}
          value={draft.companyType}
          onChange={(v) => set({ companyType: v })}
          options={[
            { value: 'product', label: t('bgv-prep.company.product') },
            { value: 'services', label: t('bgv-prep.company.services') },
            { value: 'gcc', label: t('bgv-prep.company.gcc') },
            { value: 'startup', label: t('bgv-prep.company.startup') },
          ]}
        />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result.highRisk ? 'alarm' : 'leaf'}>
          {t(result.highRisk ? 'bgv-prep.verdict.risk' : 'bgv-prep.verdict.ok')}
        </VerdictBanner>
        <Card className="space-y-2">
          {result.items.map((item) => (
            <p
              key={item.id}
              className={`text-[13px] leading-relaxed ${item.severity === 'red' ? 'text-alarm' : item.severity === 'amber' ? 'text-amberflag' : 'text-ink-soft'}`}
            >
              {t(`bgv-prep.item.${item.id}`)}
            </p>
          ))}
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
