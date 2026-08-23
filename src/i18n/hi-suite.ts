/**
 * Hindi strings for the tool suite (offer-comparison, real-hike, variable-reality,
 * bonus-clawback, esop-reality, relocation, fake-offer, notice-buyout, gratuity,
 * leave-encashment, fnf-checker, form16-shock, resignation-letter, manager-script,
 * hr templates, counter-offer, handover-doc, relieving-chaser, epf-transfer,
 * bgv-prep, insurance-gap, tax-declaration, notice-tracker, bond-scanner,
 * redactor, clause-library, and state names).
 *
 * Register: professional Indian-workplace Hindi, not shuddh-Hindi purism —
 * domain terms (CTC, PF, HRA, ESOP, notice period, in-hand, variable, regime,
 * bond, offer, LPA, Form 13, Form 16, Form 12B, UAN, EPFO, MCA, F&F, BGV, PAN,
 * Aadhaar, TDS, FMV, cliff, vest, metro, decoder, tracker, Stealth, etc.) stay
 * in English/Latin script exactly as Indian professionals say them; the
 * surrounding sentence is Devanagari.
 */
export const hiSuite: Record<string, string> = {
  // ---- Nav / app shell / common ----
  'nav.search': 'टूल खोजें',
  'nav.searchHint': 'टाइप करें और jump करें। Esc से बंद होगा।',
  'nav.searchEmpty': 'कोई tool match नहीं हुआ।',
  'app.stealth': 'Stealth',
  'app.stealthHint': 'दिखने में notes जैसा। Tools वही हैं।',
  'app.stealthTitle': 'Notes',
  'ui.copyText': 'कॉपी करें',

  // ---- Offer comparison ----
  'offer-comparison.title': 'Offer तुलना',
  'offer-comparison.desc': 'दो या तीन offers, side by side — in-hand देखें, headline CTC नहीं।',
  'offer-comparison.offer': 'Offer {label}',
  'offer-comparison.addThird': 'तीसरा offer जोड़ें',
  'offer-comparison.removeThird': 'Offer C हटाएं',
  'offer-comparison.delta': 'Side by side',
  'offer-comparison.row.ctc': 'बताया गया CTC',
  'offer-comparison.row.inHand': 'In-hand / महीना',
  'offer-comparison.row.ratio': 'In-hand / CTC',
  'offer-comparison.row.variable': 'CTC में Variable',
  'offer-comparison.verdict.tie': 'Paper ESOP हटाकर देखें तो in-hand लगभग बराबर है।',
  'offer-comparison.verdict.win': '{label} offer का in-hand ज़्यादा आता है: {amount}/month।',
  'offer-comparison.exampleChip': 'उदाहरण',
  'offer-comparison.exampleNote': 'यह एक worked example है — अभी कुछ भी check नहीं हुआ है। अपने offers compare करने के लिए कोई भी field edit करें।',
  'offer-comparison.copyTitle': 'Offer तुलना — Switch Karle',
  'offer-comparison.perMonth': 'महीना',
  'offer-comparison.copyLine': 'Summary copy करें',
  'offer-comparison.esopPolicy':
    'हर तरफ paper ESOP को zero माना गया है ताकि एक grant verdict न बदल दे। Liquidity अलग बात है।',
  'offer-comparison.flag.gratuity': 'सिर्फ एक तरफ Gratuity CTC के अंदर है — यह headline बढ़ाता है, bank नहीं।',
  'offer-comparison.flag.pf': 'सिर्फ एक तरफ Employer PF CTC के अंदर है। एक जैसी चीज़ों को compare करें।',
  'offer-comparison.flag.ceiling': 'एक offer में PF पूरे basic पर है, दूसरे में wage ceiling पर।',

  // ---- Real hike ----
  'real-hike.title': 'असली Hike',
  'real-hike.desc': 'CTC में उछाल बनाम हर महीने bank में असल में क्या पहुंचता है।',
  'real-hike.formTitle': 'यह job → अगली job',
  'real-hike.currentCtc': 'मौजूदा CTC',
  'real-hike.currentVariable': 'मौजूदा variable',
  'real-hike.currentState': 'मौजूदा राज्य',
  'real-hike.nextCtc': 'नया CTC',
  'real-hike.nextVariable': 'नया variable',
  'real-hike.nextState': 'नया राज्य',
  'real-hike.haircut': 'मानें कि variable 70% pay होगा',
  'real-hike.haircutHint': 'Average-year haircut। Off करने पर quoted variable को पक्का मान लिया जाता है।',
  'real-hike.verdict': 'कागज़ पर {paper}%, आपके bank में {bank}%।',
  'real-hike.row.paper': 'बताया गया CTC',
  'real-hike.row.bank': 'Monthly run-rate',
  'real-hike.bonusNote': 'Joining bonus एक बार मिलने वाला है — यह इस run-rate में शामिल नहीं है।',
  'real-hike.regimeFlip': 'इन दो jobs के बीच सस्ता tax regime बदल जाता है। यह in-hand नंबर में शामिल है।',
  'real-hike.haircutNote':
    'Variable को tax के बाद 70% पर गिना गया है, quoted figure पर नहीं, फिर 12 महीनों में spread किया गया है।',

  // ---- Variable reality ----
  'variable-reality.title': 'Variable की असलियत',
  'variable-reality.desc': 'अगर variable 0, 50 या 100% pay हो तो आपका monthly in-hand कैसा दिखेगा।',
  'variable-reality.formTitle': 'जोखिम वाला हिस्सा',
  'variable-reality.months': 'इस FY में payroll पर महीने',
  'variable-reality.monthsHint':
    'पहला साल अक्सर pro-rate होता है। 12 = पूरा साल। इस हिस्से पर tax फिर भी full-year CTC पर लगता है, जैसे यह job पूरे साल चली हो।',
  'variable-reality.verdict':
    'CTC का {pct}% जोखिम में है। Fixed in-hand {fixed}/mo है; 100% payout {full}/mo तक जाता है।',
  'variable-reality.table': 'अगर variable इतना pay करे',
  'variable-reality.row': '{pct}% payout, monthly spread',
  'variable-reality.split': 'Fixed {fixed} · इस साल जोखिम में {risk}',
  'variable-reality.withheld':
    'अगर यह एक साथ मिले, तो tax के बाद आपके पास {amount} रहता है — तब तक monthly in-hand 0% वाले figure पर ही रहता है।',
  'variable-reality.spread': 'अगर payroll इसे spread करे, तो 100% वाली row {amount}/mo है।',
  'variable-reality.prorate':
    'First-year pro-rate on है: इस FY के सिर्फ {months} महीने, इसलिए जोखिम वाला हिस्सा भी कम हो जाता है। उस हिस्से पर tax फिर भी full-year taxable income पर calculate होता है (पिछले employer की income अक्सर बाकी साल भर देती है)।',
  'variable-reality.fullYearTax': 'Variable pro-rated होने पर भी, tax का base आपका full-year CTC ही रहता है।',

  // ---- Bonus clawback ----
  'bonus-clawback.title': 'Bonus Clawback',
  'bonus-clawback.desc': 'Joining bonus आपको net में मिला था। जल्दी छोड़ने पर आमतौर पर gross चुकाना पड़ता है।',
  'bonus-clawback.formTitle': 'Clawback की अवधि',
  'bonus-clawback.amount': 'Joining bonus (gross)',
  'bonus-clawback.window': 'इतना रुकना ज़रूरी',
  'bonus-clawback.tenure': 'आप छोड़ने की योजना बना रहे हैं',
  'bonus-clawback.notice': 'Notice period',
  'bonus-clawback.netMode': 'Net-vs-gross trap दिखाएं',
  'bonus-clawback.netModeHint': 'On: आपको net मिला था, आप gross चुकाते हैं। Off: सिर्फ headline gross।',
  'bonus-clawback.verdict.net': 'Tax के बाद आपके पास {net} रहता है। अभी छोड़ने पर {repay} चुकाना होगा — असली value {keep}।',
  'bonus-clawback.verdict.gross': 'Gross bonus {gross}। Window के अंदर छोड़ने पर letter {repay} वापस मांगती है।',
  'bonus-clawback.tax': 'Bonus पर tax (यह income): {amount}',
  'bonus-clawback.marginal': 'इस bonus पर effective tax लगभग {pct}% है (cess सहित)।',
  'bonus-clawback.noticeOverlap':
    'आज से पूरा notice serve करने पर आपका last working day clawback window के बाद पड़ सकता है। Buyout tenure छोटा कर देता है और exit को window के अंदर ला सकता है। कुछ letters resignation date से गिनते हैं, last working day से नहीं।',
  'bonus-clawback.taxRecovery':
    'Bonus repay करने पर पहले चुकाया tax वापस मिलेगा या नहीं, यह fact-specific है (same-year revised Form 16 सबसे साफ रास्ता है)। यह legal advice नहीं है।',
  'bonus-clawback.allOrNothing':
    'यह curve all-or-nothing है। कुछ भारतीय letters repayment को unserved महीनों के हिसाब से pro-rate करती हैं।',
  'bonus-clawback.curve': 'अगर आप इस समय exit करें',
  'bonus-clawback.point': 'महीना {month}',
  'bonus-clawback.repay': 'चुकाना है',
  'bonus-clawback.keep': 'रखना है',

  // ---- ESOP reality ----
  'esop-reality.title': 'ESOP की असलियत',
  'esop-reality.desc': 'Exercise पर perquisite tax, vest schedule, और यह paper असल में liquid है या नहीं।',
  'esop-reality.formTitle': 'The Grant',
  'esop-reality.shares': 'Shares',
  'esop-reality.strike': 'Strike price',
  'esop-reality.fmv': 'Exercise पर FMV',
  'esop-reality.fmvHint':
    'Unlisted shares के लिए, Form 16 company की Rule 3 valuation इस्तेमाल करता है, आखिरी funding round नहीं। Eligible-startup TDS deferral यहां model नहीं किया गया है।',
  'esop-reality.perShare': 'Per share',
  'esop-reality.cliff': 'Cliff',
  'esop-reality.vest': 'पूरी तरह vest होगी',
  'esop-reality.liquid': 'Listed है / liquidity event हो चुका है',
  'esop-reality.liquidHint': 'Private-company का paper cash नहीं है जब तक कोई इसे खरीदे नहीं।',
  'esop-reality.verdict':
    'Exercise करने में {cost} plus लगभग {tax} tax लगता है — कुछ भी बेचने से पहले उस दिन {cash} cash में चाहिए। Perquisite {perq}।',
  'esop-reality.underwater': 'Strike FMV से ऊपर है — perquisite ₹0 है। Exercise करने में फिर भी {cost} cash लगेगा।',
  'esop-reality.vestLinear':
    'Vest को monthly model किया गया है (shares × month / vest period)। Annual-vest वाले letters अगली anniversary तक 0 पर रहते हैं।',
  'esop-reality.saleNote': 'Sale एक अलग capital-gains event है। यह tool exercise तक ही जाता है।',
  'esop-reality.vestTitle': 'Vest Schedule',
  'esop-reality.vestRow': 'महीना {month}',
  'esop-reality.cliffed': 'अभी cliff में — zero vested',
  'esop-reality.vested': '{n} vested',
  'esop-reality.illiquid':
    'यह private-company का paper है। Exit के बाद exercise window छोटी होती है, और buyer मिलना ज़रूरी नहीं।',
  'esop-reality.provisional': 'Provisional है, perquisite rule पर chartered accountant की review बाकी है। यह tax advice नहीं है।',

  // ---- Relocation ----
  'relocation.title': 'Relocation',
  'relocation.desc':
    'शहर बदलने पर same CTC पर in-hand में असल में क्या बदलता है — professional tax और HRA, कोई नकली cost-of-living index नहीं।',
  'relocation.formTitle': 'वही salary, नया शहर',
  'relocation.fromState': 'किस राज्य से',
  'relocation.fromMetro': 'HRA के लिए metro से',
  'relocation.toState': 'किस राज्य में',
  'relocation.toMetro': 'HRA के लिए metro में',
  'relocation.metroHint': 'Delhi, Mumbai, Kolkata, Chennai — basic का 50%। बाकी कहीं भी 40%। सिर्फ old regime में।',
  'relocation.rent': 'आप जो rent देते हैं / महीना',
  'relocation.fromRent': 'यहां rent / महीना',
  'relocation.toRent': 'वहां rent / महीना',
  'relocation.rentHint':
    'HRA exemption के लिए असल rent चाहिए। 0 = कोई exemption नहीं। ₹1 lakh/साल से ऊपर rent पर employer आमतौर पर landlord का PAN मांगता है।',
  'relocation.metroWarn':
    '{state} में HRA metro city नहीं है (सिर्फ Delhi, Mumbai, Kolkata, Chennai qualify करते हैं)। आपने जो 50% वाला limb on किया है, वह वहां apply नहीं होगा।',
  'relocation.ptApprox':
    'Professional tax approximate है। Bihar, Assam और अन्य नए listed states dropdown में ₹0 पर हैं जब तक primary schedule नहीं मिलता। Punjab में State Development Tax (₹2,400) लगता है। "Other" भी ₹0 है।',
  'relocation.hraNewRegime': 'HRA exemption new-regime tax नहीं बदलता। यह row सिर्फ old-regime comparison के लिए दिखाई गई है।',
  'relocation.verdict.nil': 'In-hand नहीं बदलता। National tax slabs हर राज्य में same हैं।',
  'relocation.verdict.delta': 'Same CTC, move के बाद in-hand {amount}/month {dir}।',
  'relocation.more': 'ज़्यादा',
  'relocation.less': 'कम',
  'relocation.row.inHand': 'In-hand',
  'relocation.row.pt': 'Professional tax',
  'relocation.row.hra': 'HRA exemption (old regime)',
  'relocation.year': 'साल',
  'relocation.slabsNil': 'Income-tax slabs national हैं। शहर बदलने से आपकी slab rate नहीं बदलती।',
  'relocation.noCol': 'यह cost-of-living index नहीं है। Rent वही है जो आप type करते हैं, किसी city का average नहीं।',

  // ---- Fake offer scanner ----
  'fake-offer.title': 'Fake Offer Scanner',
  'fake-offer.desc': 'Deposit की मांग, free-mail recruiters, lookalike domains — plus EPFO और MCA lookup links।',
  'fake-offer.formTitle': 'आपको भेजी गई letter',
  'fake-offer.company': 'Company का नाम',
  'fake-offer.email': 'Recruiter का email या domain',
  'fake-offer.emailHint': 'पूरा address paste करें अगर है — हम सिर्फ domain रखते हैं।',
  'fake-offer.text': 'Offer text',
  'fake-offer.textHint': 'Email या letter paste करें। यह कभी इस device से बाहर नहीं जाता।',
  'fake-offer.verdict.red': '{n} hard stop। Sender verify होने तक payment न करें और documents share न करें।',
  'fake-offer.verdict.amber':
    'कुछ ठीक नहीं लगता — अक्सर free-mail recruiter या lookalike domain होता है। Reply करने या documents share करने से पहले verify करें।',
  'fake-offer.verdict.blank': 'अभी कुछ भी check नहीं हुआ। ऊपर offer email या letter का text paste करें।',
  'fake-offer.verdict.clean': 'Text में deposit की मांग नहीं मिली। Clean text verification नहीं है — भरोसा करने से पहले sender और company खुद confirm करें।',
  'fake-offer.verify': 'Verify करें:',

  // ---- Notice buyout ----
  'notice-buyout.title': 'Notice Buyout',
  'notice-buyout.desc': 'Notice पूरा serve किए बिना छोड़ने में क्या cost लगती है — या F&F से वे कितना recover करते हैं।',
  'notice-buyout.formTitle': 'Unserved Notice',
  'notice-buyout.basis': 'Letter इस्तेमाल करती है',
  'notice-buyout.basis.basic': 'Basic प्रति महीना',
  'notice-buyout.basis.gross': 'Gross प्रति महीना',
  'notice-buyout.mode': 'कौन pay करता है',
  'notice-buyout.mode.pay': 'जल्दी छोड़ने के लिए payment मुझे करना है',
  'notice-buyout.mode.recover': 'वे मेरे F&F से recover करते हैं',
  'notice-buyout.days': 'Unserved दिन',
  'notice-buyout.basic': 'Monthly basic',
  'notice-buyout.gross': 'Monthly gross',
  'notice-buyout.verdict.pay': 'बाकी notice buyout करने में लगभग {amount} लगेगा। यह letter तय करती है, कोई कानून नहीं।',
  'notice-buyout.verdict.recover':
    'वे unserved notice के लिए F&F से लगभग {amount} recover करने की कोशिश कर सकते हैं। Appointment letter check करें।',
  'notice-buyout.divisor':
    'ज़्यादातर letters monthly figure को 30 से divide करती हैं, 26 से नहीं और actual calendar month से भी नहीं। यह contractual practice है, कानून नहीं।',

  // ---- Gratuity ----
  'gratuity.title': 'Gratuity',
  'gratuity.desc': 'आप eligible हैं या नहीं, कितना मिलेगा, और कौन सी date आपको line के पार ले जाती है।',
  'gratuity.formTitle': 'Last Drawn Basic + DA',
  'gratuity.basic': 'Monthly basic + DA',
  'gratuity.basicHint': 'Last drawn, CTC नहीं। Dearness allowance गिना जाता है; HRA नहीं।',
  'gratuity.join': 'Join date',
  'gratuity.exit': 'Last working day',
  'gratuity.covered': 'Establishment में 10+ employees हैं',
  'gratuity.coveredHint': 'Payment of Gratuity Act तभी apply होता है जब establishment covered हो। हम पूछते हैं; मानकर नहीं चलते।',
  'gratuity.week5.label': '5-day work week (शनि–रवि बंद)',
  'gratuity.week5.hint': '5-day establishment में पांचवें साल के 4 साल + 190 दिन पर qualify होते हैं; 6-day वाले को 240 दिन चाहिए।',
  'gratuity.verdict.yes': '{years} completed years की service के बाद eligible। Estimate {amount} (15/26 × last drawn × payable years)।',
  'gratuity.verdict.no': 'अभी तक {years} completed years — 5-year / 4-years-plus-190-or-240-day rule के तहत अभी eligible नहीं।',
  'gratuity.flip': 'यह picture बदलने वाली अगली date: {date}।',

  // ---- Leave encashment ----
  'leave-encashment.title': 'Leave Encashment',
  'leave-encashment.desc': 'Resignation पर leave encashment आमतौर पर पूरी तरह salary की तरह taxable होता है।',
  'leave-encashment.formTitle': 'Encash करने का balance',
  'leave-encashment.days': 'Leave दिन',
  'leave-encashment.basic': 'Monthly basic',
  'leave-encashment.basis': 'Daily rate',
  'leave-encashment.basis.26': '÷ 26 (working-day convention)',
  'leave-encashment.basis.30': '÷ 30 (calendar-month convention)',
  'leave-encashment.reason': 'आप क्यों छोड़ रहे हैं',
  'leave-encashment.reason.resign': 'Resignation (switch)',
  'leave-encashment.reason.retire': 'Retirement / superannuation',
  'leave-encashment.verdict.resign':
    '{amount} gross, पूरी तरह salary की तरह taxable — s.10(10AA) की exemption retirement के लिए है, switch के लिए नहीं।',
  'leave-encashment.verdict.retire': '{amount} gross। Retirement exemption मौजूद है; rupee cap तब तक omit किया गया है जब तक कोई CA review न करे।',
  'leave-encashment.gross': 'Gross',
  'leave-encashment.exempt': 'Exempt (यह tool)',
  'leave-encashment.taxable': 'Taxable',
  'leave-encashment.note': 'Provisional है। 26 बनाम 30 पर employer की practice अलग-अलग होती है। Exemption cap यहां बनाई नहीं गई है।',

  // ---- F&F checker ----
  'fnf-checker.title': 'F&F Checker',
  'fnf-checker.desc': 'Full-and-final sheet फिर से calculate करें: unpaid leave, notice recovery, gratuity, और क्या आप उन्हें कुछ owe करते हैं।',
  'fnf-checker.formTitle': 'Sheet जो claim करती है',
  'fnf-checker.join': 'Join date',
  'fnf-checker.lwd': 'Last working day',
  'fnf-checker.basic': 'Monthly basic',
  'fnf-checker.gross': 'Monthly gross (claimed)',
  'fnf-checker.unpaid': 'Unpaid leave दिन',
  'fnf-checker.noticeAmt': 'Notice recovery जो उन्होंने deduct की',
  'fnf-checker.noticeHint': 'अगर उन्होंने unserved notice recover नहीं की तो 0।',
  'fnf-checker.gratuity': 'Gratuity शामिल करें (आपको लगता है कि आप eligible हैं)',
  'fnf-checker.salary': 'F&F में Salary / महीना',
  'fnf-checker.notice': 'Notice recovery',
  'fnf-checker.verdict.pay': 'फिर से calculate किया net आपको payable: {amount}।',
  'fnf-checker.verdict.owe': 'फिर से calculate किया net negative है — आप उन्हें {amount} owe कर सकते हैं।',
  'fnf-checker.audit': 'Claimed बनाम recomputed',

  // ---- Two Form-16 shock ----
  'form16-shock.title': 'दो Form-16 का झटका',
  'form16-shock.desc': 'दोनों employers ने आपको slab benefit दिया। एक return में इन्हें साथ मिलाना पड़ता है।',
  'form16-shock.formTitle': 'इस FY में, दो Form-16s',
  'form16-shock.e1gross': 'Employer 1 taxable gross',
  'form16-shock.e1tds': 'Employer 1 TDS',
  'form16-shock.e2gross': 'Employer 2 taxable gross',
  'form16-shock.e2tds': 'Employer 2 TDS',
  'form16-shock.verdict.owe': 'Combine करने के बाद, लगभग {amount} अभी भी due हो सकता है। महीना 1 में employer 2 को Form 12B दें।',
  'form16-shock.verdict.ok': 'TDS पहले से combined bill cover कर रहा है, इस simplified picture में {amount} की slack है।',
  'form16-shock.taxable': 'Combined taxable (एक standard deduction)',
  'form16-shock.tax': 'अगर यह एक employer होता तो Tax',
  'form16-shock.tds': 'पहले से deduct हुआ TDS',
  'form16-shock.stdNote': 'हर payroll ने probably आपको पूरा standard deduction दिया। Return सिर्फ एक allow करता है।',
  'form16-shock.omit234':
    's.234B/234C का interest तब तक omit किया गया है जब तक कोई CA review न करे — यह tax gap है, penalty model नहीं।',
  'form16-shock.form12bTitle': 'Employer 2 को देने वाला Form 12B text',
  'form16-shock.form12b':
    'इस FY में previous employer: salary/gross {gross}, TDS {tds}। कृपया मेरी बाकी salary पर tax deduct करते समय इस income को ध्यान में रखें (Form 12B)। यह एक helper draft है, statutory form नहीं।',

  // ---- Resignation letter ----
  'resignation-letter.title': 'Resignation Letter',
  'resignation-letter.desc': 'तीन tones। Last working day = resignation date + notice − एक calendar दिन।',
  'resignation-letter.formTitle': 'Letter',
  'resignation-letter.company': 'Company',
  'resignation-letter.manager': 'Manager',
  'resignation-letter.role': 'आपका role',
  'resignation-letter.date': 'Resignation date',
  'resignation-letter.notice': 'Notice period',
  'resignation-letter.join': 'नई join date (optional)',
  'resignation-letter.joinHint': 'सिर्फ warn करने के लिए इस्तेमाल होती है अगर EPFO dates overlap करें। Skip करने के लिए blank छोड़ें।',
  'resignation-letter.tone': 'Tone',
  'resignation-letter.tone.professional': 'Professional',
  'resignation-letter.tone.grateful': 'Grateful',
  'resignation-letter.tone.firm': 'Firm और छोटा',
  'resignation-letter.verdict': 'पूरा notice serve करने पर last working day: {lwd}।',
  'resignation-letter.epfo':
    'आपकी नई join date उस last working day पर या उससे पहले है। EPFO का portal अक्सर overlapping दिनों पर दो employers mark नहीं कर पाता — exit date record कराएं, या join date आगे बढ़ाएं। यह portal का behaviour है, कोई कानून नहीं।',
  'resignation-letter.body.professional':
    'प्रिय {manager},\n\nकृपया इस letter को {company} में {role} के पद से मेरा resignation मानें, दिनांक {date}। Notice serve किया जाएगा। Last working day {lwd} होगा।\n\nएक written handover share किया जाएगा और एक clean transition के लिए उपलब्धता रहेगी। कृपया receipt और relieving process confirm करें।\n\nसादर',
  'resignation-letter.body.grateful':
    'प्रिय {manager},\n\n{company} में {role} के रूप में काम करने का मौका देने के लिए धन्यवाद। यह मेरा resignation है, दिनांक {date}। Notice serve करते हुए, last working day {lwd} है।\n\nभरोसे और काम के लिए आभार है। सब कुछ व्यवस्थित छोड़ा जाएगा और handover लिखकर दिया जाएगा।\n\nधन्यवाद सहित',
  'resignation-letter.body.firm':
    'प्रिय {manager},\n\nयह {company} में {role} से resignation है, {date} से effective। Last working day: {lwd}। कृपया acknowledge करें और F&F / relieving checklist share करें।\n\nRegards',

  // ---- Manager conversation ----
  'manager-script.title': 'Manager से बातचीत',
  'manager-script.desc': 'सामने resign करते समय क्या कहें — supportive manager, counter-offer का risk, या hard room।',
  'manager-script.formTitle': 'जिस room में आप जा रहे हैं',
  'manager-script.preset': 'यह manager आमतौर पर कैसा है',
  'manager-script.preset.supportive': 'Supportive',
  'manager-script.preset.counter-risk': 'Counter करने की संभावना है',
  'manager-script.preset.hostile': 'Hostile / guilt shop',
  'manager-script.verdict.supportive': 'पहले thanks कहें, फिर date बताएं। नई role को ज़्यादा explain न करें।',
  'manager-script.verdict.counter-risk': 'Room में जाने से पहले decide कर लें। अगर फिर भी जाना है, तो एक बार साफ कह दें।',
  'manager-script.verdict.hostile': 'Short रखें, बाद में writing में confirm करें। Room में policy पर बहस न करें।',
  'manager-script.body.supportive':
    'आपको सबसे पहले बताना था। एक और role accept हो गई है। यह कोई surprise-counter वाली बातचीत नहीं है — decision पहले ही हो चुका है। पूरा notice serve करने पर last working day [LWD] होगा। इस हफ्ते handover लिख दिया जाएगा। यहां के काम के लिए आभार है, और अच्छे से जाना है।',
  'manager-script.body.counter-risk':
    'एक और offer accept हो गया है। यह बताया जा रहा है क्योंकि team का respect है, किसी counter की shopping के लिए नहीं। Company कोई counter देना चाहे तो एक बार, writing में सुना जाएगा, लेकिन बात को एक हफ्ते की meetings में नहीं बदलना है। दोनों सूरत में handover साफ-सुथरा रहेगा।',
  'manager-script.body.hostile':
    'यह resignation है। Letter inbox में है / यहां paper पर है। Notice के हिसाब से last working day [LWD] है। Handover पूरा किया जाएगा। इस meeting में decision पर बहस नहीं करनी। HR को कुछ चाहिए तो mail किया जा सकता है।',

  // ---- HR templates ----
  'hr.lead': 'Copy करें, brackets भरें, अपने mail से भेजें। यहां से कुछ भी इस device से बाहर नहीं जाता।',
  'hr.disclaimer': 'Templates हैं, legal advice नहीं। भेजने से पहले इन्हें अपनी appointment letter से match करें।',
  'hr.expected-ctc.title': 'Expected CTC',
  'hr.expected-ctc.desc': 'जब recruiter band share करने से पहले एक number मांगे।',
  'hr.early-release.title': 'Early Release',
  'hr.early-release.desc': 'मौजूदा HR/manager से notice छोटा करने के लिए कहें।',
  'hr.buyout-ask.title': 'Buyout Ask',
  'hr.buyout-ask.desc': 'Basic बनाम gross और /30 divisor को writing में confirm करें।',
  'hr.decline-accepted.title': 'Yes के बाद Decline',
  'hr.decline-accepted.desc': 'Acceptance withdraw करें, बिना इसे negotiation बनाए।',
  'hr.counter-offer-reply.title': 'Counter-offer Reply',
  'hr.counter-offer-reply.desc': 'मौजूदा manager के साथ writing में loop close करें।',
  'hr.recruiter-followup.title': 'Recruiter Follow-up',
  'hr.recruiter-followup.desc': 'Promised timeline के बाद एक-mail वाला nudge।',

  // ---- Counter-offer ----
  'counter-offer.title': 'Counter-offer',
  'counter-offer.desc':
    'Outside offer के मुकाबले rupee का gap, plus non-rupee reasons जिनकी वजह से लोग रुकते हैं — और honest stay-rate warning।',
  'counter-offer.formTitle': 'तीन CTCs',
  'counter-offer.current': 'मौजूदा CTC',
  'counter-offer.counter': 'उन्होंने जो counter offer किया',
  'counter-offer.outside': 'Outside offer',
  'counter-offer.promo': 'उन्होंने promotion / title का वादा किया',
  'counter-offer.team': 'रुकने की वजह Team है',
  'counter-offer.verdict.out':
    'Outside offer कागज़ पर अभी भी {paper} ज़्यादा है, इस structure पर लगभग {bank}/month ज़्यादा in-hand।',
  'counter-offer.verdict.in': 'यह counter इस simplified structure पर outside CTC को match या beat करता है। Non-rupee reasons फिर भी matter करते हैं।',
  'counter-offer.honest':
    'Counter accept करने वाले लोग अक्सर एक साल के अंदर वैसे भी चले जाते हैं — trust पहले ही टूट चुका होता है। यह एक pattern है, कोई statistic नहीं जिसके लिए एक percentage बनाया जा रहा है। Counter को stay-or-go decision मानें, bidding war नहीं।',
  'counter-offer.nonRupee': 'एक non-rupee reason on किया गया है। अगर रुकते हैं, तो promotion या team change को date के साथ writing में लें।',

  // ---- Handover doc ----
  'handover-doc.title': 'Handover Doc',
  'handover-doc.desc': 'एक structured KT note जिसे mail या doc में paste कर सकते हैं।',
  'handover-doc.formTitle': 'अगले owner को क्या चाहिए',
  'handover-doc.role': 'Role',
  'handover-doc.owner': 'आपके बाद इसे कौन owns करेगा',
  'handover-doc.projects': 'Projects / status',
  'handover-doc.access': 'Access, repos, rotate करने वाली keys',
  'handover-doc.risks': 'अगर यह drop हो जाए तो क्या टूटेगा',
  'handover-doc.verdict': 'Markdown copy करें। इसमें secrets न रखें — यह अभी भी सिर्फ इस device पर है।',
  'handover-doc.disclaimer': 'यह एक handover aid है, legal document नहीं। Passwords paste न करें।',

  // ---- Relieving chaser ----
  'relieving-chaser.title': 'Relieving Chaser',
  'relieving-chaser.desc': 'अगर relieving letter नहीं आई है तो Day 7, 14 और 30 वाले mails।',
  'relieving-chaser.formTitle': 'किसे chase करना है',
  'relieving-chaser.company': 'Company',
  'relieving-chaser.hr': 'HR का नाम',
  'relieving-chaser.role': 'जो role आपने छोड़ी',
  'relieving-chaser.lwd': 'Last working day',
  'relieving-chaser.day': 'कौन सा chase',
  'relieving-chaser.day.7': 'Day 7 — polite',
  'relieving-chaser.day.14': 'Day 14 — firm',
  'relieving-chaser.day.30': 'Day 30 — escalation',
  'relieving-chaser.verdict.7': 'एक छोटा nudge। मानें कि वे busy हैं, hostile नहीं।',
  'relieving-chaser.verdict.14': 'एक date मांगें। अगर safe हो तो अपने manager को copy करें।',
  'relieving-chaser.verdict.30': 'इस letter के बिना background checks रुक जाते हैं। यह साफ-साफ कह दें।',
  'relieving-chaser.body.7':
    'Hi {hr},\n\nमैंने {company} को {role} के रूप में {lwd} पर छोड़ा था। क्या relieving letter और F&F पर एक update मिल सकता है? कोई document अभी pending हो तो भेजने को तैयार हूं।\n\nधन्यवाद',
  'relieving-chaser.body.14':
    'Hi {hr},\n\n{company} ({role}, LWD {lwd}) से मेरी relieving letter पर यह एक follow-up है। कृपया वह date share करें जिसतक यह issue होगी, या मेरी तरफ से जो checklist अभी open है वह बताएं।\n\nयह नए employer पर background verification को block कर रहा है। धन्यवाद',
  'relieving-chaser.body.30':
    'Hi {hr},\n\n{company} में {role} के रूप में मेरे last working day ({lwd}) को 30 दिन हो गए हैं। मुझे अभी तक relieving letter नहीं मिली है।\n\nकृपया इसे इस हफ्ते जारी करने की एक formal request मानें, और F&F status पर मुझे copy करें। कुछ जवाब न मिलने पर ही [labour commissioner / internal grievance] तक escalate किया जाएगा — आपके साथ ही इसे close करना बेहतर होगा।\n\nRegards',

  // ---- EPF transfer ----
  'epf-transfer.title': 'EPF Transfer',
  'epf-transfer.desc': 'Online Form 13, unmarked date-of-exit, KYC mismatches, और जल्दी withdraw करना आमतौर पर क्यों ज़्यादा costly move है।',
  'epf-transfer.formTitle': 'आपका PF account',
  'epf-transfer.intent': 'आप क्या करना चाहते हैं',
  'epf-transfer.intent.transfer': 'नए employer को Transfer करें (Form 13)',
  'epf-transfer.intent.withdraw': 'Balance cash में withdraw करें',
  'epf-transfer.join': 'इस employer के साथ join किया',
  'epf-transfer.tenureScope':
    'यहां गिने गए years सिर्फ इस employer के हैं। जो PF आप पहले transfer कर चुके हैं वह add नहीं है — अगर aggregate continuous service पहले ही 5 साल से ज़्यादा है, तो portal / किसी CA से confirm करें।',
  'epf-transfer.exit': 'Last working day / date of exit',
  'epf-transfer.doe': 'Old employer ने EPFO पर date of exit mark कर दी है',
  'epf-transfer.name': 'UAN पर नाम Aadhaar से match करता है',
  'epf-transfer.dob': 'UAN पर date of birth Aadhaar से match करती है',
  'epf-transfer.verdict.transfer': '{years} completed years। Transfer (Form 13) से corpus fund में ही रहता है।',
  'epf-transfer.verdict.withdraw':
    '{years} completed years। CANDIDATE: 5 साल से पहले cash withdrawal आमतौर पर taxable path है — इसके बदले transfer करें।',
  'epf-transfer.verdict.okWithdraw':
    '{years} completed years। CANDIDATE: 5 साल की continuous service के बाद withdrawal आमतौर पर exempt case है — फिर भी portal पर confirm करें।',
  'epf-transfer.flag.prefer-transfer': '"Start clean" के लिए withdraw न करें। Transfer switcher का move है।',
  'epf-transfer.flag.premature-withdrawal':
    'CANDIDATE: recognised PF की premature withdrawal पर TDS लग सकता है (recollection s.192A / s.392(7)) और employer contribution plus interest पर tax। यह tool कोई rupee figure नहीं बनाता। इसके बदले transfer करें, फिर किसी CA से confirm करें।',
  'epf-transfer.flag.doe-unmarked':
    'Online transfer अक्सर तब तक freeze रहता है जब तक old employer date of exit mark न करे। इसे member portal पर raise करें और उसी दिन HR को mail करें।',
  'epf-transfer.flag.name-mismatch':
    'Aadhaar से name mismatch claims को block करता है। Form 13 file करने से पहले employer के through KYC update कराएं।',
  'epf-transfer.flag.dob-mismatch': 'Aadhaar से date-of-birth mismatch claims को block करता है। वही remedy: employer KYC, फिर retry।',
  'epf-transfer.flag.interest-after-exit':
    'CANDIDATE: employment छोड़ने के बाद credited interest taxable हो सकता है अगर balance untransferred रहे। Transfer करने से यह recognised fund के अंदर ही रहता है।',
  'epf-transfer.flag.five-year-exempt':
    'CANDIDATE: 5 साल की continuous recognised-PF service के बाद withdrawal आमतौर पर exempt case है (Fourth Schedule recollection)। Portal और किसी CA से confirm करें। यह tool कोई rupee नहीं बनाता।',
  'epf-transfer.steps': 'Form 13 का path (member portal)',
  'epf-transfer.step.activate-uan': 'EPFO member portal पर अपना UAN activate करें / log in करें।',
  'epf-transfer.step.kyc': 'Aadhaar, PAN और bank seed करें। Name और DOB Aadhaar से match होना चाहिए।',
  'epf-transfer.step.form13': 'Date of exit mark होने के बाद नए member ID के against online transfer claim (Form 13) file करें।',
  'epf-transfer.step.track-claim': 'Claim track करें। अगर यह अटक जाए, तो usual blocker unmarked date of exit या KYC mismatch होता है।',
  'epf-transfer.portal': 'EPFO Member Portal',
  'epf-transfer.provisional': 'Provisional है। PF withdrawal पर tax किसी chartered accountant की review का इंतज़ार कर रहा है। यह tax advice नहीं है।',

  // ---- BGV prep ----
  'bgv-prep.title': 'BGV Prep',
  'bgv-prep.desc': 'Background check क्या देखेगा — gaps, dual PF, pending relieving letter — और company type के हिसाब से क्या pack करें।',
  'bgv-prep.formTitle': 'वे क्या देखेंगे',
  'bgv-prep.gap': 'Employment gap',
  'bgv-prep.gapHint': 'इस job और पिछली job के बीच महीने। कोई gap नहीं तो 0।',
  'bgv-prep.dualPf': 'एक ही समय पर दो PF accounts (moonlighting era)',
  'bgv-prep.relieving': 'पिछली relieving letter अभी भी pending',
  'bgv-prep.company': 'नई company का type',
  'bgv-prep.company.product': 'Product',
  'bgv-prep.company.services': 'IT services / consulting',
  'bgv-prep.company.gcc': 'GCC / captive',
  'bgv-prep.company.startup': 'Startup',
  'bgv-prep.verdict.ok': 'इस list में कुछ भी hard stop नहीं है। Core file तैयार रखें और gaps का जवाब एक लाइन में दें।',
  'bgv-prep.verdict.risk': 'यहां कुछ UAN या HR calls पर सामने आएगा। पूछने से पहले paper तैयार रखें।',
  'bgv-prep.item.core-docs':
    'PAN, Aadhaar, degree certificates, आखिरी 3 महीनों की payslips, PF UAN history, address proofs। Colour scans रखें।',
  'bgv-prep.item.employment-gap':
    'एक-लाइन का reason लिखें (study, health, job search, caregiving)। Vendors gaps flag करते हैं; साफ explanation पर fail करना rare है।',
  'bgv-prep.item.dual-pf':
    'Overlapping दो UANs/employment records moonlighting जैसे दिखते हैं। Passbook dates निकालें और explain करने को तैयार रहें — इन्हें छिपाएं नहीं।',
  'bgv-prep.item.relieving-pending': 'BGV पिछली HR को call करेगा। अभी day-7 वाली relieving chaser भेजें और email thread रखें।',
  'bgv-prep.item.type-product': 'Product companies आमतौर पर education + last employment चाहती हैं। Offer letter और last increment letter मदद करते हैं।',
  'bgv-prep.item.type-services': 'Services firms अक्सर client-location letters चाहती हैं अगर आप deputed थे। Exit से पहले old HR से पूछ लें।',
  'bgv-prep.item.type-gcc': 'GCCs education और address checks सख़्ती से करते हैं। सिर्फ degree नहीं, semester marksheets भी रखें।',
  'bgv-prep.item.type-startup': 'नए startups में PF या साफ org chart न भी हो। Bank salary credits और grant letter रखें।',

  // ---- Insurance gap ----
  'insurance-gap.title': 'Insurance Gap',
  'insurance-gap.desc': 'Group cover आपके last working day पर खत्म हो जाता है। अगले employer की policy शुरू होने तक uncovered दिन count करें।',
  'insurance-gap.formTitle': 'Uncovered समय',
  'insurance-gap.lwd': 'Last working day',
  'insurance-gap.join': 'नई join date',
  'insurance-gap.personal': 'मेरे पास पहले से personal / parent floater है',
  'insurance-gap.verdict.none': 'Next-day join। Group cover बिना किसी calendar gap के hand off होता है।',
  'insurance-gap.verdict.gap': '{lwd} के बाद {days} uncovered दिन। Group mediclaim उस शाम रुक जाता है।',
  'insurance-gap.verdict.covered': 'Jobs के बीच {days} दिन, लेकिन आपके पास पहले से personal cover है।',
  'insurance-gap.overlap': 'LWD पर या उससे पहले join करने से EPFO पर दो employers overlap करते हैं। यह BGV/PF की problem है, insurance की जीत नहीं।',
  'insurance-gap.factors': 'Floater quote असल में किससे बदलता है (कोई premium बनाया नहीं जाता)',
  'insurance-gap.factor.floater-waiting': 'नई retail policy पर waiting periods अक्सर इस महीने के gap को cover नहीं करती।',
  'insurance-gap.factor.pre-existing': 'नई retail policy में Pre-existing conditions और maternity आमतौर पर exclusions होते हैं।',
  'insurance-gap.factor.age-band': 'Family floater में सबसे बड़े member का age band quote को city से ज़्यादा बदलता है।',
  'insurance-gap.factor.city': 'Metro बनाम non-metro network hospitals बदलता है, यह नहीं कि आपके पास gap है या नहीं।',

  // ---- Tax declaration ----
  'tax-declaration.title': 'Tax Declaration',
  'tax-declaration.desc': 'नए employer को क्या बताएं: regime, HRA proofs, और वह Form 16 जो आपके जाने के बाद आती है।',
  'tax-declaration.formTitle': 'इस साल की declarations',
  'tax-declaration.ctc': 'इन numbers के पीछे CTC',
  'tax-declaration.basic': 'Basic',
  'tax-declaration.rent': 'Monthly rent (old-regime HRA)',
  'tax-declaration.state': 'Work state',
  'tax-declaration.profileHint': 'Decoder से seed किया गया है। यहां fields बदलने से Decoder overwrite नहीं होता।',
  'tax-declaration.openDecoder': 'Decoder खोलें',
  'tax-declaration.hra': 'HRA claim करना है (old regime)',
  'tax-declaration.hraHint': 'असल rent receipts चाहिए। अगर new regime सस्ता है तो बेकार है।',
  'tax-declaration.80c': 'PF के अलावा extra 80C invest करना है',
  'tax-declaration.verdict.new': 'इस CTC पर New regime सस्ता है। Tax cut की उम्मीद में HRA proofs submit न करें।',
  'tax-declaration.verdict.old': 'इस CTC पर Old regime सस्ता है। HRA और 80C proofs से ही यह बना रहता है।',
  'tax-declaration.hraRow': 'Old-regime math में HRA exemption: {amount}/साल।',
  'tax-declaration.hraUseless': 'यह exemption new-regime tax नहीं बदलता।',
  'tax-declaration.proofs': 'Proof Calendar',
  'tax-declaration.proof.hra':
    'HRA: monthly rent receipts। Rent ₹1 lakh/साल से ऊपर जाने पर आमतौर पर landlord का PAN चाहिए (employer process, CANDIDATE)।',
  'tax-declaration.proof.80c': '80C: investment proofs। Payroll आमतौर पर January तक मांगता है।',
  'tax-declaration.proof.80d': '80D: अगर declare किया है तो health-premium receipts।',
  'tax-declaration.proof.form16-prev':
    'Previous employer का Form 16 अक्सर आपके जाने के हफ्तों बाद आता है। File करने के लिए आपको फिर भी चाहिए। इसे relieving letter जैसे chase करें।',
  'tax-declaration.proof.form12b':
    'महीना 1 में नए payroll को Form 12B (previous income/TDS) दें। CANDIDATE: Rule 26A / s.192(2) multi-employer withholding — exact mechanism किसी CA से confirm करें।',

  // ---- Notice tracker ----
  'notice-tracker.title': 'Notice Tracker',
  'notice-tracker.desc': 'Dates और एक checklist: F&F, asset return, insurance end, PF date of exit।',
  'notice-tracker.formTitle': 'Clock',
  'notice-tracker.resign': 'Resignation date',
  'notice-tracker.notice': 'Notice period',
  'notice-tracker.verdict.left': 'Last working day ({lwd}) तक {days} दिन।',
  'notice-tracker.verdict.served': 'Notice serve हो गया है। Last working day {lwd} था।',
  'notice-tracker.item.handover': 'Team के साथ Handover doc',
  'notice-tracker.item.fnf-docs': 'Payroll को F&F inputs (bank, address, claims)',
  'notice-tracker.item.asset-return': 'Laptop, id, sim, access cards',
  'notice-tracker.item.insurance-end': 'Group mediclaim खत्म होता है',
  'notice-tracker.item.pf-doe': 'HR से PF date of exit mark करने को कहें',
  'notice-tracker.item.relieving-chase': 'अगर relieving letter नहीं है, तो day-7 वाला chase शुरू करें',
  'notice-tracker.due': '{date} तक due',

  // ---- Bond scanner ----
  'bond-scanner.title': 'Bond Scanner',
  'bond-scanner.desc': 'Bond, non-compete या probation clause paste करें। यह patterns flag करता है — यह कोई court नहीं है।',
  'bond-scanner.formTitle': 'Clause',
  'bond-scanner.text': 'Offer / appointment text',
  'bond-scanner.textHint': 'Bond या restraint वाला paragraph paste करें। यह कभी इस device से बाहर नहीं जाता।',
  'bond-scanner.verdict.blank': 'अभी कुछ भी check नहीं हुआ। ऊपर bond clause या appointment letter का text paste करें।',
  'bond-scanner.verdict.clean': 'इस paste में bond, certificate-deposit या post-exit restraint का pattern नहीं है।',
  'bond-scanner.verdict.flags': '{n} pattern lawyer से बात करने लायक हैं, panic करने की नहीं। Case law fact-specific होता है।',
  'bond-scanner.flag.original-certificates':
    'Original degrees रखना आमतौर पर unlawful restraint माना जाता है। Originals न दें। (यह किसी lawyer का substitute नहीं है।)',
  'bond-scanner.flag.post-exit-noncompete':
    'Post-employment non-competes आमतौर पर Contract Act s.27 के तहत void होते हैं। Employment के दौरान वाला सवाल अलग है।',
  'bond-scanner.flag.training-bond':
    'CANDIDATE: courts ने specialised training cost मांगा है, ordinary onboarding नहीं (*Sicpa India v. Manas Pratim Deb*)। Letter में लिखा number automatically owed नहीं है।',
  'bond-scanner.flag.liquidated-damages':
    'CANDIDATE: liquidated damages एक ceiling हैं जिसके लिए फिर भी actual loss का proof चाहिए (*Kailash Nath Associates v. DDA*)। यह fact-specific है।',
  'bond-scanner.flag.probation-extend':
    'Discretion पर extendable probation का मतलब है confirmation कोई पक्की date नहीं है। Max extension writing में लें।',
  'bond-scanner.disclaimer':
    'यह एक pattern scan है, legal advice नहीं। भारतीय case law fact-specific होता है। ऊपर दिए दो citations आपकी letter पर holdings नहीं हैं।',

  // ---- Payslip redactor ----
  'redactor.title': 'Payslip Redactor',
  'redactor.desc': 'Payslip या offer का screenshot लेने से पहले Aadhaar, PAN, phone, email और rupee amounts को इस device पर mask करें।',
  'redactor.formTitle': 'Page paste करें',
  'redactor.text': 'Payslip या offer text',
  'redactor.textHint': 'कुछ भी upload नहीं होता। Masked page को PNG में download करें या print करें।',
  'redactor.verdict.none': 'कुछ भी match नहीं हुआ। ऐसा text paste करें जिसमें PAN, Aadhaar, फोन नंबर या ₹ amount हो।',
  'redactor.verdict.hits': '{n} items mask किए गए। PNG download करें या print करें — pdf-lib इस्तेमाल नहीं होती।',
  'redactor.download': 'PNG Download करें',
  'redactor.busy': 'Render हो रहा है…',
  'redactor.preview': 'Masked Preview',

  // ---- Clause library ----
  'clause-library.title': 'Clause Library',
  'clause-library.desc': 'भारतीय appointment letters में मिलने वाली clauses की plain-English readings। यह legal advice नहीं है।',
  'clause-library.verdict': 'वह clause पढ़ें जो आपने असल में sign की है। यह notes एक map हैं, आपका contract नहीं।',
  'clause-library.cat.notice': 'Notice',
  'clause-library.cat.bond': 'Bond',
  'clause-library.cat.variable': 'Variable',
  'clause-library.cat.pf': 'PF',
  'clause-library.cat.probation': 'Probation',
  'clause-library.notice-90.title': '90-दिन का notice',
  'clause-library.notice-90.body':
    'Typical IT/managerial roles के लिए कोई भारतीय statute 90 दिन ज़रूरी नहीं बनाता। यह contractual है। लंबा notice आपको अगली बार hire करना मुश्किल बनाता है। Buyout formula writing में मांगें।',
  'clause-library.notice-buyout.title': 'Notice के बदले Salary',
  'clause-library.notice-buyout.body':
    'साधारण भारतीय letters दोनों पक्षों को unserved notice pay करने देती हैं। यह कोई scam deposit नहीं है। Switch Karle का notice-buyout tool letter के /30 convention से cash estimate करता है।',
  'clause-library.bond-training.title': 'Training / Service Bond',
  'clause-library.bond-training.body':
    'कोई rupee figure automatically payable नहीं है। Courts specialised training cost और actual loss देखते हैं। Clause को bond scanner में paste करें।',
  'clause-library.variable-discretion.title': 'Company Discretion पर Variable',
  'clause-library.variable-discretion.body':
    'अगर payout "at discretion" है, तो CTC headline कोई promise नहीं है। 0 / 50 / 100% पर variable-reality tool इस्तेमाल करें।',
  'clause-library.pf-transfer.title': 'Exit पर PF Transfer',
  'clause-library.pf-transfer.body':
    'Transfer (Form 13) switcher का move है। Five साल की continuous service से पहले withdraw करना एक taxable premature withdrawal हो सकता है — EPF transfer देखें।',
  'clause-library.probation-confirm.title': 'Probation फिर Confirmation',
  'clause-library.probation-confirm.body':
    'Confirmation अक्सर "subject to performance" होता है, साथ में extendable probation। Maximum length writing में लें ताकि date हमेशा के लिए न खिसके।',

  // ---- States ----
  'state.PB': 'पंजाब',
  'state.BR': 'बिहार',
  'state.AS': 'असम',
  'state.JH': 'झारखंड',
  'state.CG': 'छत्तीसगढ़',
  'state.SK': 'सिक्किम',
  'state.ML': 'मेघालय',
  'state.TR': 'त्रिपुरा',
  'state.PY': 'पुदुचेरी',
};
