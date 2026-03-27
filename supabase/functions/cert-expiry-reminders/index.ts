// supabase/functions/cert-expiry-reminders/index.ts
// Sends certification expiry reminder emails via send-email edge function (SMTP).
// Config set via Admin > Email Config panel — no additional env vars needed.
//
// Schedule daily at 8am via Supabase cron:
//   select cron.schedule(
//     'cert-expiry-reminders',
//     '0 8 * * *',
//     $$select net.http_post(
//       url:='https://shnuwkjkjthvaovoywju.supabase.co/functions/v1/cert-expiry-reminders',
//       headers:='{"Authorization":"Bearer YOUR_SERVICE_ROLE_KEY","Content-Type":"application/json"}'::jsonb,
//       body:='{}'::jsonb
//     )$$
//   );

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "noreply@stackrank365.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail({ to, subject, certName, daysLeft }: { to: string; subject: string; certName: string; daysLeft: number }) {
  // Route through our SMTP send-email edge function so all emails use admin-configured SMTP
  const SB_BASE = Deno.env.get("SUPABASE_URL") ?? "";
  const res = await fetch(`${SB_BASE}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      template_key: "cert_expiry",
      variables: { name: to.split("@")[0], cert_name: certName },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
  }
  return res.ok;
}

function email90Day({ name, certName, expiryDate, renewUrl }: Record<string, string>) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <div style="background:#1e3a5f;border-radius:8px;padding:24px;margin-bottom:24px">
        <h1 style="color:#fff;font-size:20px;margin:0">StackRank365</h1>
      </div>
      <p style="color:#1a1a18">Hi ${name},</p>
      <p style="color:#1a1a18">Your <strong>${certName}</strong> certification expires in <strong>90 days</strong> on ${expiryDate}.</p>
      <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:4px;padding:16px;margin:20px 0">
        <p style="margin:0;color:#1e3a5f;font-size:14px">
          Renewing keeps your StackRank score at <strong>full weight (100%)</strong> and earns you <strong>500 bonus points</strong>.
        </p>
      </div>
      <p style="color:#1a1a18">Microsoft certification renewals are free via Microsoft Learn and take about 30 minutes.</p>
      <a href="${renewUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
        Renew your certification →
      </a>
      <p style="color:#73726c;font-size:13px;margin-top:32px">
        You're receiving this because you have a verified certification on StackRank365.<br>
        <a href="${renewUrl}" style="color:#2563eb">Manage notification preferences</a>
      </p>
    </div>
  `;
}

function email30Day({ name, certName, expiryDate, renewUrl }: Record<string, string>) {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <div style="background:#1e3a5f;border-radius:8px;padding:24px;margin-bottom:24px">
        <h1 style="color:#fff;font-size:20px;margin:0">StackRank365</h1>
      </div>
      <p style="color:#1a1a18">Hi ${name},</p>
      <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;padding:16px;margin:16px 0">
        <p style="margin:0;color:#991b1b;font-weight:600">
          ⚠️ Your ${certName} certification expires in 30 days on ${expiryDate}.
        </p>
      </div>
      <p style="color:#1a1a18">Renewing now keeps your StackRank score at full weight and earns you <strong>500 bonus points</strong>. After expiry, your certification score drops to 0% until renewed.</p>
      <a href="${renewUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
        Renew now — free via Microsoft Learn →
      </a>
      <p style="color:#73726c;font-size:13px;margin-top:32px">
        You're receiving this because you have a verified certification on StackRank365.<br>
        <a href="${renewUrl}" style="color:#2563eb">Manage notification preferences</a>
      </p>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const today = new Date();
    const in90 = new Date(today); in90.setDate(today.getDate() + 90);
    const in30 = new Date(today); in30.setDate(today.getDate() + 30);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const { data: exp90 } = await supabase
      .from("certifications")
      .select("id, profile_id, name, expiry_date, profiles(full_name, email)")
      .eq("expiry_date", fmt(in90))
      .is("reminder_90_sent_at", null)
      .eq("verification_status", "verified");

    const { data: exp30 } = await supabase
      .from("certifications")
      .select("id, profile_id, name, expiry_date, profiles(full_name, email)")
      .eq("expiry_date", fmt(in30))
      .is("reminder_30_sent_at", null)
      .eq("verification_status", "verified");

    const results = { sent_90: 0, sent_30: 0, errors: 0 };

    for (const cert of (exp90 ?? [])) {
      const p = cert.profiles as any;
      if (!p?.email) continue;
      const renewUrl = `https://www.stackrank365.com/profile?renew=${cert.id}`;
      const ok = await sendEmail({ to: p.email, subject: `Your ${cert.name} expires in 30 days`, certName: cert.name, daysLeft: 30 });
      if (ok) {
        await supabase.from("certifications").update({ reminder_30_sent_at: new Date().toISOString() }).eq("id", cert.id);
        await supabase.from("cert_reminder_log").insert({ profile_id: cert.profile_id, cert_id: cert.id, reminder_type: "30_day", email_address: p.email });
        results.sent_30++;
      } else results.errors++;
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("cert-expiry-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});