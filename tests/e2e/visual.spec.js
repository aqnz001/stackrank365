/**
 * TS-14: Visual Regression Testing
 * Captures baseline screenshots for all key pages.
 * On subsequent runs, compares against baseline.
 *
 * Usage:
 *   First run (capture baselines):  npx playwright test visual.spec.js --update-snapshots
 *   Subsequent runs (compare):       npx playwright test visual.spec.js
 */
import { test, expect } from '@playwright/test';
import { goToPage } from './helpers.js';

// Only run visual tests on Chromium to keep baselines consistent
test.skip(({ browserName }) => browserName !== 'chromium', 'Visual tests: chromium only');

const PAGES = [
  { name: 'landing',       path: 'landing',      desc: 'Landing page' },
  { name: 'leaderboard',   path: 'leaderboard',  desc: 'Leaderboard page' },
  { name: 'pricing',       path: 'pricing',      desc: 'Pricing page' },
  { name: 'signin',        path: 'signin',       desc: 'Sign in page' },
  { name: 'signup',        path: 'signup',       desc: 'Sign up page' },
  { name: 'how-it-works',  path: 'how-it-works', desc: 'How It Works page' },
  { name: 'scoring',       path: 'scoring',      desc: 'Scoring page' },
  { name: 'about',         path: 'about',        desc: 'About page' },
  { name: 'privacy',       path: 'privacy',      desc: 'Privacy policy' },
];

test.describe('TS-14 Visual Regression', () => {

  for (const { name, path, desc } of PAGES) {

    test(`TC-VR-${name}: ${desc} — desktop 1280px`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await goToPage(page, path);
      // Wait for fonts + images
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
        maxDiffPixelRatio: 0.02, // 2% tolerance
        animations: 'disabled',
      });
    });

    test(`TC-VR-${name}-mobile: ${desc} — mobile 375px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await goToPage(page, path);
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        maxDiffPixelRatio: 0.02,
        animations: 'disabled',
      });
    });

  }

  test('TC-VR-full: Full landing page scroll screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goToPage(page, 'landing');
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot('landing-fullpage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

});
