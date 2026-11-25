const {chromium}=require('playwright');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const oldRef='f3b466a59ba1e0defd2d82e983c60de9495572af';
const dir=process.cwd();
fs.mkdirSync('qa-output',{recursive:true});
const baseline=path.join(dir,'qa-output','baseline-source');
fs.mkdirSync(baseline,{recursive:true});
for(const name of ['index.html','kalkulator.js','kalkulator.css','pakiety-stron.css','cennik.js']){
 fs.writeFileSync(path.join(baseline,name),cp.execFileSync('git',['show',oldRef+':'+name],{maxBuffer:20*1024*1024}));
}
let mutation=false;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 let location=uri.startsWith('/baseline/')?path.join(baseline,uri.slice(10)):path.join(dir,uri.slice(1));
 if(uri.startsWith('/wp-content/uploads/eniverse-kalkulator/Strony internetowe/'))location=path.join(dir,path.basename(uri));
 if(uri==='/')location=path.join(dir,'index.html');
 if(!location.startsWith(dir+path.sep)||!fs.existsSync(location)||!fs.statSync(location).isFile()){res.writeHead(404);return res.end();}
 let buf=fs.readFileSync(location);
 if(mutation&&location===path.join(dir,'cennik.js'))buf=Buffer.concat([buf,Buffer.from('\nwindow.ENIVERSE_CENNIK.dodatki[0].nazwa="Mapy Apple";window.ENIVERSE_CENNIK.dodatki.push({id:"chat",nazwa:"Czat na stronie",cena:150});window.ENIVERSE_CENNIK.dodatki=window.ENIVERSE_CENNIK.dodatki.filter(x=>x.id!=="newsletter");window.ENIVERSE_CENNIK.pakiety=window.ENIVERSE_CENNIK.pakiety.filter(x=>x.id!=="mini");window.ENIVERSE_CENNIK.pakiety.push({...window.ENIVERSE_CENNIK.pakiety[0],id:"testpakiet",nazwa:"Pakiet testowy",cena:999});')]);
 res.writeHead(200,{'Content-Type':types[path.extname(location)]||'application/octet-stream','Cache-Control':'no-store'});res.end(buf);
});
const counts={checks:0,failures:[]};
function check(x,msg){counts.checks++;assert.ok(x,msg);}
const norm=s=>s.replace(/\s+/g,' ').trim();
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://eniverse.pl/wp-json/eniverse/v1/templates',r=>r.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:'[]'}));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
 async function load(p){await page.goto(url+p);await page.waitForSelector('[data-choose="start"]');}
 async function direct(id){await page.locator('[data-choose="'+id+'"]').click();await page.waitForSelector('#ec-final:not([hidden])');}
 async function close(){await page.locator('#ec-close').click();}
 try{
   await load('/baseline/index.html');await page.screenshot({path:'qa-output/baseline-desktop.png',fullPage:true});
   const baselineCount=await page.locator('[data-ec-plan]').count();check(baselineCount===5,'Baseline: pięć kart');
   await load('/index.html');await page.screenshot({path:'qa-output/current-desktop.png',fullPage:true});
   check(await page.locator('[data-ec-plan]').count()===5,'Aktualna: pięć kart');
   for(const [id,price] of [['mini','590'],['start','1 190'],['one','1 690'],['wiz','2 490'],['firm','3 490']]){
     await direct(id);
     check(norm(await page.locator('#ec-summary').innerText()).includes(price),'Cena '+id);
     if(id==='mini'){
       check(norm(await page.locator('#ec-summary').innerText()).includes('790 zł 590 zł'),'Promocja roczna');
       await page.locator('#ec-summary-installments').check();
       check(norm(await page.locator('#ec-summary').innerText()).includes('12 rat po 69 zł'),'Raty');
       await page.locator('#ec-summary-installments').uncheck();
       check(norm(await page.locator('#ec-summary').innerText()).includes('Jednorazowa płatność 590 zł/rok'),'Powrót do rocznej');
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
     await page.locator('#ec-addon-maps').check();await page.locator('#ec-next').click();
     await page.locator('[data-counter="sections"][data-delta="1"]').click();
     await page.locator('#ec-seo-addon-googleAds').check();await page.locator('#ec-next').click();
     await page.locator('input[name="ec-revisions"][value="1"]').check();
     await page.locator('#ec-next').click();
     await page.locator('.ec-language-toggle').first().check();
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
   await page.setViewportSize({width:1440,height:1000});mutation=true;await load('/index.html');
   check(await page.locator('[data-ec-plan="mini"]').count()===0,'Usunięty pakiet');
   check(await page.locator('[data-ec-plan="testpakiet"]').count()===1,'Nowy pakiet');
   await page.locator('[data-configure="testpakiet"]').click();
   await page.locator('input[name="ec-template-choice"][value="later"]').check();await page.locator('#ec-next').click();
   check((await page.locator('#ec-addons').innerText()).includes('Mapy Apple'),'Zmiana nazwy');
   check(await page.locator('#ec-addon-newsletter').count()===0,'Usunięty dodatek');
   await page.locator('#ec-addon-chat').check();check((await page.locator('#ec-items').innerText()).includes('Czat na stronie'),'Nowy dodatek wyceniany');
   check(errors.length===0,'Błędy JS: '+errors.join('; '));
 }catch(e){counts.failures.push(e.message);await page.screenshot({path:'qa-output/failure.png',fullPage:true}).catch(()=>{});}
 finally{console.log('QA_RESULT '+JSON.stringify({...counts,errors}));await browser.close();server.close();fs.rmSync(baseline,{recursive:true,force:true});if(counts.failures.length)process.exitCode=1;}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
