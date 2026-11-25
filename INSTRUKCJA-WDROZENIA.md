# Eniverse — wspólny kalkulator i wdrożenie Elementor + Contact Form 7 (25.11.2026)

## 1. FTP
Zrób kopię strony i wdrażaj na kopii roboczej. W katalogu instalacji WordPress (tam, gdzie wp-config.php) utwórz folder wp-content/uploads/eniverse-kalkulator/Strony internetowe/. Wgraj do niego cztery pliki: pakiety-stron.css, kalkulator.css, cennik.js i kalkulator.js. Sprawdź, czy wszystkie cztery adresy HTTPS otwierają właściwe pliki, nie stronę błędu. Folder FTP ma dosłowną nazwę „Strony internetowe” (ze spacją). W adresach URL używamy Strony%20internetowe. Jeśli WordPress jest w podkatalogu albo uploads ma inny URL, zmień wszystkie cztery adresy w produkcyjnym HTML. Nie zmieniaj nazwy folderu w FTP na Strony%20internetowe. Nie instaluj paczki jako wtyczki. Pliki statyczne nie zawierają haseł.

## 2. Elementor
Otwórz stronę z ofertą stron WWW. Dodaj jeden widżet HTML w kontenerze o pełnej szerokości. Skopiuj CAŁĄ zawartość gotowego pliku produkcyjnego index.html z paczki wdrożeniowej (w gałęzi main odpowiada mu index-production.html). Ma już data-mode="production" oraz cztery gotowe adresy /wp-content/uploads/eniverse-kalkulator/Strony%20internetowe/ z wersją ?v=. Nie musisz edytować HTML przy instalacji WordPress w katalogu głównym. Nie zmieniaj odnośnika do Google Fonts. Kolejność skryptów: najpierw cennik.js, potem kalkulator.js. Usuń stare karty, by uniknąć duplikatów. Wklej kod tylko raz. Nie wgrywaj index.html jako zastępstwa plików WordPress. W paczce produkcyjnej nie ma katalogu demos/; szablony ZIP dodawaj wyłącznie przez Templates Manager. Jeśli motyw nie dostarcza DM Sans, ustaw ten font w Elementorze. Przy aktualizacji plików zwiększ wersję ?v= we wszystkich czterech adresach i wyczyść cache.

## 3. Contact Form 7
Nie potrzebujesz formularza Elementor Pro. Obecny formularz kontaktowy Eniverse na stronie głównej pozostaw bez zmian. Zalecamy utworzenie jego kopii w Kontakt > Formularze kontaktowe, nazwanej Eniverse – kalkulator stron WWW. Kopia korzysta z tych samych ustawień odbiorcy, nadawcy i SMTP. W zakładce Formularz zastąp pola treścią CF7-formularz.txt. W zakładce Mail skonfiguruj temat, Reply-To i treść według CF7-mail.txt; pola Do i Od przepisz z obecnego działającego formularza. Sprawdź zakładkę Mail (2), jeżeli jest aktywna: dostosuj tagi lub wyłącz automatyczną odpowiedź. Nie kopiuj dodatkowych obowiązkowych pól, których kalkulator nie obsługuje. Zachowaj kompatybilne zabezpieczenia antyspamowe CF7. Jeśli potrzebujesz obowiązkowej akceptacji, należy rozbudować widoczny formularz i walidację serwerową zamiast ukrywać zgodę. Dodaj obok kalkulatora odnośnik do polityki prywatności.

