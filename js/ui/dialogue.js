// Dijalog sa typewriter efektom. Klik/E/Space: prvo otkrije ceo red, pa ide dalje.
import { ui, reduced } from '../core/state.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { CHARACTERS } from '../config/characters.js';
import { h } from '../core/util.js';

let panel, imgEl, nameEl, textEl, choicesEl, nextEl;
let cur = null; // { full, shown, timer, resolve, ready, shownAt, choices }
let skipping = false;
let unlockTimer = 0;

export function initDialogue() {
  panel = document.getElementById('dialogue');
  imgEl = document.getElementById('dlg-img');
  nameEl = document.getElementById('dlg-name');
  textEl = document.getElementById('dlg-text');
  choicesEl = document.getElementById('dlg-choices');
  nextEl = document.getElementById('dlg-next');
  panel.addEventListener('click', (e) => { if (e.target.closest('button')) return; advance(); });
  input.on('any', (e) => {
    if (!cur || e.repeat) return;
    if (cur.choices) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= cur.choices) { e.preventDefault(); pickChoice(n - 1); }
      return;
    }
    if (['Space', 'Enter', 'KeyE'].includes(e.code)) { e.preventDefault(); advance(); }
  });
}

function show(who, text, choices) {
  clearTimeout(unlockTimer);
  const c = CHARACTERS[who] || { name: who };
  ui.lock('dialogue');
  document.body.classList.add('busy');
  panel.hidden = false;
  nameEl.textContent = c.name || who;
  if (c.avatar) { imgEl.src = c.avatar; imgEl.hidden = false; imgEl.alt = c.name; } else imgEl.hidden = true;
  choicesEl.replaceChildren();
  nextEl.hidden = !!choices;
  textEl.textContent = '';
  return new Promise((resolve) => {
    cur = { full: text, shown: 0, timer: 0, resolve, ready: false, shownAt: performance.now(), choices: choices ? choices.length : 0, options: choices };
    const done = () => {
      cur.ready = true; cur.shown = text.length; textEl.textContent = text;
      clearInterval(cur.timer);
      if (choices) renderChoices(choices);
    };
    cur.finish = done;
    if (reduced() || skipping) { done(); if (skipping && !choices) finishLine(); return; }
    cur.timer = setInterval(() => {
      cur.shown = Math.min(text.length, cur.shown + 2);
      textEl.textContent = text.slice(0, cur.shown);
      if (cur.shown % 4 === 0) audio.sfx('blip');
      if (cur.shown >= text.length) done();
    }, 28);
  });
}

function renderChoices(opts) {
  choicesEl.replaceChildren(...opts.map((o, i) => h('button', { class: 'btn ghost', type: 'button', onclick: () => pickChoice(i) }, `${i + 1}. ${o}`)));
  const b = choicesEl.querySelector('button'); if (b) b.focus({ preventScroll: true });
}

function release() {
  panel.hidden = true;
  cur = null;
  unlockTimer = setTimeout(() => {
    if (!cur) { ui.unlock('dialogue'); document.body.classList.toggle('busy', ui.busy); }
  }, 40);
}

function finishLine(val = 0) {
  const r = cur.resolve;
  release();
  r(val);
}

function advance() {
  if (!cur || cur.choices) return;
  if (performance.now() - cur.shownAt < 160) return;
  if (!cur.ready) { cur.finish(); cur.shownAt = performance.now() - 100; return; }
  audio.sfx('click');
  finishLine();
}

function pickChoice(i) {
  if (!cur || !cur.choices || !cur.ready) return;
  if (performance.now() - cur.shownAt < 160) return;
  audio.sfx('click');
  skipping = false;
  finishLine(i);
}

/** Jedna replika. */
export function say(who, text) {
  if (skipping) return Promise.resolve();
  return show(who, text, null);
}

/** Niz replika: [[who, text], ...] */
export async function sayAll(lines) {
  for (const [who, text] of lines) await say(who, text);
}

/** Ponudi izbore, vrati indeks (ili -1 ako je prekinuto Escape-om). */
export function choose(who, text, options) {
  skipping = false;
  return show(who, text, options);
}

export const dialogue = {
  get active() { return !!cur; },
  /** Escape: preskoči ostatak razgovora (izbori vraćaju -1). */
  skip() {
    if (!cur) return;
    if (cur.choices) { skipping = true; finishLine(-1); return; }
    skipping = true;
    cur.finish && cur.finish();
    finishLine();
  },
  begin() { skipping = false; },
};
