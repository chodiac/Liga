// Lagan WebAudio (sintisajzer, bez fajlova). Počinje tek posle korisničkog gesta.
import { S } from './state.js';

let ctx = null, master = null, sfxBus = null, musBus = null, timer = 0, step = 0, nextT = 0, musicMode = 'ambient';
let lastBlip = 0;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.5; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0.35; musBus.connect(master);
  } catch { ctx = null; }
  return ctx;
}

function tone(f, dur, type = 'square', vol = 0.15, slide = 0, delay = 0, bus = sfxBus) {
  if (!ctx || !bus) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.03);
}

function noise(dur, vol = 0.1, delay = 0) {
  if (!ctx) return;
  const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), g = ctx.createGain();
  s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(sfxBus);
  s.start(ctx.currentTime + delay);
}

const SFX = {
  jump: () => tone(300, 0.14, 'square', 0.1, 380),
  land: () => tone(120, 0.08, 'triangle', 0.14, -60),
  pick: () => { tone(660, 0.08, 'square', 0.1); tone(990, 0.12, 'square', 0.1, 0, 0.07); },
  ach: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'square', 0.1, 0, i * 0.09)),
  stamp: () => { tone(90, 0.16, 'sawtooth', 0.2, -40); noise(0.1, 0.18); },
  bad: () => { tone(220, 0.14, 'sawtooth', 0.12, -90); tone(160, 0.18, 'sawtooth', 0.12, -80, 0.12); },
  ok: () => { tone(520, 0.1, 'triangle', 0.14); tone(780, 0.14, 'triangle', 0.14, 0, 0.08); },
  ping: () => { tone(880, 0.07, 'sine', 0.12); tone(1320, 0.1, 'sine', 0.1, 0, 0.07); },
  hit: () => { noise(0.18, 0.2); tone(110, 0.2, 'sawtooth', 0.18, -60); },
  bell: () => { tone(1400, 0.45, 'sine', 0.16); tone(2100, 0.35, 'sine', 0.08); },
  open: () => { tone(140, 0.5, 'sawtooth', 0.1, 120); noise(0.3, 0.06); },
  glitch: () => { noise(0.22, 0.14); tone(80, 0.2, 'square', 0.12, 300); },
  click: () => tone(700, 0.04, 'square', 0.06),
  blip: () => { const n = performance.now(); if (n - lastBlip < 55) return; lastBlip = n; tone(380 + Math.random() * 120, 0.035, 'square', 0.035); },
  win: () => [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.22, 'square', 0.1, 0, i * 0.1)),
  boom: () => { noise(0.5, 0.25); tone(70, 0.5, 'sawtooth', 0.2, -30); },
  catch: () => tone(900, 0.07, 'triangle', 0.12, 300),
  warn: () => tone(500, 0.1, 'square', 0.07, -100),
};

// Muzika: kratak, tih loop. "ambient" (molski) i "victory" (durski, brži).
const SCALES = {
  ambient: { base: 110, bass: [0, 0, -5, -5, -3, -3, -7, -7], lead: [12, 15, 17, 19, 22, 24], bpm: 98, p: 0.45 },
  victory: { base: 130.8, bass: [0, 0, 5, 5, 7, 7, 3, 3], lead: [12, 16, 19, 24, 28, 31], bpm: 128, p: 0.8 },
};
const hz = (base, semi) => base * Math.pow(2, semi / 12);

function schedule() {
  if (!ctx || !S.settings.music) return;
  const cfg = SCALES[musicMode], dur = 60 / cfg.bpm / 2;
  while (nextT < ctx.currentTime + 0.35) {
    const d = nextT - ctx.currentTime;
    const i = step % 8;
    if (step % 2 === 0) tone(hz(cfg.base, cfg.bass[i]), dur * 1.8, 'triangle', 0.16, 0, Math.max(0, d), musBus);
    if (Math.random() < cfg.p) tone(hz(cfg.base * 2, cfg.lead[(Math.random() * cfg.lead.length) | 0] - 12), dur * 1.3, musicMode === 'victory' ? 'square' : 'sine', 0.06, 0, Math.max(0, d), musBus);
    step++;
    nextT += dur;
  }
}

function startMusic() {
  if (timer || !ctx) return;
  nextT = ctx.currentTime + 0.1;
  timer = setInterval(schedule, 120);
}
function stopMusic() { clearInterval(timer); timer = 0; }

export const audio = {
  /** Poziva se iz korisničkog gesta (klik/tap/tipka). */
  unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    this.refresh();
  },
  refresh() {
    if (!ctx) return;
    master.gain.value = S.settings.sound ? 1 : 0;
    if (S.settings.sound && S.settings.music && !document.hidden) startMusic(); else stopMusic();
  },
  sfx(name) { if (ctx && S.settings.sound && SFX[name]) SFX[name](); },
  music(mode) { musicMode = mode; },
  get ready() { return !!ctx; },
};

document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) { stopMusic(); ctx.suspend(); } else { ctx.resume(); audio.refresh(); }
});
