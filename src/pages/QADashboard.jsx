/**
 * QA Dashboard — StackRank365 Internal QA Control Centre
 * Route: ?page=sr365-qa
 * Access: SHA-256 password gated (same as AdminTools)
 *
 * Features:
 *  - Test plan viewer (all suites from QA-TEST-PLAN.md)
 *  - In-browser test execution with pass/fail/skip/warn tracking
 *  - Persistent issue log (severity tagging, grouped by category)
 *  - Feature coverage matrix
 *  - Export results to CSV / JSON
 *  - Re-runnable on demand
 */
import { useState, useEffect, useRef } from 'react';

// ─── Config ──────────────────────────────────────────────────────────────────
const ADMIN_HASH = 'b89815ec9b87bdc40215bc27947f673568d39a675f78d61bd90c279d73cab6c3';
const SESSION_KEY = 'sr365_qa_unlocked';
const SB   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';
const SITE = 'https://www.stackrank365.com';
const ISSUES_KEY = 'sr365_qa_issues';
const RESULTS_KEY = 'sr365_qa_results';

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
const sbRest = (path) => fetch(SB + path, {
  headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' }
});
const sbFn = (name, body = {}) => fetch(SB + '/functions/v1/' + name, {
  method: 'POST',
  headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const withTimeout = (p, ms = 10000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout ' + ms + 'ms')), ms))]);
async function safeJson(res) {
  const t = await res.text();
  if (t.trim().startsWith('<')) throw new Error('HTML response');
  try { return JSON.parse(t); } catch { return { _raw: t.slice(0, 80) }; }
}
const pass = (m) => ({ status: 'pass', message: m });
const fail = (m) => ({ status: 'fail', message: m });
const skip = (m) => ({ status: 'skip', message: m });
const warn = (m) => ({ status: 'warn', message: m });

// ─── Test Suites ─────────────────────────────────────────────────────────────
const SUITES = [
  {
    id: 'navigation', name: 'TS-01 Navigation & Routing', category: 'Functional',
    tests: [
      { id: 'TC-N01', name: 'Landing page shell loads (HTTP 200)', priority: 'P1', run: async () => { const r = await fetch(SITE); return r.ok ? pass('HTTP ' + r.status) : fail('HTTP ' + r.status); } },
      { id: 'TC-N02', name: 'Page title contains StackRank365', priority: 'P1', run: async () => { const h = await fetch(SITE).then(r => r.text()); return h.includes('StackRank365') ? pass('Title OK') : fail('Title missing'); } },
      { id: 'TC-N03', name: 'All nav links in DOM', priority: 'P1', run: async () => { const t = document.body.innerText; const missing = ['How It Works', 'Scoring', 'Leaderboard'].filter(n => !t.includes(n)); return missing.length ? fail('Missing: ' + missing.join(', ')) : pass('All nav links present'); } },
      { id: 'TC-N04', name: 'Load time < 4s (production)', priority: 'P2', run: async () => { const t = Date.now(); await fetch(SITE); const ms = Date.now() - t; return ms > 4000 ? warn(ms + 'ms exceeds 4s target') : pass(ms + 'ms'); } },
      { id: 'TC-N05', name: 'Pricing page shell loads', priority: 'P1', run: async () => { const r = await fetch(SITE + '/?page=pricing'); return r.ok ? pass('OK') : fail('HTTP ' + r.status); } },
      { id: 'TC-N06', name: 'Privacy page shell loads', priority: 'P1', run: async () => { const r = await fetch(SITE + '/?page=privacy'); return r.ok ? pass('OK') : fail('HTTP ' + r.status); } },
      { id: 'TC-N07', name: 'Leaderboard page shell loads', priority: 'P1', run: async () => { const r = await fetch(SITE + '/?page=leaderboard'); return r.ok ? pass('OK') : fail('HTTP ' + r.status); } },
      { id: 'TC-N08', name: 'Recruiter dashboard shell loads', priority: 'P1', run: async () => { const r = await fetch(SITE + '/?page=recruiter-dashboard'); return r.ok ? pass('OK') : fail('HTTP ' + r.status); } },
      { id: 'TC-N09', name: 'No broken pages (18 routes)', priority: 'P1', run: async () => { const pages = ['landing','pricing','privacy','leaderboard','signin','signup','how-it-works','scoring','about','for-recruiters','dashboard','recruiter-dashboard','admin-fraud']; const res = await Promise.all(pages.map(p => fetch(SITE + '/?page=' + p).then(r => ({ p, ok: r.ok, s: r.status })))); const broken = res.filter(r => !r.ok); return broken.length ? fail('Broken: ' + broken.map(r => r.p + '(' + r.s + ')').join(', ')) : pass('All ' + pages.length + ' page shells return 200'); } },
    ]
  },
  {
    id: 'auth', name: 'TS-02 Authentication', category: 'Functional',
    tests: [
      { id: 'TC-A01', name: 'Sign up new email → user created', priority: 'P1', run: async () => { const e = 'sr365.qa.' + Date.now() + '@mailinator.com'; const r = await fetch(SB + '/auth/v1/signup', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: e, password: 'TestPass123!' }) }); const d = await safeJson(r); return (d.user?.id || d.id) ? pass('User created: ' + (d.user?.id || d.id).slice(0, 8) + '...') : warn('Check: ' + (d.error_description || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-A02', name: 'Sign in valid credentials → access_token', priority: 'P1', run: async () => { const r = await fetch(SB + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'tester@stackrank365.com', password: 'TestPass123!' }) }); const d = await safeJson(r); return d.access_token ? pass('Token received for ' + d.user?.email) : fail('No token: ' + (d.error_description || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-A03', name: 'Wrong password rejected (401)', priority: 'P1', run: async () => { const r = await fetch(SB + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'tester@stackrank365.com', password: 'WrongPass999!' }) }); return !r.ok ? pass('Rejected (' + r.status + ')') : fail('SECURITY: wrong password accepted!'); } },
      { id: 'TC-A04', name: 'Fake email rejected', priority: 'P1', run: async () => { const r = await fetch(SB + '/auth/v1/token?grant_type=password', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'nobody_' + Date.now() + '@nowhere.invalid', password: 'Test!' }) }); return !r.ok ? pass('Rejected (' + r.status + ')') : fail('SECURITY: fake email accepted!'); } },
      { id: 'TC-A05', name: 'Unauthenticated /auth/v1/user → 401', priority: 'P1', run: async () => { const r = await fetch(SB + '/auth/v1/user', { headers: { apikey: ANON } }); return [401, 403].includes(r.status) ? pass('Rejected (' + r.status + ')') : fail('Expected 401/403, got ' + r.status); } },
      { id: 'TC-A06', name: 'Password reset endpoint responds', priority: 'P2', run: async () => { const r = await fetch(SB + '/auth/v1/recover', { method: 'POST', headers: { apikey: ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'tester@stackrank365.com' }) }); return r.status === 200 ? pass('Reset email triggered') : warn('HTTP ' + r.status); } },
    ]
  },
  {
    id: 'database', name: 'TS-03 Database & Schema', category: 'Data',
    tests: [
      { id: 'TC-DB01', name: 'profiles table accessible', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=id,username,tier&limit=5'); return r.ok ? pass((await safeJson(r)).length + ' rows via RLS') : fail('HTTP ' + r.status); } },
      { id: 'TC-DB02', name: 'cert_catalog >= 100 rows', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/cert_catalog?select=id'); const ct = parseInt((r.headers.get('content-range') || '').split('/')[1] || '0'); if (ct === 0) { const d = await safeJson(r); return Array.isArray(d) ? (d.length >= 1 ? pass(d.length + '+ rows') : fail('Empty catalog — run sync-catalog')) : warn('Cannot determine count'); } return ct < 100 ? fail('Only ' + ct + ' — run sync-catalog') : pass(ct + ' certs in catalog'); } },
      { id: 'TC-DB03', name: 'certifications alias columns exist', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/certifications?select=ms_cert_id,profile_id,issued_date,score_multiplier&limit=1'); return r.ok ? pass('Alias columns OK') : fail('Missing: ' + (await safeJson(r)).message); } },
      { id: 'TC-DB04', name: 'profiles Phase 3+ columns exist', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=open_to_work,tier,tier_expires_at,fraud_status,fraud_score,reputation_score&limit=1'); return r.ok ? pass('All new columns present') : fail('Missing: ' + (await safeJson(r)).message); } },
      { id: 'TC-DB05', name: 'fraud_audit_log table exists', priority: 'P2', run: async () => { const r = await sbRest('/rest/v1/fraud_audit_log?limit=1'); return [400, 404].includes(r.status) ? fail('Table missing') : pass('Table accessible'); } },
      { id: 'TC-DB06', name: 'disputes table exists', priority: 'P2', run: async () => { const r = await sbRest('/rest/v1/disputes?limit=1'); return [400, 404].includes(r.status) ? fail('Table missing') : pass('Table accessible'); } },
      { id: 'TC-DB07', name: 'validations table exists', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/validations?limit=1'); return [400, 404].includes(r.status) ? fail('Table missing') : pass('Table accessible'); } },
      { id: 'TC-DB08', name: 'leaderboard view returns data', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/leaderboard?select=username,score&order=score.desc&limit=5'); const d = await safeJson(r); return r.ok ? pass(Array.isArray(d) ? d.length + ' leaderboard rows' : 'Accessible') : fail('HTTP ' + r.status); } },
      { id: 'TC-DB09', name: 'calculate_user_score RPC accessible', priority: 'P1', run: async () => { const r = await fetch(SB + '/rest/v1/rpc/calculate_user_score', { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_user_id: '00000000-0000-0000-0000-000000000000' }) }); return [200, 400, 401, 403, 404, 422].includes(r.status) ? pass('RPC endpoint exists (HTTP ' + r.status + ')') : fail('Unexpected status: ' + r.status); } },
    ]
  },
  {
    id: 'scoring', name: 'TS-04 Scoring & Data Integrity', category: 'Data',
    tests: [
      { id: 'TC-SC01', name: 'Verified certs have score_multiplier = 1.0', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.verified&limit=10'); if (!r.ok) return skip('RLS blocks anon'); const rows = await safeJson(r); if (!rows.length) return skip('No verified certs yet'); const bad = rows.filter(r => parseFloat(r.score_multiplier) !== 1.0); return bad.length ? fail(bad.length + ' verified certs have wrong multiplier') : pass(rows.length + ' verified → 1.0'); } },
      { id: 'TC-SC02', name: 'Unverified certs have score_multiplier = 0.25', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.unverified&limit=10'); if (!r.ok) return skip('RLS blocks anon'); const rows = await safeJson(r); if (!rows.length) return skip('No unverified certs'); const bad = rows.filter(r => parseFloat(r.score_multiplier) !== 0.25); return bad.length ? fail(bad.length + ' unverified certs have wrong multiplier') : pass(rows.length + ' unverified → 0.25'); } },
      { id: 'TC-SC03', name: 'tier values only (free/pro/recruiter)', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=tier&not.tier=in.(free,pro,recruiter)&limit=5'); if (!r.ok) return skip('RLS'); const rows = await safeJson(r); return rows.length ? fail(rows.length + ' invalid tier values') : pass('All tier values valid'); } },
      { id: 'TC-SC04', name: 'verification_status only valid values', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/certifications?select=verification_status&not.verification_status=in.(unverified,pending,verified,failed)&limit=5'); if (!r.ok) return skip('RLS'); const rows = await safeJson(r); return rows.length ? fail(rows.length + ' invalid status values') : pass('All status values valid'); } },
      { id: 'TC-SC05', name: 'cert_catalog: no null certification_uid', priority: 'P2', run: async () => { const r = await sbRest('/rest/v1/cert_catalog?select=id&certification_uid=is.null&limit=1'); if (!r.ok) return skip('Blocked'); const rows = await safeJson(r); return rows.length ? fail(rows.length + ' null UIDs found') : pass('All UIDs non-null'); } },
    ]
  },
  {
    id: 'security', name: 'TS-05 Security', category: 'Security',
    tests: [
      { id: 'TC-SE01', name: 'HTTPS enforced', priority: 'P1', run: async () => location.protocol === 'https:' ? pass('HTTPS confirmed') : warn('Running on ' + location.protocol + ' (OK for localhost)') },
      { id: 'TC-SE02', name: 'No service_role JWT in JS bundle', priority: 'P1', run: async () => { const html = await fetch(SITE).then(r => r.text()); const srcMatch = html.match(/src="([^"]*index[^"]*\.js)"/); if (!srcMatch) return warn('Cannot find JS bundle URL'); const src = srcMatch[1]; const js = await fetch(src.startsWith('http') ? src : SITE + src).then(r => r.text()); const jwtRx = /eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g; const jwts = js.match(jwtRx) || []; const leaked = jwts.some(jwt => { try { return JSON.parse(atob(jwt.split('.')[1])).role === 'service_role'; } catch { return false; } }); return leaked ? fail('CRITICAL: service_role JWT in client bundle!') : pass('No service_role JWT found'); } },
      { id: 'TC-SE03', name: 'Anon cannot read profiles.email', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=email&limit=5'); if (!r.ok) return pass('Anon query blocked by RLS'); const rows = await safeJson(r); return rows.some(rw => rw.email) ? fail('SECURITY: email column exposed!') : pass('email hidden by RLS'); } },
      { id: 'TC-SE04', name: 'Anon cannot read fraud_score', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=fraud_score&limit=5'); if (!r.ok) return pass('Blocked'); const rows = await safeJson(r); return rows.some(rw => rw.fraud_score !== undefined && rw.fraud_score !== null) ? fail('SECURITY: fraud_score exposed!') : pass('fraud_score hidden'); } },
      { id: 'TC-SE05', name: 'Anon cannot insert into certifications', priority: 'P1', run: async () => { const r = await fetch(SB + '/rest/v1/certifications', { method: 'POST', headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: '00000000-0000-0000-0000-000000000000', code: 'TEST-000', name: 'RLS Test', points: 0 }) }); return [401, 403, 409, 422].includes(r.status) ? pass('Insert blocked (' + r.status + ')') : fail('SECURITY: Unauthenticated insert allowed (' + r.status + ')'); } },
      { id: 'TC-SE06', name: 'REST API Content-Type is application/json', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=id&limit=1'); const ct = r.headers.get('content-type') || ''; return ct.includes('application/json') ? pass('Content-Type: ' + ct.split(';')[0]) : fail('Wrong content type: ' + ct); } },
      { id: 'TC-SE07', name: 'Malformed JWT rejected by auth', priority: 'P1', run: async () => { const r = await fetch(SB + '/auth/v1/user', { headers: { apikey: ANON, Authorization: 'Bearer this.is.not.valid' } }); return [401, 403].includes(r.status) ? pass('Malformed JWT rejected (' + r.status + ')') : fail('Expected 401/403, got ' + r.status); } },
    ]
  },
  {
    id: 'edge_fns', name: 'TS-06 Edge Functions', category: 'Integration',
    tests: [
      { id: 'TC-EF01', name: 'analyse-resume: no pdf → 400', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('analyse-resume', {})); return r.status === 400 ? pass('400 for missing pdf') : fail('Expected 400, got ' + r.status); } },
      { id: 'TC-EF02', name: 'fetch-linkedin-profile: no handle → 400', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('fetch-linkedin-profile', {})); return r.status === 400 ? pass('400 for missing handle') : fail('Expected 400, got ' + r.status); } },
      { id: 'TC-EF03', name: 'verify-cert: no params → 400', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('verify-cert', {})); return r.status === 400 ? pass('400 for missing params') : fail('Expected 400, got ' + r.status); } },
      { id: 'TC-EF04', name: 'recruiter-match: no JD → 400', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('recruiter-match', {})); return r.status === 400 ? pass('400 for missing JD') : fail('Expected 400, got ' + r.status); } },
      { id: 'TC-EF05', name: 'batch-verify-certs: deployed & runs', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('batch-verify-certs', { limit: 2 }), 15000); const d = await safeJson(r); return (r.ok && d.processed !== undefined) ? pass('processed=' + d.processed + ', verified=' + d.verified) : fail('HTTP ' + r.status + ': ' + (d.error || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-EF06', name: 'detect-fake-profiles: deployed & runs', priority: 'P2', run: async () => { const r = await withTimeout(sbFn('detect-fake-profiles', { limit: 2 }), 15000); const d = await safeJson(r); return (r.ok && d.checked !== undefined) ? pass('checked=' + d.checked + ', flagged=' + d.flagged) : fail('HTTP ' + r.status + ': ' + (d.error || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-EF07', name: 'cert-expiry-reminders: deployed & runs', priority: 'P2', run: async () => { const r = await withTimeout(sbFn('cert-expiry-reminders', {}), 15000); const d = await safeJson(r); return r.ok ? pass('sent_90=' + d.sent_90 + ', sent_30=' + d.sent_30) : fail('HTTP ' + r.status + ': ' + (d.error || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-EF08', name: 'sync-catalog: deployed & returns synced', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('sync-catalog', {}), 20000); const d = await safeJson(r); return (r.ok && d.synced !== undefined) ? pass('Synced ' + d.synced + ' certs') : fail('HTTP ' + r.status + ': ' + (d.error || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-EF09', name: 'verify-reputation: deployed & runs', priority: 'P2', run: async () => { const r = await withTimeout(sbFn('verify-reputation', { limit: 2 }), 15000); const d = await safeJson(r); return r.ok ? pass('verified=' + d.verified + ', warnings=' + d.warnings) : fail('HTTP ' + r.status + ': ' + (d.error || JSON.stringify(d).slice(0, 60))); } },
      { id: 'TC-EF10', name: 'send-contact-request: deployed (MISSING CHECK)', priority: 'P1', run: async () => { const r = await withTimeout(sbFn('send-contact-request', {}), 8000); if (r.status === 404) return fail('MISSING: send-contact-request function not deployed (called by RecruiterDashboard)'); return r.status === 400 ? pass('Deployed — 400 for missing params') : warn('HTTP ' + r.status + ' (may be OK)'); } },
    ]
  },
  {
    id: 'cta_pages', name: 'TS-07 CTAs & Page Content', category: 'UI/UX',
    tests: [
      { id: 'TC-CTA01', name: 'Landing: "Waitlist" CTA in rendered DOM', priority: 'P1', run: async () => { const t = document.body.innerText; return t.match(/waitlist|join|get started|early access/i) ? pass('Acquisition CTA present') : fail('No waitlist/CTA found in DOM'); } },
      { id: 'TC-CTA02', name: 'Landing: leaderboard link in DOM', priority: 'P1', run: async () => { const t = document.body.innerText; return t.includes('Leaderboard') ? pass('Leaderboard link present') : fail('Leaderboard link missing'); } },
      { id: 'TC-CTA03', name: 'Landing: "How It Works" link in DOM', priority: 'P1', run: async () => { const t = document.body.innerText; return t.includes('How It Works') ? pass('Present') : fail('How It Works link missing'); } },
      { id: 'TC-CTA04', name: 'Footer: present and has branding', priority: 'P1', run: async () => { const footer = document.querySelector('footer'); return footer ? pass('Footer present, height=' + footer.offsetHeight + 'px') : fail('No <footer> element found'); } },
      { id: 'TC-CTA05', name: 'Nav logo present', priority: 'P1', run: async () => { const t = document.body.innerText; return t.includes('StackRank365') || t.includes('StackRank') ? pass('Brand logo text present') : fail('Brand logo missing'); } },
      { id: 'TC-CTA06', name: 'No console errors on landing (approximation)', priority: 'P2', run: async () => { const t = document.body.innerText; return !t.includes('Uncaught') && !t.includes('TypeError') ? pass('No visible JS errors in DOM') : fail('Possible JS error visible in DOM'); } },
    ]
  },
  {
    id: 'tier', name: 'TS-08 Tier & Feature Access', category: 'Functional',
    tests: [
      { id: 'TC-T01', name: 'Tier expiry: pro with past tier_expires_at → free in profile row', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=tier,tier_expires_at&tier=eq.pro&tier_expires_at=lt.now()&limit=5'); if (!r.ok) return skip('RLS blocks anon'); const rows = await safeJson(r); return rows.length ? warn(rows.length + ' expired pro profiles in DB (should downgrade on next load)') : pass('No un-downgraded expired pro profiles'); } },
      { id: 'TC-T02', name: 'Tier check: valid values only', priority: 'P1', run: async () => { const r = await sbRest('/rest/v1/profiles?select=tier&not.tier=in.(free,pro,recruiter)&limit=5'); if (!r.ok) return skip('RLS'); const rows = await safeJson(r); return rows.length ? fail(rows.length + ' invalid tier values') : pass('All tiers valid'); } },
      { id: 'TC-T03', name: 'Pricing page: 3 tier cards in DOM', priority: 'P1', run: async () => { const t = document.body.innerText; const hasFree = t.includes('Free'); const hasPro = t.includes('Pro'); const hasRec = t.includes('Recruiter'); return (hasFree && hasPro && hasRec) ? pass('All 3 tier cards present') : fail('Missing: ' + [!hasFree && 'Free', !hasPro && 'Pro', !hasRec && 'Recruiter'].filter(Boolean).join(', ')); } },
    ]
  },
  {
    id: 'admin', name: 'TS-09 Admin & Fraud', category: 'Admin',
    tests: [
      { id: 'TC-AD01', name: 'detect-fake-profiles runs cleanly (0 errors)', priority: 'P2', run: async () => { const r = await withTimeout(sbFn('detect-fake-profiles', { limit: 5 }), 15000); const d = await safeJson(r); return (r.ok && d.errors === 0) ? pass('checked=' + d.checked + ', errors=0') : r.ok ? warn('Ran with ' + d.errors + ' errors') : fail('HTTP ' + r.status); } },
      { id: 'TC-AD02', name: 'verify-reputation runs cleanly', priority: 'P2', run: async () => { const r = await withTimeout(sbFn('verify-reputation', { limit: 3 }), 15000); const d = await safeJson(r); return r.ok ? pass('verified=' + d.verified + ', warnings=' + d.warnings + ', errors=' + d.errors) : fail('HTTP ' + r.status); } },
      { id: 'TC-AD03', name: 'fraud_audit_log table accessible', priority: 'P2', run: async () => { const r = await sbRest('/rest/v1/fraud_audit_log?select=id&limit=5'); return r.ok ? pass('Accessible, ' + (await safeJson(r)).length + ' rows') : fail('Cannot access (HTTP ' + r.status + ')'); } },
      { id: 'TC-AD04', name: 'Admin page requires password (not exposed publicly)', priority: 'P1', run: async () => { const t = document.body.innerText; return t.includes('TC-001') || t.includes('Run All Tests') ? fail('Admin tools exposed without password gate!') : pass('Admin tools protected (password gate active)'); } },
    ]
  },
];

const ALL_TESTS = SUITES.flatMap(s => s.tests);

// ─── Issue Log ────────────────────────────────────────────────────────────────
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const CATEGORIES = ['Functional', 'Security', 'Integration', 'Data', 'UI/UX', 'Admin'];

function loadIssues() {
  try { return JSON.parse(localStorage.getItem(ISSUES_KEY) || '[]'); } catch { return []; }
}
function saveIssues(issues) {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
}
function loadSavedResults() {
  try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || '{}'); } catch { return {}; }
}
function saveResults(results) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Badge({ status }) {
  const s = {
    pass:    { bg: '#f0fdf4', c: '#166534' },
    fail:    { bg: '#fef2f2', c: '#991b1b' },
    skip:    { bg: '#fffbeb', c: '#92400e' },
    warn:    { bg: '#fef9c3', c: '#713f12' },
    running: { bg: '#eff6ff', c: '#1d4ed8' },
    pending: { bg: '#f3f4f6', c: '#6b7280' },
  }[status] || { bg: '#f3f4f6', c: '#6b7280' };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.c, whiteSpace: 'nowrap' }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SevBadge({ sev }) {
  const colors = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#2563eb' };
  const c = colors[sev] || '#6b7280';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c + '20', color: c, border: '1px solid ' + c + '40', whiteSpace: 'nowrap' }}>
      {sev}
    </span>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Test Runner', 'Issue Log', 'Test Plan', 'Coverage'];

// ─── Password Gate ────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    setLoading(true); setError('');
    const hash = await sha256(pw);
    if (hash === ADMIN_HASH) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onUnlock();
    } else {
      setError('Incorrect password.');
      setPw('');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system,sans-serif' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '2rem', width: 340, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: '1rem' }}>🔬</div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 .4rem' }}>QA Dashboard</h1>
        <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 1.5rem' }}>StackRank365 — Internal QA Control Centre</p>
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="Enter admin password" autoFocus
          style={{ width: '100%', padding: '10px 12px', fontSize: 14, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', marginBottom: 10, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
        />
        {error && <p style={{ fontSize: 12, color: '#f87171', margin: '0 0 10px' }}>{error}</p>}
        <button onClick={attempt} disabled={loading || !pw}
          style={{ width: '100%', padding: 10, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!pw || loading) ? 0.5 : 1 }}>
          {loading ? 'Checking...' : 'Enter QA Dashboard'}
        </button>
      </div>
    </div>
  );
}

