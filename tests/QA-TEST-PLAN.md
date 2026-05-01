# StackRank365 — Comprehensive QA Test Plan
Version: 1.0 | Date: 2026-03-27 | Engineer: QA Audit (Claude)

---

## 1. TEST STRATEGY

### 1.1 Scope

**In Scope:**
- All 18 SPA pages/routes
- Supabase Auth flows (email + Azure OAuth + password reset)
- 13 Deno Edge Functions
- Supabase DB tables, RLS policies, RPCs
- Scoring logic (client-side calcScore + server-side RPC)
- Certification management (add / verify / delete)
- Project management (add / edit / delete / validation flow)
- Tier system (free / pro / recruiter + expiry enforcement)
- Leaderboard rendering and filters
- Recruiter AI search (recruiter-match edge fn)
- Admin tools (fraud detection, test runner)
- Security: RLS, auth bypass, sensitive data exposure, client bundle secrets
- UI/UX: CTAs, navigation, responsiveness, accessibility basics

**Out of Scope (this cycle):**
- Load testing at scale (>1000 concurrent users)
- Full WCAG 2.1 AA compliance audit (basics only)
- Payment/billing integration (not yet implemented)
- Mobile app (web only)

### 1.2 Testing Types
| Type | Tool | Priority |
|---|---|---|
| Functional | Playwright E2E + AdminTools in-app | P1 |
| Regression | Playwright (re-run on deploy) | P1 |
| API Contract | Playwright API tests + AdminTools | P1 |
| Security | Playwright + AdminTools security suite | P1 |
| UI/UX | Playwright visual regression (screenshots) | P2 |
| Accessibility | Playwright + axe-core | P2 |
| Performance | Playwright timing assertions | P2 |
| Data Integrity | AdminTools DB suites | P1 |

---

## 2. TEST COVERAGE MATRIX

### Feature → Test Scenarios → Expected Outcomes

| Feature | Scenario | Expected |
|---|---|---|
| **Landing Page** | Load, nav links, CTAs, waitlist form | 200 OK, all CTAs visible, form accepts valid email |
| **Navigation** | All 18 routes accessible | No dead routes, back/forward works |
| **Sign Up (email)** | Valid/invalid email, weak password, duplicate | New account created; errors shown for invalid |
| **Sign Up (Azure)** | OAuth redirect + callback | Session created, profile row auto-created |
| **Sign In (email)** | Valid/wrong password, non-existent email | Token returned; 401 for invalid |
| **Password Reset** | Email sent, token used | Password updated, can sign in with new password |
| **Session persistence** | Reload after sign-in | Session restored from Supabase |
| **Dashboard - Certs** | Add, search, date select, submit | Cert appears in list, points updated |
| **Dashboard - Verify cert** | Click Verify, valid/invalid URL | Status updates to verified/failed |
| **Dashboard - Projects** | Add, edit, delete, privacy toggle | CRUD operations work; validated badge shown |
| **Dashboard - Settings** | Update bio, location, specialism | Profile persists to DB on save |
| **Dashboard - Resume Analyser** | Upload PDF → bio generated | Bio populated from Claude response |
| **Dashboard - LinkedIn Import** | Enter handle → fields pre-filled | ImportPreview shown with data |
| **Dashboard - Open to Work** | Toggle on/off | DB updated, leaderboard reflects |
| **Tier Enforcement (F17)** | Expired pro tier | Downgraded to free on load |
| **Score Calculation** | Add verified/unverified certs | Score matches POINT_VALUES formula |
| **Server Score RPC** | refreshServerScore() | reputation_score column updated in DB |
| **Leaderboard** | Load, filter by specialism/country/tier | Correct ranking order, filters work |
| **Profile (public)** | View own, view other, dispute score | Correct data shown, dispute submits |
| **Profile view tracking** | Visit another profile | View count increments |
| **Validation flow** | Request → email → token link → accept/decline | Status updates, score updated |
| **Pricing page** | 3 tiers visible, CTAs correct | Free/Pro/Recruiter cards, sign-up CTAs |
| **Recruiter Dashboard** | Search by JD, results, contact modal | AI matches returned, contact email sent |
| **Admin - Fraud** | View flags, suspend, clear | Status updates in DB + audit log entry |
| **Admin - Test Runner** | Run all suites | Runs without JS errors, results displayed |
| **Privacy Policy** | Page loads, content visible | Legal text present |
| **Validation token (invalid)** | Expired/unknown token | Error message shown, no DB change |
| **RLS - anon access** | Query profiles without auth | Sensitive fields (email, fraud_score) hidden |
| **RLS - cross-user write** | Try to update another user's cert | 403 returned |
| **Service role key in bundle** | Scan JS bundle | No service_role JWT present |

---

## 3. TEST SUITES & TEST CASES

### TS-01: Navigation & Routing
- TC-N01: All 18 pages render without JS error
- TC-N02: ?page= query param routing works for all routes
- TC-N03: Unknown ?page= falls back to landing
- TC-N04: Back button after navigation restores previous page
- TC-N05: Footer links navigate correctly
- TC-N06: Nav logo navigates to landing
- TC-N07: Mobile hamburger menu opens/closes

