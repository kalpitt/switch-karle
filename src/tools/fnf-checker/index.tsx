import { useEffect, useMemo, useState } from 'react'
import { auditFnF, disputeItems } from '../../engine/fnf'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  ResultHeading,
  CopyButton,
  DateField,
  Disclaimer,
  MoneyField,
  NumberField,
  Receipt,
  ResultHero,
  ShareRow,
  TextField,
  Toggle,
} from '../../components/ui'
import { PrivacyLine } from '../../components/PrivacyLine'
import { NextStep } from '../../components/NextStep'
import { PlanDatesNote } from '../../components/PlanDatesNote'
import { TOOL_SOURCES } from '../../data/sources'
import { fillFromCurrentJob, loadCurrentJob, rememberCurrentJob } from '../../data/currentJob'
import { loadPlanDates, seedFromPlan, stillFromPlan, type PlanDateMap, type PlanDates } from '../../data/planDates'
import { readJson, writeJson } from '../../lib/storage'
import { useLang, useT, type Lang } from '../../i18n'
import { formatLongDate } from '../../lib/formatDate'

const STORAGE_KEY = 'switchkarle.fnf.v1' as const

interface Draft {
  joinDate: string
  lastWorkingDay: string
  monthlyBasic: number
  monthlyGross: number
  unpaidLeaveDays: number
  noticeRecovery: number
  gratuityEligible: boolean
  /** Only used to address the dispute mail. Never leaves the device. */
  hrName: string
  yourName: string
}

const DEFAULT_DRAFT: Draft = {
  joinDate: '2021-08-01',
  lastWorkingDay: '2026-08-31',
  monthlyBasic: 80_000,
  monthlyGross: 150_000,
  unpaidLeaveDays: 0,
  noticeRecovery: 0,
  gratuityEligible: true,
  hrName: '',
  yourName: '',
}

/** The plan's join date and last working day land here on a first visit (UX-16). */
const PLAN_MAP = { joinDate: 'joinDate', lastWorkingDay: 'lastWorkingDay' } as const satisfies PlanDateMap<Draft>

