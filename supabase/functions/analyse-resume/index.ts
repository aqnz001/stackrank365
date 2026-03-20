import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { pdf_base64, profile_id } = await req.json();
    if (!pdf_base64) return new Response(JSON.stringify({ error: "pdf_base64 required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 2000,
        messages: [{ role: "user", content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf_base64 } },
          { type: "text", text: `Analyse this resume and extract Microsoft-related professional information. Return ONLY valid JSON with this structure, no preamble:\n{\n  "name": "string",\n  "professional_title": "string",\n  "summary": "2-3 sentence summary",\n  "region": "string or null",\n  "years_experience": number or null,\n  "specializations": ["array"],\n  "certifications": [{ "name": "string", "year": number or null, "ms_cert_id": "string or null" }],\n  "projects": [{ "title": "string", "technology": "string", "year": number or null, "description": "string" }],\n  "skills": ["array"],\n  "mvp": boolean,\n  "mct": boolean,\n  "confidence": number 0-100\n}\nFocus only on Microsoft ecosystem (Dynamics 365, Power Platform, Azure, M365, Copilot). Use null or [] for missing fields.` }
        ]}]
      })
    });
    if (!claudeRes.ok) throw new Error("Claude API " + claudeRes.status);
    const claudeData = await claudeRes.json();
    const raw = claudeData.content?.[0]?.text ?? "";
    let extracted = {};
    try { extracted = JSON.parse(raw.replace(/```json\n?|```\n?/g, "").trim()); } catch(e) { throw new Error("Could not parse Claude response as JSON"); }

    if (profile_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      await supabase.from("resume_analyses").upsert({ profile_id, extracted_data: extracted, analysed_at: new Date().toISOString(), confidence: extracted.confidence ?? 0 }, { onConflict: "profile_id" });
    }
    return new Response(JSON.stringify({ success: true, data: extracted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch(err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});