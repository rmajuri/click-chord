import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'

// Some environments ship a preinstalled Chromium instead of Playwright's own
const executablePath =
  process.env.CHROMIUM_PATH ??
  (existsSync('/opt/pw-browsers/chromium')
    ? '/opt/pw-browsers/chromium'
    : undefined)

export default defineConfig({
  testDir: 'e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3100',
    ...devices['Desktop Chrome'],
    launchOptions: {
      executablePath,
      args: ['--autoplay-policy=no-user-gesture-required']
    }
  },
  webServer: {
    command: 'npx vite --port 3100 --strictPort',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI
  }
})
