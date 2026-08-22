import { useEffect, useMemo, useState } from 'react'
import type { OfferInput } from '../../engine/types'
import { variableReality } from '../../engine/variable'
import { formatINR, formatLPA } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, Disclaimer, MoneyField, NumberField, VerdictBanner } from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT } from '../../i18n'

const STORAGE_KEY = 'switchkarle.variable.v1' as const
const L = 100_000

interface Draft {
  ctc: number
  variable: number
  monthsInFy: number
}

function fromDecoder(): Draft {
  const o = loadOffer()
  return { ctc: o.ctcAnnual, variable: o.variableAnnual, monthsInFy: 12 }
}

export default function VariableRealityTool() {
  return (
    <IslandRoot current="variable-reality">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    ctc: DEFAULT_OFFER.ctcAnnual,
    variable: DEFAULT_OFFER.variableAnnual,
    monthsInFy: 12,
  })
  const [template, setTemplate] = useState<OfferInput>(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const offer = loadOffer()
    setTemplate(offer)
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    setDraft(saved ?? fromDecoder())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const offer: OfferInput = useMemo(
    () => ({ ...template, ctcAnnual: draft.ctc, variableAnnual: draft.variable }),
    [template, draft.ctc, draft.variable],
  )
  const result = useMemo(() => variableReality({ offer, monthsInFy: draft.monthsInFy }), [offer, draft.monthsInFy])
  const atRiskPct = result.quotedVariable <= 0 || draft.ctc <= 0 ? 0 : Math.round((result.quotedVariable / draft.ctc) * 100)
  const verdict = t('variable-reality.verdict', {
    pct: atRiskPct,
    fixed: formatINR(result.inHandMonthlyFixed),
    full: formatINR(result.rows[2]!.inHandMonthlyIfSpread),
  })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div data-tool="variable-reality" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('variable-reality.formTitle')}</h2>
        <MoneyField label={t('decoder.field.ctc.label')} hint={t('ui.money.hint')} value={draft.ctc} onChange={(v) => set({ ctc: v })} />
        <NumberField
          label={t('decoder.field.variable.label')}
          suffix="LPA"
          step={0.5}
          value={draft.variable / L}
          onChange={(v) => set({ variable: v * L })}
        />
        <NumberField
          label={t('variable-reality.months')}
          hint={t('variable-reality.monthsHint')}
          suffix="mo"
          max={12}
          value={draft.monthsInFy}
          onChange={(v) => set({ monthsInFy: v })}
        />
      </Card>

      <div className="space-y-4">
        <VerdictBanner tone={atRiskPct > 15 ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        <Card>
          <h3 className="mb-3 text-sm font-bold">{t('variable-reality.table')}</h3>
          <div className="space-y-2">
            {result.rows.map((row) => (
              <p key={row.fraction} className="tnum flex justify-between text-[13px]">
                <span>{t('variable-reality.row', { pct: Math.round(row.fraction * 100) })}</span>
                <span className="font-bold">{formatINR(row.inHandMonthlyIfSpread)}/mo</span>
              </p>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-ink-soft">
            {t('variable-reality.split', {
              fixed: formatLPA(result.fixedCtc),
              risk: formatLPA(result.proratedVariable),
            })}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t('variable-reality.withheld', { amount: formatINR(result.withheldVsSpread.lumpNet) })}
          </p>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            {t('variable-reality.spread', { amount: formatINR(result.withheldVsSpread.spreadMonthly) })}
          </p>
          {result.firstYearProrate && (
            <p className="text-[13px] text-amberflag">{t('variable-reality.prorate', { months: result.monthsInFy })}</p>
          )}
          <p className="text-[13px] text-ink-soft">{t('variable-reality.fullYearTax')}</p>
        </Card>
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
