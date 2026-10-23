// Slojevita pozadina sa paralaksom. Daleki i srednji slojevi se jednom iscrtaju u mali offscreen
// "tile" (po temi) i onda samo ponavljaju — jeftino i za slabije telefone.
import { ZONES, GY } from '../config/zones.js';
import { COL, rrPath, text } from './draw.js';
import { mulberry } from '../core/util.js';

const TW = 1024, TH = 540;
const SKY = {
  lobby: ['#0a0e2a', '#1b2150'],
  ministry: ['#141a38', '#2b3260'],
  club: ['#1b1040', '#3f1f70'],
  institute: ['#05181a', '#0d3033'],
  museum: ['#130c2a', '#2c1c52'],
  bunker: ['#091214', '#182b2e'],
  graveyard: ['#100e28', '#2e2352'],
  arena: ['#0b1030', '#26346b'],
};
const GROUND = {
  lobby: ['#1a2150', '#0f1433', COL.purple2],
  ministry: ['#4a4a5e', '#2b2c3e', COL.yellow],
  club: ['#43225e', '#26123b', COL.pink],
  institute: ['#14383a', '#0a2022', COL.green],
  museum: ['#3a2a5e', '#1e1438', COL.yellow],
  bunker: ['#2a3b3a', '#16211f', COL.red],
  graveyard: ['#2b2548', '#171330', COL.teal],
  arena: ['#2f5a2a', '#1a3517', COL.green],
};

const tiles = new Map();

function wrap(c, x, fn) { fn(x); if (x > TW - 200) fn(x - TW); }

function tile(theme, layer) {
  const key = theme + layer;
  let c = tiles.get(key);
  if (c) return c;
  const s = layer === 'far' ? 0.5 : 0.7;
  c = document.createElement('canvas');
  c.width = Math.round(TW * s); c.height = Math.round(TH * s);
  const x = c.getContext('2d');
  x.scale(s, s);
  const rnd = mulberry([...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7));
  (layer === 'far' ? FAR : MID)[theme](x, rnd);
  tiles.set(key, c);
  return c;
}

const R = (a, b, rnd) => a + (b - a) * rnd();

function racks(x, rnd, col, led, hMin = 180, hMax = 380, step = 70) {
  for (let px = 0; px < TW; px += step) {
    const w = 52 + rnd() * 18, h = R(hMin, hMax, rnd), top = GY - h;
    wrap(x, px, (ox) => {
      x.fillStyle = col; x.fillRect(ox, top, w, h);
      x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(ox + 4, top, 5, h);
      for (let y = top + 14; y < GY - 14; y += 22) {
        x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(ox + 8, y, w - 16, 12);
        for (let k = 0; k < 3; k++) if (rnd() > 0.4) { x.fillStyle = led[(rnd() * led.length) | 0]; x.fillRect(ox + 12 + k * 9, y + 4, 4, 4); }
      }
    });
  }
}

function hangCables(x, rnd, n, cols, len = 200) {
  for (let i = 0; i < n; i++) {
    const px = rnd() * TW, l = len * (0.5 + rnd()), sway = (rnd() - 0.5) * 120;
    wrap(x, px, (ox) => {
      x.beginPath(); x.moveTo(ox, -10); x.bezierCurveTo(ox + sway, l * 0.4, ox - sway, l * 0.8, ox + sway * 0.4, l);
      x.strokeStyle = 'rgba(5,7,20,.9)'; x.lineWidth = 11; x.lineCap = 'round'; x.stroke();
      x.strokeStyle = cols[(rnd() * cols.length) | 0]; x.lineWidth = 5; x.stroke();
    });
  }
}

function glowMonitors(x, rnd, n, y0, y1, col) {
  for (let i = 0; i < n; i++) {
    const px = rnd() * TW, py = R(y0, y1, rnd), w = R(60, 120, rnd), h = w * 0.7;
    wrap(x, px, (ox) => {
      x.fillStyle = 'rgba(8,10,28,.9)'; rrPath(x, ox, py, w, h, 6); x.fill();
      x.fillStyle = col; x.globalAlpha = 0.28; x.fillRect(ox + 6, py + 6, w - 12, h - 12); x.globalAlpha = 1;
      x.fillStyle = col; x.globalAlpha = 0.7;
      for (let l = 0; l < 4; l++) x.fillRect(ox + 12, py + 14 + l * 10, R(20, w - 30, rnd), 3);
      x.globalAlpha = 1;
    });
  }
}

