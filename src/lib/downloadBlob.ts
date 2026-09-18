/**
 * Triggers a browser download of `blob` as `filename`.
 *
 * The anchor is appended to the document before the click and removed right
 * after — a detached anchor is the pattern iOS Safari is least reliable with,
 * where it can preview the blob instead of saving it. The object URL is
 * revoked a second later rather than synchronously in the same tick, so a
 * slow browser has time to actually start the download before the URL it
 * pointed at goes away.
 */
export function downloadBlob(blob: Blob, filename: string, doc: Document = document): void {
  const url = URL.createObjectURL(blob)
  const a = doc.createElement('a')
  a.href = url
  a.download = filename
  doc.body.appendChild(a)
  a.click()
  doc.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
