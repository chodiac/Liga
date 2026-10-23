// Pokretanje igre, uvodni ekran, pauza, mapa servera, kraj i rezultati.
import { S, ui, load, reset, saveNow, changed, subscribe, flag, gateOpen, reduced, questProgress, secretsFound, SECRET_TOTAL } from './core/state.js';
import { initInput, input } from './core/input.js';
import { audio } from './core/audio.js';
import { G, tick, initGame, startLoop, setWorld, respawnAt, teleport, fadeThrough, banner } from './game.js';
import { world, syncGates, objectiveTarget } from './world.js';
import { initDialogue, dialogue, say } from './ui/dialogue.js';
import { initHud, showHud, toast, update as hudUpdate } from './ui/hud.js';
import { openModal, modals, confirmBox } from './ui/modal.js';
import { objective, openDiscord, clubWelcome, runBusy } from './quests.js';
import { B, resetBoss } from './boss.js';
import { SITE } from './config/site.js';
import { TEXT } from './config/dialogue.js';
import { ZONES, GATES, WORLD_W } from './config/zones.js';
import { ACHIEVEMENTS } from './config/achievements.js';
import { h, fmtTime, sleep } from './core/util.js';

const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------------ podešavanja
function applySettings() {
  document.body.classList.toggle('reduced', reduced());
  audio.refresh();
}

function setFreeRoam(on) {
  S.freeRoam = on;
  if (!on) {
    const lim = Math.min(...GATES.filter((g) => !flag(g.flag)).map((g) => g.x - 26), WORLD_W - 50);
    if (G.player.x > lim) { teleport(lim - 70); toast('Vraćen si na kraj otključanog dela', 'Priča traži da prvo završiš misije.', '↩', 'msg'); }
  }
  changed(); hudUpdate();
}

function toggleSound() { S.settings.sound = !S.settings.sound; audio.unlock(); applySettings(); changed(); }

// ------------------------------------------------------------------ uvod
function startGame({ free = false, fresh = false } = {}) {
  audio.unlock();
  if (fresh) { reset(true); syncGatesAll(); }
  S.started = true;
  if (free) S.freeRoam = true;
  $('intro').replaceChildren();
  ui.unlock('intro');
  document.body.classList.toggle('busy', ui.busy);
  showHud(true);
  respawnAt(S.x || 140);
  if (fresh || (!S.hints.moved && S.x <= 200)) G.spawnX = G.player.x;
  changed(); hudUpdate();
  applySettings();
}

function syncGatesAll() { syncGates(); resetBoss(); G.lit = flag('bossDone') ? 1 : 0; audio.music(flag('bossDone') ? 'victory' : 'ambient'); }

function showIntro() {
  ui.lock('intro');
  const has = S.started;
  const msg = h('p', { class: 'msg-big' }, TEXT.introMessage);
  const actions = h('div', { class: 'row' });
  if (has) {
    actions.append(
      h('button', { class: 'btn', type: 'button', id: 'i-go', onclick: () => startGame() }, 'Nastavi'),
      h('button', { class: 'btn alt', type: 'button', onclick: () => startGame({ free: true }) }, 'Samo razgledam'),
      h('button', { class: 'btn ghost', type: 'button', onclick: async () => { if (await confirmBox('Nova igra', 'Ovo briše sav tvoj napredak u ovom pregledaču. Sigurno?', 'Da, obriši', 'Ne')) startGame({ fresh: true }); } }, 'Nova igra'));
  } else {
    actions.append(
      h('button', { class: 'btn', type: 'button', id: 'i-go', onclick: () => startGame({ fresh: true }) }, 'Ajde da popravljamo'),
      h('button', { class: 'btn alt', type: 'button', onclick: () => startGame({ free: true, fresh: true }) }, 'Samo razgledam'));
  }
  const win = h('div', { class: 'win' },
    h('div', { class: 'win-title' }, h('span', {}, 'server_lobby.exe — greška'), h('span', { class: 'dots' }, h('i'), h('i'), h('i'))),
    h('div', { class: 'win-body' }, msg, actions, h('p', { class: 'muted', style: 'margin:10px 0 0' }, 'Sve se čuva lokalno u ovom pregledaču. Igra se mišem, tastaturom ili dodirom.')));
  $('intro').replaceChildren(h('div', { class: 'logo' }, h('h1', {}, 'BRAINROT'), h('p', {}, 'Server je pao')), win);
  setTimeout(() => $('i-go') && $('i-go').focus({ preventScroll: true }), 60);
}

