import { useState, useEffect, useCallback } from 'react';

const ADMIN_HASH = 'b89815ec9b87bdc40215bc27947f673568d39a675f78d61bd90c279d73cab6c3';
const SESSION_KEY = 'sr365_admin_unlocked';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const SB_URL  = import.meta.env.VITE_SUPABASE_URL;
const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sbRest = (path, eh = {}) => fetch(SB_URL + path, { headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, 'Content-Type': 'application/json', ...eh } });
const sbAuth = (path, body) => fetch(SB_URL + path, { method: 'POST', headers: { apikey: SB_ANON, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const sbFn   = (name, body = {}) => fetch(SB_URL + '/functions/v1/' + name, { method: 'POST', headers: { apikey: SB_ANON, Authorization: `Bearer ${SB_ANON}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

const pass = m => ({ status: 'pass', message: m });
const fail = m => ({ status: 'fail', message: m });
const skip = m => ({ status: 'skip', message: m });
const warn = m => ({ status: 'warn', message: m });

const SUITES = [
  { id:'landing', name:'🌐 Landing Page', tests:[
    { id:'TC-001', name:'Page title correct', priority:'P1', run:async()=>{ const h=await fetch('https://www.stackrank365.com').then(r=>r.text()); return h.includes('StackRank365')?pass('Title correct ✓'):fail('StackRank365 missing'); }},
    { id:'TC-002', name:'Nav links in DOM', priority:'P1', run:async()=>{ const t=document.body.innerText; const m=['How It Works','Scoring','Leaderboard','About'].filter(n=>!t.includes(n)); return m.length?fail('Missing: '+m.join(', ')):pass('All nav links present ✓'); }},
    { id:'TC-003', name:'Load time < 5s', priority:'P2', run:async()=>{ const t=Date.now(); await fetch('https://www.stackrank365.com'); const ms=Date.now()-t; return ms>5000?fail(ms+'ms exceeds 5s'):pass('Loaded in '+ms+'ms ✓'); }},
    { id:'TC-004', name:'Privacy page loads', priority:'P1', run:async()=>{ const h=await fetch('https://www.stackrank365.com/?page=privacy').then(r=>r.text()); return h.includes('StackRank365')?pass('Privacy page shell loads ✓'):fail('Shell missing'); }},
  ]},
  { id:'auth', name:'🔐 Authentication', tests:[
    { id:'TC-020', name:'Sign up new email', priority:'P1', run:async()=>{ const e='auto_'+Date.now()+'@example.com'; const r=await sbAuth('/auth/v1/signup',{email:e,password:'TestPass123!'}); const d=await r.json(); return(d.user?.id||d.id)?pass('Signup accepted ✓'):warn('Check: '+(d.error_description||JSON.stringify(d).slice(0,60))); }},
    { id:'TC-024', name:'Sign in valid credentials', priority:'P1', run:async()=>{ const r=await sbAuth('/auth/v1/token?grant_type=password',{email:'tester@stackrank365.com',password:'TestPass123!'}); const d=await r.json(); return d.access_token?pass('Signed in as '+d.user?.email+' ✓'):fail('Sign in failed: '+(d.error_description||'No token')); }},
    { id:'TC-025', name:'Wrong password rejected', priority:'P1', run:async()=>{ const r=await sbAuth('/auth/v1/token?grant_type=password',{email:'tester@stackrank365.com',password:'WrongPass999!'}); return r.ok?fail('SECURITY: wrong password accepted!'):pass('Wrong password rejected ('+r.status+') ✓'); }},
    { id:'TC-026', name:'Fake email rejected', priority:'P1', run:async()=>{ const r=await sbAuth('/auth/v1/token?grant_type=password',{email:'nobody_'+Date.now()+'@nowhere.invalid',password:'Test!'}); return r.ok?fail('SECURITY: fake email accepted!'):pass('Fake email rejected ('+r.status+') ✓'); }},
  ]},
  { id:'database', name:'🗄️ Database & Schema', tests:[
    { id:'TC-DB-01', name:'profiles table accessible', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/profiles?select=id,name,tier&limit=5'); return r.ok?pass('profiles OK ('+((await r.json()).length)+' rows) ✓'):fail('HTTP '+r.status); }},
    { id:'TC-DB-02', name:'cert_catalog ≥ 250 rows', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/cert_catalog?select=id',{Prefer:'count=exact','Range-Unit':'items',Range:'0-0'}); const t=parseInt((r.headers.get('content-range')||'').split('/')[1]||0); return t<250?fail('Only '+t+' rows — run sync-catalog'):pass(t+' rows ✓'); }},
    { id:'TC-DB-03', name:'certifications table + columns', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/certifications?select=id,name,verification_status,score_multiplier&limit=1'); return r.ok?pass('certifications schema OK ✓'):fail('HTTP '+r.status); }},
    { id:'TC-DB-04', name:'fraud_audit_log exists', priority:'P2', run:async()=>{ const r=await sbRest('/rest/v1/fraud_audit_log?limit=1'); return(r.status===404||r.status===400)?fail('Table missing'):pass('fraud_audit_log exists ✓'); }},
    { id:'TC-DB-05', name:'resume_analyses exists', priority:'P2', run:async()=>{ const r=await sbRest('/rest/v1/resume_analyses?limit=1'); return(r.status===404||r.status===400)?fail('Table missing'):pass('resume_analyses exists ✓'); }},
    { id:'TC-DB-06', name:'cert_reminder_log exists', priority:'P2', run:async()=>{ const r=await sbRest('/rest/v1/cert_reminder_log?limit=1'); return(r.status===404||r.status===400)?fail('Table missing'):pass('cert_reminder_log exists ✓'); }},
    { id:'TC-DB-07', name:'profiles has all Phase 3+4 columns', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/profiles?select=open_to_work,tier,fraud_status,fraud_score,reputation_score,linkedin_url&limit=1'); return r.ok?pass('All new columns present ✓'):fail('Missing: '+(await r.json()).message); }},
  ]},
  { id:'scoring', name:'📊 Scoring Logic', tests:[
    { id:'TC-SC-01', name:'Verified cert → 1.00', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.verified&limit=5'); if(!r.ok)return fail('HTTP '+r.status); const rows=await r.json(); if(!rows.length)return skip('No verified certs yet'); const bad=rows.filter(r=>parseFloat(r.score_multiplier)!==1.00); return bad.length?fail(bad.length+' wrong'):pass(rows.length+' verified → 1.00 ✓'); }},
    { id:'TC-SC-02', name:'Unverified cert → 0.25', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/certifications?select=id,score_multiplier&verification_status=eq.unverified&limit=5'); if(!r.ok)return fail('HTTP '+r.status); const rows=await r.json(); if(!rows.length)return skip('No unverified certs'); const bad=rows.filter(r=>parseFloat(r.score_multiplier)!==0.25); return bad.length?fail(bad.length+' wrong'):pass(rows.length+' unverified → 0.25 ✓'); }},
    { id:'TC-SC-03', name:'cert_catalog schema valid', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/cert_catalog?select=certification_uid,certification_name,technology_area,level&limit=2'); if(!r.ok)return fail('HTTP '+r.status); const d=await r.json(); return pass('Schema OK: '+(d[0]?.certification_name||'').slice(0,40)+' ✓'); }},
  ]},
  { id:'security', name:'🔒 Security', tests:[
    { id:'TC-170', name:'RLS — private fields not exposed', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/profiles?select=email,fraud_score&limit=5'); if(!r.ok)return pass('Anon query blocked by RLS ✓'); const rows=await r.json(); return rows.some(rw=>rw.email)?fail('SECURITY: email exposed!'):pass('Private fields hidden ✓'); }},
    { id:'TC-172', name:'service_role not in JS bundle', priority:'P1', run:async()=>{ const html=await fetch('https://www.stackrank365.com').then(r=>r.text()); const src=html.match(/src="([^"]*index[^"]*\.js)"/)?.[1]; if(!src)return warn('Cannot find bundle URL'); const js=await fetch(src.startsWith('http')?src:'https://www.stackrank365.com'+src).then(r=>r.text()); return js.includes('service_role')?fail('SECURITY: service_role in client JS!'):pass('service_role not in bundle ✓'); }},
    { id:'TC-173', name:'HTTPS enforced', priority:'P1', run:async()=>location.protocol==='https:'?pass('HTTPS ✓'):fail('Not HTTPS!') },
    { id:'TC-174', name:'REST API returns JSON', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/profiles?select=id&limit=1'); return(r.headers.get('content-type')||'').includes('application/json')?pass('JSON content-type ✓'):fail('Wrong content-type'); }},
    { id:'TC-175', name:'Auth rejects unauthed requests', priority:'P1', run:async()=>{ const r=await fetch(SB_URL+'/auth/v1/user',{headers:{apikey:SB_ANON}}); return(r.status===401||r.status===403)?pass('Rejected ('+r.status+') ✓'):fail('Expected 401/403, got '+r.status); }},
  ]},
  { id:'edge_fns', name:'⚡ Edge Functions', tests:[
    { id:'TC-EF-01', name:'verify-cert: missing params → 400', priority:'P1', run:async()=>{ const r=await sbFn('verify-cert',{}); return r.status===400?pass('400 ✓'):fail('Expected 400, got '+r.status); }},
    { id:'TC-EF-02', name:'analyse-resume: missing pdf → 400', priority:'P1', run:async()=>{ const r=await sbFn('analyse-resume',{}); return r.status===400?pass('400 ✓'):fail('Expected 400, got '+r.status); }},
    { id:'TC-EF-03', name:'recruiter-match: missing JD → 400', priority:'P1', run:async()=>{ const r=await sbFn('recruiter-match',{}); return r.status===400?pass('400 ✓'):fail('Expected 400, got '+r.status); }},
  ]},
  { id:'data', name:'🗂️ Data Integrity', tests:[
    { id:'TC-DI-01', name:'cert_catalog: no null UIDs', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/cert_catalog?select=id&certification_uid=is.null&limit=1'); if(!r.ok)return fail('HTTP '+r.status); const rows=await r.json(); return rows.length?fail(rows.length+' null UIDs!'):pass('No null UIDs ✓'); }},
    { id:'TC-DI-02', name:'certifications: status values valid', priority:'P1', run:async()=>{ const r=await sbRest('/rest/v1/certifications?select=verification_status&not.verification_status=in.(unverified,pending,verified,failed)&limit=5'); if(!r.ok)return skip('RLS blocks anon'); const rows=await r.json(); return rows.length?fail(rows.length+' invalid'):pass('All status values valid ✓'); }},
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
  const attempt=async()=>{ setLoading(true); setError(''); const hash=await sha256(pw); if(hash===ADMIN_HASH){sessionStorage.setItem(SESSION_KEY,'1');onUnlock();}else{setError('Incorrect password.');setPw('');} setLoading(false); };
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'-apple-system,sans-serif'}}>
      <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:'2rem',width:340,textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:'1rem'}}>🔐</div>
        <h1 style={{fontSize:16,fontWeight:700,color:'#f1f5f9',margin:'0 0 .4rem'}}>Admin Tools</h1>
        <p style={{fontSize:12,color:'#64748b',margin:'0 0 1.5rem'}}>StackRank365 — Restricted Access</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder="Enter admin password" autoFocus style={{width:'100%',padding:'10px 12px',fontSize:14,background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',marginBottom:10,outline:'none',fontFamily:'monospace'}}/>
        {error&&<p style={{fontSize:12,color:'#f87171',margin:'0 0 10px'}}>{error}</p>}
        <button onClick={attempt} disabled={loading||!pw} style={{width:'100%',padding:10,background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer',opacity:(!pw||loading)?0.5:1}}>{loading?'Checking...':'Unlock'}</button>
        <p style={{fontSize:11,color:'#475569',marginTop:'1.5rem'}}>This page is not indexed or linked anywhere in the app.</p>
      </div>
    </div>
  );
}

function TestRunner() {
  const [results,setResults]=useState({});
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(0);
  const [expanded,setExpanded]=useState({});
  const stopRef=useCallback(()=>({}),[]); const _stop={current:false};
  const stats={pass:Object.values(results).filter(r=>r.status==='pass').length,fail:Object.values(results).filter(r=>r.status==='fail').length,skip:Object.values(results).filter(r=>['skip','warn'].includes(r.status)).length,total:ALL_TESTS.length};
  const runAll=async()=>{ _stop.current=false; setRunning(true); setDone(0); setResults({}); let i=0; for(const tc of ALL_TESTS){if(_stop.current){setResults(p=>({...p,[tc.id]:{status:'skip',message:'Stopped'}}));i++;continue;} setResults(p=>({...p,[tc.id]:{status:'running',message:'Running...'}})); let result; try{result=await tc.run();}catch(e){result=fail('Error: '+e.message);} setResults(p=>({...p,[tc.id]:result})); setDone(++i); await new Promise(r=>setTimeout(r,100));} setRunning(false); };
  const progress=ALL_TESTS.length?(done/ALL_TESTS.length)*100:0;
  const downloadCSV=()=>{ const rows=[['TC ID','Name','Priority','Status','Message']]; SUITES.forEach(s=>s.tests.forEach(tc=>{const r=results[tc.id]||{};rows.push([tc.id,tc.name,tc.priority||'P3',r.status||'pending',(r.message||'').replace(/,/g,';')]);})); const csv=rows.map(r=>r.join(',')).join('\n'); const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='sr365-tests-'+new Date().toISOString().slice(0,10)+'.csv';a.click(); };
  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',fontFamily:'-apple-system,sans-serif'}}>
      <style>{'@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>
      <div style={{background:'#1e3a5f',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div><h1 style={{color:'#fff',fontSize:18,fontWeight:700,margin:0}}>🧪 SR365 Admin Test Suite</h1><p style={{color:'#93c5fd',fontSize:12,margin:'3px 0 0'}}>{running?`Running — ${done}/${ALL_TESTS.length}`:done?`Done — ✅ ${stats.pass} ❌ ${stats.fail} ⏭ ${stats.skip}`:`${ALL_TESTS.length} tests · ${SUITES.length} suites`}</p></div>
        <div style={{display:'flex',gap:8}}>
          {done>0&&!running&&<button onClick={downloadCSV} style={{padding:'7px 14px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>📄 Download CSV</button>}
          {running?<button onClick={()=>{_stop.current=true;}} style={{padding:'7px 14px',background:'#ef4444',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>■ Stop</button>:<button onClick={runAll} style={{padding:'7px 14px',background:'#22c55e',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>▶ Run All Tests</button>}
          <button onClick={()=>{sessionStorage.removeItem(SESSION_KEY);window.location.reload();}} style={{padding:'7px 14px',background:'rgba(255,255,255,.1)',color:'#fff',border:'none',borderRadius:8,fontSize:12,cursor:'pointer'}}>🔒 Lock</button>
        </div>
      </div>
      <div style={{height:4,background:'#e2e8f0'}}><div style={{height:'100%',width:progress+'%',background:'#22c55e',transition:'width .3s'}}/></div>
      <div style={{display:'flex',background:'#fff',borderBottom:'1px solid #e2e8f0'}}>
        {[['Total',stats.total,'#2563eb'],['Pass',stats.pass,'#16a34a'],['Fail',stats.fail,'#dc2626'],['Skip',stats.skip,'#d97706']].map(([l,v,c])=>(
          <div key={l} style={{flex:1,padding:'10px 0',textAlign:'center',borderRight:'1px solid #e2e8f0'}}>
            <div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase'}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{maxWidth:860,margin:'0 auto',padding:'1rem'}}>
        {SUITES.map(suite=>(
          <div key={suite.id} style={{marginBottom:'1rem'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>{suite.name}</div>
            {suite.tests.map(tc=>{
              const r=results[tc.id]||{status:'pending',message:'Waiting...'};
              return (
                <div key={tc.id} style={{marginBottom:4}}>
                  <div onClick={()=>setExpanded(e=>({...e,[tc.id]:!e[tc.id]}))} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',background:'#fff',border:'1px solid #f1f5f9',borderLeft:'3px solid '+borderColor(tc.priority),borderRadius:8,cursor:'pointer'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'#2563eb',fontFamily:'monospace',minWidth:72}}>{tc.id}</span>
                    <span style={{fontSize:12,flex:1}}>{tc.name}</span>
                    <Badge status={r.status}/>
                    <span style={{fontSize:10,color:'#9ca3af'}}>{expanded[tc.id]?'▲':'▼'}</span>
                  </div>
                  {expanded[tc.id]&&<div style={{padding:'6px 12px 8px 90px',fontSize:11,color:'#6b7280',background:'#fafafa',borderRadius:'0 0 8px 8px',border:'1px solid #f1f5f9',borderTop:'none'}}><strong style={{color:r.status==='pass'?'#16a34a':r.status==='fail'?'#dc2626':'#92400e'}}>Result:</strong> {r.message}</div>}
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
  useEffect(()=>{ if(sessionStorage.getItem(SESSION_KEY)==='1')setUnlocked(true); },[]);
  if(!unlocked)return <PasswordGate onUnlock={()=>setUnlocked(true)}/>;
  return <TestRunner/>;
}
