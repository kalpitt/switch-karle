/**
 * A small icon set, so the interface stops drawing icons with emoji and Unicode
 * glyphs that look different on every phone (VIS-17). Each icon is an empty span
 * masked by a Lucide outline (ISC licence) in `src/index.css`, in the current text
 * colour. Hidden from screen readers: the text next to an icon carries the meaning.
 */
const SIZE: Record<number, string> = { 14: 'size-3.5', 16: 'size-4', 18: 'size-[18px]', 20: 'size-5', 24: 'size-6' }

type IconProps = { size?: 14 | 16 | 18 | 20 | 24; className?: string }

function Icon({ name, size = 16, className = '' }: IconProps & { name: string }) {
  return <span aria-hidden="true" className={`icon icon-${name} ${SIZE[size]} ${className}`} />
}

export const ChevronRight = (p: IconProps) => <Icon name="chevron-right" {...p} />
export const ChevronDown = (p: IconProps) => <Icon name="chevron-down" {...p} />
export const SearchIcon = (p: IconProps) => <Icon name="search" {...p} />
export const CheckIcon = (p: IconProps) => <Icon name="check" {...p} />
export const AlertIcon = (p: IconProps) => <Icon name="alert" {...p} />
export const InfoIcon = (p: IconProps) => <Icon name="info" {...p} />
export const ArrowDown = (p: IconProps) => <Icon name="arrow-down" {...p} />
export const ShieldCheck = (p: IconProps) => <Icon name="shield-check" {...p} />
export const SparkleIcon = (p: IconProps) => <Icon name="sparkle" {...p} />
export const MoreIcon = (p: IconProps) => <Icon name="more" {...p} />
export const CloseIcon = (p: IconProps) => <Icon name="close" {...p} />

/** The brand mark: the toggle switch from `public/icon.svg`, flicked on. */
export function LogoMark({ size = 24, className = '' }: IconProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}icon.svg`}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  )
}
