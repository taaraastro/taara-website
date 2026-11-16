# Spatik Astro website: launch guide

This folder is a complete website, ready for GitHub Pages:
- `docs/` is the live site: the app, legal pages, app icons, offline support, sitemap and daily rashifal pages.
- `src/` holds the app's source files.
- `tools/` builds the daily rashifal pages; a GitHub Action runs it every night at 00:05 IST.
- `deploy/` holds your settings (`site.config.json`) and the builder (`build_website.py`).

**Business model built in:**
- **Free:** Kundli, daily rashifal, Panchang, matching, and 5 free questions per device.
- **Then:** ₹49 for 15 questions or ₹99 for 40 (no subscription), plus the Silver, Gold and Unlimited plans, reports and voice minutes.
- **Ads:** free users see one ad; paying users see none.

## Stage 1. Go live (day 1, about 1 hour, about ₹500–900 a year)

1. **Buy a domain**, for example `taara-astro.in`, from any registrar. Ads need your own domain; free subdomains like `github.io` or `pages.dev` are not approved by Google AdSense.
2. **Fill in `deploy/site.config.json`:** `domain`, `siteUrl`, `contact`, `ownerName`, `address`.
3. **Rebuild:** run `python3 deploy/build_website.py`. It needs Python with Pillow, and Node 18 or later.
4. **Create a free GitHub account,** then a new **public** repository. Upload everything in this folder, including the hidden `.github` folder.
5. **Turn on Pages:** in the repository, go to **Settings → Pages**: Source = *Deploy from a branch*, Branch = `main`, Folder = `/docs`. Save.
6. **Connect the domain:** in **Settings → Pages → Custom domain**, enter your domain. At your registrar, add the DNS records GitHub shows:
   - four `A` records for the bare domain
   - one `CNAME` for `www`
   Tick **Enforce HTTPS** once it appears.
7. **Start the daily pages:** open **Actions → Daily rashifal pages → Run workflow** once. After that it runs every night.

## Stage 2. Get found on Google (week 1)

1. **Verify ownership:** open search.google.com/search-console, add your domain, and verify with a DNS TXT record (or put the HTML-tag code in `googleVerification` and rebuild).
2. **Submit the sitemap:** `https://YOUR-DOMAIN.in/sitemap.xml`.
3. **Request indexing:** use URL Inspection for the home page and `/en/`.
4. **What the site already targets:** "free kundli", "free astrology app", "AI astrologer", "kundli matching", "aaj ka rashifal" and each sign's daily horoscope, through:
   - the title and description
   - structured data (web app and FAQ)
   - a visible FAQ
   - new rashifal pages every day
5. **Grow it:** add more rashifal languages (see `tools/i18n`), and get links from social profiles, WhatsApp channels and astrology forums. New sites usually take weeks to a few months to rank.

## Stage 3. Take payments (week 1)

1. **Create a Razorpay account** and make one Payment Page per product:
   - ₹49 (15 questions) and ₹99 (40 questions)
   - plans, reports and voice packs as needed
2. **Add the links:** paste each link into `payLinks` in `site.config.json`, then rebuild and upload.
3. **Send codes to buyers:** after each payment, send the buyer a code from your private codes file (the one with the `Given to` column). Codes are entered in the app's Plus tab.
4. **Keep the policy pages:** Razorpay review needs the Contact, Terms, Privacy and Refund pages, which are already included. Fill in your name and address first.

## Stage 4. Ads (when the site has steady visitors)

1. **Apply for Google AdSense** with your domain. Eligibility needs original content, a privacy policy, your control of the site, and age 18+.
2. **Add your IDs:** once approved, put your publisher ID (`ca-pub-…`) and an ad unit slot in `adsense` in `site.config.json`, then rebuild.
3. **What the rebuild sets up:**
   - `ads.txt` is created
   - one ad on the app page and one on each rashifal page, free users only
4. **Policy rules:** never click your own ads or buy traffic; both get accounts banned.

## Stage 5. Play Store app (when the website is working)

The site is already an installable web app (manifest, icons, offline support), so it can be wrapped as an Android app without rewriting it.

1. **Create a Google Play developer account** (one-time US$25).
   - New personal accounts must run a closed test with at least 12 testers for 14 continuous days before going public.
   - An organization account (needs a D-U-N-S number) is exempt.
2. **Build the Android app:** run `npm i -g @bubblewrap/cli`, then `bubblewrap init --manifest https://YOUR-DOMAIN.in/manifest.webmanifest`, then `bubblewrap build`. PWABuilder.com does the same in a browser.
3. **Link the app to your site:** put the generated `assetlinks.json` content into `assetlinks` in `site.config.json`, then rebuild and upload. It must live at `/.well-known/assetlinks.json`, or the app shows a browser bar.
4. **Upload to Play:**
   - upload the `.aab` file to a closed testing track
   - recruit 12 testers (family, friends, early website users)
   - after 14 days, apply for production
5. **Payments inside the app:** Google Play rules apply to digital purchases made in the app. Use Play Billing, or India's alternative billing program, before taking payments there.

## Updating the app later

Edit files in `src/` (or ask Claude), run `python3 deploy/build_website.py`, and upload the changed `docs/` files. The daily rashifal pages are kept.
