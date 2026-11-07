import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import {
  cliffs as computeCliffs,
  gratuityResignFrom,
  hikeCliffDate,
  startApplyingByPassed,
  stillAhead,
  switchCalendar,
  type Cliff,
  type Trade,
} from '../../engine/switchCalendar'
import { gratuity, GRATUITY_CAP } from '../../engine/gratuity'
import { formatINR } from '../../engine/format'
import { isIsoDate, lastWorkingDay } from '../../engine/dates'
import { loadCurrentJob, rememberCurrentJob, type CurrentJob } from '../../data/currentJob'
import { erasePlan, loadPlan, savePlan, tickAction, untickAction, type ActionId, type Plan } from '../../data/plan'
import { TOOL_SOURCES } from '../../data/sources'
import { downloadBlob } from '../../lib/downloadBlob'
import { buildDatesIcs, DATES_ICS_FILENAME } from '../../lib/ics'
import { formatLongDate, formatMonthYear } from '../../lib/formatDate'
import { withLang } from '../../lib/langPath'
import { todayIso } from '../../lib/today'
import {
  answerProblems,
  dateStepReachable,
  doorEngineInput,
  firstCleanTrade,
  gratuityToSpeakOf,
  isGratuityCliff,
  resignDatesMovedFrom,
  soonerDefault,
  weekChangesADate,
} from './fork'
import {
  Button,
  Card,
  DateField,
  ExampleNote,
  MoneyField,
  NoticeMonthsNudge,
  NumberField,
  Receipt,
  Select,
  TextArea,
} from '../../components/ui'
import { CheckIcon, ChevronRight } from '../../components/icons'
import { useLang, useT, type Lang } from '../../i18n'
import { hikeMonthOrder } from './hikeMonthOrder'
import { planIcsEvents, planSiteUrl } from './planEvents'
import { ActionList } from './ActionList'

/**
 * The front door: three questions with the dates they produce shown live
 * beside them, then a date to leave on, then the recap — and the same plan
 * handed back on every later visit.
 *
 * Spec: docs/DIRECTION.md Part 3 (the first session), Part 4 (coming back) and
 * Part 13 (Phase 0), with the 2026-10-31 polish audit (UX-01, UX-02, UX-05,
 * COPY-03, COPY-04, IA-03). Three screens, as ROADMAP.md Now says: the
 * questions and their dates, the dates and a resign date to pick, the recap.
 * This is the home page, not a registry tool: `src/tools/home/index.tsx`
 * renders it.
 *
 * Two records and one home per fact. Join date, notice period, work week, Act
 * coverage and basic + DA are facts about the employer and go to `currentJob`;
 * the reason, the hike month, the date picked and `lookingSince` are what the
 * plan invented and go to the plan. **No money is asked for on the way to a
 * date** — rule 11 puts money after a date, behind "what this is worth", and
 * even there it is one optional field that never reaches the plan record.
 *
 * Nothing is written on mount. Every write below hangs off something the user
 * pressed or typed.
 */

type Step = 'questions' | 'dates'

interface Answers {
  joinDate: string
  noticePeriodDays: number
  /** 1–12, or 0 for "skip this". */
  hikeCreditMonth: number
}

type T = (key: string, vars?: Record<string, string | number>) => string

/**
 * Ravi from Part 3, and the reason the first screen is not blank: rule 1 says a
 * real calendar renders before anyone types. These fill the fields, the chip
 * says out loud that they are an example, and the chip goes the moment the user
 * edits anything.
 */
