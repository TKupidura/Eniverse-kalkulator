(() => {
        const root = document.getElementById("eni-calc");
        if (!root || root.dataset.eniInitialized) return;
        root.dataset.eniInitialized = "true";
        const production = root.dataset.mode === "production";
        let galleryPortal = null;
        const q = (s) => root.querySelector(s) || galleryPortal?.querySelector(s) || null,
          all = (s) => [...root.querySelectorAll(s), ...(galleryPortal ? galleryPortal.querySelectorAll(s) : [])],
          money = (n) => new Intl.NumberFormat("pl-PL", {useGrouping:"always"}).format(n) + " zł netto";
        // Jedno źródło oferty: walidacja struktury i normalizacja danych.
        function validatePricing(c) {
          if (!c || typeof c !== "object") throw Error("Brak cennika");
          const idOK = x => typeof x==="string" && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(x) && !["constructor","prototype","__proto__"].includes(x) && !(x in Object.prototype);
          const nameOK = x => typeof x==="string" && !!x.trim() && !/[<>]/.test(x);
          const priceOK = n => typeof n==="number" && Number.isFinite(n) && n>=0 && Number.isSafeInteger(Math.round(n*100)) && Math.abs(n*100-Math.round(n*100))<1e-6;
          const list = (key, ordered=false) => {
            if(!Array.isArray(c[key])) throw Error("Niepoprawna lista: "+key);
            const ids=new Set();
            for(const x of c[key]){
              if(!x || !idOK(x.id) || ids.has(x.id) || (key!=="pakiety"&&!nameOK(x.nazwa)) || !(key==="pakiety"&&x.id==="mini"?true:priceOK(x.cena))) throw Error("Niepoprawna pozycja: "+key);
              ids.add(x.id);
            }
            if(ordered && c[key].some((x,i)=>i && x.cena<c[key][i-1].cena)) throw Error("Warianty muszą być uporządkowane wg ceny: "+key);
          };
          for(const k of ["pakiety","dodatki","marketing","uslugiRoczne"])list(k);
          for(const k of ["seo","kontakt","szkolenia"])list(k,true);
          for(const p of c.pakiety){
            if(!Number.isInteger(p.revisions) || p.revisions<0 || !["subscription","optional","year"].includes(p.hosting)) throw Error("Niepoprawny zakres pakietu: "+p.id);
            if(p.id==="mini"){
              const a=p.platnosc;
              if(p.id!=="mini" || !a || !priceOK(a.miesiecznie)||!Number.isInteger(a.miesiecznie)||!priceOK(a.roczniePromocja)||!priceOK(a.rocznieRegularna)||a.roczniePromocja>a.rocznieRegularna) throw Error("Niepoprawne stawki abonamentu");
            }
          }
          const reserved=new Set(["training","sections","pages","seo","contact","revisions","billing","hosting","care","languages","templateId","annual"]);
          for(const x of [...c.dodatki,...c.marketing]){
            if(reserved.has(x.id)) throw Error("Powtórzone lub zarezerwowane id: "+x.id);
            reserved.add(x.id);
          }
          for(const x of [...c.dodatki,...c.marketing,...c.uslugiRoczne]){
            for(const key of ["wPakietach","dostepneWPakietach"])
              if(x[key]!==undefined&&(!Array.isArray(x[key])||x[key].some(id=>!idOK(id))))throw Error("Niepoprawne "+key+": "+x.id);
            if(x.dostepneWPakietach&&x.wPakietach?.some(id=>!x.dostepneWPakietach.includes(id)))throw Error("Usługa w cenie musi być dostępna: "+x.id);
          }
          if(!c.rozbudowa || typeof c.rozbudowa!=="object") throw Error("Brak rozbudowy");
          for(const [key,x] of Object.entries(c.rozbudowa))if(!["dodatkowaSekcja","dodatkowaPodstrona","dodatkowyJezyk","dodatkowaRundaPoprawek"].includes(key)||!x||!nameOK(x.nazwa)||!priceOK(x.cena))throw Error("Niepoprawna rozbudowa: "+key+"; nowe usługi dodawaj do dodatki");
          const u=c.ustawienia;
          if(!u||!Number.isInteger(u.okresAbonamentu)||u.okresAbonamentu<1||u.okresAbonamentu>120||
             typeof u.zaliczkaProcent!=="number"||!Number.isFinite(u.zaliczkaProcent)||u.zaliczkaProcent<0||u.zaliczkaProcent>100||
             typeof u.zaokraglanieRat!=="boolean"||typeof u.progZaokraglania!=="number"||!Number.isFinite(u.progZaokraglania)||u.progZaokraglania<0||u.progZaokraglania>1||
             Math.abs(u.progZaokraglania*100-Math.round(u.progZaokraglania*100))>1e-6)throw Error("Niepoprawne ustawienia rozliczeń");
          return c;
        }
        let cennik;
        try { cennik=validatePricing(window.ENIVERSE_CENNIK); }
        catch(error) {
          console.error("Eniverse: sprawdź pricing.js.",error);
          root.innerHTML='<p role="alert" class="ec-pricing-error">Kalkulator jest chwilowo niedostępny. Skontaktuj się z nami w sprawie wyceny.</p>';
          return;
        }
        const cardElements=all("#ec-catalog [data-ec-plan]");
        const cardIds=new Set(cardElements.map(c=>c.dataset.ecPlan));
        const activePricing=cennik.pakiety.filter(p=>cardIds.has(p.id));
        if(!activePricing.length){
          root.innerHTML='<p class="ec-pricing-error">Aktualnie brak dostępnych pakietów.</p>';
          return;
        }
        // Galeria poza hierarchią warstw Elementora, z zachowaniem lokalnego zakresu CSS.
        if (production) {
          const gallery = root.querySelector("#ec-template-modal");
          const wizard = root.querySelector("#ec-modal-stage");
          if (gallery && wizard) {
            galleryPortal = document.createElement("dialog");
            galleryPortal.id = "eni-calc-portal";
            galleryPortal.dataset.build = "20261127-16";
            galleryPortal.setAttribute("aria-label","Konfigurator Eniverse");
            galleryPortal.addEventListener("cancel",event=>{
              event.preventDefault();
              if(!q("#ec-template-modal").hidden)closeTemplateDialog();
              else if(!q("#ec-modal-stage").hidden)close();
            });
            galleryPortal.hidden = true;
            document.body.append(galleryPortal);
            galleryPortal.append(wizard,gallery);
          }
          // Pełna szerokość widocznego dokumentu, bez szerokości pionowego scrollbara.
          const page = root.querySelector("#ec-demo-page");
          const fitPricingBackground = () => {
            if (!page || page.hidden || !root.getClientRects().length) return;
            const viewportWidth = document.documentElement.clientWidth;
            const rootLeft = root.getBoundingClientRect().left + window.scrollX;
            if (viewportWidth <= 0) return;
            page.style.setProperty("--ec-full-width", viewportWidth + "px");
            page.style.setProperty("--ec-full-left", (-rootLeft) + "px");
          };
          let backgroundFrame = 0;
          const scheduleBackground = () => {
            cancelAnimationFrame(backgroundFrame);
            backgroundFrame = requestAnimationFrame(fitPricingBackground);
          };
          fitPricingBackground();
          window.addEventListener("resize", scheduleBackground, { passive:true });
          window.addEventListener("load", scheduleBackground);
          if (typeof ResizeObserver === "function") {
            const backgroundObserver = new ResizeObserver(scheduleBackground);
            backgroundObserver.observe(root);
            backgroundObserver.observe(document.documentElement);
          }
        }
        function syncModalPortal(){
          if(!galleryPortal)return;
          const closed=q("#ec-modal-stage").hidden && q("#ec-template-modal").hidden;
          if(closed){
            if(galleryPortal.open && typeof galleryPortal.close==="function")galleryPortal.close();
            galleryPortal.hidden=true;
            galleryPortal.dataset.layer="closed";
            return;
          }
          galleryPortal.hidden=false;
          if(typeof galleryPortal.showModal==="function" && !galleryPortal.open){
            try{galleryPortal.showModal();}catch(error){console.error("Eniverse: nie udało się otworzyć natywnego modala",error);}
          }
          galleryPortal.dataset.layer=galleryPortal.matches(":modal")?"top-layer":"fallback";
        }
        const settings=cennik.ustawienia;
        const months=settings.okresAbonamentu;
        const depositPercent=settings.zaliczkaProcent;
        const remainingPercent=Number((100-depositPercent).toFixed(10));
        const monthLabel=n=>n===1?"1 miesiąc":n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?n+" miesiące":n+" miesięcy";
        const contractPeriod=monthLabel(months);
        const annualPeriods=Array.from({length:Math.ceil(months/12)},(_,i)=>Math.min(12,months-i*12));
        const annualUnit=months<12?" / "+contractPeriod:" / rok";
        const prorate=(rate,n)=>Math.round(rate*100*n/12);
        const annualBaseCents=(regular=false)=>annualPeriods.reduce((sum,n,i)=>sum+prorate(regular||i>0?aboPricing.regularAnnual:aboPricing.annual,n),0);
        const contractBase=(billing,regular=false)=>billing==="annual"?annualBaseCents(regular)/100:Math.round(aboPricing.monthly*100)*months/100;
        const variants=(items,emptyLabel)=>{
          const result=items.map(x=>({...x}));
          if(!result.length || result[0].cena!==0)result.unshift({id:"__none",nazwa:emptyLabel,opis:"Brak w bazie pakietu",cena:0});
          return result;
        };
        const seoConfig=variants(cennik.seo,"Bez dodatkowego SEO");
        const contactConfig=variants(cennik.kontakt,"Bez dodatkowego kontaktu");
        const trainingConfig=variants(cennik.szkolenia,"Brak szkolenia");
        const indexOfVariant=(list,id)=>Math.max(0,list.findIndex(x=>x.id===id));
        const seo=seoConfig.map(x=>[x.nazwa,x.opis||"",x.cena]);
        const contacts=contactConfig.map(x=>[x.nazwa,x.opis||"",x.cena]);
        const trainingOptions=trainingConfig.map(x=>[x.nazwa,x.cena]);
        const abo=cennik.pakiety.find(p=>p.id==="mini")?.platnosc;
        const aboPricing={monthly:abo?.miesiecznie??0,annual:abo?.roczniePromocja??0,regularAnnual:abo?.rocznieRegularna??0};
        // Treści i zakres opisowy pochodzą z boxa HTML. Cennik zawiera tylko dane ofertowe.
        const packages=activePricing.map(p=>{
          const card=cardElements.find(x=>x.dataset.ecPlan===p.id),d=card.dataset;
          const recurring=p.id==="mini";
          return {
            ...p,recurring,name:card.querySelector("[data-card-name]").textContent.trim(),
            price:recurring?aboPricing.monthly:p.cena,
            structure:d.scopeStructure||"",chips:(d.scopeChips||"").split("|").filter(Boolean),
            tech:d.scopeTech||"",design:d.scopeDesign||"",content:d.scopeContent||"",
            panel:d.scopePanel==="true",rights:d.scopeRights||"",nav:d.scopeNav==="true",
            days:Number(d.scopeDays)||0,terms:(d.scopeTerms||"")+(recurring?" na "+contractPeriod:""),
            galeria:!!card.querySelector("[data-templates-open]"),
            seo:indexOfVariant(seoConfig,p.seo),contact:indexOfVariant(contactConfig,p.kontakt),
            trainingIndex:indexOfVariant(trainingConfig,p.szkolenie),
            training:recurring?"Brak szkolenia":trainingOptions[indexOfVariant(trainingConfig,p.szkolenie)][0],
            includedAddons:Object.fromEntries(cennik.dodatki.map(x=>[x.id,(x.wPakietach||[]).includes(p.id)]))
          };
        });
        // Wyświetlana nazwa SEO tylko w pakietach One Page i Wizytówka.
        // Ceny oraz zakres wariantów pozostają niezmienione.
        function seoName(p, index) {
          const name = seo[index][0];
          return (p.id === "one" || p.id === "wiz")
            ? name.replace(/ na start$/, "")
            : name;
        }
        const hostingText = p => {
          const base=annualServices.filter(x=>annualIncluded(p,x.id));
          if(base.length) return base.map(x=>x.nazwa).join(" + ")+(p.recurring?" na okres abonamentu":" w cenie na pierwszy rok");
          return annualServices.some(x=>annualAvailable(p,x.id))?"Usługi roczne opcjonalne, płatne z góry":"";
        };
        // Ceny dodatków: stawki netto z pricing.js.
        const extraServices=cennik.dodatki.map(x=>[x.id,x.nazwa,x.cena,Array.isArray(x.wPakietach)]);
        const seoServices=cennik.marketing.map(x=>[x.id,x.nazwa,x.cena,x.opis||""]);
        const serviceConfigs=new Map([...cennik.dodatki,...cennik.marketing].map(x=>[x.id,x]));
        const serviceIncluded=(p,id)=>!!serviceConfigs.get(id)?.wPakietach?.includes(p.id);
        const serviceAvailable=(p,id)=>serviceIncluded(p,id)||!serviceConfigs.get(id)?.dostepneWPakietach||serviceConfigs.get(id).dostepneWPakietach.includes(p.id);
        const annualServices=cennik.uslugiRoczne;
        const annualHosting=annualServices.find(x=>x.id==="hosting")?.cena??0;
        const annualCare=annualServices.find(x=>x.id==="care")?.cena??0;
        const annualIncluded=(p,id)=>!!annualServices.find(x=>x.id===id)?.wPakietach?.includes(p.id)||(annualServices.some(x=>x.id===id)&&(id==="hosting"?p.hosting!=="optional":id==="care"&&p.hosting==="year"));
        const annualAvailable=(p,id)=>annualIncluded(p,id)||!annualServices.find(x=>x.id===id)?.dostepneWPakietach||annualServices.find(x=>x.id===id).dostepneWPakietach.includes(p.id);
        const annualSelected=(p,st,id)=>annualAvailable(p,id)&&(annualIncluded(p,id)||!!st.annual[id]);
        const annualExtras=(p,st)=>annualServices.filter(x=>annualSelected(p,st,x.id)&&!annualIncluded(p,x.id));
        const annualName=(id,fallback)=>annualServices.find(x=>x.id===id)?.nazwa||fallback;
        const expansion=cennik.rozbudowa;
        const languagePrice=expansion.dodatkowyJezyk?.cena??0;
        const sectionPrice=expansion.dodatkowaSekcja?.cena??0;
        const pagePrice=expansion.dodatkowaPodstrona?.cena??0;
        const revisionPrice=expansion.dodatkowaRundaPoprawek?.cena??0;
        // Etykiety statycznego HTML korzystają z tego samego źródła cen co wycena.
        const displayPrices = {...aboPricing, hostingWithCare:annualHosting + annualCare};
        all("[data-contract-period]").forEach(el=>el.textContent=contractPeriod);
        all("[data-cennik]").forEach(el => {
          el.textContent = money(displayPrices[el.dataset.cennik]) + (el.dataset.cennikSuffix || "");
        });
        q("#ec-mini-monthly-price").textContent = money(aboPricing.monthly);
        q("#ec-mini-annual-price").textContent = money(aboPricing.annual);
        q("#ec-monthly-rate").textContent = money(aboPricing.monthly) + " / mies.";
        q("#ec-annual-rate").textContent = money(aboPricing.annual) + " / rok · promocja";
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
        // Boxy są kompletnym HTML. Nie tworzymy ani nie zastępujemy ich struktury.
        function hasTemplateLibrary(p) { return !!p && !!packages.find(x=>x.id===p.id)?.galeria; }
        function bindCards(){
          const known=new Map(packages.map(p=>[p.id,p])),seen=new Set();
          cardElements.forEach(card=>{
            const p=known.get(card.dataset.ecPlan);
            card.hidden=!p||seen.has(card.dataset.ecPlan);
            if(card.hidden)return;
            seen.add(p.id);
            const fields={
              price:money(p.price).replace(" zł netto",""),
              monthly:String(aboPricing.monthly),annual:String(aboPricing.annual),
              regularAnnual:money(aboPricing.regularAnnual).replace(" netto",""),
              revisions:p.revisions?p.revisions+" w cenie":"Brak w cenie"
            };
            card.querySelectorAll("[data-card-field]").forEach(el=>{
              const key=el.dataset.cardField;
              if(Object.hasOwn(fields,key))el.textContent=fields[key];
              if(key==="regularAnnual")el.setAttribute("aria-label","Poprzednia cena: "+fields[key]+" netto za rok");
            });
            card.querySelectorAll("[data-card-hosting]").forEach(el=>el.hidden=!annualServices.some(x=>x.id==="hosting"&&annualIncluded(p,x.id)));
            card.querySelectorAll("[data-card-training-reference]").forEach(el=>{
              el.hidden=!cennik.szkolenia.length;
              if(p.training!==el.dataset.cardTrainingReference)el.textContent=p.training;
            });
            const annual=annualServices.filter(x=>annualAvailable(p,x.id));
            const serviceFields={
              hosting:[hostingText(p),annual.some(x=>annualIncluded(p,x.id)),!!annual.length],
              seo:[seoName(p,p.seo),p.seo!==0,!!cennik.seo.length],
              contact:[contacts[p.contact][0],true,!!cennik.kontakt.length],
              revisions:[revisionText(p.revisions),p.revisions!==0,true],
              training:[p.training,true,!!cennik.szkolenia.length&&p.training!=="Brak szkolenia"]
            };
            card.querySelectorAll("[data-card-service],[data-card-addon]").forEach(el=>{
              let value;
              if(el.hasAttribute("data-card-addon")){
                const id=el.dataset.cardAddon,addon=serviceConfigs.get(id);
                value=[addon?.nazwa||"",true,!!addon&&serviceIncluded(p,id)];
              }else value=serviceFields[el.dataset.cardService];
              if(!value)return;
              const [label,included,visible]=value;
              el.hidden=!visible;
              const text=el.querySelector("[data-card-label]");
              if(text)text.textContent=label;
              el.classList.toggle("ec-off",!included);
              const tick=el.querySelector(".ec-tick");
              if(tick)tick.textContent=included?"":"−";
            });
          });
          q(".ec-package-group--entry").hidden=!cardElements.some(c=>!c.hidden&&c.closest("#ec-entry-packages"));
          q(".ec-package-group--main").hidden=!cardElements.some(c=>!c.hidden&&c.closest("#ec-packages"));
        }
        bindCards();

        // Poglądowe makiety: docelowe miniatury i projekty można podmienić tutaj.
        // Siedem projektów demonstracyjnych z ZIP-ów użytkownika. Grafiki są osadzone lokalnie
        // w kodzie kalkulatora, więc galeria działa również bez WordPress API.
        const bundledTemplateSamples = [{"id":"zip-foto-01","name":"Czuły Kadr","type":"Fotografia ślubna i rodzinna","details":"Naturalne portfolio fotograficzne, duże zdjęcia i kameralny charakter.","image":"data:image/webp;base64,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","isBundled":true},{"id":"zip-med-02","name":"Próg","type":"Medycyna / psychoterapia","details":"Jasna i spokojna strona gabinetu psychiatrii i psychoterapii.","image":"data:image/webp;base64,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","isBundled":true},{"id":"zip-rest-03","name":"Półmisek","type":"Restauracja","details":"Sezonowa kuchnia, hero ze zdjęciem oraz czytelne menu.","image":"data:image/webp;base64,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","isBundled":true},{"id":"zip-fach-07","name":"OBWÓD","type":"Remonty i elektryka","details":"Wyrazisty układ techniczny dla usług remontowo-elektrycznych.","image":"data:image/webp;base64,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","isBundled":true},{"id":"zip-beauty-06","name":"Otulina","type":"Beauty / SPA","details":"Jasny szablon salonu kosmetycznego i day SPA z delikatnymi akcentami.","image":"data:image/webp;base64,UklGRhwYAABXRUJQVlA4IBAYAADwuQCdASowAjYBPwl+tlYrp7+ypBIrO/AhCWVuzmpOUslMPH7i1/12dFrMnPduZH8ZxvQN7jJ0+U1jy1KToqxdHTc5EKspLRX9jvuPT69+dk02GF1pFPmtt3tJBc5ISGaf6eRTnG1WKxrB8VFHKMHKmsavjYJovl7AoNvE29tZ4PCXUvHr3NNMQx5SnA4XE1/CTRod4kwPeH73Lu5+KkvnCxBRNl28V6EmL/dYqtGx/yXw7r+nYyb9TgDbN49xrTU1NCuHdJoQTMdcuy3pKxlI5TfGa8c+UJF8wVZHBENWcSbDqthN+pFGfzR0Xs4zmqey/Pge5fvW6R8EitymCba4jn4ChXI+Eewwi/Z6xkHuhgHIQBm5Tgt0R+Nad1POpK9Qqw2aHhEtTF2IaA+MEcOyKqDj5ei49fPU3Cyt6feF4uMtug0/dBG7LJVCMvYJOMfqWopVhDLyNEVxD0N+TpBxygQM9JbalCxrw5YNqPh/iQuEBBpgDqB5HRXNPdhQxQUtfvgDw0qmR+kHFXBI8s6WpqPxXZGDdd3NDrejzXQXN+Crvxti/DBxeFaYpqkwsPa9Z/s0ul6+dWc5IGRJ65+j3N1oqCs2LQ94qXR7RqSX9NRBkqonr1YL4tuZpZeAEqhOKtkrkFsS+1dG/vvYHVTKDNHokocj+gRCvaTzRjqQEBo/G0YX+sbHEabWlAYn7ovQkHmG1cUdBVDYG49ISVdhsuP7davlDBCDB/YUzlWsFUaim/uNO2P4RilAV21q8jzkZJLPFMo4lNC6Y2e0BweRdG99D0RzD9LIeWklzCvHOACF0G46ci1hOPzLP9rMyUOVAJ6t6ISq+YUQq2MPVLXApxvATuX7s1DkeSA7isyeWsZvwwjMy83bEM0R4mO80T0cIlUNnckDOYpO/MSgxiQ7F1o6AH4Iy+DajMXvYqocx2BQwAl+XNAyyiDk0BEY3ZN8MsK3beBy/ZBOVCIJaWMM3oJU7atD7BoMqqvVwycDTANh+QsxfPbwTU6e6Fk9a2FD83YlQc7F3kdYWie1O0lHe4TYqF7p+McG0JVnE4Me6RUOu1lSOC8oj7wn76wUADBMVhRySXGDBGn6nORmQ51jAKU+K0nFEtHptplqHOW2bYM/asT8s1PgZzhidphUCCYy+pJ2D3rFiPEdns72KPVpz34rZQVaD7+3WR/dYM41vG+TbYdb61oHhMpUa/J2skQ07uHtRrMJatpN8bWNn5P5+tBPOuIbA6bgdTgIRvLCo66DHPoMRIl3EYxf1py0pGCmHoxm0AAiwvuNe7wO/vVDILKWbO4rAY2lAynRMsOhd+OMvmCz5bx2Yj2/WsRfszmG8IeM2fzgxD1oIs3EZAafLFUSgeXrPHFb0CkgNuSiCWILwYF9FL+NIF72++fXlLR7mFKbdiFtat8AnUAtztkTnkNuLYhMZS4s+rpA4UHKUjOuzfBnCzpP07jKeRhJRx/Z+dDiK9HBsyPoRau893FK6T2eWfzK8U9VjKx25Noxno74e8Qjpb/8JrDbA6/bkiDbXRoZFXZJQLuM95sZAeB/zd2GGBB7jdyd9GApppgABIuBxugl9mfXnCYDcV99H4p0eUXPkeyXqiClZKeMIRLuz5m4c/9gOWwecAy8CXoxASsGtl+8qaeMvK1hpbO101rmKhY5cG/rfINWIzkV+yqP9bcL9p+ndjhRHXmH0NB4L4jXQ1FAEE6QHOtMAfTfRQmVsP/3sFlmZFcpFq9bRFwv/5NI0tnO+nvEiXr0NoKiVP9ZtEqA905fxcrtu3BMy8BPYt7FadK7Wurxs134qMoopaJdFSq/BK1fn5Gs+YQM9ugG56AcKvlF1HWjKZbnatbTQ0vx/kCaovM5J6VSoljML8hUxYHQfcPzIkrSDyXrvaB6MhX7EDQIoecivEKOvP2W5prruWMGpwnL/smQ7MbAyCcS7eNBXFMhsd+emugVe3gR8vu+C/K+bmURBHASRYlsXtCIcRwAAAD+83opQHaJ37U1i6WVnPiI4rRZ8b5z00uXdhw/a18W9B2P0eiwidL+SDO7j0Jr+I7oDsxQsMjiPibE1I4N2i5slzyH79rzVFJw7uRKXq3sx+5mbYH/IDLaK13af9qx+FF7X1UNekG6KJBAVeVKjmxMZ6smPPHLQLz3jEgJmfKPZJLiszNBCsyjCKS7p4fTJoo1iXQFWOd+bXkWJNaPqXhDD/+R1t89YSUo2iraJMePZ5HNFo4QAX/E1+bLs7BmAwqtJoSrK6UgIdbU4V63UAvDhr0wVfnxoiI15/ghkolVmURcZFE6xQe2btEGXBxIkU16VLuZ5idyUqiF5QW32C1vgSnjCIAlsNeTCO83dT7BddbPCKt09mKZ7sT+QH16d8qxX5YMtJ3bpQorpJDR5iGd+DZTAZTBsCYuBFGAv5w2Rote1L+18DRbOOLcVj7MO2p+myW5n2lQXxzIdwzCMtXf31mxETNbnnEEYBGzuFWmK0e3AvFW4Xl5rQAHk0n+r2THnjeYdKpNie6QCsX7yACVCJ2onDf88nrov/S/bX27dUqI+AM8gaXAfJJDqHQrk3SQqubcqNUw09UssvRLYjQyB5QOJ85EwiHcgi1RMRNXtI3pzf8LTWmOf3oh74aNe0+EWpoz8HvgYJ45F+neu024LrDSyJctzzffVisbgnr3ZN9YLde7Z707DfEe4i3eJ9Wq1ge7s12wZ5zWFsmPXQSffowk4xCmZyGXHKnkOH+7XSSyYk1h8SsRT2lLNZGGLnw3qa5eIIdKizO1XT4fzO6aLlirQ5TGKuk0NYofc9uPgxNQUa7zyDoxVK26IX6P2/MYsk1F2oIsuaZhlUvT50r3NXGosDBXcBKUpz76EpPhMn+9wKZXdM8g1I8/1r+1CX0zI8R2MlUHoiCeRxv4Ja/gwZmfPo2CG5HVDbwehG+CEYYXSo79q97DPF/nr5XXUpdm5TV4/ZWltgLkdQ6qlDDKaQsAUPkL0TOSKwzRgnRFevQb3O/sxSuASr/hlq3ZfDfS3jb3s6hj6b1P3s+SUpVrQAVyKaVbmniH8FnzgK9CTIvBkh/NyFKNcz+mO5zfNdVkewE2bLYY6GM2sc1i4TvznY5cKTere3iHkC5L0fUimhzAXaU9v9CnjuFIEKIndzrlO5ZahUQ7FcZi77m4FHoQb0xtVPmqHYOUGDgyvj3jLEkIM5fgI4jVke77XOVc9nMELm98HewvUcVStZl+RShRAoTQglBf/vl1cce7jFpsf72mbHKO3nqpjsjkhQZ0SSVgcS5squaErle+0JYlGikc9OgAkJqNQdq1A73J8MGwTUbqrsXEnwlV/UwBiwubzfmTphDzbTtO4PcjE06Nth3qfyhpMqfHQAgJZEyQjcty7nEe0t8t3WFXMe3x3llmBEm+r6JfHc9E/DA8VvyGWdmP7dt/qiAG2SaksTcCD6izsS6yJeS0SAMCHR4mfzYh0r/Oxa4g8VljGyHCXZAdqqrp5EAc1hlKeqvU95SFqdCI3enN/iBohWeLz+EcGvh1NPZKRU4SeV+tLyYG2/WjXfqC4O4S4BHveQZ8vZnPo+sCZ1Znsw0eel+/TsModQCrAG/a1MEJMhb4Z0oPrCOrOegujlRRu9F7gBkqi46iPJsdBgcF+w65r/AxUiXskWZVZobuJ1fplUBKpaUfflrE7hV+OYaSiUTjQRNBiaq7anCMHD7eWfU6NgBrjUond36deL3kcCje9Qn7f2Jz+flKQhFqXBhGzEVx/Yz0FERZ5zGs45RFvdwKHerUf5FZfH0kLG7r5E83HCRm7yHtcpRKtXG4jjrSFzEvWhz6/Le6u6J0uYfdlfjM8ND3k7GZK/mKI3HAAYS2lbpr4POmwxEHK8mkaKwJpgeCzdCxPiSyufjCSBotFO6/Kh6Tmkwehg8uToeFgn/hjJ4Rg1FscP2Oj/ddbi3nSI5Y3s2wEqAk2BE10Gj+7KRLxgFJJJueKuoHI5uqd7D+JqEiivWTNZFJemazw3A+8woOcrxGwlDF1n/8r0omgKQLoYAW8HcZO0KkPCYqq9OC4IjWXARondg5tm8BU1j9wy6M1UpbeTaUe+pVHByhqB+SnZmeKsbicqAAn87dVjajLvlrb3+BCdPZwHK4QhQrEYnFZqM/ahYiJUKbK1HrRWi7E7XlNYzfOLcOseep2mL/z+1xPSPUopQH3Ic8H2c+KOLNC8VWsNxZkSAFl+XSOp6ZRRt6tkoYWQX1zYbSHcrYl9wydC83+NtADf4/aRBC6cNfKkP7/s/N16EXVgW91y4LeXQX/kTOcAobzuST7o+5mbx5bb76+Yp6LlnXSnveNZHnk6wwKOpbWkyVeRHvpM5zSxxaKRRzWthcG90g8tZdVMXxWBUMXXCUt5UIt+nqeddSOZtrthGs31SQ3ESuYfIzL+bE3UBGudrW+MD8uW9EDUsva7+YR6PS4vzDnwmmKdH07AB8vLkfqUldtpbOPA2yBICDej6eedwhOgykjc4Ng5WNxUt9kKEcq3Vd7rB0rpygnk6g3r50G4/3B0OZasEPReFeOCag5PusZYGp3hKTBNk6rnaEGzqUi/vRHpdLtZm1kEGuFoNBOoE7wtmkNeQTKW31pb6Nf6c9PAzS+AY6WEB8RZyFG03hmjMIB7QkaWyj8Xycl0hCOKxV2beBJv9Rk65QYZPdM4bJdnh6q7PGVwPYjCc9/C36x10B0ZOTTzNx0mbKnd6Hmxso/jpoVfNxrT4xDjb7xOpC2agL6qzCOwmUOTjlxGdC87b14yDm6xUbOxNgvMAKeIWKAFzzeH2YgC7u/2BOXFAIo9QHy2FzkxKYndglKaHK9pyq7RD3yIJ1tlpWReYt+GtfI8S6YT1ooTbwJeYDMRzvsGV1KMohGVil4OZB01nAlpgUg1u6j49SMO9natWh5fFNS+bLCPQOcs5XPhGCwLNN9gW/VhCNO/4SIuKPNPnZ36aO3dwDhjPy6t0NjFNbK+wdFi6SWzilkz6Q54J5PcPtRoPIZuT6490eM7nLqpHautIGWVJsr6DrVB07afcsRMa8PN5uwUU4cevzYFpGhyiUIR7PWl9K4BKjFZDtm0yYCr+Xju78J4YmEYYSPx+dm7uhg9zPFZPtSRh5bLl39scDUPvQ/KEkjqGpKNbTXvJ8kB2yjX5rt14R9QGwd3mZweWQO4XdRsMobkfLLLpreLq0JmRm0C6fagIhpbsGWRFCpojLBJhpgzjOja2FjPit15HbOMq8QkiJTgGnNhOvf7I0Rwi+L0p1b0rqGz/sh9QeAdNmY+yhfYUlnxpDAGu2nxOcqJwFMEwyLdXtLbopLhFY1yqs0vYOvdiZsibg13xiuXHBsVVZA2UtdWefxFV1gRL1s3cuXyTQM5uIqRcn3XXucE2Wv8WWTeRXmvY+GvLaNNdyIvQxSnP/mKi9rGdxqLiy7z+71E+W8Y8FeVJkVRJB06hfcX31i4A0ElUHnS//OlfNMfrxNTjIQq/Yh1FeqiINl5hA0lVskXqTJ1bogxVOwghgwqd3Rk8viKCJUZOsPKm4q00g8oLnWRYshvBpJqVlFl29lBO3gHqRkLAEkCByF8g85YRWvFoQrcsq/z1YFkQ2m7l2x0hXV879QH4X26hxOEgfIoadw23OOe8o9Cg0vPTWb/P2X+w0Vf/kuSgKGAKNnG6ExW8BT5nEtS/kYNeDD1nhzs9Q7r2UOp4lTBSrdMIK5rqdg9dOMxmhe3YNwaMSG3D1NG/nSpbY+7eJT3y9oJvJogwbskqH/Tudxa+ucr1HzeuhwCbIJInPVHpCLLWaZVFLS+4bdK6B9GKLVD+Mfcb9SwaCivreaj0mYVRjJBPzX1k88xWLahsXKWijoNsHSgzN+qRtwKjev2giwhy5X4U7A+DIc42fGVFF3Fr1Lyj8ufa6sfJTmEiVwR/6GWLFRXIdde7nAZ4JyO+pPobMCLV2w02CxB992Ca5jxg+Syzghx7kdROJMGO4G3w+/hSwbOJc1om47GgTl3TEvtCTlh3S0AChe2wxGe/6qwGcsWMQrazhZS1BXABvOTaAnHBIfkMYxjJLe0d2LOEprcjHMZ5i9PUo8cazLrjQks5FkeBtYL9kQYFx5gtw0n9obf4S4c/MO1W/XbbBnwOXA+7OWj3sw9t6mfDP+vtU5dlxunldfl55UdEciUjB2e1tsySDh07xfsZzkWerLm11G9fhC8/gugX6251q0iyIqvCXS1IhODA/fbjgbeAQwkOPmrqAyU3hMmo5Vffi3Hcgk/eyRnC7hWAFiwxqGdEFjFNOATkLY4A3ix5Rc94Yx9BH1sNqGaDGq5MnUKxgaLSRxSgO7JYpi/KIeIC9UrvRnGHaei28+Z3s4OSgDNeOVdu/+zpgpjvGawAryEAtpOTcB5nua8rQfDZjGFHvct2o63t9fGsl/okzA1tkokOPdSsFtoq7xuWvaLsIoxaxywhb+tf4Hbvhlr3BRSSuJDcUCw533JNi7rplHduRcxPvu+k8Vdxv+d4pWwiex4J3yHk1TSXmIDWkC+UYXc8QUEuq5AYAVlD5X/g6k0xormzJC6sJIz2IgDfHLJxc4Mpb7pCnRT0jkFHnopFwtM8co6Bp6dnVIvUUf30bPViwjmYjxTCqIDJeX47Jp0FDSPntrVz1QPNyX3kMerlDJvO76XDjrBU3MyWJLlfq7jEVbTR8T5JnRdMoac584z8zq6un9knzZh0jjkbgUTwPZQN2zqID7+h+hIu/qkO2ECH1xNo3/72nD4TEuhAkbIAFOEjLICJ1AQQNTaVx+CJ6ypkZ5kKScoKflY2zoUysxKJUfshDnBHhFECyqPEVXM6af8s/nh8bkX3Oi6vDKoOKwG6Mv7v/cIqlCCcK445iDgdOpCSs56pO7tvBBfAHAgHTCAyUDPVZt7bDiL7nygGLTU5jNOOasNhOhkWL+EvShB6puQMKwLUzCmUDB4zRtCPVj8NkKx7zSgZ81vHdKDydnxb38tryyuJkFwX0f0CwBttzsaRCZ94jviGtLK/29vSIngM8DwDBVp5ZE3TisuNdBaEAbTBsQu9RskvE0MlygZGaRmRNr1wBo5TKsDR3EnG6cfyDzApbjlzGbuil++cqiYVvnOUtlCngBbghOd02TuTx4/Ws+CZIzXxUpCjpIJoQsuVH6F19hObmgmPYjQH3oPh6TmoFf+CQKIHwmeifDeV3YTZqA5A8hE4tx/jnSBZzbdLk+C62QDZKa/ayZ7b1C2ET7RQBPmhsTezNd2mz/dIpQm7ko9oW3Djpz/qtsD/fx6B+WQRiQHSo6112vybEtXm9XfOD6QBKJbo/8k55uMWYBks9h9KZvUrt8BLg+rBWL7E8Wfjryk/xcHIj+NtZDHsmkO5STXWL0m1FHWHFip4hXII9cjLINHiGXRp6nX/r6FQwEqc2t7+s8Zi7yVMbW1+v4xIbddK2u5e6VjWyj4NwoqiunUshccTVZzSWUk8GsYfH/xVDMmDD18bzwFAgkyb0miPHFgv7Ncp51erWE4YlZ9l1V0yDbIyd6M6UNiWESl8XubECbtiVCOWptdr7WD35QZrUFJ5OJJttEC7mi9PL0HB0tla4h7j+3oiHsxH/lzIw+2xIH0zi6oTA3cjEoLsgliqLnfJiw9XbclEZlwUtE4zYUo1Ms8/PrKuaWPU28j75o+dmVqUV+AkiKMRR2AAY3LY2kAADgSUGjTcuJqKorQSIroP+5HIq0f3ZkjzEKQ0yrA5A5DMGXs5AUxiZ1EbpovHQfFilliCW+C3MGS+H+ZXWZeYFpuZGd3bomdnWDFqx87Kp5kvcRkDyJlTKRqjYdKX5x1e2Dazd5Ps5sTxIkhAxcCmNuqMciZcrtVrXm/KcK+EzDsN28CtrxwhvtqtXwbRB6/t2ajvyYI7MqwnMYUHjaiIs31c5XhiedxkraI2vVLtSNDz8nnoNaiy2+ao3Vmg6n3JTJs4ypPeJHbsxHOduFtHfsChjDLdocMB46bSwuePZCO4YXyt4D7aZqzn7jjlC3cQsd/bK56UFG+8kFaf/MDHoa7y1woLaXonI+PwmpvSNmlMFs5KEcLZdiixAB1Kzg49NVMZD0SGS6ktSG+kWPNqBn9plAhD+8sqZwB0e2xirwPfRZ0ALg4Av3zwCdGZWlrE9bo7BZy8dtct1YUPnz8U6FCZTM4BapYl+yAAAAkcTmv/ESyQ/3OwADZEwMieYAACVpYAAe2gBJUAA","isBundled":true},{"id":"zip-trener-08","name":"Morawa · Trener personalny","type":"Trener personalny / fitness","details":"Trening siłowy 1:1, plan na 12 tygodni, cennik i kontakt z trenerem.","image":"data:image/webp;base64,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","isBundled":true},{"id":"zip-agent-04","name":"Ida Rolewska","type":"Agent nieruchomości","details":"Nowoczesna strona agentki nieruchomości z ofertą i planem sprzedaży.","image":"data:image/webp;base64,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","isBundled":true}];
        // Demo ZIP-y działają jako pełne strony HTML bez instalacji wtyczki.
        const bundledPreviewFiles = Object.freeze({
          "zip-foto-01":"demos/photographer.html",
          "zip-med-02":"demos/medical.html",
          "zip-rest-03":"demos/restaurant.html",
          "zip-fach-07":"demos/tradespeople.html",
          "zip-beauty-06":"demos/spa-salon.html",
          "zip-trener-08":"demos/personal-trainer.html",
          "zip-agent-04":"demos/real-estate-agent.html"
        });
        bundledTemplateSamples.forEach(t=>{t.previewPath=bundledPreviewFiles[t.id]||"";});
        let templateSamples = production ? [] : [...bundledTemplateSamples];
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
            const url=new URL(value);
            return url.protocol==="https:"&&!url.username&&!url.password?url.href:"";
          } catch {return "";}
        }
        function hasEmbeddedTemplateBadge(t) {
          return t.isBundled && ["zip-foto-01","zip-med-02","zip-rest-03","zip-fach-07","zip-beauty-06","zip-agent-04"].includes(t.id);
        }
        function templateNewTabLink(t) {
          const url=t.isBundled?t.previewPath:templateHttpsUrl(t.preview_url);
          if(!url)return "";
          return '<a class="ec-template-new-tab" href="'+escapeTemplateText(url)+'" target="_blank" rel="noopener noreferrer" aria-label="Otwórz szablon '+escapeTemplateText(t.name)+' w nowej karcie">Otwórz podgląd <span aria-hidden="true">↗</span></a>';
        }
        function templateScene(t, full = false) {
          if(t.isBundled || t.isRemote) {
            const image=t.isBundled?t.image:templateHttpsUrl(t.thumbnail_url);
            const preview=t.isBundled?t.previewPath:templateHttpsUrl(t.preview_url);
            if(!full) return image
              ? '<img class="ec-template-real-thumbnail" loading="lazy" src="'+escapeTemplateText(image)+'" alt="Miniatura szablonu '+escapeTemplateText(t.name)+'">'
              : '<span class="ec-template-real-placeholder">'+escapeTemplateText(t.name)+'</span>';
            if(preview) return '<iframe class="ec-template-project-frame" src="'+escapeTemplateText(preview)+'" title="Podgląd projektu '+escapeTemplateText(t.name)+'" loading="lazy" sandbox="'+(t.isBundled?'allow-scripts allow-forms allow-popups':'allow-scripts')+'" referrerpolicy="no-referrer"></iframe>';
            if(image) return '<img class="ec-template-project-image" src="'+escapeTemplateText(image)+'" alt="Podgląd szablonu '+escapeTemplateText(t.name)+'">';
            return '<p class="ec-template-unavailable">Podgląd tego projektu nie został jeszcze opublikowany.</p>';
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
            '<section class="ec-template-demo-section ec-template-demo-contact"><div class="ec-template-demo-index">05 / KONTAKT</div><h2>'+d.contactTitle+'</h2><p>'+d.contact+'</p><span class="ec-template-demo-contact-button">'+t.cta+' &nbsp;↗</span><div class="ec-template-demo-contact-end">'+t.brand+' <span>Szablon / Eniverse</span></div></section>' +
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
                '<span class="ec-template-select-dot ec-template-select-dot--'+t.id+(hasEmbeddedTemplateBadge(t)?' ec-template-crop-badge':'')+'" aria-hidden="true">'+(t.isBundled?'<img src="'+t.image+'" alt="">':t.isRemote&&templateHttpsUrl(t.thumbnail_url)?'<img src="'+escapeTemplateText(templateHttpsUrl(t.thumbnail_url))+'" alt="">':'')+'</span>'+
                '<span class="ec-template-tile-text"><strong>'+escapeTemplateText(t.name)+'</strong><small>'+escapeTemplateText(t.type)+'</small>'+
                '<span class="ec-template-select-description">'+escapeTemplateText(t.details)+'</span></span></label>' +
                '<div class="ec-template-select-actions"><button class="ec-template-preview-action" type="button" data-template-preview="'+t.id+'" aria-label="Zobacz podgląd szablonu '+escapeTemplateText(t.name)+'">Zobacz podgląd</button>'+'</div>' +
              '</div>'
            ).join('') +
            '<div class="ec-template-select-card ec-template-select-card--later">' +
              '<label class="ec-template-select-option">' +
                '<input type="radio" name="ec-template-choice" value="later" '+(selected==="later"?'checked ':'')+'>' +
                '<span class="ec-template-select-dot ec-template-select-dot--later" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8M8 17h5"/></svg></span>' +
                '<span class="ec-template-tile-text"><strong>Szablon wybiorę później</strong><small>Wybór opcjonalny na tym etapie</small>' +
                '<span class="ec-template-select-description">Możesz pominąć wybór na tym etapie. Formularz zostanie odblokowany.</span></span>' +
              '</label>' +
            '</div>';
          q("#ec-template-selected").textContent=selected
            ? (selected==="later" ? "Wybrano: szablon wybiorę później." : "Wybrany szablon: "+templateSelectionName(selected))
            : "Nie wskazano jeszcze szablonu ani opcji wyboru później.";
        }
        let templateOpener=null, templatePreviousScroll=false, templateDialogPlanId="mini";
        let templatesStatus = "loading", templatesError = "", templatesRequest = null;
        const previewFrames = new Map();
        const maxPreviewFrames = 3;
        let previewNotice = null;
        let previewNoticeTimer = 0;
        let activePreviewKey = null;
        let previewWarmTimer = 0;
        let previewWarmId = null;
        function cancelPreviewWarm(){clearTimeout(previewWarmTimer);previewWarmId=null;}
        function canWarmPreview(){const n=navigator.connection;return !n?.saveData && !["slow-2g","2g","3g"].includes(n?.effectiveType) && !document.hidden;}
        function clearPreviewNotice(){
          clearTimeout(previewNoticeTimer);
          previewNotice?.remove();
          previewNotice = null;
        }
        function hidePreviewFrames(){
          cancelPreviewWarm();
          clearPreviewNotice();
          activePreviewKey = null;
          for(const record of previewFrames.values())record.frame.hidden=true;
        }
        function showPreviewNotice(t){
          clearPreviewNotice();
          const box=document.createElement("div");
          box.className="ec-template-loading";
          box.setAttribute("role","status");
          const image=t.isBundled?t.image:templateHttpsUrl(t.thumbnail_url);
          if(image){const img=document.createElement("img");img.src=image;img.alt="";box.append(img);}
          const label=document.createElement("p");
          label.textContent="Ładowanie podglądu projektu…";
          box.append(label);
          q("#ec-template-viewport").append(box);
          previewNotice=box;
          previewNoticeTimer=setTimeout(()=>{if(previewNotice===box)label.textContent="Podgląd nadal się ładuje. Możesz także otworzyć go w nowej karcie.";},10000);
        }
        function ensurePreviewFrame(t, warm=false){
          const viewport=q("#ec-template-viewport");
          const preview=t.isBundled?t.previewPath:templateHttpsUrl(t.preview_url);
          if(!preview)return null;
          const key=t.id+"|"+preview;
          let record=previewFrames.get(key);
          if(record){
            if(!warm){previewFrames.delete(key);previewFrames.set(key,record);}
            return {key,record};
          }
          // Limit 3 iframe'ów; nie usuwaj aktywnej ramki i nie wypieraj
          // innych podglądów przez samo wskazanie kursorem przy pełnym cache.
          if(warm && previewFrames.size>=maxPreviewFrames)return null;
          while(previewFrames.size>=maxPreviewFrames){
            const oldest=[...previewFrames.keys()].find(k=>k!==activePreviewKey);
            if(!oldest)return null;
            previewFrames.get(oldest).frame.remove();previewFrames.delete(oldest);
          }
          const frame=document.createElement("iframe");
          frame.className="ec-template-project-frame";
          frame.title="Podgląd projektu "+t.name;
          frame.loading="eager";
          frame.hidden=true;
          frame.setAttribute("sandbox",t.isBundled?"allow-scripts allow-forms allow-popups":"allow-scripts");
          frame.referrerPolicy="no-referrer";
          record={frame,loaded:false,started:performance.now()};
          frame.addEventListener("load",()=>{
            if(previewFrames.get(key)!==record)return;
            record.loaded=true;
            const elapsed=Math.round(performance.now()-record.started);
            root.dataset.previewLoadMs=String(elapsed);
            root.dataset.previewTemplate=t.id;
            if(activePreviewKey===key)clearPreviewNotice();
          });
          frame.src=preview;
          previewFrames.set(key,record);
          viewport.append(frame);
          return {key,record};
        }
        function warmPreview(t){
          if(!t||!canWarmPreview()||previewFrames.size>=maxPreviewFrames)return;
          // Nie konkuruj z aktualnie ładowanym pełnym projektem.
          if([...previewFrames.values()].some(r=>!r.loaded))return;
          ensurePreviewFrame(t,true);
        }
        function schedulePreviewWarm(t){
          cancelPreviewWarm();
          if(!t||!canWarmPreview())return;
          previewWarmId=t.id;
          previewWarmTimer=setTimeout(()=>{if(previewWarmId===t.id)warmPreview(t);previewWarmId=null;},220);
        }
        function displayTemplatePreview(t){
          const viewport=q("#ec-template-viewport");
          const preview=t.isBundled?t.previewPath:templateHttpsUrl(t.preview_url);
          const key=preview?t.id+"|"+preview:null;
          if(key && activePreviewKey===key && previewFrames.has(key))return;
          hidePreviewFrames();
          for(const node of Array.from(viewport.children)){
            if(!node.classList.contains("ec-template-project-frame"))node.remove();
          }
          if(!preview){
            const host=document.createElement("div");host.className="ec-template-static-preview";
            host.innerHTML=templateScene(t,true);viewport.append(host);return;
          }
          if(q("#ec-template-modal").hidden)return;
          const entry=ensurePreviewFrame(t);
          if(!entry)return;
          activePreviewKey=entry.key;
          entry.record.frame.hidden=false;
          if(!entry.record.loaded)showPreviewNotice(t);
        }
        function showTemplate(index) {
          const t=templateSamples[index];
          if(!t){
            visibleTemplateIndex=-1;
            const message = templatesStatus==="loading" ? "Ładowanie projektów…" : templatesStatus==="error" ? "Nie udało się pobrać projektów z biblioteki. Spróbuj ponownie." : "Aktualnie brak opublikowanych szablonów. Wybierz opcję „Szablon wybiorę później”.";
            hidePreviewFrames();
            for(const record of previewFrames.values())record.frame.remove();
            previewFrames.clear();
            q("#ec-template-viewport").innerHTML='<div class="ec-template-unavailable" role="status"><p>'+escapeTemplateText(message)+'</p>'+(templatesStatus==="error"||templatesStatus==="empty"?'<button type="button" class="ec-template-new-tab" data-ec-template-retry>Ponów ładowanie</button>':'')+'</div>';
            q("#ec-template-configure").hidden=true;
            q("#ec-template-external").innerHTML="";
            q("#ec-template-external").hidden=true;
            return;
          }
          q("#ec-template-configure").hidden=false;
          const external=q("#ec-template-external");
          external.innerHTML=templateNewTabLink(t);
          external.hidden=!external.firstElementChild;
          visibleTemplateIndex=index;
          displayTemplatePreview(t);
          q("#ec-template-viewport").scrollTop=0;

          
          all("#ec-template-gallery .ec-template-choice").forEach((button,i)=>{
            button.classList.toggle("is-active",i===index);
            button.setAttribute("aria-pressed",String(i===index));
          });
        }
        function renderTemplateGallery() {
          q("#ec-template-gallery").innerHTML=templateSamples.map((t,i)=>
            '<div class="ec-template-gallery-item"><button type="button" class="ec-template-choice" data-template-index="'+i+'" aria-pressed="'+(i===0)+'"><span class="ec-template-thumb'+(hasEmbeddedTemplateBadge(t)?' ec-template-crop-badge':'')+'">'+templateScene(t)+'</span><span class="ec-template-choice-label"><strong>'+escapeTemplateText(t.name)+'</strong><small>'+escapeTemplateText(t.type)+'</small></span></button></div>'
          ).join("");
          showTemplate(0);
        }
        renderTemplateGallery();
        // Publiczny katalog WordPress: bez tokenów i adresów archiwów ZIP.
        // Niedostępne / puste API -> lokalna biblioteka 7 podglądów ZIP.
        function loadWordPressTemplates() {
          if (templatesRequest) return templatesRequest;
          templatesStatus="loading";
          templatesError="";
          if(!templateSamples.length)showTemplate(-1);
          templatesRequest=fetchWordPressTemplates().finally(()=>{templatesRequest=null;});
          return templatesRequest;
        }
        async function fetchWordPressTemplates() {
          const controller=new AbortController();
          const timeout=setTimeout(()=>controller.abort(),15000);
          let resolvedApi="";
          try {
            const apiUrl=root.dataset.templatesApi || window.ENIVERSE_TEMPLATES_API || "/wp-json/eniverse/v1/templates";
            resolvedApi=new URL(apiUrl,document.baseURI).href;
            if(!templateHttpsUrl(resolvedApi))throw Error("Niepoprawny adres HTTPS biblioteki");
            const response=await fetch(resolvedApi,{method:"GET",mode:"cors",credentials:"same-origin",cache:"no-store",signal:controller.signal,headers:{"Accept":"application/json"}});
            if(!response.ok)throw Error("API WordPress HTTP "+response.status);
            const payload=await response.json();
            const data=Array.isArray(payload)?payload:payload?.templates;
            if(!Array.isArray(data))throw Error("Niepoprawny format API szablonów");
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
            if(data.length && !next.length)throw Error("API zwróciło "+data.length+" projektów, ale żaden nie spełnia formatu id/nazwa");
            const previousId=templateSamples[visibleTemplateIndex]?.id;
            const published=new Set(next.map(t=>t.name.trim().toLocaleLowerCase("pl-PL")));
            templateSamples=production ? next : [...next,...bundledTemplateSamples.filter(t=>!published.has(t.name.trim().toLocaleLowerCase("pl-PL")))];
            templatesStatus=templateSamples.length?"ready":"empty";
            root.dataset.templatesStatus=templatesStatus;
            root.dataset.templatesCount=String(templateSamples.length);
            delete root.dataset.templatesError;
            packages.filter(hasTemplateLibrary).map(p=>p.id).forEach(planId=>{
              const selected=states[planId].templateId;
              if(selected&&selected!=="later"&&!templateSamples.some(t=>t.id===selected))
                states[planId].templateId="";
            });
            renderTemplateGallery();
            const selectedId=states[templateDialogPlanId]?.templateId || previousId;
            const index=templateSamples.findIndex(t=>t.id===selectedId);
            if(index>=0)showTemplate(index);
            if(hasTemplateLibrary(current)&&!q("#ec-modal-stage").hidden){
              renderTemplateSelection();
              if(!q("#ec-final").hidden)summary(directSummaryMode);
            }
          } catch(error) {
            templatesStatus="error";
            templatesError=error?.name==="AbortError"?"Przekroczono czas oczekiwania na API":String(error?.message||error);
            root.dataset.templatesStatus=templatesStatus;
            root.dataset.templatesError=templatesError;
            console.warn("Eniverse: nie udało się pobrać szablonów z WordPress.",resolvedApi,error);
            if(!templateSamples.length)showTemplate(-1);
          } finally {clearTimeout(timeout);}
        }
        loadWordPressTemplates();
        q("#ec-template-viewport").addEventListener("click",event=>{
          if(event.target.closest("[data-ec-template-retry]"))loadWordPressTemplates();
        });
        function openTemplateDialog(button) {
          templateOpener=button||null;
          const requestedPlan=!q("#ec-modal-stage").hidden
            ? current.id
            : (button?.dataset.templatePlan || button?.closest("[data-ec-plan]")?.dataset.ecPlan || current.id);
          if(!states[requestedPlan]||!hasTemplateLibrary(packages.find(p=>p.id===requestedPlan)))return;
          templateDialogPlanId=requestedPlan;
          templatePreviousScroll=document.body.classList.contains("eni-calc-scroll-locked");
          document.body.classList.add("eni-calc-scroll-locked");
          q("#ec-template-modal").hidden=false;
          syncModalPortal();
          if(templatesStatus==="error" || templatesStatus==="empty")loadWordPressTemplates();
          const selectedId=states[templateDialogPlanId].templateId;
          const selectedIndex=templateSamples.findIndex(t=>t.id===selectedId);
          showTemplate(selectedIndex>=0?selectedIndex:visibleTemplateIndex);
          q("#ec-template-defer").classList.toggle("is-selected",selectedId==="later");
          q("#ec-template-defer").setAttribute("aria-pressed",String(selectedId==="later"));
          q("#ec-template-configure").textContent=
            (!q("#ec-modal-stage").hidden && !q("#ec-final").hidden)
              ? "Wybierz ten szablon i wróć do podsumowania ↗"
              : "Wybierz ten szablon i konfiguruj ↗";
          q("#ec-template-close").focus({preventScroll:true});
        }
        function closeTemplateDialog() {
          hidePreviewFrames();
          q("#ec-template-modal").hidden=true;
          syncModalPortal();
          document.body.classList.toggle("eni-calc-scroll-locked",templatePreviousScroll);
          templateOpener?.focus({preventScroll:true});
        }
        q("#ec-template-gallery").addEventListener("pointerover",event=>{
          const button=event.target.closest("[data-template-index]");
          if(button && !button.contains(event.relatedTarget))schedulePreviewWarm(templateSamples[+button.dataset.templateIndex]);
        });
        q("#ec-template-gallery").addEventListener("pointerout",event=>{
          const button=event.target.closest("[data-template-index]");
          if(button && !button.contains(event.relatedTarget))cancelPreviewWarm();
        });
        q("#ec-catalog").addEventListener("pointerover",event=>{
          const button=event.target.closest("[data-templates-open]");
          if(button && !button.contains(event.relatedTarget))schedulePreviewWarm(templateSamples[0]);
        });
        q("#ec-catalog").addEventListener("pointerout",event=>{
          const button=event.target.closest("[data-templates-open]");
          if(button && !button.contains(event.relatedTarget))cancelPreviewWarm();
        });
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
          const cards = all("#ec-packages .ec-package").filter(card=>!card.hidden);
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
        // Escape zamyka podpowiedź; ponowne najechanie lub fokus ją przywraca.
        q("#ec-catalog").addEventListener("keydown", event => {
          const tip=event.target.closest(".ec-meta-tip");
          if(tip && event.key==="Escape"){tip.classList.add("ec-tip-dismissed");event.stopPropagation();}
        });
        all("#ec-catalog .ec-meta-tip").forEach(tip=>{
          tip.addEventListener("pointerenter",()=>tip.classList.remove("ec-tip-dismissed"));
          tip.addEventListener("focusin",()=>tip.classList.remove("ec-tip-dismissed"));
        });
        q("#ec-catalog").addEventListener("toggle", event => {
          const opened = event.target;
          if (!opened.matches?.(".ec-card-details") || !opened.open) return;
          all(".ec-card-details").forEach(other => { if (other !== opened) other.open = false; });
        }, true);
        function trainingBase(p) { return p.trainingIndex; }
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
          q("#ec-training-section").hidden = !cennik.szkolenia.length;
          q("#ec-training-base").textContent = p.recurring
            ? p.name + ": brak szkolenia w bazie. Możesz wybrać dostępny wariant."
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
                ? (p.recurring ? "0 zł netto" : "W cenie")
                : extra ? "+" + money(extra) : "Bez dopłaty";
              return `<label class="ec-option ec-interactive"><input type="radio" name="ec-training" value="${i}" ${selected ? "checked" : ""}><span><strong>${escapeTemplateText(option[0])}</strong><small>${label}</small></span><span class="ec-tag">${badge}</span></label>`;
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
          care: annualServices.some(x=>x.id==="care") && p.hosting === "year",
          languages: [],
          templateId: "",
          annual:{},
          ...Object.fromEntries(extraServices.map(([key,,,included])=>[key,!!(included&&p.includedAddons[key])])),
          ...Object.fromEntries(seoServices.map(([key])=>[key,serviceIncluded(p,key)])),
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
              return `<label class="ec-option ec-interactive ${disabled ? "ec-dim" : ""}"><input type="radio" name="${name}" value="${i}" ${i === selected ? "checked" : ""} ${disabled ? "disabled" : ""}><span><strong>${escapeTemplateText(x[0])}</strong><small>${disabled ? "Wariant poniżej bazy pakietu" : escapeTemplateText(x[1])}</small></span><span class="ec-tag">${disabled ? "—" : extra > 0 ? "+" + money(extra) : "W cenie"}</span></label>`;
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
              '<span>' + (index ? escapeTemplateText(expansion.dodatkowyJezyk?.nazwa||'Dodaj język')+' '+(index+1) : escapeTemplateText(expansion.dodatkowyJezyk?.nazwa||'Dodaj język')) + '</span></label>' +
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
          const availableMarketing=seoServices.filter(([key])=>serviceAvailable(p,key));
          q("#ec-seo-extras").closest(".ec-seo-services").hidden=!availableMarketing.length;
          q("#ec-seo").hidden=!cennik.seo.length;
          q("#ec-seo").closest(".ec-section").hidden=!cennik.seo.length&&!availableMarketing.length;
          q("#ec-contact").closest(".ec-section").hidden=!cennik.kontakt.length;
          q("#ec-seo-extras").innerHTML = availableMarketing.map(([key,label,price,description]) =>
            '<label class="ec-addon ec-seo-addon ec-interactive">' +
            '<span class="ec-addon-content"><strong>' + escapeTemplateText(label) + '</strong><small>' + escapeTemplateText(description) +
            (serviceIncluded(p,key)?' · W cenie pakietu':' · +' + money(price)) + '</small></span>' +
            '<input class="ec-toggle" type="checkbox" role="switch" id="ec-seo-addon-' + key +
            '" aria-label="' + escapeTemplateText(label) + '" ' + (s[key]||serviceIncluded(p,key) ? 'checked ' : '') + (serviceIncluded(p,key)?'disabled ':'') + '>' +
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
                `<label class="ec-option ec-interactive"><input type="radio" name="ec-revisions" value="${n}" ${n === s.revisions ? "checked" : ""}><span><strong>${n === 0 ? "Bez dodatkowych sesji" : n === 1 ? "+1 sesja" : n === 2 ? "+2 sesje" : "+3 sesje"}</strong><small>${n ? "+" + money(n * revisionPrice) + " · łącznie " + (p.revisions + n) + " sesji" : "Zakres bazowy · " + p.revisions + " sesji"}</small></span></label>`,
            )
            .join("");
          // Dodatki po prawej stronie listy elementów objętych pakietem.
          const availableExtras=extraServices.filter(([key])=>serviceAvailable(p,key));
          q("#ec-addons").parentElement.hidden=!availableExtras.length;
          q("#ec-addons").innerHTML = availableExtras.map(([key,label,price,mayBeIncluded]) => {
            const included = mayBeIncluded && !!p.includedAddons[key];
            const checked = included || !!s[key];
            return '<label class="ec-addon ec-interactive"><span class="ec-addon-content"><strong>' +
              escapeTemplateText(label) + '</strong><small>' + (included ? 'W cenie pakietu' : '+' + money(price)) +
              '</small></span><input class="ec-toggle" type="checkbox" role="switch" id="ec-addon-' +
              key + '" ' + (checked ? 'checked ' : '') + (included ? 'disabled ' : '') +
              '><span class="ec-toggle-track" aria-hidden="true"></span></label>';
          }).join("");
          renderLanguages();
          const availableAnnual=annualServices.filter(x=>annualAvailable(p,x.id));
          q("#ec-hosting").closest(".ec-section").hidden=!availableAnnual.length;
          q("#ec-hosting").innerHTML='<div class="ec-service-list">'+availableAnnual.map(x=>{
            const included=annualIncluded(p,x.id),checked=annualSelected(p,s,x.id);
            return '<label class="ec-checkbox ec-interactive"><input type="checkbox" id="ec-annual-'+x.id+'" '+(checked?'checked ':'')+(included?'disabled ':'')+'><span><strong>'+escapeTemplateText(x.nazwa)+'</strong><small>'+(included?(p.hosting==="year"?"W cenie przez pierwszy rok":"W cenie pakietu"):money(x.cena)+" / rok"+(p.recurring?" · za okres umowy w abonamencie":""))+'</small></span></label>';
          }).join("")+'</div>';
          for(const [key,id] of [["dodatkowaSekcja","sections"],["dodatkowaPodstrona","pages"]]){
            const row=q("#ec-"+id).closest(".ec-counter-row");
            row.hidden=!expansion[key];
            row.querySelector("[data-expansion-label]").textContent=expansion[key]?.nazwa||"";
          }
          q("#ec-revisions").closest(".ec-section").hidden=!expansion.dodatkowaRundaPoprawek;
          q("#ec-revisions").closest(".ec-section").querySelector("h3").textContent=expansion.dodatkowaRundaPoprawek?.nazwa||"";
          q("#ec-language-rows").closest(".ec-section").hidden=!expansion.dodatkowyJezyk;
          q("#ec-language-rows").closest(".ec-section").querySelector("h3").textContent=expansion.dodatkowyJezyk?.nazwa==="Dodaj język"?"Języki obce na stronie":(expansion.dodatkowyJezyk?.nazwa||"");
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
          if (expansion.dodatkowaSekcja && s.sections)
            items.push([expansion.dodatkowaSekcja.nazwa+" × "+s.sections,s.sections*sectionPrice]);
          if (expansion.dodatkowaPodstrona && s.pages)
            items.push([expansion.dodatkowaPodstrona.nazwa+" × "+s.pages,s.pages*pagePrice]);
          if (s.seo > p.seo)
            items.push([seoName(p,s.seo), seo[s.seo][2] - seo[p.seo][2]]);
          if (s.contact > p.contact)
            items.push([contacts[s.contact][0], contacts[s.contact][2] - contacts[p.contact][2]]);
          if (expansion.dodatkowaRundaPoprawek && s.revisions)
            items.push([expansion.dodatkowaRundaPoprawek.nazwa+" × "+s.revisions,s.revisions*revisionPrice]);
          if (trainingCharge())
            items.push(["Zmiana szkolenia: " + trainingLabel(), trainingCharge()]);
          if(expansion.dodatkowyJezyk)(s.languages||[]).forEach(language=>items.push([expansion.dodatkowyJezyk.nazwa+": "+language,languagePrice]));
          extraServices.forEach(([key,label,price,mayBeIncluded]) => {
            if (serviceAvailable(p,key) && s[key] && !serviceIncluded(p,key))
              items.push([label, price]);
          });
          seoServices.forEach(([key,label,price]) => {
            if (serviceAvailable(p,key) && s[key] && !serviceIncluded(p,key)) items.push([label, price]);
          });
          // W pakiecie Abonament opieka jest opłacana za 12 miesięcy w ramach abonamentu.
          if(p.recurring)annualExtras(p,s).forEach(x=>items.push([x.nazwa+" / "+contractPeriod,annualPeriods.reduce((sum,n)=>sum+prorate(x.cena,n),0)/100]));
          const extra = items.reduce((sum,item) => sum + item[1], 0);
          const year = p.recurring ? contractBase(s.billing) : p.price;
          const host=p.recurring?0:annualExtras(p,s).reduce((sum,x)=>sum+x.cena,0);
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
          s.sections=expansion.dodatkowaSekcja?count("#ec-sections"):0;
          s.pages=expansion.dodatkowaPodstrona?count("#ec-pages"):0;
          s.seo = +val("ec-seo");
          s.contact = +val("ec-contact");
          s.revisions=expansion.dodatkowaRundaPoprawek?+val("ec-revisions"):0;
          s.billing = val("ec-billing");
          s.annual=Object.fromEntries(annualServices.map(x=>[x.id,!!q("#ec-annual-"+x.id)?.checked]));
          s.hosting=!!s.annual.hosting&&!annualIncluded(p,"hosting");
          s.care=!!s.annual.care;
          s.languages = !expansion.dodatkowyJezyk?[]:all("#ec-language-rows .ec-language-row").filter(row =>
            row.querySelector(".ec-language-toggle").checked
          ).map(row => row.querySelector(".ec-language-choice").value)
           .filter((language, index, languages) => language && languages.indexOf(language) === index);
          extraServices.forEach(([key,, ,mayBeIncluded]) => {
            s[key] = serviceAvailable(p,key) && (serviceIncluded(p,key) || !!q("#ec-addon-" + key)?.checked);
          });
          seoServices.forEach(([key]) => {
            s[key] = serviceAvailable(p,key) && (serviceIncluded(p,key) || !!q("#ec-seo-addon-" + key)?.checked);
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
          q("#ec-host-label").textContent=annualCostLabel(p);
          q("#ec-host-cost").textContent = money(a.host);
          q("#ec-total-label").textContent =
            p.recurring || a.host
              ? "Łącznie w pierwszym roku"
              : "Łącznie jednorazowo";
          q("#ec-total").textContent = money(a.total);
          q("#ec-paynote").textContent = p.recurring
            ? s.billing === "annual"
              ? money(aboPricing.annual) + " / rok promocyjnie + dodatki rozłożone na raty."
              : months + " × " + money(aboPricing.monthly) + " + dodatki rozłożone na raty."
            : a.host
              ? "Projekt, dodatki i wybrane usługi roczne płatne z góry."
              : p.hosting === "year"
                ? "Hosting i opieka w cenie na pierwszy rok."
                : "Hosting i opieka techniczna nie są doliczone.";
          q("#ec-contract").textContent = p.recurring
            ? "Koszt umowy na "+contractPeriod+" z dodatkami: " +
              money(a.contract) +
              "."
            : p.hosting === "year"
              ? "Cena hostingu po pierwszym roku do ustalenia."
              : "";
          q("#ec-items").innerHTML = a.items.length
            ? a.items
                .map(
                  (x) =>
                    `<div class="ec-line"><span>${escapeTemplateText(x[0])}</span><span>${money(x[1])}</span></div>`,
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
            ...(p.recurring && !directSummaryMode && s.billing==="annual" ? [["Promocja pakietu "+p.name, money(aboPricing.annual) + " / rok zamiast " + money(aboPricing.regularAnnual) + " / rok"]] : []),
            ...(cennik.seo.length?[["SEO",seoName(p,s.seo)]]:[]),
            ["Dodatkowe usługi SEO", seoServices.filter(([key]) => serviceAvailable(p,key)&&s[key])
              .map(([,label]) => label).join(", ") || "Bez dodatkowych usług"],
            ...(cennik.kontakt.length?[["Kontakt",contacts[s.contact][0]]]:[]),
            ...(expansion.dodatkowyJezyk?[[expansion.dodatkowyJezyk.nazwa,(s.languages||[]).join(", ")||"Bez dodatkowych języków"]]:[]),
            ["Wybrane dodatki", a.items.length ? a.items.map(([name])=>escapeTemplateText(name)).join(", ") : "Bez dodatków"],
            ...(annualServices.length?[["Hosting / opieka",hostingDescription(p)]]:[])
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
          const billingSwitch = p.recurring && directSummaryMode
            ? '<label class="ec-summary-billing ec-existing-toggle" for="ec-summary-installments">' +
                '<span class="ec-summary-billing-copy"><strong>Płatność w ratach</strong></span>' +
                '<input id="ec-summary-installments" type="checkbox" role="switch" aria-label="Płatność w ratach miesięcznych"' + (s.billing==="monthly" ? ' checked' : '') + '>' +
                '<span class="ec-switch-track" aria-hidden="true"></span></label>'
            : '';
          const totalValue = p.recurring && directSummaryMode && s.billing === "annual"
            ? '<del class="ec-summary-regular-price">' + money(contractBase("annual",true)+a.extra) + '</del> <strong class="ec-summary-promo-price">' + money(total) + '</strong> <small class="ec-summary-promo-label">· promocja</small>'
            : money(total);
          const totalBlock = '<div class="ec-summary-total">' + billingSwitch +
            row(p.recurring ? "Łącznie za "+contractPeriod : "Projekt i usługi łącznie",totalValue) +
            (p.recurring ? row("Suma dodatków",money(a.extra)) + row("Rata pakietu i dodatków",directSummaryMode ? directMiniSchedule() : miniSchedule()) :
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
            '<p class="ec-note ec-vat-note">Wszystkie podane ceny są kwotami netto. Należy doliczyć 23% VAT.</p>';
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
            '<p class="ec-muted">Włącz język i wybierz go z listy. Możesz dodać kilka wersji językowych. Cena: ' + money(languagePrice) + ' za każdy język jednorazowo. Tłumaczenie treści jest wyceniane osobno.</p>' +
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
          q("#ec-footer-note").hidden=last;
          q("#ec-footer-note").textContent=last
            ? ""
            : current.recurring?"Abonament: umowa na "+contractPeriod+".":"Strona i dodatki jednorazowo; usługi roczne płatne z góry.";
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
        q("#ec-summary").addEventListener("change", event => {
          if (!event.target.matches("#ec-summary-installments") || !current.recurring || !directSummaryMode) return;
          const billing = event.target.checked ? "monthly" : "annual";
          states[current.id].billing = billing;
          all('[name="ec-billing"]').forEach(input => input.checked = input.value === billing);
          update();
          summary(true);
          q("#ec-summary-installments")?.focus({preventScroll:true});
        });
        let scrollBeforeModal = false;
        function open(id, baseChoice, button) {
          const target = packages.find((p) => p.id === id);
          if (!target) return;
          current = target;
          opener = button || null;
          directSummaryMode=!!baseChoice;
          if (baseChoice) {
            states[id] = defaults(current);
            if (current.recurring) states[id].billing = "annual";
          }
          scrollBeforeModal = document.body.classList.contains("eni-calc-scroll-locked");
          document.body.classList.add("eni-calc-scroll-locked");
          q("#ec-modal-stage").hidden = false;
          syncModalPortal();
          fill();
          clearTemplateRequired();
          step(baseChoice ? (hasTemplateLibrary(current)?5:4) : 0, baseChoice);
          q("#ec-modal-stage").scrollTop = 0;
          q("#ec-close").focus({preventScroll:true});
        }
        function close() {
          q("#ec-modal-stage").hidden = true;
          syncModalPortal();
          document.body.classList.toggle("eni-calc-scroll-locked",scrollBeforeModal);
          opener?.focus({preventScroll:true});
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
          if(hasTemplateLibrary(current) && wizardStep===0 && !states[current.id].templateId) {
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
        // Boxy w index.html powiązane z ID w pricing.js są jedynym źródłem oferty. Usuń stare karty Elementora przy wdrożeniu.
        const decimalMoney = (n) =>
          new Intl.NumberFormat("pl-PL", {
            useGrouping: "always",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(n) + " zł netto";
        function hostingDescription(p=current){
          const st=states[p.id];
          const parts=annualServices.filter(x=>annualSelected(p,st,x.id)).map(x=>x.nazwa+": "+(annualIncluded(p,x.id)?"W cenie pakietu":money(x.cena)+" / rok"));
          return parts.length?parts.join("; "):"Bez dodatkowych usług rocznych";
        }
        function annualCostLabel(p=current){
          const selected=annualExtras(p,states[p.id]);
          return selected.length===1?selected[0].nazwa+" / rok":"Usługi roczne / rok";
        }
        function paymentInfo() {
          const p = current, a = calculate();
          const principal = p.price + a.extra;
          const deposit = Math.round(Math.round(principal*100)*depositPercent/100)/100;
          return {
            eligible: !p.recurring,
            principal,
            deposit,
            remaining: (Math.round(principal*100)-Math.round(deposit*100))/100,
            hostInitial: a.host,
            initial: deposit + a.host,
            total: a.total
          };
        }
        function paymentDescription() {
          const b = paymentInfo();
          if (!b.eligible) return "";
          return "Zaliczka "+depositPercent+"% za projekt i dodatki: " + decimalMoney(b.deposit) +
            (b.hostInitial ? " + roczne usługi płatne z góry: " + money(b.hostInitial) : "") + ".";
        }
        function remainingPaymentDescription() {
          const b = paymentInfo();
          if(!b.eligible) return "";
          return "Pozostałe "+remainingPercent+"% projektu: " + decimalMoney(b.remaining) +
            ". Termin zapłaty zgodnie z umową.";
        }
        function singlePaymentUpdate() {
          baseUpdate();
          const b = paymentInfo();
          q("#ec-payment-aside").hidden = !b.eligible;
          if(b.eligible) {
            q("#ec-host-label").textContent=annualCostLabel();
            q("#ec-host-cost").textContent = money(b.hostInitial);
            q("#ec-total").textContent = money(b.initial);
            q("#ec-total-label").textContent = "Zaliczka "+depositPercent+"% + usługi na start";
            q("#ec-payment-aside").innerHTML =
              '<span>Do zapłaty na start</span><strong>' + decimalMoney(b.initial) +
              '</strong><p class="ec-muted">Pozostałe '+remainingPercent+'% projektu: ' + decimalMoney(b.remaining) + '</p>';
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
            h.textContent = "Zaliczka "+depositPercent+"% wartości projektu";
            const first = document.createElement("p");
            first.textContent = depositPercent+"% za projekt i dodatki: " + decimalMoney(b.deposit);
            const second = document.createElement("p");
            second.textContent = "Usługi roczne płatne z góry: " + money(b.hostInitial);
            const amount = document.createElement("p");
            amount.classList.add("ec-amount-bold");
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
            ...(expansion.dodatkowaSekcja?[expansion.dodatkowaSekcja.nazwa+": "+s.sections]:[]),
            ...(expansion.dodatkowaPodstrona?[expansion.dodatkowaPodstrona.nazwa+": "+s.pages]:[]),
            ...(cennik.seo.length?["SEO: "+seoName(p,s.seo)]:[]),
            ...seoServices.filter(([key])=>serviceAvailable(p,key)).map(([key,label,price]) =>
              label + ": " + (s[key] ? (serviceIncluded(p,key)?"W cenie pakietu":"Dodane, " + money(price)) : "Nie")),
            ...(cennik.kontakt.length?["Kontakt: "+contacts[s.contact][0]]:[]),
            ...(cennik.szkolenia.length?["Szkolenie: "+trainingLabel(),"Dopłata za zmianę szkolenia: "+money(trainingCharge())]:[]),
            (expansion.dodatkowaRundaPoprawek?.nazwa||"Sesje poprawek w pakiecie")+": " +
              (p.revisions + s.revisions) +
              " (" +
              p.revisions +
              " w cenie, " +
              s.revisions +
              " dodatkowych)",
            ...(annualServices.length?["Usługi roczne: "+hostingDescription(p)]:[]),
            ...(expansion.dodatkowyJezyk?[expansion.dodatkowyJezyk.nazwa+": "+((s.languages||[]).join(", ")||"Nie")]:[]),
            ...extraServices.filter(([key])=>serviceAvailable(p,key)).map(([key,label,price,mayBeIncluded]) =>
              label + ": " + (s[key] ? ((mayBeIncluded && p.includedAddons[key]) ? "W cenie pakietu" : "Dodane, " + money(price)) : "Nie")),
            "Czy ma stronę/sklep: " + (q("#ec-existing-check").checked ? "Tak" : "Nie"),
            "Link do istniejącej strony: " + (q("#ec-existing-check").checked ? q("#ec-existing-url").value.trim() : "Brak"),
            "",
            "POZOSTAŁY ZAKRES BAZOWY",
            ...fixed(p).filter((x) => x[1]).map((x) => "W cenie: " + x[0]),
            "",
            "WYCENA",
            "Cena bazowa: " +
              money(a.year) +
              (p.recurring ? " / "+contractPeriod : " za wykonanie"),
            ...a.items.map((x) => x[0] + ": " + money(x[1])),
            (p.recurring
              ? "Dodatki — wartość za całą umowę: "
              : "Suma dodatków: ") + money(a.extra),
            "Dodatkowe usługi roczne (hosting/opieka): " + money(a.host),
            (p.recurring?"Łącznie za "+contractPeriod:"Łącznie w pierwszym roku")+": "+money(a.total),
            "",
          ];
          if (p.recurring)
            lines.push(
              "Łączna płatność za pakiet i dodatki: " + (directSummaryMode ? directMiniSchedule() : miniSchedule()),
              "Umowa: "+contractPeriod,
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
              "Zaliczka "+depositPercent+"% wartości projektu: " + decimalMoney(b.deposit),
              "Hosting i opieka za rok z góry: " + money(b.hostInitial),
              "Do zapłaty na start: " + decimalMoney(b.initial),
              remainingPaymentDescription(),
            );
          if (p.hosting === "year")
            lines.push("Hosting po pierwszym roku: cena do ustalenia.");
          lines.push(
            ...(expansion.dodatkowaRundaPoprawek ? ["Dodatkowa sesja poprawek: " + money(revisionPrice) + " / sesję."] : []),
            "Wszystkie podane ceny są kwotami netto. Należy doliczyć 23% VAT.",
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
        if (production) {
          q("#ec-form-demo").textContent="Dane wykorzystamy do kontaktu w sprawie wybranego pakietu.";
          q("#ec-send-result details").hidden=true;
        }
        q("#ec-lead-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          if (q("#ec-lead-form button[type=submit]").disabled) return;
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
          if (!production) {
          const nl = String.fromCharCode(10),
            quote = quoteText();
          q("#ec-quote-payload").value = quote;
          const message = [
            "Odbiorca: adres agencji do wskazania przy wdrożeniu",
            "Temat: Zapytanie — " + current.name,
            "",
            "DANE KONTAKTOWE",
            "Imię i nazwisko / Firma: " + name.value,
            "E-mail: " + email.value,
            "Telefon: " + (phone.value || "Nie podano"),
            "Czy posiada stronę/sklep: " + (existing.checked ? "Tak" : "Nie"),
            "Link: " + (existing.checked ? site.value : "Nie dotyczy"),
            "",
            quote,
          ].join(nl);
          q("#ec-message-preview").textContent = message;
          q("#ec-send-status").textContent =
            "Dane są poprawne. Wersja lokalna nie wysłała e-maila.";
          q("#ec-send-result").hidden = false;

            return;
          }
          const quote=quoteText();
          q("#ec-quote-payload").value=quote;
          const button=q("#ec-lead-form button[type=submit]");
          if(button.disabled)return;
          button.disabled=true;
          const original=button.innerHTML;
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
            button.disabled=false;button.innerHTML=original;
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
          const annual=billing==="annual", extraCents=Math.round(extra*100);
          let payments, bases;
          if(annual){
            bases=annualPeriods.map((n,i)=>prorate(i===0?aboPricing.annual:aboPricing.regularAnnual,n));
            let elapsed=0,allocated=0;
            payments=annualPeriods.map((n,i)=>{
              elapsed+=n;
              const cumulative=Math.round(extraCents*elapsed/months);
              const amount=bases[i]+cumulative-allocated;
              allocated=cumulative;
              return amount;
            });
          }else{
            const base=Math.round(aboPricing.monthly*100), total=base*months+extraCents;
            bases=Array(months).fill(base);
            if(settings.zaokraglanieRat){
              const full=Math.floor(total/(months*100));
              const remainder=total-full*months*100;
              const rate=(full+(remainder>Math.round(settings.progZaokraglania*100)*months?1:0))*100;
              payments=Array(months).fill(rate);
            }else{
              const rate=Math.floor(total/months);
              payments=Array(months).fill(rate);
              payments[months-1]=total-rate*(months-1);
            }
          }
          return {annual,count:payments.length,regular:payments[0]/100,last:payments[payments.length-1]/100,
            extraPart:(payments[0]-bases[0])/100,baseFirst:bases[0]/100,contract:payments.reduce((sum,n)=>sum+n,0)/100,
            payments:payments.map(n=>n/100)};
        }
        function miniPlan(billing=states[current.id].billing){return installmentPlan(calculate().extra,billing);}
        function directMiniSchedule(billing=states[current.id].billing){
          const b=miniPlan(billing);
          if(b.annual){
            if(b.count===1)return "Jednorazowa płatność "+money(b.regular)+(months===12?" / rok":" / "+contractPeriod);
            return b.payments.map((amount,i)=>(i+1)+". okres ("+monthLabel(annualPeriods[i])+"): "+money(amount)).join("; ");
          }
          if(b.count===1)return "1 rata "+money(b.regular)+" / mc";
          if(b.regular===b.last)return b.count+" rat po "+money(b.regular)+" / mc";
          return (b.count-1)+" rat po "+money(b.regular)+" / mc i ostatnia "+money(b.last);
        }
        function miniSchedule(billing=states[current.id].billing){
          const b=miniPlan(billing);
          if(b.annual&&b.count===1)return (months===12?"1 płatność roczna":"1 płatność za "+contractPeriod)+" w wysokości "+decimalMoney(b.regular);
          if(!b.annual&&b.regular===b.last)return b.count+" raty miesięczne po "+money(b.regular);
          return directMiniSchedule(billing);
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
              (states[current.id].billing === "annual" ? (months<12?contractPeriod:"rok") : "ratę")
            : "Dodatki jednorazowe";
          q("#ec-items-title").textContent = mini
            ? "Dodatki — wartość za całą umowę"
            : "Wybrane dodatki";
          all("[data-extra-cost]").forEach((e) => {
            e.textContent =
              "+" + money(e.dataset.extraCost === "section" ? sectionPrice : pagePrice) + e.dataset.extraUnit +
              " · " +
              (mini ? "wliczone w raty" : "jednorazowo");
          });
          if (!mini) return;
          const a = calculate(),
            b = miniPlan();
          q("#ec-base").textContent = b.annual ? decimalMoney(b.regular) : money(b.regular);
          q("#ec-period").textContent = b.annual
            ? (months<12?"za "+contractPeriod+" — pakiet i dodatki":months>12?"pierwsza płatność roczna za pakiet i dodatki":"rocznie za pakiet i dodatki")
            : "miesięcznie za pakiet i dodatki";
          q("#ec-base-label").textContent = b.annual
            ? "Baza / "+(months<12?contractPeriod:"rok")
            : "Rata bazowa";
          q("#ec-base-cost").textContent = money(b.baseFirst);
          q("#ec-extra").textContent = b.annual ? decimalMoney(b.extraPart) : money(b.extraPart);
          q("#ec-project-subtotal-label").textContent = b.annual ? "Pakiet + dodatki / "+(months<12?contractPeriod:"rok") : "Pakiet + dodatki / mies.";
          q("#ec-project-subtotal").textContent = b.annual ? decimalMoney(b.regular) : money(b.regular);
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
            money(monthly.regular) + " / mies.";
          q("#ec-monthly-detail").textContent =
            miniSchedule("monthly") + " za pakiet i dodatki.";
          q("#ec-annual-rate").textContent =
            decimalMoney(annual.regular) + annualUnit;
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
          // Stan przycisku w czasie wysyłki kontroluje wyłącznie obsługa submit.
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
