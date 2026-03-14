// Supabase Edge Function: verify-cert
// Runs server-side — no CORS issues, no proxy needed.
// Deploy with: npx supabase functions deploy verify-cert

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { url, type } = await req.json();
    if (!url || !type) return new Response(JSON.stringify({ error: 'Missing url or type' }), { status: 400, headers: CORS });

    if (type === 'credly') {
      // Extract slug from any credly badge URL format
      const match = url.match(/credly\.com\/badges\/([\w-]+)/i);
      if (!match) return new Response(JSON.stringify({ error: 'Invalid Credly URL' }), { headers: CORS });
      const slug = match[1].replace(/\/.*$/, '');

      const res = await fetch(`https://www.credly.com/badges/${slug}/embedded`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StackRank365/1.0)' },
      });
      const html = await res.text();

      // Parse og:title: "Badge Name was issued by Issuer to Person."
      const ogTitle = html.match(/og:title[^>]*content="([^"]+)"/i)?.[1] ||
                      html.match(/content="([^"]+)"[^>]*og:title/i)?.[1] || '';

      return new Response(JSON.stringify({ ogTitle, html: html.substring(0, 2000) }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    if (type === 'ms_learn') {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StackRank365/1.0)' },
      });
      const html = await res.text();
      // Return enough HTML for cert code parsing
      return new Response(JSON.stringify({ html: html.substring(0, 50000) }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown type' }), { headers: CORS });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS });
  }
});
