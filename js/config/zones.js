// Raspored sveta (jedna horizontalna linija). Sve koordinate su u "svetskim" pikselima.
// Menjaj redosled/širine pažljivo: kapije (GATES) moraju ostati unutar zone.

export const WORLD_W = 10900;
export const GY = 450; // y "stopala" na tlu (visina sveta je 540)

export const ZONES = [
  { id: 'lobby', name: 'Lobi servera', short: 'Lobi', x0: 0, x1: 1300, theme: 'lobby', tag: 'Server je pao' },
  { id: 'ministry', name: 'Ministarstvo nepotrebnih poslova', short: 'Ministarstvo', x0: 1300, x1: 2950, theme: 'ministry', tag: 'pero nikic samo' },
  { id: 'club', name: 'Klupska prostorija', short: 'Klub', x0: 2950, x1: 3750, theme: 'club', tag: 'Dobrodošlica' },
  { id: 'institute', name: 'Institut za ping i izgovore', short: 'Institut', x0: 3750, x1: 5150, theme: 'institute', tag: 'Vasilije' },
  { id: 'museum', name: 'Muzej mimova', short: 'Muzej', x0: 5150, x1: 6450, theme: 'museum', tag: 'Šest eksponata' },
  { id: 'bunker', name: 'Deploy bunker', short: 'Bunker', x0: 6450, x1: 7800, theme: 'bunker', tag: 'chdc' },
  { id: 'graveyard', name: 'Groblje mrtvih mimova', short: 'Groblje', x0: 7800, x1: 9700, theme: 'graveyard', tag: 'Tri fragmenta' },
  { id: 'arena', name: 'DODIRNI TRAVU', short: 'Finale', x0: 9700, x1: 10900, theme: 'arena', tag: 'Boss' },
];

// Kapija stoji na x; zatvorena blokira kretanje udesno. `flag` je uslov otvaranja.
export const GATES = [
  { id: 'g1', x: 1240, flag: 'cable', name: 'Zaštitni zid' },
  { id: 'g2', x: 2890, flag: 'stamped', name: 'Kapija ministarstva' },
  { id: 'g3', x: 5090, flag: 'ping', name: 'Ventil pritiska' },
  { id: 'g4', x: 7740, flag: 'neuron', name: 'Bunker otvor' },
  { id: 'g5', x: 9640, flag: 'cableAdmin', name: 'Kapija groblja' },
];

// Glavne misije (za indikator napretka).
export const MAIN_QUESTS = ['cable', 'stamped', 'ping', 'neuron', 'cableAdmin', 'bossDone'];

export function zoneAt(x) {
  for (let i = ZONES.length - 1; i >= 0; i--) if (x >= ZONES[i].x0) return ZONES[i];
  return ZONES[0];
}
