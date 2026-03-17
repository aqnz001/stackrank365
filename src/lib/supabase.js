// ─── Supabase Configuration ───────────────────────────────────────────────────
// 1. Go to https://supabase.com → New Project → name: stackrank365
// 2. Settings → API → copy Project URL and anon/public key into the vars below
// 3. In Supabase: Authentication → Providers → Azure → enable, paste Client ID + Secret
//    (Azure app reg at portal.azure.com — redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback)

export const SUPABASE_URL = 'YOUR_SUPABASE_URL';       // e.g. https://abcxyz.supabase.co
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // long JWT string

import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
