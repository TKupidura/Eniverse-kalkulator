/** ENIVERSE — CENTRUM ZARZĄDZANIA OFERTĄ STRON INTERNETOWYCH
 * Ceny netto PLN; grosze z kropką. Nazwy są wyświetlane w kalkulatorze.
 * ID pakietu musi odpowiadać data-ec-plan w HTML. Nie zmieniaj ID przy zmianie nazwy.
 * Nowy pakiet: dodaj obiekt oraz box HTML z tym samym ID; usuń obiekt, aby ukryć box.
 * mini = specjalny abonament. Opisy marketingowe, ikony i wyróżnienie edytuj w HTML.
 * Dodatki, marketing, uslugiRoczne: dodaj/usuń obiekt, aby dodać/usunąć opcję.
 * dostepneWPakietach: opcjonalna lista ID pakietów, w których opcja jest dostępna.
 * wPakietach: opcjonalna lista ID pakietów, w których opcja jest w cenie.
 * Brak obu pól = płatna opcja dostępna wszędzie. Hosting/care zachowują reguły bazowe.
 * SEO, kontakt, szkolenia: warianty uporządkowane wg ceny, dopłata od bazy.
 * Rozbudowa: cztery mechanizmy z własnymi kontrolkami. Usuń klucz, aby ukryć.
 * Po zmianie wyczyść cache. Szczegóły: INSTRUKCJA-WDROZENIA.md.
 */
