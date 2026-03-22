// supabase/functions/fetch-linkedin-profile/index.ts
// Extracts basic professional info from a LinkedIn public URL.
// Uses OpenGraph/meta scraping since LinkedIn's API requires OAuth.
// Returns: name, headline, location, summary from the public profile page.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { handle } = await req.json();
    if (!handle) {
      return new Response(JSON.stringify({ error: "handle is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalise handle — strip full URL if passed, keep just the handle
    const cleanHandle = handle
      .replace(/https?:\/\//, "")
      .replace(/www\.linkedin\.com\/in\//, "")
      .replace(/linkedin\.com\/in\//, "")
      .replace(/\/$/, "")
      .trim();

    const profileUrl = `https://www.linkedin.com/in/${cleanHandle}`;

    // Fetch the public LinkedIn profile page
    const res = await fetch(profileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StackRank365/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({
        error: `LinkedIn profile not found or not public (HTTP ${res.status})`,
        handle: cleanHandle,
      }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const html = await res.text();

    // Extract from OpenGraph and meta tags — most reliable without API
    const extract = (pattern) => html.match(pattern)?.[1]?.trim() || null;

    const name     = extract(/property="og:title"\s+content="([^"]+)"/) ||
                     extract(/<title>([^|<]+)/) || null;
    const headline = extract(/property="og:description"\s+content="([^"]+)"/) || null;
    const image    = extract(/property="og:image"\s+content="([^"]+)"/) || null;

    // Clean name — LinkedIn og:title is usually "Name | LinkedIn"
    const cleanName = name?.split('|')[0]?.trim().split(' - ')[0]?.trim() || null;

    // Try to extract location from description text
    const locationMatch = html.match(/itemprop="addressLocality"[^>]*>([^<]+)</) ||
                          html.match(/"addressLocality":"([^"]+)"/);
    const location = locationMatch?.[1]?.trim() || null;

    // Extract professional title from headline
    const professional_title = headline
      ? headline.split(' at ')[0]?.trim().split(' | ')[0]?.trim()
      : null;

    return new Response(JSON.stringify({
      success: true,
      data: {
        name: cleanName,
        professional_title,
        headline,
        location,
        image,
        linkedin_url: profileUrl,
        handle: cleanHandle,
      }
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("fetch-linkedin-profile error:", err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});