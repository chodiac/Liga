// Pomoćnik za ručno testiranje u pregledaču (nije deo igre).
const b = window.__brainrot;
export const T = {
  b,
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  start(free = false) { document.getElementById(free ? 'i-go' : 'i-go').click(); b.tick(1 / 60, 120); },
  async walk(x) {
    b.G.nav.target = null;
    for (let i = 0; i < 1500; i++) { const d = x - b.G.player.x; if (Math.abs(d) < 6) break; b.G.nav.target = Math.max(40, Math.min(b.G.player.x + Math.sign(d) * 400, x)); b.tick(1 / 60, 3); if (b.ui.busy) await this.sleep(10); }
    b.G.nav.target = null; b.tick(1 / 60, 3); return b.G.player.x;
  },
  key(c) { window.dispatchEvent(new KeyboardEvent('keydown', { code: c, key: c === 'KeyE' ? 'e' : c })); window.dispatchEvent(new KeyboardEvent('keyup', { code: c })); },
  async talk(choices = []) {
    let n = 0;
    for (let i = 0; i < 120; i++) {
      await this.sleep(200);
      const d = document.getElementById('dialogue');
      if (d.hidden) { if (++n > 2) return; continue; }
      n = 0;
      const btns = [...document.querySelectorAll('#dlg-choices button')];
      if (btns.length) { btns[choices.length ? choices.shift() : 0].click(); } else d.click();
    }
  },
  async act() { this.key('KeyE'); await this.sleep(60); },
  info() { return { x: Math.round(b.G.player.x), flags: Object.keys(b.S.flags).join(','), near: b.G.near && b.G.near.type, modals: document.querySelectorAll('.modal-bg').length, dlg: !document.getElementById('dialogue').hidden, inv: JSON.stringify(b.S.inv) }; },
  jump() { this.key('Space'); },
};
window.T = T;
