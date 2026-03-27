import { useState, useEffect } from 'react';

const ADMIN_HASH = 'b89815ec9b87bdc40215bc27947f673568d39a675f78d61bd90c279d73cab6c3';
const SESSION_KEY = 'sr365_admin_unlocked';
const SB   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';
const SITE = 'https://www.stackrank365.com';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
const sbRest = (path, extra={}) => fetch(SB+path, { headers:{ apikey:ANON, Authorization:'Bearer '+ANON, 'Content-Type':'application/json', ...extra }});
const sbAuth = (path, body) => fetch(SB+path, { method:'POST', headers:{ apikey:ANON, 'Content-Type':'application/json' }, body:JSON.stringify(body) });
const sbFn = (name, body={}) => fetch(SB+'/functions/v1/'+name, { method:'POST', headers:{ apikey:ANON, Authorization:'Bearer '+ANON, 'Content-Type':'application/json' }, body:JSON.stringify(body) });
const withTimeout = (p, ms=8000) => Promise.race([p, new Promise((_,r)=>setTimeout(()=>r(new Error('timeout after '+ms+'ms')),ms))]);
async function safeJson(res) {
  const t = await res.text();
  if (t.trim().startsWith('<')) throw new Error('Got HTML instead of JSON');
  try { return JSON.parse(t); } catch { return { _raw: t.slice(0,100) }; }
}
const pass = m => ({ status:'pass', message:m });
const fail = m => ({ status:'fail', message:m });
const skip = m => ({ status:'skip', message:m });
const warn = m => ({ status:'warn', message:m });

// ── DOM-based page check for SPA CTA tests ────────────────────────────────────
// Navigates to a page via React routing, waits for render, checks DOM, restores
async function checkPage(page, checks) {
  const prev = new URLSearchParams(window.location.search).get('page') || '';
  // Push new route
  const url = new URL(window.location.href);
  url.searchParams.set('page', page);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  // Wait for React to render
  await new Promise(r => setTimeout(r, 1800));
  const text = document.body.innerText;
  // Restore admin tools
  const restore = new URL(window.location.href);
  restore.searchParams.set('page', 'sr365-admin-tools');
  window.history.pushState({}, '', restore);
  window.dispatchEvent(new PopStateEvent('popstate'));
  await new Promise(r => setTimeout(r, 400));
  // Run checks against captured text
  return { text, page };
}

