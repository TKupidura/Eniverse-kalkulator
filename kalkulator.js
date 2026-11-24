(() => {
        const root = document.getElementById("eni-calc");
        if (!root || root.dataset.eniInitialized) return;
        root.dataset.eniInitialized = "true";
        const q = (s) => root.querySelector(s),
          all = (s) => [...root.querySelectorAll(s)],
          money = (n) => new Intl.NumberFormat("pl-PL", {useGrouping:"always"}).format(n) + " zł";
        const sections5 = ["Hero", "O nas", "Oferta", "Opinie", "Kontakt"];
        const aboPricing = {monthly:69, annual:590, regularAnnual:790};
        const rights =
          "Prawa do indywidualnie wykonanych elementów — zgodnie z umową i licencjami";
        const packages = [
          {
            id: "mini",
            name: "Abonament",
            price: 69,
            recurring: true,
            structure: "Strona główna do 5 sekcji",
            chips: sections5,
            seo: 0,
            contact: 0,
            revisions: 0,
            hosting: "subscription",
            blog: false,
            gsc: false,
            days: 3,
            tech: "HTML / CSS",
            design: "Gotowy szablon z bazy Eniverse",
            content:
              "Klient dostarcza gotowe treści, dopasowane do wybranego szablonu.",
            panel: false,
            rights: "Korzystanie ze strony w ramach abonamentu",
            terms: "Umowa abonamentowa na 12 miesięcy",
            training: "Brak szkolenia",
            nav: false,
          },
          {
            id: "start",
            name: "Start",
            price: 1290,
            recurring: false,
            structure: "Strona główna do 5 sekcji",
            chips: sections5,
            seo: 0,
            contact: 0,
            revisions: 1,
            hosting: "optional",
            blog: false,
            gsc: false,
            days: 5,
            tech: "CMS — WordPress",
            design: "Gotowy szablon z bazy Eniverse (WordPress)",
            content:
              "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
            panel: true,
            rights:
              "Licencja na korzystanie ze strony, bez wyłączności do szablonu",
            terms: "Samodzielne zarządzanie stroną bez abonamentu za projekt",
            training: "Instrukcja PDF",
            nav: false,
          },
          {
            id: "one",
            name: "One Page",
            price: 1690,
            recurring: false,
            structure: "Strona główna do 5 sekcji",
            chips: sections5,
            seo: 1,
            contact: 1,
            revisions: 2,
            hosting: "optional",
            blog: false,
            gsc: false,
            days: 7,
            tech: "CMS — WordPress",
            design:
              "Dostosowanie układu sekcji i wyglądu strony do Twojej marki: zmiana kolejności sekcji, usunięcie lub drobne modyfikacje.",
            content:
              "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
            panel: true,
            rights,
            terms: "Jednorazowa opłata za wykonanie strony",
            training: "Szkolenie 30 min",
            nav: false,
          },
          {
            id: "wiz",
            name: "Wizytówka",
            price: 2490,
            recurring: false,
            structure: "Do 5 podstron",
            chips: [],
            seo: 2,
            contact: 1,
            revisions: 3,
            hosting: "optional",
            blog: false,
            gsc: true,
            days: 10,
            tech: "CMS — WordPress",
            design:
              "Personalizacja szablonu WordPress — dopasowanie kolorystyki, układu sekcji i prezentacji usług firmy.",
            content:
              "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
            panel: true,
            rights,
            terms: "Jednorazowa opłata za wykonanie strony",
            training: "Szkolenie 1 h",
            nav: false,
          },
          {
            id: "firm",
            name: "Firmowy",
            price: 3590,
            recurring: false,
            structure: "Do 10 podstron",
            chips: [],
            seo: 3,
            contact: 1,
            revisions: 3,
            hosting: "year",
            blog: true,
            gsc: true,
            days: 14,
            tech: "CMS — WordPress",
            design:
              "Rozszerzona personalizacja szablonu WordPress — dopasowanie struktury podstron, prezentacji usług i ścieżek kontaktu.",
            content:
              "Klient dostarcza treści, a my dopasowujemy je do projektu strony.",
            panel: true,
            rights,
            terms: "Jednorazowa opłata za wykonanie strony",
            training: "Szkolenie 2 h",
            nav: true,
          },
        ];
        const seo = [
          ["Bez dodatkowego SEO", "Brak SEO na start w bazie pakietu", 0],
          [
            "SEO techniczne na start",
            "Zakres do doprecyzowania w warunkach SEO",
            149,
          ],
          [
            "Podstawowe SEO na start",
            "Według warunków SEO; dalsze usługi wyceniane osobno",
            290,
          ],
          [
            "Rozszerzone SEO",
            "Według warunków SEO; dalsze usługi wyceniane osobno",
            490,
          ],
        ];
        // Wyświetlana nazwa SEO tylko w pakietach One Page i Wizytówka.
        // Ceny oraz zakres wariantów pozostają niezmienione.
        function seoName(p, index) {
          const name = seo[index][0];
          return (p.id === "one" || p.id === "wiz")
            ? name.replace(/ na start$/, "")
            : name;
        }
        const contacts = [
          ["Kontakt podstawowy", "Przyciski kontaktowe: telefon i e-mail", 0],
          ["Formularz kontaktowy", "Standardowy formularz kontaktowy", 90],
          [
            "Formularz kontaktowy rozszerzony",
            "Rozbudowane pola i opcje formularza",
            190,
          ],
        ];
        const hostingText = (p) =>
          p.hosting === "subscription"
            ? "Hosting na okres abonamentu"
            : p.hosting === "year"
              ? "Hosting i opieka techniczna w cenie na pierwszy rok"
              : "Hosting i opieka techniczna: usługi opcjonalne, płatne rocznie z góry";
        // Ceny dodatków: stawki robocze netto, do potwierdzenia przed wdrożeniem.
        const extraServices = [
          ["maps", "Mapy Google", 50, false],
          ["newsletter", "Newsletter", 300, false],
          ["social", "Integracja z social media", 50, false],
          ["analytics", "Google Analytics", 200, false],
          ["gsc", "Google Search Console", 90, true],
          ["blog", "Blog / Realizacje", 249, true],
          ["logoAi", "Logo stworzone przy pomocy AI", 190, false],
        ];
        // Stawki poglądowe: dodatki jednorazowe, bez cyklicznej obsługi reklam i SEO.
        const seoServices = [
          ["contentEdit", "Redakcja i optymalizacja treści", 290, "Optymalizacja istniejących tekstów"],
          ["contentSeo", "Stworzenie i optymalizacja treści pod SEO", 590, "Przygotowanie nowych tekstów pod SEO"],
          ["googleAds", "Kampania Google Ads", 490, "Uruchomienie kampanii · bez budżetu reklamowego"],
          ["seoPosition", "Pozycjonowanie SEO", 690, "Pakiet startowy · dalsza obsługa osobno"],
        ];
        const annualHosting = 600;
        const annualCare = 348;
        const languagePrice = 490;
        const languageChoices = [
          "Angielski","Niemiecki","Ukraiński","Francuski","Hiszpański",
          "Włoski","Czeski","Niderlandzki","Portugalski","Szwedzki",
          "Norweski","Rosyjski","Chiński","Arabski"
        ];
        const revisionText = (n) =>
          n === 0
            ? "Brak sesji poprawek"
            : n === 1
              ? "1 sesja poprawek w cenie"
              : n + " sesje poprawek w cenie";
        function fixed(p) {
          const a = [
            ["Strona dopasowana do urządzeń mobilnych", true],
            [p.tech, true],
            [p.design, true],
            [p.content, true],
            ["Panel administracyjny", p.panel],
            [
              p.panel
                ? "Samodzielna edycja tekstów i zdjęć"
                : "Brak edycji treści",
              p.panel,
            ],
            [p.rights, true],
            [
              p.days ? `Czas realizacji: do ${p.days} dni roboczych od otrzymania kompletu materiałów` : "Czas realizacji: do zatwierdzenia w wycenie",
              true,
            ],
            [p.terms, true],
            ...(p.recurring ? [[p.training, false]] : []),
          ];
          if (p.nav)
            a.push([
              "Zaplanowanie nawigacji i ścieżki kontaktu dopasowanej do celów firmy",
              true,
            ]);
          return a;
        }
        // Karty podglądowe nawiązujące do obecnej struktury .enp-card z Elementora.
        const cardContent = {
          mini: {
            kicker: "PROSTY START W INTERNECIE",
            description: "Dla osób, które chcą prostej strony bez dużej opłaty początkowej.",
            scale: "Strona w pakiecie Abonament · do 5 sekcji",
            scaleNote: "Gotowy szablon HTML i CSS.",
            benefits: ["Gotowy wygląd i wersja mobilna", "Hosting przez okres umowy", "Strona z Twoimi gotowymi materiałami"],
            icon: "page",
          },
          start: {
            kicker: "STRONA NA DOBRY POCZĄTEK",
            description: "Dla małej działalności, która potrzebuje strony WordPress do samodzielnej edycji.",
            scale: "Strona z szablonu · do 5 sekcji",
            scaleNote: "Np. Hero, O nas, Oferta, Opinie i Kontakt.",
            benefits: ["WordPress i edycja własnych treści", "Dopasowanie szablonu do marki", "Wprowadzenie dostarczonych treści", "Instrukcja obsługi PDF"],
            icon: "page",
          },
          one: { icon: "page" },
          wiz: { icon: "pages" },
          firm: { icon: "many" },
        };
        function cardRows(rows) {
          // Najpierw świadczenia w cenie, dopiero po nich wyłączenia oznaczone minusem.
          return [...rows].sort((a, b) => Number(a[1] === false) - Number(b[1] === false))
            .map((x) => `<li class="${x[1] === false ? "ec-off" : ""}"><span class="ec-tick" aria-hidden="true">${x[1] === false ? "−" : "✓"}</span><span>${x[0]}</span></li>`)
            .join("");
        }
        function projectIcon(p) {
          if (p.id === "firm" || p.id === "wiz") {
            // Diagram nie może sugerować liczby podstron ze starego cennika.
            const n = parseInt(p.structure.match(/\d+/)?.[0] || "0", 10);
            return `<div class="ec-project-tiles ${p.id === "wiz" ? "ec-project-tiles--single" : ""}" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i class="${i===0?'is-active':''}"></i>`).join('')}</div>`;
          }
          return `<div class="ec-project-page" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`;
        }
        function cardDetails(p) {
          // Rozwijany zakres zawiera TYLKO funkcje dostępne w danym pakiecie.
          // Nie pokazujemy nieobecnych funkcji ani ofert dopiero do dokupienia.
          const included = [
            ["Dostosowanie do urządzeń mobilnych", true],
            [p.tech, true],
            [p.design, true],
            [p.content, true],
            ["Panel administracyjny", p.panel],
            ["Samodzielna edycja tekstów i zdjęć", p.panel],
            [p.rights, true],
            [revisionText(p.revisions), p.revisions > 0],
            [hostingText(p), p.hosting !== "optional"],
            ["Moduł bloga lub realizacji", p.blog],
            ["Konfiguracja Google Search Console", p.gsc],
            [p.training, p.training !== "Brak szkolenia"],
            [p.days ? `Realizacja: do ${p.days} dni roboczych od kompletu materiałów` : "Czas realizacji: do zatwierdzenia w wycenie", true],
            [p.terms, true],
            ["Zaplanowanie nawigacji i ścieżek kontaktu", p.nav],
          ].filter(x => x[1]);
          return `<ul class="ec-details-list"${p.id==="mini" ? ' tabindex="0" aria-label="Rozwinięty zakres pakietu Abonament"' : ''}>${cardRows(included)}</ul>`;
        }
        function hasTemplateLibrary(p) { return !!p && (p.id === "mini" || p.id === "start"); }
        function renderCard(p) {
          const c = cardContent[p.id], featured = p.id === "wiz", starter = p.id === "mini", templateEnabled = hasTemplateLibrary(p);
          // Dla One Page / Wizytówka / Strona Firmowa widoczny zakres karty
          // odpowiada 1:1 liście z pierwotnego eniverse-cennik.html.
          const originalPlan = ["one", "wiz", "firm"].includes(p.id);
          const core = [
            [p.structure + (p.chips.length ? " (" + p.chips.join(", ") + ")" : ""), true],
            [p.tech, true],
            ["Dostosowanie do urządzeń mobilnych", true],
            [hostingText(p), p.hosting !== "optional"],
            [p.design, true],
            [seoName(p, p.seo), p.seo !== 0],
            [contacts[p.contact][0], true],
            [revisionText(p.revisions), p.revisions !== 0],
          ];
          const benefits = originalPlan
            ? cardRows(core)
            : c.benefits.map(benefit => `<li><span class="ec-tick" aria-hidden="true">✓</span><span>${benefit}</span></li>`).join("");
          const excluded = [];
          if (starter) excluded.push(["Panel administracyjny WordPress", false]);
          if (p.id === "start") excluded.push(["Szkolenie na żywo", false]);
          const kicker = originalPlan ? "OPŁATA JEDNORAZOWA" : c.kicker;
          const description = originalPlan ? p.content : c.description;
          const scale = originalPlan ? p.structure : c.scale;
          const scaleNote = originalPlan ? (p.chips.length ? p.chips.join(", ") : "") : c.scaleNote;
          const price = p.recurring
            ? `<div class="ec-mini-prices"><div class="ec-mini-price"><strong>${aboPricing.monthly}</strong><span>zł / mies.</span></div><span class="ec-mini-or">lub</span><div class="ec-mini-price ec-mini-price--annual"><div class="ec-annual-promo-line"><strong>${aboPricing.annual}</strong><del aria-label="Cena regularna ${aboPricing.regularAnnual} zł">${aboPricing.regularAnnual} zł</del></div><span>zł / rok <em class="ec-annual-promo-label">PROMOCJA</em></span></div></div>`
            : `<div class="ec-card-price"><small></small><strong>${money(p.price).replace(" zł", "")}</strong><span>zł</span></div>`;
          return `<article class="ec-package ${featured ? "ec-package--featured" : ""} ${starter ? "ec-package--abo" : ""}" data-ec-plan="${p.id}" aria-labelledby="ec-plan-${p.id}">
            ${featured ? '<div class="ec-featured-badge">Wyróżniony pakiet</div>' : ''}
            ${starter ? '<div class="ec-abo-intro">' : ''}
            <div class="ec-card-header"><span class="ec-kicker">${kicker}</span><h2 id="ec-plan-${p.id}">${p.name}</h2><p class="ec-card-description">${description}</p></div>
            <div class="ec-card-budget">${price}${p.recurring ? '<p class="ec-mini-saving">Oszczędzasz 238 zł rocznie w porównaniu z płatnościami miesięcznymi.</p><p class="ec-muted ec-mini-small">Cena promocyjna na cały 12-miesięczny okres umowy · hosting w cenie</p>' : '<p class="ec-muted">Jednorazowa opłata za wykonanie strony</p>'}</div>
            ${starter ? '</div><div class="ec-abo-details">' : ''}
            <div class="ec-project-scale">${projectIcon(p)}<h3>${scale}</h3><p>${scaleNote}</p>${templateEnabled ? `<button type="button" class="ec-template-launch ec-interactive" data-templates-open data-template-plan="${p.id}" aria-haspopup="dialog">${starter ? "Przejrzyj szablony pakietu Abonament" : "Przejrzyj szablony Start"} <span aria-hidden="true">↗</span></button>` : ''}</div>
            <div class="ec-features"><p class="ec-section-label">CO ZYSKUJESZ</p><ul>${benefits}${originalPlan ? "" : cardRows(excluded)}</ul>
              <details class="ec-card-details" name="ec-card-scope"><summary class="ec-interactive"><strong>Pełen zakres pakietu</strong></summary>${cardDetails(p)}</details>
            </div>
            ${starter ? '</div><div class="ec-abo-side">' : ''}
            <dl class="ec-card-meta"><div><dt><span class="ec-meta-icon" aria-hidden="true">▢</span><span class="ec-dotted">Czas realizacji</span></dt><dd>${p.days ? `Do ${p.days} dni roboczych` : "Do zatwierdzenia"}</dd></div><div><dt><span class="ec-meta-icon" aria-hidden="true">♢</span><span class="ec-dotted">Rundy poprawek</span></dt><dd>${p.revisions ? p.revisions + " w cenie" : "Brak w cenie"}</dd></div>${p.recurring ? '<div><dt><span class="ec-meta-icon" aria-hidden="true">◷</span><span class="ec-dotted">Abonament</span></dt><dd>12 miesięcy</dd></div>' : ''}</dl>
            <div class="ec-card-actions"><button type="button" class="ec-action ec-choose ec-interactive" data-choose="${p.id}"><span>${p.id === "firm" ? "Wybieram Firmowy" : "Wybieram " + (p.id === "wiz" ? "Wizytówkę" : p.name)}</span><span aria-hidden="true">↗</span></button>
            <button type="button" class="ec-action ec-secondary ec-interactive ec-configure" data-configure="${p.id}">Skonfiguruj pakiet</button></div>
            ${starter ? '</div>' : ''}
          </article>`;
        }
        q("#ec-entry-packages").innerHTML = packages.filter(p => p.id==="mini").map(renderCard).join("");
        q("#ec-packages").innerHTML = packages.filter(p => ["start","one","wiz","firm"].includes(p.id)).map(renderCard).join("");
        
        // Poglądowe makiety: docelowe miniatury i projekty można podmienić tutaj.
        // Siedem projektów demonstracyjnych z ZIP-ów użytkownika. Grafiki są osadzone lokalnie
        // w kodzie kalkulatora, więc galeria działa również bez WordPress API.
        const bundledTemplateSamples = [];
        let templateSamples = [...bundledTemplateSamples];
        // Teksty wszystkich pięciu sekcji są przykładowe i można je podmienić
        // na gotowe szablony bez zmiany mechanizmu galerii oraz konfiguratora.
        const templateDetails = {
          foto: {
            eyebrow:"Fotografia z emocjami",aboutTitle:"Wasza historia. Moje spojrzenie.",
            about:"Każda sesja to inne emocje i historia. Tworzę fotografie bez sztucznych póz, z uwagą na gesty, relacje i prawdziwe chwile.",
            cards:[["Portrety","Naturalne zdjęcia w Twoim stylu."],["Sesje rodzinne","Wspólne momenty, które warto zachować."],["Reportaże","Autentyczna historia ważnego dnia."]],
            proofTitle:"Kadry, do których się wraca.",proof:"„Atmosfera sesji była swobodna, a zdjęcia dokładnie takie, jak marzyliśmy.”",
            contactTitle:"Opowiedz mi o swoim pomyśle.",contact:"Napisz, jaką sesję planujesz. Razem stworzymy coś osobistego."
          },
          food: {
            eyebrow:"Nasza restauracja",aboutTitle:"Smak zaczyna się od pasji.",
            about:"Gotujemy z sezonowych składników i w dobrym towarzystwie. Nasze menu łączy proste receptury z nieoczywistymi pomysłami.",
            cards:[["Przystawki","Mały początek wielkich smaków."],["Dania główne","Sezonowa kuchnia pełna charakteru."],["Desery","Słodkie zakończenie spotkania."]],
            proofTitle:"Miejsce na dobre spotkania.",proof:"„Pyszne jedzenie, świetna atmosfera. Wracamy przy każdej okazji!”",
            contactTitle:"Zarezerwuj miejsce przy stole.",contact:"Zapraszamy na lunch, kolację i wspólne świętowanie."
          },
          beauty: {
            eyebrow:"Poznaj nasz salon",aboutTitle:"Pielęgnacja z uważnością.",
            about:"Tworzymy przestrzeń, w której można zwolnić i zatroszczyć się o siebie. Łączymy sprawdzone zabiegi z indywidualnym podejściem.",
            cards:[["Pielęgnacja twarzy","Naturalny blask i odnowa."],["Stylizacja","Detale, które robią różnicę."],["Rytuały relaksu","Chwila tylko dla Ciebie."]],
            proofTitle:"Twoje dobre samopoczucie.",proof:"„Przepiękne miejsce i cudowna atmosfera. Wrócę na pewno!”",
            contactTitle:"Znajdź chwilę dla siebie.",contact:"Zadzwoń lub napisz i wybierz dogodny termin wizyty."
          },
          trade: {
            eyebrow:"Poznaj Voltix",aboutTitle:"Solidność w każdym połączeniu.",
            about:"Zapewniamy wsparcie przy instalacjach, modernizacjach i awariach. Stawiamy na jasne zasady, porządną pracę i terminowość.",
            cards:[["Instalacje","Nowe i modernizowane instalacje elektryczne."],["Naprawy","Sprawna diagnostyka i usuwanie usterek."],["Pomiary","Kontrole i niezbędna dokumentacja."]],
            proofTitle:"Fachowo, terminowo, bez niespodzianek.",proof:"„Kontakt był szybki, wszystko wykonane starannie. Polecam!”",
            contactTitle:"Potrzebujesz elektryka?",contact:"Opisz zlecenie i zostaw numer telefonu. Oddzwonimy."
          }
        };
        function escapeTemplateText(value) {
          return String(value==null?"":value).replace(/[&<>"']/g,ch=>({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
          })[ch]);
        }
        function templateHttpsUrl(value) {
          if(typeof value!=="string"||!value)return "";
          try {
            const url=new URL(value,window.location.origin);
            return url.protocol==="https:"&&!url.username&&!url.password?url.href:"";
          } catch {return "";}
        }
        function templateScene(t, full = false) {
          if(t.isBundled) {
            // Galeria pokazuje pełne demo ZIP z zasobami wbudowanymi w stronę.
            if(!full) return '<img class="ec-template-real-thumbnail" src="'+t.image+'" alt="Miniatura szablonu '+escapeTemplateText(t.name)+'">';
            const src=escapeTemplateText(t.previewPath||"");
            return '<div class="ec-template-real-preview ec-template-bundled-preview">'+
              '<div class="ec-template-real-intro"><strong>'+escapeTemplateText(t.name)+'</strong><span>'+escapeTemplateText(t.type)+'</span></div>'+
              '<iframe class="ec-template-bundled-frame" src="'+src+'" title="Interaktywny podgląd strony '+escapeTemplateText(t.name)+'" loading="lazy" sandbox="allow-scripts allow-forms allow-popups" referrerpolicy="no-referrer"></iframe>'+
              '<a class="ec-template-real-open" href="'+src+'" target="_blank" rel="noopener noreferrer">Otwórz pełną stronę demo w nowej karcie ↗</a>'+
              '</div>';
          }
          if(t.isRemote) {
            const image=templateHttpsUrl(t.thumbnail_url);
            const preview=templateHttpsUrl(t.preview_url);
            if(!full) return image
              ? '<img class="ec-template-real-thumbnail" loading="lazy" src="'+escapeTemplateText(image)+'" alt="Podgląd '+escapeTemplateText(t.name)+'">'
              : '<span class="ec-template-real-placeholder">'+escapeTemplateText(t.name)+'</span>';
            return '<div class="ec-template-real-preview ec-template-bundled-preview">'+
              '<div class="ec-template-real-intro"><strong>'+escapeTemplateText(t.name)+'</strong><span>'+escapeTemplateText(t.type)+'</span></div>'+
              (preview?'<iframe class="ec-template-bundled-frame" src="'+escapeTemplateText(preview)+'" title="Podgląd strony '+escapeTemplateText(t.name)+'" loading="lazy" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe>':image?'<img class="ec-template-real-image" src="'+escapeTemplateText(image)+'" alt="Miniatura szablonu '+escapeTemplateText(t.name)+'">':'<p>Brak podglądu.</p>')+
              (preview?'<a class="ec-template-real-open" href="'+escapeTemplateText(preview)+'" target="_blank" rel="noopener noreferrer">Otwórz pełny podgląd strony ↗</a>':'<p>Pełny podgląd strony nie został jeszcze opublikowany.</p>')+
              '</div>';
          }
          const d=templateDetails[t.id];
          const hero='<section class="ec-template-scene ec-template-scene--'+t.id+(full?' ec-template-scene--full':'')+'">' +
            '<div class="ec-template-site-nav"><strong>'+t.brand+'</strong><span>O nas &nbsp; Oferta &nbsp; Kontakt</span></div>' +
            '<div class="ec-template-hero"><div class="ec-template-copy"><small>'+t.type+'</small><div class="ec-template-headline">'+t.headline+'</div><p>'+t.sub+'</p><span class="ec-template-cta">'+t.cta+' &nbsp;↗</span></div>' +
            '<div class="ec-template-art" aria-hidden="true"><span></span><i></i></div></div>' +
            '<div class="ec-template-site-footer"><span>'+t.footer+'</span><span>01 / 05</span></div></section>';
          if (!full) return hero;
          const services=d.cards.map((card,i)=>'<article class="ec-template-demo-card"><span>0'+(i+1)+'</span><div class="ec-template-demo-card-art" aria-hidden="true"></div><h4>'+card[0]+'</h4><p>'+card[1]+'</p></article>').join('');
          return '<div class="ec-template-fullpage ec-template-scene--'+t.id+'">' + hero +
            '<section class="ec-template-demo-section ec-template-demo-about"><div class="ec-template-demo-index">02 / O NAS</div><div class="ec-template-demo-about-grid"><div><small>'+d.eyebrow+'</small><h2>'+d.aboutTitle+'</h2><p>'+d.about+'</p></div><div class="ec-template-demo-image" aria-hidden="true"><span></span></div></div></section>' +
            '<section class="ec-template-demo-section ec-template-demo-offer"><div class="ec-template-demo-index">03 / OFERTA</div><h2>Co możemy dla Ciebie zrobić?</h2><div class="ec-template-demo-cards">'+services+'</div></section>' +
            '<section class="ec-template-demo-section ec-template-demo-proof"><div class="ec-template-demo-index">04 / OPINIE</div><h2>'+d.proofTitle+'</h2><blockquote>'+d.proof+'</blockquote><div class="ec-template-demo-stars" aria-hidden="true">★★★★★</div></section>' +
            '<section class="ec-template-demo-section ec-template-demo-contact"><div class="ec-template-demo-index">05 / KONTAKT</div><h2>'+d.contactTitle+'</h2><p>'+d.contact+'</p><span class="ec-template-demo-contact-button">'+t.cta+' &nbsp;↗</span><div class="ec-template-demo-contact-end">'+t.brand+' <span>Przykładowy szablon / Eniverse</span></div></section>' +
            '</div>';
        }
        function templateSelectionName(id) {
          if(id==="later")return "Szablon wybiorę później";
          const found=templateSamples.find(t=>t.id===id);
          return found ? found.name+" — "+found.type : "Jeszcze nie wybrano";
        }
        let visibleTemplateIndex=0;
        function renderTemplateSelection() {
          const section=q("#ec-template-section");
          if(!section)return;
          section.hidden=!hasTemplateLibrary(current);
          q("#ec-template-options").setAttribute("aria-label","Wybór szablonu pakietu "+current.name);
          if(section.hidden)return;
          const selected=states[current.id].templateId||"";
          q("#ec-template-options").innerHTML =
            (templateSamples.length?"":'<p class="ec-template-unavailable">Aktualnie brak opublikowanych szablonów. Możesz zaznaczyć „Szablon wybiorę później”.</p>')+
            templateSamples.map(t=>
              '<div class="ec-template-select-card">' +
                '<label class="ec-template-select-option"><input type="radio" name="ec-template-choice" value="'+t.id+'" '+(selected===t.id?'checked ':'')+'>' +
                '<span class="ec-template-select-dot ec-template-select-dot--'+t.id+'" aria-hidden="true">'+(t.isBundled?'<img src="'+t.image+'" alt="">':t.isRemote&&templateHttpsUrl(t.thumbnail_url)?'<img src="'+escapeTemplateText(templateHttpsUrl(t.thumbnail_url))+'" alt="">':'')+'</span>'+
                '<span class="ec-template-tile-text"><strong>'+escapeTemplateText(t.name)+'</strong><small>'+escapeTemplateText(t.type)+'</small>'+
                '<span class="ec-template-select-description">'+escapeTemplateText(t.details)+'</span></span></label>' +
                '<button class="ec-template-preview-action" type="button" data-template-preview="'+t.id+'" aria-label="Zobacz podgląd szablonu '+escapeTemplateText(t.name)+'">Zobacz podgląd</button>' +
              '</div>'
            ).join('') +
            '<label class="ec-template-select-option ec-template-select-empty ec-template-select-later">' +
              '<input type="radio" name="ec-template-choice" value="later" '+(selected==="later"?'checked ':'')+'>' +
              '<span><strong>Szablon wybiorę później</strong><small>Wybierz tę opcję świadomie, jeśli decyzję podejmiesz później. Formularz zostanie odblokowany.</small></span></label>';
          q("#ec-template-selected").textContent=selected
            ? (selected==="later" ? "Wybrano: szablon wybiorę później." : "Wybrany szablon: "+templateSelectionName(selected))
            : "Nie wskazano jeszcze szablonu ani opcji wyboru później.";
        }
        let templateOpener=null, templatePreviousScroll="", templateDialogPlanId="mini";
        function showTemplate(index) {
          const t=templateSamples[index];
          if(!t){
            visibleTemplateIndex=-1;
            q("#ec-template-viewport").innerHTML='<p class="ec-template-unavailable">Aktualnie brak opublikowanych szablonów. Wybierz opcję „Szablon wybiorę później”.</p>';
            q("#ec-template-kind").textContent="";
            q("#ec-template-name").textContent="Katalog szablonów";
            q("#ec-template-description").textContent="";
            q("#ec-template-configure").hidden=true;
            return;
          }
          q("#ec-template-configure").hidden=false;
          visibleTemplateIndex=index;
          q("#ec-template-viewport").innerHTML=templateScene(t,true);
          q("#ec-template-viewport").scrollTop=0;
          q("#ec-template-kind").textContent=t.type;
          q("#ec-template-name").textContent=t.name;
          q("#ec-template-description").textContent=t.details;
          
          all("#ec-template-gallery .ec-template-choice").forEach((button,i)=>{
            button.classList.toggle("is-active",i===index);
            button.setAttribute("aria-pressed",String(i===index));
          });
        }
        function renderTemplateGallery() {
          const live=templateSamples.some(t=>t.isRemote);
          const bundled=templateSamples.some(t=>t.isBundled);
          q("#ec-template-gallery").innerHTML=templateSamples.map((t,i)=>
            '<button type="button" class="ec-template-choice" data-template-index="'+i+'" aria-pressed="'+(i===0)+'"><span class="ec-template-thumb">'+templateScene(t)+'</span><span class="ec-template-choice-label"><strong>'+escapeTemplateText(t.name)+'</strong><small>'+escapeTemplateText(t.type)+'</small></span></button>'
          ).join("");
          // Oznaczenie podglądu ustawiane osobno przez showTemplate().
          q("#ec-template-modal .ec-template-browser-bar span:last-child").textContent=live
            ?"Pełny podgląd strony · przewiń w dół"
            :bundled?"Pełna strona demo w osadzonym oknie · przewiń w dół":"Podgląd demonstracyjny";
          q("#ec-template-modal .ec-template-footer > span").textContent=live
            ?"Wybierz projekt dopasowany do swojej firmy."
            :bundled?"Katalog testowy — 7 szablonów z ZIP.": "Wizualizacje poglądowe.";
          showTemplate(0);
        }
        renderTemplateGallery();
        // Publiczny katalog WordPress: bez tokenów i adresów archiwów ZIP.
        // Niedostępne / puste API -> lokalna biblioteka 7 podglądów ZIP.
        async function loadWordPressTemplates() {
          const apiUrl=window.ENIVERSE_TEMPLATES_API ||
            q("#eni-calc").dataset.templatesApi || "/wp-json/eniverse/v1/templates";
          if(!templateHttpsUrl(apiUrl))return;
          const controller=new AbortController();
          const timeout=setTimeout(()=>controller.abort(),6000);
          try {
            const response=await fetch(apiUrl,{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",signal:controller.signal});
            if(!response.ok)throw new Error("API WordPress HTTP "+response.status);
            const payload=await response.json();
            const data=Array.isArray(payload)?payload:payload?.templates;
            if(!Array.isArray(data))throw new Error("Niepoprawny format API szablonów");
            const next=data.slice(0,100)
              .filter(t=>t&&typeof t.id==="string"&&/^wp-\d+$/.test(t.id)&&typeof t.name==="string"&&t.name.trim())
              .map(t=>({
                id:t.id,
                name:t.name.trim().slice(0,120),
                type:String(t.type||"Strona internetowa").slice(0,100),
                details:String(t.details||"Szablon z biblioteki Eniverse.").slice(0,500),
                thumbnail_url:templateHttpsUrl(t.thumbnail_url),
                preview_url:templateHttpsUrl(t.preview_url),
                isRemote:true
              }));
            // Publikacja szablonu z WordPress zastępuje jego lokalną wersję demo.
            templateSamples=next;
            ["mini","start"].forEach(planId=>{
              const selected=states[planId].templateId;
              if(selected&&selected!=="later"&&!templateSamples.some(t=>t.id===selected))
                states[planId].templateId="";
            });
            renderTemplateGallery();
            if(hasTemplateLibrary(current)&&!q("#ec-modal-stage").hidden){
              renderTemplateSelection();
              if(!q("#ec-final").hidden)summary(directSummaryMode);
            }
          } catch(error) {
            console.warn("Eniverse: nie udało się pobrać szablonów z WordPress.",error);
          } finally {clearTimeout(timeout);}
        }
        loadWordPressTemplates();
        function openTemplateDialog(button) {
          templateOpener=button||null;
          const requestedPlan=!q("#ec-modal-stage").hidden
            ? current.id
            : (button?.dataset.templatePlan || button?.closest("[data-ec-plan]")?.dataset.ecPlan || current.id);
          templateDialogPlanId=requestedPlan==="start"?"start":"mini";
          templatePreviousScroll=document.body.style.overflow;
          document.body.style.overflow="hidden";
          q("#ec-template-modal").hidden=false;
          const selectedId=states[templateDialogPlanId].templateId;
          const selectedIndex=templateSamples.findIndex(t=>t.id===selectedId);
          showTemplate(selectedIndex>=0?selectedIndex:visibleTemplateIndex);
          q("#ec-template-defer").classList.toggle("is-selected",selectedId==="later");
          q("#ec-template-defer").setAttribute("aria-pressed",String(selectedId==="later"));
          q("#ec-template-configure").textContent=
            (!q("#ec-modal-stage").hidden && !q("#ec-final").hidden)
              ? "Wybierz ten szablon i wróć do podsumowania ↗"
              : "Wybierz ten szablon i konfiguruj ↗";
          q("#ec-template-close").focus();
        }
        function closeTemplateDialog() {
          q("#ec-template-modal").hidden=true;
          document.body.style.overflow=templatePreviousScroll;
          templateOpener?.focus();
        }
        q("#ec-template-gallery").addEventListener("click",event=>{
          const button=event.target.closest("[data-template-index]");
          if(button)showTemplate(+button.dataset.templateIndex);
        });
        q("#ec-template-close").addEventListener("click",closeTemplateDialog);
        q("#ec-template-modal").addEventListener("click",event=>{
          if(event.target===q("#ec-template-modal"))closeTemplateDialog();
        });
        function confirmTemplateChoice(id) {
          // "" oznacza brak decyzji; "later" jej świadome odłożenie.
          states[templateDialogPlanId].templateId=id;
          const wizardVisible=!q("#ec-modal-stage").hidden;
          const originalOpener=templateOpener;
          closeTemplateDialog();
          if(wizardVisible && current.id===templateDialogPlanId){
            renderTemplateSelection();
            update();
            if(!q("#ec-final").hidden){
              summary(directSummaryMode);
              q("#ec-summary").scrollTop=0;
            }else{
              q("#ec-template-options input:checked")?.focus();
            }
          }else{
            open(templateDialogPlanId,false,originalOpener);
            renderTemplateSelection();
          }
        }
        q("#ec-template-configure").addEventListener("click",()=>{
          const t=templateSamples[visibleTemplateIndex];
          if(t)confirmTemplateChoice(t.id);
        });
        q("#ec-template-defer").addEventListener("click",()=>{
          confirmTemplateChoice("later");
        });
        document.addEventListener("keydown",event=>{
          if(q("#ec-template-modal").hidden)return;
          if(event.key==="Escape"){event.preventDefault();closeTemplateDialog();return;}
          if(event.key!=="Tab")return;
          const buttons=all("#ec-template-modal button:not([disabled])").filter(el=>el.getClientRects().length>0);
          const first=buttons[0],last=buttons[buttons.length-1];
          if(!first||!last)return;
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        });
        q("#ec-catalog").addEventListener("click",event=>{
          const button=event.target.closest("[data-templates-open]");
          if(button)openTemplateDialog(button);
        });
// Ujednolicenie wysokości wszystkich pięciu kart w stanie zwiniętym.
        // Otwarty szczegół nadal zwiększa tylko wysokość wybranej karty.
        let equalizeFrame = null;
        function equalizePackageHeights() {
          const catalog = q("#ec-catalog");
          if (q("#ec-demo-page").hidden) return;
          const cards = all("#ec-packages .ec-package");
          if (!cards.length) return;
          const opened = all("#ec-catalog .ec-card-details[open]");
          catalog.style.removeProperty("--ec-equal-card-height");
          opened.forEach(details => { details.open = false; });
          // Osobna karta Abonament ma poziomy układ i nie uczestniczy w wyrównywaniu.
          const height = Math.ceil(Math.max(...cards.map(card => card.getBoundingClientRect().height)));
          catalog.style.setProperty("--ec-equal-card-height", height + "px");
          // Po wyrównaniu wysokości zapamiętaj faktyczny pusty odstęp NAD metadanymi.
          // Przy otwieraniu szczegółów nie może on się zmniejszyć i podciągać przycisków.
          cards.forEach(card => {
            const meta = card.querySelector(".ec-card-meta");
            const preceding = meta?.previousElementSibling;
            if (!meta || !preceding) return;
            const freeSpace = Math.max(0,
              meta.getBoundingClientRect().top - preceding.getBoundingClientRect().bottom);
            card.style.setProperty("--ec-meta-fixed-gap", freeSpace.toFixed(2) + "px");
          });
          opened.forEach(details => { details.open = true; });
        }
        function scheduleEqualizePackageHeights() {
          if (equalizeFrame !== null) cancelAnimationFrame(equalizeFrame);
          equalizeFrame = requestAnimationFrame(() => {
            equalizeFrame = null;
            equalizePackageHeights();
          });
        }
        scheduleEqualizePackageHeights();
        window.addEventListener("resize", scheduleEqualizePackageHeights, { passive: true });
        window.addEventListener("load", scheduleEqualizePackageHeights);
        if (document.fonts?.ready) document.fonts.ready.then(scheduleEqualizePackageHeights);
        // Dodatkowe zabezpieczenie: tylko jeden zakres jest otwarty naraz.
        // Po kliknięciu poza rozwiniętą listą Abonament zamknij ją bez zmiany rozmiaru karty.
        q("#ec-catalog").addEventListener("click", event => {
          const details=q("#ec-entry-packages .ec-card-details");
          if(details?.open && !details.contains(event.target)) details.open=false;
        });
        q("#ec-catalog").addEventListener("toggle", event => {
          const opened = event.target;
          if (!opened.matches?.(".ec-card-details") || !opened.open) return;
          all(".ec-card-details").forEach(other => { if (other !== opened) other.open = false; });
        }, true);
        const trainingOptions = [
          ["Instrukcja PDF", 0],
          ["Szkolenie 30 min", 49],
          ["Szkolenie 1 h", 90],
          ["Szkolenie 2 h", 179],
        ];
        function trainingBase(p) {
          return p.id === "one"
            ? 1
            : p.id === "wiz"
              ? 2
              : p.id === "firm"
                ? 3
                : 0;
        }
        function trainingLabel() {
          return trainingOptions[states[current.id].training][0];
        }
        function trainingCharge() {
          const p = current;
          return Math.max(
            0,
            trainingOptions[states[p.id].training][1] -
              trainingOptions[trainingBase(p)][1],
          );
        }
        function fillTraining() {
          const p = current,
            state = states[p.id],
            base = trainingBase(p);
          q("#ec-training-section").hidden = false;
          q("#ec-training-base").textContent = p.recurring
            ? "Abonament: brak szkolenia w bazie. Instrukcja PDF jest dostępna bezpłatnie; możesz wybrać płatne szkolenie."
            : "W cenie pakietu: " + trainingOptions[base][0] +
              ". Możesz wybrać inny wariant — dopłata dotyczy tylko wyższej opcji.";
          q("#ec-training").innerHTML = trainingOptions
            .map((option, i) => {
              const price = option[1],
                extra = Math.max(0, price - trainingOptions[base][1]),
                selected = i === state.training,
                isBase = i === base,
                label = isBase
                  ? (p.recurring ? "Domyślnie · bezpłatnie" : "W cenie pakietu")
                  : i < base
                    ? "Wariant krótszy · bez obniżenia ceny pakietu"
                    : "Cena: " + money(price) + " · dopłata za rozszerzenie";
              const badge = isBase
                ? (p.recurring ? "0 zł" : "W cenie")
                : extra ? "+" + money(extra) : "Bez dopłaty";
              return `<label class="ec-option ec-interactive"><input type="radio" name="ec-training" value="${i}" ${selected ? "checked" : ""}><span><strong>${option[0]}</strong><small>${label}</small></span><span class="ec-tag">${badge}</span></label>`;
            })
            .join("");
        }

        const defaults = (p) => ({
          training: trainingBase(p),
          sections: 0,
          pages: 0,
          seo: p.seo,
          contact: p.contact,
          revisions: 0,
          billing: "monthly",
          hosting: false,
          care: p.hosting === "year",
          languages: [],
          templateId: "",
          maps: false,
          newsletter: false,
          social: false,
          analytics: false,
          logoAi: false,
          contentEdit: false,
          contentSeo: false,
          googleAds: false,
          seoPosition: false,
          blog: p.blog,
          gsc: p.gsc,
        });
        const states = Object.fromEntries(
          packages.map((p) => [p.id, defaults(p)]),
        );
        let current = packages[0],
          opener = null;
        function optionGroup(id, name, items, base, selected) {
          q(id).innerHTML = items
            .map((x, i) => {
              const disabled = i < base,
                extra = x[2] - items[base][2];
              return `<label class="ec-option ec-interactive ${disabled ? "ec-dim" : ""}"><input type="radio" name="${name}" value="${i}" ${i === selected ? "checked" : ""} ${disabled ? "disabled" : ""}><span><strong>${x[0]}</strong><small>${disabled ? "Wariant poniżej bazy pakietu" : x[1]}</small></span><span class="ec-tag">${disabled ? "—" : extra > 0 ? "+" + money(extra) : "W cenie"}</span></label>`;
            })
            .join("");
        }
        function renderLanguages() {
          const selected = states[current.id].languages || [];
          // Gdy lista jest pusta, pokazujemy pierwszy wyłączony przełącznik.
          const rows = selected.length ? selected : [null];
          q("#ec-language-rows").innerHTML = rows.map((language, index) => {
            const enabled = !!language;
            const chosen = enabled ? language : languageChoices[0];
            const choices = languageChoices.filter(name => name === chosen || !selected.includes(name));
            const options = choices.map(name =>
              '<option value="' + name + '"' + (name === chosen ? ' selected' : '') + '>' + name + '</option>'
            ).join('');
            return '<div class="ec-language-row" data-language-index="' + index + '">' +
              '<label class="ec-language-switch-label ec-interactive">' +
              '<input type="checkbox" role="switch" class="ec-language-toggle" aria-label="Dodaj język numer ' +
              (index + 1) + '" ' + (enabled ? 'checked ' : '') + '>' +
              '<span class="ec-toggle-track" aria-hidden="true"></span>' +
              '<span>' + (index ? 'Dodatkowy język ' + (index + 1) : 'Dodaj język') + '</span></label>' +
              '<select class="ec-language-select ec-language-choice" aria-label="Wybierz język numer ' +
              (index + 1) + '"' + (enabled ? '' : ' disabled') + '>' + options + '</select>' +
              '</div>';
          }).join('');
          const addButton = q("#ec-add-language");
          addButton.disabled = !selected.length || selected.length === languageChoices.length;
          addButton.textContent = selected.length === languageChoices.length
            ? "Dodano wszystkie dostępne języki" : "+ Dodaj kolejny język";
        }
        function fill() {
          const p = current,
            s = states[p.id];
          fillTraining();
          q("#ec-badge").textContent = "Wybrany pakiet: " + p.name;
          q("#ec-title").textContent = "Dopasuj pakiet " + p.name + ".";
          q("#ec-subtitle").textContent =
            "Zakres bazowy jest już uwzględniony w cenie.";
          q("#ec-scope").innerHTML = fixed(p)
            .filter((x) => x[1])
            .map(
              (x) =>
                `<label><input type="checkbox" checked disabled><span>${x[0]}</span></label>`,
            )
            .join("");
          q("#ec-excluded").textContent =
            "Poza bazą: " +
            fixed(p)
              .filter((x) => !x[1])
              .map((x) => x[0])
              .join(", ") +
            (fixed(p).some((x) => !x[1])
              ? "."
              : "brak dodatkowych wyłączeń w tej sekcji.");
          renderTemplateSelection();
          q("#ec-billing-section").hidden = !p.recurring;
          q("#ec-structure").textContent =
            p.structure + ". Dodatki naliczane ponad zakres bazowy.";
          q("#ec-chips").innerHTML = p.chips
            .map((x) => `<span class="ec-chip">✓ ${x}</span>`)
            .join("");
          q("#ec-sections").value = s.sections;
          q("#ec-pages").value = s.pages;
          all('[name="ec-billing"]').forEach(
            (e) => (e.checked = e.value === s.billing),
          );
          optionGroup("#ec-seo", "ec-seo", seo.map((variant,i) => [seoName(p,i), variant[1], variant[2]]), p.seo, s.seo);
          q("#ec-seo-extras").innerHTML = seoServices.map(([key,label,price,description]) =>
            '<label class="ec-addon ec-seo-addon ec-interactive">' +
            '<span class="ec-addon-content"><strong>' + label + '</strong><small>' + description +
            ' · +' + money(price) + '</small></span>' +
            '<input class="ec-toggle" type="checkbox" role="switch" id="ec-seo-addon-' + key +
            '" aria-label="' + label + '" ' + (s[key] ? 'checked ' : '') + '>' +
            '<span class="ec-toggle-track" aria-hidden="true"></span></label>'
          ).join("");
          optionGroup(
            "#ec-contact",
            "ec-contact",
            contacts,
            p.contact,
            s.contact,
          );
          q("#ec-revisions-base").textContent =
            revisionText(p.revisions) +
            ". Jedna sesja = jeden zbiorczy zestaw uwag.";
          q("#ec-revisions").innerHTML = [0, 1, 2, 3]
            .map(
              (n) =>
                `<label class="ec-option ec-interactive"><input type="radio" name="ec-revisions" value="${n}" ${n === s.revisions ? "checked" : ""}><span><strong>${n === 0 ? "Bez dodatkowych sesji" : n === 1 ? "+1 sesja" : n === 2 ? "+2 sesje" : "+3 sesje"}</strong><small>${n ? "+" + money(n * 69) + " · łącznie " + (p.revisions + n) + " sesji" : "Zakres bazowy · " + p.revisions + " sesji"}</small></span></label>`,
            )
            .join("");
          // Dodatki po prawej stronie listy elementów objętych pakietem.
          q("#ec-addons").innerHTML = extraServices.map(([key,label,price,mayBeIncluded]) => {
            const included = mayBeIncluded && !!p[key];
            const checked = included || !!s[key];
            return '<label class="ec-addon ec-interactive"><span class="ec-addon-content"><strong>' +
              label + '</strong><small>' + (included ? 'W cenie pakietu' : '+' + money(price)) +
              '</small></span><input class="ec-toggle" type="checkbox" role="switch" id="ec-addon-' +
              key + '" ' + (checked ? 'checked ' : '') + (included ? 'disabled ' : '') +
              '><span class="ec-toggle-track" aria-hidden="true"></span></label>';
          }).join("");
          renderLanguages();
          const includedHost = p.hosting !== "optional";
          const includedCare = p.hosting === "year";
          q("#ec-hosting").innerHTML =
            '<div class="ec-service-list">' +
            '<label class="ec-checkbox ec-interactive"><input type="checkbox" id="ec-hosting-check" ' +
            (includedHost || s.hosting ? 'checked ' : '') + (includedHost ? 'disabled ' : '') +
            '><span><strong>Hosting strony</strong><small>' +
            (includedHost ? 'W cenie pakietu' : money(annualHosting) + ' / rok') +
            '</small></span></label>' +
            '<label class="ec-checkbox ec-interactive"><input type="checkbox" id="ec-care-check" ' +
            (includedCare || s.care ? 'checked ' : '') + (includedCare ? 'disabled ' : '') +
            '><span><strong>Opieka techniczna</strong><small>' +
            (includedCare ? 'W cenie przez pierwszy rok' :
              p.recurring ? money(annualCare) + ' / rok · za 12 mies. w abonamencie' :
              money(annualCare) + ' / rok') +
            '</small></span></label></div>' +
            '<p class="ec-note">Dwie niezależne usługi. W pakiecie Abonament hosting jest już częścią abonamentu.</p>';
          update();
        }
        function count(id) {
          let n = Math.floor(Number(q(id).value));
          n = Number.isFinite(n) ? Math.max(0, Math.min(99, n)) : 0;
          q(id).value = n;
          return n;
        }
        const val = (name) => q(`[name="${name}"]:checked`).value;
        function calculate() {
          const p = current, s = states[p.id], items = [];
          if (s.sections)
            items.push(["Dodatkowe sekcje × " + s.sections, s.sections * 90]);
          if (s.pages)
            items.push(["Dodatkowe podstrony × " + s.pages, s.pages * 190]);
          if (s.seo > p.seo)
            items.push([seoName(p,s.seo), seo[s.seo][2] - seo[p.seo][2]]);
          if (s.contact > p.contact)
            items.push([contacts[s.contact][0], contacts[s.contact][2] - contacts[p.contact][2]]);
          if (s.revisions)
            items.push(["Dodatkowe sesje × " + s.revisions, s.revisions * 69]);
          if (trainingCharge())
            items.push(["Zmiana szkolenia: " + trainingLabel(), trainingCharge()]);
          (s.languages || []).forEach(language =>
            items.push(["Dodatkowy język: " + language, languagePrice])
          );
          extraServices.forEach(([key,label,price,mayBeIncluded]) => {
            if (s[key] && !(mayBeIncluded && p[key]))
              items.push([label, price]);
          });
          seoServices.forEach(([key,label,price]) => {
            if (s[key]) items.push([label, price]);
          });
          // W pakiecie Abonament opieka jest opłacana za 12 miesięcy w ramach abonamentu.
          if (p.recurring && s.care)
            items.push(["Opieka techniczna na 12 miesięcy", annualCare]);
          const extra = items.reduce((sum,item) => sum + item[1], 0);
          const year = p.recurring ? (s.billing === "annual" ? aboPricing.annual : aboPricing.monthly * 12) : p.price;
          const host = p.hosting === "optional"
            ? (s.hosting ? annualHosting : 0) + (s.care ? annualCare : 0)
            : 0;
          const total = p.recurring
            ? installmentPlan(extra, s.billing).contract
            : year + extra + host;
          return {
            items, extra, year, host, total,
            contract: p.recurring ? total : null
          };
        }
        function read() {
          const p = current,
            s = states[p.id];
          s.training = +val("ec-training");
          if(hasTemplateLibrary(p)) s.templateId=q('#ec-template-options input[name="ec-template-choice"]:checked')?.value||"";
          s.sections = count("#ec-sections");
          s.pages = count("#ec-pages");
          s.seo = +val("ec-seo");
          s.contact = +val("ec-contact");
          s.revisions = +val("ec-revisions");
          s.billing = val("ec-billing");
          s.hosting =
            p.hosting === "optional" && q("#ec-hosting-check").checked;
          s.care = p.hosting === "year" ? true : q("#ec-care-check").checked;
          s.languages = all("#ec-language-rows .ec-language-row").filter(row =>
            row.querySelector(".ec-language-toggle").checked
          ).map(row => row.querySelector(".ec-language-choice").value)
           .filter((language, index, languages) => language && languages.indexOf(language) === index);
          extraServices.forEach(([key,, ,mayBeIncluded]) => {
            s[key] = (mayBeIncluded && !!p[key]) || q("#ec-addon-" + key).checked;
          });
          seoServices.forEach(([key]) => {
            s[key] = q("#ec-seo-addon-" + key).checked;
          });
        }
        function baseUpdate() {
          read();
          const p = current,
            s = states[p.id],
            a = calculate();
          q("#ec-base").textContent = money(
            p.recurring ? (s.billing === "annual" ? aboPricing.annual : aboPricing.monthly) : p.price,
          );
          q("#ec-period").textContent = p.recurring
            ? s.billing === "annual"
              ? "rocznie, płatne z góry"
              : "miesięcznie"
            : "jednorazowo za wykonanie";
          q("#ec-base-label").textContent = p.recurring
            ? "Abonament / rok"
            : "Cena bazowa";
          q("#ec-base-cost").textContent = money(a.year);
          q("#ec-extra").textContent = money(a.extra);
          q("#ec-project-subtotal-label").textContent = "Projekt + dodatki";
          q("#ec-project-subtotal").textContent = money(p.price + a.extra);
          q("#ec-host-row").hidden = !a.host;
          q("#ec-host-label").textContent = s.hosting && s.care
            ? "Hosting + opieka / rok" : s.hosting ? "Hosting / rok" : "Opieka / rok";
          q("#ec-host-cost").textContent = money(a.host);
          q("#ec-total-label").textContent =
            p.recurring || a.host
              ? "Łącznie w pierwszym roku"
              : "Łącznie jednorazowo";
          q("#ec-total").textContent = money(a.total);
          q("#ec-paynote").textContent = p.recurring
            ? s.billing === "annual"
              ? "590 zł / rok promocyjnie + dodatki rozłożone na raty."
              : "12 × 69 zł + dodatki rozłożone na raty."
            : a.host
              ? "Projekt, dodatki i wybrane usługi roczne płatne z góry."
              : p.hosting === "year"
                ? "Hosting i opieka w cenie na pierwszy rok."
                : "Hosting i opieka techniczna nie są doliczone.";
          q("#ec-contract").textContent = p.recurring
            ? "Koszt umowy na 12 miesięcy z dodatkami: " +
              money(a.contract) +
              "."
            : p.hosting === "year"
              ? "Cena hostingu po pierwszym roku do ustalenia."
              : "";
          q("#ec-items").innerHTML = a.items.length
            ? a.items
                .map(
                  (x) =>
                    `<div class="ec-line"><span>${x[0]}</span><span>${money(x[1])}</span></div>`,
                )
                .join("")
            : "Brak dodatków jednorazowych.";
          all("[data-counter]").forEach((b) => {
            const n = s[b.dataset.counter];
            b.disabled = b.dataset.delta === "-1" ? n === 0 : n === 99;
          });
        }
        function baseSummary(baseChoice) {
          const p = current, s = states[p.id], a = calculate();
          const project = p.price + a.extra;
          const simpleRows = [
            ["Pakiet", p.name],
            ["Zakres", p.structure],
            ...(p.recurring && s.billing==="annual" ? [["Promocja pakietu Abonament", "590 zł/rok zamiast 790 zł/rok"]] : []),
            ["SEO", seoName(p,s.seo)],
            ["Dodatkowe usługi SEO", seoServices.filter(([key]) => s[key])
              .map(([,label]) => label).join(", ") || "Bez dodatkowych usług"],
            ["Kontakt", contacts[s.contact][0]],
            ["Języki obce", (s.languages || []).join(", ") || "Bez dodatkowych języków"],
            ["Wybrane dodatki", a.items.length ? a.items.length + " pozycji" : "Bez dodatków"],
            ["Hosting / opieka", hostingDescription(p)]
          ];
          const row = (label,value) =>
            '<div class="ec-line' + (label==="Hosting / opieka" ? ' ec-summary-hosting-line' : '') +
            '"><span>' + label + '</span><span>' + value + '</span></div>';
          const templateRow = hasTemplateLibrary(p)
            ? '<div class="ec-line ec-summary-template-line">' +
                '<span>Szablon pakietu ' + escapeTemplateText(p.name) + '</span>' +
                '<button type="button" class="ec-summary-template-name ' +
                  (s.templateId ? 'is-selected' : 'is-required') +
                  '" data-ec-summary-template-browse aria-label="' +
                  (s.templateId ? 'Zmień wybrany szablon pakietu ' : 'Wybierz szablon pakietu ') + escapeTemplateText(p.name) +
                  '">' +
                  (s.templateId ? templateSelectionName(s.templateId) : 'Wybierz szablon') +
                '</button>' +
                '<span class="ec-summary-template-validation" role="alert" hidden>Pole wymagane — wybierz szablon lub zaznacz „Szablon wybiorę później”.</span>' +
              '</div>'
            : '';
          const lines = simpleRows.map(([label,value]) =>
            row(label,value) + (label==="Pakiet" ? templateRow : "")
          ).join("");
          const total = p.recurring ? a.contract : a.total;
          const totalBlock = '<div class="ec-summary-total">' +
            row(p.recurring ? "Łącznie za 12 miesięcy" : "Projekt i usługi łącznie",money(total)) +
            (p.recurring ? row("Suma dodatków",money(a.extra)) + row("Rata pakietu i dodatków",miniSchedule()) :
              row("Wartość projektu z dodatkami",money(project)) +
              (a.host ? row("Usługi roczne z góry",money(a.host)) : "")) +
            '</div>';
          const compactConfigureLink = directSummaryMode
            ? '<div class="ec-direct-summary-switch">' +
                '<span class="ec-direct-summary-prompt">Potrzebujesz skonfigurować pakiet?</span> ' +
                '<button type="button" id="ec-direct-summary-configure" class="ec-direct-summary-configure">Przejdź do konfiguratora ↗</button>' +
              '</div>'
            : '';
          const detailsHeading = '<h3>' + (directSummaryMode ? 'Co wybrano — ' : 'Twoja konfiguracja: ') + p.name + '</h3>';
          // Podsumowanie po „Wybieram pakiet”: najpierw pełne „Co wybrano”
          // (w tym klikalny wybór szablonu Abonament), następnie niewielki
          // link do konfiguratora i na końcu blok rozliczenia.
          // Standardowe podsumowanie zachowuje swoją dotychczasową strukturę.
          q("#ec-summary").innerHTML = (directSummaryMode
              ? detailsHeading + lines + compactConfigureLink + totalBlock
              : detailsHeading + lines + totalBlock) +
            '<p class="ec-note">Ceny netto. Dodatki i usługi oznaczone jako robocze wymagają potwierdzenia w ofercie.</p>';
        }
        let wizardStep = 0;
        let directSummaryMode = false;
        let wizardPanes = [];
        function setupWizardLayout() {
          const fields = q("#ec-config .ec-fields");
          const sections = [...fields.children].filter(el => el.classList.contains("ec-section"));
          if (sections.length !== 8) throw new Error("Nieprawidłowe sekcje konfiguratora");
          wizardPanes = Array.from({ length: 4 }, (_, i) => {
            const pane = document.createElement("div");
            pane.className = "ec-pane";
            pane.dataset.ecStep = i;
            fields.append(pane);
            return pane;
          });
          // Rozliczenie pakietu Abonament w prawej kolumnie; pozostałe pakiety ukrywa fill().
          wizardPanes[0].append(sections[0]);
          // Jeden wybór rozliczenia, dostępny od pierwszego kroku w prawej kolumnie.
          q("#ec-config .ec-aside > [aria-live]").before(sections[1]);
          wizardPanes[1].append(sections[2], sections[3]);
          wizardPanes[2].append(sections[4], sections[5]);
          // Szkolenia przeniesione z kroku 3 do kroku 4, za hostingiem i opieką.
          wizardPanes[3].append(sections[7], sections[6]);
          // Moduły zostały przeniesione do dodatków w kroku 1.

          const bundle = document.createElement("div");
          bundle.className = "ec-bundle-grid";
          sections[0].querySelector("h3").textContent = "W cenie Twojego projektu";
          const scope = q("#ec-scope");
          scope.before(bundle);
          const included = document.createElement("div");
          const title = document.createElement("h4");
          title.textContent = "Elementy zawarte w pakiecie";
          included.append(title,scope);
          bundle.append(included);
          const extras = document.createElement("div");
          const extrasTitle = document.createElement("h4");
          extrasTitle.textContent = "Dodatki do projektu";
          const toggles = document.createElement("div");
          toggles.id = "ec-addons";
          extras.append(extrasTitle,toggles);
          bundle.append(extras);

          // Ten sam pierwszy krok wyboru szablonu dla Abonament i Start.
          const templatePane=document.createElement("div");
          templatePane.id="ec-mini-template-pane";
          templatePane.className="ec-pane ec-template-pane";
          templatePane.dataset.ecStep="template";
          fields.insertBefore(templatePane,wizardPanes[0]);
          // Jeden katalog szablonów dla obu pakietów, z osobnym zapisem wyboru.
          const templateSection=document.createElement("section");
          templateSection.className="ec-section ec-template-section";
          templateSection.id="ec-template-section";
          templateSection.hidden=true;
          templateSection.innerHTML=
            '<h3>Wybierz szablon swojej strony</h3>'+
            '<p class="ec-muted">Wybierz projekt z biblioteki Eniverse i zobacz pełny podgląd. Wybór szablonu nie zmienia ceny pakietu.</p>'+
            '<p id="ec-template-required" class="ec-template-required" role="alert" tabindex="-1" hidden>Wybierz szablon lub zaznacz „Szablon wybiorę później”, aby przejść dalej.</p>'+
            '<div class="ec-template-select-options" id="ec-template-options" role="group" aria-label="Wybór szablonu strony"></div>'+
            '<div class="ec-template-select-footer"><span id="ec-template-selected"></span></div>';
          templatePane.append(templateSection);

          const lang = document.createElement("section");
          lang.className = "ec-section";
          lang.innerHTML =
            '<h3>Języki obce na stronie</h3>' +
            '<p class="ec-muted">Włącz język i wybierz go z listy. Możesz dodać kilka wersji językowych. Cena robocza: 490 zł za każdy język jednorazowo. Tłumaczenie treści jest wyceniane osobno.</p>' +
            '<div class="ec-language-list" id="ec-language-rows"></div>' +
            '<button class="ec-language-add ec-interactive" type="button" id="ec-add-language">+ Dodaj kolejny język</button>';
          wizardPanes[3].insertBefore(lang,sections[7]);
          sections[7].querySelector("h3").textContent = "Hosting i opieka techniczna";

          const final = document.createElement("div");
          final.className = "ec-final";
          final.id = "ec-final";
          final.hidden = true;
          final.append(q("#ec-summary"),q("#ec-contact-section"));
          q("#ec-window").insertBefore(final,q("#ec-window .ec-foot"));
        }
        setupWizardLayout();
        q("#ec-template-options").addEventListener("click",event=>{
          const preview=event.target.closest("[data-template-preview]");
          if(!preview)return;
          read();
          openTemplateDialog(preview);
          const index=templateSamples.findIndex(t=>t.id===preview.dataset.templatePreview);
          if(index>=0)showTemplate(index);
        });
        function step(index = 0, baseChoice = false) {
          const withTemplate=hasTemplateLibrary(current);
          const lastIndex=withTemplate?5:4;
          wizardStep=Math.max(0,Math.min(lastIndex,index));
          const last=wizardStep===lastIndex;
          const oldStep=withTemplate?wizardStep-1:wizardStep;
          q("#ec-config").hidden=last;
          q("#ec-final").hidden=!last;
          q("#ec-summary").hidden=!last;
          q("#ec-contact-section").hidden=!last;
          q("#ec-mini-template-pane").classList.toggle("is-active",withTemplate&&wizardStep===0);
          wizardPanes.forEach((pane,i)=>pane.classList.toggle("is-active",!last&&i===oldStep));
          const templateNav=q("[data-ec-nav-template]");
          templateNav.hidden=!withTemplate;
          templateNav.classList.toggle("active",withTemplate&&wizardStep===0);
          if(withTemplate&&wizardStep===0)templateNav.setAttribute("aria-current","step");
          else templateNav.removeAttribute("aria-current");
          all("[data-ec-nav-step]").forEach((el,i)=>{
            const active=oldStep===i;
            el.classList.toggle("active",active);
            el.querySelector("span").textContent=String(i+1+(withTemplate?1:0));
            if(active)el.setAttribute("aria-current","step");
            else el.removeAttribute("aria-current");
          });
          const labels=["Zakres w cenie i dodatki","Struktura strony i SEO","Kontakt i poprawki","Języki, usługi i szkolenia","Podsumowanie"];
          const directOnly=directSummaryMode && last;
          q("#ec-title").textContent=directOnly
            ? "Podsumowanie"
            : (withTemplate&&wizardStep===0?"Wybór szablonu":labels[oldStep])+" — "+current.name;
          q("#ec-subtitle").textContent=directOnly
            ? "Wybrany pakiet: "+current.name
            : "Krok "+(wizardStep+1)+" z "+(lastIndex+1);
          q("#ec-window .ec-head .ec-kicker").textContent=directOnly
            ? "Eniverse / Podsumowanie"
            : "Eniverse / Konfigurator strony";
          q("#ec-window .ec-steps").hidden=directOnly;
          q("#ec-window .ec-foot").hidden=directOnly;
          q("#ec-next").hidden=last;
          q("#ec-next").textContent=wizardStep===lastIndex-1?"Podsumowanie →":"Dalej →";
          q("#ec-back").hidden=directSummaryMode||wizardStep===0;
          q("#ec-back").textContent="← Wstecz";
          q("#ec-footer-note").textContent=last
            ? "Wyślij zapytanie z wybraną konfiguracją."
            : current.recurring?"Abonament: umowa na 12 miesięcy.":"Strona i dodatki jednorazowo; usługi roczne płatne z góry.";
          q("#ec-config .ec-fields").scrollTop=0;
          if(last)summary(baseChoice);
        }
        // Galeria Abonament w podsumowaniu jest częścią trybu wyboru pakietu.
        // Nie przełączamy kroków po wybraniu szablonu z tej galerii.
        q("#ec-summary").addEventListener("click",event=>{
          const configure=event.target.closest("#ec-direct-summary-configure");
          if(configure && directSummaryMode){
            directSummaryMode=false;
            step(0);
            return;
          }
          const templateLink=event.target.closest("[data-ec-summary-template-browse]");
          if(templateLink && hasTemplateLibrary(current)){
            openTemplateDialog(templateLink);
          }
        });
        let scrollBeforeModal = "";
        function open(id, baseChoice, button) {
          const target = packages.find((p) => p.id === id);
          if (!target) return;
          current = target;
          opener = button || null;
          directSummaryMode=!!baseChoice;
          if (baseChoice) states[id] = defaults(current);
          scrollBeforeModal = document.body.style.overflow;
          document.body.style.overflow = "hidden";
          q("#ec-modal-stage").hidden = false;
          fill();
          clearTemplateRequired();
          step(baseChoice ? (hasTemplateLibrary(current)?5:4) : 0, baseChoice);
          q("#ec-modal-stage").scrollTop = 0;
          q("#ec-close").focus();
        }
        function close() {
          q("#ec-modal-stage").hidden = true;
          document.body.style.overflow = scrollBeforeModal;
          opener?.focus();
        }
        q("#ec-catalog").addEventListener("click", (e) => {
          const b = e.target.closest("[data-configure],[data-choose]");
          if (b)
            open(
              b.dataset.configure || b.dataset.choose,
              !!b.dataset.choose,
              b,
            );
        });
        q("#ec-close").addEventListener("click", close);
        function clearTemplateRequired() {
          q("#ec-template-required").hidden=true;
          q("#ec-template-options").removeAttribute("aria-invalid");
          q("#ec-template-options").removeAttribute("aria-describedby");
        }
        q("#ec-next").addEventListener("click", () => {
          update();
          if(current.recurring && wizardStep===0 && !states[current.id].templateId) {
            const error=q("#ec-template-required");
            error.hidden=false;
            q("#ec-template-options").setAttribute("aria-invalid","true");
            q("#ec-template-options").setAttribute("aria-describedby","ec-template-required");
            error.focus();
            return;
          }
          clearTemplateRequired();
          step(wizardStep + 1);
          if(wizardStep===(hasTemplateLibrary(current)?5:4)) q("#ec-client-name").focus();
        });
        q("#ec-back").addEventListener("click", () => {
          step(wizardStep - 1);
          q("#ec-next").focus();
        });
        q("#ec-config").addEventListener("change", (event) => {
          update();
          // Natychmiastowe odświeżenie podpisu po wyborze szablonu Abonament.
          if (event.target.closest("#ec-template-options")) {
            const id=states[current.id].templateId;
            if(id) clearTemplateRequired();
            q("#ec-template-selected").textContent=id
              ? "Wybrany szablon: "+templateSelectionName(id)
              : "Nie wybrano jeszcze szablonu ani opcji wyboru później.";
          }
          // Aktualizacja list po zmianie języka lub stanu przełącznika.
          if (event.target.closest("#ec-language-rows")) renderLanguages();
        });
        q("#ec-add-language").addEventListener("click", () => {
          // Najpierw zachowaj pozostałe ustawienia; nie resetuj konfiguracji.
          read();
          const selected = states[current.id].languages;
          const nextLanguage = languageChoices.find(language => !selected.includes(language));
          if (!selected.length || !nextLanguage) return;
          selected.push(nextLanguage);
          renderLanguages();
          update();
        });
        all("[data-counter]").forEach((b) =>
          b.addEventListener("click", () => {
            const el = q("#ec-" + b.dataset.counter);
            el.value = Number(el.value) + Number(b.dataset.delta);
            update();
          }),
        );
        q("#ec-modal-stage").addEventListener("click", (e) => {
          if (e.target === q("#ec-modal-stage")) close();
        });
        document.addEventListener("keydown", (e) => {
          if (q("#ec-modal-stage").hidden || !q("#ec-template-modal").hidden) return;
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
          if (e.key === "Tab") {
            const focusables = all('#ec-modal-stage button:not([disabled]):not([hidden]), #ec-modal-stage input:not([disabled]):not([type="hidden"]), #ec-modal-stage summary, #ec-modal-stage a[href]')
              .filter(el => el.getClientRects().length > 0);
            const first = focusables[0], last = focusables[focusables.length - 1];
            if (!first || !last) return;
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        });
        // Elementor: wykorzystujemy gotowe karty, a nie odtwarzamy ich w drugim miejscu.
        // Żaden istniejący link CTA nie jest podmieniany lub blokowany.
        function integrateWithElementor() {
          const holder = document.querySelector('#enp-cennik.eniverse-pricing, .eniverse-pricing');
          if (!holder || holder.closest('#eni-calc')) return;
          const liveCards = [...holder.querySelectorAll('.enp-card')];
          if (!liveCards.length) return;
          const byName = name => {
            const n = (name || '').toLocaleLowerCase('pl-PL');
            if (n.includes('wizytówk')) return 'wiz';
            if (n.includes('one page')) return 'one';
            if (n.includes('strona firmowa') || n.includes('firmowy')) return 'firm';
            if (n.includes('mini start') || n.startsWith('abo')) return 'mini';
            if (n.includes('start')) return 'start';
            return null;
          };
          const matched = [];
          liveCards.forEach(card => {
            const title = card.querySelector('h3, h2');
            const plan = byName(title?.textContent || card.getAttribute('aria-labelledby'));
            if (!plan) return;
            card.dataset.eniPlan = plan;
            matched.push(card);
            if (hasTemplateLibrary({id:plan}) && !card.querySelector("[data-templates-open]")) {
              const button=document.createElement("button");
              button.type="button";
              button.className="ec-elementor-configure ec-elementor-templates";
              button.textContent=plan==="start"?"Przejrzyj szablony Start ↗":"Przejrzyj szablony pakietu Abonament ↗";
              button.dataset.templatePlan=plan;
              button.dataset.templatesOpen="";
              card.append(button);
              button.addEventListener("click",()=>openTemplateDialog(button));
            }
            const existing = card.querySelector('.ec-elementor-configure:not(.ec-elementor-templates)');
            if (existing) return;
            const link = card.querySelector('.enp-btn, a[data-enp-package]');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ec-elementor-configure';
            button.textContent = 'Skonfiguruj pakiet ↗';
            button.dataset.configure = plan;
            button.setAttribute('aria-label', 'Skonfiguruj pakiet ' + (title?.textContent || ''));
            if (link) link.insertAdjacentElement('afterend', button);
            else card.append(button);
            button.addEventListener('click', () => open(plan, false, button));
          });
          if (!matched.length) return;
          q('#ec-demo-page').hidden = true;
          root.classList.add('ec-elementor-mode');
          // Zmiana wyróżnienia tylko przez oznaczenia klas/atrybutów na oryginalnych boksach.
          const oldFeatured = matched.filter(c => c.dataset.eniPlan !== 'wiz');
          oldFeatured.forEach(card => {
            card.classList.remove('enp-card--featured', 'enp-card--highlight', 'is-featured');
            card.dataset.eniFeatured = 'false';
            card.querySelectorAll('.enp-badge, .enp-card-badge, .enp-featured-badge').forEach(b => b.hidden = true);
          });
          const wizCard = matched.find(c => c.dataset.eniPlan === 'wiz');
          if (wizCard) {
            wizCard.dataset.eniFeatured = 'true';
            wizCard.classList.add('enp-card--featured');
            let badge = wizCard.querySelector('.ec-elementor-badge');
            if (!badge) {
              badge = document.createElement('span');
              badge.className = 'ec-elementor-badge';
              badge.textContent = 'Wyróżniony pakiet';
              wizCard.append(badge);
            }
          }
        }
        // W Elementorze kod w widżecie HTML wykonuje się po stworzeniu kart na stronie.
        // Jeśli widget ładuje się wcześniej, DOMContentLoaded uruchomi próbę ponownie.
        // Wersja wdrożeniowa zawiera własne, zaakceptowane karty pakietów.
        const decimalMoney = (n) =>
          new Intl.NumberFormat("pl-PL", {
            useGrouping: "always",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(n) + " zł";
        function hostingDescription(p = current) {
          const s = states[p.id];
          if (p.hosting === "year") return "Hosting i opieka w cenie na 1 rok";
          if (p.recurring)
            return "Hosting w abonamencie" + (s.care ? "; opieka na 12 mies. w ratach" : "; bez dodatkowej opieki");
          const parts = [];
          if(s.hosting) parts.push("Hosting: " + money(annualHosting) + "/rok");
          if(s.care) parts.push("Opieka: " + money(annualCare) + "/rok");
          return parts.length ? parts.join("; ") : "Bez hostingu i opieki w wycenie";
        }
        function paymentInfo() {
          const p = current, a = calculate();
          const principal = p.price + a.extra;
          const deposit = Math.round(principal * 50) / 100;
          return {
            eligible: !p.recurring,
            principal,
            deposit,
            remaining: principal - deposit,
            hostInitial: a.host,
            initial: deposit + a.host,
            total: a.total
          };
        }
        function paymentDescription() {
          const b = paymentInfo();
          if (!b.eligible) return "";
          return "Zaliczka 50% za projekt i dodatki: " + decimalMoney(b.deposit) +
            (b.hostInitial ? " + roczne usługi płatne z góry: " + money(b.hostInitial) : "") + ".";
        }
        function remainingPaymentDescription() {
          const b = paymentInfo();
          if(!b.eligible) return "";
          return "Pozostałe 50% projektu: " + decimalMoney(b.remaining) +
            ". Termin zapłaty zgodnie z umową.";
        }
        function singlePaymentUpdate() {
          baseUpdate();
          const b = paymentInfo();
          q("#ec-payment-aside").hidden = !b.eligible;
          if(b.eligible) {
            q("#ec-host-label").textContent = states[current.id].hosting && states[current.id].care
              ? "Hosting + opieka / rok" : states[current.id].hosting ? "Hosting / rok" : "Opieka / rok";
            q("#ec-host-cost").textContent = money(b.hostInitial);
            q("#ec-total").textContent = money(b.initial);
            q("#ec-total-label").textContent = "Zaliczka 50% + usługi na start";
            q("#ec-payment-aside").innerHTML =
              '<span>Do zapłaty na start</span><strong>' + decimalMoney(b.initial) +
              '</strong><p class="ec-muted">Pozostałe 50% projektu: ' + decimalMoney(b.remaining) + '</p>';
            q("#ec-paynote").textContent = paymentDescription();
          }
          q("#ec-items").removeAttribute("aria-label");
        }
        function singlePaymentSummary(baseChoice) {
          baseSummary(baseChoice);
          const b = paymentInfo();
          if (b.eligible) {
            const block = document.createElement("section");
            block.className = "ec-payment-summary";
            const h = document.createElement("h3");
            h.textContent = "Zaliczka 50% wartości projektu";
            const first = document.createElement("p");
            first.textContent = "50% za projekt i dodatki: " + decimalMoney(b.deposit);
            const second = document.createElement("p");
            second.textContent = "Usługi roczne płatne z góry: " + money(b.hostInitial);
            const amount = document.createElement("p");
            amount.style.fontWeight = "700";
            amount.textContent = "Do zapłaty na start: " + decimalMoney(b.initial);
            const note = document.createElement("p");
            note.className = "ec-muted";
            note.textContent = remainingPaymentDescription();
            block.append(h,first,second,amount,note);
            q("#ec-summary").append(block);
          }
          q("#ec-send-result").hidden = true;
          q("#ec-form-error").hidden = true;
          all("#ec-lead-form [aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
          q("#ec-quote-payload").value = quoteText();
        }
        function quoteText() {
          const p = current,
            s = states[p.id],
            a = calculate(),
            b = paymentInfo();
          const lines = [
            "ZAPYTANIE O STRONĘ — ENIVERSE",
            "Pakiet: " + p.name,
            ...(hasTemplateLibrary(p) ? ["Szablon pakietu "+p.name+": "+templateSelectionName(s.templateId)] : []),
            "Zakres: " +
              p.structure +
              (p.chips.length ? " — " + p.chips.join(", ") : ""),
            "Dodatkowe sekcje: " + s.sections,
            "Dodatkowe podstrony: " + s.pages,
            "SEO: " + seoName(p,s.seo),
            ...seoServices.map(([key,label,price]) =>
              label + ": " + (s[key] ? "Dodane, " + money(price) : "Nie")),
            "Kontakt: " + contacts[s.contact][0],
            "Szkolenie: " + trainingLabel(),
            "Dopłata za zmianę szkolenia: " + money(trainingCharge()),
            "Sesje poprawek: " +
              (p.revisions + s.revisions) +
              " (" +
              p.revisions +
              " w cenie, " +
              s.revisions +
              " dodatkowych)",
            "Hosting i opieka: " + hostingDescription(p),
            "Dodatkowe języki strony: " + ((s.languages || []).join(", ") || "Nie"),
            ...extraServices.map(([key,label,price,mayBeIncluded]) =>
              label + ": " + (s[key] ? ((mayBeIncluded && p[key]) ? "W cenie pakietu" : "Dodane, " + money(price)) : "Nie")),
            "Czy ma stronę/sklep: " + (q("#ec-existing-check").checked ? "Tak" : "Nie"),
            "Link do istniejącej strony: " + (q("#ec-existing-check").checked ? q("#ec-existing-url").value.trim() : "Brak"),
            "",
            "POZOSTAŁY ZAKRES BAZOWY",
            ...fixed(p).filter((x) => x[1]).map((x) => "W cenie: " + x[0]),
            "",
            "WYCENA",
            "Cena bazowa: " +
              money(a.year) +
              (p.recurring ? " / rok" : " za wykonanie"),
            ...a.items.map((x) => x[0] + ": " + money(x[1])),
            (p.recurring
              ? "Dodatki — wartość za całą umowę: "
              : "Suma dodatków: ") + money(a.extra),
            "Dodatkowe usługi roczne (hosting/opieka): " + money(a.host),
            "Łącznie" + " w pierwszym roku" + ": " + money(a.total),
            "",
          ];
          if (p.recurring)
            lines.push(
              "Łączna płatność za pakiet i dodatki: " + miniSchedule(),
              "Umowa: 12 miesięcy",
              "Cała umowa z dodatkami: " + money(a.contract),
              "Dodatki są rozłożone na cały okres umowy; brak osobnej opłaty jednorazowej.",
            );
          else
            lines.push(
              "Płatność: " +
                (b.eligible
                  ? paymentDescription()
                  : money(b.principal) + " jednorazowo"),
            );
          if (b.eligible)
            lines.push(
              "Zaliczka 50% wartości projektu: " + decimalMoney(b.deposit),
              "Hosting i opieka za rok z góry: " + money(b.hostInitial),
              "Do zapłaty na start: " + decimalMoney(b.initial),
              remainingPaymentDescription(),
            );
          if (p.hosting === "year")
            lines.push("Hosting po pierwszym roku: cena do ustalenia.");
          lines.push(
            "Ceny dodatków są przykładowe. Sesje poprawek i modyfikacje od 69 zł; w makiecie 69 zł/sesję. Kwoty netto; VAT według właściwej stawki.",
          );
          return lines.join(String.fromCharCode(10));
        }
        // Use CF7's native form submission so its validation, spam controls and mail settings remain active.
        function sendToCF7(values) {
          return new Promise((resolve,reject)=>{
            const form=document.querySelector("#eniverse-quote-form form.wpcf7-form");
            if(!form||typeof form.requestSubmit!=="function"||!window.wpcf7){
              reject(new Error("Formularz wysyłkowy jest niedostępny. Skontaktuj się z agencją."));return;
            }
            const wrapper=form.closest(".wpcf7");
            if(!wrapper){reject(new Error("Nie znaleziono formularza Contact Form 7."));return;}
            for(const [id,value] of Object.entries(values)){
              const input=form.elements.namedItem(id);
              if(!input||typeof input.value==="undefined"){
                reject(new Error("Formularz wysyłkowy nie jest poprawnie skonfigurowany."));return;
              }
              input.value=value;
              input.dispatchEvent(new Event("input",{bubbles:true}));
              input.dispatchEvent(new Event("change",{bubbles:true}));
            }
            let timer,settled=false;
            const errors={
              wpcf7invalid:"Formularz odrzucił dane. Sprawdź wymagane pola.",
              wpcf7spam:"Zgłoszenie zostało zatrzymane przez zabezpieczenia antyspamowe.",
              wpcf7mailfailed:"Nie udało się wysłać wiadomości. Spróbuj ponownie lub skontaktuj się z agencją.",
              wpcf7unaccepted:"Brak wymaganej akceptacji.",
              wpcf7aborted:"Wysyłka została przerwana."
            };
            const events=["wpcf7mailsent","wpcf7submit",...Object.keys(errors)];
            function finish(error){
              if(settled)return;settled=true;clearTimeout(timer);
              events.forEach(type=>wrapper.removeEventListener(type,onResult));
              error?reject(error):resolve();
            }
            function onResult(event){
              if(event.target!==wrapper && !wrapper.contains(event.target))return;
              if(event.type==="wpcf7mailsent"){finish();return;}
              if(errors[event.type]){finish(new Error(errors[event.type]));return;}
              if(event.type==="wpcf7submit"){
                if(event.detail?.status==="mail_sent")finish();
                else finish(new Error("Contact Form 7 nie potwierdził wysłania wiadomości."));
              }
            }
            events.forEach(type=>wrapper.addEventListener(type,onResult));
            timer=setTimeout(()=>finish(new Error("Brak potwierdzenia wysyłki. Przed ponowną próbą skontaktuj się z agencją.")),45000);
            try{form.requestSubmit();}catch(error){finish(new Error("Nie udało się uruchomić wysyłki Contact Form 7."));}
          });
        }
        q("#ec-lead-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          if(hasTemplateLibrary(current) && !states[current.id].templateId){
            // Przycisk Wyślij jest aktywny, lecz nie pozwalamy wysłać bez
            // świadomego wyboru szablonu lub opcji "później".
            const templateLine=q("#ec-summary .ec-summary-template-line");
            if(templateLine){
              templateLine.classList.add("is-invalid");
              const message=templateLine.querySelector(".ec-summary-template-validation");
              if(message)message.hidden=false;
              const browse=templateLine.querySelector("[data-ec-summary-template-browse]");
              browse?.setAttribute("aria-invalid","true");
              templateLine.scrollIntoView({block:"center",behavior:"smooth"});
              browse?.focus({preventScroll:true});
            }
            q("#ec-form-error").textContent="Pole wymagane: wybierz szablon pakietu "+current.name+" lub opcję „Szablon wybiorę później”.";
            q("#ec-form-error").hidden=false;
            q("#ec-mini-template-required").hidden=false;
            q("#ec-send-result").hidden=true;
            return;
          }
          const name = q("#ec-client-name"),
            email = q("#ec-client-email"),
            phone = q("#ec-client-phone"),
            existing = q("#ec-existing-check"),
            site = q("#ec-existing-url");
          name.value = name.value.trim();
          email.value = email.value.trim();
          phone.value = phone.value.trim();
          site.value = site.value.trim();
          site.required = existing.checked;
          site.setCustomValidity(
            existing.checked && !/^https?:\/\/[^\s.]+\.[^\s]+/i.test(site.value)
              ? "Podaj pełny adres strony zaczynający się od https://."
              : ""
          );
          name.setCustomValidity(
            name.value ? "" : "Podaj imię i nazwisko lub nazwę firmy.",
          );
          phone.setCustomValidity(
            phone.value &&
              (!/^[+0-9 ()-]+$/.test(phone.value) ||
                phone.value.replace(/[^0-9]/g, "").length < 7)
              ? "Podaj poprawny numer telefonu lub pozostaw to pole puste."
              : "",
          );
          const fields = existing.checked ? [name,email,phone,site] : [name,email,phone],
            invalid = fields.filter((e) => !e.checkValidity());
          fields.forEach((e) => {
            if (!e.checkValidity()) e.setAttribute("aria-invalid", "true");
            else e.removeAttribute("aria-invalid");
          });
          q("#ec-send-result").hidden = true;
          if (invalid.length) {
            q("#ec-form-error").textContent =
              "Uzupełnij wymagane dane i sprawdź poprawność adresu e-mail" +
              (invalid.includes(phone) ? " oraz telefonu." : ".");
            q("#ec-form-error").hidden = false;
            invalid[0].focus();
            return;
          }
          q("#ec-form-error").hidden = true;
          const quote=quoteText();
          q("#ec-quote-payload").value=quote;
          const button=q("#ec-lead-form button[type=submit]");
          if(button.disabled)return;
          button.disabled=true;
          const original=button.textContent;
          button.textContent="Wysyłanie…";
          try {
            await sendToCF7({
              client_name:name.value, client_email:email.value,
              client_phone:phone.value, has_site:existing.checked?"Tak":"Nie",
              existing_site_url:existing.checked?site.value:"",
              quote_summary:quote, package_name:current.name
            });
            q("#ec-send-status").textContent="Dziękujemy. Zapytanie zostało przyjęte.";
            q("#ec-send-result").hidden=false;
          } catch(error) {
            q("#ec-form-error").textContent=error.message;
            q("#ec-form-error").hidden=false;
          } finally {
            button.disabled=false;button.textContent=original;
          }
        });
        q("#ec-existing-check").addEventListener("change", () => {
          const active = q("#ec-existing-check").checked;
          q("#ec-existing-url-wrap").hidden = !active;
          q("#ec-existing-url").required = active;
          q("#ec-existing-url").setCustomValidity("");
          q("#ec-existing-url").removeAttribute("aria-invalid");
          q("#ec-send-result").hidden = true;
        });
        all('#ec-lead-form input:not([type="hidden"])').forEach((e) =>
          e.addEventListener("input", () => {
            e.setCustomValidity("");
            e.removeAttribute("aria-invalid");
            q("#ec-send-result").hidden = true;
            q("#ec-form-error").hidden = true;
          }),
        );

        function installmentPlan(extra, billing) {
          const annual = billing === "annual",
            count = annual ? 1 : 12,
            base = Math.round((annual ? aboPricing.annual : aboPricing.monthly) * 100),
            extraCents = Math.round(extra * 100),
            part = Math.floor(extraCents / count),
            difference = extraCents - part * count,
            // Wyrównanie ostatniej raty tylko wtedy, gdy różnica przekracza 1 zł.
            lastPart = part + (difference > 100 ? difference : 0);
          return {
            annual,
            count,
            regular: (base + part) / 100,
            last: (base + lastPart) / 100,
            extraPart: part / 100,
            contract: ((base + part) * (count - 1) + base + lastPart) / 100,
          };
        }
        function miniPlan(billing = states[current.id].billing) {
          return installmentPlan(calculate().extra, billing);
        }
        function miniSchedule(billing = states[current.id].billing) {
          const b = miniPlan(billing);
          if (b.count === 1) return "1 płatność roczna w wysokości " + decimalMoney(b.regular);
          return b.regular === b.last
            ? b.count +
                " " +
                (b.annual ? "płatności roczne" : "raty miesięczne") +
                " po " +
                decimalMoney(b.regular)
            : b.count -
                1 +
                " " +
                (b.annual ? "płatność roczna" : "raty miesięczne") +
                " po " +
                decimalMoney(b.regular) +
                " i ostatnia " +
                (b.annual ? "płatność " : "rata ") +
                decimalMoney(b.last);
        }
        function update() {
          singlePaymentUpdate();
          const mini = current.recurring;
          q("#ec-base").hidden = mini;
          q("#ec-period").hidden = mini;
          q("#ec-mini-rate-comparison").hidden = true;
          q("#ec-mini-rate-footnote").hidden = !mini;
          q("#ec-total-label").hidden = mini;
          q("#ec-total").hidden = mini;
          q("#ec-paynote").hidden = mini;
          q("#ec-extra-label").textContent = mini
            ? "Dodatki / " +
              (states[current.id].billing === "annual" ? "rok" : "ratę")
            : "Dodatki jednorazowe";
          q("#ec-items-title").textContent = mini
            ? "Dodatki — wartość za całą umowę"
            : "Wybrane dodatki";
          all("[data-extra-cost]").forEach((e) => {
            e.textContent =
              e.dataset.extraCost +
              " · " +
              (mini ? "wliczone w raty" : "jednorazowo");
          });
          if (!mini) return;
          const a = calculate(),
            b = miniPlan();
          q("#ec-base").textContent = decimalMoney(b.regular);
          q("#ec-period").textContent = b.annual
            ? "rocznie za pakiet i dodatki"
            : "miesięcznie za pakiet i dodatki";
          q("#ec-base-label").textContent = b.annual
            ? "Baza / rok"
            : "Rata bazowa";
          q("#ec-base-cost").textContent = money(b.annual ? aboPricing.annual : aboPricing.monthly);
          q("#ec-extra").textContent = decimalMoney(b.extraPart);
          q("#ec-project-subtotal-label").textContent = b.annual ? "Pakiet + dodatki / rok" : "Pakiet + dodatki / mies.";
          q("#ec-project-subtotal").textContent = decimalMoney(b.regular);
          q("#ec-contract").textContent =
            "Dodatki o wartości " +
            money(a.extra) +
            " są rozłożone na cały okres umowy, bez osobnej płatności na start.";
          const monthly = miniPlan("monthly"),
            annual = miniPlan("annual");
          const ratePrice = amount => Number.isInteger(amount) ? money(amount) : decimalMoney(amount);
          q("#ec-mini-monthly-price").textContent = ratePrice(monthly.regular);
          q("#ec-mini-annual-price").textContent = ratePrice(annual.regular);
          q("#ec-mini-monthly-variant").classList.toggle("is-selected", !b.annual);
          q("#ec-mini-annual-variant").classList.toggle("is-selected", b.annual);
          q("#ec-monthly-rate").textContent =
            decimalMoney(monthly.regular) + " / mies.";
          q("#ec-monthly-detail").textContent =
            miniSchedule("monthly") + " za pakiet i dodatki.";
          q("#ec-annual-rate").textContent =
            decimalMoney(annual.regular) + " / rok";
          q("#ec-annual-rate").classList.toggle("ec-promo-price", a.extra === 0);
          q("#ec-annual-detail").textContent =
            miniSchedule("annual") + " za pakiet i dodatki.";
          if (!a.items.length) q("#ec-items").textContent = "Brak dodatków.";
          q("#ec-items").setAttribute(
            "aria-label",
            "Łączna wartość dodatków rozłożonych na cały okres umowy",
          );
        }
        function syncMiniTemplateSubmit() {
          // Aktywne Wyślij we wszystkich pakietach. Walidacja szablonu następuje
          // przy próbie wysłania, nie przez blokadę przycisku.
          q("#ec-lead-form button[type='submit']").disabled=false;
          q("#ec-mini-template-required").hidden=true;
          q("#ec-mini-template-required").textContent="Aby wysłać zapytanie dotyczące pakietu "+current.name+", wybierz szablon albo zaznacz opcję „Szablon wybiorę później” w galerii.";
          const templateLine=q("#ec-summary .ec-summary-template-line");
          if(templateLine && hasTemplateLibrary(current) && states[current.id].templateId){
            templateLine.classList.remove("is-invalid");
            templateLine.querySelector(".ec-summary-template-validation")?.setAttribute("hidden","");
            templateLine.querySelector("[data-ec-summary-template-browse]")?.removeAttribute("aria-invalid");
          }
          // Po dokonaniu wyboru usuń poprzedni komunikat z formularza.
          if(hasTemplateLibrary(current) && states[current.id].templateId)q("#ec-form-error").hidden=true;
        }
        function summary(baseChoice) {
          singlePaymentSummary(baseChoice);
          q("#ec-quote-payload").value = quoteText();
          syncMiniTemplateSubmit();
        }
      })();
