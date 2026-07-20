import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Application, Stage } from '../tracker/types'
import {
  addApplication,
  exportAll,
  importAll,
  load,
  moveStage,
  removeApplication,
  save,
  STAGE_ORDER,
  updateApplication,
} from '../tracker/store'
import { formatLPA } from '../engine/format'
import { useT } from '../i18n'
import { Card, NumberField, Select, TextArea, TextField } from './ui'

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
  const [list, setList] = useState<Application[]>(() => load())
  const [formMode, setFormMode] = useState<FormMode>('closed')

  useEffect(() => {
    save(list)
  }, [list])

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
    if (!confirm(t('tracker.confirmImport'))) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importAll(String(reader.result))
        setList(load())
        alert(t('tracker.importSuccess'))
      } catch (err) {
        alert(err instanceof Error ? err.message : t('tracker.importError'))
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{t('tracker.title')}</h2>
          <p className="text-[13px] text-ink-soft">{t('tracker.trackedCount', { n: list.length })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportImportButtons onExport={handleExport} onImportFile={handleImportFile} />
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

      {formMode !== 'closed' && (
        <ApplicationFormPanel initial={editingApp} onSave={handleSave} onCancel={() => setFormMode('closed')} />
      )}

      {list.length === 0 && formMode === 'closed' ? (
        <EmptyState onAdd={() => setFormMode('add')} />
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const t = useT()
  return (
    <Card className="flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-[15px] font-semibold">{t('tracker.empty.title')}</p>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-xl bg-saffron px-5 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98]"
      >
        {t('tracker.empty.cta')}
      </button>
    </Card>
  )
}

function ExportImportButtons({
  onExport,
  onImportFile,
}: {
  onExport: () => void
  onImportFile: (file: File) => void
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
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
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
              onEdit={() => onEdit(app.id)}
              onDelete={() => onDelete(app.id)}
              onMove={(dir) => onMove(app.id, dir)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ApplicationCard({
  app,
  onEdit,
  onDelete,
  onMove,
}: {
  app: Application
  onEdit: () => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const t = useT()
  const STAGE_LABEL = useStageLabel()
  const idx = STAGE_ORDER.indexOf(app.stage)
  const isOverdue = !!app.nextActionDate && app.nextActionDate < todayIso()
  const hasChips = app.ctcDiscussedAnnual || app.noticePeriodDays || app.source || app.insights?.length

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

function todayIso(): string {
  // Local date, not UTC — an IST user's "overdue" must flip at their midnight.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
