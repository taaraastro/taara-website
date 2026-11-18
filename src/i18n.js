/* ===== Reply language: the answer follows the language of the question (typed or spoken) =====
   Offline answers (no AI connected) are written from these templates. 14 template languages are written out in full;
   the other supported languages use the nearest standard language that shares their script (see TEMPLATE_FOR).
   Astrological names (planets, signs, nakshatras, tithis, yogas, karanas) are written once in Devanagari and
   transliterated into the other Indic scripts, except where a language has its own names (Tamil and Malayalam nakshatras,
   planet and sign names in most languages). */

const TEMPLATE_FOR = { doi: "hi", mai: "hi", sa: "hi", awa: "hi", bho: "hi", bgc: "hi", bhb: "hi", bns: "hi", hne: "hi", gbm: "hi", gon: "hi", kfy: "hi", mag: "hi", raj: "hi",
  kok: "mr", tcy: "kn", kfa: "kn", ks: "ur", sd: "ur", mni: "en", kha: "en", lus: "en" };
const LOCALE = { en: "en-IN", hinglish: "en-IN", hi: "hi-IN", mr: "mr-IN", ne: "ne-NP", bn: "bn-IN", as: "as-IN", gu: "gu-IN", pa: "pa-IN", or: "or-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", ur: "ur-IN" };
/* template languages: en, hinglish and hi are built in; the others are small packs in lang/<code>.json, fetched when first
   needed (and kept by the service worker for offline use). Until a pack is loaded, Devanagari languages use Hindi, others English. */
const LANG_PACKS = ["mr", "ne", "bn", "as", "gu", "pa", "or", "ta", "te", "kn", "ml", "ur"];
const tmplWanted = code => I18N[code] || LANG_PACKS.includes(code) ? code : (TEMPLATE_FOR[code] || "en");
const tmplCode = code => { const t = tmplWanted(code); return I18N[t] ? t : DEVANAGARI_LANGS.has(t) ? "hi" : "en"; };
const _packLoads = {};
function loadLangPack(code) {
  const t = tmplWanted(code);
  if (I18N[t] || !LANG_PACKS.includes(t)) return Promise.resolve(true);
  if (!_packLoads[t]) _packLoads[t] = fetch(`lang/${t}.json`).then(r => r.ok ? r.json() : null).then(j => { if (j && j.t) { I18N[t] = j.t; CAL[t] = j.cal; return true; } delete _packLoads[t]; return false; }).catch(() => { delete _packLoads[t]; return false; });
  return _packLoads[t];
}

/* ---------- Devanagari master names ---------- */
const DEV = {
  planet: ["सूर्य", "चंद्र", "मंगल", "बुध", "गुरु", "शुक्र", "शनि", "राहु", "केतु"],
  sign: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  nak: ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "आश्लेषा", "मघा", "पूर्वा फाल्गुनी", "उत्तरा फाल्गुनी", "हस्त", "चित्रा", "स्वाति", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढ़ा", "उत्तराषाढ़ा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्वा भाद्रपद", "उत्तरा भाद्रपद", "रेवती"],
  tithi: ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पंचमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा", "अमावस्या"],
  yoga: ["विष्कम्भ", "प्रीति", "आयुष्मान", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्मा", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतीपात", "वरीयान", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"],
  karana: { Bava: "बव", Balava: "बालव", Kaulava: "कौलव", Taitila: "तैतिल", Garaja: "गर", Vanija: "वणिज", Vishti: "विष्टि", Shakuni: "शकुनि", Chatushpada: "चतुष्पद", Naga: "नाग", Kimstughna: "किंस्तुघ्न" },
  tara: ["जन्म", "संपत", "विपत", "क्षेम", "प्रत्यक", "साधना", "नैधन", "मित्र", "परम मित्र"],
  paksha: ["शुक्ल पक्ष", "कृष्ण पक्ष"],
  mantra: { Sun: "ॐ सूर्याय नमः", Moon: "ॐ चन्द्राय नमः", Mars: "ॐ अंगारकाय नमः", Mercury: "ॐ बुधाय नमः", Jupiter: "ॐ गुरवे नमः", Venus: "ॐ शुक्राय नमः", Saturn: "ॐ शनैश्चराय नमः", Rahu: "ॐ राहवे नमः", Ketu: "ॐ केतवे नमः" },
};
const LATIN_NAMES = {
  planet: ["Surya", "Chandra", "Mangal", "Budh", "Guru", "Shukra", "Shani", "Rahu", "Ketu"],
  tara: ["Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhana", "Naidhana", "Mitra", "Param Mitra"],
  paksha: ["Shukla paksha", "Krishna paksha"],
};
/* Devanagari -> other Indic scripts (the Unicode blocks are laid out in parallel) */
const SCRIPT_OFFSET = { bn: 0x80, as: 0x80, pa: 0x100, gu: 0x180, or: 0x200, ta: 0x280, te: 0x300, kn: 0x380, ml: 0x400 };
const TA_COLLAPSE = { "ख": "क", "ग": "क", "घ": "क", "छ": "च", "झ": "ज", "ठ": "ट", "ड": "ट", "ढ": "ट", "थ": "त", "द": "त", "ध": "त", "फ": "प", "ब": "प", "भ": "प", "ऋ": "रि", "ृ": "ि" };
function translit(s, code) {
  const off = SCRIPT_OFFSET[code];
  if (!off) return s;
  if (code === "ta") s = s.replace(/[खगघछझठडढथदधफबभऋृ]/g, ch => TA_COLLAPSE[ch]).replace(/ं(?=[कखगघ])/g, "ङ्").replace(/ं/g, "म्").replace(/ः/g, "");
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp < 0x900 || cp > 0x97F) { out += ch; continue; }
    if (code === "as" && ch === "र") { out += "ৰ"; continue; }
    if (code === "as" && ch === "व") { out += "ৱ"; continue; }
    if (ch === "ॐ") { out += { bn: "ওঁ", as: "ওঁ", pa: "ੴ", gu: "ૐ", or: "ଓଁ", ta: "ௐ", te: "ఓం", kn: "ಓಂ", ml: "ഓം" }[code]; continue; }
    let t = String.fromCodePoint(cp + off);
    if (/\p{Cn}/u.test(t) || ch === "ऽ") {
      const fb = { "व": "ब", "ष": "श", "ृ": "ि", "ऋ": "रि", "ऑ": "ओ", "ॉ": "ो", "ॅ": "े", "ळ": "ल", "ऽ": "" }[ch];
      t = fb === undefined ? "" : translit(fb, code);
    }
    out += t;
  }
  if (code === "pa") out = out.replace(/ਸ਼੍ਰ/g, "ਸ਼੍ਰ");
  return out.normalize("NFC");
}

