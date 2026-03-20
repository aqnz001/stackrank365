import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { job_description, region, tier_minimum, open_to_work_only = true, limit = 10 } = await req.json();
    if (!job_description) return new Response(JSON.stringify({ error: "job_description required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch candidate pool from leaderboard
    let query = supabase.from("leaderboard")
      .select("id, name, professional_title, region, tier, score, rank, open_to_work, specialization")
      .order("rank", { ascending: true })
      .limit(200);

    if (open_to_work_only) query = query.eq("open_to_work", true);
    if (region) query = query.ilike("region", `%${region}%`);

    const TIER_ORDER = ["Explorer","Practitioner","Specialist","Principal","Architect"];
    if (tier_minimum) {
      const minIdx = TIER_ORDER.indexOf(tier_minimum);
      if (minIdx > 0) {
        const eligibleTiers = TIER_ORDER.slice(minIdx);
        query = query.in("tier", eligibleTiers);
      }
    }

    const { data: candidates, error } = await query;
    if (error) throw error;
    if (!candidates?.length) return new Response(JSON.stringify({ matches: [], message: "No candidates match the filters" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // 2. Use Claude to rank candidates against the job description
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 2000,
        messages: [{ role: "user", content: `You are a technical recruiter specialising in the Microsoft ecosystem.

Given this job description and a pool of verified Microsoft professionals, rank the top ${limit} best matches.

JOB DESCRIPTION:
${job_description}

CANDIDATE POOL:
${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, title: c.professional_title, tier: c.tier, score: c.score, rank: c.rank, specialization: c.specialization, region: c.region })))}

Return ONLY valid JSON — an array of the top ${limit} matches:
[{
  "id": "profile_id",
  "name": "string",
  "match_score": <0-100>,
  "match_reason": "1-2 sentence explanation of why this person fits",
  "strengths": ["array", "of", "key", "strengths"],
  "concerns": ["array", "of", "any", "concerns", "or empty"]
}]

Rank by genuine fit to the role, not just StackRank score.` }]
      })
    });

    if (!claudeRes.ok) throw new Error("Claude API " + claudeRes.status);
    const claudeData = await claudeRes.json();
    const raw = claudeData.content[0].text.replace(/```json\n?|```\n?/g,"").trim();
    let matches = [];
    try { matches = JSON.parse(raw); } catch(e) { throw new Error("Could not parse Claude matches"); }

    // 3. Enrich matches with full profile data
    const enriched = matches.map(m => {
      const profile = candidates.find(c => c.id === m.id);
      return { ...m, tier: profile?.tier, rank: profile?.rank, score: profile?.score, region: profile?.region };
    });

    return new Response(JSON.stringify({ matches: enriched, total_candidates_evaluated: candidates.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch(err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});