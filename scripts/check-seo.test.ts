import { describe, expect, it } from 'vitest'
import { checkAnalytics, checkHtmlHead, checkRobots, checkSitemap } from './check-seo.mjs'

const VALID_HEAD = `
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="canonical" href="https://switchkarle.in/decoder/">
  <meta property="og:title" content="Switch Karle — CTC Decoder">
  <meta property="og:description" content="Decode your salary structure">
  <meta property="og:url" content="https://switchkarle.in/decoder/">
  <meta property="og:image" content="https://switchkarle.in/og/decoder.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="alternate" hreflang="hi" href="https://switchkarle.in/hi/decoder/">
  <link rel="alternate" hreflang="en" href="https://switchkarle.in/decoder/">
  <title>Switch Karle — CTC Decoder</title>
</head>
<body></body>
</html>
`

describe('check-seo: head contract and valid input', () => {
  it('accepts a valid HTML route with all required head tags and title', () => {
    const titles = new Map()
    const result = checkHtmlHead(VALID_HEAD, 'decoder/index.html', titles)
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('fails when a required head tag is missing', () => {
    const missingCanonical = VALID_HEAD.replace(/<link rel="canonical"[^>]+>/, '')
    const result = checkHtmlHead(missingCanonical, 'decoder/index.html', new Map())
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-seo: FAIL — decoder/index.html missing canonical')
  })

  it('fails when title element is missing', () => {
    const missingTitle = VALID_HEAD.replace(/<title>[^<]*<\/title>/, '')
    const result = checkHtmlHead(missingTitle, 'decoder/index.html', new Map())
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-seo: FAIL — decoder/index.html missing <title>')
  })
})

describe('check-seo: duplicate title normalisation holes', () => {
  it('catches duplicate titles differing only by leading, trailing, or internal whitespace', () => {
    const titles = new Map()
    const page1 = checkHtmlHead(VALID_HEAD, 'page1.html', titles)
    expect(page1.ok).toBe(true)

    const whitespaceTitleHtml = VALID_HEAD.replace(
      '<title>Switch Karle — CTC Decoder</title>',
      '<title>  Switch   Karle —   CTC Decoder  </title>',
    )
    const page2 = checkHtmlHead(whitespaceTitleHtml, 'page2.html', titles)
    expect(page2.ok).toBe(false)
    expect(page2.errors.some((e: string) => e.includes('duplicate title'))).toBe(true)
  })

  it('catches duplicate titles differing only by casing', () => {
    const titles = new Map()
    const page1 = checkHtmlHead(VALID_HEAD, 'page1.html', titles)
    expect(page1.ok).toBe(true)

    const lowerCaseHtml = VALID_HEAD.replace(
      '<title>Switch Karle — CTC Decoder</title>',
      '<title>switch karle — ctc decoder</title>',
    )
    const page2 = checkHtmlHead(lowerCaseHtml, 'page2.html', titles)
    expect(page2.ok).toBe(false)
    expect(page2.errors.some((e: string) => e.includes('duplicate title'))).toBe(true)
  })

  it('fails when title consists entirely of whitespace', () => {
    const whitespaceOnlyHtml = VALID_HEAD.replace(
      '<title>Switch Karle — CTC Decoder</title>',
      '<title>   \n\t  </title>',
    )
    const result = checkHtmlHead(whitespaceOnlyHtml, 'blank.html', new Map())
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-seo: FAIL — blank.html missing <title>')
  })
})

describe('check-seo: no-analytics holes', () => {
  it('accepts clean code without analytics', () => {
    const clean = 'console.log("hello world"); const config = { mode: "production" };'
    const result = checkAnalytics(clean, 'bundle.js')
    expect(result.ok).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('catches gtag with whitespace before parenthesis', () => {
    const snippet = "gtag ('config', 'G-XXXXXX');"
    const result = checkAnalytics(snippet, 'analytics.js')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-seo: FAIL — analytics snippet in analytics.js')
  })

  it('catches gtag with optional chaining', () => {
    const snippet = "window.gtag?.('config', 'G-XXXXXX');"
    const result = checkAnalytics(snippet, 'analytics.js')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-seo: FAIL — analytics snippet in analytics.js')
  })

  it('catches Universal Analytics ga calls', () => {
    const snippet = "ga('create', 'UA-XXXXX-Y', 'auto'); ga('send', 'pageview');"
    const result = checkAnalytics(snippet, 'tracker.js')
    expect(result.ok).toBe(false)
    expect(result.errors).toContain('check-seo: FAIL — analytics snippet in tracker.js')
  })

  it('catches ga with whitespace or optional chaining', () => {
    const snippetWithSpace = "ga ('create', 'UA-XXXXX-Y');"
    expect(checkAnalytics(snippetWithSpace, 't1.js').ok).toBe(false)

    const snippetWithChain = "window.ga?.('send', 'pageview');"
    expect(checkAnalytics(snippetWithChain, 't2.js').ok).toBe(false)
  })

  it('catches script sources from analytics providers', () => {
    const gtm = '<script src="https://www.googletagmanager.com/gtag/js?id=G-123"></script>'
    expect(checkAnalytics(gtm, 'index.html').ok).toBe(false)

    const ga = '<script src="https://www.google-analytics.com/analytics.js"></script>'
    expect(checkAnalytics(ga, 'index.html').ok).toBe(false)

    const plausible = '<script defer data-domain="example.com" src="https://plausible.io/js/script.js"></script>'
    expect(checkAnalytics(plausible, 'index.html').ok).toBe(false)

    const umami = '<script defer src="https://cloud.umami.is/script.js" data-website-id="123"></script>'
    expect(checkAnalytics(umami, 'index.html').ok).toBe(false)

    const clarity = '<script src="https://www.clarity.ms/tag/xyz123"></script>'
    expect(checkAnalytics(clarity, 'index.html').ok).toBe(false)
  })
})

describe('check-seo: robots and sitemap contracts', () => {
  it('accepts valid robots.txt allowing all', () => {
    const robots = 'User-agent: *\nAllow: /\n'
    expect(checkRobots(robots).ok).toBe(true)
  })

  it('rejects robots.txt blocking the site with Disallow: /', () => {
    const robots = 'User-agent: *\nDisallow: /\n'
    expect(checkRobots(robots).ok).toBe(false)
  })

  it('accepts valid sitemap containing required routes', () => {
    const sitemap = '<urlset><loc>https://switchkarle.in/</loc><loc>https://switchkarle.in/hi/</loc><loc>https://switchkarle.in/decoder/</loc><loc>https://switchkarle.in/hi/decoder/</loc></urlset>'
    expect(checkSitemap(sitemap, ['decoder'], '', 'https://switchkarle.in').ok).toBe(true)
  })

  it('rejects sitemap with sitemapindex', () => {
    const sitemap = '<sitemapindex><sitemap><loc>https://switchkarle.in/sitemap-0.xml</loc></sitemap></sitemapindex>'
    expect(checkSitemap(sitemap, [], '', 'https://switchkarle.in').ok).toBe(false)
  })
})
