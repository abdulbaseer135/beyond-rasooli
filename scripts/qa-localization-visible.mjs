import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import en from '../src/messages/en.json' with {type:'json'};
import ps from '../src/messages/ps.json' with {type:'json'};
import fa from '../src/messages/fa.json' with {type:'json'};
const dictionaries={en,ps,fa};const base=process.env.QA_VISIBLE_BASE||'http://localhost:3100';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1280,height:900}});const results=[];const errors=[];page.on('pageerror',error=>errors.push(error.message));
const shared=new Set(['Beyond Rasooli','English','پښتو','دری','WhatsApp','Facebook','X','YouTube','Instagram','TikTok','name@example.com','Beyond Rasooli: {reason}']);
const english=new Set(Object.values(en).flatMap(values=>Object.values(values)).filter(value=>!shared.has(value)&&!value.includes('{')));
function text(locale,key){const [ns,name]=key.split('.');return dictionaries[locale][ns][name]}
async function check(name,fn){try{await fn();results.push({name,status:'PASS'});console.log('PASS '+name)}catch(error){results.push({name,status:'FAIL',error:error.message});console.log('FAIL '+name+': '+error.message)}}
for(const locale of ['en','ps','fa'])for(const section of ['', 'watch','read','topics','about','search','contact','sources','collections'])await check(`visible ${locale}/${section}`,async()=>{
 const response=await page.goto(base+`/${locale}${section?'/'+section:''}`,{waitUntil:'domcontentloaded',timeout:120000});assert.equal(response.status(),200);
 assert.equal(await page.locator('html').getAttribute('lang'),locale==='fa'?'fa-AF':locale);assert.equal(await page.locator('html').getAttribute('dir'),locale==='en'?'ltr':'rtl');
 const nav=page.locator('header .desktop-navigation nav a');for(const [index,key]of ['home','watch','read','topics','about'].entries())assert.equal((await nav.nth(index).innerText()).trim(),text(locale,'nav.'+key).trim());
 const body=await page.locator('body').innerText();assert(body.includes(text(locale,'footer.tagline')));assert(body.includes(text(locale,'footer.description')));
 const key=section==='contact'?'nav.contact':section==='sources'?'ui.sources':section==='collections'?'ui.collections':section?section+'.title':'home.hero_headline';assert.equal((await page.locator('h1').innerText()).trim(),text(locale,key).trim());
 if(!section)assert(body.includes(text(locale,'home.hero_subheading')));
 if(section==='about'){assert(body.includes(text(locale,'about.founder_bio')));assert(body.includes(text(locale,'about.mission_text')));assert(body.includes(text(locale,'about.principle_1_desc')))}
 if(['watch','read'].includes(section)){assert(body.includes(text(locale,'ui.topic')));assert(body.includes(text(locale,'ui.apply_filters')));if(section==='watch'){assert(body.includes(text(locale,'ui.sort')));assert.equal(await page.locator('select[name=sort] option[value=latest]').textContent(),text(locale,'ui.latest'));assert.equal(await page.locator('select[name=sort] option[value=featured]').textContent(),text(locale,'ui.featured'))}}
 if(section==='contact')for(const key of ['name_label','email_label','reason_label','message_label'])assert(body.includes(text(locale,'forms.'+key)));
 if(locale!=='en'){
  const leaves=await page.locator('main h1,main h2,main h3,main p,main a,main button,main label,main option,footer p').evaluateAll(nodes=>nodes.map(node=>(node.textContent||'').trim()).filter(Boolean));const reused=leaves.filter(value=>english.has(value));assert.deepEqual(reused,[],`English UI reused: ${reused.join(' | ')}`);
 }
 if(!section)await page.screenshot({path:`.qa/real-home-${locale}.png`,fullPage:true});
});
await check('visible language selector transitions change hero, navbar, footer and document direction',async()=>{for(const [from,to]of [['en','ps'],['en','fa'],['ps','en'],['fa','en']]){await page.goto(base+`/${from}`);const select=page.locator('header select');await select.locator(`option[value=${to}]`).waitFor({state:'attached'});await select.selectOption(to);await page.waitForURL(base+`/${to}`);assert.equal((await page.locator('h1').innerText()).trim(),text(to,'home.hero_headline'));assert((await page.locator('footer').innerText()).includes(text(to,'footer.description')));assert.equal(await page.locator('html').getAttribute('dir'),to==='en'?'ltr':'rtl')}});
await check('missing actual editorial translations remain unavailable',async()=>{for(const locale of ['ps','fa'])for(const section of ['read','watch'])assert.equal((await page.goto(base+`/${locale}/${section}/not-a-translated-document`)).status(),404)});
await fs.writeFile('.qa/localization-real-browser.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL'),errors},null,2));await browser.close();