### TS-02: Authentication
- TC-A01: Sign up with valid new email
- TC-A02: Sign up with existing email returns error
- TC-A03: Sign up with invalid email format rejected
- TC-A04: Sign up with weak password rejected (<8 chars)
- TC-A05: Sign in with correct credentials succeeds
- TC-A06: Sign in with wrong password fails with error
- TC-A07: Sign in with non-existent email fails
- TC-A08: Password reset email sent for valid email
- TC-A09: Invalid recovery token handled gracefully
- TC-A10: Authenticated user redirect from signin → dashboard
- TC-A11: Sign out clears session, redirects to landing
- TC-A12: Session persists across page reload

### TS-03: Dashboard - Certifications
- TC-DC01: Cert modal opens on "Add Certification" click
- TC-DC02: Cert search filters results correctly
- TC-DC03: Adding cert without issue date blocked
- TC-DC04: Adding cert saves to DB and updates score
- TC-DC05: Deleting cert removes from DB and updates score
- TC-DC06: Verify cert with valid Credly URL → status = verified
- TC-DC07: Verify cert with valid MS Learn transcript → status = verified
- TC-DC08: Verify cert with invalid URL → status = failed, error shown
- TC-DC09: Verified cert shows multiplier 1.0; unverified 0.25
- TC-DC10: Scarcity multiplier applied correctly to score

### TS-04: Dashboard - Projects
- TC-DP01: Add project saves to DB
- TC-DP02: Edit project updates in DB
- TC-DP03: Delete project removes from DB
- TC-DP04: Privacy mode toggle persists
- TC-DP05: Enterprise toggle adds bonus points
- TC-DP06: Request validation sends email (send-validation-request edge fn)
- TC-DP07: Validated project shows checkmark badge

### TS-05: Scoring Logic
- TC-SC01: Fundamentals cert = 500 pts unverified → 125 pts (×0.25)
- TC-SC02: Expert cert verified = 3000 pts (×1.0)
- TC-SC03: MVP bonus = +1500 pts
- TC-SC04: Enterprise project = +2000 pts
- TC-SC05: Profile complete bonus = +150 pts
- TC-SC06: Server RPC score matches client calcScore()
- TC-SC07: Rank tier changes at correct thresholds (1000/3500/8000/15000)

### TS-06: Leaderboard
- TC-LB01: Leaderboard loads with ranked list
- TC-LB02: Filter by specialism works
- TC-LB03: Filter by country works
- TC-LB04: Filter by tier (Architect etc.) works
- TC-LB05: Profiles link to correct profile page
- TC-LB06: Score displayed matches profile score
- TC-LB07: Verified badge shown for verified profiles
- TC-LB08: Open-to-work indicator visible when toggled on

### TS-07: Profile
- TC-PR01: Public profile loads by username
- TC-PR02: Own profile shows edit options
- TC-PR03: Other profile hides edit options
- TC-PR04: Dispute score form submits to disputes table
- TC-PR05: View count tracked on profile visit (F19)
- TC-PR06: Weekly view count shown to profile owner (F09)
- TC-PR07: LinkedIn share badge works
- TC-PR08: Copy profile link to clipboard

### TS-08: Validation Flow
- TC-VF01: Validation request email sent via send-validation-request
- TC-VF02: Token URL /#validate?token=X routes to ValidatePage
- TC-VF03: Valid token shows project details
- TC-VF04: Accept validation updates project.validated = true
- TC-VF05: Decline validation updates status = declined
- TC-VF06: Invalid/expired token shows error state
- TC-VF07: Already-used token handled gracefully

### TS-09: Tier Enforcement
- TC-TE01: Free tier user cannot access recruiter dashboard
- TC-TE02: Pro tier features visible to pro user
- TC-TE03: Expired pro tier downgrades to free on load
- TC-TE04: Recruiter tier user can access AI search
- TC-TE05: Tier expiry date shown correctly

### TS-10: Edge Functions
- TC-EF01: analyse-resume missing pdf_base64 → HTTP 400
- TC-EF02: analyse-resume with valid PDF → returns bio string
- TC-EF03: fetch-linkedin-profile missing handle → HTTP 400
- TC-EF04: fetch-linkedin-profile with valid handle → returns name/headline
- TC-EF05: verify-cert missing params → HTTP 400
- TC-EF06: recruiter-match missing job_description → HTTP 400
- TC-EF07: recruiter-match with JD → returns ranked candidates array
- TC-EF08: batch-verify-certs runs without error
- TC-EF09: detect-fake-profiles runs without error
- TC-EF10: sync-catalog returns synced count > 0
- TC-EF11: send-validation-request with valid validation_id sends email
- TC-EF12: cert-expiry-reminders runs without error

