/** ENIVERSE — CENNIK STRON INTERNETOWYCH
 * Ceny netto PLN. ID pakietu = data-ec-plan w HTML. Nazwa i wygląd boxa są w HTML.
 * Dodaj pakiet w cenniku oraz odpowiadający box w HTML; usuń wpis, aby ukryć box.
 * Dodatki / marketing / uslugiRoczne: dodaj, usuń lub zmień obiekt.
 * wPakietach: pakiety mające usługę w cenie; dostepneWPakietach: dostępność.
 * Brak ograniczeń = dostępny we wszystkich. SEO, kontakt, szkolenia wg rosnącej ceny.
 * Pakiet wskazuje bazowy wariant po ID; hosting ma dotychczasowe reguły bazowe.
 * Rozbudowa: cztery istniejące mechanizmy; usuń klucz, aby ukryć.
 */
window.ENIVERSE_CENNIK = {
  // 01. Ceny pakietów i przypisania usług
  pakiety: [
    {
      "id": "mini",
      "platnosc": {
        "miesiecznie": 69,
        "roczniePromocja": 590,
        "rocznieRegularna": 790
      },
      "revisions": 0,
      "seo": "brak",
      "kontakt": "podstawowy",
      "szkolenie": "instrukcjaPDF",
      "hosting": "subscription"
    },
    {
      "id": "start",
      "cena": 1190,
      "revisions": 1,
      "seo": "brak",
      "kontakt": "podstawowy",
      "szkolenie": "instrukcjaPDF",
      "hosting": "optional"
    },
    {
      "id": "one",
      "cena": 1690,
      "revisions": 2,
      "seo": "techniczne",
      "kontakt": "formularz",
      "szkolenie": "szkolenie30min",
      "hosting": "optional"
    },
    {
      "id": "wiz",
      "cena": 2490,
      "revisions": 3,
      "seo": "podstawowe",
      "kontakt": "formularz",
      "szkolenie": "szkolenie1h",
      "hosting": "optional"
    },
    {
      "id": "firm",
      "cena": 3490,
      "revisions": 3,
      "seo": "rozszerzone",
      "kontakt": "formularz",
      "szkolenie": "szkolenie2h",
      "hosting": "year"
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

  // 04. SEO
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

  // 09. Ustawienia rozliczeń
  ustawienia: {
    okresAbonamentu: 12,
    zaliczkaProcent: 50,
    zaokraglanieRat: true,
    progZaokraglania: 0.50
  }
};
