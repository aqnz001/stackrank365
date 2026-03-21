// supabaseClient.js — re-export shim
// Several components import from '../lib/supabaseClient'.
// The actual client lives in '../lib/supabase'.
// This file re-exports everything so both import paths work.
export { supabase } from './supabase';
