/* ===== Place of birth picker =====
   Two tabs. India: State -> District -> City / town / village. Outside India: Country -> State / province -> City.
   Every value comes from a list. Each list is a searchable dropdown (ARIA 1.2 combobox + listbox): type to filter,
   Arrow keys / Page keys / Home / End to move, Enter to choose, Escape to close; touch or click to choose.
   "My place isn't listed": choose the nearest listed place, or enter exact latitude and longitude.
   Used by the profile form (f), the other-person form in Ask (o), Match (b, g) and profile edit (f). */
const PICK = {};
const COMBO = {};
const MAX_OPTS = 80;

/* ---------- generic searchable dropdown ---------- */
function comboHTML(id, label, ph) {
  return `<div class="combo" id="${id}-wrap">
    <label for="${id}" id="${id}-lbl">${label}</label>
    <div class="cbox"><input id="${id}" class="cinput" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list" aria-describedby="${id}-hint" autocomplete="off" autocapitalize="words" spellcheck="false" placeholder="${esc(ph)}" data-combo="${id}">
    <button type="button" class="cbtn" tabindex="-1" aria-label="Show the ${esc(label.toLowerCase())} list" data-combo-toggle="${id}"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
    <ul id="${id}-list" class="clist" role="listbox" aria-labelledby="${id}-lbl" hidden></ul></div>
    <p class="chint" id="${id}-hint" aria-live="polite"></p>
  </div>`;
}
const cEl = id => document.getElementById(id);
/* a place found by another of its names shows that name too: "Old Goa (Goa Velha)", "Udhagamandalam (Ootacamund)" */
function placeLabel(r, q) {
  const nq = norm(q || ""); if (nq.length < 3 || norm(r.n).includes(nq)) return r.n;
  const a = (r.alts || []).find(x => /[a-z]/i.test(x) && norm(x).includes(nq));
  return a ? `${r.n} (${a})` : r.n;
}
function comboSet(id, cfg) { COMBO[id] = Object.assign({}, cfg, { active: -1, items: [], open: false }); comboSync(id); }
/* show the chosen value (or nothing) in the input; never keep typed text that was not chosen */
function comboSync(id) {
  const c = COMBO[id], el = cEl(id); if (!c || !el) return;
  el.disabled = !!c.disabled;
  el.placeholder = c.disabled ? (c.disabledText || "") : (c.ph || "");
  el.value = c.selected ? c.text(c.selected) : "";
  el.classList.toggle("chosen", !!c.selected);
  const h = cEl(id + "-hint"); if (h && !c.open) h.textContent = c.hint || "";
}
function comboOpen(id, q) {
  const c = COMBO[id], el = cEl(id), ul = cEl(id + "-list"); if (!c || !el || !ul || c.disabled) return;
  c.q = q || "";
  const res = c.search(q == null ? "" : q);
  const done = r => {
    if (!cEl(id) || COMBO[id] !== c) return;
    const items = (r && r.list) || [];
    c.items = items; c.open = true;
    const selKey = c.selected ? c.key(c.selected) : null;
    let act = items.findIndex(x => selKey != null && c.key(x) === selKey);
    if (q) act = items.length ? 0 : -1;
    c.active = act;
    ul.innerHTML = items.length ? items.map((x, i) => `<li role="option" id="${id}-o${i}" data-opt="${i}" aria-selected="${i === act}"${i === act ? ' class="act"' : ""}><span class="otext">${esc(c.label ? c.label(x, c.q) : c.text(x))}</span>${c.sub && c.sub(x) ? `<span class="osub">${esc(c.sub(x))}</span>` : ""}</li>`).join("")
      : `<li class="none" role="option" aria-disabled="true" id="${id}-none">${esc(c.empty ? c.empty(q) : "No match")}</li>`;
    ul.hidden = false; el.setAttribute("aria-expanded", "true");
    if (act >= 0) { el.setAttribute("aria-activedescendant", `${id}-o${act}`); const li = cEl(`${id}-o${act}`); if (li) li.scrollIntoView({ block: "nearest" }); } else el.removeAttribute("aria-activedescendant");
    const total = (r && r.total) || 0, h = cEl(id + "-hint");
    if (h) h.textContent = total > items.length ? `Showing ${items.length} of ${total.toLocaleString("en-IN")}. Type more letters to narrow the list.` : items.length ? `${items.length} ${items.length === 1 ? "match" : "matches"}. Use the arrow keys or tap to choose.` : "";
  };
  if (res && typeof res.then === "function") { ul.innerHTML = `<li class="none" role="option" aria-disabled="true">Loading…</li>`; ul.hidden = false; el.setAttribute("aria-expanded", "true"); c.open = true; res.then(done); }
  else done(res);
}
function comboClose(id, restore = true) {
  const c = COMBO[id], el = cEl(id), ul = cEl(id + "-list"); if (!c) return;
  c.open = false; c.active = -1;
  if (ul) { ul.hidden = true; ul.innerHTML = ""; }
  if (el) { el.setAttribute("aria-expanded", "false"); el.removeAttribute("aria-activedescendant"); }
  if (restore) comboSync(id);
}
function comboMove(id, to) {
  const c = COMBO[id]; if (!c || !c.items.length) return;
  const n = c.items.length, i = Math.max(0, Math.min(n - 1, to));
  const old = cEl(`${id}-o${c.active}`); if (old) { old.classList.remove("act"); old.setAttribute("aria-selected", "false"); }
  c.active = i;
  const li = cEl(`${id}-o${i}`); if (li) { li.classList.add("act"); li.setAttribute("aria-selected", "true"); li.scrollIntoView({ block: "nearest" }); }
  cEl(id).setAttribute("aria-activedescendant", `${id}-o${i}`);
}
function comboChoose(id, i) {
  const c = COMBO[id]; if (!c || !c.items[i]) return;
  const it = c.items[i];
  comboClose(id, false);
  c.onPick(it);
}
let QUIET_FOCUS = "";   // set when the app moves focus to the next box: that box opens on typing, a tap or ArrowDown, not by itself
document.addEventListener("focusin", e => { const id = e.target.dataset && e.target.dataset.combo; if (!id || !COMBO[id] || COMBO[id].open) return; if (QUIET_FOCUS === id) { QUIET_FOCUS = ""; return; } try { e.target.select(); } catch (x) {} comboOpen(id, ""); });
document.addEventListener("pointerup", e => { const el = e.target.closest && e.target.closest("[data-combo]"); if (el && COMBO[el.dataset.combo] && !COMBO[el.dataset.combo].open && document.activeElement === el) comboOpen(el.dataset.combo, ""); });
document.addEventListener("input", e => { const id = e.target.dataset && e.target.dataset.combo; if (id && COMBO[id]) comboOpen(id, e.target.value); });
document.addEventListener("focusout", e => {
  const id = e.target.dataset && e.target.dataset.combo; if (!id || !COMBO[id]) return;
  setTimeout(() => { const a = document.activeElement; if (a && (a.id === id)) return; if (COMBO[id] && COMBO[id].open) comboClose(id); }, 150);
});
document.addEventListener("keydown", e => {
  const id = e.target.dataset && e.target.dataset.combo; if (!id || !COMBO[id]) return;
  const c = COMBO[id];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (!c.open) { comboOpen(id, ""); return; }
    if (e.altKey && e.key === "ArrowUp") { comboClose(id); return; }
    comboMove(id, c.active + (e.key === "ArrowDown" ? 1 : -1));
  } else if (e.key === "PageDown" || e.key === "PageUp") { if (c.open) { e.preventDefault(); comboMove(id, c.active + (e.key === "PageDown" ? 10 : -10)); } }
  else if ((e.key === "Home" || e.key === "End") && c.open && (e.ctrlKey || !e.target.value)) { e.preventDefault(); comboMove(id, e.key === "Home" ? 0 : c.items.length - 1); }
  else if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (c.open && c.active >= 0) comboChoose(id, c.active); else if (!c.open) comboOpen(id, ""); }
  else if (e.key === "Escape") { if (c.open) { e.preventDefault(); e.stopPropagation(); comboClose(id); } }
}, true);
/* pointerdown keeps the focus in the input so the list does not close before the tap is handled */
document.addEventListener("pointerdown", e => { const li = e.target.closest && e.target.closest(".clist li, .cbtn"); if (li) e.preventDefault(); });
document.addEventListener("mousedown", e => { const li = e.target.closest && e.target.closest(".clist li, .cbtn"); if (li) e.preventDefault(); });
document.addEventListener("click", e => {
  const li = e.target.closest && e.target.closest(".clist li[data-opt]");
  if (li) { const id = li.parentElement.id.replace(/-list$/, ""); comboChoose(id, +li.dataset.opt); return; }
  const tg = e.target.closest && e.target.closest("[data-combo-toggle]");
  if (tg) { const id = tg.dataset.comboToggle, c = COMBO[id]; if (!c || c.disabled) return; if (c.open) comboClose(id); else { cEl(id).focus(); comboOpen(id, ""); } }
});

