import type { StateCode } from './types'

/**
 * Annual professional tax for a salaried employee at each state's published
 * top slab. Most CTC-decoder users are in that slab, but not all: Puducherry's
 * top class starts above ₹5,00,000 of half-yearly income and Bihar's above
 * ₹10,00,000 a year, so a lower earner there pays less than this table shows.
 * Not independently primary-sourced except where marked VERIFIED below. A few
 * states have month-specific quirks (MH charges ₹300 in February) folded into
 * the annual figure.
 *
 * Tamil Nadu and Kerala are local-body levies: each municipality or
 * corporation sets its own half-yearly rates (Tamil Nadu: Tamil Nadu Urban
 * Local Bodies Act, 1998 s.117-C; rates "received and published by the
 * executive authority once in every five years",
 * https://tnurbanepay.tn.gov.in/ProfessionalTax.pdf). Odisha's levy
 * was a state tax, and it was repealed from 1 April 2026 (see below).
 *
 * Art. 276(2) of the Constitution caps the total at ₹2,500 per annum per
 * person to the State or to any one local authority.
 *
 * Punjab's levy is State Development Tax under the Punjab State Development
 * Tax Act, 2018 — not "professional tax": ₹200/month (₹2,400/year) at the top
 * slab for salaried employees.
 * VERIFIED: 2026-08-23 | Source: Punjab State Development Tax Act, 2018 (official reading per master plan §4/D12) | FY: 2026-27
 *
 * Karnataka's Schedule Sl. No. 1 was substituted effective 1 April 2025:
 * ₹200/month except February, ₹300 in February, for salary >= ₹25,000/month
 * = ₹2,500/year (200×11 + 300).
 * VERIFIED: 2026-09-28 | Source: Karnataka Tax on Profession, Trades, Callings
 * and Employments (Amendment) Act, 2025 (Karnataka Act No. 33 of 2025), Schedule
 * Sl. No. 1, https://dpal.karnataka.gov.in/uploads/media_to_upload1751017993.pdf | FY: 2026-27
 *
 * Tamil Nadu ₹2,500 is Chennai's: half-yearly gross income ₹75,001 and above
 * pays ₹1,250 per half-year (unchanged from 01.04.2018 through the II/2024-25
 * revision). Other Tamil Nadu municipalities set their own rates. The old
 * ₹2,190 (₹1,095 × 2) predates 2018.
 * VERIFIED: 2026-10-24 | Source: Greater Chennai Corporation, Revenue Dept.,
 * Press Release R.D. PT C.No/3555/2026 dated 04.08.2026, slab table S.No. 6,
 * https://chennaicorporation.gov.in/gcc/pdf/PT_Press_Release.pdf | FY: 2026-27
 *
 * Odisha: no professional tax from 1 April 2026. The Odisha State Tax on
 * Professions, Trades, Callings and Employments Act, 2000 is "hereby repealed"
 * with effect from 1st April, 2026; tax due up to 31 March 2026 is saved
 * (s.2(2)). A Repeal Bill to replace the Ordinance was introduced on
 * 22 Sep 2026. (Was ₹2,500: 200×11 + 300, the Act's old top slab.)
 * VERIFIED: 2026-11-28 | Source: Odisha Ordinance 02 of 2026, Odisha Gazette
 * Extraordinary No. 1496, 21 April 2026, Law Dept. Notification
 * No. 5969-I-Legis-22/2026/L (read from a reproduction of the Gazette page;
 * listed at https://finance.odisha.gov.in/en/notification/tax-profession) | FY: 2026-27
 *
 * Madhya Pradesh: annual income above ₹4,00,000 pays "Rupees 2500 (Rupees 208
 * per month for eleven months and rupees 212 for twelfth month)".
 * VERIFIED: 2026-11-28 | Source: MP Vritti Kar Adhiniyam, 1995 Schedule as
 * substituted by MP Act 20 of 2018 (MP Gazette 18 Jul 2018, w.e.f. 1 Apr 2018),
 * https://prsindia.org/files/bills_acts/acts_states/madhya-pradesh/1995/1995MP16.pdf | FY: 2026-27
 *
 * Bihar: "Persons whose income exceeds ten lac rupees per annum. Two thousand
 * and five hundred rupees per annum" (lower slabs ₹1,000 and ₹2,000).
 * VERIFIED: 2026-11-28 | Source: Bihar Tax on Professions, Trades, Callings and
 * Employments Act, 2011, Schedule entry 3, https://indiankanoon.org/doc/89342742/ | FY: 2026-27
 *
 * Sikkim: monthly salary "Rs.40001 and more: Rs.200 per month" = ₹2,400/year.
 * VERIFIED: 2026-11-28 | Source: Sikkim Tax on Professions, Trades, Callings and
 * Employments Act, 2006 (Act 5 of 2006), Schedule entry 1(iv), as enacted;
 * later schedule amendments not seen,
 * https://prsindia.org/files/bills_acts/acts_states/sikkim/2006/2006SK5.pdf | FY: 2026-27
 *
 * Telangana: monthly salary "Above 20,000" pays ₹200 per month = ₹2,400/year.
 * VERIFIED: 2026-10-24 | Source: Telangana Commercial Taxes Dept., Telangana
 * Tax on Professions, Trades, Callings and Employments Act, 1987, First
 * Schedule entry 1(iii) (as amended up to date),
 * https://www.tgct.gov.in/tgportal/AllActs/APPT/APPTSchedule.aspx | FY: 2026-27
 *
 * Assam: monthly salary "Rs.25,000/- and more" pays ₹208 per month
 * = ₹2,496/year (schedule with effect from 15-10-2014).
 * VERIFIED: 2026-10-24 | Source: Assam Taxation Dept., Rate of tax on the Assam
 * Professions, Trades, Callings and Employments Taxation Act, 1947, Sl. No. 1(iv),
 * https://tax.assam.gov.in/AssamTimsInfo/GST/FORMATS/PROFESSION_TAX-Schedule.pdf | FY: 2026-27
 *
 * Puducherry: Class VI, half-yearly income ₹5,00,001 and above, pays ₹1,250
 * per half-year = ₹2,500/year (municipalities and panchayats alike).
 * VERIFIED: 2026-10-24 | Source: Puducherry Village and Commune Panchayats
 * (Amendment) Act, 2017 (Act No. 4 of 2017), Schedule-III, Gazette of
 * Puducherry Extraordinary Part II No. 25, 11-5-2017,
 * https://styandptg.py.gov.in/2017/May/EXTRAORDINARYPART-II/1/25-PART-II%20No%2025%20dated%2011-5-2017.pdf ;
 * same table for municipalities per Finance Dept. G.O.Ms. No. 24/F3/2017
 * dt. 04.07.2017, https://finance.py.gov.in/sites/default/files/proftaxgo04jul17.pdf | FY: 2026-27
 *
 * Not yet primary-verified (2026-11-28 check; official portals unreachable):
 * - GJ ₹2,400: Surat Municipal Corporation's official FAQ says salary above
 *   ₹12,000/month pays ₹200/month, citing the State notification of
 *   01/04/2022 (https://www.suratmunicipal.gov.in/FAQs/ProfessionTax). The
 *   notification itself was not read.
 * - MH ₹2,500: MahaGST's rate schedule (as on 31.03.2025) could not be opened
 *   from here; only a search-index excerpt of it was seen.
 * - AP, WB, KL: official schedules unreachable from here. Unchanged.
 * - JH, CG, ML, TR: no official schedule reached; shown as ₹0, approximate.
 * - DL, HR, UP, RJ ₹0: no state professional-tax Act was found. Absence was
 *   not proven from a primary list.
 *
 * Codes in `PT_AMOUNT_UNVERIFIED` levy PT but have no primary-sourced amount
 * in this table — they are 0 and must be labelled approximate.
 */
