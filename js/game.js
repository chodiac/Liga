// Jezgro igre: jedna petlja, igrač, kamera, zajednička navigacija (tastatura + točkić/dodir),
// čestice, interakcije i iscrtavanje. Sadržaj sveta dolazi iz world.js (setWorld).
import { S, ui, flag, gateOpen, maxX, reduced, changed, setFlag } from './core/state.js';
import { input } from './core/input.js';
import { audio } from './core/audio.js';
import { WORLD_W, GY, GATES, ZONES, zoneAt } from './config/zones.js';
import { clamp, lerp, rand, easeOut, isTouchDevice } from './core/util.js';
import { drawChar } from './gfx/chars.js';
import { CHARACTERS } from './config/characters.js';
import { drawBackdrop, drawForeground } from './gfx/backdrop.js';
import { PROPS, keycap } from './gfx/props.js';
import { COL, text, box, poly, ell, glow } from './gfx/draw.js';
import { hint, flashHint } from './ui/hud.js';
import { dialogue } from './ui/dialogue.js';
import { TEXT } from './config/dialogue.js';

const LEAD = 520; // maksimalna udaljenost cilja kamere/šetnje od igrača
const SPEED = 255, GRAV = 2000, JUMP_V = 650;

export const G = {
  canvas: null, ctx: null, dpr: 1, scale: 1, cssW: 0, cssH: 0, viewW: 960, viewH: 540, offY: 0,
  t: 0, cam: { x: 0, shake: 0, focus: null },
  player: { x: 140, y: GY, vx: 0, vy: 0, ground: true, face: 1, phase: 0, squash: 0, squashAmt: 0, coyote: 0, buffer: 0, invuln: 0, stun: 0, spawn: 0, cheer: 0, hidden: false, mood: 'idle', jumpsThisAir: 0 },
  nav: { target: null },
  world: null,
  near: null,
  busy: false,
  zone: ZONES[0],
  banner: { text: '', t: 0 },
  particles: [],
  gates: GATES.map((g) => ({ ...g, p: 0, was: false, hint: '' })),
  objectiveTarget: () => null,
  onZone: () => {},
  lit: 0,
  quiet: false,
  spawnX: 140,
};

let lastT = 0, running = false, raf = 0, hintSince = 0, saveAcc = 0, gateMsgAt = 0, tutorialAt = 0;

// ------------------------------------------------------------------ pomoćne
export const worldToScreen = (x, y) => {
  const r = G.canvas.getBoundingClientRect();
  return { x: r.left + (x - G.cam.x) * G.scale * (r.width / G.cssW), y: r.top + (y + G.offY) * G.scale * (r.height / G.cssH) };
};

export function emit(kind, x, y, n = 6, o = {}) {
  const cap = reduced() ? 30 : G.quiet ? 70 : 150;
  n = reduced() ? Math.ceil(n / 3) : n;
  for (let i = 0; i < n && G.particles.length < cap; i++) {
    const p = { kind, x, y, vx: rand(-60, 60), vy: rand(-90, -10), g: 200, life: 0, max: rand(0.5, 1.1), c: COL.green, r: rand(2, 4), rot: rand(0, 6), vr: rand(-6, 6) };
    if (kind === 'smoke') Object.assign(p, { vx: rand(-14, 14), vy: rand(-50, -26), g: -10, max: rand(1.4, 2.4), r: rand(8, 15), c: 'rgba(120,128,160,.6)' });
    if (kind === 'spark') Object.assign(p, { vx: rand(-110, 110), vy: rand(-150, -30), g: 500, max: rand(0.3, 0.6), c: COL.yellow, r: 2.5 });
    if (kind === 'confetti') Object.assign(p, { vx: rand(-220, 220), vy: rand(-440, -140), g: 460, max: rand(1.6, 2.8), c: [COL.pink, COL.green, COL.yellow, COL.purple2, COL.teal][(Math.random() * 5) | 0], r: rand(3, 5.5) });
    if (kind === 'dust') Object.assign(p, { vx: rand(-40, 40), vy: rand(-40, -5), g: 20, max: rand(0.3, 0.6), c: 'rgba(200,205,235,.55)', r: rand(3, 6) });
    if (kind === 'star') Object.assign(p, { vx: rand(-40, 40), vy: rand(-70, -20), g: 0, max: rand(0.7, 1.3), c: COL.yellow, r: rand(3, 6) });
    if (kind === 'paper') Object.assign(p, { vx: rand(-160, 160), vy: rand(-300, -100), g: 300, max: rand(1.2, 2), c: COL.white, r: rand(4, 7) });
    Object.assign(p, o.over || {});
    if (o.color) p.c = o.color;
    G.particles.push(p);
  }
}

