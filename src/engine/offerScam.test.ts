import { describe, expect, it } from 'vitest'
import { scanOfferScam } from './offerScam'

const cleanInput = {
  company: 'Acme Technologies',
  emailDomain: 'acme.com',
  offerText:
    'We are pleased to offer you the role of Software Engineer. Your joining date is 1 September. Please sign and return this letter.',
}

describe('scanOfferScam', () => {
  it('clean corporate offer returns only the two info hints', () => {
    const flags = scanOfferScam(cleanInput)
    expect(flags.map((f) => f.id)).toEqual(['epfo-hint', 'mca-hint'])
    expect(flags.every((f) => f.severity === 'info')).toBe(true)
  })

  it('gmail plus deposit text returns deposit as the only red, free-mail as amber', () => {
    const flags = scanOfferScam({
      company: 'Acme Technologies',
      emailDomain: 'gmail.com',
      offerText: 'Please pay a security deposit of Rs 5000 before joining to receive your laptop.',
    })
    expect(flags.map((f) => f.id)).toEqual(['deposit-ask', 'free-mail', 'epfo-hint', 'mca-hint'])
    expect(flags[0]!.severity).toBe('red')
    expect(flags[1]!.severity).toBe('amber')
  })

  describe('deposit-ask', () => {
    it.each([
      'A refundable security deposit is required.',
      'Please remit the joining fee within 3 days.',
      'Training fee must be paid before onboarding.',
      'You must pay to receive a laptop on day one.',
      'Registration fee is mandatory for all new hires.',
    ])('flags deposit language: %s', (offerText) => {
      const ids = scanOfferScam({ ...cleanInput, offerText }).map((f) => f.id)
      expect(ids).toContain('deposit-ask')
    })

    it.each([
      'You will be required to pay salary in lieu of the unserved notice period.',
      'You must pay back the joining bonus if you leave within 12 months.',
    ])('does not flag ordinary notice/clawback language: %s', (offerText) => {
      const ids = scanOfferScam({ ...cleanInput, offerText }).map((f) => f.id)
      expect(ids).not.toContain('deposit-ask')
    })
  })

  describe('free-mail', () => {
    it.each([
      'gmail.com',
      '@gmail.com',
      'YAHOO.COM',
      'outlook.com',
      'hotmail.com',
      'rediffmail.com',
      'proton.me',
      'icloud.com',
    ])('flags free-mailbox domain: %s', (emailDomain) => {
      const ids = scanOfferScam({ ...cleanInput, emailDomain }).map((f) => f.id)
      expect(ids).toContain('free-mail')
    })
  })

  describe('lookalike-domain', () => {
    it.each([
      { company: 'Infosys', emailDomain: 'inf0sys.com' },
      { company: 'Infosys', emailDomain: 'infosys.co' },
      { company: 'Infosys', emailDomain: 'infosys-hr.com' },
      { company: 'Infosys', emailDomain: 'infosys-careers.com' },
      { company: 'TCS', emailDomain: 'careers.tcs.co' },
    ])('flags lookalike for $company @ $emailDomain', ({ company, emailDomain }) => {
      const ids = scanOfferScam({ ...cleanInput, company, emailDomain }).map((f) => f.id)
      expect(ids).toContain('lookalike-domain')
    })

    it('does not flag a matching corporate domain', () => {
      const ids = scanOfferScam({
        ...cleanInput,
        company: 'Infosys',
        emailDomain: 'infosys.com',
      }).map((f) => f.id)
      expect(ids).not.toContain('lookalike-domain')
    })

    it('does not flag a legitimate .co.uk corporate domain', () => {
      const ids = scanOfferScam({
        ...cleanInput,
        company: 'Infosys',
        emailDomain: 'infosys.co.uk',
      }).map((f) => f.id)
      expect(ids).not.toContain('lookalike-domain')
    })

    it('does not flag hyphenated careers domain when company is empty', () => {
      const ids = scanOfferScam({
        company: '',
        emailDomain: 'acme-careers.com',
        offerText: cleanInput.offerText,
      }).map((f) => f.id)
      expect(ids).not.toContain('lookalike-domain')
    })
  })

  describe('whatsapp-only', () => {
    it.each([
      'Please continue only on WhatsApp for faster processing.',
      'All further communication will be on Telegram only.',
      'Contact us only on WhatsApp to complete onboarding.',
    ])('flags messaging-only language: %s', (offerText) => {
      const ids = scanOfferScam({ ...cleanInput, offerText }).map((f) => f.id)
      expect(ids).toContain('whatsapp-only')
    })
  })

  describe('info hints', () => {
    it('always includes EPFO and MCA pointers', () => {
      const flags = scanOfferScam(cleanInput)
      const epfo = flags.find((f) => f.id === 'epfo-hint')!
      const mca = flags.find((f) => f.id === 'mca-hint')!
      expect(epfo.verificationHint).toContain('https://www.epfindia.gov.in/')
      expect(mca.verificationHint).toContain('https://www.mca.gov.in/')
    })
  })

  it('sorts red before amber before info', () => {
    const flags = scanOfferScam({
      company: 'Infosys',
      emailDomain: 'gmail.com',
      offerText: 'Continue only on WhatsApp. Pay a joining fee. We represent Infosys.',
    })
    expect(flags.map((f) => f.severity)).toEqual(['red', 'amber', 'amber', 'info', 'info'])
  })
})
