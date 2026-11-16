/* ===== Revenue layer: reports, free trial, WOW-moment lock, referrals, alerts ===== */
const TRIAL_DAYS = 7;
const REPORTS = {
  marriage: { title: "Marriage & love report", price: 499, topic: "marriage", blurb: "When marriage is most likely, what your partner and married life look like, and how to strengthen it." },
  career: { title: "Career & business report", price: 499, topic: "career", blurb: "Your best career direction, promotion and job-change windows, and business potential." },
  money: { title: "Wealth & money report", price: 499, topic: "money", blurb: "Your wealth yogas, earning windows, risk periods and how to build lasting money." },
  year: { title: "2027 yearly forecast", price: 699, topic: null, blurb: "Month by month 2027: scores for career, love, money and health, key dasha shifts and best dates." },
};
const REPORT_PACK_PRICE = 999;

/* ---- free trial ---- */
const trialUsed = () => !!store.get("trialUsed", false);
function startTrial() {
  if (trialUsed()) return { ok: false, msg: "The free trial has already been used on this device." };
  store.set("trialUsed", true);
  store.set("plan", { id: "silver", expires: Date.now() + TRIAL_DAYS * 864e5, trial: true });
  return { ok: true, msg: `Your ${TRIAL_DAYS}-day Silver trial has started. Enjoy exact windows, power days and 100 questions per kundli.` };
}
const onTrial = () => { const s = store.get("plan", {}); return s.trial && s.expires > Date.now(); };
const trialEnded = () => { const s = store.get("plan", {}); return s.trial && s.expires <= Date.now(); };
function trialBtn(label = `Start free ${TRIAL_DAYS}-day trial`) { return trialUsed() ? "" : `<button class="btn sm" data-act="trial">${label}</button>`; }

/* ---- WOW-moment lock: the first full answer per kundli is free, later free answers hide exact dates ---- */
function isLocked(p) { return !!CFG.lockDates && planState().id === "free" && !!(store.get("freeFull", {})[p.id]); }
function markFreeFull(p) { if (planState().id !== "free") return; const f = store.get("freeFull", {}); f[p.id] = true; store.set("freeFull", f); }
function lockCard() {
  return `<div class="lock"><b>Your exact dates are ready.</b> Your strongest windows, peak Sukshma days and power days are calculated. Unlock them with Spatik Silver.<div class="row-actions">${trialBtn()}<button class="btn ghost sm" data-goto="plus">See plans</button></div></div>`;
}

