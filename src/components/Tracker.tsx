import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Application, Stage } from '../tracker/types'
import {
  addApplication,
  exportAll,
  hasUndo,
  load,
  loadSweeps,
  mergeBackup,
  moveStage,
  parseBackup,
  recordSweep,
  removeApplication,
  restoreAll,
  save,
  snapshotForUndo,
  STAGE_ORDER,
  undoLastRestore,
  updateApplication,
  type BackupBundle,
} from '../tracker/store'
import { coverageState, type SweepRecord } from '../engine/coverage'
import type { IngestCandidate } from '../engine/ingest'
import { exampleApplications } from '../data/exampleBoard'
import { STAGE_ACTIONS } from '../data/stageActions'
import { writeHandoff } from '../data/defaults'
import { TOOLS } from '../data/tools'
import { formatLPA } from '../engine/format'
import { useLang, useT } from '../i18n'
import { withLang } from '../lib/langPath'
import { todayIso } from '../lib/today'
import { formatDate } from '../lib/formatDate'
import { Card, NumberField, Select, TextArea, TextField } from './ui'
import { SweepPanel } from './SweepPanel'

const L = 100_000

/** Either the form is closed, adding a new application, or editing an existing one by id. */
type FormMode = 'closed' | 'add' | { editId: string }

/** Stage labels are translated — each component that needs them calls this hook locally. */
function useStageLabel(): Record<Stage, string> {
  const t = useT()
  return {
    researching: t('stage.researching'),
    applied: t('stage.applied'),
    interviewing: t('stage.interviewing'),
    offer: t('stage.offer'),
    decided: t('stage.decided'),
  }
}

