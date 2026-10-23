// Povezivanje kablova: klik/tap kabl pa priključak (ili prevlačenje). Simboli + boje.
import { openModal } from '../ui/modal.js';
import { h, pick } from '../core/util.js';
import { audio } from '../core/audio.js';
import { TEXT } from '../config/dialogue.js';

const NS = 'http://www.w3.org/2000/svg';
const DEFS = [
  { id: 'tri', col: '#ff4d5e', name: 'trougao', shape: '<path d="M16 5L28 27H4z" fill="#f4f6ff" stroke="#0a0d1c" stroke-width="3" stroke-linejoin="round"/>' },
  { id: 'circle', col: '#b6ff3c', name: 'krug', shape: '<circle cx="16" cy="16" r="11" fill="#f4f6ff" stroke="#0a0d1c" stroke-width="3"/>' },
  { id: 'square', col: '#7b86ff', name: 'kvadrat', shape: '<rect x="6" y="6" width="20" height="20" rx="3" fill="#f4f6ff" stroke="#0a0d1c" stroke-width="3"/>' },
];
const PINGS = [999, 420, 130, 24];

const icon = (d) => `<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">${d.shape}</svg>`;

export function cableGame() {
  return new Promise((resolve) => {
    const sockOrder = [DEFS[2], DEFS[0], DEFS[1]]; // izmešano u odnosu na kablove
    let sel = null, done = 0, dragging = false;
    const connected = new Set();
    const pingEl = h('div', { class: 'ping' }, '999', h('small', {}, ' ms'));
    const react = h('div', { class: 'react', 'aria-live': 'polite' }, 'Izaberi kabl pa priključak sa istim simbolom.');
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'wires');
    const mk = (d, kind) => h('button', { class: kind, type: 'button', 'data-id': d.id, 'aria-label': `${kind === 'plug' ? 'Kabl' : 'Priključak'}: ${d.name}` },
      h('span', { class: 'ic', style: `background:${d.col}`, html: icon(d) }), h('span', {}, d.name.toUpperCase()));
    const plugs = DEFS.map((d) => mk(d, 'plug'));
    const socks = sockOrder.map((d) => mk(d, 'sock'));
    const area = h('div', { class: 'cab' }, svg, h('div', { class: 'col' }, ...plugs), h('div', { class: 'col' }, ...socks));
    const m = openModal({ title: 'Institut — panel za ping', wide: true, body: h('div', {}, pingEl, area, react, h('p', { class: 'muted' }, 'Klik na kabl pa na priključak. Na računaru možeš i da prevučeš.')) });

    const center = (el) => { const a = area.getBoundingClientRect(), r = el.getBoundingClientRect(); return [r.left + r.width / 2 - a.left, r.top + r.height / 2 - a.top]; };
    const line = (x1, y1, x2, y2, col) => {
      const p = document.createElementNS(NS, 'path'); const mx = (x1 + x2) / 2;
      p.setAttribute('d', `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`);
      p.setAttribute('stroke', col); p.setAttribute('stroke-width', '8'); p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round');
      svg.append(p); return p;
    };
    let ghost = null;
    const clearSel = () => { sel && sel.classList.remove('sel'); sel = null; ghost && ghost.remove(); ghost = null; };

    function attempt(plug, sock) {
      const pid = plug.dataset.id, sid = sock.dataset.id;
      if (pid === sid) {
        const d = DEFS.find((x) => x.id === pid);
        const [x1, y1] = center(plug), [x2, y2] = center(sock);
        const a = area.getBoundingClientRect();
        line(x1 + plug.offsetWidth / 2, y1, x2 - sock.offsetWidth / 2, y2, d.col);
        plug.classList.add('done'); sock.classList.add('done'); plug.disabled = sock.disabled = true;
        connected.add(pid); done++;
        pingEl.firstChild.textContent = String(PINGS[done]);
        react.textContent = ['Ping pada. Zvuči skoro ljudski.', 'Još malo. Atmosferski pritisak popušta.', 'Ping 24! Skoro neprirodno brzo.'][done - 1];
        audio.sfx('ping');
        if (done === 3) setTimeout(() => m.close(true), 1300);
      } else {
        audio.sfx('bad');
        react.textContent = pick(TEXT.institute.reactions);
        sock.classList.remove('shake'); void sock.offsetWidth; sock.classList.add('shake');
        const cur = parseInt(pingEl.firstChild.textContent, 10);
        pingEl.firstChild.textContent = String(cur + 60);
        setTimeout(() => { if (!connected.size || true) pingEl.firstChild.textContent = String(PINGS[done]); }, 600);
      }
      clearSel();
    }

    plugs.forEach((pl) => {
      pl.addEventListener('pointerdown', (e) => {
        if (pl.disabled) return;
        audio.unlock();
        if (sel && sel !== pl) sel.classList.remove('sel');
        sel = pl; pl.classList.add('sel'); dragging = e.pointerType === 'mouse';
        ghost && ghost.remove(); ghost = null;
        react.textContent = `Izabran: ${pl.dataset.id === 'tri' ? 'trougao' : pl.dataset.id === 'circle' ? 'krug' : 'kvadrat'}. Sad priključak!`;
        audio.sfx('click');
      });
    });
    socks.forEach((so) => so.addEventListener('click', () => { if (sel && !so.disabled) attempt(sel, so); }));
    // prevlačenje (dodatna opcija za miš)
    const move = (e) => {
      if (!dragging || !sel) return;
      const [x1, y1] = center(sel); const a = area.getBoundingClientRect();
      if (!ghost) ghost = line(0, 0, 0, 0, '#f4f6ff');
      const x2 = e.clientX - a.left, y2 = e.clientY - a.top, mx = (x1 + sel.offsetWidth / 2 + x2) / 2;
      ghost.setAttribute('d', `M${x1 + sel.offsetWidth / 2} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`);
      socks.forEach((s) => s.classList.toggle('hover', !!(document.elementFromPoint(e.clientX, e.clientY)?.closest('.sock') === s)));
    };
    const up = (e) => {
      if (!dragging || !sel) { dragging = false; return; }
      dragging = false;
      const t = document.elementFromPoint(e.clientX, e.clientY)?.closest('.sock');
      socks.forEach((s) => s.classList.remove('hover'));
      if (t && !t.disabled) attempt(sel, t); else if (ghost) { ghost.remove(); ghost = null; }
    };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
    m.done.then((v) => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); resolve(v === true); });
  });
}
