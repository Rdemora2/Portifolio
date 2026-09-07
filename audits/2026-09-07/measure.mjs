import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
process.chdir(repoRoot);
const lighthouseNodeModules = process.env.LIGHTHOUSE_NODE_MODULES ?? resolve(repoRoot, 'node_modules');
const [{ default: lighthouse }, { default: desktopConfig }, chromeLauncher] = await Promise.all([
  import(pathToFileURL(resolve(lighthouseNodeModules, 'lighthouse/core/index.js')).href),
  import(pathToFileURL(resolve(lighthouseNodeModules, 'lighthouse/core/config/desktop-config.js')).href),
  import(pathToFileURL(resolve(lighthouseNodeModules, 'chrome-launcher/dist/index.js')).href),
]);

const [label = 'final', mode = 'mobile', runs = '3', url = process.env.AUDIT_LOCAL_BASE_URL ?? 'http://127.0.0.1:3200/'] = process.argv.slice(2);
const summary = [];
for (let run = 1; run <= Number(runs); run++) {
  const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless', '--disable-dev-shm-usage', '--no-first-run'] });
  try {
    const { lhr, report } = await lighthouse(url, { port: chrome.port, logLevel: 'error', output: ['json', 'html'], onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, mode === 'desktop' ? desktopConfig : undefined);
    await writeFile(`audits/2026-09-07/evidence/${label}-${run}.json`, report[0]);
    await writeFile(`audits/2026-09-07/evidence/${label}-${run}.html`, report[1]);
    let runtimeAfterAudit = null;
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);
    try {
      const page = browser.contexts().flatMap(context => context.pages()).find(page => page.url().startsWith(url));
      if (page) runtimeAfterAudit = await page.evaluate(() => ({
        canvasCount: document.querySelectorAll('[data-home-hero] canvas').length,
        webdriver: navigator.webdriver,
        userAgent: navigator.userAgent,
        visibility: document.visibilityState,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      }));
    } finally { await browser.close(); }
    const row = { run, mode, url, categories: Object.fromEntries(Object.entries(lhr.categories).map(([k,v]) => [k, v.score])), benchmarkIndex: lhr.environment.benchmarkIndex, metrics: Object.fromEntries(['first-contentful-paint','largest-contentful-paint','cumulative-layout-shift','total-blocking-time','speed-index'].map(k=>[k,lhr.audits[k]?.numericValue])), config: lhr.configSettings, runtimeAfterAudit };
    summary.push(row);
    console.log(JSON.stringify(row));
  } finally { await chrome.kill(); }
}
await writeFile(`audits/2026-09-07/evidence/${label}-summary.json`, JSON.stringify(summary, null, 2));
