import {request,chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='http://localhost:3100';const admin=await request.newContext({baseURL:base,extraHTTPHeaders:{"Sec-Fetch-Site":"same-origin"}});
assert.equal((await admin.post('/api/users/login',{data:{email:'qa@beyondrasooli.test',password:'Local-QA-only-9273!'}})).status(),200);
assert(Array.isArray((await (await admin.get('/api/ui-strings?limit=1')).json()).docs));
const review=(await (await admin.get('/api/ui-string-review')).json()).items;assert(review.length>0);
const browser=await chromium.launch();const page=await browser.newPage();const results=[];
for(const [collection,section,slug] of [['articles','read','qa-memory'],['videos','watch','qa-video']])for(const locale of ['en','ps','fa']){
 const response=await page.goto(base+`/${locale}/${section}/${slug}-${locale}`);assert.equal(response.status(),200);
 const docs=(await (await admin.get(`/api/${collection}?where[slug][equals]=${slug}-${locale}`)).json()).docs;assert.equal(docs.length,1);
 assert.equal((await page.locator('h1').innerText()).trim(),docs[0].title.trim());
 const main=await page.locator('main').innerText();if(collection==='articles'){const paragraphs=docs[0].body.root.children.filter(node=>node.type==='paragraph').flatMap(node=>node.children.filter(child=>typeof child.text==='string').map(child=>child.text));assert(paragraphs.length>0);for(const paragraph of paragraphs)assert(main.includes(paragraph));}else{assert(main.includes(docs[0].description));assert(main.includes(docs[0].transcript));}if(locale!=='en')assert(/[\u0600-\u06ff]/.test(main));
 const target=locale==='en'?'ps':'en';const select=page.locator('header select');await select.locator(`option[value=${target}]`).waitFor({state:'attached'});await select.selectOption(target);await page.waitForURL(base+`/${target}/${section}/${slug}-${target}`);
 results.push({route:`/${locale}/${section}/${slug}-${locale}`,title:docs[0].title,status:'PASS'});
}
await page.goto(base+'/en/read/qa-scheduled');await page.waitForFunction(()=>!document.querySelector('header select')?.disabled);assert.equal(await page.locator('header select option[value=ps]').count(),0);assert.equal(await page.locator('header select option[value=fa]').count(),0);
const created=await admin.post('/api/ui-strings',{data:{namespace:'ui',key:'ui.qa_native_api_check',valueEn:'Temporary isolated test',valuePs:'ازموینه',valueFa:'آزمایش',statusPs:'ai_draft',statusFa:'ai_draft'}});assert.equal(created.status(),201);const doc=(await created.json()).doc;assert.equal((await admin.delete(`/api/ui-strings/${doc.id}`)).status(),200);
await fs.writeFile('.qa/localization-editorial-browser.json',JSON.stringify({results,missingTranslation:'PASS',nativeCMSListAndCreate:'PASS'},null,2));console.log('PASS six visible article/video routes, real translated slugs, missing translation exclusion, native CMS list/create');await browser.close();await admin.dispose();
