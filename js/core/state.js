// Jedini izvor istine za napredak, inventar, otključavanja, dostignuća i podešavanja.
// Sve se čuva u localStorage pod verzionisanim ključem. Nema servera.
import { SITE } from '../config/site.js';
import { GATES, WORLD_W, MAIN_QUESTS } from '../config/zones.js';
import { clamp } from './util.js';

const defaults = () => ({
  v: SITE.saveVersion,
  started: false,
  freeRoam: false, // "Samo razgledam": prolazi kroz kapije, nezavisno od misija
  x: 140, // poslednja bezbedna pozicija igrača
  flags: {},
  inv: {},
  ach: {},
  secrets: {},
  boss: { used: 0 },
  stats: { jumps: 0, bell: 0, fail: { neuron: 0, boss: 0 }, exhibits: {}, endCount: 0 },
  ping: 999,
  time: 0,
  settings: { sound: true, music: true, reduced: null, assist: false },
  hints: {},
});

export const S = defaults();
const key = () => `${SITE.saveKey}:v${SITE.saveVersion}`;

// ---------- zaključavanja ulaza (dijalog, meni, minigra...) ----------
const locks = new Set();
export const ui = {
  lock(n) { locks.add(n); },
  unlock(n) { locks.delete(n); },
  has(n) { return locks.has(n); },
  get busy() { return locks.size > 0; },
  get play() { return S.started && locks.size === 0; },
};

// ---------- pretplate (HUD se osvežava samo kad se nešto promeni) ----------
const subs = new Set();
let queued = false;
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
export function changed() {
  scheduleSave();
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; subs.forEach((f) => f()); });
}

// ---------- pomoćne funkcije ----------
export const flag = (k) => !!S.flags[k];
export function setFlag(k, v = true) { if (S.flags[k] !== v) { S.flags[k] = v; changed(); } }
export const count = (id) => S.inv[id] || 0;
export function give(id, n = 1) { S.inv[id] = count(id) + n; changed(); }
export function take(id, n = 1) { S.inv[id] = Math.max(0, count(id) - n); if (!S.inv[id]) delete S.inv[id]; changed(); }
export const gateOpen = (g) => S.freeRoam || !!S.flags[g.flag];
export const reduced = () => (S.settings.reduced == null ? matchMedia('(prefers-reduced-motion: reduce)').matches : !!S.settings.reduced);

/** Najdalje x do kog igrač sme da ide (prva zatvorena kapija). */
export function maxX() {
  for (const g of GATES) if (!gateOpen(g)) return g.x - 26;
  return WORLD_W - 50;
}

export function questProgress() {
  const done = MAIN_QUESTS.filter((q) => S.flags[q]).length;
  return { done, total: MAIN_QUESTS.length };
}

export function secretsFound() { return Object.keys(S.secrets).length; }
export const SECRET_TOTAL = 6;

// ---------- čuvanje / učitavanje ----------
let saveTimer = 0;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = 0; saveNow(); }, 350);
}
export function saveNow() {
  try { localStorage.setItem(key(), JSON.stringify(S)); } catch { /* privatni režim: igra radi i bez čuvanja */ }
}

function sanitize(raw) {
  const d = defaults();
  if (!raw || typeof raw !== 'object' || raw.v !== SITE.saveVersion) return d;
  const obj = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
  const out = d;
  out.started = !!raw.started;
  out.freeRoam = !!raw.freeRoam;
  out.x = Number.isFinite(raw.x) ? raw.x : d.x;
  for (const [k, v] of Object.entries(obj(raw.flags))) if (v === true) out.flags[k] = true;
  for (const [k, v] of Object.entries(obj(raw.inv))) if (Number.isFinite(v) && v > 0) out.inv[k] = Math.min(9, v | 0);
  for (const [k, v] of Object.entries(obj(raw.ach))) if (Number.isFinite(v)) out.ach[k] = v;
  for (const [k, v] of Object.entries(obj(raw.secrets))) if (v === true) out.secrets[k] = true;
  const st = obj(raw.stats);
  out.stats.jumps = Number.isFinite(st.jumps) ? st.jumps : 0;
  out.stats.bell = Number.isFinite(st.bell) ? st.bell : 0;
  out.stats.exhibits = obj(st.exhibits);
  out.stats.fail = { neuron: obj(st.fail).neuron | 0, boss: obj(st.fail).boss | 0 };
  out.stats.endCount = st.endCount | 0;
  out.boss.used = clamp(obj(raw.boss).used | 0, 0, 3);
  out.ping = Number.isFinite(raw.ping) ? raw.ping : 999;
  out.time = Number.isFinite(raw.time) ? raw.time : 0;
  const se = obj(raw.settings);
  out.settings = { sound: se.sound !== false, music: se.music !== false, reduced: typeof se.reduced === 'boolean' ? se.reduced : null, assist: !!se.assist };
  out.hints = obj(raw.hints);

  // Konzistentnost: kasniji koraci podrazumevaju ranije.
  const chain = ['cable', 'stamped', 'ping', 'neuron', 'cableAdmin', 'bossDone'];
  let broken = false;
  for (const c of chain) {
    if (broken) delete out.flags[c];
    else if (!out.flags[c]) broken = true;
  }
  if (out.flags.stamped) { out.flags.peroMet = true; out.flags.paper = true; }
  if (!out.flags.stamped) delete out.inv.potvrda;
  if (out.flags.cableAdmin) { out.flags.fragTip = out.flags.fragJudge = out.flags.fragChest = true; }
  out.ping = out.flags.ping ? 24 : 999;
  // Pozicija ne sme iza zatvorene kapije.
  let lim = WORLD_W - 50;
  for (const g of GATES) if (!(out.freeRoam || out.flags[g.flag])) { lim = g.x - 26; break; }
  out.x = clamp(out.x, 40, lim);
  return out;
}

export function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(key()) || 'null'); } catch { raw = null; }
  replace(sanitize(raw));
  return S.started;
}

function replace(next) {
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, next);
}

/** Novi početak: briše napredak, ali čuva podešavanja zvuka/pokreta. */
export function reset(keepSettings = true) {
  const settings = keepSettings ? { ...S.settings } : null;
  const endCount = S.stats.endCount;
  replace(defaults());
  if (settings) S.settings = settings;
  S.stats.endCount = endCount;
  saveNow();
  changed();
}

addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
