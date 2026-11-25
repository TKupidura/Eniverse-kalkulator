/** ENIVERSE — CENTRUM ZARZĄDZANIA OFERTĄ STRON INTERNETOWYCH
 * Ceny netto PLN; grosze z kropką. Nazwy są wyświetlane w kalkulatorze.
 * Każda pozycja listy ma unikalne id. Nie zmieniaj id, jeżeli tylko zmieniasz nazwę.
 * Dodaj lub usuń cały obiekt z listy, aby dodać lub usunąć pozycję.
 * Pakiety: skopiuj cały pakiet jednorazowy i nadaj nowe id. Abonament (mini)
 * ma specjalny układ i własne stawki platnosc; maksymalnie jeden abonament.
 * Pole wPakietach dodatku to lista id pakietów, które mają go w cenie.
 * SEO, kontakt, szkolenia: warianty uporządkowane wg ceny, dopłata od bazy.
 * Rozbudowa: cztery nazwane mechanizmy (liczniki, języki, poprawki); usuń
 * właściwy klucz, aby ukryć mechanizm. Nowe zwykłe opcje dodawaj do dodatki.
 * hosting i care mają specjalne reguły świadczeń w cenie pakietu.
 * Nowa usługa roczna: dodaj obiekt z innym id do uslugiRoczne.
 * Po zmianie wyczyść cache. Szczegóły: INSTRUKCJA-WDROZENIA.md.
 */
window.ENIVERSE_CENNIK = {
  "pakiety": [
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
      "terms": "Umowa abonamentowa na 12 miesięcy",
      "nav": false,
      "seo": "brak",
      "kontakt": "podstawowy",
      "szkolenie": "instrukcjaPDF",
      "galeria": true,
      "wyrozniony": false,
      "karta": {
        "kicker": "PROSTY START W INTERNECIE",
        "description": "Dla osób, które chcą prostej strony bez dużej opłaty początkowej.",
        "scale": "Strona w pakiecie Abonament · do 5 sekcji",
        "scaleNote": "Gotowy szablon HTML i CSS.",
        "benefits": [
          "Gotowy wygląd i wersja mobilna",
          "Hosting przez okres umowy",
          "Strona z Twoimi gotowymi materiałami"
        ],
        "icon": "page"
      }
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
      "galeria": true,
      "wyrozniony": false,
      "karta": {
        "kicker": "STRONA NA DOBRY POCZĄTEK",
        "description": "Dla małej działalności, która potrzebuje strony WordPress do samodzielnej edycji.",
        "scale": "Strona z szablonu · do 5 sekcji",
        "scaleNote": "Np. Hero, O nas, Oferta, Opinie i Kontakt.",
        "benefits": [
          "WordPress i panel do samodzielnej edycji tekstów i zdjęć",
          "Dopasowanie szablonu do marki",
          "Wprowadzenie dostarczonych treści",
          "Instrukcja obsługi PDF"
        ],
        "icon": "page"
      }
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
      "galeria": false,
      "wyrozniony": false,
      "karta": {
        "icon": "page",
        "kicker": "PROSTA OBECNOŚĆ W SIECI",
        "description": "Dla freelancera i mikrofirmy. Przedstaw ofertę jasno, na jednej przewijanej stronie."
      }
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
      "galeria": false,
      "wyrozniony": true,
      "karta": {
        "icon": "pages",
        "kicker": "WIĘCEJ MIEJSCA NA OFERTĘ",
        "description": "Dla małej firmy, która potrzebuje kilku podstron na usługi, realizacje i kontakt."
      }
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
      "galeria": false,
      "wyrozniony": false,
      "karta": {
        "icon": "many",
        "kicker": "PEŁNA PREZENTACJA FIRMY",
        "description": "Dla firmy z rozbudowaną ofertą. Miejsce na usługi, realizacje i regularne publikacje."
      }
    }
  ],
  "rozbudowa": {
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
  "seo": [
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
  "dodatki": [
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
  "marketing": [
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
  "kontakt": [
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
  "szkolenia": [
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
  "uslugiRoczne": [
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
  ]
};
