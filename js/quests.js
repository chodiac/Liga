// Logika misija: šta se desi kad interaguješ. Tekstovi su u config/dialogue.js.
import { S, flag, setFlag, give, take, count, changed, secretsFound, SECRET_TOTAL, ui } from './core/state.js';
import { G, emit, shake, focusCam, flash, worldToScreen, banner } from './game.js';
import { say, sayAll, choose } from './ui/dialogue.js';
import { toast, achToast, flyItem, flashHint } from './ui/hud.js';
import { audio } from './core/audio.js';
import { sleep, pick, h, isTouchDevice } from './core/util.js';
import { TEXT } from './config/dialogue.js';
import { ACHIEVEMENTS } from './config/achievements.js';
import { MEMES, EMPTY_FRAME } from './config/memes.js';
import { SITE } from './config/site.js';
import { GY } from './config/zones.js';
import { COL } from './gfx/draw.js';
import { stampGame } from './mini/stamp.js';
import { cableGame } from './mini/cables.js';
import { neuronGame } from './mini/neurons.js';
import { afkGame, showExhibit, showCard, showCharacterCard } from './mini/panels.js';

// ---------------------------------------------------------------- pomoćne
export function unlockAch(id) {
  if (S.ach[id]) return false;
  S.ach[id] = Math.round(S.time); changed();
  achToast(id);
  return true;
}

export function findSecret(id) {
  if (S.secrets[id]) return false;
  S.secrets[id] = true; changed();
  toast(`Tajna pronađena! (${secretsFound()}/${SECRET_TOTAL})`, '', '✦', 'msg');
  audio.sfx('ach');
  emit('star', G.player.x, G.player.y - 60, 12);
  if (secretsFound() >= SECRET_TOTAL) unlockAch('tajne');
  return true;
}

const lines = (arr) => sayAll(arr);
const screenOf = (x) => worldToScreen(x, GY - 50);

function giveFly(id, x, n = 1) {
  const s = screenOf(x);
  give(id, n);
  setTimeout(() => flyItem(id, s.x, s.y), 30);
  audio.sfx('pick');
}

export function runBusy(fn) {
  if (G.busy) return;
  G.busy = true;
  Promise.resolve().then(fn).catch(console.error).finally(() => { G.busy = false; });
}

// ---------------------------------------------------------------- cilj (HUD)
export function objective() {
  if (!S.started) return '';
  if (S.freeRoam) return 'Samo razgledaš. Priča čeka kad zatreba (Pauza → Nastavi priču).';
  const f = flag;
  if (!f('cable')) return 'Dođi do labavog kabla i podigni ga (E).';
  if (!f('stamped')) {
    if (!f('peroMet')) return 'Idi desno do Ministarstva i razgovaraj sa: pero nikic samo.';
    if (!f('paper')) return 'Uhvati štampač koji beži i uzmi papir.';
    return 'Odnesi papir peru nikicu na overu.';
  }
  if (!f('ping')) return f('vasMet') ? 'Spusti ping sa 999 na nešto ljudsko (panel).' : 'Nađi Vasilija u Institutu za ping.';
  if (!f('neuron')) return f('chdcMet') ? 'Sačuvaj poslednji moždani neuron.' : 'Idi u Deploy bunker: chdc te čeka.';
  if (!f('cableAdmin')) return `Nađi fragmente admin kabla na groblju (${count('fragment')}/3).`;
  if (!f('bossDone')) return S.boss.used > 0 || count('izgovor') > 0 ? `Ubaci izgovore u ruter (${S.boss.used}/3).` : 'Dodirni travu. Skupi 3 izgovora i ubaci ih u ruter.';
  return 'Server je spašen. Istraži šta si propustio ili otvori Discord.';
}

// ---------------------------------------------------------------- lobi
export async function pickCable(o) {
  await lines(TEXT.lobby.cable);
  give('kabl'); flyItem('kabl', screenOf(o.x).x, screenOf(o.x).y); audio.sfx('pick');
  emit('star', o.x, GY - 30, 14);
  G.player.cheer = 1.2;
  setFlag('cable');
  unlockAch('prvi_korak');
  await sleep(700);
  await lines(TEXT.lobby.cableDone);
  flashHint((isTouchDevice() ? TEXT.hints.jumpTouch : TEXT.hints.jump), 4200);
}

export async function towerAct(o) {
  if (count('kabl') > 0 && !flag('towerFixed')) {
    await say('narrator', 'Uključuješ labavi kabl u server. Nešto zazuji. Kabl nestaje u zidu.');
    take('kabl'); setFlag('towerFixed'); audio.sfx('open'); emit('spark', o.x, GY - 100, 14); shake(3);
    await say('narrator', 'Server više ne dimi. Samo diše kroz nos. To je napredak.');
    return;
  }
  await lines(pick(TEXT.lobby.tower));
}
export const monitorAct = () => lines(flag('cable') ? TEXT.lobby.monitorFixed : pick(TEXT.lobby.monitor));
export const botAct = () => lines(TEXT.lobby.bot);
export const signAct = () => lines(TEXT.lobby.sign);
export const wallAct = () => lines(TEXT.lobby.wall);
export const fakeDoorAct = () => lines(TEXT.lobby.fakeDoor);
export async function stickerAct() {
  if (findSecret('nalepnica')) { await lines(TEXT.lobby.sticker); }
}

