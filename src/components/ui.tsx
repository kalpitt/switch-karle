import type { ButtonHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { formatINR } from '../engine/format'
import { useLang, useT } from '../i18n'
import { sourceById, type SourceEntry } from '../data/sources'
import { formatLongDate } from '../lib/formatDate'
import { withLang } from '../lib/langPath'
import { parseINRInput } from '../lib/money'
import { noticeLooksLikeMonths, noticeMonthsToDays } from '../lib/noticeMonths'
import { AlertIcon, ArrowDown, CheckIcon, ChevronRight, InfoIcon } from './icons'
import { buttonClass, type ButtonVariant } from './buttonClass'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-card p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  )
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="block">
      {/* block + leading-snug: an inline 13px span inside a 16px/24px line box left wrapped
          labels with 24px gaps between their lines. */}
      <span className="block text-[14px] font-semibold leading-snug text-ink">{children}</span>
      {hint && <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{hint}</span>}
    </span>
  )
}

/** The bordered box every text-like control sits in. `field` is a 3:1 border; the
 *  ring is the focus indicator, since the inputs inside draw no outline of their own. */
const BOX =
  'rounded-xl border border-field bg-card px-3 transition-[border-color,box-shadow] duration-150 hover:border-ink-soft focus-within:border-saffron focus-within:ring-[3px] focus-within:ring-saffron/25'

type FieldAria = { 'aria-labelledby'?: string; 'aria-describedby'?: string }

/**
 * Label, hint and control, wired for a screen reader: the control is named by the
 * label alone and described by the hint (and any echo line), instead of reading the
 * whole hint as its name on every focus. The outer <label> keeps the large click area.
 */
function Field({
  label,
  hint,
  required,
  describedBy,
  after,
  children,
}: {
  label: ReactNode
  hint?: string
  required?: boolean
  /** Another element id that describes the control, e.g. an echo line. */
  describedBy?: (id: string) => string | undefined
  after?: (id: string) => ReactNode
  children: (aria: FieldAria) => ReactNode
}) {
  const id = useId()
  const described = [hint ? `${id}-hint` : undefined, describedBy?.(id)].filter(Boolean).join(' ')
  return (
    <label className="block">
      <span className="block">
        <span id={`${id}-label`} className="block text-[14px] font-semibold leading-snug text-ink">
          {label}
          {required && (
            <span aria-hidden className="text-alarm">
              {' '}
              *
            </span>
          )}
        </span>
        {hint && (
          <span id={`${id}-hint`} className="mt-0.5 block text-[13px] leading-snug text-ink-soft">
            {hint}
          </span>
        )}
      </span>
      {children({ 'aria-labelledby': `${id}-label`, 'aria-describedby': described || undefined })}
      {after?.(id)}
    </label>
  )
}

export function NumberField(props: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  step?: number
  max?: number
  min?: number
  allowBlank?: boolean
  /** Whole numbers only (days, months, counts): phones show the plain digit pad. */
  integer?: boolean
}) {
  const min = props.min ?? 0
  const isFinite = Number.isFinite(props.value)
  const displayValue = isFinite ? props.value : props.allowBlank ? '' : 0
  return (
    <Field label={props.label} hint={props.hint}>
      {(aria) => (
      <span className={`mt-1.5 flex items-center gap-2 ${BOX}`}>
        <input
          {...aria}
          type="number"
          inputMode={props.integer ? 'numeric' : 'decimal'}
          className="tnum w-full bg-transparent py-2.5 text-[15px] font-medium outline-none"
          value={displayValue}
          min={min}
          max={props.max}
          step={props.step ?? 1}
          onChange={(e) => {
            if (props.allowBlank && e.target.value === '') {
              props.onChange(NaN)
              return
            }
            props.onChange(Math.max(min, Number(e.target.value)))
          }}
        />
        {props.suffix && <span className="shrink-0 text-[13px] font-medium text-ink-soft">{props.suffix}</span>}
      </span>
      )}
    </Field>
  )
}

/**
 * Every notice-period-days field wires this the same way: Indian appointment
 * letters state notice in months, and a user who types the letter's own
 * number verbatim into a days field gets a last working day two days after
 * resigning instead of ninety. One shared component so every field behaves
 * identically — `t` is the caller's own `useT()` result, passed through
 * rather than imported here, matching the rest of this file staying
 * i18n-free. Renders nothing once the value stops looking like months.
 */
