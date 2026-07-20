import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { RedFlag, SalaryBreakdown } from '../engine/types'
import { formatINR, formatLPA } from '../engine/format'
import { useT } from '../i18n'

/**
 * The WhatsApp artifact: a dark card rendered off-screen at 3x and downloaded
 * as PNG. Deliberately shows only the headline truth — no personal details.
 */
export function ShareButton({ b, flags }: { b: SalaryBreakdown; flags: RedFlag[] }) {
  const t = useT()
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const realFlags = flags.filter((f) => f.severity !== 'info').length
  const pct = Math.round(b.inHandRatio * 100)

  const download = async () => {
    if (!ref.current) return
    setBusy(true)
    try {
      const url = await toPng(ref.current, { pixelRatio: 3, cacheBust: true })
      const a = document.createElement('a')
      a.href = url
      a.download = 'switch-karle-ctc-truth.png'
      a.click()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        className="w-full rounded-2xl bg-saffron px-5 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-saffron/25 transition-transform active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? t('shareCard.cta.rendering') : t('shareCard.cta.download')}
      </button>

      {/* Off-screen render target */}
      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={ref} className="w-[360px] bg-night p-7 text-white" style={{ fontFamily: 'Inter Variable, sans-serif' }}>
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/50">{t('shareCard.eyebrow')}</p>
          <p className="tnum mt-4 text-[15px] font-semibold text-white/70">
            {t('shareCard.ctcSounds', { ctc: formatLPA(b.input.ctcAnnual), amount: formatINR(b.input.ctcAnnual / 12) })}
          </p>
          <p className="mt-3 text-[13px] font-semibold text-white/50">{t('shareCard.butBank')}</p>
          <p className="tnum text-[40px] font-extrabold leading-tight text-[#ffb84d]">
            {formatINR(b.inHandMonthly)}
            <span className="text-lg font-bold text-white/60">/mo</span>
          </p>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-[#ffb84d]" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="tnum mt-2 text-[13px] font-semibold text-white/70">{t('shareCard.reaches', { pct })}</p>
          {realFlags > 0 && (
            <p className="mt-4 inline-block rounded-full bg-[#c92a2a] px-3 py-1 text-[12px] font-extrabold">
              {t('shareCard.redFlags', { n: realFlags, plural: realFlags === 1 ? '' : 's' })}
            </p>
          )}
          <div className="mt-6 flex items-baseline justify-between border-t border-white/15 pt-4">
            <p className="text-[15px] font-extrabold">
              Switch <span className="font-semibold text-white/60">Karle</span>
            </p>
            <p className="text-[11px] font-semibold text-white/50">{t('shareCard.footer')}</p>
          </div>
        </div>
      </div>
    </>
  )
}
