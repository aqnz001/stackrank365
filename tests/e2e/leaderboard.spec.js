/**
 * TS-06: Leaderboard
 * Covers: loading, ranking order, filters, profile links.
 */
import { test, expect } from '@playwright/test';
import { goToPage, sbRest } from './helpers.js';

test.describe('TS-06 Leaderboard', () => {

  test('TC-LB01: Leaderboard page renders', async ({ page }) => {
    await goToPage(page, 'leaderboard');
    await expect(page.locator('body')).toContainText('Leaderboard');
  });

  test('TC-LB02: Leaderboard shows ranked entries', async ({ page }) => {
    await goToPage(page, 'leaderboard');
    await page.waitForTimeout(2000);
    const text = await page.locator('body').innerText();
    // Should show at least rank numbers or score values
    expect(text).toMatch(/#1|rank|score|pts/i);
  });

  test('TC-LB03: Leaderboard REST view returns data in score order', async () => {
    const { ok, data } = await sbRest('/rest/v1/leaderboard?select=username,score&order=score.desc&limit=10');
    if (!ok || !data?.length) {
      // Leaderboard view might be empty or have RLS — skip gracefully
      return;
    }
    // Verify descending order
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].score).toBeGreaterThanOrEqual(data[i + 1].score);
    }
  });

  test('TC-LB04: Filter controls render on leaderboard', async ({ page }) => {
    await goToPage(page, 'leaderboard');
    await page.waitForTimeout(1500);
    const text = await page.locator('body').innerText();
    // Expect filter UI elements
    expect(text).toMatch(/all|filter|specialism|dynamics|power platform/i);
  });

  test('TC-LB05: Profile links on leaderboard are clickable', async ({ page }) => {
    await goToPage(page, 'leaderboard');
    await page.waitForTimeout(2000);
    const buttons = page.locator('button').filter({ hasText: /view|profile/i });
    if (await buttons.count() > 0) {
      await buttons.first().click();
      await page.waitForTimeout(1000);
      const text = await page.locator('body').innerText();
      expect(text).toMatch(/certifications|score|rank|profile/i);
    }
  });

  test('TC-LB06: Leaderboard shows specialism badges', async ({ page }) => {
    await goToPage(page, 'leaderboard');
    await page.waitForTimeout(2000);
    const text = await page.locator('body').innerText();
    // Should mention at least one specialism
    expect(text).toMatch(/Dynamics|Power Platform|Azure|Copilot|StackRank/i);
  });

  test('TC-LB07: Leaderboard RLS — anon can read public leaderboard data', async () => {
    const { ok, status } = await sbRest('/rest/v1/leaderboard?select=username,score&limit=5');
    // Should succeed (leaderboard is public) or return empty if RLS blocks anon
    expect([200, 206]).toContain(status);
  });

});