export function shake(a = 6) { if (!reduced()) G.cam.shake = Math.max(G.cam.shake, a); }

/** Kratko usmeri kameru na tačku (npr. kapija), pa se vrati. */
export function focusCam(x, ms = 1400) {
  if (reduced()) return;
  const f = clamp(x, G.player.x - LEAD, G.player.x + LEAD);
  G.cam.focus = { x: f, until: G.t + ms / 1000 };
}

export function banner(t) { G.banner.text = t; G.banner.t = 3; }

export function flash(kind = 'flash', ms = 120) {
  const fx = document.getElementById('fx');
  fx.className = kind === 'glitch' ? 'glitch' : kind === 'dark' ? 'on' : 'flash on';
  setTimeout(() => { fx.className = ''; }, ms);
}

/** Zatamni ekran, izvrši fn, pa vrati. */
export async function fadeThrough(fn) {
  const fx = document.getElementById('fx');
  const ms = reduced() ? 0 : 260;
  if (ms) { fx.className = 'on'; await new Promise((r) => setTimeout(r, ms)); }
  fn();
  if (ms) { await new Promise((r) => setTimeout(r, 120)); fx.className = ''; }
}

export function teleport(x) {
  const p = G.player;
  p.x = clamp(x, 40, maxX()); p.y = GY; p.vx = p.vy = 0; p.ground = true;
  G.nav.target = null;
  G.cam.x = clamp(p.x - G.viewW * 0.4, 0, WORLD_W - G.viewW);
  G.cam.focus = null;
  G.zone = zoneAt(p.x);
  S.x = p.x; changed();
}

export function setWorld(w) { G.world = w; }

export function hurtPlayer(dir) {
  const p = G.player;
  if (p.invuln > 0) return false;
  p.invuln = 1.6; p.stun = 0.35; p.vy = -380; p.vx = dir * 260; p.ground = false; p.mood = 'worry';
  audio.sfx('hit'); shake(7); emit('spark', p.x, p.y - 50, 8);
  return true;
}

// ------------------------------------------------------------------ interakcije
export function nearestInteractable() {
  if (!G.world) return null;
  const px = G.player.x;
  let best = null, bd = 1e9;
  for (const o of G.world.objects) {
    const a = o.act;
    if (!a || (a.show && !a.show(o))) continue;
    const d = Math.abs(o.x - px);
    if (d <= (a.range || 90) && d < bd) { best = o; bd = d; }
  }
  return best;
}

export async function interact(o) {
  if (!o || G.busy || !ui.play) return;
  G.busy = true;
  if (!S.hints.acted) { S.hints.acted = true; changed(); }
  dialogue.begin();
  try { await o.act.run(o); } catch (e) { console.error(e); } finally { G.busy = false; }
}

function tryAct() {
  if (!ui.play || G.busy || G.player.spawn > 0) return;
  audio.unlock();
  if (G.near) interact(G.near);
}

function tryJump() {
  audio.unlock();
  const p = G.player;
  if (!ui.play || p.spawn > 0 || p.stun > 0) return;
  p.buffer = 0.13;
}

