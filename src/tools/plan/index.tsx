import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  cliffs as computeCliffs,
  hikeCliffDate,
  switchCalendar,
  type Cliff,
  type SwitchCalendarInput,
  type Trade,
} from '../../engine/switchCalendar'
import { loadCurrentJob, rememberCurrentJob, type CurrentJob } from '../../data/currentJob'
import { erasePlan, loadPlan, savePlan, type Plan } from '../../data/plan'
import { buildDatesIcs, DATES_ICS_FILENAME } from '../../lib/ics'
import { formatLongDate, formatMonthYear } from '../../lib/formatDate'
import { withLang } from '../../lib/langPath'
import { todayIso } from '../../lib/today'
import { Card, DateField, ExampleNote, NumberField, Select, TextArea } from '../../components/ui'
import { useLang, useT, type Lang } from '../../i18n'
import { chosenGratuityCliff, isGratuityCliff } from './fork'
import { planIcsEvents, planSiteUrl } from './planEvents'

/**
 * The front door: three questions, the dates they produce, and a date to leave
 * on — then the same plan handed back on every later visit.
 *
 * Spec: docs/DIRECTION.md Part 3 (the first session), Part 4 (coming back) and
 * Part 13 (Phase 0). This is the home page, not a registry tool: it has no
 * slug of its own in Phase 0 and `src/tools/home/index.tsx` renders it.
 *
 * Two records and one home per fact. Join date, notice period, work week and
 * Act coverage are facts about the employer and go to `currentJob`; the reason,
 * the hike month, the date picked and `lookingSince` are what the plan invented
 * and go to the plan. **No money is asked for or stored anywhere here** — a
 * date needs a join date and a notice period, and rule 11 puts money after a
 * date, behind the "what this is worth" link.
 *
 * Nothing is written on mount. Every write below hangs off a button the user
 * pressed.
 */

type Step = 'questions' | 'cliffs' | 'dates'

interface Answers {
  joinDate: string
  noticePeriodDays: number
  /** 1–12, or 0 for "skip this". */
  hikeCreditMonth: number
}

/**
 * Ravi from Part 3, and the reason the first screen is not blank: rule 1 says a
 * real calendar renders before anyone types. These fill the fields, the chip
 * says out loud that they are an example, and the chip goes the moment the user
 * edits anything.
 */
const EXAMPLE: Answers = { joinDate: '2022-01-12', noticePeriodDays: 90, hikeCreditMonth: 5 }

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

