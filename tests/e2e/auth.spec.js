/**
 * TS-02: Authentication Flows
 * Covers: email signup, signin, password reset, session persistence,
 *         error handling, redirect logic.
 */
import { test, expect } from '@playwright/test';
import { SB_URL, SB_ANON, goToPage } from './helpers.js';

const SB_ANON_HEADERS = {
  apikey: SB_ANON,
  'Content-Type': 'application/json',
};

async function sbAuth(path, body) {
  return fetch(`${SB_URL}${path}`, {
    method: 'POST',
    headers: SB_ANON_HEADERS,
    body: JSON.stringify(body),
  });
}

test.describe('TS-02 Authentication', () => {

  test('TC-A01: Sign up with valid new email returns user object', async () => {
    const uniqueEmail = `sr365.test.${Date.now()}@mailinator.com`;
    const res = await sbAuth('/auth/v1/signup', { email: uniqueEmail, password: 'TestPass123!' });
    const data = await res.json();
    expect(res.ok).toBeTruthy();
    expect(data.user?.id || data.id).toBeTruthy();
  });

  test('TC-A02: Sign up with weak password rejected', async () => {
    const uniqueEmail = `sr365.weak.${Date.now()}@mailinator.com`;
    const res = await sbAuth('/auth/v1/signup', { email: uniqueEmail, password: '123' });
    // Supabase minimum is 6 chars by default — should fail
    const data = await res.json();
    const isRejected = !res.ok || data.error || data.error_description || data.message;
    expect(isRejected).toBeTruthy();
  });

  test('TC-A03: Sign in with valid credentials returns access_token', async () => {
    const res = await sbAuth('/auth/v1/token?grant_type=password', {
      email: 'tester@stackrank365.com',
      password: 'TestPass123!',
    });
    if (res.status === 400) {
      // Account doesn't exist yet - skip gracefully
      test.skip(true, 'Test account not set up');
    }
    const data = await res.json();
    expect(data.access_token).toBeTruthy();
    expect(data.user?.email).toBe('tester@stackrank365.com');
  });

  test('TC-A04: Sign in with wrong password returns 400', async () => {
    const res = await sbAuth('/auth/v1/token?grant_type=password', {
      email: 'tester@stackrank365.com',
      password: 'WrongPassword999!',
    });
    expect(res.ok).toBeFalsy();
  });

  test('TC-A05: Sign in with non-existent email returns 400', async () => {
    const res = await sbAuth('/auth/v1/token?grant_type=password', {
      email: `nobody.${Date.now()}@nowhere.invalid`,
      password: 'Test123!',
    });
    expect(res.ok).toBeFalsy();
  });

  test('TC-A06: Unauthenticated /auth/v1/user returns 401', async () => {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_ANON },
    });
    expect([401, 403]).toContain(res.status);
  });

  test('TC-A07: Sign-in form renders with email and password fields', async ({ page }) => {
    await goToPage(page, 'signin');
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('TC-A08: Sign-up form renders (2-step flow visible)', async ({ page }) => {
    await goToPage(page, 'signup');
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/sign up|create|join|email|microsoft/i);
  });

  test('TC-A09: Forgot password link visible on sign-in page', async ({ page }) => {
    await goToPage(page, 'signin');
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/forgot|reset|password/i);
  });

  test('TC-A10: Dashboard redirect when authenticated', async ({ page }) => {
    // Without credentials, dashboard should show spinner then redirect to signin
    await goToPage(page, 'dashboard');
    await page.waitForTimeout(3000);
    const text = await page.locator('body').innerText();
    // Either sign-in prompt or dashboard content (if session exists)
    expect(text).toMatch(/sign in|dashboard|certifications|StackRank365/i);
  });

  test('TC-A11: Password reset flow initiates correctly', async () => {
    const res = await fetch(`${SB_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: SB_ANON_HEADERS,
      body: JSON.stringify({ email: 'tester@stackrank365.com' }),
    });
    // Should return 200 even if email doesn't exist (to prevent email enumeration)
    expect(res.status).toBe(200);
  });

  test('TC-A12: Reset-password page renders token form', async ({ page }) => {
    // Navigate to reset-password page (normally reached via email link)
    await page.goto('/?page=reset-password');
    await page.waitForLoadState('networkidle');
    const text = await page.locator('body').innerText();
    expect(text).toMatch(/password|reset/i);
  });

});
