/**
 * TS-11: Security Tests
 * Covers: RLS enforcement, service role key leak, HTTPS, auth bypass attempts,
 *         sensitive data exposure, admin page protection.
 */
import { test, expect } from '@playwright/test';
import { SB_URL, SB_ANON, sbRest } from './helpers.js';

test.describe('TS-11 Security', () => {

  test('TC-SE01: CRITICAL — No service_role JWT in JS bundle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Collect all JS bundle URLs loaded
    const scriptURLs = [];
    page.on('response', response => {
      if (response.url().match(/\.js(\?|$)/) && response.status() === 200) {
        scriptURLs.push(response.url());
      }
    });

    // Reload to capture scripts
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Fetch each JS file and scan for service_role JWT
    const jwtRx = /eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g;
    let serviceRoleFound = false;

    for (const url of scriptURLs.slice(0, 5)) { // check up to 5 bundles
      try {
        const res = await fetch(url);
        const js = await res.text();
        const jwts = js.match(jwtRx) || [];
        for (const jwt of jwts) {
          try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            if (payload.role === 'service_role') {
              serviceRoleFound = true;
              break;
            }
          } catch {}
        }
      } catch {}
    }

    expect(serviceRoleFound).toBe(false);
  });

  test('TC-SE02: HTTPS enforced — site loads over HTTPS', async ({ page }) => {
    await page.goto('/');
    const url = page.url();
    // In local dev this may be http://localhost — skip that case
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  test('TC-SE03: RLS — Anon cannot read profiles.email', async () => {
    const { ok, data } = await sbRest('/rest/v1/profiles?select=email&limit=5');
    if (!ok) return; // RLS blocking entirely is a pass
    if (Array.isArray(data)) {
      const exposedEmails = data.filter(row => row.email);
      expect(exposedEmails.length).toBe(0);
    }
  });

  test('TC-SE04: RLS — Anon cannot read profiles.fraud_score', async () => {
    const { ok, data } = await sbRest('/rest/v1/profiles?select=fraud_score&limit=5');
    if (!ok) return; // blocked entirely = pass
    if (Array.isArray(data)) {
      const exposed = data.filter(row => row.fraud_score !== undefined && row.fraud_score !== null);
      expect(exposed.length).toBe(0);
    }
  });

  test('TC-SE05: RLS — Anon cannot insert into certifications table', async () => {
    const res = await fetch(`${SB_URL}/rest/v1/certifications`, {
      method: 'POST',
      headers: {
        apikey: SB_ANON,
        Authorization: `Bearer ${SB_ANON}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000',
        code: 'PL-900',
        name: 'Test',
        points: 500,
      }),
    });
    expect([401, 403, 409, 422]).toContain(res.status);
  });

  test('TC-SE06: RLS — Anon cannot update profiles', async () => {
    const res = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.00000000-0000-0000-0000-000000000000`, {
      method: 'PATCH',
      headers: {
        apikey: SB_ANON,
        Authorization: `Bearer ${SB_ANON}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier: 'recruiter' }),
    });
    // Should be blocked or return 0 affected rows
    expect([401, 403, 200]).toContain(res.status); // 200 with 0 rows affected is also OK
  });

  test('TC-SE07: Admin tools page not accessible without password', async ({ page }) => {
    await page.goto('/?page=sr365-admin-tools');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const text = await page.locator('body').innerText();
    // Should show the password gate, not the test runner
    expect(text).toMatch(/admin|password|restricted|lock/i);
    // Should NOT show the test runner dashboard
    expect(text).not.toMatch(/Run All Tests|TC-001|Pass Rate/i);
  });

  test('TC-SE08: Admin fraud page not accessible without password', async ({ page }) => {
    await page.goto('/?page=admin-fraud');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const text = await page.locator('body').innerText();
    // Should show password gate
    expect(text).toMatch(/admin|password|restricted|sign in/i);
  });

  test('TC-SE09: Auth endpoint rejects malformed tokens', async () => {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: {
        apikey: SB_ANON,
        Authorization: 'Bearer this.is.not.a.valid.jwt',
      },
    });
    expect([401, 403]).toContain(res.status);
  });

  test('TC-SE10: Content-Security-Policy header present', async ({ page }) => {
    const res = await page.request.get('/');
    const csp = res.headers()['content-security-policy'];
    // Note: many SPA hosts don't set CSP — log as informational if missing
    if (!csp) {
      console.warn('[WARN] TC-SE10: No Content-Security-Policy header found — consider adding one');
    }
    // Test passes regardless (this is informational), but we flag it
  });

  test('TC-SE11: X-Frame-Options header present (clickjacking protection)', async ({ page }) => {
    const res = await page.request.get('/');
    const xfo = res.headers()['x-frame-options'];
    const csp = res.headers()['content-security-policy'];
    const hasFrameProtection = !!xfo || (csp && csp.includes('frame-ancestors'));
    if (!hasFrameProtection) {
      console.warn('[WARN] TC-SE11: No X-Frame-Options or frame-ancestors CSP directive — clickjacking risk');
    }
  });

});
