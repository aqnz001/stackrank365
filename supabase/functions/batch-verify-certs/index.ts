import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MS_LEARN_URL = "https://learn.microsoft.com/api/contentbrowser/search/credentials?locale=en-us&credential_types=certification";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

async function verifyAgainstCatalog(supabase, cert) {
  // 1. Try matching against our cert_catalog first (fast, no external call)
  if (cert.ms_cert_id) {
    const { data: catalogEntry } = await supabase.from("cert_catalog").select("certification_uid, certification_name, status, retirement_date").eq("certification_uid", cert.ms_cert_id).single();
    if (catalogEntry) {
      const isRetired = catalogEntry.status === "retired" || (catalogEntry.retirement_date && new Date(catalogEntry.retirement_date) < new Date());
      return {
        verified: !isRetired,
        source: "cert_catalog",
        metadata: catalogEntry,
        reason: isRetired ? "Certification retired or expired" : "Matched in Microsoft Learn catalog"
      };
    }
  }

  // 2. Fuzzy match by name if no ms_cert_id
  if (cert.name) {
    const { data: fuzzyMatch } = await supabase.from("cert_catalog").select("certification_uid, certification_name, status").ilike("certification_name", `%${cert.name.split(":").pop()?.trim() ?? cert.name}%`).limit(1).single();
    if (fuzzyMatch) {
      // Update the cert with the discovered ms_cert_id
      await supabase.from("certifications").update({ ms_cert_id: fuzzyMatch.certification_uid }).eq("id", cert.id);
      return { verified: fuzzyMatch.status !== "retired", source: "catalog_fuzzy", metadata: fuzzyMatch, reason: `Fuzzy matched to: ${fuzzyMatch.certification_name}` };
    }
  }

  // 3. Fall back to MS Learn API for certs not in catalog
  const searchUrl = MS_LEARN_URL + `&\$filter=title eq '${encodeURIComponent(cert.name||"")}'`;
  const msRes = await fetch(searchUrl, { headers: { Accept: "application/json" } }).catch(() => null);
  if (msRes?.ok) {
    const data = await msRes.json();
    const items = data.results ?? data.items ?? [];
    if (items.length > 0) return { verified: true, source: "ms_learn_api", metadata: items[0], reason: "Found in MS Learn API" };
  }

  return { verified: false, source: "not_found", metadata: null, reason: "Certification not found in any source" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const body = await req.json().catch(() => ({}));

    // Get unverified certs, or specific profile
    let query = supabase.from("certifications").select("id, profile_id, name, ms_cert_id, verification_status").eq("verification_status", "unverified").limit(body.limit ?? 100);
    if (body.profile_id) query = supabase.from("certifications").select("id, profile_id, name, ms_cert_id, verification_status").eq("profile_id", body.profile_id).neq("verification_status", "verified");
    if (body.recheck_all) query = supabase.from("certifications").select("id, profile_id, name, ms_cert_id, verification_status").limit(body.limit ?? 100);

    const { data: certs, error } = await query;
    if (error) throw error;

    const results = { processed: 0, verified: 0, failed: 0, errors: 0 };

    for (const cert of (certs ?? [])) {
      try {
        await supabase.from("certifications").update({ verification_status: "pending" }).eq("id", cert.id);
        const { verified, source, metadata, reason } = await verifyAgainstCatalog(supabase, cert);

        if (verified) {
          await supabase.rpc("mark_cert_verified", { cert_id: cert.id, source, metadata: metadata ?? {} });
          results.verified++;
        } else {
          await supabase.rpc("mark_cert_failed", { cert_id: cert.id, source, metadata: { reason, ms_cert_id: cert.ms_cert_id } });
          results.failed++;
        }
        results.processed++;
      } catch(err) {
        await supabase.from("certifications").update({ verification_status: "unverified" }).eq("id", cert.id);
        results.errors++;
      }
    }

    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch(err) {
    return new Response(JSON.stringify({ error: err?.message || err?.details || JSON.stringify(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});