// ------------------------------------------------------------------ navigacija (točkić / dodir)
function pushScroll(dy) {
  if (!ui.play || G.player.spawn > 0) return;
  const p = G.player;
  const base = G.nav.target == null ? p.x : G.nav.target;
  G.nav.target = clamp(base + clamp(dy, -240, 240) * 1.7, Math.max(40, p.x - LEAD), Math.min(maxX() + 8, p.x + LEAD));
}

function bindPointer() {
  const wrap = document.getElementById('stagewrap');
  wrap.addEventListener('wheel', (e) => {
    if (e.target.closest('.win,.dlg,.modal-bg')) return; // skrol unutar panela radi normalno
    e.preventDefault();
    if (ui.busy) return;
    audio.unlock();
    pushScroll(Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX);
  }, { passive: false });

  let ty = null, moved = 0;
  wrap.addEventListener('touchstart', (e) => { if (e.touches.length === 1) { ty = e.touches[0].clientY; moved = 0; } }, { passive: true });
  wrap.addEventListener('touchmove', (e) => {
    if (ty == null || e.target.closest('.win,.dlg,button')) return;
    const y = e.touches[0].clientY, dy = ty - y; ty = y; moved += Math.abs(dy);
    if (!ui.busy) pushScroll(dy * 2.2);
  }, { passive: true });
  wrap.addEventListener('touchend', () => { ty = null; });

  // klik na svet: stani pored objekta i interaguj, ili šetaj do tačke
  G.canvas.addEventListener('click', (e) => {
    if (!ui.play || moved > 14 || G.player.spawn > 0) return;
    audio.unlock();
    const r = G.canvas.getBoundingClientRect();
    const wx = (e.clientX - r.left) / r.width * G.viewW + G.cam.x;
    const wy = (e.clientY - r.top) / r.height * G.viewH - G.offY;
    let hit = null;
    for (const o of G.world.objects) {
      if (!o.act || (o.act.show && !o.act.show(o))) continue;
      const hw = o.hitW || 60, top = o.hitH || 140;
      if (Math.abs(wx - o.x) < hw && wy < (o.y || GY) + 10 && wy > (o.y || GY) - top) { hit = o; break; }
    }
    if (hit && Math.abs(hit.x - G.player.x) <= (hit.act.range || 90)) { interact(hit); return; }
    G.nav.target = clamp(hit ? hit.x : wx, Math.max(40, G.player.x - LEAD), Math.min(maxX() + 8, G.player.x + LEAD));
    if (hit) G.nav.pendingAct = hit; else G.nav.pendingAct = null;
  });
}

