#!/usr/bin/env python3
"""Build the Spatik Astro website (GitHub Pages ready) from the app source and site.config.json.

Usage: python3 build_website.py            (reads site.config.json next to this file)
Output: ../docs  (the folder GitHub Pages serves)  plus tools/ config for the daily rashifal pages.
"""
import json, os, shutil, subprocess, html
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent                      # repository root
SRC = ROOT / "src"
DOCS = ROOT / "docs"
TOOLS = ROOT / "tools"
cfg = json.loads((HERE / "site.config.json").read_text(encoding="utf-8"))
site = cfg["siteUrl"].rstrip("/")
name = cfg.get("brand", "Spatik Astro")

# ---------- 1. the app ----------
shell = (SRC / "shell.html").read_text(encoding="utf-8")
engine = (SRC / "engine.js").read_text(encoding="utf-8").replace('if (typeof module !== "undefined") module.exports = Astro;', "")
def inline_places(js, pdir):
    return js.replace("/*WORLD_COUNTRIES*/[]", (pdir / "_countries.json").read_text(encoding="utf-8")).replace("/*IN_DATA*/null", (pdir / "IN.json").read_text(encoding="utf-8"))
parts = "\n".join((SRC / f).read_text(encoding="utf-8") for f in ["places.js", "langs.js", "insight.js", "revenue.js", "voice.js", "app.js"])
parts = inline_places(parts, SRC / "places")
app_cfg = {k: cfg[k] for k in ["contact", "freeQuestions", "payLinks", "adsense", "voiceProxy", "feedbackUrl", "lockDates"] if k in cfg}
title = f"{name}: Free Kundli & AI Astrology App in Indian Languages | Low-Cost Vedic Astrologer"
desc = ("Free Janam Kundli, daily rashifal, Kundli matching and an AI Vedic astrologer that answers with exact dasha dates, "
        "in 35 Indian languages. First questions free, then from Rs 49.")
jsonld = [
    {"@context": "https://schema.org", "@type": "WebApplication", "name": name, "url": site + "/",
     "applicationCategory": "LifestyleApplication", "operatingSystem": "Web, Android", "inLanguage": ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa", "or"],
     "description": desc, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR"}},
    {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": "Is Spatik Astro really free?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Kundli, daily horoscope, Panchang, Kundli matching and your first questions to the AI astrologer are free. Extra questions start at Rs 49 for 15, with no subscription needed."}},
        {"@type": "Question", "name": "How accurate is the Kundli?", "acceptedAnswer": {"@type": "Answer", "text": "Planet positions are calculated with standard astronomical models and converted to the sidereal zodiac with the Lahiri ayanamsa. An exact birth time gives the most accurate Lagna and dasha dates."}},
        {"@type": "Question", "name": "Which languages does Spatik Astro support?", "acceptedAnswer": {"@type": "Answer", "text": "English, Hinglish and 35 Indian languages. Type in your own script and Spatik Astro replies in the same language."}},
        {"@type": "Question", "name": "Is my birth data safe?", "acceptedAnswer": {"@type": "Answer", "text": "Your birth details are stored on your own device."}}]},
]
head = f"""<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{site}/">
<meta property="og:type" content="website"><meta property="og:url" content="{site}/"><meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:image" content="{site}/icons/icon-512.png">
<meta name="theme-color" content="#0c1222">
<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icons/favicon.png"><link rel="apple-touch-icon" href="/icons/icon-192.png">
{'<meta name="google-site-verification" content="' + cfg['googleVerification'] + '">' if cfg.get('googleVerification') else ''}
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
<script>window.TAARA_CONFIG = {json.dumps(app_cfg, ensure_ascii=False)};</script>
<script>if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {{}}));</script>
"""
page = shell.replace("<title>Spatik Astro</title>", f"<title>{html.escape(title)}</title>").replace("<!--SEO_HEAD-->", head)
page = page.replace("/*ENGINE*/", engine).replace("/*PLACES*/\n/*APP*/", 'const CFG = (typeof window !== "undefined" && window.TAARA_CONFIG) || {};\n' + parts)
if DOCS.exists():
    for p in DOCS.iterdir():          # keep the daily rashifal archive, rebuild everything else
        if p.name in ("en", "hi") or (p.is_dir() and p.name in cfg.get("rashifalLangs", [])):
            continue
        shutil.rmtree(p) if p.is_dir() else p.unlink()
DOCS.mkdir(exist_ok=True)
(DOCS / "index.html").write_text(page, encoding="utf-8")
shutil.copytree(SRC / "places", DOCS / "places", ignore=shutil.ignore_patterns("IN.json"))