/* ---- reports ---- */
const reportCredits = () => store.get("reportCredits", 0);
const reportOwned = (key, p) => curPlan() === PLANS.unlimited || !!(store.get("reportsOwned", {})[`${key}:${p.id}`]);
function unlockReport(key, p) {
  if (reportOwned(key, p)) return true;
  if (reportCredits() < 1) return false;
  store.set("reportCredits", reportCredits() - 1);
  const o = store.get("reportsOwned", {}); o[`${key}:${p.id}`] = true; store.set("reportsOwned", o);
  return true;
}
function stars(v) { const n = Math.max(1, Math.min(5, Math.round(v / 20))); return "★".repeat(n) + "☆".repeat(5 - n); }
function topicReport(key, c, p) {
  const R = REPORTS[key], topic = TOPICS.find(t => t.key === R.topic), sig = signature(c, p);
  const H = topic.houses[0], sign = (c.lagna.sign + H - 1) % 12, lord = A.SIGN_LORD[sign], lp = c.planets[lord];
  const d = dignity(c, lord), occ = A.PLANETS.filter(k => c.planets[k].house === H), ys = sig.ys.filter(y => y.topics.includes(topic.key));
  const wt = relWeights(c, topic), v = verdict(c, topic, "", whoWords(p, true));
  const J = nowJ(), wins10 = [], cur = A.currentDasha(c, J);
  for (const m of c.dasha) for (const ad of m.ads) {
    if (ad.end < J || ad.start > J + 10 * A.YEAR) continue;
    const sc = (wt[m.lord] || 0) + 1.5 * (wt[ad.lord] || 0);
    if (sc >= 3) wins10.push({ m: m.lord, a: ad.lord, s: Math.max(ad.start, J), e: ad.end, sc });
  }
  const pdw = windows(c, topic, 6, 3), pdays = powerDays(c, [lord, ...Object.keys(wt)], 5);
  const free = [
    { h: `${p.name}'s ${topic.label} signature`, b: `${hookLine(c, p, true, true, 0)}\n${p.name}'s Lagna is ${A.SIGNS[c.lagna.sign]}: ${sig.lagnaTrait}. The ${ord(H)} house of ${topic.label} falls in ${A.SIGNS[sign]}, ruled by ${lord}.` },
    { h: "The promise in the chart", b: `**Overall: ${v.label}** (${v.score}% favourable)\n${v.reasons.map(r => "- " + r).join("\n")}` },
  ];
  const locked = [
    { h: "Strengths to build on", b: [ys.length ? ys.map(y => `- **${y.name}**: ${y.text}`).join("\n") : `- ${sig.pp.text}.`, d === "exalted" || d === "own" ? `- ${lord}, ruler of this area, is ${d === "own" ? "in its own sign" : "exalted"}: a strong, stable promise.` : "", occ.length ? `- ${occ.join(" and ")} in the ${ord(H)} house colour${occ.length > 1 ? "" : "s"} this area directly.` : ""].filter(Boolean).join("\n") },
    { h: "Watch-outs", b: [[6, 8, 12].includes(lp.house) ? `- ${lord} sits in the ${ord(lp.house)} house: expect delays or competition, and plan with buffers.` : "", d === "debilitated" ? `- ${lord} is debilitated: success comes after persistence; avoid rushing decisions.` : "", c.planets.Saturn.house === H ? "- Saturn here asks for patience; results arrive later but last longer." : "", c.planets.Rahu.house === H ? "- Rahu here brings sudden changes; verify facts before big commitments." : "", "- Avoid major decisions during weak periods not listed in the timeline below."].filter(Boolean).join("\n") },
    { h: "10-year timeline (Mahadasha–Antardasha)", b: wins10.length ? wins10.slice(0, 8).map(w => `- **${fmtJ(w.s, deviceTz(), false)} – ${fmtJ(w.e, deviceTz(), false)}**: ${w.m}–${w.a}, ${w.sc >= 6 ? "very strong" : w.sc >= 4.5 ? "strong" : "supportive"}`).join("\n") : "No strongly linked periods in the next 10 years; results follow effort and transits." },
    { h: "Exact windows in the next 3 years", b: pdw.length ? pdw.map(w => `- **${fmtJ(w.start)} – ${fmtJ(w.end)}**: ${w.md}–${w.ad}–${w.pd}, ${strengthLabel(w.sc)}${w.peak ? `; peak days **${fmtJ(Math.max(w.peak.start, J))} – ${fmtJ(w.peak.end)}**` : ""}`).join("\n") : "No standout window in the next 3 years." },
    { h: "Right now", b: `Running ${cur.md.lord}–${cur.ad.lord}–${cur.pd.lord}–${cur.sd.lord}. Pratyantar until **${fmtJ(cur.pd.end)}**, Antardasha until **${fmtJ(cur.ad.end)}**. ${["md", "ad", "pd"].some(k => wt[cur[k].lord]) ? "The current period is linked to this area, so act now." : "The current period is a preparation phase for this area."}` },
    { h: "Power days in the next 30 days", b: pdays.map(x => `- **${x.label}** (${x.tara} Tara)`).join("\n") || "No standout days this month." },
    { h: "Your plan and remedies", b: `1. ${TIPS[topic.key]}\n2. Take key steps on **${LORD_DAY[lord]}s** and on the power days above.\n3. ${personalRemedy(lord)}\n4. Keep a short journal of results in each window; it helps you and your astrologer fine-tune timing.` },
  ];
  return { title: R.title, free, locked };
}
function yearReport(c, p, year = 2027) {
  const tz = deviceTz(), months = [];
  for (let m = 0; m < 12; m++) {
    const days = new Date(year, m + 1, 0).getDate(), acc = { overall: 0, love: 0, career: 0, money: 0, health: 0 }, best = [];
    for (let d = 1; d <= days; d++) {
      const ds = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, r = dailyFor(c, ds, tz);
      for (const k in acc) acc[k] += r.s[k];
      best.push({ d, v: r.s.overall });
    }
    for (const k in acc) acc[k] /= days;
    const J = A.jdLocal(`${year}-${String(m + 1).padStart(2, "0")}-15`, "12:00", tz), cd = A.currentDasha(c, J), tr = A.transits(J);
    const tj = ((tr.Jupiter.sign - c.moonSign + 12) % 12) + 1, sat = saturnStatus(c, tr);
    months.push({ m, acc, best: best.sort((a, b) => b.v - a.v).slice(0, 3).map(x => x.d).sort((a, b) => a - b), cd, tj, sat });
  }
  const top = [...months].sort((a, b) => b.acc.overall - a.acc.overall);
  const MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const line = x => `**${MN[x.m]}** ${stars(x.acc.overall)}  \nCareer ${stars(x.acc.career)} · Love ${stars(x.acc.love)} · Money ${stars(x.acc.money)} · Health ${stars(x.acc.health)}  \nPeriod: ${x.cd.md.lord}–${x.cd.ad.lord}–${x.cd.pd.lord}. Jupiter ${ord(x.tj)} from Moon${[2, 5, 7, 9, 11].includes(x.tj) ? " (supportive)" : ""}. Best dates: ${x.best.map(d => `${d} ${MN[x.m].slice(0, 3)}`).join(", ")}.`;
  const free = [
    { h: `${p.name}'s ${year} at a glance`, b: `${hookLine(c, p, true, true, 0)}\nYour strongest months in ${year}: **${top.slice(0, 3).map(x => MN[x.m]).sort((a, b) => MN.indexOf(a) - MN.indexOf(b)).join(", ")}**. Go gently in **${top.slice(-2).map(x => x.m).sort((a, b) => a - b).map(m => MN[m]).join(" and ")}**.` },
    { h: MN[0], b: line(months[0]) },
  ];
  const locked = [
    { h: "Month by month", b: months.slice(1).map(line).join("\n\n") },
    { h: "Big shifts this year", b: (() => { const out = []; let prev = null; for (const x of months) { const k = `${x.cd.md.lord}-${x.cd.ad.lord}`; if (k !== prev && prev) out.push(`- ${MN[x.m]}: Antardasha moves to **${x.cd.ad.lord}** (${lordRole(c, x.cd.ad.lord)})`); prev = k; } const s0 = months[0].sat.tag, s1 = months[11].sat.tag; if (s0 !== s1) out.push(`- Saturn status changes during the year: ${s0} to ${s1}.`); return out.join("\n") || "- A steady year with no Antardasha change: build consistently."; })() },
    { h: "Your plan for the year", b: `1. Schedule launches, interviews and proposals in your top months.\n2. Use the best dates listed for each month for important first steps.\n3. ${personalRemedy(months[0].cd.ad.lord)}` },
  ];
  return { title: `${year} yearly forecast`, free, locked };
}
function buildReport(key, p) {
  const c = chartOf(p);
  return key === "year" ? yearReport(c, p) : topicReport(key, c, p);
}
function reportsCard(p) {
  const owned = k => reportOwned(k, p);
  return `<section class="card span2">
    <div class="card-head"><h2>Detailed reports <span class="hi" lang="hi">विस्तृत रिपोर्ट</span></h2><span class="pill good">${curPlan() === PLANS.unlimited ? "All included in Unlimited" : `${reportCredits()} report credit${reportCredits() === 1 ? "" : "s"}`}</span></div>
    <div class="rgrid">${Object.entries(REPORTS).map(([k, R]) => `<button class="rtile" data-report="${k}"><b>${R.title}</b><span>${R.blurb}</span><span class="rprice">${owned(k) ? "Unlocked · open" : `₹${R.price} · free preview`}</span></button>`).join("")}</div>
    <p class="note">Every report is calculated from ${esc(p.name)}'s own chart. All four together: ₹${REPORT_PACK_PRICE}.</p>
  </section>`;
}
function openReport(key) {
  const p = prof(), rep = buildReport(key, p), own = reportOwned(key, p), R = REPORTS[key];
  const sec = s => `<section class="rsec"><h3>${s.h}</h3>${md(s.b)}</section>`;
  const canPrint = (() => { try { return window.self === window.top; } catch (e) { return false; } })();
  $("#modal").innerHTML = `<div class="sheet report" role="dialog" aria-modal="true" aria-labelledby="rtitle">
    <div class="card-head"><h2 id="rtitle">${rep.title}</h2><button class="btn ghost sm" data-act="close">Close</button></div>
    <p class="muted">For ${esc(p.name)} · ${fmtDateStr(p.date)} · ${esc(p.place || "")}</p>
    ${rep.free.map(sec).join("")}
    ${own ? rep.locked.map(sec).join("") : `<div class="rlocked">${rep.locked.slice(0, 2).map(sec).join("")}</div>
      <div class="lock"><b>${rep.locked.length} more sections are ready</b>, including your exact windows${key === "year" ? " for every month" : ""}, power days and personal plan.
      <div class="row-actions">${reportCredits() > 0 ? `<button class="btn sm" data-act="report-unlock" data-key="${key}">Use 1 report credit</button>` : `${buyBtn("report", `Buy this report · ₹${R.price}`, true)}${buyBtn("reportpack", `All 4 reports · ₹${REPORT_PACK_PRICE}`, false)}`}</div>
      <p class="note">After payment, enter your code in the Plus tab, then open the report again.</p></div>`}
    ${own ? `<div class="row-actions"><button class="btn sm" data-act="copy-report" data-key="${key}">Copy report text</button>${canPrint ? `<button class="btn ghost sm" data-act="print-report">Print or save as PDF</button>` : ""}<span class="copied" id="copied-rep" role="status"></span></div>` : ""}
    <p class="note">Astrology offers guidance for reflection, not certainty. For health, legal or money decisions, consult a qualified professional.</p>
  </div>`;
  $("#modal").hidden = false;
}
function reportText(key) {
  const p = prof(), rep = buildReport(key, p);
  return `${rep.title} for ${p.name}\n\n` + [...rep.free, ...rep.locked].map(s => `${s.h.toUpperCase()}\n${s.b.replace(/\*\*/g, "")}`).join("\n\n") + `\n\nSpatik Astro`;
}