export function Plan({ belowDoor }: { belowDoor?: ReactNode }) {
  const t = useT()
  const { lang } = useLang()

  // Empty until the effect below runs. The static build renders this component
  // once at build time, so reading the clock in a state initialiser would make
  // the first client render disagree with the server's and break hydration.
  const [today, setToday] = useState('')
  const [job, setJob] = useState<CurrentJob>({})
  const [plan, setPlan] = useState<Plan>({})
  const [answers, setAnswers] = useState<Answers>(EXAMPLE)
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState<Step>('questions')
  const [returning, setReturning] = useState(false)
  const [repicking, setRepicking] = useState(false)

  useEffect(() => {
    const savedJob = loadCurrentJob()
    const savedPlan = loadPlan()
    setToday(todayIso())
    setJob(savedJob)
    setPlan(savedPlan)
    setAnswers({
      joinDate: savedJob.joinDate ?? EXAMPLE.joinDate,
      noticePeriodDays: savedJob.noticePeriodDays ?? EXAMPLE.noticePeriodDays,
      hikeCreditMonth: savedPlan.hikeCreditMonth ?? EXAMPLE.hikeCreditMonth,
    })
    // A value the user typed in some other tool is theirs, not an example, and
    // rule 7 says it is never asked for twice.
    if (savedJob.joinDate != null || savedJob.noticePeriodDays != null) setTouched(true)
    if (savedPlan.resignDate != null) setReturning(true)
  }, [])

  const answered = (patch: Partial<Answers>) => {
    setTouched(true)
    setAnswers((a) => ({ ...a, ...patch }))
  }

  const hikeYear =
    plan.hikeCreditMonth === answers.hikeCreditMonth ? plan.hikeCreditYear : undefined

  const input: SwitchCalendarInput = {
    joinDate: answers.joinDate,
    noticePeriodDays: answers.noticePeriodDays,
    hikeCreditMonth: answers.hikeCreditMonth > 0 ? answers.hikeCreditMonth : undefined,
    hikeCreditYear: hikeYear,
    workWeekDays: job.workWeekDays,
    coveredByAct: job.coveredByAct ?? true,
    targetResignDate: plan.resignDate,
    // The engine is a pure function of its input, so it needs a day even before
    // the effect has run. Nothing derived from this renders until `today` is set.
    asOf: today === '' ? '2000-01-01' : today,
  }

  // Not memoised on purpose: the whole calculation is a few date additions on
  // a handful of fields, and a memo keyed on this object would need a stringify
  // that costs more than the arithmetic it saves.
  const result = switchCalendar(input)
  /** Both readings of the gratuity cliff, whatever the user has already answered. */
  const forkCliffs = computeCliffs({ ...input, workWeekDays: undefined }).filter(isGratuityCliff)

  const fmt = (iso: string) => formatLongDate(iso, lang)

  // ---- writes. Every one of these is a button the user pressed. ----

  function submitQuestions() {
    rememberCurrentJob({
      joinDate: answers.joinDate,
      noticePeriodDays: answers.noticePeriodDays,
    })
    if (answers.hikeCreditMonth > 0) {
      // The year the month resolved to is pinned now, so a plan saved this
      // September still means May 2027 when it is reopened in June 2027.
      const keep = plan.hikeCreditMonth === answers.hikeCreditMonth && plan.hikeCreditYear != null
      const cliff = hikeCliffDate(answers.hikeCreditMonth, today)
      const year = keep ? plan.hikeCreditYear : cliff == null ? null : Number(cliff.slice(0, 4))
      savePlan({ hikeCreditMonth: answers.hikeCreditMonth, hikeCreditYear: year ?? null })
    } else {
      savePlan({ hikeCreditMonth: null, hikeCreditYear: null })
    }
    setJob(loadCurrentJob())
    setPlan(loadPlan())
    setStep('cliffs')
  }

  function chooseWeek(days: 5 | 6) {
    rememberCurrentJob({ workWeekDays: days })
    setJob(loadCurrentJob())
  }

  function chooseCoverage(covered: boolean) {
    rememberCurrentJob({ coveredByAct: covered })
    setJob(loadCurrentJob())
  }

  function pickResignDate(date: string) {
    savePlan({ resignDate: date })
    setPlan(loadPlan())
    setRepicking(false)
  }

  function startLooking() {
    // Records the day, unlocks nothing on screen in Phase 0, and does not move
    // the resign date. Someone can be looking in September and leaving in June.
    savePlan({ lookingSince: today })
    setPlan(loadPlan())
  }

  function saveReason(text: string) {
    savePlan({ reason: text.trim() === '' ? null : text })
    setPlan(loadPlan())
  }

  function changeDate() {
    setReturning(false)
    setRepicking(true)
    setStep('dates')
  }

  function startOver() {
    if (!confirm(t('plan.startOver.confirm'))) return
    // The narrow door: the plan goes, the saved salary numbers six other tools
    // rely on stay. Erasing everything is the footer's control, not this one.
    erasePlan()
    setPlan({})
    setReturning(false)
    setRepicking(false)
    setStep('questions')
  }

  function downloadDates() {
    if (plan.resignDate == null || today === '') return
    const text = buildDatesIcs(
      planIcsEvents({ today, resignDate: plan.resignDate, cliffs: result.cliffs }, t),
      planSiteUrl(),
    )
    const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = DATES_ICS_FILENAME
    a.click()
    URL.revokeObjectURL(url)
  }

  const shared = { t, lang, fmt, plan, result, today, onDownload: downloadDates, onLooking: startLooking, onReason: saveReason }

  if (returning && plan.resignDate != null) {
    return (
      <ReturnScreen {...shared} noticePeriodDays={answers.noticePeriodDays} onChangeDate={changeDate} onStartOver={startOver} />
    )
  }

  return (
    <div data-tool="plan" className="space-y-3">
      <p className="max-w-xl text-[15px] leading-relaxed text-ink-soft">{t('plan.tagline')}</p>

      {step === 'questions' && (
        <Card className="space-y-3">
          <h2 className="text-base font-bold">{t('plan.q.title')}</h2>
          {!touched && <ExampleNote chip={t('plan.example.chip')} note={t('plan.example.note')} />}
          <DateField
            label={t('plan.q.join')}
            hint={t('plan.q.joinHint')}
            value={answers.joinDate}
            onChange={(v) => answered({ joinDate: v })}
          />
          <NumberField
            label={t('plan.q.notice')}
            hint={t('plan.q.noticeHint')}
            value={answers.noticePeriodDays}
            suffix={t('plan.q.noticeSuffix')}
            onChange={(v) => answered({ noticePeriodDays: v })}
          />
          <Select
            label={t('plan.q.hike')}
            hint={t('plan.q.hikeHint')}
            value={String(answers.hikeCreditMonth)}
            options={[
              { value: '0', label: t('plan.q.hikeSkip') },
              ...MONTHS.map((m) => ({ value: String(m), label: monthLabel(m, today, lang) })),
            ]}
            onChange={(v) => answered({ hikeCreditMonth: Number(v) })}
          />
          <PrimaryButton onClick={submitQuestions}>{t('plan.q.next')}</PrimaryButton>
        </Card>
      )}

      {step === 'cliffs' && (
        <CliffScreen
          t={t}
          fmt={fmt}
          cliffs={result.cliffs}
          forkCliffs={forkCliffs}
          workWeekDays={job.workWeekDays}
          coveredByAct={job.coveredByAct ?? true}
          hikeLabel={hikeMonthLabel(answers.hikeCreditMonth, result.cliffs, lang)}
          onChooseWeek={chooseWeek}
          onChooseCoverage={chooseCoverage}
          onBack={() => setStep('questions')}
          onNext={() => setStep('dates')}
        />
      )}

      {step === 'dates' && (
        <div className="space-y-4">
          {/* The options give way to the recap once a date exists. Leaving
              them above it pushes "add these to my calendar" — the one thing
              this screen is for — off a 375px viewport. "Change my date" in
              the recap brings them back. */}
          {(repicking || plan.resignDate == null) && (
            <Card className="space-y-3">
              <h2 className="text-base font-bold">{t('plan.dates.title')}</h2>
              {result.trades.map((trade) => (
                <TradeOption
                  key={trade.id}
                  t={t}
                  fmt={fmt}
                  trade={trade}
                  today={today}
                  chosen={plan.resignDate != null && plan.resignDate === trade.resignDate}
                  onPick={pickResignDate}
                />
              ))}
              <button type="button" onClick={() => setStep('cliffs')} className="text-[13px] font-semibold text-ink-faint underline">
                {t('plan.back')}
              </button>
            </Card>
          )}

          {!repicking && plan.resignDate != null && (
            <Recap {...shared} noticePeriodDays={answers.noticePeriodDays} onChangeDate={() => setRepicking(true)} />
          )}
        </div>
      )}

      {/* The tracker and the tool grid, which Phase 0 does not remove — only
          moves off the front of the door. They never render on the return
          screen: five calculators beside one next thing is rule 9 broken. */}
      {belowDoor}
    </div>
  )
}

