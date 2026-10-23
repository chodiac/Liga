// Čuvanje poslednjeg neurona: korpa, neuroni i notifikacije. Tastatura + dodir/miš.
import { openModal } from '../ui/modal.js';
import { h, rand, pick, clamp } from '../core/util.js';
import { audio } from '../core/audio.js';
import { input } from '../core/input.js';
import { S, changed, reduced } from '../core/state.js';
import { COL, box, ell, text, rrPath } from '../gfx/draw.js';

const W = 480, H = 360, NOTES = ['@everyone', 'Brate jesi tu?', 'Samo da te pitam nešto.', 'Update zahteva restart.'];
const NEED = 5, TIME = 30;

/** Vraća Promise<boolean>. */
export function neuronGame() {
  return new Promise((resolve) => {
    let assist = !!S.settings.assist;
    let m, raf = 0, off = null;

    const canvas = h('canvas', { id: 'ncanvas', width: W, height: H, 'aria-label': 'Minigra: hvataj neurone' });
    const hud = h('div', { class: 'nhud' }, h('span', { id: 'n-c' }), h('span', { id: 'n-t' }), h('span', { id: 'n-l' }));
    const left = h('button', { class: 'btn alt', type: 'button', 'aria-label': 'Levo' }, '◀');
    const right = h('button', { class: 'btn alt', type: 'button', 'aria-label': 'Desno' }, '▶');
    const msg = h('div', { class: 'stat' }, 'Hvataj neurone (zeleni). Beži od notifikacija.');
    const wrap = h('div', { class: 'nwrap' }, hud, canvas, h('div', { class: 'nbtns' }, left, right), msg);
    const overlay = h('div', { class: 'row', style: 'margin-top:10px;justify-content:center' });
    wrap.append(overlay);
    m = openModal({ title: 'Deploy bunker — spasi neuron', body: wrap, wide: true });

    const ctx = canvas.getContext('2d');
    let st;
    const holdL = { v: false }, holdR = { v: false };
    for (const [b, o] of [[left, holdL], [right, holdR]]) {
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); o.v = true; audio.unlock(); });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => { o.v = false; });
    }
    let ptrX = null;
    canvas.addEventListener('pointerdown', (e) => { audio.unlock(); setPtr(e); canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') setPtr(e); });
    canvas.addEventListener('pointerup', () => { ptrX = null; });
    const setPtr = (e) => { const r = canvas.getBoundingClientRect(); ptrX = (e.clientX - r.left) / r.width * W; };

    function reset() {
      st = { x: W / 2, got: 0, time: TIME, lives: assist ? 5 : 3, items: [], spawn: 0.3, over: false, flash: 0, bw: assist ? 110 : 76, last: performance.now() };
      overlay.replaceChildren(); msg.textContent = assist ? 'Pomoć je uključena: veća korpa, manje notifikacija.' : 'Hvataj neurone (zeleni). Beži od notifikacija.';
    }

    function finish(win) {
      st.over = true;
      if (win) {
        audio.sfx('win'); msg.textContent = 'Neuron spašen!';
        setTimeout(() => m.close(true), 1100);
      } else {
        S.stats.fail.neuron++; changed(); audio.sfx('bad');
        msg.textContent = st.lives <= 0 ? 'Previše notifikacija. Neuron je otišao na spavanje.' : 'Vreme je isteklo. Neuron je zaspao.';
        const btns = [h('button', { class: 'btn', type: 'button', onclick: () => reset() }, 'Probaj ponovo')];
        if (!assist && S.stats.fail.neuron >= 2) btns.push(h('button', { class: 'btn warn', type: 'button', onclick: () => { assist = true; S.settings.assist = false; reset(); } }, 'Ajde pomozi malo'));
        overlay.replaceChildren(...btns);
        btns[0].focus();
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
      draw();
      if (st.over) return;
      let ax = input.axis() + (holdR.v ? 1 : 0) - (holdL.v ? 1 : 0);
      if (ax) { st.x += clamp(ax, -1, 1) * 380 * dt; ptrX = null; }
      else if (ptrX != null) st.x += clamp(ptrX - st.x, -520 * dt, 520 * dt);
      st.x = clamp(st.x, st.bw / 2, W - st.bw / 2);
      st.time -= dt; st.spawn -= dt; st.flash = Math.max(0, st.flash - dt);
      if (st.spawn <= 0) {
        const bad = Math.random() < (assist ? 0.28 : 0.45);
        st.items.push({ x: rand(40, W - 40), y: -30, bad, txt: pick(NOTES), v: (bad ? rand(115, 160) : rand(130, 180)) * (assist ? 0.78 : 1), w: bad ? 0 : 0 });
        st.spawn = assist ? rand(0.5, 0.8) : rand(0.55, 0.9);
      }
      const by = H - 44;
      for (let i = st.items.length - 1; i >= 0; i--) {
        const it = st.items[i]; it.y += it.v * dt;
        const hw = it.bad ? 54 : 16, caught = it.y > by - 14 && it.y < by + 30 && Math.abs(it.x - st.x) < st.bw / 2 + (it.bad ? 24 : 14);
        if (caught) {
          st.items.splice(i, 1);
          if (it.bad) { st.lives--; st.flash = 0.35; audio.sfx('hit'); if (st.lives <= 0) finish(false); }
          else { st.got++; audio.sfx('catch'); if (st.got >= NEED) finish(true); }
        } else if (it.y > H + 40) st.items.splice(i, 1);
      }
      if (st.time <= 0 && !st.over) finish(false);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#10224a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 12; i++) ctx.fillRect(i * 44 + 8, 0, 2, H);
      for (const it of st.items) {
        if (it.bad) {
          ctx.font = '12px Arial'; const w = ctx.measureText(it.txt).width + 34;
          box(ctx, it.x - w / 2, it.y - 18, w, 36, 6, '#e9ecff', 3.5);
          box(ctx, it.x - w / 2, it.y - 18, w, 11, 4, COL.red, 0);
          text(ctx, it.txt, it.x + 8, it.y + 6, 12, COL.ink, 'center', 0, 'Arial');
          ell(ctx, it.x - w / 2 + 12, it.y + 5, 5, 5, COL.pink, 2);
        } else {
          ctx.save(); ctx.globalAlpha = 0.5; ell(ctx, it.x, it.y, 24, 24, 'rgba(182,255,60,.35)', 0); ctx.restore();
          ell(ctx, it.x, it.y, 13, 13, COL.green, 3.5);
          ell(ctx, it.x - 4, it.y - 2, 2, 2.4, COL.ink, 0); ell(ctx, it.x + 4, it.y - 2, 2, 2.4, COL.ink, 0);
        }
      }
      // korpa
      const by = H - 44, bw = st.bw;
      ctx.beginPath(); ctx.moveTo(st.x - bw / 2, by); ctx.lineTo(st.x - bw / 2 + 8, by + 34); ctx.lineTo(st.x + bw / 2 - 8, by + 34); ctx.lineTo(st.x + bw / 2, by); ctx.closePath();
      ctx.fillStyle = '#9b5f36'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = COL.ink; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2.5; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(st.x - bw / 2 + i * bw / 4, by + 2); ctx.lineTo(st.x - bw / 2 + 8 + i * (bw - 16) / 4, by + 32); ctx.stroke(); }
      if (st.flash > 0) { ctx.fillStyle = `rgba(255,77,94,${st.flash})`; ctx.fillRect(0, 0, W, H); }
      document.getElementById('n-c').textContent = `Neuroni: ${st.got}/${NEED}`;
      document.getElementById('n-t').textContent = `Vreme: ${Math.max(0, Math.ceil(st.time))}s`;
      document.getElementById('n-l').textContent = 'Baterija: ' + '♥'.repeat(Math.max(0, st.lives));
    }

    reset();
    raf = requestAnimationFrame((t) => { st.last = t; loop(t); });
    m.done.then((v) => { cancelAnimationFrame(raf); resolve(v === true); });
  });
}
