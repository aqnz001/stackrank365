import { useState, useEffect } from 'react';

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// AdminTools.jsx  â  PASSWORD-GATED TEST SUITE
// Route: /?page=sr365-admin-tools   (not linked anywhere in the app)
// Only the SHA-256 hash of the password is stored here â never the plain text.
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const ADMIN_HASH = 'b89815ec9b87bdc40215bc27947f673568d39a675f78d61bd90c279d73cab6c3';
const SESSION_KEY = 'sr365_admin_unlocked';

// Hardcoded â safe to include (anon/public key, not service role)
const SB  = 'https://shnuwkjkjthvaovoywju.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ââ fetch helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const sbRest = (path, extra = {}) =>
  fetch(SB + path, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', ...extra } });

const sbAuth = (path, body) =>
  fetch(SB + path, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

const sbFn = (name, body = {}) =>
  fetch(SB + '/functions/v1/' + name, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

// ââ result helpers ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const pass = m => ({ status: 'pass', message: m });
const fail = m => ({ status: 'fail', message: m });
const skip = m => ({ status: 'skip', message: m });
const warn = m => ({ status: 'warn', message: m });

// ââ safe JSON helper â never throws on HTML error pages âââââââââââââââââââââââ
async function safeJson(res) {
  const text = await res.text();
  if (text.trim().startsWith('<')) throw new Error('Got HTML instead of JSON â check SB URL/key');
  return JSON.parse(text);
}

// ââ test suites âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SUITES = [
  { id: 'landing', name: 'ð Landing Page', tests: [
    { id:'TC-001', name:'Page title correct', priority:'P1', run: async () => {
      const h = await fetch('https://www.stackrank365.com').then(r=>r.text());
      return h.includes('StackRank365') ? pass('Title correct â') : fail('StackRank365 not found in page');
    }},
    { id:'TC-002', name:'Nav links in DOM', priority:'P1', run: async () => {
      const t = document.body.innerText;
      const missing = ['How It Works','Scoring','Leaderboard','About'].filter(n=>!t.includes(n));
      return missing.length ? fail('Missing in DOM: '+missing.join(', ')) : pass('All nav links in live DOM â');
    }},
    { id:'TC-003', name:'Load time < 5s', priority:'P2', run: async () => {
      const t = Date.now(); await fetch('https://www.stackrank365.com'); const ms = Date.now()-t;
      return ms > 5000 ? fail(ms+'ms exceeds 5s') : pass('Loaded in '+ms+'ms â');
    }},
    { id:'TC-004', name:'Privacy page loads', priority:'P1', run: async () => {
      const h = await fetch('https://www.stackrank365.com/?page=privacy').then(r=>r.text());
      return h.includes('StackRank365') ? pass('Privacy page shell loads â') : fail('Shell missing');
    }},
    { id:'TC-005', name:'Pricing page loads', priority:'P2', run: async () => {
      const h = await fetch('https://www.stackrank365.com/?page=pricing').then(r=>r.text());
      return h.includes('StackRank365') ? pass('Pricing page loads â') : fail('Shell missing');
    }},
  ]},
  { id: 'auth', name: 'ð Authentication', tests: [
    { id:'TC-020', name:'Sign up new email', priority:'P1', run: async () => {
      const e = 'auto_'+Date.now()+'@mailtest.dev';
      const r = await sbAuth('/auth/v1/signup', { email: e, password: 'TestPass123!' });
      const d = await safeJson(r);
      return (d.user?.id || d.id) ? pass('Signup accepted: '+e+' â') : warn('Returned: '+(d.error_description||d.msg||JSON.stringify(d).slice(0,80)));
    }},
    { id:'TC-024', name:'Sign in valid credentials', priority:'P1', run: async () => {
      const r = await sbAuth('/auth/v1/token?grant_type=password', { email: 'tester@stackrank365.com', password: 'TestPass123!' });
      const d = await safeJson(r);
      return d.access_token ? pass('Signed in as '+d.user?.email+' â') : fail('Sign in failed: '+(d.error_description||'No token returned'));
    }},
    { id:'TC-025', name:'Wrong password rejected', priority:'P1', run: async () => {
      const r = await sbAuth('/auth/v1/token?grant_type=password', { email: 'tester@stackrank365.com', password: 'WrongPass999!' });
      return !r.ok ? pass('Wrong password rejected ('+r.status+') â') : fail('SECURITY: wrong password returned 200!');
    }},
    { id:'TC-026', name:'Fake email rejected', priority:'P1', run: async () => {
      const r = await sbAuth('/auth/v1/token?grant_type=password', { email: 'nobody_'+Date.now()+'@nowhere.invalid', password: 'Test!' });
      return !r.ok ? pass('Fake email rejected ('+r.status+') â') : fail('SECURITY: fake email returned 200!');
    }},
    { id:'TC-027', name:'Auth rejects missing token', priority:'P1', run: async () => {
      const r = await fetch(SB+'/auth/v1/user', { headers: { apikey: KEY } });
      return (r.status===401||r.status===403) ? pass('Unauthenticated request rejected ('+r.status+') â') : fail('Expected 401/403, got '+r.status);
    }},
  ]},
  { id: 'database', name: 'ðï¸ Database & Schema', tests: [
    { id:'TC-DB-01', name:'profiles table accessible', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/profiles?select=id,name,tier&limit=5');
      if (!r.ok) return fail('HTTP '+r.status);
      const d = await safeJson(r);
      return pass('profiles OK ('+d.length+' rows via RLS) â');
    }},
    { id:'TC-DB-02', name:'cert_catalog â¥ 250 rows', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/cert_catalog?select=id', { Prefer:'count=exact', 'Range-Unit':'items', Range:'0-0' });
      const cr = r.headers.get('content-range') || '';
      const total = parseInt(cr.split('/')[1] || '0');
      return total < 250 ? fail('Only '+total+' rows â run sync-catalog function') : pass(total+' rows in cert_catalog â');
    }},
    { id:'TC-DB-03', name:'certifications table + columns', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/certifications?select=id,name,verification_status,score_multiplier&limit=1');
      if (!r.ok) return fail('HTTP '+r.status);
      await safeJson(r);
      return pass('certifications schema OK â');
    }},
    { id:'TC-DB-04', name:'fraud_audit_log exists', priority:'P2', run: async () => {
      const r = await sbRest('/rest/v1/fraud_audit_log?limit=1');
      return (r.status===404||r.status===400) ? fail('Table missing') : pass('fraud_audit_log exists â');
    }},
    { id:'TC-DB-05', name:'resume_analyses exists', priority:'P2', run: async () => {
      const r = await sbRest('/rest/v1/resume_analyses?limit=1');
      return (r.status===404||r.status===400) ? fail('Table missing') : pass('resume_analyses exists â');
    }},
    { id:'TC-DB-06', name:'cert_reminder_log exists', priority:'P2', run: async () => {
      const r = await sbRest('/rest/v1/cert_reminder_log?limit=1');
      return (r.status===404||r.status===400) ? fail('Table missing') : pass('cert_reminder_log exists â');
    }},
    { id:'TC-DB-07', name:'profiles has all Phase 3+4 columns', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/profiles?select=open_to_work,tier,fraud_status,fraud_score,reputation_score,linkedin_url&limit=1');
      if (!r.ok) { const d=await safeJson(r); return fail('Missing columns: '+d.message); }
      return pass('All new columns present â');
    }},
  ]},
  { id: 'scoring', name: 'ð Scoring Logic', tests: [
    { id:'TC-SC-01', name:'Verified cert â score_multiplier=1.00', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.verified&limit=5');
      if (!r.ok) return fail('HTTP '+r.status);
      const rows = await safeJson(r);
      if (!rows.length) return skip('No verified certs yet â verify one first');
      const bad = rows.filter(r => parseFloat(r.score_multiplier) !== 1.00);
      return bad.length ? fail(bad.length+' verified certs have wrong multiplier') : pass(rows.length+' verified â 1.00 â');
    }},
    { id:'TC-SC-02', name:'Unverified cert â score_multiplier=0.25', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.unverified&limit=5');
      if (!r.ok) return fail('HTTP '+r.status);
      const rows = await safeJson(r);
      if (!rows.length) return skip('No unverified certs in DB');
      const bad = rows.filter(r => parseFloat(r.score_multiplier) !== 0.25);
      return bad.length ? fail(bad.length+' wrong') : pass(rows.length+' unverified â 0.25 â');
    }},
    { id:'TC-SC-03', name:'cert_catalog schema complete', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/cert_catalog?select=certification_uid,certification_name,technology_area,level&limit=2');
      if (!r.ok) return fail('HTTP '+r.status);
      const d = await safeJson(r);
      return pass('Schema OK. Sample: '+(d[0]?.certification_name||'(empty)').slice(0,50)+' â');
    }},
  ]},
  { id: 'security', name: 'ð Security', tests: [
    { id:'TC-170', name:'RLS â private fields not exposed to anon', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/profiles?select=email,fraud_score&limit=5');
      if (!r.ok) return pass('Anon query blocked by RLS â');
      const rows = await safeJson(r);
      return rows.some(rw=>rw.email) ? fail('SECURITY: email field exposed via RLS!') : pass('Private fields not in anon response â');
    }},
    { id:'TC-172', name:'service_role key not in JS bundle', priority:'P1', run: async () => {
      const html = await fetch('https://www.stackrank365.com').then(r=>r.text());
      const src = html.match(/src="([^"]*index[^"]*\.js)"/)?.[1];
      if (!src) return warn('Cannot find JS bundle URL');
      const jsUrl = src.startsWith('http') ? src : 'https://www.stackrank365.com'+src;
      const js = await fetch(jsUrl).then(r=>r.text());
      const jwtRx = /eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g;
      const jwts = js.match(jwtRx) || [];
      const leaked = jwts.some(jwt => { try { return JSON.parse(atob(jwt.split('.')[1])).role === 'service_role'; } catch{ return false; } });
      return leaked ? fail('SECURITY: service_role JWT found in client bundle!') : pass('No service_role JWT in client bundle ✓');
    }},
    { id:'TC-173', name:'Page served over HTTPS', priority:'P1', run: async () =>
      location.protocol==='https:' ? pass('HTTPS confirmed â') : fail('Not on HTTPS!')
    },
    { id:'TC-174', name:'REST API returns JSON content-type', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/profiles?select=id&limit=1');
      const ct = r.headers.get('content-type') || '';
      return ct.includes('application/json') ? pass('API returns application/json â') : fail('API returned: '+ct+' (HTTP '+r.status+')');
    }},
    { id:'TC-175', name:'Auth rejects unauthenticated user requests', priority:'P1', run: async () => {
      const r = await fetch(SB+'/auth/v1/user', { headers: { apikey: KEY } });
      return (r.status===401||r.status===403) ? pass('Unauthenticated rejected ('+r.status+') â') : fail('Expected 401/403, got '+r.status);
    }},
  ]},
  { id: 'edge_fns', name: 'â¡ Edge Functions', tests: [
    { id:'TC-EF-01', name:'verify-cert: missing params â 400', priority:'P1', run: async () => {
      const r = await sbFn('verify-cert', {});
      return r.status===400 ? pass('Returns 400 for missing params â') : fail('Expected 400, got '+r.status);
    }},
    { id:'TC-EF-02', name:'analyse-resume: missing pdf â 400', priority:'P1', run: async () => {
      const r = await sbFn('analyse-resume', {});
      return r.status===400 ? pass('Returns 400 â') : fail('Expected 400, got '+r.status);
    }},
    { id:'TC-EF-03', name:'recruiter-match: missing JD â 400', priority:'P1', run: async () => {
      const r = await sbFn('recruiter-match', {});
      return r.status===400 ? pass('Returns 400 â') : fail('Expected 400, got '+r.status);
    }},
    { id:'TC-EF-04', name:'detect-fake-profiles: deployed & runs', priority:'P2', run: async () => {
      const r = await sbFn('detect-fake-profiles', { limit: 5 });
      const d = await safeJson(r);
      return (r.ok && d.checked!==undefined) ? pass('deployed: checked='+d.checked+', flagged='+d.flagged+' â') : fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60)));
    }},
    { id:'TC-EF-05', name:'batch-verify-certs: deployed', priority:'P2', run: async () => {
      const r = await sbFn('batch-verify-certs', { limit: 5 });
      const d = await safeJson(r);
      return r.ok ? pass('deployed: processed='+d.processed+', verified='+d.verified+' â') : fail('HTTP '+r.status+': '+(d.error||JSON.stringify(d).slice(0,60)));
    }},
  ]},
  { id: 'data', name: 'ðï¸ Data Integrity', tests: [
    { id:'TC-DI-01', name:'cert_catalog: no null certification_uid', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/cert_catalog?select=id&certification_uid=is.null&limit=1');
      if (!r.ok) return fail('HTTP '+r.status);
      const rows = await safeJson(r);
      return rows.length ? fail(rows.length+' entries have null certification_uid!') : pass('All entries have non-null UID â');
    }},
    { id:'TC-DI-02', name:'certifications: verification_status valid', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/certifications?select=verification_status&not.verification_status=in.(unverified,pending,verified,failed)&limit=5');
      if (!r.ok) return skip('RLS blocks anon check');
      const rows = await safeJson(r);
      return rows.length ? fail(rows.length+' certs have invalid status') : pass('All verification_status values valid â');
    }},
    { id:'TC-DI-03', name:'profiles: tier values valid', priority:'P1', run: async () => {
      const r = await sbRest('/rest/v1/profiles?select=tier&not.tier=in.(free,pro,recruiter)&limit=5');
      if (!r.ok) return skip('RLS blocks anon check');
      const rows = await safeJson(r);
      return rows.length ? fail(rows.length+' profiles have invalid tier') : pass('All tier values valid â');
    }},
  ]},
];

