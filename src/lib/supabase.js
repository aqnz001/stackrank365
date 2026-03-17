// ─── Supabase Configuration ───────────────────────────────────────────────────
// 1. Go to https://supabase.com → New Project → name: stackrank365
// 2. Settings → API → copy Project URL and anon/public key into the vars below
// 3. In Supabase: Authentication → Providers → Azure → enable, paste Client ID + Secret
//    (Azure app reg at portal.azure.com — redirect URI: https://YOUR_PROJECT.supabase.co/auth/v1/callback)

export const SUPABASE_URL = 'https://shnuwkjkjthvaovoywju.supabase.co';       // e.g. https://abcxyz.supabase.co
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4'; // long JWT string

import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
