// Likovi. Korisnička imena su TAČNO ovakva (velika/mala slova i razmaci).
// Uloge i opisi su izmišljene persone iz igre, ne tvrdnje o stvarnim ljudima.
// Avatar zameniš tako što promeniš putanju `avatar` (SVG/PNG/JPG, kvadratni).
// `look` upravlja izgledom u igri (canvas crtež).

export const CHARACTERS = {
  hero: {
    name: 'Ti',
    avatar: 'assets/avatars/hero.svg',
    look: { skin: '#f2c9a0', top: '#b6ff3c', topDark: '#86c71f', bottom: '#2a3270', shoe: '#f4f6ff', hair: '#1b1b2f', hairType: 'spiky', headgear: 'headphones', accessory: 'strap' },
  },
  pero: {
    username: 'pero nikic samo',
    name: 'pero nikic samo',
    role: 'Ministar nepotrebnih poslova i tečnih rezervi',
    blurb: 'Potpuno ozbiljan službenik koji je potpuno lud. Čuva vrlo neimpresivnu kapiju, svaki problem rešava formularom, a svaku proslavu čašom.',
    idle: 'Za zdravlje! Overeno, valjda.',
    avatar: 'assets/avatars/pero.svg',
    look: { skin: '#f0c6a0', top: '#f0c6a0', topDark: '#d9a982', bottom: '#2c3350', shoe: '#10131f', hair: '#2b2420', hairType: 'long', headgear: null, beard: 'goatee', mustache: true, accessory: 'bare', hold: null, holdBack: 'beercan' },
  },
  vasilije: {
    username: 'Vasilije',
    name: 'Vasilije',
    role: 'Doktorand elektrotehnike za ping i izgovore',
    blurb: 'Pametan, na doktorskim studijama elektrotehnike, i zato ga niko ne sme da pita „zašto“. Svaki kvar objašnjava formulom. Ili vremenskom prognozom.',
    idle: 'Nije do interneta. Do atmosferskog pritiska je.',
    avatar: 'assets/avatars/vasilije.svg',
    look: { skin: '#f1c9a8', top: '#7a1f2e', topDark: '#5a1522', bottom: '#2b3350', shoe: '#2b2118', hair: '#3a2a22', hairType: 'quiff', headgear: null, accessory: 'henley', hold: null },
  },
  chdc: {
    username: 'chdc',
    name: 'chdc',
    role: 'Neispavani operater deploy bunkera',
    blurb: 'Zadužen za jedno veliko crveno dugme. Poslednji je dirao podešavanja. Kaže da je „samo jedna mala izmena“.',
    idle: 'Samo jedna mala izmena. Ne može ništa da pukne.',
    avatar: 'assets/avatars/chdc.svg',
    look: { skin: '#e9c0a4', top: '#5a3fa8', topDark: '#3f2b7d', bottom: '#1f2238', shoe: '#10131f', hair: '#201a2e', hairType: 'hood', headgear: 'hood', bags: true, accessory: 'none', hold: 'can' },
  },

  // Sporedni likovi
  bot: { name: 'Bot za povezivanje', avatar: 'assets/avatars/bot.svg' },
  kustos: { name: 'Kustos Bot', avatar: 'assets/avatars/bot.svg' },
  domacin: { name: 'Domaćin Bot', avatar: 'assets/avatars/bot.svg' },
  tipkac: { name: 'Tipkač', avatar: 'assets/avatars/tipkac.svg' },
  sudija: { name: 'Sudija Verodostojnosti', avatar: 'assets/avatars/sudija.svg' },
  trava: { name: 'Prevelika Trava', avatar: 'assets/avatars/trava.svg' },
  narrator: { name: 'Narator (plaćen po satu)', avatar: '' },
  stampac: { name: 'Štampač', avatar: 'assets/avatars/bot.svg' },
};