export const PROFESSIONAL_TAX_CEILING = 2_500

export const PT_AMOUNT_UNVERIFIED: readonly StateCode[] = [
  'JH',
  'CG',
  'ML',
  'TR',
  'other',
]

export const PROFESSIONAL_TAX_ANNUAL: Record<StateCode, number> = {
  KA: 2_500,
  MH: 2_500,
  TN: 2_500, // Chennai (GCC) — see header note; other TN local bodies vary.
  TG: 2_400, // VERIFIED 2026-10-24 — see header note.
  AP: 2_400,
  WB: 2_400,
  GJ: 2_400,
  MP: 2_500, // VERIFIED 2026-11-28 — 208×11 + 212; see header note.
  KL: 2_500,
  OD: 0, // VERIFIED 2026-11-28 — repealed from 1 Apr 2026; see header note.
  DL: 0, // no professional tax
  HR: 0,
  UP: 0,
  RJ: 0,
  PB: 2_400, // Punjab State Development Tax Act, 2018 — see header note.
  BR: 2_500, // VERIFIED 2026-11-28 — income above ₹10 lakh; see header note.
  AS: 2_496, // VERIFIED 2026-10-24 — 208×12; see header note.
  JH: 0,
  CG: 0,
  SK: 2_400, // VERIFIED 2026-11-28 — 200×12; see header note.
  ML: 0,
  TR: 0,
  PY: 2_500, // VERIFIED 2026-10-24 — 1,250 per half-year; see header note.
  other: 0,
}

export const STATE_NAMES: Record<StateCode, string> = {
  KA: 'Karnataka',
  MH: 'Maharashtra',
  TN: 'Tamil Nadu',
  TG: 'Telangana',
  AP: 'Andhra Pradesh',
  WB: 'West Bengal',
  GJ: 'Gujarat',
  MP: 'Madhya Pradesh',
  KL: 'Kerala',
  OD: 'Odisha',
  DL: 'Delhi',
  HR: 'Haryana',
  UP: 'Uttar Pradesh',
  RJ: 'Rajasthan',
  PB: 'Punjab',
  BR: 'Bihar',
  AS: 'Assam',
  JH: 'Jharkhand',
  CG: 'Chhattisgarh',
  SK: 'Sikkim',
  ML: 'Meghalaya',
  TR: 'Tripura',
  PY: 'Puducherry',
  other: 'Other / not sure',
}
