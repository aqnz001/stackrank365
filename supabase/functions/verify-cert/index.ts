// supabase/functions/verify-cert/index.ts
// Verifies a user's certification claim against MS Learn API
// and updates the certifications table with the result.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MS_LEARN_API = "https://learn.microsoft.com/api/credentials/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { cert_id, profile_id, ms_cert_id } = await req.json();

    if (!cert_id || !profile_id || !ms_cert_id) {
      return new Response(
        JSON.stringify({ error: "cert_id, profile_id, and ms_cert_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Mark as pending immediately so UI shows "Verifying..."
    await supabase.rpc("mark_cert_pending", { cert_id });

    // Call MS Learn credentials API
    const msResponse = await fetch(`${MS_LEARN_API}${ms_cert_id}`, {
      headers: { "Accept": "application/json" },
    });

    const metadata = msResponse.ok ? await msResponse.json() : null;

    if (msResponse.ok && metadata) {
      await supabase.rpc("mark_cert_verified", {
        cert_id,
        source: "ms_learn_api",
        metadata,
      });

      return new Response(
        JSON.stringify({
          status: "verified",
          cert_id,
          cert_name: metadata.title ?? metadata.name ?? ms_cert_id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      await supabase.rpc("mark_cert_failed", {
        cert_id,
        source: "ms_learn_api",
        metadata: { http_status: msResponse.status, ms_cert_id },
      });

      return new Response(
        JSON.stringify({
          status: "failed",
          cert_id,
          reason: "Certification not found in Microsoft Learn records",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("verify-cert error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error during verification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
