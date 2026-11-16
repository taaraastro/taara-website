/* ===== Personal insight layer: what makes each chart unique ===== */
const NAK_INFO = [
  ["the Ashwini Kumaras, the divine healers", "a horse's head", "speed, healing and fresh starts"],
  ["Yama, lord of dharma", "the yoni", "the strength to carry and transform"],
  ["Agni, the sacred fire", "a flame", "sharp focus and purifying courage"],
  ["Brahma, the creator", "a chariot", "magnetism, creativity and growth"],
  ["Soma, the moon nectar", "a deer's head", "curiosity and the gift of seeking"],
  ["Rudra, the storm", "a teardrop", "deep transformation and brilliance under pressure"],
  ["Aditi, mother of the gods", "a bow and quiver", "renewal and unbreakable optimism"],
  ["Brihaspati, the guru of the gods", "a lotus", "nourishing wisdom; it is the most auspicious nakshatra"],
  ["the Nagas, keepers of hidden wisdom", "a coiled serpent", "insight and strategic intelligence"],
  ["the Pitris, the ancestors", "a royal throne", "leadership and a lasting legacy"],
  ["Bhaga, giver of delight", "a hammock", "joy, charm and creative pleasure"],
  ["Aryaman, the patron", "the legs of a bed", "reliability, generosity and strong alliances"],
  ["Savitar, the radiant sun", "an open hand", "skill, craftsmanship and getting things done"],
  ["Vishwakarma, the divine architect", "a bright jewel", "design brilliance and the urge to create"],
  ["Vayu, the wind", "a young shoot in the breeze", "independence and the ability to adapt"],
  ["Indra and Agni together", "a victory arch", "determination that reaches its goal"],
  ["Mitra, the god of friendship", "a lotus", "devotion, loyalty and success through people"],
  ["Indra, king of the gods", "an earring", "seniority, protection and command"],
  ["Nirriti, who uproots", "a bunch of roots", "getting to the root of anything"],
  ["Apas, the waters", "a winnowing fan", "invincible conviction"],
  ["the Vishvadevas, the universal gods", "an elephant's tusk", "final victory that lasts"],
  ["Vishnu, the preserver", "an ear", "listening, learning and wisdom"],
  ["the eight Vasus, gods of abundance", "a drum", "wealth, rhythm and fame"],
  ["Varuna, lord of cosmic waters", "an empty circle", "healing and mystical insight"],
  ["Aja Ekapada, the one-footed goat", "a sword", "fiery idealism and courage"],
  ["Ahirbudhnya, serpent of the deep", "twins", "depth, patience and wisdom"],
  ["Pushan, the guide of travellers", "a fish", "nurturing guidance and safe journeys"],
];
const LAGNA_TRAIT = ["a born initiator with the courage to go first", "steady and loyal, gifted at building lasting value", "quick-minded, a natural communicator and connector", "deeply caring, intuitive and protective of your people", "a natural leader with warmth and presence", "precise and practical, brilliant at improving things", "graceful and fair-minded, gifted at partnerships", "intense and perceptive, fearless in transformation", "optimistic and principled, drawn to wisdom", "disciplined and ambitious, built for long-term success", "original and humane, ahead of your time", "compassionate and imaginative, spiritually attuned"];
const PLANET_GIFT = { Sun: "authority and self-belief", Moon: "emotional intelligence and public connection", Mars: "courage, energy and decisive action", Mercury: "intelligence, speech and business sense", Jupiter: "wisdom, blessings and good guidance", Venus: "charm, comfort and creative success", Saturn: "discipline, endurance and lasting results", Rahu: "ambition and success in new or foreign fields", Ketu: "intuition and spiritual depth" };
const LORD_DAY = { Sun: "Sunday", Moon: "Monday", Mars: "Tuesday", Mercury: "Wednesday", Jupiter: "Thursday", Venus: "Friday", Saturn: "Saturday", Rahu: "Saturday", Ketu: "Tuesday" };
const LORD_COLOUR = { Sun: "saffron or orange", Moon: "white or silver", Mars: "red", Mercury: "green", Jupiter: "yellow", Venus: "white or pastel pink", Saturn: "dark blue", Rahu: "smoky grey", Ketu: "earthy brown" };
const LORD_MANTRA = { Sun: "Om Suryaya Namah", Moon: "Om Chandraya Namah", Mars: "Om Angarakaya Namah", Mercury: "Om Budhaya Namah", Jupiter: "Om Gurave Namah", Venus: "Om Shukraya Namah", Saturn: "Om Shanaishcharaya Namah", Rahu: "Om Rahave Namah", Ketu: "Om Ketave Namah" };
const EXALT_SIGN = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
const SEVEN = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

