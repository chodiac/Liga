// Finale: Prevelika Trava. Skači preko sunčevih kugli, beži od zraka, skupi 3 izgovora
// i ubaci ih u ruter. Telegrafi na svaki napad, velikodušni sudari, retry + pomoć.
import { S, ui, flag, setFlag, take, count, changed } from './core/state.js';
import { G, emit, shake, hurtPlayer, worldToScreen, flash, banner } from './game.js';
import { say, sayAll } from './ui/dialogue.js';
import { bossHud, flashHint, flyItem } from './ui/hud.js';
import { openModal } from './ui/modal.js';
import { audio } from './core/audio.js';
import { TEXT } from './config/dialogue.js';
import { GY } from './config/zones.js';
import { rand, sleep, h, clamp } from './core/util.js';
import { COL, bubble } from './gfx/draw.js';
import { PROPS } from './gfx/props.js';
import { drawGrass } from './gfx/chars.js';
import { unlockAch, runBusy } from './quests.js';

export const BOSS_X = 10690;
export const ARENA = [9720, 10860];

export const B = {
  active: false, starting: false, hp: 3, maxHp: 3, cd: 2, flash: 0, say: '', sayT: 0, orbs: [], beams: [], warns: [],
  alt: 0, assist: false, deaths: 0, shrink: 0, onEnd: null, retryOpen: false,
};

function hud() { bossHud(B.active, B.hp, B.maxHp, motiv()); }
export const motiv = () => (flag('bossDone') ? 0 : 1 - S.boss.used / 3);

export function bossTalk(text, secs = 2.6) { B.say = text; B.sayT = secs; }

async function start() {
  B.starting = true;
  G.busy = true;
  try {
    if (!flag('bossIntro')) { await sayAll(TEXT.boss.intro); setFlag('bossIntro'); }
    else await say('trava', 'Napolju je lepo.');
    begin();
  } finally { G.busy = false; B.starting = false; }
}

function begin() {
  B.assist = B.assist || S.settings.assist;
  B.maxHp = B.assist ? 6 : 3; B.hp = B.maxHp;
  B.orbs.length = B.beams.length = B.warns.length = 0;
  B.cd = 1.6; B.active = true; B.alt = 0;
  G.player.invuln = 1;
  hud();
}

export function updateBoss(dt, t) {
  B.flash = Math.max(0, B.flash - dt);
  B.sayT = Math.max(0, B.sayT - dt);
  const p = G.player;
  // početak borbe
  if (!B.active && !B.starting && !B.retryOpen && !flag('bossDone') && ui.play && !G.busy && p.x > 9830 && p.spawn <= 0) runBusy(start);
  if (flag('bossDone') && B.shrink < 1) B.shrink = Math.min(1, B.shrink + dt * 0.8);
  if (!B.active) return;
  if (ui.busy) return; // dijalog/meni zamrzavaju borbu

  B.cd -= dt;
  if (B.cd <= 0) {
    B.alt++;
    const slow = B.assist ? 1.3 : 1;
    if (B.alt % 3 === 0) {
      const bx = clamp(p.x + rand(-30, 120), ARENA[0] + 60, ARENA[1] - 60);
      B.beams.push({ x: bx, t: 0, warn: 1.15 * slow, live: 0.45 });
      audio.sfx('warn');
    } else {
      const ex = Math.min(BOSS_X - 90, G.cam.x + G.viewW + 50);
      B.warns.push({ t: 0, dur: 0.9 * slow, x: ex, vx: -(B.assist ? 125 : 170) });
      audio.sfx('warn');
    }
    B.cd = rand(1.5, 2.1) * (B.assist ? 1.25 : 1);
  }
  for (let i = B.warns.length - 1; i >= 0; i--) {
    const w = B.warns[i]; w.t += dt;
    if (w.t >= w.dur) { B.orbs.push({ x: Math.min(BOSS_X - 90, G.cam.x + G.viewW + 50), vx: w.vx, spin: 0 }); B.warns.splice(i, 1); }
  }
  for (let i = B.orbs.length - 1; i >= 0; i--) {
    const o = B.orbs[i]; o.x += o.vx * dt;
    if (o.x < ARENA[0] - 80 || o.x < G.cam.x - 80) { B.orbs.splice(i, 1); continue; }
    // velikodušan sudar: uzak, a vrh kugle iznad stopala
    if (Math.abs(o.x - p.x) < 24 && p.y > GY - 46) { if (hit(Math.sign(p.x - o.x) || 1)) B.orbs.splice(i, 1); }
  }
  for (let i = B.beams.length - 1; i >= 0; i--) {
    const b = B.beams[i]; b.t += dt;
    if (b.t > b.warn + b.live) { B.beams.splice(i, 1); continue; }
    if (b.t > b.warn && Math.abs(b.x - p.x) < 28) hit(Math.sign(p.x - b.x) || 1);
  }
}

