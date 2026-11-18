/* ===== Voice agents: one per language, opposite-gender voice, tone set from the kundli ===== */
const VOICE_PROXY_URL = CFG.voiceProxy || ""; // your voice server, e.g. https://taara-voice.YOURNAME.workers.dev (works on your own website)
const VOICE_MIN = { free: 3, silver: 10, gold: 30, unlimited: 120 }; // voice minutes a month per plan
const VOICE_PACK_PRICE = 99, VOICE_PACK_MIN = 10;

/* which voice each language agent uses */
const NATIVE_VOICE = { en: "en-IN", hinglish: "hi-IN", hi: "hi-IN", bn: "bn-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN", mr: "mr-IN", gu: "gu-IN", pa: "pa-IN", or: "od-IN" };
const SHARED_VOICE = { as: "bn", doi: "hi", kok: "mr", mai: "hi", ne: "hi", sa: "hi", awa: "hi", bho: "hi", bgc: "hi", bhb: "hi", bns: "hi", hne: "hi", gbm: "hi", gon: "hi", kfy: "hi", mag: "hi", raj: "hi", tcy: "kn", kfa: "kn" };
const DEVICE_VOICE = { ur: "ur-IN", ks: "ur-IN", sd: "ur-IN" };
function voiceInfo(code) {
  if (NATIVE_VOICE[code]) return { tier: "native", tts: NATIVE_VOICE[code], web: NATIVE_VOICE[code].replace("od-IN", "or-IN") };
  if (SHARED_VOICE[code]) { const b = SHARED_VOICE[code]; return { tier: "shared", via: LANG[b].name, tts: NATIVE_VOICE[b], web: NATIVE_VOICE[b] }; }
  if (DEVICE_VOICE[code]) return { tier: "device", tts: null, web: DEVICE_VOICE[code] };
  return { tier: "text", tts: null, web: null };
}
/* the language to listen in: the language of the last question, else the chosen language, else the device language */
function voiceLang() {
  const lastUser = [...state.chat].reverse().find(m => m.role === "user");
  if (lastUser) return LANG[detectReplyLang(lastUser.content, state.lang)] || LANG.en;
  if (state.lang !== "auto") return LANG[state.lang] || LANG.en;
  const nav = (typeof navigator !== "undefined" && navigator.language || "en").slice(0, 2).toLowerCase();
  return LANG[nav] && nav !== "en" ? LANG[nav] : LANG.en;
}

/* opposite-gender voice: women hear a male astrologer, men a female one */
function voiceGender(p) {
  const pref = store.get("voiceGender", "auto");
  if (pref !== "auto") return pref;
  return p.gender === "F" ? "male" : "female";
}

/* tone from the kundli: Moon sign element sets the voice, Mahadasha sets the role, a hard day softens it */
const ELEMENT = ["fire", "earth", "air", "water"];
const TONES = {
  fire: { label: "Energetic and encouraging", pace: 1.08, pitch: 0.05 },
  earth: { label: "Calm, steady and practical", pace: 0.95, pitch: -0.03 },
  air: { label: "Bright and conversational", pace: 1.04, pitch: 0.03 },
  water: { label: "Gentle, warm and nurturing", pace: 0.92, pitch: 0 },
};
const ROLE = { Sun: "a confident guide", Moon: "a caring listener", Mars: "a motivating coach", Mercury: "a clear, practical guide", Jupiter: "a wise elder", Venus: "a warm friend", Saturn: "a patient mentor", Rahu: "a bold strategist", Ketu: "a calm spiritual guide" };
function toneFor(c) {
  const el = ELEMENT[c.moonSign % 4], base = TONES[el], cur = A.currentDasha(c, nowJ());
  const d = dailyFor(c, todayStr(), deviceTz()), sat = saturnStatus(c, A.transits(nowJ()));
  const hardDay = d.s.overall < 45, hardSaturn = ["Sade Sati", "Ashtama Shani"].includes(sat.tag), soft = hardDay || hardSaturn;
  return {
    label: base.label + (soft ? ", with extra reassurance" : ""), role: ROLE[cur.md.lord],
    pace: +(base.pace - (soft ? 0.05 : 0)).toFixed(2), pitch: base.pitch,
    why: `${A.SIGNS[c.moonSign]} Moon (${el} sign) and ${cur.md.lord} Mahadasha${hardSaturn ? `, softened for ${sat.tag}` : hardDay ? ", softened for a delicate day" : ""}`,
  };
}

