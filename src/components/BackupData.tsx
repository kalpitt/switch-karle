import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import {
  countOverlap,
  exportEverything,
  parseEverything,
  restoreEverything,
  type RestoreResult,
} from '../lib/backup'
import { downloadBlob } from '../lib/downloadBlob'
import { savedCount } from '../lib/erase'

/**
 * Footer control: download one file holding everything this site saved in the
 * browser, or restore from such a file. Both happen on this device only.
 *
 * Like EraseData, a restore that wrote anything reloads the page on close:
 * an open tool keeps its draft in React state and would write the old values
 * back over the restored ones on its next save.
 */
export function BackupData({ className }: { className?: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [pending, setPending] = useState<{ keys: Record<string, string>; overlap: number } | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [result, setResult] = useState<RestoreResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const restored = result != null && result.written.length > 0

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function openDialog() {
    setCount(savedCount())
    setPending(null)
    setInvalid(false)
    setResult(null)
    setOpen(true)
  }

  function close() {
    if (restored) {
      window.location.reload()
      return
    }
    setOpen(false)
  }

  function download() {
    const day = new Date().toISOString().slice(0, 10)
    downloadBlob(new Blob([exportEverything()], { type: 'application/json' }), `switch-karle-backup-${day}.json`)
  }

  function onFile(file: File) {
    setInvalid(false)
    setPending(null)
    setResult(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const keys = parseEverything(String(reader.result))
        setPending({ keys, overlap: countOverlap(keys) })
      } catch {
        setInvalid(true)
      }
    }
    reader.readAsText(file)
  }

  function apply(keepExisting: boolean) {
    if (!pending) return
    setResult(restoreEverything(pending.keys, keepExisting))
    setPending(null)
  }

  const btn = 'min-h-11 rounded-xl px-4 py-2 text-[13px] font-bold'
  const n = pending ? Object.keys(pending.keys).length : 0

  return (
    <>
      <button type="button" onClick={openDialog} className={className ?? 'py-1 font-semibold underline'}>
        {t('backup.button')}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 pt-[10vh]" onClick={close}>
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-paper p-5 text-left text-ink shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="backup-title"
          >
            <h2 id="backup-title" className="text-base font-bold">
              {t('backup.title')}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{t('backup.intro')}</p>
            <p className="mt-2 text-[13px] font-semibold leading-relaxed">
              {count === 0 ? t('backup.empty') : count === 1 ? t('backup.savedOne') : t('backup.saved', { n: count })}
            </p>
            {count > 0 && (
              <button type="button" onClick={download} className={`${btn} mt-3 bg-saffron text-white`}>
                {t('backup.download')}
              </button>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <h3 className="text-[14px] font-bold">{t('backup.restoreHead')}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{t('backup.restoreHint')}</p>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onFile(file)
                  e.target.value = ''
                }}
              />
              {result == null && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`${btn} mt-3 border border-line bg-card text-ink`}
                >
                  {t('backup.choose')}
                </button>
              )}
              {invalid && (
                <p role="alert" className="mt-2 text-[13px] font-semibold text-alarm">
                  {t('backup.invalid')}
                </p>
              )}
              {pending && (
                <div className="mt-3 rounded-xl border border-line bg-card p-3">
                  <p className="text-[13px] leading-relaxed">{t('backup.found', { n, m: pending.overlap })}</p>
                  {pending.overlap === 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => apply(true)} className={`${btn} bg-saffron text-white`}>
                        {t('backup.restore')}
                      </button>
                      <button type="button" onClick={() => setPending(null)} className={`${btn} border border-line text-ink-soft`}>
                        {t('backup.cancel')}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <button type="button" onClick={() => apply(true)} className={`${btn} w-full bg-saffron text-white`}>
                        {t('backup.keepMine')}
                      </button>
                      <p className="text-[12px] leading-relaxed text-ink-soft">{t('backup.keepMineHint')}</p>
                      <button type="button" onClick={() => apply(false)} className={`${btn} w-full border border-line bg-card text-ink`}>
                        {t('backup.useFile')}
                      </button>
                      <p className="text-[12px] leading-relaxed text-ink-soft">
                        {t('backup.useFileHint', { m: pending.overlap })}
                      </p>
                      <button type="button" onClick={() => setPending(null)} className={`${btn} border border-line text-ink-soft`}>
                        {t('backup.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {result && (
                <div role="status" className="mt-3 text-[13px] leading-relaxed">
                  <p className="font-semibold text-leaf">
                    {result.written.length === 0
                      ? t('backup.nothing')
                      : result.written.length === 1
                        ? t('backup.doneOne')
                        : t('backup.done', { n: result.written.length })}
                  </p>
                  {result.failed.length > 0 && (
                    <p role="alert" className="mt-1 font-semibold text-alarm">
                      {t('backup.failed', { n: result.failed.length })}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button type="button" onClick={close} className={`${btn} border border-line text-ink-soft`}>
                {t('backup.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
