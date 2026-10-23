// Likovi: debeli obrisi, izražajna lica, hodanje, idle, skok, squash & stretch.
import { COL, box, ell, poly, limb, curve, paint, rrPath, text } from './draw.js';

const INK = COL.ink;

/**
 * Crta lika čija su STOPALA u (x, y).
 * o: face(1|-1) t phase walk(0..1) sx sy scale mood air lean arms blink hold
 * mood: idle | talk | cheer | worry | angry | sleepy | smug
 */
export function drawChar(ctx, look, x, y, o = {}) {
  const t = o.t || 0, face = o.face || 1, walk = o.walk || 0, phase = o.phase || 0, mood = o.mood || 'idle';
  const sc = o.scale || 1, sx = o.sx || 1, sy = o.sy || 1, air = !!o.air;
  const idleBob = Math.sin(t * 2.4 + (o.seed || 0)) * 1.6;
  const bob = air ? 0 : walk > 0.1 ? Math.abs(Math.sin(phase)) * 3.2 : idleBob;
  const lean = (o.lean || 0) + (walk > 0.1 ? 0.06 : 0);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face * sc * sx, sc * sy);
  const look_ = look;

  // senka dodaje scena; ovde samo lik
  const hipY = -36 - bob * 0.2;

  // ----- noge -----
  const legs = air
    ? [[-9, -8, 9], [9, 10, 2]]
    : [-1, 1].map((s) => { const ph = phase + (s < 0 ? 0 : Math.PI); return [s * 9, Math.sin(ph) * 14 * walk, Math.max(0, Math.cos(ph)) * walk * 7]; });
  for (const [lx, off, lift] of legs) {
    const fx = lx + off, fy = -4 - lift;
    limb(ctx, lx, hipY + 4, fx, fy - 4, 12, look_.bottom);
    ell(ctx, fx + 4, fy, 11, 6.5, look_.shoe, 3.5);
  }

  ctx.translate(0, -bob);
  ctx.rotate(lean);

  // kapuljača iza glave
  if (look_.headgear === 'hood') {
    ell(ctx, 0, -104, 33, 30, look_.topDark, 4);
  }

  // ----- zadnja ruka -----
  const armSwing = air ? -0.9 : Math.sin(phase + Math.PI) * walk * 0.9;
  const armsUp = mood === 'cheer' || o.arms === 'up';
  const shoulder = (sxp) => ({ x: sxp, y: -68 });
  const hand = (side, back) => {
    const s = shoulder(side * 21);
    if (armsUp) return { x: s.x + side * 10, y: s.y - 30 + Math.sin(t * 9 + side) * 4, sx: s.x, sy: s.y };
    const a = armSwing * (back ? -1 : 1);
    if (back) return { x: s.x - 2 + Math.sin(a) * 14, y: s.y + 28 - Math.abs(Math.cos(a)) * 2, sx: s.x, sy: s.y };
    if (mood === 'talk') return { x: s.x + 14 + Math.sin(t * 7) * 6, y: s.y + 14 + Math.sin(t * 5) * 6, sx: s.x, sy: s.y };
    return { x: s.x + 8 + Math.sin(a) * 14, y: s.y + 26, sx: s.x, sy: s.y };
  };
  const hb = hand(-1, true);
  limb(ctx, hb.sx, hb.sy, hb.x, hb.y, 10, look_.topDark);
  ell(ctx, hb.x, hb.y + 2, 6, 6, look_.skin, 3);

  // ----- torzo -----
  box(ctx, -21, -80, 42, 50, 14, look_.top, 4);
  // detalji odeće
  const acc = look_.accessory;
  if (acc === 'tie') { poly(ctx, [-4, -78, 4, -78, 6, -62, 0, -34, -6, -62], COL.red, 3); }
  if (acc === 'vest') { ctx.fillStyle = COL.yellow; ctx.fillRect(-14, -78, 7, 46); ctx.fillRect(7, -78, 7, 46); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(-14, -78, 7, 46); ctx.strokeRect(7, -78, 7, 46); }
  if (acc === 'strap') { ctx.beginPath(); ctx.moveTo(-18, -78); ctx.lineTo(18, -36); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = COL.purple; ctx.lineWidth = 5; ctx.stroke(); box(ctx, 6, -52, 18, 15, 4, COL.purple2, 3); }
  if (look_.headgear === 'hood') { box(ctx, -12, -50, 24, 14, 6, look_.topDark, 3); ctx.beginPath(); ctx.moveTo(-6, -78); ctx.lineTo(-6, -64); ctx.moveTo(6, -78); ctx.lineTo(6, -64); ctx.strokeStyle = COL.white; ctx.lineWidth = 3; ctx.stroke(); }

  // ----- glava -----
  ell(ctx, 0, -102, 29, 26, look_.skin, 4);
  ell(ctx, -28, -100, 5, 7, look_.skin, 3);
  ell(ctx, 28, -100, 5, 7, look_.skin, 3);

  // kosa
  const ht = look_.hairType;
  if (ht === 'spiky') { ctx.beginPath(); ctx.moveTo(-26, -112); ctx.lineTo(-22, -138); ctx.lineTo(-10, -122); ctx.lineTo(-2, -144); ctx.lineTo(8, -124); ctx.lineTo(20, -140); ctx.lineTo(26, -112); ctx.quadraticCurveTo(0, -124, -26, -112); paint(ctx, look_.hair, 4); }
  if (ht === 'bowl') { ctx.beginPath(); ctx.moveTo(-28, -100); ctx.quadraticCurveTo(-30, -134, 0, -134); ctx.quadraticCurveTo(30, -134, 28, -100); ctx.lineTo(24, -112); ctx.quadraticCurveTo(0, -120, -24, -112); ctx.closePath(); paint(ctx, look_.hair, 4); }
  if (ht === 'wig') { for (let i = -2; i <= 2; i++) ell(ctx, i * 12, -122 + Math.abs(i) * 4, 12, 12, '#f4f6ff', 3.5); ell(ctx, -30, -100, 9, 14, '#f4f6ff', 3.5); ell(ctx, 30, -100, 9, 14, '#f4f6ff', 3.5); }
  if (ht === 'bald') { ctx.beginPath(); ctx.ellipse(-10, -118, 8, 4, -0.3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(); }

  // ----- lice -----
  const blinkT = (t + (o.seed || 0)) % 4.2;
  const blink = o.blink != null ? o.blink : blinkT > 4.05 ? 0.1 : 1;
  const eyeY = -104, ex = 11, look_dx = 2.5;
  const sleepy = mood === 'sleepy';
  const eyeH = (sleepy ? 4.5 : 9) * blink;
  for (const s of [-1, 1]) {
    ell(ctx, s * ex, eyeY, 8, Math.max(eyeH, 1.2), COL.white, 3);
    if (blink > 0.3) ell(ctx, s * ex + look_dx, eyeY + (sleepy ? 1 : 0), 3.6, Math.min(4.4, eyeH), INK, 0);
  }
  // obrve
  ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.lineCap = 'round';
  const brow = (s, a, b) => { ctx.beginPath(); ctx.moveTo(s * ex - 8, eyeY - 14 + a); ctx.lineTo(s * ex + 8, eyeY - 14 + b); ctx.stroke(); };
  if (mood === 'angry') { brow(-1, -4, 3); brow(1, 3, -4); }
  else if (mood === 'worry') { brow(-1, 3, -3); brow(1, -3, 3); }
  else if (mood === 'cheer') { brow(-1, -4, -4); brow(1, -4, -4); }
  else if (mood === 'smug') { brow(-1, 0, 0); brow(1, -5, -2); }
  else if (!look_.glasses) { brow(-1, 0, -1); brow(1, -1, 0); }
  // kese ispod očiju
  if (look_.bags) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, eyeY + 8, 8, 0.2, Math.PI - 0.2); ctx.strokeStyle = '#6b4a8c'; ctx.lineWidth = 3; ctx.stroke(); } }
  // nos
  ell(ctx, 4, -96, 4, 3.5, look_.skin === '#f0c6a0' ? '#e3ae86' : '#d9a07a', 2.5);
  // brkovi
  if (look_.mustache) { ctx.beginPath(); ctx.moveTo(-14, -90); ctx.quadraticCurveTo(-6, -98, 2, -90); ctx.quadraticCurveTo(10, -98, 16, -90); ctx.quadraticCurveTo(8, -84, 2, -88); ctx.quadraticCurveTo(-6, -84, -14, -90); paint(ctx, '#3b3b4c', 3); }
  // usta
  const my = -84;
  if (mood === 'talk') { const o2 = 3 + Math.abs(Math.sin(t * 10)) * 5; ell(ctx, 2, my + 1, 7, o2, '#5a1a32', 3); }
  else if (mood === 'cheer') { ctx.beginPath(); ctx.moveTo(-10, my - 4); ctx.quadraticCurveTo(2, my + 14, 14, my - 4); ctx.closePath(); paint(ctx, '#5a1a32', 3); }
  else if (mood === 'worry' || mood === 'angry') { ctx.beginPath(); ctx.moveTo(-7, my + 3); ctx.quadraticCurveTo(2, my - 4, 11, my + 3); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); }
  else if (look_.mustache) { /* brkovi pokrivaju */ }
  else { ctx.beginPath(); ctx.moveTo(-6, my - 1); ctx.quadraticCurveTo(3, my + (mood === 'smug' ? 3 : 6), 12, my - (mood === 'smug' ? 4 : 1)); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); }

  // naočare
  if (look_.glasses === 'round') { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex + 1, eyeY, 12, 0, Math.PI * 2); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fill(); } ctx.beginPath(); ctx.moveTo(-1, eyeY); ctx.lineTo(3, eyeY); ctx.stroke(); }
  if (look_.glasses === 'goggles') { ctx.beginPath(); ctx.moveTo(-29, eyeY - 14); ctx.lineTo(29, eyeY - 14); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = '#6b7aa8'; ctx.lineWidth = 4; ctx.stroke(); for (const s of [-1, 1]) { ell(ctx, s * 12, eyeY - 14, 11, 9, 'rgba(120,230,255,.75)', 3.5); } }

  // pokrivala
  const hg = look_.headgear;
  if (hg === 'headphones') { ctx.beginPath(); ctx.arc(0, -104, 31, Math.PI * 1.02, Math.PI * 1.98); ctx.strokeStyle = INK; ctx.lineWidth = 11; ctx.stroke(); ctx.strokeStyle = COL.purple; ctx.lineWidth = 5; ctx.stroke(); box(ctx, -37, -112, 12, 24, 5, COL.purple, 3.5); box(ctx, 25, -112, 12, 24, 5, COL.purple, 3.5); }
  if (hg === 'official') { ell(ctx, 4, -122, 32, 6, '#1d2340', 4); rrPath(ctx, -24, -140, 48, 22, 8); paint(ctx, '#2a3366', 4); ell(ctx, 4, -126, 6, 5, COL.yellow, 2.5); }
  if (hg === 'helmet') { ctx.beginPath(); ctx.moveTo(-31, -112); ctx.quadraticCurveTo(-30, -142, 0, -142); ctx.quadraticCurveTo(30, -142, 31, -112); ctx.closePath(); paint(ctx, COL.yellow, 4); box(ctx, -36, -116, 72, 9, 4, COL.yellow2, 3.5); box(ctx, -6, -150, 12, 12, 4, '#fff7c2', 3); }
  if (hg === 'hood') { ctx.beginPath(); ctx.moveTo(-30, -96); ctx.quadraticCurveTo(-34, -138, 0, -136); ctx.quadraticCurveTo(34, -138, 30, -96); ctx.quadraticCurveTo(26, -116, 0, -118); ctx.quadraticCurveTo(-26, -116, -30, -96); paint(ctx, look_.top, 4); }

  // ----- prednja ruka (+ predmet) -----
  const hf = hand(1, false);
  limb(ctx, hf.sx, hf.sy, hf.x, hf.y, 10, look_.top);
  ell(ctx, hf.x, hf.y + 2, 6.5, 6.5, look_.skin, 3);
  const hold = o.hold !== undefined ? o.hold : look_.hold;
  if (hold) drawHeld(ctx, hold, hf.x, hf.y, t, mood);

  ctx.restore();
}

