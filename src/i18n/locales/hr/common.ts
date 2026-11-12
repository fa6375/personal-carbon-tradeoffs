/** Hrvatski: ljuska aplikacije, zajednička stanja, pogreške, prijava, račun, karta i jednostavne stranice. */
import type { common as en } from '../en/common'
import type { MessageShape } from '../../types'

export const common: MessageShape<typeof en> = {
  app: {
    name: 'Carbon Choices',
    titleSuffix: 'Carbon Choices',
    skipToMain: 'Preskoči na glavni sadržaj',
    logoLabel: 'Carbon Choices, idi na početnu stranicu',
    previewNote: 'Rana verzija. Sve brojke su okvirne procjene.',
    footer: '© {year} Carbon Choices · Studentski projekt za kolegij ISTE.260 Designing the User Experience',
    footerNote: 'Brojke su okvirne procjene, a ne izmjereni podaci.',
    openMenu: 'Otvori navigacijski izbornik',
    closeMenu: 'Zatvori navigacijski izbornik',
    mainNav: 'Glavna navigacija',
  },
  nav: {
    home: 'Početna',
    compare: 'Usporedba putovanja',
    saved: 'Spremljene usporedbe',
    goals: 'Ciljevi smanjenja',
    tracking: 'Praćenje emisija',
    account: 'Račun',
    settings: 'Postavke',
    notFound: 'Stranica nije pronađena',
  },
  language: {
    label: 'Jezik',
    changed: 'Jezik je promijenjen u hrvatski.',
    names: {
      en: 'English',
      hr: 'Hrvatski',
      de: 'Deutsch',
    },
  },
  actions: {
    cancel: 'Odustani',
    tryAgain: 'Pokušaj ponovno',
    delete: 'Izbriši',
    deleting: 'Brisanje…',
    save: 'Spremi',
    saving: 'Spremanje…',
    back: 'Natrag',
    next: 'Dalje',
    edit: 'Uredi',
    close: 'Zatvori',
    backToHome: 'Natrag na početnu',
    optional: '(neobavezno)',
    required: '(obavezno)',
  },
  states: {
    loading: 'Učitavanje…',
    errorTitle: 'Nešto nije u redu',
    savingNotice: 'Spremanje… Pričekajte prije nego što napustite ovu stranicu.',
  },
  offline: {
    banner: 'Niste povezani s internetom. Vaši podaci ne mogu se učitati ni spremiti dok se veza ne vrati.',
    backOnline: 'Ponovno ste povezani s internetom.',
    saveBlocked:
      'Niste povezani s internetom pa ovo još nije moguće spremiti. Vaš unos je sačuvan. Pokušajte ponovno kad se veza vrati.',
    retryWhenOnline: 'Pokušajte ponovno kad se veza vrati.',
  },
  errors: {
    data: {
      'not-configured':
        'Baza podataka nije konfigurirana za ovu kopiju aplikacije. Dodajte Firebase postavke u .env.local (vidi README).',
      'not-signed-in': 'Prijavite se kako biste vidjeli i spremili svoje podatke.',
      'permission-denied': 'Nemate dopuštenje za pristup ovim podacima. Pokušajte se ponovno prijaviti.',
      unavailable: 'Baza podataka nije dostupna. Provjerite internetsku vezu i pokušajte ponovno.',
      timeout: 'Baza podataka predugo ne odgovara. Provjerite vezu i pokušajte ponovno.',
      'not-found': 'Stavka nije pronađena. Možda je izbrisana.',
      'invalid-data': 'Podaci su odbijeni jer nisu valjani.',
      'quota-exceeded': 'Baza podataka je privremeno premašila ograničenje korištenja. Pokušajte kasnije.',
      'local-storage-unavailable': 'Ovaj preglednik ne dopušta aplikaciji čitanje lokalnih podataka.',
      'local-data-damaged': 'Podaci ranije spremljeni u ovom pregledniku ne mogu se pročitati. Možda su oštećeni.',
      unknown: 'Došlo je do pogreške u komunikaciji s bazom podataka. Pokušajte ponovno.',
    },
    notConfiguredTitle: 'Baza podataka nije konfigurirana',
  },
  auth: {
    errors: {
      'invalid-email': 'Unesite valjanu adresu e-pošte, na primjer ime@primjer.hr.',
      'missing-password': 'Unesite lozinku.',
      'weak-password': 'Lozinka mora imati najmanje {min} znakova.',
      'email-in-use': 'Račun s ovom adresom e-pošte već postoji. Prijavite se.',
      'wrong-credentials': 'Adresa e-pošte ili lozinka nije točna.',
      'too-many-requests': 'Previše pokušaja. Pričekajte nekoliko minuta i pokušajte ponovno.',
      network: 'Usluga prijave nije dostupna. Provjerite internetsku vezu.',
      'not-enabled': 'Prijava e-poštom i lozinkom nije uključena za ovaj Firebase projekt.',
      'not-configured': 'Prijava nije dostupna jer Firebase nije konfiguriran (vidi README).',
      unknown: 'Prijava nije uspjela. Pokušajte ponovno.',
    },
    signInTitle: 'Prijava',
    registerTitle: 'Izrada računa',
    signInIntro: 'Prijavite se kako biste vidjeli svoje aktivnosti, ciljeve i spremljene usporedbe.',
    registerIntro:
      'Račun čuva vaše aktivnosti, ciljeve i spremljene usporedbe na sigurnom i dostupnima na svakom uređaju.',
    email: 'E-pošta',
    password: 'Lozinka',
    passwordHint: 'Najmanje {min} znakova.',
    signIn: 'Prijavi se',
    signingIn: 'Prijava…',
    createAccount: 'Izradi račun',
    creatingAccount: 'Izrada računa…',
    haveAccount: 'Već imate račun?',
    newHere: 'Prvi put koristite Carbon Choices?',
    switchToRegister: 'Izradite račun',
    switchToSignIn: 'Prijavite se',
    checking: 'Provjera prijave…',
    gate: {
      savedTitle: 'Spremljene usporedbe',
      savedReason: 'Prijavite se kako biste vidjeli usporedbe koje ste spremili.',
      goalsTitle: 'Ciljevi smanjenja emisija',
      goalsReason: 'Prijavite se kako biste izradili plan smanjenja emisija i čuvali ga u svom računu.',
      trackingTitle: 'Osobno praćenje emisija',
      trackingReason: 'Prijavite se kako biste bilježili aktivnosti i vidjeli svoje emisije.',
    },
  },
  account: {
    eyebrow: 'Račun',
    title: 'Vaš račun',
    description:
      'Vaše aktivnosti, plan smanjenja emisija i spremljene usporedbe čuvaju se u vašem računu, pa ostaju sačuvani nakon ponovnog učitavanja i dostupni na svakom uređaju.',
    signedInTitle: 'Prijavljeni ste',
    signedInAs: 'Prijavljeni ste kao {email}.',
    signOut: 'Odjavi se',
    signingOut: 'Odjava…',
  },
  import: {
    title: 'Podaci spremljeni u ovom pregledniku',
    nothing: 'U ovom pregledniku nema aktivnosti ni usporedbi koje su spremljene samo lokalno.',
    intro:
      'Prije uvođenja računa Carbon Choices spremao je podatke samo u preglednik. U ovom pregledniku postoji {activities} i {comparisons}. Uvezite ih kako biste ih čuvali u svom računu. Stavke koje su već u računu preskaču se, a ništa se ne briše iz preglednika.',
    activities: { one: '{count} aktivnost', few: '{count} aktivnosti', other: '{count} aktivnosti' },
    savedComparisons: {
      one: '{count} spremljena usporedba',
      few: '{count} spremljene usporedbe',
      other: '{count} spremljenih usporedbi',
    },
    comparisons: { one: '{count} usporedba', few: '{count} usporedbe', other: '{count} usporedbi' },
    imported: 'Uvezeno: {activities} i {comparisons}.',
    skipped: {
      one: '{count} stavka koja je već u računu je preskočena.',
      few: '{count} stavke koje su već u računu su preskočene.',
      other: '{count} stavki koje su već u računu je preskočeno.',
    },
    failed: '{error} Ništa nije uklonjeno iz preglednika pa možete pokušati ponovno.',
    import: 'Uvezi u moj račun',
    importAgain: 'Uvezi ponovno',
    importing: 'Uvoz…',
    notNow: 'Ne sada',
  },
  routing: {
    title: 'Pronađi udaljenost na karti',
    from: 'Od',
    to: 'Do',
    lookUp: 'Pronađi udaljenost',
    lookingUp: 'Traženje…',
    loading: 'Tražimo mjesta i rute. To traje nekoliko sekundi.',
    enterBoth: 'Najprije unesite polazište i odredište.',
    result: 'Od {from} do {to}. Provjerite jesu li to mjesta koja ste mislili.',
    profiles: {
      driving: 'Automobilom',
      cycling: 'Biciklom',
      walking: 'Pješice',
    },
    distance: '{km} km (oko {duration})',
    noRoute: 'ruta nije pronađena',
    use: 'Koristi {km} km',
    used: 'Korišteno ✓',
    timesNote: 'Trajanja ruta su procjene kartografske usluge i ne koriste se u rezultatima.',
    credit:
      'Mjesta i rute © {osm}, pronađeno pomoću usluga {nominatim} i {osrm}. Besplatne javne usluge bez zajamčene dostupnosti.',
    osm: 'suradnici OpenStreetMapa',
    newTab: '(otvara se u novoj kartici)',
    places: {
      from: 'polazište',
      to: 'odredište',
    },
    errors: {
      'invalid-input': 'Unesite {place} za pretraživanje (do 200 znakova).',
      'same-place': 'Polazište i odredište su isto mjesto. Unesite dva različita mjesta.',
      'not-found':
        'Mjesto „{place}” nije pronađeno na karti. Pokušajte dodati grad ili državu, na primjer „Ilica 10, Zagreb”.',
      'no-route': 'Između ovih mjesta nije pronađena cestovna, biciklistička ni pješačka ruta. Unesite udaljenost sami.',
      timeout: 'Kartografska usluga predugo ne odgovara. Pokušajte ponovno ili unesite udaljenost sami.',
      network: 'Kartografska usluga nije dostupna. Provjerite internetsku vezu ili unesite udaljenost sami.',
      'rate-limited':
        'Besplatna kartografska usluga je preopterećena (previše zahtjeva). Pričekajte minutu i pokušajte ponovno ili unesite udaljenost sami.',
      'server-error': 'Kartografska usluga trenutno ima problema. Pokušajte kasnije ili unesite udaljenost sami.',
      unauthorized: 'Kartografska usluga je odbila zahtjev. Postavke usluge možda nisu ispravne (vidi README).',
      'bad-request': 'Kartografska usluga ne može obraditi ovaj zahtjev. Provjerite mjesta ili unesite udaljenost sami.',
      malformed: 'Kartografska usluga poslala je odgovor koji aplikacija ne razumije. Unesite udaljenost sami.',
    },
  },
  home: {
    eyebrow: 'Svakodnevni izbori, jasnije',
    title: 'Dobro došli u Carbon Choices',
    lead: 'Carbon Choices vam pomaže usporediti svakodnevne načine kretanja prema tri bitne stvari: koliko CO₂ putovanje proizvodi, koliko košta i koliko traje. Jasno sagledajte kompromise, a zatim odlučite što vam odgovara.',
    cta: 'Usporedi putovanje',
    statusLabel: 'Status projekta',
    status: 'Rana verzija',
    statusText:
      'Usporedite putovanja, postavite ciljeve smanjenja emisija i pratite svoje aktivnosti. Brojke su okvirne procjene; prijavite se kako biste podatke čuvali u svom računu.',
    factorsTitle: 'Tri načina gledanja na svako putovanje',
    factorsDescription:
      'Svako putovanje je ravnoteža. Carbon Choices prikazuje ova tri čimbenika jedan uz drugi kako nijedan broj sam ne bi pričao cijelu priču.',
    factors: {
      co2: {
        title: 'Emisije CO₂',
        description:
          'Ugljikov dioksid koji nastaje tijekom putovanja. Hodanje i vožnja biciklom gotovo ga ne proizvode, a motorizirani načini razlikuju se prema vozilu, gorivu i broju putnika.',
      },
      cost: {
        title: 'Trošak',
        description:
          'Koliko vas putovanje košta. To može biti karta, gorivo i parkiranje ili udio troškova vozila, kako bi se mogućnosti usporedile pod jednakim uvjetima.',
      },
      time: {
        title: 'Vrijeme putovanja',
        description:
          'Koliko putovanje traje od vrata do vrata, uključujući hodanje do stanice, čekanje i presjedanja, a ne samo vrijeme vožnje.',
      },
    },
    howTitle: 'Kako funkcionira',
    howDescription: 'Kako funkcionira usporedba putovanja.',
    steps: {
      describe: {
        title: 'Opišite putovanje',
        description: 'Recite Carbon Choicesu odakle krećete i kamo želite stići.',
      },
      compare: {
        title: 'Pogledajte mogućnosti jednu uz drugu',
        description: 'Svaki način putovanja prikazan je s emisijama CO₂, troškom i trajanjem na jednom mjestu.',
      },
      choose: {
        title: 'Odaberite što vam odgovara',
        description: 'Odvagnite kompromise koji su vam danas važni i spremite usporedbe kojima se želite vratiti.',
      },
    },
    note: 'Rezultati u Carbon Choicesu su procjene temeljene na okvirnim prosječnim vrijednostima. Svaka usporedba prikazuje kako su brojke izračunate.',
  },
  pages: {
    notFound: {
      title: 'Stranica nije pronađena',
      description: 'Stranica koju tražite ne postoji.',
      emptyTitle: 'Ovdje nema ničega',
      body: 'Provjerite adresu ili se poslužite navigacijom.',
    },
    settings: {
      title: 'Postavke',
      description: 'Prilagodite Carbon Choices sebi.',
      languageTitle: 'Jezik',
      languageDescription:
        'Odaberite jezik cijele aplikacije. Vaš izbor sprema se u ovom pregledniku i koristi se sljedeći put kad otvorite Carbon Choices.',
      moreTitle: 'Ostale postavke',
      moreBody: 'Ostale postavke bit će dodane kako se budu razvijale nove značajke.',
    },
    saved: {
      eyebrow: 'Usporedba svakodnevnih izbora',
      title: 'Spremljene usporedbe',
      description: 'Vratite se putovanjima koja ste ranije usporedili. Usporedbe se spremaju u vaš račun.',
    },
  },
  dialog: {
    deleting: 'Brisanje…',
  },
}
