import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import OfferGoesColdTool from './index'

describe('OfferGoesColdTool', () => {
  it('contains no statutory digit sequences next to days, section, Act, or ₹', () => {
    // Render the component to a string
    const html = renderToString(OfferGoesColdTool({ lang: 'en' }))

    // The test asserts the page source contains no digit sequences next to the words
    // "days", "section", "Act" or "₹".
    // "adapt the pattern so the prompt placeholders and dates in examples do not trip it, and explain the adaptation in the commit body"
    
    // So we want to find digits \d+ near these words, but we must exclude placeholders like [48 hours] or something.
    // Let's use a regex that matches:
    // (\d+\s*(days|section|Act|₹)|(days|section|Act|₹)\s*\d+)
    // But we need to ignore things like "[48 hours]" -- wait, the forbidden words are days, section, Act, ₹. 
    // And for "48 hours", the word is "hours", not forbidden. 
    // If the prompt has "[7 days]", that would trip it! We should ignore digits inside brackets [...]
    
    // We remove bracketed placeholders from the html first before testing.
    const withoutPlaceholders = html.replace(/\[.*?\]/g, '')
    
    // We should also strip out 48 hours, wait, "hours" is not forbidden, but if there's any bracketed "[7 days]" it's removed.
    // What if there's "Stage 5"? It's fine, not next to forbidden words.
    
    const forbiddenPattern = /\d+\s*(days|section|Act|₹)|(days|section|Act|₹)\s*\d+/i
    const match = withoutPlaceholders.match(forbiddenPattern)
    
    expect(match).toBeNull()
  })
})
