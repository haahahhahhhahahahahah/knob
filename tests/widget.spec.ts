import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { test } from '@playwright/test';

const states = [
  'brightness-52',
  'brightness-low-transition',
  'volume-53',
  'volume-72',
  'volume-14',
  'volume-0',
];

test.describe('widget visual states', () => {
  for (const state of states) {
    test(`captures ${state}`, async ({ page }) => {
      const outputDir = path.join(process.cwd(), 'test-results', 'widget-states');
      mkdirSync(outputDir, { recursive: true });

      await page.goto(`/?state=${state}`);
      await page.locator('.control-shell').waitFor({ state: 'visible' });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(outputDir, `${state}.png`),
        fullPage: false,
      });
    });
  }
});
