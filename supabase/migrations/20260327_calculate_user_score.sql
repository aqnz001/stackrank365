-- F07: Server-side score calculation function
-- Called by refreshServerScore() in AppContext.jsx
-- Mirrors the calcScore() logic but runs in Postgres (tamper-proof)
CREATE OR REPLACE FUNCTION calculate_user_score(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_primary    INTEGER := 0;
  v_community  INTEGER := 0;
  v_bonus_cap  INTEGER;
  v_total      INTEGER;
  v_cert_pts   INTEGER;
  v_proj_pts   INTEGER;
  v_unverif_count INTEGER := 0;
BEGIN
  -- Certifications (verified only)
  SELECT COALESCE(SUM(c.points), 0) INTO v_cert_pts
  FROM certifications uc
  JOIN cert_catalog c ON c.code = uc.code
  WHERE uc.user_id = p_user_id AND uc.verified IS DISTINCT FROM false;
  v_primary := v_primary + v_cert_pts;

  -- Projects: all validated + up to 3 unvalidated (F02 cap)
  SELECT COALESCE(SUM(points), 0) INTO v_proj_pts
  FROM (
    SELECT points FROM projects WHERE user_id = p_user_id AND (validated = true OR verified = true)
    UNION ALL
    SELECT points FROM (
      SELECT points, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
      FROM projects WHERE user_id = p_user_id AND (validated IS NOT TRUE) AND (verified IS NOT TRUE)
    ) sub WHERE rn <= 3
  ) all_projects;
  v_primary := v_primary + v_proj_pts;

  -- Founding member bonus
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND founding_member = true) THEN
    v_primary := v_primary + 500;
  END IF;

  -- Profile completeness bonus
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND bio IS NOT NULL AND specialism IS NOT NULL AND location IS NOT NULL) THEN
    v_primary := v_primary + 150;
  END IF;

  -- Community contributions (15% cap)
  SELECT COALESCE(SUM(points_awarded), 0) INTO v_community
  FROM community_contributions
  WHERE user_id = p_user_id AND status = 'active';

  v_bonus_cap := FLOOR(v_primary * 0.15);
  v_total := v_primary + LEAST(v_community, v_bonus_cap);

  -- Update the profiles table with the authoritative score
  UPDATE profiles SET reputation_score = v_total WHERE id = p_user_id;

  RETURN v_total;
END;
$$;

-- Grant execute to authenticated users for their own score only
REVOKE ALL ON FUNCTION calculate_user_score(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calculate_user_score(UUID) TO authenticated;

COMMENT ON FUNCTION calculate_user_score IS
  'F07: Authoritative server-side score — mirrors calcScore() in AppContext. Called via sb.rpc(). Updates reputation_score column.';
