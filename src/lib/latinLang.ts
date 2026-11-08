/**
 * Language of parts (WCAG 3.1.2, A11Y N13). Some Hindi pages keep a tool name
 * wholly in Latin letters ("Notice tracker"). Under `lang="hi"` a screen reader
 * would read it with Hindi rules, so such a name is marked `lang="en"`.
 * Code-mixed text (any Devanagari in it) stays Hindi.
 */
export function latinLang(text: string, pageLang: string): 'en' | undefined {
  if (pageLang !== 'hi') return undefined
  return /[A-Za-z]/.test(text) && !/[ऀ-ॿ]/.test(text) ? 'en' : undefined
}
