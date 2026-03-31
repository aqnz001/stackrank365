-- ─── Security Fixes ───────────────────────────────────────────────────────────
-- Addresses Supabase Security Advisor warnings:
--   1. RLS disabled on cert_reminder_log
--   2. RLS disabled on fraud_audit_log
--   3. RLS disabled on resume_analyses
--   4. Security Definer View on public.leaderboard

-- 1. cert_reminder_log
--    Written only by cert-expiry-reminders edge function (service_role).
--    service_role bypasses RLS, so no user-facing policies are needed.
ALTER TABLE public.cert_reminder_log ENABLE ROW LEVEL SECURITY;


-- 2. fraud_audit_log
--    Inserted by AdminFraud.jsx via the authenticated supabase client.
--    No user should ever SELECT from this — admin reads via service_role.
ALTER TABLE public.fraud_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users can insert fraud audit logs"
  ON public.fraud_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- 3. resume_analyses
--    Written by analyse-resume edge function (service_role).
--    Users may read their own analysis results.
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own resume analyses"
  ON public.resume_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- 4. leaderboard view — switch from SECURITY DEFINER to SECURITY INVOKER
--    SECURITY DEFINER runs as the view owner (bypasses RLS on base tables).
--    SECURITY INVOKER runs as the querying user, respecting RLS.
--
--    The leaderboard is intentionally public — add an anon SELECT policy on
--    profiles first so the view still returns data after the switch.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'anon can read public leaderboard fields'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "anon can read public leaderboard fields"
        ON public.profiles
        FOR SELECT
        TO anon
        USING (true)
    $policy$;
  END IF;
END $$;

ALTER VIEW public.leaderboard SET (security_invoker = true);

-- Ensure anonymous users can still read the leaderboard (it's a public page)
GRANT SELECT ON public.leaderboard TO anon, authenticated;
