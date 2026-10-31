import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useEffect, useId, useState } from 'react'
import { formatINR } from '../engine/format'
import { useLang } from '../i18n'
import { formatLongDate } from '../lib/formatDate'
import { parseINRInput } from '../lib/money'
import { noticeLooksLikeMonths, noticeMonthsToDays } from '../lib/noticeMonths'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-card p-5 shadow-[0_1px_3px_rgba(28,25,23,0.06)] ${className}`}>
      {children}
    </section>
  )
}

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="block">
      {/* block + leading-snug: an inline 13px span inside a 16px/24px line box left wrapped
          labels with 24px gaps between their lines. */}
      <span className="block text-[13px] font-semibold leading-snug text-ink">{children}</span>
      {hint && <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{hint}</span>}
    </span>
  )
}

/** The bordered box every text-like control sits in. `field` is a 3:1 border; the
 *  ring is the focus indicator, since the inputs inside draw no outline of their own. */
const BOX =
  'rounded-xl border border-field bg-paper px-3 focus-within:border-saffron focus-within:ring-2 focus-within:ring-saffron/40'

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
        <span id={`${id}-label`} className="block text-[13px] font-semibold leading-snug text-ink">
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
          className="tnum w-full bg-transparent py-3 text-[15px] font-medium outline-none"
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
        {props.suffix && <span className="shrink-0 text-xs font-medium text-ink-soft">{props.suffix}</span>}
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
    <p className="-mt-1.5 rounded-xl border border-amberflag/30 bg-amberflag-soft px-3 py-2 text-xs leading-snug text-amberflag">
      {props.t('ui.noticeMonthsNudge', { n: props.value, days })}{' '}
      <button
        type="button"
        onClick={() => props.onUse(days)}
        className="ml-1 mt-1 inline-flex min-h-[44px] cursor-pointer items-center rounded-full border border-amberflag/40 bg-card px-3 text-xs font-bold hover:underline"
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
      className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2.5 text-left"
    >
      <Label hint={props.hint}>{props.label}</Label>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${props.checked ? 'bg-saffron' : 'bg-field'}`}
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
            className="w-full bg-transparent py-3 text-[15px] font-medium outline-none"
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
          className="mt-1.5 w-full rounded-xl border border-field bg-paper px-3 py-3 text-[15px] font-medium outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/40"
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
          className="mt-1.5 w-full rounded-xl border border-field bg-paper px-3 py-3 text-[15px] font-medium outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/40"
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
    <details className="group rounded-xl border border-line bg-paper">
      <summary className="min-h-[44px] cursor-pointer select-none list-none px-3 py-3 text-[13px] font-semibold text-ink-soft group-open:border-b group-open:border-line">
        <span className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>
        {summary}
      </summary>
      <div className="space-y-3 p-3">{children}</div>
    </details>
  )
}

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-3">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className="tnum mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}

export function VerdictBanner({
  children,
  tone = 'leaf',
}: {
  children: ReactNode
  tone?: 'leaf' | 'alarm' | 'amber'
}) {
  const cls = {
    leaf: 'border-leaf/30 bg-leaf-soft text-leaf',
    alarm: 'border-alarm/30 bg-alarm-soft text-alarm',
    amber: 'border-amberflag/30 bg-amberflag-soft text-amberflag',
  }[tone]
  // A live region: the verdict recomputes as the user types, and without this a
  // screen reader user changes a number and hears nothing come back.
  return (
    <p role="status" className={`rounded-xl border px-3 py-2.5 text-[15px] font-bold leading-snug ${cls}`}>
      {children}
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
      <table className="w-full text-[13px]">
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
      className="min-h-[44px] rounded-xl border border-line px-4 py-3 text-[13px] font-bold text-ink-soft transition-transform active:scale-[0.98]"
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
      className="no-print min-h-[44px] rounded-xl border border-line px-4 py-3 text-[13px] font-bold text-ink-soft transition-transform active:scale-[0.98]"
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
  value: number
  onChange: (v: number) => void
}) {
  const [text, setText] = useState(() => (props.value ? String(props.value) : ''))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (focused) return
    setText(props.value ? String(props.value) : '')
  }, [props.value, focused])

  const commit = (raw: string) => {
    const parsed = parseINRInput(raw)
    if (Number.isNaN(parsed)) return
    props.onChange(parsed)
  }

  // The amount as it will be read, in lakh/crore grouping, under the field. Phones
  // open a digit pad here, so a missing zero is the common slip: this shows it.
  const parsed = parseINRInput(text)
  const echo = text.trim() !== '' && Number.isFinite(parsed) && parsed > 0 ? formatINR(parsed) : ''

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
          className="tnum w-full bg-transparent py-3 text-[15px] font-medium outline-none"
          value={text}
          onFocus={() => setFocused(true)}
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
  return <p className="text-xs leading-relaxed text-ink-faint">{children}</p>
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
 * Stands in for the verdict while the numbers on screen are still the built-in
 * fixture. Callers pass the chip and note text so a tool can use its own copy.
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
    <p
      className={`rounded-xl border border-amberflag/30 bg-amberflag-soft px-3 py-2.5 text-[13px] font-semibold leading-snug text-amberflag ${className}`}
    >
      {onChipClick ? (
        <button
          type="button"
          onClick={onChipClick}
          className="mr-2 inline-block cursor-pointer rounded-full border border-amberflag/40 bg-card px-2 py-0.5 text-xs font-bold hover:underline"
        >
          {chip}
        </button>
      ) : (
        <span className="mr-2 inline-block rounded-full border border-amberflag/40 bg-card px-2 py-0.5 text-xs font-bold">
          {chip}
        </span>
      )}
      {note}
    </p>
  )
}

/**
 * Says out loud that a tool is standing on the Decoder's saved offer for the
 * fields it never asks for — the basic/HRA split, the PF settings.
 */
export function InheritNote({ text, linkLabel, href }: { text: string; linkLabel: string; href: string }) {
  return (
    <p className="rounded-xl border border-line bg-paper px-3 py-2.5 text-xs leading-relaxed text-ink-soft">
      {text}{' '}
      <a href={href} className="font-semibold text-saffron underline">
        {linkLabel}
      </a>
    </p>
  )
}
