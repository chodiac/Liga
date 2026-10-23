# BRAINROT: Server je pao

2D meme avantura u pregledaču — sajt JE igra. Ceo tekst je na srpskom (latinica). Nema servera, naloga ni Discord API-ja; napredak se čuva lokalno (`localStorage`).

## Pokretanje

```bash
python tools/serve.py 5220
```

Otvori http://localhost:5220. (Može bilo koji statički server; ES moduli traže `http://`, ne `file://`.)
`?reset` na kraju adrese briše sačuvani napredak.

> Napomena o stack-u: na ovoj mašini nema Node-a, pa je igra napisana kao čist JavaScript (ES moduli) + Canvas 2D bez build koraka i bez biblioteka. Radi u svakom modernom pregledaču, ne traži WebGL.

## Kontrole

| Radnja | Desktop | Mobilni |
|---|---|---|
| Hod | A/D ili ← → | velika dugmad ◀ ▶ |
| Skok | Space | dugme SKOK |
| Interakcija | E | dugme E (svetli kad ima šta) |
| Pauza / zatvori | Esc | dugme II |
| Auto-hod | točkić miša (ili klik na svet) | prevlačenje nagore |

Tastatura odmah prekida auto-hod; cilj kamere/šetnje uvek ostaje blizu igrača. Dok je dijalog ili minigra otvorena, skrol se ne vezuje za kameru.

## Gde menjaš sadržaj

| Šta | Fajl |
|---|---|
| **Discord kanal i pozivnica** | `js/config/site.js` (`discordChannelUrl`, `discordInviteUrl` — pozivnica je prazna; ako je popuniš, pojavi se dugme „Pozivnica“) |
| **Korisnička imena, uloge, opisi, izgled lika** | `js/config/characters.js` |
| **Avatari** | `assets/avatars/*.svg` (zameni fajl istog imena ili promeni putanju `avatar` u `characters.js`) |
| **Sve replike i šale** | `js/config/dialogue.js` |
| **Mimovi u muzeju** | `js/config/memes.js` (ikona, animacija, tekst, replike; može i `image:` sa pravom slikom) |
| **Predmeti i dostignuća** | `js/config/items.js`, `js/config/achievements.js` |
| **Raspored zona i kapija** | `js/config/zones.js` |
| **Logika misija** | `js/quests.js`; minigame u `js/mini/`; boss u `js/boss.js` |

Imena „pero nikic samo“, „Vasilije“ i „chdc“ su tačno kako su navedena. Uloge su izmišljene persone iz igre, ne tvrdnje o stvarnim ljudima; nikakve poruke, avatari ni statistika sa servera nisu izmišljani ili preuzimani.

## Šta je u igri

Lobi → Ministarstvo (štampač koji beži + overa tri puta) → Klupska prostorija (dobrodošlica, dugme za Discord) → Institut (kablovi i ping) → Muzej mimova (6 eksponata) → Deploy bunker (neuroni, crveno dugme) → Groblje (3 fragmenta, zid likova) → DODIRNI TRAVU (boss) i finale s rezultatima.

- **Mapa servera** (dugme MAPA): brzo putovanje u otključane zone.
- **Samo razgledam** (uvodni ekran ili Pauza): sve kapije otvorene, misije nisu obavezne; napredak misija je odvojen od pristupa.
- 6 tajni, 11 dostignuća, reduced-motion (sistemsko ili u Pauzi), pomoć u minigamama („Ajde pomozi malo“), reset sa potvrdom.

## Test pomoćnik

`tools/t.js` je mali skup funkcija za ručno testiranje iz konzole (`await import('/tools/t.js')`, pa `T.start()`, `T.walk(x)`, ...). Nije deo igre.