// ------------------------------------------------------------------ meni: pauza
function toggleRow(label, getter, setter, sub) {
  const b = h('button', { class: 'toggle', type: 'button', role: 'switch', 'aria-checked': String(!!getter()) }, h('span', {}, label, sub ? h('small', { class: 'muted', style: 'display:block' }, sub) : null), h('span', { class: 'sw' }));
  b.addEventListener('click', () => { setter(!getter()); b.setAttribute('aria-checked', String(!!getter())); });
  return b;
}

function openPause() {
  if (modals.open || !S.started) return;
  const m = openModal({
    title: 'Pauza i podešavanja',
    body: (() => {
      const body = h('div', { class: 'list' });
      const close = () => m.close();
      body.append(
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: close }, 'Nastavi'),
          h('button', { class: 'btn alt', type: 'button', onclick: () => { close(); setTimeout(openMap, 40); } }, 'Mapa servera'),
          h('button', { class: 'btn ghost', type: 'button', onclick: () => { close(); setTimeout(() => showResults(false), 40); } }, 'Rezultati')),
        toggleRow('Zvuk', () => S.settings.sound, (v) => { S.settings.sound = v; audio.unlock(); applySettings(); changed(); }),
        toggleRow('Muzika', () => S.settings.music, (v) => { S.settings.music = v; audio.unlock(); applySettings(); changed(); }),
        toggleRow('Smanji animacije', () => reduced(), (v) => { S.settings.reduced = v; applySettings(); changed(); }, 'Bez tresenja ekrana, manje čestica, jednostavniji prelazi'),
        toggleRow('Pomoć u minigamama', () => S.settings.assist, (v) => { S.settings.assist = v; changed(); }, 'Veća korpa, sporiji projektili, više života'),
        toggleRow('Samo razgledam', () => S.freeRoam, (v) => { setFreeRoam(v); }, 'Kapije su otvorene, misije se ne pamte kao obavezne'),
        h('div', { class: 'row' },
          h('button', { class: 'btn alt', type: 'button', onclick: openDiscord }, 'Otvori Discord kanal'),
          SITE.discordInviteUrl ? h('a', { class: 'btn ghost', href: SITE.discordInviteUrl, target: '_blank', rel: 'noopener noreferrer', style: 'text-decoration:none;display:inline-flex;align-items:center' }, 'Pozivnica') : null,
          h('button', { class: 'btn danger', type: 'button', onclick: async () => { if (await confirmBox('Reset napretka', 'Briše sav napredak, dostignuća i tajne u ovom pregledaču. Sigurno?', 'Da, obriši sve', 'Ne')) { reset(false); location.reload(); } } }, 'Reset napretka')),
        h('p', { class: 'muted' }, 'Kontrole: A/D ili strelice — hod, Space — skok, E — interakcija, Esc — pauza. Točkić miša pomera cilj; tastatura ga odmah prekida.'),
        h('p', { class: 'muted' }, TEXT.endCredits));
      return body;
    })(),
  });
}

// ------------------------------------------------------------------ mapa servera
function zoneUnlocked(z) {
  if (S.freeRoam) return true;
  const gi = ZONES.indexOf(z);
  // zona je otključana ako su sve kapije ispred nje otvorene
  return GATES.filter((g) => g.x < z.x0).every((g) => gateOpen(g));
}

function openMap() {
  if (modals.open || !S.started) return;
  const { done, total } = questProgress();
  const list = h('div', { class: 'list' });
  const m = openModal({ title: 'Mapa servera', body: h('div', {}, h('p', { class: 'muted' }, `Glavne misije: ${done}/${total}. Zaključane zone se otvaraju misijama (ili preko „Samo razgledam“).`), list,
    h('div', { class: 'row', style: 'margin-top:10px' }, h('button', { class: 'btn ghost', type: 'button', onclick: () => m.close() }, 'Zatvori'))) });
  for (const z of ZONES) {
    const ok = zoneUnlocked(z), here = G.zone === z;
    list.append(h('div', { class: 'item' + (ok ? '' : ' locked') },
      h('div', {}, h('b', {}, z.name), h('small', {}, ok ? (here ? 'Ovde si' : z.tag) : 'Zaključano')),
      h('button', { class: 'btn' + (ok ? '' : ' ghost'), type: 'button', disabled: !ok || here, onclick: async () => { m.close(); await sleep(60); await fadeThrough(() => teleport(z.x0 + 140)); } }, ok ? (here ? '•' : 'Idi') : '🔒')));
  }
}