export function NoticeMonthsNudge(props: {
  value: number
  t: (key: string, vars?: Record<string, string | number>) => string
  onUse: (days: number) => void
}) {
  if (!noticeLooksLikeMonths(props.value)) return null
  const days = noticeMonthsToDays(props.value)
  return (
    <p className="-mt-1.5 rounded-xl bg-amberflag-soft px-3 py-2 text-[13px] leading-snug text-amberflag">
      {props.t('ui.noticeMonthsNudge', { n: props.value, days })}{' '}
      <button
        type="button"
        onClick={() => props.onUse(days)}
        className={`ml-1 mt-1 ${buttonClass('secondary', 'sm')}`}
      >
        {props.t('ui.noticeMonthsUse', { days })}
      </button>
    </p>
  )
}

export function Toggle(props: {
  label: string
  hint?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      onClick={() => props.onChange(!props.checked)}
      className="flex min-h-[48px] w-full items-center justify-between gap-4 border-t border-line pt-3 text-left"
    >
      <Label hint={props.hint}>{props.label}</Label>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${props.checked ? 'bg-ink' : 'bg-field'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${props.checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
  )
}

export function TextField(props: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'date'
  required?: boolean
  max?: string
}) {
  const isDate = props.type === 'date'
  return (
    <Field
      label={props.label}
      hint={props.hint}
      required={props.required}
      after={isDate ? () => <DateEcho iso={props.value} /> : undefined}
    >
      {(aria) => (
        <span className={`mt-1.5 flex items-center gap-2 ${BOX}`}>
          <input
            {...aria}
            type={props.type ?? 'text'}
            className="w-full bg-transparent py-2.5 text-[15px] font-medium outline-none"
            value={props.value}
            placeholder={props.placeholder}
            required={props.required}
            max={props.max}
            onChange={(e) => props.onChange(e.target.value)}
          />
        </span>
      )}
    </Field>
  )
}

/**
 * A native date input prints in the browser's locale, so on an en-US phone
 * 01/12/2022 could be 12 January or 1 December. The date in words, in the page's
 * language, removes the doubt. Hidden from screen readers, which already read the
 * date from the input itself.
 */
function DateEcho({ iso }: { iso: string }) {
  const { lang } = useLang()
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(iso)) return null
  return (
    <span aria-hidden className="mt-1 block text-[13px] font-medium text-ink-soft">
      {formatLongDate(iso, lang)}
    </span>
  )
}

export function TextArea(props: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  rows?: number
  onBlur?: () => void
  onKeyDown?: (e: ReactKeyboardEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(aria) => (
        <textarea
          {...aria}
          className="mt-1.5 w-full rounded-xl border border-field bg-card px-3 py-2.5 text-[15px] font-medium outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-soft focus:border-saffron focus:ring-[3px] focus:ring-saffron/25"
          rows={props.rows ?? 3}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onBlur={props.onBlur}
          onKeyDown={props.onKeyDown}
        />
      )}
    </Field>
  )
}

