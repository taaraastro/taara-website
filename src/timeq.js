/* ===== Time-scoped questions =====
   "today", "tomorrow", "day after tomorrow", "this/next week", "this/next month", "this weekend", "next 5 days",
   a weekday, a date ("5 Dec", "Dec 5", "05/12", "2026-12-05", "5 तारीख") or "on my birthday", in English, Hinglish and
   the Indian languages. A time-scoped question is answered for that period only: the transits of that date (Moon sign and
   nakshatra, tara bala, chandra bala), the panchang, the dasha running on that date and practical timings. */

const NATIVE_DIGITS = ["०१२३४५६७८९", "০১২৩৪৫৬৭৮৯", "੦੧੨੩੪੫੬੭੮੯", "૦૧૨૩૪૫૬૭૮૯", "୦୧୨୩୪୫୬୭୮୯", "௦௧௨௩௪௫௬௭௮௯", "౦౧౨౩౪౫౬౭౮౯", "೦೧೨೩೪೫೬೭೮೯", "൦൧൨൩൪൫൬൭൮൯", "۰۱۲۳۴۵۶۷۸۹", "٠١٢٣٤٥٦٧٨٩"];
function asciiDigits(s) {
  return s.replace(/[०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯۰-۹٠-٩]/g, ch => { for (const set of NATIVE_DIGITS) { const i = set.indexOf(ch); if (i >= 0) return String(i); } return ch; });
}
const _escR = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* a word list as one regex: Latin words need word boundaries; words in Indian scripts need a boundary before them,
   and after them too when they are short (so कल does not match निकल or कलम) */
