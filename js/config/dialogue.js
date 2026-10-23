// Sve replike i šale na jednom mestu. Format: [govornik, tekst]. Govornik je ključ iz characters.js.
// Svi tekstovi su na srpskom (latinica).

export const TEXT = {
  introMessage: 'Server je pao. Niko nije kriv. chdc je poslednji dirao podešavanja.',
  endMessage: 'Server je spašen. Produktivnost nije.',

  hints: {
    move: 'A / D ili ← → — hodaj. Točkić miša ti takođe pomera cilj.',
    moveTouch: 'Koristi strelice dole — hodaj. Prevlači nagore za auto-hodanje.',
    jump: 'Space — skoči',
    jumpTouch: 'Dugme SKOK — skoči',
    act: 'E — interakcija',
    actTouch: 'Dugme AKCIJA — interakcija',
  },

  lobby: {
    sign: [['narrator', 'Znak kaže: „Dobrodošao. Nažalost.“ Neko ga je okačio nakrivo, namerno.']],
    monitor: [
      [['narrator', 'Monitor: „Sve radi kod mene.“'], ['narrator', 'Ispod sitnim slovima: „(kod nekog drugog)“.']],
      [['narrator', 'Monitor i dalje tvrdi da sve radi kod njega. Server dole se ne slaže.']],
    ],
    monitorFixed: [['narrator', 'Monitor: „Sve radi kod mene.“ Prvi put je to skoro istina.']],
    tower: [
      [['narrator', 'Server dimi. Ne dimi mnogo. Dimi kao neko ko je rekao da je dobro.']],
      [['narrator', 'Iz servera izlazi mala tiha uvreda.']],
    ],
    bot: [
      ['bot', 'Povezivanje... pokušaj broj 4.172. Možda je sad.'],
      ['bot', 'Nije bilo. Ali bio je lep pokušaj.'],
    ],
    wall: [['narrator', 'Ovaj zid je ovde zbog budžeta.']],
    fakeDoor: [['narrator', 'Nisi našao tajnu. Samo si otišao pogrešno.']],
    sticker: [['narrator', 'Zlatna nalepnica! Ne vredi ništa, ali sija. TAJNA PRONAĐENA.']],
    cable: [
      ['narrator', 'Ispod nogu se nešto svetluca. Labav kabl. Neko ga je nemarno ispustio.'],
    ],
    cableDone: [
      ['narrator', 'Podigao si kabl. Bukvalno nije bilo teško.'],
      ['narrator', 'Zaštitni zid se otvara uz nezadovoljno škripanje. Quest završen. Život i dalje nije.'],
    ],
    gate: 'Zaštitni zid je zaključan. Podigni labavi kabl.',
  },

  ministry: {
    peroIntro: [
      ['pero', 'Stoj. Ko ide? Zašto ide? Imaš li dozvolu za hodanje?'],
      ['pero', 'Da bi prošao, treba ti potvrda da ti ne treba potvrda.'],
      ['pero', 'Obrazac se nalazi u štampaču. Štampač je... uznemiren. Uhvati ga.'],
    ],
    peroNoPaper: [
      ['pero', 'Bez papira nema potvrde. Bez potvrde nema potvrde. Logično.'],
      ['pero', 'Štampač je negde u dvorani. Verovatno beži.'],
    ],
    peroPaper: [
      ['pero', 'Papir. Konačno. Sada ćemo ga overiti. Tri puta. Tri puta jer ja tako kažem.'],
    ],
    peroDone: [
      ['pero', 'ODOBRENO, VALJDA. Možeš da prođeš. Ne žurim da te pustim, ali ne žurim ni da te zadržim.'],
      ['pero', 'Iza kapije je klupska prostorija. Ne diraj ništa što nema nalepnicu „DIRAJ“.'],
    ],
    peroAfter: [
      ['pero', 'Zahtev je obrađen. Zahtev je arhiviran. Zahtev je zaboravljen.'],
      ['pero', 'Ako ti zatreba još jedna potvrda, potrebna ti je potvrda.'],
    ],
    printerStart: [
      ['stampac', '*BIP* Primećen pokret. Aktiviran protokol BEKSTVA.'],
    ],
    printerCaught: [
      ['narrator', 'Uhvatio si štampač. Izbacio je papir i pao od umora.'],
    ],
    printerAfter: [['stampac', '*tiho zuji* Nemam više papira. Ni volje.']],
    bell: ['Cing.', 'Cing cing.', 'Cing. Dosta je.', 'Pero te gleda. Cing.', 'CING.'],
    bellAch: [['narrator', 'Zvonce više ne može da stoji. Ti si mu dosadio. Ali si uporan.']],
    stampDone: [
      ['narrator', 'Potvrda o posedovanju potvrde. Overeno. Zvanično. Za sada.'],
      ['narrator', 'Kapija se otvara. Nije ni mnogo, ni pre vremena.'],
    ],
    gate: 'Kapija je zatvorena. Treba ti Potvrda o posedovanju potvrde.',
    desk: [['narrator', 'Na stolu gomila papira. Svaki kaže „HITNO“. Nijedan nije.']],
    ticket: [['narrator', 'Na redu: broj 0. Broj 0 nikad ne dolazi na red.']],
  },

  club: {
    welcome: [
      ['domacin', 'Dobrodošao u klupsku prostoriju. Ovde se ne dešava ništa, ali u dobrom društvu.'],
      ['domacin', 'Ovo je mesto gde se ekipa skuplja. Sve ostalo — pravi Discord — je ispod, na dugmetu.'],
      ['domacin', 'Pravila su jednostavna: 1) Nema pravila. 2) Videti 1.'],
    ],
    poster: [['narrator', 'Plakat: „PRAVILA: 1) Nema pravila. 2) Videti 1.“ Neko je dopisao „3) Ne zovi u 3 ujutru.“']],
    couch: [['narrator', 'Kauč je star ali odan. Sedi na njemu isto kao i ti: zauvek.']],
    jukebox: [['narrator', 'Džuboks svira jednu istu pesmu. Možda i dve. Teško je reći.']],
    fridge: [['narrator', 'Unutra je jedan ping. Još je svež. TAJNA PRONAĐENA.']],
    screen: [['narrator', 'Veliki ekran kaže: „Pravi razgovor je tamo gde klikneš.“']],
    gate: 'Ovde nema kapije. Samo nastavi desno.',
  },

  institute: {
    vasIntro: [
      ['vasilije', 'Nije do interneta. Do atmosferskog pritiska je.'],
      ['vasilije', 'Ping mi je 999 i to nije normalno. Ni zdravo. Ni uopšte moguće.'],
      ['vasilije', 'Povezi tri kabla u prave priključke. Vodi se simbolom, ne bojom. Ili obratno. Ne sećam se.'],
    ],
    vasAgain: [
      ['vasilije', 'Idi na panel. Simbol mora da se poklopi. Boja je, uh, samo ukras.'],
    ],
    vasDone: [
      ['vasilije', 'Ping je spao na ljudski nivo. Znao sam da je do pritiska.'],
      ['vasilije', 'Iza vrata je Muzej mimova. Ne diraj ništa što se smeje.'],
    ],
    vasAfter: [
      ['vasilije', 'Ping 24. Smešno je koliko je sad sve brzo. Ne navikavaj se.'],
    ],
    panelTip: [['narrator', 'Panel čeka. Tri kabla, tri priključka. Hrabro.']],
    weather: [['narrator', 'Tabla: „ATMOSFERSKI PRITISAK: ODGOVORAN ZA SVE.“']],
    gate: 'Ventil je zaključan dok ping ne postane ljudski.',
    reactions: [
      'Uključio si frižider u voice chat.',
      'Sada čuješ komšijin mikrofon.',
      'Ping je otišao po hleb.',
      'Mikrofon je sad povezan sa tosterom.',
    ],
  },

  museum: {
    kustos: [
      ['kustos', 'Dobrodošli u Muzej mimova. Molimo ne dodirujte eksponate. Dodirnite ih.'],
      ['kustos', 'Svih šest eksponata je originalno. Nigde nisu skinuti. Nigde nisu ni plaćeni.'],
    ],
    emptyFrame: [['narrator', 'Prazan ram. Valjda je to umetnost. TAJNA PRONAĐENA.']],
    gate: 'Muzej se otvara tek kada ping postane ljudski.',
  },

  bunker: {
    chdcIntro: [
      ['chdc', 'Samo jedna mala izmena. Ne može ništa da pukne.'],
      ['chdc', 'Dobro, možda je puklo. Ali ostao je poslednji moždani neuron. Treba ga sačuvati.'],
      ['chdc', 'Hvataj neurone korpom. Izbegavaj notifikacije. Pet neurona i gotovo.'],
    ],
    chdcRetry: [
      ['chdc', 'Opet? Okej. Ja bih odavno otišao na spavanje. Ali zato i jesam u problemu.'],
    ],
    chdcDone: [
      ['chdc', 'Neuron je spašen! Konzola se pali. Na brzinu sam i nešto drugo uključio.'],
      ['chdc', 'Šteta što ne znam šta. Ali otvoreno je. Idi dalje.'],
    ],
    chdcAfter: [
      ['chdc', 'Ne diraj crveno dugme. Ozbiljno. Osim ako moraš.'],
    ],
    assistOffer: 'Ne ide? Mogu da pomognem malo.',
    redButton: [
      ['narrator', 'KLIK. Konzola trepće. Prikazuje se nešto što liči na „PRODUKCIJA JE PALA“.'],
      ['chdc', 'Mirno. Pala je samo u ovom tabu. Ništa nije izbrisano. Verovatno.'],
    ],
    redButtonAgain: [
      ['narrator', 'Opet si ga pritisnuo. Produkcija se opet pravi važna.'],
    ],
    console: [['narrator', 'Konzola je mrtva. Ili spava. Ili čeka da neko razume šta je radio.']],
    gate: 'Otvor je zatvoren. Konzola mora prvo da dobije struju.',
  },

  grave: {
    sign: [['narrator', 'Tabla: „Ovde počivaju fore koje je neko objasnio.“']],
    stonks: [['narrator', 'Prašnjavi grafikon „stonks“. Strelica pokazuje gore, ali samo zato što je grafikon okrenut naopako.']],
    sadPc: [['narrator', 'Tužan računar niske rezolucije. Na ekranu: „:(“ i u oku mu stoji jedan piksel.']],
    spinner: [
      ['narrator', 'Spinner se vrti od 2014. Ništa se nikad nije učitalo. Ali ni on ne odustaje. TAJNA PRONAĐENA.'],
    ],
    spinnerAgain: [['narrator', 'Spinner: „Još malo.“ (Već deceniju.)']],
    epitaphs: [
      '„Ovde leži Rickroll. Večno te neće napustiti.“',
      '„Harambe 2016 — ali kao fora.“',
      '„Niko ne zna zašto, ali je pokvareno.“',
      '„Fora koja je trajala 4 dana. Dobar život.“',
      '„Stonks. Vrati se.“',
      '„RIP Vremeplov. Beše super.“',
      '„Meme od pre 3 godine. Nikom nije smešan.“',
    ],
    tipIntro: [
      ['tipkac', 'Ne smeš da me gledaš dok kucam... Pišem poruku već tri godine.'],
      ['tipkac', 'Samo ne znam da li da je pošaljem. Šta misliš?'],
    ],
    tipChoices: [
      'Pošalji. Sve će biti u redu.',
      'Dodaj još jednu rečenicu. Nikad nije dosta.',
      'Nemoj. Neke poruke su lepše nedovršene.',
    ],
    tipWrong0: [['tipkac', 'Sigurno? Ne. Sad kucam još duže.']],
    tipWrong1: [['tipkac', 'Dobra ideja! Sad ima 14 rečenica. I nikad neće biti poslata.']],
    tipRight: [
      ['tipkac', '... Možda si u pravu. Neke poruke ostaju u nacrtu. To je njihova lepota.'],
      ['tipkac', 'Evo, uzmi ovo. Pao mi je iz džepa dok sam brisao poruku.'],
    ],
    tipDone: [['tipkac', 'Obrisano. Osećam se lakše. I malo prazno.']],
    judgeIntro: [
      ['sudija', 'Slučaj: neko je bio AFK četiri sata. Optužba: nije javio.'],
      ['sudija', 'Izaberi izgovor koji je NAJMANJE verodostojan. Što je neverovatniji, to bolje.'],
    ],
    judgeWrong: [
      'Previše verodostojno. Svi bi poverovali. Pokušaj nešto gore.',
      'Hmm, to bi moglo da prođe. Sudiji treba nešto bednije.',
      'Skoro, ali ima zrno istine. Sudija ne trpi istinu.',
    ],
    judgeRight: [
      ['sudija', 'Sasvim neverovatno! Nijedan sud na svetu ne bi poverovao. Pobedio si.'],
      ['sudija', 'Evo ti fragment kabla. Zaslužio si ga najgorim izgovorom ikad.'],
    ],
    judgeDone: [['sudija', 'Slučaj zatvoren. Golub je na slobodi.']],
    chestIntro: [['narrator', 'Škrinja sa natpisom „Domaći zadatak“. Svi je izbegavaju. Hoćeš li ti?']],
    chestHop: [
      ['narrator', 'Škrinja beži: „Nije sad. Sutra.“ Odskočila je dalje.'],
      ['narrator', 'Škrinja beži: „Imam jedan sastanak. Sa sobom.“ Opet je odskočila.'],
    ],
    chestOpen: [
      ['narrator', 'Škrinja je konačno otvorena! Unutra: fragment kabla i poruka „Rok je bio juče“.'],
    ],
    chestDone: [['narrator', 'Škrinja je prazna. Domaći je predat. Niko nije zapamtio kad.']],
    cableDone: [
      ['narrator', 'Sva tri fragmenta spojena u Adminov produžni kabl! Kabl odmah počinje da se ponaša kao da je bio tu sve vreme.'],
      ['narrator', 'Kapija na kraju groblja se otvara. Ispred je nešto zeleno. Previše zeleno.'],
    ],
    wallTitle: 'Zid slavnih (fiktivnih)',
    gate: 'Kapija groblja se otvara tek kad sastaviš ceo kabl (3 fragmenta).',
  },

  boss: {
    intro: [
      ['trava', 'Napolju je lepo.'],
      ['trava', 'Vitamin D nije premium feature.'],
      ['trava', 'Ugasi komp na pet minuta.'],
      ['narrator', 'Prevelika Trava je preuzela server. Skupi tri izgovora i ubaci ih u ruter!'],
    ],
    hurt: ['Trava: „Izgovor? Hm. Ima nešto u tome.“', 'Trava: „To je... prilično slab izgovor. Ali radi.“', 'Trava: „Ne! Ne još jedan ranked!“'],
    excuses: ['Čekam download.', 'Sad će ekipa.', 'Još samo jedan ranked.'],
    excuseNoItem: 'Nemaš izgovor. Pokupi jedan sa platforme.',
    defeat: [
      ['trava', 'Dobro. Dobro. Neka ti bude. Ostaću ovde i gledaću u nebo.'],
      ['trava', 'Ali jednom ćeš izaći. Svi izađu. Na kafu.'],
    ],
    router: [['narrator', 'Ruter treperi. Zeleno. Narandžasto. Zeleno. Ne veruj mu.']],
  },

  endCredits: 'Sačuvano lokalno. Kao i tvoji problemi.',
  fourthWall: [
    'Ovaj zid je ovde zbog budžeta.',
    'Nisi našao tajnu. Samo si otišao pogrešno.',
    'Quest završen. Život i dalje nije.',
    'Sačuvano lokalno. Kao i tvoji problemi.',
  ],
};
