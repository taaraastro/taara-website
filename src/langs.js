/* ===== Language agents: one Taara astrologer per Indian language ===== */
/* code, English name, native name, script, greeting, chart style, group, local astrology terms (optional) */
const LANGS = [
  // 22 languages of the Eighth Schedule
  ["as", "Assamese", "অসমীয়া", "Bengali-Assamese (with ৰ and ৱ)", "নমস্কাৰ", "north", "s", "Rashi, Nakshatra, Lagna, Dasha"],
  ["bn", "Bengali", "বাংলা", "Bengali", "নমস্কার", "north", "s", "Rashi, Nakshatra, Lagna, Mahadasha and Antardasha; Bengali calendar months are welcome"],
  ["doi", "Dogri", "डोगरी", "Devanagari", "नमस्कार", "north", "s"],
  ["gu", "Gujarati", "ગુજરાતી", "Gujarati", "નમસ્તે", "north", "s", "Rashi, Nakshatra, Lagna, Mahadasha"],
  ["hi", "Hindi", "हिन्दी", "Devanagari", "नमस्ते", "north", "s", "राशि, नक्षत्र, लग्न, महादशा, अंतर्दशा, प्रत्यंतर दशा, सूक्ष्म दशा"],
  ["kn", "Kannada", "ಕನ್ನಡ", "Kannada", "ನಮಸ್ಕಾರ", "south", "s", "Rashi, Nakshatra, Lagna, Dashe and Bhukti"],
  ["ks", "Kashmiri", "کٲشُر", "Perso-Arabic (Kashmiri)", "آداب", "north", "s"],
  ["kok", "Konkani", "कोंकणी", "Devanagari", "नमस्कार", "north", "s"],
  ["mai", "Maithili", "मैथिली", "Devanagari", "प्रणाम", "north", "s"],
  ["ml", "Malayalam", "മലയാളം", "Malayalam", "നമസ്കാരം", "south", "s", "Rasi, Nakshatram (Naal), Lagnam, Dasa and Apahara"],
  ["mni", "Manipuri (Meitei)", "ꯃꯤꯇꯩꯂꯣꯟ", "Meetei Mayek (Bengali script is also acceptable if the user uses it)", "ꯈꯨꯔꯨꯝꯖꯔꯤ", "north", "s"],
  ["mr", "Marathi", "मराठी", "Devanagari", "नमस्कार", "north", "s", "रास, नक्षत्र, लग्न, महादशा, अंतर्दशा"],
  ["ne", "Nepali", "नेपाली", "Devanagari", "नमस्ते", "north", "s"],
  ["or", "Odia", "ଓଡ଼ିଆ", "Odia", "ନମସ୍କାର", "north", "s"],
  ["pa", "Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi", "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", "north", "s"],
  ["sa", "Sanskrit", "संस्कृतम्", "Devanagari", "नमो नमः", "north", "s", "राशिः, नक्षत्रम्, लग्नम्, दशा"],
  ["sd", "Sindhi", "سنڌي", "Perso-Arabic (Sindhi); Devanagari if the user writes in it", "سلام", "north", "s"],
  ["ta", "Tamil", "தமிழ்", "Tamil", "வணக்கம்", "south", "s", "Rasi, Natchathiram, Lagnam, Dasai and Bukthi"],
  ["te", "Telugu", "తెలుగు", "Telugu", "నమస్కారం", "south", "s", "Rasi, Nakshatram, Lagnam, Dasa and Antardasa"],
  ["ur", "Urdu", "اردو", "Urdu (Nastaliq)", "آداب", "north", "s"],
  // other widely spoken Indian languages
  ["awa", "Awadhi", "अवधी", "Devanagari", "राम राम", "north", "o"],
  ["bho", "Bhojpuri", "भोजपुरी", "Devanagari", "प्रणाम", "north", "o"],
  ["bgc", "Haryanvi", "हरियाणवी", "Devanagari", "राम राम", "north", "o"],
  ["bhb", "Bhili", "भीली", "Devanagari", "राम राम", "north", "o"],
  ["bns", "Bundeli", "बुंदेली", "Devanagari", "राम राम", "north", "o"],
  ["hne", "Chhattisgarhi", "छत्तीसगढ़ी", "Devanagari", "जय जोहार", "north", "o"],
  ["gbm", "Garhwali", "गढ़वळि", "Devanagari", "सेवा लगाणु छौं", "north", "o"],
  ["gon", "Gondi", "गोंडी", "Devanagari", "सेवा जोहार", "north", "o"],
  ["kfy", "Kumaoni", "कुमाऊँनी", "Devanagari", "पैलाग", "north", "o"],
  ["mag", "Magahi", "मगही", "Devanagari", "प्रणाम", "north", "o"],
  ["raj", "Rajasthani (Marwari)", "राजस्थानी", "Devanagari", "खम्मा घणी", "north", "o"],
  ["tcy", "Tulu", "ತುಳು", "Kannada", "ನಮಸ್ಕಾರ", "south", "o"],
  ["kfa", "Kodava", "ಕೊಡವ", "Kannada", "ನಮಸ್ಕಾರ", "south", "o"],
  ["kha", "Khasi", "Khasi", "Latin", "Khublei", "north", "o"],
  ["lus", "Mizo", "Mizo ṭawng", "Latin", "Chibai", "north", "o"],
  // English options
  ["en", "English", "English", "Latin", "Namaste", "north", "e"],
  ["hinglish", "Hinglish", "Hinglish", "Latin (Hindi and English mixed, the way people text)", "Namaste", "north", "e"],
].map(([code, name, native, script, hello, chart, group, terms]) => ({ code, name, native, script, hello, chart, group, terms }));
const LANG = Object.fromEntries(LANGS.map(l => [l.code, l]));
const DEVANAGARI_LANGS = new Set(LANGS.filter(l => l.script.startsWith("Devanagari")).map(l => l.code));

