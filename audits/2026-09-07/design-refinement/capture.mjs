import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled'],
  })
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('http://127.0.0.1:3400/pt')
    await page.locator('[data-home-hero] canvas').waitFor({ state: 'visible' })
    // Capture after the intentional hero entrance has settled.
    await page.waitForTimeout(900)
    await page.screenshot({ path: path.join(import.meta.dirname, 'desktop-final.png') })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({ path: path.join(import.meta.dirname, 'mobile-final.png') })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const results = []
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/pt', '/projetos', '/experiencia', '/sobre', '/contato']) {
        await page.goto('http://127.0.0.1:3400' + route, { waitUntil: 'networkidle' })
        const dimensions = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }))
        results.push({ width, route, ...dimensions })
      }
    }
    fs.writeFileSync(path.join(import.meta.dirname, 'responsive.json'), JSON.stringify({ results, errors }, null, 2) + '\n')
    console.log('Final screenshots and responsive matrix saved.')
  } finally {
    await browser.close()
  }
}
capture().catch(error => { console.error(error); process.exitCode = 1 })