// ------------------------------------------------------------------ fizika igrača
function updatePlayer(dt) {
  const p = G.player;
  if (p.spawn > 0) { p.spawn -= dt; return; }
  const play = ui.play && !p.hidden;
  let axis = 0;
  if (play && p.stun <= 0) {
    axis = input.axis();
    if (axis !== 0) { G.nav.target = null; G.nav.pendingAct = null; }
    else if (G.nav.target != null) {
      const d = G.nav.target - p.x;
      if (Math.abs(d) < 10) {
        G.nav.target = null;
        if (G.nav.pendingAct) { const o = G.nav.pendingAct; G.nav.pendingAct = null; if (Math.abs(o.x - p.x) <= (o.act.range || 90)) interact(o); }
      } else axis = Math.sign(d) * (Math.abs(d) < 40 ? 0.55 : 1);
    }
  } else if (!play) G.nav.target = null;

  const lim = maxX();
  const target = axis * SPEED;
  p.vx = p.stun > 0 ? p.vx * Math.pow(0.02, dt) : lerp(p.vx, target, Math.min(1, dt * (p.ground ? 16 : 7)));
  if (axis !== 0) p.face = Math.sign(axis);
  p.x += p.vx * dt;
  if (p.x > lim) {
    p.x = lim; p.vx = Math.min(p.vx, 0);
    if (play && (axis > 0) && G.t - gateMsgAt > 3) { gateMsgAt = G.t; const g = GATES.find((gg) => !gateOpen(gg)); if (g) flashHint(G.gates.find((x) => x.id === g.id).hint, 3200); }
    if (G.nav.target != null && G.nav.target > lim) G.nav.target = null;
  }
  if (p.x < 40) { p.x = 40; p.vx = Math.max(p.vx, 0); }

  p.stun = Math.max(0, p.stun - dt); p.invuln = Math.max(0, p.invuln - dt);
  p.buffer = Math.max(0, p.buffer - dt);
  p.coyote = p.ground ? 0.1 : Math.max(0, p.coyote - dt);
  if (p.buffer > 0 && p.coyote > 0 && play) {
    p.vy = -JUMP_V; p.ground = false; p.coyote = 0; p.buffer = 0;
    S.stats.jumps++; audio.sfx('jump'); emit('dust', p.x, p.y, 4);
    p.squash = 0.2; p.squashAmt = -0.18; // istezanje pri odskoku
    if (S.stats.jumps === 25) G.world && G.world.onJump25 && G.world.onJump25();
    if (!S.hints.jumped) { S.hints.jumped = true; changed(); }
  }
  // gravitacija + platforme (jednosmerne)
  const prevY = p.y;
  p.vy += GRAV * dt;
  if (p.vy > 1100) p.vy = 1100;
  p.y += p.vy * dt;
  let floor = GY;
  if (G.world) for (const pl of G.world.platforms) {
    if (Math.abs(p.x - pl.x) < pl.w / 2 + 8 && prevY <= pl.y + 2 && p.y >= pl.y && pl.y < floor) floor = Math.min(floor, pl.y);
  }
  if (p.y >= floor) {
    if (!p.ground && p.vy > 260) { p.squash = 0.22; p.squashAmt = clamp(p.vy / 1400, 0.1, 0.35); emit('dust', p.x, floor, 5); audio.sfx('land'); }
    p.y = floor; p.vy = 0; p.ground = true;
  } else p.ground = false;
  // hodanje
  const sp = Math.abs(p.vx);
  p.phase += sp * dt * 0.052;
  p.squash = Math.max(0, p.squash - dt);
  if (p.ground && sp > 60 && Math.random() < dt * 5) emit('dust', p.x - p.face * 10, p.y, 1);
  p.cheer = Math.max(0, p.cheer - dt);
  p.mood = p.cheer > 0 ? 'cheer' : p.stun > 0 || p.invuln > 1 ? 'worry' : ui.has('dialogue') ? 'talk' : 'idle';
}

// ------------------------------------------------------------------ kamera
function updateCamera(dt) {
  const c = G.cam, p = G.player;
  let tx = p.x - G.viewW * 0.42 + p.face * 36 + (G.nav.target != null ? clamp((G.nav.target - p.x) * 0.28, -150, 150) : 0);
  if (c.focus) { if (G.t > c.focus.until) c.focus = null; else tx = c.focus.x - G.viewW / 2; }
  tx = clamp(tx, 0, Math.max(0, WORLD_W - G.viewW));
  c.x += (tx - c.x) * Math.min(1, dt * (reduced() ? 14 : c.focus ? 3.2 : 5.2));
  // igrač uvek ostaje blizu centra ekrana
  const m = Math.min(150, G.viewW * 0.22);
  if (!c.focus) c.x = clamp(c.x, p.x - G.viewW + m, p.x - m);
  c.x = clamp(c.x, 0, Math.max(0, WORLD_W - G.viewW));
  c.shake = Math.max(0, c.shake - dt * 22);
}

// ------------------------------------------------------------------ glavna petlja
function frame(ts) {
  raf = requestAnimationFrame(frame);
  if (document.hidden) { lastT = ts; return; }
  const dt = Math.min(0.05, (ts - lastT) / 1000 || 0.016);
  lastT = ts;
  G.t += dt;
  if (S.started && !ui.busy) S.time += dt;
  step(dt);
  render();
}

/** Ručni korak (za testiranje bez rAF-a). */
export function tick(dt = 1 / 60, n = 1) { for (let i = 0; i < n; i++) { G.t += dt; if (S.started && !ui.busy) S.time += dt; step(dt); } render(); }

