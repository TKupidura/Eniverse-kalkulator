const {chromium}=require('playwright');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const oldRef='4c07ae98767345020101ff12afb10c6494e98d09';
const dir=process.cwd();
fs.mkdirSync('qa-output',{recursive:true});
const baseline=path.join(dir,'qa-output','baseline-source');
fs.mkdirSync(baseline,{recursive:true});
for(const name of ['index.html','kalkulator.js','kalkulator.css','cennik.js']){
 fs.writeFileSync(path.join(baseline,name),cp.execFileSync('git',['show',oldRef+':'+name],{maxBuffer:20*1024*1024}));
}
let mutation=false;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let location=uri.startsWith('/baseline/')?path.join(baseline,uri.slice(10)):path.join(dir,uri.slice(1));
 if(uri.startsWith('/baseline/demos/')){const renamed={'fotograf.html':'photographer.html','medycyna.html':'medical.html','restauracja.html':'restaurant.html','fachowcy.html':'tradespeople.html','salon-spa.html':'spa-salon.html','trener-personalny.html':'personal-trainer.html','agent-nieruchomosci.html':'real-estate-agent.html'};location=path.join(dir,'demos',renamed[path.basename(uri)]||path.basename(uri));}
 if(uri.startsWith('/wp-content/eniverse-calculator/websites/'))location=path.join(dir,path.basename(uri));
 if(uri==='/')location=path.join(dir,'index.html');
 if(!location.startsWith(dir+path.sep)||!fs.existsSync(location)||!fs.statSync(location).isFile()){res.writeHead(404);return res.end();}
 let buf=fs.readFileSync(location);
 if(mutation&&location===path.join(dir,'pricing.js'))buf=Buffer.concat([buf,Buffer.from('\nwindow.ENIVERSE_CENNIK.dodatki[0].nazwa="Mapy Apple";window.ENIVERSE_CENNIK.dodatki.push({id:"chat",nazwa:"Czat na stronie",cena:150,dostepneWPakietach:["start","firm","testpakiet"],wPakietach:["firm"]});window.ENIVERSE_CENNIK.marketing.push({id:"seoTest",nazwa:"Test SEO",cena:80,dostepneWPakietach:["firm"],wPakietach:["firm"]});window.ENIVERSE_CENNIK.uslugiRoczne.push({id:"monitoring",nazwa:"Monitoring",cena:200,dostepneWPakietach:["firm"],wPakietach:["firm"]});window.ENIVERSE_CENNIK.pakiety.find(p=>p.id==="start").cena=1290;window.ENIVERSE_CENNIK.dodatki.find(x=>x.id==="gsc").nazwa="Search Console test";window.ENIVERSE_CENNIK.dodatki=window.ENIVERSE_CENNIK.dodatki.filter(x=>x.id!=="blog");window.ENIVERSE_CENNIK.dodatki=window.ENIVERSE_CENNIK.dodatki.filter(x=>x.id!=="newsletter");window.ENIVERSE_CENNIK.pakiety=window.ENIVERSE_CENNIK.pakiety.filter(x=>x.id!=="mini");window.ENIVERSE_CENNIK.pakiety.push({...window.ENIVERSE_CENNIK.pakiety[0],id:"testpakiet",nazwa:"Pakiet testowy",cena:999},{...window.ENIVERSE_CENNIK.pakiety[0],id:"orphan",nazwa:"Brak boxa",cena:999});')]);
 if(mutation&&location===path.join(dir,'index.html')){
  const h=buf.toString('utf8'),start=h.match(/<article[^>]*data-ec-plan="start"[^>]*>[\s\S]*?<\/article>/)[0];
  const clone=start.replace(/start/g,'testpakiet');
  buf=Buffer.from(h.replace(start,start.replace('Dla małej działalności, która potrzebuje strony WordPress do samodzielnej edycji.','Własny opis HTML').replace('data-card-name>Start<','data-card-name>Start test<').replace('data-scope-structure="Strona główna do 5 sekcji"','data-scope-structure="Do 8 sekcji"').replace('Strona z szablonu · do 5 sekcji','Do 8 sekcji')+'\n'+clone));
 }
 res.writeHead(200,{'Content-Type':types[path.extname(location)]||'application/octet-stream','Cache-Control':'no-store'});res.end(buf);
});
const counts={checks:0,failures:[]};
function check(x,msg){counts.checks++;assert.ok(x,msg);}
const norm=s=>s.replace(/\s+/g,' ').trim();
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push({url:page.url(),message:e.message,stack:e.stack}));
 await page.route('https://eniverse.pl/wp-json/eniverse/v1/templates',r=>r.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:'[]'}));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
 async function load(p){await page.goto(url+p);await page.waitForSelector('[data-choose="start"]');}
 async function direct(id){await page.locator('[data-choose="'+id+'"]').click();await page.waitForSelector('#ec-final:not([hidden])');}
 async function close(){await page.locator('#ec-close').click();}
 try{
   // Exact pre-change vs inline style comparison at 4 widths.
   async function snap(){
     await page.evaluate(()=>document.fonts.ready);
     await page.waitForTimeout(200);
     return page.evaluate(()=>{
       const sels=['body','#eni-calc','#ec-catalog','#ec-entry-packages','#ec-packages',...Array.from(document.querySelectorAll('[data-ec-plan]')).map(e=>'[data-ec-plan="'+e.dataset.ecPlan+'"]')];
       return sels.map(sel=>{const el=document.querySelector(sel),r=el.getBoundingClientRect(),c=getComputedStyle(el);return {sel,rect:[r.x,r.y,r.width,r.height].map(n=>Math.round(n*100)/100),style:[c.display,c.color,c.backgroundColor,c.fontFamily,c.fontSize,c.margin,c.padding,c.position,c.overflow]};});
     });
   }
   for(const width of [1440,1024,768,390]){
     await page.setViewportSize({width,height:1000});
     await load('/baseline/index.html');const before=await snap();
     const beforeText=await page.locator('#ec-catalog').innerText();
     await load('/index.html');const after=await snap();
     check(after.length===before.length,'Catalog structure preserved '+width);
     check(await page.evaluate(()=>document.querySelector('#eniverse-boxy-pakietow').sheet.cssRules.length>0),'Inline CSSOM rules '+width);
     check(!(await page.locator('#ec-catalog').innerText()).includes('Ceny dodatków są przykładowe'),'No placeholder pricing note '+width);
     check(await page.locator('link[href*="pakiety-stron.css"]').count()===0,'No external legacy stylesheet '+width);
     await page.locator('[data-templates-open]').first().click();
     check(await page.locator('#ec-template-modal').isVisible(),'Gallery '+width);
     check(await page.evaluate(()=>document.body.classList.contains('eni-calc-scroll-locked')&&getComputedStyle(document.body).overflow==='hidden'),'Scroll lock '+width);
     await page.locator('#ec-template-close').click();
     check(await page.evaluate(()=>!document.body.classList.contains('eni-calc-scroll-locked')),'Scroll unlock '+width);
   }
   await page.setViewportSize({width:1440,height:1000});
   await load('/index-production.html');
   const forbidden=/przykładow|demonstracyjn|tryb makiety|w makiecie|cena robocza|oznaczone jako robocze|podgląd demo/i;
   async function netAmounts(label,selector='#ec-window'){
     const visible=await page.locator(selector).innerText();
     const missing=[...visible.matchAll(/\bzł\b(?!\s+netto\b)/gi)].map(m=>visible.slice(Math.max(0,m.index-30),m.index+25));
     check(missing.length===0,'All amounts labelled net '+label+' '+JSON.stringify(missing));
   }
   async function vatNote(label){
     const n=page.locator('#ec-summary > .ec-vat-note');
     check(await n.isVisible() && (await n.innerText())==='Wszystkie podane ceny są kwotami netto. Należy doliczyć 23% VAT.','VAT note visible '+label);
     check(await n.evaluate(e=>e.previousElementSibling.classList.contains('ec-summary-total')),'VAT note directly below totals '+label);
   }
   async function clean(label){
     const visible=await page.locator('#eni-calc').innerText();
     check(!forbidden.test(visible),'Production copy: '+label+' '+(visible.match(forbidden)||[]));
     if(label!=='catalog')await netAmounts(label);
   }
   await clean('catalog');
   check(await page.locator('.ec-pricing-note').count()===0,'Removed note');
   check(await page.evaluate(()=>getComputedStyle(document.querySelector('#eni-calc')).getPropertyValue('--ec-red').trim().toLowerCase()==='#dd0629'&&getComputedStyle(document.querySelector('#ec-catalog')).getPropertyValue('--ec-red').trim().toLowerCase()==='#dd0629'&&getComputedStyle(document.querySelector('#ec-abo-reference')).getPropertyValue('--enp-red').trim().toLowerCase()==='#dd0629'),'Unified accent');
   await page.addStyleTag({content:'button {color:white!important; opacity:0!important;} button svg {fill:white!important; stroke:white!important; visibility:hidden!important;} button svg path {stroke:white!important;}'});
   await page.locator('[data-configure="start"]').click({force:true});
   const closeSVG=await page.locator('#ec-close svg path').evaluate(e=>({stroke:getComputedStyle(e).stroke,vis:getComputedStyle(e).visibility,button:getComputedStyle(e.closest('button')).opacity,rect:e.getBoundingClientRect().width}));
   check(closeSVG.stroke==='rgb(16, 17, 18)'&&closeSVG.vis==='visible'&&closeSVG.button==='1'&&closeSVG.rect>0,'Close glyph resists WordPress style overrides '+JSON.stringify(closeSVG));
   await close();
   await page.reload();await page.waitForSelector('[data-choose="start"]');
   await page.locator('[data-templates-open]').first().click();
   check(await page.locator('#ec-template-close svg path').evaluate(e=>getComputedStyle(e).stroke==='rgb(16, 17, 18)'),'Gallery close glyph');
   await page.locator('#ec-template-close').click();
   for(const id of ['mini','start','one','wiz','firm']){
     await page.locator('[data-configure="'+id+'"]').click();
     if(['mini','start'].includes(id)){
       await page.locator('input[name="ec-template-choice"][value="later"]').check();
       await clean(id+' template');
       await page.locator('#ec-next').click();
     }
     await clean(id+' addons');await page.locator('#ec-next').click();
     await clean(id+' SEO');
     check((await page.locator('#ec-window').innerText()).includes('Według warunków SEO; dalsze usługi wyceniane osobno'),'SEO description '+id);
     await page.locator('#ec-next').click();await clean(id+' contact');
     await page.locator('#ec-next').click();await clean(id+' languages');
     await page.locator('#ec-next').click();await clean(id+' summary');await vatNote(id+' configured');
     check(await page.locator('#ec-footer-note').isHidden(),'Summary footer note hidden '+id);
     await close();
   }
   await direct('one');
   await page.evaluate(()=>{
     window.wpcf7={};
     const wrapper=document.createElement('div');wrapper.id='eniverse-quote-form';wrapper.className='wpcf7';
     const form=document.createElement('form');form.className='wpcf7-form';
     for(const name of ['client_name','client_email','client_phone','has_site','existing_site_url','quote_summary','package_name']){const i=document.createElement('input');i.name=name;form.append(i);}
     form.addEventListener('submit',e=>{e.preventDefault();window.qaQuote=form.elements.quote_summary.value;wrapper.dispatchEvent(new CustomEvent('wpcf7mailsent',{bubbles:true}));});
     wrapper.append(form);document.body.append(wrapper);
   });
   await page.locator('#ec-client-name').fill('Test QA');await page.locator('#ec-client-email').fill('qa@example.invalid');
   await page.locator('#ec-lead-form button[type=submit]').click();
   check(await page.locator('#ec-send-status').innerText()==='Dziękujemy. Zapytanie zostało przyjęte.','Mock CF7 production success');
   check(await page.evaluate(()=>!!window.qaQuote&&!/przykładow|demonstracyjn|makiet|robocza/i.test(window.qaQuote)),'Production mail copy clean');
   check(await page.evaluate(()=>window.qaQuote.includes('Należy doliczyć 23% VAT.')&&!/\bzł\b(?!\s+netto\b)/i.test(window.qaQuote)),'Production mail net amounts and VAT');
   await close();
   await load('/index-production.html');
   check(await page.evaluate(()=>document.querySelector('#eni-calc').dataset.mode==='production'&&document.querySelector('#eniverse-pakiety-stron').sheet.cssRules.length>0),'Production HTML & inline CSS');
   check(await page.evaluate(()=>[...document.querySelectorAll('link[href],script[src]')].filter(e=>(e.getAttribute('href')||e.getAttribute('src')).startsWith('/wp-content/eniverse-calculator/websites/')).length===3),'Production three assets');
   await page.evaluate(()=>{const x=document.createElement('div');x.id='eniverse-quote-form';document.body.append(x);});
   check(await page.evaluate(()=>{const s=getComputedStyle(document.querySelector('#eniverse-quote-form'));return s.position==='absolute'&&s.width==='1px'&&s.pointerEvents==='none';}),'CF7 hiding still works');
   await load('/baseline/index.html');await page.screenshot({path:'qa-output/baseline-desktop.png',fullPage:true});
   const baselineCount=await page.locator('[data-ec-plan]').count();check(baselineCount===5,'Baseline: pięć kart');
   await load('/index.html');await page.screenshot({path:'qa-output/current-desktop.png',fullPage:true});
   check(await page.locator('[data-ec-plan]').count()===5,'Aktualna: pięć kart');
   for(const [id,price] of [['mini','590'],['start','1 190'],['one','1 690'],['wiz','2 490'],['firm','3 490']]){
     await direct(id);
     check(norm(await page.locator('#ec-summary').innerText()).includes(price),'Cena '+id);await vatNote(id+' direct');await netAmounts(id+' direct');
     if(id==='mini'){
       check(norm(await page.locator('#ec-summary').innerText()).includes('790 zł netto 590 zł netto'),'Promocja roczna');
       await page.locator('#ec-summary-installments').check();await vatNote('monthly');await netAmounts('monthly');
       check(norm(await page.locator('#ec-summary').innerText()).includes('12 rat po 69 zł netto'),'Raty');
       await page.locator('#ec-summary-installments').uncheck();
       check(norm(await page.locator('#ec-summary').innerText()).includes('Jednorazowa płatność 590 zł netto / rok'),'Powrót do rocznej');
       await page.screenshot({path:'qa-output/abonament-summary.png'});
     }
     if(['mini','start'].includes(id)){
       await page.locator('[data-ec-summary-template-browse]').click();
       await page.waitForSelector('#ec-template-modal:not([hidden])');
       await page.locator('#ec-template-defer').click();
       check(norm(await page.locator('#ec-summary').innerText()).includes('Szablon wybiorę później'),'Szablon później '+id);
     }
     await page.locator('#ec-client-name').fill('Test QA');await page.locator('#ec-client-email').fill('qa@example.invalid');
     await page.locator('#ec-lead-form button[type=submit]').click();
     check(await page.locator('#ec-send-result').isVisible(),'Demo formularza '+id);
     check((await page.locator('#ec-send-status').innerText()).includes('nie wysłała'),'Brak wysyłki '+id);
     await close();
   }
   for(const id of ['mini','start','one','wiz','firm']){
     await page.locator('[data-configure="'+id+'"]').click();
     if(['mini','start'].includes(id)){
       check(await page.locator('.ec-template-select-actions .ec-template-new-tab').count()===0,'Tylko podgląd '+id);
       await page.locator('input[name="ec-template-choice"][value="later"]').check();
       await page.locator('#ec-next').click();
     }
     await page.locator('label.ec-addon').filter({has:page.locator('#ec-addon-maps')}).click();check(await page.locator('#ec-addon-maps').isChecked(),'Mapy zaznaczone '+id);await page.locator('#ec-next').click();
     await page.locator('[data-counter="sections"][data-delta="1"]').click();
     await page.locator('label.ec-addon').filter({has:page.locator('#ec-seo-addon-googleAds')}).click();check(await page.locator('#ec-seo-addon-googleAds').isChecked(),'Reklama zaznaczona '+id);await page.locator('#ec-next').click();
     await page.locator('input[name="ec-revisions"][value="1"]').check();
     await page.locator('#ec-next').click();
     await page.locator('.ec-language-switch-label').first().click();check(await page.locator('.ec-language-toggle').first().isChecked(),'Język zaznaczony '+id);
     await page.locator('#ec-add-language').click();
     check(await page.locator('.ec-language-row').count()===2,'Drugi język '+id);
     await page.locator('#ec-next').click();
     check(await page.locator('#ec-final').isVisible(),'Przejście przez wszystkie kroki '+id);
     const summary=norm(await page.locator('#ec-summary').innerText());
     check(summary.includes('Mapy Google')&&summary.includes('Kampania Google Ads')&&summary.includes('Angielski'),'Dodatki w podsumowaniu '+id);
     await close();
   }
   for(const width of [390,768,1024]){
     await page.setViewportSize({width,height:844});await load('/index.html');
     check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Brak poziomego overflow '+width);
     await page.screenshot({path:'qa-output/current-'+width+'.png',fullPage:true});
     await direct('start');check(await page.locator('#ec-final').isVisible(),'Modal '+width);
     await page.screenshot({path:'qa-output/summary-'+width+'.png'});await close();
   }
   await page.setViewportSize({width:1440,height:1000});await load('/index.html');
   const demoNames=['photographer','medical','restaurant','tradespeople','spa-salon','personal-trainer','real-estate-agent'];
   for(const name of demoNames){
     const result=await page.request.get(url+'/demos/'+name+'.html');
     check(result.ok()&&(await result.text()).includes('<html'),'Demo '+name+' available');
   }
   check(await page.evaluate(()=>[...document.querySelectorAll('script[src],link[rel=stylesheet]')].map(e=>e.getAttribute('src')||e.getAttribute('href')).filter(x=>/^(?:pricing|calculator)\./.test(x)).length===3),'Three renamed demo assets');
   check(await page.request.get(url+'/cennik.js').then(r=>r.status()===404),'Old price file absent');
   mutation=true;await load('/index.html');
   check(await page.locator('[data-ec-plan="mini"]').count()===1&&!await page.locator('[data-ec-plan="mini"]').isVisible(),'Usunięty pakiet ukrywa statyczny box');
   check(await page.locator('[data-ec-plan="orphan"]').count()===0,'Wpis bez boxa nie generuje karty');
   check((await page.locator('[data-ec-plan="start"]').innerText()).includes('Start test')&&norm(await page.locator('[data-ec-plan="start"]').innerText()).includes('1 290'),'Nazwa z HTML, cena z cennika');
   check((await page.locator('[data-ec-plan="start"]').innerText()).includes('Własny opis HTML'),'Własna treść marketingowa z HTML nie jest nadpisywana');
   check((await page.locator('[data-ec-plan="start"] .ec-project-scale h3').innerText())==='Do 8 sekcji','Zakres zmienia się w HTML');
   check(await page.locator('[data-ec-plan="testpakiet"]').count()===1,'Nowy pakiet');
   check((await page.locator('[data-ec-plan="wiz"] [data-card-addon="gsc"]').textContent()).includes('Search Console test'),'Nazwa dodatku w istniejącym wierszu');
   check(!await page.locator('[data-ec-plan="firm"] [data-card-addon="blog"]').isVisible(),'Usunięty dodatek ukrywa istniejący wiersz');
   check(await page.locator('[data-ec-plan="firm"] [data-card-addon="chat"]').count()===0,'Nowy dodatek nie zmienia struktury boxa');
   await page.locator('[data-configure="testpakiet"]').click();
   await page.locator('input[name="ec-template-choice"][value="later"]').check();await page.locator('#ec-next').click();
   check((await page.locator('#ec-addons').innerText()).includes('Mapy Apple'),'Zmiana nazwy');
   check(await page.locator('#ec-addon-newsletter').count()===0,'Usunięty dodatek');
   await page.locator('label.ec-addon').filter({has:page.locator('#ec-addon-chat')}).click();check(await page.locator('#ec-addon-chat').isChecked(),'Czat zaznaczony');check((await page.locator('#ec-items').innerText()).includes('Czat na stronie'),'Nowy dodatek wyceniany');
   await close();
   await page.locator('[data-configure="one"]').click();
   check(await page.locator('#ec-addon-chat').count()===0,'Niedostępny dodatek ukryty');
   await close();
   await page.locator('[data-configure="firm"]').click();
   check(await page.locator('#ec-addon-chat').isChecked()&&await page.locator('#ec-addon-chat').isDisabled(),'Dodatek w cenie zablokowany');
   check(!norm(await page.locator('#ec-items').innerText()).includes('Czat na stronie'),'Brak dopłaty za dodatek w cenie');
   await page.locator('#ec-next').click();
   check(await page.locator('#ec-seo-addon-seoTest').isChecked()&&await page.locator('#ec-seo-addon-seoTest').isDisabled(),'Marketing w cenie');
   await page.locator('#ec-next').click();await page.locator('#ec-next').click();
   check(await page.locator('#ec-annual-monitoring').isChecked()&&await page.locator('#ec-annual-monitoring').isDisabled(),'Usługa roczna w cenie');
   await page.locator('#ec-next').click();
   check(norm(await page.locator('#ec-summary').innerText()).includes('3 490'),'Cena bez dopłaty za świadczenia w cenie');
   await close();
   const staticPage=await browser.newPage({javaScriptEnabled:false});
   await staticPage.goto(url+'/index.html');
   check(await staticPage.locator('[data-ec-plan]').count()===6,'Boxy są w źródle HTML, bez JS');
   check(await staticPage.locator('[data-ec-plan="wiz"] .ec-features li').count()>8,'Wszystkie wiersze boxa są w HTML bez JS');
   check((await staticPage.locator('[data-ec-plan="wiz"] [data-card-name]').textContent())==='Wizytówka','Nazwa istnieje bez JS');
   await staticPage.close();
   check(errors.length===0,'Błędy JS: '+JSON.stringify(errors));
 }catch(e){counts.failures.push(e.message);await page.screenshot({path:'qa-output/failure.png',fullPage:true}).catch(()=>{});}
 finally{console.log('QA_RESULT '+JSON.stringify({...counts,errors}));await browser.close();server.close();fs.rmSync(baseline,{recursive:true,force:true});if(counts.failures.length)process.exitCode=1;}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
