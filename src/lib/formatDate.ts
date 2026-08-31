/**
 * A short human date for a card or a panel: "14 Aug".
 *
 * Locale is pinned to en-IN, which means the Hindi UI shows Latin month names.
 * That is a known gap, older than this file, and it belongs to the native-Hindi
 * pass on ROADMAP.md rather than to any one caller.
 */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
