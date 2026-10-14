import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Paints a simple drawing in the browser and returns it as PNG bytes
const makeDrawingPng = (page) =>
  page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fbf8f0'
    ctx.fillRect(0, 0, 400, 300)
    ctx.lineWidth = 8
    ctx.strokeStyle = '#2f6fb3'
    ctx.beginPath()
    ctx.moveTo(20, 250)
    ctx.bezierCurveTo(120, 40, 250, 280, 380, 60)
    ctx.stroke()
    ctx.fillStyle = '#e04a2f'
    ctx.beginPath()
    ctx.arc(300, 210, 40, 0, Math.PI * 2)
    ctx.fill()
    return canvas.toDataURL('image/png').split(',')[1]
  })

const openDrawsound = async (page) => {
  await page.goto('/')
  await page.getByRole('link', { name: /Drawsound/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Drawsound'
  )
}

const seriousViolations = async (page) => {
  const results = await new AxeBuilder({ page })
    .include('main')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return results.violations
    .filter(({ impact }) => impact === 'serious' || impact === 'critical')
    .map(({ id, nodes }) => `${id}: ${nodes.map((n) => n.target).join(', ')}`)
}

test('uploading a photo makes a song that plays, pauses and stops', async ({
  page
}) => {
  await openDrawsound(page)
  const png = await makeDrawingPng(page)
  await page.getByTestId('drawing-file').setInputFiles({
    name: 'drawing.png',
    mimeType: 'image/png',
    buffer: Buffer.from(png, 'base64')
  })

  await expect(page.getByRole('status').first()).toHaveText(
    /Your song is ready/
  )
  const play = page.getByRole('button', { name: 'Play' })
  await expect(play).toBeFocused()
  await expect(
    page.getByRole('img', { name: /Your drawing\. The drawing is mostly/ })
  ).toBeVisible()

  await play.click()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  // The playhead moves while the song plays
  await expect
    .poll(() =>
      page
        .locator('[data-state]')
        .evaluate((el) => Number(el.style.getPropertyValue('--progress')))
    )
    .toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await page.getByRole('button', { name: 'Stop' }).click()
  await expect(page.getByRole('status').first()).toHaveText('Stopped.')
})

test('sounds and versions change the song, and it downloads as WAV', async ({
  page
}) => {
  await openDrawsound(page)
  await page.getByRole('button', { name: 'Ocean waves' }).click()
  const meta = page.locator('p', { hasText: 'beats a minute' })
  await expect(meta).toBeVisible()

  await page.getByRole('radio', { name: /Music box/ }).check()
  await expect(meta).toContainText('music-box bells')
  await expect(page.getByRole('status').first()).toHaveText(
    'Sound changed to Music box.'
  )

  await page.getByRole('button', { name: /Make a new version/ }).click()
  await expect(
    page.getByText('Version 2. Same drawing and mood, new details.')
  ).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download song (.wav)' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('drawsound-waves-in-the-ocean.wav')
  const chunks = []
  for await (const chunk of await download.createReadStream())
    chunks.push(chunk)
  const file = Buffer.concat(chunks)
  expect(file.subarray(0, 4).toString()).toBe('RIFF')
  expect(file.length).toBeGreaterThan(44100 * 4 * 5)
  // Real music, not silence
  let loudest = 0
  for (let offset = 44; offset < file.length - 1; offset += 2) {
    loudest = Math.max(loudest, Math.abs(file.readInt16LE(offset)))
  }
  expect(loudest).toBeGreaterThan(3000)
})

test('a creation can be saved, reopened after reload, and deleted', async ({
  page
}) => {
  await openDrawsound(page)
  await page.getByRole('button', { name: 'Starry night' }).click()
  await page.getByLabel('What is it? (optional)').fill('Our sleepy moon')
  await page.getByRole('button', { name: 'Save to my creations' }).click()
  await expect(
    page.getByRole('heading', { name: 'Our sleepy moon' })
  ).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Open Our sleepy moon' }).click()
  await expect(page.locator('p', { hasText: 'beats a minute' })).toContainText(
    'Our sleepy moon'
  )
  await expect(
    page.getByRole('button', { name: 'Update my creation' })
  ).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Delete Our sleepy moon' }).click()
  await expect(page.getByText('Nothing saved yet.')).toBeVisible()
})

test('the drawing can be explored by sound with the keyboard', async ({
  page
}) => {
  await openDrawsound(page)
  await page.getByRole('button', { name: 'Sunny house' }).click()
  const parts = page.getByRole('group', { name: 'Parts of the drawing' })
  await parts.getByRole('button', { name: /Top left/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText(/^Top left: .*Plays high notes/)).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await expect(parts.getByRole('button', { name: /Middle left/ })).toBeFocused()
  await expect(page.getByText(/^Middle left: /)).toBeVisible()
  await page.keyboard.press('End')
  await expect(page.getByText(/^Bottom right: /)).toBeVisible()
  // Only one part is in the tab order at a time
  await expect(parts.locator('button[tabindex="0"]')).toHaveCount(1)
})

test('the whole journey works from the keyboard alone', async ({ page }) => {
  await openDrawsound(page)
  // Tab from the heading through to the first example drawing
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const name = await page.evaluate(() => document.activeElement.textContent)
    if (name.includes('Sunny house')) break
  }
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Play' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pause' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
})

test('a file that is not a picture shows a clear error', async ({ page }) => {
  await openDrawsound(page)
  await page.getByTestId('drawing-file').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('hello')
  })
  await expect(page.getByRole('alert')).toHaveText(/not a picture/)
})

test('has no serious accessibility violations before and after a drawing', async ({
  page
}) => {
  await openDrawsound(page)
  expect(await seriousViolations(page)).toEqual([])
  await page.getByRole('button', { name: 'Sunny house' }).click()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  await page.getByText('Straighten or trim the photo').click()
  await page.getByText('More options').click()
  expect(await seriousViolations(page)).toEqual([])
})

test('respects reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await openDrawsound(page)
  await page.getByRole('button', { name: 'Sunny house' }).click()
  const transition = await page
    .getByRole('button', { name: 'Play' })
    .evaluate((el) => getComputedStyle(el).transitionDuration)
  expect(transition).toBe('0s')
  await context.close()
})
