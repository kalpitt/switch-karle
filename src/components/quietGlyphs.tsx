import type { ReactNode } from 'react'

const GLYPH = /([→✓↓])/

/**
 * A string with its decorative arrows and ticks hidden from screen readers, so
 * "Copied ✓" is read as "Copied", not "Copied check mark" (A11Y N15). The
 * glyph stays on screen; the words around it carry the meaning in EN and HI.
 */
export function quietGlyphs(text: string): ReactNode {
  if (!GLYPH.test(text)) return text
  // One wrapping span, so a flex parent does not drop the space before the glyph.
  return (
    <span>
      {text.split(GLYPH).map((part, i) =>
        GLYPH.test(part) ? (
          <span key={i} aria-hidden="true">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  )
}
