# Eniverse — wdrożenie pakietów i kalkulatora
Wersja z 24.11.2026, na podstawie zaakceptowanego kalkulatora (c2be4be279b2dd5e590633a49b3f08ce4ee43bd7).
Nie instaluj tego ZIP-a w menu Wtyczki. To pakiet kodu do widżetu HTML Elementor.
## 1. Przygotuj stronę
Zrób kopię strony i pracuj na jej wersji roboczej. Użyj Elementor + Elementor Pro (klasyczny widżet Formularz). Eniverse Templates Manager 1.2.1 powinien być aktywny. Wgraj i opublikuj w nim szablony ZIP. Sprawdź https://eniverse.pl/wp-json/eniverse/v1/templates — powinien zwrócić JSON z katalogiem (tablica lub obiekt templates). Identyfikatory wp-123, name, type, details, thumbnail_url, preview_url. Biblioteka jest wspólna dla Abonamentu i Start. Pusta lista oznacza brak szablonów, nie przywraca demonstracyjnych.
## 2. Dodaj pakiety i kalkulator
Rozpakuj ZIP. Otwórz plik index.html w edytorze tekstowym i skopiuj CAŁĄ zawartość, łącznie z style i script. W Elementorze dodaj jeden widżet HTML, wklej kod i ustaw kontener na pełną szerokość (bez nadmiernego paddingu). Usuń lub ukryj stare karty pakietów, żeby uniknąć duplikatów. Nie wstawiaj drugiego egzemplarza kalkulatora na tej samej stronie. Nie wklejaj do widżetu Tekst. Kod zawiera pięć pakietów i ich konfiguratory. Nie wymaga osobnego hostowania CSS/JS. Na stronie w podkatalogu lub przy niestandardowym REST API zmień data-templates-api w index.html na pełny HTTPS URL endpointu.
## 3. Podłącz formularz Elementor Pro
Dodaj na tej samej stronie, poza widżetem HTML, osobny klasyczny widżet Formularz. W zakładce Zaawansowane ustaw CSS ID: eniverse-quote-form (bez #). Nie ustawiaj ukrywania widżetu przez opcje responsywności, kod sam ukrywa go na opublikowanej stronie. Nazwa formularza: Eniverse — wycena. Usuń domyślne pola i dodaj poniższe, z dokładnym ID w zakładce Zaawansowane każdego pola.
| Etykieta | Typ | ID | Wymagane |
|---|---|---|---|
| Imię / firma | Text | client_name | Tak |
| E-mail | Email | client_email | Tak |
| Telefon | Tel | client_phone | Nie |
| Ma stronę | Hidden | has_site | Nie |
| Adres strony | Hidden | existing_site_url | Nie |
| Pakiet | Hidden | package_name | Nie |
| Wycena | Textarea | quote_summary | Tak |
Nie dodawaj drugiego wymaganego pola, checkboxa ani CAPTCHA do ukrytego formularza bez dostosowania integracji. Możesz włączyć Honeypot i zabezpieczenia antyspamowe po testach. Jeżeli potrzebujesz obowiązkowej zgody, dodaj ją do widocznego formularza i zweryfikuj po stronie serwera. Dodaj link do polityki prywatności obok kalkulatora przed publikacją.
W Actions After Submit wybierz Email i Collect Submissions (jeżeli chcesz zapisywać zgłoszenia). Usuń Redirect i Popup. Ustaw To na własny adres odbiorczy agencji (nie wpisano fikcyjnego adresu). From Email: istniejący adres nadawcy w Twojej domenie; Reply-To: [field id="client_email"]. Subject: Zapytanie Eniverse — [field id="package_name"]. Message: [all-fields]. Send As: Plain Text, jeśli dostępne. Skonfiguruj SMTP i zweryfikuj dostarczalność. Pole quote_summary zawiera komplet konfiguracji, w tym płatności i dodatki. Kalkulator uruchamia rzeczywisty formularz Elementor i czeka na zdarzenie submit_success; nie pokazuje sukcesu przy braku potwierdzenia.
## 4. Kontrola przed publikacją
- Zapisz stronę, wyczyść cache WordPress/Elementor/CDN, otwórz stronę jako niezalogowany użytkownik.
- Sprawdź pięć pakietów i oba przyciski. W Abonamencie sprawdź 69 zł/mies. oraz 590 zł/rok, walidację szablonu i równe raty. W Start sprawdź wybór szablonu; w pozostałych pakietach zaliczkę.
- Dodaj szablon w Templates Manager; sprawdź, czy pojawia się w obu galeriach po odświeżeniu. Usuń/ukryj testowy szablon; nie powinien wracać. Sprawdź podgląd iframe i link w nowej karcie (serwer podglądu musi pozwalać na osadzanie).
- Wyślij test z prawdziwym adresem e-mail jako gość. Sprawdź wpis w Submissions oraz wiadomość w skrzynce, Reply-To i zgodność danych. Potwierdź działanie przy niedostępnej sieci i brak wielokrotnego wysłania jednym kliknięciem.
- Sprawdź telefon, tablet i desktop. Jeśli modal jest obcięty przez motyw/Elementor, usuń overflow:hidden i transform z nadrzędnych kontenerów.
- Ceny są wyceną orientacyjną obliczaną w przeglądarce, a nie autorytatywną kwotą transakcji; przed zawarciem umowy zweryfikuj dane na serwerze lub ręcznie.
## 5. Gdy coś nie działa
Sprawdź konsolę JS, endpoint REST w zakładce Network, status żądania formularza Elementor (admin-ajax.php), ustawienia Email i SMTP. W razie blokowania skryptów przez optymalizację wyłącz opóźnianie skryptu kalkulatora na tej stronie. Nie instaluj ponownie Templates Manager tylko dlatego, że katalog jest pusty; sprawdź publikację szablonów i API.
Dokumentacja Elementor: https://elementor.com/help/form-widget/ oraz https://elementor.com/help/form-widget-email-settings/.
## Status
Kod wdrożeniowy został przygotowany oddzielnie od zaakceptowanego demo na main. Nie przeprowadzono testu na rzeczywistym WordPressie ani rzeczywistej wysyłki e-mail — wymagają konfiguracji i testów na stronie użytkownika. Wtyczka Templates Manager jest osobnym, wcześniej przygotowanym ZIP-em, nie wchodzi w skład tej paczki.