/* ---------- the place picker ---------- */
function newPick(px) {
  return { px, tab: "in", st: "", di: null, row: null, cc: "", si: null, wrow: null, mode: "list", nearName: "", clat: "", clon: "", ctz: "", orig: null, touched: false, key: "", err: "" };
}
function placeFields(px, pre) {
  pre = pre || {};
  const k = JSON.stringify([pre.id || "", pre.city || "", pre.state || "", pre.country || "", pre.lat ?? "", pre.lon ?? ""]);
  if (!PICK[px] || PICK[px].key !== k || !PICK[px].keep) { PICK[px] = newPick(px); PICK[px].key = k; PICK[px].pre = pre; PICK[px].fresh = true; }
  Promise.resolve().then(() => mountPicker(px));
  const P = PICK[px], inTab = P.tab === "in";
  return `<div class="placebox" id="${px}-placebox" data-px="${px}">
    <span class="lbl" id="${px}-plabel">Place of birth</span>
    <div class="ptabs" role="tablist" aria-labelledby="${px}-plabel">
      <button type="button" role="tab" id="${px}-tab-in" aria-controls="${px}-panel-in" aria-selected="${inTab}" tabindex="${inTab ? 0 : -1}" data-ptab="in" data-px="${px}">India</button>
      <button type="button" role="tab" id="${px}-tab-w" aria-controls="${px}-panel-w" aria-selected="${!inTab}" tabindex="${inTab ? -1 : 0}" data-ptab="w" data-px="${px}">Outside India</button>
    </div>
    <div class="ppanel" role="tabpanel" id="${px}-panel-in" aria-labelledby="${px}-tab-in"${inTab ? "" : " hidden"}>
      ${comboHTML(px + "-ist", "State / Union Territory", "Search or choose your state")}
      ${comboHTML(px + "-idist", "District", "Choose a district")}
      ${comboHTML(px + "-iplace", "City / town / village", "Choose a place")}
    </div>
    <div class="ppanel" role="tabpanel" id="${px}-panel-w" aria-labelledby="${px}-tab-w"${inTab ? " hidden" : ""}>
      ${comboHTML(px + "-wc", "Country", "Search or choose a country")}
      ${comboHTML(px + "-wst", "State / province", "Choose a state or province")}
      ${comboHTML(px + "-wcity", "City", "Choose a city")}
    </div>
    <button type="button" class="linkbtn" data-act="notlisted" data-px="${px}" aria-expanded="false" aria-controls="${px}-nl" id="${px}-nlbtn">My place isn't listed</button>
    <div class="nlbox" id="${px}-nl" hidden>
      <fieldset class="nlmodes"><legend>If your village or town is not in the list</legend>
        <label class="check"><input type="radio" name="${px}-nlmode" id="${px}-nlnear" value="near" data-px="${px}"> Use the nearest listed place</label>
        <label class="check"><input type="radio" name="${px}-nlmode" id="${px}-nlcoords" value="coords" data-px="${px}"> Enter the exact latitude and longitude</label>
      </fieldset>
      <div id="${px}-nlname-wrap"><label for="${px}-nlname">Name of your village or town (optional)</label><input id="${px}-nlname" data-px="${px}" autocomplete="off" placeholder="e.g. Kothapalli"></div>
      <p class="note" id="${px}-nlnear-note">Choose the listed place nearest to it above, in the same district. The chart uses that place's coordinates.</p>
      <div class="three" id="${px}-nlcoords-box" hidden>
        <div><label for="${px}-clat">Latitude (°N +, °S −)</label><input id="${px}-clat" type="number" inputmode="decimal" step="0.0001" min="-90" max="90" data-px="${px}" placeholder="30.1450"></div>
        <div><label for="${px}-clon">Longitude (°E +, °W −)</label><input id="${px}-clon" type="number" inputmode="decimal" step="0.0001" min="-180" max="180" data-px="${px}" placeholder="74.1993"></div>
        <div><label for="${px}-ctz">UTC offset (optional)</label><input id="${px}-ctz" type="number" step="0.25" min="-12" max="14" data-px="${px}" placeholder="auto"></div>
      </div>
      <p class="note" id="${px}-nlcoords-note" hidden>Find them on any map app: press and hold your birth place. Leave the UTC offset empty to use the time zone of the state or country you chose, worked out for the birth date (with daylight saving and historical changes).</p>
    </div>
    <p class="psum" id="${px}-pnote" role="status" aria-live="polite"></p>
    <input type="hidden" id="${px}-country"><input type="hidden" id="${px}-state"><input type="hidden" id="${px}-district"><input type="hidden" id="${px}-city">
    <input type="hidden" id="${px}-lat"><input type="hidden" id="${px}-lon"><input type="hidden" id="${px}-tz"><input type="hidden" id="${px}-iana"><input type="hidden" id="${px}-pok">
  </div>`;
}
function resetPicker(px) { delete PICK[px]; }
/* wire the combos to this picker's state and restore what was chosen */
function mountPicker(px) {
  const P = PICK[px]; if (!P || !cEl(px + "-placebox")) return;
  P.keep = true;
  const ist = px + "-ist", idist = px + "-idist", ipl = px + "-iplace", wc = px + "-wc", wst = px + "-wst", wcity = px + "-wcity";
  const sv = x => typeof x === "string" ? x : x.value;
  comboSet(ist, { ph: "Search or choose your state", text: sv, key: sv, sub: x => IN_STATE_HI[sv(x)] || "", search: q => searchStates(q), onPick: it => pickInState(px, it.value || it) });
  comboSet(idist, { ph: "Search or choose a district", disabledText: "Choose the state first", text: x => x.kind === "place" ? x.row.n : IN_BY_STATE[P.st][2][x.value], key: x => x.kind === "place" ? "p" + x.row.i : "d" + x.value,
    sub: x => x.kind === "place" ? `in ${IN_BY_STATE[P.st][2][x.value]} district${x.row.pin ? " · PIN " + x.row.pin : ""}` : "",
    search: q => { const d = IN_DATA[P.st]; return d || !q ? searchDistricts(P.st, q, d) : loadIndiaState(P.st).then(dd => searchDistricts(P.st, q, dd)); },
    empty: q => q ? `No district matches “${q}”. Check the spelling or choose from the list.` : "No districts",
    onPick: it => { pickInDistrict(px, it.value); if (it.kind === "place") pickInPlace(px, it.row); } });
  comboSet(ipl, { ph: "Search your city, town or village", disabledText: "Choose the district first", text: r => r.n, key: r => r.i, label: (r, q) => placeLabel(r, q),
    sub: r => [r.rank <= 1 ? "town" : "", r.pin ? "PIN " + r.pin : "", r.approx ? "approx. location" : ""].filter(Boolean).join(" · "),
    search: q => loadIndiaState(P.st).then(d => d ? searchIndiaPlaces(d, P.di, q) : { list: [], total: 0 }),
    empty: q => q ? `“${q}” is not in the ${IN_BY_STATE[P.st] && P.di != null ? IN_BY_STATE[P.st][2][P.di] : ""} district list. Check the district, try another spelling, or use “My place isn't listed”.` : "Loading places…",
    onPick: r => pickInPlace(px, r) });
  comboSet(wc, { ph: "Search or choose a country", text: x => x.kind === "city" ? x.big.n : COUNTRY_OF[x.value][1], key: x => x.kind === "city" ? "c" + x.big.i : x.value,
    sub: x => x.kind === "city" ? `${x.big.st ? x.big.st + ", " : ""}${x.big.country}` : "",
    search: q => { const r = searchCountries(q), Q = prepQuery(q); if (Q.n.length < 3) return r; const need = (r.best || 0) >= 85 ? 85 : 52; return loadBig().then(b => { if (!b) return r; const t = rankItems(b.map(x => withKeys(x, x.n, x.alts)), Q, 8); const extra = t.list.filter(x => x.cc !== "IN" && COUNTRY_OF[x.cc] && matchScore(x.K, Q) >= need).map(x => ({ kind: "city", value: x.cc, big: x, label: x.n, rank: 1 })); return { list: r.list.concat(extra), total: r.total + extra.length }; }); },
    empty: q => `No country matches “${q}”.`, onPick: it => it.kind === "city" ? pickWorldBig(px, it.big) : pickWCountry(px, it.value) });
  comboSet(wst, { ph: "Search or choose a state or province", disabledText: "Choose the country first", text: x => x.kind === "place" ? x.row.n : wStateName(P, x.value), key: x => x.kind === "place" ? "p" + x.row.i : "s" + x.value,
    sub: x => x.kind === "place" ? `in ${wStateName(P, x.value)}` : (x.count === 0 ? "no cities listed" : ""),
    search: q => loadCountry(P.cc).then(d => d ? searchWorldStatesAll(d, q) : { list: [], total: 0 }),
    empty: q => q ? `No state or province matches “${q}”.` : "No states", onPick: it => { pickWState(px, it.value); if (it.kind === "place") pickWCity(px, it.row); } });
  comboSet(wcity, { ph: "Search your city", disabledText: "Choose the state or province first", text: r => r.n, key: r => r.i, sub: r => r.alts && r.alts.length ? r.alts.slice(0, 2).join(", ") : "",
    search: q => wCities(P).then(list => list ? searchWorldCities(list, q) : { list: [], total: 0 }),
    empty: q => q ? `“${q}” is not in this list. Try another spelling, or use “My place isn't listed”.` : "No cities are listed for this state. Use “My place isn't listed”.",
    onPick: r => pickWCity(px, r) });
  if (P.fresh) { P.fresh = false; return applyPre(px, P.pre || {}); }
  refreshPicker(px);
}
const wStateName = (P, si) => si === -1 ? "Other places" : ((W_DATA[P.cc] && W_DATA[P.cc].states[si]) || "");
function searchWorldStatesAll(d, q) {
  const r = searchWorldStates(d, q);
  if (d.noState && d.noState.length && !prepQuery(q).n) r.list.push({ value: -1, kind: "state", rank: 2, label: "Other places", count: d.noState.length });
  if (!d.states.length && d.noState && d.noState.length) return { list: [{ value: -1, kind: "state", label: "Other places", count: d.noState.length }], total: 1 };
  return r;
}
function wCities(P) {
  if (P.si === -1) return loadCountry(P.cc).then(d => d ? d.noState || [] : []);
  return loadWorldState(P.cc, P.si);
}
/* fill the picker from a saved profile (edit, Match "fill from saved", or a re-render) */
function applyPre(px, pre) {
  const P = PICK[px];
  const hasC = pre.lat !== undefined && pre.lat !== "" && pre.lat !== null && !isNaN(+pre.lat) && !isNaN(+pre.lon);
  if (hasC) P.orig = { lat: +pre.lat, lon: +pre.lon, tz: +pre.tz, iana: pre.iana || "", city: pre.city || "", state: pre.state || "", district: pre.district || "", country: pre.country || "", nearName: pre.bornIn || "" };
  let country = pre.country || "", city = pre.city || "", st = pre.state || "";
  if (!country && pre.place) { const L = resolveLegacyPlace(pre.place); if (L) { country = "India"; city = L.city; st = L.state; } }
  if (!country) { refreshPicker(px); return; }
  if (country === "India") {
    P.tab = "in"; const s = canonInState(st); if (!s) { refreshPicker(px); return; }
    P.st = s; refreshPicker(px);
    loadIndiaState(s).then(d => {
      if (!d || PICK[px] !== P) return;
      let rows = d.rows;
      if (pre.district) { const di = d.districts.findIndex(x => norm(x.n) === norm(pre.district) || x.alts.some(a => norm(a) === norm(pre.district))); if (di >= 0) rows = d.districts[di].rows; }
      const n = norm(city);
      let cand = rows.filter(r => norm(r.n) === n || r.alts.some(a => norm(a) === n));
      if (!cand.length && rows !== d.rows) cand = d.rows.filter(r => norm(r.n) === n || r.alts.some(a => norm(a) === n));
      let best = null;
      if (cand.length) best = hasC ? cand.map(r => [kmBetween(+pre.lat, +pre.lon, r.lat, r.lon), r]).sort((a, b) => a[0] - b[0])[0] : [0, cand.sort((a, b) => a.rank - b.rank)[0]];
      if (best && best[0] <= 25) { P.di = best[1].di; P.row = best[1]; if (pre.bornIn) { P.mode = "near"; P.nearName = pre.bornIn; } }
      else if (hasC) {   // saved coordinates do not match a listed place: keep them exactly (coordinates mode)
        const nr = nearestRow(d.rows, +pre.lat, +pre.lon);
        if (nr && nr.km < 150) P.di = nr.row.di;
        P.mode = "coords"; P.clat = String(+pre.lat); P.clon = String(+pre.lon); P.nearName = pre.bornIn || city; if (!pre.iana && !isNaN(+pre.tz)) P.ctz = String(+pre.tz);
      }
      refreshPicker(px);
    });
    return;
  }
  P.tab = "w"; const cc = CC_OF[country] || (WORLD_COUNTRIES.find(w => norm(w[1]) === norm(country) || w[3].some(a => norm(a) === norm(country))) || [])[0];
  if (!cc) { if (hasC) { P.mode = "coords"; P.clat = String(+pre.lat); P.clon = String(+pre.lon); P.ctz = isNaN(+pre.tz) ? "" : String(+pre.tz); P.nearName = city; } refreshPicker(px); return; }
  P.cc = cc; refreshPicker(px);
  loadCountry(cc).then(d => {
    if (!d || PICK[px] !== P) return;
    const si = d.states.findIndex(s => norm(s) === norm(st));
    const finish = list => {
      if (PICK[px] !== P) return;
      const n = norm(city);
      const cand = (list || []).filter(r => norm(r.n) === n || r.alts.some(a => norm(a) === n));
      const best = cand.length ? (hasC ? cand.map(r => [kmBetween(+pre.lat, +pre.lon, r.lat, r.lon), r]).sort((a, b) => a[0] - b[0])[0] : [0, cand[0]]) : null;
      if (best && best[0] <= 25) { P.si = best[1].si; P.wrow = best[1]; if (pre.bornIn) { P.mode = "near"; P.nearName = pre.bornIn; } }
      else if (hasC) { if (si >= 0) P.si = si; P.mode = "coords"; P.clat = String(+pre.lat); P.clon = String(+pre.lon); P.nearName = pre.bornIn || city; if (!pre.iana && !isNaN(+pre.tz)) P.ctz = String(+pre.tz); }
      refreshPicker(px);
    };
    if (!d.split) finish(d.cities);
    else if (si >= 0) loadWorldState(cc, si).then(finish);
    else finish([]);
  });
}
function touch(px) { const P = PICK[px]; if (P) { P.touched = true; P.err = ""; } }
function pickInState(px, s) {
  const P = PICK[px]; touch(px);
  if (P.st !== s) { P.st = s; P.di = null; P.row = null; }
  refreshPicker(px); loadIndiaState(s).then(() => refreshPicker(px));
  focusNext(px + "-idist");
}
function pickInDistrict(px, di) { const P = PICK[px]; touch(px); if (P.di !== di) { P.di = di; P.row = null; } refreshPicker(px); focusNext(px + "-iplace"); }
function pickInPlace(px, r) { const P = PICK[px]; touch(px); P.di = r.di; P.row = r; if (P.mode === "coords") P.mode = "list"; refreshPicker(px); }
function pickWCountry(px, cc) {
  const P = PICK[px]; touch(px);
  if (P.cc !== cc) { P.cc = cc; P.si = null; P.wrow = null; }
  refreshPicker(px);
  loadCountry(cc).then(d => {
    if (PICK[px] !== P) return;
    if (d && !d.states.length) P.si = -1;
    else if (d && d.states.length === 1 && P.si == null) return pickWState(px, 0);
    refreshPicker(px); if (d && !d.states.length) focusNext(px + "-wcity");
  });
  focusNext(px + "-wst");
}
function pickWState(px, si) {
  const P = PICK[px]; touch(px); if (P.si !== si) { P.si = si; P.wrow = null; } refreshPicker(px); focusNext(px + "-wcity");
  wCities(P).then(l => { if (PICK[px] === P && P.si === si && !P.wrow && l && l.length === 1) pickWCity(px, l[0]); });   // a one-city state
}
function pickWCity(px, r) { const P = PICK[px]; touch(px); P.si = r.si; P.wrow = r; if (P.mode === "coords") P.mode = "list"; refreshPicker(px); }
/* a big city typed in the Country box: set country, state and city in one go */
function pickWorldBig(px, b) {
  const P = PICK[px]; touch(px); P.cc = b.cc; P.si = null; P.wrow = null; refreshPicker(px);
  loadCountry(b.cc).then(d => {
    if (!d || PICK[px] !== P) return;
    const si = d.states.findIndex(s => s === b.st);
    const fin = list => { const r = (list || []).find(c => c.n === b.n) || (list || []).find(c => norm(c.n) === norm(b.n)); if (r) { P.si = r.si; P.wrow = r; } else if (si >= 0) P.si = si; refreshPicker(px); };
    if (!d.split) fin(d.cities); else if (si >= 0) loadWorldState(b.cc, si).then(fin); else fin([]);
  });
}
function focusNext(id) { setTimeout(() => { const el = cEl(id); if (el && !el.disabled && document.activeElement && document.activeElement.closest && document.activeElement.closest(".placebox")) { QUIET_FOCUS = id; el.focus(); } }, 0); }

