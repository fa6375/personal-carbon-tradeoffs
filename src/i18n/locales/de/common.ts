/** Deutsch: App-Rahmen, gemeinsame Zustände, Fehler, Anmeldung, Konto, Karte und einfache Seiten. */
import type { common as en } from '../en/common'
import type { MessageShape } from '../../types'

export const common: MessageShape<typeof en> = {
  app: {
    name: 'Carbon Choices',
    titleSuffix: 'Carbon Choices',
    skipToMain: 'Zum Hauptinhalt springen',
    logoLabel: 'Carbon Choices, zur Startseite',
    previewNote: 'Frühe Vorschau. Alle Zahlen sind beispielhafte Schätzungen.',
    footer: '© {year} Carbon Choices · Kursprojekt für ISTE.260 Designing the User Experience',
    footerNote: 'Die Zahlen sind beispielhafte Schätzungen, keine gemessenen Daten.',
    openMenu: 'Navigationsmenü öffnen',
    closeMenu: 'Navigationsmenü schließen',
    mainNav: 'Hauptnavigation',
  },
  nav: {
    home: 'Startseite',
    compare: 'Wege vergleichen',
    saved: 'Gespeicherte Vergleiche',
    goals: 'CO₂-Ziele',
    tracking: 'CO₂-Tracking',
    account: 'Konto',
    settings: 'Einstellungen',
    notFound: 'Seite nicht gefunden',
  },
  language: {
    label: 'Sprache',
    changed: 'Die Sprache wurde auf Deutsch umgestellt.',
    names: {
      en: 'English',
      hr: 'Hrvatski',
      de: 'Deutsch',
    },
  },
  actions: {
    cancel: 'Abbrechen',
    tryAgain: 'Erneut versuchen',
    delete: 'Löschen',
    deleting: 'Wird gelöscht…',
    save: 'Speichern',
    saving: 'Wird gespeichert…',
    back: 'Zurück',
    next: 'Weiter',
    edit: 'Bearbeiten',
    close: 'Schließen',
    backToHome: 'Zurück zur Startseite',
    optional: '(optional)',
    required: '(Pflichtfeld)',
  },
  states: {
    loading: 'Wird geladen…',
    errorTitle: 'Etwas ist schiefgelaufen',
    savingNotice: 'Wird gespeichert… Bitte warten Sie, bevor Sie diese Seite verlassen.',
  },
  offline: {
    banner: 'Sie sind offline. Ihre Daten können erst wieder geladen oder gespeichert werden, wenn die Verbindung zurück ist.',
    backOnline: 'Sie sind wieder online.',
    saveBlocked:
      'Sie sind offline, deshalb kann dies noch nicht gespeichert werden. Ihre Eingaben bleiben erhalten. Versuchen Sie es erneut, wenn Sie wieder online sind.',
    retryWhenOnline: 'Versuchen Sie es erneut, wenn Sie wieder online sind.',
  },
  errors: {
    data: {
      'not-configured':
        'Die Datenbank ist für diese Kopie der App nicht eingerichtet. Tragen Sie die Firebase-Einstellungen in .env.local ein (siehe README).',
      'not-signed-in': 'Melden Sie sich an, um Ihre Daten zu sehen und zu speichern.',
      'permission-denied': 'Sie haben keine Berechtigung für diese Daten. Melden Sie sich erneut an.',
      unavailable: 'Die Datenbank ist nicht erreichbar. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
      timeout: 'Die Datenbank hat zu lange nicht geantwortet. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      'not-found': 'Dieser Eintrag wurde nicht gefunden. Möglicherweise wurde er gelöscht.',
      'invalid-data': 'Die Daten wurden abgelehnt, weil sie ungültig sind.',
      'quota-exceeded': 'Die Datenbank hat vorübergehend ihr Nutzungslimit erreicht. Versuchen Sie es später erneut.',
      'local-storage-unavailable': 'Dieser Browser erlaubt der App nicht, ihre lokalen Daten zu lesen.',
      'local-data-damaged': 'Früher in diesem Browser gespeicherte Daten konnten nicht gelesen werden. Sie sind möglicherweise beschädigt.',
      unknown: 'Bei der Verbindung mit der Datenbank ist ein Fehler aufgetreten. Versuchen Sie es erneut.',
    },
    notConfiguredTitle: 'Datenbank nicht eingerichtet',
  },
  auth: {
    errors: {
      'invalid-email': 'Geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de.',
      'missing-password': 'Geben Sie Ihr Passwort ein.',
      'weak-password': 'Verwenden Sie ein Passwort mit mindestens {min} Zeichen.',
      'email-in-use': 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Melden Sie sich stattdessen an.',
      'wrong-credentials': 'E-Mail-Adresse oder Passwort ist falsch.',
      'too-many-requests': 'Zu viele Versuche. Warten Sie einige Minuten und versuchen Sie es erneut.',
      network: 'Der Anmeldedienst ist nicht erreichbar. Prüfen Sie Ihre Internetverbindung.',
      'not-enabled': 'Die Anmeldung mit E-Mail und Passwort ist für dieses Firebase-Projekt nicht aktiviert.',
      'not-configured': 'Die Anmeldung ist nicht verfügbar, weil Firebase nicht eingerichtet ist (siehe README).',
      unknown: 'Die Anmeldung ist fehlgeschlagen. Versuchen Sie es erneut.',
    },
    signInTitle: 'Anmelden',
    registerTitle: 'Konto erstellen',
    signInIntro: 'Melden Sie sich an, um Ihre Aktivitäten, Ziele und gespeicherten Vergleiche zu sehen.',
    registerIntro:
      'Mit einem Konto sind Ihre Aktivitäten, Ziele und gespeicherten Vergleiche sicher und auf jedem Gerät verfügbar.',
    email: 'E-Mail',
    password: 'Passwort',
    passwordHint: 'Mindestens {min} Zeichen.',
    signIn: 'Anmelden',
    signingIn: 'Anmeldung läuft…',
    createAccount: 'Konto erstellen',
    creatingAccount: 'Konto wird erstellt…',
    haveAccount: 'Sie haben bereits ein Konto?',
    newHere: 'Neu bei Carbon Choices?',
    switchToRegister: 'Konto erstellen',
    switchToSignIn: 'Anmelden',
    checking: 'Anmeldung wird geprüft…',
    gate: {
      savedTitle: 'Gespeicherte Vergleiche',
      savedReason: 'Melden Sie sich an, um Ihre gespeicherten Vergleiche zu sehen.',
      goalsTitle: 'CO₂-Reduktionsziele',
      goalsReason: 'Melden Sie sich an, um Ihren CO₂-Plan zu erstellen und in Ihrem Konto zu speichern.',
      trackingTitle: 'Persönliches CO₂-Tracking',
      trackingReason: 'Melden Sie sich an, um Ihre Aktivitäten zu erfassen und Ihre Emissionen zu sehen.',
    },
  },
  account: {
    eyebrow: 'Konto',
    title: 'Ihr Konto',
    description:
      'Ihre Aktivitäten, Ihr CO₂-Plan und Ihre gespeicherten Vergleiche werden in Ihrem Konto gespeichert. Sie bleiben nach dem Neuladen erhalten und sind auf jedem Gerät verfügbar.',
    signedInTitle: 'Angemeldet',
    signedInAs: 'Sie sind angemeldet als {email}.',
    signOut: 'Abmelden',
    signingOut: 'Abmeldung läuft…',
  },
  import: {
    title: 'In diesem Browser gespeicherte Daten',
    nothing: 'Es gibt keine Aktivitäten oder Vergleiche, die nur in diesem Browser gespeichert sind.',
    intro:
      'Bevor es Konten gab, hat Carbon Choices Daten nur in diesem Browser gespeichert. Dieser Browser enthält {activities} und {comparisons}. Importieren Sie sie, um sie in Ihrem Konto zu behalten. Einträge, die bereits in Ihrem Konto sind, werden übersprungen, und nichts wird aus diesem Browser gelöscht.',
    activities: { one: '{count} Aktivität', other: '{count} Aktivitäten' },
    savedComparisons: { one: '{count} gespeicherten Vergleich', other: '{count} gespeicherte Vergleiche' },
    comparisons: { one: '{count} Vergleich', other: '{count} Vergleiche' },
    imported: 'Importiert: {activities} und {comparisons}.',
    skipped: {
      one: '{count} Eintrag, der bereits in Ihrem Konto war, wurde übersprungen.',
      other: '{count} Einträge, die bereits in Ihrem Konto waren, wurden übersprungen.',
    },
    failed: '{error} Aus diesem Browser wurde nichts entfernt, Sie können es also erneut versuchen.',
    import: 'In mein Konto importieren',
    importAgain: 'Erneut importieren',
    importing: 'Wird importiert…',
    notNow: 'Nicht jetzt',
  },
  routing: {
    title: 'Entfernung auf der Karte suchen',
    from: 'Von',
    to: 'Nach',
    lookUp: 'Entfernung suchen',
    lookingUp: 'Wird gesucht…',
    loading: 'Orte und Routen werden gesucht. Das dauert einige Sekunden.',
    enterBoth: 'Geben Sie zuerst einen Start und ein Ziel ein.',
    result: 'Von {from} nach {to}. Prüfen Sie, ob das die gemeinten Orte sind.',
    profiles: {
      driving: 'Mit dem Auto',
      cycling: 'Mit dem Fahrrad',
      walking: 'Zu Fuß',
    },
    distance: '{km} km (etwa {duration})',
    noRoute: 'keine Route gefunden',
    use: '{km} km übernehmen',
    used: 'Übernommen ✓',
    timesNote: 'Die Fahrzeiten sind Schätzungen des Kartendienstes und fließen nicht in die Ergebnisse ein.',
    credit:
      'Orte und Routen © {osm}, gefunden mit {nominatim} und {osrm}. Kostenlose öffentliche Dienste ohne garantierte Verfügbarkeit.',
    osm: 'OpenStreetMap-Mitwirkende',
    newTab: '(öffnet in einem neuen Tab)',
    places: {
      from: 'Start',
      to: 'Ziel',
    },
    errors: {
      'invalid-input': 'Geben Sie einen Ort für „{place}“ ein (bis zu 200 Zeichen).',
      'same-place': 'Start und Ziel sind derselbe Ort. Geben Sie zwei verschiedene Orte ein.',
      'not-found':
        'Der Ort für „{place}“ wurde auf der Karte nicht gefunden. Ergänzen Sie Stadt oder Land, zum Beispiel „Ilica 10, Zagreb“.',
      'no-route': 'Zwischen diesen Orten wurde keine Straßen-, Rad- oder Fußroute gefunden. Geben Sie die Entfernung selbst ein.',
      timeout: 'Der Kartendienst hat zu lange nicht geantwortet. Versuchen Sie es erneut oder geben Sie die Entfernung selbst ein.',
      network: 'Der Kartendienst ist nicht erreichbar. Prüfen Sie Ihre Internetverbindung oder geben Sie die Entfernung selbst ein.',
      'rate-limited':
        'Der kostenlose Kartendienst ist ausgelastet (zu viele Anfragen). Warten Sie eine Minute und versuchen Sie es erneut oder geben Sie die Entfernung selbst ein.',
      'server-error': 'Der Kartendienst hat gerade Probleme. Versuchen Sie es später oder geben Sie die Entfernung selbst ein.',
      unauthorized: 'Der Kartendienst hat die Anfrage abgelehnt. Die Diensteinstellungen sind möglicherweise falsch (siehe README).',
      'bad-request': 'Der Kartendienst konnte diese Anfrage nicht verarbeiten. Prüfen Sie die Orte oder geben Sie die Entfernung selbst ein.',
      malformed: 'Der Kartendienst hat eine unverständliche Antwort gesendet. Geben Sie die Entfernung selbst ein.',
    },
  },
  home: {
    eyebrow: 'Alltagsentscheidungen, klarer gemacht',
    title: 'Willkommen bei Carbon Choices',
    lead: 'Carbon Choices hilft Ihnen, Ihre alltäglichen Wege nach drei wichtigen Punkten zu vergleichen: wie viel CO₂ eine Fahrt verursacht, was sie kostet und wie lange sie dauert. Sehen Sie die Abwägungen klar und entscheiden Sie dann, was zu Ihnen passt.',
    cta: 'Einen Weg vergleichen',
    statusLabel: 'Projektstatus',
    status: 'Frühe Vorschau',
    statusText:
      'Vergleichen Sie Wege, setzen Sie CO₂-Ziele und erfassen Sie Ihre Aktivitäten. Die Zahlen sind beispielhafte Schätzungen; melden Sie sich an, um Ihre Daten in Ihrem Konto zu speichern.',
    factorsTitle: 'Drei Blickwinkel auf jeden Weg',
    factorsDescription:
      'Jeder Weg ist eine Abwägung. Carbon Choices stellt diese drei Faktoren nebeneinander, damit keine einzelne Zahl die ganze Geschichte erzählt.',
    factors: {
      co2: {
        title: 'CO₂-Emissionen',
        description:
          'Das Kohlendioxid, das eine Fahrt verursacht. Gehen und Radfahren verursachen unterwegs fast keines; motorisierte Verkehrsmittel unterscheiden sich je nach Fahrzeug, Kraftstoff und Anzahl der Mitfahrenden.',
      },
      cost: {
        title: 'Kosten',
        description:
          'Was eine Fahrt Sie kostet. Das kann ein Ticket, Kraftstoff und Parken oder ein Anteil an den Fahrzeugkosten sein, damit sich die Möglichkeiten fair vergleichen lassen.',
      },
      time: {
        title: 'Reisezeit',
        description:
          'Wie lange eine Fahrt von Tür zu Tür dauert, einschließlich des Wegs zur Haltestelle, Wartezeiten und Umstiegen, nicht nur die reine Fahrzeit.',
      },
    },
    howTitle: 'So funktioniert es',
    howDescription: 'So funktioniert der Vergleich eines Weges.',
    steps: {
      describe: {
        title: 'Weg beschreiben',
        description: 'Sagen Sie Carbon Choices, wo Sie losfahren und wohin Sie möchten.',
      },
      compare: {
        title: 'Möglichkeiten nebeneinander sehen',
        description: 'Jedes Verkehrsmittel wird mit CO₂-Emissionen, Kosten und Reisezeit in einer Ansicht gezeigt.',
      },
      choose: {
        title: 'Passend wählen',
        description: 'Wägen Sie ab, was Ihnen heute wichtig ist, und speichern Sie Vergleiche, auf die Sie zurückkommen möchten.',
      },
    },
    note: 'Die Ergebnisse in Carbon Choices sind Schätzungen auf Basis beispielhafter Durchschnittswerte. Jeder Vergleich zeigt, wie seine Zahlen berechnet wurden.',
  },
  pages: {
    notFound: {
      title: 'Seite nicht gefunden',
      description: 'Die gesuchte Seite existiert nicht.',
      emptyTitle: 'Hier ist nichts',
      body: 'Prüfen Sie die Adresse oder nutzen Sie die Navigation.',
    },
    settings: {
      title: 'Einstellungen',
      description: 'Passen Sie Carbon Choices an Ihre Bedürfnisse an.',
      languageTitle: 'Sprache',
      languageDescription:
        'Wählen Sie die Sprache der gesamten App. Ihre Wahl wird in diesem Browser gespeichert und beim nächsten Öffnen von Carbon Choices verwendet.',
      moreTitle: 'Weitere Einstellungen',
      moreBody: 'Weitere Einstellungen kommen hinzu, sobald neue Funktionen entstehen.',
    },
    saved: {
      eyebrow: 'Alltagsentscheidungen vergleichen',
      title: 'Gespeicherte Vergleiche',
      description: 'Kehren Sie zu Wegen zurück, die Sie bereits verglichen haben. Vergleiche werden in Ihrem Konto gespeichert.',
    },
  },
  dialog: {
    deleting: 'Wird gelöscht…',
  },
}