export function Select<T extends string>(props: {
  label: string
  hint?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(aria) => (
        <select
          {...aria}
          className="mt-1.5 w-full rounded-xl border border-field bg-card px-3 py-2.5 text-[15px] font-medium outline-none transition-[border-color,box-shadow] duration-150 hover:border-ink-soft focus:border-saffron focus:ring-[3px] focus:ring-saffron/25"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value as T)}
        >
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function Details({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex min-h-[48px] cursor-pointer select-none list-none items-center gap-2 py-3 text-[14px] font-semibold text-ink hover:text-ink-soft [&::-webkit-details-marker]:hidden">
        <ChevronRight className="text-ink-soft transition-transform group-open:rotate-90" />
        {summary}
      </summary>
      <div className="space-y-3 pb-4 pl-6">{children}</div>
    </details>
  )
}

export function VerdictBanner({
  children,
  tone = 'leaf',
}: {
  children: ReactNode
  tone?: 'leaf' | 'alarm' | 'amber'
}) {
  // A tint, an icon and dark text: the tone shows without a border box, and the
  // sentence stays readable ink rather than coloured body text.
  const cls = { leaf: 'bg-leaf-soft', alarm: 'bg-alarm-soft', amber: 'bg-amberflag-soft' }[tone]
  // A live region: the verdict recomputes as the user types, and without this a
  // screen reader user changes a number and hears nothing come back.
  return (
    <p role="status" className={`flex gap-2.5 rounded-xl px-3.5 py-3 text-[15px] font-semibold leading-snug text-ink ${cls}`}>
      <ToneIcon tone={tone} />
      <span>{children}</span>
    </p>
  )
}

export function DeltaTable({
  aLabel,
  bLabel,
  rows,
  rowHeader = '',
}: {
  aLabel: string
  bLabel: string
  rows: { label: string; a: string; b: string }[]
  /** Read to screen readers as the name of the row-label column. */
  rowHeader?: string
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr className="text-left text-ink-soft">
            <th scope="col" className="pb-2 font-semibold">
              {rowHeader && <span className="sr-only">{rowHeader}</span>}
            </th>
            <th scope="col" className="pb-2 font-semibold">
              {aLabel}
            </th>
            <th scope="col" className="pb-2 font-semibold">
              {bLabel}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <th scope="row" className="py-2 text-left font-normal text-ink-soft">
                {r.label}
              </th>
              <td className="tnum py-2 font-medium">{r.a}</td>
              <td className="tnum py-2 font-medium">{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard permission denied */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={buttonClass('secondary', 'sm')}
    >
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  )
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`no-print ${buttonClass('secondary', 'sm')}`}
    >
      {label}
    </button>
  )
}

export function DateField(props: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  max?: string
}) {
  return (
    <TextField
      label={props.label}
      hint={props.hint}
      value={props.value}
      onChange={props.onChange}
      type="date"
      required={props.required}
      max={props.max}
    />
  )
}

export function MoneyField(props: {
  label: string
  hint?: string
  /** Shown only while the field is empty: the accepted formats, e.g. "12L". */
  placeholder?: string
  value: number
  onChange: (v: number) => void
}) {
  // At rest the figure reads the way results do, in lakh grouping ("24,00,000");
  // while the field has focus it is the plain digits, so editing never fights commas.
  const grouped = (v: number) => (v ? formatINR(v).replace('₹', '') : '')
  const [text, setText] = useState(() => grouped(props.value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (focused) return
    setText(grouped(props.value))
  }, [props.value, focused])

  const commit = (raw: string) => {
    const parsed = parseINRInput(raw)
    if (Number.isNaN(parsed)) return
    props.onChange(parsed)
  }

  // The amount as it will be read, in lakh/crore grouping, under the field. Phones
  // open a digit pad here, so a missing zero is the common slip: this shows it.
  const parsed = parseINRInput(text)
  const echo = focused && text.trim() !== '' && Number.isFinite(parsed) && parsed > 0 ? formatINR(parsed) : ''

  return (
    <Field
      label={props.label}
      hint={props.hint}
      describedBy={(id) => (echo ? `${id}-echo` : undefined)}
      after={(id) =>
        echo ? (
          <span id={`${id}-echo`} className="tnum mt-1 block text-[13px] font-semibold text-ink-soft">
            {echo}
          </span>
        ) : null
      }
    >
      {(aria) => (
      <span className={`mt-1.5 flex items-center gap-2 ${BOX}`}>
        <span aria-hidden className="shrink-0 text-[15px] font-medium text-ink-soft">
          ₹
        </span>
        <input
          {...aria}
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          className="tnum w-full bg-transparent py-2.5 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-ink-faint"
          placeholder={props.placeholder}
          value={text}
          onFocus={() => {
            setFocused(true)
            if (props.value) setText(String(props.value))
          }}
          onBlur={() => {
            setFocused(false)
            commit(text)
          }}
          onChange={(e) => {
            setText(e.target.value)
            const parsed = parseINRInput(e.target.value)
            if (!Number.isNaN(parsed)) props.onChange(parsed)
          }}
        />
      </span>
      )}
    </Field>
  )
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return <p className="max-w-[65ch] text-[13px] leading-relaxed text-ink-faint">{children}</p>
}