const FAR = {
  lobby(x, rnd) { racks(x, rnd, '#0d1233', [COL.green, COL.pink, COL.purple2, COL.yellow]); },
  ministry(x, rnd) {
    for (let px = 0; px < TW; px += 170) wrap(x, px, (ox) => {
      x.fillStyle = '#202747'; x.fillRect(ox + 14, 90, 120, 230);
      x.fillStyle = '#0f1430'; x.fillRect(ox + 22, 98, 104, 214);
      for (let y = 106; y < 310; y += 14) { x.fillStyle = 'rgba(190,200,255,.12)'; x.fillRect(ox + 22, y, 104, 8); }
    });
    x.fillStyle = '#101634'; x.fillRect(0, 330, TW, 130);
  },
  club(x, rnd) {
    for (let i = 0; i < 26; i++) { const px = rnd() * TW, py = R(60, 380, rnd), r = R(20, 80, rnd); wrap(x, px, (ox) => { x.fillStyle = [`rgba(255,63,164,.12)`, `rgba(123,134,255,.14)`, `rgba(182,255,60,.08)`][i % 3]; x.beginPath(); x.arc(ox, py, r, 0, 6.3); x.fill(); }); }
  },
  institute(x, rnd) { glowMonitors(x, rnd, 14, 60, 330, COL.green); },
  museum(x, rnd) {
    for (let px = 0; px < TW; px += 256) wrap(x, px, (ox) => {
      x.fillStyle = '#201640'; x.fillRect(ox + 20, 40, 44, GY - 40);
      x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(ox + 24, 40, 6, GY - 40);
      x.fillStyle = '#261a4c'; x.fillRect(ox + 10, 40, 64, 16); x.fillRect(ox + 10, GY - 20, 64, 20);
      x.beginPath(); x.arc(ox + 140, GY, 76, Math.PI, 0); x.lineWidth = 12; x.strokeStyle = '#201640'; x.stroke();
    });
  },
  bunker(x, rnd) {
    for (let i = 0; i < 8; i++) { const py = R(40, 360, rnd); x.fillStyle = '#1b2d30'; x.fillRect(0, py, TW, 18); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, py + 3, TW, 4); }
    for (let i = 0; i < 6; i++) { const px = rnd() * TW; wrap(x, px, (ox) => { x.fillStyle = '#122022'; x.fillRect(ox, 0, 22, GY); x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(ox + 3, 0, 4, GY); }); }
  },
  graveyard(x, rnd) {
    // mesec
    const g = x.createRadialGradient(780, 120, 10, 780, 120, 200); g.addColorStop(0, 'rgba(255,200,240,.5)'); g.addColorStop(1, 'rgba(255,200,240,0)');
    x.fillStyle = g; x.fillRect(560, -80, 440, 400);
    x.fillStyle = '#f6d6ee'; x.beginPath(); x.arc(780, 120, 54, 0, 6.3); x.fill();
    x.fillStyle = 'rgba(180,140,190,.45)'; x.beginPath(); x.arc(764, 108, 12, 0, 6.3); x.arc(796, 134, 8, 0, 6.3); x.fill();
    // brda
    for (const [c, y0, amp] of [['#171233', 380, 50], ['#120e2a', 410, 34]]) { x.fillStyle = c; x.beginPath(); x.moveTo(0, GY + 40); for (let px = 0; px <= TW; px += 16) x.lineTo(px, y0 - Math.sin(px / TW * 6.283 * 2 + y0) * amp * 0.5 - Math.sin(px / TW * 6.283) * amp * 0.5); x.lineTo(TW, GY + 40); x.fill(); }
    // mrtva stabla
    for (let i = 0; i < 5; i++) { const px = 90 + i * 200 + rnd() * 60, h = R(120, 200, rnd); x.strokeStyle = '#0d0a20'; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.moveTo(px, GY - 30); x.lineTo(px, GY - 30 - h); x.moveTo(px, GY - 90 - h / 4); x.lineTo(px - 40, GY - 140 - h / 4); x.moveTo(px, GY - 110 - h / 3); x.lineTo(px + 36, GY - 160 - h / 3); x.stroke(); }
  },
  arena(x, rnd) { racks(x, rnd, '#0f1640', [COL.green, COL.yellow, COL.pink], 120, 300, 90); },
};

