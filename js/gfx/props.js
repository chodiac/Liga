// Rekviziti sveta. Svaka funkcija crta relativno na (0,0) = sredina podnožja objekta.
import { COL, box, ell, poly, limb, curve, paint, rrPath, text, glow, svgImage } from './draw.js';
import { flag, S } from '../core/state.js';
import { ICONS } from '../config/memes.js';

const INK = COL.ink;
const blink = (t, rate = 3, off = 0) => ((t * rate + off) | 0) % 2 === 0;

function led(ctx, x, y, on, col) { ell(ctx, x, y, 3.4, 3.4, on ? col : '#2a3045', 2); }

export const PROPS = {
  // ---------------------------------------------------------------- LOBI
  serverTower(ctx, o, t) {
    const fixed = flag('cable');
    ctx.save(); ctx.rotate(-0.045);
    box(ctx, -58, -218, 116, 218, 10, COL.char2, 5);
    for (let i = 0; i < 6; i++) {
      const y = -206 + i * 34;
      box(ctx, -48, y, 96, 26, 5, '#0d1230', 3);
      for (let k = 0; k < 4; k++) led(ctx, -36 + k * 12, y + 13, fixed ? blink(t, 4, i + k) : (i + k) % 3 === 0 ? blink(t, 2, i) : false, fixed ? COL.green : COL.red);
      ctx.fillStyle = '#3a4260'; ctx.fillRect(10, y + 8, 30, 3); ctx.fillRect(10, y + 15, 22, 3);
    }
    // pukotina i nalepnica
    ctx.beginPath(); ctx.moveTo(30, -218); ctx.lineTo(20, -190); ctx.lineTo(34, -170); ctx.lineTo(24, -140);
    ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke();
    box(ctx, -52, -26, 40, 18, 3, COL.yellow, 2.5);
    text(ctx, 'NE GASI', -32, -17, 9, INK);
    ctx.restore();
  },

  giantCable(ctx, o, t) {
    const fixed = flag('cable');
    // veliki neutaknuti kabl koji leži preko tla
    curve(ctx, [0, -30, 120, 6, 160, -70, 280, -22], 24, COL.purple2, 4.5);
    curve(ctx, [280, -22, 340, 2, 400, -38, 470, -12], 24, COL.purple2, 4.5);
    // utikač
    ctx.save(); ctx.translate(470 + (fixed ? -4 : 0), -12); ctx.rotate(fixed ? 0 : 0.25);
    box(ctx, -4, -22, 46, 44, 8, COL.char, 4.5);
    box(ctx, 40, -14, 16, 8, 2, COL.yellow, 3); box(ctx, 40, 6, 16, 8, 2, COL.yellow, 3);
    ctx.restore();
    if (!fixed && blink(t, 6)) { // varnice
      ctx.strokeStyle = COL.yellow; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(536, -14); ctx.lineTo(548, -26); ctx.lineTo(542, -10); ctx.lineTo(556, -20); ctx.stroke();
    }
  },

  monitorDesk(ctx, o, t) {
    box(ctx, -70, -50, 140, 50, 8, '#3a2f24', 4.5);
    box(ctx, -60, -46, 120, 8, 3, '#5a4733', 0);
    box(ctx, -42, -124, 84, 70, 10, COL.char2, 4.5);
    box(ctx, -34, -116, 68, 54, 4, '#071022', 3);
    const lines = flag('cable') ? ['Sve radi', 'kod mene.', '(jedva)'] : ['Sve radi', 'kod mene.'];
    lines.forEach((l, i) => text(ctx, l, 0, -102 + i * 16, 12, COL.green));
    if (blink(t, 2)) { ctx.fillStyle = COL.green; ctx.fillRect(22, -83 + (lines.length - 2) * 16, 8, 3); }
    box(ctx, -12, -54, 24, 6, 2, COL.grey2, 3);
  },

  crookedSign(ctx, o, t) {
    ctx.fillStyle = INK; ctx.fillRect(-4, -100, 8, 100);
    ctx.save(); ctx.translate(0, -110); ctx.rotate(0.12 + Math.sin(t * 0.8) * 0.01);
    box(ctx, -86, -28, 172, 56, 8, COL.yellow, 4.5);
    text(ctx, 'Dobrodošao.', 0, -9, 17, INK);
    text(ctx, 'Nažalost.', 0, 12, 17, COL.red);
    ctx.restore();
  },

  portal(ctx, o, t) {
    const a = o.alpha == null ? 1 : o.alpha;
    ctx.globalAlpha = a;
    glow(ctx, 0, -80, 120, COL.purple, 0.55);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.ellipse(0, -80, 34 + i * 8 + Math.sin(t * 3 + i) * 2, 72 + i * 6, 0, 0, Math.PI * 2);
      ctx.strokeStyle = [COL.green, COL.purple2, COL.pink][i]; ctx.lineWidth = 5 - i; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(88,101,242,.35)'; ctx.beginPath(); ctx.ellipse(0, -80, 36, 70, 0, 0, Math.PI * 2); ctx.fill();
    // glič trake
    for (let i = 0; i < 5; i++) { const y = -140 + ((t * 40 + i * 31) % 120); ctx.fillStyle = i % 2 ? COL.green : COL.pink; ctx.globalAlpha = a * 0.7; ctx.fillRect(-30 + (i * 13) % 20, y, 24 + (i * 7) % 20, 3); }
    ctx.globalAlpha = 1;
  },

  looseCable(ctx, o, t) {
    if (o.taken) return;
    const pulse = 0.5 + Math.sin(t * 5) * 0.5;
    glow(ctx, 0, -18, 60, COL.green, 0.25 + pulse * 0.3);
    ctx.save(); ctx.translate(0, Math.sin(t * 3) * 3);
    curve(ctx, [-34, -10, -18, -42, 12, 14, 34, -20], 9, COL.green, 3.5);
    box(ctx, 28, -34, 18, 20, 4, COL.yellow, 3.5);
    box(ctx, 44, -30, 8, 5, 1, COL.grey, 2); box(ctx, 44, -22, 8, 5, 1, COL.grey, 2);
    ctx.restore();
  },

  crate(ctx, o) {
    const w = o.w || 70, h = o.h || 70;
    box(ctx, -w / 2, -h, w, h, 6, '#6d4c33', 4.5);
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h + 6); ctx.lineTo(w / 2 - 6, -6); ctx.moveTo(w / 2 - 6, -h + 6); ctx.lineTo(-w / 2 + 6, -6); ctx.stroke();
    if (o.label) text(ctx, o.label, 0, -h / 2, 10, COL.white, 'center', 3);
  },

  ledge(ctx, o, t) {
    const w = o.w, col = o.col || COL.char2;
    box(ctx, -w / 2, 0, w, 16, 5, col, 4);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-w / 2 + 6, 3, w - 12, 3);
    ctx.strokeStyle = INK; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-w / 2 + 14, 16); ctx.lineTo(-w / 2 + 14, 40); ctx.moveTo(w / 2 - 14, 16); ctx.lineTo(w / 2 - 14, 40); ctx.stroke();
  },

  sticker(ctx, o, t) {
    if (S.secrets.nalepnica) return;
    ctx.save(); ctx.translate(0, -24 + Math.sin(t * 3) * 3); ctx.rotate(Math.sin(t * 2) * 0.2);
    glow(ctx, 0, 0, 40, COL.yellow, 0.5);
    const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 20, a = (i / 10) * Math.PI * 2 - Math.PI / 2; pts.push(Math.cos(a) * r, Math.sin(a) * r); }
    poly(ctx, pts, COL.yellow, 3.5);
    ctx.restore();
  },

  fakeDoor(ctx, o, t) {
    box(ctx, -34, -120, 68, 120, 6, '#2c3350', 4.5);
    box(ctx, -26, -112, 52, 104, 4, '#1b2030', 3);
    ell(ctx, 16, -58, 4, 4, COL.yellow, 2.5);
    ctx.save(); ctx.translate(0, -140); ctx.rotate(-0.06);
    box(ctx, -52, -16, 104, 30, 6, COL.pink, 4);
    text(ctx, 'TAJNA →', 0, -1, 15, COL.white, 'center', 3);
    ctx.restore();
  },

  wallBricks(ctx, o, t) {
    // levi zid sveta (leđa okrenuta) sa grafitom
    box(ctx, -50, -380, 100, 380, 0, '#1a2145', 0);
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2;
    for (let y = -380; y < 0; y += 30) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(50, y); ctx.stroke(); for (let x = -50 + ((y / 30) & 1) * 25; x < 50; x += 50) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 30); ctx.stroke(); } }
    ctx.save(); ctx.translate(0, -150); ctx.rotate(-0.15); text(ctx, 'ZID', 0, 0, 30, COL.pink, 'center', 5); ctx.restore();
    ctx.lineWidth = 3.5; ctx.strokeStyle = COL.green; ctx.beginPath(); ctx.arc(-10, -104, 8, 0, 6.3); ctx.moveTo(-10, -96); ctx.lineTo(-10, -72); ctx.moveTo(-26, -88); ctx.lineTo(6, -88); ctx.moveTo(-10, -72); ctx.lineTo(-22, -52); ctx.moveTo(-10, -72); ctx.lineTo(2, -52); ctx.stroke();
  },

  // ---------------------------------------------------------------- KAPIJE
  gate(ctx, o, t) {
    const p = o.p, st = o.style;
    const H = 250;
    if (st === 'firewall') {
      // stubovi
      box(ctx, -34, -H - 10, 14, H + 10, 4, COL.char2, 4); box(ctx, 20, -H - 10, 14, H + 10, 4, COL.char2, 4);
      if (p < 1) {
        const h = H * (1 - p);
        for (let r = 0; r < Math.ceil(h / 30); r++) {
          const y = -30 - r * 30, w = 48;
          const off = (r % 2) * 10 + Math.sin(t * 6 + r) * (p > 0 ? 8 + p * 40 : 1.5);
          box(ctx, -24 + off * (p > 0 ? 1 : 0.3), y, w, 28, 3, r % 3 === 0 ? '#ff7a3d' : '#d63d2e', 3.5);
        }
        if (p === 0) { for (let i = 0; i < 4; i++) { const fx = -16 + i * 11, fh = 18 + Math.abs(Math.sin(t * 7 + i * 2)) * 18; poly(ctx, [fx - 6, -H, fx + 6, -H, fx, -H - fh], COL.yellow, 2.5); } text(ctx, 'ZAŠTITNI', 0, -H + 36, 10, COL.white, 'center', 3); text(ctx, 'ZID', 0, -H + 52, 10, COL.white, 'center', 3); }
      }
    } else if (st === 'ministry') {
      box(ctx, -40, -120, 18, 120, 4, COL.grey, 4);
      box(ctx, 22, -90, 18, 90, 4, COL.grey, 4);
      ctx.save(); ctx.translate(-30, -104); ctx.rotate(-p * 1.35);
      box(ctx, 0, -9, 76, 18, 3, COL.white, 4);
      ctx.fillStyle = COL.red; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(10 + i * 24, -8); ctx.lineTo(24 + i * 24, -8); ctx.lineTo(14 + i * 24, 8); ctx.lineTo(0 + i * 24 + 6, 8); ctx.fill(); }
      ctx.restore();
      if (p < 1) { ctx.save(); ctx.translate(34, -110); ctx.rotate(0.05); box(ctx, -52, -34, 104, 38, 4, COL.yellow, 3.5); text(ctx, 'ZATVORENO', 0, -23, 11, INK); text(ctx, '(privremeno od 2009)', 0, -8, 8, INK, 'center', 0, 'Arial'); ctx.restore(); }
    } else if (st === 'valve') {
      box(ctx, -34, -H, 68, H, 4, COL.grey2, 4);
      const slide = p * 90;
      box(ctx, -30, -H + 6 - slide, 60, 118, 4, COL.char2, 3.5); box(ctx, -30, -126 + 6 + slide * 0, 60, 120 - 0, 4, COL.char2, 0);
      ctx.save(); ctx.translate(0, -H / 2); ctx.rotate(p * 6 + (p === 0 ? Math.sin(t * 1.5) * 0.08 : 0));
      ell(ctx, 0, 0, 34, 34, null, 8); ctx.strokeStyle = COL.red; ctx.lineWidth = 5; ctx.stroke();
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = COL.red; ctx.lineWidth = 4; ctx.stroke(); }
      ctx.restore();
      if (p === 0) text(ctx, 'PRITISAK', 0, -H + 22, 10, COL.white, 'center', 3);
    } else if (st === 'hatch') {
      box(ctx, -42, -H, 84, H, 4, '#2a3b3a', 4.5);
      box(ctx, -34, -H + 10 - p * (H - 20), 68, H - 20, 4, '#3c5251', 4);
      ctx.save(); ctx.beginPath(); ctx.rect(-34, -H + 10, 68, H - 20); ctx.clip();
      ctx.fillStyle = COL.yellow; for (let i = 0; i < 6; i++) { ctx.beginPath(); const yy = -H + 10 - p * (H - 20) + i * 34; ctx.moveTo(-34, yy + 20); ctx.lineTo(-34, yy + 4); ctx.lineTo(34, yy + 30); ctx.lineTo(34, yy + 46); ctx.fill(); }
      ctx.restore();
      if (p === 0) { ell(ctx, 0, -H / 2, 14, 14, COL.red, 4); text(ctx, 'ZATV.', 0, -H / 2, 8, COL.white); }
    } else { // groblje
      box(ctx, -50, -H, 14, H, 3, COL.char, 4); box(ctx, 36, -H, 14, H, 3, COL.char, 4);
      ctx.save(); ctx.translate(-36, 0);
      ctx.scale(Math.cos(p * 1.3), 1);
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(i * 8 + 4, -20); ctx.lineTo(i * 8 + 4, -H + 20); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = COL.grey2; ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.restore(); ctx.save(); ctx.translate(36, 0); ctx.scale(-Math.cos(p * 1.3), 1);
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-i * 8 - 4, -20); ctx.lineTo(-i * 8 - 4, -H + 20); ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.stroke(); ctx.strokeStyle = COL.grey2; ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, -H + 10, 44, Math.PI, 0); ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = COL.grey2; ctx.lineWidth = 4; ctx.stroke();
    }
  },

  pillar(ctx, o) {
    box(ctx, -14, -520, 28, 520, 4, '#10163a', 4);
    ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(-8, -520, 5, 520);
  },

  // ---------------------------------------------------------------- MINISTARSTVO
  desk(ctx, o, t) {
    box(ctx, -120, -58, 240, 58, 6, '#5b4a3a', 4.5);
    box(ctx, -124, -68, 248, 14, 5, '#7a6450', 4.5);
    box(ctx, -52, -48, 104, 24, 4, COL.yellow, 3.5);
    text(ctx, 'pero nikic samo', 0, -39, 10, INK);
    text(ctx, 'ministar', 0, -29, 7, INK, 'center', 0, 'Arial');
    for (let i = 0; i < 5; i++) box(ctx, -108 + i * 2, -76 - i * 4, 52, 8, 1, COL.white, 2.5);
    ctx.save(); ctx.translate(90, -68); curve(ctx, [0, 0, 0, -30, 18, -44, 30, -40], 5, COL.grey, 2.5); poly(ctx, [24, -48, 46, -40, 34, -28], COL.yellow, 3); ctx.restore();
    box(ctx, 30, -78, 36, 10, 2, COL.red, 3);
    box(ctx, -86, -96, 12, 28, 3, '#6b3d1e', 3); box(ctx, -83, -108, 6, 14, 2, '#6b3d1e', 3); box(ctx, -86, -86, 12, 10, 1, COL.yellow, 2);
  },

  bell(ctx, o, t) {
    const sq = o.rung ? Math.sin(o.rung * 30) * o.rung : 0;
    ctx.save(); ctx.translate(0, -6); ctx.rotate(sq * 0.4);
    box(ctx, -18, -8, 36, 8, 3, COL.grey, 3);
    ctx.beginPath(); ctx.arc(0, -8, 18, Math.PI, 0); paint(ctx, COL.yellow, 3.5);
    ell(ctx, 0, -28, 4, 4, COL.red, 2.5);
    ctx.restore();
  },

  printer(ctx, o, t) {
    const run = o.state === 'flee', tired = o.state === 'tired', done = o.state === 'done';
    const hop = o.hopY || 0;
    ctx.save(); ctx.translate(0, -hop);
    ctx.scale(o.face || 1, 1);
    const legPh = t * 18;
    if (run) { limb(ctx, -20, -18, -20 + Math.sin(legPh) * 12, -2, 7, COL.grey2); limb(ctx, 20, -18, 20 - Math.sin(legPh) * 12, -2, 7, COL.grey2); }
    else { limb(ctx, -20, -18, -22, -2, 7, COL.grey2); limb(ctx, 20, -18, 22, -2, 7, COL.grey2); }
    ctx.rotate(run ? -0.08 : tired ? 0.1 : 0);
    box(ctx, -42, -64, 84, 48, 8, COL.white, 4.5);
    box(ctx, -42, -64, 84, 18, 8, COL.char2, 4.5);
    box(ctx, -24, -80, 48, 20, 3, COL.white, 3.5);
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-18, -74 + k * 5); ctx.lineTo(18, -74 + k * 5); ctx.strokeStyle = COL.grey; ctx.lineWidth = 2; ctx.stroke(); }
    // lice
    ell(ctx, -14, -35, 7, 8, COL.white, 3); ell(ctx, 14, -35, 7, 8, COL.white, 3);
    ell(ctx, -12 + (run ? -3 : 0), -34, 3, 3.5, INK, 0); ell(ctx, 16 + (run ? -3 : 0), -34, 3, 3.5, INK, 0);
    if (run) { ctx.beginPath(); ctx.arc(2, -22, 6, Math.PI, 0); paint(ctx, '#5a1a32', 2.5); }
    else if (tired || done) { ctx.beginPath(); ctx.moveTo(-6, -22); ctx.quadraticCurveTo(2, -28, 10, -22); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke(); }
    if (tired) { ell(ctx, 38, -58 + Math.sin(t * 6) * 3, 3, 5, COL.teal, 2); }
    if (run) { ctx.fillStyle = COL.white; ctx.globalAlpha = 0.9; ctx.fillRect(-60, -30, 12, 3); ctx.fillRect(-70, -22, 18, 3); ctx.globalAlpha = 1; }
    ctx.restore();
  },

  filing(ctx, o) {
    box(ctx, -32, -130, 64, 130, 4, COL.grey2, 4.5);
    for (let i = 0; i < 3; i++) { box(ctx, -26, -122 + i * 40, 52, 34, 3, '#6a76a0', 3); box(ctx, -8, -108 + i * 40, 16, 6, 2, COL.yellow, 2.5); }
  },

  ticket(ctx, o, t) {
    box(ctx, -40, -50, 80, 50, 5, COL.char, 4);
    box(ctx, -34, -44, 68, 34, 3, '#2b0b10', 3);
    text(ctx, 'NA REDU', 0, -37, 7, COL.red, 'center', 0, 'Arial');
    text(ctx, '0', 0, -22, 22, blink(t, 1.2) ? COL.red : '#7a2430');
    ctx.fillStyle = INK; ctx.fillRect(-3, -90, 6, 40);
  },

  plant(ctx, o, t) {
    box(ctx, -18, -34, 36, 34, 4, '#7a4a2a', 4);
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(i * 22, -70 - Math.abs(i) * 6, i * 30 + Math.sin(t * 1.5 + i) * 3, -64 + Math.abs(i) * 14); ctx.quadraticCurveTo(i * 10, -70, 0, -34); paint(ctx, '#3a9a22', 3.5); }
  },

  clock(ctx, o, t) {
    ell(ctx, 0, -150, 30, 30, COL.white, 4.5);
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.beginPath(); ctx.moveTo(Math.sin(a) * 24, -150 - Math.cos(a) * 24); ctx.lineTo(Math.sin(a) * 27, -150 - Math.cos(a) * 27); ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke(); }
    const a = -t * 0.8; ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(Math.sin(a) * 22, -150 - Math.cos(a) * 22); ctx.moveTo(0, -150); ctx.lineTo(Math.sin(a * 0.1) * 14, -150 - Math.cos(a * 0.1) * 14); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke();
  },

  // ---------------------------------------------------------------- KLUB
  couch(ctx, o) {
    box(ctx, -90, -86, 180, 60, 18, COL.purple3, 4.5);
    box(ctx, -102, -66, 36, 62, 14, COL.purple, 4.5); box(ctx, 66, -66, 36, 62, 14, COL.purple, 4.5);
    box(ctx, -62, -62, 124, 40, 12, COL.purple2, 4.5);
    ctx.fillStyle = INK; ctx.fillRect(-84, -6, 10, 8); ctx.fillRect(74, -6, 10, 8);
    box(ctx, 18, -92, 34, 30, 8, COL.pink, 3.5);
  },

  jukebox(ctx, o, t) {
    ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(-46, -130); ctx.quadraticCurveTo(0, -190, 46, -130); ctx.lineTo(46, 0); ctx.closePath(); paint(ctx, '#7a2a74', 4.5);
    ctx.beginPath(); ctx.arc(0, -112, 30, Math.PI, 0); ctx.lineTo(30, -50); ctx.lineTo(-30, -50); ctx.closePath(); paint(ctx, '#17102e', 3.5);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = [COL.pink, COL.green, COL.yellow, COL.teal, COL.purple2][i]; ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 2 + i)); ctx.fillRect(-26 + i * 11, -110 + Math.sin(t * 3 + i) * 3, 8, 50 - Math.abs(Math.sin(t * 3 + i)) * 24 + 12); } ctx.globalAlpha = 1;
    ell(ctx, 0, -30, 14, 14, COL.char, 4); ell(ctx, 0, -30, 4, 4, COL.grey, 0);
  },

  fridge(ctx, o, t) {
    const open = !S.secrets.friz ? 0 : 1;
    box(ctx, -42, -170, 84, 170, 8, '#cfd6ee', 4.5);
    ctx.beginPath(); ctx.moveTo(-42, -108); ctx.lineTo(42, -108); ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.stroke();
    box(ctx, 28, -150, 6, 30, 3, COL.grey2, 2.5); box(ctx, 28, -96, 6, 30, 3, COL.grey2, 2.5);
    box(ctx, -30, -156, 18, 18, 3, COL.pink, 2.5); box(ctx, -8, -140, 16, 14, 3, COL.green, 2.5);
    text(ctx, 'ping', 0, -70, 12, COL.grey2, 'center', 0, 'Arial');
  },

  poster(ctx, o, t) {
    ctx.save(); ctx.rotate(-0.03);
    box(ctx, -60, -190, 120, 150, 6, '#f4f6ff', 4.5);
    text(ctx, 'PRAVILA', 0, -168, 15, INK);
    text(ctx, '1) Nema pravila.', 0, -140, 9, INK, 'center', 0, 'Arial');
    text(ctx, '2) Videti 1.', 0, -122, 9, INK, 'center', 0, 'Arial');
    text(ctx, '3) Ne zovi', 0, -102, 9, COL.red, 'center', 0, 'Arial');
    text(ctx, 'u 3 ujutru.', 0, -88, 9, COL.red, 'center', 0, 'Arial');
    ell(ctx, 0, -190, 6, 6, COL.red, 3);
    ctx.restore();
  },

  bigScreen(ctx, o, t) {
    box(ctx, -110, -214, 220, 134, 12, COL.char2, 5);
    box(ctx, -100, -204, 200, 114, 6, '#171b4a', 3.5);
    // generička "ćaskalica" ikona (nije logo)
    ctx.save(); ctx.translate(0, -158);
    box(ctx, -34, -30, 68, 54, 16, COL.purple, 4);
    ell(ctx, -12, -4, 6, 7, COL.white, 0); ell(ctx, 12, -4, 6, 7, COL.white, 0);
    poly(ctx, [-10, 22, 2, 22, -12, 34], COL.purple, 3.5);
    ctx.restore();
    text(ctx, 'OTVORI KANAL', 0, -104, 12, COL.green, 'center', 3);
    box(ctx, -18, -80, 36, 14, 3, COL.grey2, 3);
    box(ctx, -40, -66, 80, 8, 3, COL.char2, 3.5);
  },

  banner(ctx, o, t) {
    const w = o.w || 236, col = o.col || COL.pink;
    ctx.beginPath(); ctx.moveTo(-w / 2 - 12, -280); ctx.quadraticCurveTo(0, -250 + Math.sin(t) * 6, w / 2 + 12, -280); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    box(ctx, -w / 2, -300, w, 52, 8, col, 4.5);
    text(ctx, o.title || 'KLUPSKA PROSTORIJA', 0, -274, w > 300 ? 16 : 17, o.ink ? INK : COL.white, 'center', o.ink ? 0 : 4);
  },

  // ---------------------------------------------------------------- INSTITUT
  cableMess(ctx, o, t) {
    const cols = [COL.red, COL.green, COL.purple2, COL.yellow, COL.pink, COL.teal];
    for (let i = 0; i < 9; i++) {
      const c = cols[i % cols.length], sw = Math.sin(t * 0.8 + i) * 5;
      curve(ctx, [-90 + i * 20, -140 - (i % 3) * 14, -130 + i * 30 + sw, -40, 70 - i * 24, -90 + sw, -70 + i * 17, -2], 7, c, 3);
    }
  },

  pingMonitor(ctx, o, t) {
    const done = flag('ping');
    box(ctx, -80, -190, 160, 124, 10, COL.char2, 5);
    box(ctx, -70, -180, 140, 98, 5, '#031a12', 3.5);
    const v = done ? 24 : Math.floor(900 + Math.sin(t * 7) * 60 + Math.sin(t * 17) * 40);
    text(ctx, 'PING', -40, -166, 11, COL.green, 'center', 0);
    text(ctx, String(done ? 24 : Math.min(999, v)), 0, -130, 40, done ? COL.green : COL.red, 'center', 0);
    text(ctx, 'ms', 52, -110, 12, COL.green);
    // graf
    ctx.beginPath(); for (let i = 0; i < 20; i++) { const yy = -92 - (done ? 4 + Math.sin(i + t) * 2 : 4 + Math.abs(Math.sin(i * 1.7 + t * 6)) * 22); i ? ctx.lineTo(-60 + i * 6.5, yy) : ctx.moveTo(-60, yy); } ctx.strokeStyle = done ? COL.green : COL.red; ctx.lineWidth = 2.5; ctx.stroke();
    box(ctx, -14, -66, 28, 12, 2, COL.grey2, 3);
  },

  socketPanel(ctx, o, t) {
    const done = flag('ping');
    box(ctx, -76, -160, 152, 130, 10, COL.char2, 5);
    box(ctx, -66, -150, 132, 110, 6, '#10163a', 3.5);
    const cols = [COL.red, COL.green, COL.purple2];
    for (let i = 0; i < 3; i++) {
      ell(ctx, -40 + i * 40, -112, 15, 15, '#04060f', 3.5);
      led(ctx, -40 + i * 40, -82, done || blink(t, 2, i), done ? COL.green : cols[i]);
    }
    text(ctx, 'PANEL', 0, -140, 10, COL.grey);
    for (let i = 0; i < 3; i++) curve(ctx, [-40 + i * 40, -96, -40 + i * 40, -20 - i * 5, 100 + i * 12, -50, 126 + i * 10, -4], 6, cols[i], 3);
  },

  weather(ctx, o, t) {
    ctx.fillStyle = INK; ctx.fillRect(-4, -120, 8, 120);
    ctx.save(); ctx.translate(0, -130); ctx.rotate(0.06);
    box(ctx, -94, -40, 188, 72, 8, COL.yellow, 4.5);
    text(ctx, 'ATMOSFERSKI PRITISAK:', 0, -22, 10, INK, 'center', 0, 'Arial');
    text(ctx, 'ODGOVORAN ZA SVE', 0, 4, 14, COL.red);
    ctx.restore();
    ctx.save(); ctx.translate(0, -170); ctx.rotate(t * 1.2); ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.moveTo(0, -18); ctx.lineTo(0, 18); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
  },

  bench(ctx, o, t) {
    if (o.scope) ctx.translate(0, 28);
    box(ctx, -80, -66, 160, 16, 4, '#7a6450', 4.5);
    box(ctx, -70, -50, 14, 50, 3, '#5b4a3a', 4); box(ctx, 56, -50, 14, 50, 3, '#5b4a3a', 4);
    limb(ctx, -40, -76, -20, -76, 6, COL.grey); box(ctx, 20, -90, 30, 24, 4, COL.red, 3);
    box(ctx, -60, -84, 24, 18, 3, COL.grey2, 3);
    if (o.scope) { box(ctx, 24, -112, 44, 36, 5, COL.char2, 3.5); box(ctx, 29, -107, 34, 22, 3, '#031a12', 2.5); ctx.beginPath(); for (let i = 0; i <= 12; i++) { const yy = -96 + Math.sin(i * 1.1 + t * 6) * 6; i ? ctx.lineTo(30 + i * 2.5, yy) : ctx.moveTo(30, yy); } ctx.strokeStyle = COL.green; ctx.lineWidth = 2; ctx.stroke(); ell(ctx, 40, -80, 2.5, 2.5, COL.red, 1.5); ell(ctx, 52, -80, 2.5, 2.5, COL.yellow, 1.5); }
  },

  // ---------------------------------------------------------------- MUZEJ
  frame(ctx, o, t) {
    const meme = o.meme, vis = !!(S.stats.exhibits[meme.id]);
    // reflektor
    ctx.fillStyle = 'rgba(255,240,180,.08)'; ctx.beginPath(); ctx.moveTo(-12, -330); ctx.lineTo(12, -330); ctx.lineTo(90, 0); ctx.lineTo(-90, 0); ctx.fill();
    box(ctx, -52, -34, 104, 34, 4, '#2a2145', 4.5);
    text(ctx, meme.title.length > 18 ? meme.title.slice(0, 17) + '…' : meme.title, 0, -17, 9, COL.white, 'center', 0, 'Arial');
    box(ctx, -66, -240, 132, 176, 8, '#c9a227', 5);
    box(ctx, -52, -226, 104, 148, 3, '#171b4a', 3.5);
    const im = svgImage(ICONS[meme.icon] || ICONS.poruka);
    if (im.complete && im.naturalWidth) {
      ctx.save(); ctx.translate(0, -150);
      const a = meme.anim;
      if (a === 'bounce') ctx.translate(0, -Math.abs(Math.sin(t * 3)) * 14);
      if (a === 'spin') ctx.rotate(Math.sin(t * 2) * 0.9);
      if (a === 'shake') ctx.rotate(Math.sin(t * 22) * 0.12 * (Math.sin(t * 2) > 0 ? 1 : 0.1));
      if (a === 'float') ctx.translate(0, Math.sin(t * 2) * 8);
      if (a === 'wobble') ctx.rotate(Math.sin(t * 3) * 0.2);
      if (a === 'blink' && Math.sin(t * 5) > 0.8) ctx.globalAlpha = 0.5;
      ctx.drawImage(im, -42, -42, 84, 84);
      ctx.restore();
    }
    text(ctx, vis ? '✓' : '?', 52, -246, 18, vis ? COL.green : COL.yellow, 'center', 4);
    ctx.fillStyle = INK; ctx.fillRect(-1, -330, 2, 90);
  },

  emptyFrame(ctx, o, t) {
    ctx.fillStyle = 'rgba(255,240,180,.06)'; ctx.beginPath(); ctx.moveTo(-12, -330); ctx.lineTo(12, -330); ctx.lineTo(90, 0); ctx.lineTo(-90, 0); ctx.fill();
    box(ctx, -66, -240, 132, 176, 8, '#c9a227', 5);
    box(ctx, -52, -226, 104, 148, 3, '#0c0f2a', 3.5);
    ctx.setLineDash([8, 8]); ctx.strokeStyle = COL.grey2; ctx.lineWidth = 2.5; ctx.strokeRect(-40, -210, 80, 116); ctx.setLineDash([]);
    text(ctx, 'ovde ide', 0, -160, 10, COL.grey, 'center', 0, 'Arial'); text(ctx, 'tvoj meme', 0, -144, 10, COL.grey, 'center', 0, 'Arial');
    box(ctx, -52, -34, 104, 34, 4, '#2a2145', 4.5);
    text(ctx, 'Bez naziva (2)', 0, -17, 9, COL.white, 'center', 0, 'Arial');
  },

  rope(ctx, o) {
    box(ctx, -54, -52, 10, 52, 3, COL.yellow2, 4); box(ctx, 44, -52, 10, 52, 3, COL.yellow2, 4);
    curve(ctx, [-44, -46, -20, -14, 20, -14, 44, -46], 5, COL.red, 3);
  },

  // ---------------------------------------------------------------- BUNKER
  console(ctx, o, t) {
    const on = flag('neuron');
    box(ctx, -150, -100, 300, 100, 8, '#2a3b3a', 5);
    ctx.save(); ctx.beginPath(); ctx.moveTo(-150, -100); ctx.lineTo(-132, -150); ctx.lineTo(132, -150); ctx.lineTo(150, -100); ctx.closePath(); paint(ctx, '#3a5352', 5); ctx.restore();
    for (let i = 0; i < 3; i++) { box(ctx, -118 + i * 56, -140, 48, 32, 4, on ? '#082a18' : '#0a1210', 3.5); if (on) { text(ctx, ['OK', 'UP', '24ms'][i], -94 + i * 56, -124, 10, COL.green); } else if (blink(t, 1.5, i)) { ctx.fillStyle = COL.red; ctx.fillRect(-106 + i * 56, -128, 24, 3); } }
    for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(-120 + i * 24, -88); limb(ctx, 0, 0, Math.sin(i + (on ? t : 0)) * 8, -14, 5, COL.grey); ell(ctx, Math.sin(i + (on ? t : 0)) * 8, -16, 5, 5, COL.red, 2.5); ctx.restore(); }
    // velika crvena dugmad
    const press = o.press ? 6 : 0;
    box(ctx, 40, -112, 90, 24, 6, '#10131f', 4);
    ctx.beginPath(); ctx.arc(85, -104, 30, Math.PI, 0); ctx.closePath(); paint(ctx, 'rgba(255,255,255,.22)', 3);
    ell(ctx, 85, -108 + press, 24, 14, COL.red, 4);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(74, -114 + press, 14, 3);
    box(ctx, 40, -78, 90, 26, 3, COL.yellow, 3.5);
    text(ctx, 'NE DIRAJ', 85, -69, 9, INK); text(ctx, '— produkcija', 85, -58, 7, INK, 'center', 0, 'Arial');
  },

  alarm(ctx, o, t) {
    const on = !flag('neuron');
    ell(ctx, 0, -8, 14, 8, COL.char2, 3.5);
    if (on) { glow(ctx, 0, -20, 90, COL.red, 0.35 + Math.abs(Math.sin(t * 4)) * 0.2); }
    ctx.beginPath(); ctx.arc(0, -10, 12, Math.PI, 0); paint(ctx, on ? COL.red : '#3a4a44', 3.5);
  },

  neuronJar(ctx, o, t) {
    if (flag('neuron')) return;
    glow(ctx, 0, -40, 50, COL.green, 0.35);
    box(ctx, -18, -64, 36, 64, 10, 'rgba(180,255,220,.18)', 4);
    ell(ctx, 0, -30 + Math.sin(t * 3) * 3, 8, 8, COL.green, 2.5);
  },

  chair(ctx, o) {
    limb(ctx, 0, -20, 0, 0, 8, COL.char2); limb(ctx, -20, 0, 20, 0, 7, COL.char2);
    box(ctx, -28, -52, 56, 30, 10, COL.char, 4); box(ctx, -26, -110, 14, 62, 8, COL.char, 4);
  },

  // ---------------------------------------------------------------- GROBLJE
  tomb(ctx, o, t) {
    const k = o.kind || 0, read = !!o.read;
    if (k === 0) { ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -70); ctx.arc(0, -70, 34, Math.PI, 0); ctx.lineTo(34, 0); ctx.closePath(); paint(ctx, '#7c86a8', 4.5); }
    if (k === 1) { box(ctx, -30, -90, 60, 90, 6, '#7c86a8', 4.5); }
    if (k === 2) { box(ctx, -8, -110, 16, 110, 3, '#7c86a8', 4.5); box(ctx, -30, -88, 60, 16, 3, '#7c86a8', 4.5); }
    if (k === 3) { ctx.beginPath(); ctx.moveTo(-36, 0); ctx.lineTo(-30, -72); ctx.lineTo(0, -92); ctx.lineTo(30, -72); ctx.lineTo(36, 0); ctx.closePath(); paint(ctx, '#7c86a8', 4.5); }
    text(ctx, 'R.I.P.', 0, -52, 11, '#2b3050');
    ctx.strokeStyle = '#2b3050'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-14, -38); ctx.lineTo(14, -38); ctx.moveTo(-10, -30); ctx.lineTo(10, -30); ctx.stroke();
    ell(ctx, -26, -4, 12, 5, '#2a4a2a', 0);
    if (!read) { ctx.fillStyle = COL.yellow; ctx.globalAlpha = 0.5 + Math.sin(t * 4 + k) * 0.4; ell(ctx, 0, -120 - (k === 2 ? 14 : 0), 3, 3, COL.yellow, 0); ctx.globalAlpha = 1; }
  },

  stonks(ctx, o, t) {
    ctx.save(); ctx.rotate(-0.04);
    box(ctx, -80, -150, 160, 120, 6, '#9a8f72', 4.5);
    box(ctx, -70, -140, 140, 100, 3, '#cfc4a4', 3);
    ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(-30, -90); ctx.lineTo(-10, -70); ctx.lineTo(20, -120); ctx.lineTo(54, -52); ctx.strokeStyle = '#6a7d38'; ctx.lineWidth = 4; ctx.stroke();
    text(ctx, 'STONKS', 0, -128, 14, '#6a5f46', 'center', 0);
    // paučina
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-70, -140); ctx.lineTo(-30, -120); ctx.moveTo(-70, -140); ctx.lineTo(-40, -100); ctx.moveTo(-70, -140); ctx.lineTo(-62, -96); ctx.moveTo(-50, -140); ctx.lineTo(-52, -112); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = INK; ctx.fillRect(-4, -36, 8, 36);
  },

  sadPc(ctx, o, t) {
    box(ctx, -40, -92, 80, 66, 8, '#8d97b3', 4.5);
    box(ctx, -32, -84, 64, 48, 3, '#10131f', 3);
    // piksel lice
    ctx.fillStyle = COL.white; ctx.fillRect(-18, -72, 8, 8); ctx.fillRect(10, -72, 8, 8); ctx.fillRect(-14, -48, 28, 4); ctx.fillRect(-18, -44, 6, 4); ctx.fillRect(12, -44, 6, 4);
    const ty = -62 + ((t * 14) % 22); if (blink(t, 0.5)) { ctx.fillStyle = COL.teal; ctx.fillRect(-18, ty, 4, 6); }
    box(ctx, -22, -26, 44, 10, 2, '#566082', 3); box(ctx, -34, -16, 68, 16, 4, '#8d97b3', 4);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-26 + i * 16, -9, 12, 3); }
  },

  spinner(ctx, o, t) {
    const found = !!S.secrets.spiner;
    ctx.fillStyle = INK; ctx.fillRect(-4, -110, 8, 110);
    box(ctx, -52, -176, 104, 76, 10, COL.char2, 4.5);
    ctx.save(); ctx.translate(0, -138); ctx.rotate(t * 5);
    for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.globalAlpha = (i + 1) / 8; ell(ctx, 0, -20, 4.5, 4.5, COL.white, 0); }
    ctx.globalAlpha = 1; ctx.restore();
    text(ctx, 'od 2014.', 0, -112, 8, found ? COL.green : COL.grey, 'center', 0, 'Arial');
  },

  signpost(ctx, o, t) {
    ctx.fillStyle = INK; ctx.fillRect(-5, -120, 10, 120);
    ctx.save(); ctx.translate(0, -140); ctx.rotate(-0.04);
    box(ctx, -110, -40, 220, 84, 8, '#4a3a2c', 4.5);
    text(ctx, 'Ovde počivaju fore', 0, -14, 14, COL.white, 'center', 0);
    text(ctx, 'koje je neko', 0, 8, 14, COL.white, 'center', 0);
    text(ctx, 'objasnio.', 0, 28, 14, COL.yellow, 'center', 0);
    ctx.restore();
  },

  deadTree(ctx, o, t) {
    const s = o.s || 1;
    ctx.save(); ctx.scale(s, s);
    curve(ctx, [0, 0, -6, -60, 6, -110, 0, -170], 18, '#2b2a3a', 3.5);
    curve(ctx, [0, -90, -30, -110, -50, -120, -70, -160], 9, '#2b2a3a', 3.5);
    curve(ctx, [2, -120, 26, -140, 46, -150, 60, -190], 8, '#2b2a3a', 3.5);
    curve(ctx, [-30, -112, -50, -120, -62, -118, -90, -126], 6, '#2b2a3a', 3);
    ctx.restore();
  },

  lantern(ctx, o, t) {
    ctx.fillStyle = INK; ctx.fillRect(-3, -90, 6, 90);
    box(ctx, -13, -122, 26, 32, 5, '#2a3045', 3.5);
    glow(ctx, 0, -106, 60, COL.teal, 0.35 + Math.sin(t * 5 + o.x) * 0.08);
    poly(ctx, [-5, -96, 5, -96, 0, -116 - Math.abs(Math.sin(t * 6)) * 4], COL.teal, 2.5);
  },

  tipBubble(ctx, o, t) {
    // balon sa porukom koja se kuca i briše
    if (o.done) return;
    const full = 'Ej, samo da ti kažem da... mislim, nije bitno... ali ipak... zapravo...';
    const cyc = (t * 6) % (full.length * 1.6);
    const n = Math.min(full.length, Math.floor(cyc > full.length ? full.length - (cyc - full.length) * 2.5 : cyc));
    const s = full.slice(0, Math.max(0, n)) + (blink(t, 3) ? '|' : ' ');
    const lines = []; let cur = '';
    for (const wd of s.split(' ')) { if ((cur + wd).length > 18) { lines.push(cur); cur = ''; } cur += wd + ' '; } lines.push(cur);
    ctx.font = '12px Arial'; const w = 150, hh = 14 + lines.length * 15;
    box(ctx, -w / 2, -200 - hh, w, hh, 8, COL.white, 3.5);
    lines.forEach((l, i) => text(ctx, l, 0, -200 - hh + 14 + i * 15, 11, INK, 'center', 0, 'Arial'));
    if (n < 4) text(ctx, '...', 0, -200 - hh / 2, 20, INK);
  },

  chest(ctx, o, t) {
    const open = !!o.open, sh = o.shake || 0;
    ctx.save(); ctx.translate(Math.sin(t * 40) * sh * 4, -Math.abs(o.hopY || 0));
    box(ctx, -42, -52, 84, 52, 6, '#7a4a2a', 4.5);
    ctx.save(); ctx.translate(-42, -52); if (open) { ctx.rotate(-1.1); }
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.quadraticCurveTo(42, -42, 84, -10); ctx.lineTo(84, 0); ctx.closePath(); paint(ctx, '#9b5f36', 4.5); ctx.restore();
    ctx.fillStyle = INK; ctx.fillRect(-42, -34, 84, 4);
    if (!open) { box(ctx, -10, -42, 20, 22, 4, COL.yellow, 3.5); ell(ctx, 0, -32, 3, 3, INK, 0); }
    if (open) { glow(ctx, 0, -64, 50, COL.yellow, 0.5); }
    // natpis
    ctx.save(); ctx.translate(0, -76); box(ctx, -52, -14, 104, 28, 5, COL.white, 3.5); text(ctx, 'Domaći zadatak', 0, 0, 10, INK); ctx.restore();
    ctx.restore();
  },

  niche(ctx, o, t) {
    // niša za zid slavnih
    box(ctx, -66, -230, 132, 230, 10, '#1a1636', 5);
    ctx.beginPath(); ctx.arc(0, -150, 56, Math.PI, 0); ctx.lineTo(56, -40); ctx.lineTo(-56, -40); ctx.closePath(); paint(ctx, '#2a2250', 4);
    box(ctx, -60, -40, 120, 34, 5, COL.yellow, 3.5);
    text(ctx, o.label, 0, -28, o.label.length > 12 ? 9.5 : 11, INK);
    text(ctx, o.sub, 0, -14, 7.5, '#3a3010', 'center', 0, 'Arial');
  },

  // ---------------------------------------------------------------- FINALE
  router(ctx, o, t) {
    const lit = o.near;
    box(ctx, -42, -40, 84, 40, 8, COL.white, 4.5);
    for (let i = 0; i < 5; i++) led(ctx, -26 + i * 13, -22, blink(t, 3, i * 0.7), [COL.green, COL.yellow, COL.green, COL.red, COL.green][i]);
    limb(ctx, -30, -40, -40, -86, 5, COL.char); limb(ctx, 0, -40, 0, -96, 5, COL.char); limb(ctx, 30, -40, 40, -86, 5, COL.char);
    text(ctx, 'RUTER', 0, -8, 9, INK);
    // talasi
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, -98, 12 + ((t * 20 + i * 14) % 42), -2.2, -0.9); ctx.strokeStyle = `rgba(182,255,60,${0.7 - ((t * 20 + i * 14) % 42) / 60})`; ctx.lineWidth = 3; ctx.stroke(); }
    if (lit) glow(ctx, 0, -40, 90, COL.green, 0.3);
  },

  excuse(ctx, o, t) {
    if (o.taken) return;
    ctx.save(); ctx.translate(0, -34 + Math.sin(t * 3 + o.x) * 5);
    glow(ctx, 0, 0, 55, COL.pink, 0.45);
    const im = svgImage('<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h24a2 2 0 012 2v13a2 2 0 01-2 2H15l-6 6v-6H4a2 2 0 01-2-2V8a2 2 0 012-2z" fill="#ff3fa4" stroke="#0a0d1c" stroke-width="2.5" stroke-linejoin="round"/><circle cx="10" cy="14.5" r="1.8" fill="#f4f6ff"/><circle cx="16" cy="14.5" r="1.8" fill="#f4f6ff"/><circle cx="22" cy="14.5" r="1.8" fill="#f4f6ff"/></svg>');
    if (im.complete) ctx.drawImage(im, -24, -24, 48, 48);
    ctx.restore();
  },

  sunOrb(ctx, o, t) {
    ctx.save(); ctx.rotate(t * 4);
    glow(ctx, 0, 0, 46, COL.yellow, 0.5);
    for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); poly(ctx, [-4, -22, 4, -22, 0, -32], COL.yellow, 2.5); }
    ell(ctx, 0, 0, 20, 20, '#fff2a8', 3.5);
    ell(ctx, -6, -3, 3, 3.5, INK, 0); ell(ctx, 6, -3, 3, 3.5, INK, 0);
    ctx.restore();
  },

  sunBeam(ctx, o, t) {
    const h = 520;
    if (o.phase === 'warn') {
      const a = 0.25 + Math.abs(Math.sin(t * 14)) * 0.3;
      ctx.fillStyle = `rgba(255,230,90,${a})`; ctx.fillRect(-34, -h, 68, h);
      ctx.setLineDash([10, 8]); ctx.strokeStyle = COL.yellow; ctx.lineWidth = 3; ctx.strokeRect(-34, -h, 68, h); ctx.setLineDash([]);
      text(ctx, '!', 0, -96, 30, COL.red, 'center', 5);
    } else {
      const g = ctx.createLinearGradient(-34, 0, 34, 0); g.addColorStop(0, 'rgba(255,240,120,0)'); g.addColorStop(0.5, 'rgba(255,250,200,.95)'); g.addColorStop(1, 'rgba(255,240,120,0)');
      ctx.fillStyle = g; ctx.fillRect(-40, -h, 80, h);
      ell(ctx, 0, 0, 40, 10, 'rgba(255,255,200,.9)', 0);
    }
  },
};

/** pokaži ikonicu slova tastera */
export function keycap(ctx, s, x, y, pulse = 0) {
  const w = Math.max(26, s.length * 12 + 14), h = 26;
  ctx.save(); ctx.translate(x, y - pulse);
  box(ctx, -w / 2, -h / 2 + 3, w, h, 6, COL.ink, 0);
  box(ctx, -w / 2, -h / 2, w, h, 6, COL.white, 3.5);
  text(ctx, s, 0, 0, 15, COL.ink);
  ctx.restore();
}