const EXAMPLE: Answers = { joinDate: '2022-01-12', noticePeriodDays: 90, hikeCreditMonth: 5 }

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
  const [downloaded, setDownloaded] = useState(false)
  // Set by a press that could not go on, so the reason shows under the field
  // instead of a greyed-out button that says nothing (A11Y-08).
  const [showErrors, setShowErrors] = useState(false)
  const [weekBlocked, setWeekBlocked] = useState(false)
  const [actOpen, setActOpen] = useState(false)
  // Resign dates given up this visit. Not saved: the point is to name them
  // while the user is looking at the button that would add a second date.
  const [movedFrom, setMovedFrom] = useState<string[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  // What the next render should move focus to. Set only by something the user
  // pressed, so loading a saved plan never scrolls the page (UX-09b).
  const pendingFocus = useRef<'heading' | 'invalid' | null>(null)

  useEffect(() => {
    const savedJob = loadCurrentJob()
    const savedPlan = loadPlan()
    setToday(todayIso())
    setJob(savedJob)
    setPlan(savedPlan)
    // A value the user typed in some other tool is theirs, not an example, and
    // rule 7 says it is never asked for twice.
    const answeredBefore = savedJob.joinDate != null || savedJob.noticePeriodDays != null
    setAnswers({
      joinDate: savedJob.joinDate ?? EXAMPLE.joinDate,
      noticePeriodDays: savedJob.noticePeriodDays ?? EXAMPLE.noticePeriodDays,
      // For someone who has answered before, a hike month the plan does not
      // hold IS their answer: they tapped "skip this". Falling back to the
      // example there puts May back in front of them with no Example chip
      // beside it, and invents a hike cliff they have already said they do not
      // have — which moves their earliest clean date.
      hikeCreditMonth:
        savedPlan.hikeCreditMonth ?? (answeredBefore ? 0 : EXAMPLE.hikeCreditMonth),
    })
    if (answeredBefore) setTouched(true)
    // The small-employer answer is shown, not folded away, once it is given.
    setActOpen(savedJob.coveredByAct === false)
    if (savedPlan.resignDate != null) setReturning(true)
  }, [])

  // Every screen change opens at its own top, and focus goes to the new
  // screen's heading so a keyboard or screen-reader user hears where they are
  // (A11Y-03). A press that could not go on focuses the first thing to fix.
  useEffect(() => {
    const want = pendingFocus.current
    if (want == null) return
    pendingFocus.current = null
    const root = containerRef.current
    if (want === 'heading') {
      root?.scrollIntoView?.({ block: 'start' })
      const heading = root?.querySelector?.<HTMLElement>('[data-step-heading]')
      heading?.focus?.({ preventScroll: true })
      return
    }
    const target =
      root?.querySelector?.<HTMLElement>('[aria-invalid="true"]') ??
      root?.querySelector?.<HTMLElement>('[data-week-option]')
    target?.focus?.()
  })

  const answered = (patch: Partial<Answers>) => {
    setTouched(true)
    setAnswers((a) => ({ ...a, ...patch }))
  }

  const input = doorEngineInput(answers, job, plan, today)

  // Not memoised on purpose: the whole calculation is a few date additions on
  // a handful of fields, and a memo keyed on this object would need a stringify
  // that costs more than the arithmetic it saves.
  const result = switchCalendar(input)
  /** Both readings of the gratuity cliff, whatever the user has already answered. */
  const forkCliffs = computeCliffs({ ...input, workWeekDays: undefined }).filter(isGratuityCliff)
  const coveredByAct = job.coveredByAct ?? true
  const problems = answerProblems(answers.joinDate, answers.noticePeriodDays, today)
  const weekMatters = weekChangesADate(forkCliffs, input.asOf, input.noticePeriodDays)
  const speak = gratuityToSpeakOf(forkCliffs, job.workWeekDays, weekMatters)
  const reachable = dateStepReachable(coveredByAct, forkCliffs.length === 2, job.workWeekDays, weekMatters)

  const fmt = (iso: string) => formatLongDate(iso, lang)

  // ---- writes. Every one of these is a button the user pressed. ----

  function submitQuestions() {
    if (today === '') return
    if (problems.length > 0) {
      setShowErrors(true)
      pendingFocus.current = 'invalid'
      return
    }
    if (!reachable) {
      setWeekBlocked(true)
      pendingFocus.current = 'invalid'
      return
    }
    // Only write to the shared record when the user actually edited the
    // answers. Prefilled example values must not seed the rest of the app.
    if (touched) {
      rememberCurrentJob({
        joinDate: answers.joinDate,
        noticePeriodDays: answers.noticePeriodDays,
        // A week, coverage or pay answer given while still on the example
        // lived on screen only; it becomes real with the first real answers.
        ...(job.workWeekDays !== undefined ? { workWeekDays: job.workWeekDays } : {}),
        ...(job.coveredByAct !== undefined ? { coveredByAct: job.coveredByAct } : {}),
        ...(job.monthlyBasicDA !== undefined ? { monthlyBasicDA: job.monthlyBasicDA } : {}),
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
    }
    setStep('dates')
    pendingFocus.current = 'heading'
  }

  // An untouched example keeps these answers on screen only: writing them
  // would seed the shared record with facts about nobody's employer.
  function chooseWeek(days: 5 | 6) {
    setWeekBlocked(false)
    if (!touched) return setJob((j) => ({ ...j, workWeekDays: days }))
    rememberCurrentJob({ workWeekDays: days })
    setJob(loadCurrentJob())
  }

  function chooseCoverage(covered: boolean) {
    if (!touched) return setJob((j) => ({ ...j, coveredByAct: covered }))
    rememberCurrentJob({ coveredByAct: covered })
    setJob(loadCurrentJob())
  }

  function chooseBasicDA(amount: number) {
    // The record keeps a stored figure when the field is cleared, so the
    // screen does the same rather than showing an amount the record lacks.
    if (!(amount > 0)) return
    if (!touched) return setJob((j) => ({ ...j, monthlyBasicDA: amount }))
    rememberCurrentJob({ monthlyBasicDA: amount })
    setJob(loadCurrentJob())
  }

  function pickResignDate(date: string) {
    setMovedFrom((m) => resignDatesMovedFrom(m, plan.resignDate, date))
    // The file in their downloads still carries the old date.
    const moved = plan.resignDate != null && plan.resignDate !== date
    if (moved) setDownloaded(false)
    if (touched) {
      savePlan({ resignDate: date, ...(moved ? { calendarAddedOn: null } : {}) })
      setPlan(loadPlan())
    } else {
      setPlan((p) => ({ ...p, resignDate: date, ...(moved ? { calendarAddedOn: undefined } : {}) }))
    }
    setRepicking(false)
    pendingFocus.current = 'heading'
  }

  function startLooking() {
    // Records the day, unlocks nothing on screen in Phase 0, and does not move
    // the resign date. Someone can be looking in September and leaving in June.
    if (touched) {
      savePlan({ lookingSince: today })
      setPlan(loadPlan())
    } else {
      setPlan((p) => ({ ...p, lookingSince: today }))
    }
  }

  function saveReason(text: string) {
    const trimmed = text.trim() === '' ? null : text
    if (touched) {
      savePlan({ reason: trimmed })
      setPlan(loadPlan())
    } else {
      setPlan((p) => ({ ...p, reason: trimmed ?? undefined }))
    }
  }

  function tickBox(id: ActionId, ticked: boolean) {
    if (touched) {
      if (ticked) tickAction(id, today)
      else untickAction(id)
      setPlan(loadPlan())
    } else {
      setPlan((p) => {
        const ticks = { ...p.ticks }
        if (ticked) ticks[id] = today
        else delete ticks[id]
        return { ...p, ticks }
      })
    }
  }

  function saveCompanies(names: string[]) {
    if (touched) {
      savePlan({ companies: names })
      setPlan(loadPlan())
    } else {
      setPlan((p) => ({ ...p, companies: names.filter((n) => n.trim() !== '') }))
    }
  }

  function chooseBond(hasBond: boolean) {
    if (touched) {
      savePlan({ hasBond })
      setPlan(loadPlan())
    } else {
      setPlan((p) => ({ ...p, hasBond }))
    }
  }

  function goToQuestions() {
    setReturning(false)
    setRepicking(false)
    setStep('questions')
    pendingFocus.current = 'heading'
  }

  function changeDate() {
    setReturning(false)
    setRepicking(true)
    setStep('dates')
    pendingFocus.current = 'heading'
  }

  function startOver() {
    if (!confirm(t('plan.startOver.confirm'))) return
    // The narrow door: the plan goes, the saved salary numbers six other tools
    // rely on stay. Erasing everything is the footer's control, not this one.
    erasePlan()
    // The plan goes; a date already added to a calendar does not.
    setMovedFrom((m) => resignDatesMovedFrom(m, plan.resignDate, undefined))
    setPlan({})
    setDownloaded(false)
    setReturning(false)
    setRepicking(false)
    setStep('questions')
    pendingFocus.current = 'heading'
  }

  function downloadDates() {
    if (plan.resignDate == null || today === '') return
    const text = buildDatesIcs(
      planIcsEvents({ today, resignDate: plan.resignDate, cliffs: result.cliffs }, t),
      planSiteUrl(),
    )
    const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' })
    downloadBlob(blob, DATES_ICS_FILENAME)
    setDownloaded(true)
    if (touched) {
      savePlan({ calendarAddedOn: today })
      setPlan(loadPlan())
    } else {
      setPlan((p) => ({ ...p, calendarAddedOn: today }))
    }
  }

  const worth: WorthProps = {
    t,
    lang,
    fmt,
    // "What this is worth" exists only once a gratuity date does (Part 3,
    // step four): never for an employer the Code does not cover.
    available: coveredByAct && forkCliffs.length > 0,
    joinDate: answers.joinDate,
    lastWorkingDay: result.timeline?.lastWorkingDay.date ?? null,
    workWeekDays: job.workWeekDays,
    basicDA: job.monthlyBasicDA ?? 0,
    onBasicDA: chooseBasicDA,
  }

  const shared = {
    t,
    lang,
    fmt,
    plan,
    result,
    today,
    touched,
    downloaded,
    movedFrom,
    worth,
    onExampleChip: goToQuestions,
    onDownload: downloadDates,
    onLooking: startLooking,
    onReason: saveReason,
    onTick: tickBox,
    onCompanies: saveCompanies,
    onBond: chooseBond,
  }

  if (returning && plan.resignDate != null) {
    return (
      <ReturnScreen
        {...shared}
        noticePeriodDays={answers.noticePeriodDays}
        onChangeDate={changeDate}
        onStartOver={startOver}
        containerRef={containerRef}
      />
    )
  }

  const showRecap = step === 'dates' && !repicking && plan.resignDate != null

  return (
    <div ref={containerRef} data-tool="plan" className="space-y-5">
      <header className="space-y-2">
        {step === 'questions' && (
          <p className="text-[13px] font-medium leading-snug text-ink-soft">{t('plan.eyebrow')}</p>
        )}
        <h1 className="font-display text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[36px]">
          {t('plan.headline')}
        </h1>
        {step === 'questions' && (
          <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">{t('plan.tagline')}</p>
        )}
      </header>

      {step === 'questions' && (
        <Card className="space-y-4">
          <StepHeading>{t('plan.q.title')}</StepHeading>
          {!touched && <ExampleNote chip={t('plan.example.chip')} note={t('plan.example.note')} />}
          {/* On a phone the button follows the three fields and the live dates
              come after it, so the one thing this screen asks for is in reach
              (MOB-07). On a wide screen the dates sit in their own column
              beside the fields, with the button under the fields. */}
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-8 lg:gap-y-4">
            <div className="space-y-4 lg:col-start-1 lg:row-start-1">
              <DateField
                label={t('plan.q.join')}
                hint={t('plan.q.joinHint')}
                value={answers.joinDate}
                max={today === '' ? undefined : today}
                error={showErrors && problems.includes('join') ? t('plan.q.err.join') : undefined}
                onChange={(v) => answered({ joinDate: v })}
              />
              <div className="space-y-2">
                <NumberField
                  label={t('plan.q.notice')}
                  hint={t('plan.q.noticeHint')}
                  value={answers.noticePeriodDays}
                  suffix={t('plan.q.noticeSuffix')}
                  min={1}
                  integer
                  allowBlank
                  error={showErrors && problems.includes('notice') ? t('plan.q.err.notice') : undefined}
                  onChange={(v) => answered({ noticePeriodDays: v })}
                />
                <NoticeMonthsNudge
                  value={answers.noticePeriodDays}
                  t={t}
                  onUse={(days) => answered({ noticePeriodDays: days })}
                />
              </div>
              <Select
                label={t('plan.q.hike')}
                hint={t('plan.q.hikeHint')}
                value={String(answers.hikeCreditMonth)}
                options={[
                  { value: '0', label: t('plan.q.hikeSkip') },
                  ...hikeMonthOrder(today).map((m) => ({ value: String(m), label: monthLabel(m, today, lang) })),
                ]}
                onChange={(v) => answered({ hikeCreditMonth: Number(v) })}
              />
            </div>

            {/* Never greyed out with no reason: before the page is live it says
                it is loading (a tap there would be lost, UX-09c); after that a
                press with something missing says what, under the field. */}
            <div className="lg:col-start-1 lg:row-start-2">
              <Button onClick={submitQuestions} disabled={today === ''} aria-busy={today === ''} className="w-full lg:w-auto">
                {today === '' ? t('plan.q.loading') : t('plan.q.next')}
              </Button>
            </div>

            <LiveDates
              t={t}
              fmt={fmt}
              ready={today !== '' && problems.length === 0}
              forkCliffs={forkCliffs}
              cliffs={result.cliffs}
              speak={speak}
              weekMatters={weekMatters}
              workWeekDays={job.workWeekDays}
              coveredByAct={coveredByAct}
              hikeLabel={hikeMonthLabel(answers.hikeCreditMonth, result.cliffs, lang)}
              noticePeriodDays={input.noticePeriodDays}
              today={today}
              weekBlocked={weekBlocked}
              actOpen={actOpen}
              onActToggle={setActOpen}
              onChooseWeek={chooseWeek}
              onChooseCoverage={chooseCoverage}
            />
          </div>
        </Card>
      )}

      {step === 'dates' && !showRecap && (
        <Card className="space-y-4">
          <StepHeading>{t('plan.dates.title')}</StepHeading>
          {!touched && (
            <ExampleNote chip={t('plan.example.chip')} note={t('plan.example.laterNote')} onChipClick={goToQuestions} />
          )}
          <DatesSummary
            t={t}
            fmt={fmt}
            speak={speak}
            coveredByAct={coveredByAct}
            cliffs={result.cliffs}
            hikeLabel={hikeMonthLabel(answers.hikeCreditMonth, result.cliffs, lang)}
            noticePeriodDays={input.noticePeriodDays}
            today={today}
          />
          <TradeList
            t={t}
            fmt={fmt}
            trades={result.trades}
            cliffs={result.cliffs}
            today={today}
            noticePeriodDays={input.noticePeriodDays}
            chosenDate={plan.resignDate}
            onPick={pickResignDate}
          />
          <Button variant="ghost" size="sm" onClick={goToQuestions} className="-ml-3.5">
            {t('plan.back')}
          </Button>
        </Card>
      )}

      {showRecap && (
        <Recap
          {...shared}
          noticePeriodDays={answers.noticePeriodDays}
          onChangeDate={() => {
            setRepicking(true)
            pendingFocus.current = 'heading'
          }}
        />
      )}

      {/* The tracker link and the tool list sit under the questions only. Under
          the trades or the recap they would put thirty-odd links beside the
          one thing that screen is for (IA-17, rule 9). */}
      {step === 'questions' && belowDoor}
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

/** A screen's own heading: the place focus lands when the screen changes. */
function StepHeading({ children }: { children: ReactNode }) {
  return (
    <h2 data-step-heading tabIndex={-1} className="text-[18px] font-semibold leading-snug outline-none">
      {children}
    </h2>
  )
}

/**
 * The rules a gratuity *date* stands on: who qualifies and when, and the
 * 4-years-plus reading of s.54 that is still waiting on a lawyer. The amount,
 * wage and cap entries in `TOOL_SOURCES.gratuity` belong under an amount, so
 * they stay in "what this is worth".
 */
const GRATUITY_DATE_SOURCES = ['gratuity-eligibility', 'gratuity-four-years-plus'] as const

/** "Safe since…" or "safe from…, N days away", for the one reading the screen may name. */
function gratuitySentence(t: T, fmt: (iso: string) => string, cliff: Cliff): string {
  return cliff.passed
    ? t('plan.gratuity.past', { date: fmt(cliff.date), days: -cliff.daysAway })
    : t('plan.gratuity.ahead', { date: fmt(cliff.date), days: cliff.daysAway })
}

/* ---- screen one: the dates, live beside the questions ---- */

function LiveDates(props: {
  t: T
  fmt: (iso: string) => string
  /** False before the clock is known and while an answer is missing. */
  ready: boolean
  forkCliffs: readonly Cliff[]
  cliffs: readonly Cliff[]
  speak: Cliff | null
  weekMatters: boolean
  workWeekDays?: 5 | 6
  coveredByAct: boolean
  hikeLabel: string | null
  noticePeriodDays: number
  today: string
  weekBlocked: boolean
  actOpen: boolean
  onActToggle: (open: boolean) => void
  onChooseWeek: (days: 5 | 6) => void
  onChooseCoverage: (covered: boolean) => void
}) {
  const { t, fmt } = props
  const titleId = useId()
  const weekId = useId()
  const five = props.forkCliffs.find((c) => c.id === 'gratuity-5-day')
  const six = props.forkCliffs.find((c) => c.id === 'gratuity-6-day')
  const hike = props.cliffs.find((c) => c.id === 'hike')
  const ahead = props.cliffs.filter((c) => stillAhead(c, props.today, props.noticePeriodDays))
  const fork = props.coveredByAct && props.weekMatters && five != null && six != null

  return (
    <section
      aria-labelledby={titleId}
      className="space-y-3 border-t border-line pt-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
    >
      <h3 id={titleId} className="text-[14px] font-semibold leading-snug text-ink-soft">
        {t('plan.cliffs.title')}
      </h3>

      {!props.ready ? (
        <p className="text-[14px] leading-snug text-ink-faint">
          {props.today === '' ? t('plan.q.loading') : t('plan.preview.waiting')}
        </p>
      ) : (
        <>
          {/* Asked only when the answer changes a date (UX-02). Both readings,
              and neither is labelled theirs until they answer: no "in three
              days" sentence before the choice — that is a countdown to a date
              they may not have (Part 3). */}
          {fork && (
            <div role="group" aria-labelledby={weekId} className="space-y-2">
              <p id={weekId} className="text-[15px] font-semibold leading-snug">
                {t('plan.week.title')}
              </p>
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
                <p
                  role={props.weekBlocked ? 'alert' : undefined}
                  className={`text-[13px] leading-snug ${props.weekBlocked ? 'font-semibold text-alarm' : 'text-ink-soft'}`}
                >
                  {t('plan.week.ask')}
                </p>
              )}
            </div>
          )}

          {/* Announced as it changes: these lines recompute on every answer. */}
          <div aria-live="polite" className="space-y-2.5">
            {!props.coveredByAct && <p className="text-[15px] leading-snug">{t('plan.act.none')}</p>}
            {props.coveredByAct && props.speak != null && (
              <div className="space-y-1">
                <p className="flex gap-2 text-[15px] leading-snug">
                  {props.speak.passed && <CheckIcon size={16} className="mt-[3px] text-leaf" />}
                  <span>{gratuitySentence(t, fmt, props.speak)}</span>
                </p>
                <Receipt ids={GRATUITY_DATE_SOURCES} />
              </div>
            )}
            {hike != null && props.hikeLabel != null && (
              <p className="text-[15px] leading-snug">
                {t('plan.hike.line', { month: props.hikeLabel, date: fmt(hike.date) })}
              </p>
            )}
            {ahead.length === 0 && <p className="text-[15px] leading-snug">{t('plan.cliffs.none')}</p>}
          </div>

          {/* Fifty words of legal text that apply to very few visitors, folded
              behind one line (UX-02d, MOB-12) — and open once ticked. */}
          <details
            open={props.actOpen}
            onToggle={(e) => props.onActToggle(e.currentTarget.open)}
            className="group rounded-xl border border-line"
          >
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-2 px-3 text-[13px] font-semibold text-ink-soft [&::-webkit-details-marker]:hidden">
              <ChevronRight size={14} className="transition-transform group-open:rotate-90" />
              {t('plan.act.summary')}
            </summary>
            <label className="flex items-start gap-2 px-3 pb-3">
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
          </details>
        </>
      )}
    </section>
  )
}

function WeekOption(props: { label: string; date: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      data-week-option
      aria-pressed={props.active}
      onClick={props.onClick}
      className={`flex min-h-[44px] w-full items-baseline justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
        props.active ? 'border-saffron bg-saffron-soft' : 'border-field bg-card hover:border-ink-soft'
      }`}
    >
      <span className="text-[14px] font-semibold text-ink">{props.label}</span>
      <span className="tnum shrink-0 text-[14px] font-semibold">{props.date}</span>
    </button>
  )
}

/* ---- screen two: the dates, and a resign date to pick ---- */

function DatesSummary(props: {
  t: T
  fmt: (iso: string) => string
  speak: Cliff | null
  coveredByAct: boolean
  cliffs: readonly Cliff[]
  hikeLabel: string | null
  noticePeriodDays: number
  today: string
}) {
  const { t, fmt, speak } = props
  const hike = props.cliffs.find((c) => c.id === 'hike')
  const ahead = props.cliffs.filter((c) => stillAhead(c, props.today, props.noticePeriodDays))
  const resignFrom = speak == null ? null : gratuityResignFrom(speak.date, props.noticePeriodDays)
  return (
    <div className="space-y-2 rounded-xl bg-paper px-4 py-3 text-[14px] leading-snug">
      {!props.coveredByAct && <p>{t('plan.act.none')}</p>}
      {props.coveredByAct && speak != null && (
        <>
          <p className="font-semibold">{gratuitySentence(t, fmt, speak)}</p>
          {/* Gratuity is judged on the last working day, so the date to wait
              for is not the gratuity date but the notice before it. The risk
              is said in the same breath: an early release undoes it. */}
          {!speak.passed && resignFrom != null && (
            <p className="text-ink-soft">
              {resignFrom <= props.today
                ? t('plan.gratuity.noticeNow', { date: fmt(speak.date) })
                : t('plan.gratuity.notice', { from: fmt(resignFrom), date: fmt(speak.date) })}
            </p>
          )}
          {/* s.54(B)(a) counts days actually worked, not calendar days, and
              this engine does not model public holidays or unearned leave —
              both only push the date later, never earlier. */}
          {/* Said in the already-passed case too: that date rests on the same
              4-years-plus reading, not on five full years (TR2-01). */}
          <p className="text-[13px] text-ink-soft">{t('plan.gratuity.workingDays')}</p>
          <Receipt ids={GRATUITY_DATE_SOURCES} />
        </>
      )}
      {hike != null && props.hikeLabel != null && (
        <p className="font-semibold">{t('plan.hike.line', { month: props.hikeLabel, date: fmt(hike.date) })}</p>
      )}
      {ahead.length === 0 && <p>{t('plan.cliffs.none')}</p>}
    </div>
  )
}

function TradeList(props: {
  t: T
  fmt: (iso: string) => string
  trades: readonly Trade[]
  cliffs: readonly Cliff[]
  today: string
  noticePeriodDays: number
  chosenDate?: string
  onPick: (date: string) => void
}) {
  const clean = firstCleanTrade(props.trades, props.cliffs, props.today, props.noticePeriodDays)
  return (
    <div className="space-y-3">
      {props.trades.map((trade) => (
        <TradeOption
          key={trade.id}
          t={props.t}
          fmt={props.fmt}
          trade={trade}
          today={props.today}
          noticePeriodDays={props.noticePeriodDays}
          losesNothing={trade.id === clean}
          chosen={props.chosenDate != null && props.chosenDate === trade.resignDate}
          onPick={props.onPick}
        />
      ))}
    </div>
  )
}

function pickerStart(id: Trade['id'], resignDate: string | null, earliestDate: string | null, today: string): string {
  if (id === 'own-date') return ''
  if (id === 'keep-what-is-earned') return soonerDefault(today, resignDate)
  return earliestDate ?? today
}

function TradeOption(props: {
  t: T
  fmt: (iso: string) => string
  trade: Trade
  today: string
  noticePeriodDays: number
  losesNothing: boolean
  chosen: boolean
  onPick: (date: string) => void
}) {
  const { t, fmt, trade } = props
  const needsPicker =
    trade.id === 'keep-what-is-earned' || trade.resignDate === null || trade.earliestDate !== null
  // "I already have a date" opens empty, and "Leave sooner" opens on the
  // soonest date that is not already late (UX-05): neither card greets the
  // visitor with a warning about a date they never chose.
  const [value, setValue] = useState(() => pickerStart(trade.id, trade.resignDate, trade.earliestDate, props.today))
  const [missing, setMissing] = useState(false)
  // The option's title names the card and the date field inside it, so the two
  // "Resign date" fields on this screen are told apart (A11Y N6).
  const titleId = useId()
  const cleanId = useId()

  useEffect(() => {
    setValue(pickerStart(trade.id, trade.resignDate, trade.earliestDate, props.today))
    setMissing(false)
  }, [trade.id, trade.earliestDate, trade.resignDate, props.today])

  // A card with a picker can show any date the visitor types, so the late
  // line follows that date rather than the fixed one the Trade was built from.
  const late = needsPicker
    ? isIsoDate(value) && startApplyingByPassed(value, props.today)
    : trade.startApplyingByPassed

  const detail =
    trade.id === 'keep-what-is-earned'
      ? t('plan.trade.earned.detail', { date: fmt(trade.resignDate ?? props.today) })
      : trade.id === 'own-date' || trade.resignDate == null
        ? t('plan.trade.own.detail')
        : t('plan.trade.fixed.detail', {
            lwd: fmt(lastWorkingDay(trade.resignDate, props.noticePeriodDays)),
            apply: fmt(trade.startApplyingBy ?? ''),
          })

  const date = needsPicker ? value : (trade.resignDate ?? '')
  const pick = () => {
    if (!isIsoDate(date)) {
      setMissing(true)
      return
    }
    props.onPick(date)
  }

  return (
    <div
      data-trade={trade.id}
      data-chosen={props.chosen || undefined}
      role="group"
      aria-labelledby={props.losesNothing ? `${titleId} ${cleanId}` : titleId}
      className={`space-y-2 rounded-xl border px-4 py-3 ${props.chosen ? 'border-saffron bg-saffron-soft' : 'border-line bg-card'}`}
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span id={titleId} className="text-[15px] font-semibold">
          {t(`plan.trade.${trade.id}`)}
        </span>
        {/* A fact about the date, not a recommendation: none is ever marked best. */}
        {props.losesNothing && (
          <span
            id={cleanId}
            className="inline-flex items-center gap-1 rounded-md bg-leaf-soft px-2 py-0.5 text-[12px] font-semibold text-leaf"
          >
            <CheckIcon size={14} />
            {t('plan.trade.clean')}
          </span>
        )}
      </p>
      <p className="text-[13px] leading-snug text-ink-soft">{detail}</p>
      {/* In words, on the option itself. Hiding it would be choosing for them. */}
      {late && <p className="text-[13px] font-semibold leading-snug text-alarm">{t('plan.trade.late')}</p>}
      {needsPicker && (
        <DateField
          label={t('plan.trade.dateLabel')}
          labelledBy={titleId}
          value={value}
          error={missing && !isIsoDate(value) ? t('plan.trade.err') : undefined}
          onChange={(v) => {
            setValue(v)
            setMissing(false)
          }}
        />
      )}
      <Button variant="secondary" onClick={pick} className="w-full">
        {isIsoDate(date) ? t('plan.trade.useDate', { date: fmt(date) }) : t('plan.trade.use')}
      </Button>
    </div>
  )
}

/* ---- "what this is worth": one optional field, inside the recap ---- */

interface WorthProps {
  t: T
  lang: Lang
  fmt: (iso: string) => string
  available: boolean
  joinDate: string
  lastWorkingDay: string | null
  workWeekDays?: 5 | 6
  basicDA: number
  onBasicDA: (amount: number) => void
}

/**
 * Part 3, step four, as specified and not as first shipped: not a link to
 * another page, but a button that opens one field here — basic plus DA, never
 * plain basic — and answers inline with the existing gratuity engine, on the
 * last working day of the date just picked (IA-03). Prefilled from the shared
 * current-job record, so anyone who used the gratuity tool is not asked twice.
 */
function WorthPanel(props: WorthProps) {
  const { t, fmt } = props
  const [open, setOpen] = useState(false)
  const panelId = useId()
  if (!props.available || props.lastWorkingDay == null || !isIsoDate(props.joinDate)) return null

  const result =
    props.basicDA > 0
      ? gratuity({
          lastDrawnBasicDA: props.basicDA,
          joinDate: props.joinDate,
          exitDate: props.lastWorkingDay,
          coveredByAct: true,
          workWeekDays: props.workWeekDays,
        })
      : null

  return (
    <div className="w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-[44px] items-center gap-1.5 text-left text-[14px] font-semibold text-saffron-strong underline underline-offset-4"
      >
        <ChevronRight size={14} className={`no-underline transition-transform ${open ? 'rotate-90' : ''}`} />
        {t('plan.worth')}
      </button>
      {open && (
        <div id={panelId} data-worth className="mt-1 space-y-3 rounded-xl border border-line bg-paper p-4">
          <MoneyField
            label={t('gratuity.basic')}
            hint={t('plan.worth.hint')}
            value={props.basicDA}
            onChange={props.onBasicDA}
          />
          {result != null && (
            <div role="status" aria-live="polite" className="space-y-2">
              {result.eligible ? (
                <p className="text-[15px] font-semibold leading-snug">
                  {t('plan.worth.amount', { date: fmt(props.lastWorkingDay), amount: formatINR(result.amount) })}
                </p>
              ) : (
                <p className="text-[15px] font-semibold leading-snug">
                  {t('plan.worth.notYet', { date: fmt(props.lastWorkingDay) })}
                </p>
              )}
              {result.eligible && (
                <p className="text-[12px] leading-relaxed text-ink-soft">
                  {t('gratuity.note.code-wages')}
                  {result.amount >= GRATUITY_CAP ? ` ${t('gratuity.note.cap-applied')}` : ''}
                </p>
              )}
            </div>
          )}
          <Receipt ids={TOOL_SOURCES.gratuity} />
          <a
            href={withLang(props.lang, 'gratuity')}
            className="inline-flex min-h-[44px] items-center text-[13px] font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            {t('plan.worth.full')}
          </a>
        </div>
      )}
    </div>
  )
}

/* ---- the recap, shared by screen three and the return screen ---- */

interface RecapProps {
  t: T
  lang: Lang
  fmt: (iso: string) => string
  plan: Plan
  result: ReturnType<typeof switchCalendar>
  today: string
  noticePeriodDays: number
  touched: boolean
  downloaded: boolean
  /** Resign dates moved away from this visit, which a calendar may still hold. */
  movedFrom: readonly string[]
  worth: WorthProps
  onExampleChip: () => void
  onDownload: () => void
  onLooking: () => void
  onReason: (text: string) => void
  onTick: (id: ActionId, ticked: boolean) => void
  onCompanies: (names: string[]) => void
  onBond: (hasBond: boolean) => void
  onChangeDate: () => void
}

function DateLines(props: Pick<RecapProps, 't' | 'fmt' | 'result' | 'noticePeriodDays' | 'today'>) {
  const { t, fmt, result } = props
  const line = result.timeline
  if (line == null) return null
  const forfeited = result.cliffs.filter((c) => c.forfeited === true)
  // A date already gone is not an instruction any more: say so (UX-07).
  const gone = (iso: string) => props.today !== '' && iso < props.today
  const apply = line.startApplyingBy.date
  const offer = line.needOfferBy.date
  return (
    <div className="space-y-1 text-[15px] leading-relaxed">
      {gone(apply) ? (
        <p className="font-semibold text-alarm">{t('plan.recap.applyNow', { date: fmt(apply) })}</p>
      ) : (
        <p>{t('plan.recap.apply', { date: fmt(apply) })}</p>
      )}
      {gone(offer) ? (
        <p className="font-semibold text-alarm">{t('plan.recap.offerLate', { date: fmt(offer) })}</p>
      ) : (
        <p>{t('plan.recap.offer', { date: fmt(offer) })}</p>
      )}
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

function CalendarButton({
  t,
  fmt,
  onDownload,
  downloaded,
  movedFrom,
  addedOn,
}: Pick<RecapProps, 't' | 'fmt' | 'onDownload' | 'downloaded' | 'movedFrom'> & { addedOn?: string }) {
  // On a return visit with the file already downloaded, the button stops
  // being the one big thing and the action list takes over as "next" (UX-09a).
  const kept = addedOn != null && movedFrom.length === 0
  return (
    <div className="space-y-1.5">
      {/* Above the button, so it is read before a second date goes in beside
          the first. See resignDatesMovedFrom for why the file cannot fix it. */}
      {movedFrom.length > 0 && (
        <p className="text-[13px] font-semibold leading-snug text-alarm">
          {t('plan.calendar.moved', { dates: movedFrom.map(fmt).join(', ') })}
        </p>
      )}
      {kept ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-leaf">
            <CheckIcon size={16} />
            {t('plan.calendar.since', { date: fmt(addedOn) })}
          </p>
          <Button variant="secondary" size="sm" onClick={onDownload}>
            {t('plan.calendar.again')}
          </Button>
        </div>
      ) : (
        <>
          <Button onClick={onDownload} className="w-full">
            {t('plan.calendar.cta')}
          </Button>
          <p className="text-xs leading-relaxed text-ink-faint">{t('plan.calendar.note')}</p>
        </>
      )}
      <p role="status" className="text-[13px] font-semibold leading-snug text-ink">
        {downloaded ? t('plan.calendar.downloaded') : null}
      </p>
    </div>
  )
}

function ReasonBox({ t, plan, onReason }: Pick<RecapProps, 't' | 'plan' | 'onReason'>) {
  const [draft, setDraft] = useState(plan.reason ?? '')
  // A line that is already saved says so on a return visit (UX-09b).
  const [saved, setSaved] = useState(plan.reason != null)
  useEffect(() => {
    setDraft(plan.reason ?? '')
  }, [plan.reason])

  // The button is kept, but a line typed and then abandoned by tapping
  // elsewhere or pressing Enter must not be lost — it is the one personal
  // thing on this screen. onReason already carries the untouched-example
  // guard (no write while touched is false), so this needs no guard of its
  // own.
  const save = () => {
    onReason(draft)
    setSaved(draft.trim() !== '')
  }

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
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.shiftKey) return
          e.preventDefault()
          save()
        }}
      />
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" onClick={save}>
          {t('plan.reason.save')}
        </Button>
        <span role="status" className="flex items-center gap-1 text-[13px] font-semibold text-leaf">
          {saved && <CheckIcon size={14} />}
          {saved ? t('plan.reason.saved') : null}
        </span>
      </div>
    </div>
  )
}

