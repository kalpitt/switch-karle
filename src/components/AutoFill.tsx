import { useRef, useState } from 'react'
import type { OfferInput } from '../engine/types'
import { TEMPLATES } from '../prompts/templates'
import { parseAiOffer } from '../prompts/offerImport'
import { useT } from '../i18n'
import { buttonClass } from './buttonClass'
import { ChevronRight, SparkleIcon } from './icons'

/**
 * The bridge for people who don't know their own salary structure: copy the
 * extractor prompt → paste the offer letter into their own AI → paste the
 * AI's answer back here → the Decoder form fills itself. No AI in-app.
 */
export function AutoFill({
  offer,
  onChange,
}: {
  offer: OfferInput
  onChange: (v: OfferInput) => void
}) {
  const t = useT()
  const [pasted, setPasted] = useState('')
  const [copied, setCopied] = useState(false)
  const pasteRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'ok'; filled: string[]; missing: string[] }
    | { kind: 'error' }
  >({ kind: 'idle' })

  const template = TEMPLATES.find((tp) => tp.id === 'offer-extract')!

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(template.build({}))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fill = () => {
    // The button stays reachable when the box is empty (a disabled button drops out
    // of the tab order and says nothing); pressing it then sends you to the box.
    if (pasted.trim() === '') {
      pasteRef.current?.focus()
      return
    }
    try {
      const r = parseAiOffer(pasted)
      onChange({ ...offer, ...r.patch })
      setStatus({ kind: 'ok', filled: r.filled, missing: r.missing })
      setPasted('')
    } catch {
      setStatus({ kind: 'error' })
    }
  }

  return (
    <details className="group rounded-2xl border border-line bg-card">
      <summary className="flex min-h-[48px] cursor-pointer select-none list-none items-center gap-2 px-4 py-3 text-[14px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <SparkleIcon className="text-saffron-strong" />
        <span className="flex-1">{t('autofill.summary')}</span>
        <ChevronRight className="text-ink-soft transition-transform group-open:rotate-90" />
      </summary>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-[14px] leading-relaxed text-ink-soft">{t('autofill.explainer')}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyPrompt}
            className={buttonClass('secondary', 'sm')}
          >
            <span aria-live="polite">{copied ? t('autofill.copied') : t('autofill.copyPrompt')}</span>
          </button>
        </div>
        <textarea
          ref={pasteRef}
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder={t('autofill.pastePlaceholder')}
          aria-label={t('autofill.pasteLabel')}
          rows={4}
          className="w-full rounded-xl border border-field bg-card px-3 py-2.5 text-[15px] font-medium outline-none hover:border-ink-soft focus:border-saffron focus:ring-[3px] focus:ring-saffron/25"
        />
        <button
          type="button"
          onClick={fill}
          aria-disabled={pasted.trim() === ''}
          className={buttonClass('primary', 'sm')}
        >
          {t('autofill.fillButton')}
        </button>
        {pasted.trim() === '' && <p className="text-[14px] leading-relaxed text-ink-soft">{t('autofill.fillBlocked')}</p>}
        {status.kind === 'ok' && (
          <div role="status" className="rounded-xl bg-leaf-soft p-3 text-[13px] leading-relaxed">
            <p className="font-bold text-leaf">
              {t('autofill.okFilled', { fields: status.filled.join(', ') })}
            </p>
            {status.missing.length > 0 && (
              <p className="mt-1 text-ink-soft">{status.missing.length === 1
                  ? t('autofill.okMissingOne')
                  : t('autofill.okMissing', { n: status.missing.length })}</p>
            )}
          </div>
        )}
        {status.kind === 'error' && (
          <p role="alert" className="rounded-xl bg-alarm-soft p-3 text-[13px] font-semibold text-alarm">
            {t('autofill.error')}
          </p>
        )}
        <p className="text-xs leading-relaxed text-ink-faint">{t('autofill.privacyNote')}</p>
      </div>
    </details>
  )
}
