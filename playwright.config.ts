import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:5417',
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5417 --strictPort',
    url: 'http://127.0.0.1:5417',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
    },
  ],
});
