#!/usr/bin/env node
/* Spatik Astro daily rashifal pages: one page per Moon sign per language per day, plus index pages and a sitemap.
   Usage: node generate.js [--days 7] [--start 2026-11-16] [--out site]
   Settings: config.json (siteUrl, appUrl, langs). */
const fs = require("fs"), path = require("path");
const A = require("./engine.js");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > -1 ? process.argv[i + 1] : d; };
const DAYS = +arg("days", 1), OUT = path.resolve(__dirname, arg("out", "site"));
const START = arg("start", new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10)); // today in IST
const SLUG = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const TZ = 5.5, LAT = 28.614, LON = 77.209; // New Delhi for Panchang timings
const L = Object.fromEntries(cfg.langs.map(c => [c, JSON.parse(fs.readFileSync(path.join(__dirname, "i18n", c + ".json"), "utf8"))]));

/* ---------- astrology for one Moon sign ---------- */
const MOON_HOUSE = { 1: 60, 2: 48, 3: 80, 4: 38, 5: 54, 6: 78, 7: 74, 8: 28, 9: 58, 10: 82, 11: 90, 12: 32 };
const LUCKY_NUM = { Sun: 1, Moon: 2, Jupiter: 3, Rahu: 4, Mercury: 5, Venus: 6, Ketu: 7, Saturn: 8, Mars: 9 };
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const rnd = (seed, k) => (hash(seed + ":" + k) % 10000) / 10000;
const clamp = x => Math.max(12, Math.min(98, Math.round(x)));
function reading(sign, ds) {
  const J = A.jdLocal(ds, "12:00", TZ), tr = A.transits(J);
  const from = p => ((tr[p].sign - sign + 12) % 12) + 1, mh = from("Moon"), seed = ds + ":" + sign;
  const g = (p, set, w = 1) => (set.includes(from(p)) ? 8 : -6) * w, j = k => rnd(seed, k) * 12 - 6, base = MOON_HOUSE[mh];
  const s = {
    overall: clamp(base + j(0)),
    love: clamp(base * 0.6 + 22 + g("Venus", [1, 2, 3, 4, 5, 8, 9, 11, 12]) + ([5, 7, 11].includes(mh) ? 8 : 0) + j(1)),
    career: clamp(base * 0.6 + 22 + g("Sun", [3, 6, 10, 11]) + g("Saturn", [3, 6, 11], 0.6) + ([3, 10, 11].includes(mh) ? 6 : 0) + j(2)),
    money: clamp(base * 0.6 + 22 + g("Jupiter", [2, 5, 7, 9, 11]) + ([2, 11].includes(mh) ? 8 : 0) + j(3)),
    health: clamp(base * 0.6 + 22 + g("Mars", [3, 6, 11]) + ([6, 8, 12].includes(mh) ? -10 : 4) + j(4)),
  };
  const big = { Jupiter: [2, 5, 7, 9, 11], Saturn: [3, 6, 11], Rahu: [3, 6, 11] };
  const transits = Object.entries(big).map(([p, ok]) => ({ p, house: from(p), good: ok.includes(from(p)) }));
  const pan = A.panchang(J, TZ);
  return { mh, s, transits, pan, weekday: pan.weekday, luckyNum: LUCKY_NUM[tr.Moon.nak.lord], seed };
}
function sunTimes(ds) {
  const R = Math.PI / 180, J0 = A.jdLocal(ds, "12:00", TZ), t = A.tropical(J0).Sun, eps = 23.4393;
  const dec = Math.asin(Math.sin(eps * R) * Math.sin(t * R)) / R;
  const ra = A.n360(Math.atan2(Math.cos(eps * R) * Math.sin(t * R), Math.cos(t * R)) / R);
  const L0 = A.n360(280.46646 + 0.98564736 * (J0 - 2451545)), eot = ((L0 - 0.0057183 - ra + 540) % 360 - 180) * 4;
  const noon = 12 + TZ - LON / 15 - eot / 60;
  const H = Math.acos((Math.sin(-0.833 * R) - Math.sin(LAT * R) * Math.sin(dec * R)) / (Math.cos(LAT * R) * Math.cos(dec * R))) / R / 15;
  return { rise: noon - H, set: noon + H };
}
const hm = h => { h = ((h % 24) + 24) % 24; let H = Math.floor(h), M = Math.round((h - H) * 60); if (M === 60) { H++; M = 0; } return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`; };

/* ---------- words ---------- */
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? "");
const ordinal = (t, n) => (t.ordinals && t.ordinals[n]) || fill(t.ordinal, { n });
const tier = v => v >= 68 ? "hi" : v >= 45 ? "mid" : "lo";
const pick = (arr, seed, k) => arr[Math.floor(rnd(seed, k) * arr.length)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function dateText(ds, lang) { return new Date(ds + "T12:00:00+05:30").toLocaleDateString(lang === "en" ? "en-IN" : lang + "-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }); }

/* ---------- page shell ---------- */
const CSS = `:root{--ink:#0c1222;--panel:#141c31;--line:#2a3556;--text:#efe8d8;--muted:#9ba5bd;--saffron:#f4a93a;--good:#5fc68f;--warn:#e9bc4b;--bad:#ec6a52;color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:var(--ink);color:var(--text);font:17px/1.6 "Mukta",system-ui,sans-serif}main{max-width:760px;margin:0 auto;padding:24px 16px 64px;display:grid;gap:18px}h1,h2{font-family:"Marcellus",Georgia,serif;font-weight:400;margin:0;text-wrap:balance}h1{font-size:clamp(1.7rem,4.5vw,2.3rem);line-height:1.2}h2{font-size:1.25rem}a{color:var(--saffron)}.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:grid;gap:10px}.brand{color:var(--saffron);text-decoration:none;font-family:"Marcellus",serif;font-size:1.3rem}.meter{display:grid;gap:4px}.mt{display:flex;justify-content:space-between;font-weight:500}.bar{height:8px;border-radius:9px;background:#1b2540;overflow:hidden}.bar i{display:block;height:100%}.good{background:var(--good)}.warn{background:var(--warn)}.bad{background:var(--bad)}.areas{display:grid;grid-template-columns:1fr 1fr;gap:14px 22px}.muted{color:var(--muted)}.cta{background:linear-gradient(90deg,#f4a93a22,#f4a93a08);border-color:#f4a93a66}.btn{display:inline-block;background:var(--saffron);color:#2a1a02;padding:10px 18px;border-radius:99px;text-decoration:none;font-weight:600;justify-self:start}.signs{display:flex;flex-wrap:wrap;gap:8px}.signs a{border:1px solid var(--line);border-radius:99px;padding:4px 12px;text-decoration:none;color:var(--text)}dl{display:grid;grid-template-columns:auto 1fr;gap:4px 16px;margin:0}dt{color:var(--muted)}dd{margin:0}footer{color:var(--muted);font-size:.85rem}@media(max-width:560px){.areas{grid-template-columns:1fr}}`;
function shell({ lang, title, desc, canonical, alternates, body, jsonld }) {
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
${alternates.map(a => `<link rel="alternate" hreflang="${a.lang}" href="${a.href}">`).join("\n")}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Mukta:wght@400;500;600&display=swap" rel="stylesheet">
<style>${CSS}</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
${cfg.adsenseClient ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.adsenseClient}" crossorigin="anonymous"></script>` : ""}
<link rel="icon" href="${cfg.siteUrl}/icons/favicon.png">
</head>
<body><main>
<a class="brand" href="${cfg.siteUrl}/${lang}/">✦ Spatik Astro</a>
${body}
<footer>Spatik Astro · Vedic astrology for guidance and reflection · <a href="${cfg.appUrl}">${lang === "hi" ? "निःशुल्क कुंडली" : "Free Kundli"}</a> · <a href="${cfg.siteUrl}/about.html">About</a> · <a href="${cfg.siteUrl}/privacy.html">Privacy</a> · <a href="${cfg.siteUrl}/terms.html">Terms</a> · <a href="${cfg.siteUrl}/contact.html">Contact</a></footer>
</main></body></html>`;
}
const meter = (label, v) => `<div class="meter"><div class="mt"><span>${label}</span><span>${v}</span></div><div class="bar"><i class="${v >= 68 ? "good" : v >= 45 ? "warn" : "bad"}" style="width:${v}%"></i></div></div>`;

/* ---------- pages ---------- */
function signPage(lang, sign, ds, isToday) {
  const t = L[lang], r = reading(sign, ds), st = sunTimes(ds), seg = [8, 2, 7, 5, 6, 4, 3][r.weekday], rk = st.rise + (seg - 1) * (st.set - st.rise) / 8;
  const v = { sign: t.signs[sign], local: t.signsLocal[sign], date: dateText(ds, lang) };
  const url = `${cfg.siteUrl}/${lang}/rashifal/${SLUG[sign]}/${isToday ? "" : ds + ".html"}`;
  const areas = ["love", "career", "money", "health"].map(k => `<div>${meter(t.areas[k], r.s[k])}<p>${pick(t.text[k][tier(r.s[k])], r.seed, k)}</p></div>`).join("");
  const pl = p => (t.planets && t.planets[p]) || p;
  const body = `<h1>${fill(t.h1, v)}</h1>
<p>${fill(t.lead, { ...v, house: ordinal(t, r.mh), theme: t.themes[r.mh] })}</p>
<section class="card"><div class="mt"><span>${t.dayScore}</span><span>${r.s.overall}/100</span></div>
<div class="areas">${areas}</div>
<p class="muted">${fill(t.lucky, { colour: t.colours[r.weekday], number: r.luckyNum })}</p></section>
<section class="card"><h2>${fill(t.transits, v)}</h2>
${r.transits.map(x => `<p>${fill(t.transitLine, { planet: pl(x.p), house: ordinal(t, x.house), effect: t.effects[x.p][x.good ? "good" : "hard"] })}</p>`).join("")}</section>
<section class="card"><h2>${t.panchang}</h2><dl>
<dt>${t.tithi}</dt><dd>${r.pan.paksha} ${r.pan.tithi}</dd><dt>${t.nakshatra}</dt><dd>${r.pan.nak.name}</dd><dt>${t.yoga}</dt><dd>${r.pan.yoga}</dd>
<dt>${t.sunrise}</dt><dd>${hm(st.rise)}</dd><dt>${t.sunset}</dt><dd>${hm(st.set)}</dd><dt>${t.rahu}</dt><dd>${hm(rk)}–${hm(rk + (st.set - st.rise) / 8)}</dd></dl></section>
${cfg.adsenseClient ? `<div class="card"><p class="muted" style="margin:0;font-size:.8rem">Advertisement</p><ins class="adsbygoogle" style="display:block" data-ad-client="${cfg.adsenseClient}"${cfg.adsenseSlot ? ` data-ad-slot="${cfg.adsenseSlot}"` : ""} data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>` : ""}
<section class="card cta"><p>${fill(t.cta, v)}</p><a class="btn" href="${cfg.appUrl}">${t.ctaBtn}</a></section>
<section class="card"><h2>${t.other}</h2><div class="signs">${SLUG.map((s, i) => i === sign ? "" : `<a href="${cfg.siteUrl}/${lang}/rashifal/${s}/">${t.signs[i]}</a>`).join("")}</div></section>
<section class="card"><h2>FAQ</h2><p><b>${fill(t.faqQ1, v)}</b><br>${t.faqA1}</p><p><b>${t.faqQ2}</b><br>${t.faqA2}</p></section>`;
  const jsonld = [{ "@context": "https://schema.org", "@type": "Article", headline: fill(t.titleToday, v), datePublished: ds, dateModified: ds, inLanguage: lang, author: { "@type": "Organization", name: "Spatik Astro" }, publisher: { "@type": "Organization", name: "Spatik Astro" }, mainEntityOfPage: url },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: fill(t.faqQ1, v), acceptedAnswer: { "@type": "Answer", text: t.faqA1 } }, { "@type": "Question", name: t.faqQ2, acceptedAnswer: { "@type": "Answer", text: t.faqA2 } }] }];
  const alternates = cfg.langs.map(l => ({ lang: l, href: `${cfg.siteUrl}/${l}/rashifal/${SLUG[sign]}/${isToday ? "" : ds + ".html"}` }));
  return shell({ lang, title: fill(t.titleToday, v), desc: fill(t.descToday, v), canonical: url, alternates, body, jsonld });
}
function indexPage(lang, ds) {
  const t = L[lang], v = { date: dateText(ds, lang) };
  const cards = SLUG.map((s, i) => { const r = reading(i, ds); return `<a class="card" href="${cfg.siteUrl}/${lang}/rashifal/${s}/" style="text-decoration:none;color:inherit"><div class="mt"><span>${t.signs[i]} <span class="muted">${t.signsLocal[i]}</span></span><span>${r.s.overall}/100</span></div><div class="bar"><i class="${r.s.overall >= 68 ? "good" : r.s.overall >= 45 ? "warn" : "bad"}" style="width:${r.s.overall}%"></i></div></a>`; }).join("");
  const body = `<h1>${fill(t.indexH1, v)}</h1><p>${t.indexLead} <a href="${cfg.appUrl}">${t.ctaBtn}</a></p>${cards}`;
  return shell({ lang, title: fill(t.indexTitle, v), desc: fill(t.indexTitle, v), canonical: `${cfg.siteUrl}/${lang}/`, alternates: cfg.langs.map(l => ({ lang: l, href: `${cfg.siteUrl}/${l}/` })), body });
}

/* ---------- write ---------- */
const write = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
let n = 0;
for (let d = 0; d < DAYS; d++) {
  const ds = new Date(new Date(START + "T12:00:00Z").getTime() + d * 864e5).toISOString().slice(0, 10);
  for (const lang of cfg.langs) for (let s = 0; s < 12; s++) { write(`${lang}/rashifal/${SLUG[s]}/${ds}.html`, signPage(lang, s, ds, false)); n++; }
}
for (const lang of cfg.langs) { for (let s = 0; s < 12; s++) write(`${lang}/rashifal/${SLUG[s]}/index.html`, signPage(lang, s, START, true)); write(`${lang}/index.html`, indexPage(lang, START)); }
if (!cfg.skipRoot) write("index.html", `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${cfg.siteUrl}/${cfg.langs[0]}/"><link rel="canonical" href="${cfg.siteUrl}/${cfg.langs[0]}/"><title>Spatik Astro Rashifal</title></head><body><a href="${cfg.siteUrl}/${cfg.langs[0]}/">Spatik Astro Rashifal</a></body></html>`);
// sitemap over everything on disk
const urls = [];
(function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith(".html") && e.name !== "404.html" && !p.includes(`${path.sep}.`)) urls.push(path.relative(OUT, p).split(path.sep).join("/")); } })(OUT);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.sort().map(u => `<url><loc>${cfg.siteUrl}/${u.replace(/index\.html$/, "")}</loc>${/\d{4}-\d{2}-\d{2}/.test(u) ? `<lastmod>${u.match(/\d{4}-\d{2}-\d{2}/)[0]}</lastmod>` : `<lastmod>${START}</lastmod>`}</url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${cfg.siteUrl}/sitemap.xml\n`);
console.log(`Wrote ${n} dated pages, ${cfg.langs.length * 13} today/index pages, sitemap with ${urls.length} URLs into ${OUT}`);
