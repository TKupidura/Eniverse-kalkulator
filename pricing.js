/**
 * ============================================================
 * ENIVERSE — CENTRUM ZARZĄDZANIA CENNIKIEM STRON INTERNETOWYCH
 * ============================================================
 *
 * ZASADY OGÓLNE
 * ------------------------------------------------------------
 * Wszystkie ceny podawane są w PLN netto.
 * Kwoty dziesiętne zapisujemy z kropką, np. 149.90.
 * Nie zmieniaj istniejących ID bez potrzeby.
 *
 * OKRES OPŁATY (okresOplaty)
 * ------------------------------------------------------------
 * okresOplaty: "miesiecznie" — zł netto / mies.
 * okresOplaty: "rocznie"     — zł netto / rok
 * okresOplaty: ""           — zł netto, bez oznaczenia okresu.
 * Abonament ma trzy osobne stawki: okres każdej określa
 * odpowiadające jej pole okresOplaty w obiekcie platnosc.
 * Od wydania 20261127-19 kalkulator odczytuje te pola.
 * Pakiety poza Abonamentem: opłaty cykliczne liczone za 12 miesięcy,
 * na start naliczana pierwsza opłata miesięczna lub roczna.
 * Zaliczka dotyczy jednorazowego projektu i dodatków.
 * Abonament: opłaty liczone za okres umowy i rozkładane na raty.
 * Stawki Abonamentu są przeliczane do miesięcznego/rocznego
 * trybu płatności; pusty okres ukrywa dopisek, nie znosi umowy.
 * Dla wariantów różnicę kosztów liczy się w okresie wyceny.
 * W sekcji uslugiRoczne puste pole oznacza opłatę na start.
 * Brak pola w starszych pozycjach uslugiRoczne oznacza rok.
 * Nazwy i wygląd boxów pakietów edytuj w HTML.
 *
 * IDENTYFIKATORY PAKIETÓW
 * ------------------------------------------------------------
 * mini  - Abonament
 * start - Start
 * one   - One Page
 * wiz   - Wizytówka
 * firm  - Strona firmowa
 *
 * ZARZĄDZANIE PAKIETAMI
 * ------------------------------------------------------------
 * cena - cena bazowa pakietu.
 * revisions - liczba rund poprawek zawartych w cenie pakietu.
 * Przykład: "revisions": 3 oznacza 3 rundy poprawek w cenie.
 * Wartość 0 oznacza brak rund poprawek w cenie.
 *
 * Dodanie nowego pakietu wymaga utworzenia boxa w HTML
 * oraz wpisu z takim samym ID w pricing.js.
 * Usunięcie pakietu z cennika ukrywa odpowiadający mu box.
 *
 * DOSTĘPNOŚĆ DODATKÓW
 * ------------------------------------------------------------
 * wPakietach:
 * Określa, w których pakietach dodatek jest już w cenie.
 *
 * Przykład:
 * "wPakietach": ["wiz", "firm"]
 *
 * dostepneWPakietach:
 * Określa, w których pakietach dodatek jest dostępny.
 * W pozostałych pakietach nie będzie widoczny.
 *
 * Przykład:
 * "dostepneWPakietach": ["one", "wiz", "firm"]
 *
 * Jeżeli nie podasz żadnego z powyższych parametrów,
 * zwykły dodatek będzie dostępny odpłatnie we wszystkich pakietach.
 *
 * Można również łączyć oba parametry:
 * "dostepneWPakietach": ["one", "wiz", "firm"],
 * "wPakietach": ["firm"]
 *
 * W takim przypadku dodatek jest płatny w One Page
 * i Wizytówce, a w Stronie firmowej jest już w cenie.
 * Każde ID z wPakietach musi należeć do dostepneWPakietach,
 * jeśli podano obie listy.
 *
 * Reguły dotyczą sekcji dodatki, marketing i uslugiRoczne.
 * Hosting i opieka techniczna zachowują specjalne reguły bazowe.
 * Dodaj, usuń lub zmień cały obiekt, aby zarządzać usługą.
 *
 * ZARZĄDZANIE FORMULARZAMI KONTAKTOWYMI
 * ------------------------------------------------------------
 * Dostępne warianty:
 * podstawowy           - kontakt telefoniczny i e-mail
 * formularz            - standardowy formularz kontaktowy
 * formularzRozszerzony - rozszerzony formularz kontaktowy
 *
 * Aby zmienić formularz zawarty w cenie pakietu,
 * zmień parametr "kontakt" w wybranym pakiecie.
 *
 * Przed: "kontakt": "podstawowy"
 * Po:    "kontakt": "formularz"
 *
 * Nie zmieniaj ceny formularza na 0 zł tylko po to,
 * by uwzględnić go w wybranym pakiecie.
 * Przypisanie jego ID do pakietu oznacza, że jest w cenie.
 * Klient dopłaca jedynie różnicę za wyższy wariant.
 *
 * ZARZĄDZANIE SZKOLENIAMI
 * ------------------------------------------------------------
 * Dostępne warianty:
 * instrukcjaPDF  - instrukcja PDF
 * szkolenie30min - szkolenie 30 minut
 * szkolenie1h    - szkolenie 1 godzina
 * szkolenie2h    - szkolenie 2 godziny
 *
 * Aby zmienić szkolenie zawarte w cenie pakietu,
 * zmień parametr "szkolenie" w wybranym pakiecie.
 *
 * Przykład:
 * "szkolenie": "szkolenie1h"
 *
 * Aby dodać nowe szkolenie, utwórz nowy obiekt
 * w sekcji szkolenia, podając unikalne ID, nazwę i cenę.
 *
 * Przykład:
 * {
 *     "id": "szkolenie3h",
 *     "nazwa": "Szkolenie 3 h",
 *     "cena": 249,
 *     "okresOplaty": ""
 * }
 *
 * Następnie możesz przypisać je do wybranego pakietu:
 * "szkolenie": "szkolenie3h"
 *
 * Warianty SEO, kontaktu i szkoleń zawsze porządkuj
 * według ceny rosnąco, od najtańszego do najdroższego.
 *
 * ============================================================
 */
