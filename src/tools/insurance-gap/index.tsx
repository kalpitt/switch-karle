import { useEffect, useMemo, useState } from 'react'
import { IslandRoot } from '../../components/IslandRoot'
import { Card, DateField, Disclaimer, ResultHero, Toggle } from '../../components/ui'
import { addDays } from '../../engine/dates'
import { todayIso } from '../../lib/today'
import { insuranceGap } from '../../engine/insurance'
import { formatLongDate } from '../../lib/formatDate'
import { readJson, writeJson } from '../../lib/storage'
import { useLang, useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.insurance.v1' as const

interface Draft {
  lastWorkingDay: string
  newJoinDate: string
  hasPersonalCover: boolean
}

function skeleton(): Draft {
  const today = todayIso()
  return { lastWorkingDay: today, newJoinDate: addDays(today, 15), hasPersonalCover: false }
}

export default function InsuranceGapTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="insurance-gap">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const { lang } = useLang()
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

/** Untouched fixture on first paint = worked example, not the user's data. */
  const isExample = JSON.stringify(draft) === JSON.stringify(skeleton())
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const verdict =
    !result
      ? t('insurance-gap.verdict.none')
      : result.uncoveredDays === 0
        ? t('insurance-gap.verdict.none')
        : result.uncovered
          ? t(result.uncoveredDays === 1 ? 'insurance-gap.verdict.gapOne' : 'insurance-gap.verdict.gap', {
              days: result.uncoveredDays,
              lwd: formatLongDate(result.groupCoverEndsOn, lang),
            })
          : t(result.uncoveredDays === 1 ? 'insurance-gap.verdict.coveredOne' : 'insurance-gap.verdict.covered', {
              days: result.uncoveredDays,
            })

  return (
    <div data-tool="insurance-gap" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-20">
        <h2 className="text-[18px] font-semibold leading-snug">{t('insurance-gap.formTitle')}</h2>
        <DateField label={t('insurance-gap.lwd')} value={draft.lastWorkingDay} onChange={(v) => set({ lastWorkingDay: v })} />
        <DateField label={t('insurance-gap.join')} value={draft.newJoinDate} onChange={(v) => set({ newJoinDate: v })} />
        <Toggle label={t('insurance-gap.personal')} checked={draft.hasPersonalCover} onChange={(v) => set({ hasPersonalCover: v })} />
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <ResultHero
          sample={isExample}
          label={t('hero.insurance-gap')}
          value={String(result?.uncovered ? result.uncoveredDays : 0)}
          unit={` ${t('unit.days')}`}
          verdict={verdict}
          tone={result?.uncovered ? 'alarm' : 'leaf'}
        >
          {result && result.uncoveredDays > 0 && (
            <GapStrip
              covered={!result.uncovered}
              from={formatLongDate(result.groupCoverEndsOn, lang)}
              to={formatLongDate(draft.newJoinDate, lang)}
              days={result.uncoveredDays}
            />
          )}
        </ResultHero>
        {result?.joinOverlapsLwd && <p className="text-[14px] leading-relaxed text-amberflag">{t('insurance-gap.overlap')}</p>}
        <Card className="space-y-2">
          <h3 className="text-[15px] font-semibold">{t('insurance-gap.factors')}</h3>
          {result?.factorIds.map((id) => (
            <p key={id} className="text-[14px] leading-relaxed text-ink-soft">
              {t(`insurance-gap.factor.${id}`)}
            </p>
          ))}
        </Card>
        <Disclaimer>{t('ui.disclaimer.guide')}</Disclaimer>
      </div>
    </div>
  )
}

/**
 * The gap between two group covers, drawn (VIS-24): old cover, the uncovered days in
 * loss red (or in green when a personal policy fills them), new cover. A schematic,
 * not to scale; the two dates under it are the edges of the gap.
 */
function GapStrip({ covered, from, to, days }: { covered: boolean; from: string; to: string; days: number }) {
  const t = useT()
  return (
    <div aria-hidden="true">
      <div className="flex h-2.5 gap-1">
        <span className="w-[30%] rounded-l-full bg-ink" />
        <span className={`flex-1 rounded-sm ${covered ? 'bg-leaf' : 'bg-alarm'}`} />
        <span className="w-[30%] rounded-r-full bg-ink" />
      </div>
      <p className="tnum mt-1.5 flex justify-between gap-3 text-[12px] text-ink-faint">
        <span>{from}</span>
        <span className={`font-semibold ${covered ? 'text-leaf' : 'text-alarm'}`}>
          {days} {t('unit.days')}
        </span>
        <span className="text-right">{to}</span>
      </p>
    </div>
  )
}