/* ---------- per-language strings ---------- */
const I18N = {
  en: {
    ans: "Answer", v: ["Yes, strongly indicated", "Yes, likely", "Possible, with focused effort", "Difficult at present"], fav: "about {n}% favourable", why: "Why",
    lordGood: "The {ho} house lord {pl} is well placed in your {h2o} house, a clear promise for this matter.", lordMid: "The {ho} house lord {pl} is moderately placed in the {h2o} house, so effort decides the result.", lordBad: "The {ho} house lord {pl} sits in the {h2o} house, which points to delays or extra competition.",
    dashaYes: "The running {chain} period is linked to this matter, so the time supports it.", dashaNo: "The running {chain} period is not directly linked, so it needs more effort right now.",
    jupGood: "Jupiter's transit, {no} from the Moon, adds support.", jupWeak: "Jupiter's transit, {no} from the Moon, gives less help, so blessings need extra effort.",
    winHead: "Best time for {topic}", noWin: "No strongly linked period appears in the next 8 years, so results depend on effort and transits.", lockDates: "Exact dates and timings unlock with a plan.",
    nowHead: "Running period", nowLine: "Mahadasha {md} until {d1}, Antardasha {ad} until {d2}, Pratyantar {pd} until {d3}, Sukshma {sd} until {d4}.",
    planHead: "What to do", dayStep: "Take the important step on a {day}, the day of {pl}.", remedy: "Remedy: chant {mantra} 108 times on {day}.",
    unknownTime: "The birth time is unknown, so dates may shift by a few weeks.", askMore: "Ask about career, marriage, money, health, studies, travel or property for exact time windows.",
    topics: { admission: "admission and higher studies", career: "career", marriage: "marriage and love", money: "money", health: "health", education: "studies", children: "children", travel: "travel and settling abroad", property: "home and property", general: "this matter" },
    tips: { admission: "Apply to a balanced list of dream, target and safe colleges, and put extra hours into mock tests.", career: "Update your CV, reach out to people in your field and prepare examples for interviews.", marriage: "Be open to introductions through family and friends, and talk honestly about expectations early.", money: "Avoid speculation, build an emergency fund first and review investments with a qualified adviser.", health: "Keep a regular routine of sleep, walking and simple food, and see a doctor for any symptoms.", education: "Follow a fixed daily study timetable and revise with past papers.", children: "Focus on health and routine, and follow your doctor's guidance.", travel: "Keep documents ready, apply early and have a backup plan for visas.", property: "Check legal papers carefully and do not stretch your budget.", general: "Act with steady effort and patience, and keep your plans flexible." },
    dayHead: "Reading for {date}", rangeHead: "Reading for {d1} – {d2}", rate: ["Excellent day", "Good day", "Mixed day", "Go carefully"], rateFor: "For {topic}: {rate} ({n}/100)",
    moon: "Moon in {sign}, {nak} nakshatra.", tara: "Tara bala: {tara} Tara ({ok})", chandra: "Chandra bala: the Moon is {no} from your Moon sign ({ok})", ok: ["favourable", "mixed", "weak"],
    panchang: "Panchang: {paksha} {tithi}, {yoga} yoga, {karana} karana", dashaOn: "Running dasha that day: {chain}", best: "Best time (Abhijit): {t1} – {t2}", hora: "{pl} hora: {t1} – {t2}", rahu: "Rahu Kaal, do not start new work: {t1} – {t2}",
    goDay: "A good day to take the key step.", waitDay: "Use the day to prepare; the key step goes better on {date}.", bestDays: "Best days", careDays: "Go carefully on", dashaChange: "From {date} the period changes to {chain}.",
    promise: "Overall promise in your chart: {v}", chartOf: "Reading from {name}'s chart", timings: "Timings",
  },
  hinglish: {
    ans: "Jawab", v: ["Haan, strong yog hai", "Haan, chances achhe hain", "Possible hai, focused mehnat se", "Abhi mushkil hai"], fav: "lagbhag {n}% favourable", why: "Kyun",
    lordGood: "{ho} house ka lord {pl} aapke {h2o} house mein achhi position mein hai, is matter ka clear promise hai.", lordMid: "{ho} house ka lord {pl} {h2o} house mein moderate hai, isliye result mehnat par depend karega.", lordBad: "{ho} house ka lord {pl} {h2o} house mein hai, isse delay ya zyada competition dikhta hai.",
    dashaYes: "Chal rahi {chain} dasha is matter se judi hai, isliye time saath de raha hai.", dashaNo: "Chal rahi {chain} dasha is matter se seedhe nahi judi, isliye abhi zyada mehnat chahiye.",
    jupGood: "Guru ka gochar Moon sign se {no} hai, jo support deta hai.", jupWeak: "Guru ka gochar Moon sign se {no} hai, isliye extra mehnat chahiye.",
    winHead: "{topic} ke liye sabse achha time", noWin: "Agle 8 saal mein koi strong judi dasha nahi dikhti, isliye result mehnat aur gochar par depend hai.", lockDates: "Exact dates aur timings plan lene par unlock hoti hain.",
    nowHead: "Abhi ki dasha", nowLine: "Mahadasha {md} {d1} tak, Antardasha {ad} {d2} tak, Pratyantar {pd} {d3} tak, Sukshma {sd} {d4} tak.",
    planHead: "Kya karein", dayStep: "Important step {day} ko lijiye, yeh {pl} ka din hai.", remedy: "Upay: {day} ko {mantra} ka 108 baar jaap kijiye.",
    unknownTime: "Birth time pata nahi hai, isliye dates kuch hafte aage-peeche ho sakti hain.", askMore: "Exact timing ke liye career, shaadi, paisa, health, padhai, videsh ya property ke baare mein poochiye.",
    topics: { admission: "admission aur higher studies", career: "career", marriage: "shaadi aur pyaar", money: "paisa", health: "health", education: "padhai", children: "santan", travel: "videsh", property: "ghar aur property", general: "yeh matter" },
    tips: { admission: "Dream, target aur safe colleges ki balanced list banaiye aur mock tests par extra time dijiye.", career: "CV update kijiye, apni field ke logon se baat kijiye aur interview ki taiyari real examples ke saath kijiye.", marriage: "Family aur dosto ke through aaye rishton ke liye open rahiye aur expectations par shuru mein hi khul kar baat kijiye.", money: "Satta aur speculation se bachiye, pehle emergency fund banaiye aur investment kisi adviser se check karaiye.", health: "Neend, walk aur simple khane ka regular routine rakhiye, koi bhi symptom ho to doctor se miliye.", education: "Roz ka fixed study timetable rakhiye aur har hafte past papers se revision kijiye.", children: "Health aur routine par dhyan dijiye aur doctor ki salah maniye.", travel: "Documents ready rakhiye, jaldi apply kijiye aur visa ke liye backup plan rakhiye.", property: "Legal papers dhyan se check kijiye aur budget se bahar mat jaiye.", general: "Dheeraj aur lagatar mehnat se kaam kijiye aur plans flexible rakhiye." },
    dayHead: "{date} ka phal", rangeHead: "{d1} se {d2} tak ka phal", rate: ["Bahut achha din", "Achha din", "Mila-jula din", "Savdhani ka din"], rateFor: "{topic} ke liye: {rate} ({n}/100)",
    moon: "Chandrama {sign} rashi mein, {nak} nakshatra mein.", tara: "Tara bal: {tara} tara ({ok})", chandra: "Chandra bal: Chandrama aapki Moon sign se {no} house mein ({ok})", ok: ["shubh", "mixed", "kamzor"],
    panchang: "Panchang: {paksha} {tithi}, {yoga} yog, {karana} karan", dashaOn: "Us din ki dasha: {chain}", best: "Shubh samay (Abhijit): {t1} se {t2}", hora: "{pl} ki hora: {t1} se {t2}", rahu: "Rahu kaal, naya kaam shuru na karein: {t1} se {t2}",
    goDay: "Main step lene ke liye yeh din theek hai.", waitDay: "Is din taiyari kijiye; main step {date} ko lena behtar hai.", bestDays: "Sabse achhe din", careDays: "Savdhani ke din", dashaChange: "{date} se dasha badal kar {chain} hogi.",
    promise: "Kundli ka overall yog: {v}", chartOf: "{name} ki kundli se", timings: "Samay",
  },
  hi: {
    ans: "उत्तर", v: ["हाँ, प्रबल योग है", "हाँ, संभावना अच्छी है", "संभव है, केंद्रित प्रयास से", "अभी कठिन है"], fav: "लगभग {n}% अनुकूल", why: "कारण",
    lordGood: "{hv} भाव का स्वामी {pl} आपके {h2v} भाव में अच्छी स्थिति में है, यह इस विषय का स्पष्ट वादा है।", lordMid: "{hv} भाव का स्वामी {pl} {h2v} भाव में मध्यम स्थिति में है, इसलिए परिणाम प्रयास पर निर्भर है।", lordBad: "{hv} भाव का स्वामी {pl} {h2v} भाव में है, जिससे देरी या अधिक प्रतिस्पर्धा दिखती है।",
    dashaYes: "चल रही {chain} दशा इस विषय से जुड़ी है, इसलिए समय साथ दे रहा है।", dashaNo: "चल रही {chain} दशा इस विषय से सीधे नहीं जुड़ी, इसलिए अभी अधिक प्रयास चाहिए।",
    jupGood: "गुरु का गोचर चंद्र राशि से {nv} भाव में है, जो सहायता देता है।", jupWeak: "गुरु का गोचर चंद्र राशि से {nv} भाव में है, इसलिए अतिरिक्त प्रयास चाहिए।",
    winHead: "{topic} के लिए सबसे अच्छा समय", noWin: "अगले 8 वर्षों में कोई प्रबल रूप से जुड़ी दशा नहीं दिखती, इसलिए परिणाम प्रयास और गोचर पर निर्भर हैं।", lockDates: "सटीक तारीखें और समय प्लान लेने पर खुलते हैं।",
    nowHead: "अभी की दशा", nowLine: "महादशा {md} {d1} तक, अंतर्दशा {ad} {d2} तक, प्रत्यंतर {pd} {d3} तक, सूक्ष्म {sd} {d4} तक।",
    planHead: "क्या करें", dayStep: "महत्वपूर्ण कदम {day} को उठाएँ, यह {pl} का दिन है।", remedy: "उपाय: {day} को {mantra} का 108 बार जप करें।",
    unknownTime: "जन्म समय ज्ञात नहीं है, इसलिए तारीखें कुछ हफ्ते आगे-पीछे हो सकती हैं।", askMore: "सटीक समय जानने के लिए करियर, विवाह, धन, स्वास्थ्य, पढ़ाई, विदेश या संपत्ति के बारे में पूछें।",
    topics: { admission: "दाखिले और उच्च शिक्षा", career: "करियर", marriage: "विवाह और प्रेम", money: "धन", health: "स्वास्थ्य", education: "पढ़ाई", children: "संतान", travel: "विदेश यात्रा", property: "घर और संपत्ति", general: "इस विषय" },
    tips: { admission: "सपनों, लक्ष्य और सुरक्षित कॉलेजों की संतुलित सूची बनाएँ और मॉक टेस्ट पर अधिक समय दें।", career: "अपना बायोडाटा अपडेट करें, अपने क्षेत्र के लोगों से संपर्क करें और इंटरव्यू की तैयारी असली उदाहरणों के साथ करें।", marriage: "परिवार और मित्रों के माध्यम से आने वाले रिश्तों के लिए खुले रहें और अपेक्षाओं पर शुरू में ही ईमानदारी से बात करें।", money: "सट्टे से बचें, पहले आपातकालीन बचत बनाएँ और निवेश किसी योग्य सलाहकार से जाँचें।", health: "नींद, सैर और सादे भोजन की नियमित दिनचर्या रखें और किसी भी लक्षण पर डॉक्टर से मिलें।", education: "रोज़ की निश्चित पढ़ाई की समय-सारिणी रखें और हर हफ्ते पिछले प्रश्नपत्रों से दोहराएँ।", children: "स्वास्थ्य और दिनचर्या पर ध्यान दें और डॉक्टर की सलाह मानें।", travel: "दस्तावेज़ तैयार रखें, जल्दी आवेदन करें और वीज़ा के लिए वैकल्पिक योजना रखें।", property: "कानूनी कागज़ ध्यान से जाँचें और बजट से बाहर न जाएँ।", general: "धैर्य और लगातार प्रयास से काम करें और योजनाएँ लचीली रखें।" },
    dayHead: "{date} का फल", rangeHead: "{d1} से {d2} तक का फल", rate: ["बहुत अच्छा दिन", "अच्छा दिन", "मिला-जुला दिन", "सावधानी का दिन"], rateFor: "{topic} के लिए: {rate} ({n}/100)",
    moon: "चंद्रमा {sign} राशि में, {nak} नक्षत्र में।", tara: "तारा बल: {tara} तारा ({ok})", chandra: "चंद्र बल: चंद्रमा आपकी चंद्र राशि से {nv} भाव में ({ok})", ok: ["शुभ", "मिश्रित", "कमज़ोर"],
    panchang: "पंचांग: {paksha} {tithi}, योग {yoga}, करण {karana}", dashaOn: "उस दिन की दशा: {chain}", best: "शुभ समय (अभिजित): {t1} से {t2}", hora: "{pl} की होरा: {t1} से {t2}", rahu: "राहु काल, नया काम शुरू न करें: {t1} से {t2}",
    goDay: "मुख्य कदम उठाने के लिए यह दिन ठीक है।", waitDay: "इस दिन तैयारी करें; मुख्य कदम {date} को उठाना बेहतर है।", bestDays: "सबसे अच्छे दिन", careDays: "सावधानी के दिन", dashaChange: "{date} से दशा बदलकर {chain} होगी।",
    promise: "कुंडली का कुल योग: {v}", chartOf: "{name} की कुंडली से", timings: "समय",
  },
};
const PL_IDX = { Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6, Rahu: 7, Ketu: 8 };
const DAY_OF_LORD = { Sun: 0, Moon: 1, Mars: 2, Mercury: 3, Jupiter: 4, Venus: 5, Saturn: 6, Rahu: 6, Ketu: 2 };

