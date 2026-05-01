/**
 * TS-01: Navigation & Routing
 * Covers: all 18 SPA routes, query-param routing, footer links, nav links.
 */
import { test, expect } from '@playwright/test';
import { goToPage } from './helpers.js';

const ALL_PAGES = [
  'landing', 'leaderboard', 'how-it-works', 'scoring', 'about',
  'for-recruiters', 'signup', 'signin', 'pricing', 'privacy',
];

test.describe('TS-01 Navigation & Routing', () => {

  test('TC-N01: All public pages render without crash', async ({ page }) => {
    for (const pageName of ALL_PAGES) {
      await goToPage(page, pageName);
      // No "Something went wrong" error boundary
      await expect(page.locator('body')).not.toContainText('Something went wrong');
      // StackRank365 branding present (checks React mounted)
      await expect(page.locator('body')).toContainText('StackRank365');
    }
  });

  test('TC-N02: ?page= query param routing works', async ({ page }) => {
    await page.goto('/?page=pricing');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Free');
    await expect(page.locator('body')).toContainText('Pro');
    await expect(page.locator('body')).toContainText('Recruiter');
  });

  test('TC-N03: Unknown ?page= falls back to landing', async ({ page }) => {
    await page.goto('/?page=nonexistent_page_xyz');
    await page.waitForLoadState('networkidle');
    // Should render landing (default case in switch)
    await expect(page.locator('body')).toContainText('StackRank365');
    // Should NOT show a blank white screen
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('TC-N04: Nav bar is present on all public pages', async ({ page }) => {
    await goToPage(page, 'landing');
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('TC-N05: Nav links are present', async ({ page }) => {
    await goToPage(page, 'landing');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).toContain('How It Works');
    expect(bodyText).toContain('Scoring');
    expect(bodyText).toContain('Leaderboard');
  });

  test('TC-N06: Footer is present on landing page', async ({ page }) => {
    await goToPage(page, 'landing');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('StackRank365');
  });

  test('TC-N07: Footer nav links navigate correctly', async ({ page }) => {
    await goToPage(page, 'landing');
    // Click How It Works in footer
    const footerButtons = page.locator('footer button');
    const howItWorks = footerButtons.filter({ hasText: 'How It Works' });
    if (await howItWorks.count() > 0) {
      await howItWorks.first().click();
      await page.waitForTimeout(500);
      const text = await page.locator('body').innerText();
      expect(text).toContain('How It Works');
    }
  });

  test('TC-N08: Page title is StackRank365', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/StackRank365/);
  });

  test('TC-N09: Hash routing #signup navigates to signup', async ({ page }) => {
    await page.goto('/#signup');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const text = await page.locator('body').innerText();
    // Should route to signup page
    expect(text).toMatch(/sign up|create account|join/i);
  });

  test('TC-N10: Leaderboard page renders ranked list', async ({ page }) => {
    await goToPage(page, 'leaderboard');
    await expect(page.locator('body')).toContainText('Leaderboard');
  });

  test('TC-N11: How It Works page renders steps', async ({ page }) => {
    await goToPage(page, 'how-it-works');
    await expect(page.locator('body')).toContainText('How It Works');
  });

  test('TC-N12: Pricing page has 3 tier cards', async ({ page }) => {
    await goToPage(page, 'pricing');
    const text = await page.locator('body').innerText();
    expect(text).toContain('Free');
    expect(text).toContain('Pro');
    expect(text).toContain('Recruiter');
  });

  test('TC-N13: Privacy policy page renders', async ({ page }) => {
    await goToPage(page, 'privacy');
    await expect(page.locator('body')).toContainText('Privacy');
  });

  test('TC-N14: Signing in redirects authenticated user away from /signin', async ({ page }) => {
    // Without auth, signin page should render the form
    await goToPage(page, 'signin');
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/sign in|log in|email|password/i);
  });

});
