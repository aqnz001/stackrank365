// supabase/functions/sync-catalog/index.ts
// Syncs Microsoft Learn certification catalog into cert_catalog table.
// Fixed: MS Learn API uses roles/certification_type not products.
// Prerequisites field removed — paths built from domain/role matching.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MS_LEARN_CERTS_URL = "https://learn.microsoft.com/api/credentials/browse?locale=en-us&type=certification";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch all certs from MS Learn
    const msResponse = await fetch(MS_LEARN_CERTS_URL, {
      headers: { "Accept": "application/json" },
    });

    if (!msResponse.ok) {
      throw new Error(`MS Learn API error: ${msResponse.status}`);
    }

    const msData = await msResponse.json();
    const certs = msData.items ?? msData.results ?? msData ?? [];

    if (!Array.isArray(certs) || certs.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No certs returned from MS Learn" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map MS Learn fields to our cert_catalog schema
    const rows = certs.map((cert) => ({
      ms_cert_id: cert.uid ?? cert.certificationUid ?? cert.id,
      name: cert.title ?? cert.certificationTitle,
      certification_type: cert.certificationType ?? cert.certification_type ?? "general",
      roles: cert.roles ?? [],
      domain: cert.products?.[0] ?? cert.domain ?? null,
      level: cert.levels?.[0] ?? cert.level ?? null,
      url: cert.url ?? `https://learn.microsoft.com/en-us/credentials/certifications/${cert.uid}`,
      updated_at: new Date().toISOString(),
    })).filter(r => r.ms_cert_id && r.name);

    // Upsert into cert_catalog
    const { error, count } = await supabase
      .from("cert_catalog")
      .upsert(rows, { onConflict: "ms_cert_id", count: "exact" });

    if (error) throw error;

    // Build certification_paths from domain/role matching
    const { data: allCerts } = await supabase.from("cert_catalog").select("id, roles, domain, level");

    if (allCerts && allCerts.length > 0) {
      const pathRows = [];
      for (const cert of allCerts) {
        const related = allCerts.filter(
          c => c.id !== cert.id && (
            c.roles?.some(r => cert.roles?.includes(r)) ||
            (c.domain && c.domain === cert.domain)
          )
        );
        for (const rel of related) {
          pathRows.push({ from_cert_id: cert.id, to_cert_id: rel.id });
        }
      }
      if (pathRows.length > 0) {
        await supabase.from("certification_paths").upsert(pathRows, { onConflict: "from_cert_id,to_cert_id" });
      }
    }

    return new Response(
      JSON.stringify({ synced: count ?? rows.length, total_from_ms: certs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-catalog error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
