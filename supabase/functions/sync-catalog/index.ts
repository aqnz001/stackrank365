// supabase/functions/sync-catalog/index.ts
// Syncs MS Learn certifications into cert_catalog.
// Schema-aligned: uses actual cert_catalog column names.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MS_BASE =
  "https://learn.microsoft.com/api/contentbrowser/search/credentials" +
  "?locale=en-us&facet=roles&facet=products&facet=levels&facet=subjects" +
  "&facet=credential_types&credential_types=certification" +
  "&\$orderBy=title&fuzzySearch=false";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Paginate through all certs
    let allCerts: any[] = [];
    let skip = 0;
    const top = 100;

    while (true) {
      const url = `${MS_BASE}&\$top=${top}&\$skip=${skip}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`MS Learn API ${res.status} at skip=${skip}`);

      const data = await res.json();
      const items: any[] = data.results ?? data.items ?? [];
      if (items.length === 0) break;

      allCerts = allCerts.concat(items);
      if (items.length < top) break;
      skip += top;
    }

    if (allCerts.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No certs returned from MS Learn" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map MS Learn response fields → actual cert_catalog column names
    const rows = allCerts
      .map((cert) => ({
        certification_uid:   cert.uid ?? cert.certificationUid ?? cert.id,
        certification_name:  cert.title ?? cert.certificationTitle,
        program:             cert.credential_types?.[0] ?? cert.certificationType ?? "certification",
        technology_area:     cert.products?.[0] ?? cert.subjects?.[0] ?? cert.roles?.[0] ?? null,
        level:               cert.levels?.[0] ?? null,
        official_url:        cert.url ?? `https://learn.microsoft.com/en-us/credentials/certifications/${cert.uid}`,
        status:              "active",
        updated_at:          new Date().toISOString(),
      }))
      .filter((r) => r.certification_uid && r.certification_name);

    const { error, count } = await supabase
      .from("cert_catalog")
      .upsert(rows, { onConflict: "certification_uid", count: "exact" });

    if (error) throw error;

    // Build certification_paths from technology_area matching
    const { data: allRows } = await supabase
      .from("cert_catalog")
      .select("id, technology_area, level");

    if (allRows && allRows.length > 0) {
      const pathRows: any[] = [];
      for (const cert of allRows) {
        if (!cert.technology_area) continue;
        const related = allRows.filter(
          (c) => c.id !== cert.id && c.technology_area === cert.technology_area
        );
        for (const rel of related) {
          pathRows.push({ from_cert_id: cert.id, to_cert_id: rel.id });
        }
      }
      if (pathRows.length > 0) {
        await supabase
          .from("certification_paths")
          .upsert(pathRows, { onConflict: "from_cert_id,to_cert_id" });
      }
    }

    return new Response(
      JSON.stringify({ synced: count ?? rows.length, total_fetched: allCerts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-catalog error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
