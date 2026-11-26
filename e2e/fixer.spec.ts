/// <reference lib="dom" />
// The profile fixer (decided 2026-11-26). The Worker is not part of the static
// build, so these tests answer /api/fix themselves and check what the page sends:
// never a name, a phone number or an email.
import { expect, test, type Page, type Request } from '@playwright/test'
import JSZip from 'jszip'

const RESUME = `Ravi Kumar Verma
ravi.verma@example.com | +91 98765 43210 | linkedin.com/in/raviverma

Technology Analyst, a large IT services company (2020 - 2025)
- Responsible for end-to-end delivery of weekly reports for a banking client.
- Built 12 Power BI dashboards used by the risk team.
- Wrote SQL queries to merge 3 data sources into one daily report.

Skills: SQL, Power BI, Excel, Python`

const FIX = {
  roles: [
    { title: 'Data Analyst', fit: 'strong', why: 'SQL and Power BI reporting for a bank.' },
    { title: 'BI Developer', fit: 'good', why: 'Built 12 dashboards.' },
  ],
  role: 'Data Analyst',
  naukriHeadline: 'Data Analyst | SQL, Power BI | 12 dashboards for a banking client',
  linkedinHeadline: 'Data Analyst | SQL, Power BI, Python',
  skills: ['SQL', 'Power BI', 'Excel'],
  worthShowing: ['Tableau'],
  bullets: [
    {
      before: 'Built 12 Power BI dashboards used by the risk team.',
      after: 'Built 12 Power BI dashboards that the risk team uses every day.',
      hint: '',
    },
    {
      before: 'Responsible for end-to-end delivery of weekly reports for a banking client.',
      after: null,
      hint: 'How many reports a week? Add it if you know.',
    },
  ],
  gap: 'Data Analyst posts ask for Python projects; your resume names Python once.',
  missing: ['How many people used the dashboards?'],
}

async function open(page: Page) {
  await page.goto('/fix-my-profile/')
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0)
}

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

test('a pasted resume goes out without name, phone, email or link, and the fixes come back', async ({ page }) => {
  const errors = trackErrors(page)
  const sent: Record<string, string>[] = []
  await page.route('**/api/fix', async (route) => {
    sent.push(route.request().postDataJSON() as Record<string, string>)
    await route.fulfill({ json: { fix: FIX } })
  })
  await open(page)

  await page.getByLabel('Your resume').fill(RESUME)
  await expect(page.locator('[data-removed]')).toContainText('your name')
  await expect(page.locator('[data-removed]')).toContainText('phone')
  await page.locator('[data-fix-go]').click()

  await expect(page.getByRole('heading', { name: 'Your fixes for Data Analyst' })).toBeVisible()
  await expect(page.getByText(FIX.naukriHeadline)).toBeVisible()
  await expect(page.getByText(/Kept as it is/)).toBeVisible()

  expect(sent).toHaveLength(1)
  const body = JSON.stringify(sent[0])
  for (const secret of ['Ravi Kumar Verma', 'ravi.verma@example.com', '98765', 'linkedin.com']) {
    expect(body).not.toContain(secret)
  }
  expect(body).toContain('Built 12 Power BI dashboards used by the risk team.')

  // Another role redoes the fixes for it.
  const next = page.waitForRequest('**/api/fix')
  await page.getByRole('button', { name: /^BI Developer/ }).click()
  expect(((await next) as Request).postDataJSON()).toMatchObject({ role: 'BI Developer' })

  // Nothing is saved on the device: a resume does not belong in a work browser.
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('switchkarle.')))).toEqual([])
  expect(errors).toEqual([])
})

