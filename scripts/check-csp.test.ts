import { describe, expect, it } from 'vitest'
import { checkCspHtml, isOffOrigin } from './check-csp.mjs'

const VALID_CSP =
  "default-src 'self';connect-src 'self';img-src 'self' data:;font-src 'self';base-uri 'self';form-action 'none';object-src 'none';script-src 'self' 'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw=';style-src 'self' 'sha256-vv9IoKo7BSLbWcUHr3tNmfNVmm5L/9Cfn2H6LMk7/ow=';"

const VALID_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Security-Policy" content="${VALID_CSP}">
  <link rel="stylesheet" href="/_astro/style.css">
  <script src="/_astro/app.js"></script>
</head>
<body>
  <img src="/icons/icon.svg" alt="App Icon">
</body>
</html>
`

describe('check-csp: valid baseline', () => {
  it('accepts a valid page meeting all CSP constraints', () => {
    const result = checkCspHtml(VALID_PAGE, 'index.html')
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('fails when CSP meta element is completely missing', () => {
    const html = '<html><head><title>No CSP</title></head><body></body></html>'
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-csp: FAIL — index.html missing Content-Security-Policy meta element')
  })
})

describe('check-csp: off-origin URL detection holes', () => {
  it('isOffOrigin catches normal off-origin URLs', () => {
    expect(isOffOrigin('https://evil.com/payload.js')).toBe(true)
    expect(isOffOrigin('http://evil.com/payload.js')).toBe(true)
    expect(isOffOrigin('//evil.com/payload.js')).toBe(true)
    expect(isOffOrigin('/local/path.js')).toBe(false)
  })

  it('catches off-origin script URLs with leading whitespace', () => {
    const html = VALID_PAGE.replace(
      '<script src="/_astro/app.js"></script>',
      '<script src=" https://evil.com/evil.js"></script>',
    )
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors.some((e: string) => e.includes('off-origin script'))).toBe(true)
  })

  it('catches off-origin stylesheet URLs with leading whitespace', () => {
    const html = VALID_PAGE.replace(
      '<link rel="stylesheet" href="/_astro/style.css">',
      '<link rel="stylesheet" href=" https://evil.com/evil.css">',
    )
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors.some((e: string) => e.includes('off-origin stylesheet'))).toBe(true)
  })

  it('catches off-origin image URLs with leading whitespace', () => {
    const html = VALID_PAGE.replace(
      '<img src="/icons/icon.svg"',
      '<img src=" https://evil.com/evil.png"',
    )
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors.some((e: string) => e.includes('off-origin image'))).toBe(true)
  })

  it('catches off-origin resources in slash-delimited HTML tags', () => {
    const html = `<html><head><meta http-equiv="Content-Security-Policy" content="default-src 'self';connect-src 'self';img-src 'self';font-src 'self';base-uri 'self';form-action 'none';object-src 'none';script-src 'self' 'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw=';style-src 'self';"><script/src="https://evil.com/x.js"></script></head><body></body></html>`
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors.some((e: string) => e.includes('off-origin script'))).toBe(true)
  })
})

describe('check-csp: meta tag and attribute parsing holes', () => {
  it('rejects meta tags where http-equiv matches inside a longer attribute name like data-http-equiv', () => {
    const html = `
      <html>
      <head>
        <meta data-http-equiv="Content-Security-Policy" content="${VALID_CSP}">
      </head>
      <body></body>
      </html>
    `
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-csp: FAIL — index.html missing Content-Security-Policy meta element')
  })

  it('rejects CSP meta element placed inside an HTML comment', () => {
    const html = `
      <html>
      <head>
        <!-- <meta http-equiv="Content-Security-Policy" content="${VALID_CSP}"> -->
      </head>
      <body></body>
      </html>
    `
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-csp: FAIL — index.html missing Content-Security-Policy meta element')
  })
})

describe('check-csp: directive validation holes', () => {
  it('fails when a required directive is present but has empty value', () => {
    const emptyStyleCsp = VALID_CSP.replace(/style-src [^;]+;/, 'style-src;')
    const html = VALID_PAGE.replace(VALID_CSP, emptyStyleCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-csp: FAIL — index.html missing required CSP directive "style-src"')
  })

  it('catches unsafe-inline in style-src', () => {
    const badStyleCsp = VALID_CSP.replace(
      /style-src [^;]+;/,
      "style-src 'self' 'unsafe-inline';",
    )
    const html = VALID_PAGE.replace(VALID_CSP, badStyleCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain("check-csp: FAIL — index.html style-src contains 'unsafe-inline'")
  })

  it('catches unsafe-eval in style-src', () => {
    const badStyleCsp = VALID_CSP.replace(
      /style-src [^;]+;/,
      "style-src 'self' 'unsafe-eval';",
    )
    const html = VALID_PAGE.replace(VALID_CSP, badStyleCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain("check-csp: FAIL — index.html style-src contains 'unsafe-eval'")
  })

  it('catches unsafe-inline in default-src', () => {
    const badDefaultCsp = VALID_CSP.replace(
      /default-src [^;]+;/,
      "default-src 'self' 'unsafe-inline';",
    )
    const html = VALID_PAGE.replace(VALID_CSP, badDefaultCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain("check-csp: FAIL — index.html default-src contains 'unsafe-inline'")
  })

  it('catches unsafe-eval in default-src', () => {
    const badDefaultCsp = VALID_CSP.replace(
      /default-src [^;]+;/,
      "default-src 'self' 'unsafe-eval';",
    )
    const html = VALID_PAGE.replace(VALID_CSP, badDefaultCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain("check-csp: FAIL — index.html default-src contains 'unsafe-eval'")
  })

  it('catches wildcard in default-src', () => {
    const badCsp = VALID_CSP.replace("default-src 'self'", 'default-src *')
    const html = VALID_PAGE.replace(VALID_CSP, badCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain("check-csp: FAIL — index.html default-src contains wildcard '*'")
  })

  it('catches wildcard in object-src', () => {
    const badCsp = VALID_CSP.replace("object-src 'none'", 'object-src *')
    const html = VALID_PAGE.replace(VALID_CSP, badCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain("check-csp: FAIL — index.html object-src contains wildcard '*'")
  })

  it('catches connect-src that is not exactly self', () => {
    const badCsp = VALID_CSP.replace("connect-src 'self'", "connect-src 'self' https://api.example.com")
    const html = VALID_PAGE.replace(VALID_CSP, badCsp)
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors.some((e: string) => e.includes('connect-src is'))).toBe(true)
  })

  it('rejects duplicate CSP directives', () => {
    const html = `<html><head><meta http-equiv="Content-Security-Policy" content="default-src 'self';connect-src 'self';img-src 'self';font-src 'self';base-uri 'self';form-action 'none';object-src 'none';script-src 'self';script-src 'sha256-BF0290pkb3jxQsE7z00xR8Imp8X34FLC88L0lkMnrGw=';style-src 'self';"></head><body></body></html>`
    const result = checkCspHtml(html, 'index.html')
    expect(result.ok).toBe(false)
    expect(result.errors.some((e: string) => e.includes('duplicate CSP directive "script-src"'))).toBe(true)
  })
})