function drawHeld(ctx, kind, hx, hy, t, mood) {
  ctx.save();
  ctx.translate(hx, hy);
  if (kind === 'stamp') { ctx.rotate(Math.sin(t * 1.4) * 0.05 - 0.1); box(ctx, -7, -26, 14, 8, 3, '#7a4a2a', 3); box(ctx, -5, -20, 10, 20, 4, '#9b5f36', 3); box(ctx, -12, -2, 24, 8, 3, COL.red, 3); }
  if (kind === 'wrench') { ctx.rotate(0.6 + Math.sin(t * 2) * 0.1); box(ctx, -4, -30, 8, 36, 4, COL.grey, 3); ell(ctx, 0, -32, 10, 9, COL.grey, 3); ell(ctx, 0, -35, 4, 4, '#0d1230', 0); }
  if (kind === 'can') { box(ctx, -7, -20, 14, 24, 4, COL.green, 3); ctx.fillStyle = INK; ctx.fillRect(-4, -12, 8, 5); box(ctx, -7, -22, 14, 5, 2, COL.grey, 2.5); }
  if (kind === 'gavel') { ctx.rotate(-0.6 + Math.sin(t * 3) * 0.1); box(ctx, -3, -26, 6, 28, 3, '#9b5f36', 3); box(ctx, -12, -34, 24, 12, 4, '#7a4a2a', 3); }
  ctx.restore();
}

