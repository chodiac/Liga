// Kompaktan HUD: cilj, inventar, napredak, mapa, zvuk, pauza + toastovi i hintovi.
import { S, subscribe, count, questProgress, reduced } from '../core/state.js';
import { ITEMS } from '../config/items.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { h } from '../core/util.js';
import { audio } from '../core/audio.js';

let el = {};
let objectiveFn = () => '';
let lastInv = '';
let lastObj = '';

export function initHud(objFn, { onMap, onPause, onAudio }) {
  objectiveFn = objFn;
  el = {
    hud: document.getElementById('hud'), obj: document.getElementById('obj-text'), inv: document.getElementById('inv'),
    progText: document.getElementById('prog-text'), progBar: document.getElementById('prog-bar'),
    audio: document.getElementById('b-audio'), hint: document.getElementById('hint'), toasts: document.getElementById('toasts'),
    boss: document.getElementById('bosshud'), hearts: document.getElementById('b-hearts'), motiv: document.getElementById('b-motiv'),
  };
  document.getElementById('b-map').addEventListener('click', onMap);
  document.getElementById('b-pause').addEventListener('click', onPause);
  el.audio.addEventListener('click', onAudio);
  subscribe(update);
  update();
}

export function showHud(on) { el.hud.hidden = !on; }

export function update() {
  const o = objectiveFn();
  if (o !== lastObj) { lastObj = o; el.obj.textContent = o; }
  const { done, total } = questProgress();
  el.progText.textContent = `${done}/${total}`;
  el.progBar.style.width = `${(done / total) * 100}%`;
  const on = !!S.settings.sound;
  el.audio.setAttribute('aria-pressed', on);
  el.audio.setAttribute('aria-label', on ? 'Zvuk uključen' : 'Zvuk isključen');
  // inventar: iscrtava se samo kad se sadržaj promeni
  const ids = Object.keys(ITEMS).filter((id) => count(id) > 0);
  const sig = ids.map((id) => id + count(id)).join('|');
  if (sig !== lastInv) {
    const prev = lastInv; lastInv = sig;
    const slots = Math.max(5, ids.length);
    const kids = [];
    for (let i = 0; i < slots; i++) {
      const id = ids[i];
      if (!id) { kids.push(h('div', { class: 'slot' })); continue; }
      const it = ITEMS[id], n = count(id);
      const isNew = !prev.includes(id + n);
      kids.push(h('div', { class: 'slot has' + (isNew && prev ? ' pop' : ''), title: `${it.name} — ${it.desc}`, 'data-item': id, html: it.svg }, n > 1 ? h('span', { class: 'n' }, n) : null));
    }
    el.inv.replaceChildren(...kids);
  }
}

export function hint(text) {
  if (!text) { el.hint.hidden = true; return; }
  if (el.hint.textContent !== text) el.hint.textContent = text;
  el.hint.hidden = false;
}

let hintTimer = 0;
export function flashHint(text, ms = 2600) {
  hint(text);
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => hint(null), ms);
}

export function toast(title, desc = '', icon = '★', kind = 'ach') {
  const t = h('div', { class: `toast ${kind}` }, h('span', { class: 'ti' }, icon), h('div', {}, h('div', { class: 'tt' }, title), desc ? h('div', { class: 'td' }, desc) : null));
  el.toasts.append(t);
  while (el.toasts.children.length > 3) el.toasts.firstChild.remove();
  setTimeout(() => t.classList.add('out'), 4200);
  setTimeout(() => t.remove(), 4700);
}

export function achToast(id) {
  const a = ACHIEVEMENTS[id];
  if (a) toast(a.title, `Dostignuće: ${a.desc}`, '🏆');
  audio.sfx('ach');
}

/** Predmet "leti" sa ekranske tačke u slot inventara. */
export function flyItem(id, fromX, fromY) {
  const it = ITEMS[id];
  if (!it || reduced()) return;
  const f = h('div', { class: 'fly', html: it.svg });
  f.style.left = fromX - 20 + 'px'; f.style.top = fromY - 20 + 'px';
  document.body.append(f);
  requestAnimationFrame(() => {
    const slot = el.inv.querySelector(`[data-item="${id}"]`) || el.inv.lastElementChild;
    const r = slot ? slot.getBoundingClientRect() : { left: window.innerWidth - 120, top: 20, width: 34, height: 34 };
    const dx = r.left + r.width / 2 - fromX, dy = r.top + r.height / 2 - fromY;
    f.style.transform = `translate(${dx}px,${dy}px) scale(.7) rotate(300deg)`;
    f.style.opacity = '0.6';
  });
  setTimeout(() => f.remove(), 800);
}

export function bossHud(on, hp = 3, maxHp = 3, motiv = 1) {
  el.boss.hidden = !on;
  if (!on) return;
  el.hearts.replaceChildren(...Array.from({ length: maxHp }, (_, i) => h('span', { class: i < hp ? '' : 'off' }, '♥')));
  el.motiv.style.width = `${Math.max(0, motiv) * 100}%`;
}

export function invSlotRect(id) {
  const slot = el.inv.querySelector(`[data-item="${id}"]`);
  return slot ? slot.getBoundingClientRect() : null;
}
