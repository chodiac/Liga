// Muzej mimova: izložbeni eksponati. Sve su originalne tekstualne foke.
// Da dodaš prave mimove ekipe: zameni/dodaj objekte ovde.
//   id      - jedinstven ključ
//   title   - naslov ispod rama
//   text    - šala u ramu
//   icon    - ključ iz ICONS (dole) ILI `image: 'assets/memes/slika.png'` za pravu sliku
//   anim    - CSS animacija ikone: bounce | spin | shake | float | blink | wobble
//   pokes   - replike kad kliknes na eksponat (ciklično)
// Muzej prikazuje prvih 6 u ramovima po sobi; više njih = ređaju se dalje.

export const MEMES = [
  { id: 'hleb', title: 'Ping je otišao po hleb', text: 'Latencija: 4000 ms.\nRazlog: pekara radi do 20h.', icon: 'hleb', anim: 'bounce', pokes: ['Hleb se vratio. Ping nije.', 'Ping nije stigao ni do pekare.', 'Hleb je sada u voice channelu.'] },
  { id: 'kodmene', title: 'Sve radi kod mene', text: 'Radi na mom računaru.\nRačunar je, doduše, trenutno u Nišu.', icon: 'racunar', anim: 'blink', pokes: ['Radi. Kod mene.', 'Kod tebe ne radi? Čudno, kod mene radi.', 'Pošalji mi screenshot. Ne, ne tvoj.'] },
  { id: 'ranked', title: 'Još samo jedan ranked', text: 'Napomena: bilo je 14 ranked mečeva.\nKažu da je „samo jedan“.', icon: 'sat', anim: 'spin', pokes: ['Još jedan. Obećavam.', 'Sunce je izašlo. To nije bitno.', 'Ovo je poslednji. (Nije.)'] },
  { id: 'everyone', title: '@everyone u 3 ujutru', text: 'Sadržaj poruke:\n„Ko ima vremena?“', icon: 'zvono', anim: 'shake', pokes: ['Zvoni tačno kad zaspiš.', 'Svi su se probudili. Niko ne zna zašto.', '„Ko ima vremena?“ — Niko. Svi spavaju.'] },
  { id: 'restart', title: 'Update zahteva restart', text: 'Restart je zakazan za sad.\nSad je u stvari nikad.', icon: 'restart', anim: 'spin', pokes: ['Odloži za 10 minuta.', 'Odloži opet. Brate.', 'Restart: 3. pokušaj. Bez uspeha.'] },
  { id: 'jesitu', title: 'Brate jesi tu?', text: 'Poruka stigla 04:12.\nOdgovor stigao 11:40: „da“.', icon: 'poruka', anim: 'wobble', pokes: ['Tu sam. Bio sam tu celo vreme.', '... (kuca)', 'Da. Zašto?'] },
];

// Skriveni prazan ram na kraju muzeja (tajna).
export const EMPTY_FRAME = { title: 'Ovde ide tvoj meme', text: 'Zameni ovaj ram pravim mimom ekipe.\n(Ili ga ostavi praznog. Moderna umetnost.)' };

const S = (inner) => `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">${inner}</svg>`;
const ink = '#0a0d1c';

export const ICONS = {
  hleb: S(`<g stroke="${ink}" stroke-width="5" stroke-linejoin="round"><path d="M18 72 C10 46 36 30 60 30 S110 46 102 72 C100 88 88 92 60 92 S20 88 18 72Z" fill="#e8c53a"/><path d="M40 44l8 18M62 40l7 20M84 46l5 16" fill="none" stroke-linecap="round"/><circle cx="46" cy="72" r="4" fill="${ink}"/><circle cx="74" cy="72" r="4" fill="${ink}"/><path d="M50 82q10 6 20 0" fill="none" stroke-linecap="round"/><path d="M38 92l-6 14M82 92l6 14" fill="none" stroke-linecap="round" stroke-width="7"/></g>`),
  racunar: S(`<g stroke="${ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><rect x="16" y="20" width="88" height="62" rx="8" fill="#161d3f"/><rect x="24" y="28" width="72" height="46" rx="3" fill="#0f1530"/><path d="M42 52l12 12 26-26" fill="none" stroke="#b6ff3c" stroke-width="8"/><path d="M44 82h32l6 18H38z" fill="#8d97b3"/></g>`),
  sat: S(`<g stroke="${ink}" stroke-width="5" stroke-linecap="round"><circle cx="60" cy="62" r="42" fill="#f4f6ff"/><path d="M60 62V34M60 62l20 12" fill="none" stroke-width="7"/><circle cx="60" cy="62" r="5" fill="${ink}"/><path d="M26 22l-10-8M94 22l10-8" stroke="#ff3fa4" stroke-width="8"/></g>`),
  zvono: S(`<g stroke="${ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M60 14c-20 0-30 18-30 38 0 20-12 26-12 32h84c0-6-12-12-12-32 0-20-10-38-30-38z" fill="#e8c53a"/><circle cx="60" cy="96" r="9" fill="#ff4d5e"/><text x="60" y="68" font-size="38" text-anchor="middle" font-family="Arial Black,Arial" fill="${ink}" stroke="none">@</text></g>`),
  restart: S(`<g stroke="${ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><circle cx="60" cy="60" r="44" fill="#5865f2"/><path d="M84 46A28 28 0 1 0 88 66" fill="none" stroke="#f4f6ff" stroke-width="9"/><path d="M90 28v22H68z" fill="#f4f6ff" stroke-width="3"/></g>`),
  poruka: S(`<g stroke="${ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M16 22h88a6 6 0 016 6v46a6 6 0 01-6 6H56l-22 20V80H16a6 6 0 01-6-6V28a6 6 0 016-6z" fill="#7b86ff"/><circle cx="36" cy="52" r="6" fill="#f4f6ff"/><circle cx="60" cy="52" r="6" fill="#f4f6ff"/><circle cx="84" cy="52" r="6" fill="#f4f6ff"/></g>`),
};