/** Mali robot (botovi iz pozadine, kustos...) */
export function drawBot(ctx, x, y, t, o = {}) {
  const face = o.face || 1, c = o.color || COL.teal, wob = Math.sin(t * 6 + (o.seed || 0)) * (o.moving ? 2 : 0.8);
  ctx.save();
  ctx.translate(x, y); ctx.scale(face * (o.scale || 1), (o.scale || 1));
  // točkovi
  ell(ctx, -14, -8, 8, 8, COL.char2, 3.5); ell(ctx, 14, -8, 8, 8, COL.char2, 3.5);
  box(ctx, -22, -50 + wob, 44, 36, 10, c, 4);
  box(ctx, -17, -44 + wob, 34, 14, 6, '#0d1230', 3);
  ell(ctx, -7, -37 + wob, 4, 4, COL.green, 0); ell(ctx, 7, -37 + wob, 4, 4, COL.green, 0);
  ctx.beginPath(); ctx.moveTo(0, -50 + wob); ctx.lineTo(0, -62 + wob); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke();
  ell(ctx, 0, -64 + wob, 4.5, 4.5, (t * 3 | 0) % 2 ? COL.red : COL.yellow, 3);
  ctx.restore();
}

/** Prevelika Trava (boss). hp 0..1 "motivacija", hit = flash */
export function drawGrass(ctx, x, y, t, o = {}) {
  const motiv = o.motiv == null ? 1 : o.motiv, flash = o.flash || 0, sc = o.scale || 1, defeated = !!o.defeated;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc * (1 + Math.sin(t * 2) * 0.012));
  const green = flash > 0 ? '#e9ffb0' : '#5fd13a', dark = '#3a9a22';
  // vlati
  const blades = 11;
  for (let i = 0; i < blades; i++) {
    const a = -1 + (i / (blades - 1)) * 2;
    const hgt = 140 + (1 - Math.abs(a)) * 120 + Math.sin(i * 7.3) * 20;
    const sway = Math.sin(t * 1.6 + i * 0.9) * 10 * (0.4 + motiv * 0.6);
    const droop = (1 - motiv) * 50;
    const bx = a * 90;
    ctx.beginPath();
    ctx.moveTo(bx - 16, 0);
    ctx.quadraticCurveTo(bx - 10 + sway * 0.5, -hgt * 0.5, bx + a * 18 + sway + droop * a, -hgt + droop);
    ctx.quadraticCurveTo(bx + 12 + sway * 0.5, -hgt * 0.5, bx + 16, 0);
    ctx.closePath();
    paint(ctx, i % 2 ? green : dark, 4.5);
  }
  // telo
  ctx.beginPath(); ctx.ellipse(0, -52, 112, 62, 0, Math.PI, 0); ctx.lineTo(112, 0); ctx.lineTo(-112, 0); ctx.closePath(); paint(ctx, green, 5);
  // lice
  const blinkE = (t % 3.6) > 3.45 ? 0.15 : 1;
  for (const s of [-1, 1]) { ell(ctx, s * 38, -64, 22, 24 * blinkE, COL.white, 4); ell(ctx, s * 38 - 4, -62, 9, 11 * blinkE, INK, 0); }
  // obrve - preterano vesele, posle tuga
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 38 - 20, -94 + (s < 0 ? 4 : 0) - (1 - motiv) * 8 * (s < 0 ? -1 : 1)); ctx.lineTo(s * 38 + 20, -94 + (s < 0 ? 0 : 4) + (1 - motiv) * 8 * (s < 0 ? -1 : 1)); ctx.stroke(); }
  // osmeh -> kriva
  const smile = defeated ? -0.5 : motiv > 0.5 ? 1 : motiv > 0.2 ? 0.2 : -0.4;
  ctx.beginPath(); ctx.moveTo(-42, -30); ctx.quadraticCurveTo(0, -30 + 44 * smile, 42, -30);
  if (smile > 0.3) { ctx.closePath(); paint(ctx, '#5a1a32', 4.5); ctx.fillStyle = COL.white; ctx.fillRect(-26, -29, 52, 7); } else { ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke(); }
  // cveće
  ell(ctx, -84, -86, 9, 9, COL.yellow, 3.5); ell(ctx, -84, -86, 3.5, 3.5, COL.orange, 0);
  ell(ctx, 88, -78, 8, 8, COL.pink, 3.5);
  // sunčane naočare koje se izgube
  if (motiv > 0.66 && !defeated) { box(ctx, -66, -78, 58, 22, 8, 'rgba(10,13,28,.9)', 3); box(ctx, 8, -78, 58, 22, 8, 'rgba(10,13,28,.9)', 3); }
  ctx.restore();
}

export function labelTag(ctx, s, x, y) {
  ctx.font = '12px "Arial Black", sans-serif';
  const w = ctx.measureText(s).width + 16;
  box(ctx, x - w / 2, y - 11, w, 22, 6, COL.ink, 0);
  text(ctx, s, x, y + 1, 12, COL.white);
}

export { curve };
