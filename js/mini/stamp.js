// Štampiljka: tri žiga sa velikodušnim prozorom tajminga.
import { openModal } from '../ui/modal.js';
import { h } from '../core/util.js';
import { audio } from '../core/audio.js';
import { input } from '../core/input.js';
import { reduced } from '../core/state.js';

const MARKS = ['PRIMLJENO', 'ZAVEDENO', 'ODOBRENO, VALJDA.'];
const SPOTS = [[8, 90], [40, 120], [20, 150]];

export function stampGame() {
  return new Promise((resolve) => {
    let n = 0, pos = 0, dir = 1, speed = 0.55, zoneW = 0.34, raf = 0, last = 0, ok = false, off = null;
    const zone = h('div', { class: 'zone' }), mark = h('div', { class: 'mark' });
    const track = h('div', { class: 'track', 'aria-label': 'Traka tajminga' }, zone, mark);
    const stat = h('div', { class: 'stat', 'aria-live': 'polite' }, 'Pritisni ŽIG kad je žuti kursor u zelenom.');
    const paper = h('div', { class: 'paper' }, h('h4', {}, 'POTVRDA O POSEDOVANJU POTVRDE'), h('div', { class: 'ln' }), h('div', { class: 'ln' }), h('div', { class: 'ln' }), h('div', { class: 'ln' }), h('div', { class: 'ln' }));
    const btn = h('button', { class: 'btn warn', type: 'button', style: 'width:100%;font-size:20px;min-height:58px' }, 'ŽIG!');
    const body = h('div', {}, paper, track, stat, btn, h('p', { class: 'muted' }, 'Space / E / klik na dugme. Nema kazne za promašaj — samo sramota.'));
    const m = openModal({ title: 'Ministarstvo — overa dokumenta', body, closable: true });
    const layout = () => { const left = 0.5 - zoneW / 2 + (n === 1 ? 0.18 : n === 2 ? -0.16 : 0); zone.style.left = left * 100 + '%'; zone.style.width = zoneW * 100 + '%'; return left; };
    let left = layout();

    function tick(ts) {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
      pos += dir * speed * dt;
      if (pos > 1) { pos = 1; dir = -1; } else if (pos < 0) { pos = 0; dir = 1; }
      mark.style.left = pos * 100 + '%';
    }
    function press() {
      if (ok) return;
      audio.unlock();
      if (pos >= left && pos <= left + zoneW) {
        audio.sfx('stamp');
        const [sx, sy] = [SPOTS[n][0], SPOTS[n][1]];
        const el = h('div', { class: 'stampmark', style: `left:${sx + n * 12}%;top:${sy}px` }, MARKS[n]);
        if (n === 2) el.style.fontSize = '17px';
        paper.append(el);
        n++;
        stat.textContent = n < 3 ? `Žig ${n}/3 — ${['dobro', 'lepo'][n - 1]}!` : MARKS[2];
        if (n >= 3) { ok = true; setTimeout(() => m.close(true), reduced() ? 600 : 1500); cancelAnimationFrame(raf); return; }
        speed += 0.12; zoneW = Math.max(0.24, zoneW - 0.03); left = layout();
      } else {
        audio.sfx('bad');
        stat.textContent = 'Mimoilaženje. Pokušaj opet.';
        zoneW = Math.min(0.5, zoneW + 0.03); speed = Math.max(0.4, speed - 0.04); left = layout(); // oprost
      }
    }
    btn.addEventListener('click', press);
    off = input.on('any', (e) => { if (!e.repeat && (e.code === 'Space' || e.code === 'KeyE')) { e.preventDefault(); press(); } });
    raf = requestAnimationFrame(tick);
    m.done.then((v) => { cancelAnimationFrame(raf); off && off(); resolve(v === true); });
  });
}
