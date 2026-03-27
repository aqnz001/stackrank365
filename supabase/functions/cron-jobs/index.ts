import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// T29: Cron orchestrator — called by Supabase pg_cron or externally
// Triggers: batch-verify-certs, cert-expiry-reminders, verify-reputation
// Schedule: set up via Supabase Dashboard > Database > Cron Jobs
// Suggested cron:
//   batch-verify-certs:      0 2 * * 0   (Sundays 2am UTC)
//   cert-expiry-reminders:   0 8 * * *   (Daily 8am UTC)
//   verify-reputation:       0 3 * * 1   (Mondays 3am UTC)

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = SUPABASE_URL + "/functions/v1";

async function trigger(fnName: string, body: object = {}) {
  const res = await fetch(`${BASE}/${fnName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + ANON_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { fn: fnName, status: res.status, ok: res.ok, result: data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const { job } = await req.json().catch(() => ({ job: "all" }));
  const results: Record<string, any> = {};

  if (job === "all" || job === "batch-verify-certs") {
    results["batch-verify-certs"] = await trigger("batch-verify-certs");
  }
  if (job === "all" || job === "cert-expiry-reminders") {
    results["cert-expiry-reminders"] = await trigger("cert-expiry-reminders");
  }
  if (job === "all" || job === "verify-reputation") {
    results["verify-reputation"] = await trigger("verify-reputation");
  }

  // Profile completion nudge — find users who signed up 23-25h ago with incomplete profiles
  if (job === "all" || job === "profile-nudge") {
    try {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);
      const since = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      const until = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString();
      const { data: newUsers } = await sb.from("profiles")
        .select("id, name, first_name, email:id")
        .gte("created_at", since).lte("created_at", until)
        .or("bio.is.null,specialism.is.null,location.is.null");
      // For each incomplete profile, fire a nudge email
      const nudgeResults = await Promise.allSettled(
        (newUsers || []).map(async (u: any) => {
          // Get email from auth.users via service role
          const { data: authUser } = await sb.auth.admin.getUserById(u.id);
          const email = authUser?.user?.email;
          if (!email) return;
          // Calculate completion %
          const pct = [u.name, u.bio, u.specialism, u.location, u.headline].filter(Boolean).length * 20;
          await fetch(`https://shnuwkjkjthvaovoywju.supabase.co/functions/v1/send-email`, {
            method: "POST",
            headers: { apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4", Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4", "Content-Type": "application/json" },
            body: JSON.stringify({ to: email, template_key: "profile_nudge", variables: { name: u.first_name || u.name || email.split("@")[0], pct: String(pct) } }),
          });
        })
      );
      results["profile-nudge"] = { fn: "profile-nudge", ok: true, count: (newUsers||[]).length };
    } catch(e) {
      results["profile-nudge"] = { fn: "profile-nudge", ok: false, error: String(e) };
    }
  }

  return new Response(JSON.stringify({ success: true, triggered: Object.keys(results), results }),
    { headers: { ...CORS, "Content-Type": "application/json" } });
});
