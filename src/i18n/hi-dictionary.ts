import { hi } from './hi'
import { hiSuite } from './hi-suite'

/** The whole Hindi dictionary: frozen chrome (`hi.ts`) plus the tool suite
 * (`hi-suite.ts`). Its own module so the browser can load it only on Hindi pages. */
export const hiDictionary: Record<string, string> = { ...hi, ...hiSuite }
