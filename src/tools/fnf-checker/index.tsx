import { useEffect, useMemo, useState } from 'react'
import { auditFnF, disputeItems } from '../../engine/fnf'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  CopyButton,
  DateField,
  Disclaimer,
  ExampleNote,
  MoneyField,
  NumberField,
  ShareRow,
  TextField,
  Toggle,
  VerdictBanner,
} from '../../components/ui'
import { applyCurrentJob, loadCurrentJob, rememberCurrentJob } from '../../data/currentJob'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

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

export default function FnfCheckerTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="fnf-checker">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT)
  const [hydrated, setHydrated] = useState(false)
  /** What first paint showed when nothing was saved here; the example the user has not yet edited. */
  const [example, setExample] = useState<Draft | null>(DEFAULT_DRAFT)

  useEffect(() => {
    // Basic and gross start from the current-job record. Only the basic is
    // written back: the gross here is what the F&F sheet CLAIMS, which is the
    // thing being checked, not a fact about the job.
    const job = loadCurrentJob()
    const fill = (d: Draft) =>
      applyCurrentJob(d, job, { monthlyBasic: 'monthlyBasic', monthlyGross: 'monthlyGross' })
    const saved = readJson<Partial<Draft> | null>(STORAGE_KEY, null)
    if (saved) {
      // Spread over the default so a draft saved before the mail fields existed
      // hydrates with empty names instead of undefined.
      setDraft(fill({ ...DEFAULT_DRAFT, ...saved }))
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

  const input = useMemo(
    () => ({
      joinDate: draft.joinDate,
      lastWorkingDay: draft.lastWorkingDay,
      monthlyBasic: draft.monthlyBasic,
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
    }),
    [draft, t],
  )
  const result = useMemo(() => auditFnF(input), [input])
  const disputes = useMemo(() => disputeItems(input, result), [input, result])

  /** Nothing typed in this tool yet = worked example, even where the record filled a field. */
  const isExample = JSON.stringify(draft) === JSON.stringify(example ?? DEFAULT_DRAFT)

  const verdict =
    result.netPayable < 0
      ? t('fnf-checker.verdict.owe', { amount: formatINR(-result.netPayable) })
      : t('fnf-checker.verdict.pay', { amount: formatINR(result.netPayable) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = [
    verdict,
    ...result.lines.map(
      (line) =>
        `${t(`fnf-checker.line.${line.id}`, { fallbackLabel: line.label })}: ${formatINR(line.claimed)} → ${formatINR(line.recomputed)}${
          line.delta !== 0 ? ` (${formatINR(line.delta)})` : ''
        }`,
    ),
    t('ui.disclaimer'),
  ].join('\n')

  const label = (id: string) => t(`fnf-checker.line.${id}`, { fallbackLabel: id })
  const mail = [
    t('fnf-checker.mail.subject', { n: disputes.length }),
    '',
    t('fnf-checker.mail.greeting', { hr: draft.hrName.trim() || t('fnf-checker.mail.hrTeam') }),
    '',
    t('fnf-checker.mail.intro', { lwd: draft.lastWorkingDay }),
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
    <div data-tool="fnf-checker" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('fnf-checker.formTitle')}</h2>
        <DateField label={t('fnf-checker.join')} value={draft.joinDate} onChange={(v) => set({ joinDate: v })} />
        <DateField label={t('fnf-checker.lwd')} value={draft.lastWorkingDay} onChange={(v) => set({ lastWorkingDay: v })} />
        <MoneyField
          label={t('fnf-checker.basic')}
          hint={t('ui.money.hint')}
          value={draft.monthlyBasic}
          onChange={(v) => {
            set({ monthlyBasic: v })
            rememberCurrentJob({ monthlyBasic: v })
          }}
        />
        <MoneyField label={t('fnf-checker.gross')} hint={t('ui.money.hint')} value={draft.monthlyGross} onChange={(v) => set({ monthlyGross: v })} />
        <NumberField label={t('fnf-checker.unpaid')} suffix={t('unit.days')} value={draft.unpaidLeaveDays} onChange={(v) => set({ unpaidLeaveDays: v })} />
        <MoneyField label={t('fnf-checker.noticeAmt')} hint={t('fnf-checker.noticeHint')} value={draft.noticeRecovery} onChange={(v) => set({ noticeRecovery: v })} />
        <Toggle label={t('fnf-checker.gratuity')} checked={draft.gratuityEligible} onChange={(v) => set({ gratuityEligible: v })} />
        <TextField
          label={t('fnf-checker.mailHr')}
          hint={t('fnf-checker.mailHrHint')}
          value={draft.hrName}
          onChange={(v) => set({ hrName: v })}
        />
        <TextField label={t('fnf-checker.mailYou')} value={draft.yourName} onChange={(v) => set({ yourName: v })} />
        <p className="text-xs leading-snug text-ink-faint">{t('ui.currentJob')}</p>
      </Card>
      <div className="-order-1 space-y-4 lg:order-none">
        {isExample ? (
          <ExampleNote chip={t('ui.exampleChip')} note={t('ui.exampleNote')} />
        ) : (
          <VerdictBanner tone={result.netPayable < 0 ? 'alarm' : 'leaf'}>{verdict}</VerdictBanner>
        )}
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('fnf-checker.audit')}</h3>
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
        {result.flags.map((f) => (
          <p key={f.id} className={`text-[13px] ${f.severity === 'red' ? 'text-alarm' : 'text-amberflag'}`}>
            {t(`fnf-checker.flag.${f.id}`, f.params)}
          </p>
        ))}
        {!isExample && (
          <Card className="space-y-3">
            <h3 className="text-sm font-bold">{t('fnf-checker.mailTitle')}</h3>
            {disputes.length === 0 ? (
              <p className="text-[13px] leading-relaxed text-ink-soft">{t('fnf-checker.mailNothing')}</p>
            ) : (
              <>
                <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed">{mail}</pre>
                {canSend ? (
                  <CopyButton text={mail} label={t('ui.copy')} copiedLabel={t('ui.copied')} />
                ) : (
                  <p className="text-[13px] font-semibold text-amberflag">{t('fnf-checker.mailBlocked')}</p>
                )}
                <p className="text-xs leading-relaxed text-ink-faint">{t('fnf-checker.mailNote')}</p>
              </>
            )}
          </Card>
        )}
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