/* names in a language */
function lname(code, kind, key) {
  const T = I18N[code] || {}, en = code === "en", latin = code === "hinglish";
  if (kind === "planet") { const i = PL_IDX[key]; return en ? key : latin ? LATIN_NAMES.planet[i] : (T.planet || DEV.planet.map(x => translit(x, code)))[i]; }
  if (kind === "sign") return en ? A.SIGNS[key] : latin ? A.SIGNS_HI[key] : (T.sign || DEV.sign.map(x => translit(x, code)))[key];
  if (kind === "nak") return en || latin || code === "ur" ? A.NAK[key] : T.nak ? T.nak[key] : translit(DEV.nak[key], code);
  if (kind === "tithi") { const i = TITHI_EN.indexOf(key); return en || latin || code === "ur" || i < 0 ? key : translit(DEV.tithi[i], code); }
  if (kind === "yoga") { const i = YOGA_EN.indexOf(key); return en || latin || code === "ur" || i < 0 ? key : translit(DEV.yoga[i], code); }
  if (kind === "karana") return en || latin || code === "ur" || !DEV.karana[key] ? key : translit(DEV.karana[key], code);
  if (kind === "tara") return en || latin ? LATIN_NAMES.tara[key] : T.taraNames ? T.taraNames[key] : translit(DEV.tara[key], code);
  if (kind === "paksha") return en || latin ? LATIN_NAMES.paksha[key] : T.pakshaNames ? T.pakshaNames[key] : translit(DEV.paksha[key], code);
  if (kind === "mantra") return en || latin || code === "ur" ? LORD_MANTRA[key] : translit(DEV.mantra[key], code);
  return key;
}
const TITHI_EN = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"];
const YOGA_EN = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];

