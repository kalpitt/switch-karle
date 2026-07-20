import { useState } from 'react'
import type { OfferInput } from '../engine/types'
import { TEMPLATES } from '../prompts/templates'
import { parseAiOffer } from '../prompts/offerImport'
import { useT } from '../i18n'

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
    <details className="group rounded-2xl border border-saffron/40 bg-saffron-soft/60">
      <summary className="cursor-pointer select-none list-none px-4 py-3 text-[13px] font-bold text-saffron">
        <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
        {t('autofill.summary')}
      </summary>
      <div className="space-y-3 px-4 pb-4">
        <p className="text-[13px] leading-relaxed text-ink-soft">{t('autofill.explainer')}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyPrompt}
            className="rounded-xl bg-saffron px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98]"
          >
            {copied ? t('autofill.copied') : t('autofill.copyPrompt')}
          </button>
        </div>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          placeholder={t('autofill.pastePlaceholder')}
          rows={4}
          className="w-full rounded-xl border border-line bg-card px-3 py-2.5 text-[13px] font-medium outline-none focus:border-saffron"
        />
        <button
          type="button"
          onClick={fill}
          disabled={pasted.trim() === ''}
          className="rounded-xl border border-saffron px-4 py-2.5 text-[13px] font-bold text-saffron transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {t('autofill.fillButton')}
        </button>
        {status.kind === 'ok' && (
          <div className="rounded-xl bg-leaf-soft p-3 text-[13px] leading-relaxed">
            <p className="font-bold text-leaf">
              {t('autofill.okFilled', { fields: status.filled.join(', ') })}
            </p>
            {status.missing.length > 0 && (
              <p className="mt-1 text-ink-soft">{t('autofill.okMissing', { n: status.missing.length })}</p>
            )}
          </div>
        )}
        {status.kind === 'error' && (
          <p className="rounded-xl bg-alarm-soft p-3 text-[13px] font-semibold text-alarm">
            {t('autofill.error')}
          </p>
        )}
        <p className="text-xs leading-relaxed text-ink-faint">{t('autofill.privacyNote')}</p>
      </div>
    </details>
  )
}
