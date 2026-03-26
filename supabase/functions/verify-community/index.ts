import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Point values matching data.js
const POINTS: Record<string, number> = {
  mvp:               1500,
  mct:               800,
  speaking_ms:       500,
  speaking_community:300,
  blog:              200,
  github:            200,
  validation:        300,
  referral:          500,
};

async function verifyGitHub(username: string): Promise<{ verified: boolean; years: number }> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers: { "User-Agent": "StackRank365-Verify/1.0" } });
    if (!res.ok) return { verified: false, years: 0 };
    const repos = await res.json();
    // Count repos with MS-ecosystem topics or names
    const msKeywords = ["dynamics","power-platform","powerapps","powerautomate","powerbi","d365","crm","copilot","azure","m365","sharepoint","teams"];
    const msRepos = repos.filter((r: any) =>
      msKeywords.some(k => (r.name || "").toLowerCase().includes(k) ||
                           (r.description || "").toLowerCase().includes(k) ||
                           (r.topics || []).some((t: string) => t.includes(k)))
    );
    // Check years with contributions — simplified: count distinct years from pushed_at
    const years = new Set(repos.map((r: any) => r.pushed_at?.slice(0,4)).filter(Boolean)).size;
    return { verified: msRepos.length > 0 || repos.length > 2, years };
  } catch {
    return { verified: false, years: 0 };
  }
}

async function verifyMVP(name: string): Promise<boolean> {
  try {
    // Microsoft MVP public directory — check by name
    const res = await fetch(`https://mvp.microsoft.com/en-US/MvpSearch/GetMVPSearchList?keyword=${encodeURIComponent(name)}&expertiseId=0&searchType=0`,
      { headers: { "User-Agent": "StackRank365-Verify/1.0", "Accept": "application/json" } });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data?.mvpList) && data.mvpList.length > 0;
  } catch {
    return false; // API may be unreliable — return false, don't block
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { userId, contributionId } = await req.json();
    if (!userId || !contributionId) {
      return new Response(JSON.stringify({ error: "userId and contributionId required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch the contribution
    const { data: contrib, error: fetchErr } = await sb
      .from("community_contributions")
      .select("*")
      .eq("id", contributionId)
      .eq("user_id", userId)
      .single();

    if (fetchErr || !contrib) {
      return new Response(JSON.stringify({ error: "Contribution not found" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    let verified = false;
    let verificationSource = "self";
    let pointsAwarded = POINTS[contrib.type] || 200;

    // Auto-verify what we can
    if (contrib.type === "github") {
      // Fetch user profile for GitHub handle
      const { data: profile } = await sb.from("profiles").select("github_url, name").eq("id", userId).single();
      const githubHandle = profile?.github_url?.replace(/.*github\.com\//, "").replace(/\/.*/, "") || "";
      if (githubHandle) {
        const { verified: ghVerified, years } = await verifyGitHub(githubHandle);
        verified = ghVerified;
        verificationSource = "github_api";
        pointsAwarded = Math.min(years, 10) * POINTS.github; // up to 10 yrs
      }
    } else if (contrib.type === "mvp") {
      const { data: profile } = await sb.from("profiles").select("name").eq("id", userId).single();
      if (profile?.name) {
        verified = await verifyMVP(profile.name);
        verificationSource = "mvp_api";
      }
    } else {
      // speaking, blog, mct — mark as reported (self-declared with URL)
      verified = false;
      verificationSource = "self";
    }

    // Update the contribution record
    const { data: updated } = await sb
      .from("community_contributions")
      .update({ verified, verification_source: verificationSource, points_awarded: pointsAwarded, status: "active" })
      .eq("id", contributionId)
      .select()
      .single();

    return new Response(JSON.stringify({ success: true, verified, pointsAwarded, contribution: updated }),
      { headers: { ...CORS, "Content-Type": "application/json" } });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
