import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

async function checkProfile(supabase, profile) {
  const flags = [];
  const now = new Date();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);

  // Signal 1: >5 projects in last 24h
  const { count: recentProjects } = await supabase.from("projects").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).gte("created_at", yesterday.toISOString());
  if ((recentProjects ?? 0) >= 5) flags.push({ flag: "rapid_project_addition", score: 30, detail: recentProjects + " projects added in 24h" });

  // Signal 2: All backdated + unvalidated
  const fiveYearsAgo = new Date(now); fiveYearsAgo.setFullYear(now.getFullYear() - 5);
  const { data: projects } = await supabase.from("projects").select("id, project_date").eq("profile_id", profile.id);
  if (projects && projects.length >= 3) {
    const backdated = projects.filter(p => new Date(p.project_date) < fiveYearsAgo);
    if (backdated.length === projects.length) flags.push({ flag: "all_backdated_unvalidated", score: 40, detail: "All " + projects.length + " projects backdated >5yr" });
  }

  // Signal 3: High cert failure rate
  const { count: failedCerts } = await supabase.from("certifications").select("id", { count: "exact", head: true }).eq("profile_id", profile.id).eq("verification_status", "failed");
  const { count: totalCerts } = await supabase.from("certifications").select("id", { count: "exact", head: true }).eq("profile_id", profile.id);
  if ((failedCerts ?? 0) > 0 && (totalCerts ?? 1) > 0 && (failedCerts / totalCerts) >= 0.5)
    flags.push({ flag: "high_cert_failure_rate", score: 35, detail: failedCerts + "/" + totalCerts + " certs failed verification" });

  // Signal 4: New account high score
  const accountAgeHours = (now - new Date(profile.created_at)) / 3600000;
  if (accountAgeHours < 48 && (profile.score ?? 0) > 10000)
    flags.push({ flag: "new_account_high_score", score: 50, detail: "Account " + Math.round(accountAgeHours) + "h old, score " + profile.score });

  return flags;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    let query = supabase.from("profiles").select("id, fraud_score, created_at, fraud_status").neq("fraud_status", "suspended").limit(500);
    if (body.profile_id) query = supabase.from("profiles").select("id, score, created_at, fraud_status").eq("id", body.profile_id);
    const { data: profiles, error } = await query;
    if (error) throw error;
    const results = { checked: 0, flagged: 0, cleared: 0, errors: 0 };
    for (const profile of (profiles ?? [])) {
      try {
        const flags = await checkProfile(supabase, profile);
        const totalScore = flags.reduce((s, f) => s + f.score, 0);
        const newStatus = totalScore >= 50 ? "flagged" : "clean";
        await supabase.from("profiles").update({ fraud_score: totalScore, fraud_flags: flags, fraud_status: newStatus, fraud_reviewed_at: new Date().toISOString() }).eq("id", profile.id);
        await supabase.from("fraud_audit_log").insert({ profile_id: profile.id, fraud_score: totalScore, flags, action_taken: newStatus === "flagged" ? "flagged_for_review" : "cleared" });
        results.checked++;
        if (newStatus === "flagged") results.flagged++; else results.cleared++;
      } catch(err) { results.errors++; }
    }
    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch(err) {
    return new Response(JSON.stringify({ error: err?.message || err?.details || JSON.stringify(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});