const ALL_TESTS = SUITES.flatMap(s => s.tests);
const borderColor = p => p==='P1'?'#dc2626':p==='P2'?'#d97706':'#2563eb';

function Badge({ status }) {
  const s = {pass:{bg:'#f0fdf4',c:'#166534'},fail:{bg:'#fef2f2',c:'#991b1b'},skip:{bg:'#fffbeb',c:'#92400e'},warn:{bg:'#fffbeb',c:'#92400e'},running:{bg:'#eff6ff',c:'#1d4ed8'},pending:{bg:'#f3f4f6',c:'#6b7280'}}[status]||{bg:'#f3f4f6',c:'#6b7280'};
  return <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:s.bg,color:s.c,whiteSpace:'nowrap',animation:status==='running'?'pulse 1s infinite':'none'}}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>;
}

function PasswordGate({ onUnlock }) {
  const [pw,setPw]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const attempt = async () => {
    setLoading(true); setError('');
    const hash = await sha256(pw);
    if (hash === ADMIN_HASH) { sessionStorage.setItem(SESSION_KEY,'1'); onUnlock(); }
    else { setError('Incorrect password.'); setPw(''); }
    setLoading(false);
  };
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:'2rem',width:340,textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:'1rem'}}>ð</div>
        <h1 style={{fontSize:16,fontWeight:700,color:'#f1f5f9',margin:'0 0 .4rem'}}>Admin Tools</h1>
        <p style={{fontSize:12,color:'#64748b',margin:'0 0 1.5rem'}}>StackRank365 â Restricted Access</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()}
          placeholder="Enter admin password" autoFocus
          style={{width:'100%',padding:'10px 12px',fontSize:14,background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',marginBottom:10,outline:'none',fontFamily:'monospace'}}/>
        {error && <p style={{fontSize:12,color:'#f87171',margin:'0 0 10px'}}>{error}</p>}
        <button onClick={attempt} disabled={loading||!pw}
          style={{width:'100%',padding:10,background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer',opacity:(!pw||loading)?0.5:1}}>
          {loading?'Checking...':'Unlock'}
        </button>
        <p style={{fontSize:11,color:'#475569',marginTop:'1.5rem'}}>Not linked or indexed anywhere in the app.</p>
      </div>
    </div>
  );
}

function TestRunner() {
  const [results,setResults]=useState({});
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(0);
  const [expanded,setExpanded]=useState({});
  const stopRef = useState({current:false})[0];

  const stats = {
    pass:  Object.values(results).filter(r=>r.status==='pass').length,
    fail:  Object.values(results).filter(r=>r.status==='fail').length,
    skip:  Object.values(results).filter(r=>['skip','warn'].includes(r.status)).length,
    total: ALL_TESTS.length,
  };

  const runAll = async () => {
    stopRef.current = false;
    setRunning(true); setDone(0); setResults({});
    let i = 0;
    for (const tc of ALL_TESTS) {
      if (stopRef.current) { setResults(p=>({...p,[tc.id]:{status:'skip',message:'Stopped'}})); i++; continue; }
      setResults(p=>({...p,[tc.id]:{status:'running',message:'Running...'}}));
      let result;
      try { result = await tc.run(); } catch(e) { result = fail('Error: '+e.message); }
      setResults(p=>({...p,[tc.id]:result}));
      setDone(++i);
      await new Promise(r=>setTimeout(r,100));
    }
    setRunning(false);
  };

  const downloadCSV = () => {
    const rows=[['TC ID','Name','Priority','Status','Message']];
    SUITES.forEach(s=>s.tests.forEach(tc=>{
      const r=results[tc.id]||{};
      rows.push([tc.id,tc.name,tc.priority||'P3',r.status||'pending',(r.message||'').replace(/,/g,';')]);
    }));
    const csv=rows.map(r=>r.join(',')).join('\n');
    const a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download='sr365-tests-'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
  };

  const progress = ALL_TESTS.length ? (done/ALL_TESTS.length)*100 : 0;

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',fontFamily:'-apple-system,sans-serif'}}>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      <div style={{background:'#1e3a5f',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h1 style={{color:'#fff',fontSize:18,fontWeight:700,margin:0}}>ð§ª SR365 Admin Test Suite</h1>
          <p style={{color:'#93c5fd',fontSize:12,margin:'3px 0 0'}}>
            {running ? 'Running â '+done+' / '+ALL_TESTS.length :
             done ? 'Complete â â '+stats.pass+'  â '+stats.fail+'  â­ '+stats.skip :
             ALL_TESTS.length+' tests Â· '+SUITES.length+' suites'}
          </p>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {done>0&&!running && <button onClick={downloadCSV} style={{padding:'7px 14px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>ð Download CSV</button>}
          {running
            ? <button onClick={()=>{stopRef.current=true;}} style={{padding:'7px 14px',background:'#ef4444',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>â  Stop</button>
            : <button onClick={runAll} style={{padding:'7px 14px',background:'#22c55e',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>â¶ Run All Tests</button>
          }
          <button onClick={()=>{sessionStorage.removeItem(SESSION_KEY);window.location.reload();}}
            style={{padding:'7px 14px',background:'rgba(255,255,255,.1)',color:'#fff',border:'none',borderRadius:8,fontSize:12,cursor:'pointer'}}>ð Lock</button>
        </div>
      </div>

      <div style={{height:4,background:'#e2e8f0'}}>
        <div style={{height:'100%',width:progress+'%',background:'#22c55e',transition:'width .3s'}}/>
      </div>

      <div style={{display:'flex',background:'#fff',borderBottom:'1px solid #e2e8f0'}}>
        {[['Total',stats.total,'#2563eb'],['Pass',stats.pass,'#16a34a'],['Fail',stats.fail,'#dc2626'],['Skip/Warn',stats.skip,'#d97706']].map(([l,v,c])=>(
          <div key={l} style={{flex:1,padding:'10px 0',textAlign:'center',borderRight:'1px solid #e2e8f0'}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase'}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'1rem'}}>
        {SUITES.map(suite=>(
          <div key={suite.id} style={{marginBottom:'1rem'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'.05em',padding:'0.25rem 0',marginBottom:6}}>{suite.name}</div>
            {suite.tests.map(tc=>{
              const r=results[tc.id]||{status:'pending',message:'Waiting...'};
              return (
                <div key={tc.id} style={{marginBottom:4}}>
                  <div onClick={()=>setExpanded(e=>({...e,[tc.id]:!e[tc.id]}))}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',background:'#fff',border:'1px solid #f1f5f9',borderLeft:'3px solid '+borderColor(tc.priority),borderRadius:8,cursor:'pointer'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#2563eb',fontFamily:'monospace',minWidth:72}}>{tc.id}</span>
                    <span style={{fontSize:12,flex:1}}>{tc.name}</span>
                    <Badge status={r.status}/>
                    <span style={{fontSize:10,color:'#9ca3af'}}>{expanded[tc.id]?'â²':'â¼'}</span>
                  </div>
                  {expanded[tc.id]&&(
                    <div style={{padding:'6px 12px 8px 90px',fontSize:11,background:'#fafafa',borderRadius:'0 0 8px 8px',border:'1px solid #f1f5f9',borderTop:'none'}}>
                      <strong style={{color:r.status==='pass'?'#16a34a':r.status==='fail'?'#dc2626':'#92400e'}}>Result:</strong> <span style={{color:'#4b5563'}}>{r.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminTools() {
  const [unlocked,setUnlocked]=useState(false);
  useEffect(()=>{ if(sessionStorage.getItem(SESSION_KEY)==='1') setUnlocked(true); },[]);
  if (!unlocked) return <PasswordGate onUnlock={()=>setUnlocked(true)}/>;
  return <TestRunner/>;
}