/* voice minutes */
const voxKey = () => "vox." + monthKey();
const voxAllowance = () => (VOICE_MIN[planState().id] || 0) * 60;
function voiceLeftSec() { return Math.max(0, voxAllowance() - store.get(voxKey(), 0)) + store.get("voxBonus", 0); }
function addVoxSec(s) {
  const used = store.get(voxKey(), 0), room = Math.max(0, voxAllowance() - used), fromPlan = Math.min(room, s);
  store.set(voxKey(), used + fromPlan);
  if (s > fromPlan) store.set("voxBonus", Math.max(0, store.get("voxBonus", 0) - (s - fromPlan)));
}
const fmtMin = s => s >= 60 ? `${Math.floor(s / 60)} min` : `${Math.round(s)} sec`;

/* text that sounds right when spoken */
const RANGE_TO = { hi: " से ", mr: " ते ", ne: " देखि ", bn: " থেকে ", as: "ৰ পৰা ", gu: " થી ", pa: " ਤੋਂ ", or: " ରୁ ", ta: " முதல் ", te: " నుండి ", kn: " ರಿಂದ ", ml: " മുതൽ ", ur: " سے ", hinglish: " se " };
function spokenText(mdText, code) {
  return mdText.replace(/\s*\(\d+\/100\)/g, "").replace(/\s–\s/g, RANGE_TO[tmplCode(code || "en")] || " to ").replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s*/gm, "").replace(/^\s*(\d+\.|[-•])\s+/gm, "").replace(/\s–\s/g, " to ").replace(/–/g, ", ").replace(/\n{2,}/g, ". ").replace(/\n/g, " ").replace(/\.\s*\./g, ".").replace(/\s+/g, " ").trim();
}
function spokenSummary(mdText, max = 700, code) {
  const s = spokenText(mdText, code);
  if (s.length <= max) return s;
  const cut = s.slice(0, max), end = Math.max(cut.lastIndexOf("। "), cut.lastIndexOf(". "), cut.lastIndexOf("? "));
  return end > 80 ? cut.slice(0, end + 1) : cut;
}