/* ordinals ("2nd house") where the language has irregular forms */
const ORD_IRR = { hi: [null, "पहले", "दूसरे", "तीसरे", "चौथे", null, "छठे"], mr: [null, "पहिल्या", "दुसऱ्या", "तिसऱ्या", "चौथ्या", null, "सहाव्या"], gu: [null, "પહેલા", "બીજા", "ત્રીજા", "ચોથા", null, "છઠ્ઠા"], pa: [null, "ਪਹਿਲੇ", "ਦੂਜੇ", "ਤੀਜੇ", "ਚੌਥੇ"], ne: [null, "पहिलो", "दोस्रो", "तेस्रो", "चौथो"] };
const ORD_SUF = { hi: "वें", mr: " व्या", gu: "મા", pa: "ਵੇਂ", ne: "औं" };
const ordL = (code, n) => (ORD_IRR[code] && ORD_IRR[code][n]) || n + (ORD_SUF[code] || "");
/* fill a template */
function tf(code, key, vars = {}) {
  const T = I18N[code] || I18N.en;
  vars = Object.assign({}, vars);
  for (const k of ["h", "h2", "n"]) if (typeof vars[k] === "number") vars[k + "v"] = ordL(code, vars[k]);
  let s = T[key] !== undefined ? T[key] : I18N.en[key];
  return String(s).replace(/\{(\w+)\}/g, (m, k) => vars[k] !== undefined ? vars[k] : m);
}
/* dates and clock times in the reader's language (own tables: phones and headless browsers do not all carry every locale) */
const CAL = {
  hi: ["रविवार सोमवार मंगलवार बुधवार गुरुवार शुक्रवार शनिवार", "जनवरी फ़रवरी मार्च अप्रैल मई जून जुलाई अगस्त सितंबर अक्टूबर नवंबर दिसंबर"],
  hinglish: ["Ravivar Somvar Mangalvar Budhvar Guruvar Shukravar Shanivar", "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"],
  en: ["Sunday Monday Tuesday Wednesday Thursday Friday Saturday", "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"],
};
const calOf = code => { const c = CAL[code] || CAL.en; return { wd: c[0].split(" "), mo: c[1].split(" ") }; };
const _ymd = ds => ds.split("-").map(Number);
const _wdIdx = ds => { const [y, m, d] = _ymd(ds); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
function jToDs(J) { const d = A.jdToDate(J + deviceTz() / 24); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`; }
function ldateStr(code, ds) { const [y, m, d] = _ymd(ds); return `${d} ${calOf(code).mo[m - 1]} ${y}`; }
function ldate(code, J) { return ldateStr(code, jToDs(J)); }
function ldateLong(code, ds) { return `${lweekday(code, _wdIdx(ds))}, ${ldateStr(code, ds)}`; }
function ldateWd(code, ds) {
  const [, m, d] = _ymd(ds), C = calOf(code);
  if (code === "en" || code === "hinglish") return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][_wdIdx(ds)]} ${d} ${MON[m - 1]}`;
  return `${C.wd[_wdIdx(ds)]}, ${d} ${C.mo[m - 1]}`;
}
const ltime = (code, h) => fmtH(h);
const lweekday = (code, wd) => calOf(code).wd[wd];
const lchain = (code, lords) => lords.map(l => lname(code, "planet", l)).join("–");

/* ---------- which language did the user write in? ---------- */
const HINGLISH_WORDS = /\b(kya|kab|kaise|kaisa|kaisi|kitna|kitne|kyun|kyon|mera|meri|mere|mujhe|muje|hoga|hogi|honge|milega|milegi|milenge|karun|karu|karna|chahiye|hai|hain|nahi|nahin|aaj|kal|parso|parson|agle|agla|is|iss|hafte|hafta|mahine|mahina|saal|shaadi|shadi|naukri|paisa|paise|padhai|ghar|bhai|beta|beti|accha|acha|achha|rahega|rahegi|jaunga|jaungi|sakta|sakti|lagegi|lagega|ki|ke|ko|se|mein|par|tak|wala|wali|janmdin|janamdin|din|raat|subah|shaam)\b/gi;
const ENGLISH_WORDS = /\b(the|will|when|what|which|how|my|is|are|am|i|me|get|be|do|does|should|can|could|would|job|marriage|this|next|week|month|year|today|tomorrow|for|in|on|of|and|to|a|an|with|about)\b/gi;
const NEPALI_HINT = /(हुन्छ|छन्|मेरो|मलाई|कहिले|गर्नु|पाउँछु|हुनेछ|भोलि|पर्सि|हप्ता|जागिर|बिहे)/;
const MARATHI_HINT = /(आहे|होईल|माझ|मला|कधी|उद्या|परवा|आठवड|महिन्यात|नोकरी|मिळेल|करू|काय|आमच|तुमच)/;
const HINDI_HINT = /(है|हैं|होगा|होगी|मेरा|मेरी|मुझे|कब|क्या|कल|परसों|हफ्ते|महीने|मिलेगी|मिलेगा)/;
function detectReplyLang(text, chosen) {
  text = text || "";
  chosen = chosen && chosen !== "auto" ? chosen : null;
  const scriptLang = detectLang(text, chosen || "en");
  if (/[ऀ-ॿ]/.test(text) && !(chosen && DEVANAGARI_LANGS.has(chosen) && !["hi", "mr", "ne"].includes(chosen))) {
    const mr = (text.match(new RegExp(MARATHI_HINT.source, "g")) || []).length, ne = (text.match(new RegExp(NEPALI_HINT.source, "g")) || []).length, hi = (text.match(new RegExp(HINDI_HINT.source, "g")) || []).length;
    if (mr > hi && mr >= ne) return "mr";
    if (ne > hi && ne > mr) return "ne";
    if (chosen && DEVANAGARI_LANGS.has(chosen) && hi === 0 && mr === 0 && ne === 0) return chosen;
    return "hi";
  }
  if (scriptLang !== (chosen || "en") || /[^\u0000-ɏ -⁯₹]/.test(text)) return scriptLang;
  // Latin script: Hinglish, English, or the chosen Latin-script language (Khasi, Mizo)
  const words = (text.match(/[A-Za-z]+/g) || []).length || 1;
  const hg = (text.match(HINGLISH_WORDS) || []).filter(w => !["is", "par", "se"].includes(w.toLowerCase())).length;
  const en = (text.match(ENGLISH_WORDS) || []).length;
  if (hg >= 2 && hg >= en * 0.6) return "hinglish";
  if (hg >= 1 && en === 0) return "hinglish";
  if (chosen && ["kha", "lus"].includes(chosen) && en / words < 0.3) return chosen;
  if (en > 0 || !chosen) return "en";
  return ["en", "hinglish", "kha", "lus"].includes(chosen) ? chosen : "en";
}

/* ---------- topic words in Indian languages (scripts other than Latin) ---------- */
const NATIVE_TOPIC = {
  admission: ["दाखिला", "दाखिले", "प्रवेश", "एडमिशन", "ভর্তি", "নামভৰ্তি", "પ્રવેશ", "એડમિશન", "ਦਾਖ਼ਲਾ", "ਦਾਖਲਾ", "ନାମଲେଖା", "சேர்க்கை", "అడ్మిషన్", "ಪ್ರವೇಶ", "പ്രവേശന", "داخلہ"],
  career: ["इंटरव्यू", "साक्षात्कार", "मुलाखत", "ইন্টারভিউ", "ઇન્ટરવ્યૂ", "ਇੰਟਰਵਿਊ", "நேர்காணல்", "ఇంటర్వ్యూ", "ಸಂದರ್ಶನ", "അഭിമുഖ", "انٹرویو", "नौकरी", "नोकरी", "जागिर", "करियर", "करिअर", "कैरियर", "व्यवसाय", "व्यापार", "बिज़नेस", "बिजनेस", "प्रमोशन", "धंधा", "চাকরি", "চাকৰি", "ব্যবসা", "কেরিয়ার", "ক্যারিয়ার", "নোকরি", "નોકરી", "ધંધો", "વ્યવસાય", "કારકિર્દી", "ਨੌਕਰੀ", "ਕਾਰੋਬਾਰ", "ਕਰੀਅਰ", "ଚାକିରି", "ବ୍ୟବସାୟ", "வேலை", "தொழில்", "உத்தியோக", "ఉద్యోగ", "వ్యాపార", "కెరీర్", "ಉದ್ಯೋಗ", "ಕೆಲಸ", "ವ್ಯಾಪಾರ", "ജോലി", "ഉദ്യോഗ", "ബിസിനസ്", "نوکری", "ملازمت", "کاروبار"],
  marriage: ["शादी", "विवाह", "बिहे", "लग्न कधी", "लग्न होईल", "लग्नाचा", "प्रेम", "जीवनसाथी", "পতি", "বিয়ে", "বিবাহ", "বিয়া", "প্রেম", "লগ্ন", "લગ્ન", "પ્રેમ", "ਵਿਆਹ", "ਪਿਆਰ", "ବିବାହ", "ବାହାଘର", "திருமண", "கல்யாண", "காதல்", "పెళ్లి", "పెళ్ళి", "వివాహ", "ప్రేమ", "ಮದುವೆ", "ವಿವಾಹ", "ಪ್ರೀತಿ", "വിവാഹ", "കല്യാണ", "പ്രണയ", "شادی", "نکاح", "محبت"],
  money: ["पैसा", "पैसे", "धन", "कमाई", "निवेश", "कर्ज", "कर्ज़", "লোন", "টাকা", "টকা", "অর্থ", "ধন", "પૈસા", "ધન", "આવક", "ਪੈਸਾ", "ਪੈਸੇ", "ਧਨ", "ଟଙ୍କା", "ଧନ", "பணம்", "செல்வ", "வருமான", "డబ్బు", "ధన", "ఆదాయ", "ಹಣ", "ಧನ", "ಆದಾಯ", "പണം", "ധന", "വരുമാന", "پیسہ", "پیسے", "دولت", "آمدنی"],
  health: ["स्वास्थ्य", "सेहत", "बीमारी", "रोग", "तबीयत", "आरोग्य", "স্বাস্থ্য", "অসুখ", "তબિયત", "સ્વાસ્થ્ય", "આરોગ્ય", "ਸਿਹਤ", "ਬਿਮਾਰੀ", "ସ୍ୱାସ୍ଥ୍ୟ", "உடல்நல", "ஆரோக்கிய", "நோய்", "ఆరోగ్య", "ಆರೋಗ್ಯ", "ആരോഗ്യ", "അസുഖ", "صحت", "بیماری"],
  education: ["पढ़ाई", "पढाई", "परीक्षा", "शिक्षा", "अभ्यास", "रिज़ल्ट", "পড়াশোনা", "পরীক্ষা", "পঢ়া", "পৰীক্ষা", "અભ્યાસ", "પરીક્ષા", "ਪੜ੍ਹਾਈ", "ਪ੍ਰੀਖਿਆ", "ਇਮਤਿਹਾਨ", "ପଢ଼ା", "ପରୀକ୍ଷା", "படிப்பு", "தேர்வு", "பரீட்சை", "చదువు", "పరీక్ష", "ಓದು", "ಪರೀಕ್ಷೆ", "ವಿದ್ಯಾಭ್ಯಾಸ", "പഠന", "പരീക്ഷ", "پڑھائی", "امتحان", "تعلیم"],
  children: ["संतान", "सन्तान", "संतती", "बच्चा", "बच्चे", "সন্তান", "સંતાન", "બાળક", "ਔਲਾਦ", "ਬੱਚਾ", "ସନ୍ତାନ", "குழந்தை", "సంతాన", "పిల్లల", "ಮಕ್ಕಳ", "ಸಂತಾನ", "കുട്ടി", "സന്താന", "اولاد", "بچہ"],
  travel: ["विदेश", "परदेश", "परदेस", "यात्रा", "वीज़ा", "वीजा", "বিদেশ", "ভ্রমণ", "વિદેશ", "પ્રવાસ", "ਵਿਦੇਸ਼", "ਯਾਤਰਾ", "ବିଦେଶ", "ଯାତ୍ରା", "வெளிநாடு", "பயண", "విదేశ", "ప్రయాణ", "ವಿದೇಶ", "ಪ್ರಯಾಣ", "വിദേശ", "യാത്ര", "بیرون ملک", "سفر", "ویزا"],
  property: ["मकान", "संपत्ति", "सम्पत्ति", "मालमत्ता", "जमीन", "ज़मीन", "प्रॉपर्टी", "गाड़ी", "বাড়ি", "সম্পত্তি", "জমি", "ঘৰ", "ઘર", "મિલકત", "જમીન", "ਘਰ", "ਜਾਇਦਾਦ", "ਜ਼ਮੀਨ", "ଘର", "ସମ୍ପତ୍ତି", "ଜମି", "வீடு", "சொத்து", "நில", "ఇల్లు", "ఆస్తి", "భూమి", "ಮನೆ", "ಆಸ್ತಿ", "ಜಮೀನ", "വീട്", "സ്വത്ത്", "ഭൂമി", "گھر", "جائیداد", "زمین"],
};
function nativeTopic(q) {
  for (const t of TOPICS) if ((NATIVE_TOPIC[t.key] || []).some(w => q.includes(w))) return t;
  return null;
}
const NATIVE_WHEN = /(कब|कधी|कहिले|কবে|কেতিয়া|ક્યારે|ਕਦੋਂ|କେବେ|எப்போது|எப்பொழுது|ఎప్పుడు|ಯಾವಾಗ|എപ്പോൾ|کب)/;
const NATIVE_YN = /(क्या|होगा\s*[?？]?$|होगी\s*[?？]?$|मिलेगा|मिलेगी|होईल का|मिळेल का|का\s*[?？]$|हुन्छ\s*[?？]|পাব\s*কি|হবে\s*কি|কি\s+.*[?？]$|নেকি|શું|મળશે|થશે|ਕੀ\s|ਮਿਲੇਗਾ|ਮਿਲੇਗੀ|କି\s*[?？]?$|ମିଳିବ କି|[ாா]\s*[?？]$|மா\s*[?？]$|ా\s*[?？]$|ಾ\s*[?？]$|ೇ\s*[?？]$|ോ\s*[?？]$|کیا)/;
function nativeYesNo(q) { return !NATIVE_WHEN.test(q) && NATIVE_YN.test(q.trim()); }
