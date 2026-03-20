import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

async function verifyReputation(supabase, profile) {
  const checks = [];

  // 1. GitHub activity check — does their GitHub match claimed skills?
  if (profile.github_url) {
    const handle = profile.github_url.split("/").filter(Boolean).pop();
    const ghRes = await fetch(`https://api.github.com/users/${handle}/repos?per_page=10&sort=updated`, { headers: { Accept: "application/vnd.github.v3+json" } });
    if (ghRes.ok) {
      const repos = await ghRes.json();
      const msRepos = repos.filter(r => /dynamics|power|azure|dataverse|d365|crm/i.test(r.name + " " + (r.description||"")));
      checks.push({ source: "github", verified: msRepos.length > 0, detail: msRepos.length > 0 ? `${msRepos.length} Microsoft-related repos found` : "No Microsoft repos found" });
    }
  }

  // 2. MVP status cross-check against Microsoft MVP list
  if (profile.is_mvp) {
    const mvpRes = await fetch(`https://mvp.microsoft.com/en-us/MvpSearch?q=${encodeURIComponent(profile.name||"")}`, { headers: { Accept: "application/json" } }).catch(() => null);
    const found = mvpRes?.ok ? (await mvpRes.text().catch(()=>"")).toLowerCase().includes((profile.name||"").toLowerCase()) : false;
    checks.push({ source: "mvp_list", verified: found, detail: found ? "Name found in MVP directory" : "Name not found in MVP directory — manual check recommended" });
  }

  // 3. LinkedIn profile URL validity
  if (profile.linkedin_url) {
    const lRes = await fetch(profile.linkedin_url, { method: "HEAD", redirect: "follow" }).catch(() => null);
    checks.push({ source: "linkedin", verified: lRes?.ok ?? false, detail: lRes?.ok ? "LinkedIn URL resolves" : "LinkedIn URL is broken or private" });
  }

  // 4. Use Claude to summarise reputation confidence
  const profileSummary = {
    name: profile.name,
    title: profile.professional_title,
    score: profile.score,
    certCount: profile.cert_count ?? 0,
    projectCount: profile.project_count ?? 0,
    checks
  };

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 500,
      messages: [{ role: "user", content: `Given this Microsoft professional's profile data and verification checks, provide a reputation confidence score (0-100) and a 1-2 sentence summary of their credibility. Return ONLY JSON: { "confidence": number, "summary": "string" }

Profile: ${JSON.stringify(profileSummary)}` }]
    })
  });

  let reputation = { confidence: 50, summary: "Unable to assess — insufficient data" };
  if (claudeRes.ok) {
    const d = await claudeRes.json();
    try { reputation = JSON.parse(d.content[0].text.replace(/```json\n?|```\n?/g,"").trim()); } catch(e) {}
  }

  return { checks, reputation };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body = await req.json().catch(() => ({}));
    let query = supabase.from("profiles").select("id, name, professional_title, score, github_url, linkedin_url, is_mvp, is_mct").limit(100);
    if (body.profile_id) query = supabase.from("profiles").select("id, name, professional_title, score, github_url, linkedin_url, is_mvp, is_mct").eq("id", body.profile_id);
    const { data: profiles } = await query;
    const results = { verified: 0, warnings: 0, errors: 0 };
    for (const profile of (profiles ?? [])) {
      try {
        const { checks, reputation } = await verifyReputation(supabase, profile);
        await supabase.from("profiles").update({ reputation_score: reputation.confidence, reputation_summary: reputation.summary, reputation_checked_at: new Date().toISOString() }).eq("id", profile.id);
        if (reputation.confidence < 40) results.warnings++; else results.verified++;
      } catch(err) { results.errors++; }
    }
    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch(err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});