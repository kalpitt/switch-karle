/** The one button system (VIS-10): one primary per screen, the rest quieter. */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export function buttonClass(variant: ButtonVariant = 'primary', size: 'md' | 'sm' = 'md') {
  const base =
    'inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold active:scale-[0.98] transition-[background-color,border-color,color,transform] duration-150 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
  const sz = size === 'md' ? 'px-5 text-[15px]' : 'px-3.5 text-[14px]'
  const v = {
    primary: 'bg-saffron-strong text-white hover:bg-saffron-deep',
    secondary: 'border border-line-strong bg-card text-ink hover:border-field hover:bg-paper',
    ghost: 'text-ink-soft hover:bg-paper hover:text-ink',
    danger: 'text-alarm hover:bg-alarm-soft',
  }[variant]
  return `${base} ${sz} ${v}`
}