export function Tracker() {
  const t = useT()
  // Empty until mount so SSR HTML matches the first client render. Do not
  // save until hydrated — a save of [] would wipe real tracker data.
  const [list, setList] = useState<Application[]>([])
  const [sweeps, setSweeps] = useState<SweepRecord[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('closed')
  const [saveFailed, setSaveFailed] = useState(false)
  const [pendingBackup, setPendingBackup] = useState<BackupBundle | null>(null)
  const [sweepOpen, setSweepOpen] = useState(false)
  const [restoreFeedback, setRestoreFeedback] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [undoAvailable, setUndoAvailable] = useState(false)

  useEffect(() => {
    setList(load())
    setSweeps(loadSweeps())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    // A board that shows unsaved work as saved is the worst failure this app
    // has, so a refused write has to reach the user, not just the console.
    setSaveFailed(!save(list))
  }, [list, hydrated])

  const grouped = useMemo(() => {
    const g: Record<Stage, Application[]> = {
      researching: [],
      applied: [],
      interviewing: [],
      offer: [],
      decided: [],
    }
    for (const a of list) g[a.stage].push(a)
    return g
  }, [list])

  const editingApp =
    typeof formMode === 'object' ? list.find((a) => a.id === formMode.editId) : undefined

  const handleSave = (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingApp) {
      setList((l) => updateApplication(l, editingApp.id, data))
    } else {
      setList((l) => addApplication(l, data))
    }
    setFormMode('closed')
  }

  const handleDelete = (id: string) => {
    if (!confirm(t('tracker.confirmDelete'))) return
    setList((l) => removeApplication(l, id))
  }

  const handleMove = (id: string, dir: -1 | 1) => setList((l) => moveStage(l, id, dir))

  const handleExport = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'switch-karle-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (file: File) => {
    setSweepOpen(false)
    setRestoreError(null)
    setRestoreFeedback(null)
    setPendingBackup(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        // Parse and describe before touching anything. The user chooses merge
        // or replace knowing what is in the file and what it overlaps.
        setPendingBackup(parseBackup(String(reader.result)))
      } catch {
        setRestoreError(t('tracker.restore.invalid'))
      }
    }
    reader.readAsText(file)
  }

  const handleSweepToggle = () => {
    setPendingBackup(null)
    setSweepOpen((v) => !v)
  }

  const handleSweepAdd = (candidates: IngestCandidate[]) => {
    snapshotForUndo()
    let nextList = list
    for (const c of candidates) {
      nextList = addApplication(nextList, c)
    }
    const ok = save(nextList)
    // Only a sweep that actually landed goes in the ledger. Recording a failed
    // one would have the board say "filled from email today" beside a banner
    // saying nothing was saved, and would hide the gap the ledger exists to show.
    if (ok) {
      recordSweep({ sweptAt: todayIso(), windowDays: 60, added: candidates.length })
      setSweeps(loadSweeps())
    }
    setSweepOpen(false)
    setList(nextList)
    if (!ok) setSaveFailed(true)
    setUndoAvailable(hasUndo())
    setRestoreFeedback(t('sweep.added', { n: candidates.length }))
  }

  const coverage = useMemo(() => coverageState(sweeps, { today: todayIso() }), [sweeps])

  const coverageText = useMemo(() => {
    if (coverage.status === 'never') {
      return t('coverage.never')
    }
    const from = coverage.coveredFrom ? formatDate(coverage.coveredFrom) : ''
    const date = coverage.lastSweptAt ? formatDate(coverage.lastSweptAt) : ''
    const limits = t('coverage.limits')

    if (coverage.gapDays === 0) {
      return `${t('coverage.sweptToday', { from })} ${limits}`
    }
    if (coverage.gapDays === 1) {
      return `${t('coverage.lastSwept', { date, from })} ${t('coverage.gapOne')} ${limits}`
    }
    return `${t('coverage.lastSwept', { date, from })} ${t('coverage.gap', { n: coverage.gapDays })} ${limits}`
  }, [coverage, t])

  const applyBackup = (apply: (b: BackupBundle) => boolean, messageKey: string) => {
    if (!pendingBackup) return
    const ok = apply(pendingBackup)
    setPendingBackup(null)
    setList(load())
    if (!ok) setSaveFailed(true)
    setUndoAvailable(hasUndo())
    setRestoreFeedback(t(messageKey))
  }

  const handleUndo = () => {
    const previous = undoLastRestore()
    if (!previous) {
      // The snapshot is still there; the write is what failed.
      setSaveFailed(true)
      return
    }
    setList(previous)
    setUndoAvailable(false)
    setRestoreFeedback(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{t('tracker.title')}</h2>
          <p className="text-[13px] text-ink-soft">{t('tracker.trackedCount', { n: list.length })}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
            {coverageText}
            {coverage.stale && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={handleSweepToggle}
                  className="font-semibold text-saffron underline hover:text-saffron"
                >
                  {t('coverage.sweepAgain')}
                </button>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportImportButtons
            onExport={handleExport}
            onImportFile={handleImportFile}
            onSweepToggle={handleSweepToggle}
          />
          {formMode === 'closed' && (
            <button
              type="button"
              onClick={() => setFormMode('add')}
              className="rounded-xl bg-saffron px-4 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98]"
            >
              {t('tracker.openAdd')}
            </button>
          )}
        </div>
      </div>

      {saveFailed && (
        <div role="alert" className="rounded-2xl border border-alarm/30 bg-alarm/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-bold text-alarm">{t('tracker.saveFailed.title')}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{t('tracker.saveFailed.body')}</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-xl border border-line bg-paper px-3 py-2 text-[13px] font-bold text-ink-soft shadow-sm transition-colors hover:border-saffron hover:text-saffron"
            >
              {t('tracker.export')}
            </button>
          </div>
        </div>
      )}

      {pendingBackup && (
        <Card className="space-y-3 p-4">
          <div>
            <h3 className="text-base font-bold">{t('tracker.import')}</h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              {t('tracker.restore.found', { n: pendingBackup.tracker.length })}{' '}
              {t('tracker.restore.overlap', {
                n: pendingBackup.tracker.filter((b) => list.some((a) => a.id === b.id)).length,
              })}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => applyBackup(mergeBackup, 'tracker.restore.merged')}
              className="flex flex-col items-start rounded-xl border-2 border-saffron bg-saffron-soft/30 p-3.5 text-left transition-colors hover:bg-saffron-soft"
            >
              <span className="text-[14px] font-bold text-saffron">{t('tracker.restore.merge')}</span>
              <span className="mt-1 text-[12px] leading-relaxed text-ink-soft">{t('tracker.restore.mergeHint')}</span>
            </button>
            <button
              type="button"
              onClick={() => applyBackup(restoreAll, 'tracker.restore.replaced')}
              className="flex flex-col items-start rounded-xl border border-alarm/40 bg-alarm/5 p-3.5 text-left transition-colors hover:bg-alarm/10"
            >
              <span className="text-[14px] font-bold text-alarm">{t('tracker.restore.replace')}</span>
              <span className="mt-1 text-[12px] leading-relaxed text-ink-soft">{t('tracker.restore.replaceHint')}</span>
            </button>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setPendingBackup(null)}
              className="rounded-xl border border-line px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
            >
              {t('tracker.restore.cancel')}
            </button>
          </div>
        </Card>
      )}

      {sweepOpen && !pendingBackup && (
        <SweepPanel
          list={list}
          onAdd={handleSweepAdd}
          onCancel={() => setSweepOpen(false)}
        />
      )}

      {restoreFeedback && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card p-3 text-[13px]">
          <p className="font-medium text-ink-soft">{restoreFeedback}</p>
          {undoAvailable && (
            <button
              type="button"
              onClick={handleUndo}
              className="rounded-lg border border-line bg-paper px-3 py-1 text-xs font-bold text-ink-soft transition-colors hover:border-saffron hover:text-saffron"
            >
              {t('tracker.restore.undo')}
            </button>
          )}
        </div>
      )}

      {restoreError && (
        <div role="alert" className="flex items-center justify-between gap-2 rounded-xl border border-alarm/30 bg-alarm/10 p-3 text-[13px] text-alarm">
          <span>{restoreError}</span>
          <button
            type="button"
            onClick={() => setRestoreError(null)}
            className="text-xs font-semibold underline"
          >
            {t('tracker.restore.cancel')}
          </button>
        </div>
      )}

      {formMode !== 'closed' && (
        <ApplicationFormPanel initial={editingApp} onSave={handleSave} onCancel={() => setFormMode('closed')} />
      )}

      {list.length === 0 && formMode === 'closed' ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {STAGE_ORDER.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              apps={grouped[stage]}
              onEdit={(id) => setFormMode({ editId: id })}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * An empty board is the first thing a new visitor sees now that the tracker is
 * the home page, so it shows a worked example rather than an invitation. The
 * "add" call to action lives in the header above and is not repeated here.
 *
 * Read-only by construction: the cards carry no handlers, so ApplicationCard
 * drops its action row. No "example mode" branch to keep in sync.
 *
 * The board manufactures six company names and three LPA chips. Nothing hides
 * them: Notes mode was removed as a disguise that did not disguise. See
 * `docs/ARCHITECTURE.md` for the replacement this is waiting on.
 */
function EmptyState() {
  const t = useT()
  const examples = useMemo(() => exampleApplications(todayIso(), (key) => t(key)), [t])
  const grouped = useMemo(() => {
    const g: Record<Stage, Application[]> = {
      researching: [],
      applied: [],
      interviewing: [],
      offer: [],
      decided: [],
    }
    for (const app of examples) g[app.stage].push(app)
    return g
  }, [examples])

  return (
    <div className="rounded-2xl border border-dashed border-line p-4">
      <p className="text-[15px] font-semibold">{t('tracker.empty.title')}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-saffron-soft px-2 py-0.5 text-[11px] font-bold text-saffron">
          {t('ui.exampleChip')}
        </span>
        <p className="text-[13px] font-semibold">{t('tracker.example.title')}</p>
      </div>
      <p className="mb-4 mt-1 text-[12px] leading-relaxed text-ink-faint">{t('ui.exampleNote')}</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {STAGE_ORDER.map((stage) => (
          <StageColumn key={stage} stage={stage} apps={grouped[stage]} />
        ))}
      </div>
    </div>
  )
}

function ExportImportButtons({
  onExport,
  onImportFile,
  onSweepToggle,
}: {
  onExport: () => void
  onImportFile: (file: File) => void
  onSweepToggle: () => void
}) {
  const t = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <>
      <button
        type="button"
        onClick={onExport}
        className="rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold text-ink-soft"
      >
        {t('tracker.export')}
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold text-ink-soft"
      >
        {t('tracker.import')}
      </button>
      <button
        type="button"
        onClick={onSweepToggle}
        className="rounded-xl border border-line px-3 py-2.5 text-[13px] font-semibold text-ink-soft"
      >
        {t('tracker.sweep')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImportFile(file)
          e.target.value = ''
        }}
      />
    </>
  )
}