function wordRe(latin, native) {
  const parts = [];
  if (latin.length) parts.push(`(?<![A-Za-z])(?:${latin.map(_escR).join("|")})(?![A-Za-z])`);
  for (const w of native) parts.push(`(?<![\\p{L}\\p{M}])${_escR(w)}${[...w].length <= 3 ? "(?![\\p{L}\\p{M}])" : ""}`);
  return new RegExp(parts.join("|"), "iu");
}
const WHEN_RE = {
  nowadays: wordRe(["aaj kal", "aajkal", "aaj-kal", "these days", "nowadays"], ["आजकल", "आज कल", "আজকাল", "આજકાલ", "ਅੱਜਕੱਲ੍ਹ", "آج کل"]),
  birthday: wordRe(["birthday", "bday", "b'day", "janmdin", "janamdin", "janmadin", "janam din", "janm din"], ["जन्मदिन", "जन्मदिवस", "जन्म दिन", "वाढदिवस", "জন্মদিন", "জন্মদিনে", "જન્મદિવસ", "જન્મદિન", "ਜਨਮਦਿਨ", "ଜନ୍ମଦିନ", "பிறந்தநாள்", "பிறந்த நாள்", "పుట్టినరోజు", "ಹುಟ್ಟುಹಬ್ಬ", "ಜನ್ಮದಿನ", "പിറന്നാൾ", "ജന്മദിന", "سالگرہ"]),
  dayafter: wordRe(["day after tomorrow", "parso", "parson", "parsoon", "parsun"], ["परसों", "परसो", "परवा", "पर्सि", "পরশু", "পৰহিলৈ", "પરમ દિવસે", "પરમદિવસે", "ਪਰਸੋਂ", "ପରଶୁ", "நாளை மறுநாள்", "நாளைமறுநாள்", "ఎల్లుండి", "ನಾಡಿದ್ದು", "മറ്റന്നാൾ", "پرسوں"]),
  tomorrow: wordRe(["tomorrow", "tmrw", "tmr", "kal", "kl", "kaal"], ["कल", "उद्या", "भोलि", "আগামীকাল", "কাল", "কালকে", "কাইলৈ", "આવતીકાલે", "આવતી કાલે", "કાલે", "ਕੱਲ੍ਹ", "ਕੱਲ", "ਭਲਕੇ", "କାଲି", "நாளை", "రేపు", "ನಾಳೆ", "നാളെ", "کل"]),
  today: wordRe(["today", "tonight", "this evening", "this morning", "this afternoon", "aaj", "aj", "aaj raat"], ["आज", "आजच", "আজ", "আজি", "આજે", "આજ", "ਅੱਜ", "ଆଜି", "இன்று", "இன்றைக்கு", "ఈరోజు", "ఈ రోజు", "నేడు", "ಇಂದು", "ಇವತ್ತು", "ഇന്ന്", "آج"]),
  weekend: wordRe(["this weekend", "weekend", "week end", "is weekend"], ["वीकेंड", "सप्ताहांत", "সপ্তাহান্তে", "সপ্তাহান্ত", "વીકએન્ડ", "ਵੀਕਐਂਡ", "வார இறுதி", "వారాంతం", "ವಾರಾಂತ್ಯ", "വാരാന്ത്യ", "ویک اینڈ"]),
  nextWeek: wordRe(["next week", "agle hafte", "agle week", "agle saptah", "coming week", "agla hafta", "next wk"], ["अगले हफ्ते", "अगले हफ़्ते", "अगले सप्ताह", "आने वाले हफ्ते", "आने वाले सप्ताह", "पुढच्या आठवड्यात", "पुढील आठवड्यात", "पुढच्या आठवड्यात", "अर्को हप्ता", "आगामी हप्ता", "আগামী সপ্তাহে", "পরের সপ্তাহে", "আগামী সপ্তাহ", "অহা সপ্তাহত", "આવતા અઠવાડિયે", "આવતા સપ્તાહે", "ਅਗਲੇ ਹਫ਼ਤੇ", "ਅਗਲੇ ਹਫਤੇ", "ଆସନ୍ତା ସପ୍ତାହ", "அடுத்த வாரம்", "వచ్చే వారం", "ಮುಂದಿನ ವಾರ", "അടുത്ത ആഴ്ച", "اگلے ہفتے"]),
  thisWeek: wordRe(["this week", "is hafte", "iss hafte", "is week", "iss week", "is saptah", "within this week"], ["इस हफ्ते", "इस हफ़्ते", "इस सप्ताह", "इसी हफ्ते", "इसी सप्ताह", "या आठवड्यात", "ह्या आठवड्यात", "यो हप्ता", "এই সপ্তাহে", "এই সপ্তাহ", "এই সপ্তাহত", "આ અઠવાડિયે", "આ સપ્તાહે", "ਇਸ ਹਫ਼ਤੇ", "ਇਸ ਹਫਤੇ", "ଏହି ସପ୍ତାହ", "இந்த வாரம்", "ఈ వారం", "ಈ ವಾರ", "ഈ ആഴ്ച", "اس ہفتے"]),
  nextMonth: wordRe(["next month", "agle mahine", "agle month", "coming month", "agla mahina"], ["अगले महीने", "अगले माह", "आने वाले महीने", "पुढच्या महिन्यात", "पुढील महिन्यात", "अर्को महिना", "আগামী মাসে", "পরের মাসে", "অহা মাহত", "આવતા મહિને", "ਅਗਲੇ ਮਹੀਨੇ", "ଆସନ୍ତା ମାସ", "அடுத்த மாதம்", "వచ్చే నెల", "ಮುಂದಿನ ತಿಂಗಳು", "അടുത്ത മാസം", "اگلے مہینے"]),
  thisMonth: wordRe(["this month", "is mahine", "iss mahine", "is month", "iss month"], ["इस महीने", "इस माह", "इसी महीने", "या महिन्यात", "ह्या महिन्यात", "यो महिना", "এই মাসে", "এই মাহত", "આ મહિને", "ਇਸ ਮਹੀਨੇ", "ଏହି ମାସ", "இந்த மாதம்", "ఈ నెల", "ಈ ತಿಂಗಳು", "ഈ മാസം", "اس مہینے"]),
  next: wordRe(["next", "agle", "agla", "coming", "aane wale", "upcoming"], ["अगले", "अगला", "आने वाले", "पुढच्या", "पुढील", "आगामी", "আগামী", "পরের", "આવતા", "ਅਗਲੇ", "ଆସନ୍ତା", "அடுத்த", "వచ్చే", "ಮುಂದಿನ", "അടുത്ത", "اگلے"]),
};
const WEEKDAY_LATIN = [["sunday", "ravivar", "raviwar", "itvar", "itwar", "etvar", "aitvaar", "itvaar"], ["monday", "somvar", "somwar", "somvaar"], ["tuesday", "mangalvar", "mangalwar", "mangalvaar"], ["wednesday", "budhvar", "budhwar", "budhvaar"], ["thursday", "guruvar", "guruwar", "brihaspativar", "veervar", "guruvaar"], ["friday", "shukravar", "shukrawar", "shukravaar"], ["saturday", "shanivar", "shaniwar", "shanivaar"]];
const WEEKDAY_NATIVE = [
  ["रविवार", "इतवार", "आइतबार", "রবিবার", "দেওবাৰ", "રવિવાર", "ਐਤਵਾਰ", "ରବିବାର", "ஞாயிற்றுக்கிழமை", "ఆదివారం", "ಭಾನುವಾರ", "ರವಿವಾರ", "ഞായറാഴ്ച", "اتوار کو"],
  ["सोमवार", "सोमबार", "সোমবার", "সোমবাৰ", "સોમવાર", "ਸੋਮਵਾਰ", "ସୋମବାର", "திங்கட்கிழமை", "திங்கள்கிழமை", "సోమవారం", "ಸೋಮವಾರ", "തിങ്കളാഴ്ച", "پیر کو"],
  ["मंगलवार", "मंगळवार", "मङ्गलबार", "মঙ্গলবার", "মংগলবাৰ", "મંગળવાર", "ਮੰਗਲਵਾਰ", "ମଙ୍ଗଳବାର", "செவ்வாய்க்கிழமை", "మంగళవారం", "ಮಂಗಳವಾರ", "ചൊവ്വാഴ്ച", "منگل کو"],
  ["बुधवार", "बुधबार", "বুধবার", "বুধবাৰ", "બુધવાર", "ਬੁੱਧਵਾਰ", "ବୁଧବାର", "புதன்கிழமை", "బుధవారం", "ಬುಧವಾರ", "ബുധനാഴ്ച", "بدھ کو"],
  ["गुरुवार", "बृहस्पतिवार", "बिहीबार", "বৃহস্পতিবার", "বৃহস্পতিবাৰ", "ગુરુવાર", "ਵੀਰਵਾਰ", "ଗୁରୁବାର", "வியாழக்கிழமை", "గురువారం", "ಗುರುವಾರ", "വ്യാഴാഴ്ച", "جمعرات کو"],
  ["शुक्रवार", "शुक्रबार", "শুক্রবার", "শুক্ৰবাৰ", "શુક્રવાર", "ਸ਼ੁੱਕਰਵਾਰ", "ଶୁକ୍ରବାର", "வெள்ளிக்கிழமை", "శుక్రవారం", "ಶುಕ್ರವಾರ", "വെള്ളിയാഴ്ച", "جمعہ کو"],
  ["शनिवार", "शनिबार", "শনিবার", "শনিবাৰ", "શનિવાર", "ਸ਼ਨੀਵਾਰ", "ଶନିବାର", "சனிக்கிழமை", "శనివారం", "ಶನಿವಾರ", "ശനിയാഴ്ച", "ہفتے کو"],
];
const WEEKDAY_RE = WEEKDAY_LATIN.map((l, i) => wordRe(l, WEEKDAY_NATIVE[i]));
const MONTHS_NATIVE = "जानेवारी फेब्रुवारी मार्च एप्रिल मे जून जुलै ऑगस्ट सप्टेंबर ऑक्टोबर नोव्हेंबर डिसेंबर | जनवरी फेब्रुअरी मार्च अप्रिल मे जुन जुलाई अगस्ट सेप्टेम्बर अक्टोबर नोभेम्बर डिसेम्बर | জানুয়ারি ফেব্রুয়ারি মার্চ এপ্রিল মে জুন জুলাই আগস্ট সেপ্টেম্বর অক্টোবর নভেম্বর ডিসেম্বর | জানুৱাৰী ফেব্ৰুৱাৰী মাৰ্চ এপ্ৰিল মে জুন জুলাই আগষ্ট ছেপ্তেম্বৰ অক্টোবৰ নৱেম্বৰ ডিচেম্বৰ | જાન્યુઆરી ફેબ્રુઆરી માર્ચ એપ્રિલ મે જૂન જુલાઈ ઑગસ્ટ સપ્ટેમ્બર ઑક્ટોબર નવેમ્બર ડિસેમ્બર | ਜਨਵਰੀ ਫ਼ਰਵਰੀ ਮਾਰਚ ਅਪ੍ਰੈਲ ਮਈ ਜੂਨ ਜੁਲਾਈ ਅਗਸਤ ਸਤੰਬਰ ਅਕਤੂਬਰ ਨਵੰਬਰ ਦਸੰਬਰ | ଜାନୁଆରୀ ଫେବୃଆରୀ ମାର୍ଚ୍ଚ ଅପ୍ରେଲ ମଇ ଜୁନ ଜୁଲାଇ ଅଗଷ୍ଟ ସେପ୍ଟେମ୍ବର ଅକ୍ଟୋବର ନଭେମ୍ବର ଡିସେମ୍ବର | ஜனவரி பிப்ரவரி மார்ச் ஏப்ரல் மே ஜூன் ஜூலை ஆகஸ்ட் செப்டம்பர் அக்டோபர் நவம்பர் டிசம்பர் | జనవరి ఫిబ్రవరి మార్చి ఏప్రిల్ మే జూన్ జూలై ఆగస్టు సెప్టెంబర్ అక్టోబర్ నవంబర్ డిసెంబర్ | ಜನವರಿ ಫೆಬ್ರವರಿ ಮಾರ್ಚ್ ಏಪ್ರಿಲ್ ಮೇ ಜೂನ್ ಜುಲೈ ಆಗಸ್ಟ್ ಸೆಪ್ಟೆಂಬರ್ ಅಕ್ಟೋಬರ್ ನವೆಂಬರ್ ಡಿಸೆಂಬರ್ | ജനുവരി ഫെബ്രുവരി മാർച്ച് ഏപ്രിൽ മേയ് ജൂൺ ജൂലൈ ഓഗസ്റ്റ് സെപ്റ്റംബർ ഒക്ടോബർ നവംബർ ഡിസംബർ | جنوری فروری مارچ اپریل مئی جون جولائی اگست ستمبر اکتوبر نومبر دسمبر";
/* month names: English, Hindi and every template language (from the browser's own calendar data) */
const MONTH_NAMES = (() => {
  const out = Array.from({ length: 12 }, () => new Set());
  const en = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  en.forEach((m, i) => { out[i].add(m); out[i].add(m.slice(0, 3)); });
  out[8].add("sept");
  ["जनवरी", "फरवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"].forEach((m, i) => out[i > 1 ? i - 1 : i].add(m));
  out[8].add("सितम्बर"); out[9].add("अक्तूबर"); out[10].add("नवम्बर"); out[11].add("दिसम्बर");
  for (const code in CAL) CAL[code][1].split(" ").forEach((n, i) => out[i].add(n.toLowerCase()));
  for (const set of MONTHS_NATIVE.split(" | ")) set.split(" ").forEach((n, i) => out[i].add(n));
  for (const loc of Object.values(LOCALE)) for (const style of ["long", "short"]) {
    try { const f = new Intl.DateTimeFormat(loc, { month: style, timeZone: "UTC" }); for (let i = 0; i < 12; i++) { const n = f.format(new Date(Date.UTC(2024, i, 15))).replace(/[.‌‍]/g, "").toLowerCase(); if (n && !/^\d+$/.test(n)) out[i].add(n); } } catch (e) {}
  }
  return out.map(s => [...s].sort((a, b) => b.length - a.length));
})();
const MONTH_ALT = MONTH_NAMES.map((names, i) => names.map(n => [n, i])).flat().sort((a, b) => b[0].length - a[0].length);
const MONTH_RX = `(${MONTH_ALT.map(([n]) => _escR(n)).join("|")})`;
const monthIdx = s => { s = s.toLowerCase(); const hit = MONTH_ALT.find(([n]) => n === s); return hit ? hit[1] : -1; };
const DAY_WORD = "(?:st|nd|rd|th)?";
const TARIKH = /(\d{1,2})\s*(?:tarikh|tareekh|tarik|तारीख़?|तारखेला|तारखेस|তারিখ|তাৰিখ|તારીખ|ਤਾਰੀਖ|ତାରିଖ|தேதி|తేదీ|ದಿನಾಂಕ|തീയതി|تاریخ)/iu;

