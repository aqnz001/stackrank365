// supabase/functions/cert-expiry-reminders/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EMAILJS_SERVICE_ID = Deno.env.get("EMAILJS_SERVICE_ID")!;
const EMAILJS_PUBLIC_KEY = Deno.env.get("EMAILJS_PUBLIC_KEY")!;
const EMAILJS_PRIVATE_KEY = Deno.env.get("EMAILJS_PRIVATE_KEY")!;
const TEMPLATE_90_DAY = "cert_expiry_90_day";
const TEMPLATE_30_DAY = "cert_expiry_30_day";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

async function sendEmail(to, templateId, params) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ service_id: EMAILJS_SERVICE_ID, template_id: templateId, user_id: EMAILJS_PUBLIC_KEY, accessToken: EMAILJS_PRIVATE_KEY, template_params: { to_email: to, ...params } }),
  });
  return res.ok;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const today = new Date();
    const in90 = new Date(today); in90.setDate(today.getDate() + 90);
    const in30 = new Date(today); in30.setDate(today.getDate() + 30);
    const fmt = (d) => d.toISOString().split("T")[0];

    const { data: exp90 } = await supabase.from("certifications")
      .select("id, profile_id, name, expiry_date, profiles(full_name, email)")
      .eq("expiry_date", fmt(in90)).is("reminder_90_sent_at", null).eq("verification_status", "verified");

    const { data: exp30 } = await supabase.from("certifications")
      .select("id, profile_id, name, expiry_date, profiles(full_name, email)")
      .eq("expiry_date", fmt(in30)).is("reminder_30_sent_at", null).eq("verification_status", "verified");

    const results = { sent_90: 0, sent_30: 0, errors: 0 };

    for (const cert of (exp90 ?? [])) {
      const p = cert.profiles;
      if (!p?.email) continue;
      const ok = await sendEmail(p.email, TEMPLATE_90_DAY, { to_name: p.full_name ?? "there", cert_name: cert.name, expiry_date: cert.expiry_date, renew_url: `https://www.stackrank365.com/profile?renew=${cert.id}`, bonus_points: "500" });
      if (ok) {
        await supabase.from("certifications").update({ reminder_90_sent_at: new Date().toISOString() }).eq("id", cert.id);
        await supabase.from("cert_reminder_log").insert({ profile_id: cert.profile_id, cert_id: cert.id, reminder_type: "90_day", email_address: p.email });
        results.sent_90++;
      } else { results.errors++; }
    }

    for (const cert of (exp30 ?? [])) {
      const p = cert.profiles;
      if (!p?.email) continue;
      const ok = await sendEmail(p.email, TEMPLATE_30_DAY, { to_name: p.full_name ?? "there", cert_name: cert.name, expiry_date: cert.expiry_date, renew_url: `https://www.stackrank365.com/profile?renew=${cert.id}`, bonus_points: "500", days_remaining: "30" });
      if (ok) {
        await supabase.from("certifications").update({ reminder_30_sent_at: new Date().toISOString() }).eq("id", cert.id);
        await supabase.from("cert_reminder_log").insert({ profile_id: cert.profile_id, cert_id: cert.id, reminder_type: "30_day", email_address: p.email });
        results.sent_30++;
      } else { results.errors++; }
    }

    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("cert-expiry-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});