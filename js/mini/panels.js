// Manji prozori: sud za AFK izgovore, eksponati muzeja, kartice likova.
import { openModal } from '../ui/modal.js';
import { h, pick } from '../core/util.js';
import { audio } from '../core/audio.js';
import { TEXT } from '../config/dialogue.js';
import { ICONS } from '../config/memes.js';
import { CHARACTERS } from '../config/characters.js';
import { S, changed } from '../core/state.js';

const EXCUSES = [
  { t: 'Pao mi je net.', bel: 92 },
  { t: 'Mačka mi je legla na tastaturu.', bel: 81 },
  { t: 'Morao sam komšiji da pomognem oko ormara.', bel: 63 },
  { t: 'Golub mi je zamenio profilnu sliku, pa sam ga pitao zašto.', bel: 3 },
];

/** Izaberi NAJMANJE verodostojan izgovor. Vraća Promise<boolean>. */
export function afkGame() {
  return new Promise((resolve) => {
    const meter = h('i', { style: 'display:block;height:100%;width:0;background:linear-gradient(90deg,#b6ff3c,#e8c53a,#ff4d5e);transition:width .6s' });
    const bar = h('div', { style: 'height:20px;border:3px solid #0a0d1c;border-radius:10px;background:#0a0d1c;overflow:hidden;margin:8px 0' }, meter);
    const reaction = h('div', { class: 'react', style: 'min-height:3em' }, 'Sudija čeka. Sudija nikad ne žuri.');
    let wrong = 0, m;
    const btns = EXCUSES.map((e, i) => h('button', {
      class: 'btn ghost', type: 'button', style: 'text-align:left;width:100%',
      onclick: () => {
        meter.style.width = e.bel + '%';
        if (i === 3) {
          audio.sfx('win'); reaction.textContent = 'Verodostojnost: ' + e.bel + '%. Sudija se smeje.';
          btns.forEach((b) => (b.disabled = true));
          setTimeout(() => m.close(true), 1200);
        } else {
          audio.sfx('bad'); reaction.textContent = `Verodostojnost: ${e.bel}%. ` + TEXT.grave.judgeWrong[wrong++ % TEXT.grave.judgeWrong.length];
        }
      },
    }, `${i + 1}. ${e.t}`));
    const body = h('div', {}, h('p', {}, 'Sudija: ',
      h('b', {}, 'Koji je izgovor NAJMANJE verodostojan?')), h('div', { class: 'list' }, ...btns), h('div', { class: 'muted', style: 'margin-top:8px' }, 'Meter verodostojnosti:'), bar, reaction);
    m = openModal({ title: 'Sud za AFK izgovore', body });
    m.done.then((v) => resolve(v === true));
  });
}

/** Eksponat: ikona + animacija + šala + klik-interakcija. */
export function showExhibit(meme, onSeen) {
  let n = 0;
  const art = h('div', { class: `art anim-${meme.anim}`, html: ICONS[meme.icon] || '', role: 'button', tabindex: '0', 'aria-label': 'Dodirni eksponat' });
  const line = h('div', { class: 'react', style: 'text-align:left;min-height:2.6em' }, 'Eksponat čeka da ga neko dotakne.');
  const poke = () => {
    audio.sfx('pick'); n++;
    line.textContent = meme.pokes[(n - 1) % meme.pokes.length];
    art.style.transform = 'scale(1.08) rotate(' + (n % 2 ? 4 : -4) + 'deg)'; setTimeout(() => { art.style.transform = ''; }, 120);
  };
  art.addEventListener('click', poke);
  art.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); } });
  const body = h('div', { class: 'exh' }, art, h('div', { class: 'txt' }, h('h3', {}, meme.title), h('pre', {}, meme.text), line,
    h('button', { class: 'btn alt', type: 'button', onclick: poke }, 'Dodirni eksponat')));
  const m = openModal({ title: 'Muzej mimova — eksponat', body });
  if (onSeen) onSeen();
  return m.done;
}

export function showCard(title, text, tag = '') {
  const m = openModal({ title, body: h('div', {}, h('p', {}, text), h('button', { class: 'btn', type: 'button', onclick: () => m.close() }, 'Važi')) });
  return m.done;
}

export function showCharacterCard(id) {
  const c = CHARACTERS[id];
  const m = openModal({
    title: 'Zid slavnih (fiktivnih)',
    body: h('div', {},
      h('div', { class: 'card' }, h('img', { src: c.avatar, alt: c.username }),
        h('div', {}, h('h3', {}, c.username), h('span', { class: 'tag' }, c.role))),
      h('p', { style: 'margin-top:12px' }, c.blurb),
      h('p', { class: 'muted' }, `„${c.idle}“`),
      h('p', { class: 'muted' }, 'Uloga je izmišljena persona iz igre — ne tvrdnja o stvarnoj osobi.'),
      h('button', { class: 'btn', type: 'button', onclick: () => m.close() }, 'Važi')),
  });
  return m.done;
}
