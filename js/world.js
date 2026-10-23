// Sadržaj sveta: objekti, rekviziti, likovi, platforme, dinamika i cilj-markeri.
import { S, flag, count, ui, reduced, setFlag, give } from './core/state.js';
import { G, emit, worldToScreen } from './game.js';
import { GY, GATES } from './config/zones.js';
import { CHARACTERS } from './config/characters.js';
import { MEMES } from './config/memes.js';
import { TEXT } from './config/dialogue.js';
import { drawChar, drawBot } from './gfx/chars.js';
import { COL, ell, box, text, bubble } from './gfx/draw.js';
import { PROPS } from './gfx/props.js';
import { clamp, lerp, easeOut, rand } from './core/util.js';
import * as Q from './quests.js';
import { B, drawBoss, updateBoss, useRouter, BOSS_X } from './boss.js';
import { audio } from './core/audio.js';
import { flyItem } from './ui/hud.js';

const objects = [], platforms = [];
const add = (o) => { o.z = o.z ?? 0; objects.push(o); return o; };
const talkMood = (o) => (ui.has('dialogue') && Math.abs(G.player.x - o.x) < 200 ? 'talk' : 'idle');

// ------------------------------------------------------------------ fabrike
function crate(x, h, w = 76, label) {
  platforms.push({ x, y: GY - h, w });
  return add({ type: 'crate', x, w, h, label, z: -0.5 });
}
function ledge(x, top, w = 110, col) {
  platforms.push({ x, y: top, w });
  return add({ type: 'ledge', x, y: top, w, col, z: -0.5 });
}

function npc(id, x, face, extra = {}) {
  const look = CHARACTERS[id].look;
  const o = {
    x, face, id, ant: 0, seen: false, seed: x % 7, cull: 120, hitW: 50, hitH: 150,
    update(dt) {
      const d = Math.abs(G.player.x - o.x);
      if (d < 240 && !o.seen) { o.seen = true; o.ant = 0.55; }
      if (d > 360) o.seen = false;
      o.ant = Math.max(0, o.ant - dt);
    },
    draw(ctx, _o, t) {
      const px = G.player.x, d = Math.abs(px - o.x);
      const fc = d < 560 ? (Math.sign(px - o.x) || o.face) : o.face;
      let sy = 1, sx = 1, hop = 0;
      if (o.ant > 0 && !reduced()) {
        const u = 1 - o.ant / 0.55;
        if (u < 0.35) { const k = Math.sin((u / 0.35) * Math.PI / 2); sy = 1 - 0.12 * k; sx = 1 + 0.08 * k; }
        else hop = Math.sin(((u - 0.35) / 0.65) * Math.PI) * 18;
      }
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 2, 28 - hop * 0.3, 7, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      drawChar(ctx, look, 0, -hop, { face: fc, t, scale: 0.95, mood: o.mood ? o.mood() : talkMood(o), sx, sy, seed: o.seed, hold: extra.hold, lean: d < 300 ? 0.04 * fc : 0 });
    },
    ...extra,
  };
  return add(o);
}

function persona(x, look, face, extra = {}) {
  const o = {
    x, face, ant: 0, seen: false, seed: x % 5, cull: 120, hitW: 50, hitH: 150,
    update(dt) { const d = Math.abs(G.player.x - o.x); if (d < 240 && !o.seen) { o.seen = true; o.ant = 0.55; } if (d > 360) o.seen = false; o.ant = Math.max(0, o.ant - dt); },
    draw(ctx, _o, t) {
      const px = G.player.x, d = Math.abs(px - o.x), fc = d < 560 ? (Math.sign(px - o.x) || o.face) : o.face;
      const hop = o.ant > 0 && !reduced() ? Math.sin((1 - o.ant / 0.55) * Math.PI) * 14 : 0;
      ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 2, 28, 7, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      drawChar(ctx, look, 0, -hop, { face: fc, t, scale: 0.95, mood: o.mood ? o.mood() : talkMood(o), seed: o.seed, hold: o.hold });
    },
    ...extra,
  };
  return add(o);
}