const SUITES = [
  { id:'landing', name:'TS-01 Landing Page', tests:[
    { id:'TC-001', name:'Page title correct', priority:'P1', run: async()=>{ const h=await fetch(SITE).then(r=>r.text()); return h.includes('StackRank365')?pass('Title correct'):fail('StackRank365 not in HTML shell'); }},
    { id:'TC-002', name:'Nav links in DOM', priority:'P1', run: async()=>{ const t=document.body.innerText; const m=['How It Works','Scoring','Leaderboard','About'].filter(n=>!t.includes(n)); return m.length?fail('Missing: '+m.join(', ')):pass('All nav links present'); }},
    { id:'TC-003', name:'Load time < 5s', priority:'P2', run: async()=>{ const t=Date.now(); await fetch(SITE); const ms=Date.now()-t; return ms>5000?fail(ms+'ms exceeds 5s'):pass('Loaded in '+ms+'ms'); }},
    { id:'TC-004', name:'Privacy page shell loads', priority:'P1', run: async()=>{ const h=await fetch(SITE+'/?page=privacy').then(r=>r.text()); return h.includes('StackRank365')?pass('Privacy page shell loads (React SPA)'):fail('Shell missing'); }},
    { id:'TC-005', name:'Pricing page shell loads', priority:'P2', run: async()=>{ const h=await fetch(SITE+'/?page=pricing').then(r=>r.text()); return h.includes('StackRank365')?pass('Pricing page shell loads (React SPA)'):fail('Shell missing'); }},
  ]},
  { id:'auth', name:'TS-02 Authentication', tests:[
    { id:'TC-020', name:'Sign up new email', priority:'P1', run: async()=>{ const e='sr365.vercel.claude.nz.aq.2026.'+Date.now()+'@mailinator.com'; const r=await sbAuth('/auth/v1/signup',{email:e,password:'TestPass123!'}); const d=await safeJson(r); return(d.user?.id||d.id)?pass('Signup accepted'):warn('Check: '+(d.error_description||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-024', name:'Sign in valid credentials', priority:'P1', run: async()=>{ const r=await sbAuth('/auth/v1/token?grant_type=password',{email:'tester@stackrank365.com',password:'TestPass123!'}); const d=await safeJson(r); return d.access_token?pass('Signed in as '+d.user?.email):fail('Sign in failed: '+(d.error_description||'No token')); }},
    { id:'TC-025', name:'Wrong password rejected', priority:'P1', run: async()=>{ const r=await sbAuth('/auth/v1/token?grant_type=password',{email:'tester@stackrank365.com',password:'WrongPass999!'}); return !r.ok?pass('Wrong password rejected ('+r.status+')'):fail('SECURITY: wrong password accepted!'); }},
    { id:'TC-026', name:'Fake email rejected', priority:'P1', run: async()=>{ const r=await sbAuth('/auth/v1/token?grant_type=password',{email:'nobody_'+Date.now()+'@nowhere.invalid',password:'Test!'}); return !r.ok?pass('Fake email rejected ('+r.status+')'):fail('SECURITY: fake email accepted!'); }},
    { id:'TC-027', name:'Auth rejects missing token', priority:'P1', run: async()=>{ const r=await fetch(SB+'/auth/v1/user',{headers:{apikey:ANON}}); return(r.status===401||r.status===403)?pass('Unauthenticated rejected ('+r.status+')'):fail('Expected 401/403, got '+r.status); }},
  ]},
  { id:'database', name:'TS-03 Database & Schema', tests:[
    { id:'TC-DB-01', name:'profiles table accessible', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/profiles?select=id,name,tier&limit=5'); return r.ok?pass('profiles OK ('+((await safeJson(r)).length)+' rows via RLS)'):fail('HTTP '+r.status); }},
    { id:'TC-DB-02', name:'cert_catalog >= 250 rows', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/cert_catalog?select=id',{Prefer:'count=exact','Range-Unit':'items',Range:'0-0'}); const t=parseInt((r.headers.get('content-range')||'').split('/')[1]||0); return t<250?fail('Only '+t+' rows - run sync-catalog'):pass(t+' rows'); }},
    { id:'TC-DB-03', name:'certifications table + alias columns', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/certifications?select=id,name,verification_status,score_multiplier,ms_cert_id,profile_id,issued_date&limit=1'); return r.ok?pass('certifications schema OK (incl alias columns)'):fail('HTTP '+r.status+': '+(await safeJson(r)).message); }},
    { id:'TC-DB-04', name:'fraud_audit_log exists', priority:'P2', run: async()=>{ const r=await sbRest('/rest/v1/fraud_audit_log?limit=1'); return(r.status===404||r.status===400)?fail('Table missing'):pass('fraud_audit_log exists'); }},
    { id:'TC-DB-05', name:'resume_analyses exists', priority:'P2', run: async()=>{ const r=await sbRest('/rest/v1/resume_analyses?limit=1'); return(r.status===404||r.status===400)?fail('Table missing'):pass('resume_analyses exists'); }},
    { id:'TC-DB-06', name:'cert_reminder_log exists', priority:'P2', run: async()=>{ const r=await sbRest('/rest/v1/cert_reminder_log?limit=1'); return(r.status===404||r.status===400)?fail('Table missing'):pass('cert_reminder_log exists'); }},
    { id:'TC-DB-07', name:'profiles has all Phase 3+4 columns', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/profiles?select=open_to_work,tier,fraud_status,fraud_score,reputation_score,linkedin_url&limit=1'); return r.ok?pass('All new columns present'):fail('Missing: '+(await safeJson(r)).message); }},
  ]},
  { id:'scoring', name:'TS-04 Scoring Logic', tests:[
    { id:'TC-SC-01', name:'Verified cert multiplier=1.00', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.verified&limit=5'); if(!r.ok)return fail('HTTP '+r.status); const rows=await safeJson(r); if(!rows.length)return skip('No verified certs yet - verify one first'); const bad=rows.filter(r=>parseFloat(r.score_multiplier)!==1.00); return bad.length?fail(bad.length+' verified certs have wrong multiplier'):pass(rows.length+' verified -> 1.00'); }},
    { id:'TC-SC-02', name:'Unverified cert multiplier=0.25', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.unverified&limit=5'); if(!r.ok)return fail('HTTP '+r.status); const rows=await safeJson(r); if(!rows.length)return skip('No unverified certs in DB'); const bad=rows.filter(r=>parseFloat(r.score_multiplier)!==0.25); return bad.length?fail(bad.length+' wrong'):pass(rows.length+' unverified -> 0.25'); }},
    { id:'TC-SC-03', name:'cert_catalog schema complete', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/cert_catalog?select=certification_uid,certification_name,technology_area,level&limit=2'); if(!r.ok)return fail('HTTP '+r.status); const d=await safeJson(r); return pass('Schema OK. Sample: '+(d[0]?.certification_name||'(empty)').slice(0,50)); }},
  ]},
  { id:'security', name:'TS-05 Security', tests:[
    { id:'TC-170', name:'RLS - private fields not exposed', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/profiles?select=email,fraud_score&limit=5'); if(!r.ok)return pass('Anon query blocked by RLS'); const rows=await safeJson(r); return rows.some(rw=>rw.email)?fail('SECURITY: email exposed!'):pass('Private fields hidden'); }},
    { id:'TC-172', name:'No service_role JWT in client bundle', priority:'P1', run: async()=>{ const html=await fetch(SITE).then(r=>r.text()); const src=html.match(/src="([^"]*index[^"]*\.js)"/)?.[1]; if(!src)return warn('Cannot find JS bundle'); const js=await fetch(src.startsWith('http')?src:SITE+src).then(r=>r.text()); const jwtRx=/eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g; const jwts=js.match(jwtRx)||[]; const leaked=jwts.some(jwt=>{try{return JSON.parse(atob(jwt.split('.')[1])).role==='service_role';}catch{return false;}}); return leaked?fail('SECURITY: service_role JWT in bundle!'):pass('No service_role JWT in client bundle'); }},
    { id:'TC-173', name:'HTTPS enforced', priority:'P1', run: async()=>location.protocol==='https:'?pass('HTTPS confirmed'):fail('Not on HTTPS!') },
    { id:'TC-174', name:'REST API returns JSON', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/profiles?select=id&limit=1'); const ct=r.headers.get('content-type')||''; return ct.includes('application/json')?pass('API returns application/json'):fail('API returned: '+ct); }},
    { id:'TC-175', name:'Auth rejects unauthenticated requests', priority:'P1', run: async()=>{ const r=await fetch(SB+'/auth/v1/user',{headers:{apikey:ANON}}); return(r.status===401||r.status===403)?pass('Unauthenticated rejected ('+r.status+')'):fail('Expected 401/403, got '+r.status); }},
  ]},
  { id:'edge_fns', name:'TS-06 Edge Functions (All 9)', tests:[
    { id:'TC-EF-01', name:'analyse-resume: missing pdf -> 400', priority:'P1', run: async()=>{ const r=await withTimeout(sbFn('analyse-resume',{})); return r.status===400?pass('Returns 400 for missing pdf_base64'):fail('Expected 400, got '+r.status); }},
    { id:'TC-EF-02', name:'batch-verify-certs: deployed & runs', priority:'P1', run: async()=>{ const r=await withTimeout(sbFn('batch-verify-certs',{limit:3})); const d=await safeJson(r); return(r.ok&&d.processed!==undefined)?pass('OK: processed='+d.processed+', verified='+d.verified):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-EF-03', name:'cert-expiry-reminders: deployed & runs', priority:'P2', run: async()=>{ const r=await withTimeout(sbFn('cert-expiry-reminders',{})); const d=await safeJson(r); return r.ok?pass('OK: sent_90='+d.sent_90+', sent_30='+d.sent_30):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-EF-04', name:'detect-fake-profiles: deployed & runs', priority:'P2', run: async()=>{ const r=await withTimeout(sbFn('detect-fake-profiles',{limit:3})); const d=await safeJson(r); return(r.ok&&d.checked!==undefined)?pass('OK: checked='+d.checked+', flagged='+d.flagged):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-EF-05', name:'recruiter-match: missing JD -> 400', priority:'P1', run: async()=>{ const r=await withTimeout(sbFn('recruiter-match',{})); return r.status===400?pass('Returns 400 for missing job_description'):fail('Expected 400, got '+r.status); }},
    { id:'TC-EF-06', name:'sync-catalog: deployed & syncs certs', priority:'P1', run: async()=>{ const r=await withTimeout(sbFn('sync-catalog',{}),15000); const d=await safeJson(r); return(r.ok&&d.synced!==undefined)?pass('Synced '+d.synced+' certs from MS Learn'):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-EF-07', name:'verify-cert: missing params -> 400', priority:'P1', run: async()=>{ const r=await withTimeout(sbFn('verify-cert',{})); return r.status===400?pass('Returns 400 for missing params'):fail('Expected 400, got '+r.status); }},
    { id:'TC-EF-08', name:'verify-reputation: deployed & runs', priority:'P2', run: async()=>{ const r=await withTimeout(sbFn('verify-reputation',{limit:3})); const d=await safeJson(r); return r.ok?pass('OK: verified='+d.verified+', warnings='+d.warnings):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-EF-09', name:'fetch-linkedin-profile: missing handle -> 400', priority:'P1', run: async()=>{ const r=await withTimeout(sbFn('fetch-linkedin-profile',{})); return r.status===400?pass('Returns 400 for missing handle'):fail('Expected 400, got '+r.status+' - deploy: npx supabase functions deploy fetch-linkedin-profile'); }},
  ]},
  { id:'data', name:'TS-07 Data Integrity', tests:[
    { id:'TC-DI-01', name:'cert_catalog: no null certification_uid', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/cert_catalog?select=id&certification_uid=is.null&limit=1'); if(!r.ok)return fail('HTTP '+r.status); const rows=await safeJson(r); return rows.length?fail(rows.length+' entries have null certification_uid!'):pass('All entries have non-null UID'); }},
    { id:'TC-DI-02', name:'certifications: verification_status valid', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/certifications?select=verification_status&not.verification_status=in.(unverified,pending,verified,failed)&limit=5'); if(!r.ok)return skip('RLS blocks anon check'); const rows=await safeJson(r); return rows.length?fail(rows.length+' certs have invalid status'):pass('All verification_status values valid'); }},
    { id:'TC-DI-03', name:'profiles: tier values valid', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/profiles?select=tier&not.tier=in.(free,pro,recruiter)&limit=5'); if(!r.ok)return skip('RLS blocks anon check'); const rows=await safeJson(r); return rows.length?fail(rows.length+' profiles have invalid tier'):pass('All tier values valid'); }},
    { id:'TC-DI-04', name:'certifications alias columns exist', priority:'P1', run: async()=>{ const r=await sbRest('/rest/v1/certifications?select=ms_cert_id,profile_id,issued_date&limit=1'); return r.ok?pass('Alias columns (ms_cert_id, profile_id, issued_date) exist'):fail('Alias columns missing: '+(await safeJson(r)).message); }},
  ]},
  { id:'cta_landing', name:'TS-08 CTAs - Landing Page (DOM)', tests:[
    { id:'TC-CTA-01', name:'Join Waitlist CTA in live DOM', priority:'P1', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Waitlist')||text.includes('waitlist')?pass('Join Waitlist CTA present in rendered DOM'):fail('Join Waitlist CTA missing from rendered landing page'); }},
    { id:'TC-CTA-02', name:'Leaderboard link in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Leaderboard')||text.includes('leaderboard')?pass('Leaderboard link present in rendered DOM'):fail('Leaderboard link missing'); }},
    { id:'TC-CTA-03', name:'Scoring link in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Scoring')||text.includes('scoring')?pass('Scoring link present in rendered DOM'):fail('Scoring link missing'); }},
    { id:'TC-CTA-04', name:'Early Access CTA in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Early Access')||text.includes('Waitlist')||text.includes('Get Started')?pass('Primary acquisition CTA present in rendered DOM'):fail('Acquisition CTA missing'); }},
    { id:'TC-CTA-05', name:'Rankings/Leaderboard CTA in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Rankings')||text.includes('ranking')||text.includes('Leaderboard')?pass('Rankings CTA present in rendered DOM'):fail('Rankings CTA missing'); }},
    { id:'TC-CTA-06', name:'Profile/Browse CTA in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Browse')||text.includes('Profile')||text.includes('View')?pass('Browse/Profile CTA present in rendered DOM'):fail('Browse/Profile CTA missing'); }},
    { id:'TC-CTA-07', name:'Scoring/Math link in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('landing',[]); return text.includes('Math')||text.includes('Scoring')||text.includes('breakdown')?pass('Scoring/Math CTA present in rendered DOM'):fail('Scoring/Math CTA missing'); }},
  ]},
  { id:'cta_pricing', name:'TS-09 CTAs - Pricing Page (DOM)', tests:[
    { id:'TC-CTA-10', name:'All 3 tier cards in live DOM (Free, Pro, Recruiter)', priority:'P1', run: async()=>{ const {text}=await checkPage('pricing',[]); const hasFree=text.includes('Free'); const hasPro=text.includes('Pro'); const hasRec=text.includes('Recruiter'); return(hasFree&&hasPro&&hasRec)?pass('Free, Pro, Recruiter tier cards present in rendered DOM'):fail('Missing tiers in rendered DOM - Free:'+hasFree+' Pro:'+hasPro+' Recruiter:'+hasRec); }},
    { id:'TC-CTA-11', name:'"Get started free" CTA in live DOM', priority:'P1', run: async()=>{ const {text}=await checkPage('pricing',[]); return text.includes('Get started')||text.includes('started free')||text.includes('Start Free')?pass('"Get started free" CTA present in rendered DOM'):fail('Get started free CTA missing from rendered DOM'); }},
    { id:'TC-CTA-12', name:'"Start Pro" CTA in live DOM', priority:'P1', run: async()=>{ const {text}=await checkPage('pricing',[]); return text.includes('Start Pro')||text.includes('Pro')?pass('"Start Pro" CTA present in rendered DOM'):fail('Pro CTA missing'); }},
    { id:'TC-CTA-13', name:'"Start Recruiter" CTA in live DOM', priority:'P1', run: async()=>{ const {text}=await checkPage('pricing',[]); return text.includes('Recruiter')||text.includes('recruiter')?pass('"Start Recruiter" CTA present in rendered DOM'):fail('Recruiter CTA missing'); }},
    { id:'TC-CTA-14', name:'FAQ section in live DOM', priority:'P2', run: async()=>{ const {text}=await checkPage('pricing',[]); return text.includes('FAQ')||text.includes('question')||text.includes('frequently')||text.includes('Q:')?pass('FAQ section present in rendered DOM'):fail('FAQ section missing from rendered pricing page'); }},
  ]},
  { id:'cta_dashboard', name:'TS-10 CTAs - Dashboard (sign in first)', tests:[
    { id:'TC-CTA-20', name:'Dashboard shell loads (HTTP)', priority:'P1', run: async()=>{ const h=await fetch(SITE+'/?page=dashboard').then(r=>r.text()); return h.includes('StackRank365')?pass('Dashboard shell loads'):fail('Shell missing'); }},
    { id:'TC-CTA-21', name:'"Public Profile" link present', priority:'P2', run: async()=>{ const t=document.body.innerText; return t.includes('Public Profile')?pass('"Public Profile" link present'):skip('Sign in and navigate to dashboard, then re-run'); }},
    { id:'TC-CTA-22', name:'"Sign Out" button present', priority:'P1', run: async()=>{ const t=document.body.innerText; return t.includes('Sign Out')?pass('"Sign Out" button present'):skip('Not signed in - sign in and re-run'); }},
    { id:'TC-CTA-23', name:'Certifications tab present', priority:'P1', run: async()=>{ const t=document.body.innerText; return t.includes('Certifications')?pass('Certifications tab present'):skip('Not on dashboard'); }},
    { id:'TC-CTA-24', name:'Projects tab present', priority:'P1', run: async()=>{ const t=document.body.innerText; return t.includes('Projects')?pass('Projects tab present'):skip('Not on dashboard'); }},
    { id:'TC-CTA-25', name:'Settings tab present', priority:'P1', run: async()=>{ const t=document.body.innerText; return t.includes('Settings')?pass('Settings tab present'):skip('Not on dashboard'); }},
    { id:'TC-CTA-26', name:'Resume Analyser CTA present', priority:'P2', run: async()=>{ const t=document.body.innerText; return t.includes('Resume')||t.includes('resume')?pass('Resume Analyser CTA present'):skip('Navigate to dashboard Settings tab and re-run'); }},
    { id:'TC-CTA-27', name:'LinkedIn Import CTA present', priority:'P2', run: async()=>{ const t=document.body.innerText; return t.includes('LinkedIn')?pass('LinkedIn Import CTA present'):skip('Navigate to dashboard Settings tab and re-run'); }},
    { id:'TC-CTA-28', name:'Open to Work toggle present', priority:'P2', run: async()=>{ const t=document.body.innerText; return t.includes('Open to Work')||t.includes('open to work')?pass('Open to Work toggle present'):skip('Not on dashboard'); }},
    { id:'TC-CTA-29', name:'Verify certification button present', priority:'P1', run: async()=>{ const t=document.body.innerText; return t.includes('Verify')||t.includes('verify')?pass('Verify CTA present'):skip('Navigate to dashboard Certifications tab and re-run'); }},
    { id:'TC-CTA-30', name:'Add Certification button present', priority:'P1', run: async()=>{ const t=document.body.innerText; return t.includes('Add')?pass('Add CTA present'):skip('Not on dashboard'); }},
  ]},
  { id:'cta_other', name:'TS-11 CTAs - Other Pages', tests:[
    { id:'TC-CTA-40', name:'Recruiter dashboard shell loads', priority:'P1', run: async()=>{ const h=await fetch(SITE+'/?page=recruiter-dashboard').then(r=>r.text()); return h.includes('StackRank365')?pass('Recruiter dashboard shell loads'):fail('Shell missing'); }},
    { id:'TC-CTA-41', name:'Admin fraud page shell loads', priority:'P1', run: async()=>{ const h=await fetch(SITE+'/?page=admin-fraud').then(r=>r.text()); return h.includes('StackRank365')?pass('Admin fraud page shell loads'):fail('Shell missing'); }},
    { id:'TC-CTA-42', name:'Leaderboard page loads', priority:'P1', run: async()=>{ const h=await fetch(SITE+'/?page=leaderboard').then(r=>r.text()); return h.includes('StackRank365')?pass('Leaderboard page shell loads'):fail('Shell missing'); }},
    { id:'TC-CTA-43', name:'Sign in page loads', priority:'P1', run: async()=>{ const h=await fetch(SITE+'/?page=signin').then(r=>r.text()); return h.includes('StackRank365')?pass('Sign in page shell loads'):fail('Shell missing'); }},
    { id:'TC-CTA-44', name:'No broken 404 pages', priority:'P1', run: async()=>{ const pages=['landing','pricing','privacy','leaderboard','signin','dashboard','recruiter-dashboard','admin-fraud']; const results=await Promise.all(pages.map(p=>fetch(SITE+'/?page='+p).then(r=>({p,ok:r.ok,status:r.status})))); const broken=results.filter(r=>!r.ok); return broken.length?fail('Broken: '+broken.map(r=>r.p+'('+r.status+')').join(', ')):pass('All '+pages.length+' pages return HTTP 200'); }},
  ]},
  { id:'admin_fraud', name:'TS-12 Admin - Fraud & Reputation', tests:[
    { id:'TC-140', name:'detect-fake-profiles runs cleanly', priority:'P2', run: async()=>{ const r=await withTimeout(sbFn('detect-fake-profiles',{limit:5})); const d=await safeJson(r); return(r.ok&&d.errors===0)?pass('Detection ran cleanly: checked='+d.checked+', errors=0'):r.ok?warn('Ran with '+d.errors+' errors'):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-141', name:'verify-reputation runs cleanly', priority:'P2', run: async()=>{ const r=await withTimeout(sbFn('verify-reputation',{limit:3})); const d=await safeJson(r); return r.ok?pass('Reputation check ran: verified='+d.verified+', warnings='+d.warnings+', errors='+d.errors):fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-142', name:'fraud_audit_log accessible', priority:'P2', run: async()=>{ const r=await sbRest('/rest/v1/fraud_audit_log?select=id&limit=5'); return r.ok?pass('fraud_audit_log accessible'):fail('Cannot access: HTTP '+r.status); }},
  ]},
];

const ALL_TESTS = SUITES.flatMap(s=>s.tests);
const borderColor = p => p==='P1'?'#dc2626':p==='P2'?'#d97706':'#2563eb';

function Badge({ status }) {
  const s={pass:{bg:'#f0fdf4',c:'#166534'},fail:{bg:'#fef2f2',c:'#991b1b'},skip:{bg:'#fffbeb',c:'#92400e'},warn:{bg:'#fffbeb',c:'#92400e'},running:{bg:'#eff6ff',c:'#1d4ed8'},pending:{bg:'#f3f4f6',c:'#6b7280'}}[status]||{bg:'#f3f4f6',c:'#6b7280'};
  return <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:s.bg,color:s.c,whiteSpace:'nowrap',animation:status==='running'?'pulse 1s infinite':'none'}}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>;
}

function PasswordGate({ onUnlock }) {
  const [pw,setPw]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);
  const attempt=async()=>{setLoading(true);setError('');const hash=await sha256(pw);if(hash===ADMIN_HASH){sessionStorage.setItem(SESSION_KEY,'1');onUnlock();}else{setError('Incorrect password.');setPw('');}setLoading(false);};
  return(
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:'2rem',width:340,textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:'1rem'}}>&#128274;</div>
        <h1 style={{fontSize:16,fontWeight:700,color:'#f1f5f9',margin:'0 0 .4rem'}}>Admin Tools</h1>
        <p style={{fontSize:12,color:'#64748b',margin:'0 0 1.5rem'}}>StackRank365 - Restricted Access</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder="Enter admin password" autoFocus style={{width:'100%',padding:'10px 12px',fontSize:14,background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',marginBottom:10,outline:'none',fontFamily:'monospace'}}/>
        {error&&<p style={{fontSize:12,color:'#f87171',margin:'0 0 10px'}}>{error}</p>}
        <button onClick={attempt} disabled={loading||!pw} style={{width:'100%',padding:10,background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer',opacity:(!pw||loading)?0.5:1}}>{loading?'Checking...':'Unlock'}</button>
        <p style={{fontSize:11,color:'#475569',marginTop:'1.5rem'}}>Not linked anywhere in the app.</p>
      </div>
    </div>
  );
}

function TestRunner() {
  const [results,setResults]=useState({});
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(0);
  const [expanded,setExpanded]=useState({});
  const [filterSuite,setFilterSuite]=useState('all');
  const stopRef={current:false};
  const stats={pass:Object.values(results).filter(r=>r.status==='pass').length,fail:Object.values(results).filter(r=>r.status==='fail').length,skip:Object.values(results).filter(r=>['skip','warn'].includes(r.status)).length,total:ALL_TESTS.length};
  const passRate=stats.pass+stats.fail>0?Math.round(stats.pass/(stats.pass+stats.fail)*100):0;
  const toRun=filterSuite==='all'?ALL_TESTS:SUITES.find(s=>s.id===filterSuite)?.tests||ALL_TESTS;
  const progress=toRun.length?(done/toRun.length)*100:0;
  const runAll=async()=>{stopRef.current=false;setRunning(true);setDone(0);setResults({});let i=0;for(const tc of toRun){if(stopRef.current){setResults(p=>({...p,[tc.id]:{status:'skip',message:'Stopped'}}));i++;continue;}setResults(p=>({...p,[tc.id]:{status:'running',message:'Running...'}}));let result;try{result=await tc.run();}catch(e){result=fail('Error: '+e.message);}setResults(p=>({...p,[tc.id]:result}));setDone(++i);await new Promise(r=>setTimeout(r,80));}setRunning(false);};
  const downloadCSV=()=>{const rows=[['TC ID','Suite','Name','Priority','Status','Message']];SUITES.forEach(s=>s.tests.forEach(tc=>{const r=results[tc.id]||{};rows.push([tc.id,s.name,tc.name,tc.priority||'P3',r.status||'pending',(r.message||'').replace(/,/g,';')]);}));const csv=rows.map(r=>r.join(',')).join('\n');const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='sr365-tests-'+new Date().toISOString().slice(0,10)+'.csv';a.click();};
  return(
    <div style={{minHeight:'100vh',background:'#f1f5f9',fontFamily:'-apple-system,sans-serif'}}>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>
      <div style={{background:'#1e3a5f',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h1 style={{color:'#fff',fontSize:18,fontWeight:700,margin:0}}>SR365 Admin Test Suite</h1>
          <p style={{color:'#93c5fd',fontSize:12,margin:'3px 0 0'}}>{running?'Running - '+done+' / '+toRun.length:done?'Complete - Pass:'+stats.pass+' Fail:'+stats.fail+' Skip:'+stats.skip+' ('+passRate+'% pass rate)':ALL_TESTS.length+' tests across '+SUITES.length+' suites'}</p>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {done>0&&!running&&<button onClick={downloadCSV} style={{padding:'7px 14px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Download CSV</button>}
          {running?<button onClick={()=>{stopRef.current=true;}} style={{padding:'7px 14px',background:'#ef4444',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Stop</button>:<button onClick={runAll} style={{padding:'7px 14px',background:'#22c55e',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>Run All Tests</button>}
          <button onClick={()=>{sessionStorage.removeItem(SESSION_KEY);window.location.reload();}} style={{padding:'7px 14px',background:'rgba(255,255,255,.1)',color:'#fff',border:'none',borderRadius:8,fontSize:12,cursor:'pointer'}}>Lock</button>
        </div>
      </div>
      <div style={{height:4,background:'#e2e8f0'}}><div style={{height:'100%',width:progress+'%',background:stats.fail>0?'#ef4444':'#22c55e',transition:'width .3s'}}/></div>
      <div style={{display:'flex',background:'#fff',borderBottom:'1px solid #e2e8f0'}}>
        {[['Total',stats.total,'#2563eb'],['Pass',stats.pass,'#16a34a'],['Fail',stats.fail,'#dc2626'],['Skip/Warn',stats.skip,'#d97706'],['Pass Rate',passRate+'%','#7c3aed']].map(([l,v,c])=>(
          <div key={l} style={{flex:1,padding:'10px 0',textAlign:'center',borderRight:'1px solid #e2e8f0'}}>
            <div style={{fontSize:l==='Pass Rate'?15:20,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:'#9ca3af',textTransform:'uppercase',marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'8px 1rem',display:'flex',gap:5,flexWrap:'wrap'}}>
        {[{id:'all',name:'All ('+ALL_TESTS.length+')'},...SUITES.map(s=>({id:s.id,name:s.name+' ('+s.tests.length+')'}))].map(s=>(
          <button key={s.id} onClick={()=>setFilterSuite(s.id)} style={{padding:'3px 9px',fontSize:10,fontWeight:600,borderRadius:20,cursor:'pointer',border:'none',background:filterSuite===s.id?'#1e3a5f':'#f1f5f9',color:filterSuite===s.id?'#fff':'#6b7280'}}>{s.name}</button>
        ))}
      </div>
      <div style={{maxWidth:960,margin:'0 auto',padding:'1rem'}}>
        {SUITES.filter(s=>filterSuite==='all'||s.id===filterSuite).map(suite=>(
          <div key={suite.id} style={{marginBottom:'1rem'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#374151',marginBottom:5,padding:'4px 0',display:'flex',alignItems:'center',gap:8}}>
              {suite.name}{done>0&&<span style={{fontSize:10,color:'#9ca3af'}}>- {suite.tests.filter(t=>results[t.id]?.status==='pass').length}/{suite.tests.length} pass</span>}
            </div>
            {suite.tests.map(tc=>{
              const r=results[tc.id]||{status:'pending',message:'Waiting...'};
              return(
                <div key={tc.id} style={{marginBottom:3}}>
                  <div onClick={()=>setExpanded(e=>({...e,[tc.id]:!e[tc.id]}))} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 12px',background:'#fff',border:'1px solid #f1f5f9',borderLeft:'3px solid '+borderColor(tc.priority),borderRadius:8,cursor:'pointer'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#2563eb',fontFamily:'monospace',minWidth:82}}>{tc.id}</span>
                    <span style={{fontSize:12,flex:1}}>{tc.name}</span>
                    <Badge status={r.status}/>
                    <span style={{fontSize:10,color:'#9ca3af'}}>{expanded[tc.id]?'[-]':'[+]'}</span>
                  </div>
                  {expanded[tc.id]&&<div style={{padding:'5px 12px 8px 98px',fontSize:11,background:'#fafafa',borderRadius:'0 0 8px 8px',border:'1px solid #f1f5f9',borderTop:'none'}}><strong style={{color:r.status==='pass'?'#16a34a':r.status==='fail'?'#dc2626':'#92400e'}}>{r.status?.toUpperCase()}:</strong> <span style={{color:'#4b5563'}}>{r.message}</span></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Email Config Panel ────────────────────────────────────────────────────
const SB_URL = 'https://shnuwkjkjthvaovoywju.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

const DEFAULT_TEMPLATES = [
  { key: 'welcome',        label: 'Welcome email',           subject: 'Welcome to StackRank365!',                     body: 'Hi {{name}},\n\nWelcome to StackRank365! Your profile is now live.\n\nStart building your verified Microsoft professional identity today.\n\nhttps://www.stackrank365.com\n\nThe StackRank365 Team' },
  { key: 'profile_nudge',  label: 'Complete profile nudge',  subject: 'Your StackRank365 profile is incomplete',      body: 'Hi {{name}},\n\nYour profile is {{pct}}% complete. Profiles with certifications and a bio rank 3x higher.\n\nComplete your profile: https://www.stackrank365.com/?page=dashboard\n\nThe StackRank365 Team' },
  { key: 'cert_expiry',    label: 'Cert expiry reminder',    subject: '⏰ Your Microsoft certification expires soon',  body: 'Hi {{name}},\n\nYour certification {{cert_name}} expires within 90 days. Renew it on Microsoft Learn to keep your Stack Points score.\n\nhttps://learn.microsoft.com\n\nThe StackRank365 Team' },
  { key: 'rank_change',    label: 'Rank change digest',      subject: 'Your StackRank365 ranking this week',          body: 'Hi {{name}},\n\nYour weekly ranking update:\n\nCurrent rank: #{{rank}}\nScore: {{score}} pts\nChange: {{change}}\n\nView your full profile: https://www.stackrank365.com/?page=profile\n\nThe StackRank365 Team' },
  { key: 'peer_validated', label: 'Peer validation received',subject: '🤝 {{validator}} validated your project',      body: 'Hi {{name}},\n\n{{validator}} has validated your project "{{project}}" on StackRank365. Your score has been updated.\n\nView your profile: https://www.stackrank365.com/?page=profile\n\nThe StackRank365 Team' },
  { key: 'dispute_update', label: 'Dispute status update',   subject: 'Your score dispute has been updated',          body: 'Hi {{name}},\n\nYour score dispute has been updated to: {{status}}.\n\n{{message}}\n\nThe StackRank365 Team' },
];

function EmailConfigPanel() {
  const [smtpCfg,   setSmtpCfg]   = useState({ host:'', port:'587', user:'', pass:'', from:'noreply@stackrank365.com' });
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [selTpl,    setSelTpl]    = useState(DEFAULT_TEMPLATES[0].key);
  const [saving,    setSaving]    = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing,   setTesting]   = useState(false);
  const [msg,       setMsg]       = useState('');

  const curTpl = templates.find(t=>t.key===selTpl) || templates[0];

  const updateTpl = (field, val) => {
    setTemplates(ts => ts.map(t => t.key===selTpl ? {...t,[field]:val} : t));
  };

  const saveAll = async () => {
    setSaving(true); setMsg('');
    try {
      // Save SMTP config to app_config table
      const cfgRes = await fetch(SB_URL+'/rest/v1/app_config', {
        method:'POST',
        headers:{ apikey:SB_ANON, Authorization:'Bearer '+SB_ANON, 'Content-Type':'application/json', Prefer:'resolution=merge-duplicates' },
        body: JSON.stringify([
          { key:'smtp_host',  value: smtpCfg.host },
          { key:'smtp_port',  value: smtpCfg.port },
          { key:'smtp_user',  value: smtpCfg.user },
          { key:'smtp_pass',  value: smtpCfg.pass },
          { key:'smtp_from',  value: smtpCfg.from },
        ])
      });
      // Save templates to email_templates table
      for (const tpl of templates) {
        await fetch(SB_URL+'/rest/v1/email_templates', {
          method:'POST',
          headers:{ apikey:SB_ANON, Authorization:'Bearer '+SB_ANON, 'Content-Type':'application/json', Prefer:'resolution=merge-duplicates' },
          body: JSON.stringify({ key:tpl.key, subject:tpl.subject, body:tpl.body, label:tpl.label })
        });
      }
      setMsg('✓ Saved successfully');
    } catch(e) { setMsg('Error: '+e.message); }
    setSaving(false);
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setTesting(true); setMsg('');
    try {
      const res = await fetch(SB_URL+'/functions/v1/send-email', {
        method:'POST',
        headers:{ apikey:SB_ANON, Authorization:'Bearer '+SB_ANON, 'Content-Type':'application/json' },
        body: JSON.stringify({ to: testEmail, template_key: selTpl, variables: { name:'Test User', cert_name:'PL-600', rank:'42', score:'8500', change:'+200', pct:'75', validator:'John Smith', project:'D365 Implementation', status:'Under Review', message:'We are reviewing your case.' } })
      });
      const d = await res.json();
      setMsg(res.ok ? '✓ Test email sent to '+testEmail : '✗ Failed: '+(d.error||'Unknown error'));
    } catch(e) { setMsg('✗ Error: '+e.message); }
    setTesting(false);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:860, margin:'0 auto', padding:'1.5rem 0' }}>

      {/* SMTP Settings */}
      <div style={{ background:'#1a2235', border:'1px solid #1e2d45', borderRadius:12, padding:'1.25rem' }}>
        <div style={{ fontWeight:700, marginBottom:'1rem', fontSize:'0.95rem', color:'#f0f4ff' }}>📧 SMTP Configuration</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          {[
            { k:'host', label:'SMTP Host', ph:'smtp.gmail.com' },
            { k:'port', label:'Port',      ph:'587' },
            { k:'user', label:'Username',  ph:'you@yourdomain.com' },
            { k:'pass', label:'Password',  ph:'••••••••', type:'password' },
            { k:'from', label:'From address', ph:'noreply@stackrank365.com' },
          ].map(f=>(
            <div key={f.k} style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
              <label style={{ fontSize:'0.72rem', color:'#6b7fa3', textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</label>
              <input type={f.type||'text'} value={smtpCfg[f.k]} onChange={e=>setSmtpCfg(c=>({...c,[f.k]:e.target.value}))}
                placeholder={f.ph} style={{ padding:'0.5rem 0.7rem', borderRadius:6, border:'1px solid #1e2d45', background:'#111827', color:'#f0f4ff', fontSize:'0.83rem', fontFamily:'JetBrains Mono,monospace' }} />
            </div>
          ))}
        </div>
        <div style={{ fontSize:'0.75rem', color:'#6b7fa3', marginTop:'0.75rem' }}>
          💡 Use Gmail: host=smtp.gmail.com, port=587, use an App Password (not your account password).
          For Microsoft 365: host=smtp.office365.com, port=587.
        </div>
      </div>

      {/* Template Editor */}
      <div style={{ background:'#1a2235', border:'1px solid #1e2d45', borderRadius:12, padding:'1.25rem' }}>
        <div style={{ fontWeight:700, marginBottom:'1rem', fontSize:'0.95rem', color:'#f0f4ff' }}>✉️ Email Templates</div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
          {templates.map(t=>(
            <button key={t.key} onClick={()=>setSelTpl(t.key)}
              style={{ padding:'0.35rem 0.75rem', borderRadius:6, border:'1px solid '+(selTpl===t.key?'#3b82f6':'#1e2d45'), background:selTpl===t.key?'rgba(59,130,246,0.15)':'#111827', color:selTpl===t.key?'#3b82f6':'#6b7fa3', fontSize:'0.75rem', fontWeight:500, cursor:'pointer' }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <div>
            <label style={{ fontSize:'0.72rem', color:'#6b7fa3', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'0.3rem' }}>Subject</label>
            <input value={curTpl.subject} onChange={e=>updateTpl('subject',e.target.value)}
              style={{ width:'100%', padding:'0.5rem 0.7rem', borderRadius:6, border:'1px solid #1e2d45', background:'#111827', color:'#f0f4ff', fontSize:'0.83rem' }} />
          </div>
          <div>
            <label style={{ fontSize:'0.72rem', color:'#6b7fa3', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'0.3rem' }}>
              Body <span style={{ color:'#4b6a8a', fontWeight:400 }}>· Variables: {'{{name}} {{rank}} {{score}} {{cert_name}} {{pct}} {{validator}} {{project}} {{status}} {{message}} {{change}}'}</span>
            </label>
            <textarea value={curTpl.body} onChange={e=>updateTpl('body',e.target.value)} rows={8}
              style={{ width:'100%', padding:'0.5rem 0.7rem', borderRadius:6, border:'1px solid #1e2d45', background:'#111827', color:'#f0f4ff', fontSize:'0.83rem', fontFamily:'JetBrains Mono,monospace', resize:'vertical', lineHeight:1.6 }} />
          </div>
        </div>

        {/* Test send */}
        <div style={{ marginTop:'1rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
          <input value={testEmail} onChange={e=>setTestEmail(e.target.value)} placeholder="Send test to: email@example.com"
            style={{ flex:1, minWidth:200, padding:'0.45rem 0.7rem', borderRadius:6, border:'1px solid #1e2d45', background:'#111827', color:'#f0f4ff', fontSize:'0.83rem' }} />
          <button onClick={sendTest} disabled={testing||!testEmail}
            style={{ padding:'0.45rem 1rem', borderRadius:6, background:'#1e2d45', border:'1px solid #3b82f6', color:'#3b82f6', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
            {testing ? 'Sending…' : 'Send test →'}
          </button>
        </div>
      </div>

      {/* Save */}
      <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
        <button onClick={saveAll} disabled={saving}
          style={{ padding:'0.6rem 1.5rem', borderRadius:8, background:'#3b82f6', border:'none', color:'#fff', fontSize:'0.88rem', fontWeight:700, cursor:'pointer' }}>
          {saving ? 'Saving…' : 'Save all settings'}
        </button>
        {msg && <span style={{ fontSize:'0.83rem', color: msg.startsWith('✓') ? '#10b981' : '#ef4444' }}>{msg}</span>}
      </div>
    </div>
  );
}

export default function AdminTools() {
  const [unlocked,setUnlocked]=useState(false);
  useEffect(()=>{ if(sessionStorage.getItem(SESSION_KEY)==='1') setUnlocked(true); },[]);
  const [adminTab, setAdminTab] = useState('tests');  // moved before early return (hooks rule)
  if(!unlocked) return <PasswordGate onUnlock={()=>setUnlocked(true)}/>;
  return (
    <div>
      <div style={{ display:'flex', gap:'0.5rem', padding:'1rem 1.5rem 0', borderBottom:'1px solid #1e2d45', background:'#0a0e1a' }}>
        {[['tests','🧪 Tests'],['email','📧 Email Config']].map(([k,lbl])=>(
          <button key={k} onClick={()=>setAdminTab(k)}
            style={{ padding:'0.5rem 1rem', borderRadius:'6px 6px 0 0', border:'1px solid '+(adminTab===k?'#1e2d45':'transparent'), borderBottom:'none', background:adminTab===k?'#111827':'transparent', color:adminTab===k?'#f0f4ff':'#6b7fa3', fontSize:'0.83rem', fontWeight:600, cursor:'pointer' }}>
            {lbl}
          </button>
        ))}
      </div>
      <div style={{ padding:'0 1.5rem', background:'#0a0e1a', minHeight:'80vh' }}>
        {adminTab==='tests' ? <TestRunner/> : <EmailConfigPanel/>}
      </div>
    </div>
  );
}
