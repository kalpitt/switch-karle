import type { StateCode } from '../engine/types'

/**
 * Where every statutory rule the tools use comes from, and when it was last
 * checked. The one home for that question on the page: the receipt line under
 * each verdict, the footer chip and the "How we check numbers" page all read
 * this file.
 *
 * This file re-exposes what the engine already says. Each entry is copied from
 * a `VERIFIED:` or `CANDIDATE` marker in `src/engine/*.ts` (named in `where`),
 * or from `docs/ARCHITECTURE.md` / `docs/DECISIONS.md` where the code carries
 * no date of its own. It never adds a number, a rate or a citation. To change
 * a status, change the marker in the engine first, with the primary source in
 * hand, and then this entry. February ritual (Union Budget): re-open every
 * entry, re-check it against its source, and move its `checked` date.
 *
 * `checked` is the date the rule was last read against the document named in
 * `citation`. For an `awaiting-*` entry it is the date it was last looked at
 * and left open; for a `convention` it is the date the code labelled it one.
 */
export type SourceStatus = 'verified' | 'awaiting-ca' | 'awaiting-lawyer' | 'convention'

export interface SourceEntry {
  id: string
  /** Short document name for the receipt line, Latin script in both languages. */
  doc: string
  /** Section, rule or item within `doc`, as the code cites it. Empty when the doc is the whole source. */
  section: string
  /**
   * The citation, as written in the code's marker. References only, no prose:
   * it shows untranslated on Hindi pages. Empty when no document applies.
   */
  citation: string
  /** True when `sourceNote.<id>` in the dictionaries says what the rule rests on, or what is still open. */
  note?: true
  /** The primary document, when the code names one. */
  url?: string
  status: SourceStatus
  /** ISO date, `YYYY-MM-DD`. */
  checked: string
  /** Where the marker lives, for whoever re-checks it. */
  where: string
}

const ITA_2025_PDF =
  'https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf'
const ITA_2025_ICAI = 'https://resource.cdn.icai.org/87647dtc-aps2139-inceome-tax-act-2025.pdf'
const IT_RULES_2026 =
  'https://www.incometaxindia.gov.in/documents/81799/11848482/En-Notified-IT-Rules-2026-20-03-2026.pdf'
const SS_CODE = 'https://www.indiacode.nic.in/bitstream/123456789/16823/1/aA2020-36.pdf'

