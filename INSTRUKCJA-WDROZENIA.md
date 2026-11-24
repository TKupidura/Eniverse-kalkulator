# Eniverse — wdrożenie Elementor + Contact Form 7 (24.11.2026)

## 1. FTP
Zrób kopię strony i wdrażaj na kopii roboczej. W katalogu instalacji WordPress (tam, gdzie wp-config.php) utwórz folder wp-content/uploads/eniverse-kalkulator/. Wgraj do niego tylko kalkulator.css i kalkulator.js. Sprawdź, czy oba adresy HTTPS otwierają właściwe pliki, nie stronę błędu. Jeśli WordPress jest w podkatalogu albo uploads ma inny URL, zmień oba adresy w index.html. Nie instaluj paczki jako wtyczki. Pliki statyczne nie zawierają haseł.

## 2. Elementor
Otwórz stronę z ofertą stron WWW. Dodaj jeden widżet HTML w kontenerze o pełnej szerokości. Skopiuj CAŁĄ zawartość index.html, łącznie z linkiem do CSS i znacznikiem script. Usuń stare karty, by uniknąć duplikatów. Wklej kod tylko raz. Nie wgrywaj index.html jako zastępstwa plików WordPress. Jeśli motyw nie dostarcza DM Sans, ustaw ten font w Elementorze. Przy aktualizacji plików zwiększ wersję ?v= w obu adresach i wyczyść cache.

## 3. Contact Form 7
Nie potrzebujesz formularza Elementor Pro. Obecny formularz kontaktowy Eniverse na stronie głównej pozostaw bez zmian. Zalecamy utworzenie jego kopii w Kontakt > Formularze kontaktowe, nazwanej Eniverse – kalkulator stron WWW. Kopia korzysta z tych samych ustawień odbiorcy, nadawcy i SMTP. W zakładce Formularz zastąp pola treścią CF7-formularz.txt. W zakładce Mail skonfiguruj temat, Reply-To i treść według CF7-mail.txt; pola Do i Od przepisz z obecnego działającego formularza. Sprawdź zakładkę Mail (2), jeżeli jest aktywna: dostosuj tagi lub wyłącz automatyczną odpowiedź. Nie kopiuj dodatkowych obowiązkowych pól, których kalkulator nie obsługuje. Zachowaj kompatybilne zabezpieczenia antyspamowe CF7. Jeśli potrzebujesz obowiązkowej akceptacji, należy rozbudować widoczny formularz i walidację serwerową zamiast ukrywać zgodę. Dodaj obok kalkulatora odnośnik do polityki prywatności.

W Elementorze na TEJ SAMEJ stronie dodaj osobny widżet Shortcode (poza widżetem HTML kalkulatora). Wklej shortcode skopiowany z listy nowego formularza CF7. W Zaawansowane > CSS ID tego widżetu wpisz eniverse-quote-form (bez #). CSS ukrywa techniczny formularz na stronie publicznej. Nie ukrywaj go przez opcję warunkowego renderowania i nie umieszczaj w osobnym popupie. Formularz musi istnieć w DOM, mieć włączony JS/AJAX CF7 i nie być zagnieżdżony w innym formularzu.

Kalkulator przekazuje client_name, client_email, client_phone, has_site, existing_site_url, package_name i quote_summary do tego formularza i wywołuje jego standardowe submit. CF7 przeprowadza walidację, kontrolę spamu i wysyłkę z ustawieniami Mail. Sukces wyświetlany jest po potwierdzeniu mail_sent; nie jest to gwarancja dostarczenia do skrzynki. Brak potwierdzenia/błąd wyświetla komunikat. Wyceny są orientacyjne i liczone po stronie klienta; przed przyjęciem zamówienia należy je zweryfikować.

## 4. Templates Manager
Pozostaw aktywną dotychczasową wtyczkę Eniverse Templates Manager. Dodaj/opublikuj szablony w jej panelu. Kalkulator pobiera wspólną bibliotekę Abonament/Start z /wp-json/eniverse/v1/templates. Jeśli endpoint jest inny, zmień data-templates-api w index.html. Oczekiwany format: tablica lub obiekt templates z id w postaci wp-123, name, type, details, thumbnail_url i preview_url. Pusty katalog pozostaje pusty. Podgląd jest osadzony w iframe (sandbox allow-scripts); gdy polityka serwera nie zezwala na osadzenie, użyj linku w nowej karcie. Oryginalne ZIP-y dodajesz przez wtyczkę, nie przez FTP do folderu kalkulatora.

## 5. Testy przed publikacją
- Sprawdź jako niezalogowany użytkownik: pięć kart, oba CTA, podgląd galerii, wybór szablonu, raty miesięczne i roczne oraz podsumowanie.
- Dodaj i ukryj testowy szablon we wtyczce, odśwież stronę.
- Wyślij jedno testowe zgłoszenie z kalkulatora. Sprawdź komunikat sukcesu CF7, skrzynkę odbiorczą, Reply-To i pełną wycenę. Następnie sprawdź zwykły formularz na stronie głównej.
- Sprawdź walidację brakujących danych, błąd wysyłki, telefon/tablet/desktop. W razie błędu sprawdź konsolę oraz Network (wp-json/contact-form-7/v1/contact-forms/.../feedback). Nie wyłączaj antyspamu tylko po to, żeby wymusić wysyłkę.
- Jeżeli optymalizator opóźnia JS, wyklucz kalkulator.js i skrypty CF7 z opóźniania. Jeżeli motyw obcina modal, sprawdź overflow i transform nadrzędnych kontenerów.
- Skonfiguruj i przetestuj SMTP, jeśli poczta nie dociera.

## 6. Cofnięcie zmian
Usuń nowy widżet HTML i techniczny widżet Shortcode, przywróć poprzednie karty. Usuń statyczne pliki tylko po upewnieniu się, że żadna strona z nich nie korzysta. Nie zmieniaj istniejącego formularza strony głównej.

## Status i ograniczenia
Rozdzielono HTML/CSS/JS, zweryfikowano składnię JS i przygotowano integrację CF7. Nie znamy ID istniejącego formularza ani jego prywatnych ustawień Mail i nie testowano rzeczywistej wysyłki na Twoim WordPressie. Wtyczka Templates Manager jest osobnym produktem, nie jest dołączona do paczki. Nie zmieniono głównej gałęzi demo.
Dokumentacja zdarzeń CF7: https://contactform7.com/dom-events/
