import type { ReactNode } from 'react'

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
