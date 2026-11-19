/**
 * English strings waiting for Hindi (decided by Kalpit, 2026-11-19).
 *
 * During the front-door rebuild Hindi is hidden (`HINDI_ON` in
 * `src/data/site.ts`) and the English site is finished first. Every `en.ts` key
 * that is new, or whose English differs from `en-baseline.json` (the English at
 * the start of the rebuild), must be listed here: `i18n.test.ts` fails
 * otherwise. So this list is the exact job for the Hindi pass, which translates
 * each key into `hi-suite.ts` (or rewords it in `hi.ts`), empties this list,
 * deletes `en-baseline.json` and sets `HINDI_ON` to true.
 */
export const HINDI_PENDING: string[] = [
  'home.headline',
  'home.sub',
  'home.question',
  'home.laid',
  'home.laid.cta',
  'home.oneTool',
  'home.oneTool.cta',
  'home.maker',
  'home.maker.cta',
  'home.saved',
  'home.saved.cta',
  'door.leaving.name',
  'door.leaving.what',
  'door.leaving.leadWhy',
  'door.applying.name',
  'door.applying.what',
  'door.applying.leadWhy',
  'door.offer.name',
  'door.offer.what',
  'door.offer.leadWhy',
  'door.notice.name',
  'door.notice.what',
  'door.notice.leadWhy',
  'door.joining.name',
  'door.joining.what',
  'door.joining.leadWhy',
  'door.back',
  'door.start',
  'door.also',
  'door.all',
  'door.planTitle',
  'door.notice.which',
  'door.offer.when.real-hike',
  'door.offer.when.offer-comparison',
  'door.seoTitle',
  'planPage.seoTitle',
]
