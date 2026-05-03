# StackRank365 — QA Audit Issue Log
**Date:** 2026-03-27 | **Auditor:** Senior QA Audit (static analysis)
**Method:** Full codebase review — no live execution

---

## CRITICAL

### ISSUE-001: Admin pages have no server-side access control
- **Title:** Admin security relies solely on a client-side SHA-256 password hash
- **Description:** `AdminTools.jsx`, `AdminFraud.jsx`, and `QADashboard.jsx` are protected only by a SHA-256 hash checked in `sessionStorage`. There are no Supabase RLS policies or JWT role checks on the admin-accessible DB operations.
- **Steps to reproduce:**
  1. Open browser DevTools
  2. Run `sessionStorage.setItem('sr365_admin_unlocked', '1')` in the console
  3. Navigate to `/?page=sr365-admin-tools`
  4. Admin tools are now unlocked without knowing the password
- **Expected:** Server-side role enforcement (e.g., Supabase custom claim or service-role check)
- **Actual:** Entire admin surface bypassed via one console command
- **Severity:** Critical
- **Component:** `AdminTools.jsx`, `AdminFraud.jsx`, `QADashboard.jsx`
- **Suggested fix:** Add a `is_admin` boolean to `profiles` with a Supabase policy, or use a Supabase custom JWT claim. Validate on the server, not the client.

---

### ISSUE-002: `send-contact-request` edge function not deployed
- **Title:** RecruiterDashboard calls a missing edge function
- **Description:** `RecruiterDashboard.jsx` references `/functions/v1/send-contact-request` to send recruiter contact emails to candidates. No corresponding function directory exists under `supabase/functions/`.
- **Steps to reproduce:**
  1. Sign in as a Recruiter-tier user
  2. Navigate to Recruiter Dashboard
  3. Search for candidates and click "Contact"
  4. Fill in the contact form and submit
- **Expected:** Contact email sent to candidate
- **Actual:** HTTP 404 or timeout — function not found
- **Severity:** Critical
- **Component:** `RecruiterDashboard.jsx`, missing `send-contact-request` edge function
- **Suggested fix:** Create and deploy `supabase/functions/send-contact-request/index.ts` that accepts `{ recruiter_id, candidate_id, message }` and sends via Resend.

---

## HIGH

### ISSUE-003: `verify_jwt = false` on all 13 edge functions
- **Title:** All edge functions accept unauthenticated calls
- **Description:** `supabase/config.toml` sets `verify_jwt = false` for all 13 functions. This means any caller with the anon key can invoke any function — including `detect-fake-profiles`, `sync-catalog`, and `verify-reputation` — without a valid user session.
- **Severity:** High
- **Component:** `supabase/config.toml`, all edge functions
- **Suggested fix:** Set `verify_jwt = true` for functions that perform privileged operations. Pass user JWT in the Authorization header and verify identity inside the function where needed.

---

### ISSUE-004: Client-side tier enforcement easily bypassed (F17)
- **Title:** Pro/Recruiter tier access enforced only on the client
- **Description:** `AppContext.jsx` checks `tier_expires_at` client-side and downgrades to `free` if expired. A user could manipulate the React context or localStorage to maintain elevated tier access.
- **Severity:** High
- **Component:** `AppContext.jsx:65-72`, `RecruiterDashboard.jsx`
- **Suggested fix:** Add a server-side RLS policy: `USING (auth.jwt() ->> 'tier' = 'recruiter' AND auth.jwt() ->> 'tier_expires_at' > now()::text)`. Or use a Supabase Edge Function middleware that validates tier before returning data.

---

### ISSUE-005: `allorigins.win` CORS proxy used for cert verification
- **Title:** Sensitive cert verification data proxied through a public third-party service
- **Description:** `certVerify.js` falls back to `https://allorigins.win/get?url=...` when direct fetches to Credly/MS Learn are blocked by CORS. This means unverified cert badge data passes through an unknown third-party proxy.
- **Severity:** High
- **Component:** `src/lib/certVerify.js`
- **Suggested fix:** Route ALL external cert verification through a dedicated Supabase edge function that handles CORS server-side. Remove the allorigins.win dependency entirely.

---

### ISSUE-006: No React Error Boundaries in the application
- **Title:** Any component crash produces a blank white screen with no recovery path
- **Description:** The entire app is wrapped in `AppProvider` with no `<ErrorBoundary>`. A runtime error in any component (e.g., null deref in Profile page data) will crash the whole SPA.
- **Severity:** High
- **Component:** `src/App.jsx`, all page components
- **Suggested fix:** Add a top-level `ErrorBoundary` component wrapping `<AppInner />` with a "Something went wrong — refresh to recover" UI. Add page-level boundaries around Dashboard sections.

---

## MEDIUM