/* engines: your voice server (Indian male/female voices) > device voices > Claude's voice > text */
const Voice = { claudeTts: null, claudeDict: null, rec: null, listening: false, speaking: false, audio: null, engine: "" };
function webVoices() { try { return window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { return []; } }
try { if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { if (state.tab === "ask") render(); }; } catch (e) {}
function pickWebVoice(bcp, gender) {
  if (!bcp) return null;
  const vs = webVoices().filter(v => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(bcp.slice(0, 2).toLowerCase()));
  if (!vs.length) return null;
  const fem = /female|woman|lekha|swara|kalpana|heera|veena|neerja|aditi|raveena|priya|kajal|ananya|shruti|sangeeta|vani|pallavi|shreya/i;
  const mal = /\bmale\b|\bman\b|hemant|prabhat|ravi|madhur|rishi|kumar|arjun|aarav|vikram|mohan|valluvar/i;
  const hit = vs.find(v => (gender === "male" ? mal : fem).test(v.name));
  return { voice: hit || vs.find(v => v.lang.toLowerCase().replace("_", "-") === bcp.toLowerCase()) || vs[0], exact: !!hit };
}
function stopVoice() {
  try { if (Voice.audio) { Voice.audio.pause(); Voice.audio = null; } } catch (e) {}
  try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  try { if (Voice.claudeTts) Voice.claudeTts.stop(); } catch (e) {}
  Voice.speaking = false;
}
function voiceCapability(code) {
  const vi = voiceInfo(code);
  if (VOICE_PROXY_URL && vi.tts) return "studio";
  if (pickWebVoice(vi.web, "female")) return "device";
  if (Voice.claudeTts && vi.tts) return "claude";
  return "none";
}
function mostlyLatin(s) {
  const latin = (s.match(/[A-Za-z]/g) || []).length, other = (s.match(/[\u0900-\u0DFF\u0600-\u06FF\uABC0-\uABFF]/g) || []).length;
  return latin > 3 * other;
}
async function speakAnswer(text, langCode) {
  const p = prof(), c = chartOf(p), g = voiceGender(p), tone = toneFor(c);
  let L = LANG[langCode] || LANG[detectReplyLang(text, state.lang)] || voiceLang(); // speak in the language the answer is written in
  const say = spokenSummary(text.replace(/^\*[^*\n]+\*\s*/, ""), 700, L.code);
  if (!["en", "hinglish", "kha", "lus"].includes(L.code) && mostlyLatin(say)) L = LANG.en; // an English answer is read by the English voice
  const vi = voiceInfo(L.code);
  if (!say) return { ok: false };
  if (voiceLeftSec() <= 0) return { ok: false, reason: "limit" };
  stopVoice();
  const secs = say.length / 14 / tone.pace;
  if (VOICE_PROXY_URL && vi.tts) {
    try {
      const r = await fetch(VOICE_PROXY_URL + "/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: say, lang: vi.tts, gender: g, pace: tone.pace }) });
      const j = await r.json();
      if (j.audio) {
        Voice.audio = new Audio("data:audio/wav;base64," + j.audio); Voice.speaking = true; Voice.engine = "studio"; addVoxSec(secs); render();
        Voice.audio.onended = () => { Voice.speaking = false; render(); };
        await Voice.audio.play(); return { ok: true };
      }
    } catch (e) {}
  }
  const w = pickWebVoice(vi.web, g);
  if (w) {
    const u = new SpeechSynthesisUtterance(say);
    u.voice = w.voice; u.lang = w.voice.lang; u.rate = tone.pace;
    u.pitch = w.exact ? 1 + tone.pitch : (g === "male" ? 0.75 : 1.2);
    u.onend = () => { Voice.speaking = false; render(); };
    Voice.speaking = true; Voice.engine = "device"; addVoxSec(secs); render();
    speechSynthesis.speak(u); return { ok: true };
  }
  if (Voice.claudeTts && vi.tts) {
    try { Voice.speaking = true; Voice.engine = "claude"; addVoxSec(secs); render(); await Voice.claudeTts.speak(say, { rate: Math.min(1.5, Math.max(0.7, tone.pace)), language: vi.tts }); }
    catch (e) {}
    Voice.speaking = false; render(); return { ok: true };
  }
  return { ok: false, reason: "novoice" };
}

/* listening */
function downsample(chunks, inRate, outRate) {
  const len = chunks.reduce((s, c) => s + c.length, 0), all = new Float32Array(len); let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.length; }
  const ratio = inRate / outRate, out = new Float32Array(Math.floor(len / ratio));
  for (let i = 0; i < out.length; i++) out[i] = all[Math.floor(i * ratio)];
  return out;
}
function encodeWav(samples, rate) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) { const s = Math.max(-1, Math.min(1, samples[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
  return new Blob([buf], { type: "audio/wav" });
}
async function recordWav(maxSec = 20) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new (window.AudioContext || window.webkitAudioContext)(), src = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(4096, 1, 1), chunks = [];
  proc.onaudioprocess = e => chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  src.connect(proc); proc.connect(ctx.destination);
  let finish; const done = new Promise(r => { finish = r; }); const timer = setTimeout(() => finish(), maxSec * 1000);
  return { stop: () => finish(), result: done.then(() => { clearTimeout(timer); proc.disconnect(); src.disconnect(); stream.getTracks().forEach(t => t.stop()); const rate = ctx.sampleRate; ctx.close(); return encodeWav(downsample(chunks, rate, 16000), 16000); }) };
}
function setMicNote(t) { const n = $("#ask-note"); if (n) n.textContent = t; }
async function voiceAsk(text) {
  text = (text || "").trim();
  Voice.listening = false; render();
  if (!text) { setMicNote("I did not catch that. Tap Speak and try again."); return; }
  const before = state.chat.length;
  state.voiceTurn = true;
  await ask(text);
  state.voiceTurn = false;
  const last = state.chat.slice(before).reverse().find(m => m.role === "assistant");
  if (last && !state.pending) {
    const r = await speakAnswer(last.content, last.lang);
    if (r.reason === "limit") { state.chat.push({ role: "assistant", content: `Your voice minutes for this month are used up. Add **${VOICE_PACK_MIN} minutes for ₹${VOICE_PACK_PRICE}** or move to Gold for 30 minutes a month. The written answer is above.`, upsell: true }); render(); }
    else if (r.reason === "novoice") setMicNote(`This device cannot read ${(LANG[last.lang] || voiceLang()).name} aloud yet, so the answer is in writing.`);
  }
}
/* called straight from the Speak button's click */
function micClick() {
  const L = voiceLang(), vi = voiceInfo(L.code);
  if (Voice.listening) { // second tap: finish
    if (Voice.rec && Voice.rec.stop) Voice.rec.stop();
    return;
  }
  stopVoice();
  if (voiceLeftSec() <= 0) { state.chat.push({ role: "assistant", content: `Your voice minutes for this month are used up. Add **${VOICE_PACK_MIN} minutes for ₹${VOICE_PACK_PRICE}** or move to Gold for 30 minutes a month. You can still type your question.`, upsell: true }); render(); return; }
  // 1. your voice server: record, then transcribe in 22 Indian languages
  if (VOICE_PROXY_URL && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    recordWav().then(rec => {
      Voice.rec = rec; Voice.listening = true; render(); setMicNote("Listening… tap Send when you finish.");
      return rec.result.then(blob => { const f = new FormData(); f.append("file", blob, "q.wav"); f.append("lang", state.lang !== "auto" && vi.tts && L.code !== "hinglish" ? vi.tts : "unknown"); setMicNote("Understanding…"); return fetch(VOICE_PROXY_URL + "/stt", { method: "POST", body: f }); })
        .then(r => r.json()).then(j => voiceAsk(j.text));
    }).catch(() => { Voice.listening = false; render(); setMicNote("Microphone permission is needed to speak your question."); });
    return;
  }
  // 2. Claude's dictation, when the app is open inside Claude
  if (Voice.claudeDict) {
    let said = "";
    const d = Voice.claudeDict;
    d.onPartial(({ text }) => { const q = $("#q"); if (q) q.value = (said + " " + text).trim(); });
    d.onFinal(({ text }) => { said = (said + " " + text).trim(); const q = $("#q"); if (q) q.value = said; });
    Voice.rec = { stop: async () => { try { await d.stop(); } catch (e) {} voiceAsk(said || ($("#q") ? $("#q").value : "")); if ($("#q")) $("#q").value = ""; } };
    d.start().then(() => { Voice.listening = true; render(); setMicNote("Listening… tap Send when you finish."); }).catch(e => { Voice.listening = false; render(); setMicNote(e && e.code === "not_granted" ? "Voice input is turned off. You can type your question." : "Could not start the microphone. Please try again."); });
    return;
  }
  // 3. the browser's own speech recognition
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    const r = new SR(); r.lang = vi.web || "hi-IN"; r.interimResults = true; r.continuous = false;
    let said = "";
    r.onresult = e => { said = Array.from(e.results).map(x => x[0].transcript).join(" "); const q = $("#q"); if (q) q.value = said; };
    r.onend = () => { if ($("#q")) $("#q").value = ""; voiceAsk(said); };
    r.onerror = () => { Voice.listening = false; render(); setMicNote("Could not hear you. Check microphone permission and try again."); };
    Voice.rec = { stop: () => r.stop() }; Voice.listening = true; render(); setMicNote("Listening…");
    try { r.start(); } catch (e) { Voice.listening = false; render(); }
    return;
  }
  setMicNote("Voice input is not available in this browser. Please type your question.");
}

/* the agent card above the chat: only what a user needs (speak, minutes left, a plain voice choice).
   The opposite-gender default and the kundli-based tone stay internal. */
function voicePanel() {
  const L = voiceLang(), cap = voiceCapability(L.code), pref = store.get("voiceGender", "auto");
  const sel = v => pref === v ? " selected" : "";
  return `<div class="vpanel">
    <div class="vrow"><b>Voice</b>${cap === "none" ? `<span class="pill warn">Written answers only in ${L.native} on this device</span>` : ""}<span class="muted">${fmtMin(voiceLeftSec())} left this month</span></div>
    <details class="vset"><summary class="muted">Voice settings</summary><div class="vrow"><label for="vgender" class="muted">Voice</label><select id="vgender" class="langsel"><option value="auto"${sel("auto")}>Default</option><option value="female"${sel("female")}>Female</option><option value="male"${sel("male")}>Male</option></select></div></details>
  </div>`;
}
