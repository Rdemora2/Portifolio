import {chromium} from '@playwright/test';
import{writeFile}from'node:fs/promises';
import{resolve}from'node:path';
import{fileURLToPath,pathToFileURL}from'node:url';
const repoRoot=fileURLToPath(new URL('../../',import.meta.url));process.chdir(repoRoot);
const lighthouseNodeModules=process.env.LIGHTHOUSE_NODE_MODULES??resolve(repoRoot,'node_modules');
const [{default:lighthouse},chromeLauncher]=await Promise.all([
  import(pathToFileURL(resolve(lighthouseNodeModules,'lighthouse/core/index.js')).href),
  import(pathToFileURL(resolve(lighthouseNodeModules,'chrome-launcher/dist/index.js')).href),
]);
const localBase=process.env.AUDIT_LOCAL_BASE_URL??'http://127.0.0.1:3200';
const productionBase=process.env.AUDIT_PRODUCTION_BASE_URL??'https://portifolio-liard-zeta.vercel.app';
const dir='audits/2026-09-06/evidence';const summary=[];
for(const [name,url,preset]of [
['local-home-mobile',`${localBase}/`,'mobile'],
['production-home-mobile',`${productionBase}/`,'mobile'],
['production-home-mobile-visual',`${productionBase}/`,'visual'],
['production-home-desktop',`${productionBase}/`,'desktop'],
['production-work-mobile',`${productionBase}/projetos`,'mobile'],
['production-article-mobile',`${productionBase}/insights/go-em-producao`,'mobile']]){
const chrome=await chromeLauncher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--disable-dev-shm-usage','--no-first-run',...(preset==='visual'?['--disable-blink-features=AutomationControlled']:[])]});
try{const result=await lighthouse(url,{port:chrome.port,logLevel:'error',output:['json','html'],onlyCategories:['performance','accessibility','best-practices','seo'],...(preset==='desktop'?{preset:'desktop'}:{}),...(preset==='visual'?{emulatedUserAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'}:{})});
await writeFile(`${dir}/${name}.json`,result.report[0]);await writeFile(`${dir}/${name}.html`,result.report[1]);const {lhr}=result;const audits={};for(const [id,a]of Object.entries(lhr.audits)){if(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index','server-response-time','interactive','total-byte-weight','unused-javascript','render-blocking-insight','lcp-breakdown-insight','lcp-discovery-insight'].includes(id)||a.score!==null&&a.score<1&&a.scoreDisplayMode!=='notApplicable')audits[id]={score:a.score,title:a.title,value:a.numericValue,display:a.displayValue,details:a.details};}
const row={name,url,preset,lighthouseVersion:lhr.lighthouseVersion,fetchTime:lhr.fetchTime,categories:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),audits};summary.push(row);console.log(name,JSON.stringify(row.categories),JSON.stringify(Object.fromEntries(Object.entries(audits).filter(([k])=>['largest-contentful-paint','cumulative-layout-shift','total-blocking-time','first-contentful-paint'].includes(k)).map(([k,v])=>[k,v.value]))));
}catch(e){summary.push({name,error:e.message});console.log(name,e.message)}finally{await chrome.kill();}await writeFile(`${dir}/lighthouse-summary.json`,JSON.stringify(summary,null,2));}