export default function FnfCheckerTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="fnf-checker">
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
  /** The plan dates placed on boot; empty when the tool had its own saved draft. */
  const [seeded, setSeeded] = useState<PlanDates>({})
  // Shared with the door and the gratuity calculator. Unknown reads as five
  // days in the engine; the switch below lets the person pick here too, and
  // writes the answer back so every tool agrees (decided 2026-11-07).
  const [workWeekDays, setWorkWeekDays] = useState<5 | 6 | undefined>(undefined)
  // Same: read-only from the door's coveredByAct answer. A user who told the
  // door their employer never had ten employees must not get a gratuity flag
  // here that assumes the Code reaches them.
  const [coveredByAct, setCoveredByAct] = useState<boolean | undefined>(undefined)
  // Read-only too: basic + DA as typed in the plan's "what this is worth" or
  // the gratuity tool. Gratuity is paid on basic + DA, so when it is known the
  // gratuity line uses it rather than this tool's plain-basic field (N4).
  const [basicDA, setBasicDA] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Basic is shared. Gross is seed-only: the field is what the F&F sheet
    // CLAIMS, which is the very thing this tool audits against the recomputed
    // figure. Overlaying the record on a saved draft would replace the claimed
    // number with the real one on every visit, so the audit would compare the
    // sheet against itself and report no gap.
    const job = loadCurrentJob()
    setWorkWeekDays(job.workWeekDays)
    setCoveredByAct(job.coveredByAct)
    setBasicDA(job.monthlyBasicDA)
    const saved = readJson<Partial<Draft> | null>(STORAGE_KEY, null)
    const fill = (d: Draft) =>
      fillFromCurrentJob(
        d,
        job,
        { shared: { monthlyBasic: 'monthlyBasic' }, seedOnly: { monthlyGross: 'monthlyGross' } },
        saved != null,
      )
    if (saved) {
      // Spread over the default so a draft saved before the mail fields existed
      // hydrates with empty names instead of undefined.
      setDraft(fill({ ...DEFAULT_DRAFT, ...saved }))
      setExample(null)
    } else {
      // No draft here yet: the plan's dates replace the sample ones. The
      // settlement figures stay a worked example until the person types the
      // ones their F&F sheet claims, so the Example tag stays too.
      const planned = seedFromPlan(DEFAULT_DRAFT, loadPlanDates(), PLAN_MAP, false)
      const boot = fill(planned.draft)
      setDraft(boot)
      setSeeded(planned.seeded)
      setExample(boot)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const input = useMemo(
    () => ({
      joinDate: draft.joinDate,
      lastWorkingDay: draft.lastWorkingDay,
      monthlyBasic: draft.monthlyBasic,
      monthlyBasicDA: basicDA,
      monthlyGross: draft.monthlyGross,
      unpaidLeaveDays: draft.unpaidLeaveDays,
      payslipLines: [
        { id: 'salary', label: t('fnf-checker.salary'), amount: draft.monthlyGross, kind: 'earning' as const },
      ],
      recoveries:
        draft.noticeRecovery > 0
          ? [{ id: 'notice', label: t('fnf-checker.notice'), amount: draft.noticeRecovery, kind: 'deduction' as const }]
          : [],
      gratuityEligible: draft.gratuityEligible,
      workWeekDays,
      coveredByAct,
    }),
    [draft, t, workWeekDays, coveredByAct, basicDA],
  )
  const result = useMemo(() => {
    try {
      return auditFnF(input)
    } catch {
      return null
    }
  }, [input])
  // The five-day assumption is said only where it changes the answer: the same
  // sheet recomputed on a six-day week gives a different gratuity (RC-02).
  const weekChangesGratuity = useMemo(() => {
    if (workWeekDays !== undefined || result == null) return false
    try {
      return auditFnF({ ...input, workWeekDays: 6 }).gratuityNotOnSheet !== result.gratuityNotOnSheet
    } catch {
      return false
    }
  }, [input, result, workWeekDays])
  const usesBasicDA = basicDA != null && basicDA > 0 && draft.gratuityEligible
  const disputes = useMemo(() => {
    if (!result) return []
    try {
      return disputeItems(input, result)
    } catch {
      return []
    }
  }, [input, result])

  /** Nothing typed in this tool yet = worked example, even where the record filled a field. */
  const isExample = JSON.stringify(draft) === JSON.stringify(example ?? DEFAULT_DRAFT)

  const verdict =
    result == null
      ? null
      : result.netPayable < 0
        ? t('fnf-checker.verdict.owe', { amount: formatINR(-result.netPayable) })
        : t('fnf-checker.verdict.pay', { amount: formatINR(result.netPayable) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))
  const fromPlan = stillFromPlan(draft, seeded, PLAN_MAP)
  /** Both dates are the plan's, so only figures can still be samples. */
  const planDated = fromPlan.joinDate !== undefined && fromPlan.lastWorkingDay !== undefined
  // A plan-derived last working day rests on our day-one reading: say so on the receipt.
  const receiptIds = fromPlan.lastWorkingDay
    ? [...TOOL_SOURCES['fnf-checker'], 'last-working-day']
    : TOOL_SOURCES['fnf-checker']

  const copyText =
    result && verdict
      ? [
          verdict,
          ...result.lines.map(
            (line) =>
              `${t(`fnf-checker.line.${line.id}`, { fallbackLabel: line.label })}: ${formatINR(line.claimed)} → ${formatINR(line.recomputed)}${
                line.delta !== 0 ? ` (${formatINR(line.delta)})` : ''
              }`,
          ),
          t('ui.disclaimer'),
        ].join('\n')
      : ''

  const label = (id: string) => t(`fnf-checker.line.${id}`, { fallbackLabel: id })
  const mail = [
    disputes.length === 1 ? t('fnf-checker.mail.subjectOne') : t('fnf-checker.mail.subject', { n: disputes.length }),
    '',
    t('fnf-checker.mail.greeting', { hr: draft.hrName.trim() || t('fnf-checker.mail.hrTeam') }),
    '',
    t('fnf-checker.mail.intro', { lwd: formatLongDate(draft.lastWorkingDay, lang) }),
    '',
    ...disputes.map((item, i) =>
      t(`fnf-checker.mail.${item.kind}`, {
        n: i + 1,
        label: label(item.id),
        claimed: formatINR(item.claimed),
        recomputed: formatINR(item.recomputed),
        delta: formatINR(Math.abs(item.delta)),
      }),
    ),
    '',
    t('fnf-checker.mail.close'),
    '',
    t('fnf-checker.mail.signoff', { name: draft.yourName.trim() }),
  ].join('\n')
  const canSend = disputes.length > 0 && draft.yourName.trim() !== ''

  return (
    <div data-tool="fnf-checker" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:grid-rows-[auto_1fr] lg:items-start">
      <div className="space-y-4 lg:order-last">
        <ResultHeading />
        {result && verdict ? (
          <ResultHero
            sample={isExample}
            sampleNote={planDated ? t('plan-dates.sampleNote') : undefined}
            label={t(result.netPayable < 0 ? 'hero.fnf-checker.owe' : 'hero.fnf-checker.pay')}
            value={formatINR(Math.abs(result.netPayable))}
            verdict={verdict}
            tone={result.netPayable < 0 ? 'alarm' : 'leaf'}
          >
            <PlanDatesNote dates={fromPlan} />
            <Receipt ids={receiptIds} />
          </ResultHero>
        ) : (
          <>
            <PlanDatesNote dates={fromPlan} />
            <Receipt ids={receiptIds} />
          </>
        )}
        {result && (
          <Card>
            <h3 className="mb-2 text-[15px] font-semibold">{t('fnf-checker.audit')}</h3>
            {result.lines.map((line) => (
              <p key={line.id} className="tnum flex justify-between gap-3 text-[13px]">
                <span>{t(`fnf-checker.line.${line.id}`, { fallbackLabel: line.label })}</span>
                <span>
                  {formatINR(line.claimed)} → {formatINR(line.recomputed)}
                  {line.delta !== 0 ? ` (${formatINR(line.delta)})` : ''}
                </span>
              </p>
            ))}
          </Card>
        )}
        {result?.flags.map((f) => (
          <p key={f.id} className={`text-[13px] ${f.severity === 'red' ? 'text-alarm' : 'text-amberflag'}`}>
            {t(`fnf-checker.flag.${f.id}`, f.params)}
          </p>
        ))}
        {/* Decided 2026-09-27: an unknown work week takes the five-day reading,
            the one that agrees with a user who says gratuity is due. Said out
            loud, because on a six-day week the same dates may not qualify. */}
        {workWeekDays === undefined && result != null && result.gratuityNotOnSheet > 0 && weekChangesGratuity && (
          <p className="text-[13px] leading-snug text-ink-soft">{t('fnf-checker.weekAssumed')}</p>
        )}
        {usesBasicDA && result != null && result.gratuityNotOnSheet > 0 && (
          <p className="text-[13px] leading-snug text-ink-soft">
            {t('fnf-checker.basicDAUsed', { amount: formatINR(basicDA) })}
          </p>
        )}
        {!isExample && result && (
          <Card className="space-y-3">
            <h3 className="text-[15px] font-semibold">{t('fnf-checker.mailTitle')}</h3>
            {disputes.length === 0 ? (
              <p className="text-[14px] leading-relaxed text-ink-soft">{t('fnf-checker.mailNothing')}</p>
            ) : (
              <>
                <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{mail}</pre>
                {canSend ? (
                  <CopyButton text={mail} label={t('ui.copyEmail')} copiedLabel={t('ui.copied')} />
                ) : (
                  <p className="text-[13px] font-semibold text-amberflag">{t('fnf-checker.mailBlocked')}</p>
                )}
                <p className="text-xs leading-relaxed text-ink-faint">{t('fnf-checker.mailNote')}</p>
              </>
            )}
          </Card>
        )}
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
      <Card className="space-y-3 lg:row-span-2 lg:sticky lg:top-20">
        <h2 className="text-[18px] font-semibold leading-snug">{t('fnf-checker.formTitle')}</h2>
        <PrivacyLine />
        <DateField label={t('fnf-checker.join')} value={draft.joinDate} onChange={(v) => set({ joinDate: v })} />
        <DateField label={t('fnf-checker.lwd')} value={draft.lastWorkingDay} onChange={(v) => set({ lastWorkingDay: v })} />
        <MoneyField
          label={t('fnf-checker.basic')}
          placeholder={t('ui.money.placeholderMonthly')}
          value={draft.monthlyBasic}
          onChange={(v) => {
            set({ monthlyBasic: v })
            rememberCurrentJob({ monthlyBasic: v })
          }}
        />
        <MoneyField label={t('fnf-checker.gross')} placeholder={t('ui.money.placeholderMonthly')} value={draft.monthlyGross} onChange={(v) => set({ monthlyGross: v })} />
        <NumberField label={t('fnf-checker.unpaid')} suffix={t('unit.days')} value={draft.unpaidLeaveDays} onChange={(v) => set({ unpaidLeaveDays: v })} />
        <MoneyField label={t('fnf-checker.noticeAmt')} hint={t('fnf-checker.noticeHint')} value={draft.noticeRecovery} onChange={(v) => set({ noticeRecovery: v })} />
        <Toggle label={t('fnf-checker.gratuity')} checked={draft.gratuityEligible} onChange={(v) => set({ gratuityEligible: v })} />
        {draft.gratuityEligible && (
          <>
            <Toggle
              label={t('gratuity.week5.label')}
              checked={(workWeekDays ?? 5) === 5}
              onChange={(v) => {
                const week = v ? 5 : 6
                setWorkWeekDays(week)
                rememberCurrentJob({ workWeekDays: week })
              }}
            />
            {/* Decided 2026-11-07: five days until the person picks, said plainly. */}
            {workWeekDays === undefined && (
              <p className="text-[13px] leading-snug text-ink-soft">{t('gratuity.weekAssumed')}</p>
            )}
          </>
        )}
        <TextField
          label={t('fnf-checker.mailHr')}
          hint={t('fnf-checker.mailHrHint')}
          value={draft.hrName}
          onChange={(v) => set({ hrName: v })}
        />
        <TextField label={t('fnf-checker.mailYou')} value={draft.yourName} onChange={(v) => set({ yourName: v })} />
        <p className="text-xs leading-snug text-ink-faint">{t('ui.currentJob')}</p>
      </Card>
      <NextStep className="lg:order-last lg:col-start-2" from="fnf-checker" />
    </div>
  )
}