function step(dt) {
  // kapije
  for (const g of G.gates) {
    const open = gateOpen(g);
    const tgt = open ? 1 : 0;
    if (open && !g.was && g.init) {
      audio.sfx('open'); focusCam(g.x, 1500); shake(4);
      emit('dust', g.x, GY, 14);
    }
    g.was = open; g.init = true;
    g.p += clamp(tgt - g.p, -dt * 0.8, dt * 0.8);
  }
  updatePlayer(dt);
  if (G.world) G.world.update(dt, G.t);
  updateCamera(dt);
  G.near = ui.play ? nearestInteractable() : null;

  // čestice
  const ps = G.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const q = ps[i];
    q.life += dt;
    if (q.life >= q.max) { ps[i] = ps[ps.length - 1]; ps.pop(); continue; }
    q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
  }
  // zona
  const z = zoneAt(G.player.x);
  if (z !== G.zone) { G.zone = z; banner(z.name); G.onZone(z); }
  G.banner.t = Math.max(0, G.banner.t - dt);

  // čuvanje pozicije
  saveAcc += dt;
  if (saveAcc > 1.5 && S.started && G.player.ground) { saveAcc = 0; if (Math.abs(S.x - G.player.x) > 30) { S.x = G.player.x; changed(); } }

  tutorial();
}

/** Kontrole se uče kroz prvu interakciju: pokazuju se tek kad zatrebaju. */
let tutShown = null;
function tutorial() {
  let want = null;
  if (S.started && ui.play && G.player.spawn <= 0) {
    const touch = isTouchDevice();
    if (!S.hints.moved) {
      if (Math.abs(G.player.x - G.spawnX) > 70) { S.hints.moved = true; changed(); }
      else if (G.t - tutorialAt > 1.2) want = touch ? TEXT.hints.moveTouch : TEXT.hints.move;
    } else if (G.near && !S.hints.acted) want = touch ? TEXT.hints.actTouch : TEXT.hints.act;
  }
  if (want !== tutShown) { tutShown = want; hint(want); }
}