// ---------------------------------------------------------------- ministarstvo
export async function talkPero() {
  if (flag('stamped')) return lines(TEXT.ministry.peroAfter);
  if (!flag('peroMet')) { await lines(TEXT.ministry.peroIntro); setFlag('peroMet'); return; }
  if (!flag('paper')) return lines(TEXT.ministry.peroNoPaper);
  await lines(TEXT.ministry.peroPaper);
  const ok = await stampGame();
  if (!ok) { await say('pero', 'Odustaješ usred birokratije? Hrabro. Ili glupo. Vrati se.'); return; }
  take('papir'); give('potvrda');
  setTimeout(() => flyItem('potvrda', innerWidth / 2, innerHeight / 2), 50);
  setFlag('stamped');
  unlockAch('birokrata');
  emit('confetti', G.player.x, GY - 90, 24);
  await lines(TEXT.ministry.stampDone);
  await lines(TEXT.ministry.peroDone);
}

export async function printerAct(o) {
  if (flag('paper') || o.state === 'done') return lines(TEXT.ministry.printerAfter);
  if (o.state === 'idle') { o.state = 'flee'; o.hops = 0; o.grace = 1.2; await lines(TEXT.ministry.printerStart); return; }
  if (o.grace > 0) return;
  // uhvaćen!
  o.state = 'done'; setFlag('paper'); setFlag('peroMet');
  emit('paper', o.x, GY - 70, 16);
  giveFly('papir', o.x);
  audio.sfx('ok');
  await lines(TEXT.ministry.printerCaught);
}

export function bellAct(o) {
  S.stats.bell++; changed();
  o.rung = 0.5; audio.sfx('bell'); emit('star', o.x, o.y - 30, 3);
  flashHint(TEXT.ministry.bell[(S.stats.bell - 1) % TEXT.ministry.bell.length], 900);
  if (S.stats.bell === 15) { unlockAch('dosadan'); findSecret('zvonce'); runBusy(() => lines(TEXT.ministry.bellAch)); }
}

export const deskAct = () => lines(TEXT.ministry.desk);
export const ticketAct = () => lines(TEXT.ministry.ticket);

// ---------------------------------------------------------------- klub
export async function clubWelcome() {
  if (flag('clubSeen')) return;
  setFlag('clubSeen');
  await lines(TEXT.club.welcome);
}
export const posterAct = () => lines(TEXT.club.poster);
export const couchAct = () => lines(TEXT.club.couch);
export const jukeAct = () => lines(TEXT.club.jukebox);
export async function fridgeAct() {
  if (findSecret('friz')) { audio.sfx('open'); await lines(TEXT.club.fridge); } else await say('narrator', 'Frižider: ping je još tu. Ne dira se.');
}
export async function screenAct() {
  await lines(TEXT.club.screen);
  openDiscord();
}
export function openDiscord() {
  window.open(SITE.discordChannelUrl, '_blank', 'noopener,noreferrer');
}

// ---------------------------------------------------------------- institut
async function runPing() {
  const ok = await cableGame();
  if (!ok) return;
  S.ping = 24;
  setFlag('ping');
  unlockAch('ping');
  emit('confetti', G.player.x, GY - 90, 24);
  G.player.cheer = 1.5;
  await sleep(300);
  await lines(TEXT.institute.vasDone);
}
export async function talkVasilije() {
  if (flag('ping')) return lines(TEXT.institute.vasAfter);
  if (!flag('vasMet')) { await lines(TEXT.institute.vasIntro); setFlag('vasMet'); } else await lines(TEXT.institute.vasAgain);
  await runPing();
}
export async function panelAct() {
  if (flag('ping')) { await say('narrator', 'Panel mirno svetli zeleno. Ping 24. Ne diraj ga.'); return; }
  setFlag('vasMet');
  await runPing();
}
export const weatherAct = () => lines(TEXT.institute.weather);

// ---------------------------------------------------------------- muzej
export async function kustosAct() { await lines(TEXT.museum.kustos); }
export async function exhibitAct(meme) {
  await showExhibit(meme, () => {
    if (!S.stats.exhibits[meme.id]) { S.stats.exhibits[meme.id] = true; changed(); }
    if (MEMES.slice(0, 6).every((m) => S.stats.exhibits[m.id])) unlockAch('kustos');
  });
}
export async function emptyFrameAct() {
  findSecret('praznoram');
  await showCard(EMPTY_FRAME.title, EMPTY_FRAME.text);
}

