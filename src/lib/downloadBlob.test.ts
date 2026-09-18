import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadBlob } from './downloadBlob'

/** A minimal stand-in for the one anchor `downloadBlob` creates. */
class FakeAnchor {
  href = ''
  download = ''
  clicked = false
  click() {
    this.clicked = true
  }
}

/** A minimal stand-in for `document`, just enough to prove the ordering. */
function fakeDocument() {
  const anchor = new FakeAnchor()
  const body: { children: FakeAnchor[] } = { children: [] }
  const events: string[] = []
  const doc = {
    createElement: () => anchor,
    body: {
      appendChild: (node: FakeAnchor) => {
        body.children.push(node)
        events.push('appended')
      },
      removeChild: (node: FakeAnchor) => {
        body.children.splice(body.children.indexOf(node), 1)
        events.push('removed')
      },
    },
  }
  return { doc: doc as unknown as Document, anchor, body, events }
}

describe('downloadBlob', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('appends the anchor before clicking it, on an iOS Safari can act on', () => {
    const { doc, anchor, events } = fakeDocument()
    downloadBlob(new Blob(['x']), 'dates.ics', doc)
    expect(anchor.href).toBe('blob:fake-url')
    expect(anchor.download).toBe('dates.ics')
    expect(anchor.clicked).toBe(true)
    expect(events).toEqual(['appended', 'removed'])
  })

  it('removes the anchor from the document once the click has fired', () => {
    const { doc, body } = fakeDocument()
    downloadBlob(new Blob(['x']), 'dates.ics', doc)
    expect(body.children).toEqual([])
  })

  it('does not revoke the object URL in the same tick — a synchronous revoke is what iOS Safari loses the download to', () => {
    const { doc } = fakeDocument()
    downloadBlob(new Blob(['x']), 'dates.ics', doc)
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
  })
})
