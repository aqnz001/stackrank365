import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_HASH    = Deno.env.get("ADMIN_HASH")!;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // Verify admin hash — client sends SHA-256(adminPassword) as Bearer token
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!ADMIN_HASH || token !== ADMIN_HASH) {
    return json({ error: "Unauthorised" }, 401);
  }

  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { action, ...params } = await req.json();

    if (action === "list") {
      const { filter } = params as { filter?: string };
      let query = sb
        .from("disputes")
        .select("id,reason,status,score_at_dispute,created_at,admin_notes,user_id,profiles(username,name)")
        .order("created_at", { ascending: false });
      if (filter && filter !== "all") query = query.eq("status", filter);
      const { data, error } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }

    if (action === "update") {
      const { id, status, admin_notes } = params as { id: string; status: string; admin_notes: string };
      const { error } = await sb
        .from("disputes")
        .update({
          status,
          admin_notes,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e: any) {
    return json({ error: String(e) }, 500);
  }
});
