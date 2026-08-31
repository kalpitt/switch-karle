/**
 * Drops a markdown code fence around a pasted answer.
 *
 * Assistants wrap JSON in ```json constantly. Failing on that would be a dead
 * end the user cannot diagnose: the answer looks right on their screen and the
 * app just says it is invalid.
 */
export function stripFences(text: string): string {
  const trimmed = text.trim()
  if (!trimmed.startsWith('```')) return trimmed
  const lines = trimmed.split('\n')
  lines.shift()
  if (lines.length > 0 && lines[lines.length - 1]!.trim().startsWith('```')) lines.pop()
  return lines.join('\n').trim()
}
