import type { ReactNode } from 'react'
import type { Lang } from '../i18n'
import { LangProvider } from '../i18n'
import { ErrorBoundary } from './ErrorBoundary'
import { Shell } from './Shell'

export function IslandRoot({
  current,
  lang = 'en',
  children,
}: {
  current: string
  lang?: Lang
  children: ReactNode
}) {
  return (
    <LangProvider initialLang={lang}>
      <Shell current={current}>
        <ErrorBoundary slug={current}>{children}</ErrorBoundary>
      </Shell>
    </LangProvider>
  )
}