function wanderBot(x0, x1, label, color, speed = 38, seed = 0) {
  const o = { x: x0 + (x1 - x0) * 0.5, dir: 1, seed, cull: 150, z: -0.2, wait: 0,
    update(dt) { if (o.wait > 0) { o.wait -= dt; return; } o.x += o.dir * speed * dt; if (o.x > x1 || o.x < x0) { o.dir *= -1; o.wait = 1.2; } },
    draw(ctx, _o, t) {
      drawBot(ctx, 0, 0, t, { face: o.dir, color, seed, moving: o.wait <= 0, scale: 0.8 });
      if (Math.abs(G.player.x - o.x) < 380) {
        ctx.save(); ctx.globalAlpha = 0.9; bubble(ctx, label, 0, -66, { size: 11 }); ctx.restore();
      }
    } };
  return add(o);
}

// ------------------------------------------------------------------ LOBI (0–1300)
add({ type: 'wallBricks', x: 8, z: -0.8, cull: 100 });
add({ x: 70, act: { label: 'Zid', range: 60, run: Q.wallAct }, draw() {}, hitW: 50, hitH: 200 });
add({ type: 'portal', x: 130, z: -0.6, cull: 100, get alpha() { return 1; } });
add({ type: 'fakeDoor', x: 260, act: { label: 'Tajna?', range: 60, run: Q.fakeDoorAct }, hitW: 40, hitH: 130, promptY: 150 });
add({ type: 'crookedSign', x: 380, act: { label: 'Znak', range: 70, run: Q.signAct }, hitW: 80, hitH: 150, promptY: 180 });
add({ type: 'monitorDesk', x: 520, act: { label: 'Monitor', range: 80, run: Q.monitorAct }, hitW: 70, hitH: 130, promptY: 170 });
add({ type: 'giantCable', x: 560, z: -0.6, cull: 560 });
add({ type: 'serverTower', x: 690, act: { label: () => (count('kabl') && !flag('towerFixed') ? 'Uključi kabl' : 'Server'), range: 90, run: Q.towerAct }, hitW: 70, hitH: 230, promptY: 245, cull: 100 });
crate(790, 70, 76, 'RAM');
ledge(890, GY - 150, 110);
add({ type: 'sticker', x: 890, y: GY - 150, z: 0.2, act: { label: 'Zlatna nalepnica', range: 60, show: () => !S.secrets.nalepnica && G.player.y < GY - 100, run: Q.stickerAct }, promptY: 60, hitW: 40, hitH: 40 });
add({ type: 'looseCable', x: 960, get taken() { return flag('cable'); }, act: { label: 'Podigni kabl', range: 80, show: () => !flag('cable'), run: (o) => Q.pickCable(o) }, promptY: 90, hitW: 50, hitH: 60, cull: 120 });
// bot koji se večno povezuje
const reco = add({
  x: 1060, dir: 1, tries: 4171, wait: 0, cull: 120, hitW: 40, hitH: 80,
  act: { label: 'Bot', range: 80, run: Q.botAct },
  update(dt) {
    if (reco.wait > 0) { reco.wait -= dt; return; }
    reco.x += reco.dir * 50 * dt;
    if (reco.x > 1180 || reco.x < 1000) { reco.dir *= -1; reco.wait = 0.9; reco.tries++; }
  },
  draw(ctx, _o, t) {
    drawBot(ctx, 0, 0, t, { face: reco.dir, color: COL.teal, moving: reco.wait <= 0 });
    bubble(ctx, `Povezivanje... #${reco.tries}`, 0, -76, { size: 11 });
  },
});
wanderBot(280, 440, 'Brojim kablove: 7', COL.pink, 30, 1);

