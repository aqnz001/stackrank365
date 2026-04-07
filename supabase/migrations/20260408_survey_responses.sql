-- Survey responses table
CREATE TABLE public.survey_responses (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at            timestamptz DEFAULT now(),
  tech_areas            text[],
  role                  text,
  first_impression      smallint    CHECK (first_impression      BETWEEN 1 AND 7),
  clarity               smallint    CHECK (clarity               BETWEEN 1 AND 7),
  industry_need         smallint    CHECK (industry_need         BETWEEN 1 AND 7),
  biggest_blocker       text,
  feature_stack_points  smallint    CHECK (feature_stack_points  BETWEEN 1 AND 7),
  feature_cert_verify   smallint    CHECK (feature_cert_verify   BETWEEN 1 AND 7),
  feature_cv_analyser   smallint    CHECK (feature_cv_analyser   BETWEEN 1 AND 7),
  most_important        text,
  will_revisit          text        CHECK (will_revisit IN ('yes', 'no', 'not_sure')),
  overall_rating        smallint    CHECK (overall_rating        BETWEEN 1 AND 7)
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Anyone (logged in or not) can submit a response
CREATE POLICY "anyone can insert survey response"
  ON public.survey_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins read via service_role only — no SELECT policy for regular users
