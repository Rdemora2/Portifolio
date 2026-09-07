import {chromium} from '@playwright/test';import {writeFile}from'node:fs/promises';
import{resolve}from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';
const repoRoot=fileURLToPath(new URL('../../',import.meta.url));process.chdir(repoRoot);const lighthouseNodeModules=process.env.LIGHTHOUSE_NODE_MODULES??resolve(repoRoot,'node_modules');
const [{default:lighthouse},{default:desktopConfig},chromeLauncher]=await Promise.all([import(pathToFileURL(resolve(lighthouseNodeModules,'lighthouse/core/index.js')).href),import(pathToFileURL(resolve(lighthouseNodeModules,'lighthouse/core/config/desktop-config.js')).href),import(pathToFileURL(resolve(lighthouseNodeModules,'chrome-launcher/dist/index.js')).href)]);
const localBase=process.env.AUDIT_LOCAL_BASE_URL??'http://127.0.0.1:3200',productionBase=process.env.AUDIT_PRODUCTION_BASE_URL??'https://portifolio-liard-zeta.vercel.app';
const dir='audits/2026-09-06/evidence',summary=[];
for(const[name,url,mode]of[
['home-mobile-confirm-1',`${productionBase}/`,'mobile'],
['home-mobile-confirm-2',`${productionBase}/`,'mobile'],
['home-mobile-confirm-3',`${productionBase}/`,'mobile'],
['home-desktop-confirm',`${productionBase}/`,'desktop'],
['local-home-confirm',`${localBase}/`,'mobile']]){
const chrome=await chromeLauncher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--disable-dev-shm-usage','--no-first-run']});
try{const result=await lighthouse(url,{port:chrome.port,logLevel:'error',output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo']},mode==='desktop'?desktopConfig:undefined);const {lhr}=result;
await writeFile(`${dir}/${name}.json`,result.report[0]);await writeFile(`${dir}/${name}.html`,result.report[1]);
const b=await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);const p=b.contexts()[0].pages().find(p=>p.url().startsWith(url));const runtime=p?await p.evaluate(()=>({ua:navigator.userAgent,webdriver:navigator.webdriver,canvasCount:document.querySelectorAll('canvas').length,width:innerWidth,reducedMotion:matchMedia('(prefers-reduced-motion:reduce)').matches,visibility:document.visibilityState})):null;await b.close();
const row={name,url,mode,runtime,categories:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),config:lhr.configSettings,benchmarkIndex:lhr.environment.benchmarkIndex,metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','server-response-time'].map(k=>[k,lhr.audits[k]?.numericValue])),lcp:lhr.audits['lcp-breakdown-insight']?.details};summary.push(row);console.log(JSON.stringify(row));
}catch(e){summary.push({name,error:e.message});console.log(name,e.message)}finally{await chrome.kill()}await writeFile(`${dir}/lighthouse-confirmation.json`,JSON.stringify(summary,null,2));}