// ------------------------------------------------------------------ MINISTARSTVO (1300–2950)
add({ type: 'pillar', x: 1296, z: -0.9, cull: 60 });
add({ type: 'banner', x: 1560, z: -0.7, cull: 300, title: 'MINISTARSTVO NEPOTREBNIH POSLOVA', col: COL.yellow, ink: true, w: 360 });
add({ type: 'plant', x: 1390, act: undefined });
add({ type: 'clock', x: 1760, z: -0.7 });
add({ type: 'filing', x: 1640 });
const printer = add({
  x: 1800, state: 'idle', hops: 0, face: -1, hopY: 0, hop: null, cull: 140, hitW: 60, hitH: 90, tiredT: 0,
  type: 'printer',
  act: { label: (o) => (o.state === 'idle' ? 'Štampač' : o.state === 'done' ? 'Štampač' : 'Uhvati!'), range: 78, run: (o) => Q.printerAct(o) },
  update(dt) {
    const o = printer, px = G.player.x;
    if (!ui.busy) o.grace = Math.max(0, (o.grace || 0) - dt);
    if (flag('paper')) o.state = 'done';
    if (o.state === 'flee') {
      if (o.hop) {
        const h = o.hop; h.t += dt / 0.6;
        o.x = lerp(h.from, h.to, easeOut(h.t)); o.hopY = Math.sin(Math.min(1, h.t) * Math.PI) * 100;
        if (h.t >= 1) { o.hop = null; o.hopY = 0; o.hops++; if (o.hops >= 2) o.state = 'tired'; }
      } else {
        const d = px - o.x;
        if (Math.abs(d) < 230) {
          const dir = -Math.sign(d) || 1;
          o.face = dir;
          const atWall = (dir > 0 && o.x >= 2140) || (dir < 0 && o.x <= 1500);
          if (atWall) { if (Math.abs(d) < 140) o.hop = { t: 0, from: o.x, to: clamp(px - dir * 150, 1500, 2140) }; }
          else o.x = clamp(o.x + dir * 290 * dt, 1500, 2140);
          if (!reduced() && Math.random() < dt * 14) emit('dust', o.x, GY, 1);
        }
      }
    }
  },
  draw(ctx, o, t) {
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 2, 40 - o.hopY * 0.2, 8, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
    PROPS.printer(ctx, o, t);
  },
});
add({ type: 'ticket', x: 2000, act: { label: 'Broj na redu', range: 60, run: Q.ticketAct }, hitW: 50, hitH: 90, promptY: 110 });
crate(2060, 70, 80, 'ARHIVA');
ledge(2150, GY - 140, 100);
wanderBot(1500, 1700, 'Žigošem vazduh', COL.yellow, 30, 2);
const pero = npc('pero', 2340, -1, { act: { label: 'Razgovaraj: pero nikic samo', range: 130, run: Q.talkPero }, promptY: 200, hold: 'stamp' });
add({ type: 'desk', x: 2340, z: 1, act: { label: 'Gomila papira', range: 70, show: () => false, run: Q.deskAct } });
const bell = add({ type: 'bell', x: 2230, y: GY - 68, z: 1.1, rung: 0, act: { label: 'Zvonce', range: 54, run: (o) => Q.bellAct(o) }, hitW: 30, hitH: 40, promptY: 70,
  update(dt) { bell.rung = Math.max(0, bell.rung - dt); } });
add({ type: 'plant', x: 2560 });
add({ type: 'filing', x: 2680 });
add({ type: 'filing', x: 2750 });

// ------------------------------------------------------------------ KLUB (2950–3750)
add({ type: 'pillar', x: 2954, z: -0.9, cull: 60 });
add({ type: 'poster', x: 3070, z: -0.4, act: { label: 'Pravila', range: 70, run: Q.posterAct }, promptY: 200, hitW: 60, hitH: 190 });
add({ type: 'banner', x: 3330, z: -0.7, title: 'KLUPSKA PROSTORIJA', col: COL.pink });
add({ type: 'couch', x: 3200, act: { label: 'Kauč', range: 90, run: Q.couchAct }, promptY: 130, hitW: 100, hitH: 100 });
add({ type: 'jukebox', x: 3350, act: { label: 'Džuboks', range: 70, run: Q.jukeAct }, promptY: 200, hitW: 50, hitH: 190 });
add({ type: 'fridge', x: 3470, act: { label: 'Frižider', range: 70, run: Q.fridgeAct }, promptY: 190, hitW: 50, hitH: 170 });
add({ type: 'bigScreen', x: 3620, act: { label: 'Otvori Discord kanal', range: 110, run: Q.screenAct }, promptY: 235, hitW: 110, hitH: 210 });
crate(3260, 60, 70);
add({ type: 'pillar', x: 3746, z: -0.9, cull: 60 });

// ------------------------------------------------------------------ INSTITUT (3750–5150)
add({ type: 'cableMess', x: 3900, z: -0.3 });
add({ type: 'weather', x: 4040, act: { label: 'Tabla', range: 70, run: Q.weatherAct }, promptY: 200, hitW: 90, hitH: 180 });
wanderBot(3820, 3990, 'Poliram latenciju', COL.green, 28, 3);
npc('vasilije', 4330, -1, { act: { label: 'Razgovaraj: Vasilije', range: 130, run: Q.talkVasilije }, promptY: 210, hold: 'wrench' });
add({ type: 'bench', x: 4330, z: 1 });
add({ type: 'pingMonitor', x: 4570, z: -0.3 });
add({ type: 'socketPanel', x: 4740, act: { label: () => (flag('ping') ? 'Panel' : 'Panel za ping'), range: 90, run: Q.panelAct }, promptY: 175, hitW: 80, hitH: 160 });
crate(4900, 60, 70);
crate(4960, 110, 60);

