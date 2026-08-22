import type { ReactNode } from 'react'
import { LangProvider } from '../i18n'
import { Shell } from './Shell'

export function IslandRoot({ current, children }: { current: string; children: ReactNode }) {
  return (
    <LangProvider>
      <Shell current={current}>{children}</Shell>
    </LangProvider>
  )
}
