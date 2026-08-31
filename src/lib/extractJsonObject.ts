/**
 * Pulls the JSON object out of whatever an assistant actually replied with.
 *
 * Asked for JSON and nothing else, assistants still wrap it in a ```json fence,
 * open with "Here is the JSON:", or close with "Let me know if you need more".
 * Only handling a leading fence meant a perfectly good answer dead-ended on
 * "that does not look like the JSON the prompt asks for" — a message the user
 * cannot act on, because from where they sit the answer looks right.
 *
 * First brace to last brace. Anything with no object at all is returned
 * unchanged so the caller's parse fails and reports honestly.
 */
export function extractJsonObject(text: string): string {
  const trimmed = text.trim()

  // A fence wins outright. First-brace-to-last-brace alone swallowed prose:
  // "Here is the result {see below}: ```json {...} ``` Done {ok}" produced
  // everything from the first prose brace to the last one, which parses as
  // nothing. Braces in an assistant's commentary are common enough to matter.
  const fenced = /```(?:json)?\s*\n([\s\S]*?)\n?```/i.exec(trimmed)
  const body = fenced?.[1]?.trim() ?? trimmed

  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return body
  return body.slice(start, end + 1)
}