/* ---- referrals ---- */
function deviceId() { let d = store.get("device", ""); if (!d) { d = Math.random().toString(36).slice(2, 10); store.set("device", d); } return d; }
const myRefCode = () => "TAARA-" + (hash("ref" + deviceId()) % 1679616).toString(36).toUpperCase().padStart(4, "0");
function inviteText() { return `I use Spatik Astro for my Kundli: it gives exact dasha dates, power days and answers in ${LANGS.length - 2} Indian languages. Try it free, with a ${TRIAL_DAYS}-day free trial: ${location.href.split("#")[0]}#ref-${myRefCode().slice(6).toLowerCase()}\nMy invite code: ${myRefCode()}`; }
function referralCard() {
  return `<section class="card">
    <h2>Invite friends, earn free months</h2>
    <p>Your code: <b class="code">${myRefCode()}</b></p>
    <p class="muted">Share your link. Your friend gets a ${TRIAL_DAYS}-day free trial. When they subscribe and mention your code, you get <b>1 month free</b>.</p>
    <div class="row-actions"><button class="btn" data-act="share-invite">Copy invite message</button><span class="copied" id="copied-inv" role="status"></span></div>
  </section>`;
}
function invitedBanner() {
  const by = store.get("invitedBy", "");
  if (!by || store.get("inviteSeen", false) || trialUsed()) return "";
  return `<div class="banner"><div><strong>A friend invited you to Spatik Astro.</strong> Start your free ${TRIAL_DAYS}-day Silver trial: exact dates, power days and 100 questions per kundli.</div><div class="row-actions">${trialBtn()}<button class="btn ghost sm" data-act="invite-dismiss">Later</button></div></div>`;
}