### ISSUE-007: Duplicate Supabase client files
- **Title:** Two Supabase client files may diverge
- **Description:** Both `src/lib/supabase.js` and `src/lib/supabaseClient.js` exist. `supabaseClient.js` is a re-export shim pointing to `supabase.js`. If the shim is not kept in sync, parts of the app could use different configurations.
- **Severity:** Medium
- **Component:** `src/lib/supabase.js`, `src/lib/supabaseClient.js`
- **Suggested fix:** Delete `supabaseClient.js` and update all imports to use `supabase.js` directly.

---

### ISSUE-008: Dead landing page components (Landing3.jsx, Landing4.jsx)
- **Title:** Two alternate landing pages exist but are not routed or used
- **Description:** `Landing3.jsx` and `Landing4.jsx` are imported nowhere and contribute to bundle size.
- **Severity:** Medium (bundle bloat)
- **Component:** `src/pages/Landing3.jsx`, `src/pages/Landing4.jsx`
- **Suggested fix:** Delete both files or move to a `_drafts/` folder outside `src/`.

---

### ISSUE-009: No loading skeletons on async data fetches
- **Title:** Blank sections displayed while leaderboard / profile data loads
- **Description:** `Leaderboard.jsx`, `Profile.jsx`, and `RecruiterDashboard.jsx` show blank content areas while Supabase data is being fetched. No skeleton loaders or placeholders exist.
- **Severity:** Medium (UX)
- **Component:** `Leaderboard.jsx`, `Profile.jsx`, `RecruiterDashboard.jsx`
- **Suggested fix:** Add `<SkeletonCard />` placeholders while `loading === true` using CSS animation shimmer.

---

### ISSUE-010: Custom router breaks native browser history in edge cases
- **Title:** Using `window.history.pushState` in `checkPage()` (AdminTools) may interfere with React routing
- **Description:** The `checkPage()` function in `AdminTools.jsx` manually calls `window.history.pushState` and dispatches a `popstate` event to simulate navigation. This can leave the router in an inconsistent state if the listener in `App.jsx` doesn't handle all synthetic events correctly.
- **Severity:** Medium
- **Component:** `AdminTools.jsx:33-45`, `App.jsx:78-116`
- **Suggested fix:** Use a proper router library (React Router v7 or TanStack Router) that supports programmatic navigation without manual history manipulation.

---

### ISSUE-011: No pagination on leaderboard query
- **Title:** Leaderboard will degrade at scale
- **Description:** The leaderboard view query uses no LIMIT/OFFSET or cursor-based pagination. With 500+ profiles it will cause slow initial load.
- **Severity:** Medium (performance)
- **Component:** `Leaderboard.jsx` (Supabase query), `leaderboard` view
- **Suggested fix:** Add `?limit=50&offset=X` with a "Load More" or infinite scroll pattern.

---

## LOW

### ISSUE-012: Emoji garbled as character entities in Footer and some pages
- **Title:** Emoji characters rendered as `ð` (character encoding issue)
- **Description:** `App.jsx` footer contains `ð` instead of actual emoji (likely `🌍` or similar). This appears to be a UTF-8 encoding issue in how the file was saved.
- **Severity:** Low (visual)
- **Component:** `App.jsx:38,63`
- **Suggested fix:** Re-save file with UTF-8 BOM or fix the emoji literals directly.

---

### ISSUE-013: No Content-Security-Policy headers
- **Title:** Hosting configuration (Netlify/Vercel) does not set CSP headers
- **Description:** Neither `netlify.toml` nor `vercel.json` sets `Content-Security-Policy` headers. XSS attacks could exfiltrate data from the page.
- **Severity:** Low
- **Component:** `netlify.toml`, `vercel.json`
- **Suggested fix:** Add CSP headers allowing `default-src 'self'`, permitting Supabase domains and fonts.

---

### ISSUE-014: Profile `email` column in Supabase may be exposed
- **Title:** RLS select policy for profiles does not explicitly exclude `email`
- **Description:** The `profiles` table has an `email` column but the RLS `SELECT` policy (based on schema review) appears to allow reading any column from any public profile. If `email` is in the table, anon queries that include `email` in the select list may return it.
- **Severity:** Low (needs live verification)
- **Component:** `supabase-schema.sql` — `profiles` RLS policies
- **Suggested fix:** Use column-level security or exclude `email` from the public-readable columns. Consider storing email only in `auth.users` (where it already is) and removing from `profiles`.

---

## Summary

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 4 |
| Medium | 5 |
| Low | 3 |
| **Total** | **14** |

### By Category
| Category | Issues |
|---|---|
| Security | 001, 003, 004, 005, 013, 014 |
| Functional | 002, 010 |
| Integration | 002, 007 |
| UI/UX | 006, 009, 012 |
| Data | 011 |
| Code quality | 007, 008 |
