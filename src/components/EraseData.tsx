import { useEffect, useState } from 'react'
import { eraseAll, savedCount, type EraseResult } from '../lib/erase'
import { useT } from '../i18n'

/**
 * The one control that erases everything this site has saved in the browser.
 *
 * The same component in the footer and on the tracker, so the wording and the
 * confirm step cannot drift apart between the two places a frightened user
 * looks for it.
 *
 * A successful erase reloads the page. Every tool keeps its draft in React
 * state and writes it back on the next keystroke, so a tool left open would
 * re-save the numbers we just removed; the reload is what makes the erase
 * hold. Nothing is written before the reload — it re-mounts on empty storage.
 */
export function EraseData({ className }: { className?: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [result, setResult] = useState<EraseResult | null>(null)

  const erased = result != null && result.removed.length > 0

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (erased) window.location.reload()
      else setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, erased])

  function openDialog() {
    setCount(savedCount())
    setResult(null)
    setOpen(true)
  }

  function close() {
    if (erased) {
      window.location.reload()
      return
    }
    setOpen(false)
  }

  function confirm() {
    setResult(eraseAll())
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={className ?? 'font-semibold underline'}
      >
        {t('erase.button')}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh]"
          onClick={close}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-paper p-5 text-left shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="erase-title"
          >
            <h2 id="erase-title" className="text-base font-bold">
              {t('erase.title')}
            </h2>

            {result == null ? (
              <>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {count === 0
                    ? t('erase.empty')
                    : count === 1
                      ? t('erase.savedOne')
                      : t('erase.saved', { n: count })}
                </p>
                {count > 0 && (
                  <p className="mt-2 text-[13px] font-semibold leading-relaxed text-alarm">
                    {t('erase.warning')}
                  </p>
                )}
                <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
                  {t('erase.historyNote')}
                </p>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl border border-line px-3 py-2 text-[13px] font-semibold text-ink-soft"
                  >
                    {count === 0 ? t('erase.close') : t('erase.cancel')}
                  </button>
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={confirm}
                      className="rounded-xl bg-alarm px-4 py-2 text-[13px] font-bold text-white"
                    >
                      {t('erase.confirm')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {result.removed.length === 1
                    ? t('erase.doneOne')
                    : t('erase.done', { n: result.removed.length })}
                </p>
                {result.failed.length > 0 && (
                  <p role="alert" className="mt-2 text-[13px] font-semibold leading-relaxed text-alarm">
                    {t('erase.failed', { n: result.failed.length })}
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-xl border border-line px-3 py-2 text-[13px] font-semibold text-ink-soft"
                  >
                    {t('erase.close')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
