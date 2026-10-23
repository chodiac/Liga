// Prozori u stilu starog desktopa (stek). Dok je neki otvoren, igra je zaključana.
import { ui } from '../core/state.js';
import { h } from '../core/util.js';
import { audio } from '../core/audio.js';

const root = () => document.getElementById('modals');
const stack = [];

/**
 * openModal({ title, body, wide, closable, onClose })
 * Vraća { el, close(value), done: Promise<value> }
 */
export function openModal({ title, body, wide = false, closable = true, onClose, cls = '' }) {
  let resolve;
  const done = new Promise((r) => { resolve = r; });
  const m = { el: null, closable, close: null, done, requestClose: null };
  const xbtn = closable ? h('button', { class: 'x', type: 'button', 'aria-label': 'Zatvori', onclick: () => m.requestClose() }, 'X') : null;
  const win = h('div', { class: `win ${wide ? 'wide' : ''} ${cls}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'win-title' }, h('span', {}, title), h('span', { class: 'dots' }, h('i'), h('i'), h('i')), xbtn),
    h('div', { class: 'win-body' }, body));
  const bg = h('div', { class: 'modal-bg' }, win);
  bg.addEventListener('pointerdown', (e) => { if (e.target === bg && closable) m.requestClose(); });
  m.el = win;
  m.close = (val) => {
    const i = stack.indexOf(m);
    if (i < 0) return;
    stack.splice(i, 1);
    bg.remove();
    if (!stack.length) ui.unlock('modal');
    document.body.classList.toggle('busy', ui.busy);
    if (onClose) onClose(val);
    resolve(val);
  };
  m.requestClose = () => { if (m.beforeClose && m.beforeClose() === false) return; m.close(null); };
  stack.push(m);
  ui.lock('modal');
  document.body.classList.add('busy');
  root().append(bg);
  audio.sfx('click');
  const first = win.querySelector('button.btn,button:not(.x)');
  if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  return m;
}

export const modals = {
  get open() { return stack.length > 0; },
  top: () => stack[stack.length - 1],
  closeTop() { const m = stack[stack.length - 1]; if (m && m.closable) { m.requestClose(); return true; } return false; },
  closeAll() { [...stack].forEach((m) => m.close(null)); },
};

/** Jednostavna potvrda (Da/Ne). */
export function confirmBox(title, text, yes = 'Da', no = 'Ne') {
  return new Promise((res) => {
    let m;
    const body = h('div', {}, h('p', {}, text),
      h('div', { class: 'row' },
        h('button', { class: 'btn danger', type: 'button', onclick: () => m.close(true) }, yes),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => m.close(false) }, no)));
    m = openModal({ title, body });
    m.done.then((v) => res(v === true));
  });
}