export function ShareRow(props: {
  copyText: string
  copyLabel: string
  copiedLabel: string
  printLabel: string
  extra?: ReactNode
}) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <CopyButton text={props.copyText} label={props.copyLabel} copiedLabel={props.copiedLabel} />
      <PrintButton label={props.printLabel} />
      {props.extra}
    </div>
  )
}

/**
 * Says the numbers on screen are the built-in worked example. A quiet grey tag and a
 * plain sentence, not a warning box: amber is kept for real cautions. Callers pass
 * the chip and note text so a tool can use its own copy.
 */
export function ExampleNote({
  chip,
  note,
  className = '',
  onChipClick,
}: {
  chip: string
  note: string
  className?: string
  onChipClick?: () => void
}) {
  return (
    <p className={`text-[13px] leading-snug text-ink-soft ${className}`}>
      {onChipClick ? (
        <button
          type="button"
          onClick={onChipClick}
          className={`${SAMPLE_TAG} mr-2 cursor-pointer underline-offset-2 hover:underline`}
        >
          {chip}
        </button>
      ) : (
        <span className={`${SAMPLE_TAG} mr-2`}>{chip}</span>
      )}
      {note}
    </p>
  )
}

const SAMPLE_TAG =
  'inline-flex items-center rounded-md bg-sample-soft px-2 py-0.5 align-[1px] text-[12px] font-semibold text-sample'

/**
 * Moves the visitor from the worked example to their own numbers: scrolls the tool's
 * form into view and puts the cursor in its first field. On a phone the form sits
 * under the answer, often two screens down (UX-12, MOB-02).
 */
function UseMine() {
  const t = useT()
  const ref = useRef<HTMLButtonElement>(null)
  const jump = () => {
    const tool = ref.current?.closest('[data-tool]')
    const field = tool?.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea')
    if (!field) return
    field.scrollIntoView({ block: 'center', behavior: 'smooth' })
    field.focus({ preventScroll: true })
  }
  return (
    <button ref={ref} type="button" onClick={jump} className={`no-print ${buttonClass('ghost', 'sm')} -ml-3.5 shrink-0 sm:-mr-2 sm:ml-0`}>
      {t('ui.useMine')}
      <ArrowDown size={14} />
    </button>
  )
}

function ToneIcon({ tone }: { tone: Tone }) {
  const cls = { leaf: 'text-leaf', alarm: 'text-alarm', amber: 'text-amberflag', neutral: 'text-ink-soft' }[tone]
  const Icon = tone === 'leaf' ? CheckIcon : tone === 'neutral' ? InfoIcon : AlertIcon
  return (
    <span className={`mt-[3px] ${cls}`}>
      <Icon size={16} />
    </span>
  )
}

type Tone = 'leaf' | 'alarm' | 'amber' | 'neutral'

/**
 * The answer, first and biggest (VIS-02): a label, one figure, then the sentence that
 * says what it means. On a first visit it shows the worked example's answer under a
 * grey "Example" tag (VIS-03, TRUST-06, approved 2026-10-31), so the page opens on a
 * result instead of a disclaimer, and nobody mistakes it for theirs.
 */