interface FormState {
  company: string
  role: string
  stage: Stage
  ctcLPA: number
  noticePeriodDays: number
  source: string
  nextAction: string
  nextActionDate: string
  appliedOn: string
  notes: string
}

function toFormState(app?: Application): FormState {
  return {
    company: app?.company ?? '',
    role: app?.role ?? '',
    stage: app?.stage ?? 'researching',
    ctcLPA: (app?.ctcDiscussedAnnual ?? 0) / L,
    noticePeriodDays: app?.noticePeriodDays ?? 0,
    source: app?.source ?? '',
    nextAction: app?.nextAction ?? '',
    nextActionDate: app?.nextActionDate ?? '',
    appliedOn: app?.appliedOn ?? '',
    notes: app?.notes ?? '',
  }
}

/** Shared inline form panel for both adding and editing an application. */
function ApplicationFormPanel({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Application
  onSave: (data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const t = useT()
  const STAGE_LABEL = useStageLabel()
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const canSave = form.company.trim() !== '' && form.role.trim() !== ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave({
      company: form.company.trim(),
      role: form.role.trim(),
      stage: form.stage,
      ctcDiscussedAnnual: form.ctcLPA > 0 ? form.ctcLPA * L : undefined,
      noticePeriodDays: form.noticePeriodDays > 0 ? form.noticePeriodDays : undefined,
      source: form.source.trim() || undefined,
      nextAction: form.nextAction.trim() || undefined,
      nextActionDate: form.nextActionDate || undefined,
      appliedOn: form.appliedOn || undefined,
      notes: form.notes.trim() || undefined,
    })
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-base font-bold">{initial ? t('tracker.form.editTitle') : t('tracker.form.addTitle')}</h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t('tracker.field.company.label')} value={form.company} onChange={(v) => set({ company: v })} required />
          <TextField label={t('tracker.field.role.label')} value={form.role} onChange={(v) => set({ role: v })} required />
          <Select
            label={t('tracker.field.stage.label')}
            value={form.stage}
            onChange={(v) => set({ stage: v })}
            options={STAGE_ORDER.map((s) => ({ value: s, label: STAGE_LABEL[s] }))}
          />
          <NumberField
            label={t('tracker.field.ctcDiscussed.label')}
            suffix="LPA"
            step={0.5}
            value={form.ctcLPA}
            onChange={(v) => set({ ctcLPA: v })}
          />
          <NumberField
            label={t('tracker.field.notice.label')}
            suffix={t('unit.days')}
            value={form.noticePeriodDays}
            onChange={(v) => set({ noticePeriodDays: v })}
          />
          <TextField
            label={t('tracker.field.source.label')}
            hint={t('tracker.field.source.hint')}
            value={form.source}
            onChange={(v) => set({ source: v })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t('tracker.field.nextAction.label')} value={form.nextAction} onChange={(v) => set({ nextAction: v })} />
          <TextField
            label={t('tracker.field.nextActionDate.label')}
            type="date"
            value={form.nextActionDate}
            onChange={(v) => set({ nextActionDate: v })}
          />
          <TextField
            label={t('tracker.field.appliedOn.label')}
            type="date"
            value={form.appliedOn}
            onChange={(v) => set({ appliedOn: v })}
          />
        </div>
        <TextArea label={t('tracker.field.notes.label')} value={form.notes} onChange={(v) => set({ notes: v })} />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canSave}
            className="rounded-xl bg-saffron px-4 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {initial ? t('tracker.saveChanges') : t('tracker.submitAdd')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-4 py-2.5 text-[14px] font-semibold text-ink-soft"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </Card>
  )
}

