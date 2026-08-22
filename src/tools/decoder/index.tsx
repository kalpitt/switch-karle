import { useEffect, useMemo, useState } from 'react'
import { decodeOffer } from '../../engine/salary'
import { scanRedFlags } from '../../engine/redFlags'
import { DecoderForm } from '../../components/DecoderForm'
import { Results } from '../../components/Results'
import { ShareButton } from '../../components/ShareCard'
import { AutoFill } from '../../components/AutoFill'
import { IslandRoot } from '../../components/IslandRoot'
import { DEFAULT_OFFER, loadOffer, saveOffer } from '../../data/defaults'
import type { Lang } from '../../i18n'

export default function DecoderTool({ lang = 'en' }: { lang?: Lang }) {
  const [offer, setOffer] = useState(DEFAULT_OFFER)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOffer(loadOffer())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveOffer(offer)
  }, [offer, hydrated])

  const breakdown = useMemo(() => decodeOffer(offer), [offer])
  const flags = useMemo(() => scanRedFlags(breakdown), [breakdown])

  return (
    <IslandRoot lang={lang} current="decoder">
      <div data-tool="decoder" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-6">
          <AutoFill offer={offer} onChange={setOffer} />
          <DecoderForm value={offer} onChange={setOffer} />
          <ShareButton b={breakdown} flags={flags} />
        </div>
        <Results b={breakdown} flags={flags} />
      </div>
    </IslandRoot>
  )
}