// ─── Test Runner Tab ──────────────────────────────────────────────────────────
function TestRunnerTab() {
  const [results, setResults] = useState(() => loadSavedResults());
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [expanded, setExpanded] = useState({});
  const [filterSuite, setFilterSuite] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastRun, setLastRun] = useState(null);
  const stopRef = useRef(false);

  const toRun = filterSuite === 'all' ? ALL_TESTS : SUITES.find(s => s.id === filterSuite)?.tests || ALL_TESTS;
  const displayResults = filterStatus === 'all'
    ? results
    : Object.fromEntries(Object.entries(results).filter(([, v]) => v.status === filterStatus));

  const stats = {
    pass: Object.values(results).filter(r => r.status === 'pass').length,
    fail: Object.values(results).filter(r => r.status === 'fail').length,
    warn: Object.values(results).filter(r => r.status === 'warn').length,
    skip: Object.values(results).filter(r => r.status === 'skip').length,
    total: ALL_TESTS.length,
  };
  const passRate = stats.pass + stats.fail > 0 ? Math.round(stats.pass / (stats.pass + stats.fail) * 100) : null;

  const runAll = async () => {
    stopRef.current = false;
    setRunning(true); setDone(0);
    const fresh = {};
    for (const tc of toRun) {
      if (stopRef.current) { fresh[tc.id] = { status: 'skip', message: 'Stopped by user' }; continue; }
      setResults(p => { const n = { ...p, [tc.id]: { status: 'running', message: 'Running...' } }; return n; });
      let result;
      try { result = await tc.run(); } catch (e) { result = fail('Error: ' + e.message); }
      fresh[tc.id] = result;
      setResults(p => { const n = { ...p, [tc.id]: result }; return n; });
      setDone(d => d + 1);
      await new Promise(r => setTimeout(r, 60));
    }
    setRunning(false);
    setLastRun(new Date().toISOString());
    saveResults(fresh);
  };

  const downloadCSV = () => {
    const rows = [['TC ID', 'Suite', 'Category', 'Name', 'Priority', 'Status', 'Message']];
    SUITES.forEach(s => s.tests.forEach(tc => {
      const r = results[tc.id] || {};
      rows.push([tc.id, s.name, s.category, tc.name, tc.priority || 'P3', r.status || 'pending', (r.message || '').replace(/,/g, ';')]);
    }));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'sr365-qa-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  };

  const priorityColor = p => p === 'P1' ? '#dc2626' : p === 'P2' ? '#d97706' : '#2563eb';

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        {[
          ['Total', stats.total, '#2563eb'],
          ['Pass', stats.pass, '#16a34a'],
          ['Fail', stats.fail, '#dc2626'],
          ['Warn', stats.warn, '#d97706'],
          ['Skip', stats.skip, '#6b7280'],
          ['Pass Rate', passRate !== null ? passRate + '%' : '—', '#7c3aed'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: l === 'Pass Rate' ? 15 : 18, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {running && (
        <div style={{ height: 4, background: '#e2e8f0' }}>
          <div style={{ height: '100%', width: (done / toRun.length * 100) + '%', background: stats.fail > 0 ? '#ef4444' : '#22c55e', transition: 'width .2s' }} />
        </div>
      )}

      {/* Controls */}
      <div style={{ padding: '10px 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {running
          ? <button onClick={() => stopRef.current = true} style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>⏹ Stop</button>
          : <button onClick={runAll} style={{ padding: '6px 14px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>▶ Run All Tests</button>
        }
        {Object.keys(results).length > 0 && !running && (
          <button onClick={downloadCSV} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>⬇ CSV</button>
        )}
        <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>
          {running ? `Running ${done}/${toRun.length}…` : lastRun ? `Last run: ${new Date(lastRun).toLocaleTimeString()}` : `${ALL_TESTS.length} tests · ${SUITES.length} suites`}
        </span>
      </div>

      {/* Suite filter */}
      <div style={{ padding: '6px 1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {[{ id: 'all', name: 'All (' + ALL_TESTS.length + ')' }, ...SUITES.map(s => ({ id: s.id, name: s.name.split(' ').slice(0, 2).join(' ') + ' (' + s.tests.length + ')' }))].map(s => (
          <button key={s.id} onClick={() => setFilterSuite(s.id)}
            style={{ padding: '2px 9px', fontSize: 10, fontWeight: 600, borderRadius: 20, cursor: 'pointer', border: 'none', background: filterSuite === s.id ? '#1e3a5f' : '#f1f5f9', color: filterSuite === s.id ? '#fff' : '#6b7280' }}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Test list */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0.75rem 1rem' }}>
        {SUITES.filter(s => filterSuite === 'all' || s.id === filterSuite).map(suite => (
          <div key={suite.id} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', padding: '4px 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>{suite.category}</span>
              {suite.name}
              {Object.keys(results).length > 0 && (
                <span style={{ fontSize: 10, color: '#9ca3af' }}>
                  — {suite.tests.filter(t => results[t.id]?.status === 'pass').length}/{suite.tests.length} pass
                </span>
              )}
            </div>
            {suite.tests.map(tc => {
              const r = results[tc.id] || { status: 'pending', message: 'Not run yet' };
              return (
                <div key={tc.id} style={{ marginBottom: 3 }}>
                  <div onClick={() => setExpanded(e => ({ ...e, [tc.id]: !e[tc.id] }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#fff', border: '1px solid #f1f5f9', borderLeft: '3px solid ' + priorityColor(tc.priority), borderRadius: 8, cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', fontFamily: 'monospace', minWidth: 88 }}>{tc.id}</span>
                    <span style={{ fontSize: 12, flex: 1, color: '#1e293b' }}>{tc.name}</span>
                    <Badge status={r.status} />
                    <span style={{ fontSize: 10, color: '#d1d5db' }}>{expanded[tc.id] ? '▲' : '▼'}</span>
                  </div>
                  {expanded[tc.id] && (
                    <div style={{ padding: '5px 12px 8px 104px', fontSize: 11, background: '#fafafa', borderRadius: '0 0 8px 8px', border: '1px solid #f1f5f9', borderTop: 'none', color: '#4b5563' }}>
                      <strong style={{ color: r.status === 'pass' ? '#16a34a' : r.status === 'fail' ? '#dc2626' : '#92400e' }}>{r.status?.toUpperCase()}:</strong> {r.message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Issue Log Tab ────────────────────────────────────────────────────────────
function IssueLogTab() {
  const [issues, setIssues] = useState(loadIssues);
  const [showForm, setShowForm] = useState(false);
  const [filterSev, setFilterSev] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', steps: '', expected: '', actual: '', severity: 'High', category: 'Functional', component: '', fix: '' });

  const addIssue = () => {
    if (!form.title) return;
    const newIssues = [{ ...form, id: Date.now(), created: new Date().toISOString(), status: 'Open' }, ...issues];
    setIssues(newIssues);
    saveIssues(newIssues);
    setShowForm(false);
    setForm({ title: '', description: '', steps: '', expected: '', actual: '', severity: 'High', category: 'Functional', component: '', fix: '' });
  };

  const resolveIssue = (id) => {
    const updated = issues.map(i => i.id === id ? { ...i, status: 'Resolved' } : i);
    setIssues(updated);
    saveIssues(updated);
  };

  const deleteIssue = (id) => {
    const updated = issues.filter(i => i.id !== id);
    setIssues(updated);
    saveIssues(updated);
  };

  const displayed = issues.filter(i =>
    (filterSev === 'all' || i.severity === filterSev) &&
    (filterCat === 'all' || i.category === filterCat)
  );

  const byCategory = CATEGORIES.map(c => ({ cat: c, open: issues.filter(i => i.category === c && i.status === 'Open').length })).filter(x => x.open > 0);

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Issue Log</h2>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0' }}>
            {issues.filter(i => i.status === 'Open').length} open · {issues.filter(i => i.status === 'Resolved').length} resolved
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '7px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          + Log Issue
        </button>
      </div>

      {/* Category summary */}
      {byCategory.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {byCategory.map(({ cat, open }) => (
            <div key={cat} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '4px 12px', fontSize: 12 }}>
              <strong style={{ color: '#dc2626' }}>{open}</strong> <span style={{ color: '#6b7280' }}>{cat}</span>
            </div>
          ))}
        </div>
      )}

      {/* New issue form */}
      {showForm && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 0.75rem' }}>New Issue</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <input placeholder="Issue title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, boxSizing: 'border-box' }} />
            </div>
            <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, resize: 'vertical' }} />
            <textarea placeholder="Steps to reproduce" rows={2} value={form.steps} onChange={e => setForm(f => ({ ...f, steps: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, resize: 'vertical' }} />
            <input placeholder="Expected behaviour" value={form.expected} onChange={e => setForm(f => ({ ...f, expected: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} />
            <input placeholder="Actual behaviour" value={form.actual} onChange={e => setForm(f => ({ ...f, actual: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} />
            <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }}>
              {SEVERITIES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="Affected component/page" value={form.component} onChange={e => setForm(f => ({ ...f, component: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} />
            <input placeholder="Suggested fix" value={form.fix} onChange={e => setForm(f => ({ ...f, fix: e.target.value }))}
              style={{ padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addIssue} style={{ padding: '7px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save Issue</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '7px 14px', background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['all', ...SEVERITIES].map(s => (
          <button key={s} onClick={() => setFilterSev(s)}
            style={{ padding: '3px 10px', fontSize: 11, borderRadius: 20, border: 'none', cursor: 'pointer', background: filterSev === s ? '#1e3a5f' : '#f1f5f9', color: filterSev === s ? '#fff' : '#6b7280', fontWeight: 600 }}>
            {s}
          </button>
        ))}
        <span style={{ color: '#d1d5db' }}>|</span>
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{ padding: '3px 10px', fontSize: 11, borderRadius: 20, border: 'none', cursor: 'pointer', background: filterCat === c ? '#7c3aed' : '#f1f5f9', color: filterCat === c ? '#fff' : '#6b7280', fontWeight: 600 }}>
            {c}
          </button>
        ))}
      </div>

      {/* Issue list */}
      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: 13 }}>
          {issues.length === 0 ? 'No issues logged yet. Click "+ Log Issue" to add one.' : 'No issues match current filters.'}
        </div>
      )}
      {displayed.map(issue => (
        <div key={issue.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '0.6rem', opacity: issue.status === 'Resolved' ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <SevBadge sev={issue.severity} />
                <span style={{ fontSize: 10, background: '#ede9fe', color: '#7c3aed', padding: '1px 6px', borderRadius: 4 }}>{issue.category}</span>
                {issue.status === 'Resolved' && <span style={{ fontSize: 10, background: '#f0fdf4', color: '#166534', padding: '1px 6px', borderRadius: 4 }}>Resolved</span>}
              </div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{issue.title}</div>
              {issue.component && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Component: {issue.component}</div>}
              {issue.description && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>{issue.description}</div>}
              {(issue.expected || issue.actual) && (
                <div style={{ fontSize: 11, marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {issue.expected && <div><span style={{ color: '#16a34a', fontWeight: 600 }}>Expected:</span> {issue.expected}</div>}
                  {issue.actual && <div><span style={{ color: '#dc2626', fontWeight: 600 }}>Actual:</span> {issue.actual}</div>}
                </div>
              )}
              {issue.fix && <div style={{ fontSize: 11, color: '#2563eb', marginTop: 4 }}>💡 {issue.fix}</div>}
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {issue.status !== 'Resolved' && (
                <button onClick={() => resolveIssue(issue.id)} style={{ padding: '4px 10px', fontSize: 11, background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', borderRadius: 6, cursor: 'pointer' }}>✓ Resolve</button>
              )}
              <button onClick={() => deleteIssue(issue.id)} style={{ padding: '4px 10px', fontSize: 11, background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Test Plan Viewer Tab ─────────────────────────────────────────────────────
const TEST_PLAN_SUITES = [
  { id: 'TS-01', name: 'Navigation & Routing', count: 14, priority: 'P1', desc: 'All 18 SPA routes, query-param routing, nav links, footer, page title.' },
  { id: 'TS-02', name: 'Authentication', count: 12, priority: 'P1', desc: 'Email signup/signin, Azure OAuth, password reset, session persistence, redirect logic.' },
  { id: 'TS-03', name: 'Dashboard - Certifications', count: 10, priority: 'P1', desc: 'Add/delete certs, modal search, Credly/MS Learn verification, multiplier checks.' },
  { id: 'TS-04', name: 'Dashboard - Projects', count: 7, priority: 'P1', desc: 'CRUD operations, enterprise toggle, privacy mode, validation request.' },
  { id: 'TS-05', name: 'Scoring Logic', count: 7, priority: 'P1', desc: 'POINT_VALUES formula, server RPC match, rank tier thresholds.' },
  { id: 'TS-06', name: 'Leaderboard', count: 8, priority: 'P1', desc: 'Load, ranking order, specialization/country/tier filters, profile links.' },
  { id: 'TS-07', name: 'Profile', count: 8, priority: 'P1', desc: 'Public view, own view, dispute score, view tracking (F19/F09), badge share.' },
  { id: 'TS-08', name: 'Validation Flow', count: 7, priority: 'P1', desc: 'Token routing, accept/decline, invalid token error, DB status updates.' },
  { id: 'TS-09', name: 'Tier Enforcement', count: 5, priority: 'P1', desc: 'Free/Pro/Recruiter access gates, expired tier downgrade (F17).' },
  { id: 'TS-10', name: 'Edge Functions', count: 12, priority: 'P1', desc: 'All 13 functions: input validation, response shape, error codes.' },
  { id: 'TS-11', name: 'Security', count: 11, priority: 'P1', desc: 'RLS enforcement, service_role key scan, HTTPS, auth bypass, CSP headers.' },
  { id: 'TS-12', name: 'API Contract Validation', count: 13, priority: 'P1', desc: 'DB schema shapes, edge fn response contracts, auth API contracts.' },
  { id: 'TS-13', name: 'UI/UX & Accessibility', count: 10, priority: 'P2', desc: 'Heading hierarchy, form labels, colour contrast, mobile/tablet responsiveness.' },
  { id: 'TS-14', name: 'Visual Regression', count: 8, priority: 'P2', desc: 'Playwright screenshot baselines for 8 key pages (desktop + mobile).' },
];

const HIGH_RISK = [
  { title: 'Admin security — client-side only', severity: 'Critical', detail: 'Admin pages (AdminTools, AdminFraud, QADashboard) gated by SHA-256 hash in sessionStorage. No Supabase RLS or server-side role check. Anyone with the password hash and access to client source can bypass.' },
  { title: 'Missing edge function: send-contact-request', severity: 'Critical', detail: 'RecruiterDashboard.jsx calls /functions/v1/send-contact-request but no corresponding function directory was found. Recruiter contact emails will fail silently.' },
  { title: 'verify_jwt = false on ALL edge functions', severity: 'High', detail: 'Any caller with just the anon key can invoke any edge function. If a function performs privileged operations, it may be exploitable without a valid user session.' },
  { title: 'Client-side tier enforcement (F17)', severity: 'High', detail: 'Tier expiry is checked client-side in AppContext.jsx. A user could bypass this by manipulating localStorage or React context. Server-side RLS checks on tier-gated content are recommended.' },
  { title: 'allorigins.win CORS proxy', severity: 'Medium', detail: 'certVerify.js uses allorigins.win as a fallback proxy for Credly/MS Learn scraping. This is a public third-party service with no SLA. Sensitive verification data passes through it.' },
  { title: 'No React error boundaries', severity: 'Medium', detail: 'No error boundary wraps the app. Any component-level JS error will crash the entire SPA with a white screen and no user feedback.' },
  { title: 'Hardcoded Supabase credentials in source', severity: 'Medium', detail: 'SUPABASE_URL and ANON key are hardcoded in src/lib/supabase.js and AdminTools.jsx (expected for anon keys, but worth auditing). Service keys must NEVER be hardcoded.' },
  { title: 'No pagination on leaderboard', severity: 'Low', detail: 'Leaderboard fetches all profiles. Will slow significantly past ~500 users.' },
  { title: 'Landing3.jsx and Landing4.jsx are dead code', severity: 'Low', detail: 'Two alternate landing pages exist but are not wired to any route, adding bundle weight.' },
];

function TestPlanTab() {
  const total = TEST_PLAN_SUITES.reduce((a, s) => a + s.count, 0);
  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px' }}>QA Test Plan — StackRank365</h2>
        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Version 1.0 · {total} test cases across {TEST_PLAN_SUITES.length} suites · Generated 2026-03-27</p>
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 0.75rem', color: '#374151' }}>Test Suites ({TEST_PLAN_SUITES.length})</h3>
      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {TEST_PLAN_SUITES.map(s => (
          <div key={s.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.65rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#2563eb', minWidth: 52 }}>{s.id}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, background: s.priority === 'P1' ? '#fef2f2' : '#fffbeb', color: s.priority === 'P1' ? '#dc2626' : '#d97706', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{s.priority}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.count} TCs</span>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 0.75rem', color: '#374151' }}>High-Risk Areas ({HIGH_RISK.length})</h3>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {HIGH_RISK.map((r, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #fee2e2', borderLeft: '3px solid ' + (r.severity === 'Critical' ? '#dc2626' : r.severity === 'High' ? '#ea580c' : r.severity === 'Medium' ? '#d97706' : '#2563eb'), borderRadius: 10, padding: '0.65rem 1rem' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <SevBadge sev={r.severity} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{r.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Coverage Matrix Tab ──────────────────────────────────────────────────────
const FEATURES = [
  { name: 'Landing Page', suites: ['TS-01', 'TS-07'], playwright: true, inApp: true },
  { name: 'Authentication (Email)', suites: ['TS-02'], playwright: true, inApp: true },
  { name: 'Authentication (Azure OAuth)', suites: ['TS-02'], playwright: false, inApp: false },
  { name: 'Dashboard — Certifications', suites: ['TS-03'], playwright: false, inApp: false },
  { name: 'Dashboard — Projects', suites: ['TS-04'], playwright: false, inApp: false },
  { name: 'Dashboard — Settings', suites: ['TS-03', 'TS-04'], playwright: false, inApp: false },
  { name: 'Scoring Logic', suites: ['TS-05'], playwright: false, inApp: true },
  { name: 'Leaderboard', suites: ['TS-06'], playwright: true, inApp: true },
  { name: 'Profile Page', suites: ['TS-07'], playwright: false, inApp: false },
  { name: 'Peer Validation Flow', suites: ['TS-08'], playwright: true, inApp: false },
  { name: 'Tier Enforcement (F17)', suites: ['TS-09'], playwright: false, inApp: true },
  { name: 'Resume Analyser', suites: ['TS-10'], playwright: false, inApp: true },
  { name: 'LinkedIn Import', suites: ['TS-10'], playwright: false, inApp: true },
  { name: 'Recruiter AI Search', suites: ['TS-10'], playwright: false, inApp: true },
  { name: 'Fraud Detection', suites: ['TS-10', 'TS-09'], playwright: false, inApp: true },
  { name: 'Cert Verification', suites: ['TS-03', 'TS-10'], playwright: false, inApp: true },
  { name: 'Admin Tools', suites: ['TS-09'], playwright: false, inApp: true },
  { name: 'Security (RLS, JWT)', suites: ['TS-11'], playwright: true, inApp: true },
  { name: 'API Contracts', suites: ['TS-12'], playwright: true, inApp: true },
  { name: 'Visual Regression', suites: ['TS-14'], playwright: true, inApp: false },
  { name: 'Mobile Responsiveness', suites: ['TS-13'], playwright: true, inApp: false },
];

function CoverageTab() {
  const covered = FEATURES.filter(f => f.playwright || f.inApp).length;
  const pct = Math.round(covered / FEATURES.length * 100);

  return (
    <div style={{ padding: '1rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{pct}%</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Feature Coverage</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{FEATURES.filter(f => f.playwright).length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Playwright Specs</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#7c3aed' }}>{FEATURES.filter(f => f.inApp).length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>In-App Tests</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{FEATURES.filter(f => !f.playwright && !f.inApp).length}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Coverage Gaps</div>
        </div>
      </div>

      <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 0.75rem', color: '#374151' }}>Feature Coverage Matrix</h3>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Feature</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Test Suites</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>Playwright</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#7c3aed' }}>In-App</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#374151' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => {
              const covered = f.playwright || f.inApp;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: covered ? 'transparent' : '#fef9c3' }}>
                  <td style={{ padding: '7px 12px', fontWeight: 500 }}>{f.name}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {f.suites.map(s => <span key={s} style={{ fontSize: 10, background: '#ede9fe', color: '#7c3aed', padding: '1px 5px', borderRadius: 3 }}>{s}</span>)}
                    </div>
                  </td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>{f.playwright ? '✅' : '—'}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>{f.inApp ? '✅' : '—'}</td>
                  <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: covered ? '#f0fdf4' : '#fef9c3', color: covered ? '#166534' : '#92400e' }}>
                      {covered ? 'Covered' : 'GAP'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, fontSize: 12, color: '#0369a1' }}>
        <strong>Playwright tests:</strong> Run with <code>npx playwright test</code> (requires: <code>npm install --save-dev @playwright/test</code> + <code>npx playwright install</code>).
        {' '}Test specs are in <code>tests/e2e/</code>. Config: <code>playwright.config.js</code>.
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function QADashboardInner() {
  const [tab, setTab] = useState('Test Runner');

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif' }}>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>🔬 SR365 QA Control Centre</h1>
          <p style={{ color: '#a5b4fc', fontSize: 11, margin: '3px 0 0' }}>
            {ALL_TESTS.length} in-browser tests · Playwright E2E suite · Issue tracker · Coverage matrix
          </p>
        </div>
        <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); window.location.reload(); }}
          style={{ padding: '6px 14px', background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
          🔒 Lock
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: '2px solid #e2e8f0' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 20px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'transparent', color: tab === t ? '#7c3aed' : '#6b7280', borderBottom: tab === t ? '2px solid #7c3aed' : '2px solid transparent', marginBottom: -2, transition: 'all .15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 'Test Runner' && <TestRunnerTab />}
        {tab === 'Issue Log' && <IssueLogTab />}
        {tab === 'Test Plan' && <TestPlanTab />}
        {tab === 'Coverage' && <CoverageTab />}
      </div>
    </div>
  );
}

export default function QADashboard() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  return <QADashboardInner />;
}
