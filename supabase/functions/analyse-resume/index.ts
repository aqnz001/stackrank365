// supabase/functions/analyse-resume/index.ts
// Generates a concise professional summary from a PDF CV.
// Optionally accepts a revise_note for regeneration with specific guidance.
// Returns: { summary: string }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { pdf_base64, revise_note } = await req.json();

    if (!pdf_base64) {
      return new Response(JSON.stringify({ error: "pdf_base64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the prompt — focus purely on generating a summary for the profile bio
    const systemPrompt = `You are a professional profile writer for a Microsoft technology community platform.
Your task: read the attached CV/resume and write a concise professional summary (2-4 sentences, maximum 80 words) 
that highlights the person's Microsoft technology expertise, key certifications, and project experience.

Rules:
- Write in third person (e.g. "Experienced Dynamics 365 architect with...")
- Focus only on Microsoft ecosystem: Dynamics 365, Power Platform, Azure, Copilot Studio, etc.
- Mention 1-2 standout certifications if present
- Mention the types of projects or industries if clear
- Do NOT include personal details (age, address, nationality)
- Do NOT write more than 80 words
- Output ONLY the summary text — no preamble, no labels, no quotes`;

    const userPrompt = revise_note
      ? `Please rewrite the summary with this guidance: "${revise_note}"`
      : `Please write a profile summary for this person based on their CV.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdf_base64 },
            },
            { type: "text", text: userPrompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      throw new Error("AI analysis failed — please try again");
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text?.trim() ?? "";

    if (!summary) throw new Error("No summary generated — please try again");

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("analyse-resume error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Unexpected error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