/* what the picker currently resolves to: {ok, lat, lon, iana, tz, city, district, state, country, label, mode, nearName} */
function pickResult(px) {
  const P = PICK[px]; if (!P) return { ok: false };
  const date = (cEl(px + "-date") || {}).value || "", time = typeof readTime === "function" && cEl(px + "-hh") ? readTime(px) : "";
  const tzOf = (iana, fb) => { const t = iana ? tzOffset(iana, date, time) : NaN; return isNaN(t) ? fb : t; };
  if (!P.touched && P.orig && P.mode !== "coords") {   // unchanged saved place: keep its exact coordinates
    const o = P.orig, sel = P.tab === "in" ? P.row : P.wrow;
    if (sel || P.tab === "in" && P.st || P.cc) {
      const st = P.tab === "in" ? P.st : (W_DATA[P.cc] ? wStateName(P, P.si) : o.state);
      return { ok: true, lat: o.lat, lon: o.lon, iana: o.iana, tz: tzOf(o.iana, o.tz), city: sel ? sel.n : o.city, district: P.tab === "in" && P.di != null ? IN_BY_STATE[P.st][2][P.di] : o.district, state: st || o.state, country: P.tab === "in" ? "India" : (COUNTRY_OF[P.cc] || [])[1] || o.country, mode: P.mode, nearName: P.mode === "near" ? P.nearName : "" };
    }
  }
  if (P.tab === "in") {
    const dname = P.st && P.di != null ? IN_BY_STATE[P.st][2][P.di] : "";
    if (P.mode === "coords") {
      const lat = parseFloat(P.clat), lon = parseFloat(P.clon), ctz = parseFloat(P.ctz);
      if (!P.st) return { ok: false, why: "Choose the state first, then enter the coordinates." };
      if (isNaN(lat) || isNaN(lon)) return { ok: false, why: "Enter both latitude and longitude, for example 30.1450 and 74.1993." };
      if (lat < 6 || lat > 37.5 || lon < 68 || lon > 97.6) return { ok: false, why: "These coordinates are outside India. Check them, or choose “Outside India”." };
      const iana = isNaN(ctz) ? INDIA_ZONE : "";
      return { ok: true, lat, lon, iana, tz: isNaN(ctz) ? tzOf(INDIA_ZONE, 5.5) : ctz, city: P.nearName.trim(), district: dname, state: P.st, country: "India", mode: "coords", nearName: P.nearName.trim() };
    }
    if (!P.st) return { ok: false, why: "Choose your state or union territory." };
    if (P.di == null) return { ok: false, why: "Choose your district." };
    if (!P.row) return { ok: false, why: "Choose your city, town or village from the list, or use “My place isn't listed”." };
    const r = P.row;
    return { ok: true, lat: r.lat, lon: r.lon, iana: INDIA_ZONE, tz: tzOf(INDIA_ZONE, 5.5), city: r.n, district: dname, state: P.st, country: "India", mode: P.mode === "near" ? "near" : "list", nearName: P.mode === "near" ? P.nearName.trim() : "", approx: r.approx, pin: r.pin };
  }
  const cn = (COUNTRY_OF[P.cc] || [])[1] || "", d = W_DATA[P.cc];
  if (P.mode === "coords") {
    const lat = parseFloat(P.clat), lon = parseFloat(P.clon), ctz = parseFloat(P.ctz);
    if (!P.cc) return { ok: false, why: "Choose the country first, then enter the coordinates." };
    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return { ok: false, why: "Enter both latitude (−90 to 90) and longitude (−180 to 180)." };
    let iana = "";
    if (isNaN(ctz)) {
      const pool = d ? (d.split ? (P.si != null && d.parts[P.si]) || [] : d.cities) : [];
      const nr = pool.length ? nearestRow(pool, lat, lon) : null;
      iana = nr ? nr.row.iana : (COUNTRY_OF[P.cc] || [])[2] || "";
    }
    const tz = isNaN(ctz) ? tzOf(iana, NaN) : ctz;
    if (isNaN(tz)) return { ok: false, why: "Enter the UTC offset for this place." };
    return { ok: true, lat, lon, iana, tz, city: P.nearName.trim(), district: "", state: P.si != null && d ? wStateName(P, P.si) : "", country: cn, mode: "coords", nearName: P.nearName.trim() };
  }
  if (!P.cc) return { ok: false, why: "Choose the country of birth." };
  if (P.si == null) return { ok: false, why: "Choose the state or province." };
  if (!P.wrow) return { ok: false, why: "Choose the city from the list, or use “My place isn't listed”." };
  const r = P.wrow;
  return { ok: true, lat: r.lat, lon: r.lon, iana: r.iana, tz: tzOf(r.iana, NaN), city: r.n, district: "", state: wStateName(P, r.si), country: cn, mode: P.mode === "near" ? "near" : "list", nearName: P.mode === "near" ? P.nearName.trim() : "" };
}
function placeSummary(px) {
  const R = pickResult(px), P = PICK[px];
  if (!R.ok) return { ok: false, text: P && P.err ? R.why || "" : "" };
  const where = [R.city && R.mode !== "coords" ? R.city : "", R.district ? R.district + " district" : "", R.state, R.country].filter(Boolean).join(", ");
  const geo = `${fmtLat(R.lat)}, ${fmtLon(R.lon)} · ${fmtUtc(R.tz)}`;
  let text;
  if (R.mode === "coords") text = `Using your coordinates ${R.lat.toFixed(4)}°, ${R.lon.toFixed(4)}°${R.nearName ? ` for ${R.nearName}` : ""} (${[R.district ? R.district + " district" : "", R.state, R.country].filter(Boolean).join(", ")}) · ${fmtUtc(R.tz)}`;
  else if (R.mode === "near") text = `${R.nearName ? R.nearName + " is not listed, so we" : "We"} use the nearest listed place: ${where} · ${geo}`;
  else text = `${where} · ${geo}`;
  if (R.approx) text += " (location from the PIN area)";
  return { ok: true, text };
}
/* re-draw combos, panels and the summary from PICK[px]; keep hidden inputs in step for readPlace / saving */
function refreshPicker(px) {
  const P = PICK[px], box = cEl(px + "-placebox"); if (!P || !box) return;
  const inTab = P.tab === "in";
  ["in", "w"].forEach(t => { const b = cEl(`${px}-tab-${t}`), on = (t === "in") === inTab; if (b) { b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; } const pn = cEl(`${px}-panel-${t}`); if (pn) pn.hidden = !on; });
  const ix = P.st && IN_BY_STATE[P.st], loaded = !!(P.st && IN_DATA[P.st]);
  const set = (id, cfg) => { if (COMBO[id]) { Object.assign(COMBO[id], cfg); if (!COMBO[id].open) comboSync(id); else { const el = cEl(id); if (el) el.disabled = !!cfg.disabled; } } };
  set(px + "-ist", { selected: P.st || null, hint: "" });
  set(px + "-idist", { disabled: !P.st, selected: P.di != null ? { value: P.di, kind: "district" } : null, hint: P.st ? `${ix[2].length} districts. You can also type your town or village to find its district.` : "" });
  set(px + "-iplace", { disabled: P.di == null, selected: P.row, hint: P.di == null ? "" : !loaded ? (IN_LOADING[P.st] ? "Loading places…" : "Could not load the places. Check your connection and tap the box to try again.") : `${IN_DATA[P.st].districts[P.di].rows.length.toLocaleString("en-IN")} places in ${ix[2][P.di]} district.` });
  const d = P.cc && W_DATA[P.cc];
  set(px + "-wc", { selected: P.cc ? { value: P.cc } : null });
  set(px + "-wst", { disabled: !P.cc || !d || !d.states.length && !(d.noState && d.noState.length), selected: P.si != null ? { value: P.si, kind: "state" } : null, hint: P.cc && !d ? "Loading…" : d && !d.states.length ? "This country has no states or provinces in our list; choose the city." : "" });
  set(px + "-wcity", { disabled: P.si == null, selected: P.wrow, hint: P.si != null && d && d.cnt && d.cnt[P.si] === 0 || (P.si != null && d && !d.split && P.si >= 0 && !(d.parts[P.si] || []).length) ? "No cities are listed for this state. Use “My place isn't listed”." : "" });
  // not-listed box
  const nl = cEl(px + "-nl"), btn = cEl(px + "-nlbtn"), open = P.mode !== "list";
  if (nl) nl.hidden = !open; if (btn) { btn.setAttribute("aria-expanded", open); btn.textContent = open ? "Back to the list only" : "My place isn't listed"; }
  const rn = cEl(px + "-nlnear"), rc = cEl(px + "-nlcoords");
  if (rn) rn.checked = P.mode === "near"; if (rc) rc.checked = P.mode === "coords";
  const nameEl = cEl(px + "-nlname"); if (nameEl && document.activeElement !== nameEl) nameEl.value = P.nearName;
  const cb = cEl(px + "-nlcoords-box"), cn = cEl(px + "-nlcoords-note"), nn = cEl(px + "-nlnear-note");
  if (cb) cb.hidden = P.mode !== "coords"; if (cn) cn.hidden = P.mode !== "coords"; if (nn) nn.hidden = P.mode !== "near";
  if (P.mode === "coords") [["clat", P.clat], ["clon", P.clon], ["ctz", P.ctz]].forEach(([k, v]) => { const el = cEl(`${px}-${k}`); if (el && document.activeElement !== el) el.value = v; });
  syncPlaceHidden(px);
}
function syncPlaceHidden(px) {
  const R = pickResult(px), S = placeSummary(px), set = (k, v) => { const el = cEl(`${px}-${k}`); if (el) el.value = v == null ? "" : v; };
  set("country", R.ok ? R.country : (PICK[px].tab === "in" ? "India" : (COUNTRY_OF[PICK[px].cc] || [])[1] || "")); set("state", R.ok ? R.state : PICK[px].st || ""); set("district", R.district || ""); set("city", R.city || "");
  set("lat", R.ok ? R.lat : ""); set("lon", R.ok ? R.lon : ""); set("tz", R.ok && !isNaN(R.tz) ? R.tz : ""); set("iana", R.ok ? R.iana : ""); set("pok", R.ok ? "1" : "");
  const note = cEl(px + "-pnote");
  if (note) { note.textContent = S.text ? (S.ok ? "✓ " : "") + S.text : ""; note.classList.toggle("bad", !S.ok && !!S.text); }
  const box = cEl(px + "-placebox"); if (box) box.classList.toggle("invalid", !!(PICK[px].err && !R.ok));
}
/* called on save: returns "" when the place is complete, otherwise the message to show (and marks the picker) */
function placeError(px) {
  const R = pickResult(px), P = PICK[px];
  if (R.ok) return "";
  if (P) { P.err = "1"; syncPlaceHidden(px); }
  return R.why || "Please choose the place of birth.";
}
function readPlace(px) {
  const R = pickResult(px);
  if (!R.ok) return { city: "", state: "", district: "", country: "", dst: false, iana: "", place: "", lat: NaN, lon: NaN, tz: NaN };
  const label = R.mode === "coords" ? `${R.nearName ? R.nearName + " (" : ""}${R.lat.toFixed(3)}°, ${R.lon.toFixed(3)}°${R.nearName ? ")" : ""}` : R.mode === "near" && R.nearName ? `${R.nearName} (near ${R.city})` : R.city;
  const out = { city: R.city, state: R.state, district: R.district || "", country: R.country, dst: false, iana: R.iana || "", place: [label, R.state, R.country].filter(Boolean).join(", "), lat: R.lat, lon: R.lon, tz: R.tz };
  if (R.mode === "near" && R.nearName) out.bornIn = R.nearName;
  if (R.mode === "coords") { out.placeMode = "coords"; if (R.nearName) out.bornIn = R.nearName; }
  return out;
}
/* tabs, not-listed box and coordinate inputs */
document.addEventListener("click", e => {
  const t = e.target.closest && e.target.closest("[data-ptab]");
  if (t) { const px = t.dataset.px, P = PICK[px]; if (!P) return; if (P.tab !== t.dataset.ptab) { P.tab = t.dataset.ptab; touch(px); if (P.mode === "coords") P.mode = "list"; refreshPicker(px); } return; }
  const nb = e.target.closest && e.target.closest("[data-act=notlisted]");
  if (nb) { const px = nb.dataset.px, P = PICK[px]; if (!P) return; touch(px); P.mode = P.mode === "list" ? "near" : "list"; refreshPicker(px); if (P.mode !== "list") setTimeout(() => { const el = cEl(px + "-nlname"); if (el) el.focus(); }, 0); }
});
document.addEventListener("keydown", e => {
  const t = e.target; if (!t.dataset || !t.dataset.ptab) return;
  if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") { e.preventDefault(); const px = t.dataset.px, other = cEl(`${px}-tab-${t.dataset.ptab === "in" ? "w" : "in"}`); other.focus(); other.click(); }
});
document.addEventListener("change", e => {
  const t = e.target; if (!t.name || !/-nlmode$/.test(t.name)) return;
  const px = t.dataset.px, P = PICK[px]; if (!P) return; touch(px); P.mode = t.value;
  if (P.mode === "coords" && !P.clat && !P.clon) { const R0 = P.tab === "in" ? P.row : P.wrow; if (R0) { P.clat = String(R0.lat); P.clon = String(R0.lon); } }
  refreshPicker(px);
});
document.addEventListener("input", e => {
  const t = e.target, m = /^(\w+)-(nlname|clat|clon|ctz)$/.exec(t.id || ""); if (!m || !PICK[m[1]]) return;
  const P = PICK[m[1]]; touch(m[1]);
  if (m[2] === "nlname") P.nearName = t.value; else P[m[2]] = t.value;
  syncPlaceHidden(m[1]);
});
/* the birth date or time changes the UTC offset (daylight saving, India's 1942-45 war time ...) */
document.addEventListener("change", e => { const m = /^(f|o|b|g)-(date|hh|mm|ap)$/.exec(e.target.id || ""); if (m && PICK[m[1]] && cEl(m[1] + "-placebox")) syncPlaceHidden(m[1]); });
document.addEventListener("input", e => { const m = /^(f|o|b|g)-date$/.exec(e.target.id || ""); if (m && PICK[m[1]] && cEl(m[1] + "-placebox")) syncPlaceHidden(m[1]); });
