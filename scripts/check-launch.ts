import {getPayload} from 'payload';
import config from '../src/payload.config';
import en from '../src/messages/en.json';
const payload=await getPayload({config});
const issues:string[]=[];const strings=await payload.find({collection:'ui-strings',limit:2000,overrideAccess:true});
for(const [ns,keys]of Object.entries(en))for(const key of Object.keys(keys)){const record=strings.docs.find(d=>d.key===`${ns}.${key}`);for(const locale of ['ps','fa']as const){const value=locale==='ps'?record?.valuePs:record?.valueFa;const status=locale==='ps'?record?.statusPs:record?.statusFa;if(!value?.trim()||status!=='approved')issues.push(`UI ${ns}.${key} (${locale}): ${value?.trim()?status:'missing'}`)}}
for(const locale of ['ps','fa','en']as const)for(const slug of ['privacy','terms']){const result=await payload.find({collection:'pages',locale,fallbackLocale:false,overrideAccess:true,where:{slug:{equals:slug}},limit:1});const p=result.docs[0];if(!p?.title||!p?.body||p.approvalStatus!=='approved'||p.status!=='published')issues.push(`Legal ${slug} (${locale}): founder approval and publication required`)}
if(!process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY||!process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY)issues.push('Contact: Turnstile configuration missing');
if(!process.env.RESEND_API_KEY||!process.env.CONTACT_FROM_EMAIL||!process.env.CONTACT_TO_EMAIL)issues.push('Contact: email delivery configuration missing');
if(!process.env.CRON_SECRET)issues.push('Scheduling: protected worker configuration missing');
if(issues.length){console.log(`Launch gate FAIL (${issues.length} unresolved checks)`);for(const issue of issues)console.log(issue);process.exitCode=1}else console.log('Launch gate PASS: CMS wording/legal and required environment configuration checked. Browser/provider/device checks remain separate.');
await payload.destroy();