// ------------------------------------------------------------------ iscrtavanje
function render() {
  const ctx = G.ctx, t = G.t, cam = G.cam;
  if (!ctx) return;
  const sh = cam.shake, sx = sh ? rand(-sh, sh) : 0, sy = sh ? rand(-sh, sh) : 0;
  const k = G.scale * G.dpr;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, G.viewW, G.viewH);
  ctx.translate(sx, G.offY + sy);
  const cx = Math.round(cam.x);

  drawBackdrop(ctx, cx, G.viewW, G.viewH, G.offY, t, G.lit, reduced());

  ctx.save();
  ctx.translate(-cx, 0);
  const x0 = cx - 280, x1 = cx + G.viewW + 280;

  const list = G.world ? G.world.drawList : [];
  let playerDrawn = false;
  for (const o of list) {
    if (o.x < x0 - (o.cull || 0) || o.x > x1 + (o.cull || 0)) continue;
    if (o.hidden && o.hidden(o)) continue;
    if (!playerDrawn && o.z > 0.5) { drawPlayer(ctx, t); playerDrawn = true; }
    ctx.save();
    ctx.translate(o.x, o.y == null ? GY : o.y);
    if (o.draw) o.draw(ctx, o, t); else if (PROPS[o.type]) PROPS[o.type](ctx, o, t);
    ctx.restore();
  }
  if (!playerDrawn) drawPlayer(ctx, t);

  // kapije
  for (const g of G.gates) {
    if (g.x < x0 || g.x > x1) continue;
    ctx.save(); ctx.translate(g.x, GY);
    PROPS.gate(ctx, { p: easeOut(g.p), style: g.style || 'firewall' }, t);
    ctx.restore();
  }

  if (G.world && G.world.drawFx) G.world.drawFx(ctx, t);

  // čestice
  for (const q of G.particles) {
    if (q.x < x0 || q.x > x1) continue;
    const a = 1 - q.life / q.max;
    ctx.globalAlpha = q.kind === 'smoke' ? a * 0.7 : Math.min(1, a * 1.6);
    ctx.fillStyle = q.c;
    if (q.kind === 'smoke') { ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 + q.life), 0, 6.3); ctx.fill(); }
    else if (q.kind === 'star') { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillRect(-q.r, -1.2, q.r * 2, 2.4); ctx.fillRect(-1.2, -q.r, 2.4, q.r * 2); ctx.restore(); }
    else if (q.kind === 'confetti' || q.kind === 'paper') { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillRect(-q.r, -q.r * 0.6, q.r * 2, q.r * 1.2); ctx.restore(); }
    else { ctx.fillRect(q.x - q.r / 2, q.y - q.r / 2, q.r, q.r); }
    ctx.globalAlpha = 1;
  }

  // interakcijski prompt + marker cilja
  if (G.near && ui.play) {
    const o = G.near, a = o.act, py = (o.y == null ? GY : o.y) - (o.promptY || 170);
    const pulse = Math.abs(Math.sin(t * 4)) * 5;
    keycap(ctx, isTouchDevice() ? 'TAP' : 'E', o.x, py, pulse);
    ctx.font = '12px "Arial Black", sans-serif';
    const label = typeof a.label === 'function' ? a.label(o) : a.label;
    if (label) {
      const w = ctx.measureText(label).width + 16;
      box(ctx, o.x - w / 2, py + 14 - pulse, w, 22, 6, COL.ink, 0);
      text(ctx, label, o.x, py + 26 - pulse, 12, COL.white);
    }
  }
  const ot = S.freeRoam ? null : G.objectiveTarget();
  if (ot != null && ui.play) {
    const sxp = ot - cam.x;
    if (sxp > 40 && sxp < G.viewW - 40) {
      if (!G.near || Math.abs((G.near.x) - ot) > 80) {
        const by = GY - (G.objY || 250) + Math.sin(t * 5) * 8;
        poly(ctx, [ot - 16, by - 26, ot + 16, by - 26, ot, by], COL.green, 4);
      }
    }
  }
  ctx.restore();

  drawForeground(ctx, cx, G.viewW, G.viewH, G.offY, t, G.lit, reduced());

  // marker izvan ekrana
  const ot2 = S.freeRoam ? null : G.objectiveTarget();
  if (ot2 != null && ui.play) {
    const sxp = ot2 - cam.x;
    if (sxp <= 40 || sxp >= G.viewW - 40) {
      const right = sxp > 0, ex = right ? G.viewW - 26 : 26, ey = GY - 120 + Math.sin(t * 5) * 6;
      ctx.save(); ctx.translate(ex, ey); if (!right) ctx.scale(-1, 1);
      poly(ctx, [-16, -18, 8, -18, 8, -28, 26, 0, 8, 28, 8, 18, -16, 18], COL.green, 4);
      ctx.restore();
    }
  }

  // naslov zone
  if (G.banner.t > 0 && S.started) {
    const a = Math.min(1, G.banner.t * 1.5, (3 - G.banner.t) * 3 + 0.2);
    ctx.globalAlpha = clamp(a, 0, 1);
    ctx.font = '22px "Arial Black", Impact, sans-serif';
    const w = ctx.measureText(G.banner.text).width + 40, y = -G.offY + (G.viewH > 600 ? 150 : 108);
    ctx.save(); ctx.translate(G.viewW / 2, y - (1 - clamp(a, 0, 1)) * 14); ctx.rotate(-0.012);
    box(ctx, -w / 2, -22, w, 44, 10, COL.ink, 0); box(ctx, -w / 2 - 3, -25, w, 44, 10, COL.purple, 4);
    text(ctx, G.banner.text, -3, -3, 22, COL.white);
    ctx.restore(); ctx.globalAlpha = 1;
  }
}

