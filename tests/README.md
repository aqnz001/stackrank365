# StackRank365 — QA & Testing

## Quick Start

### Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Run all Playwright tests (production)

```bash
npx playwright test
```

### Run against local dev server

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5173 npx playwright test
```

### Run a specific suite

```bash
npx playwright test tests/e2e/security.spec.js
npx playwright test tests/e2e/api-contracts.spec.js
npx playwright test tests/e2e/auth.spec.js
```

### Capture visual regression baselines (first run)

```bash
npx playwright test tests/e2e/visual.spec.js --update-snapshots
```

### Subsequent visual regression comparison

```bash
npx playwright test tests/e2e/visual.spec.js
```

### View HTML report

```bash
npx playwright show-report tests/playwright-report
```

---

## Test File Map

| File | Suite | Tests |
|---|---|---|
| `tests/e2e/navigation.spec.js` | TS-01 Navigation | 14 |
| `tests/e2e/auth.spec.js` | TS-02 Authentication | 12 |
| `tests/e2e/leaderboard.spec.js` | TS-06 Leaderboard | 7 |
| `tests/e2e/pricing.spec.js` | TS-09 Pricing CTAs | 7 |
| `tests/e2e/security.spec.js` | TS-11 Security | 11 |
| `tests/e2e/api-contracts.spec.js` | TS-12 API Contracts | 15 |
| `tests/e2e/visual.spec.js` | TS-14 Visual Regression | 10 |
| `tests/e2e/validation-flow.spec.js` | TS-08 Validation Flow | 5 |

---

## In-App QA Dashboard

Navigate to `/?page=sr365-qa` (password-gated, same as AdminTools).

Features:
- **Test Runner** — 65+ in-browser tests across 9 suites (no Playwright required)
- **Issue Log** — persistent issue tracker with severity tagging (stored in localStorage)
- **Test Plan** — full test plan viewer with risk register
- **Coverage** — feature coverage matrix (Playwright vs in-app)

---

## CI/CD Integration (GitHub Actions)

Add to `.github/workflows/qa.yml`:

```yaml
name: QA — Playwright E2E
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 6 * * 1'  # Monday 6am UTC

jobs:
  playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --project=chromium
        env:
          PLAYWRIGHT_BASE_URL: https://www.stackrank365.com
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: tests/playwright-report/
```

---

## Key Documents

- [QA-TEST-PLAN.md](./QA-TEST-PLAN.md) — Full test plan (14 suites, 122 test cases)
- [ISSUES.md](./ISSUES.md) — Static analysis issue log (14 issues, 2 Critical)