// ---------------------------------------------------------------- bunker
export async function talkChdc(o) {
  if (flag('neuron')) return lines(TEXT.bunker.chdcAfter);
  if (!flag('chdcMet')) { await lines(TEXT.bunker.chdcIntro); setFlag('chdcMet'); } else await lines(TEXT.bunker.chdcRetry);
  const ok = await neuronGame();
  if (!ok) { await say('chdc', 'Nema veze. Neuron sačeka. On ionako nema gde da ide.'); return; }
  give('neuron');
  setTimeout(() => flyItem('neuron', innerWidth / 2, innerHeight / 2), 50);
  setFlag('neuron'); unlockAch('neuron');
  emit('spark', 7000, GY - 120, 24); audio.sfx('open'); shake(4);
  await sleep(500);
  await lines(TEXT.bunker.chdcDone);
}

let redClicks = 0;
export async function redButton(o) {
  redClicks++;
  o.press = true; setTimeout(() => { o.press = false; }, 400);
  audio.sfx('glitch');
  unlockAch('crveno'); findSecret('crveno');
  // lokalna "kvar": lažni prozor + kratak glič, bez gubitka napretka
  const win = h('div', { class: 'win errwin' }, h('div', { class: 'win-title' }, h('span', {}, 'produkcija.exe'), h('span', { class: 'dots' }, h('i'), h('i'), h('i'))),
    h('div', { class: 'win-body', style: 'padding:10px;font-family:Consolas,monospace;font-size:13px' }, 'FATALNA GREŠKA: produkcija je pala.', h('br'), '(samo u ovom tabu — ništa nije obrisano)'));
  document.getElementById('stagewrap').append(win);
  if (!document.body.classList.contains('reduced')) { flash('glitch', 380); shake(5); }
  setTimeout(() => win.remove(), 2400);
  await lines(redClicks > 1 ? TEXT.bunker.redButtonAgain : TEXT.bunker.redButton);
}
export const consoleAct = () => lines(TEXT.bunker.console);

// ---------------------------------------------------------------- groblje
async function grantFragment(fl, x) {
  setFlag(fl);
  giveFly('fragment', x);
  emit('star', x, GY - 60, 12);
  if (count('fragment') >= 3 || (flag('fragTip') && flag('fragJudge') && flag('fragChest'))) {
    await sleep(700);
    take('fragment', count('fragment')); give('kablAdmin');
    setFlag('cableAdmin');
    unlockAch('mrtvi');
    emit('confetti', G.player.x, GY - 90, 26); audio.sfx('win');
    await lines(TEXT.grave.cableDone);
  }
}

export async function tombAct(o) {
  o.read = true;
  await say('narrator', TEXT.grave.epitaphs[o.i % TEXT.grave.epitaphs.length]);
}
export const graveSignAct = () => lines(TEXT.grave.sign);
export const stonksAct = () => lines(TEXT.grave.stonks);
export const sadPcAct = () => lines(TEXT.grave.sadPc);
export async function spinnerAct() {
  if (findSecret('spiner')) await lines(TEXT.grave.spinner); else await lines(TEXT.grave.spinnerAgain);
}

export async function tipAct(o) {
  if (flag('fragTip')) return lines(TEXT.grave.tipDone);
  await lines(TEXT.grave.tipIntro);
  const c = await choose('tipkac', 'Šta mu kažeš?', TEXT.grave.tipChoices);
  if (c < 0) return;
  if (c === 2) {
    await lines(TEXT.grave.tipRight);
    emit('paper', o.x, GY - 130, 14);
    await grantFragment('fragTip', o.x);
  } else await lines(TEXT.grave['tipWrong' + c]);
}

export async function judgeAct(o) {
  if (flag('fragJudge')) return lines(TEXT.grave.judgeDone);
  await lines(TEXT.grave.judgeIntro);
  const ok = await afkGame();
  if (!ok) return;
  await lines(TEXT.grave.judgeRight);
  await grantFragment('fragJudge', o.x);
}

export async function chestAct(o) {
  if (flag('fragChest')) return lines(TEXT.grave.chestDone);
  if (o.tries === 0) await lines(TEXT.grave.chestIntro);
  if (o.tries < 2) {
    const msg = TEXT.grave.chestHop[o.tries];
    o.tries++; o.tx = o.x + 46; o.hopT = 0; o.shake = 0.6;
    audio.sfx('bad');
    await say('narrator', msg);
    return;
  }
  o.open = true; o.shake = 0;
  audio.sfx('open'); emit('paper', o.x, GY - 70, 26); shake(4);
  await lines(TEXT.grave.chestOpen);
  await grantFragment('fragChest', o.x);
}

export async function characterAct(id) { await showCharacterCard(id); }