// ------------------------------------------------------------------ kraj / rezultati
function showResults(ending = false) {
  const earned = Object.keys(S.ach).length, all = Object.keys(ACHIEVEMENTS).length;
  const body = h('div', {},
    ending ? h('p', { class: 'big' }, TEXT.endMessage) : h('p', { class: 'big' }, 'Rezultati'),
    h('div', { class: 'stats' },
      h('div', {}, h('b', {}, fmtTime(S.time)), 'vreme'),
      h('div', {}, h('b', {}, `${secretsFound()}/${SECRET_TOTAL}`), 'tajne'),
      h('div', {}, h('b', {}, `${earned}/${all}`), 'dostignuća')),
    h('div', { class: 'ach-list' }, ...Object.entries(ACHIEVEMENTS).map(([id, a]) => h('div', { class: S.ach[id] ? '' : 'off' }, `${S.ach[id] ? '🏆' : '🔒'} ${a.title}`))),
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', id: 'e-discord', onclick: openDiscord }, 'Otvori Discord kanal'),
      h('button', { class: 'btn alt', type: 'button', onclick: async () => { if (await confirmBox('Igraj ponovo', 'Počinješ od nule. Napredak ovog prolaska se briše (ostaju podešavanja).', 'Igraj ponovo', 'Ne')) { m.close(); reset(true); location.reload(); } } }, 'Igraj ponovo'),
      h('button', { class: 'btn warn', type: 'button', onclick: () => { m.close(); exploreAfter(); } }, 'Istraži šta si propustio'),
      SITE.discordInviteUrl ? h('a', { class: 'btn ghost', href: SITE.discordInviteUrl, target: '_blank', rel: 'noopener noreferrer', style: 'text-decoration:none;display:inline-flex;align-items:center' }, 'Pozivnica') : null),
    h('p', { class: 'muted', style: 'margin-top:10px' }, 'Sve brojke su lokalni napredak u igri, ne pravi Discord statistika. ' + TEXT.endCredits));
  const m = openModal({ title: ending ? 'SERVER JE SPAŠEN' : 'Rezultati (lokalno)', body, wide: true });
  if (ending) { S.stats.endCount++; changed(); }
}

function exploreAfter() {
  S.freeRoam = true; changed(); hudUpdate();
  fadeThrough(() => teleport(300));
  toast('Istraživanje otključano', 'Sve kapije su otvorene. Pronađi tajne koje si propustio.', '🧭', 'msg');
}

// ------------------------------------------------------------------ boot
function boot() {
  initInput();
  initDialogue();
  initGame();
  setWorld(world);
  G.objectiveTarget = objectiveTarget;
  G.onZone = (z) => { if (z.id === 'club' && S.started && !flag('clubSeen')) setTimeout(() => runBusy(clubWelcome), 700); };
  initHud(objective, { onMap: openMap, onPause: openPause, onAudio: toggleSound });

  if (/[?&]reset\b/.test(location.search)) { try { localStorage.clear(); } catch { /* ok */ } }
  load();
  syncGatesAll();
  applySettings();
  subscribe(applySettings);
  B.onEnd = () => showResults(true);

  input.on('esc', () => {
    if (!S.started) return;
    if (dialogue.active) { dialogue.skip(); return; }
    if (modals.open) { modals.closeTop(); return; }
    if (ui.play) openPause();
  });
  // prvi gest otključava zvuk
  addEventListener('pointerdown', () => audio.unlock(), { once: true });
  addEventListener('keydown', () => audio.unlock(), { once: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { saveNow(); input.clear(); } });

  respawnAt(S.x || 140);
  G.player.spawn = 0;
  startLoop();
  showIntro();
  window.__brainrot = { tick, G, S, ui, world, teleport, B };
}

boot();