function LookingTap({ t, fmt, plan, onLooking }: Pick<RecapProps, 't' | 'fmt' | 'plan' | 'onLooking'>) {
  // The button goes away when pressed, so focus would fall to <body> (A11Y N4).
  // The "Looking since" line takes it instead, and sits in a status region
  // that exists before the press so the new line is announced too.
  const sinceRef = useRef<HTMLParagraphElement>(null)
  const pressed = useRef(false)
  useEffect(() => {
    if (!pressed.current || plan.lookingSince == null) return
    pressed.current = false
    sinceRef.current?.focus()
  }, [plan.lookingSince])
  const since = plan.lookingSince
  return (
    <div className="space-y-0.5">
      <p
        ref={sinceRef}
        role="status"
        tabIndex={-1}
        data-looking-since
        className={since != null ? 'text-[14px] font-semibold leading-snug outline-none' : 'sr-only'}
      >
        {since != null ? t('plan.looking.since', { date: fmt(since) }) : null}
      </p>
      {since == null && (
        // A door, not a task (Part 3): a text button, so it does not compete with
        // the calendar button for "the one thing on this screen" (UX-09c).
        <>
          <button
            type="button"
            onClick={() => {
              pressed.current = true
              onLooking()
            }}
            className="inline-flex min-h-[44px] items-center text-left text-[14px] font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            {t('plan.looking.cta')}
          </button>
          <p className="text-xs leading-relaxed text-ink-faint">{t('plan.looking.warning')}</p>
        </>
      )}
    </div>
  )
}

