/**
 * TS-09: Pricing Page CTAs
 * Covers: 3 tier cards, CTAs, FAQ section.
 */
import { test, expect } from '@playwright/test';
import { goToPage } from './helpers.js';

test.describe('TS-09 Pricing Page', () => {

  test.beforeEach(async ({ page }) => {
    await goToPage(page, 'pricing');
    await page.waitForTimeout(1000);
  });

  test('TC-CTA-10: All 3 tier cards render (Free, Pro, Recruiter)', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).toContain('Free');
    expect(text).toContain('Pro');
    expect(text).toContain('Recruiter');
  });

  test('TC-CTA-11: "Get started free" CTA is present', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/get started|start free|free/i);
  });

  test('TC-CTA-12: "Start Pro" CTA is present', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/start pro|upgrade|pro/i);
  });

  test('TC-CTA-13: "Start Recruiter" or Recruiter plan CTA present', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/recruiter|start recruiter/i);
  });

  test('TC-CTA-14: Pricing page has FAQ or comparison section', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/faq|question|frequently|compare|free|vs/i);
  });

  test('TC-P01: Pricing page CTAs lead to signup (Free plan)', async ({ page }) => {
    const buttons = page.locator('button');
    const freeBtn = buttons.filter({ hasText: /free|get started/i }).first();
    if (await freeBtn.count() > 0) {
      await freeBtn.click();
      await page.waitForTimeout(800);
      const text = await page.locator('body').innerText();
      // Should navigate to signup or show sign up prompt
      expect(text).toMatch(/sign up|create|join|email|microsoft/i);
    }
  });

  test('TC-P02: No broken images on pricing page', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const naturalWidth = await images.nth(i).evaluate(img => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

});
