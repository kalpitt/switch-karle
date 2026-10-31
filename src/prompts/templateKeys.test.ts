import { describe, expect, it } from 'vitest'
import { dictionaries } from '../i18n'
import { TEMPLATES } from './templates'

// PromptStudio builds these keys at runtime (`template.${id}.title`), so the static
// i18n checks cannot see them. A missing one rendered as raw key text on /prompts/.
describe('every prompt template has EN and HI title + description keys', () => {
  for (const tpl of TEMPLATES) {
    for (const field of ['title', 'description'] as const) {
      const key = `template.${tpl.id}.${field}`
      it(key, () => {
        expect(dictionaries.en[key]?.trim()).toBeTruthy()
        expect(dictionaries.hi[key]?.trim()).toBeTruthy()
      })
    }
  }
})
