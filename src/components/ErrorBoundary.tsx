import { Component, type ReactNode } from 'react'
import { useT } from '../i18n'
import { TOOLS } from '../data/tools'

/**
 * Keeps one broken tool from blanking the whole page. The Shell (nav, footer,
 * Erase) renders outside this boundary, so a visitor always has a way out.
 */
export class ErrorBoundary extends Component<{ slug: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <Fallback slug={this.props.slug} /> : this.props.children
  }
}

function Fallback({ slug }: { slug: string }) {
  const t = useT()
  const key = TOOLS.find((tool) => tool.slug === slug)?.storageKey
  const reset = () => {
    if (!key || !window.confirm(t('error.resetConfirm'))) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Storage blocked: a reload is all we can offer.
    }
    window.location.reload()
  }
  const subject = encodeURIComponent(`Switch Karle: ${slug} stopped working`)

  return (
    <section role="alert" className="rounded-2xl border border-alarm/30 bg-alarm-soft p-5">
      <h2 className="text-base font-bold text-alarm">{t('error.title')}</h2>
      <p className="mt-1 text-[14px] text-ink-soft">{t('error.body')}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-xl bg-ink px-4 text-[14px] font-bold text-white"
        >
          {t('error.reload')}
        </button>
        {key && (
          <button
            type="button"
            onClick={reset}
            className="min-h-11 rounded-xl border border-line bg-card px-4 text-[14px] font-bold text-ink"
          >
            {t('error.reset')}
          </button>
        )}
        <a
          href={`mailto:tiwari.kalpit@gmail.com?subject=${subject}`}
          className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-ink-soft underline"
        >
          {t('error.report')}
        </a>
      </div>
    </section>
  )
}