export const SOURCES: readonly SourceEntry[] = [
  // ── Income tax ────────────────────────────────────────────────────────────
  {
    id: 'ita-new-regime',
    doc: 'Income-tax Act, 2025',
    section: 's.202',
    citation: 'Income-tax Act, 2025 (as amended by the Finance Act 2026) s.202',
    url: ITA_2025_PDF,
    status: 'verified',
    checked: '2026-08-23',
    where: 'src/engine/tax.ts',
  },
  {
    id: 'ita-rebate',
    doc: 'Income-tax Act, 2025',
    section: 's.156',
    citation: 'Income-tax Act, 2025 (as amended by the Finance Act 2026) s.156',
    url: ITA_2025_PDF,
    status: 'verified',
    checked: '2026-08-23',
    where: 'src/engine/tax.ts',
  },
  {
    id: 'ita-salary-deductions',
    doc: 'Income-tax Act, 2025',
    section: 's.19',
    citation: 'Income-tax Act, 2025 (as amended by the Finance Act 2026) s.19',
    url: ITA_2025_PDF,
    status: 'verified',
    checked: '2026-08-23',
    where: 'src/engine/tax.ts, src/engine/salary.ts',
  },
  {
    id: 'ita-deduction-cap',
    doc: 'Income-tax Act, 2025',
    section: 's.123',
    citation: 'Income-tax Act, 2025 (as amended by the Finance Act 2026) s.123',
    url: ITA_2025_PDF,
    status: 'verified',
    checked: '2026-08-23',
    where: 'src/engine/tax.ts',
  },
  {
    // docs/ARCHITECTURE.md: "Golden-tested; last verified 2026-07-20". The code
    // names the Act but pins no section for the slab table itself.
    id: 'tax-slabs',
    doc: 'Income-tax Act, 2025',
    section: 'FY 2026-27 rates',
    citation: 'Income-tax Act, 2025, FY 2026-27 rates',
    note: true,
    status: 'verified',
    checked: '2026-07-20',
    where: 'src/engine/tax.ts; status in docs/ARCHITECTURE.md',
  },
  {
    id: 'hra-rule-279',
    doc: 'Income-tax Rules, 2026',
    section: 'Rule 279',
    citation: 'Income-tax Rules, 2026 (G.S.R. 198(E)) Rule 279(1) and 279(1)(c)',
    url: IT_RULES_2026,
    status: 'verified',
    checked: '2026-09-27',
    where: 'src/engine/salary.ts, src/engine/city.ts',
  },
  {
    id: 'epf-wage-ceiling',
    doc: 'S.O. 5109(E)',
    section: '',
    citation: 'S.O. 5109(E), 17 Sep 2026, under s.2(89) of the Code on Social Security, 2020',
    url: 'https://egazette.gov.in/WriteReadData/2026/276299.pdf',
    status: 'verified',
    checked: '2026-09-27',
    where: 'src/engine/salary.ts',
  },
  {
    id: 'gratuity-accrual',
    doc: '',
    section: '',
    citation: '',
    note: true,
    status: 'convention',
    checked: '2026-08-23',
    where: 'src/engine/salary.ts; status in docs/ARCHITECTURE.md',
  },

  // ── Professional tax, state by state ─────────────────────────────────────
  {
    id: 'pt-KA',
    doc: 'Karnataka Act No. 33 of 2025',
    section: 'Schedule Sl. No. 1',
    citation:
      'Karnataka Tax on Profession, Trades, Callings and Employments (Amendment) Act, 2025 (Karnataka Act No. 33 of 2025), Schedule Sl. No. 1',
    url: 'https://dpal.karnataka.gov.in/uploads/media_to_upload1751017993.pdf',
    status: 'verified',
    checked: '2026-09-28',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-PB',
    doc: 'Punjab State Development Tax Act, 2018',
    section: '',
    citation: 'Punjab State Development Tax Act, 2018',
    status: 'verified',
    checked: '2026-08-23',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-TN',
    doc: 'Greater Chennai Corporation press release, 04.08.2026',
    section: '',
    citation: 'Greater Chennai Corporation, Revenue Dept., Press Release R.D. PT C.No/3555/2026 dated 04.08.2026, slab table S.No. 6',
    url: 'https://chennaicorporation.gov.in/gcc/pdf/PT_Press_Release.pdf',
    note: true,
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-OD',
    doc: 'Odisha Professional Tax rate chart',
    section: 'Sl. No. 1',
    citation: 'Commissionerate of Commercial Taxes & GST, Odisha, Professional Tax rate chart, Sl. No. 1',
    url: 'https://odishatax.gov.in/professional_tax.php',
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-TG',
    doc: 'Telangana Professions Tax Act, 1987',
    section: 'First Schedule 1(iii)',
    citation: 'Telangana Tax on Professions, Trades, Callings and Employments Act, 1987, First Schedule entry 1(iii)',
    url: 'https://www.tgct.gov.in/tgportal/AllActs/APPT/APPTSchedule.aspx',
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-AS',
    doc: 'Assam Professions Tax Act, 1947',
    section: 'Sl. No. 1(iv)',
    citation: 'Assam Taxation Dept., rate of tax on the Assam Professions, Trades, Callings and Employments Taxation Act, 1947, Sl. No. 1(iv)',
    url: 'https://tax.assam.gov.in/AssamTimsInfo/GST/FORMATS/PROFESSION_TAX-Schedule.pdf',
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-PY',
    doc: 'Puducherry Act No. 4 of 2017',
    section: 'Schedule-III',
    citation:
      'Puducherry Village and Commune Panchayats (Amendment) Act, 2017 (Act No. 4 of 2017), Schedule-III; Finance Dept. G.O.Ms. No. 24/F3/2017',
    url: 'https://finance.py.gov.in/sites/default/files/proftaxgo04jul17.pdf',
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/professionalTax.ts',
  },
  {
    id: 'pt-other',
    doc: '',
    section: '',
    citation: '',
    note: true,
    status: 'awaiting-ca',
    checked: '2026-10-24',
    where: 'src/engine/professionalTax.ts',
  },

  // ── Gratuity ─────────────────────────────────────────────────────────────
  {
    id: 'gratuity-eligibility',
    doc: 'Code on Social Security, 2020',
    section: 's.53(1), s.54(B)(a)',
    citation:
      'Code on Social Security, 2020 (Act 36 of 2020) s.53(1), s.54(B)(a) and its Explanation, First Schedule item V; in force from 21 Nov 2025 (S.O. 5319(E))',
    url: SS_CODE,
    status: 'verified',
    checked: '2026-09-27',
    where: 'src/engine/gratuity.ts',
  },
  {
    id: 'gratuity-amount',
    doc: 'Code on Social Security, 2020',
    section: 's.53(2)',
    citation: 'Code on Social Security, 2020 (Act 36 of 2020) s.53(2) and Explanation 3',
    url: SS_CODE,
    status: 'verified',
    checked: '2026-09-27',
    where: 'src/engine/gratuity.ts',
  },
  {
    // "the 4-years-plus reading of it is the courts', not cited in the section itself"
    id: 'gratuity-four-years-plus',
    doc: 'Code on Social Security, 2020',
    section: 's.54',
    citation: 'Code on Social Security, 2020 s.54(B)(a)',
    note: true,
    status: 'awaiting-lawyer',
    checked: '2026-09-27',
    where: 'src/engine/gratuity.ts; docs/DECISIONS.md 2026-09-27',
  },
  {
    id: 'gratuity-wages',
    doc: 'Code on Social Security, 2020',
    section: 's.2(88)',
    citation: 'Code on Social Security, 2020 s.2(88)',
    url: SS_CODE,
    note: true,
    status: 'awaiting-ca',
    checked: '2026-09-27',
    where: 'src/engine/gratuity.ts',
  },
  {
    id: 'gratuity-cap',
    doc: 'Code on Social Security, 2020',
    section: 's.53(3)',
    citation: 'Code on Social Security, 2020 s.53(3), s.164(2)(a); S.O. 1420(E), 29 March 2018',
    url: SS_CODE,
    note: true,
    status: 'awaiting-ca',
    checked: '2026-10-24',
    where: 'src/engine/gratuity.ts',
  },

  // ── Leave, notice, F&F ───────────────────────────────────────────────────
  {
    id: 'leave-encashment-exempt',
    doc: 'Income-tax Act, 2025',
    section: 's.19(1) Sl. 14',
    citation:
      'Income-tax Act, 2025 s.19(1) Table Sl. No. 14 and s.536(2); CBDT Notification No. 31/2023, S.O. 2276(E), 24 May 2023; CIT v. D.P. Malhotra (Bombay HC, 28 March 1997)',
    url: ITA_2025_PDF,
    status: 'verified',
    checked: '2026-09-28',
    where: 'src/engine/leaveEncash.ts',
  },
  {
    id: 'leave-daily-rate',
    doc: '',
    section: '',
    citation: '',
    note: true,
    status: 'convention',
    checked: '2026-09-28',
    where: 'src/engine/leaveEncash.ts; src/tools/leave-encashment',
  },
  {
    id: 'notice-buyout-divisor',
    doc: '',
    section: '',
    citation: 'Code on Wages, 2019 s.20(2) proviso',
    note: true,
    status: 'convention',
    checked: '2026-10-24',
    where: 'src/engine/noticeBuyout.ts',
  },
  {
    id: 'unpaid-leave-divisor',
    doc: '',
    section: '',
    citation: 'Code on Wages, 2019 s.20(2), s.18(3)',
    url: 'https://www.labour.gov.in/static/uploads/2025/06/c328da14bbb15fc4ad571dc33e7a4ab3.pdf',
    note: true,
    status: 'convention',
    checked: '2026-10-24',
    where: 'src/engine/fnf.ts',
  },
  {
    id: 'last-working-day',
    doc: '',
    section: '',
    citation: 'General Clauses Act, 1897 s.9; Haru Das Gupta v. State of West Bengal, AIR 1972 SC 1293',
    note: true,
    status: 'convention',
    checked: '2026-10-24',
    where: 'src/engine/dates.ts',
  },

  // ── Bonus, ESOP, Form 16, PF, declarations ───────────────────────────────
  {
    id: 'clawback-gross',
    doc: '',
    section: '',
    citation: 'Income-tax Act, 2025 s.18(1)(b)(i)',
    note: true,
    status: 'convention',
    checked: '2026-10-24',
    where: 'src/engine/clawback.ts',
  },
  {
    id: 'clawback-later-year',
    doc: 'Income-tax Act, 2025',
    section: 's.392(5)(c)',
    citation: 'Income-tax Act, 2025 s.392(5)(c)',
    note: true,
    status: 'awaiting-ca',
    checked: '2026-10-24',
    where: 'src/engine/clawback.ts',
  },
  {
    id: 'esop-perquisite',
    doc: 'Income-tax Act, 2025',
    section: 's.17(1)(d), s.17(4)(h)',
    citation: 'Income-tax Act, 2025 (No. 30 of 2025) as enacted, Gazette of India 21 Aug 2025, s.17(1)(d), s.17(4)(h)',
    url: ITA_2025_ICAI,
    note: true,
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/esop.ts',
  },
  {
    id: 'esop-fmv-rule-15',
    doc: 'Income-tax Rules, 2026',
    section: 'Rule 15',
    citation: 'Income-tax Rules, 2026 (G.S.R. 198(E)) Rule 15',
    url: IT_RULES_2026,
    status: 'verified',
    checked: '2026-09-27',
    where: 'src/engine/esop.ts',
  },
  {
    id: 'form16-combined',
    doc: '',
    section: '',
    citation: '',
    note: true,
    status: 'awaiting-ca',
    checked: '2026-10-24',
    where: 'src/engine/form16.ts',
  },
  {
    id: 'advance-tax-interest',
    doc: 'Income-tax Act, 2025',
    section: 's.424, s.425',
    citation: 'Income-tax Act, 2025 s.424, s.425',
    url: ITA_2025_ICAI,
    note: true,
    status: 'awaiting-ca',
    checked: '2026-10-24',
    where: 'src/engine/form16.ts',
  },
  {
    id: 'epf-five-years',
    doc: 'Income-tax Act, 2025',
    section: 'Sch. XI Pt A para 8',
    citation: 'Income-tax Act, 2025 (No. 30 of 2025) as enacted, Schedule XI Part A paras 8, 9, 10',
    url: ITA_2025_ICAI,
    note: true,
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/epf.ts',
  },
  {
    id: 'epf-tds',
    doc: 'Income-tax Act, 2025',
    section: 's.392(7), s.397(2)(b)(i)',
    citation: 'Income-tax Act, 2025 (No. 30 of 2025) as enacted, s.392(7), s.397(2)(b)(i)',
    url: ITA_2025_ICAI,
    note: true,
    status: 'verified',
    checked: '2026-10-24',
    where: 'src/engine/epf.ts',
  },
  {
    id: 'epf-interest-after-exit',
    doc: '',
    section: '',
    citation: '',
    note: true,
    status: 'awaiting-ca',
    checked: '2026-10-24',
    where: 'src/engine/epf.ts',
  },
  {
    id: 'declaration-rule-205',
    doc: 'Income-tax Rules, 2026',
    section: 'Rule 205',
    citation: 'Income-tax Rules, 2026 (G.S.R. 198(E)) Rule 205 / Form No. 124, under s.392(5)(b) of the Income-tax Act, 2025',
    url: IT_RULES_2026,
    status: 'verified',
    checked: '2026-09-27',
    where: 'src/engine/taxDeclaration.ts',
  },
]

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]))