function drawPlayer(ctx, t) {
  const p = G.player;
  if (p.hidden) return;
  let a = 1, jx = 0;
  if (p.spawn > 0) { a = Math.random() < 0.6 ? 0.9 : 0.2; jx = rand(-6, 6) * (p.spawn / 1.3); }
  if (p.invuln > 0 && Math.floor(t * 18) % 2) a = 0.35;
  const air = !p.ground;
  const sq = p.squash > 0 ? p.squashAmt * Math.sin((p.squash / 0.22) * Math.PI * 0.5) : 0;
  // senka
  const h = clamp((GY - p.y) / 140, 0, 1);
  ctx.globalAlpha = 0.35 * (1 - h * 0.6);
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(p.x, (p.ground ? p.y : GY) + 2, 26 * (1 - h * 0.4), 7, 0, 0, 6.3); ctx.fill();
  ctx.globalAlpha = a;
  const speed = Math.abs(p.vx);
  drawChar(ctx, CHARACTERS.hero.look, p.x + jx, p.y, {
    face: p.face, t, phase: p.phase, walk: clamp(speed / SPEED, 0, 1), scale: 0.92, air,
    sx: 1 + sq, sy: 1 - sq * (sq > 0 ? 1 : 1), mood: p.mood, lean: clamp(p.vx / 2600, -0.1, 0.1) + (air ? -p.face * 0.05 : 0),
  });
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ init
export function resize() {
  const wrap = document.getElementById('stagewrap');
  const w = wrap.clientWidth, hh = wrap.clientHeight;
  if (!w || !hh) return;
  G.dpr = Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2);
  let scale = hh / 540;
  if (w / scale < 520) scale = w / 520;
  if (w / scale > 1100) scale = w / 1100; // preširok ekran: ne razvlači svet previše
  G.scale = scale; G.cssW = w / scale; G.cssH = hh / scale;
  G.viewW = w / scale; G.viewH = hh / scale; G.offY = Math.max(0, (G.viewH - 540) / 2 + (G.viewH - 540) / 2 * 0);
  G.offY = Math.max(0, G.viewH - 540);
  G.canvas.width = Math.round(w * G.dpr); G.canvas.height = Math.round(hh * G.dpr);
  document.body.classList.toggle('portrait', matchMedia('(max-aspect-ratio: 1/1)').matches);
  document.body.classList.toggle('landscape', !matchMedia('(max-aspect-ratio: 1/1)').matches);
}

export function initGame() {
  G.canvas = document.getElementById('stage');
  G.ctx = G.canvas.getContext('2d', { alpha: false });
  G.quiet = matchMedia('(pointer: coarse)').matches;
  resize();
  new ResizeObserver(resize).observe(document.getElementById('stagewrap'));
  addEventListener('orientationchange', () => setTimeout(resize, 150));
  bindPointer();
  input.on('act', tryAct);
  input.on('jump', tryJump);
  document.body.classList.toggle('touch', isTouchDevice());
  const actBtn = document.getElementById('t-act');
  setInterval(() => {
    if (!actBtn) return;
    const ready = !!G.near && ui.play;
    actBtn.classList.toggle('ready', ready); actBtn.classList.toggle('idle', !ready);
    const l = G.near && G.near.act ? (typeof G.near.act.label === 'function' ? G.near.act.label(G.near) : G.near.act.label) : '';
    actBtn.textContent = ready ? 'E' : 'E';
    actBtn.setAttribute('aria-label', ready ? `Akcija: ${l}` : 'Akcija');
  }, 200);
}

export function startLoop() {
  if (running) return;
  running = true;
  lastT = performance.now();
  raf = requestAnimationFrame(frame);
}

export function respawnAt(x) {
  const p = G.player;
  p.x = clamp(x, 40, maxX()); p.y = GY; p.vx = p.vy = 0; p.spawn = 1.3; p.ground = true;
  G.cam.x = clamp(p.x - G.viewW * 0.42, 0, WORLD_W - G.viewW);
  G.zone = zoneAt(p.x);
  tutorialAt = G.t; G.spawnX = p.x;
  audio.sfx('glitch');
  emit('spark', p.x, p.y - 60, 14, { color: COL.green });
}
