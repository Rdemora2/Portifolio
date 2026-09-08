import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const runtime = process.env.LIGHTHOUSE_RUNTIME
if (!runtime) throw new Error('Set LIGHTHOUSE_RUNTIME to the existing Lighthouse node_modules directory.')
const { default: lighthouse } = await import(pathToFileURL(path.join(runtime, 'lighthouse/core/index.js')))
const { launch } = await import(pathToFileURL(path.join(runtime, 'chrome-launcher/dist/index.js')))
const { default: desktop } = await import(pathToFileURL(path.join(runtime, 'lighthouse/core/config/lr-desktop-config.js')))
const targets = process.env.AUDIT_TARGETS ? JSON.parse(process.env.AUDIT_TARGETS) : [['home', '/', 'mobile'], ['home', '/', 'desktop'], ['work', '/projetos', 'mobile'], ['contact', '/contato', 'mobile']]
for (const [name, route, mode] of targets) {
  const chrome = await launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new'] })
  try {
    const { lhr } = await lighthouse(`http://127.0.0.1:3400${route}`, { port: chrome.port, logLevel: 'error', output: 'json', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, mode === 'desktop' ? desktop : undefined)
    const summary = {
      route, mode, date: lhr.fetchTime, version: lhr.lighthouseVersion,
      scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
      metrics: Object.fromEntries(['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift'].map(key => [key, lhr.audits[key].numericValue])),
      findings: Object.fromEntries(Object.entries(lhr.audits).filter(([key, audit]) => (audit.score !== null && audit.score < 1) || ['lcp-breakdown-insight','lcp-discovery-insight','network-dependency-tree-insight'].includes(key)).map(([key, audit]) => [key, {title: audit.title, score: audit.score, displayValue: audit.displayValue, details: audit.details}])),
      warnings: lhr.runWarnings,
      note: 'Local Lighthouse sample; WebGL has separate functional tests. This is not field data.',
    }
    fs.writeFileSync(path.join(import.meta.dirname, `final-performance-${name}-${mode}.json`), JSON.stringify(summary, null, 2) + '\n')
    console.log(JSON.stringify({route,mode,scores:summary.scores,metrics:summary.metrics}))
  } finally { await chrome.kill() }
}