function addDays(ds, n) { const [y, m, d] = ds.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.toISOString().slice(0, 10); }
function wdOf(ds) { const [y, m, d] = ds.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); }
function mkDs(y, m, d) { const t = new Date(Date.UTC(y, m, d)); return t.getUTCMonth() === m && t.getUTCDate() === d ? t.toISOString().slice(0, 10) : null; }

/* returns null for an open-ended question, or { kind: "day", ds } / { kind: "range", from, to } */
function parseWhen(q, p) {
  if (!q) return null;
  let s = asciiDigits(q.normalize("NFC")).replace(/[‌‍]/g, "");
  const today = todayStr(0), [ty, tm] = today.split("-").map(Number);
  // explicit dates first
  let m = s.match(/\b(20\d\d)-(\d{1,2})-(\d{1,2})\b/);
  if (m) { const ds = mkDs(+m[1], +m[2] - 1, +m[3]); if (ds) return { kind: "day", ds, tag: "date" }; }
  m = s.match(/(?<![\d/.-])(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?(?![\d/.-])/);
  if (m && +m[2] >= 1 && +m[2] <= 12) {
    let y = m[3] ? (+m[3] < 100 ? 2000 + +m[3] : +m[3]) : ty;
    let ds = mkDs(y, +m[2] - 1, +m[1]);
    if (ds && !m[3] && ds < today) ds = mkDs(y + 1, +m[2] - 1, +m[1]);
    if (ds) return { kind: "day", ds, tag: "date" };
  }
  const lower = s.toLowerCase();
  const dm = lower.match(new RegExp(`(?<![\\d])(\\d{1,2})${DAY_WORD}\\s*(?:of\\s+)?${MONTH_RX}(?![a-z])(?:[\\s,]+(20\\d\\d))?`, "u"))
    || lower.match(new RegExp(`(?<![a-z])${MONTH_RX}\\s+(\\d{1,2})${DAY_WORD}(?![\\d])(?:[\\s,]+(20\\d\\d))?`, "u"));
  if (dm) {
    const numFirst = /^\d/.test(dm[1]);
    const day = +(numFirst ? dm[1] : dm[2]), mi = monthIdx(numFirst ? dm[2] : dm[1]), yr = dm[3] ? +dm[3] : null;
    if (mi >= 0) {
      let ds = mkDs(yr || ty, mi, day);
      if (ds && !yr && ds < today) ds = mkDs(ty + 1, mi, day);
      if (ds) return { kind: "day", ds, tag: "date" };
    }
  }
  m = s.match(TARIKH);
  if (m) { let ds = mkDs(ty, tm - 1, +m[1]); if (ds && ds < today) ds = mkDs(tm === 12 ? ty + 1 : ty, tm % 12, +m[1]); if (ds) return { kind: "day", ds, tag: "date" }; }
  if (WHEN_RE.birthday.test(s) && p && p.date) {
    const [, bm, bd] = p.date.split("-").map(Number);
    let ds = mkDs(ty, bm - 1, bd) || mkDs(ty, bm - 1, bd - 1);
    if (ds < today) ds = mkDs(ty + 1, bm - 1, bd) || mkDs(ty + 1, bm - 1, bd - 1);
    return { kind: "day", ds, tag: "birthday" };
  }
  s = s.replace(WHEN_RE.nowadays, " ");
  if (WHEN_RE.dayafter.test(s)) return { kind: "day", ds: addDays(today, 2), tag: "dayafter" };
  if (WHEN_RE.tomorrow.test(s)) return { kind: "day", ds: addDays(today, 1), tag: "tomorrow" };
  if (WHEN_RE.today.test(s)) return { kind: "day", ds: today, tag: "today" };
  m = s.match(/(?<![A-Za-z])(?:next|agle|coming)\s+(\d{1,2})\s+(?:days|din)(?![A-Za-z])|अगले\s+(\d{1,2})\s+दिन/i);
  if (m) { const n = Math.min(31, Math.max(1, +(m[1] || m[2]))); return { kind: "range", from: addDays(today, 1), to: addDays(today, n), tag: "ndays" }; }
  if (WHEN_RE.nextWeek.test(s)) { const w = wdOf(today), mon = addDays(today, ((8 - w) % 7) || 7); return { kind: "range", from: mon, to: addDays(mon, 6), tag: "nextweek" }; }
  if (WHEN_RE.weekend.test(s)) { const w = wdOf(today); if (w === 0) return { kind: "day", ds: today, tag: "weekend" }; const sat = addDays(today, (6 - w + 7) % 7); return { kind: "range", from: sat, to: addDays(sat, 1), tag: "weekend" }; }
  for (let i = 0; i < 7; i++) if (WEEKDAY_RE[i].test(s)) {
    const w = wdOf(today); let n = (i - w + 7) % 7;
    if (n === 0 && WHEN_RE.next.test(s)) n = 7;
    return { kind: "day", ds: addDays(today, n), tag: "weekday" };
  }
  if (WHEN_RE.thisWeek.test(s)) { const w = wdOf(today), sun = addDays(today, (7 - w) % 7); return { kind: "range", from: today, to: sun === today ? addDays(today, 6) : sun, tag: "thisweek" }; }
  if (WHEN_RE.nextMonth.test(s)) { const y = tm === 12 ? ty + 1 : ty, mo = tm % 12; const last = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate(); return { kind: "range", from: mkDs(y, mo, 1), to: mkDs(y, mo, last), tag: "nextmonth" }; }
  if (WHEN_RE.thisMonth.test(s)) { const last = new Date(Date.UTC(ty, tm, 0)).getUTCDate(); const to = mkDs(ty, tm - 1, last); return { kind: "range", from: today, to: to === today ? addDays(today, 6) : to, tag: "thismonth" }; }
  return null;
}

/* ---------- the reading for one day ---------- */
const HORA_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
const DAY_LORD = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const TOPIC_DAY = { career: "career", education: "career", admission: "career", marriage: "love", money: "money", property: "money", health: "health", children: "health" };
const hhmm = h => { h = ((h % 24) + 24) % 24; const H = Math.floor(h), M = Math.min(59, Math.round((h - H) * 60)); return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`; };
function dayFacts(c, p, ds, topic) {
  const tz = deviceTz(), d = dailyFor(c, ds, tz), st = sunTimes(ds, p.lat, p.lon, tz);
  const Jr = A.jdLocal(ds, hhmm(st.rise), tz), pan = A.panchang(Jr, tz), J = A.jdLocal(ds, "12:00", tz);
  const cur = A.currentDasha(c, J);
  const taraOk = [2, 4, 6, 8, 9].includes(d.taraN) ? 0 : d.taraN === 1 ? 1 : 2;
  const chOk = [1, 3, 6, 7, 10, 11].includes(d.mh) ? 0 : [2, 5, 9].includes(d.mh) ? 1 : 2;
  const t = topic || GENERAL, wt = relWeights(c, t);
  const dayLord = DAY_LORD[pan.weekday];
  let sc = d.s[TOPIC_DAY[t.key] || "overall"];
  sc += [6, 0, -8][taraOk] + [5, 0, -6][chOk];
  sc += (wt[cur.sd.lord] || 0) >= 2 ? 6 : (wt[cur.pd.lord] || 0) >= 2 ? 3 : 0;
  if (wt[dayLord]) sc += 3;
  sc = Math.max(5, Math.min(97, Math.round(sc)));
  const rate = sc >= 75 ? 0 : sc >= 58 ? 1 : sc >= 42 ? 2 : 3;
  const dayLen = st.set - st.rise, seg = [8, 2, 7, 5, 6, 4, 3][pan.weekday];
  const rahu = [st.rise + (seg - 1) * dayLen / 8, st.rise + seg * dayLen / 8];
  const abhijit = pan.weekday === 3 ? null : [st.noon - dayLen / 30, st.noon + dayLen / 30];
  const lord = A.SIGN_LORD[(c.lagna.sign + t.houses[0] - 1) % 12];
  const start = HORA_ORDER.indexOf(dayLord), horas = [];
  for (let i = 0; i < 12; i++) {
    const a = st.rise + i * dayLen / 12, b = a + dayLen / 12;
    if (HORA_ORDER[(start + i) % 7] === lord && !(a < rahu[1] && b > rahu[0])) horas.push([a, b]);
  }
  return { ds, J, d, pan, cur, taraN: d.taraN, taraOk, mh: d.mh, chOk, sc, rate, rahu, abhijit, hora: horas[0] ? { lord, at: horas[0] } : null, moonSign: d.tr.Moon.sign, moonNak: d.tr.Moon.nak.idx, wt, topic: t };
}
function rangeFacts(c, p, from, to, topic) {
  const days = [];
  for (let ds = from; ds <= to && days.length < 31; ds = addDays(ds, 1)) days.push(dayFacts(c, p, ds, topic));
  const best = days.filter(x => x.sc >= 55 && x.taraOk < 2).sort((a, b) => b.sc - a.sc).slice(0, 3).sort((a, b) => a.ds < b.ds ? -1 : 1);
  const care = days.filter(x => x.sc < 45 && !best.includes(x)).sort((a, b) => a.sc - b.sc).slice(0, 2).sort((a, b) => a.ds < b.ds ? -1 : 1);
  const changes = [];
  for (let i = 1; i < days.length; i++) {
    const a = days[i - 1].cur, b = days[i].cur;
    if (a.pd.lord !== b.pd.lord || a.ad.lord !== b.ad.lord || a.sd.lord !== b.sd.lord) changes.push(days[i]);
  }
  return { from, to, days, best: best.length ? best : days.slice().sort((a, b) => b.sc - a.sc).slice(0, 2).sort((a, b) => a.ds < b.ds ? -1 : 1), care, changes: changes.slice(0, 2) };
}
const _ord = (code, n) => code === "en" || code === "hinglish" ? ord(n) : String(n);
function dayLines(code, f, lock, opts = {}) {
  const tm = h => ltime(code, h), L = [];
  L.push(`- ${tf(code, "moon", { sign: lname(code, "sign", f.moonSign), nak: lname(code, "nak", f.moonNak) })}`);
  L.push(`- ${tf(code, "tara", { tara: lname(code, "tara", f.taraN - 1), ok: I18N[code].ok[f.taraOk] })}`);
  L.push(`- ${tf(code, "chandra", { n: f.mh, no: _ord(code, f.mh), ok: I18N[code].ok[f.chOk] })}`);
  const ti = f.pan.tithiNum, tname = ti === 15 ? "Purnima" : ti === 30 ? "Amavasya" : f.pan.tithi;
  L.push(`- ${tf(code, "panchang", { paksha: lname(code, "paksha", f.pan.paksha === "Shukla" ? 0 : 1), tithi: lname(code, "tithi", tname), yoga: lname(code, "yoga", f.pan.yoga), karana: lname(code, "karana", f.pan.karana) })}`);
  L.push(`- ${tf(code, "dashaOn", { chain: lchain(code, [f.cur.md.lord, f.cur.ad.lord, f.cur.pd.lord, f.cur.sd.lord]) })}`);
  if (opts.noTimes) return L;
  if (lock) { L.push(`\n${tf(code, "lockDates")}`); return L; }
  L.push(`\n**${tf(code, "timings")}**`);
  if (f.abhijit) L.push(`- ${tf(code, "best", { t1: tm(f.abhijit[0]), t2: tm(f.abhijit[1]) })}`);
  if (f.hora) L.push(`- ${tf(code, "hora", { pl: lname(code, "planet", f.hora.lord), t1: tm(f.hora.at[0]), t2: tm(f.hora.at[1]) })}`);
  L.push(`- ${tf(code, "rahu", { t1: tm(f.rahu[0]), t2: tm(f.rahu[1]) })}`);
  return L;
}
/* the whole time-scoped answer, in the reader's language */
function scopedAnswer(code, q, c, p, sub, lock, when, yn) {
  const topic = topicOf(q, sub.rel && sub.rel.match) || nativeTopic(q) || GENERAL;
  const T = I18N[code], tl = T.topics[topic.key], out = [];
  if (sub.profile) out.push(`**${tf(code, "chartOf", { name: p.name })}**`);
  if (when.kind === "day") {
    const f = dayFacts(c, p, when.ds, topic);
    out.push(`**${tf(code, "dayHead", { date: ldateLong(code, when.ds) })}**`);
    out.push(`**${tf(code, "rateFor", { topic: tl, rate: T.rate[f.rate], n: f.sc })}**`);
    if (yn) { const v = verdict(c, topic, q, whoWords(p, !sub.profile, sub.rel)); out.push(tf(code, "promise", { v: T.v[VERDICT_LABELS.indexOf(v.label)] || v.label })); }
    out.push(dayLines(code, f, lock).join("\n"));
    if (f.rate <= 1) out.push(tf(code, "goDay"));
    else if (!lock) {
      let better = null;
      for (let i = 1; i <= 10 && !better; i++) { const g = dayFacts(c, p, addDays(when.ds, i), topic); if (g.rate <= 1) better = g; }
      if (better) out.push(tf(code, "waitDay", { date: ldateLong(code, better.ds) }));
    }
  } else {
    const R = rangeFacts(c, p, when.from, when.to, topic), f0 = R.days[0];
    out.push(`**${tf(code, "rangeHead", { d1: ldateStr(code, when.from), d2: ldateStr(code, when.to) })}**`);
    if (yn) { const v = verdict(c, topic, q, whoWords(p, !sub.profile, sub.rel)); out.push(tf(code, "promise", { v: T.v[VERDICT_LABELS.indexOf(v.label)] || v.label })); }
    const dl = [`- ${tf(code, "nowHead")}: ${lchain(code, [f0.cur.md.lord, f0.cur.ad.lord, f0.cur.pd.lord, f0.cur.sd.lord])}`];
    for (const ch of R.changes) dl.push(`- ${tf(code, "dashaChange", { date: ldateStr(code, ch.ds), chain: lchain(code, [ch.cur.md.lord, ch.cur.ad.lord, ch.cur.pd.lord, ch.cur.sd.lord]) })}`);
    out.push(dl.join("\n"));
    if (lock) out.push(tf(code, "lockDates"));
    else {
      const row = f => `- **${ldateWd(code, f.ds)}**: ${T.rate[f.rate]} (${f.sc}/100), ${lname(code, "nak", f.moonNak)}, ${tf(code, "tara", { tara: lname(code, "tara", f.taraN - 1), ok: T.ok[f.taraOk] })}${f.abhijit && f === R.best[0] ? `; ${tf(code, "best", { t1: ltime(code, f.abhijit[0]), t2: ltime(code, f.abhijit[1]) })}` : ""}`;
      out.push(`**${tf(code, "bestDays")}** (${tl})\n${R.best.map(row).join("\n")}`);
      if (R.care.length) out.push(`**${tf(code, "careDays")}**\n${R.care.map(f => `- **${ldateWd(code, f.ds)}**: ${T.rate[f.rate]} (${f.sc}/100); ${tf(code, "rahu", { t1: ltime(code, f.rahu[0]), t2: ltime(code, f.rahu[1]) })}`).join("\n")}`);
    }
  }
  const lord = A.SIGN_LORD[(c.lagna.sign + topic.houses[0] - 1) % 12];
  out.push(`**${tf(code, "planHead")}**\n1. ${T.tips[topic.key] || T.tips.general}\n2. ${tf(code, "remedy", { mantra: lname(code, "mantra", lord), day: lweekday(code, DAY_OF_LORD[lord]) })}`);
  if (p.unknownTime) out.push(tf(code, "unknownTime"));
  return out.join("\n\n");
}
const VERDICT_LABELS = ["Yes, strongly indicated", "Yes, likely", "Possible, with focused effort", "Difficult at present"];

/* ---------- open-ended and yes/no answers in Indian languages and Hinglish ---------- */
function localAnswer(code, q, c, p, sub, lock) {
  const T = I18N[code], self = !sub.profile, W = whoWords(p, self, sub.rel);
  const topic = topicOf(q, sub.rel && sub.rel.match) || nativeTopic(q);
  const J = nowJ(), cur = A.currentDasha(c, J), tr = A.transits(J), out = [];
  const L = LANG[code] || LANG.hi;
  out.push(sub.profile ? `**${tf(code, "chartOf", { name: p.name })}**` : `${L.hello} ${p.name},`);
  const chain4 = lchain(code, [cur.md.lord, cur.ad.lord, cur.pd.lord, cur.sd.lord]);
  const nowL = `**${tf(code, "nowHead")}: ${chain4}**\n${tf(code, "nowLine", { md: lname(code, "planet", cur.md.lord), ad: lname(code, "planet", cur.ad.lord), pd: lname(code, "planet", cur.pd.lord), sd: lname(code, "planet", cur.sd.lord), d1: ldate(code, cur.md.end), d2: ldate(code, cur.ad.end), d3: ldate(code, cur.pd.end), d4: ldate(code, cur.sd.end) })}`;
  const yn = isYesNo(q) || nativeYesNo(q);
  if (!topic && !yn) {
    out.push(nowL);
    out.push(tf(code, "remedy", { mantra: lname(code, "mantra", cur.md.lord), day: lweekday(code, DAY_OF_LORD[cur.md.lord]) }));
    out.push(tf(code, "askMore"));
    return out.join("\n\n");
  }
  const t = topic || GENERAL, H = t.houses[0], lord = A.SIGN_LORD[(c.lagna.sign + H - 1) % 12], lp = c.planets[lord];
  const reasons = [];
  const lv = { h: H, ho: ord(H), h2: lp.house, h2o: ord(lp.house), pl: lname(code, "planet", lord) };
  reasons.push(tf(code, [1, 4, 5, 7, 9, 10].includes(lp.house) ? "lordGood" : [6, 8, 12].includes(lp.house) ? "lordBad" : "lordMid", lv));
  const wt = relWeights(c, t), linked = ["md", "ad", "pd"].some(k => wt[cur[k].lord]);
  reasons.push(tf(code, linked ? "dashaYes" : "dashaNo", { chain: lchain(code, [cur.md.lord, cur.ad.lord, cur.pd.lord]) }));
  const tj = ((tr.Jupiter.sign - c.moonSign + 12) % 12) + 1;
  reasons.push(tf(code, [2, 5, 7, 9, 11].includes(tj) ? "jupGood" : "jupWeak", { n: tj, no: ord(tj) }));
  if (yn) {
    const v = verdict(c, t, q, W), vi = VERDICT_LABELS.indexOf(v.label);
    out.push(`**${T.ans}: ${T.v[vi] || v.label}** (${tf(code, "fav", { n: v.score })})`);
    out.push(`**${T.why}**\n${reasons.map(r => "- " + r).join("\n")}`);
    if (!lock) out.push(`**${T.planHead}**\n1. ${T.tips[t.key] || T.tips.general}\n2. ${tf(code, "dayStep", { day: lweekday(code, DAY_OF_LORD[v.lord]), pl: lname(code, "planet", v.lord) })}\n3. ${tf(code, "remedy", { mantra: lname(code, "mantra", v.lord), day: lweekday(code, DAY_OF_LORD[v.lord]) })}`);
    return out.join("\n\n");
  }
  const wins = windows(c, t);
  out.push(`**${T.why}**\n${reasons.map(r => "- " + r).join("\n")}`);
  if (lock) out.push(`**${tf(code, "winHead", { topic: T.topics[t.key] })}**\n${tf(code, "lockDates")}`);
  else if (wins.length) out.push(`**${tf(code, "winHead", { topic: T.topics[t.key] })}**\n${wins.map(w => `- **${ldate(code, w.start)} – ${ldate(code, w.end)}**: ${lchain(code, [w.md, w.ad, w.pd])}${w.peak ? ` (${lname(code, "planet", w.peak.lord)}: ${ldate(code, Math.max(w.peak.start, J))} – ${ldate(code, w.peak.end)})` : ""}`).join("\n")}`);
  else out.push(tf(code, "noWin"));
  out.push(nowL);
  out.push(`**${T.planHead}**\n1. ${T.tips[t.key] || T.tips.general}\n2. ${tf(code, "dayStep", { day: lweekday(code, DAY_OF_LORD[lord]), pl: lname(code, "planet", lord) })}\n3. ${tf(code, "remedy", { mantra: lname(code, "mantra", lord), day: lweekday(code, DAY_OF_LORD[lord]) })}`);
  if (p.unknownTime) out.push(tf(code, "unknownTime"));
  return out.join("\n\n");
}

/* the offline answer in the language of the question */
function composeOffline(q, c, p, sub, lock, langCode) {
  const code = tmplCode(langCode), when = parseWhen(q, p);
  const yn = isYesNo(q) || nativeYesNo(q);
  const greet = code !== langCode && LANG[langCode] ? `${LANG[langCode].hello}!\n\n` : "";
  if (when) return greet + scopedAnswer(code, q, c, p, sub, lock, when, yn);
  if (code === "en") return greet + offlineAnswer(q, c, p, sub, lock);
  return greet + localAnswer(code, q, c, p, sub, lock);
}

/* facts for the AI prompt when the question names a day or a period */
function timeScopePrompt(q, c, p, sub) {
  const when = parseWhen(q, p);
  if (!when) return "";
  const topic = topicOf(q, sub.rel && sub.rel.match) || nativeTopic(q) || GENERAL;
  const fl = f => `${f.ds} (${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][f.pan.weekday]}): Moon in ${A.SIGNS[f.moonSign]}, ${A.NAK[f.moonNak]} nakshatra; tara bala ${TARA[f.taraN][0]} (${["favourable", "mixed", "weak"][f.taraOk]}); chandra bala: Moon ${ord(f.mh)} from natal Moon (${["favourable", "mixed", "weak"][f.chOk]}); panchang at sunrise: ${f.pan.paksha} ${f.pan.tithiNum === 15 ? "Purnima" : f.pan.tithiNum === 30 ? "Amavasya" : f.pan.tithi}, ${f.pan.yoga} yoga, ${f.pan.karana} karana; dasha that day ${f.cur.md.lord}-${f.cur.ad.lord}-${f.cur.pd.lord}-${f.cur.sd.lord}; day score for ${topic.label} ${f.sc}/100; Abhijit ${f.abhijit ? `${fmtH(f.abhijit[0])}-${fmtH(f.abhijit[1])}` : "not used on Wednesday"}; ${f.hora ? `${f.hora.lord} hora ${fmtH(f.hora.at[0])}-${fmtH(f.hora.at[1])}; ` : ""}Rahu Kaal ${fmtH(f.rahu[0])}-${fmtH(f.rahu[1])}`;
  let body;
  if (when.kind === "day") body = fl(dayFacts(c, p, when.ds, topic));
  else { const R = rangeFacts(c, p, when.from, when.to, topic); body = R.days.map(fl).join("\n"); }
  return `\n\nTIME SCOPE: The question asks about ${when.kind === "day" ? `one day, ${when.ds}` : `the period ${when.from} to ${when.to}`}. Answer ONLY for that ${when.kind === "day" ? "day" : "period"}: use the transits, tara bala, chandra bala, panchang and the dasha running on ${when.kind === "day" ? "that date" : "those dates"}, name the best and the weakest ${when.kind === "day" ? "hours" : "days"}, and give practical timings (Abhijit, the hora, Rahu Kaal). Do NOT give long-range dasha windows, years or months outside this period.\nDAY DATA:\n${body}`;
}
