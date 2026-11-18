/* ===== Birth places: data, loading and search =====
   India: state -> district -> city / town / village. The state -> district index is inlined; each state's places file
   (places/in/<CODE>.json) is fetched when the state is chosen and kept (the service worker caches it for offline use).
   Outside India: country -> state / province -> city (places/<ISO2>.json; big countries are split per state).
   Sources: All India Pincode Directory and LGD (data.gov.in, GODL-India), Countries States Cities Database (ODbL),
   GeoNames (CC BY 4.0). See places/LICENSE.txt. */
const WORLD_COUNTRIES = /*WORLD_COUNTRIES*/[];          // [[iso2, name, default IANA zone, [other names]], ...]
const INDIA_INDEX = /*INDIA_INDEX*/[];                  // [[state, file code, [districts]], ...]
const PLACE_BASE = (typeof window !== "undefined" && window.TAARA_CONFIG && window.TAARA_CONFIG.placesBase) || "places/";
const IN_STATES = INDIA_INDEX.map(x => x[0]);
const IN_BY_STATE = Object.fromEntries(INDIA_INDEX.map(x => [x[0], x]));
const CC_OF = Object.fromEntries(WORLD_COUNTRIES.map(w => [w[1], w[0]]));
const COUNTRY_OF = Object.fromEntries(WORLD_COUNTRIES.map(w => [w[0], w]));
const COUNTRIES = ["India", ...WORLD_COUNTRIES.map(w => w[1])];
const INDIA_ZONE = "Asia/Kolkata";

