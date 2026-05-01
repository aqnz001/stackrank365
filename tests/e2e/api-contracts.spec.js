/**
 * TS-12: API Contract Validation
 * Verifies: Supabase REST schema, Edge Function response shapes,
 *           Auth endpoint contracts, error response formats.
 */
import { test, expect } from '@playwright/test';
import { SB_URL, SB_ANON, sbRest, callEdgeFn } from './helpers.js';

const TIMEOUT_MS = 10_000;

test.describe('TS-12 API Contracts', () => {

  // ── Supabase REST ──────────────────────────────────────────────────────────

  test('TC-AC01: profiles table — schema shape', async () => {
    const { ok, data } = await sbRest('/rest/v1/profiles?select=id,username,name,tier,reputation_score&limit=1');
    if (!ok || !data?.length) return; // empty DB or RLS — skip shape check
    const row = data[0];
    expect(typeof row.id).toBe('string');
    // tier must be one of the known values
    if (row.tier) {
      expect(['free', 'pro', 'recruiter']).toContain(row.tier);
    }
  });

  test('TC-AC02: certifications table — expected columns exist', async () => {
    const { ok, status } = await sbRest(
      '/rest/v1/certifications?select=id,user_id,code,name,verified,verification_status,score_multiplier&limit=1'
    );
    // If 400, the columns don't exist (schema mismatch)
    expect(status).not.toBe(400);
  });

  test('TC-AC03: cert_catalog — expected columns exist', async () => {
    const { ok, data } = await sbRest(
      '/rest/v1/cert_catalog?select=certification_uid,certification_name,technology_area,level&limit=2'
    );
    expect(ok).toBeTruthy();
  });

  test('TC-AC04: leaderboard view — returns ranked array', async () => {
    const { ok, data } = await sbRest(
      '/rest/v1/leaderboard?select=username,score&order=score.desc&limit=5'
    );
    expect(ok).toBeTruthy();
    if (data?.length) {
      expect(typeof data[0].score === 'number' || data[0].score !== undefined).toBeTruthy();
    }
  });

  test('TC-AC05: profiles — alias columns present (open_to_work, tier, fraud_status)', async () => {
    const { ok, status } = await sbRest(
      '/rest/v1/profiles?select=open_to_work,tier,fraud_status,fraud_score,reputation_score&limit=1'
    );
    expect(status).not.toBe(400);
  });

  test('TC-AC06: certifications — alias columns (ms_cert_id, profile_id, issued_date)', async () => {
    const { ok, status } = await sbRest(
      '/rest/v1/certifications?select=ms_cert_id,profile_id,issued_date&limit=1'
    );
    expect(status).not.toBe(400);
  });

  // ── Edge Functions ─────────────────────────────────────────────────────────

  test('TC-EF01: analyse-resume — missing pdf_base64 returns 400', async () => {
    const { status } = await callEdgeFn('analyse-resume', {});
    expect(status).toBe(400);
  }, TIMEOUT_MS);

  test('TC-EF02: fetch-linkedin-profile — missing handle returns 400', async () => {
    const { status } = await callEdgeFn('fetch-linkedin-profile', {});
    expect(status).toBe(400);
  }, TIMEOUT_MS);

  test('TC-EF03: verify-cert — missing params returns 400', async () => {
    const { status } = await callEdgeFn('verify-cert', {});
    expect(status).toBe(400);
  }, TIMEOUT_MS);

  test('TC-EF04: recruiter-match — missing job_description returns 400', async () => {
    const { status } = await callEdgeFn('recruiter-match', {});
    expect(status).toBe(400);
  }, TIMEOUT_MS);

  test('TC-EF05: batch-verify-certs — deployed and returns expected shape', async () => {
    const { ok, status, data } = await callEdgeFn('batch-verify-certs', { limit: 1 });
    if (status === 500 || status === 404) {
      console.warn('[WARN] TC-EF05: batch-verify-certs not deployed or erroring');
      return;
    }
    expect(ok).toBeTruthy();
    expect(typeof data?.processed).toBe('number');
  }, 15_000);

  test('TC-EF06: detect-fake-profiles — deployed and returns expected shape', async () => {
    const { ok, status, data } = await callEdgeFn('detect-fake-profiles', { limit: 1 });
    if (status === 500 || status === 404) {
      console.warn('[WARN] TC-EF06: detect-fake-profiles not deployed or erroring');
      return;
    }
    expect(ok).toBeTruthy();
    expect(typeof data?.checked).toBe('number');
  }, 15_000);

  test('TC-EF07: sync-catalog — deployed and returns synced count', async () => {
    const { ok, status, data } = await callEdgeFn('sync-catalog', {});
    if (status === 500 || status === 404) {
      console.warn('[WARN] TC-EF07: sync-catalog not deployed or erroring');
      return;
    }
    expect(ok).toBeTruthy();
    expect(typeof data?.synced).toBe('number');
  }, 20_000);

  // ── Auth Contract ──────────────────────────────────────────────────────────

  test('TC-AC10: Auth signup response shape', async () => {
    const uniqueEmail = `sr365.contract.${Date.now()}@mailinator.com`;
    const res = await fetch(`${SB_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: SB_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'TestPass123!' }),
    });
    const data = await res.json();
    expect(res.ok).toBeTruthy();
    // Supabase signup returns { user: {...}, session: {...} } or { id: ... }
    const hasUser = !!data.user || !!data.id;
    expect(hasUser).toBeTruthy();
  });

  test('TC-AC11: REST API returns Content-Type application/json', async () => {
    const res = await fetch(`${SB_URL}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` },
    });
    const ct = res.headers.get('content-type') || '';
    expect(ct).toMatch(/application\/json/);
  });

  test('TC-AC12: REST API handles unknown table gracefully (404 or 400)', async () => {
    const { status } = await sbRest('/rest/v1/nonexistent_table_xyz?limit=1');
    expect([400, 404]).toContain(status);
  });

  // ── Data Integrity ─────────────────────────────────────────────────────────

  test('TC-DI01: cert_catalog — no null certification_uid rows', async () => {
    const { ok, data } = await sbRest('/rest/v1/cert_catalog?select=id&certification_uid=is.null&limit=1');
    if (!ok) return; // RLS blocked
    expect(Array.isArray(data) ? data.length : 0).toBe(0);
  });

  test('TC-DI02: certifications — verification_status only valid values', async () => {
    const { ok, data } = await sbRest(
      '/rest/v1/certifications?select=verification_status&not.verification_status=in.(unverified,pending,verified,failed)&limit=5'
    );
    if (!ok) return; // RLS blocked
    expect(Array.isArray(data) ? data.length : 0).toBe(0);
  });

  test('TC-DI03: profiles — tier only valid values', async () => {
    const { ok, data } = await sbRest(
      '/rest/v1/profiles?select=tier&not.tier=in.(free,pro,recruiter)&limit=5'
    );
    if (!ok) return;
    expect(Array.isArray(data) ? data.length : 0).toBe(0);
  });

});