const MID = {
  lobby(x, rnd) { hangCables(x, rnd, 7, [COL.purple2, COL.pink, COL.green], 260); glowMonitors(x, rnd, 5, 140, 300, COL.purple2); },
  ministry(x, rnd) {
    for (let px = 40; px < TW; px += 340) wrap(x, px, (ox) => {
      x.fillStyle = '#232a50'; rrPath(x, ox, 180, 80, 170, 6); x.fill();
      for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(ox + 8, 190 + i * 40, 64, 30); }
      x.fillStyle = '#f4f6ff'; x.globalAlpha = 0.7; x.fillRect(ox + 150, 120, 56, 76); x.globalAlpha = 1;
      x.fillStyle = COL.red; x.globalAlpha = 0.6; x.fillRect(ox + 156, 128, 44, 8); x.globalAlpha = 1;
    });
    for (let px = 120; px < TW; px += 300) wrap(x, px, (ox) => { x.fillStyle = 'rgba(255,248,200,.65)'; x.fillRect(ox, 8, 130, 8); x.fillStyle = 'rgba(255,248,200,.06)'; x.beginPath(); x.moveTo(ox, 16); x.lineTo(ox + 130, 16); x.lineTo(ox + 200, 400); x.lineTo(ox - 70, 400); x.fill(); });
  },
  club(x, rnd) {
    x.strokeStyle = 'rgba(5,3,20,.9)'; x.lineWidth = 3;
    for (const y0 of [30, 70]) { x.beginPath(); x.moveTo(-10, y0); for (let px = 0; px <= TW + 64; px += 64) x.quadraticCurveTo(px + 32, y0 + 38, px + 64, y0); x.stroke(); for (let px = 32; px <= TW; px += 64) { x.fillStyle = [COL.yellow, COL.pink, COL.green, COL.teal][(px / 64 | 0) % 4]; x.beginPath(); x.arc(px, y0 + 28, 6, 0, 6.3); x.fill(); } }
    for (let i = 0; i < 3; i++) { const px = 120 + i * 330; wrap(x, px, (ox) => { x.save(); x.translate(ox, 200); x.rotate(R(-0.1, 0.1, rnd)); x.fillStyle = 'rgba(12,6,34,.8)'; rrPath(x, 0, 0, 110, 150, 6); x.fill(); x.strokeStyle = [COL.pink, COL.teal, COL.yellow][i]; x.lineWidth = 3; x.stroke(); x.restore(); }); }
  },
  institute(x, rnd) { hangCables(x, rnd, 9, [COL.green, COL.teal, COL.yellow, COL.red], 230); for (let i = 0; i < 3; i++) { const px = rnd() * TW; wrap(x, px, (ox) => { x.strokeStyle = '#08262a'; x.lineWidth = 6; x.beginPath(); x.moveTo(ox, GY); x.lineTo(ox, 250); x.stroke(); x.beginPath(); x.arc(ox, 250, 40, 3.5, 6.2); x.fillStyle = '#0b3438'; x.fill(); x.stroke(); }); } },
  museum(x, rnd) {
    for (let px = 0; px < TW; px += 256) wrap(x, px, (ox) => { x.fillStyle = 'rgba(96,28,66,.7)'; x.beginPath(); x.moveTo(ox, 0); x.lineTo(ox + 256, 0); x.quadraticCurveTo(ox + 128, 110, ox, 0); x.fill(); });
  },
  bunker(x, rnd) {
    for (let px = 0; px < TW; px += 192) wrap(x, px, (ox) => { x.fillStyle = '#1b2d30'; rrPath(x, ox + 10, 100, 172, 250, 8); x.fill(); x.strokeStyle = 'rgba(0,0,0,.5)'; x.lineWidth = 3; x.stroke(); for (const [a, b] of [[22, 112], [170, 112], [22, 338], [170, 338]]) { x.fillStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(ox + a, b, 4, 0, 6.3); x.fill(); } });
    for (let px = 40; px < TW; px += 340) wrap(x, px, (ox) => { x.fillStyle = COL.yellow; x.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(ox + i * 22, 20); x.lineTo(ox + i * 22 + 12, 20); x.lineTo(ox + i * 22 - 4, 40); x.lineTo(ox + i * 22 - 16, 40); x.fill(); } x.globalAlpha = 1; });
  },
  graveyard(x, rnd) {
    x.strokeStyle = '#0e0b22'; x.lineWidth = 6;
    for (let px = 0; px < TW; px += 38) { x.beginPath(); x.moveTo(px, GY); x.lineTo(px, GY - 70 - ((px / 38) % 3) * 6); x.stroke(); x.beginPath(); x.moveTo(px - 4, GY - 70); x.lineTo(px, GY - 82); x.lineTo(px + 4, GY - 70); x.stroke(); }
    x.beginPath(); x.moveTo(0, GY - 52); x.lineTo(TW, GY - 52); x.moveTo(0, GY - 28); x.lineTo(TW, GY - 28); x.stroke();
    for (let i = 0; i < 6; i++) { const px = rnd() * TW; wrap(x, px, (ox) => { x.save(); x.translate(ox, GY - 20); x.rotate(R(-0.3, 0.3, rnd)); x.fillStyle = '#17132f'; x.fillRect(-4, -60, 8, 60); x.fillRect(-20, -46, 40, 8); x.restore(); }); }
  },
  arena(x, rnd) {
    for (let px = 0; px < TW; px += 26) { const h = 50 + rnd() * 90; x.fillStyle = ['#2a7a28', '#1f5f20', '#3a9a2c'][(px / 26 | 0) % 3]; x.beginPath(); x.moveTo(px, GY + 10); x.quadraticCurveTo(px + 6, GY - h * 0.5, px + 14, GY - h); x.quadraticCurveTo(px + 20, GY - h * 0.5, px + 26, GY + 10); x.fill(); }
  },
};