window.ENIVERSE_CENNIK = {
  // 01. Ceny pakietów i przypisania usług
  pakiety: [
    {
      id: "mini",
      platnosc: {
        miesiecznie: 69,
        roczniePromocja: 590,
        rocznieRegularna: 790,
        okresOplaty: {
          miesiecznie: "miesiecznie",
          roczniePromocja: "rocznie",
          rocznieRegularna: "rocznie"
        }
      },
      revisions: 0,
      seo: "brak",
      kontakt: "podstawowy",
      szkolenie: "instrukcjaPDF",
      hosting: "subscription"
    },
    {
      id: "start",
      cena: 1190,
      okresOplaty: "",
      revisions: 1,
      seo: "brak",
      kontakt: "podstawowy",
      szkolenie: "instrukcjaPDF",
      hosting: "optional"
    },
    {
      id: "one",
      cena: 1690,
      okresOplaty: "",
      revisions: 2,
      seo: "techniczne",
      kontakt: "formularz",
      szkolenie: "szkolenie30min",
      hosting: "optional"
    },
    {
      id: "wiz",
      cena: 2490,
      okresOplaty: "",
      revisions: 3,
      seo: "podstawowe",
      kontakt: "formularz",
      szkolenie: "szkolenie1h",
      hosting: "optional"
    },
    {
      id: "firm",
      cena: 3490,
      okresOplaty: "",
      revisions: 3,
      seo: "rozszerzone",
      kontakt: "formularz",
      szkolenie: "szkolenie2h",
      hosting: "year"
    }
  ],

  // ============================================================
  // 02. ROZBUDOWA STRONY
  // ============================================================
  //
  // UWAGA!
  // Nie dodawaj tutaj nowych, dowolnych identyfikatorów.
  // Ta sekcja obsługuje cztery konkretne mechanizmy.
  //
  // Możesz zmieniać ich nazwy i ceny lub usuwać całe obiekty.
  //
  // Nowe standardowe usługi dodawaj w sekcji "dodatki".
  // ============================================================
  rozbudowa: {
    dodatkowaSekcja: {
      nazwa: "Dodatkowe sekcje",
      cena: 50,
      okresOplaty: ""
    },
    dodatkowaPodstrona: {
      nazwa: "Dodatkowe podstrony",
      cena: 60,
      okresOplaty: ""
    },
    // dodatkowyJezyk: {
    //   nazwa: "Dodaj język",
    //   cena: 110,
    //   okresOplaty: ""
    // },
    dodatkowaRundaPoprawek: {
      nazwa: "Sesje poprawek",
      cena: 250,
      okresOplaty: ""
    }
  },

  // ============================================================
  // 03. DODATKI DO PROJEKTU
  // ============================================================
  //
  // id                  - unikalny identyfikator dodatku
  // nazwa               - nazwa widoczna w kalkulatorze
  // cena                - cena netto dodatku
  // wPakietach          - pakiety, które mają dodatek w cenie
  // dostepneWPakietach  - pakiety, w których dodatek jest dostępny
  //
  // Brak wPakietach i dostepneWPakietach oznacza, że dodatek
  // jest dostępny odpłatnie we wszystkich pakietach.
  //
  // Dodaj cały obiekt, aby utworzyć nową usługę.
  // Usuń cały obiekt, aby usunąć usługę z kalkulatora.
  // ============================================================
  dodatki: [
    {
      id: "maps",
      nazwa: "Mapy Google",
      cena: 50,
      okresOplaty: ""
    },
    {
      id: "newsletter",
      nazwa: "Newsletter",
      cena: 250,
      okresOplaty: ""
    },
    {
      id: "social",
      nazwa: "Integracja z social media",
      cena: 50,
      okresOplaty: ""
    },
    {
      id: "analytics",
      nazwa: "Google Analytics",
      cena: 200,
      okresOplaty: ""
    },
    {
      id: "gsc",
      nazwa: "Google Search Console",
      cena: 100,
      okresOplaty: "",
      wPakietach: ["wiz", "firm"]
    },
    {
      id: "blog",
      nazwa: "Blog / Realizacje",
      cena: 400,
      okresOplaty: "",
      wPakietach: ["firm"]
    },
    {
      id: "logo",
      nazwa: "Projekt logo stworzony przez grafika",
      cena: 800,
      okresOplaty: ""
    },
    {
      id: "logoAi",
      nazwa: "Projekt logo stworzony przy pomocy AI",
      cena: 200,
      okresOplaty: ""
    }
  ],

  // 04. SEO
  seo: [
    {
      id: "brak",
      nazwa: "Bez dodatkowego SEO",
      opis: "Brak SEO na start w bazie pakietu",
      cena: 0,
      okresOplaty: ""
    },
    {
      id: "techniczne",
      nazwa: "SEO techniczne na start",
      opis: "Według warunków SEO; dalsze usługi wyceniane osobno",
      cena: 150,
      okresOplaty: ""
    },
    {
      id: "podstawowe",
      nazwa: "Podstawowe SEO na start",
      opis: "Według warunków SEO; dalsze usługi wyceniane osobno",
      cena: 250,
      okresOplaty: ""
    },
    {
      id: "rozszerzone",
      nazwa: "Rozszerzone SEO",
      opis: "Według warunków SEO; dalsze usługi wyceniane osobno",
      cena: 350,
      okresOplaty: ""
    }
  ],

  // 05. Marketing i dodatkowe SEO
  marketing: [
    {
      id: "contentEdit",
      nazwa: "Redakcja i optymalizacja przesłanych treści",
      cena: 150,
      okresOplaty: "",
      opis: "Optymalizacja istniejących tekstów"
    },
    {
      id: "contentSeo",
      nazwa: "Stworzenie i optymalizacja treści pod SEO",
      cena: 400,
      okresOplaty: "",
      opis: "Przygotowanie nowych tekstów pod SEO"
    },
    {
      id: "googleAds",
      nazwa: "Kampania Google Ads",
      cena: 600,
      okresOplaty: "",
      opis: "Uruchomienie oraz opieka kampanii · bez budżetu reklamowego"
    },
    {
      id: "seoPosition",
      nazwa: "Pozycjonowanie SEO",
      cena: 800,
      okresOplaty: "",
      opis: "Pakiet startowy · dalsza obsługa osobno"
    }
  ],

  // ============================================================
  // 06. KONTAKT
  // ============================================================
  //
  // Aby zmienić formularz zawarty w cenie pakietu,
  // zmień wartość parametru "kontakt" w sekcji pakiety.
  //
  // Nie ustawiaj ceny formularza na 0 zł tylko w celu
  // uwzględnienia go w wybranym pakiecie.
  // Przypisanie ID do pakietu oznacza, że jest w cenie.
  //
  // Dopłata za wyższy wariant = różnica cen wariantów.
  // Warianty muszą być uporządkowane według ceny rosnąco.
  // ============================================================
  kontakt: [
    {
      id: "podstawowy",
      nazwa: "Kontakt podstawowy",
      opis: "Przyciski kontaktowe: telefon i e-mail",
      cena: 0,
      okresOplaty: ""
    },
    {
      id: "formularz",
      nazwa: "Formularz kontaktowy",
      opis: "Standardowy formularz kontaktowy",
      cena: 100,
      okresOplaty: ""
    },
    {
      id: "formularzRozszerzony",
      nazwa: "Formularz kontaktowy rozszerzony",
      opis: "Rozbudowane pola i opcje formularza",
      cena: 250,
      okresOplaty: ""
    }
  ],

  // ============================================================
  // 07. SZKOLENIA
  // ============================================================
  //
  // Aby dodać szkolenie, utwórz nowy obiekt z unikalnym ID,
  // nazwą oraz ceną netto.
  //
  // Aby przypisać szkolenie do pakietu, zmień parametr
  // "szkolenie" w sekcji pakiety, podając ID szkolenia.
  //
  // Dopłata za wyższy wariant = różnica cen wariantów.
  // Warianty muszą być uporządkowane według ceny rosnąco.
  // ============================================================
  szkolenia: [
    {
      id: "instrukcjaPDF",
      nazwa: "Instrukcja PDF",
      cena: 0,
      okresOplaty: ""
    },
    {
      id: "szkolenie30min",
      nazwa: "Szkolenie 30 min",
      cena: 60,
      okresOplaty: ""
    },
    {
      id: "szkolenie1h",
      nazwa: "Szkolenie 1 h",
      cena: 120,
      okresOplaty: ""
    },
    {
      id: "szkolenie2h",
      nazwa: "Szkolenie 2 h",
      cena: 240,
      okresOplaty: ""
    }
  ],

  // 08. Usługi roczne
  uslugiRoczne: [
    {
      id: "hosting",
      nazwa: "Hosting strony",
      cena: 300,
      okresOplaty: "rocznie"
    },
    {
      id: "care",
      nazwa: "Opieka techniczna pakiet WP Mini",
      opis: "W cenie: Aktualizacja WordPress oraz wtyczek, Kopia zapasowa, Weryfikacja strony po wykonanej aktualizacji.  ",
      cena: 100,
      okresOplaty: "rocznie"
    }
  ],

  // 09. Ustawienia rozliczeń
  ustawienia: {
    okresAbonamentu: 12,
    zaliczkaProcent: 50,
    zaokraglanieRat: true,
    progZaokraglania: 0.5
  }
}
