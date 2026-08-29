import { useEffect, useMemo, useState } from 'react'
import type { OfferInput } from '../../engine/types'
import { variableReality } from '../../engine/variable'
import { formatINR, formatLPA } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  ExampleNote,
  InheritNote,
  MoneyField,
  NumberField,
  ShareRow,
  VerdictBanner,
} from '../../components/ui'
import { DEFAULT_OFFER, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, useLang, type Lang } from '../../i18n'
import { withLang } from '../../lib/langPath'

const STORAGE_KEY = 'switchkarle.variable.v1' as const

interface Draft {
  ctc: number
  variable: number
  monthsInFy: number
}

/** What first paint shows when the Decoder has not seeded anything. */
const FIXTURE: Draft = {
  ctc: DEFAULT_OFFER.ctcAnnual,
  variable: DEFAULT_OFFER.variableAnnual,
  monthsInFy: 12,
}

function fromDecoder(): Draft {
  const o = loadOffer()
  return { ctc: o.ctcAnnual, variable: o.variableAnnual, monthsInFy: 12 }
}

export default function VariableRealityTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="variable-reality">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(FIXTURE)
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
/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(FIXTURE)
  const verdict = t('variable-reality.verdict', {
    pct: atRiskPct,
    fixed: formatINR(result.inHandMonthlyFixed),
    full: formatINR(result.rows[2]!.inHandMonthlyIfSpread),
  })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = [
    verdict,
    t('variable-reality.split', { fixed: formatLPA(result.fixedCtc), risk: formatLPA(result.proratedVariable) }),
    t('ui.disclaimer'),
  ].join('\n')

  return (
    <div data-tool="variable-reality" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('variable-reality.formTitle')}</h2>
        <MoneyField label={t('decoder.field.ctc.label')} hint={t('ui.money.hint')} value={draft.ctc} onChange={(v) => set({ ctc: v })} />
        <MoneyField
          label={t('decoder.field.variable.label')}
          hint={t('ui.money.hint')}
          value={draft.variable}
          onChange={(v) => set({ variable: v })}
        />
        <NumberField
          label={t('variable-reality.months')}
          hint={t('variable-reality.monthsHint')}
          suffix={t('unit.months')}
          max={12}
          value={draft.monthsInFy}
          onChange={(v) => set({ monthsInFy: v })}
        />
        <InheritNote text={t('ui.inherit')} linkLabel={t('ui.inheritLink')} href={withLang(lang, 'decoder')} />
      </Card>

      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={atRiskPct > 15 ? 'amber' : 'leaf'}>{verdict}</VerdictBanner>
        )}
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
        {!isExample && (
          <ShareRow
            copyText={copyText}
            copyLabel={t('ui.copy')}
            copiedLabel={t('ui.copied')}
            printLabel={t('ui.print')}
          />
        )}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