/* detect the language from the script the user typed in; fall back to the chosen agent */
function detectLang(text, chosen) {
  const has = re => re.test(text);
  if (has(/[ꯀ-꯿]/)) return "mni";
  if (has(/[஀-௿]/)) return "ta";
  if (has(/[ఀ-౿]/)) return "te";
  if (has(/[ಀ-೿]/)) return ["kn", "tcy", "kfa"].includes(chosen) ? chosen : "kn";
  if (has(/[ഀ-ൿ]/)) return "ml";
  if (has(/[଀-୿]/)) return "or";
  if (has(/[઀-૿]/)) return "gu";
  if (has(/[਀-੿]/)) return "pa";
  if (has(/[ৰৱ]/)) return "as";
  if (has(/[ঀ-৿]/)) return chosen === "mni" ? "mni" : chosen === "as" ? "as" : "bn";
  if (has(/[؀-ۿ]/)) return ["ur", "ks", "sd"].includes(chosen) ? chosen : "ur";
  if (has(/[ऀ-ॿ]/)) return DEVANAGARI_LANGS.has(chosen) ? chosen : "hi";
  return chosen || "en";
}
function agentLine(l, auto) {
  const tail = auto ? " If the user's message is in a different language than this (for example Marathi, Nepali or Maithili also use Devanagari), reply in the language the user actually wrote in." : "";
  return agentBase(l) + tail;
}
function agentBase(l) {
  if (l.code === "en") return "Reply in clear, warm English.";
  if (l.code === "hinglish") return "Reply in Hinglish: Hindi and English mixed in Latin script, the way Indians text each other.";
  return `You are Taara's ${l.name} astrologer. Reply ENTIRELY in ${l.name} (${l.native}) written in ${l.script} script, the way a respected family astrologer from that community would speak: warm, respectful and natural, not a literal translation. ${l.terms ? `Use local astrology terms such as ${l.terms}. ` : "Use the astrology words people of this community actually use. "}Keep dates readable (day, month name, year). If a technical term has no common ${l.name} word, use the Sanskrit term in ${l.script} script.`;
}
