-- ─── Recruitment MVP ─────────────────────────────────────────────────────────
-- Minimal schema to bring recruiter/candidate flow to a testing state.
-- Two tables: jobs (posted by tier='recruiter' users) + applications.
-- Bids / consent / escrow deferred — see JobBoard POC for blueprints.

-- ─── jobs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.jobs (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title              text        NOT NULL,
  company            text,
  description        text        NOT NULL,
  location           text,
  remote_ok          boolean     DEFAULT false,
  employment_type    text        CHECK (employment_type IN ('full-time','part-time','contract','temporary')),
  experience_level   text        CHECK (experience_level IN ('entry','mid','senior','lead','principal')),
  salary_min         integer,
  salary_max         integer,
  salary_currency    text        DEFAULT 'USD',
  specialization     text,
  required_skills    text[]      DEFAULT '{}',
  required_certs     text[]      DEFAULT '{}',
  status             text        DEFAULT 'open' CHECK (status IN ('draft','open','closed','filled')),
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status         ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by      ON public.jobs (posted_by);
CREATE INDEX IF NOT EXISTS idx_jobs_specialization ON public.jobs (specialization);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can read open jobs (public job board)
CREATE POLICY "anyone can read open jobs"
  ON public.jobs FOR SELECT
  TO anon, authenticated
  USING (status = 'open');

-- Poster can read all their own jobs (including drafts/closed)
CREATE POLICY "poster can read own jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (posted_by = auth.uid());

-- Only users with tier='recruiter' can post jobs
CREATE POLICY "recruiters can insert jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    posted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tier = 'recruiter'
    )
  );

CREATE POLICY "poster can update own jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (posted_by = auth.uid())
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "poster can delete own jobs"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (posted_by = auth.uid());


-- ─── applications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.applications (
  id                 uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id             uuid        NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter       text,
  resume_url         text,
  phone              text,
  salary_expectation integer,
  status             text        DEFAULT 'submitted' CHECK (status IN ('submitted','shortlisted','rejected','hired','withdrawn')),
  recruiter_notes    text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id       ON public.applications (job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status       ON public.applications (status);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Candidate can read their own applications
CREATE POLICY "candidate can read own applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (candidate_id = auth.uid());

-- Job poster (recruiter) can read applications to their jobs
CREATE POLICY "poster can read applications to own jobs"
  ON public.applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()
    )
  );

-- Authenticated users can apply (insert as themselves)
CREATE POLICY "authenticated can insert own application"
  ON public.applications FOR INSERT
  TO authenticated
  WITH CHECK (candidate_id = auth.uid());

-- Candidate can update/withdraw their own application
CREATE POLICY "candidate can update own application"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());

-- Job poster can update status/notes on applications to their jobs
CREATE POLICY "poster can update applications to own jobs"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()
    )
  );

-- ─── updated_at trigger ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jobs_updated_at ON public.jobs;
CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
