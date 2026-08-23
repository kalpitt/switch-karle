import { useEffect, useMemo, useState } from 'react'
import { form16Shock } from '../../engine/form16'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, CopyButton, Disclaimer, MoneyField, VerdictBanner } from '../../components/ui'
import { decodeOffer } from '../../engine/salary'
import { loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.form16.v1' as const

interface Draft {
  employer1Gross: number
  employer1Tds: number
  employer2Gross: number
  employer2Tds: number
}

export default function Form16ShockTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="form16-shock">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    employer1Gross: 1_200_000,
    employer1Tds: 0,
    employer2Gross: 0,
    employer2Tds: 0,
  })
  const [regime, setRegime] = useState<'new' | 'old'>('new')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const b = decodeOffer(loadOffer())
    setRegime(b.recommendedRegime)
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    // Employer 2 is never cloned from employer 1's figures (master plan 3.3).
    setDraft(saved ?? { employer1Gross: b.grossSalary, employer1Tds: 0, employer2Gross: 0, employer2Tds: 0 })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => form16Shock({ ...draft, regime }), [draft, regime])
  const verdict =
    result.shock > 0
      ? t('form16-shock.verdict.owe', { amount: formatINR(result.shock) })
      : t('form16-shock.verdict.ok', { amount: formatINR(-result.shock) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const form12b = t('form16-shock.form12b', {
    gross: formatINR(draft.employer1Gross),
    tds: formatINR(draft.employer1Tds),
  })

  return (
    <div data-tool="form16-shock" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('form16-shock.formTitle')}</h2>
        <MoneyField label={t('form16-shock.e1gross')} hint={t('ui.money.hint')} value={draft.employer1Gross} onChange={(v) => set({ employer1Gross: v })} />
        <MoneyField label={t('form16-shock.e1tds')} hint={t('ui.money.hint')} value={draft.employer1Tds} onChange={(v) => set({ employer1Tds: v })} />
        <MoneyField label={t('form16-shock.e2gross')} hint={t('ui.money.hint')} value={draft.employer2Gross} onChange={(v) => set({ employer2Gross: v })} />
        <MoneyField label={t('form16-shock.e2tds')} hint={t('ui.money.hint')} value={draft.employer2Tds} onChange={(v) => set({ employer2Tds: v })} />
      </Card>
      <div className="space-y-4">
        <VerdictBanner tone={result.shock > 0 ? 'alarm' : 'leaf'}>{verdict}</VerdictBanner>
        <Card className="space-y-1 tnum text-[13px]">
          <p>
            {t('form16-shock.taxable')}: {formatINR(result.combinedTaxableApprox)}
          </p>
          <p>
            {t('form16-shock.tax')}: {formatINR(result.taxIfSingleEmployer)}
          </p>
          <p>
            {t('form16-shock.tds')}: {formatINR(result.tdsTotal)}
          </p>
        </Card>
        <p className="text-[13px] text-ink-soft">{t('form16-shock.stdNote')}</p>
        <p className="text-[13px] text-ink-soft">{t('form16-shock.omit234')}</p>
        <Card className="space-y-2">
          <h3 className="text-sm font-bold">{t('form16-shock.form12bTitle')}</h3>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">{form12b}</p>
          <CopyButton text={form12b} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
          <p className="text-xs leading-relaxed text-ink-faint">{t('form16-shock.form12bNote')}</p>
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