function Recap(props: RecapProps) {
  const { t } = props
  return (
    <Card className="space-y-5">
      <StepHeading>{t('plan.recap.title')}</StepHeading>
      {!props.touched && (
        <ExampleNote chip={t('plan.example.chip')} note={t('plan.example.laterNote')} onChipClick={props.onExampleChip} />
      )}
      <DateLines t={t} fmt={props.fmt} result={props.result} noticePeriodDays={props.noticePeriodDays} today={props.today} />
      <CalendarButton
        t={t}
        fmt={props.fmt}
        onDownload={props.onDownload}
        downloaded={props.downloaded}
        movedFrom={props.movedFrom}
      />
      <div className="space-y-4 border-t border-line pt-4">
        <ReasonBox t={t} plan={props.plan} onReason={props.onReason} />
        <LookingTap t={t} fmt={props.fmt} plan={props.plan} onLooking={props.onLooking} />
      </div>
      {/* The first actions on the first visit too, not only after a reload
          (N5): the same list the return screen shows. */}
      <div className="border-t border-line pt-4">
        <ActionList
          t={t}
          lang={props.lang}
          plan={props.plan}
          today={props.today}
          startApplyingBy={props.result.timeline?.startApplyingBy.date ?? null}
          onTick={props.onTick}
          onCompanies={props.onCompanies}
          onBond={props.onBond}
        />
      </div>
      <div className="space-y-1 border-t border-line pt-3">
        <WorthPanel {...props.worth} />
        <Button variant="ghost" size="sm" onClick={props.onChangeDate} className="-ml-3.5">
          {t('plan.change')}
        </Button>
      </div>
    </Card>
  )
}