# ---------- 2. legal and info pages ----------
contact = html.escape(cfg.get("contact", ""))
email = html.escape(cfg.get("contactEmail", ""))
owner = html.escape(cfg.get("ownerName", "[Owner or company name]"))
address = html.escape(cfg.get("address", "[Business address, city, state, PIN]"))
updated = cfg.get("updated", "16 November 2026")
CSS = ("body{margin:0;background:#0c1222;color:#efe8d8;font:17px/1.65 Mukta,system-ui,sans-serif}main{max-width:760px;margin:0 auto;padding:28px 16px 64px}"
       "h1,h2{font-family:Marcellus,Georgia,serif;font-weight:400}a{color:#f4a93a}.muted{color:#9ba5bd}nav a{margin-right:14px}")
def info(slug, h1, body, desc_):
    (DOCS / f"{slug}.html").write_text(f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(h1)} | {name}</title><meta name="description" content="{html.escape(desc_)}"><link rel="canonical" href="{site}/{slug}.html"><link rel="icon" href="/icons/favicon.png">
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Mukta:wght@400;600&display=swap" rel="stylesheet"><style>{CSS}</style></head>
<body><main><nav><a href="/">{name} app</a><a href="/en/">Daily rashifal</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></nav>
<h1>{html.escape(h1)}</h1>{body}<p class="muted">Last updated {updated}.</p></main></body></html>""", encoding="utf-8")

info("about", f"About {name}", f"""
<p>{name} is a free Vedic astrology app for India. It makes your Janam Kundli, daily rashifal, Panchang and 36-guna Kundli matching, and its AI astrologer answers questions about career, marriage, money, health and family from your own chart, with exact Vimshottari dasha dates.</p>
<p>Calculations run on standard astronomical models with the Lahiri ayanamsa. {name} answers in English, Hinglish and 35 Indian languages, in writing and by voice.</p>
<p>Astrology is offered for guidance and self-reflection. {name} does not replace medical, legal or financial advice.</p>
<p>Birth places cover every country, state and about 171,000 cities, with time zones worked out for the exact birth date. Place data comes from the <a href="https://github.com/dr5hn/countries-states-cities-database">Countries States Cities Database</a> under the <a href="https://opendatacommons.org/licenses/odbl/1-0/">Open Database License</a>; our derived place files are available under the same licence at <a href="/places/LICENSE.txt">/places</a>.</p>
<p>{name} is run by {owner}.</p>""", f"What {name} is and who runs it.")
info("contact", "Contact us", f"""
<p>Questions, payment help or feedback: {contact}{' · Email: <a href="mailto:' + email + '">' + email + '</a>' if email else ''}.</p>
<p>Business address: {address}.</p><p>We reply within 2 working days.</p>""", f"How to reach {name}.")
info("privacy", "Privacy policy", f"""
<h2>What we collect</h2><p>The birth details you enter (name, date, time and place of birth) and your settings are stored in your own browser on your device. We do not need an account to use {name}.</p>
<h2>When data leaves your device</h2><ul>
<li><b>AI answers:</b> when you ask a question, your question and the computed chart are sent to our AI provider to write the answer.</li>
<li><b>Voice:</b> if you use voice, your recording is sent to our speech provider to turn it into text, and the answer text is sent to make speech.</li>
<li><b>Payments:</b> payments are handled by our payment provider (for example Razorpay). We never see your card or UPI PIN.</li>
<li><b>Advertising:</b> free users may see ads from Google AdSense. Google and its partners use cookies to show ads based on your visits to this and other websites. You can turn off personalised ads at <a href="https://www.google.com/settings/ads">Google Ads Settings</a>. Learn how Google uses data at <a href="https://policies.google.com/technologies/partner-sites">policies.google.com</a>.</li>
<li><b>Analytics:</b> we may count visits with privacy-friendly analytics.</li></ul>
<h2>Your choices</h2><p>Use "Start as a new person" in the Plus tab, or clear your browser data, to delete everything {name} saved on your device. Contact us to ask about any data held by our providers.</p>
<h2>Children</h2><p>{name} is not meant for children under 13. Payments are for users aged 18 and over.</p>
<h2>Contact</h2><p>{contact}{' · ' + email if email else ''}</p>""", f"How {name} handles your birth details, payments, voice and ads.")
info("terms", "Terms of use", f"""
<p>By using {name} you agree to these terms.</p>
<h2>Guidance, not guarantees</h2><p>Astrological readings are for guidance, reflection and entertainment. They are not predictions of certain outcomes and are not medical, legal, financial or psychological advice. Consult a qualified professional for those decisions.</p>
<h2>Paid features</h2><p>Question packs, reports, voice minutes and plans are digital services delivered as activation codes or credits on your device. Plans renew only if you buy them again. Prices include applicable taxes unless stated.</p>
<h2>Fair use</h2><p>Do not misuse the service, share paid codes publicly, or try to break it.</p>
<h2>Changes</h2><p>We may update features, prices and these terms; the date below shows the latest version.</p>
<h2>Contact</h2><p>{contact}</p>""", f"Terms for using {name}.")
info("refund", "Refund and cancellation policy", f"""
<p>{name} sells digital services: question packs, reports, voice minutes and plans.</p>
<ul><li>If you paid but did not receive your activation code, contact us within 7 days and we will send it or refund you in full.</li>
<li>If a code does not work, we will replace it or refund you.</li>
<li>Credits and plan days that have already been used are not refundable.</li>
<li>Refunds go back to the original payment method within 5–7 working days.</li></ul>
<p>Contact: {contact}{' · ' + email if email else ''}</p>""", f"Refunds and cancellations for {name} purchases.")
(DOCS / "404.html").write_text(f'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found | {name}</title><style>{CSS}</style></head><body><main><h1>Page not found</h1><p><a href="/">Open the {name} app</a> or read <a href="/en/">today\'s rashifal</a>.</p></main></body></html>', encoding="utf-8")

# ---------- 3. PWA: manifest, icons, service worker (needed for the Play Store app) ----------
(DOCS / "manifest.webmanifest").write_text(json.dumps({
    "name": f"{name}: Vedic Astrology", "short_name": name, "description": desc, "start_url": "/?source=pwa", "scope": "/",
    "display": "standalone", "orientation": "portrait", "background_color": "#081127", "theme_color": "#081127", "lang": "en-IN",
    "categories": ["lifestyle", "entertainment"],
    "icons": [{"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
              {"src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]}, indent=2), encoding="utf-8")
from PIL import Image, ImageDraw
(DOCS / "icons").mkdir(exist_ok=True)
def icon(size, pad, path):
    im = Image.new("RGBA", (size, size), (8, 17, 39, 255)); d = ImageDraw.Draw(im)
    c, r = size / 2, size / 2 - pad
    d.ellipse([c - r, c - r, c + r, c + r], outline=(244, 181, 74, 255), width=max(2, size // 48))
    h, w = r * 0.72, r * 0.42
    pts = [(c, c - h), (c + w, c - h * .55), (c + w, c + h * .55), (c, c + h), (c - w, c + h * .55), (c - w, c - h * .55)]
    d.polygon(pts, fill=(143, 220, 255, 255))
    d.polygon([pts[0], pts[1], (c, c - h * .2), pts[5]], fill=(235, 250, 255, 255))
    d.polygon([(c, c - h * .2), pts[1], pts[2], pts[3]], fill=(106, 140, 255, 255))
    lw = max(1, size // 128)
    d.line([pts[5], (c, c - h * .2), pts[1]], fill=(255, 255, 255, 200), width=lw); d.line([(c, c - h * .2), pts[3]], fill=(255, 255, 255, 160), width=lw)
    im.save(DOCS / "icons" / path)
icon(512, 40, "icon-512.png"); icon(192, 15, "icon-192.png"); icon(512, 110, "maskable-512.png"); icon(64, 4, "favicon.png")
(DOCS / "sw.js").write_text("""const CACHE = "spatik-v4";
const CORE = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;           // never touch ads, payments or APIs
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match("/"))));
});
""", encoding="utf-8")
wk = DOCS / ".well-known"; wk.mkdir(exist_ok=True)
(wk / "assetlinks.json").write_text(cfg.get("assetlinks", "[]") if isinstance(cfg.get("assetlinks"), str) else json.dumps(cfg.get("assetlinks", []), indent=2), encoding="utf-8")

# ---------- 4. hosting files ----------
(DOCS / ".nojekyll").write_text("", encoding="utf-8")
if cfg.get("domain"): (DOCS / "CNAME").write_text(cfg["domain"] + "\n", encoding="utf-8")
client = (cfg.get("adsense") or {}).get("client", "")
if client: (DOCS / "ads.txt").write_text(f"google.com, {client.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n", encoding="utf-8")

# ---------- 5. daily rashifal pages + sitemap ----------
tcfg = {"siteUrl": site, "appUrl": site + "/", "langs": cfg.get("rashifalLangs", ["en", "hi"]), "skipRoot": True,
        "adsenseClient": client, "adsenseSlot": (cfg.get("adsense") or {}).get("slot", "")}
(TOOLS / "config.json").write_text(json.dumps(tcfg, indent=2), encoding="utf-8")
out = subprocess.run(["node", str(TOOLS / "generate.js"), "--days", str(cfg.get("rashifalDays", 2)), "--out", str(DOCS)], capture_output=True, text=True)
print(out.stdout.strip() or out.stderr.strip())
print(f"Built {DOCS}")
