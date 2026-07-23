/**
 * Generates public/og-image.png (1200×630) for iMessage / social previews.
 * Run: node scripts/generate-og.mjs
 */
import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outPath = join(root, 'public', 'og-image.png')
const logoPath = join(root, 'public', 'logo.png')

const logoB64 = readFileSync(logoPath).toString('base64')

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: Inter, system-ui, sans-serif;
      background: #06080F;
      color: #F7FAFF;
    }
    .frame {
      position: relative;
      width: 1200px;
      height: 630px;
      background:
        radial-gradient(ellipse 70% 80% at 18% 40%, rgba(14,165,233,0.28), transparent 55%),
        radial-gradient(ellipse 55% 70% at 88% 70%, rgba(0,187,127,0.14), transparent 50%),
        radial-gradient(ellipse 40% 50% at 70% 15%, rgba(113,167,245,0.12), transparent 45%),
        linear-gradient(145deg, #021E3C 0%, #0B0E16 48%, #1B3A5C 100%);
      padding: 48px 56px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at 50% 100%, rgba(14,165,233,0.12), transparent 40%);
    }
    .top {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 1;
    }
    .logo-pill {
      background: rgba(247,250,255,0.97);
      border-radius: 18px;
      padding: 14px 22px;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    }
    .logo-pill img {
      height: 44px;
      width: auto;
      display: block;
    }
    .badge {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #7CA8EF;
      border: 1px solid rgba(124,168,239,0.35);
      background: rgba(14,165,233,0.12);
      border-radius: 999px;
      padding: 10px 18px;
    }
    .main {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
      flex: 1;
      padding: 12px 0 8px;
    }
    .copy { max-width: 640px; }
    .eyebrow {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #0EA5E9;
      margin-bottom: 16px;
    }
    h1 {
      font-family: Poppins, Inter, sans-serif;
      font-size: 72px;
      font-weight: 700;
      line-height: 1.02;
      letter-spacing: -0.03em;
      margin-bottom: 18px;
    }
    .tagline {
      font-size: 28px;
      font-weight: 500;
      line-height: 1.35;
      color: #C5DBF7;
      max-width: 560px;
    }
    .chips {
      display: flex;
      gap: 12px;
      margin-top: 28px;
      flex-wrap: wrap;
    }
    .chip {
      font-size: 16px;
      font-weight: 600;
      color: #F7FAFF;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(197,219,247,0.2);
      border-radius: 999px;
      padding: 10px 16px;
    }
    .chip strong { color: #0EA5E9; }
    .visual {
      width: 300px;
      height: 300px;
      position: relative;
      flex-shrink: 0;
    }
    .visual svg { width: 100%; height: 100%; filter: drop-shadow(0 0 28px rgba(14,165,233,0.35)); }
    .bottom {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(197,219,247,0.14);
      padding-top: 22px;
    }
    .cta {
      font-family: Poppins, Inter, sans-serif;
      font-size: 26px;
      font-weight: 600;
      color: #F7FAFF;
    }
    .cta span {
      color: #0EA5E9;
    }
    .url {
      font-size: 18px;
      font-weight: 500;
      color: #7A7F95;
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="frame">
    <div class="glow"></div>
    <div class="top">
      <div class="logo-pill">
        <img src="data:image/png;base64,${logoB64}" alt="Regenerative Revival" />
      </div>
      <div class="badge">60–90 second game</div>
    </div>
    <div class="main">
      <div class="copy">
        <div class="eyebrow">Regenerative Revival</div>
        <h1>The Best Decade</h1>
        <p class="tagline">Ten years. Four dimensions.<br/>How well can you protect what matters?</p>
        <div class="chips">
          <div class="chip"><strong>Mobility</strong></div>
          <div class="chip"><strong>Energy</strong></div>
          <div class="chip"><strong>Recovery</strong></div>
          <div class="chip"><strong>Clarity</strong></div>
        </div>
      </div>
      <div class="visual" aria-hidden="true">
        <svg viewBox="0 0 200 200">
          <defs>
            <radialGradient id="g" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(14,165,233,0.45)"/>
              <stop offset="70%" stop-color="rgba(2,30,60,0.1)"/>
              <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="url(#g)"/>
          <circle cx="100" cy="100" r="78" fill="none" stroke="#0EA5E9" stroke-width="7" stroke-opacity="0.85" stroke-dasharray="360 490" stroke-linecap="round" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="62" fill="none" stroke="#00BB7F" stroke-width="6.5" stroke-opacity="0.8" stroke-dasharray="280 390" stroke-linecap="round" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="46" fill="none" stroke="#71A7F5" stroke-width="6" stroke-opacity="0.85" stroke-dasharray="200 290" stroke-linecap="round" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="30" fill="none" stroke="#C5DBF7" stroke-width="5.5" stroke-opacity="0.9" stroke-dasharray="140 190" stroke-linecap="round" transform="rotate(-90 100 100)"/>
          <circle cx="100" cy="100" r="18" fill="rgba(14,165,233,0.4)" stroke="rgba(197,219,247,0.55)" stroke-width="1.5"/>
          <circle cx="100" cy="100" r="7" fill="#F7FAFF"/>
        </svg>
      </div>
    </div>
    <div class="bottom">
      <div class="cta">Play free · <span>Challenge a friend</span></div>
      <div class="url">regenerative.click</div>
    </div>
  </div>
</body>
</html>`

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
})
await page.setContent(html, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } })
writeFileSync(outPath, buf)
await browser.close()
console.log('✓ Wrote', outPath, `(${buf.length} bytes)`)
