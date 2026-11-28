/**
 * Reads a resume file in the browser and returns its text. Nothing is uploaded
 * here: the file never leaves the device; only the text the page later shows
 * and cleans is sent (PRIVACY.md, "The callback fixer").
 *
 * The readers are loaded only when someone picks a file, so the page stays
 * light for people who paste.
 */

export type FileProblem = 'type' | 'size' | 'noText' | 'read'

export type FileRead = { text: string } | { problem: FileProblem }

export const RESUME_FILE_MAX_BYTES = 5 * 1024 * 1024

export function fileKind(file: { name: string; type: string }): 'pdf' | 'docx' | 'txt' | null {
  const name = file.name.toLowerCase()
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  if (name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return 'docx'
  if (name.endsWith('.txt') || file.type === 'text/plain') return 'txt'
  return null
}

async function pdfText(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  const task = pdfjs.getDocument({ data })
  const doc = await task.promise
  const pages: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent()
    let line = ''
    const lines: string[] = []
    for (const item of content.items) {
      if (!('str' in item)) continue
      line += item.str
      if (item.hasEOL) {
        lines.push(line)
        line = ''
      }
    }
    if (line) lines.push(line)
    pages.push(lines.join('\n'))
  }
  await task.destroy()
  return pages.join('\n\n')
}

async function docxText(data: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ arrayBuffer: data })
  return result.value
}

export async function readResumeFile(file: File): Promise<FileRead> {
  const kind = fileKind(file)
  if (kind === null) return { problem: 'type' }
  if (file.size > RESUME_FILE_MAX_BYTES) return { problem: 'size' }
  try {
    const data = await file.arrayBuffer()
    const raw = kind === 'pdf' ? await pdfText(data) : kind === 'docx' ? await docxText(data) : await file.text()
    const text = raw
      .replace(/\r\n?/g, '\n')
      .replace(/[^\S\n]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    // A scanned PDF is pictures of pages: no text to read.
    if (text.replace(/\s/g, '').length < 50) return { problem: 'noText' }
    return { text }
  } catch {
    return { problem: 'read' }
  }
}
