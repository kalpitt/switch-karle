import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * What makes a custom overlay behave like a real modal dialog while it is open:
 * focus moves into it, Tab stays inside it, Escape closes it, the page behind
 * does not scroll, and on close focus returns to whatever opened it.
 *
 * `initial` picks the element to focus first; without it, the first focusable
 * element in the panel gets focus.
 */
export function useDialog(
  open: boolean,
  panel: RefObject<HTMLElement | null>,
  onClose: () => void,
  initial?: RefObject<HTMLElement | null>,
) {
  // The latest onClose, so Escape always runs the current one (the erase dialog's
  // close changes once the erase has happened) without re-running the effect.
  const close = useRef(onClose)
  close.current = onClose

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const first = initial?.current ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()

    // A class, not an inline style: the page behind stops scrolling under the overlay.
    document.body.classList.add('overflow-hidden')

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close.current()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) return
      const head = items[0]!
      const tail = items[items.length - 1]!
      const active = document.activeElement
      if (e.shiftKey && (active === head || !panel.current.contains(active))) {
        e.preventDefault()
        tail.focus()
      } else if (!e.shiftKey && (active === tail || !panel.current.contains(active))) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('overflow-hidden')
      if (opener && opener.isConnected) opener.focus()
    }
    // Runs once per open: re-running would pull focus back to the first element.
  }, [open, panel, initial])
}