export default Plan

/* ------------------------------------------------------------------ */

/** "May 2027" once the clock is known, plain "May" before that. */
function monthLabel(month: number, today: string, lang: Lang): string {
  if (today === '') return formatMonthYear(month, 0, lang).replace(' 0', '')
  const cliff = hikeCliffDate(month, today)
  return cliff == null ? String(month) : formatMonthYear(month, Number(cliff.slice(0, 4)), lang)
}

function hikeMonthLabel(month: number, cliffs: readonly Cliff[], lang: Lang): string | null {
  const hike = cliffs.find((c) => c.id === 'hike')
  if (month <= 0 || hike == null) return null
  return formatMonthYear(month, Number(hike.date.slice(0, 4)), lang)
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-saffron px-4 py-3 text-[15px] font-bold text-white"
    >
      {children}
    </button>
  )
}

/* ---- screen two: the cliffs ---- */

function CliffScreen(props: {
  t: (key: string, vars?: Record<string, string | number>) => string
  fmt: (iso: string) => string
  cliffs: readonly Cliff[]
  forkCliffs: readonly Cliff[]
  workWeekDays?: 5 | 6
  coveredByAct: boolean
  hikeLabel: string | null
  onChooseWeek: (days: 5 | 6) => void
  onChooseCoverage: (covered: boolean) => void
  onBack: () => void
  onNext: () => void
}) {
  const { t, fmt } = props
  const five = props.forkCliffs.find((c) => c.id === 'gratuity-5-day')
  const six = props.forkCliffs.find((c) => c.id === 'gratuity-6-day')
  const chosen = chosenGratuityCliff(props.cliffs, props.workWeekDays)
  const hike = props.cliffs.find((c) => c.id === 'hike')
  const ahead = props.cliffs.filter((c) => !c.passed)

  return (
    <Card className="space-y-4">
      <h2 className="text-base font-bold">{t('plan.cliffs.title')}</h2>

      {props.coveredByAct && five != null && six != null ? (
        <div className="space-y-2">
          <p className="text-[15px] font-bold leading-snug">{t('plan.week.title')}</p>
          {/* Both readings, and neither is labelled theirs until they answer.
              No "in three days" sentence before the choice: that is a countdown
              to a date they may not have. */}
          <WeekOption
            label={t('plan.week.five')}
            date={fmt(five.date)}
            active={props.workWeekDays === 5}
            onClick={() => props.onChooseWeek(5)}
          />
          <WeekOption
            label={t('plan.week.six')}
            date={fmt(six.date)}
            active={props.workWeekDays === 6}
            onClick={() => props.onChooseWeek(6)}
          />
          {props.workWeekDays === undefined && (
            <p className="text-[14px] font-bold">{t('plan.week.ask')}</p>
          )}
          {/* Only once they have answered. `cliffs` holds BOTH readings until
              then, so a `find` here would print the five-day sentence to a
              six-day employee — the countdown to a date they do not have that
              Part 3 forbids. */}
          {chosen != null && (
            <p className="text-[15px] leading-snug">
              {chosen.passed
                ? t('plan.gratuity.past', { date: fmt(chosen.date), days: -chosen.daysAway })
                : t('plan.gratuity.ahead', { date: fmt(chosen.date), days: chosen.daysAway })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-[15px] leading-snug">{t('plan.act.none')}</p>
      )}

      <label className="flex items-start gap-2 rounded-xl border border-line bg-paper px-3 py-2.5">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-saffron"
          checked={!props.coveredByAct}
          onChange={(e) => props.onChooseCoverage(!e.target.checked)}
        />
        <span>
          <span className="block text-[13px] font-semibold text-ink">{t('plan.act.label')}</span>
          <span className="mt-0.5 block text-xs leading-snug text-ink-faint">{t('plan.act.hint')}</span>
        </span>
      </label>

      {hike != null && props.hikeLabel != null && (
        <p className="text-[15px] leading-snug">
          {t('plan.hike.line', { month: props.hikeLabel, date: fmt(hike.date) })}
        </p>
      )}

      {ahead.length === 0 && <p className="text-[15px] leading-snug">{t('plan.cliffs.none')}</p>}

      <PrimaryButton onClick={props.onNext}>{t('plan.cliffs.next')}</PrimaryButton>
      <button type="button" onClick={props.onBack} className="text-[13px] font-semibold text-ink-faint underline">
        {t('plan.back')}
      </button>
    </Card>
  )
}

function WeekOption(props: { label: string; date: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      className={`flex w-full items-baseline justify-between gap-3 rounded-xl border px-3 py-2.5 text-left ${
        props.active ? 'border-saffron bg-saffron/10' : 'border-line bg-paper'
      }`}
    >
      <span className="text-[13px] font-semibold text-ink">{props.label}</span>
      <span className="tnum shrink-0 text-[14px] font-bold">{props.date}</span>
    </button>
  )
}

/* ---- screen three: the trades ---- */

function TradeOption(props: {
  t: (key: string, vars?: Record<string, string | number>) => string
  fmt: (iso: string) => string
  trade: Trade
  today: string
  chosen: boolean
  onPick: (date: string) => void
}) {
  const { t, fmt, trade } = props
  const needsPicker = trade.resignDate === null || trade.earliestDate !== null
  const [value, setValue] = useState(trade.earliestDate ?? props.today)

  useEffect(() => {
    setValue(trade.earliestDate ?? props.today)
  }, [trade.earliestDate, props.today])

  const detail =
    trade.id === 'keep-what-is-earned'
      ? t('plan.trade.earned.detail', { date: fmt(trade.resignDate ?? props.today) })
      : trade.id === 'own-date'
        ? t('plan.trade.own.detail')
        : t('plan.trade.fixed.detail', {
            date: fmt(trade.resignDate ?? ''),
            apply: fmt(trade.startApplyingBy ?? ''),
          })

  return (
    <div className={`rounded-xl border px-3 py-3 ${props.chosen ? 'border-saffron bg-saffron/10' : 'border-line bg-paper'}`}>
      <p className="text-[14px] font-bold">{t(`plan.trade.${trade.id}`)}</p>
      <p className="mt-1 text-[13px] leading-snug text-ink-soft">{detail}</p>
      {/* In words, on the option itself. Hiding it would be choosing for them. */}
      {trade.startApplyingByPassed && (
        <p className="mt-1 text-[13px] font-semibold leading-snug text-alarm">{t('plan.trade.late')}</p>
      )}
      {needsPicker ? (
        <div className="mt-2 space-y-2">
          <DateField label={t('plan.trade.dateLabel')} value={value} onChange={setValue} />
          <button
            type="button"
            onClick={() => props.onPick(value)}
            className="w-full rounded-xl border border-saffron px-3 py-2 text-[14px] font-bold text-saffron"
          >
            {t('plan.trade.use')}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => props.onPick(trade.resignDate as string)}
          className="mt-2 w-full rounded-xl border border-saffron px-3 py-2 text-[14px] font-bold text-saffron"
        >
          {t('plan.trade.use')}
        </button>
      )}
    </div>
  )
}

/* ---- the recap, shared by screen three and the return screen ---- */

interface RecapProps {
  t: (key: string, vars?: Record<string, string | number>) => string
  lang: Lang
  fmt: (iso: string) => string
  plan: Plan
  result: ReturnType<typeof switchCalendar>
  today: string
  noticePeriodDays: number
  onDownload: () => void
  onLooking: () => void
  onReason: (text: string) => void
  onChangeDate: () => void
}

function DateLines(props: Pick<RecapProps, 't' | 'fmt' | 'result' | 'noticePeriodDays'>) {
  const { t, fmt, result } = props
  const line = result.timeline
  if (line == null) return null
  const forfeited = result.cliffs.filter((c) => c.forfeited === true)
  return (
    <div className="space-y-1 text-[15px] leading-relaxed">
      <p>{t('plan.recap.apply', { date: fmt(line.startApplyingBy.date) })}</p>
      <p>{t('plan.recap.offer', { date: fmt(line.needOfferBy.date) })}</p>
      <p className="font-bold">{t('plan.recap.resign', { date: fmt(line.resignDate) })}</p>
      <p>{t('plan.recap.lwd', { date: fmt(line.lastWorkingDay.date), days: props.noticePeriodDays })}</p>
      {forfeited.map((cliff) => (
        <p key={cliff.id} className="text-[14px] text-ink-faint">
          <span className="line-through">{t(`plan.cliff.${cliff.id}`, { date: fmt(cliff.date) })}</span>{' '}
          <span className="font-semibold text-alarm">{t('plan.recap.forfeit')}</span>
        </p>
      ))}
    </div>
  )
}

function CalendarButton({ t, onDownload }: Pick<RecapProps, 't' | 'onDownload'>) {
  return (
    <div className="space-y-1.5">
      <PrimaryButton onClick={onDownload}>{t('plan.calendar.cta')}</PrimaryButton>
      <p className="text-xs leading-relaxed text-ink-faint">{t('plan.calendar.note')}</p>
    </div>
  )
}

function ReasonBox({ t, plan, onReason }: Pick<RecapProps, 't' | 'plan' | 'onReason'>) {
  const [draft, setDraft] = useState(plan.reason ?? '')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    setDraft(plan.reason ?? '')
  }, [plan.reason])
  return (
    <div className="space-y-2">
      <TextArea
        label={t('plan.reason.label')}
        hint={t('plan.reason.hint')}
        rows={2}
        value={draft}
        onChange={(v) => {
          setDraft(v)
          setSaved(false)
        }}
      />
      <button
        type="button"
        onClick={() => {
          onReason(draft)
          setSaved(true)
        }}
        className="rounded-xl border border-line px-3 py-2 text-[13px] font-bold"
      >
        {saved ? t('plan.reason.saved') : t('plan.reason.save')}
      </button>
    </div>
  )
}