function StageColumn({
  stage,
  apps,
  onEdit,
  onDelete,
  onMove,
}: {
  stage: Stage
  apps: Application[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onMove?: (id: string, dir: -1 | 1) => void
}) {
  const t = useT()
  const STAGE_LABEL = useStageLabel()
  // Mobile: a stage with nothing in it just wastes a stacked screen's worth of
  // scroll, so hide it below lg. At lg+ (the 5-column board) all stages stay
  // visible so the pipeline shape is always readable.
  return (
    <div className={`space-y-3 ${apps.length === 0 ? 'hidden lg:block' : ''}`}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold">{STAGE_LABEL[stage]}</h3>
        <span className="tnum rounded-full bg-line px-2 py-0.5 text-xs font-bold text-ink-soft">{apps.length}</span>
      </div>
      <div className="space-y-3">
        {apps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center text-xs text-ink-faint">
            {t('tracker.noApplicationsInStage')}
          </p>
        ) : (
          apps.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onEdit={onEdit && (() => onEdit(app.id))}
              onDelete={onDelete && (() => onDelete(app.id))}
              onMove={onMove && ((dir) => onMove(app.id, dir))}
            />
          ))
        )}
      </div>
    </div>
  )
}

/** Handlers are omitted on the read-only example board; the action row goes with them. */
function ApplicationCard({
  app,
  onEdit,
  onDelete,
  onMove,
}: {
  app: Application
  onEdit?: () => void
  onDelete?: () => void
  onMove?: (dir: -1 | 1) => void
}) {
  const t = useT()
  const { lang } = useLang()
  const STAGE_LABEL = useStageLabel()
  const idx = STAGE_ORDER.indexOf(app.stage)
  const isOverdue = !!app.nextActionDate && app.nextActionDate < todayIso()
  const hasChips =
    !!app.appliedOn || !!app.ctcDiscussedAnnual || !!app.noticePeriodDays || !!app.source || !!app.insights?.length
  const actions = STAGE_ACTIONS[app.stage] ?? []
  const isPrefilledDecoder = app.stage === 'offer' && actions.includes('decoder') && !!app.ctcDiscussedAnnual

  return (
    <Card className="space-y-2 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[14px] font-bold leading-tight">{app.company}</p>
          <p className="text-[13px] text-ink-soft">{app.role}</p>
        </div>
        <span className="shrink-0 rounded-full bg-saffron-soft px-2 py-0.5 text-[10px] font-bold text-saffron lg:hidden">
          {STAGE_LABEL[app.stage]}
        </span>
      </div>

      {hasChips && (
        <div className="flex flex-wrap gap-1.5">
          {!!app.ctcDiscussedAnnual && <Chip>{formatLPA(app.ctcDiscussedAnnual)}</Chip>}
          {!!app.noticePeriodDays && <Chip>{t('tracker.noticeChip', { n: app.noticePeriodDays })}</Chip>}
          {app.source && <Chip>{app.source}</Chip>}
          {/* Last: money and terms are what the eye scans a card for; the date is context. */}
          {!!app.appliedOn && <Chip>{t('tracker.chip.appliedOn', { date: formatDate(app.appliedOn) })}</Chip>}
          {!!app.insights?.length && <Chip>💡 {app.insights.length}</Chip>}
        </div>
      )}

      {app.nextAction && (
        <p className="text-[13px] leading-snug">
          <span className="font-semibold">{t('tracker.nextLabel')} </span>
          {app.nextAction}
          {app.nextActionDate && (
            <span className={`tnum ml-1 ${isOverdue ? 'font-bold text-alarm' : 'text-ink-faint'}`}>
              ({formatDate(app.nextActionDate)})
            </span>
          )}
        </p>
      )}

      {actions.length > 0 && (
        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink-faint">{t('tracker.doorway.label')}</span>
            {actions.map((slug) => {
              const tool = TOOLS.find((entry) => entry.slug === slug)
              if (!tool) return null
              const isPrefilledThis = slug === 'decoder' && isPrefilledDecoder
              return (
                <a
                  key={slug}
                  href={withLang(lang, slug)}
                  onClick={
                    isPrefilledThis
                      ? () =>
                          writeHandoff({
                            to: 'decoder',
                            at: Date.now(),
                            ctcAnnual: app.ctcDiscussedAnnual,
                            noticePeriodDays: app.noticePeriodDays,
                          })
                      : undefined
                  }
                  className={`inline-flex min-h-[28px] items-center rounded-full border bg-paper px-2.5 text-[12px] font-bold transition-colors hover:border-saffron hover:text-saffron ${
                    isPrefilledThis ? 'border-saffron/50 text-saffron' : 'border-line text-ink-soft'
                  }`}
                >
                  {t(tool.titleKey)}
                </a>
              )
            })}
          </div>
          {isPrefilledDecoder && (
            <p className="text-[11px] leading-relaxed text-ink-faint">{t('tracker.doorway.prefilled')}</p>
          )}
        </div>
      )}

      {onMove && onEdit && onDelete && (
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label={t('tracker.movePrev')}
            disabled={idx === 0}
            onClick={() => onMove(-1)}
            className="rounded-lg border border-line px-2 py-1 text-xs font-bold disabled:opacity-30"
          >
            ←
          </button>
          <button
            type="button"
            aria-label={t('tracker.moveNext')}
            disabled={idx === STAGE_ORDER.length - 1}
            onClick={() => onMove(1)}
            className="rounded-lg border border-line px-2 py-1 text-xs font-bold disabled:opacity-30"
          >
            →
          </button>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={onEdit} className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-soft">
            {t('tracker.edit')}
          </button>
          <button type="button" onClick={onDelete} className="rounded-lg px-2 py-1 text-xs font-semibold text-alarm">
            {t('common.delete')}
          </button>
        </div>
      </div>
      )}
    </Card>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft">
      {children}
    </span>
  )
}
