import { useEffect, useMemo, useState } from 'react'
import { gratuity } from '../../engine/gratuity'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  DateField,
  Disclaimer,
  MoneyField,
  ProgressStrip,
  Receipt,
  ResultHero,
  ShareRow,
  Toggle,
} from '../../components/ui'
import { PrivacyLine } from '../../components/PrivacyLine'
import { TOOL_SOURCES } from '../../data/sources'
import { fillFromCurrentJob, loadCurrentJob, rememberCurrentJob } from '../../data/currentJob'
import { formatLongDate } from '../../lib/formatDate'
import { daysBetween } from '../../engine/dates'
import { readJson, writeJson } from '../../lib/storage'
import { useLang, useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.gratuity.v1' as const

/** Days from one ISO date to another, 0 when either is not a date yet. */
function daysBetweenIso(from: string, to: string): number {
  try {
    return Math.max(0, daysBetween(from, to))
  } catch {
    return 0
  }
}

interface Draft {
  lastDrawnBasicDA: number
  joinDate: string
  exitDate: string
  coveredByAct: boolean
  /** 5-day or 6-day establishment week; missing in old drafts → engine defaults to 6. */
  workWeekDays?: 5 | 6
}

const DEFAULT_DRAFT: Draft = {
  lastDrawnBasicDA: 100_000,
  joinDate: '2021-08-01',
  exitDate: '2026-08-31',
  coveredByAct: true,
  workWeekDays: 6,
}

export default function GratuityTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="gratuity">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const { lang } = useLang()
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [hydrated, setHydrated] = useState(false)
  /** What first paint showed when nothing was saved here; the example the user has not yet edited. */
  const [example, setExample] = useState<Draft | null>(DEFAULT_DRAFT)

  useEffect(() => {
    // Gratuity is on basic + DA (see the VERIFIED marker in src/engine/gratuity.ts), so it reads `monthlyBasicDA` and
    // never the plain basic the other exit tools share.
    const job = loadCurrentJob()
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    const fill = (d: Draft) =>
      fillFromCurrentJob(
        d,
        job,
        // The work week is shared too: the home plan and the F&F checker read it,
        // and the same person must not be 6-day here and 5-day there.
        { shared: { monthlyBasicDA: 'lastDrawnBasicDA', workWeekDays: 'workWeekDays' } },
        saved != null,
      )
    if (saved) {
      setDraft(fill(saved))
      setExample(null)
    } else {
      const boot = fill(DEFAULT_DRAFT)
      setDraft(boot)
      setExample(boot)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => {
    try {
      return gratuity(draft)
    } catch {
      return null
    }
  }, [draft])
  /** Nothing typed in this tool yet = worked example, even where the record filled the basic. */
  const isExample =
    JSON.stringify({ ...draft, workWeekDays: draft.workWeekDays ?? 6 }) ===
    JSON.stringify(example ?? DEFAULT_DRAFT)
  const verdict = result
    ? result.eligible
      ? t('gratuity.verdict.yes', { amount: formatINR(result.amount), years: result.completedYears })
      : t('gratuity.verdict.no', { years: result.completedYears })
    : null
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = result && verdict
    ? [verdict, result.flipDate ? t('gratuity.flip', { date: formatLongDate(result.flipDate, lang) }) : '', t('ui.disclaimer')]
        .filter(Boolean)
        .join('\n')
    : ''

  return (
    <div data-tool="gratuity" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-20">
        <h2 className="text-[18px] font-semibold leading-snug">{t('gratuity.formTitle')}</h2>
        <PrivacyLine />
        <MoneyField
          label={t('gratuity.basic')}
          hint={t('gratuity.basicHint')}
          value={draft.lastDrawnBasicDA}
          onChange={(v) => {
            set({ lastDrawnBasicDA: v })
            rememberCurrentJob({ monthlyBasicDA: v })
          }}
        />
        <DateField label={t('gratuity.join')} value={draft.joinDate} onChange={(v) => set({ joinDate: v })} />
        <DateField label={t('gratuity.exit')} value={draft.exitDate} onChange={(v) => set({ exitDate: v })} />
        <Toggle
          label={t('gratuity.covered')}
          hint={t('gratuity.coveredHint')}
          checked={draft.coveredByAct}
          onChange={(v) => set({ coveredByAct: v })}
        />
        <Toggle
          label={t('gratuity.week5.label')}
          hint={t('gratuity.week5.hint')}
          checked={draft.workWeekDays === 5}
          onChange={(v) => {
            const workWeekDays = v ? 5 : 6
            set({ workWeekDays })
            rememberCurrentJob({ workWeekDays })
          }}
        />
        <p className="text-xs leading-snug text-ink-faint">{t('ui.currentJob')}</p>
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        <ResultHero
          sample={isExample}
          label={t('hero.gratuity')}
          value={result?.eligible ? formatINR(result.amount) : undefined}
          verdict={verdict}
          tone={result?.eligible ? 'leaf' : 'amber'}
        >
          {result && !result.eligible && result.flipDate && (
            <ProgressStrip
              pct={(daysBetweenIso(draft.joinDate, draft.exitDate) / Math.max(1, daysBetweenIso(draft.joinDate, result.flipDate))) * 100}
              start={formatLongDate(draft.joinDate, lang)}
              end={formatLongDate(result.flipDate, lang)}
            />
          )}
          <Receipt ids={TOOL_SOURCES['gratuity']} />
          {result?.eligible && <p className="text-[14px] leading-relaxed text-ink-soft">{t('gratuity.formula')}</p>}
          {result?.flipDate && (
            <p className="text-[14px] leading-relaxed text-ink-soft">{t('gratuity.flip', { date: formatLongDate(result.flipDate, lang) })}</p>
          )}
        </ResultHero>
        {result?.notes.map((n) => (
          <p key={n.id} className="text-[14px] leading-relaxed text-ink-soft">
            {t(`gratuity.note.${n.id}`)}
          </p>
        ))}
        {!isExample && result && (
          <ShareRow
            copyText={copyText}
            copyLabel={t('ui.copyResult')}
            copiedLabel={t('ui.copied')}
            printLabel={t('ui.print')}
          />
        )}
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
