import { describe, expect, it } from 'vitest'
import { dictionaries } from './index'

/**
 * The Hindi house style, enforced. This file is its one home: change a rule
 * here and the test tells you every string that now disagrees.
 *
 * Register: code-mixed, the way the audience talks about work. Work terms stay
 * in Latin script (in-hand, CTC, notice period, F&F, offer, tool, number, tax,
 * company, date, last working day). Everything else is Hindi.
 *
 * 1. आप, never तुम: करें / बदलें, not करो / बदलो.
 * 2. Gender-neutral first person in anything the user sends or says (mails,
 *    letters, scripts): "मैंने … कर लिया है", "फ़ैसला हो चुका है", "भेज दिया
 *    जाएगा" — never "कर रहा हूं", "भेज दूंगा", which assume a man is writing.
 * 3. Nukta, always: सिर्फ़, ज़्यादा, ज़रूर, बाक़ी, आख़िरी, ग़लत, फ़ैसला, वक़्त, ख़त्म.
 * 4. Chandrabindu for these nasal vowels: यहाँ, वहाँ, कहाँ, पाँच, माँग, ढूँढ.
 *    Plural verb endings keep the anusvara: करें, हैं, दिखाएं.
 * 5. A Hindi sentence ends with a danda "।", not an ASCII full stop.
 * 6. Money per month is "/month" and per year "/year", as a payslip prints it.
 * 7. "Last working day" in Latin, never "आख़िरी working day". "उदाहरण" for Example.
 *
 * The rules cover only the Hindi dictionaries; English is untouched.
 */
const hi = dictionaries.hi
const en = dictionaries.en
const entries = Object.entries(hi)

/** Keys whose Hindi value breaks `re`, so a failure names the strings to fix. */
function offenders(re: RegExp, keys: [string, string][] = entries): string[] {
  return keys.filter(([, v]) => re.test(v)).map(([k]) => k)
}

const NOT_LETTER = '(?![\\u0915-\\u0939\\u093E-\\u094D])'

describe('Hindi house style', () => {
  it('1. uses आप-form verbs, not तुम-form', () => {
    expect(offenders(new RegExp(`(^|[^\\u0900-\\u097F])(करो|बदलो|देखो|जाओ|लिखो|भेजो|रखो|बताओ)${NOT_LETTER}`))).toEqual([])
  })

  it('2. never assumes the writer is a man (mails, letters, scripts, UI)', () => {
    const masculine = new RegExp(`(रहा|सकता|चाहता|करता|आभारी) हू[ंँ]|[ूु][ंँ]गा${NOT_LETTER}`)
    expect(offenders(masculine)).toEqual([])
  })

  it('3. writes the nukta', () => {
    const bare = /सिर्फ(?!़)|ज्यादा|(^|[^ऀ-ॿ])जरूर|बाकी|आखिर|(^|[^ऀ-ॿ])गलत|फैसल|वक्त|खत्म/
    expect(offenders(bare)).toEqual([])
  })

  it('4. writes the chandrabindu in यहाँ, वहाँ, कहाँ, पाँच, माँग, ढूँढ', () => {
    expect(offenders(/यहां|वहां|कहां|पांच|मांग|ढूंढ/)).toEqual([])
  })

  it('5. ends Hindi sentences with a danda', () => {
    expect(offenders(/[ऀ-ॿ]\.(\s|$)/)).toEqual([])
  })

  it('6. has one per-month unit', () => {
    expect(offenders(/\/(माह|महीना)|\/(mo|yr)\b/)).toEqual([])
    expect(hi['unit.perMonth']).toBe('/month')
  })

  it('7. keeps the agreed terms', () => {
    expect(offenders(/आख़िरी working day/)).toEqual([])
    const chips = ['ui.exampleChip', 'results.exampleChip', 'plan.example.chip', 'offer-comparison.exampleChip']
    for (const key of chips) expect(hi[key], key).toBe('उदाहरण')
  })

  it('applies only to Hindi: English strings are not checked here', () => {
    expect(en['ui.exampleChip']).toBe('Example')
  })
})
