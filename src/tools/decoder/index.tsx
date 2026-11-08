import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { decodeOffer } from '../../engine/salary'
import { scanRedFlags } from '../../engine/redFlags'
import { DecoderForm } from '../../components/DecoderForm'
import { Results } from '../../components/Results'
import { ShareButton } from '../../components/ShareCard'
import { AutoFill } from '../../components/AutoFill'
import { NextStep } from '../../components/NextStep'
import { IslandRoot } from '../../components/IslandRoot'
import { DECODER_STORAGE_KEY, DEFAULT_OFFER, consumeHandoff, loadOffer, saveOffer } from '../../data/defaults'
import { releaseBootEcho } from '../../lib/storage'
import type { OfferInput } from '../../engine/types'
import { formatINR } from '../../engine/format'
import { useT, type Lang } from '../../i18n'

function SeededNote() {
  const t = useT()
  return (
    <p className="rounded-xl bg-saffron-soft px-3 py-2.5 text-[14px] leading-relaxed text-ink-soft">
      {t('decoder.seeded')}
    </p>
  )
}

/**
 * On a phone, once the main result card has scrolled up out of view, a thin bar
 * keeps the one number that matters on screen (decided 2026-11-07). It watches
 * the result card already on the page, so the result column stays as it is.
 */
function StickyInHand({ within, amount }: { within: RefObject<HTMLDivElement | null>; amount: string }) {
  const t = useT()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = within.current?.querySelector('[data-result-hero]')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    // Only once it has gone up past the top: below the fold it is still to come.
    const io = new IntersectionObserver(([entry]) => {
      if (entry) setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    io.observe(hero)
    return () => io.disconnect()
  }, [within])
  if (!show) return null
  return (
    <div
      data-sticky-inhand
      className="no-print fixed inset-x-0 top-0 z-20 border-b border-line bg-card px-4 py-2 text-[14px] font-semibold leading-snug text-ink shadow-sm md:hidden"
    >
      <span className="tnum">{t('decoder.stickyLabel', { amount })}</span>
    </div>
  )
}

export default function DecoderTool({ lang = 'en' }: { lang?: Lang }) {
  const [offer, setOffer] = useState(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)
  // A CTC carried in from a tracker card is a suggestion, not a decision. Hold
  // the write until the user edits something, so opening a doorway out of
  // curiosity cannot overwrite the offer they built here.
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    const saved = loadOffer()
    const handoff = consumeHandoff('decoder')
    if (handoff?.ctcAnnual || handoff?.noticePeriodDays) {
      setOffer({
        ...saved,
        ...(handoff.ctcAnnual ? { ctcAnnual: handoff.ctcAnnual } : {}),
        ...(handoff.noticePeriodDays ? { noticePeriodDays: handoff.noticePeriodDays } : {}),
      })
      setSeeded(true)
      // Holding the write below means this tool never makes the mount echo that
      // storage expects to spend its "do not create the key for untouched
      // defaults" skip on. Say so, or the skip is still armed when the user's
      // first real edit arrives and that edit is silently dropped.
      releaseBootEcho(DECODER_STORAGE_KEY)
    } else {
      setOffer(saved)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || seeded) return
    saveOffer(offer)
  }, [offer, hydrated, seeded])

  const edit = (next: OfferInput) => {
    setSeeded(false)
    setOffer(next)
  }

  const breakdown = useMemo(() => decodeOffer(offer), [offer])
  const flags = useMemo(() => scanRedFlags(breakdown), [breakdown])
  const grid = useRef<HTMLDivElement>(null)

  return (
    <IslandRoot lang={lang} current="decoder">
      <div ref={grid} data-tool="decoder" className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:grid-rows-[auto_1fr] lg:items-start">
        {/* The answer comes first in the page, as phones show it; on wide screens
            it is moved to the right-hand column with CSS order (A11Y N5). */}
        <Results b={breakdown} flags={flags} />
        <div className="space-y-4 lg:row-span-2 lg:sticky lg:top-20">
          {seeded && <SeededNote />}
          <AutoFill offer={offer} onChange={edit} />
          <DecoderForm value={offer} onChange={edit} />
          <ShareButton b={breakdown} flags={flags} />
        </div>
        <NextStep className="lg:order-last lg:col-start-2" from="decoder" />
      </div>
      <StickyInHand within={grid} amount={formatINR(breakdown.inHandMonthly)} />
    </IslandRoot>
  )
}

