/**
 * The pages about the site itself, in footer order. Each has a Hindi twin at
 * /hi/<slug>/. None of these slugs may be a tool slug or `hi`.
 */
export const INFO_PAGES = ['about', 'sources', 'privacy', 'terms'] as const
export type InfoPage = (typeof INFO_PAGES)[number]

/** When each page's text last changed in substance. Shown at the foot of the page. */
export const INFO_PAGE_UPDATED: Record<InfoPage, string> = {
  about: '2026-11-01',
  sources: '2026-11-01',
  privacy: '2026-11-01',
  terms: '2026-11-01',
}

export const SOURCE_CODE_URL = 'https://github.com/kalpitt/switch-karle'
export const CONTACT_EMAIL = 'tiwari.kalpit@gmail.com'
