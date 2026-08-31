/**
 * Hindi dictionary. Register: professional Indian-workplace Hindi, not
 * shuddh-Hindi purism — domain terms (CTC, PF, HRA, ESOP, notice period,
 * in-hand, variable pay, regime, bond, offer, LPA, etc.) stay in English/
 * Latin script exactly as Indian professionals say them; the surrounding
 * sentence is Devanagari.
 *
 * Only keys that need a Hindi-specific value live here — translate() falls
 * back to `en.ts` (and then the raw key) for anything missing, so this file
 * never needs to be 1:1 with `en.ts` to stay safe.
 *
 * The `flag.*` keys are optional UI-layer overrides for src/engine/redFlags.ts
 * (which stays English-canonical so its tests never need to change). They are
 * looked up directly by Results.tsx's FlagCard — see translateOrFallback() in
 * index.ts — and are never read for the 'en' language.
 */
export const hi: Record<string, string> = {
  // ---- App shell ----
  'app.tagline': 'अपना offer decode करें। जानें कि असल में आपके bank तक क्या पहुंचता है।',
  'app.privacyBadge': '100% private — यह पूरी तरह आपके browser में चलता है, कुछ भी upload नहीं होता',
  'app.footer.rules': 'FY 2026-27 के नियम · अनुमान हैं, tax या कानूनी सलाह नहीं · free और open source ·',
  'app.footer.privacy': 'आपका data इस device से बाहर कभी नहीं जाता',
  'app.footer.verified': 'नियम last verified {date}',
  'app.footer.feedback': 'कोई number गलत लगा या bug मिला? बताएं:',
  'app.footer.feedbackEmail': 'Email',
  'app.langToggle.label': 'भाषा',

  'nav.home': 'होम',
  'home.kicker': 'हर application एक ही board पर। सही calculator सिर्फ़ एक tap दूर।',
  'home.allTools': 'सभी {n} tools',
  'home.decoder.desc': 'CTC से असल in-hand, plus notice period, bond और variable pay के red flags.',
  'home.tracker.desc': 'Applications का kanban — CTC discussed, notice, next action. इसी device पर रहता है।',
  'home.prompts.desc': 'Prompt कॉपी करके अपने AI में डालें। यह app आपका data कहीं नहीं भेजता.',

  'tab.decoder': 'डिकोडर',
  'tab.tracker': 'ट्रैकर',
  'tab.prompts': 'प्रॉम्प्ट्स',

  // ---- Common ----
  'common.delete': 'हटाएं',
  'common.cancel': 'रद्द करें',

  'ui.copy': 'कॉपी करें',
  'ui.copied': 'कॉपी हो गया ✓',
  'ui.exampleChip': 'उदाहरण',
  'ui.exampleNote': 'Sample numbers के साथ बनाया गया example — अभी आपके बारे में कुछ check नहीं हुआ है।',
  'ui.print': 'प्रिंट',
  'ui.disclaimer':
    'अनुमान हैं, tax या कानूनी सलाह नहीं. FY 2026-27 के नियम. आपके payroll की exact structure थोड़ी अलग होगी.',
  'ui.money.hint': '12L, 12,00,000 या 1200000',

  // ---- Decoder form ----
  'decoder.title': 'आपका offer',
  'decoder.seeded':
    'CTC और notice period एक tracker card से आए हैं। बाकी सब आपके यहाँ पिछली बार save किए offer से है, इसलिए result पर भरोसा करने से पहले जाँच लें।',
  'decoder.field.ctc.label': 'Total CTC',
  'decoder.field.variable.label': 'CTC में Variable',
  'decoder.field.basic.label': 'Basic',
  'decoder.field.basic.hint': 'fixed pay का %',
  'decoder.field.notice.label': 'Notice period',
  'decoder.field.state.label': 'राज्य (Work state)',
  'decoder.toggle.employerPf.label': 'CTC के अंदर Employer PF',
  'decoder.toggle.employerPf.hint': 'लगभग हमेशा yes होता है — annexure चेक करें',
  'decoder.toggle.gratuity.label': 'CTC के अंदर Gratuity',
  'decoder.toggle.gratuity.hint': 'यह पैसा सिर्फ 5 साल बाद मिलता है',
  'decoder.toggle.pfFull.label': 'पूरे Basic पर PF',
  'decoder.toggle.pfFull.hint': 'Off = ₹1,800/month पर capped',
  'decoder.details.extras': 'ESOPs, joining bonus, bond',
  'decoder.field.esopValue.label': 'CTC में सालाना ESOPs',
  'decoder.field.esopCliff.label': 'ESOP cliff',
  'decoder.toggle.esopLiquid.label': 'कंपनी listed है / shares liquid हैं',
  'decoder.field.joiningBonus.label': 'Joining bonus',
  'decoder.field.clawback.label': 'Bonus clawback की अवधि',
  'decoder.field.bondAmount.label': 'Service bond की राशि',
  'decoder.field.bondMonths.label': 'Bond की अवधि',
  'decoder.details.oldRegime': 'Old regime के extras (rent, 80C, 80D)',
  'decoder.field.rent.label': 'चुकाया गया rent',
  'decoder.toggle.metro.label': 'Metro city',
  'decoder.toggle.metro.hint': 'Delhi, Mumbai, Kolkata या Chennai',
  'decoder.field.deduction80c.label': 'PF के अलावा 80C',
  'decoder.field.deduction80c.hint': 'ELSS, PPF, LIC वगैरह',
  'decoder.field.deduction80d.label': '80D health premium',
  'decoder.field.hra.label': 'HRA (Basic का %)',
  'decoder.field.hra.value': 'Basic का {percent}%',
  'unit.days': 'दिन',
  'unit.months': 'महीने',

  // ---- States ----
  'state.KA': 'कर्नाटक',
  'state.MH': 'महाराष्ट्र',
  'state.TN': 'तमिलनाडु',
  'state.TG': 'तेलंगाना',
  'state.AP': 'आंध्र प्रदेश',
  'state.WB': 'पश्चिम बंगाल',
  'state.GJ': 'गुजरात',
  'state.MP': 'मध्य प्रदेश',
  'state.KL': 'केरल',
  'state.OD': 'ओडिशा',
  'state.DL': 'दिल्ली',
  'state.HR': 'हरियाणा',
  'state.UP': 'उत्तर प्रदेश',
  'state.RJ': 'राजस्थान',
  'state.other': 'अन्य / पता नहीं',

  // ---- Results ----
  'results.headline': 'आपका {ctc} CTC असल में देता है',
  'results.exampleChip': 'उदाहरण',
  'results.exampleNote': 'Sample numbers के साथ बनाया गया example — अभी आपके बारे में कुछ check नहीं हुआ है।',
  'decoder.fixedPayNote': 'In-hand सिर्फ fixed pay पर count होता है। Tax सिर्फ fixed pay पर, variable पर नहीं। Old-regime तुलना age 60 से कम मानकर है।',
  'results.headlineSub': 'उतना नहीं जितना CTC नंबर से {amount}/month लगता है।',
  'results.reaches': 'आपके bank तक पहुंचता है · सालाना {amount} in-hand',
  'regime.new': 'New regime',
  'regime.old': 'Old regime',
  'results.cheaper': 'सस्ता',
  'results.taxPerYear': 'टैक्स {amount}/yr',
  'results.whereGoes': 'आपका CTC कहां जाता है',
  'results.row.ctcQuoted': 'बताया गया CTC',
  'results.row.variable': 'Variable (जोखिम में)',
  'results.row.esop': 'ESOPs (कागज़ी)',
  'results.row.employerPf': 'Employer PF (exit/retirement तक locked)',
  'results.row.gratuity': 'Gratuity (सिर्फ 5 साल बाद)',
  'results.row.grossSalary': 'Cash salary (gross)',
  'results.row.incomeTax': 'Income tax ({regime})',
  'results.row.employeePf': 'आपका PF योगदान',
  'results.row.professionalTax': 'Professional tax',
  'results.row.professionalTax.pb': 'State Development Tax (पंजाब)',
  'results.row.inHand': 'सालाना आपके bank में',
  'results.offerCheck': 'Offer जांच',
  'results.flagsBadge': '{n} flag',
  'results.noAlarming': '✓ कुछ भी चिंता की बात नहीं',
  'results.sayThis': 'यह कहें:',
  'flagChip.red': 'रेड फ्लैग',
  'flagChip.amber': 'सावधानी',
  'flagChip.info': 'यह जान लें',
  'results.howComputed': 'यह कैसे calculate किया (हर नंबर, बिना किसी जादू के)',
  'results.howComputed.bullet1':
    'FY 2026-27 के नियम। New regime: स्लैब 0–4L पर nil, ₹24L से ऊपर 30% तक; ₹75,000 standard deduction; धारा 156 का rebate (₹12L taxable तक zero tax, marginal relief के साथ)। Old regime: ₹50,000 standard deduction, HRA exemption, 80C (आपका PF अपने-आप गिना जाता है, cap ₹1.5L), 80D, professional tax deduction। दोनों पर 4% cess; ₹50L से ऊपर surcharge।',
  'results.howComputed.bullet2':
    'In-hand में सिर्फ fixed pay गिना जाता है। Variable और ESOPs जोखिम वाला पैसा हैं — इन्हें अलग दिखाया जाता है, monthly figure में कभी नहीं। इन पर tax तभी लगता है जब असल में payout मिलता है।',
  'results.howComputed.bullet3': 'PF: Basic का 12%, दोनों तरफ से। Gratuity accrual: CTC में होने पर Basic का 4.81%।',
  'results.howComputed.bullet4':
    'Professional tax आपके state के published slab पर आधारित है (approximate — municipal notification से थोड़ा बदल सकता है)।',
  'results.howComputed.bullet5':
    'सब कुछ आपके browser में चलता है। आपका offer कभी किसी server तक नहीं पहुंचता। यह एक estimate है, tax advice नहीं — आपके payroll की असल structure थोड़ी अलग हो सकती है।',

  // ---- Share card ----
  'autofill.summary': '⚡ ये fields नहीं पता? अपने AI से offer letter पढ़वाएं',
  'autofill.explainer':
    'यह prompt copy करें, ChatGPT/Claude/Gemini में अपने पूरे offer letter के साथ paste करें, फिर जवाब यहां वापस paste करें — form अपने-आप भर जाएगा।',
  'autofill.copyPrompt': 'Extractor prompt copy करें',
  'autofill.copied': 'Copy हो गया ✓',
  'autofill.pastePlaceholder': 'अपने AI का पूरा जवाब यहां paste करें (इसमें एक JSON block होगा)…',
  'autofill.fillButton': 'Form भरें',
  'autofill.okFilled': 'भर दिया: {fields}',
  'autofill.okMissing': '{n} field(s) आपके offer letter में नहीं थीं — HR से पूछने के exact सवाल आपके AI ने लिख दिए हैं।',
  'autofill.error':
    'इसमें valid JSON block नहीं मिला। AI का पूरा जवाब paste करें, ```json``` वाला हिस्सा भी।',
  'autofill.privacyNote':
    'ध्यान दें: offer letter किसी AI chatbot में paste करने से वह उस AI provider के पास जाता है — आपकी मर्ज़ी, आपका account। यह app खुद कुछ भी upload नहीं करता।',

  'shareCard.cta.rendering': 'बन रहा है…',
  'shareCard.cta.download': 'Truth card डाउनलोड करें ↓',
  'shareCard.eyebrow': 'CTC की सच्चाई',
  'shareCard.ctcSounds': 'CTC {ctc} सुनने में {amount}/mo लगता है',
  'shareCard.butBank': 'लेकिन bank में पहुंचता है',
  'shareCard.reaches': 'CTC का {pct}% bank तक पहुंचता है',
  'shareCard.redFlags': '⚑ इस offer में {n} red flag',
  'shareCard.footer': 'kalpit.me/switch-karle',

  // ---- Tracker ----
  'tracker.title': 'Applications',
  'tracker.trackedCount': '{n} track की गईं',
  'tracker.export': 'Export',
  'tracker.import': 'Import',
  'tracker.openAdd': '+ Application जोड़ें',
  'tracker.empty.title': 'अभी कोई application नहीं — अपनी job search track करना शुरू करें।',
  'tracker.empty.cta': 'अपनी पहली application जोड़ें',
  'tracker.example.title': 'कुछ applications जोड़ने के बाद आपका board ऐसा दिखेगा',
  'tracker.example.action.referral': 'कोई ऐसा ढूंढें जो refer कर सके',
  'tracker.example.action.chase': '30 दिन से कोई reply नहीं — chase करें या close करें',
  'tracker.example.action.round2': 'Hiring manager के साथ round 2',
  'tracker.example.action.decode': 'Reply करने से पहले यह offer decode करें',
  'tracker.doorway.label': 'अगला कदम:',
  'tracker.doorway.prefilled': 'Decoder इसी CTC के साथ खुलेगा।',
  'tracker.confirmDelete': 'यह application delete करें? यह वापस नहीं हो सकता।',
  'tracker.saveFailed.title': 'यह board save नहीं हुआ।',
  'tracker.saveFailed.body':
    'आपके browser ने write मना कर दिया, आमतौर पर storage भर जाने पर ऐसा होता है। यहाँ जो दिख रहा है वह सही है, लेकिन tab बंद करते ही चला जाएगा। इसे अभी export कर लें।',
  'tracker.restore.found': 'इस backup में {n} applications हैं।',
  'tracker.restore.overlap': 'इनमें से {n} पहले से आपके board पर हैं।',
  'tracker.restore.merge': 'Merge करें',
  'tracker.restore.mergeHint':
    'आपके board का सब कुछ रहेगा। जो नहीं है वह जुड़ेगा, जो पुराना है वह update होगा।',
  'tracker.restore.replace': 'Replace करें',
  'tracker.restore.replaceHint': 'आपका मौजूदा board हट जाएगा और उसकी जगह backup आ जाएगा।',
  'tracker.restore.cancel': 'रहने दें',
  'tracker.restore.merged': 'Merge हो गया। आपके board का कुछ नहीं गया।',
  'tracker.restore.replaced': 'Backup से board replace हो गया।',
  'tracker.restore.undo': 'वापस लें',
  'tracker.restore.invalid': 'यह file Switch Karle का backup नहीं है।',
  'stage.researching': 'Research कर रहे हैं',
  'stage.applied': 'Apply कर दिया',
  'stage.interviewing': 'Interview चल रहा है',
  'stage.offer': 'Offer',
  'stage.decided': 'तय हो गया',
  'tracker.form.editTitle': 'Application edit करें',
  'tracker.form.addTitle': 'Application जोड़ें',
  'tracker.field.company.label': 'Company',
  'tracker.field.role.label': 'Role',
  'tracker.field.stage.label': 'Stage',
  'tracker.field.ctcDiscussed.label': 'बताया गया CTC',
  'tracker.field.notice.label': 'Notice period',
  'tracker.field.source.label': 'Source',
  'tracker.field.source.hint': 'Referral, LinkedIn, Naukri…',
  'tracker.field.nextAction.label': 'अगला कदम',
  'tracker.field.nextActionDate.label': 'अगले कदम की तारीख',
  'tracker.field.notes.label': 'Notes',
  'tracker.saveChanges': 'बदलाव save करें',
  'tracker.submitAdd': 'Application जोड़ें',
  'tracker.noApplicationsInStage': 'कोई application नहीं',
  'tracker.movePrev': 'पिछले stage पर ले जाएं',
  'tracker.moveNext': 'अगले stage पर ले जाएं',
  'tracker.edit': 'एडिट करें',
  'tracker.nextLabel': 'अगला:',
  'tracker.noticeChip': '{n} दिन notice',

  // ---- Prompt Studio ----
  'promptStudio.title': 'Prompt Studio',
  'promptStudio.description':
    'एक context-rich prompt बनाएं, उसे ChatGPT/Claude/Gemini में copy करें, फिर जवाब यहां वापस paste करके अपनी tracked application के साथ save करें।',
  'promptStudio.personalizeFor': 'किसके लिए personalize करें',
  'promptStudio.genericOption': 'कोई application नहीं — generic',
  'promptStudio.emptyTitle': 'इन prompts को personalize करने के लिए एक application track करें।',
  'promptStudio.emptyBody':
    'नीचे दिए prompts generically भी काम करते हैं — Tracker में company, role, CTC और notice period जोड़कर ज़्यादा sharp, नाम-specific prompts पाएं।',
  'promptStudio.goToTracker': 'Tracker पर जाएं',
  'category.research': 'Research',
  'category.prepare': 'तैयारी',
  'category.negotiate': 'बातचीत',
  'category.outreach': 'Outreach',
  'promptStudio.copyPrompt': 'Prompt copy करें',
  'promptStudio.copied': 'Copy हो गया ✓',
  'promptStudio.previewPrompt': 'Prompt preview करें',
  'promptStudio.pasteTitle': 'आपके AI ने जो पाया वो paste करें',
  'promptStudio.pasteSub': 'जवाब {company} — {role} के साथ save करें।',
  'promptStudio.answerFor': 'यह जवाब किसके लिए है',
  'promptStudio.pasteLabel': 'AI का जवाब paste करें',
  'promptStudio.saveTo': '{company} में save करें',
  'promptStudio.savedInsights': 'Save किए गए insights',
  'promptStudio.deleteInsightConfirm': 'यह saved insight delete करें? यह वापस नहीं हो सकता।',

  'template.company-research.title': 'Company की due-diligence brief',
  'template.company-research.description':
    'Funding, culture, comp bands, red flags — आगे बढ़ने से पहले एक structured brief।',
  'template.jd-deconstruct.title': 'JD की गहराई से पड़ताल',
  'template.jd-deconstruct.description':
    'Job description paste करें — hidden expectations, keywords और seniority signals decode करें।',
  'template.interview-prep.title': 'Stage के हिसाब से interview की तैयारी',
  'template.interview-prep.description':
    'संभावित rounds, strong-answer outlines, एक STAR story bank, और पूछने लायक questions।',
  'template.negotiation.title': 'Negotiation की रिहर्सल',
  'template.negotiation.description': 'Counter-offers, हर red flag के लिए scripts, walk-away math, और email drafts।',
  'template.outreach.title': 'Referral और recruiter outreach',
  'template.outreach.description': 'छोटे, natural LinkedIn messages — connection note, InMail, और एक follow-up।',
  'template.offer-compare.title': 'Offer comparison और decision framework',
  'template.offer-compare.description':
    'Total-comp truth table, risk-adjusted equity, notice friction — एक असली recommendation निकलवाता है।',

  // ---- Red-flag overrides (UI layer only; engine strings stay canonical English) ----
  'flag.notice-period.title': '{days} दिन का notice period',
  'flag.notice-period.detail':
    'कोई भारतीय कानून 90 दिन का notice ज़रूरी नहीं बनाता — यह पूरी तरह contractual है। लंबा notice period आपको कम hirable बनाता है (companies 30-दिन में join करने वालों को prefer करती हैं) और आपकी अगली switch में negotiating power कमज़ोर करता है। Market बदल चुका है: Cognizant ने 2023 में 30 दिन कर दिया; Flipkart, Razorpay और Swiggy 30-दिन का standard रखते हैं।',
  'flag.notice-period.tip':
    'पूछें: "क्या हम 30–60 दिन का notice रख सकते हैं, या एक buyout clause जहां कोई भी पक्ष notice के बदले पैसे दे सके?" Buyout formula लिखित में लें।',

  'flag.bond.title': 'Service bond: {months} महीनों के लिए ₹{amount}',
  'flag.bond.detail':
    'Courts bond को सिर्फ training cost के एक genuine pre-estimate के तौर पर enforce करती हैं (Contract Act s.74) — मनमानी penalty राशि enforceable नहीं है, और आपको छोड़ने के बाद competitor join करने से रोकने वाली clauses void हैं (s.27)। पर practical दर्द असली है: यह राशि आपके final settlement से काटी जा सकती है और relieving letter रोका जा सकता है, जो background checks में दिक्कत करता है।',
  'flag.bond.tip':
    'पूछें कि bond किस specific training को cover करता है और राशि को महीनों के हिसाब से pro-rate करने को कहें। अगर कोई असली training program नहीं है, तो bond हटाने को कहें।',

  'flag.variable-heavy.title': 'CTC का {percent}% variable pay है',
  'flag.variable-heavy.detail':
    'इस offer का ₹{amount} पक्का पैसा नहीं है — यह company और आपकी individual performance ratings पर depend करता है, जिन पर आपका कोई control नहीं। एक average साल में असली payout target का 70–90% होता है, और पहले साल का payout अक्सर pro-rate होता है। CTC में से variable घटाकर जो बचे, उसी को असली offer मानें।',
  'flag.variable-heavy.tip':
    'पूछें: "पिछले 2 सालों में इस band के लिए actual average variable payout % क्या रहा?" और "क्या मेरा पहला साल pro-rate होगा?" फिर CTC नहीं, fixed पर negotiate करें।',

  'flag.gratuity-in-ctc.title': 'Gratuity CTC के अंदर गिना गया है',
  'flag.gratuity-in-ctc.detail':
    'आपके CTC का ₹{amount}/साल gratuity accrual है — यह पैसा तभी मिलता है जब आप 5 साल टिकें (Payment of Gratuity Act के अनुसार)। 3rd साल में छोड़ने पर CTC का यह हिस्सा कभी आपका था ही नहीं।',
  'flag.gratuity-in-ctc.tip': 'Negotiate करने को कुछ नहीं — offers compare करते समय इसे mentally discount करें। CTC नहीं, fixed cash compare करें।',

  'flag.employer-pf-in-ctc.title': 'Employer PF भी CTC के figure में शामिल है',
  'flag.employer-pf-in-ctc.detail':
    'CTC का ₹{amount}/साल employer का PF contribution है — यह आपका ही पैसा है, पर EPF में retirement/withdrawal तक locked रहता है, आपके bank account में नहीं आता। यह standard practice है, पर headline number को बड़ा दिखाता है।',
  'flag.employer-pf-in-ctc.tip':
    'जब किसी ऐसे offer से compare करें जो employer PF को CTC में नहीं गिनता, तो एक तरफ इसे वापस जोड़ें ताकि apples-to-apples comparison हो।',

  'flag.joining-bonus-clawback.title': '{months}-महीने के clawback वाला joining bonus',
  'flag.joining-bonus-clawback.detail':
    'अगर आप {months} महीनों के अंदर छोड़ते हैं तो ₹{amount} का joining bonus वापस चुकाना होगा — आमतौर पर पूरा, deduct हुए tax समेत। लंबे notice period के साथ मिलकर, यह एक तरह का exit tax बन जाता है।',
  'flag.joining-bonus-clawback.tip':
    'Clawback को महीनों के हिसाब से pro-rate करने को कहें, और exact repayment formula (gross या net) लिखित में लें।',

  'flag.esop-illiquid.title': 'CTC का {percent}% unlisted ESOPs है',
  'flag.esop-illiquid.detail':
    'इस offer का ₹{amount}/साल एक ऐसी company की equity है जहां कोई liquidity event नहीं हुआ — आप इसे बेच नहीं सकते, और ज़्यादातर startup ESOPs या तो worthless expire हो जाते हैं या dilute हो जाते हैं। एक tax trap भी है: options exercise करने पर उन paper gains पर tax लगता है जो आपने cash में realize नहीं किए।',
  'flag.esop-illiquid.tip':
    'Decision लेते समय unlisted ESOPs की value zero मानें। पूछें: आखिरी 409A/valuation क्या थी, buyback history क्या रही, और exit के बाद exercise window कितनी है (90 दिन hostile है; 5+ साल founder-friendly है)।',

  'flag.esop-cliff.title': '{months}-महीने का ESOP cliff',
  'flag.esop-cliff.detail':
    'Standard vesting cliff 12 महीने का होता है। लंबा cliff मतलब उसके vest होने से पहले छोड़ने पर पूरी equity forfeit हो जाती है — यह notice period और bond के ऊपर एक और retention lock की तरह काम करता है।',
  'flag.esop-cliff.tip': 'Standard 12-महीने के cliff के लिए पूछें, उसके बाद monthly या quarterly vesting के साथ।',

  'flag.low-basic.title': 'Basic fixed pay का सिर्फ {percent}% है',
  'flag.low-basic.detail':
    'कम Basic employer PF और gratuity को घटाता है (दोनों Basic पर calculate होते हैं) — यह आपकी नहीं, company की cost optimize करता है। कुछ structures इसका इस्तेमाल in-hand को बड़ा दिखाने और retirement money को छोटा रखने के लिए करते हैं।',
  'flag.low-basic.tip': 'Sign करने से पहले salary structure sheet मांगें और check करें कि Basic fixed pay का कम-से-कम 40% हो।',
}
