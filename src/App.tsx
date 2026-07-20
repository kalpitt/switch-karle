import { useEffect, useMemo, useState } from 'react'
import type { OfferInput } from './engine/types'
import { decodeOffer } from './engine/salary'
import { scanRedFlags } from './engine/redFlags'
import { DecoderForm } from './components/DecoderForm'
import { Results } from './components/Results'
import { ShareButton } from './components/ShareCard'
import { Tracker } from './components/Tracker'

const STORAGE_KEY = 'chhalaang.decoder.v1'
const TAB_STORAGE_KEY = 'chhalaang.tab'

type Tab = 'decoder' | 'tracker'

function loadTab(): Tab {
  const raw = localStorage.getItem(TAB_STORAGE_KEY)
  return raw === 'tracker' ? 'tracker' : 'decoder'
}

const DEFAULT_OFFER: OfferInput = {
  ctcAnnual: 2_400_000,
  variableAnnual: 240_000,
  basicPercent: 40,
  hraPercentOfBasic: 50,
  employerPfInCtc: true,
  gratuityInCtc: false,
  pfOnFullBasic: true,
  noticePeriodDays: 60,
  state: 'KA',
}

function loadOffer(): OfferInput {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_OFFER, ...JSON.parse(raw) }
  } catch {
    /* corrupted storage → fall through to defaults */
  }
  return DEFAULT_OFFER
}

export default function App() {
  const [offer, setOffer] = useState<OfferInput>(loadOffer)
  const [tab, setTab] = useState<Tab>(loadTab)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offer))
  }, [offer])

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, tab)
  }, [tab])

  const breakdown = useMemo(() => decodeOffer(offer), [offer])
  const flags = useMemo(() => scanRedFlags(breakdown), [breakdown])

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">
          छलांग <span className="font-semibold text-ink-soft">chhalaang</span>
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">
          Decode your offer. Know what actually reaches your bank.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf">
          <span aria-hidden>●</span> 100% private — runs entirely in your browser, nothing is uploaded
        </p>

        <nav className="mt-4 inline-flex gap-1 rounded-full border border-line bg-card p-1">
          <TabButton active={tab === 'decoder'} onClick={() => setTab('decoder')}>
            Decoder
          </TabButton>
          <TabButton active={tab === 'tracker'} onClick={() => setTab('tracker')}>
            Tracker
          </TabButton>
        </nav>
      </header>

      <main>
        {tab === 'decoder' ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
            <div className="space-y-4 lg:sticky lg:top-6">
              <DecoderForm value={offer} onChange={setOffer} />
              <ShareButton b={breakdown} flags={flags} />
            </div>
            <Results b={breakdown} flags={flags} />
          </div>
        ) : (
          <Tracker />
        )}
      </main>

      <footer className="mt-10 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
        FY 2026-27 rules · estimates, not tax or legal advice · free &amp; open source ·{' '}
        <span className="font-semibold">your data never leaves this device</span>
      </footer>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${
        active ? 'bg-saffron text-white' : 'text-ink-soft'
      }`}
    >
      {children}
    </button>
  )
}
