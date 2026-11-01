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
 * Aadhaar, TDS, FMV, cliff, vest, metro, decoder, tracker, etc.) stay
 * in English/Latin script exactly as Indian professionals say them; the
 * surrounding sentence is Devanagari.
 */
export const hiSuite: Record<string, string> = {
  // ---- Decoder inheritance disclosure ----
  'ui.inherit': 'Basic, HRA और PF का split आपके save किए हुए Decoder offer से आता है — यह tool सिर्फ़ वही बदलता है जो ऊपर पूछा गया है।',
  'ui.inheritLink': 'Decoder खोलें',
  'ui.currentJob': 'Current job के figures — basic, gross, notice period — सभी exit tools में एक ही रहते हैं। यहाँ बदलेंगे तो हर जगह बदल जाएगा। सिर्फ़ इसी device पर save रहता है।',
  'ui.noticeMonthsNudge': 'क्या यह {n} months है? यहाँ notice days में गिना जाता है: {n} months मतलब लगभग {days} days।',
  'ui.noticeMonthsUse': '{days} days use करें',

  // ---- The plan: सामने का दरवाज़ा (docs/DIRECTION.md Part 3, 4, 13) ----
  'plan.tagline':
    '“बस, अब यहाँ नहीं” से लेकर notice निकालने और नई नौकरी के day 90 तक। तीन सवाल, और आपकी dates तैयार।',
  'plan.q.title': 'तीन सवाल',
  'plan.example.chip': 'उदाहरण',
  'plan.example.note': 'ये उदाहरण वाले जवाब हैं, ताकि टाइप करने से पहले ही असली calendar दिखे। इन्हें अपने जवाबों से बदल दें।',
  'plan.example.laterNote': 'ये dates उदाहरण वाले जवाबों से बनी हैं। अपने जवाब डालेंगे तो आपकी असली dates आएंगी।',
  'plan.q.join': 'आपने join कब किया था?',
  'plan.q.joinHint': 'जिस दिन आपने current employer के साथ शुरुआत की थी।',
  'plan.q.notice': 'आपका notice period कितना है?',
  'plan.q.noticeHint': 'Days में डालें। अगर आपका letter months में है, तो 30 से multiply करें।',
  'plan.q.noticeSuffix': 'दिन',
  'plan.q.hike': 'Hike का पैसा किस महीने आपके account में आता है?',
  'plan.q.hikeHint':
    'Appraisal का महीना नहीं, letter का महीना भी नहीं — जिस महीने पैसा आता है वही। यह सवाल छोड़ भी सकते हैं।',
  'plan.q.hikeSkip': 'यह छोड़ दें',
  'plan.q.next': 'मेरी dates दिखाएं',
  'plan.back': 'वापस',

  'plan.cliffs.title': 'आपकी dates, पैसे की बात से पहले',
  'plan.week.title': 'Gratuity आपके हफ़्ते पर टिकी है।',
  'plan.week.five': 'पाँच दिन का हफ़्ता, शनिवार-रविवार off',
  'plan.week.six': 'छह दिन का हफ़्ता',
  'plan.week.ask': 'आपका कौन सा है?',
  'plan.gratuity.past':
    'आपकी gratuity {date} को ही safe हो चुकी थी, {days} दिन पहले। एक चीज़ कम हो गई जो आपको यहाँ रोक रही थी।',
  'plan.gratuity.ahead': 'आपकी gratuity {date} से safe है, {days} दिन बाद।',
  'plan.gratuity.workingDays': 'यह calendar days नहीं, working days गिनता है — weekly off नहीं गिनते। Public holidays और unpaid या unearned leave से यह date आगे खिसक सकती है, इसलिए इसे सबसे पहली मुमकिन date मानें। पूरे 5 साल पूरे होने की date पर कोई बहस नहीं हो सकती।',
  'plan.gratuity.notice':
    'Notice period भी service में गिना जाता है। {from} को या उसके बाद resign करें, तो आपका last working day {date} तक पहुँच जाता है। अगर early release या notice buyout से last day {date} से पहले आ गया, तो gratuity नहीं मिलेगी।',
  'plan.gratuity.noticeNow':
    'Notice period भी service में गिना जाता है। आज resign करें, तब भी आपका last working day {date} तक पहुँच जाता है। अगर early release या notice buyout से last day {date} से पहले आ गया, तो gratuity नहीं मिलेगी।',
  'plan.act.label': 'क्या आपके employer के यहाँ हमेशा दस से कम लोग रहे हैं?',
  'plan.act.hint': 'तो gratuity के लिए Code on Social Security आप पर लागू नहीं होता। अगर पिछले बारह महीनों में किसी भी दिन दस या ज़्यादा लोग थे, या employer कभी Code के तहत आ चुका है, तो Code अब भी लागू है। फिर भी company अपनी policy से gratuity दे सकती है।',
  'plan.act.none':
    'जिस employer पर Code कभी लागू नहीं हुआ, उसके लिए Code कोई gratuity date तय नहीं करता। कानूनन कोई date आपको यहाँ नहीं रोक रही।',
  'plan.hike.line': 'आपका hike {month} में आता है। {date} से पहले resign किया तो वह कभी नहीं मिलेगा।',
  'plan.cliffs.none': 'आगे कुछ नहीं है। कोई date आपको यहाँ नहीं रोक रही।',
  'plan.cliffs.next': 'अगला: date चुनें',

  'plan.dates.title': 'आप कब बाहर होना चाहते हैं?',
  'plan.trade.keep-the-hike': 'Hike रख लें',
  'plan.trade.keep-what-is-earned': 'सिर्फ़ वही रखें जो कमा लिया है',
  'plan.trade.own-date': 'मेरे पास पहले से एक date है',
  'plan.trade.runway-3-months': 'आज से तीन महीने',
  'plan.trade.runway-6-months': 'आज से छह महीने',
  'plan.trade.runway-financial-year-end': '31 मार्च, financial year का आख़िरी दिन',
  'plan.trade.fixed.detail': '{date} को बाहर। Apply करना {apply} तक शुरू कर दें।',
  'plan.trade.earned.detail':
    'यहाँ से कोई भी date चुनेंगे तो आगे जो बाक़ी है वह छोड़ना पड़ेगा। {date} से कुछ नहीं छूटता।',
  'plan.trade.own.detail': 'Date डालिए, बाक़ी सब उसी से पीछे की ओर निकल आएगा।',
  'plan.trade.late': 'Apply शुरू करने में आप पहले ही देर कर चुके होंगे।',
  'plan.trade.dateLabel': 'आपकी date',
  'plan.trade.use': 'यही date रखें',

  'plan.recap.title': 'आपकी dates।',
  'plan.recap.apply': 'Apply करना {date} तक शुरू कर दें।',
  'plan.recap.offer': '{date} तक offer हाथ में।',
  'plan.recap.resign': '{date} को resign करें।',
  'plan.recap.lwd': 'Last working day {date}, {days} दिन के notice के बाद।',
  'plan.recap.forfeit': 'यह आप छोड़ रहे हैं',
  'plan.cliff.gratuity-5-day': '{date} की gratuity',
  'plan.cliff.gratuity-6-day': '{date} की gratuity',
  'plan.cliff.hike': '{date} को hike का पैसा',
  'plan.cliff.bond-end': 'Bond {date} को ख़त्म',
  'plan.cliff.bonus-clawback': 'Joining bonus clawback {date} को ख़त्म',
  'plan.calendar.cta': 'ये dates मेरे calendar में डालें',
  'plan.calendar.note': 'dates.ics download होगी: सात दिन बाद एक check-in, ऊपर की सारी dates, और आपकी चुनी हुई date। हर entry के notes में इस site का link रहता है, इसलिए work calendar में डालने से पहले एक बार सोच लें।',
  'plan.calendar.downloaded': 'dates.ics आपके downloads में है। उसे खोलें, calendar app dates जोड़ देगा।',
  'plan.calendar.moved':
    'Date {dates} से बदली है। अगर वह date पहले से आपके calendar में है, तो उसे वहीं delete करें। यह file नई date उसके साथ जोड़ती है, उसकी जगह नहीं।',
  'plan.reason.label': 'आप क्यों निकलना चाहते हैं?',
  'plan.reason.hint': 'बस एक लाइन। हर बार लौटने पर यह सबसे ऊपर दिखेगी। चाहें तो छोड़ दें।',
  'plan.reason.save': 'यह लाइन save करें',
  'plan.reason.saved': 'Save हो गई',
  'plan.looking.cta': 'मुझे अभी से देखना शुरू करना है',
  'plan.looking.warning':
    'अभी शुरू करना बिलकुल ठीक है। दो चीज़ें manager तक पहुँच सकती हैं: referral वाला message, और आपकी public profile में बदलाव। दोनों अपने आप नहीं होतीं, दोनों आपकी मर्ज़ी हैं।',
  'plan.looking.since': '{date} से देख रहे हैं। आपकी resign date वहीं है, हिली नहीं।',
  'plan.worth': 'इसकी कीमत देखें',
  'plan.change': 'मेरी date बदलें',
  'plan.startOver': 'फिर से शुरू करें',
  'plan.startOver.confirm':
    'यह plan मिटाकर फिर से शुरू करें? आपके save किए हुए pay के figures रहेंगे — सिर्फ़ plan जाएगा।',
  'plan.return.countdown': '{date} तक {days} दिन बाक़ी।',
  'plan.return.next': 'अगला: ये dates ऐसी जगह रख लें जहाँ आपको दिखती रहें।',

  'plan.ics.checkIn': 'अपनी dates देखनी हैं',
  'plan.ics.checkIn.note': 'Plan खोलें और अगला काम कर लें।',
  'plan.ics.cliff.gratuity-5-day': 'Gratuity की date',
  'plan.ics.cliff.gratuity-6-day': 'Gratuity की date',
  'plan.ics.cliff.hike': 'Hike का महीना ख़त्म',
  'plan.ics.cliff.bond-end': 'Bond ख़त्म',
  'plan.ics.cliff.bonus-clawback': 'Joining bonus clawback ख़त्म',
  'plan.ics.cliff.note': 'मेरे plan की एक date।',
  'plan.ics.resign': 'जो date मैंने चुनी है',
  'plan.ics.resign.note': 'जो दिन मैंने चुना है।',

  'home.trackerLink': 'पहले से apply कर रहे हैं?',
  'home.trackerLink.cta': 'अपना application tracker खोलें →',

  // ---- Home: the journey ----
  'home.pinned': 'Offer मिल गया है? इनसे शुरू करें',
  'home.cat.offer': 'सामने रखा offer',
  'home.cat.exit': 'निकलते वक़्त का पैसा',
  'home.cat.documents': 'जो आपको लिखना है',
  'home.cat.landing': 'नई job में पहुँचने पर',

  // ---- Nav / app shell / common ----
  'nav.search': 'टूल खोजें',
  'nav.searchHint': 'टाइप करें और सीधे वहाँ पहुँचें। बंद करने के लिए Esc दबाएं।',
  'nav.searchEmpty': '“{q}” के लिए अभी कुछ नहीं। notice, gratuity, in-hand या resign आज़माएं।',
  'nav.searchCount': 'नतीजे: {n}',
  'nav.close': 'बंद करें',
  'notFound.docTitle': 'Page नहीं मिला — Switch Karle',
  'notFound.title': 'यह page मौजूद नहीं है।',
  'notFound.body': 'Link पुराना या ग़लत हो सकता है। आपने जो भी save किया है, वह इसी device पर है।',
  'notFound.home': 'होम page पर जाएं',
  'notFound.otherHome': 'English home',
  'notFound.searchHint': 'कोई tool ढूँढ रहे हैं? ऊपर “टूल खोजें” का इस्तेमाल करें।',
  'palette.plan.desc': 'तीन सवाल। आपकी gratuity date, hike का महीना और last working day।',
  'ui.copyText': 'कॉपी करें',
  'ui.copyResult': 'Result copy करें',
  'ui.copyLetter': 'Letter copy करें',
  'ui.copyEmail': 'Email copy करें',
  'ui.copyNote': 'Note copy करें',
  'ui.copyScript': 'Script copy करें',

  // ---- Offer comparison ----
  'offer-comparison.title': 'Offer तुलना',
  'offer-comparison.desc': 'दो या तीन offers, side by side — in-hand देखें, headline CTC नहीं।',
  'offer-comparison.offer': 'Offer {label}',
  'offer-comparison.addThird': 'तीसरा offer जोड़ें',
  'offer-comparison.removeThird': 'Offer C हटाएं',
  'offer-comparison.delta': 'Side by side',
  'offer-comparison.row.ctc': 'बताया गया CTC',
  'offer-comparison.row.inHand': 'In-hand / महीना',
  'offer-comparison.row.ratio': 'CTC का कितना हिस्सा in-hand',
  'offer-comparison.row.variable': 'CTC में Variable',
  'offer-comparison.verdict.tie': 'दोनों offers का in-hand लगभग बराबर है (ESOPs को शून्य गिना गया है)।',
  'offer-comparison.verdict.win': '{label} offer का in-hand ज़्यादा आता है: {amount}/month।',
  'offer-comparison.exampleChip': 'उदाहरण',
  'offer-comparison.exampleNote': 'यह एक worked example है — अभी कुछ भी check नहीं हुआ है। अपने offers compare करने के लिए कोई भी field edit करें।',
  'offer-comparison.copyTitle': 'Offer तुलना — Switch Karle',
  'offer-comparison.perMonth': 'महीना',
  'offer-comparison.copyLine': 'Summary copy करें',
  'offer-comparison.esopPolicy':
    'हर तरफ paper ESOP को zero माना गया है ताकि एक grant verdict न बदल दे। Liquidity अलग बात है।',
  'offer-comparison.flag.gratuity': 'सिर्फ़ एक तरफ Gratuity CTC के अंदर है — यह headline बढ़ाता है, bank नहीं।',
  'offer-comparison.flag.pf': 'सिर्फ़ एक तरफ Employer PF CTC के अंदर है। एक जैसी चीज़ों को compare करें।',
  'offer-comparison.flag.ceiling': 'एक offer में PF पूरे basic पर है, दूसरे में wage ceiling पर।',

  // ---- Real hike ----
  'real-hike.title': 'असली Hike',
  'real-hike.desc': 'CTC में उछाल बनाम हर महीने असल में क्या आपके account तक पहुंचता है।',
  'real-hike.formTitle': 'यह job → अगली job',
  'real-hike.currentCtc': 'मौजूदा CTC',
  'real-hike.currentVariable': 'मौजूदा variable',
  'real-hike.currentState': 'मौजूदा राज्य',
  'real-hike.nextCtc': 'नया CTC',
  'real-hike.nextVariable': 'नया variable',
  'real-hike.nextBasic': 'नया offer: fixed pay का कितना % basic',
  'real-hike.nextBasicHint': 'Basic ÷ (CTC में से variable घटाकर)। Basic कम हो तो PF भी कम और gratuity भी कम। यह salary structure sheet पर मिलेगा।',
  'real-hike.nextState': 'नया राज्य',
  'real-hike.haircut': 'मानें कि variable 70% pay होगा',
  'real-hike.haircutHint': 'एक कमज़ोर साल दिखाने के लिए हमारा चुना round number — market average नहीं। Off = पूरा quoted variable गिनें।',
  'real-hike.verdict': 'In-hand में {bank}% ज़्यादा। कागज़ पर {paper}% ज़्यादा।',
  'real-hike.row.paper': 'बताया गया CTC',
  'real-hike.row.bank': 'हर महीने in-hand',
  'real-hike.bonusNote': 'Joining bonus एक बार मिलने वाला है — यह monthly in-hand में शामिल नहीं है।',
  'real-hike.regimeFlip': 'इन दो jobs के बीच सस्ता tax regime बदल जाता है। यह in-hand नंबर में शामिल है।',
  'real-hike.haircutNote':
    'Variable को tax के बाद 70% पर गिना गया है, quoted figure पर नहीं, फिर 12 महीनों में spread किया गया है।',

  // ---- Variable reality ----
  'variable-reality.title': 'Variable की असलियत',
  'variable-reality.desc': 'अगर variable 0, 50 या 100% pay हो तो आपका monthly in-hand कैसा दिखेगा।',
  'variable-reality.formTitle': 'आपका variable pay',
  'variable-reality.months': 'इस FY में payroll पर महीने',
  'variable-reality.monthsHint':
    'पहला साल अक्सर pro-rate होता है। 12 = पूरा साल। इस हिस्से पर tax फिर भी full-year CTC पर लगता है, जैसे यह job पूरे साल चली हो।',
  'variable-reality.verdict': 'CTC का {pct}% variable pay पर टिका है। आपका पक्का in-hand {fixed}/month है; variable पूरा मिले तो {full}/month।',
  'variable-reality.table': 'अगर variable इतना pay करे',
  'variable-reality.row': '{pct}% payout, monthly spread',
  'variable-reality.split': 'Fixed {fixed} · इस साल जोखिम में {risk}',
  'variable-reality.withheld':
    'अगर यह एक साथ मिले, तो tax के बाद आपके पास {amount} रहता है — तब तक monthly in-hand 0% वाले figure पर ही रहता है।',
  'variable-reality.spread': 'अगर payroll इसे spread करे, तो 100% वाली row {amount}/month है।',
  'variable-reality.prorate':
    'First-year pro-rate on है: इस FY के सिर्फ़ {months} महीने, इसलिए जोखिम वाला हिस्सा भी कम हो जाता है। उस हिस्से पर tax फिर भी full-year taxable income पर calculate होता है (पिछले employer की income अक्सर बाक़ी साल भर देती है)।',
  'variable-reality.fullYearTax': 'Variable pro-rated होने पर भी, tax का base आपका full-year CTC ही रहता है।',

  // ---- Bonus clawback ----
  'bonus-clawback.title': 'Bonus Clawback',
  'bonus-clawback.desc': 'Clawback ख़त्म होने से पहले छोड़ने पर कितना लौटाना होगा, tax समेत, यह देखें।',
  'bonus-clawback.formTitle': 'Clawback की अवधि',
  'bonus-clawback.amount': 'Joining bonus (gross)',
  'bonus-clawback.window': 'इतना रुकना ज़रूरी',
  'bonus-clawback.notice': 'Notice period',
  'bonus-clawback.creditDate': 'Bonus कब credit हुआ',
  'bonus-clawback.creditDateHint': 'जिस दिन पैसा account में आया। Window यहीं से चलती है, join date से नहीं।',
  'bonus-clawback.plannedLwd': 'सोचा हुआ last working day',
  'bonus-clawback.plannedLwdHint': 'Anniversary से तीन हफ़्ते पहले निकलना भी कम ही गिना जाता है।',
  'bonus-clawback.taxableIncome': 'Bonus के बिना taxable income',
  'bonus-clawback.taxableIncomeHint': 'आपके Decoder offer से लिया गया है। असली income अलग हो तो बदल दें।',
  'bonus-clawback.regime': 'Tax regime',
  'bonus-clawback.served': '{window} महीने की window में से {months} महीने पूरे हुए।',
  'bonus-clawback.netMode': 'Net-vs-gross trap दिखाएं',
  'bonus-clawback.netModeHint': 'On: आपको net मिला था, आप gross चुकाते हैं। Off: सिर्फ़ headline gross।',
  'bonus-clawback.verdict.net': 'Tax के बाद आपके पास {net} रहा। अभी छोड़ने पर {repay} लौटाना होगा, तो आपके हाथ में {keep} बचता है।',
  'bonus-clawback.verdict.netLoss': 'Tax के बाद आपके पास {net} रहा। अभी छोड़ने पर {repay} लौटाना होगा, यानी यह bonus आपको {loss} का पड़ेगा।',
  'bonus-clawback.verdict.gross': 'Gross bonus {gross}। Window के अंदर छोड़ने पर letter {repay} वापस माँगती है।',
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
  'bonus-clawback.keep': 'आपको net',

  // ---- ESOP reality ----
  'esop-reality.title': 'ESOP की असलियत',
  'esop-reality.desc': 'Exercise पर perquisite tax, vest schedule, और यह paper असल में liquid है या नहीं।',
  'esop-reality.formTitle': 'The Grant',
  'esop-reality.shares': 'Shares',
  'esop-reality.strike': 'Strike price',
  'esop-reality.fmv': 'Exercise पर FMV',
  'esop-reality.fmvHint':
    'Unlisted shares के लिए, Form 16 company की Rule 15 valuation (Income-tax Rules, 2026) इस्तेमाल करता है, आख़िरी funding round नहीं। Eligible-startup TDS deferral यहाँ model नहीं किया गया है।',
  'esop-reality.perShare': 'Per share',
  'esop-reality.cliff': 'Cliff',
  'esop-reality.vest': 'पूरी तरह vest होगी',
  'esop-reality.liquid': 'Listed है / liquidity event हो चुका है',
  'esop-reality.liquidHint': 'Private-company का paper cash नहीं है जब तक कोई इसे खरीदे नहीं।',
  'esop-reality.verdict':
    'Exercise करने में {cost} plus लगभग {tax} tax लगता है — कुछ भी बेचने से पहले उस दिन {cash} cash में चाहिए। Perquisite {perq}।',
  'esop-reality.underwater': 'Strike FMV से ऊपर है — perquisite ₹0 है। Exercise करने में फिर भी {cost} cash लगेगा।',
  'esop-reality.cadence': 'Vest कैसे होता है',
  'esop-reality.cadence.monthly': 'हर महीने',
  'esop-reality.cadence.annual': 'हर साल',
  'esop-reality.vestLinear':
    'Monthly vest मानकर बनाया गया है: cliff निकलने के बाद shares × महीना ÷ vest period।',
  'esop-reality.vestAnnual':
    'बराबर सालाना tranches मानकर बनाया गया है — एक cliff पर, फिर हर anniversary पर। बीच में कुछ नहीं जुड़ता, चाहे आप कितना भी रुकें।',
  'esop-reality.vestLetter': 'इनमें से कौन-सा लागू है, यह आपका grant letter बताता है। यह tool उसे आपके लिए नहीं पढ़ सकता।',
  'esop-reality.saleNote': 'Sale एक अलग capital-gains event है। यह tool exercise तक ही जाता है।',
  'esop-reality.vestTitle': 'Vest Schedule',
  'esop-reality.vestRow': 'महीना {month}',
  'esop-reality.cliffed': 'अभी cliff में — zero vested',
  'esop-reality.vested': '{n} vested',
  'esop-reality.illiquid':
    'यह private-company का paper है। Exit के बाद exercise window छोटी होती है, और buyer मिलना ज़रूरी नहीं।',
  'esop-reality.provisional': 'अभी chartered accountant ने review नहीं किया है। इसे provisional मानें, tax advice नहीं।',

  // ---- Relocation ----
  'relocation.title': 'Relocation',
  'relocation.desc': 'देखें कि वही CTC दूसरे शहर में जाने पर आपका in-hand कैसे बदलता है।',
  'relocation.formTitle': 'वही salary, नया शहर',
  'relocation.fromState': 'किस राज्य से',
  'relocation.fromMetro': 'HRA के लिए metro से',
  'relocation.toState': 'किस राज्य में',
  'relocation.toMetro': 'HRA के लिए metro में',
  'relocation.fromCity': 'किस शहर से',
  'relocation.toCity': 'किस शहर में',
  'relocation.metroHint': 'Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad या Bengaluru — basic का 50% (Rule 279, Income-tax Rules, 2026)। बाक़ी कहीं भी 40%। सिर्फ़ old regime में।',
  'relocation.rent': 'आप जो rent देते हैं / महीना',
  'relocation.fromRent': 'यहाँ rent / महीना',
  'relocation.toRent': 'वहाँ rent / महीना',
  'relocation.rentHint':
    'HRA exemption के लिए असल rent चाहिए। 0 = कोई exemption नहीं। ₹1 lakh/साल से ऊपर rent पर employer आमतौर पर landlord का PAN माँगता है।',
  'relocation.metroWarn':
    '{state} में HRA metro city नहीं है (सिर्फ़ Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad और Bengaluru qualify करते हैं, Income-tax Rules, 2026 के Rule 279 के अनुसार)। आपने जो 50% वाला limb on किया है, वह वहाँ apply नहीं होगा।',
  'relocation.ptApprox':
    'Professional tax approximate है। Bihar, Jharkhand और अन्य नए listed states dropdown में ₹0 पर हैं जब तक primary schedule नहीं मिलता। Tamil Nadu में Chennai का rate दिखाया गया है; Tamil Nadu के दूसरे शहर अपना rate खुद तय करते हैं। Punjab में State Development Tax (₹2,400) लगता है। "Other" भी ₹0 है।',
  'relocation.hraNewRegime': 'HRA exemption new-regime tax नहीं बदलता। यह row सिर्फ़ old-regime comparison के लिए दिखाई गई है।',
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
  'fake-offer.desc': 'Deposit की माँग, free-mail recruiters, lookalike domains — plus EPFO और MCA lookup links।',
  'fake-offer.formTitle': 'आपको भेजी गई letter',
  'fake-offer.company': 'Company का नाम',
  'fake-offer.email': 'Recruiter का email या domain',
  'fake-offer.emailHint': 'पूरा address paste करें अगर है — हम सिर्फ़ domain रखते हैं।',
  'fake-offer.text': 'Offer text',
  'fake-offer.textHint': 'Email या letter paste करें। यह कभी इस device से बाहर नहीं जाता।',
  'fake-offer.verdict.red': '{n} hard stops। Sender verify होने तक payment न करें और documents share न करें।',
  'fake-offer.verdict.redOne': '1 hard stop। Sender verify होने तक payment न करें और documents share न करें।',
  'fake-offer.verdict.amber':
    'कुछ ठीक नहीं लगता — अक्सर free-mail recruiter या lookalike domain होता है। Reply करने या documents share करने से पहले verify करें।',
  'fake-offer.verdict.blank': 'अभी कुछ भी check नहीं हुआ। Offer email या letter का text, Offer text वाले box में paste करें।',
  'fake-offer.verdict.clean': 'Text में deposit की माँग नहीं मिली। Clean text verification नहीं है — भरोसा करने से पहले sender और company खुद confirm करें।',
  'fake-offer.flag.deposit-ask.title': 'Offer आपसे पहले पैसे माँगता है',
  'fake-offer.flag.deposit-ask.detail':
    'असली employers joining से पहले security deposit, joining fee, training fee या laptop deposit नहीं माँगते। कोई भी upfront payment माँग एक आम job-scam pattern है।',
  'fake-offer.flag.deposit-ask.hint':
    'पैसा न दें। Company letterhead पर written offer माँगें और recruiter को company के official careers page या HR contact से verify करें।',
  'fake-offer.flag.free-mail.title': 'Recruiter email free mailbox से है ({domain})',
  'fake-offer.flag.free-mail.detail':
    'Corporate hiring teams लगभग हमेशा अपने company domain से mail करती हैं। Gmail, Yahoo, Outlook जैसे free providers से आया offer impersonation का strong signal है।',
  'fake-offer.flag.free-mail.hint':
    "Company की website पर official careers email या HR contact ढूँढें और confirm करें कि यह recruiter वहाँ listed है।",
  'fake-offer.flag.lookalike-domain.title': 'Email domain {company} की नकल हो सकता है',
  'fake-offer.flag.lookalike-domain.detail':
    'Sender domain किसी जाने-माने company name से मिलता-जुलता है — digit swaps (o→0), "-hr/-careers/-jobs" labels, या .co जैसे unusual TLDs। ध्यान दें: .io और .ai startup domains में आम हैं — unusual TLD verify करने की वजह है, fraud का proof नहीं।',
  'fake-offer.flag.lookalike-domain.hint':
    'Reply या documents share करने से पहले domain को company की official website domain से character-by-character compare करें।',
  'fake-offer.flag.whatsapp-only.title': 'Offer process को सिर्फ़ WhatsApp या Telegram पर ले जाना चाहता है',
  'fake-offer.flag.whatsapp-only.detail':
    'Scammers candidates को email से messaging apps पर ले जाते हैं जहां बातचीत verify और document करना मुश्किल है। असली employers formal email use करते हैं।',
  'fake-offer.flag.whatsapp-only.hint':
    'Official company email पर बात जारी रखने की ज़िद करें और corporate domain पर verifiable HR contact माँगें।',
  'fake-offer.flag.epfo-hint.title': 'Check करें कि employer EPFO में registered है या नहीं',
  'fake-offer.flag.epfo-hint.detail':
    'EPFO की establishment register में company name search करें और देखें कि employer की active PF registration है या नहीं।',
  'fake-offer.flag.epfo-hint.hint': 'EPFO member portal: https://www.epfindia.gov.in/',
  'fake-offer.flag.mca-hint.title': 'Confirm करें कि company MCA records में है',
  'fake-offer.flag.mca-hint.detail':
    'Ministry of Corporate Affairs portal पर company name look up करें और confirm करें कि यह India में registered company है।',
  'fake-offer.flag.mca-hint.hint': 'MCA company search: https://www.mca.gov.in/',
  'fake-offer.verify': 'Verify करें:',

  // ---- Notice buyout ----
  'notice-buyout.title': 'Notice Buyout',
  'notice-buyout.desc': 'Notice पूरा serve किए बिना छोड़ने में क्या cost लगती है — या F&F से वे कितना recover करते हैं।',
  'notice-buyout.formTitle': 'जो notice serve नहीं किया',
  'notice-buyout.basis': 'Letter इस्तेमाल करती है',
  'notice-buyout.basis.basic': 'Basic प्रति महीना',
  'notice-buyout.basis.gross': 'Gross प्रति महीना',
  'notice-buyout.mode': 'कौन pay करता है',
  'notice-buyout.mode.pay': 'जल्दी निकलने के लिए पैसा मुझे देना है',
  'notice-buyout.mode.recover': 'वे मेरे F&F से recover करते हैं',
  'notice-buyout.days': 'Unserved दिन',
  'notice-buyout.basic': 'महीने का basic',
  'notice-buyout.gross': 'महीने का gross',
  'notice-buyout.verdict.pay': 'बाक़ी notice buyout करने में लगभग {amount} लगेगा। यह letter तय करती है, कोई कानून नहीं।',
  'notice-buyout.verdict.recover': 'Unserved notice के बदले company F&F से लगभग {amount} काट सकती है। Appointment letter check करें।',
  'notice-buyout.leaveDays': 'Notice के बदले लगाए गए leave days',
  'notice-buyout.leaveDaysHint': 'अगर offset करने नहीं देंगे तो 0 रखें। Unserved days से ज़्यादा कभी नहीं।',
  'notice-buyout.leaveApplied': '{days} leave days लगाए गए — {net} unserved days बचे। इनके बिना quote {before} है।',
  'notice-buyout.leaveCandidate': 'Leave को notice के बदले लगाया जा सकता है या नहीं, यह आपके appointment letter और company policy से तय होता है, किसी statute से नहीं। भरोसा करने से पहले लिखित में ले लें।',
  'notice-buyout.divisor':
    'ज़्यादातर letters monthly figure को 30 से divide करती हैं, 26 से नहीं और actual calendar month से भी नहीं। यह contractual practice है, कानून नहीं।',
  'notice-buyout.bothBases': 'दोनों bases, side by side',
  'notice-buyout.row.basic': 'Monthly basic पर',
  'notice-buyout.row.gross': 'Monthly cash gross पर',
  'notice-buyout.gstNote': 'Notice buyout पर GST / income-tax का treatment disputed है — यह tool कोई tax compute नहीं करता।',

  // ---- Gratuity ----
  'gratuity.title': 'Gratuity',
  'gratuity.desc': 'आप eligible हैं या नहीं, कितना मिलेगा, और कौन सी date आपको line के पार ले जाती है।',
  'gratuity.formTitle': 'आपकी service और pay',
  'gratuity.basic': 'महीने का basic + DA',
  'gratuity.basicHint': 'Last drawn, CTC नहीं। Basic और dearness allowance; pay का और हिस्सा कब गिना जाता है, यह result के नीचे वाला note बताता है।',
  'gratuity.join': 'Join करने की date',
  'gratuity.exit': 'Last working day (आख़िरी दिन)',
  'gratuity.covered': 'Employer के पास अभी या पहले कभी 10 या ज़्यादा लोग रहे हैं',
  'gratuity.coveredHint': 'Code on Social Security, 2020 के तहत gratuity उस establishment पर लागू होती है जहाँ पिछले बारह महीनों में किसी भी दिन दस या ज़्यादा employees रहे हों, और बाद में संख्या घटने पर भी लागू रहती है (First Schedule item V; s.1(8))। हम पूछते हैं; मानकर नहीं चलते।',
  'gratuity.week5.label': '5-day work week (शनि–रवि बंद)',
  'gratuity.week5.hint': '5-day establishment में पाँचवें साल के 4 साल + 190 working days पर qualify होते हैं; 6-day वाले को 240 working days चाहिए। Weekly off नहीं गिनते। यह सबसे पहली मुमकिन date है — public holidays और unpaid या unearned leave से यह आगे खिसक सकती है।',
  'gratuity.verdict.yes': 'Gratuity लगभग {amount}। आपके {years} completed years हैं, इसलिए आप eligible हैं।',
  'gratuity.formula': 'हिसाब: 15/26 × last drawn basic + DA × payable years।',
  'gratuity.verdict.no': 'अभी नहीं: अब तक {years} completed years।',
  'gratuity.flip': 'यह बदलने वाली अगली date: {date}।',
  'gratuity.note.s42-rounding':
    'Code on Social Security, 2020 s.53(2) के तहत service के साल का कोई भी हिस्सा छह महीने से ज़्यादा हुआ तो पूरा साल गिना जाता है; ठीक छह महीने नहीं।',
  'gratuity.note.act-may-not-apply':
    'Code on Social Security, 2020 शायद इस employer पर apply न हो (यहाँ कभी दस या ज़्यादा employees नहीं रहे)। Company policy से फिर भी gratuity मिल सकती है।',
  'gratuity.note.ineligible-service': 'Service 5 completed years से कम है और 4-years-plus fast path से भी कम (5-day week पर 190 working days, 6-day पर 240 working days — weekend नहीं गिनता)। पूरे 5 साल पूरे होने की date पर कोई बहस नहीं हो सकती।',
  'gratuity.note.cap-applied': '₹20,00,000 पर cap लगा है। यह ceiling 2018 में पुराने Act के तहत notify हुई थी। Code (s.53(3)) के तहत सरकार नई ceiling notify कर सकती है; check करते समय कोई नई नहीं मिली।',
  'gratuity.note.code-wages':
    '21 नवंबर 2025 से gratuity Code on Social Security, 2020 की “wages” (s.2(88)) पर मिलती है: basic और DA, और अगर HRA, conveyance जैसे excluded हिस्से आपकी pay के आधे से ज़्यादा हैं तो उससे ऊपर वाला हिस्सा भी। यह सिर्फ़ basic + DA पर है, इसलिए इसे कम से कम की रकम मानें।',

  // ---- Leave encashment ----
  'leave-encashment.title': 'Leave Encashment',
  'leave-encashment.desc':
    'Resignation हो या retirement, leave encashment Income-tax Act, 2025 की s.19(1) के तहत ₹25,00,000 तक exempt है।',
  'leave-encashment.formTitle': 'Encash करने का balance',
  'leave-encashment.days': 'Leave दिन',
  'leave-encashment.basic': 'Monthly basic',
  'leave-encashment.basis': 'Daily rate',
  'leave-encashment.basis.26': '÷ 26 (working-day convention)',
  'leave-encashment.basis.30': '÷ 30 (calendar-month convention)',
  'leave-encashment.reason': 'आप क्यों छोड़ रहे हैं',
  'leave-encashment.reason.resign': 'Resignation (switch)',
  'leave-encashment.reason.retire': 'Retirement / superannuation',
  'leave-encashment.verdict.resign': 'आपकी बची leave के लिए {amount}, Income-tax Act, 2025 की s.19(1) के तहत ₹25,00,000 तक tax-free।',
  'leave-encashment.verdict.retire': 'आपकी बची leave के लिए {amount}, Income-tax Act, 2025 की s.19(1) के तहत ₹25,00,000 तक tax-free।',
  'leave-encashment.caseNote': 'Bombay High Court ने CIT v. D.P. Malhotra में कहा था कि "retirement, whether on superannuation or otherwise" resignation को भी cover करता है।',
  'leave-encashment.limbsNote': 'दो limbs जो यह tool compute नहीं करता, हर साल की service के 30 दिन leave और 10 महीनों की average salary, इस amount को सिर्फ़ घटा सकते हैं, बढ़ा नहीं सकते। किसी CA से confirm कर लें।',
  'leave-encashment.gross': 'Gross',
  'leave-encashment.exempt': 'Tax-free (यहाँ के हिसाब से)',
  'leave-encashment.taxable': 'Taxable',
  'leave-encashment.note':
    'Provisional है। 26 बनाम 30 पर employer की practice अलग-अलग होती है। यह tool सिर्फ़ ₹25,00,000 की notified ceiling और मिली हुई amount apply करता है; leave-days या average-salary वाले limbs model नहीं करता।',

  // ---- F&F checker ----
  'fnf-checker.title': 'F&F Checker',
  'fnf-checker.desc': 'Full-and-final sheet फिर से calculate करें: unpaid leave, notice recovery, gratuity, और क्या आप उन्हें कुछ owe करते हैं।',
  'fnf-checker.formTitle': 'Sheet जो claim करती है',
  'fnf-checker.join': 'Join करने की date',
  'fnf-checker.lwd': 'Last working day (आख़िरी दिन)',
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
  'fnf-checker.line.salary': 'Salary (पूरा महीना)',
  'fnf-checker.line.notice': 'Notice recovery',
  'fnf-checker.line.unpaid-leave': 'Unpaid leave recovery',
  'fnf-checker.line.gratuity': 'Gratuity',
  'fnf-checker.mailTitle': 'Dispute mail का draft',
  'fnf-checker.mailHr': 'HR contact का नाम',
  'fnf-checker.mailHrHint': 'खाली छोड़ेंगे तो mail "Dear HR team" से शुरू होगी।',
  'fnf-checker.mailYou': 'आपका नाम',
  'fnf-checker.mailBlocked': 'Email copy करने के लिए अपना नाम भरें।',
  'fnf-checker.mailNothing': 'Sheet की हर line recomputation से मिल रही है, तो dispute करने को कुछ नहीं है। कोई mail draft नहीं हुई।',
  'fnf-checker.mailNote': 'भेजने से पहले पढ़ लें। यह basis पूछती है, किसी पर इलज़ाम नहीं लगाती।',
  'fnf-checker.mail.subject': 'Subject: Full and final settlement — {n} lines पर reconciliation की request',
  'fnf-checker.mail.subjectOne': 'Subject: Full and final settlement — 1 line पर reconciliation की request',
  'fnf-checker.mail.greeting': 'Dear {hr},',
  'fnf-checker.mail.hrTeam': 'HR team',
  'fnf-checker.mail.intro':
    '{lwd} को ख़त्म हुई मेरी employment का full and final settlement statement भेजने के लिए धन्यवाद। इसे close करने से पहले मैं नीचे दी गई lines अपनी calculation से मिलाना चाहता/चाहती हूँ।',
  'fnf-checker.mail.short':
    '{n}. {label} — statement में {claimed} दिख रहा है। मेरी calculation {recomputed} देती है, यानी {delta} का फ़र्क़ मेरे हक़ में। क्या आप इस्तेमाल किया गया basis बता सकते हैं?',
  'fnf-checker.mail.over':
    '{n}. {label} — statement में {claimed} है, जबकि मेरी calculation {recomputed} देती है। इसे इसलिए बता रहा/रही हूँ ताकि बाद में यह recovery बनकर वापस न आए।',
  'fnf-checker.mail.missing':
    '{n}. {label} — यह line मुझे statement पर नहीं दिख रही। मेरी calculation {recomputed} देती है। क्या आप बता सकते हैं कि इसे किस basis पर छोड़ा गया है?',
  'fnf-checker.mail.notice-recovery':
    '{n}. Notice recovery — {claimed} काटा गया है। क्या आप बता सकते हैं कि यह किस clause से है, basic पर है या gross पर, और divisor क्या लिया गया है?',
  'fnf-checker.mail.close':
    'अगर ऊपर में से कुछ भी किसी clause को मेरे ग़लत पढ़ने की वजह से है, तो मुझे सुधार स्वीकार है — revised statement या calculation basis से दोनों तरह बात साफ़ हो जाएगी।',
  'fnf-checker.mail.signoff': 'Regards,\n{name}',
  'fnf-checker.flag.negative-net': 'आपको उन्हें देना पड़ सकता है — recomputed net −₹{amount} है; recoveries earnings से ज़्यादा हैं।',
  'fnf-checker.flag.notice-recovery': '₹{amount} notice के नाम पर recover हुआ है — appointment letter में basis (basic बनाम gross) और divisor check करें।',
  'fnf-checker.weekAssumed':
    'यह 5-day week मानकर है। 6-day week पर इन्हीं dates के लिए पाँचवें साल में 190 नहीं, 240 working days चाहिए, इसलिए gratuity शायद अभी due न हो। Check करने के लिए home page पर work week वाला सवाल answer करें।',
  'fnf-checker.flag.gratuity-missing':
    'इस sheet में gratuity की line नहीं है। आपकी service पर यह कम से कम ₹{amount} बनता है। अगर आप Code on Social Security, 2020 के तहत eligible हैं, तो HR से writing में settlement में शामिल करने को कहें।',

  // ---- Two Form-16 shock ----
  'form16-shock.title': 'दो Form-16 का झटका',
  'form16-shock.desc': 'दोनों employers ने आपको slab benefit दिया। एक return में इन्हें साथ मिलाना पड़ता है।',
  'form16-shock.formTitle': 'इस FY में, दो Form-16s',
  'form16-shock.e1gross': 'पहला employer: taxable salary',
  'form16-shock.e1tds': 'पहला employer: TDS',
  'form16-shock.e2gross': 'दूसरा employer: taxable salary',
  'form16-shock.e2tds': 'दूसरा employer: TDS',
  'form16-shock.verdict.owe': 'Combine करने के बाद, लगभग {amount} अभी भी due हो सकता है। महीना 1 में employer 2 को Form 12B दें।',
  'form16-shock.verdict.ok': 'TDS पहले से combined bill cover कर रहा है, इस simplified picture में {amount} की slack है।',
  'form16-shock.taxable': 'Combined taxable (एक standard deduction)',
  'form16-shock.tax': 'अगर यह एक employer होता तो Tax',
  'form16-shock.tds': 'पहले से deduct हुआ TDS',
  'form16-shock.stdNote': 'हर payroll ने probably आपको पूरा standard deduction दिया। Return सिर्फ़ एक allow करता है।',
  'form16-shock.omit234':
    'Advance-tax interest (Income-tax Act, 2025 की s.424/425 — पुराने 234B/234C) तब तक omit किया गया है जब तक कोई CA review न करे — यह tax gap है, penalty model नहीं।',
  'form16-shock.form12bTitle': 'Employer 2 को देने वाला Form 12B text',
  'form16-shock.form12b':
    'इस FY में previous employer: salary/gross {gross}, TDS {tds}। कृपया मेरी बाक़ी salary पर tax deduct करते समय इस income को ध्यान में रखें (Form 12B)।',
  'form16-shock.form12bNote': 'यह एक plain summary है, statutory form नहीं — payroll इससे आपकी बाक़ी TDS का अंदाज़ा लेता है।',

  // ---- Resignation letter ----
  'resignation-letter.title': 'Resignation Letter',
  'resignation-letter.desc': 'तीन में से किसी एक tone में resignation letter लिखें, last working day दोनों तरह से गिनकर, जैसे letters गिनते हैं।',
  'resignation-letter.formTitle': 'Letter',
  'resignation-letter.formHint': 'आपका draft सिर्फ़ इस device पर save होता है, कभी upload नहीं होता।',
  'resignation-letter.company': 'Company का नाम',
  'resignation-letter.manager': 'आपके Manager',
  'resignation-letter.role': 'आपका role',
  'resignation-letter.date': 'Resign करने की date',
  'resignation-letter.notice': 'Notice period',
  'resignation-letter.join': 'नई join date (चाहें तो)',
  'resignation-letter.joinHint': 'इसका इस्तेमाल सिर्फ़ यह बताने के लिए होता है कि EPFO की dates overlap तो नहीं कर रहीं। चाहें तो खाली छोड़ दें।',
  'resignation-letter.tone': 'Letter का tone',
  'resignation-letter.tone.professional': 'Professional',
  'resignation-letter.tone.grateful': 'आभार वाला',
  'resignation-letter.tone.firm': 'Firm और छोटा',
  'resignation-letter.verdict': 'पूरा notice serve करने पर last working day: {lwd}।',
  'resignation-letter.yourName': 'आपका नाम',
  'resignation-letter.yourNameHint': 'Signature में जाएगा।',
  'resignation-letter.empId': 'Employee ID (चाहें तो)',
  'resignation-letter.empIdHint': 'सिर्फ़ इसी page पर रहता है।',
  'resignation-letter.copyBlocked': 'Letter copy करने के लिए company, अपना role, अपने manager का नाम और अपना नाम भरें।',
  'resignation-letter.earliestJoin': 'EPFO overlap के बिना सबसे जल्दी join date: {date} — यानी last working day के अगले दिन।',
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
  'manager-script.desc': 'सामने resign करते समय क्या कहें — supportive room, counter-offer का risk, या hard room।',
  'manager-script.formTitle': 'जिस room में आप जा रहे हैं',
  'manager-script.preset': 'यह manager आमतौर पर कैसा है',
  'manager-script.preset.supportive': 'Supportive',
  'manager-script.preset.counter-risk': 'Counter कर सकते हैं',
  'manager-script.preset.hostile': 'Push back कर सकते हैं',
  'manager-script.verdict.supportive': 'पहले शुक्रिया कहें, फिर date बताएं। नए role के बारे में ज़्यादा सफ़ाई न दें।',
  'manager-script.verdict.counter-risk': 'Room में जाने से पहले decide कर लें। अगर फिर भी जाना है, तो एक बार साफ कह दें।',
  'manager-script.verdict.hostile': 'Short रखें, बाद में writing में confirm करें। Room में policy पर बहस न करें।',
  'manager-script.body.supportive': 'आपको सबसे पहले बताना ज़रूरी था। मैंने दूसरा role accept कर लिया है, और फ़ैसला पक्का है। पूरा notice serve करने पर last working day [LWD] बनता है। इस हफ्ते तक handover लिखकर दे दिया जाएगा। यहाँ के काम के लिए शुक्रिया, और यहाँ से अच्छे note पर निकलना है।',
  'manager-script.body.counter-risk': 'मैंने दूसरा offer accept कर लिया है। टीम की इज़्ज़त है, इसलिए पहले आपको बताया। अगर company counter देना चाहे तो एक बार, writing में भेज दे; उसे देख लिया जाएगा। पर इसे हफ्ते भर की meetings नहीं बनाना है। Handover दोनों हालत में साफ़-सुथरा रहेगा।',
  'manager-script.copyBlocked': 'आपकी last working day की जगह [LWD] छोड़ा गया है। पहले resignation letter लिखें, फिर यह अपने-आप भर जाएगा।',
  'manager-script.body.hostile':
    'यह resignation है। Letter inbox में है / यहाँ paper पर है। Notice के हिसाब से last working day [LWD] है। Handover पूरा किया जाएगा। इस meeting में decision पर बहस नहीं करनी। HR को कुछ चाहिए तो mail किया जा सकता है।',

  // ---- HR templates ----
  'hr.lead': 'इसे copy करें, [brackets] भरें और खुद भेजें। यहाँ से कुछ भी इस device से बाहर नहीं जाता।',
  'manager-script.lead': 'आमने-सामने कहें, फिर writing में follow up करें।',
  'hr.switcher': 'और scripts',
  'hr.disclaimer': 'Templates हैं, legal advice नहीं। भेजने से पहले इन्हें अपनी appointment letter से match करें।',
  'hr.expected-ctc.title': 'Expected CTC',
  'hr.expected-ctc.desc': 'जब recruiter band share करने से पहले एक number माँगे।',
  'hr.early-release.body': 'नमस्ते [Manager name],\n\nमैंने [date] को अपना resignation share किया था, notice के हिसाब से last working day [LWD] है।\n\n[new joining date] को अगली job join करनी है, इसलिए early release से समय पर शुरुआत करने में मदद मिलेगी। एक written handover पूरा किया जाएगा, और जाने के बाद भी सवालों के लिए संपर्क बना रहेगा। क्या हम early release या बचे हुए notice का buyout देख सकते हैं, ताकि मेरा आख़िरी दिन [proposed LWD] हो सके?\n\nजो appointment letter allow करती है, वही follow किया जाएगा। ध्यान देने के लिए धन्यवाद।',
  'hr.buyout-ask.body': 'नमस्ते [HR name],\n\nक्या आप confirm कर सकते हैं कि मेरी letter में notice buyout कैसे काम करता है — basic पर या gross पर, और divisor 30 दिन है?\n\nमेरा सुझाव है कि [proposed last day] को last working day रखा जाए। Buyout allowed हो तो कृपया amount बताएं, और यह भी कि वह F&F से recover होगा या relieving से पहले मुझे देना होगा।\n\nदोनों सूरत में handover पूरा किया जाएगा।',
  'hr.decline-accepted.body': 'नमस्ते [Recruiter / HR name],\n\n[company] में [role] के offer के लिए फिर से धन्यवाद। अच्छी तरह सोचने के बाद, मुझे अपनी acceptance वापस लेनी है। फ़ैसला हो चुका है — join नहीं किया जाएगा।\n\nदिक्कत के लिए माफ़ी। कृपया इस mail को मेरा formal decline मानें।\n\nआपके समय के लिए धन्यवाद, और team के लिए शुभकामनाएं।',
  'hr.counter-offer-reply.body': 'नमस्ते [Manager name],\n\nCounter-offer के लिए और बात करने का समय निकालने के लिए धन्यवाद।\n\nइस पर अच्छी तरह सोच लिया है, और नए role के साथ आगे बढ़ने का फ़ैसला हो चुका है।\n\nHandover साफ़-सुथरा रहेगा और तय notice पूरा किया जाएगा। यहाँ के सालों के लिए धन्यवाद — यहाँ से अच्छे relations के साथ निकलना है, और संपर्क बना रहे यही उम्मीद है।',
  'hr.recruiter-followup.body': 'नमस्ते [Name],\n\n[date] की discussion के बाद [company] में [role] पर यह follow-up है। इस role में मेरी interest बनी हुई है। कोई भी extra document चाहिए तो बता दें, तुरंत भेज दिया जाएगा।\n\nअगर timeline बदल गया है, तो एक line का update मुझे current employer के साथ notice plan करने में मदद करेगा। धन्यवाद।',
  'hr.expected-ctc.formTitle': 'आपके दो numbers',
  'hr.expected-ctc.role': 'Role',
  'hr.expected-ctc.roleHint': 'पहली line में जाएगा।',
  'hr.expected-ctc.current': 'Current CTC (सालाना)',
  'hr.expected-ctc.expected': 'Expected CTC (सालाना)',
  'hr.expected-ctc.body': '{role} role के लिए बातचीत के लिए धन्यवाद।\n\nमेरे लिए यह role सिर्फ़ एक headline number का मामला नहीं है; total compensation और काम का scope भी उतना ही मायने रखता है। मेरी current CTC सालाना {current} है, और similar scope के लिए मेरा target लगभग {expected} है। अगर आप इस level का band बता दें, तो हम तुरंत देख सकते हैं कि range मेल खाती है या नहीं। Band आने के बाद structure — fixed vs variable, notice, joining bonus — पर बात करने में ख़ुशी होगी।',
  'hr.expected-ctc.copyBlocked': 'Reply copy करने के लिए role और दोनों numbers भरें।',
  'hr.expected-ctc.placeholderCurrent': '[आपका current CTC]',
  'hr.expected-ctc.placeholderExpected': '[आपका expected CTC]',
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
  'counter-offer.outside': 'बाहर वाला offer',
  'counter-offer.promo': 'उन्होंने promotion / title का वादा किया',
  'counter-offer.team': 'रुकने की वजह Team है',
  'counter-offer.verdict.out':
    'Outside offer से लगभग {bank}/month ज़्यादा in-hand मिलता है। कागज़ पर यह {paper} ज़्यादा है।',
  'counter-offer.verdict.in': 'यह counter इस simplified structure पर outside CTC को match या beat करता है। Non-rupee reasons फिर भी matter करते हैं।',
  'counter-offer.honest': 'Counter-offer लेने वाले लोग अक्सर एक साल के अंदर वैसे भी चले जाते हैं, क्योंकि भरोसा पहले ही टूट चुका होता है। ऐसा कितनी बार होता है, इसका कोई भरोसेमंद आंकड़ा हमें नहीं मिला, इसलिए हम कोई आंकड़ा नहीं देते। Counter को stay-or-go decision मानें, bidding war नहीं।',
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
  'handover-doc.verdict': 'इसे email या doc में copy करें। Passwords और keys इसमें न डालें।',
  'handover-doc.disclaimer': 'यह एक handover aid है, legal document नहीं। Passwords paste न करें।',
  'handover-doc.md.title': 'Handover — {role}',
  'handover-doc.md.owner': 'मेरे जाने के बाद owner: {owner}',
  'handover-doc.md.projects': 'Projects / status',
  'handover-doc.md.access': 'Access और artefacts',
  'handover-doc.md.risks': 'अगर यह drop हुआ तो risks',
  'handover-doc.md.projectsHint': '_चल रहा काम, tickets, और किससे पूछना है, यहाँ लिखें।_',
  'handover-doc.md.accessHint': '_Repos, dashboards, rotate करनी हैं keys, docs।_',
  'handover-doc.md.risksHint': '_Dates, customers, audits।_',
  'handover-doc.copyBlocked': 'Note copy करने के लिए अपना role, अगले owner का नाम और projects भरें।',

  // ---- Relieving chaser ----
  'relieving-chaser.title': 'Relieving Chaser',
  'relieving-chaser.desc': 'अगर relieving letter नहीं आई है तो Day 7, 14 और 30 वाले mails।',
  'relieving-chaser.formTitle': 'किसे chase करना है',
  'relieving-chaser.company': 'Company',
  'relieving-chaser.hr': 'HR का नाम',
  'relieving-chaser.role': 'जो role आपने छोड़ी',
  'relieving-chaser.lwd': 'Last working day (आख़िरी दिन)',
  'relieving-chaser.day': 'कौन सा chase',
  'relieving-chaser.day.7': 'Day 7 — polite',
  'relieving-chaser.day.14': 'Day 14 — firm',
  'relieving-chaser.day.30': 'Day 30 — escalation',
  'relieving-chaser.verdict.7': 'एक छोटा nudge। मानें कि वे busy हैं, hostile नहीं।',
  'relieving-chaser.verdict.14': 'एक date माँगें। अगर safe हो तो अपने manager को copy करें।',
  'relieving-chaser.verdict.30': 'इस letter के बिना background checks रुक जाते हैं। एक firm date माँगें।',
  'relieving-chaser.body.7': 'नमस्ते {hr},\n\nमैंने {company} को {role} के रूप में {lwd} पर छोड़ा था। क्या relieving letter और F&F पर एक update मिल सकता है? कोई document अभी pending हो तो भेजने को तैयार हूं।\n\nधन्यवाद',
  'relieving-chaser.body.14': 'नमस्ते {hr},\n\n{company} ({role}, LWD {lwd}) से मेरी relieving letter पर यह एक follow-up है। कृपया वह date बताएं जिस तक यह issue हो जाएगी, या मेरी तरफ़ से जो checklist अभी open है वह बताएं।\n\nयह नए employer पर background verification को block कर रहा है। धन्यवाद',
  'relieving-chaser.body.30': 'नमस्ते {hr},\n\n{company} में {role} के रूप में मेरे last working day ({lwd}) को 30 दिन हो गए हैं। मुझे अभी तक relieving letter नहीं मिली है।\n\nकृपया अभी का status और इस हफ्ते issue होने की एक date बताएं। यह letter मेरी background verification block कर रही है, इसलिए यह time-sensitive है। मेरी तरफ़ से जो भी document pending है, वह तुरंत भेज दिया जाएगा।\n\nRegards',
  'relieving-chaser.setLwd': 'पहले बीत चुकी last working day set करें — LWD के बाद ही chase समझ आता है।',
  'relieving-chaser.fillFields': 'Email copy करने के लिए company, HR contact का नाम और अपना role भरें।',
  // ---- EPF transfer ----
  'epf-transfer.title': 'EPF Transfer',
  'epf-transfer.desc': 'Online Form 13, unmarked date-of-exit, KYC mismatches, और जल्दी withdraw करना आमतौर पर क्यों ज़्यादा costly move है।',
  'epf-transfer.formTitle': 'आपका PF account',
  'epf-transfer.intent': 'आप क्या करना चाहते हैं',
  'epf-transfer.intent.transfer': 'नए employer को Transfer करें (Form 13)',
  'epf-transfer.intent.withdraw': 'Balance cash में withdraw करें',
  'epf-transfer.join': 'इस employer के साथ join किया',
  'epf-transfer.tenureScope':
    'यहाँ गिने गए years सिर्फ़ इस employer के हैं। जो PF आप पहले transfer कर चुके हैं वह add नहीं है — अगर aggregate continuous service पहले ही 5 साल से ज़्यादा है, तो portal / किसी CA से confirm करें।',
  'epf-transfer.exit': 'Last working day / date of exit',
  'epf-transfer.doe': 'Old employer ने EPFO पर date of exit mark कर दी है',
  'epf-transfer.name': 'UAN पर नाम Aadhaar से match करता है',
  'epf-transfer.dob': 'UAN पर date of birth Aadhaar से match करती है',
  'epf-transfer.verdict.transfer': '{years} completed years। Form 13 से transfer करने पर आपका PF balance और उसका interest fund में ही रहता है।',
  'epf-transfer.verdict.withdraw':
    '{years} completed years। 5 साल से पहले cash withdrawal आमतौर पर taxable path है — इसके बदले transfer करें।',
  'epf-transfer.verdict.okWithdraw':
    '{years} completed years। 5 साल की continuous service के बाद withdrawal आमतौर पर exempt case है — फिर भी portal पर confirm करें।',
  'epf-transfer.flag.prefer-transfer': '"Start clean" के लिए withdraw न करें। Transfer switcher का move है।',
  'epf-transfer.flag.premature-withdrawal':
    'Recognised PF की premature withdrawal पर TDS लग सकता है और employer contribution plus interest पर tax। यह tool कोई rupee figure नहीं बनाता। इसके बदले transfer करें, फिर किसी CA से confirm करें।',
  'epf-transfer.flag.doe-unmarked':
    'Online transfer अक्सर तब तक freeze रहता है जब तक old employer date of exit mark न करे। इसे member portal पर raise करें और उसी दिन HR को mail करें।',
  'epf-transfer.flag.name-mismatch':
    'Aadhaar से name mismatch claims को block करता है। Form 13 file करने से पहले employer के through KYC update कराएं।',
  'epf-transfer.flag.dob-mismatch': 'Aadhaar से date-of-birth mismatch claims को block करता है। वही remedy: employer KYC, फिर retry।',
  'epf-transfer.flag.interest-after-exit':
    'Employment छोड़ने के बाद credited interest taxable हो सकता है अगर balance untransferred रहे। Transfer करने से यह recognised fund के अंदर ही रहता है।',
  'epf-transfer.flag.five-year-exempt':
    '5 साल की continuous recognised-PF service के बाद withdrawal आमतौर पर exempt case है। Portal और किसी CA से confirm करें। यह tool कोई rupee नहीं बनाता।',
  'epf-transfer.steps': 'Form 13 का path (member portal)',
  'epf-transfer.step.activate-uan': 'EPFO member portal पर अपना UAN activate करें / log in करें।',
  'epf-transfer.step.kyc': 'Aadhaar, PAN और bank seed करें। Name और DOB Aadhaar से match होना चाहिए।',
  'epf-transfer.step.form13': 'Date of exit mark होने के बाद नए member ID के against online transfer claim (Form 13) file करें।',
  'epf-transfer.step.track-claim': 'Claim track करें। अगर यह अटक जाए, तो usual blocker unmarked date of exit या KYC mismatch होता है।',
  'epf-transfer.portal': 'EPFO Member Portal',
  'epf-transfer.provisional': 'PF withdrawal पर tax का अभी chartered accountant ने review नहीं किया है। इसे provisional मानें, tax advice नहीं।',

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
  'bgv-prep.verdict.risk': 'यहाँ कुछ UAN या HR calls पर सामने आएगा। पूछने से पहले paper तैयार रखें।',
  'bgv-prep.item.core-docs':
    'PAN, Aadhaar, degree certificates, आख़िरी 3 महीनों की payslips, PF UAN history, address proofs। Colour scans रखें।',
  'bgv-prep.item.employment-gap':
    'एक-लाइन का reason लिखें (study, health, job search, caregiving)। Vendors gaps flag करते हैं; साफ explanation पर fail करना rare है।',
  'bgv-prep.item.dual-pf':
    'Overlapping दो UANs/employment records moonlighting जैसे दिखते हैं। Passbook dates निकालें और explain करने को तैयार रहें — इन्हें छिपाएं नहीं।',
  'bgv-prep.item.relieving-pending': 'BGV पिछली HR को call करेगा। अभी day-7 वाली relieving chaser भेजें और email thread रखें।',
  'bgv-prep.item.type-product': 'Product companies आमतौर पर education + last employment चाहती हैं। Offer letter और last increment letter मदद करते हैं।',
  'bgv-prep.item.type-services': 'Services firms अक्सर client-location letters चाहती हैं अगर आप deputed थे। Exit से पहले old HR से पूछ लें।',
  'bgv-prep.item.type-gcc': 'GCCs education और address checks सख़्ती से करते हैं। सिर्फ़ degree नहीं, semester marksheets भी रखें।',
  'bgv-prep.item.type-startup': 'नए startups में PF या साफ org chart न भी हो। Bank salary credits और grant letter रखें।',

  // ---- Insurance gap ----
  'insurance-gap.title': 'Insurance Gap',
  'insurance-gap.desc': 'Group cover आपके last working day पर ख़त्म हो जाता है। अगले employer की policy शुरू होने तक uncovered दिन count करें।',
  'insurance-gap.formTitle': 'Uncovered समय',
  'insurance-gap.lwd': 'Last working day (आख़िरी दिन)',
  'insurance-gap.join': 'नई join date',
  'insurance-gap.personal': 'मेरे पास पहले से personal / parent floater है',
  'insurance-gap.verdict.none': 'Next-day join। Group cover बिना किसी calendar gap के hand off होता है।',
  'insurance-gap.verdict.gap': '{lwd} के बाद {days} दिन बिना cover के। Group mediclaim उस शाम रुक जाता है।',
  'insurance-gap.verdict.gapOne': '{lwd} के बाद 1 दिन बिना cover के। Group mediclaim उस शाम रुक जाता है।',
  'insurance-gap.verdict.covered': 'Jobs के बीच {days} दिन, लेकिन आपके पास पहले से personal cover है।',
  'insurance-gap.verdict.coveredOne': 'Jobs के बीच 1 दिन, लेकिन आपके पास पहले से personal cover है।',
  'insurance-gap.overlap': 'LWD पर या उससे पहले join करने से EPFO पर दो employers overlap करते हैं। यह BGV/PF की problem है, insurance की जीत नहीं।',
  'insurance-gap.factors': 'Family floater की कीमत किन बातों से बदलती है',
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
  'tax-declaration.profileHint': 'Decoder से seed किया गया है। यहाँ fields बदलने से Decoder overwrite नहीं होता।',
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
    'HRA: monthly rent receipts। Rent ₹1 lakh/साल से ऊपर जाने पर आमतौर पर landlord का PAN चाहिए (employer process)।',
  'tax-declaration.proof.80c': '80C: investment proofs। Payroll आमतौर पर January तक माँगता है।',
  'tax-declaration.proof.80d': '80D: अगर declare किया है तो health-premium receipts।',
  'tax-declaration.proof.form16-prev':
    'Previous employer का Form 16 अक्सर आपके जाने के हफ्तों बाद आता है। File करने के लिए आपको फिर भी चाहिए। इसे relieving letter जैसे chase करें।',
  'tax-declaration.proof.form12b':
    'महीना 1 में नए payroll को Form 12B (previous income/TDS) दें। Income-tax Act, 2025 की s.392(4)(a)(i) multi-employer withholding — exact mechanism किसी CA से confirm करें।',

  // ---- Notice tracker ----
  'notice-tracker.title': 'Notice Tracker',
  'notice-tracker.desc': 'Dates और एक checklist: F&F, asset return, insurance end, PF date of exit।',
  'notice-tracker.formTitle': 'आपकी notice dates',
  'notice-tracker.resign': 'Resignation date',
  'notice-tracker.notice': 'Notice period',
  'notice-tracker.verdict.left': 'Last working day ({lwd}) तक {days} दिन।',
  'notice-tracker.verdict.served': 'Notice serve हो गया है। Last working day {lwd} था।',
  'notice-tracker.item.handover': 'Team के साथ Handover doc',
  'notice-tracker.item.fnf-docs': 'Payroll को F&F inputs (bank, address, claims)',
  'notice-tracker.item.asset-return': 'Laptop, ID card, SIM, access cards',
  'notice-tracker.item.insurance-end': 'Group mediclaim ख़त्म होता है',
  'notice-tracker.item.pf-doe': 'HR से PF date of exit mark करने को कहें',
  'notice-tracker.item.relieving-chase': 'अगर relieving letter नहीं है, तो day-7 वाला chase शुरू करें',
  'notice-tracker.open': '{tool} खोलें',
  'notice-tracker.due': '{date} तक due',

  // ---- Bond scanner ----
  'bond-scanner.title': 'Bond Scanner',
  'bond-scanner.desc': 'Bond, non-compete या probation clause paste करें। यह patterns flag करता है — यह कोई court नहीं है।',
  'bond-scanner.formTitle': 'Clause paste करें',
  'bond-scanner.text': 'Offer / appointment text',
  'bond-scanner.textHint':
    'Bond या restraint वाला paragraph paste करें। सिर्फ़ इस device पर save होता है, कभी upload नहीं होता।',
  'bond-scanner.verdict.blank': 'अभी कुछ भी check नहीं हुआ। Bond clause या appointment letter का text box में paste करें।',
  'bond-scanner.verdict.clean': 'इस paste में bond, certificate-deposit या post-exit restraint का pattern नहीं है।',
  'bond-scanner.verdict.flags': '{n} pattern lawyer से बात करने लायक हैं, panic करने की नहीं। Case law fact-specific होता है।',
  'bond-scanner.verdict.flagsOne': '1 pattern lawyer से बात करने लायक है, panic करने की नहीं। Case law fact-specific होता है।',
  'bond-scanner.flag.original-certificates':
    'Original degrees रखना आमतौर पर unlawful restraint माना जाता है। Originals न दें। (यह किसी lawyer का substitute नहीं है।)',
  'bond-scanner.flag.post-exit-noncompete':
    'Post-employment non-competes आमतौर पर Contract Act s.27 के तहत void होते हैं। Employment के दौरान वाला सवाल अलग है।',
  'bond-scanner.flag.training-bond':
    'Bond की रकम एक ceiling है, price नहीं: employer को फिर भी असली training और actual loss दिखाना होता है। *Sicpa India v. Manas Pratim Deb* (Delhi HC, 2011) में “training” trips असल में business trips थीं, और bond की रकम enforce नहीं हुई। Letter में लिखा number automatically owed नहीं है — किसी lawyer से confirm करें।',
  'bond-scanner.flag.liquidated-damages':
    'Liquidated damages एक ceiling हैं; जहाँ loss साबित किया जा सकता है, वहाँ actual loss का proof फिर भी चाहिए (*Kailash Nath Associates v. DDA*, Supreme Court, 2015)। यह fact-specific है — किसी lawyer से confirm करें।',
  'bond-scanner.flag.probation-extend':
    'Discretion पर extendable probation का मतलब है confirmation कोई पक्की date नहीं है। Max extension writing में लें।',
  'bond-scanner.disclaimer':
    'यह एक pattern scan है, legal advice नहीं। भारतीय case law fact-specific होता है। ऊपर दिए दो citations आपकी letter पर holdings नहीं हैं।',

  // ---- Payslip redactor ----
  'redactor.title': 'Mask text (फोटो नहीं)',
  'redactor.desc': 'Payslip या offer का screenshot लेने से पहले Aadhaar, PAN, UAN, phone, email और rupee amounts को इस device पर mask करें।',
  'redactor.formTitle': 'Page paste करें',
  'redactor.text': 'Payslip या offer text',
  'redactor.textHint':
    'सिर्फ़ इस device पर save होता है, बिना mask किए — कभी upload नहीं होता। Masked page को PNG में download करें या print करें।',
  'redactor.verdict.none': 'कुछ भी match नहीं हुआ। ऐसा text paste करें जिसमें PAN, Aadhaar, फोन नंबर या ₹ amount हो।',
  'redactor.verdict.hits': '{n} items mask हो गए। इसे image के रूप में download करें या print करें।',
  'redactor.verdict.hitsOne': '1 item mask हो गया। इसे image के रूप में download करें या print करें।',
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
    'Typical IT/managerial roles के लिए कोई भारतीय statute 90 दिन ज़रूरी नहीं बनाता। यह contractual है। लंबा notice आपको अगली बार hire करना मुश्किल बनाता है। Buyout formula writing में माँगें।',
  'clause-library.notice-buyout.title': 'Notice के बदले Salary',
  'clause-library.notice-buyout.body':
    'साधारण भारतीय letters दोनों पक्षों को unserved notice pay करने देती हैं। यह कोई scam deposit नहीं है। Switch Karle का notice-buyout tool letter के /30 convention से cash estimate करता है।',
  'clause-library.bond-training.title': 'Training / Service Bond',
  'clause-library.bond-training.body':
    'कोई rupee figure automatically payable नहीं है। Courts असली training और actual loss देखते हैं। Clause को bond scanner में paste करें।',
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

  // ---- Offer Goes Cold Guide ----
    'offer-goes-cold.title': 'जब नया offer शांत हो जाए',
  'offer-goes-cold.desc': 'क्या करें जब notice period के दौरान नई company शांत हो जाए।',
  'offer-goes-cold.verdict': 'Recruiter की तरफ से silence का मतलब आमतौर पर slow paperwork होता है। लेकिन अगर ऐसा ही चलता रहे, तो last working day से पहले writing में जवाब चाहिए।',
  'offer-goes-cold.s1.title': 'Silence का मतलब (और क्या नहीं)',
  'offer-goes-cold.s1.body.1': 'Silence का मतलब हमेशा यह नहीं होता कि offer ख़त्म हो गया है। Paperwork, BGV, budget approvals या recruiter का job बदलना अक्सर चीजों को slow कर देते हैं। लेकिन यह भी न मानें कि सब कुछ ठीक है। आपको writing में confirmed joining date चाहिए। Validity date या conditions के लिए offer letter को फिर से पढ़ें। अगर BGV वजह है, तो आपके पिछले employer का HR slow हो सकता है: देखें ',
  'offer-goes-cold.s1.and': ' और ',
  'offer-goes-cold.s1.body.2': '।',
  'offer-goes-cold.s2.title': 'पहला हफ्ता: क्या पूछें',
  'offer-goes-cold.s2.body': 'Recruiter, hiring manager और HR से writing में update माँगें। एक असली जवाब में written joining date, साफ BGV status, या एक named HR contact होता है। Phone पर दिए गए vague assurances जवाब नहीं हैं। अगर एक हफ्ते से ज़्यादा तीनों शांत रहते हैं, तो उस team में किसी senior को एक short, factual message भेजना एक normal next step है। यह कोई इल्जाम नहीं है, सिर्फ़ facts और वह date है जब तक आपको जवाब चाहिए।',
  'offer-goes-cold.s3.title': 'Slow बनाम cold',
  'offer-goes-cold.s3.body': 'अगर वे एक खास वजह और timeline के साथ reply करते हैं, तो यह slow है। अगर emails ignore हो रहे हैं, hiring manager बिना जवाब दिए आपको HR के पास भेज रहा है, या बार-बार "we will get back to you" सुन रहे हैं, तो यह cold हो रहा है। हर email संभाल कर रखें। Call के ठीक बाद, हर verbal promise को date के साथ लिख लें।',
  'offer-goes-cold.s4.title': 'Plan B चालू रखना',
  'offer-goes-cold.s4.body.1': 'अपनी job search तुरंत चुपचाप फिर से शुरू करें। नए leads को अपने ',
  'offer-goes-cold.s4.body.2': ' पर रखें ताकि कुछ छूटे नहीं। अपने current manager को अपनी चिंता न बताएं। आपकी priority options रखना है।',
  'offer-goes-cold.s5.title': 'आपका current employer',
  'offer-goes-cold.s5.body.1': 'जब आप सिर्फ़ चिंतित हों, तब extension या reversal की बात न छेड़ें। यह इशारा करता है कि नया offer shaky हो सकता है, और इसे वापस नहीं लिया जा सकता। अगर आपका last working day करीब है और आपको सच में और समय चाहिए, तो सिर्फ़ एक short extension माँगें, जिसे scheduling request की तरह पेश किया गया हो। अपना resign वापस लेने का offer तभी दें जब आपने सच में रुकने का फ़ैसला कर लिया हो। आपकी team शायद पहले ही आपकी जगह किसी और को hire कर रही हो, और फ़ैसला उनका ही होगा। अपना appointment letter चेक करें कि resign वापस लेने के बारे में क्या लिखा है; ',
  'offer-goes-cold.s5.body.2': ' आपको अपने sign किए गए clauses पढ़ने में मदद करता है। नए offer के साथ चाहे जो हो, इस exit को clean रखें। आपको हर हाल में अपना relieving letter चाहिए होगा।',
  'offer-goes-cold.s6.title': 'पैसा और runway',
  'offer-goes-cold.s6.body.1': 'अगर joining date लगातार आगे खिसकती जाए, तो हिसाब लगाएं कि आप कितने महीने survive कर सकते हैं। ',
  'offer-goes-cold.s6.body.2': ' आपको बताता है कि आपका final settlement कितना होना चाहिए। आपका group health cover आमतौर पर आपके last working day पर ख़त्म हो जाता है, भले ही नई job शुरू न हुई हो: ',
  'offer-goes-cold.s6.body.3': ' दिखाता है कि क्या-क्या uncover रह जाता है। ',
  'offer-goes-cold.s6.body.4': ' हर exit date को एक जगह रखता है।',
  'offer-goes-cold.prompt.title': 'Follow-up email prompt',
  'offer-goes-cold.prompt.desc': 'एक शांत, professional follow-up email draft करने के लिए इस prompt को अपने AI assistant (जैसे ChatGPT) में copy करें।',
  'offer-goes-cold.prompt.text': 'Draft a calm, professional follow-up email to [Recruiter name] and [Hiring manager name] at [Company name], about the [Role] offer dated [Offer date]. I resigned on [Resignation date] based on this offer. I have not heard back in [Number of days] days, despite [Number of follow-ups] follow-ups. My last working day at my current employer is [Last working day], and I need to tell them if anything changes before then. Ask for two things in writing: a confirmed joining date and the current BGV status. Give my last working day as the reason for asking now. Include a subject line. Keep it short, polite and firm. No desperation, no threats.',

  // ── Trust: receipts, the privacy line, and the pages about the site ──────
  'receipt.label': 'Sources:',
  'receipt.checked': '{items} ({date} को check किया)',
  'receipt.convention': 'Convention है, कानून नहीं: {text}',
  'receipt.awaiting-ca': 'अभी chartered accountant ने check नहीं किया: {text}',
  'receipt.awaiting-lawyer': 'अभी lawyer ने check नहीं किया: {text}',
  'receipt.link': 'हम numbers कैसे check करते हैं',
  'ui.privacyLine': 'आप जो type करते हैं, वह कहीं नहीं भेजा जाता। यह इसी browser में save होता है ताकि दोबारा न लिखना पड़े।',
  'ui.privacyErase': 'मिटाएं',
  'ui.privacyCheck': 'कैसे check करें',
  'ui.disclaimerContract': 'ये अनुमान हैं, tax या कानूनी सलाह नहीं। आपका अपना contract और letters ही तय करते हैं।',
  'resignation-letter.verdictNext':
    'यह resignation वाले दिन को पहला दिन गिनता है। अगर letter में notice उस date “से” गिना जाता है, तो यह {lwdNext} हो सकता है। आपके letter की wording जो date दे, वही लिखें।',

  'app.footer.madeBy': 'Kalpit Tiwari ने बनाया।',
  'app.footer.reportGithub': 'GitHub पर बताएं',
  'app.footer.pages': 'इस site के बारे में',
  'app.footer.sourceCode': 'Source code (MIT licence)',
  'info.about.link': 'परिचय',
  'info.sources.link': 'हम numbers कैसे check करते हैं',
  'info.privacy.link': 'Privacy',
  'info.terms.link': 'शर्तें',
  'info.updated': 'आख़िरी बार {date} को update किया।',
  'info.contact': 'कोई number ग़लत लगा या bug मिला?',
  'info.contactEmail': '{email} पर email करें',
  'info.contactGithub': 'GitHub पर issue खोलें',

  'about.title': 'Switch Karle के बारे में',
  'about.description': 'Switch Karle कौन बनाता है, इसकी कीमत क्या है, और इसका code कहाँ है।',
  'about.who': 'Switch Karle को Kalpit Tiwari बनाते हैं।',
  'about.free':
    'यह free है। कोई paid version नहीं, कोई account नहीं बनाना, कोई backend server नहीं और कोई analytics नहीं। Tools आपके browser में चलते हैं।',
  'about.advice': 'यह अनुमान देता है, tax या कानूनी सलाह नहीं।',
  'about.code': 'Source code public है, MIT licence के तहत।',
  'about.codeLink': 'GitHub पर source code पढ़ें',
  'about.more': 'Site के बारे में और',

  'sources.title': 'हम numbers कैसे check करते हैं',
  'sources.description':
    'Switch Karle के tools जो भी नियम इस्तेमाल करते हैं, वह किस document से आया, आख़िरी बार कब check हुआ, क्या अभी बाक़ी है, और हमने क्या सुधारा।',
  'sources.intro': 'Tools जो भी नियम इस्तेमाल करते हैं, वह किस document से आया, और आख़िरी बार कब check हुआ।',
  'sources.how.title': 'हम कैसे check करते हैं',
  'sources.how.p1':
    'कोई भी नियम सिर्फ़ primary document से आता है: Act, उसके तहत बने Rules, gazette notification, सरकारी rate chart या circular, या court का फ़ैसला। Tax blog से कभी नहीं, और AI के जवाब से कभी नहीं।',
  'sources.how.p2':
    '“Check किया” का मतलब है कि उस date पर number को उसी document से मिलाया गया। इसका मतलब यह नहीं कि किसी chartered accountant ने review किया है। जिन नियमों का review अभी बाक़ी है, वे यह बात यहाँ भी कहते हैं और tool के जवाब के नीचे भी।',
  'sources.how.p3':
    'कुछ numbers कानून हैं ही नहीं, बस ज़्यादातर employers और letters ऐसे ही करते हैं। उन पर लिखा है “convention है, कानून नहीं”, और आपका अपना contract ही तय करता है।',
  'sources.how.code': 'हर source उस code के पास भी लिखा है जो उसे इस्तेमाल करता है, और code public है।',
  'sources.checked.title': 'Source से check किए गए',
  'sources.open.title': 'अभी check होना बाक़ी',
  'sources.open.intro':
    'ये नियम इस्तेमाल हो रहे हैं, पर अभी किसी chartered accountant या lawyer ने इन पर मुहर नहीं लगाई है। इन पर टिके number को provisional मानें।',
  'sources.conventions.title': 'Convention है, कानून नहीं',
  'sources.conventions.intro': 'कोई कानून इन्हें तय नहीं करता। ज़्यादातर employers और letters ऐसे ही करते हैं। आपका अपना contract ही तय करता है।',
  'sources.corrections.title': 'सुधार',
  'sources.corrections.intro': 'इस site ने जो numbers और citations कभी ग़लत दिखाए, और हर एक किस date को ठीक हुआ।',
  'sources.checkedOn': '{date} को check किया',
  'sources.lookedOn': 'आख़िरी बार {date} को देखा',
  'sources.labelledOn': '{date} को label किया',
  'sources.openDoc': 'Document खोलें',
  'sources.usedBy': 'इनमें इस्तेमाल: {tools}',
  'sources.status.verified': 'Source से check किया',
  'sources.status.awaiting-ca': 'अभी chartered accountant ने check नहीं किया',
  'sources.status.awaiting-lawyer': 'अभी lawyer ने check नहीं किया',
  'sources.status.convention': 'Convention है, कानून नहीं',

  'source.ita-new-regime': 'नया tax regime',
  'source.ita-rebate': 'Rebate: ₹12 lakh taxable income तक कोई tax नहीं, उसके ठीक ऊपर marginal relief के साथ',
  'source.ita-salary-deductions': 'Salary से कटने वाले standard deduction और professional tax',
  'source.ita-deduction-cap': 'पुराने 80C वाले deductions पर ₹1.5 lakh की सीमा, आपके PF समेत',
  'source.tax-slabs': 'FY 2026-27 के tax slab rates, 4% cess और surcharge',
  'source.hra-rule-279': 'HRA exemption, और वे आठ शहर जिन्हें basic का 50% मिलता है',
  'source.epf-wage-ceiling': 'Basic का 12% PF, और ₹25,000 महीने की wage ceiling',
  'source.gratuity-accrual': 'CTC के अंदर gratuity, basic का 4.81% (15/26 ÷ 12)',
  'source.pt-KA': 'Karnataka का professional tax',
  'source.pt-PB': 'Punjab State Development Tax, professional tax की जगह',
  'source.pt-TN': 'Tamil Nadu का professional tax (Chennai का rate)',
  'source.pt-OD': 'Odisha का professional tax',
  'source.pt-TG': 'Telangana का professional tax',
  'source.pt-AS': 'Assam का professional tax',
  'source.pt-PY': 'Puducherry का professional tax',
  'source.pt-other': 'बाक़ी states का professional tax',
  'source.gratuity-eligibility': 'Gratuity की eligibility: 5 साल, और 190 / 240 working days की गिनती',
  'source.gratuity-amount': 'Gratuity की रक़म: हर साल के लिए monthly wages का 15/26, छह महीने से ज़्यादा का हिस्सा पूरा साल गिना जाता है',
  'source.gratuity-four-years-plus': '4 साल और 190 / 240 working days को 5 साल गिनना, जैसा courts ने s.54 को पढ़ा है',
  'source.gratuity-wages': 'Gratuity के लिए pay के कौन से हिस्से “wages” गिने जाते हैं (हम basic + DA लेते हैं, इसलिए हमारा figure कम से कम इतना है)',
  'source.gratuity-cap': 'Gratuity की ₹20 lakh की सीमा',
  'source.leave-encashment-exempt': 'Resignation या retirement पर leave encashment, ₹25 lakh तक tax-free',
  'source.leave-daily-rate': 'Leave का daily rate: ÷ 26 या ÷ 30, यह आपके employer की policy है',
  'source.notice-buyout-divisor': 'Notice buyout: monthly pay ÷ 30 × बाक़ी दिन',
  'source.unpaid-leave-divisor': 'Unpaid leave की recovery: monthly gross ÷ 30 × दिन',
  'source.last-working-day':
    'Last working day: हम resignation वाले दिन को पहला दिन गिनते हैं। किसी date “से” चलने वाला notice एक दिन बाद ख़त्म हो सकता है।',
  'source.clawback-gross': 'Joining bonus clawback: letters आम तौर पर gross रक़म वापस माँगते हैं',
  'source.clawback-later-year': 'Bonus अगले tax year में लौटाने पर tax वापस मिलना',
  'source.esop-perquisite': 'Exercise पर ESOP tax: market value में से आपका दिया पैसा घटाकर, salary की तरह tax',
  'source.esop-fmv-rule-15': 'Unlisted shares की value कैसे तय होती है',
  'source.form16-combined': 'दो Form-16: पूरी salary पर एक standard deduction, बाक़ी deductions छोड़े गए',
  'source.advance-tax-interest': 'कम advance tax पर interest (हिसाब नहीं किया जाता)',
  'source.epf-five-years': '5 साल की service के बाद PF withdrawal tax-free है',
  'source.epf-tds': 'PF withdrawal पर TDS: ₹50,000 या ज़्यादा पर 10%, PAN न हो तो 20%',
  'source.epf-interest-after-exit': 'Job छोड़ने के बाद जुड़े PF interest पर tax',
  'source.declaration-rule-205': 'नए employer को HRA proofs और landlord का PAN (Form No. 124)',

  'corrections.pt-tn-od':
    'Tamil Nadu का professional tax ₹2,190 साल दिखाया गया था (2018 से पहले का rate) और Odisha का ₹2,400। दोनों ₹2,500 हैं; Tamil Nadu का rate Chennai का है।',
  'corrections.pt-as-py':
    'Assam और Puducherry का professional tax ₹0 छोड़ा गया था। हर एक के published schedule के हिसाब से ये ₹2,496 और ₹2,500 साल हैं।',
  'corrections.form16-interest':
    'Form-16 tool ने कम advance tax पर interest को s.234B और 234C कहा था, जो repealed 1961 Act के numbers हैं। Income-tax Act, 2025 में ये s.424 और s.425 हैं।',
  'corrections.sicpa':
    'Bond scanner ने कहा था कि Delhi High Court के एक case (Sicpa, 2011) ने specialised training और आम onboarding में फ़र्क़ किया। ऐसा नहीं था। Court ने कहा कि bond की रक़म सिर्फ़ एक ऊपरी सीमा है, और employer को असली नुक़सान साबित करना होता है।',
  'corrections.hra-city':
    'HRA का 50% वाला हिस्सा आपके state से तय होता था, इसलिए Nagpur को Mumbai जैसा और Mysuru को Bengaluru जैसा गिना गया। Decoder और Relocation अब आपका शहर पूछते हैं।',
  'corrections.leave-resignation':
    'Resignation पर leave encashment को पूरी तरह taxable दिखाया गया था, एक repealed section के हवाले से। Income-tax Act, 2025 के s.19(1) के तहत यह ₹25 lakh तक exempt है, retirement की तरह ही।',
  'corrections.pt-ka': 'Karnataka का professional tax ₹2,400 साल दिखाया गया था। 1 April 2025 से यह ₹2,500 है (February में ₹300)।',
  'corrections.gratuity-code':
    'Gratuity को 1972 के पुराने gratuity कानून के हवाले से बताया गया था, जो 21 November 2025 को repeal हो गया। अब यह Code on Social Security, 2020 के हवाले से है, और रक़म को कम से कम इतनी दिखाया जाता है।',
  'corrections.gratuity-working-days':
    'Gratuity की 190 / 240 दिन की गिनती calendar days से हो रही थी। Code असल में काम किए दिन गिनता है, इसलिए दिखाई गई date 40 से 76 दिन पहले थी। अब working days गिने जाते हैं।',
  'corrections.hra-eight-cities':
    'HRA का 50% वाला हिस्सा चार metros पर लागू था। Income-tax Rules, 2026 का Rule 279 आठ शहर गिनाता है: Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad और Bengaluru।',
  'corrections.epf-ceiling': 'PF की wage ceiling ₹15,000 महीना थी। 17 September 2026 के S.O. 5109(E) ने इसे ₹25,000 कर दिया।',
  'corrections.rebate-156':
    'नए regime के rebate को एक “Act 2026” का s.157 बताया गया था, जो Act है ही नहीं। यह Income-tax Act, 2025 का s.156 है। Official PDF से मिलाने पर यह पकड़ा गया।',

  'privacy.title': 'Privacy',
  'privacy.description': 'Switch Karle क्या save करता है, वह कहाँ रहता है, क्या कभी नहीं लिया जाता, और उसे कैसे मिटाएं।',
  'privacy.short.title': 'छोटे में',
  'privacy.short.1': 'आप जो type करते हैं, वह कहीं नहीं भेजा जाता।',
  'privacy.short.2': 'यह इसी browser में save होता है, ताकि दोबारा न लिखना पड़े।',
  'privacy.short.3': 'आप इसे कभी भी मिटा सकते हैं, हर page के नीचे एक button से।',
  'privacy.saved.title': 'क्या save होता है, और कहाँ',
  'privacy.saved.p1':
    'आप जो numbers, dates और drafts type करते हैं, वे इस browser के local storage में “switchkarle” से शुरू होने वाले नामों के तहत save होते हैं। Tool खोलने से कुछ save नहीं होता: tool तभी save करता है जब आप कुछ type करें या बदलें।',
  'privacy.saved.p2':
    'एक साझा record आपकी current basic, gross, notice period, join date और work week रखता है, ताकि exit tools दोबारा न पूछें। इसमें employer का नाम नहीं होता।',
  'privacy.saved.p3': 'भाषा चुनने पर वह चुनाव भी save होता है।',
  'privacy.never.title': 'क्या कभी नहीं लिया जाता',
  'privacy.never.p1':
    'कोई account नहीं, कोई analytics नहीं, कोई backend server नहीं और कोई AI call नहीं। जब कोई tool आपको prompt देता है, तो उसे आप ख़ुद अपने AI में paste करते हैं।',
  'privacy.host.title': 'Web host क्या देखता है',
  'privacy.host.p1':
    'यह site GitHub Pages से चलती है। हर web host की तरह, page load होने पर GitHub को request की आम जानकारी मिलती है, जैसे आपका IP address और browser। Tool में आप जो type करते हैं, वह उसे कभी नहीं मिलता।',
  'privacy.host.link': 'GitHub का privacy statement',
  'privacy.out.title': 'क्या सिर्फ़ आपके चाहने पर बाहर जाता है',
  'privacy.out.p1':
    'Copy button text को आपके clipboard पर रखता है। Download (calendar file, image card, backup file, या print किया PDF) आपके device पर file save करता है। AI में paste किया prompt उसी AI तक जाता है। हर चीज़ तभी होती है जब आप button दबाएं, और सिर्फ़ वहीं जाती है जहाँ आप भेजें।',
  'privacy.erase.title': 'इसे कैसे मिटाएं',
  'privacy.erase.p1':
    'किसी भी page के नीचे “Saved data मिटाएं” दबाएं। यह Switch Karle का इस browser में save किया सब कुछ हटाता है और बताता है कि क्या हटाया। Applications रखनी हों तो पहले “Backup या restore” दबाएं।',
  'privacy.erase.p2':
    'दो चीज़ें रहती हैं: आपकी browser history, जिसे आप browser से clear करें, और site के अपने pages की offline copy, जिसमें आपका typed कुछ नहीं होता।',
  'privacy.check.title': 'ख़ुद कैसे check करें',
  'privacy.check.p1':
    'Browser के developer tools खोलें, Network tab पर जाएं, और किसी भी tool में type करें: कोई request बाहर नहीं जाती। Page की security policy उसे सिर्फ़ इसी site से जुड़ने देती है, और code public है।',
  'privacy.change.title': 'अगर यह कभी बदले',
  'privacy.change.p1':
    'अगर किसी feature को कभी आपका data बाहर ले जाना पड़े, तो वह ऐसा feature होगा जिसे आप ख़ुद, नाम से, चालू करें। Data सिर्फ़ उस जगह जाएगा जो Kalpit के नियंत्रण में हो, सिर्फ़ तब तक जब तक feature चालू है, और सिर्फ़ उसी feature के लिए। उसे बंद करने पर उसका जमा किया data मिट जाता है।',
  'privacy.change.p2':
    'आपका data कभी बेचा या किसी से share नहीं किया जाता, और advertising, profiling या AI models की training में कभी इस्तेमाल नहीं होता।',
  'privacy.rule': 'पूरा नियम source code में PRIVACY.md में है।',

  'terms.title': 'शर्तें',
  'terms.description': 'Switch Karle अनुमान देता है, सलाह नहीं। इसका मतलब क्या है, और फ़ैसला कौन करता है।',
  'terms.estimates':
    'यहाँ सब कुछ अनुमान है, tax, कानूनी या financial सलाह नहीं। किसी अहम फ़ैसले से पहले chartered accountant या lawyer से check करें।',
  'terms.contract':
    'आपका अपना contract, offer letter और payroll ही तय करते हैं। जहाँ कोई tool convention इस्तेमाल करता है, जैसे notice pay ÷ 30, leave ÷ 26 या ÷ 30, या last working day कैसे गिना जाए, वहाँ आपके documents ही मान्य हैं।',
  'terms.fy': 'Tax के नियम FY 2026-27 के हैं। कुछ provisional हैं या अभी chartered accountant ने check नहीं किए, और “हम numbers कैसे check करते हैं” page उन्हें गिनाता है।',
  'terms.drafts': 'Letters, scripts और prompts drafts हैं। उन्हें आप edit करते हैं, भेजते हैं, और उनकी ज़िम्मेदारी आपकी है।',
  'terms.asis':
    'यह site free है और जैसी है वैसी दी जाती है, बिना किसी warranty के। Code MIT licence के तहत है, जो software के लिए यही कहता है। जवाब का क्या करना है, यह आप तय करते हैं, और उस पर क़दम भी आप ख़ुद उठाते हैं।',
  'terms.errors': 'सुधार “हम numbers कैसे check करते हैं” page पर दर्ज हैं।',

  // Sources registry: what each rule without a plain citation rests on.
  'sourceNote.tax-slabs':
    "Budget 2026 ने slab rates, rebate, surcharge और cess नहीं बदले। हमारा code Act का नाम लेता है, पर slab table का section अभी तय नहीं करता।",
  'sourceNote.gratuity-accrual':
    "कोई कानून इसे तय नहीं करता। यह 15/26 ÷ 12 है, जिस तरह payroll साल की gratuity को बारह महीनों में बाँटता है।",
  'sourceNote.pt-TN':
    "Chennai का rate। Tamil Nadu के दूसरे शहर अपना rate ख़ुद तय करते हैं।",
  'sourceNote.pt-other':
    "अभी primary source से check नहीं हुआ: Maharashtra, Gujarat, Andhra Pradesh, West Bengal, Madhya Pradesh और Kerala की रक़म। Delhi, Haryana, Uttar Pradesh और Rajasthan में ₹0 दिखता है क्योंकि कोई professional-tax Act नहीं मिला, पर इससे साबित नहीं होता कि कोई है ही नहीं। Bihar, Jharkhand, Chhattisgarh, Sikkim, Meghalaya, Tripura और बाक़ी states ₹0 पर छोड़े गए हैं।",
  'sourceNote.gratuity-four-years-plus':
    "Section 190 / 240 दिन की गिनती तय करता है। इसे पाँचवें साल में जाने का रास्ता मानना courts की reading है, और हमारे code में अभी कोई फ़ैसला नाम से दर्ज नहीं है।",
  'sourceNote.gratuity-wages':
    "“Wages” basic + DA से शुरू होती हैं और कुल pay के आधे से ऊपर का हिस्सा वापस जोड़ती हैं। Tool सिर्फ़ basic + DA लेता है, इसलिए उसका figure कम से कम इतना है।",
  'sourceNote.gratuity-cap':
    "s.53(3) gratuity को उस रक़म तक सीमित करता है जो Central Government notify करे। Code के तहत कोई notification नहीं मिला। ₹20 lakh 2018 से तभी आगे चलता है जब saving clause उसे बचाए।",
  'sourceNote.leave-daily-rate':
    "कोई कानून daily rate तय नहीं करता। आपके employer की leave policy तय करती है।",
  'sourceNote.notice-buyout-divisor':
    "कोई कानून basis या ÷ 30 तय नहीं करता। Code on Wages का proviso दस या ज़्यादा employees के एक साथ ग़ैरहाज़िर होने पर लागू है, एक व्यक्ति के resignation पर नहीं। आपका contract तय करता है।",
  'sourceNote.unpaid-leave-divisor':
    "कोई कानून ÷ 30 तय नहीं करता। Code on Wages ग़ैरहाज़िरी की कटौती को ग़ैरहाज़िर दिनों के अनुपात तक, और सारी कटौतियों को wages के 50% तक सीमित करता है।",
  'sourceNote.last-working-day':
    "Resignation notice पर कोई कानून लागू नहीं होता। Section 9 Central Acts पर लागू है, contracts पर नहीं। Supreme Court ने Haru Das Gupta में किसी date “से” गिनी जाने वाली अवधि का पहला दिन छोड़ दिया था। आपके letter की wording तय करती है।",
  'sourceNote.clawback-gross':
    "कोई कानून वापसी तय नहीं करता: gross रक़म माँगना contract का चलन है। Joining bonus पर salary की तरह tax लगता है।",
  'sourceNote.clawback-later-year':
    "आपका employer उसी tax year में TDS adjust कर सकता है। अगले साल लौटाने पर राहत देने वाला कोई provision नहीं मिला।",
  'sourceNote.esop-perquisite':
    "Act के enacted text से पढ़ा गया (ICAI की copy)। Finance Act 2026 का text दोबारा नहीं पढ़ा गया।",
  'sourceNote.form16-combined':
    "Tool पूरी salary पर एक standard deduction लेता है और बाक़ी deductions और exemptions छोड़ देता है।",
  'sourceNote.advance-tax-interest':
    "ये पुराने 234B और 234C हैं। Interest का हिसाब नहीं किया जाता; इसे model करना है या नहीं, यह chartered accountant के जवाब पर टिका है।",
  'sourceNote.epf-five-years':
    "Act के enacted text से पढ़ा गया (ICAI की copy)। पिछले employer की service गिनी जाती है अगर उसका PF transfer होकर आया हो।",
  'sourceNote.epf-tds':
    "Act के enacted text से पढ़ा गया (ICAI की copy)। Tool TDS की रक़म नहीं निकालता।",
  'sourceNote.epf-interest-after-exit':
    "Act का text इसे cover नहीं करता। यह case law और CBDT के चलन पर टिका है।",
};
