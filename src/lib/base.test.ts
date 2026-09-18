import { describe, expect, it } from 'vitest'
import { hostLabel, shareFooterLabel } from './base'

describe('hostLabel', () => {
  it('composes host and base without scheme or trailing slash', () => {
    expect(hostLabel('https://kalpit.me', '/switch-karle/')).toBe('kalpit.me/switch-karle')
    expect(hostLabel('https://kalpit.me', '/switch-karle')).toBe('kalpit.me/switch-karle')
    expect(hostLabel('https://switchkarle.fyi', '/')).toBe('switchkarle.fyi')
    expect(hostLabel('', '/switch-karle/')).toBe('switch-karle')
  })
})

describe('shareFooterLabel', () => {
  it('composes the label the share card prints from the configured site and base', () => {
    // Pinned against the configuration this repo actually ships, so the card
    // stops saying kalpit.me/switch-karle the day site.config.mjs changes.
    expect(shareFooterLabel()).toBe(
      hostLabel(import.meta.env.SITE ?? '', import.meta.env.BASE_URL ?? '/'),
    )
    expect(shareFooterLabel()).not.toContain('://')
    expect(shareFooterLabel().endsWith('/')).toBe(false)
  })
})