W Elementorze na TEJ SAMEJ stronie dodaj osobny widżet Shortcode (poza widżetem HTML kalkulatora). Wklej shortcode skopiowany z listy nowego formularza CF7. W Zaawansowane > CSS ID tego widżetu wpisz eniverse-quote-form (bez #). CSS ukrywa techniczny formularz na stronie publicznej. Nie ukrywaj go przez opcję warunkowego renderowania i nie umieszczaj w osobnym popupie. Formularz musi istnieć w DOM, mieć włączony JS/AJAX CF7 i nie być zagnieżdżony w innym formularzu.

Kalkulator przekazuje client_name, client_email, client_phone, has_site, existing_site_url, package_name i quote_summary do tego formularza i wywołuje jego standardowe submit. CF7 przeprowadza walidację, kontrolę spamu i wysyłkę z ustawieniami Mail. Sukces wyświetlany jest po potwierdzeniu mail_sent; nie jest to gwarancja dostarczenia do skrzynki. Brak potwierdzenia/błąd wyświetla komunikat. Wyceny są orientacyjne i liczone po stronie klienta; przed przyjęciem zamówienia należy je zweryfikować.

## 4. Templates Manager
Pozostaw aktywną dotychczasową wtyczkę Eniverse Templates Manager. Dodaj/opublikuj szablony w jej panelu. Kalkulator pobiera wspólną bibliotekę Abonament/Start z /wp-json/eniverse/v1/templates. Jeśli endpoint jest inny, zmień data-templates-api w produkcyjnym HTML. Zmiana katalogu CSS/JS nie zmienia endpointu API. Oczekiwany format: tablica lub obiekt templates z id w postaci wp-123, name, type, details, thumbnail_url i preview_url. Pusty katalog pozostaje pusty. Podgląd jest osadzony w iframe (sandbox allow-scripts); gdy polityka serwera nie zezwala na osadzenie, użyj linku w nowej karcie. Oryginalne ZIP-y dodajesz przez wtyczkę, nie przez FTP do folderu kalkulatora.

## 5. Testy przed publikacją
- Sprawdź jako niezalogowany użytkownik: pięć kart, oba CTA, podgląd galerii, wybór szablonu, raty miesięczne i roczne oraz podsumowanie.
- Dodaj i ukryj testowy szablon we wtyczce, odśwież stronę.
- Wyślij jedno testowe zgłoszenie z kalkulatora. Sprawdź komunikat sukcesu CF7, skrzynkę odbiorczą, Reply-To i pełną wycenę. Następnie sprawdź zwykły formularz na stronie głównej.
- Sprawdź walidację brakujących danych, błąd wysyłki, telefon/tablet/desktop. W razie błędu sprawdź konsolę oraz Network (wp-json/contact-form-7/v1/contact-forms/.../feedback). Nie wyłączaj antyspamu tylko po to, żeby wymusić wysyłkę.
- Jeżeli optymalizator opóźnia JS, wyklucz cennik.js, kalkulator.js i skrypty CF7 z opóźniania. Jeżeli motyw obcina modal, sprawdź overflow i transform nadrzędnych kontenerów.
- Skonfiguruj i przetestuj SMTP, jeśli poczta nie dociera.

## 6. Cofnięcie zmian
Usuń nowy widżet HTML i techniczny widżet Shortcode, przywróć poprzednie karty. Usuń statyczne pliki tylko po upewnieniu się, że żadna strona z nich nie korzysta. Nie zmieniaj istniejącego formularza strony głównej.

## 7. Podgląd i edycja cen
Gałąź main jest jedynym źródłem rozwoju. Jej index.html uruchamia podgląd lokalnie lub przez serwer statyczny (zalecane); index-production.html to wariant gotowy do Elementora. Gałąź production-strony-internetowe jest wyłącznie migawką wydania, bez demos/, z produkcyjnym index.html. Domyślny tryb demo na main korzysta z siedmiu lokalnych podglądów i nie wysyła e-maila. Tryb production korzysta wyłącznie z opublikowanych szablonów WordPress i wysyła formularz przez CF7. W trybie demo opublikowane szablony mogą uzupełnić bibliotekę lokalną. Katalog demos/ nie jest wymagany na WordPressie. Ceny, nazwy i pozycje edytuj w cennik.js. Zobacz sekcję 8. pakiety-stron.css zawiera style poza kalkulatorem; kalkulator.css zawiera style #eni-calc. Dynamiczne zmienne CSS mierzone przez JS wyrównują wysokości kart.

## 8. Centrum zarządzania ofertą — cennik.js
- Zmień pole nazwa, aby zmienić etykietę pozycji; cena to kwota netto. Nie zmieniaj id podczas zmiany nazwy.
- Dodaj obiekt do dodatki (np. {"id":"chat","nazwa":"Czat na stronie","cena":150}) lub marketing (opcjonalny opis). Usuń cały obiekt, aby zniknął.
- Pole wPakietach w dodatku określa, w których pakietach jest w cenie, np. ["wiz","firm"].
- Warianty seo, kontakt i szkolenia: dodawaj i usuwaj obiekty; uporządkuj ceny rosnąco. Pakiet wskazuje bazę przez id w polach seo, kontakt, szkolenie. Jeśli usuniesz wariant bazowy, pakiet wybierze najniższy bezpłatny wariant (lub wewnętrzny wariant braku usługi); sprawdź zakres przed publikacją.
- Pakiety: skopiuj kompletny obiekt pakietu jednorazowego i zmień id, nazwa, cena, zakres i karta. Usuń cały obiekt, aby ukryć kartę. Id mini jest zarezerwowane dla specjalnego abonamentu; jego ceny miesięczna, promocyjna roczna i regularna roczna są w platnosc. Pole galeria steruje wyborem szablonu, wyrozniony — wyróżnieniem karty.
- UslugiRoczne: dodaj lub usuń obiekt. hosting i care zachowują specjalne reguły pakietów; inne pozycje są płatne rocznie, w abonamencie rozłożone wg jego trybu płatności.
- Rozbudowa: istnieją cztery mechanizmy z własnymi kontrolkami; zmieniaj ich nazwy i ceny lub usuwaj klucze, aby je ukryć. Nowe rodzaje zwykłych opcji dodawaj do dodatki, nie jako nowe klucze rozbudowa.
- Usuń stare ręcznie tworzone karty Elementora — karty generowane z cennik.js są źródłem oferty. Zmiana cennika nie zmienia statycznych tekstów umownych, opisów marketingowych ani nazw kroków. W specjalnej karcie Abonament część opisów i warunków pozostaje stała. Usunięcie pozycji hosting/care usuwa opcję z konfiguratora, ale nie zmienia automatycznie zapisów umownych świadczeń zawartych w pakietach. Przed publikacją sprawdź zgodność zakresu i opisów.
- Po każdej zmianie sprawdź karty, konfigurator, podsumowanie i treść wyceny. Nie wgrywaj niezweryfikowanego cennika na produkcję.

## 9. Ustawienia rozliczeń (na końcu cennik.js)
- okresAbonamentu: liczba miesięcy (1–120). Aktualizuje okres umowy, liczbę rat i sumy. Przy płatności rocznej promocja obowiązuje przez pierwsze maks. 12 miesięcy; kolejne lata według ceny regularnej. Niepełny rok wyceniany proporcjonalnie. Dodatki jednorazowe rozłożone na okres umowy, usługi roczne proporcjonalnie do liczby miesięcy.
- zaliczkaProcent: procent wartości projektu i dodatków (0–100). Usługi roczne płatne w całości na start. Pozostała płatność to dopełnienie do 100%.
- zaokraglanieRat: true — miesięczne raty w pełnych złotych, false — raty do grosza (ostatnia wyrównuje sumę).
- progZaokraglania: ułamek złotego 0–1, do dwóch miejsc po kropce. Przy 0.50 dokładnie 50 gr zaokrąglamy w dół, powyżej w górę. Przy wyłączonym zaokrąglaniu próg nie działa.
- Zmiana okresu wymaga sprawdzenia zgodności z umową i ofertą. Płatności roczne nie są zaokrąglane do pełnych złotych.

## Status i ograniczenia
Połączono najnowsze pliki main z obsługą CF7 z gałęzi wdrożeniowej. Nie znamy prywatnych ustawień CF7 ani SMTP; rzeczywista wysyłka wymaga testu na WordPressie. Szablony demo są zachowane bez zmian jako osobne samodzielne dokumenty. Wtyczka Templates Manager jest osobnym produktem.
Dokumentacja zdarzeń CF7: https://contactform7.com/dom-events/