function LookingTap({ t, fmt, plan, onLooking }: Pick<RecapProps, 't' | 'fmt' | 'plan' | 'onLooking'>) {
  if (plan.lookingSince != null) {
    return <p className="text-[14px] font-semibold leading-snug">{t('plan.looking.since', { date: fmt(plan.lookingSince) })}</p>
  }
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onLooking}
        className="w-full rounded-xl border border-saffron px-3 py-2.5 text-[14px] font-bold text-saffron"
      >
        {t('plan.looking.cta')}
      </button>
      <p className="text-xs leading-relaxed text-ink-faint">{t('plan.looking.warning')}</p>
    </div>
  )
}

function WorthLink({ t, lang }: Pick<RecapProps, 't' | 'lang'>) {
  return (
    <a href={withLang(lang, 'gratuity')} className="text-[13px] font-semibold text-saffron underline">
      {t('plan.worth')}
    </a>
  )
}

function Recap(props: RecapProps) {
  const { t } = props
  return (
    <Card className="space-y-4">
      <h2 className="text-base font-bold">{t('plan.recap.title')}</h2>
      <DateLines t={t} fmt={props.fmt} result={props.result} noticePeriodDays={props.noticePeriodDays} />
      <CalendarButton t={t} onDownload={props.onDownload} />
      <ReasonBox t={t} plan={props.plan} onReason={props.onReason} />
      <LookingTap t={t} fmt={props.fmt} plan={props.plan} onLooking={props.onLooking} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <WorthLink t={t} lang={props.lang} />
        <button type="button" onClick={props.onChangeDate} className="text-[13px] font-semibold text-ink-faint underline">
          {t('plan.change')}
        </button>
      </div>
    </Card>
  )
}

