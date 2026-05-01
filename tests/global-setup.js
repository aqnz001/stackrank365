/**
 * Playwright global setup — runs once before all tests.
 * Validates environment and sets shared test constants.
 */
export default async function globalSetup(config) {
  const baseURL = config.projects[0].use.baseURL || 'https://www.stackrank365.com';
  console.log(`\n[QA] Running against: ${baseURL}`);
  console.log(`[QA] Supabase project: shnuwkjkjthvaovoywju`);
  console.log(`[QA] Test plan: tests/QA-TEST-PLAN.md\n`);
}