function lordOfHouse(c, h) { return A.SIGN_LORD[(c.lagna.sign + h - 1) % 12]; }
function dignity(c, k) {
  if (!(k in EXALT_SIGN)) return "";
  const s = c.planets[k].sign;
  if (EXALT_SIGN[k] === s) return "exalted";
  if ((EXALT_SIGN[k] + 6) % 12 === s) return "debilitated";
  if (A.SIGN_LORD[s] === k) return "own";
  return "";
}
/* real classical yogas, checked from the computed chart */
function yogas(c) {
  const P = c.planets, out = [];
  const fromMoon = k => ((P[k].sign - P.Moon.sign + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(fromMoon("Jupiter"))) out.push({ key: "gajakesari", name: "Gaja Kesari Yoga", text: "Jupiter stands in a kendra from your Moon, the classic sign of respect, wisdom and rising fortune.", topics: ["career", "education", "admission", "general", "money"] });
  if (P.Sun.sign === P.Mercury.sign) out.push({ key: "budhaditya", name: "Budhaditya Yoga", text: "the Sun and Mercury join, giving a sharp intellect and a voice people listen to.", topics: ["education", "admission", "career"] });
  if (P.Moon.sign === P.Mars.sign) out.push({ key: "chandramangala", name: "Chandra-Mangala Yoga", text: "the Moon and Mars join, a classic combination for earning power and enterprise.", topics: ["money", "property", "career"] });
  const MP = { Mars: ["Ruchaka", "courage and command", ["career", "property", "health"]], Mercury: ["Bhadra", "brilliant intellect and business skill", ["education", "admission", "career"]], Jupiter: ["Hamsa", "wisdom, grace and good fortune", ["education", "admission", "children", "general"]], Venus: ["Malavya", "beauty, comfort and a happy married life", ["marriage", "money", "property"]], Saturn: ["Shasha", "authority earned through discipline", ["career", "property"]] };
  for (const [k, [nm, gift, topics]] of Object.entries(MP)) {
    const d = dignity(c, k);
    if ((d === "own" || d === "exalted") && [1, 4, 7, 10].includes(P[k].house)) out.push({ key: nm.toLowerCase(), name: `${nm} Yoga`, text: `${k} is ${d === "own" ? "in its own sign" : "exalted"} in a kendra, one of the five Mahapurusha yogas, giving ${gift}.`, topics });
  }
  for (const k of SEVEN) {
    const ruled = [];
    for (let h = 1; h <= 12; h++) if (lordOfHouse(c, h) === k) ruled.push(h);
    if (ruled.some(h => [4, 7, 10].includes(h)) && ruled.some(h => [5, 9].includes(h))) out.push({ key: "yogakaraka", name: "Yogakaraka planet", text: `${k} rules both a kendra and a trikona in your chart, so its periods can lift you to a higher position.`, topics: ["career", "general", "money"], planet: k });
  }
  const kl = new Set([1, 4, 7, 10].map(h => lordOfHouse(c, h))), tl = new Set([5, 9].map(h => lordOfHouse(c, h)));
  const raj = SEVEN.some(a => kl.has(a) && SEVEN.some(b => b !== a && tl.has(b) && P[a].sign === P[b].sign));
  if (raj) out.push({ key: "raj", name: "Raja Yoga", text: "a kendra lord and a trikona lord sit together, a classic Raja Yoga for status and success.", topics: ["career", "general", "money"] });
  const l2 = lordOfHouse(c, 2), l11 = lordOfHouse(c, 11);
  if (l2 !== l11 && (P[l2].sign === P[l11].sign || (P[l2].house === 11 && P[l11].house === 2))) out.push({ key: "dhana", name: "Dhana Yoga", text: "the lords of wealth (2nd) and gains (11th) are linked, a classic sign of wealth building.", topics: ["money", "property"] });
  const dus = [6, 8, 12].map(h => lordOfHouse(c, h));
  if (dus.some(k => [6, 8, 12].includes(P[k].house))) out.push({ key: "vipreet", name: "Vipreet Raja Yoga", text: "a lord of a difficult house sits in another difficult house, which turns setbacks into unexpected wins.", topics: ["career", "health", "general"] });
  return out;
}
function powerPlanet(c) {
  let best = null, bs = -99;
  for (const k of SEVEN) {
    const p = c.planets[k], d = dignity(c, k);
    let s = d === "exalted" ? 3 : d === "own" ? 2 : d === "debilitated" ? -2 : 0;
    if ([1, 4, 7, 10].includes(p.house)) s += 1.5; else if ([5, 9].includes(p.house)) s += 1.5; else if ([6, 8, 12].includes(p.house)) s -= 1;
    if (s > bs) { bs = s; best = k; }
  }
  const d = dignity(c, best), h = c.planets[best].house;
  return { planet: best, text: `${best}${d === "exalted" ? ", exalted" : d === "own" ? ", in its own sign" : ""} in your ${ord(h)} house, gives you ${PLANET_GIFT[best]}` };
}
/* the best days in the next month: good Tara from the birth star, plus the day ruled by a helpful planet */
function powerDays(c, lords, n = 3, days = 30) {
  const tz = deviceTz(), out = [], good = { 2: 2, 4: 2, 6: 2.5, 8: 2, 9: 3 };
  for (let i = 1; i <= days; i++) {
    const ds = todayStr(i), J = A.jdLocal(ds, "12:00", tz), tr = A.transits(J);
    const t = ((tr.Moon.nak.idx - c.nak.idx + 27) % 27) % 9 + 1;
    if (!good[t]) continue;
    const wd = new Date(Date.now() + i * 864e5).getDay();
    const dayLord = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"][wd];
    const sc = good[t] + (lords.includes(dayLord) ? 1.5 : 0);
    out.push({ ds, sc, tara: TARA[t][0], label: new Date(Date.now() + i * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) });
  }
  return out.sort((a, b) => b.sc - a.sc).slice(0, n).sort((a, b) => a.ds < b.ds ? -1 : 1);
}
function signature(c, p) {
  const ni = NAK_INFO[c.nak.idx], ys = yogas(c), pp = powerPlanet(c);
  return { ni, ys, pp, lagnaTrait: LAGNA_TRAIT[c.lagna.sign], nak: c.nak.name };
}
const _hookCount = {};
function hookLine(c, p, self, peek, variant) {
  const s = signature(c, p), key = p.id || p.name;
  const k = variant ?? (_hookCount[key] || 0); if (!peek) _hookCount[key] = k + 1;
  const you = self ? "you" : p.name, your = self ? "your" : `${p.name}'s`, are = self ? "you are" : `${p.name} is`;
  const opts = [
    `${p.name}, born under **${s.nak}** (ruled by ${s.ni[0]}), ${self ? "you carry" : "carries"} the gift of ${s.ni[2]}${s.ys[0] ? `, with **${s.ys[0].name}** in the chart` : ""}.`,
    `With a **${A.SIGNS[c.lagna.sign]} Lagna**, ${are} ${s.lagnaTrait}, ${p.name}.`,
    `${p.name}, ${your} power planet is **${s.pp.planet}**: it gives ${PLANET_GIFT[s.pp.planet]}.`,
  ];
  s.ys.slice(1).forEach(y => opts.push(`${p.name}, ${your} chart holds **${y.name}**: ${y.text}`));
  return opts[k % opts.length];
}
function personalRemedy(lord) {
  return `Chant **${LORD_MANTRA[lord]}** 108 times on ${LORD_DAY[lord]}s and wear ${LORD_COLOUR[lord]} that day. ${REMEDY[lord]}`;
}
function signatureText(c, p) {
  const s = signature(c, p);
  return `Birth star ${s.nak} (deity ${s.ni[0]}, symbol ${s.ni[1]}, gift: ${s.ni[2]}). Lagna ${A.SIGNS[c.lagna.sign]}: ${s.lagnaTrait}. Power planet: ${s.pp.text}. Yogas: ${s.ys.length ? s.ys.map(y => `${y.name} (${y.text})`).join("; ") : "none of the classic yogas checked"}.`;
}
