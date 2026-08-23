import { describe, expect, it } from 'vitest'
import { redactText } from './redact'

describe('redactText', () => {
  it('masks Aadhaar, PAN, email, phone, IFSC and rupee amounts', () => {
    const r = redactText(
      'Aadhaar 2345 6789 0123 PAN ABCDE1234F email a@b.co phone 9876543210 IFSC HDFC0001234 CTC Rs 24,00,000',
    )
    expect(r.redacted).not.toContain('2345 6789 0123')
    expect(r.redacted).not.toContain('ABCDE1234F')
    expect(r.redacted).not.toContain('a@b.co')
    expect(r.redacted).not.toContain('9876543210')
    expect(r.redacted).not.toContain('HDFC0001234')
    expect(r.redacted).not.toContain('24,00,000')
    expect(r.hits.map((h) => h.kind).sort()).toEqual(['aadhaar', 'email', 'ifsc', 'pan', 'phone', 'rupee'])
  })

  it('leaves clean prose untouched', () => {
    const r = redactText('We are pleased to offer you the role of Software Engineer.')
    expect(r.redacted).toBe('We are pleased to offer you the role of Software Engineer.')
    expect(r.hits).toEqual([])
  })

  it('masks a labelled UAN without colliding with Aadhaar numbers', () => {
    const r = redactText('UAN: 101234567890 and Aadhaar 2345 6789 0123')
    expect(r.redacted).toContain('[UAN]')
    expect(r.redacted).not.toContain('101234567890')
    // The bare Aadhaar run is still an Aadhaar hit, not swallowed by UAN.
    expect(r.redacted).toContain('XXXX XXXX XXXX')
    expect(r.hits.map((h) => h.kind).sort()).toEqual(['aadhaar', 'uan'])
  })

  it('does not treat a bare 12-digit number as UAN', () => {
    const r = redactText('Member id 101234567890 pending')
    expect(r.hits.some((h) => h.kind === 'uan')).toBe(false)
  })
})
