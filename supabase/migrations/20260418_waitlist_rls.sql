-- ─── Waitlist RLS fix ─────────────────────────────────────────────────────────
-- The waitlist table was created via the dashboard without RLS policies.
-- Landing page WaitlistForm POSTs as anon — needs an INSERT policy.

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can join waitlist"
  ON public.waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