// ------------------------------------------------------------------ MUZEJ (5150–6450)
add({ type: 'rope', x: 5200, z: 0.8, cull: 80 });
add({ type: 'rope', x: 5290, z: 0.8 });
add({ x: 5250, cull: 120, hitW: 40, hitH: 100, act: { label: 'Kustos Bot', range: 90, run: Q.kustosAct }, draw(ctx, o, t) { drawBot(ctx, 0, 0, t, { face: 1, color: COL.purple2 }); }, promptY: 120 });
MEMES.slice(0, 6).forEach((m, i) => {
  add({ type: 'frame', x: 5390 + i * 170, meme: m, z: -0.2, act: { label: m.title, range: 82, run: () => Q.exhibitAct(m) }, promptY: 250, hitW: 70, hitH: 240 });
});
add({ type: 'emptyFrame', x: 6420 - 90, z: -0.2, act: { label: 'Prazan ram', range: 82, run: Q.emptyFrameAct }, promptY: 250, hitW: 70, hitH: 240 });

// ------------------------------------------------------------------ BUNKER (6450–7800)
add({ type: 'pillar', x: 6454, z: -0.9, cull: 60 });
add({ type: 'alarm', x: 6560, y: GY - 230 });
add({ type: 'neuronJar', x: 6650 });
wanderBot(6600, 6780, 'Gasim požar od ponedeljka', COL.orange, 34, 4);
add({ type: 'chair', x: 6930, z: -0.1 });
npc('chdc', 6930, -1, { act: { label: 'Razgovaraj: chdc', range: 120, run: Q.talkChdc }, promptY: 215, hold: 'can', mood: () => (flag('neuron') ? (ui.has('dialogue') ? 'talk' : 'cheer') : ui.has('dialogue') ? 'talk' : 'sleepy') });
const consoleObj = add({ type: 'console', x: 7000, z: 1, press: false, act: { label: 'Konzola', range: 40, show: () => false, run: Q.consoleAct } });
add({ x: 7085, y: GY - 100, z: 1.1, press: false, hitW: 40, hitH: 40, promptY: 50, draw() {}, act: { label: 'NE DIRAJ', range: 46, run: (o) => Q.redButton(o) },
  update() { consoleObj.press = this.press; } });
crate(7300, 70, 80);
ledge(7410, GY - 120, 100);
crate(7560, 60, 60);

