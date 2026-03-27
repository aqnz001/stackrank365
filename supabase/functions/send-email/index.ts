import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function applyVariables(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replaceAll("{{" + k + "}}", v ?? ""), template
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { to, template_key, variables = {}, subject: subjectOverride, body: bodyOverride } = await req.json();
    if (!to) return new Response(JSON.stringify({ error: "to is required" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Load SMTP config from app_config table
    const { data: cfgRows } = await sb.from("app_config").select("key,value")
      .in("key", ["smtp_host","smtp_port","smtp_user","smtp_pass","smtp_from"]);
    const cfg: Record<string, string> = {};
    (cfgRows || []).forEach((r: any) => { cfg[r.key] = r.value; });

    if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
      return new Response(JSON.stringify({ error: "SMTP not configured. Set up in Admin > Email Config." }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Load template
    let subject = subjectOverride || "";
    let body    = bodyOverride    || "";

    if (template_key && !subjectOverride) {
      const { data: tpl } = await sb.from("email_templates").select("subject,body").eq("key", template_key).single();
      if (tpl) { subject = tpl.subject; body = tpl.body; }
    }

    // Apply variable substitution
    subject = applyVariables(subject, variables);
    body    = applyVariables(body, variables);

    // Send via SMTP
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: cfg.smtp_host,
      port: parseInt(cfg.smtp_port || "587"),
      username: cfg.smtp_user,
      password: cfg.smtp_pass,
    });

    await client.send({
      from:    cfg.smtp_from || cfg.smtp_user,
      to,
      subject,
      content: body,
    });
    await client.close();

    // Log to email_log table
    await sb.from("email_log").insert({ to, template_key, subject, status: "sent" }).catch(() => {});

    return new Response(JSON.stringify({ success: true, to, subject }),
      { headers: { ...CORS, "Content-Type": "application/json" } });

  } catch (e: any) {
    // Log failure
    try {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);
      await sb.from("email_log").insert({ to: "unknown", template_key: "unknown", status: "failed", error: String(e) });
    } catch {}
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
