import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { parseINRInput } from '../lib/money'

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
      <span className="text-[13px] font-semibold text-ink">{children}</span>
      {hint && <span className="mt-0.5 block text-xs leading-snug text-ink-faint">{hint}</span>}
    </span>
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
}) {
  return (
    <label className="block">
      <Label hint={props.hint}>{props.label}</Label>
      <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-paper px-3 focus-within:border-saffron">
        <input
          type="number"
          inputMode="decimal"
          className="tnum w-full bg-transparent py-2.5 text-[15px] font-medium outline-none"
          value={Number.isFinite(props.value) ? props.value : 0}
          min={0}
          max={props.max}
          step={props.step ?? 1}
          onChange={(e) => props.onChange(Math.max(0, Number(e.target.value)))}
        />
        {props.suffix && <span className="shrink-0 text-xs font-medium text-ink-faint">{props.suffix}</span>}
      </span>
    </label>
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
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2.5 text-left"
    >
      <Label hint={props.hint}>{props.label}</Label>
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${props.checked ? 'bg-saffron' : 'bg-line'}`}
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
}) {
  return (
    <label className="block">
      <Label hint={props.hint}>{props.label}</Label>
      <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-paper px-3 focus-within:border-saffron">
        <input
          type={props.type ?? 'text'}
          className="w-full bg-transparent py-2.5 text-[15px] font-medium outline-none"
          value={props.value}
          placeholder={props.placeholder}
          required={props.required}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </span>
    </label>
  )
}

export function TextArea(props: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block">
      <Label hint={props.hint}>{props.label}</Label>
      <textarea
        className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[15px] font-medium outline-none focus:border-saffron"
        rows={props.rows ?? 3}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
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
    <label className="block">
      <Label hint={props.hint}>{props.label}</Label>
      <select
        className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[15px] font-medium outline-none focus:border-saffron"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as T)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Details({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-line bg-paper">
      <summary className="cursor-pointer select-none list-none px-3 py-2.5 text-[13px] font-semibold text-ink-soft group-open:border-b group-open:border-line">
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
      {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
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
  return <p className={`rounded-xl border px-3 py-2.5 text-[15px] font-bold leading-snug ${cls}`}>{children}</p>
}

export function DeltaTable({
  aLabel,
  bLabel,
  rows,
}: {
  aLabel: string
  bLabel: string
  rows: { label: string; a: string; b: string }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-ink-soft">
            <th className="pb-2 font-semibold" />
            <th className="pb-2 font-semibold">{aLabel}</th>
            <th className="pb-2 font-semibold">{bLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <td className="py-2 text-ink-soft">{r.label}</td>
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
      className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink-soft transition-transform active:scale-[0.98]"
    >
      {copied ? copiedLabel : label}
    </button>
  )
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink-soft transition-transform active:scale-[0.98]"
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
}) {
  return (
    <TextField
      label={props.label}
      hint={props.hint}
      value={props.value}
      onChange={props.onChange}
      type="date"
      required={props.required}
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

  return (
    <label className="block">
      <Label hint={props.hint}>{props.label}</Label>
      <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-line bg-paper px-3 focus-within:border-saffron">
        <span className="shrink-0 text-xs font-medium text-ink-faint">₹</span>
        <input
          type="text"
          inputMode="decimal"
          className="tnum w-full bg-transparent py-2.5 text-[15px] font-medium outline-none"
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
    </label>
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
}: {
  chip: string
  note: string
  className?: string
}) {
  return (
    <p
      className={`rounded-xl border border-amberflag/30 bg-amberflag-soft px-3 py-2.5 text-[13px] font-semibold leading-snug text-amberflag ${className}`}
    >
      <span className="mr-2 inline-block rounded-full border border-amberflag/40 bg-card px-2 py-0.5 text-xs font-bold">
        {chip}
      </span>
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
    <p className="rounded-xl border border-line bg-paper px-3 py-2.5 text-xs leading-relaxed text-ink-faint">
      {text}{' '}
      <a href={href} className="font-semibold text-saffron underline">
        {linkLabel}
      </a>
    </p>
  )
}
