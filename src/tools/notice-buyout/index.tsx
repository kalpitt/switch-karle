import { useEffect, useMemo, useState } from 'react'
import { buyoutQuote } from '../../engine/noticeBuyout'
import { decodeOffer } from '../../engine/salary'
import { formatINR } from '../../engine/format'
import { IslandRoot } from '../../components/IslandRoot'
import {
  Card,
  Disclaimer,
  MoneyField,
  NumberField,
  Select,
  ShareRow,
  VerdictBanner,
} from '../../components/ui'
import { DECODER_STORAGE_KEY, loadOffer } from '../../data/defaults'
import { readJson, writeJson } from '../../lib/storage'
import { useT, type Lang } from '../../i18n'

const STORAGE_KEY = 'switchkarle.notice-buyout.v1' as const

interface Draft {
  basis: 'basic' | 'gross'
  mode: 'pay' | 'recover'
  unservedDays: number
  monthlyBasic: number
  monthlyGross: number
}

export default function NoticeBuyoutTool({ lang = 'en' }: { lang?: Lang }) {
  return (
    <IslandRoot lang={lang} current="notice-buyout">
      <Body />
    </IslandRoot>
  )
}

function Body() {
  const t = useT()
  const [draft, setDraft] = useState<Draft>({
    basis: 'basic',
    mode: 'pay',
    unservedDays: 30,
    monthlyBasic: 80_000,
    monthlyGross: 150_000,
  })
  const [hydrated, setHydrated] = useState(false)
  /** Set once at mount from whatever seeded the fields; never persisted. */
  const [seed, setSeed] = useState<{ fromDecoder: boolean; grossWasCtc12: boolean }>({
    fromDecoder: false,
    grossWasCtc12: false,
  })

  useEffect(() => {
    const saved = readJson<Draft | null>(STORAGE_KEY, null)
    if (saved) {
      setDraft(saved)
      setHydrated(true)
      return
    }
    let decoderHasData = false
    try {
      decoderHasData = localStorage.getItem(DECODER_STORAGE_KEY) != null
    } catch {
      /* storage unavailable */
    }
    const next: Draft = {
      basis: 'basic',
      mode: 'pay',
      unservedDays: 30,
      monthlyBasic: 80_000,
      monthlyGross: 150_000,
    }
    if (decoderHasData) {
      // Cash-gross seed per master plan §5.2: grossSalary/12, not CTC/12.
      const offer = loadOffer()
      const breakdown = decodeOffer(offer)
      next.unservedDays = offer.noticePeriodDays
      next.monthlyBasic = Math.round(breakdown.basic / 12)
      next.monthlyGross = Math.round(breakdown.grossSalary / 12)
      setSeed({
        fromDecoder: true,
        grossWasCtc12: next.monthlyGross === Math.round(offer.ctcAnnual / 12),
      })
    }
    setDraft(next)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    writeJson(STORAGE_KEY, draft)
  }, [draft, hydrated])

  const result = useMemo(() => buyoutQuote(draft), [draft])
  const resultOnOtherBasis = useMemo(
    () => buyoutQuote({ ...draft, basis: draft.basis === 'basic' ? 'gross' : 'basic' }),
    [draft],
  )
  const verdict =
    draft.mode === 'pay'
      ? t('notice-buyout.verdict.pay', { amount: formatINR(result.amount) })
      : t('notice-buyout.verdict.recover', { amount: formatINR(result.amount) })
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  const copyText = [
    verdict,
    `${t('notice-buyout.row.basic')}: ${formatINR(result.basis === 'basic' ? result.amount : resultOnOtherBasis.amount)}`,
    `${t('notice-buyout.row.gross')}: ${formatINR(result.basis === 'gross' ? result.amount : resultOnOtherBasis.amount)}`,
    t('ui.disclaimer'),
  ].join('\n')

  return (
    <div data-tool="notice-buyout" className="grid gap-4 lg:grid-cols-[minmax(320px,2fr)_3fr] lg:items-start">
      <Card className="space-y-3 lg:sticky lg:top-6">
        <h2 className="text-base font-bold">{t('notice-buyout.formTitle')}</h2>
        <Select
          label={t('notice-buyout.basis')}
          value={draft.basis}
          onChange={(v) => set({ basis: v })}
          options={[
            { value: 'basic', label: t('notice-buyout.basis.basic') },
            { value: 'gross', label: t('notice-buyout.basis.gross') },
          ]}
        />
        <Select
          label={t('notice-buyout.mode')}
          value={draft.mode}
          onChange={(v) => set({ mode: v })}
          options={[
            { value: 'pay', label: t('notice-buyout.mode.pay') },
            { value: 'recover', label: t('notice-buyout.mode.recover') },
          ]}
        />
        <NumberField
          label={t('notice-buyout.days')}
          suffix={t('unit.days')}
          value={draft.unservedDays}
          onChange={(v) => set({ unservedDays: v })}
        />
        <MoneyField
          label={t('notice-buyout.basic')}
          hint={t('ui.money.hint')}
          value={draft.monthlyBasic}
          onChange={(v) => set({ monthlyBasic: v })}
        />
        <MoneyField
          label={t('notice-buyout.gross')}
          hint={t('ui.money.hint')}
          value={draft.monthlyGross}
          onChange={(v) => set({ monthlyGross: v })}
        />
      </Card>
      <div className="space-y-4">
        <VerdictBanner>{verdict}</VerdictBanner>
        <Card>
          <h3 className="mb-2 text-sm font-bold">{t('notice-buyout.bothBases')}</h3>
          <p className="tnum flex justify-between gap-3 text-[13px]">
            <span>{t('notice-buyout.row.basic')}</span>
            <span>
              {formatINR(result.basis === 'basic' ? result.dailyRate : resultOnOtherBasis.dailyRate)}
              /day →{' '}
              <span className="font-bold">
                {formatINR(result.basis === 'basic' ? result.amount : resultOnOtherBasis.amount)}
              </span>
            </span>
          </p>
          <p className="tnum mt-1 flex justify-between gap-3 text-[13px]">
            <span>{t('notice-buyout.row.gross')}</span>
            <span>
              {formatINR(result.basis === 'gross' ? result.dailyRate : resultOnOtherBasis.dailyRate)}
              /day →{' '}
              <span className="font-bold">
                {formatINR(result.basis === 'gross' ? result.amount : resultOnOtherBasis.amount)}
              </span>
            </span>
          </p>
        </Card>
        {seed.fromDecoder &&
          (seed.grossWasCtc12 ? (
            <p className="text-[13px] text-amberflag">{t('notice-buyout.seed.ctc12')}</p>
          ) : (
            <p className="text-[13px] text-ink-soft">{t('notice-buyout.seed.decoder')}</p>
          ))}
        <p className="text-[13px] text-ink-soft">{t('notice-buyout.divisor')}</p>
        <p className="text-[13px] text-amberflag">{t('notice-buyout.gstNote')}</p>
        <ShareRow copyText={copyText} copyLabel={t('ui.copy')} copiedLabel={t('ui.copied')} printLabel={t('ui.print')} />
        <Disclaimer>{t('ui.disclaimer')}</Disclaimer>
      </div>
    </div>
  )
}
