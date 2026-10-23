// Ulaz: tastatura + dugmad na dodir. Jedno mesto, jedan izvor istine za kretanje.
const held = new Set();
const touch = { left: false, right: false };
const listeners = { jump: new Set(), act: new Set(), esc: new Set(), any: new Set() };

const MOVE_L = ['KeyA', 'ArrowLeft'];
const MOVE_R = ['KeyD', 'ArrowRight'];

export const input = {
  /** -1, 0 ili 1 */
  axis() {
    const l = touch.left || MOVE_L.some((k) => held.has(k));
    const r = touch.right || MOVE_R.some((k) => held.has(k));
    return (r ? 1 : 0) - (l ? 1 : 0);
  },
  isDown: (code) => held.has(code),
  on(type, fn) { listeners[type].add(fn); return () => listeners[type].delete(fn); },
  clear() { held.clear(); touch.left = touch.right = false; },
  touchState: touch,
};

const isTyping = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

function onKeyDown(e) {
  if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
  const c = e.code;
  listeners.any.forEach((f) => f(e));
  if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(c) && !(e.target.closest && e.target.closest('.panel,.modal'))) e.preventDefault();
  if (e.repeat) { held.add(c); return; }
  held.add(c);
  if (c === 'Space' || c === 'ArrowUp' || c === 'KeyW') listeners.jump.forEach((f) => f(e));
  else if (c === 'KeyE') listeners.act.forEach((f) => f(e));
  else if (c === 'Escape') listeners.esc.forEach((f) => f(e));
}
function onKeyUp(e) { held.delete(e.code); }

export function initInput() {
  addEventListener('keydown', onKeyDown);
  addEventListener('keyup', onKeyUp);
  addEventListener('blur', () => input.clear());
  document.addEventListener('visibilitychange', () => input.clear());

  // Dugmad na dodir
  const bind = (id, down, up) => {
    const el = document.getElementById(id);
    if (!el) return;
    const on = (e) => { e.preventDefault(); el.classList.add('is-down'); try { el.setPointerCapture(e.pointerId); } catch { /* ok */ } down(); };
    const off = (e) => { e.preventDefault(); el.classList.remove('is-down'); up(); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('lostpointercapture', () => { el.classList.remove('is-down'); up(); });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  bind('t-left', () => { touch.left = true; }, () => { touch.left = false; });
  bind('t-right', () => { touch.right = true; }, () => { touch.right = false; });
  bind('t-jump', () => listeners.jump.forEach((f) => f({ touch: true })), () => {});
  bind('t-act', () => listeners.act.forEach((f) => f({ touch: true })), () => {});
}
