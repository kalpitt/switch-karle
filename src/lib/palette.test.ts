import { describe, expect, it } from 'vitest'
import { filterPalette, paletteItems } from './palette'
import type { ToolDef } from '../data/tools'

const tools = [
  { slug: 'epf-transfer', titleKey: 'epf-transfer.title', descKey: 'epf-transfer.desc' },
  { slug: 'decoder', titleKey: 'tab.decoder', descKey: 'home.decoder.desc' },
] as ToolDef[]

const labels: Record<string, string> = {
  'nav.home': 'Home',
  'home.kicker': 'A suite of tools',
  'epf-transfer.title': 'EPF transfer',
  'epf-transfer.desc': 'Form 13 and the premature-withdrawal trap',
  'tab.decoder': 'Decoder',
  'home.decoder.desc': 'CTC to in-hand',
}

describe('palette', () => {
  it('puts home first, then every registry tool', () => {
    const items = paletteItems(tools, '/switch-karle/', (s) => `/switch-karle/${s}/`)
    expect(items.map((i) => i.slug)).toEqual(['home', 'epf-transfer', 'decoder'])
    expect(items[0]!.href).toBe('/switch-karle/')
  })

  it('filters on slug, title, or description', () => {
    const items = paletteItems(tools, '/', (s) => `/${s}/`)
    const label = (k: string) => labels[k] ?? k
    expect(filterPalette(items, 'form 13', label).map((i) => i.slug)).toEqual(['epf-transfer'])
    expect(filterPalette(items, 'DECODER', label).map((i) => i.slug)).toEqual(['decoder'])
    expect(filterPalette(items, '  ', label)).toHaveLength(3)
  })
})
