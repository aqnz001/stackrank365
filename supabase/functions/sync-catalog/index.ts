// supabase/functions/sync-catalog/index.ts
// Syncs Microsoft Learn certification catalog into cert_catalog table.
// Endpoint discovered from live MS Learn network traffic:
// https://learn.microsoft.com/api/contentbrowser/search/credentials

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MS_LEARN_URL =
  "https://learn.microsoft.com/api/contentbrowser/search/credentials" +
  "?locale=en-us&facet=roles&facet=products&facet=levels&facet=subjects" +
  "&facet=credential_types&credential_types=certification&\$orderBy=title&\$top=100&fuzzySearch=false";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Paginate through all certs ($top=100, offset via $skip)
    let allCerts = [];
    let skip = 0;
    const top = 100;

    while (true) {
      const url = MS_LEARN_URL + `&\$skip=${skip}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`MS Learn API error: ${res.status} at skip=${skip}`);

      const data = await res.json();
      const items = data.results ?? data.items ?? [];
      if (items.length === 0) break;

      allCerts = allCerts.concat(items);
      if (items.length < top) break;
      skip += top;
    }

    if (allCerts.length === 0) {
      return new Response(JSON.stringify({ synced: 0, message: "No certs returned" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map to cert_catalog schema
    const rows = allCerts.map((cert) => ({
      ms_cert_id: cert.uid ?? cert.certificationUid ?? cert.id,
      name: cert.title ?? cert.certificationTitle,
      certification_type: cert.credential_types?.[0] ?? cert.certificationType ?? "certification",
      roles: cert.roles ?? [],
      domain: cert.products?.[0] ?? cert.subjects?.[0] ?? null,
      level: cert.levels?.[0] ?? null,
      url: cert.url ?? `https://learn.microsoft.com/en-us/credentials/certifications/${cert.uid}`,
      updated_at: new Date().toISOString(),
    })).filter((r) => r.ms_cert_id && r.name);

    // Upsert into cert_catalog
    const { error, count } = await supabase
      .from("cert_catalog")
      .upsert(rows, { onConflict: "ms_cert_id", count: "exact" });

    if (error) throw error;

    // Build certification_paths from domain/role matching
    const { data: allRows } = await supabase.from("cert_catalog").select("id, roles, domain, level");
    if (allRows && allRows.length > 0) {
      const pathRows = [];
      for (const cert of allRows) {
        const related = allRows.filter(
          (c) =>
            c.id !== cert.id &&
            (c.roles?.some((r) => cert.roles?.includes(r)) || (c.domain && c.domain === cert.domain))
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
