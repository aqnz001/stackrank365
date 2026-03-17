import { CERTIFICATIONS } from '../data/data.js';

// ─── Fetch via Supabase Edge Function (server-side, no CORS limits) ──────────
// Falls back to allorigins if Edge Function not deployed yet
async function fetchForVerification(targetUrl, type) {
  // Try Supabase Edge Function first
  try {
    const mod = await import('./supabase.js');
    if (mod.SUPABASE_URL && mod.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
      const fnUrl = `${mod.SUPABASE_URL}/functions/v1/verify-cert`;
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mod.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url: targetUrl, type }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        if (!data.error) return data; // { ogTitle, html }
      }
    }
  } catch {}

  // Fallback: allorigins proxy
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`${res.status}`);
    const json = await res.json();
    const html = json.contents || '';
    // Simulate same shape as edge function response
    const ogTitle = html.match(/og:title[^>]*content="([^"]+)"/i)?.[1] ||
                    html.match(/content="([^"]+)"[^>]*og:title/i)?.[1] || '';
    return { html, ogTitle };
  } catch (e) {
    throw new Error(`All fetch methods failed: ${e.message}`);
  }
}

// ─── Credly badge verification ────────────────────────────────────────────────
export async function verifyCredlyBadge(badgeUrl) {
  const url = badgeUrl.trim();
  const match = url.match(/credly\.com\/badges\/([\w-]+)/i);
  if (!match) {
    return { success: false, error: 'Invalid Credly URL. Should look like: https://www.credly.com/badges/abc-123-def' };
  }

  const slug = match[1].replace(/\/.*$/, '');
  const embeddedUrl = `https://www.credly.com/badges/${slug}/embedded`;

  try {
    const { ogTitle, html } = await fetchForVerification(embeddedUrl, 'credly');

    if (!ogTitle && (!html || html.length < 500)) {
      return { success: false, error: 'Could not read badge data. Make sure the badge is set to Public on Credly.' };
    }

    // og:title = "Badge Name was issued by Issuer to Person."
    const title = ogTitle || '';
    const issuerMatch = title.match(/issued by ([^.]+?) to /i);
    const issuer = issuerMatch?.[1]?.trim() || '';
    const badgeName = title.replace(/ was issued by .*/i, '').trim();

    if (!issuer.toLowerCase().includes('microsoft')) {
      return {
        success: false,
        error: `Badge issued by "${issuer || 'unknown'}", not Microsoft. Only Microsoft-issued badges earn Stack Points.`
      };
    }

    const nameLower = badgeName.toLowerCase();
    const found = CERTIFICATIONS.find(cert => {
      if (nameLower.includes(cert.code.toLowerCase())) return true;
      const certWords = cert.name.toLowerCase()
        .replace(/\b(microsoft|dynamics|power|azure|copilot|dataverse|platform)\b/gi, '')
        .split(/[\s:\-]+/).filter(w => w.length > 4);
      return certWords.filter(w => nameLower.includes(w)).length >= 2;
    });

    if (!found) {
      return {
        success: false,
        error: `Microsoft badge found ("${badgeName}") but it doesn't match a certification in our list. Only exam-based certifications (PL-400, AZ-900, etc.) earn Stack Points — not achievement or partner badges.`
      };
    }

    return { success: true, certs: [found], source: 'credly', url, badgeName };

  } catch (e) {
    if (e.message?.includes('timed out') || e.message?.includes('timeout')) {
      return { success: false, error: 'Request timed out. Please try again in a moment.' };
    }
    return { success: false, error: 'Could not reach Credly. Check the URL is correct and the badge is Public.' };
  }
}

// ─── Microsoft Learn transcript verification ──────────────────────────────────
export async function verifyMSLearnTranscript(transcriptUrl) {
  const url = transcriptUrl.trim();

  if (!url.includes('learn.microsoft.com')) {
    return { success: false, error: 'Must be a Microsoft Learn URL (learn.microsoft.com)' };
  }

  // Reject profile tab URLs — they never have cert data
  if (url.includes('/users/') && url.includes('?tab=')) {
    return {
      success: false,
      error: 'This is your profile URL, not your share link.\n\nTo get the share link: Microsoft Learn → your profile → Transcript tab → Share button → set to Public → copy the link (starts with learn.microsoft.com/api/credentials/share/...)'
    };
  }

  if (!url.includes('/share/') && !url.includes('/transcript/')) {
    return {
      success: false,
      error: 'URL must be a transcript share link. Go to Microsoft Learn → Transcript → Share → set to Public → copy the link.'
    };
  }

  try {
    const { html } = await fetchForVerification(url, 'ms_learn');

    if (!html || html.length < 500) {
      return {
        success: false,
        error: 'Transcript returned no content. Make sure your transcript is set to Public before sharing.'
      };
    }

    // Look for exam codes: PL-400, AZ-900, MB-210, etc.
    const rawCodes = html.match(/\b[A-Z]{2,3}-\d{3}\b/g) || [];
    const foundCodes = [...new Set(rawCodes)];

    const found = [];
    for (const cert of CERTIFICATIONS) {
      if (foundCodes.includes(cert.code)) { found.push(cert); continue; }
      const flex = cert.code.replace('-', '[\\s\\-]?');
      if (new RegExp(`\\b${flex}\\b`, 'i').test(html)) found.push(cert);
    }

    if (found.length === 0) {
      const hasContent = html.toLowerCase().includes('microsoft') || html.toLowerCase().includes('credential');
      return {
        success: false,
        error: hasContent
          ? 'Transcript loaded but no matching certifications found. Your transcript may be empty or the certs may not be in our database yet.'
          : 'Could not read transcript content. Make sure the share link is correct and transcript is set to Public.'
      };
    }

    return { success: true, certs: found, source: 'ms_learn', url };

  } catch (e) {
    if (e.message?.includes('timed out') || e.message?.includes('timeout')) {
      return { success: false, error: 'Microsoft Learn took too long to respond. Please try again.' };
    }
    return { success: false, error: 'Could not reach Microsoft Learn. Check the URL is correct and try again.' };
  }
}
