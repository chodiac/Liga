// Mali set funkcija za crtanje "debelih" ilustracija sa crnim ivicama (canvas 2D).
export const COL = {
  ink: '#0a0d1c',
  navy: '#0d1230',
  navy2: '#151c42',
  navy3: '#1f2858',
  char: '#1b2030',
  char2: '#2a3045',
  green: '#b6ff3c',
  green2: '#7fd11a',
  purple: '#5865f2',
  purple2: '#7b86ff',
  purple3: '#3b43b5',
  yellow: '#e8c53a',
  yellow2: '#b99a20',
  pink: '#ff3fa4',
  red: '#ff4d5e',
  white: '#f4f6ff',
  grey: '#8d97b3',
  grey2: '#566082',
  teal: '#35d0c0',
  orange: '#ff9a2e',
};

export function rrPath(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function paint(ctx, fill, lw = 4, stroke = COL.ink) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}

export function box(ctx, x, y, w, h, r, fill, lw = 4) { rrPath(ctx, x, y, w, h, r); paint(ctx, fill, lw); }
export function ell(ctx, cx, cy, rx, ry, fill, lw = 4) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2); paint(ctx, fill, lw); }
export function poly(ctx, pts, fill, lw = 4) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  paint(ctx, fill, lw);
}

/** Debela linija (ud, ruka, kabl) sa ivicom. */
export function limb(ctx, x1, y1, x2, y2, w, col, lw = 3.5) {
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = w + lw * 2; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}

export function curve(ctx, pts, w, col, lw = 3.5) {
  // pts: [x0,y0, cx1,cy1, cx2,cy2, x1,y1]
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); ctx.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = w + lw * 2; ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}

export function text(ctx, s, x, y, size = 16, col = COL.white, align = 'center', outline = 0, font = '"Arial Black", Impact, sans-serif') {
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (outline) { ctx.lineWidth = outline; ctx.strokeStyle = COL.ink; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col;
  ctx.fillText(s, x, y);
}

export function glow(ctx, x, y, r, col, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/** Oblačić sa tekstom (sa više redova, \n). Vraća širinu. */
export function bubble(ctx, s, x, y, opts = {}) {
  const size = opts.size || 15, fill = opts.fill || COL.white, col = opts.col || COL.ink, pad = 10;
  ctx.font = `${size}px "Arial Black", Impact, sans-serif`;
  const lines = String(s).split('\n');
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2;
  const h = lines.length * (size + 4) + pad * 1.2;
  const bx = x - w / 2, by = y - h - 12;
  rrPath(ctx, bx, by, w, h, 10);
  paint(ctx, fill, 3.5);
  // rep
  ctx.beginPath(); ctx.moveTo(x - 7, by + h - 1); ctx.lineTo(x, by + h + 11); ctx.lineTo(x + 8, by + h - 1);
  ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 7, by + h); ctx.lineTo(x, by + h + 11); ctx.lineTo(x + 8, by + h);
  ctx.strokeStyle = COL.ink; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, x, by + pad * 0.6 + (i + 0.5) * (size + 4)));
  return w;
}

/** Slika iz SVG stringa (keširana). */
const imgCache = new Map();
export function svgImage(svg) {
  let im = imgCache.get(svg);
  if (!im) {
    im = new Image();
    const s = svg.includes('xmlns') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
    imgCache.set(svg, im);
  }
  return im;
}