const CHAT = ['@everyone', 'jesi tu?', 'xd', 'ko ima vremena', '...', 'brate', 'sta radite', 'hahaha', 'ping?', 'lag'];

export function drawBackdrop(ctx, cam, viewW, viewH, offY, t, lit, reduced) {
  const top = -offY;
  for (const z of ZONES) {
    const sx0 = Math.floor(z.x0 - cam), sx1 = Math.ceil(z.x1 - cam);
    if (sx1 < 0 || sx0 > viewW) continue;
    const cx0 = Math.max(0, sx0), cx1 = Math.min(viewW, sx1);
    ctx.save();
    ctx.beginPath(); ctx.rect(cx0, top, cx1 - cx0, viewH); ctx.clip();
    const sky = SKY[z.theme];
    const g = ctx.createLinearGradient(0, top, 0, GY);
    g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
    ctx.fillStyle = g; ctx.fillRect(cx0, top, cx1 - cx0, viewH);
    if (z.theme === 'arena' && lit > 0) {
      const g2 = ctx.createLinearGradient(0, top, 0, GY); g2.addColorStop(0, '#5ab4ff'); g2.addColorStop(1, '#d4ffa8');
      ctx.globalAlpha = lit; ctx.fillStyle = g2; ctx.fillRect(cx0, top, cx1 - cx0, viewH); ctx.globalAlpha = 1;
    }
    for (const [layer, par] of [['far', 0.22], ['mid', 0.5]]) {
      const im = tile(z.theme, layer), off = cam * par;
      const first = Math.floor((cx0 + off) / TW);
      for (let i = first; i * TW - off < cx1; i++) {
        const dx = Math.round(i * TW - off);
        ctx.drawImage(im, 0, 0, im.width, im.height, dx, 0, TW, TH);
      }
      if (layer === 'far') {
        // lebdeći četovi
        if (!reduced) for (let k = 0; k < 4; k++) {
          const wx = ((k * 947 + z.x0 * 0.31) % 3000), px = ((wx - cam * 0.38 + t * 7 * (1 + k * 0.2)) % 1700 + 1700) % 1700 - 300;
          const py = 70 + (k * 71) % 160 + Math.sin(t * 0.7 + k) * 10;
          if (px > cx0 - 120 && px < cx1 + 120) {
            ctx.globalAlpha = 0.28; ctx.font = '13px "Arial Black", sans-serif';
            const s = CHAT[(k * 3 + (z.x0 / 100 | 0)) % CHAT.length], w = ctx.measureText(s).width + 20;
            ctx.fillStyle = '#c9ceff'; rrPath(ctx, px - w / 2, py - 14, w, 28, 12); ctx.fill();
            ctx.fillStyle = '#10143a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, px, py + 1);
            ctx.globalAlpha = 1;
          }
        }
      }
    }
    if (z.theme === 'arena' && lit > 0) { // sunčevi zraci kad je server spašen
      ctx.globalAlpha = lit * 0.18; ctx.fillStyle = '#fff6b0';
      for (let k = 0; k < 5; k++) { const bx = (k * 260 - cam * 0.3 + 120) ; ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx + 60, top); ctx.lineTo(bx + 280, GY); ctx.lineTo(bx + 150, GY); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    // tlo
    const gr = GROUND[z.theme], gx = sx0;
    const gg = ctx.createLinearGradient(0, GY - 4, 0, 540 + offY + 10);
    gg.addColorStop(0, gr[0]); gg.addColorStop(1, gr[1]);
    ctx.fillStyle = gg; ctx.fillRect(cx0, GY - 2, cx1 - cx0, viewH);
    ctx.fillStyle = COL.ink; ctx.fillRect(cx0, GY - 5, cx1 - cx0, 5);
    ctx.fillStyle = gr[2]; ctx.globalAlpha = 0.9; ctx.fillRect(cx0, GY, cx1 - cx0, 3); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 3;
    const step = 96, startK = Math.floor((cx0 + cam - z.x0) / step);
    for (let k = startK; z.x0 + k * step - cam < cx1; k++) {
      const wx = z.x0 + k * step - cam;
      ctx.beginPath(); ctx.moveTo(wx, GY + 4); ctx.lineTo(wx - 24, 540 + offY); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx0, GY + 40); ctx.lineTo(cx1, GY + 40); ctx.moveTo(cx0, GY + 82); ctx.lineTo(cx1, GY + 82); ctx.stroke();
    ctx.restore();
  }
}

/** Prednji plan (paralaksa > 1): viseći kablovi, magla, trava. Crta se POSLE likova. */
export function drawForeground(ctx, cam, viewW, viewH, offY, t, lit, reduced) {
  const top = -offY;
  for (const z of ZONES) {
    if (z.x1 - cam < 0 || z.x0 - cam > viewW) continue;
    const th = z.theme;
    const par = 1.25, off = cam * par - cam; // dodatni pomak
    const cx0 = Math.max(0, z.x0 - cam), cx1 = Math.min(viewW, z.x1 - cam);
    ctx.save(); ctx.beginPath(); ctx.rect(cx0, top, cx1 - cx0, viewH); ctx.clip();
    const n = 5;
    for (let k = Math.floor((cam * par - 100) / 360); k * 360 - cam * par < viewW + 100; k++) {
      const wx = k * 360 + (k * 97 % 160) - cam * par;
      if (wx < cx0 - 140 || wx > cx1 + 140) continue;
      const r = ((k * 2654435761) >>> 0) % 100 / 100;
      if (th === 'lobby' || th === 'institute' || th === 'bunker') {
        if (r > 0.45) continue;
        const l = 70 + r * 220, cols = th === 'institute' ? [COL.green, COL.teal] : th === 'bunker' ? [COL.yellow, COL.grey] : [COL.purple2, COL.pink];
        ctx.beginPath(); ctx.moveTo(wx, top - 10); ctx.bezierCurveTo(wx + 30, l * 0.4, wx - 30, l * 0.7, wx + 8 + Math.sin(t + k) * 4, l);
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke(); ctx.strokeStyle = cols[k % 2]; ctx.lineWidth = 9; ctx.stroke();
      } else if (th === 'graveyard') {
        ctx.globalAlpha = 0.14; ctx.fillStyle = '#c9b8ff';
        ctx.beginPath(); ctx.ellipse(wx + Math.sin(t * 0.3 + k) * 30, GY - 6, 170, 26, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      } else if (th === 'arena') {
        ctx.fillStyle = k % 2 ? '#2f8a2a' : '#3aa631';
        ctx.beginPath(); ctx.moveTo(wx - 14, 560); ctx.quadraticCurveTo(wx - 6, GY + 70, wx + Math.sin(t * 1.5 + k) * 8, GY + 30); ctx.quadraticCurveTo(wx + 10, GY + 70, wx + 16, 560); ctx.fill();
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.stroke();
      } else if (th === 'club' && !reduced) {
        ctx.globalAlpha = 0.18; ctx.fillStyle = [COL.pink, COL.purple2, COL.teal][k % 3];
        ctx.beginPath(); ctx.arc(wx, 120 + (k * 53 % 200) + Math.sin(t + k) * 12, 22 + r * 20, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      } else if (th === 'ministry' && r < 0.4) {
        ctx.save(); ctx.translate(wx, top + 6 - offY * 0); ctx.rotate(Math.sin(t * 0.9 + k) * 0.06);
        ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
        ctx.fillStyle = COL.white; ctx.globalAlpha = 0.95; rrPath(ctx, -22, 40, 44, 56, 3); ctx.fill(); ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1; ctx.restore();
      }
    }
    ctx.restore();
  }
}