export function sourceById(id: string): SourceEntry | undefined {
  return BY_ID.get(id)
}

/** The rules every tool built on the Decoder's tax engine stands on. */
const TAX = ['ita-salary-deductions', 'ita-deduction-cap', 'ita-rebate', 'ita-new-regime', 'tax-slabs'] as const
const OFFER = [...TAX, 'hra-rule-279', 'epf-wage-ceiling', 'gratuity-accrual'] as const
const GRATUITY = ['gratuity-eligibility', 'gratuity-four-years-plus', 'gratuity-amount', 'gratuity-wages', 'gratuity-cap'] as const

/**
 * The receipt each tool shows under its verdict. Every tool marked
 * `statutory: true` in `src/data/tools.ts` must be here (a test checks it).
 * Professional tax is added per state at render time: `ptSourceId`.
 */
export const TOOL_SOURCES = {
  decoder: OFFER,
  'offer-comparison': OFFER,
  'real-hike': OFFER,
  'variable-reality': OFFER,
  'bonus-clawback': [...TAX, 'clawback-gross', 'clawback-later-year'],
  'esop-reality': ['esop-perquisite', 'esop-fmv-rule-15', ...TAX],
  relocation: ['hra-rule-279', ...TAX],
  gratuity: GRATUITY,
  'leave-encashment': ['leave-encashment-exempt', 'leave-daily-rate'],
  'fnf-checker': [...GRATUITY, 'leave-encashment-exempt', 'notice-buyout-divisor', 'unpaid-leave-divisor'],
  'form16-shock': [...TAX, 'form16-combined', 'advance-tax-interest'],
  'epf-transfer': ['epf-five-years', 'epf-tds', 'epf-interest-after-exit'],
  'tax-declaration': [...TAX, 'hra-rule-279', 'declaration-rule-205'],
  // Not statutory tools, but each prints a date that rests on a convention.
  'resignation-letter': ['last-working-day'],
  'notice-tracker': ['last-working-day'],
  'notice-buyout': ['notice-buyout-divisor'],
} as const satisfies Record<string, readonly string[]>

