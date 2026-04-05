-- Add SELECT policy for resume_analyses now that profile_id column is confirmed.
-- Users can read their own analysis results only.
CREATE POLICY "users can read own resume analyses"
  ON public.resume_analyses
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());
