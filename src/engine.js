/* ===== Spatik Astro Vedic engine (sidereal, Lahiri) ===== */
const Astro = (() => {
  const R = Math.PI / 180;
  const n360 = x => ((x % 360) + 360) % 360;
  const sind = x => Math.sin(x * R), cosd = x => Math.cos(x * R);
  const atan2d = (y, x) => Math.atan2(y, x) / R;

  const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const SIGNS_HI = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
  const SIGN_LORD = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
  const NAK = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
  const DASHA = [["Ketu",7],["Venus",20],["Sun",6],["Moon",10],["Mars",7],["Rahu",18],["Jupiter",16],["Saturn",19],["Mercury",17]];
  const TITHI = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi"];
  const YOGA = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
  const KARANA_MOV = ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti"];
  const VARA = ["Ravivara (Sunday)","Somavara (Monday)","Mangalavara (Tuesday)","Budhavara (Wednesday)","Guruvara (Thursday)","Shukravara (Friday)","Shanivara (Saturday)"];
  const PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
  const ABBR = {Sun:"Su",Moon:"Mo",Mars:"Ma",Mercury:"Me",Jupiter:"Ju",Venus:"Ve",Saturn:"Sa",Rahu:"Ra",Ketu:"Ke",Lagna:"La"};

  // Julian day from UT components
  function jd(y, m, d, hUT) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + hUT / 24 + B - 1524.5;
  }
  // local date/time + tz offset (hours) -> JD (UT)
  function jdLocal(dateStr, timeStr, tz) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = (timeStr || "12:00").split(":").map(Number);
    return jd(y, m, d, hh + mm / 60 - tz);
  }
  function jdToDate(J) { return new Date((J - 2440587.5) * 86400000); }
  function dateToJd(dt) { return dt.getTime() / 86400000 + 2440587.5; }

  function ayanamsa(J) { // Lahiri, ~0.01° accuracy for 1900–2100
    const t = (J - 2451545.0) / 36525;
    return 23.85306 + 1.39697 * t + 0.000308 * t * t;
  }

  function kepler(M, e) {
    let E = M + (e / R) * sind(M) * (1 + e * cosd(M));
    for (let k = 0; k < 8; k++) E = E - (E - (e / R) * sind(E) - M) / (1 - e * cosd(E));
    return E;
  }
  function orbit(el) {
    const E = kepler(n360(el.M), el.e);
    const xv = el.a * (cosd(E) - el.e), yv = el.a * Math.sqrt(1 - el.e * el.e) * sind(E);
    const v = atan2d(yv, xv), r = Math.hypot(xv, yv);
    const u = v + el.w;
    const xh = r * (cosd(el.N) * cosd(u) - sind(el.N) * sind(u) * cosd(el.i));
    const yh = r * (sind(el.N) * cosd(u) + cosd(el.N) * sind(u) * cosd(el.i));
    const zh = r * sind(u) * sind(el.i);
    return { lon: n360(atan2d(yh, xh)), lat: atan2d(zh, Math.hypot(xh, yh)), r };
  }
  function elements(d) {
    return {
      Sun:     { N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.0470 + 0.9856002585 * d },
      Moon:    { N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d },
      Mercury: { N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d },
      Venus:   { N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d },
      Mars:    { N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d },
      Jupiter: { N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d },
      Saturn:  { N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d },
    };
  }
  // tropical geocentric longitudes (of date)
  function tropical(J) {
    const d = J - 2451543.5;
    const el = elements(d);
    const out = {};
    // Sun
    const s = orbit(el.Sun);
    out.Sun = s.lon;
    const xs = s.r * cosd(s.lon), ys = s.r * sind(s.lon);
    // Moon with perturbations
    const m = orbit(el.Moon);
    const Ms = n360(el.Sun.M), Mm = n360(el.Moon.M);
    const Ls = n360(Ms + el.Sun.w), Lm = n360(Mm + el.Moon.w + el.Moon.N);
    const D = Lm - Ls, F = Lm - el.Moon.N;
    out.Moon = n360(m.lon
      - 1.274 * sind(Mm - 2 * D) + 0.658 * sind(2 * D) - 0.186 * sind(Ms)
      - 0.059 * sind(2 * Mm - 2 * D) - 0.057 * sind(Mm - 2 * D + Ms) + 0.053 * sind(Mm + 2 * D)
      + 0.046 * sind(2 * D - Ms) + 0.041 * sind(Mm - Ms) - 0.035 * sind(D)
      - 0.031 * sind(Mm + Ms) - 0.015 * sind(2 * F - 2 * D) + 0.011 * sind(Mm - 4 * D));
    // planets
    const Mj = n360(el.Jupiter.M), Msa = n360(el.Saturn.M);
    for (const p of ["Mercury","Venus","Mars","Jupiter","Saturn"]) {
      const h = orbit(el[p]);
      let lon = h.lon;
      if (p === "Jupiter") lon += -0.332 * sind(2 * Mj - 5 * Msa - 67.6) - 0.056 * sind(2 * Mj - 2 * Msa + 21) + 0.042 * sind(3 * Mj - 5 * Msa + 21) - 0.036 * sind(Mj - 2 * Msa) + 0.022 * cosd(Mj - Msa) + 0.023 * sind(2 * Mj - 3 * Msa + 52) - 0.016 * sind(Mj - 5 * Msa - 69);
      if (p === "Saturn") lon += 0.812 * sind(2 * Mj - 5 * Msa - 67.6) - 0.229 * cosd(2 * Mj - 4 * Msa - 2) + 0.119 * sind(Mj - 2 * Msa - 3) + 0.046 * sind(2 * Mj - 6 * Msa - 69) + 0.014 * sind(Mj - 3 * Msa + 32);
      const xh = h.r * cosd(lon) * cosd(h.lat), yh = h.r * sind(lon) * cosd(h.lat);
      out[p] = n360(atan2d(yh + ys, xh + xs));
    }
    out.Rahu = n360(el.Moon.N); // mean node
    out.Ketu = n360(out.Rahu + 180);
    return out;
  }
  function ascendantTropical(J, lat, lon) {
    const T = (J - 2451545.0) / 36525;
    const gmst = n360(280.46061837 + 360.98564736629 * (J - 2451545.0) + 0.000387933 * T * T);
    const ramc = n360(gmst + lon);
    const eps = 23.4392911 - 0.0130042 * T;
    return n360(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + Math.tan(lat * R) * sind(eps))));
  }

  function sidereal(J) {
    const t = tropical(J), t2 = tropical(J + 0.5), ay = ayanamsa(J), out = {};
    for (const p of PLANETS) {
      let diff = ((t2[p] - t[p] + 540) % 360) - 180;
      out[p] = { lon: n360(t[p] - ay), retro: p === "Rahu" || p === "Ketu" ? true : diff < 0 };
    }
    return out;
  }
  function nakOf(lon) {
    const span = 360 / 27, i = Math.floor(lon / span);
    return { idx: i, name: NAK[i], pada: Math.floor((lon - i * span) / (span / 4)) + 1, frac: (lon - i * span) / span, lord: DASHA[i % 9][0] };
  }
  function fmtDeg(lon) {
    const x = lon % 30, dd = Math.floor(x), mm = Math.floor((x - dd) * 60);
    return `${dd}°${String(mm).padStart(2, "0")}′`;
  }

  // ---------- natal chart ----------
  function chart(p) { // p: {date,time,tz,lat,lon}
    const J = jdLocal(p.date, p.time, p.tz);
    const pl = sidereal(J);
    const ascLon = n360(ascendantTropical(J, p.lat, p.lon) - ayanamsa(J));
    const lagnaSign = Math.floor(ascLon / 30);
    const planets = {};
    for (const k of PLANETS) {
      const lon = pl[k].lon, sign = Math.floor(lon / 30);
      planets[k] = { lon, sign, deg: fmtDeg(lon), retro: pl[k].retro, house: ((sign - lagnaSign + 12) % 12) + 1, nak: nakOf(lon) };
    }
    const lagna = { lon: ascLon, sign: lagnaSign, deg: fmtDeg(ascLon), nak: nakOf(ascLon) };
    const moon = planets.Moon;
    const c = { J, lagna, planets, moonSign: moon.sign, sunSign: planets.Sun.sign, nak: moon.nak };
    c.dasha = vimshottari(J, moon.lon);
    c.doshas = doshas(c);
    return c;
  }

  // ---------- Vimshottari ----------
  const YEAR = 365.2425;
  function vimshottari(Jbirth, moonLon) {
    const nk = nakOf(moonLon), start = nk.idx % 9;
    const firstYears = DASHA[start][1];
    let t = Jbirth - nk.frac * firstYears * YEAR; // when the first MD began
    const list = [];
    for (let k = 0; k < 18; k++) {
      const [lord, yrs] = DASHA[(start + k) % 9];
      const s = t, e = t + yrs * YEAR;
      const ads = []; let a = s;
      for (let j = 0; j < 9; j++) {
        const [al, ay] = DASHA[(start + k + j) % 9];
        const len = yrs * ay / 120 * YEAR;
        ads.push({ lord: al, start: a, end: a + len }); a += len;
      }
      list.push({ lord, start: s, end: e, ads });
      t = e;
      if (t > Jbirth + 125 * YEAR) break;
    }
    return list.filter(m => m.end > Jbirth);
  }
  // split any period into its 9 sub-periods, starting with the period's own lord
  const LORD_IDX = Object.fromEntries(DASHA.map(([l], i) => [l, i]));
  function subPeriods(p) {
    if (p._subs) return p._subs;
    const i0 = LORD_IDX[p.lord], total = p.end - p.start, out = [];
    let t = p.start;
    for (let j = 0; j < 9; j++) {
      const [l, y] = DASHA[(i0 + j) % 9];
      const len = total * y / 120;
      out.push({ lord: l, start: t, end: t + len, parent: p });
      t += len;
    }
    Object.defineProperty(p, "_subs", { value: out, enumerable: false });
    return out;
  }
  function currentDasha(c, J) {
    for (const m of c.dasha) if (J >= m.start && J < m.end) {
      const ad = m.ads.find(a => J >= a.start && J < a.end);
      const pd = subPeriods(ad).find(x => J >= x.start && J < x.end);
      const sd = subPeriods(pd).find(x => J >= x.start && J < x.end);
      return { md: m, ad, pd, sd };
    }
    return null;
  }

  // ---------- doshas ----------
  function doshas(c) {
    const P = c.planets, res = {};
    const marsFromLagna = P.Mars.house, marsFromMoon = ((P.Mars.sign - P.Moon.sign + 12) % 12) + 1;
    const bad = [1, 2, 4, 7, 8, 12];
    res.manglik = { lagna: bad.includes(marsFromLagna), moon: bad.includes(marsFromMoon), houseL: marsFromLagna, houseM: marsFromMoon };
    // Kaal Sarp: all 7 planets within the arc Rahu -> Ketu (or Ketu -> Rahu)
    const r = P.Rahu.lon;
    const rel = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"].map(k => n360(P[k].lon - r));
    res.kaalSarp = rel.every(x => x < 180) || rel.every(x => x > 180);
    return res;
  }

  // ---------- transits / panchang ----------
  function transits(J) {
    const s = sidereal(J), out = {};
    for (const k of PLANETS) out[k] = { lon: s[k].lon, sign: Math.floor(s[k].lon / 30), retro: s[k].retro, nak: nakOf(s[k].lon) };
    return out;
  }
  function panchang(J, tz) {
    const s = sidereal(J);
    const diff = n360(s.Moon.lon - s.Sun.lon);
    const ti = Math.floor(diff / 12); // 0..29
    const paksha = ti < 15 ? "Shukla" : "Krishna";
    const tn = ti % 15;
    const tithi = ti === 14 ? "Purnima" : ti === 29 ? "Amavasya" : TITHI[tn];
    const yi = Math.floor(n360(s.Moon.lon + s.Sun.lon) / (360 / 27));
    const ki = Math.floor(diff / 6); // 0..59
    let karana;
    if (ki === 0) karana = "Kimstughna"; else if (ki >= 57) karana = ["Shakuni","Chatushpada","Naga"][ki - 57]; else karana = KARANA_MOV[(ki - 1) % 7];
    const local = jdToDate(J + tz / 24);
    const vara = VARA[local.getUTCDay()];
    return { tithi, paksha, tithiNum: ti + 1, nak: nakOf(s.Moon.lon), yoga: YOGA[yi], karana, vara, weekday: local.getUTCDay(), moonSign: Math.floor(s.Moon.lon / 30), illum: Math.round((1 - cosd(diff)) / 2 * 100) };
  }

  // ---------- Ashtakoota Guna Milan ----------
  const VARNA = s => [3,2,1,4,3,2,1,4,3,2,1,4][s]; // 4 Brahmin(water) 3 Kshatriya(fire) 2 Vaishya(earth) 1 Shudra(air)
  function vashyaCat(lon) {
    const s = Math.floor(lon / 30), half = (lon % 30) < 15;
    // 0 Chatushpada 1 Manava 2 Jalachara 3 Vanachara 4 Keeta
    return [0,0,1,2,3,1,1,4, half ? 1 : 0, half ? 0 : 2, 1, 2][s];
  }
  const VASHYA_T = [[2,1,1,0.5,1],[1,2,0.5,0,1],[1,0.5,2,1,1],[0.5,0,1,2,0],[1,1,1,0,2]];
  const YONI = ["Horse","Elephant","Sheep","Serpent","Serpent","Dog","Cat","Sheep","Cat","Rat","Rat","Cow","Buffalo","Tiger","Buffalo","Tiger","Deer","Deer","Dog","Monkey","Mongoose","Monkey","Lion","Horse","Lion","Cow","Elephant"];
  const YONI_ENEMY = [["Horse","Buffalo"],["Elephant","Lion"],["Sheep","Monkey"],["Serpent","Mongoose"],["Dog","Deer"],["Cat","Rat"],["Cow","Tiger"]];
  const GANA = i => ["D","M","R","M","D","M","D","D","R","R","M","M","D","R","D","R","D","R","R","M","M","D","R","R","M","M","D"][i];
  const NADI = i => ["Adi","Madhya","Antya","Antya","Madhya","Adi"][i % 6];
  const FRIEND = {
    Sun: { f: ["Moon","Mars","Jupiter"], e: ["Venus","Saturn"] },
    Moon: { f: ["Sun","Mercury"], e: [] },
    Mars: { f: ["Sun","Moon","Jupiter"], e: ["Mercury"] },
    Mercury: { f: ["Sun","Venus"], e: ["Moon"] },
    Jupiter: { f: ["Sun","Moon","Mars"], e: ["Mercury","Venus"] },
    Venus: { f: ["Mercury","Saturn"], e: ["Sun","Moon"] },
    Saturn: { f: ["Mercury","Venus"], e: ["Sun","Moon","Mars"] },
  };
  const rel = (a, b) => a === b ? "f" : FRIEND[a].f.includes(b) ? "f" : FRIEND[a].e.includes(b) ? "e" : "n";

  function gunaMilan(boy, girl) { // each: {moonLon}
    const bs = Math.floor(boy.moonLon / 30), gs = Math.floor(girl.moonLon / 30);
    const bn = nakOf(boy.moonLon).idx, gn = nakOf(girl.moonLon).idx;
    const k = [];
    k.push({ name: "Varna", max: 1, score: VARNA(bs) >= VARNA(gs) ? 1 : 0, about: "Work temperament and ego balance" });
    k.push({ name: "Vashya", max: 2, score: VASHYA_T[vashyaCat(boy.moonLon)][vashyaCat(girl.moonLon)], about: "Mutual attraction and influence" });
    const t1 = (((bn - gn + 27) % 27) + 1) % 9, t2 = (((gn - bn + 27) % 27) + 1) % 9;
    const okT = x => ![3, 5, 7].includes(x);
    k.push({ name: "Tara", max: 3, score: okT(t1) && okT(t2) ? 3 : okT(t1) || okT(t2) ? 1.5 : 0, about: "Health and wellbeing of the couple" });
    const yb = YONI[bn], yg = YONI[gn];
    const enemy = YONI_ENEMY.some(([a, b]) => (a === yb && b === yg) || (a === yg && b === yb));
    k.push({ name: "Yoni", max: 4, score: yb === yg ? 4 : enemy ? 0 : 2, about: `Physical intimacy (${yb} & ${yg})` });
    const lb = SIGN_LORD[bs], lg = SIGN_LORD[gs], r1 = rel(lb, lg), r2 = rel(lg, lb);
    const pair = [r1, r2].sort().join("");
    const gm = lb === lg ? 5 : ({ ff: 5, fn: 4, nn: 3, ef: 1, en: 0.5, ee: 0 })[pair];
    k.push({ name: "Graha Maitri", max: 5, score: gm, about: `Mental friendship (${lb} & ${lg})` });
    const G = { D: 0, M: 1, R: 2 }, GT = [[6, 6, 1], [5, 6, 0], [1, 0, 6]];
    const gb = GANA(bn), gg = GANA(gn);
    const gname = { D: "Deva", M: "Manushya", R: "Rakshasa" };
    k.push({ name: "Gana", max: 6, score: GT[G[gb]][G[gg]], about: `Nature (${gname[gb]} & ${gname[gg]})` });
    const dist = ((bs - gs + 12) % 12) + 1;
    k.push({ name: "Bhakoot", max: 7, score: [2, 12, 5, 9, 6, 8].includes(dist) ? 0 : 7, about: "Family welfare and finances" });
    const nb = NADI(bn), ng = NADI(gn);
    k.push({ name: "Nadi", max: 8, score: nb === ng ? 0 : 8, about: `Health and progeny (${nb} & ${ng})` });
    const total = k.reduce((s, x) => s + x.score, 0);
    return { kootas: k, total };
  }

  return { SIGNS, SIGNS_HI, SIGN_LORD, NAK, PLANETS, ABBR, DASHA, YEAR, n360, jd, jdLocal, jdToDate, dateToJd, ayanamsa, tropical, sidereal, chart, transits, panchang, currentDasha, subPeriods, gunaMilan, nakOf, fmtDeg, ascendantTropical };
})();
if (typeof module !== "undefined") module.exports = Astro;