/** The professional-tax entry for a state: its own when verified, otherwise the open one. */
export function ptSourceId(state: StateCode): string {
  return BY_ID.has(`pt-${state}`) ? `pt-${state}` : 'pt-other'
}

/** Oldest and newest `checked` dates among verified entries: the footer chip. */
export function verifiedRange(): { from: string; to: string } {
  const dates = SOURCES.filter((s) => s.status === 'verified')
    .map((s) => s.checked)
    .sort()
  return { from: dates[0]!, to: dates[dates.length - 1]! }
}

/**
 * Corrections, newest first: numbers and citations the site once showed wrong,
 * and when they were fixed. Each comes from a `docs/DECISIONS.md` entry or a
 * dated commit; the text is `corrections.<id>` in the dictionaries.
 */
export const CORRECTIONS: readonly { id: string; date: string }[] = [
  { id: 'pt-tn-od', date: '2026-10-24' },
  { id: 'pt-as-py', date: '2026-10-24' },
  { id: 'form16-interest', date: '2026-10-24' },
  { id: 'sicpa', date: '2026-10-24' },
  { id: 'hra-city', date: '2026-10-24' },
  { id: 'leave-resignation', date: '2026-09-28' },
  { id: 'pt-ka', date: '2026-09-28' },
  { id: 'gratuity-code', date: '2026-09-27' },
  { id: 'gratuity-working-days', date: '2026-09-27' },
  { id: 'hra-eight-cities', date: '2026-09-27' },
  { id: 'epf-ceiling', date: '2026-09-27' },
  { id: 'rebate-156', date: '2026-08-23' },
]

