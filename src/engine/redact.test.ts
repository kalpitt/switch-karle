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
})