function hit(dir) {
  if (!hurtPlayer(dir)) return false;
  B.hp--; hud();
  if (B.hp <= 0) lose();
  return true;
}

function lose() {
  B.active = false; B.retryOpen = true; B.deaths++;
  S.stats.fail.boss++; changed();
  B.orbs.length = B.beams.length = B.warns.length = 0;
  hud();
  const body = h('div', {},
    h('p', {}, 'Sunce te je pogodilo. Dobio si 40 vitamina D i 0 poena za dostojanstvo.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', onclick: () => m.close('retry') }, 'Probaj ponovo'),
      !B.assist ? h('button', { class: 'btn warn', type: 'button', onclick: () => m.close('assist') }, 'Ajde pomozi malo') : null));
  const m = openModal({ title: 'Prevelika Trava pobeđuje (privremeno)', body, closable: false });
  m.done.then((v) => {
    B.retryOpen = false;
    if (v === 'assist') B.assist = true;
    G.player.x = Math.max(ARENA[0] + 40, 9800); G.player.vx = 0;
    begin();
  });
}

export async function useRouter(o) {
  if (flag('bossDone')) { await sayAll(TEXT.boss.router); return; }
  if (count('izgovor') <= 0) { flashHint(TEXT.boss.excuseNoItem, 2400); audio.sfx('bad'); return; }
  take('izgovor');
  S.boss.used++; changed();
  const text = TEXT.boss.excuses[S.boss.used - 1];
  G.player.say = text; G.player.sayT = 2.2;
  audio.sfx('ping'); emit('star', o.x, GY - 90, 10, { color: COL.pink });
  B.flash = 0.4; shake(3);
  await sleep(500);
  bossTalk(TEXT.boss.hurt[S.boss.used - 1]);
  hud();
  if (S.boss.used >= 3) await victory();
}

async function victory() {
  B.active = false;
  B.orbs.length = B.beams.length = B.warns.length = 0;
  setFlag('bossDone');
  unlockAch('boss');
  hud();
  audio.sfx('boom'); shake(8);
  flash('flash', 140);
  G.player.cheer = 4;
  await sleep(900);
  await sayAll(TEXT.boss.defeat);
  audio.music('victory'); audio.sfx('win');
  for (let i = 0; i < 4; i++) { emit('confetti', G.player.x + rand(-200, 200), GY - 220, 26); await sleep(350); }
  await sleep(700);
  if (B.onEnd) B.onEnd();
}

export function resetBoss() { B.active = false; B.starting = false; B.orbs.length = B.beams.length = B.warns.length = 0; B.shrink = 0; B.deaths = 0; B.assist = false; B.retryOpen = false; bossHud(false); }

export function drawBoss(ctx, t) {
  // sam boss
  const done = flag('bossDone');
  drawGrass(ctx, BOSS_X, GY, t, { motiv: motiv() || (done ? 0 : 1), flash: B.flash > 0 ? 1 : 0, scale: done ? 1 - B.shrink * 0.62 : 1, defeated: done });
  if (B.sayT > 0) { ctx.save(); bubble(ctx, B.say, BOSS_X - 20, GY - 300, { size: 14 }); ctx.restore(); }
  const p = G.player;
  if (p.sayT > 0) { p.sayT -= 1 / 60; bubble(ctx, p.say, p.x, p.y - 150, { size: 14, fill: '#ffd0ea' }); }
  // projektili i telegrafi
  for (const w of B.warns) {
    const x = G.cam.x + G.viewW - 48, a = 0.5 + Math.abs(Math.sin(t * 16)) * 0.5;
    ctx.globalAlpha = a;
    ctx.fillStyle = COL.yellow; ctx.beginPath(); ctx.moveTo(x - 24, GY - 34); ctx.lineTo(x + 18, GY - 58); ctx.lineTo(x + 18, GY - 10); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = COL.ink; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (const o of B.orbs) { ctx.save(); ctx.translate(o.x, GY - 36); PROPS.sunOrb(ctx, o, t); ctx.restore(); }
  for (const b of B.beams) { ctx.save(); ctx.translate(b.x, GY); PROPS.sunBeam(ctx, { phase: b.t < b.warn ? 'warn' : 'live' }, t); ctx.restore(); }
}