### TS-11: Security
- TC-SE01: service_role JWT absent from client JS bundle
- TC-SE02: HTTPS enforced (no HTTP access)
- TC-SE03: Anon query cannot read profiles.email
- TC-SE04: Anon query cannot read profiles.fraud_score
- TC-SE05: Unauthenticated user cannot update another user's profile
- TC-SE06: Unauthenticated user cannot insert certifications
- TC-SE07: Admin pages not linked from public nav
- TC-SE08: Wrong admin password rejected
- TC-SE09: verify_jwt=false does not expose service key operations
- TC-SE10: allorigins.win proxy not used for sensitive requests

### TS-12: API Contract Validation
- TC-AC01: GET /rest/v1/profiles returns expected schema
- TC-AC02: GET /rest/v1/certifications returns expected schema
- TC-AC03: GET /rest/v1/leaderboard returns ranked order
- TC-AC04: POST /functions/v1/recruiter-match returns {matches: [...]}
- TC-AC05: POST /functions/v1/analyse-resume returns {bio: string}
- TC-AC06: POST /auth/v1/token returns {access_token, user}

### TS-13: UI/UX & Accessibility
- TC-UX01: Page title is "StackRank365"
- TC-UX02: All pages have visible heading hierarchy (h1/h2)
- TC-UX03: All form inputs have labels
- TC-UX04: CTAs have accessible text (not icon-only)
- TC-UX05: Color contrast passes AA for body text
- TC-UX06: Mobile layout at 375px width (no horizontal scroll)
- TC-UX07: Tablet layout at 768px
- TC-UX08: Loading states shown during async operations
- TC-UX09: Toast notifications appear and auto-dismiss
- TC-UX10: Error states are descriptive (not "Something went wrong")

### TS-14: Visual Regression (Baseline Screenshots)
- TC-VR01: Landing page desktop (1280px)
- TC-VR02: Landing page mobile (375px)
- TC-VR03: Leaderboard page desktop
- TC-VR04: Pricing page desktop
- TC-VR05: Sign in page desktop
- TC-VR06: Dashboard (authenticated) desktop
- TC-VR07: Profile page desktop
- TC-VR08: Recruiter dashboard desktop

---

## 4. PERSONA-BASED TEST FLOWS

### Guest (unauthenticated)
- Can view: landing, leaderboard, profile, how-it-works, scoring, about, for-recruiters, pricing, privacy
- Cannot access: dashboard (redirect to signin), recruiter-dashboard
- Actions: join waitlist (CTA), browse leaderboard, view public profiles, navigate to signup/signin

### Authenticated Free User
- All guest pages PLUS dashboard
- Cannot: access recruiter dashboard, use AI candidate search
- Can: manage certs/projects, verify certs, request validations, view own weekly stats

### Authenticated Pro User
- All free user features PLUS pro-specific features
- Cannot: access recruiter dashboard
- Tier checked: downgrade if tier_expires_at in past

### Recruiter
- All pro features PLUS recruiter dashboard
- Can: AI search by job description, view contact info, shortlist candidates
- Cannot: access admin tools

### Admin
- Access via /sr365-admin-tools and /admin-fraud (SHA-256 password gate)
- Can: run full test suite, manage fraud flags, suspend profiles
- Security risk: no server-side role enforcement

---

## 5. KNOWN HIGH-RISK AREAS

### Critical
1. **Admin security** — only client-side SHA-256 gate, no Supabase RLS on admin pages
2. **Missing edge function** — `send-contact-request` called by RecruiterDashboard but not deployed
3. **verify_jwt = false** on all edge functions — any caller can invoke with just anon key

### High
4. **Hardcoded Supabase anon key in source** — exposed in AdminTools.jsx and supabase.js
5. **allorigins.win CORS proxy** — third-party dependency, no SLA, potential data leak
6. **No React error boundaries** — any component crash takes down entire app
7. **Client-side tier enforcement** — easily bypassed by setting localStorage/context

### Medium
8. **No TypeScript in frontend** — type errors only caught at runtime
9. **No router library** — custom routing breaks browser history in some flows
10. **Duplicate supabase clients** — supabase.js and supabaseClient.js may diverge
11. **Landing3.jsx and Landing4.jsx** — dead code not cleaned up

### Low
12. **No loading skeletons** — blank screens during data fetch
13. **No pagination on leaderboard** — may slow with 1000+ profiles
14. **Email stored in profiles table** — may be exposed if RLS misconfigured

---

## 6. TEST ENVIRONMENT

| Environment | URL | Supabase Project |
|---|---|---|
| Production | https://www.stackrank365.com | shnuwkjkjthvaovoywju |
| Local dev | http://localhost:5173 | same (or local Supabase) |

### Test Accounts Required
- `tester@stackrank365.com` / `TestPass123!` — verified free user
- `recruiter_test@stackrank365.com` / `TestPass123!` — recruiter tier user
- `pro_test@stackrank365.com` / `TestPass123!` — pro tier user with expired tier (for F17 test)

---

## 7. EXIT CRITERIA

- All P1 tests passing (0 failures)
- P2 failures documented with severity tags
- No CRITICAL security issues open
- Pass rate ≥ 90% across all suites
- Visual regression baselines captured