/* ---------- text matching ---------- */
const SPECIAL = { "ł": "l", "ø": "o", "đ": "d", "ß": "ss", "æ": "ae", "ı": "i", "ð": "d", "þ": "th", "œ": "oe", "’": "'", "‘": "'", "`": "'" };
/* accents are folded (São -> Sao, Zürich -> Zurich, Łódź -> Lodz), never deleted */
const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[łøđßæıðþœ’‘`]/gi, c => { const l = SPECIAL[c.toLowerCase()]; return c === c.toLowerCase() ? l : l.toUpperCase(); });
const norm = s => fold(s).toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, "");
const wordsOf = s => fold(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
/* phonetic key for Indian spellings: th/t, dh/d, bh/b, sh/s, ph/f, w/v, z/j, ee/i, oo/u, doubled letters */
function phon(s) {
  let k = norm(s);
  k = k.replace(/chh/g, "c").replace(/ch/g, "c").replace(/sh/g, "s").replace(/ph/g, "f").replace(/([bdtkgj])h/g, "$1").replace(/w/g, "v").replace(/z/g, "j").replace(/q/g, "k").replace(/x/g, "ks").replace(/ck/g, "k");
  k = k.replace(/aa/g, "a").replace(/e{2}|i{2}|y$/g, "i").replace(/o{2}|u{2}|ou/g, "u").replace(/(.)\1+/g, "$1");
  return k.length > 4 ? k.replace(/a$/, "") : k;
}
const skel = s => { const p = phon(s); return p.slice(0, 1) + p.slice(1).replace(/[aeiouy]/g, ""); };
/* Devanagari -> Latin (simple Hindi transliteration with schwa deletion), so मुंबई / दिल्ली / वाराणसी can be searched */
const DV_C = { "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n", "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n", "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n", "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "ळ": "l", "व": "v", "श": "sh", "ष": "sh", "स": "s", "ह": "h", "क़": "k", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y" };
const DV_V = { "अ": "a", "आ": "aa", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u", "ऋ": "ri", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au", "ऑ": "o" };
const DV_M = { "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ॉ": "o", "ॅ": "e" };
const hasDeva = s => /[ऀ-ॿ]/.test(s || "");
function devaToLatin(s) {
  const t = String(s || "").normalize("NFC").replace(/([कखगजडढफय])़/g, (m, c) => ({ "क": "क़", "ख": "ख़", "ग": "ग़", "ज": "ज़", "ड": "ड़", "ढ": "ढ़", "फ": "फ़", "य": "य़" }[c]));
  return t.split(/\s+/).map(w => {
    const u = []; // units: {c: consonant latin, v: vowel or null (null = inherent a), hal: bool}
    for (const ch of w) {
      if (DV_C[ch] !== undefined) u.push({ c: DV_C[ch], v: null, hal: false });
      else if (DV_M[ch] !== undefined && u.length && u[u.length - 1].c !== undefined && u[u.length - 1].v === null) u[u.length - 1].v = DV_M[ch];
      else if (ch === "्" && u.length) u[u.length - 1].hal = true;
      else if (ch === "ं" || ch === "ँ") u.push({ nas: true });
      else if (ch === "ः") u.push({ c: "h", v: "", hal: true });
      else if (DV_V[ch] !== undefined) u.push({ iv: DV_V[ch] });
      else if (/[a-z0-9]/i.test(ch)) u.push({ raw: ch });
    }
    const isC = x => x && x.c !== undefined;
    let out = "";
    u.forEach((x, i) => {
      if (x.raw) { out += x.raw; return; }
      if (x.iv) { out += x.iv; return; }
      if (x.nas) { const n = u[i + 1]; out += n && isC(n) && /^[pbm]/.test(n.c) ? "m" : "n"; return; }
      out += x.c;
      if (x.hal) return;
      if (x.v !== null) { out += x.v; return; }
      // inherent a: dropped at the end of a word and in the middle when followed by consonant + vowel (schwa deletion)
      const n = u[i + 1], p = u[i - 1];
      if (!n) return;
      if (isC(n) && !n.hal && (n.v !== null || u[i + 2]) && p && (!isC(p) || !p.hal)) return;
      out += "a";
    });
    return out;
  }).join(" ");
}
function damLev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = []; for (let i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = 99;
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      if (d[i][j] < best) best = d[i][j];
    }
    if (best > max) return max + 1;
  }
  return d[a.length][b.length];
}
/* search keys for one name and its other names */
function keysOf(name, alts) {
  const all = [name].concat(alts || []).filter(Boolean);
  const lat = all.filter(x => !hasDeva(x)), dev = all.filter(hasDeva).map(x => x.normalize("NFC").replace(/\s+/g, ""));
  return { k: lat.map(norm), w: lat.map(x => wordsOf(x)), p: lat.map(phon), s: lat.map(skel), d: dev };
}
/* score how well query q matches item keys (0 = no match). Higher is better. */
function prepQuery(q) {
  q = String(q || "").trim();
  const dv = hasDeva(q) ? q.normalize("NFC").replace(/\s+/g, "") : "";
  const lat = hasDeva(q) ? devaToLatin(q) : q;
  const n = norm(lat);
  return { raw: q, dv, n, w: wordsOf(lat), p: phon(lat), s: skel(lat) };
}
function matchScore(K, Q) {
  if (!Q.n && !Q.dv) return 1;
  let s = 0;
  if (Q.dv) for (const d of K.d) { if (d === Q.dv) s = Math.max(s, 120); else if (d.startsWith(Q.dv)) s = Math.max(s, 105); }
  if (!Q.n) return s;
  for (let i = 0; i < K.k.length; i++) {
    const k = K.k[i], alt = i > 0 ? 5 : 0;
    if (k === Q.n) s = Math.max(s, 100 - alt);
    else if (k.startsWith(Q.n)) s = Math.max(s, 85 - alt);
    else if (Q.w.length > 1 ? Q.w.every(qw => K.w[i].some(w => w.startsWith(qw))) : K.w[i].some(w => w.startsWith(Q.n))) s = Math.max(s, 72 - alt);
    else if (Q.n.length >= 3 && k.includes(Q.n)) s = Math.max(s, 60 - alt);
    if (s >= 60) continue;
    const p = K.p[i];
    if (Q.p.length >= 3 && (p === Q.p || p.startsWith(Q.p))) s = Math.max(s, p === Q.p ? 58 : 52);
    else if (Q.n.length >= 4 && Q.s.length >= 3 && (K.s[i] === Q.s || (Q.s.length >= 4 && K.s[i].startsWith(Q.s)))) s = Math.max(s, K.s[i] === Q.s ? 48 : 42);
  }
  return s;
}
function fuzzyScore(K, Q) {
  if (!Q.n || Q.n.length < 4) return 0;
  const max = Q.n.length >= 8 ? 2 : 1;
  let best = 0;
  for (let i = 0; i < K.k.length; i++) {
    const k = K.k[i];
    if (Math.abs(k.length - Q.n.length) <= max && damLev(Q.n, k, max) <= max) best = Math.max(best, 35);
    else if (k.length > Q.n.length && damLev(Q.n, k.slice(0, Q.n.length), 1) <= 1 && Q.n.length >= 5) best = Math.max(best, 30);
  }
  return best;
}
/* rank items (each with .K keys and .rank) for query q; returns up to limit items, best first */
function rankItems(items, q, limit = 60, extraSort) {
  const Q = typeof q === "string" ? prepQuery(q) : q;
  if (!Q.n && !Q.dv) return { list: items.slice(0, limit), total: items.length };
  let hits = [];
  for (const it of items) { const sc = matchScore(it.K, Q); if (sc) hits.push([sc, it]); }
  if (hits.length < 8) for (const it of items) { if (hits.some(h => h[1] === it)) continue; const sc = fuzzyScore(it.K, Q); if (sc) hits.push([sc, it]); }
  hits.sort((a, b) => b[0] - a[0] || (a[1].rank || 0) - (b[1].rank || 0) || (extraSort ? extraSort(a[1], b[1]) : 0) || a[1].label.length - b[1].label.length || (a[1].label < b[1].label ? -1 : 1));
  return { list: hits.slice(0, limit).map(h => h[1]), total: hits.length, best: hits.length ? hits[0][0] : 0 };
}

/* ---------- India ---------- */
const IN_STATE_ALIAS = { "up": "Uttar Pradesh", "mp": "Madhya Pradesh", "hp": "Himachal Pradesh", "ap": "Andhra Pradesh", "tn": "Tamil Nadu", "wb": "West Bengal", "bengal": "West Bengal",
  "jk": "Jammu and Kashmir", "jandk": "Jammu and Kashmir", "kashmir": "Jammu and Kashmir", "jammu": "Jammu and Kashmir", "orissa": "Odisha", "pondicherry": "Puducherry", "pondy": "Puducherry",
  "uttaranchal": "Uttarakhand", "ncr": "Delhi", "nctofdelhi": "Delhi", "newdelhi": "Delhi", "andamanandnicobar": "Andaman and Nicobar Islands", "andaman": "Andaman and Nicobar Islands",
  "dadranagarhavelidamananddiu": "Dadra and Nagar Haveli and Daman and Diu", "dadraandnagarhaveli": "Dadra and Nagar Haveli and Daman and Diu", "damananddiu": "Dadra and Nagar Haveli and Daman and Diu",
  "daman": "Dadra and Nagar Haveli and Daman and Diu", "diu": "Dadra and Nagar Haveli and Daman and Diu", "silvassa": "Dadra and Nagar Haveli and Daman and Diu",
  "mh": "Maharashtra", "ka": "Karnataka", "kl": "Kerala", "gj": "Gujarat", "rj": "Rajasthan", "pb": "Punjab", "hr": "Haryana", "br": "Bihar", "jh": "Jharkhand", "cg": "Chhattisgarh", "uk": "Uttarakhand",
  "ts": "Telangana", "tg": "Telangana", "od": "Odisha", "as": "Assam", "ga": "Goa", "dl": "Delhi", "mumbai": "Maharashtra", "bombay": "Maharashtra", "kolkata": "West Bengal", "chennai": "Tamil Nadu",
  "bengaluru": "Karnataka", "bangalore": "Karnataka", "hyderabad": "Telangana" };
const IN_STATE_HI = { "Andaman and Nicobar Islands": "अंडमान और निकोबार", "Andhra Pradesh": "आंध्र प्रदेश", "Arunachal Pradesh": "अरुणाचल प्रदेश", "Assam": "असम", "Bihar": "बिहार", "Chandigarh": "चंडीगढ़", "Chhattisgarh": "छत्तीसगढ़",
  "Dadra and Nagar Haveli and Daman and Diu": "दादरा और नगर हवेली और दमन और दीव", "Delhi": "दिल्ली", "Goa": "गोवा", "Gujarat": "गुजरात", "Haryana": "हरियाणा", "Himachal Pradesh": "हिमाचल प्रदेश", "Jammu and Kashmir": "जम्मू और कश्मीर",
  "Jharkhand": "झारखंड", "Karnataka": "कर्नाटक", "Kerala": "केरल", "Ladakh": "लद्दाख", "Lakshadweep": "लक्षद्वीप", "Madhya Pradesh": "मध्य प्रदेश", "Maharashtra": "महाराष्ट्र", "Manipur": "मणिपुर", "Meghalaya": "मेघालय",
  "Mizoram": "मिज़ोरम", "Nagaland": "नागालैंड", "Odisha": "ओडिशा", "Puducherry": "पुडुचेरी", "Punjab": "पंजाब", "Rajasthan": "राजस्थान", "Sikkim": "सिक्किम", "Tamil Nadu": "तमिलनाडु", "Telangana": "तेलंगाना", "Tripura": "त्रिपुरा",
  "Uttar Pradesh": "उत्तर प्रदेश", "Uttarakhand": "उत्तराखंड", "West Bengal": "पश्चिम बंगाल" };
/* old saved profiles used these state names */
function canonInState(s) {
  if (!s) return "";
  if (IN_BY_STATE[s]) return s;
  const k = norm(s);
  const hit = IN_STATES.find(x => norm(x) === k);
  return hit || IN_STATE_ALIAS[k] || "";
}
const IN_DATA = {}, IN_LOADING = {};
function decodeIndia(raw) {
  const names = raw.n.split("|"), rows = [];
  let i = 0, la = 0, lo = 0, pin = 0;
  for (const [di, cnt] of raw.di) for (let j = 0; j < cnt; j++, i++) {
    la += raw.la[i]; lo += raw.lo[i]; pin += raw.pin[i];
    const f = +raw.f[i], x = raw.x[i] || {};
    rows.push({ i, n: names[i], di, lat: la / 1000, lon: lo / 1000, pin, approx: !!(f & 1), rank: f >> 1, hi: x.h || "", alts: x.a || [] });
  }
  const dl = raw.d.map((d, k) => ({ i: k, n: d, alts: raw.da[k] || [], rows: [] }));
  rows.forEach(r => dl[r.di].rows.push(r));
  return { state: raw.s, districts: dl, rows };
}
function loadIndiaState(st) {
  st = canonInState(st);
  if (!st) return Promise.resolve(null);
  if (IN_DATA[st]) return Promise.resolve(IN_DATA[st]);
  if (typeof fetch === "undefined") return Promise.resolve(null);
  const code = IN_BY_STATE[st][1];
  return IN_LOADING[st] || (IN_LOADING[st] = fetch(PLACE_BASE + "in/" + code + ".json").then(r => r.ok ? r.json() : null).then(d => { if (!d) throw 0; return (IN_DATA[st] = decodeIndia(d)); }).catch(() => { delete IN_LOADING[st]; return null; }));
}
/* lazily build search keys for rows / districts */
function withKeys(x, label, alts) { if (!x.K) { x.K = keysOf(label, alts); x.label = label; } return x; }
const rowAlts = r => r.alts.concat(r.hi ? [r.hi] : [], r.pin ? [String(r.pin)] : []);   // other names, Hindi name and PIN code are searchable
function searchStates(q) {
  const items = IN_STATES.map(s => withKeys({ value: s, rank: 0 }, s, [IN_STATE_HI[s]].concat(Object.keys(IN_STATE_ALIAS).filter(k => IN_STATE_ALIAS[k] === s && k.length > 2))));
  const Q = prepQuery(q), al = IN_STATE_ALIAS[Q.n];
  const r = rankItems(items, Q, 40);
  if (al && r.list[0] && r.list[0].value !== al) r.list.unshift(items.find(x => x.value === al)), r.list = [...new Set(r.list)];
  return r;
}
/* districts of a state; when the state's places are loaded, places whose name matches are offered too ("Abohar, in Fazilka district") */
function searchDistricts(st, q, data) {
  const ix = IN_BY_STATE[st]; if (!ix) return { list: [], total: 0 };
  const ds = ix[2].map((d, k) => withKeys({ value: k, kind: "district", rank: 0 }, d, data ? data.districts[k].alts : []));
  const Q = prepQuery(cleanPlaceQuery(q, st));
  const r = rankItems(ds, Q, 80);
  const ownPrefix = r.list.length && Q.n.length >= 3 && norm(ix[2][r.list[0].value]).startsWith(norm(q || ""));   // a district's own name typed in full or as a prefix needs no place shortcuts
  if (data && (Q.n.length >= 3 || Q.dv) && (!r.best || r.best < 100) && !ownPrefix) {
    const rows = data.rows.map(x => withKeys(x, x.n, rowAlts(x)));
    let t = rankItems(rows, Q, 12), QU = Q;
    const raw = prepQuery(String(q || "").split(",")[0]);   // "Bihar Sharif": the state's name can be part of the place name
    if (raw.n !== Q.n && raw.n.length >= 3) { const t0 = rankItems(rows, raw, 12); if ((t0.best || 0) >= 72 && (t0.best || 0) >= (t.best || 0)) { t = t0; QU = raw; } }
    const extra = t.list.filter(x => matchScore(x.K, QU) >= 42 || t.list.length <= 3).map(x => ({ value: x.di, kind: "place", row: x, label: x.n, rank: 1 }));
    r.list = r.list.concat(extra); r.total += extra.length;
  }
  return r;
}
function searchIndiaPlaces(data, di, q) {
  const pool = di == null ? data.rows : data.districts[di].rows;
  pool.forEach(x => withKeys(x, x.n, rowAlts(x)));
  const r = rankItems(pool, cleanPlaceQuery(q, data.state), 80, (a, b) => a.i - b.i), raw = String(q || "").split(",")[0];
  if (norm(raw) !== norm(cleanPlaceQuery(q, data.state))) { const r0 = rankItems(pool, raw, 80, (a, b) => a.i - b.i); if ((r0.best || 0) >= 72 && (r0.best || 0) >= (r.best || 0)) return r0; }
  return r;
}
/* drop a trailing ", State, India" or "State" the user may type */
function cleanPlaceQuery(q, st) {
  let s = String(q || "").split(",")[0].trim();
  const w = wordsOf(s), sw = wordsOf(st || "");
  if (sw.length && w.length > sw.length && sw.every((x, i) => w[w.length - sw.length + i] === x)) s = w.slice(0, w.length - sw.length).join(" ");
  if (/\bindia$/i.test(s) && wordsOf(s).length > 1) s = s.replace(/\s*india$/i, "");
  const w2 = wordsOf(s);   // a leading state name or its old name ("Orissa Cuttack")
  for (let n = Math.min(3, w2.length - 1); n >= 1; n--) { const head = w2.slice(0, n).join(""); if (st && (norm(st) === head || IN_STATE_ALIAS[head] === st)) { s = w2.slice(n).join(" "); break; } }
  return s;
}
function nearestRow(rows, lat, lon) {
  let best = null, bd = Infinity;
  for (const r of rows) { const d = kmBetween(lat, lon, r.lat, r.lon); if (d < bd) { bd = d; best = r; } }
  return best ? { row: best, km: bd } : null;
}
function kmBetween(a, b, c, d) { const p = Math.PI / 180, x = (d - b) * p * Math.cos((a + c) / 2 * p), y = (c - a) * p; return 6371 * Math.hypot(x, y); }
function districtCentre(d) {
  const la = d.rows.map(r => r.lat).sort((a, b) => a - b), lo = d.rows.map(r => r.lon).sort((a, b) => a - b), m = a => a.length ? a[a.length >> 1] : NaN;
  return { lat: m(la), lon: m(lo) };
}

/* ---------- outside India ---------- */
const W_DATA = {}, W_LOADING = {}, W_PART = {};
function decodeCities(arr, x, zones) { return arr.map((c, i) => ({ n: c[0], si: c[1], lat: c[2], lon: c[3], iana: zones[c[4]] || "", alts: (x && x[i]) || [], rank: 0, i })); }
function loadCountry(cc) {
  if (W_DATA[cc]) return Promise.resolve(W_DATA[cc]);
  if (!COUNTRY_OF[cc] || typeof fetch === "undefined") return Promise.resolve(null);
  return W_LOADING[cc] || (W_LOADING[cc] = fetch(PLACE_BASE + cc + ".json").then(r => r.ok ? r.json() : null).then(d => {
    if (!d) throw 0;
    const data = { cc, name: d.n, states: d.s, zones: d.z, split: !!d.split, cnt: d.cnt || null, cities: d.split ? null : decodeCities(d.c, d.x, d.z), parts: {} };
    if (!data.split) { data.states.forEach((s, i) => data.parts[i] = []); data.cities.forEach(c => { (data.parts[c.si] || (data.parts[c.si] = [])).push(c); }); data.noState = data.cities.filter(c => c.si < 0); }
    return (W_DATA[cc] = data);
  }).catch(() => { delete W_LOADING[cc]; return null; }));
}
/* cities of one state (fetches the state file for big countries) */
function loadWorldState(cc, si) {
  return loadCountry(cc).then(d => {
    if (!d) return null;
    if (!d.split || d.parts[si]) return d.parts[si] || [];
    const k = cc + "/" + si;
    if (d.cnt && !d.cnt[si]) { d.parts[si] = []; return []; }
    return W_PART[k] || (W_PART[k] = fetch(PLACE_BASE + cc + "/" + si + ".json").then(r => r.ok ? r.json() : null).then(p => { if (!p) throw 0; d.parts[si] = decodeCities(p.c, p.x, d.zones); return d.parts[si]; }).catch(() => { delete W_PART[k]; return null; }));
  });
}
function searchCountries(q) {
  const items = WORLD_COUNTRIES.map(w => withKeys({ value: w[0], rank: 0 }, w[1], w[3]));
  return rankItems(items, q, 260);
}
let BIG = null, BIG_LOADING = null;
function loadBig() {
  if (BIG) return Promise.resolve(BIG);
  if (typeof fetch === "undefined") return Promise.resolve(null);
  return BIG_LOADING || (BIG_LOADING = fetch(PLACE_BASE + "_big.json").then(r => r.ok ? r.json() : null).then(d => (BIG = d ? d.map((b, i) => ({ n: b[0], st: b[1], country: b[2], cc: b[3], alts: b[4] || [], i })) : null)).catch(() => { BIG_LOADING = null; return null; }));
}
function searchWorldStates(d, q) {
  const items = d.states.map((s, i) => withKeys({ value: i, kind: "state", rank: 0, count: d.cnt ? d.cnt[i] : (d.parts[i] || []).length }, s, []));
  const Q = prepQuery(q), r = rankItems(items, Q, 120);
  if (!d.split && Q.n.length >= 3 && (!r.best || r.best < 100)) {
    const t = rankItems(d.cities.filter(c => c.si >= 0).map(c => withKeys(c, c.n, c.alts)), Q, 10);
    const extra = t.list.filter(c => matchScore(c.K, Q) >= 42).map(c => ({ value: c.si, kind: "place", row: c, label: c.n, rank: 1 }));
    r.list = r.list.concat(extra); r.total += extra.length;
  }
  return r;
}
function searchWorldCities(list, q) { list.forEach(c => withKeys(c, c.n, c.alts)); return rankItems(list, q.split(",")[0], 80, (a, b) => a.i - b.i); }

/* ---------- time zones ---------- */
/* UTC offset in hours for an IANA zone at a local date and time (handles DST and historical changes, e.g. India's +6:30 war time) */
function tzOffset(zone, date, time) {
  try {
    const [y, m, d] = String(date || new Date().toISOString().slice(0, 10)).split("-").map(Number), [hh, mm] = String(time || "12:00").split(":").map(Number);
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric" });
    const offAt = ms => { const o = {}; fmt.formatToParts(new Date(ms)).forEach(x => o[x.type] = +x.value); const dt = new Date(0); dt.setUTCFullYear(o.year, o.month - 1, o.day); dt.setUTCHours(o.hour % 24, o.minute, o.second, 0); return (dt.getTime() - ms) / 36e5; };
    const g = new Date(0); g.setUTCFullYear(y, m - 1, d); g.setUTCHours(hh, mm, 0, 0); const local = g.getTime();
    let off = offAt(local); off = offAt(local - off * 36e5);
    return Math.round(off * 60) / 60;
  } catch (e) { return NaN; }
}
const fmtUtc = h => { if (isNaN(h)) return "UTC ?"; const s = h < 0 ? "−" : "+", a = Math.abs(h), H = Math.floor(a + 1e-9), M = Math.round((a - H) * 60); return `UTC${s}${H}${M ? ":" + String(M).padStart(2, "0") : ""}`; };
const fmtLat = v => `${Math.abs(v).toFixed(2)}°${v >= 0 ? "N" : "S"}`, fmtLon = v => `${Math.abs(v).toFixed(2)}°${v >= 0 ? "E" : "W"}`;

/* ---------- old saved profiles: a few well-known places, used only to repair profiles saved without coordinates ---------- */
const MAJOR = [["Mumbai", "Maharashtra", 19.076, 72.878, ["bombay"]], ["Delhi", "Delhi", 28.652, 77.231, ["newdelhi", "dilli"]], ["Kolkata", "West Bengal", 22.573, 88.364, ["calcutta"]],
  ["Chennai", "Tamil Nadu", 13.083, 80.271, ["madras"]], ["Bengaluru", "Karnataka", 12.972, 77.595, ["bangalore"]], ["Hyderabad", "Telangana", 17.385, 78.487, []], ["Pune", "Maharashtra", 18.52, 73.857, ["poona"]],
  ["Ahmedabad", "Gujarat", 23.023, 72.571, []], ["Jaipur", "Rajasthan", 26.912, 75.787, []], ["Lucknow", "Uttar Pradesh", 26.847, 80.947, []], ["Patna", "Bihar", 25.594, 85.138, []],
  ["Varanasi", "Uttar Pradesh", 25.318, 82.974, ["benares", "banaras", "kashi"]], ["Prayagraj", "Uttar Pradesh", 25.436, 81.846, ["allahabad"]], ["Kanpur", "Uttar Pradesh", 26.449, 80.332, ["cawnpore"]],
  ["Nagpur", "Maharashtra", 21.146, 79.088, []], ["Indore", "Madhya Pradesh", 22.72, 75.858, []], ["Bhopal", "Madhya Pradesh", 23.26, 77.413, []], ["Surat", "Gujarat", 21.17, 72.831, []],
  ["Vadodara", "Gujarat", 22.307, 73.181, ["baroda"]], ["Chandigarh", "Chandigarh", 30.733, 76.779, []], ["Guwahati", "Assam", 26.144, 91.736, ["gauhati"]], ["Kochi", "Kerala", 9.931, 76.267, ["cochin"]],
  ["Thiruvananthapuram", "Kerala", 8.524, 76.937, ["trivandrum"]], ["Bhubaneswar", "Odisha", 20.296, 85.825, []], ["Dehradun", "Uttarakhand", 30.317, 78.032, []], ["Amritsar", "Punjab", 31.634, 74.873, []],
  ["Ludhiana", "Punjab", 30.901, 75.857, []], ["Gurugram", "Haryana", 28.459, 77.027, ["gurgaon"]], ["Noida", "Uttar Pradesh", 28.535, 77.391, []], ["Visakhapatnam", "Andhra Pradesh", 17.686, 83.218, ["vizag"]],
  ["Mysuru", "Karnataka", 12.296, 76.639, ["mysore"]], ["Coimbatore", "Tamil Nadu", 11.017, 76.956, []], ["Madurai", "Tamil Nadu", 9.925, 78.12, []], ["Ranchi", "Jharkhand", 23.344, 85.31, []], ["Raipur", "Chhattisgarh", 21.251, 81.63, []]];
function resolveLegacyPlace(text) {
  const n = norm(String(text || "").split(",")[0]);
  if (!n) return null;
  const m = MAJOR.find(x => norm(x[0]) === n || x[4].includes(n));
  return m ? { city: m[0], state: m[1], country: "India", lat: m[2], lon: m[3], iana: INDIA_ZONE } : null;
}