// ------------------------------------------------------------------ GROBLJE (7800–9700)
add({ type: 'pillar', x: 7804, z: -0.9, cull: 60 });
add({ type: 'lantern', x: 7890 });
add({ type: 'signpost', x: 7990, act: { label: 'Tabla', range: 80, run: Q.graveSignAct }, promptY: 220, hitW: 110, hitH: 190 });
add({ type: 'deadTree', x: 8120, s: 1.2, z: -0.4 });
add({ type: 'tomb', x: 8200, kind: 0, i: 0, act: { label: 'Nadgrobni natpis', range: 50, run: (o) => Q.tombAct(o) }, promptY: 140, hitW: 40, hitH: 100 });
add({ type: 'tomb', x: 8290, kind: 1, i: 1, act: { label: 'Nadgrobni natpis', range: 50, run: (o) => Q.tombAct(o) }, promptY: 140, hitW: 40, hitH: 100 });
{
  const look = { skin: '#d9b6e8', top: '#6b7aa8', topDark: '#4d5b8a', bottom: '#2c3350', shoe: '#10131f', hair: '#7a6aa8', hairType: 'bowl', headgear: null, bags: true, accessory: 'none' };
  persona(8420, look, 1, { act: { label: 'Razgovaraj: Tipkač', range: 110, run: (oo) => Q.tipAct(oo) }, promptY: 215, mood: () => (flag('fragTip') ? 'idle' : 'worry') });
  add({ type: 'tipBubble', x: 8420, y: GY - 10, z: 0.3, get done() { return flag('fragTip'); } });
}
wanderBot(8000, 8180, "Brišem prašinu sa 'lol'", COL.teal, 26, 5);
add({ type: 'stonks', x: 8560, act: { label: 'Stonks', range: 70, run: Q.stonksAct }, promptY: 180, hitW: 80, hitH: 160 });
add({ type: 'tomb', x: 8660, kind: 2, i: 2, act: { label: 'Nadgrobni natpis', range: 50, run: (o) => Q.tombAct(o) }, promptY: 140, hitW: 40, hitH: 120 });
add({ type: 'sadPc', x: 8750, act: { label: 'Tužan računar', range: 60, run: Q.sadPcAct }, promptY: 130, hitW: 50, hitH: 100 });
add({ type: 'spinner', x: 8850, act: { label: 'Spinner', range: 60, run: Q.spinnerAct }, promptY: 200, hitW: 60, hitH: 180 });
add({ type: 'deadTree', x: 8940, s: 0.9, z: -0.4 });
{
  const look = { skin: '#e8b88c', top: '#232336', topDark: '#12121f', bottom: '#232336', shoe: '#10131f', hair: '#f4f6ff', hairType: 'wig', glasses: 'round', hold: 'gavel', accessory: 'none' };
  persona(9010, look, -1, { hold: 'gavel', act: { label: 'Razgovaraj: Sudija', range: 120, run: (o) => Q.judgeAct(o) }, promptY: 215, mood: () => 'smug' });
  add({ type: 'bench', x: 9010, z: 1 });
}
[['pero', 9110], ['vasilije', 9250], ['chdc', 9390]].forEach(([id, x]) => {
  const c = CHARACTERS[id];
  add({ type: 'niche', x, label: c.username, sub: c.role.length > 30 ? c.role.slice(0, 28) + '…' : c.role, z: -0.3, act: { label: c.username, range: 66, run: () => Q.characterAct(id) }, promptY: 255, hitW: 66, hitH: 230, hold: null,
    draw(ctx, o, t) {
      PROPS.niche(ctx, o, t);
      ctx.save(); ctx.beginPath(); ctx.rect(-56, -226, 112, 190); ctx.clip();
      drawChar(ctx, c.look, 0, -42, { face: 1, t, scale: 0.92, mood: id === 'chdc' ? 'sleepy' : id === 'vasilije' ? 'cheer' : 'smug', seed: x % 9, arms: undefined });
      ctx.restore();
    } });
});
add({ x: 9610, type: 'deadTree', s: 1, z: -0.4 });
const chest = add({
  type: 'chest', x: 9500, y: GY, tries: 0, tx: null, hopT: 0, fx: 0, hopY: 0, shake: 0, cull: 100, hitW: 60, hitH: 90,
  act: { label: 'Škrinja: Domaći zadatak', range: 74, run: (o) => Q.chestAct(o) }, promptY: 130,
  update(dt) {
    const o = chest;
    if (o.tx != null) {
      if (o.fx === 0) o.fx = o.x;
      o.hopT += dt / 0.5; const u = Math.min(1, o.hopT);
      o.x = lerp(o.fx, o.tx, easeOut(u)); o.hopY = Math.sin(u * Math.PI) * 55;
      if (u >= 1) { o.tx = null; o.fx = 0; o.hopY = 0; }
    }
    o.shake = Math.max(0, o.shake - dt);
  },
  draw(ctx, o, t) { ctx.globalAlpha = .3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(0, 2, 44, 8, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; PROPS.chest(ctx, { open: flag('fragChest'), shake: o.shake, hopY: o.hopY }, t); },
});

// ------------------------------------------------------------------ FINALE (9700–10900)
add({ type: 'pillar', x: 9704, z: -0.9, cull: 60 });
const router = add({ type: 'router', x: 9880, near: false, act: { label: () => (count('izgovor') ? 'Ubaci izgovor' : 'Ruter'), range: 80, run: (o) => useRouter(o) }, promptY: 150, hitW: 60, hitH: 110,
  update() { router.near = G.near === router; } });
const EX = [[10090, GY - 85], [10270, GY - 95], [10450, GY - 85]];
EX.forEach(([x, top], i) => {
  ledge(x, top, 120, '#2f5a2a');
  add({ type: 'excuse', x, y: top, z: 0.3, get taken() { return flag('ex' + (i + 1)); }, idx: i + 1,
    update(dt) {
      const o = this;
      if (flag('ex' + o.idx) || ui.busy) return;
      const p = G.player;
      if (Math.abs(p.x - o.x) < 46 && p.y <= o.y + 8 && p.y > o.y - 120) {
        setFlag('ex' + o.idx); give('izgovor');
        const s = worldToScreen(o.x, o.y - 34);
        audio.sfx('pick'); emit('star', o.x, o.y - 30, 10, { color: COL.pink }); p.cheer = 0.6;
        setTimeout(() => flyItem('izgovor', s.x, s.y), 20);
      }
    } });
});
add({ type: 'boss', x: BOSS_X, y: 0, z: 0.2, cull: 1600, draw(ctx, o, t) { ctx.translate(-BOSS_X, 0); drawBoss(ctx, t); } });
// ekipa koja se pojavi posle pobede
const cast = add({
  type: 'cast', x: 10010, cull: 400, t: 0, z: 0.4,
  draw(ctx, o, t) {
    if (!flag('bossDone')) { cast.t = 0; return; }
    cast.t = Math.min(1, cast.t + 1 / 60 / 1.6);
    const k = easeOut(cast.t);
    [['pero', 0], ['vasilije', 70], ['chdc', 140]].forEach(([id, dx], i) => {
      const hop = Math.abs(Math.sin(t * 5 + i * 1.7)) * 12 * (reduced() ? 0 : 1);
      const x = lerp(-420, dx - 70, k);
      ctx.globalAlpha = 0.3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.ellipse(x, 2, 26, 6, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      drawChar(ctx, CHARACTERS[id].look, x, -hop, { face: 1, t, mood: 'cheer', scale: 0.95, seed: i * 2, phase: t * 8, walk: cast.t < 1 ? 1 : 0 });
      if (cast.t >= 1) text(ctx, CHARACTERS[id].username, x, -168 - hop, 12, COL.white, 'center', 4);
    });
  },
});

// ------------------------------------------------------------------ sastavljanje
objects.sort((a, b) => a.z - b.z);

export const world = {
  objects,
  platforms,
  drawList: objects,
  _acc: 0,
  update(dt, t) {
    for (const o of objects) if (o.update && Math.abs(o.x - G.player.x) < 1500) o.update(dt, t);
    updateBoss(dt, t);
    // pozadinski efekti
    this._acc += dt;
    const px = G.player.x;
    if (this._acc > 0.16) {
      this._acc = 0;
      if (!flag('towerFixed') && Math.abs(px - 690) < 700) emit('smoke', 690 + rand(-20, 20), GY - 220, 1);
      if (!flag('cable') && Math.abs(px - 1020) < 600) emit('spark', 960, GY - 24, 1);
      if (flag('neuron') && Math.abs(px - 7000) < 700) emit('spark', 7000 + rand(-100, 100), GY - 110, 1);
      if (Math.abs(px - 3350) < 600) emit('star', 3350 + rand(-30, 30), GY - 190, 1, { color: [COL.pink, COL.green, COL.yellow][(Math.random() * 3) | 0] });
      if (Math.abs(px - 8500) < 800 && Math.random() < 0.5) emit('star', 8100 + rand(0, 1600), GY - rand(20, 90), 1, { color: COL.teal });
    }
    G.lit = lerp(G.lit, flag('bossDone') ? 1 : 0, Math.min(1, dt * 0.8));
  },
  onJump25() { Q.unlockAch('skakac'); },
};

// podešavanje kapija (stil + poruka koja se prikazuje kad blokiraju put)
const GS = [['firewall', TEXT.lobby.gate], ['ministry', TEXT.ministry.gate], ['valve', TEXT.institute.gate], ['hatch', TEXT.bunker.gate], ['cemetery', TEXT.grave.gate]];
G.gates.forEach((g, i) => { g.style = GS[i][0]; g.hint = GS[i][1]; });
// pocetna stanja kapija (bez animacije pri učitavanju)
export function syncGates() { for (const g of G.gates) { g.p = (S.freeRoam || S.flags[g.flag]) ? 1 : 0; g.was = g.p === 1; g.init = true; } }

/** X pozicija trenutnog cilja (strelica nad ciljem). */
export function objectiveTarget() {
  if (!S.started || S.freeRoam) return null;
  G.objY = 260;
  if (!flag('cable')) return 960;
  if (!flag('stamped')) {
    if (!flag('peroMet')) return pero.x;
    if (!flag('paper')) return printer.x;
    return pero.x;
  }
  if (!flag('ping')) return flag('vasMet') ? 4740 : 4330;
  if (!flag('neuron')) return 6930;
  if (!flag('cableAdmin')) return !flag('fragTip') ? 8420 : !flag('fragJudge') ? 9010 : chest.x;
  if (!flag('bossDone')) {
    if (count('izgovor') > 0) return 9880;
    const nx = [1, 2, 3].find((i) => !flag('ex' + i));
    return nx ? EX[nx - 1][0] : 9880;
  }
  return null;
}