/* ---- the return screen ---- */

function ReturnScreen(
  props: RecapProps & { onStartOver: () => void; containerRef: RefObject<HTMLDivElement | null> },
) {
  const { t, plan, result } = props
  const days = result.timeline?.daysAway ?? 0
  const addedOn = plan.calendarAddedOn
  return (
    <div ref={props.containerRef} data-tool="plan" className="space-y-4">
      {/* Their own sentence, on the screen and not behind a tap. It is what
          makes someone who has drifted for eleven days do the next twelve
          minutes. It never reaches the tab title or a meta tag. */}
      {plan.reason != null && (
        <p className="text-[17px] font-bold italic leading-snug">“{plan.reason}”</p>
      )}
      <h1
        data-step-heading
        tabIndex={-1}
        className="font-display text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-ink outline-none sm:text-[32px]"
      >
        {t('plan.return.countdown', { days, date: props.fmt(result.timeline?.resignDate ?? '') })}
      </h1>

      <Card className="space-y-5">
        {!props.touched && (
          <ExampleNote chip={t('plan.example.chip')} note={t('plan.example.laterNote')} onChipClick={props.onExampleChip} />
        )}
        <DateLines t={t} fmt={props.fmt} result={result} noticePeriodDays={props.noticePeriodDays} today={props.today} />

        {/* Rule 9: one next thing. Until the dates are in a calendar, that is
            the calendar; after, the action list below takes over. */}
        <div className="space-y-1.5">
          {addedOn == null && <p className="text-[14px] font-bold">{t('plan.return.next')}</p>}
          <CalendarButton
            t={t}
            fmt={props.fmt}
            onDownload={props.onDownload}
            downloaded={props.downloaded}
            movedFrom={props.movedFrom}
            addedOn={addedOn}
          />
        </div>

        <div className="space-y-4 border-t border-line pt-4">
          <ReasonBox t={t} plan={plan} onReason={props.onReason} />
          <LookingTap t={t} fmt={props.fmt} plan={plan} onLooking={props.onLooking} />
        </div>
        <div className="border-t border-line pt-4">
          <ActionList
            t={t}
            lang={props.lang}
            plan={plan}
            today={props.today}
            startApplyingBy={result.timeline?.startApplyingBy.date ?? null}
            onTick={props.onTick}
            onCompanies={props.onCompanies}
            onBond={props.onBond}
          />
        </div>

        <div className="space-y-1 border-t border-line pt-3">
          <WorthPanel {...props.worth} />
          <div className="-ml-3.5 flex flex-wrap items-center gap-x-1">
            <Button variant="ghost" size="sm" onClick={props.onChangeDate}>
              {t('plan.change')}
            </Button>
            <Button variant="ghost" size="sm" onClick={props.onStartOver}>
              {t('plan.startOver')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
