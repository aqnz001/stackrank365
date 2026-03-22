// supabase/functions/send-validation-request/index.ts
// Sends a project peer validation email to a colleague.
// Called when a user adds a project with colleague details.
// The email contains a unique link for the colleague to approve or reject.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY  = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SITE_URL        = "https://www.stackrank365.com";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { validation_id } = await req.json();
    if (!validation_id) {
      return new Response(JSON.stringify({ error: "validation_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch validation + project + requester profile
    const { data: val, error: valErr } = await sb
      .from("project_validations")
      .select("*, projects(title, role, description), profiles!user_id(name, first_name)")
      .eq("id", validation_id)
      .single();

    if (valErr || !val) throw new Error("Validation not found");
    if (val.status !== "pending") throw new Error("Validation is not pending");

    const requesterName = val.profiles?.first_name || val.profiles?.name?.split(" ")[0] || "A StackRank365 member";
    const projectTitle  = val.projects?.title || "a project";
    const approveUrl    = `${SITE_URL}/?page=validate&token=${val.token}&action=approve`;
    const rejectUrl     = `${SITE_URL}/?page=validate&token=${val.token}&action=reject`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <div style="background:#1e3a5f;padding:28px 32px;">
      <div style="color:#00c2ff;font-weight:800;font-size:20px;letter-spacing:.02em;">StackRank365</div>
      <div style="color:#93c5fd;font-size:12px;margin-top:4px;">The Verified Microsoft Talent Network</div>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;">Project Validation Request</h2>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 12px;">
        Hi ${val.colleague_name?.split(" ")[0] || "there"},
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        <strong>${requesterName}</strong> has listed you as a colleague on their StackRank365 profile
        and is requesting that you validate their involvement in the following project:
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #00c2ff;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <div style="font-weight:700;color:#1e293b;font-size:15px;margin-bottom:6px;">${projectTitle}</div>
        <div style="color:#64748b;font-size:13px;">${requesterName}'s role: <strong>${val.projects?.role || val.relationship || "Team Member"}</strong></div>
        <div style="color:#64748b;font-size:13px;margin-top:2px;">Your relationship: <strong>${val.relationship || "Colleague"}</strong></div>
      </div>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Can you confirm that <strong>${requesterName}</strong> worked on this project in the role described?
        Your validation helps build verified professional credibility on StackRank365.
      </p>
      <div style="display:flex;gap:12px;margin:0 0 28px;">
        <a href="${approveUrl}" style="display:inline-block;padding:12px 28px;background:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">✓ Yes, I can confirm</a>
        <a href="${rejectUrl}" style="display:inline-block;padding:12px 28px;background:#f1f5f9;color:#64748b;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">✕ I cannot confirm</a>
      </div>
      <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">
        This request was sent by ${requesterName} via StackRank365. If you did not work with this person,
        simply ignore this email or click "I cannot confirm". You will not receive further emails about this request.
      </p>
    </div>
    <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <div style="color:#94a3b8;font-size:11px;">© 2026 StackRank365 · The Verified Microsoft Talent Network</div>
    </div>
  </div>
</body>
</html>`;

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "StackRank365 <noreply@stackrank365.com>",
        to: [val.colleague_email],
        subject: `${requesterName} would like you to validate their project on StackRank365`,
        html: emailHtml,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, sent_to: val.colleague_email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("send-validation-request error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
