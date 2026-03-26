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

  return new Response(JSON.stringify({ success: true, triggered: Object.keys(results), results }),
    { headers: { ...CORS, "Content-Type": "application/json" } });
});