test('the add-ons: notice answer, referral message, share link with no resume in it', async ({ page }) => {
  await page.route('**/api/fix', (route) => route.fulfill({ json: { fix: FIX } }))
  await open(page)
  await page.getByLabel('Your resume').fill(RESUME)
  await page.locator('[data-fix-go]').click()
  await expect(page.locator('[data-fix-result]')).toBeVisible()

  await page.getByRole('button', { name: /when can you join/i }).click()
  await page.getByRole('button', { name: '90 days' }).click()
  await expect(page.getByText(/My notice period is 90 days/)).toBeVisible()

  await page.getByRole('button', { name: 'Write a referral message' }).click()
  await expect(page.getByText(/Data Analyst roles at your company/)).toBeVisible()

  const href = (await page.locator('[data-fix-share]').getAttribute('href'))!
  expect(href.startsWith('https://wa.me/?text=')).toBe(true)
  const text = decodeURIComponent(href.slice('https://wa.me/?text='.length))
  expect(text).toContain('/fix-my-profile/')
  expect(text).not.toContain('SQL')
})

test('when the free AI is busy, it offers a prompt for your own AI, without your contact details', async ({ page }) => {
  await page.route('**/api/fix', (route) => route.fulfill({ status: 503, json: { error: 'busy' } }))
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await open(page)
  await page.getByLabel('Your resume').fill(RESUME)
  await page.locator('[data-fix-go]').click()
  await expect(page.locator('[data-fix-error="busy"]')).toBeVisible()
  await page.getByRole('button', { name: 'Copy for my own AI' }).click()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toContain('Built 12 Power BI dashboards')
  expect(copied).not.toContain('ravi.verma@example.com')
})

test('the button waits for a whole resume', async ({ page }) => {
  let calls = 0
  await page.route('**/api/fix', (route) => {
    calls++
    return route.fulfill({ json: { fix: FIX } })
  })
  await open(page)
  await page.getByLabel('Your resume').fill('Data analyst, five years.')
  await expect(page.getByText(/too short for a resume/)).toBeVisible()
  await page.locator('[data-fix-go]').click({ force: true })
  expect(calls).toBe(0)
})

/** A one-page PDF with real text in it, small enough to write by hand. */
function tinyPdf(lines: string[]): Buffer {
  const stream = `BT /F1 11 Tf 50 780 Td 14 TL ${lines.map((l) => `(${l.replace(/[()\\]/g, '')}) '`).join(' ')} ET`
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(out, 'latin1')
}

async function tinyDocx(lines: string[]): Promise<Buffer> {
  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  )
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  )
  const paras = lines.map((l) => `<w:p><w:r><w:t xml:space="preserve">${l}</w:t></w:r></w:p>`).join('')
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`,
  )
  return zip.generateAsync({ type: 'nodebuffer' })
}

const FILE_LINES = [
  'Pooja Sharma',
  'Customer Support Team Lead, a BPO in Indore (2021 - 2025)',
  'Prepared daily MIS reports in Excel for 3 managers.',
  'Handled escalations for a telecom client.',
]

test('a PDF resume is read in the browser, with no console error', async ({ page }) => {
  const errors = trackErrors(page)
  await open(page)
  await page.locator('[data-resume-file]').setInputFiles({ name: 'resume.pdf', mimeType: 'application/pdf', buffer: tinyPdf(FILE_LINES) })
  await expect(page.getByLabel('Your resume')).toHaveValue(/Prepared daily MIS reports in Excel for 3 managers\./)
  await expect(page.locator('[data-removed]')).toContainText('your name')
  expect(errors).toEqual([])
})

test('a Word resume is read in the browser', async ({ page }) => {
  await open(page)
  await page.locator('[data-resume-file]').setInputFiles({
    name: 'resume.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: await tinyDocx(FILE_LINES),
  })
  await expect(page.getByLabel('Your resume')).toHaveValue(/Handled escalations for a telecom client\./)
})

test('an old .doc file gets a plain answer', async ({ page }) => {
  await open(page)
  await page.locator('[data-resume-file]').setInputFiles({ name: 'resume.doc', mimeType: 'application/msword', buffer: Buffer.from('x') })
  await expect(page.getByText(/Use a PDF or Word \(\.docx\) file/)).toBeVisible()
})
