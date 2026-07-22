import { chromium, devices } from 'playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5173'
const outDir = join(process.cwd(), 'qa-shots')
mkdirSync(outDir, { recursive: true })

async function playThrough(page, label) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(outDir, `${label}-01-start.png`), fullPage: true })

  const how = page.getByRole('button', { name: /How to Play/i })
  if (await how.isVisible().catch(() => false)) {
    await how.click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: join(outDir, `${label}-02-tutorial.png`), fullPage: true })
    await page.getByRole('button', { name: /Got it/i }).click()
  } else {
    await page.getByRole('button', { name: /Begin Your Decade|Play — Beat|Accept Challenge/i }).click()
  }

  // Skip tutorial if still shown
  const got = page.getByRole('button', { name: /Got it/i })
  if (await got.isVisible().catch(() => false)) await got.click()
  const skip = page.getByRole('button', { name: /^Skip$/i })
  if (await skip.isVisible().catch(() => false)) await skip.click()

  for (let year = 1; year <= 9; year++) {
    await page.waitForSelector('button.card-choice', { timeout: 10000 })
    // Ensure we're in choice phase not final
    const heading = await page.locator('h2').first().textContent().catch(() => '')
    if (heading && /protecting this for/i.test(heading || '')) break

    const choices = page.locator('button.card-choice')
    await choices.nth(year % 3).click()
    // Auto-advance may fire; try continue if still visible
    const cont = page.getByRole('button', { name: /Next year|Final year|Continue/i })
    if (await cont.isVisible().catch(() => false)) {
      await cont.click().catch(() => {})
    }
    await page.waitForTimeout(400)
  }

  await page.waitForSelector('text=What are you protecting this for?', { timeout: 12000 })
  await page.screenshot({ path: join(outDir, `${label}-03-final.png`), fullPage: true })
  await page.getByRole('button', { name: /More adventures|family|Staying|Feeling|Performing/i }).first().click()

  await page.waitForSelector('text=Your Revival Score', { timeout: 10000 })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: join(outDir, `${label}-04-results.png`), fullPage: true })

  const scoreText = await page.locator('p.score-pop').first().textContent()
  const score = Number((scoreText || '').replace(/\D/g, ''))
  console.log(`${label} score:`, score)

  const quiz = page.getByRole('button', { name: /See Options That Come to You/i })
  if (!(await quiz.isVisible())) throw new Error('Quiz CTA missing')

  const trust = page.getByText('Physician-led medical team')
  if (!(await trust.isVisible())) throw new Error('Trust line missing')

  await page.getByRole('button', { name: /Game, not medical advice/i }).first().click()
  await page.waitForSelector('text=For education and entertainment only')
  await page.screenshot({ path: join(outDir, `${label}-05-disclaimer.png`), fullPage: true })
  await page.getByRole('button', { name: /^Close$/i }).click()

  if (!(score >= 0 && score <= 1000)) throw new Error(`Bad score ${score}`)
  return score
}

async function challengeFlow(browser) {
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    permissions: [],
  })
  const page = await context.newPage()
  const seed = 'e2e-challenge-seed'
  await page.goto(`${BASE}/?challenge=${seed}&score=700`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(outDir, 'challenge-01-start.png'), fullPage: true })
  const badge = page.getByText('Beat 700', { exact: true })
  if (!(await badge.isVisible())) throw new Error('Challenge banner missing')
  await page.getByRole('button', { name: /Accept Challenge/i }).click()
  const got = page.getByRole('button', { name: /Got it/i })
  if (await got.isVisible().catch(() => false)) await got.click()
  const skip = page.getByRole('button', { name: /^Skip$/i })
  if (await skip.isVisible().catch(() => false)) await skip.click()

  for (let year = 1; year <= 9; year++) {
    await page.waitForSelector('button.card-choice', { timeout: 10000 })
    const finalCheck = await page.getByText('What are you protecting this for?').isVisible().catch(() => false)
    if (finalCheck) break
    await page.locator('button.card-choice').first().click()
    const cont = page.getByRole('button', { name: /Next year|Final year|Continue/i })
    if (await cont.isVisible().catch(() => false)) {
      await cont.click().catch(() => {})
    }
    await page.waitForTimeout(350)
  }
  await page.waitForSelector('text=What are you protecting this for?', { timeout: 12000 })
  await page.getByRole('button', { name: /More adventures|family|Staying|Feeling|Performing/i }).first().click()
  await page.waitForSelector('text=Your Revival Score')
  await page.screenshot({ path: join(outDir, 'challenge-02-results.png'), fullPage: true })
  const compare = page.getByText(/beat their 700|scored 700|Perfect tie/i)
  if (!(await compare.isVisible())) throw new Error('Challenge comparison missing')
  await context.close()
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const errors = []

  try {
    {
      const context = await browser.newContext({ ...devices['iPhone 13'] })
      const page = await context.newPage()
      page.on('pageerror', (e) => errors.push(`mobile pageerror: ${e.message}`))
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`mobile console: ${msg.text()}`)
      })
      await playThrough(page, 'mobile')
      await page.setViewportSize({ width: 320, height: 700 })
      await page.goto(BASE, { waitUntil: 'networkidle' })
      await page.waitForTimeout(800)
      await page.screenshot({ path: join(outDir, 'mobile-320-start.png'), fullPage: true })
      await context.close()
    }

    {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
      const page = await context.newPage()
      page.on('pageerror', (e) => errors.push(`desktop pageerror: ${e.message}`))
      await playThrough(page, 'desktop')
      await context.close()
    }

    await challengeFlow(browser)

    {
      const page = await browser.newPage()
      const res = await page.goto(`${BASE}/logo.png`)
      if (!res || res.status() !== 200) throw new Error('logo.png failed')
      await page.close()
    }

    writeFileSync(
      join(outDir, 'report.json'),
      JSON.stringify({ ok: errors.length === 0, errors }, null, 2),
    )

    if (errors.length) {
      console.error('ERRORS', errors)
      process.exitCode = 1
    } else {
      console.log('✓ E2E passed — screenshots in qa-shots/')
    }
  } finally {
    await browser.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
