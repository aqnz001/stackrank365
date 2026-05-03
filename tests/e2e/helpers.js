/**
 * Shared helpers for StackRank365 Playwright tests.
 */

export const SB_URL  = 'https://shnuwkjkjthvaovoywju.supabase.co';
export const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

export const TEST_ACCOUNTS = {
  free: { email: 'tester@stackrank365.com', password: 'TestPass123!' },
  recruiter: { email: 'recruiter_test@stackrank365.com', password: 'TestPass123!' },
  pro_expired: { email: 'pro_test@stackrank365.com', password: 'TestPass123!' },
};

/**
 * Navigate to a page using the SPA query-param router.
 */
export async function goToPage(page, pageName) {
  await page.goto(`/?page=${pageName}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Sign in a test user via Supabase Auth REST API and inject the session
 * into the page context (via localStorage / Supabase session).
 */
export async function signIn(page, email, password) {
  const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SB_ANON,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Sign-in failed for ${email}: ${res.status}`);
  const data = await res.json();

  // Inject Supabase session into the browser storage so React picks it up
  await page.addInitScript((session) => {
    const key = `sb-${location.hostname}-auth-token`;
    localStorage.setItem(key, JSON.stringify(session));
  }, data);

  return data;
}

/**
 * Call a Supabase Edge Function via REST.
 */
export async function callEdgeFn(name, body = {}) {
  const res = await fetch(`${SB_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      apikey: SB_ANON,
      Authorization: `Bearer ${SB_ANON}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, ok: res.ok, data: await res.json().catch(() => null) };
}

/**
 * Query Supabase REST API.
 */
export async function sbRest(path) {
  const res = await fetch(`${SB_URL}${path}`, {
    headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}` },
  });
  return { status: res.status, ok: res.ok, data: await res.json().catch(() => null), headers: res.headers };
}
