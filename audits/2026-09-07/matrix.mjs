import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
const baseUrl = process.env.AUDIT_LOCAL_BASE_URL ?? 'http://127.0.0.1:3200';
const browser = await chromium.launch();
const page = await browser.newPage({ locale: 'pt-BR' });
const rows = [], warnings = [];
page.on('console', message => {
  if (message.type() === 'warning' && message.text().includes('Swiper')) warnings.push(message.text());
});
for (const width of [320,360,375,390,412,430,768,1024,1280,1440,1920,2560]) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of ['/', '/projetos', '/projetos/hospital-sirio-libanes', '/projetos/band-news-bandsports', '/projetos/fiesta-americana', '/experiencia', '/sobre', '/insights', '/insights/go-em-producao', '/contato', '/privacidade', '/not-a-portfolio-route']) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    rows.push(await page.evaluate(({ width, path }) => {
      const collisions = [...document.querySelectorAll('dt')].flatMap(label => {
        const value = label.nextElementSibling;
        if (!value || value.tagName !== 'DD') return [];
        const range = document.createRange(); range.selectNodeContents(label);
        const a = range.getBoundingClientRect(), b = value.getBoundingClientRect();
        return a.right > b.left && b.right > a.left && a.bottom > b.top && b.bottom > a.top ? [label.textContent] : [];
      });
      return { width, path, overflow: document.documentElement.scrollWidth > innerWidth + 1, headings: document.querySelectorAll('h1').length, collisions };
    }, { width, path }));
  }
}
await browser.close();
await writeFile('audits/2026-09-07/evidence/responsive-matrix.json', JSON.stringify({ rows, warnings }, null, 2));
const failures = rows.filter(r => r.overflow || r.collisions.length || r.headings !== 1);
console.log(JSON.stringify({ combinations: rows.length, failures, warnings }));
if (failures.length || warnings.length) process.exitCode = 1;