window.ENIVERSE_CENNIK = {
  // 01. Pakiety — ID odpowiadają boxom HTML
  pakiety: [
    {
      "id": "mini",
      "nazwa": "Abonament",
      "platnosc": {
        "miesiecznie": 69,
        "roczniePromocja": 590,
        "rocznieRegularna": 790
      },
      "recurring": true,
      "structure": "Strona główna do 5 sekcji",
      "chips": [
        "Hero",
        "O nas",
        "Oferta",
        "Opinie",
        "Kontakt"
      ],
      "revisions": 0,
      "hosting": "subscription",
      "days": 3,
      "tech": "HTML / CSS",
      "design": "Gotowy szablon z bazy Eniverse",
      "content": "Klient dostarcza gotowe treści, dopasowane do wybranego szablonu.",
      "panel": false,
      "rights": "Korzystanie ze strony w ramach abonamentu",
      "terms": "Umowa abonamentowa",
      "nav": false,
      "seo": "brak",
      "kontakt": "podstawowy",
      "szkolenie": "instrukcjaPDF",
      "galeria": true
    },
    {
      "id": "start",
      "nazwa": "Start",
      "cena": 1190,
      "recurring": false,
      "structure": "Strona główna do 5 sekcji",
      "chips": [
        "Hero",
        "O nas",
        "Oferta",
        "Opinie",
        "Kontakt"
      ],
      "revisions": 1,
      "hosting": "optional",
      "days": 5,
      "tech": "CMS — WordPress",
      "design": "Gotowy szablon z bazy Eniverse (WordPress)",
      "content": "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
      "panel": true,
      "rights": "Licencja na korzystanie ze strony, bez wyłączności do szablonu",
      "terms": "Samodzielne zarządzanie stroną bez abonamentu za projekt",
      "nav": false,
      "seo": "brak",
      "kontakt": "podstawowy",
      "szkolenie": "instrukcjaPDF",
      "galeria": true
    },
    {
      "id": "one",
      "nazwa": "One Page",
      "cena": 1690,
      "recurring": false,
      "structure": "Strona główna do 5 sekcji",
      "chips": [
        "Hero",
        "O nas",
        "Oferta",
        "Opinie",
        "Kontakt"
      ],
      "revisions": 2,
      "hosting": "optional",
      "days": 7,
      "tech": "CMS — WordPress",
      "design": "Dostosowanie układu sekcji i wyglądu strony do Twojej marki: zmiana kolejności sekcji, usunięcie lub drobne modyfikacje.",
      "content": "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
      "panel": true,
      "rights": "Prawa do indywidualnie wykonanych elementów — zgodnie z umową i licencjami",
      "terms": "Jednorazowa opłata za wykonanie strony",
      "nav": false,
      "seo": "techniczne",
      "kontakt": "formularz",
      "szkolenie": "szkolenie30min",
      "galeria": false
    },
    {
      "id": "wiz",
      "nazwa": "Wizytówka",
      "cena": 2490,
      "recurring": false,
      "structure": "Do 5 podstron",
      "chips": [],
      "revisions": 3,
      "hosting": "optional",
      "days": 10,
      "tech": "CMS — WordPress",
      "design": "Personalizacja szablonu WordPress — dopasowanie kolorystyki, układu sekcji i prezentacji usług firmy.",
      "content": "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
      "panel": true,
      "rights": "Prawa do indywidualnie wykonanych elementów — zgodnie z umową i licencjami",
      "terms": "Jednorazowa opłata za wykonanie strony",
      "nav": false,
      "seo": "podstawowe",
      "kontakt": "formularz",
      "szkolenie": "szkolenie1h",
      "galeria": false
    },
    {
      "id": "firm",
      "nazwa": "Strona firmowa",
      "cena": 3490,
      "recurring": false,
      "structure": "Do 10 podstron",
      "chips": [],
      "revisions": 3,
      "hosting": "year",
      "days": 14,
      "tech": "CMS — WordPress",
      "design": "Rozszerzona personalizacja szablonu WordPress — dopasowanie struktury podstron, prezentacji usług i ścieżek kontaktu.",
      "content": "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
      "panel": true,
      "rights": "Prawa do indywidualnie wykonanych elementów — zgodnie z umową i licencjami",
      "terms": "Jednorazowa opłata za wykonanie strony",
      "nav": true,
      "seo": "rozszerzone",
      "kontakt": "formularz",
      "szkolenie": "szkolenie2h",
      "galeria": false
    }
  ],

  // 02. Rozbudowa strony
  rozbudowa: {
    "dodatkowaSekcja": {
      "nazwa": "Dodatkowe sekcje",
      "cena": 90
    },
    "dodatkowaPodstrona": {
      "nazwa": "Dodatkowe podstrony",
      "cena": 190
    },
    "dodatkowyJezyk": {
      "nazwa": "Dodaj język",
      "cena": 490
    },
    "dodatkowaRundaPoprawek": {
      "nazwa": "Sesje poprawek",
      "cena": 69
    }
  },

  // 03. Dodatki do projektu
  dodatki: [
    {
      "id": "maps",
      "nazwa": "Mapy Google",
      "cena": 50
    },
    {
      "id": "newsletter",
      "nazwa": "Newsletter",
      "cena": 300
    },
    {
      "id": "social",
      "nazwa": "Integracja z social media",
      "cena": 50
    },
    {
      "id": "analytics",
      "nazwa": "Google Analytics",
      "cena": 200
    },
    {
      "id": "gsc",
      "nazwa": "Google Search Console",
      "cena": 90,
      "wPakietach": [
        "wiz",
        "firm"
      ]
    },
    {
      "id": "blog",
      "nazwa": "Blog / Realizacje",
      "cena": 249,
      "wPakietach": [
        "firm"
      ]
    },
    {
      "id": "logoAi",
      "nazwa": "Logo stworzone przy pomocy AI",
      "cena": 190
    }
  ],

  // 04. SEO — warianty
  seo: [
    {
      "id": "brak",
      "nazwa": "Bez dodatkowego SEO",
      "opis": "Brak SEO na start w bazie pakietu",
      "cena": 0
    },
    {
      "id": "techniczne",
      "nazwa": "SEO techniczne na start",
      "opis": "Zakres do doprecyzowania w warunkach SEO",
      "cena": 149
    },
    {
      "id": "podstawowe",
      "nazwa": "Podstawowe SEO na start",
      "opis": "Według warunków SEO; dalsze usługi wyceniane osobno",
      "cena": 290
    },
    {
      "id": "rozszerzone",
      "nazwa": "Rozszerzone SEO",
      "opis": "Według warunków SEO; dalsze usługi wyceniane osobno",
      "cena": 490
    }
  ],

  // 05. Marketing i dodatkowe SEO
  marketing: [
    {
      "id": "contentEdit",
      "nazwa": "Redakcja i optymalizacja treści",
      "cena": 290,
      "opis": "Optymalizacja istniejących tekstów"
    },
    {
      "id": "contentSeo",
      "nazwa": "Stworzenie i optymalizacja treści pod SEO",
      "cena": 590,
      "opis": "Przygotowanie nowych tekstów pod SEO"
    },
    {
      "id": "googleAds",
      "nazwa": "Kampania Google Ads",
      "cena": 490,
      "opis": "Uruchomienie kampanii · bez budżetu reklamowego"
    },
    {
      "id": "seoPosition",
      "nazwa": "Pozycjonowanie SEO",
      "cena": 690,
      "opis": "Pakiet startowy · dalsza obsługa osobno"
    }
  ],

  // 06. Kontakt
  kontakt: [
    {
      "id": "podstawowy",
      "nazwa": "Kontakt podstawowy",
      "opis": "Przyciski kontaktowe: telefon i e-mail",
      "cena": 0
    },
    {
      "id": "formularz",
      "nazwa": "Formularz kontaktowy",
      "opis": "Standardowy formularz kontaktowy",
      "cena": 90
    },
    {
      "id": "formularzRozszerzony",
      "nazwa": "Formularz kontaktowy rozszerzony",
      "opis": "Rozbudowane pola i opcje formularza",
      "cena": 190
    }
  ],

  // 07. Szkolenia
  szkolenia: [
    {
      "id": "instrukcjaPDF",
      "nazwa": "Instrukcja PDF",
      "cena": 0
    },
    {
      "id": "szkolenie30min",
      "nazwa": "Szkolenie 30 min",
      "cena": 49
    },
    {
      "id": "szkolenie1h",
      "nazwa": "Szkolenie 1 h",
      "cena": 90
    },
    {
      "id": "szkolenie2h",
      "nazwa": "Szkolenie 2 h",
      "cena": 179
    }
  ],

  // 08. Usługi roczne
  uslugiRoczne: [
    {
      "id": "hosting",
      "nazwa": "Hosting strony",
      "cena": 600
    },
    {
      "id": "care",
      "nazwa": "Opieka techniczna",
      "cena": 348
    }
  ],

  // 09. Ustawienia globalne rozliczeń
  ustawienia: {
    okresAbonamentu: 12,
    zaliczkaProcent: 50,
    zaokraglanieRat: true,
    progZaokraglania: 0.50
  }
};