export function ResultHero({
  label,
  value,
  unit,
  sub,
  delta,
  verdict,
  tone = 'neutral',
  sample,
  sampleChip,
  sampleNote,
  children,
}: {
  label: string
  /** The figure itself, e.g. "₹2,88,462" or "23%". Omitted when the answer is a sentence. */
  value?: string
  unit?: string
  /** One short line under the figure, e.g. "not the ₹2,00,000/month the CTC suggests". */
  sub?: ReactNode
  delta?: { text: string; tone: 'loss' | 'gain' | 'neutral' }
  verdict?: ReactNode
  tone?: Tone
  /** True while the inputs are still the built-in worked example. */
  sample?: boolean
  sampleChip?: string
  sampleNote?: string
  children?: ReactNode
}) {
  const t = useT()
  const deltaCls = delta
    ? { loss: 'bg-alarm-soft text-alarm', gain: 'bg-leaf-soft text-leaf', neutral: 'bg-paper text-ink-soft' }[delta.tone]
    : ''
  return (
    <section data-result-hero className="rise rounded-2xl border border-line bg-card p-5 sm:p-6">
      {sample && (
        <div className="mb-4 flex flex-col items-start gap-1 border-b border-line pb-3 sm:flex-row sm:justify-between sm:gap-4">
          <ExampleNote chip={sampleChip ?? t('ui.exampleChip')} note={sampleNote ?? t('ui.exampleNote')} />
          <UseMine />
        </div>
      )}
      {/* Announced on change: the answer recomputes as the form is edited. */}
      <div role="status" aria-live="polite" aria-atomic="true">
        <p className="text-[14px] font-medium leading-snug text-ink-soft">{label}</p>
        {value && (
          <p
            key={value}
            className={`tnum tick mt-2 text-[40px] font-bold leading-none tracking-[-0.03em] sm:text-[48px] ${sample ? 'text-ink-soft' : 'text-ink'}`}
          >
            {value}
            {unit && <span className="ml-0.5 text-[18px] font-medium tracking-normal text-ink-faint">{unit}</span>}
          </p>
        )}
        {sub && <p className="mt-2 text-[14px] leading-snug text-ink-soft">{sub}</p>}
        {delta && (
          <p className="mt-3">
            <span className={`tnum inline-flex rounded-md px-2 py-0.5 text-[13px] font-semibold ${deltaCls}`}>
              {delta.text}
            </span>
          </p>
        )}
        {verdict && (
          <p className={`flex gap-2.5 text-[16px] leading-relaxed text-ink ${value ? 'mt-4 border-t border-line pt-4' : 'mt-2 font-semibold'}`}>
            <ToneIcon tone={tone} />
            <span>{verdict}</span>
          </p>
        )}
      </div>
      {children && <div className="mt-4 space-y-3">{children}</div>}
    </section>
  )
}

/**
 * Figures as rows: label left, figure right, hairlines between (VIS-21 figure-sm).
 * Replaces "Label: ₹X" sentences, so the eye can run down one column of numbers.
 */