/* ---- "coming up for you" alerts ---- */
function upcomingCard(c, p) {
  const J = nowJ(), cur = A.currentDasha(c, J), items = [];
  const nextPd = A.subPeriods(cur.ad).find(x => x.start > J);
  if (cur.pd.end - J < 45) items.push(`<li><span class="pill warn">${fmtJ(cur.pd.end, deviceTz())}</span> Your Pratyantar shifts from <b>${cur.pd.lord}</b> to <b>${nextPd ? nextPd.lord : "a new cycle"}</b>. ${nextPd ? `${nextPd.lord} brings ${HOUSE_THEME[c.planets[nextPd.lord].house]}.` : ""}</li>`);
  if (cur.ad.end - J < 120) items.push(`<li><span class="pill warn">${fmtJ(cur.ad.end, deviceTz())}</span> A new Antardasha begins: a fresh chapter for the next ${Math.round(((cur.md.ads[cur.md.ads.indexOf(cur.ad) + 1] || cur.ad).end - (cur.md.ads[cur.md.ads.indexOf(cur.ad) + 1] || cur.ad).start) / 30.44)} months.</li>`);
  items.push(`<li><span class="pill good">${fmtJ(cur.sd.end, deviceTz())}</span> Current Sukshma of <b>${cur.sd.lord}</b> ends; ${cur.sd.lord} favours ${HOUSE_THEME[c.planets[cur.sd.lord].house]} until then.</li>`);
  const pd = powerDays(c, [cur.md.lord, cur.ad.lord, cur.pd.lord], 3);
  const locked = isLocked(p) && planState().id === "free";
  return `<section class="card">
    <h2>Coming up for you</h2>
    <ul class="transits">${items.join("")}</ul>
    <p><b>Power days this month:</b> ${locked ? `<span class="muted">unlock with Silver</span> ${trialBtn("Try free")}` : pd.map(x => x.label).join(" · ")}</p>
    ${locked ? "" : `<div class="row-actions"><button class="btn ghost sm" data-act="share-power">Copy my power days</button><span class="copied" id="copied-pow" role="status"></span></div>`}
  </section>`;
}
