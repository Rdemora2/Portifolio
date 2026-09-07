import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
const baseUrl = process.env.AUDIT_LOCAL_BASE_URL ?? 'http://127.0.0.1:3200';
const browser = await chromium.launch();
const rows = [];
for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'pt-BR' });
  const page = await context.newPage();
  for (const [name, path, selector] of [
    ['home', '/', '[data-home-hero]'],
    ['privacy', '/privacidade', 'main'],
    ['showcase', '/projetos', '[data-website-card="carla-moraes"]'],
    ['gallery-final', '/projetos/band-news-bandsports', '[data-project-gallery]'],
  ]) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const target = page.locator(selector);
    await target.scrollIntoViewIfNeeded();
    const preview = target.locator('img').first();
    if (await preview.count()) {
      await preview.scrollIntoViewIfNeeded();
      await page.waitForFunction(selector => {
        const image = document.querySelector(selector + ' img');
        return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
      }, selector);
    }
    await page.waitForTimeout(850);
    await target.screenshot({ path: `audits/2026-09-07/evidence/${name}-${width}.png` });
    rows.push({ name, width, path, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  }
  await context.close();
}
await browser.close();
await writeFile('audits/2026-09-07/evidence/visual-check.json', JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows));
