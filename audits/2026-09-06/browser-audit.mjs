import { chromium } from '@playwright/test';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
const dir='audits/2026-09-06/evidence'; await mkdir(`${dir}/screenshots`,{recursive:true});
const base=process.env.AUDIT_LOCAL_BASE_URL??'http://127.0.0.1:3200';
const routes=['/','/projetos','/projetos/band-news-bandsports','/projetos/hospital-sirio-libanes','/projetos/fiesta-americana','/experiencia','/sobre','/insights','/insights/go-em-producao','/contato','/audit-route-not-found'];
const widths=[320,360,375,390,412,430,768,1024,1280,1440,1920,2560];
const browser=await chromium.launch({headless:true}); const context=await browser.newContext({locale:'pt-BR',reducedMotion:'reduce'}); const page=await context.newPage();
const results=[]; const errors=[]; let current='';
page.on('pageerror',e=>errors.push({route:current,error:e.message}));
page.on('console',e=>{if(e.type()==='error'||e.type()==='warning')errors.push({route:current,type:e.type(),message:e.text()});});
for(const width of widths){await page.setViewportSize({width,height:width<768?844:900});for(const pathname of routes){current=pathname;const r=await page.goto(base+pathname,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
const sample=await page.evaluate(()=>{
const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return !e.closest('[aria-hidden="true"],[inert]')&&s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
const offenders=[...document.querySelectorAll('nav a,nav button,main h1,main h2,main h3,main p,main a,main button,main input,main textarea,footer a')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();if(r.left>=-1&&r.right<=innerWidth+1)return false;for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),a=p.getBoundingClientRect();if(['auto','hidden','clip','scroll'].includes(s.overflowX)&&p.scrollWidth>p.clientWidth+1&&a.left>=-1&&a.right<=innerWidth+1)return false;}return true}).map(e=>({tag:e.tagName,class:e.className,text:e.textContent?.trim().slice(0,55),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}));
return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,height:document.documentElement.scrollHeight,h1Count:document.querySelectorAll('h1').length,title:document.title,offenders,images:[...document.images].filter(visible).map(e=>({src:e.getAttribute('src'),naturalWidth:e.naturalWidth,renderedWidth:Math.round(e.getBoundingClientRect().width),loading:e.loading,sizes:e.sizes,broken:e.complete&&!e.naturalWidth}))};});
results.push({pathname,width,status:r.status(),...sample});
if([390,1440].includes(width)){await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0)});await page.screenshot({path:`${dir}/screenshots/${pathname==='/'?'home':pathname.slice(1).replaceAll('/','-')}-${width}.png`,fullPage:true,animations:'disabled'});}
}console.log(`matrix ${width}: ${routes.length} routes`);}
await writeFile(`${dir}/responsive-matrix.json`,JSON.stringify({widths,routes,results,errors},null,2));
const metadata=[];for(const pathname of ['/', '/en','/es','/projetos/hospital-sirio-libanes','/insights/go-em-producao','/contato']){current=pathname;await page.goto(base+pathname,{waitUntil:'networkidle'});metadata.push({pathname,...await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,viewport:document.querySelector('meta[name=viewport]')?.content,canonical:document.querySelector('link[rel=canonical]')?.href,og:[...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')].map(e=>({name:e.getAttribute('property')??e.name,value:e.content})),hreflang:[...document.querySelectorAll('link[hreflang]')].map(e=>({lang:e.hreflang,href:e.href}))}))});}
await writeFile(`${dir}/local-metadata.json`,JSON.stringify(metadata,null,2));await browser.close();
const assets=[];async function walk(path){for(const entry of await readdir(path,{withFileTypes:true})){const p=`${path}/${entry.name}`;if(entry.isDirectory())await walk(p);else if(/\.(webp|png|jpe?g|avif|ico|svg)$/i.test(p)){try{const m=await sharp(p).metadata();assets.push({path:p,bytes:(await stat(p)).size,width:m.width,height:m.height,format:m.format});}catch{assets.push({path:p,bytes:(await stat(p)).size});}}}}
await walk('public');await walk('src/app');await writeFile(`${dir}/assets.json`,JSON.stringify(assets,null,2));console.log(JSON.stringify({samples:results.length,overflow:results.filter(r=>r.documentWidth>r.width+1||r.offenders.length).map(r=>({pathname:r.pathname,width:r.width,offenders:r.offenders})),errors:errors.length,assets:assets.length}));
