import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

// Reuse the installed audit runtime; this script does not install dependencies.
const auditRuntime = process.env.LIGHTHOUSE_RUNTIME
if (!auditRuntime) throw new Error('Set LIGHTHOUSE_RUNTIME to the installed lighthouse node_modules directory.')
const { default: lighthouse } = await import(pathToFileURL(path.join(auditRuntime, 'lighthouse/core/index.js')))
const { launch } = await import(pathToFileURL(path.join(auditRuntime, 'chrome-launcher/dist/index.js')))
const { default: desktop } = await import(pathToFileURL(path.join(auditRuntime, 'lighthouse/core/config/lr-desktop-config.js')))

for (const mode of ['mobile', 'desktop']) {
  const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] })
  try {
    const result = await lighthouse('http://127.0.0.1:3400/', {
      port: chrome.port,
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    }, mode === 'desktop' ? desktop : undefined)
    const { lhr } = result
    const summary = {
      mode,
      date: lhr.fetchTime,
      version: lhr.lighthouseVersion,
      scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
      lcpMs: lhr.audits['largest-contentful-paint'].numericValue,
      tbtMs: lhr.audits['total-blocking-time'].numericValue,
      cls: lhr.audits['cumulative-layout-shift'].numericValue,
      warnings: lhr.runWarnings,
      note: 'Single local lab sample with standard Lighthouse user agent; WebGL is validated separately by webgl-active.spec.ts.',
    }
    fs.writeFileSync(path.join(import.meta.dirname, `lighthouse-${mode}.json`), JSON.stringify(summary, null, 2) + '\n')
    console.log(JSON.stringify(summary))
  } finally {
    await chrome.kill()
  }
}
