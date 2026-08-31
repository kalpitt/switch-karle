import { useState } from 'react'
import type { Application } from '../tracker/types'
import {
  ingest,
  parseIngestPayload,
  type IngestCandidate,
  type IngestResult,
  type RejectedRow,
} from '../engine/ingest'
import { SWEEP_PROMPT } from '../prompts/sweep'
import { useT } from '../i18n'
import { Card, TextArea } from './ui'
import { todayIso } from '../lib/today'
import { extractJsonObject } from '../lib/extractJsonObject'
import { formatDate } from '../lib/formatDate'

const SKIPPED_REASONS: { reason: RejectedRow['reason']; key: string }[] = [
  { reason: 'already-on-board', key: 'sweep.skipped.alreadyOnBoard' },
  { reason: 'out-of-scope', key: 'sweep.skipped.outOfScope' },
  { reason: 'duplicate-in-payload', key: 'sweep.skipped.duplicateInPayload' },
  { reason: 'unreadable-date', key: 'sweep.skipped.unreadableDate' },
  { reason: 'no-company', key: 'sweep.skipped.noCompany' },
]

export function SweepPanel({
  list,
  onAdd,
  onCancel,
}: {
  list: Application[]
  onAdd: (candidates: IngestCandidate[]) => void
  onCancel: () => void
}) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SWEEP_PROMPT)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard permission denied */
    }
  }

  const handleRead = () => {
    setError(null)
    try {
      const payload = parseIngestPayload(extractJsonObject(text))
      const res = ingest(payload, list, { today: todayIso() })
      setResult(res)
      const closedSet = new Set(res.likelyClosed)
      const initialSelected = new Set<number>()
      res.accepted.forEach((_, idx) => {
        if (!closedSet.has(idx)) {
          initialSelected.add(idx)
        }
      })
      setSelected(initialSelected)
    } catch {
      setError(t('sweep.invalid'))
    }
  }

  const handleAdd = () => {
    if (!result) return
    const checked = result.accepted.filter((_, idx) => selected.has(idx))
    if (checked.length > 0) {
      onAdd(checked)
    }
  }

  const skippedEntries = result
    ? SKIPPED_REASONS.filter(({ reason }) => result.counts[reason] > 0)
    : []

  return (
    <Card className="space-y-4 p-4">
      <div>
        <h3 className="text-base font-bold">{t('sweep.title')}</h3>
        <p className="mt-1 text-[13px] text-ink-soft">{t('sweep.step1')}</p>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <pre className="max-h-48 overflow-y-auto rounded-xl border border-line bg-paper p-3 text-xs font-mono whitespace-pre-wrap select-all text-ink-soft">
            {SWEEP_PROMPT}
          </pre>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-line bg-paper px-3 py-1.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-saffron hover:text-saffron"
            >
              {copied ? t('sweep.copied') : t('sweep.copy')}
            </button>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">{t('sweep.privacy')}</p>
      </div>

      <div className="space-y-2">
        <TextArea
          label={t('sweep.step2')}
          value={text}
          onChange={(val) => setText(val)}
          rows={4}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRead}
            disabled={text.trim() === ''}
            className="rounded-xl bg-saffron px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-saffron/20 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {t('sweep.read')}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-alarm/30 bg-alarm/10 p-3 text-[13px] text-alarm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 border-t border-line pt-4">
          {result.accepted.length === 0 ? (
            <p className="text-[13px] font-medium text-ink-soft">{t('sweep.nothing')}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-ink">
                {t('sweep.found', { n: result.accepted.length })}
              </p>
              <div className="max-h-60 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-paper p-2">
                {result.accepted.map((candidate, idx) => {
                  const isClosed = result.likelyClosed.includes(idx)
                  const isChecked = selected.has(idx)
                  return (
                    <label
                      key={idx}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-card"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selected)
                            if (e.target.checked) {
                              next.add(idx)
                            } else {
                              next.delete(idx)
                            }
                            setSelected(next)
                          }}
                          className="h-4 w-4 rounded border-line text-saffron focus:ring-saffron"
                        />
                        <div className="min-w-0 text-[13px]">
                          <span className="font-semibold text-ink">{candidate.company}</span>
                          {candidate.role && (
                            <span className="ml-1.5 text-ink-soft">— {candidate.role}</span>
                          )}
                          {candidate.appliedOn && (
                            <span className="ml-1.5 text-xs text-ink-faint">
                              ({formatDate(candidate.appliedOn)})
                            </span>
                          )}
                        </div>
                      </div>
                      {isClosed && (
                        <span className="shrink-0 rounded-full border border-alarm/20 bg-alarm-soft px-2 py-0.5 text-[11px] font-medium text-alarm">
                          {t('sweep.looksClosed')}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {skippedEntries.length > 0 && (
            <div className="space-y-1 rounded-xl border border-line bg-paper p-3 text-xs text-ink-soft">
              {skippedEntries.map(({ reason, key }) => (
                <p key={reason}>{t(key, { n: result.counts[reason] })}</p>
              ))}
            </div>
          )}

          <p className="text-xs leading-relaxed text-ink-faint">{t('sweep.incomplete')}</p>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-line px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
            >
              {t('tracker.restore.cancel')}
            </button>
            {result.accepted.length > 0 && (
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={handleAdd}
                className="rounded-xl bg-saffron px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-saffron/20 transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {t('sweep.add')}
              </button>
            )}
          </div>
        </div>
      )}

      {!result && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-3 py-1.5 text-[13px] font-semibold text-ink-soft"
          >
            {t('tracker.restore.cancel')}
          </button>
        </div>
      )}
    </Card>
  )
}