/* ---- the return screen ---- */

function ReturnScreen(props: RecapProps & { onStartOver: () => void }) {
  const { t, plan, result } = props
  const days = result.timeline?.daysAway ?? 0
  return (
    <div data-tool="plan" className="space-y-4">
      {/* Their own sentence, on the screen and not behind a tap. It is what
          makes someone who has drifted for eleven days do the next twelve
          minutes. It never reaches the tab title or a meta tag. */}
      {plan.reason != null && (
        <p className="text-[17px] font-bold italic leading-snug">“{plan.reason}”</p>
      )}

      <Card className="space-y-4">
        <p className="text-[15px] font-bold">
          {t('plan.return.countdown', { days, date: props.fmt(result.timeline?.resignDate ?? '') })}
        </p>
        <DateLines t={t} fmt={props.fmt} result={result} noticePeriodDays={props.noticePeriodDays} />

        {/* Rule 9: one next thing. In Phase 0 that is the dates in a calendar,
            the only thing this product can do that survives the tab closing. */}
        <div className="space-y-1.5">
          <p className="text-[14px] font-bold">{t('plan.return.next')}</p>
          <CalendarButton t={t} onDownload={props.onDownload} />
        </div>

        <ReasonBox t={t} plan={plan} onReason={props.onReason} />
        <LookingTap t={t} fmt={props.fmt} plan={plan} onLooking={props.onLooking} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <WorthLink t={t} lang={props.lang} />
          <button type="button" onClick={props.onChangeDate} className="text-[13px] font-semibold text-ink-faint underline">
            {t('plan.change')}
          </button>
          <button type="button" onClick={props.onStartOver} className="text-[13px] font-semibold text-ink-faint underline">
            {t('plan.startOver')}
          </button>
        </div>
      </Card>
    </div>
  )
}