export function Ledger({
  rows,
  className = '',
}: {
  rows: { label: ReactNode; value: ReactNode; strong?: boolean; tone?: 'loss' | 'gain' | 'caution' }[]
  className?: string
}) {
  const toneCls = { loss: 'text-alarm', gain: 'text-leaf', caution: 'text-amberflag' }
  return (
    <dl className={`divide-y divide-line text-[14px] ${className}`}>
      {rows.map((r, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4 py-2">
          <dt className={r.strong ? 'font-semibold text-ink' : 'text-ink-soft'}>{r.label}</dt>
          <dd className={`tnum shrink-0 text-right ${r.strong ? 'font-semibold' : 'font-medium'} ${r.tone ? toneCls[r.tone] : 'text-ink'}`}>
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Two or more amounts drawn on one scale (VIS-24): the one that matters in ink, the
 * rest in a quiet grey. Bar widths are SVG attributes, not inline styles, so the CSP
 * keeps them. Hidden from screen readers: the label and figure above each bar say it.
 */
export function CompareBars({
  rows,
  className = '',
}: {
  rows: { label: ReactNode; display: ReactNode; value: number; strong?: boolean }[]
  className?: string
}) {
  const max = Math.max(1, ...rows.map((r) => Math.max(0, r.value)))
  return (
    <div className={`space-y-3 ${className}`}>
      {rows.map((r, i) => (
        <div key={i}>
          <p className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className={r.strong ? 'font-semibold text-ink' : 'text-ink-soft'}>{r.label}</span>
            <span className={`tnum ${r.strong ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{r.display}</span>
          </p>
          <svg className="mt-1.5 block h-2.5 w-full overflow-hidden rounded-full bg-paper" aria-hidden="true">
            <rect
              className={r.strong ? 'fill-ink' : 'fill-line-strong'}
              height="100%"
              rx="5"
              width={`${Math.max(0, Math.min(100, (Math.max(0, r.value) / max) * 100))}%`}
            />
          </svg>
        </div>
      ))}
    </div>
  )
}

/**
 * How far along something is (VIS-24): a strip filled to `pct`, with the start and
 * the end named under it and a saffron marker at the end date.
 */
export function ProgressStrip({
  pct,
  start,
  end,
  caption,
}: {
  pct: number
  start: ReactNode
  end: ReactNode
  caption?: ReactNode
}) {
  const w = Math.max(0, Math.min(100, pct))
  return (
    <div>
      {caption && <p className="mb-1.5 text-[13px] font-semibold text-ink">{caption}</p>}
      <svg className="block h-2.5 w-full overflow-visible" aria-hidden="true">
        <rect className="fill-paper" width="100%" height="100%" rx="5" />
        <rect className="fill-ink" width={`${w}%`} height="100%" rx="5" />
        <circle className="fill-saffron-bright" cx="100%" cy="5" r="5" transform="translate(-5 0)" />
      </svg>
      <p className="tnum mt-1.5 flex justify-between gap-3 text-[12px] text-ink-faint">
        <span>{start}</span>
        <span className="text-right">{end}</span>
      </p>
    </div>
  )
}

/** A <button> in the one button system; see `buttonClass`. */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'md' | 'sm' }) {
  return <button type={type} className={`${buttonClass(variant, size)} ${className}`} {...rest} />
}

/**
 * Says out loud that a tool is standing on the Decoder's saved offer for the
 * fields it never asks for — the basic/HRA split, the PF settings.
 */
export function InheritNote({ text, linkLabel, href }: { text: string; linkLabel: string; href: string }) {
  return (
    <p className="text-[14px] leading-relaxed text-ink-soft">
      {text}{' '}
      <a href={href} className="font-semibold text-saffron-strong underline underline-offset-2">
        {linkLabel}
      </a>
    </p>
  )
}

/**
 * The receipt under a verdict (PRODUCT.md rule 3): which document each rule
 * comes from and the date it was checked, a convention named as one, and an
 * open item said plainly. Built only from `src/data/sources.ts`, so the line
 * under the answer and the "How we check numbers" page can never disagree.
 */
export function Receipt({ ids, className = '' }: { ids: readonly string[]; className?: string }) {
  const t = useT()
  const { lang } = useLang()
  const entries = [...new Set(ids)].map(sourceById).filter((e): e is SourceEntry => e !== undefined)

  // Verified rules: one clause per checked date, documents within it in first-seen order.
  const byDate = new Map<string, Map<string, string[]>>()
  for (const e of entries) {
    if (e.status !== 'verified') continue
    const docs = byDate.get(e.checked) ?? new Map<string, string[]>()
    const sections = docs.get(e.doc) ?? []
    if (e.section) sections.push(e.section)
    docs.set(e.doc, sections)
    byDate.set(e.checked, docs)
  }
  const parts: string[] = [...byDate].map(([date, docs]) =>
    t('receipt.checked', {
      items: [...docs].map(([doc, sections]) => (sections.length ? `${doc} ${sections.join(', ')}` : doc)).join('; '),
      date: formatLongDate(date, lang),
    }),
  )
  for (const e of entries) {
    if (e.status === 'convention') parts.push(t('receipt.convention', { text: t(`source.${e.id}`) }))
  }
  // Open questions sit behind one tap: the answer and its sources stay short to scan.
  const open = (['awaiting-lawyer', 'awaiting-ca'] as const).flatMap((status) =>
    entries.filter((e) => e.status === status).map((e) => t(`receipt.${status}`, { text: t(`source.${e.id}`) })),
  )

  return (
    <div data-receipt className={`text-[12px] leading-relaxed text-ink-soft ${className}`}>
      <p>
        <span className="font-semibold">{t('receipt.label')}</span>{' '}
        {parts.map((part, i) => (
          <span key={i}>
            {i > 0 && ' · '}
            {part}
          </span>
        ))}
        {parts.length > 0 && ' · '}
        <a href={withLang(lang, 'sources')} className="font-semibold text-ink underline">
          {t('receipt.link')}
        </a>
      </p>
      {open.length > 0 && (
        <details className="mt-1">
          <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <ChevronRight size={14} className="transition-transform [details[open]_&]:rotate-90" />
            {t(open.length === 1 ? 'receipt.openOne' : 'receipt.open', { n: open.length })}
          </summary>
          <ul className="list-disc space-y-1 pl-4">
            {open.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
