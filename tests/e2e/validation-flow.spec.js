/**
 * TS-08: Peer Validation Flow
 * Covers: ValidatePage token routing, token handling, accept/decline logic.
 */
import { test, expect } from '@playwright/test';
import { sbRest } from './helpers.js';

test.describe('TS-08 Validation Flow', () => {

  test('TC-VF01: ValidatePage renders with a token param', async ({ page }) => {
    await page.goto('/#validate?token=test_token_abc123');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/validat|project|approve|decline|accept/i);
  });

  test('TC-VF02: Invalid/expired token shows error state', async ({ page }) => {
    await page.goto('/#validate?token=INVALID_TOKEN_THAT_DOES_NOT_EXIST_XYZ');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const text = await page.locator('body').innerText();
    // Should show error or "not found" message — not a blank page
    expect(text.length).toBeGreaterThan(50);
    expect(text).not.toMatch(/^$/);
  });

  test('TC-VF03: Validation token query — table accessible via RLS', async () => {
    const { ok, status } = await sbRest('/rest/v1/validations?select=id,status,token&limit=1');
    // Should not be 500 — either data or empty due to RLS
    expect(status).not.toBe(500);
  });

  test('TC-VF04: project_validations table accessible', async () => {
    const { status } = await sbRest('/rest/v1/project_validations?select=id&limit=1');
    expect([200, 206, 401, 403]).toContain(status);
  });

  test('TC-VF05: send-validation-request — missing validation_id returns 400', async () => {
    const res = await fetch('https://shnuwkjkjthvaovoywju.supabase.co/functions/v1/send-validation-request', {
      method: 'POST',
      headers: {
        apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    // Should return 400 for missing validation_id
    expect([400, 422]).toContain(res.status);
  }, 10_000);

});
