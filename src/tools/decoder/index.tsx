import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { scanRedFlags } from '../../engine/redFlags'
import { DecoderForm } from '../../components/DecoderForm'
import { Results } from '../../components/Results'
import { ShareButton } from '../../components/ShareCard'
import { AutoFill } from '../../components/AutoFill'
import { IslandRoot } from '../../components/IslandRoot'
import { DECODER_STORAGE_KEY, DEFAULT_OFFER, consumeHandoff, loadOffer, saveOffer } from '../../data/defaults'
import { releaseBootEcho } from '../../lib/storage'
import type { OfferInput } from '../../engine/types'
import { useT, type Lang } from '../../i18n'

function SeededNote() {
  const t = useT()
  return (
    <p className="rounded-xl border border-saffron/30 bg-saffron-soft px-3 py-2 text-[12px] leading-relaxed text-ink-soft">
      {t('decoder.seeded')}
    </p>
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

  return (
    <IslandRoot lang={lang} current="decoder">
      <div data-tool="decoder" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-6">
          {seeded && <SeededNote />}
          <AutoFill offer={offer} onChange={edit} />
          <DecoderForm value={offer} onChange={edit} />
          <ShareButton b={breakdown} flags={flags} />
        </div>
        <Results b={breakdown} flags={flags} />
      </div>
    </IslandRoot>
  )
}

