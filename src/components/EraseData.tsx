import { useRef, useState } from 'react'
import { eraseAll, savedKeys, type EraseResult } from '../lib/erase'
import { withLang } from '../lib/langPath'
import { STORAGE_KEY as TRACKER_KEY } from '../tracker/store'
import { useLang, useT } from '../i18n'
import { useDialog } from './useDialog'

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
export function EraseData({ className, label }: { className?: string; label?: string }) {
  const t = useT()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  /** Only someone who has a board is told how to keep it. */
  const [hasBoard, setHasBoard] = useState(false)
  const [result, setResult] = useState<EraseResult | null>(null)

  const erased = result != null && result.removed.length > 0
  const panelRef = useRef<HTMLDivElement>(null)

  function openDialog() {
    const keys = savedKeys()
    setCount(keys.length)
    setHasBoard(keys.includes(TRACKER_KEY))
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

  // Focus goes to the first button (Cancel or Done), stays inside, Escape closes,
  // and focus returns to the footer link that opened it.
  useDialog(open, panelRef, close)

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={className ?? 'py-1 font-semibold underline'}
      >
        {label ?? t('erase.button')}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh]"
          onClick={close}
        >
          <div
            ref={panelRef}
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
                    {hasBoard && (
                      <>
                        {' '}
                        {t('erase.warningBoard')}{' '}
                        <a href={withLang(lang, 'tracker')} className="underline">
                          {t('erase.warningBoardLink')}
                        </a>
                      </>
                    )}
                  </p>
                )}
                <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
                  {t('erase.historyNote')}
                </p>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="min-h-[44px] rounded-xl border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
                  >
                    {count === 0 ? t('erase.close') : t('erase.cancel')}
                  </button>
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={confirm}
                      className="min-h-[44px] rounded-xl bg-alarm px-4 py-2 text-[13px] font-bold text-white"
                    >
                      {t('erase.confirm')}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p role="status" className="mt-2 text-[13px] leading-relaxed text-ink-soft">
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
                    // The buttons that had focus are gone; keep it inside the dialog.
                    autoFocus
                    className="min-h-[44px] rounded-xl border border-line px-4 py-2 text-[13px] font-semibold text-ink-soft"
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
