import { useState, useEffect } from 'react';

const ADMIN_HASH = 'b89815ec9b87bdc40215bc27947f673568d39a675f78d61bd90c279d73cab6c3';
const SESSION_KEY = 'sr365_sitemap_unlocked';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const SECTIONS = [
  {
    name: 'Public Pages', icon: '🌐', color: '#2563eb',
    pages: [
      { name: 'Landing / Home',     page: 'landing',             desc: 'Hero, leaderboard preview, scoring overview, join waitlist CTAs' },
      { name: 'Leaderboard',        page: 'leaderboard',         desc: 'Full ranked list of Microsoft professionals by Stack Points' },
      { name: 'Scoring',            page: 'scoring',             desc: 'How Stack Points are calculated' },
      { name: 'How It Works',       page: 'how-it-works',        desc: 'Step-by-step onboarding explainer' },
      { name: 'About',              page: 'about',               desc: 'Mission, team, platform story' },
      { name: 'Pricing',            page: 'pricing',             desc: 'Free / Pro ($9/mo) / Recruiter ($49/mo) tiers' },
      { name: 'Privacy Policy',     page: 'privacy',             desc: 'GDPR compliance, data handling' },
    ],
  },
  {
    name: 'Authentication', icon: '🔐', color: '#7c3aed',
    pages: [
      { name: 'Sign In',  page: 'signin',  desc: 'Email/password + Microsoft Azure OAuth' },
      { name: 'Sign Up',  page: 'signup',  desc: 'New account registration' },
    ],
  },
  {
    name: 'User Dashboard', icon: '👤', color: '#059669',
    note: 'Requires sign-in',
    pages: [
      { name: 'Overview',        page: 'dashboard', tab: 'Overview',        desc: 'Score breakdown, Stack Points, tier badge, boost suggestions' },
      { name: 'Certifications',  page: 'dashboard', tab: 'Certifications',  desc: 'Add and view Microsoft certifications' },
      { name: 'Verify',          page: 'dashboard', tab: 'Verify',          desc: 'Certification verification — MS Learn transcript, Credly badge' },
      { name: 'Projects',        page: 'dashboard', tab: 'Projects',        desc: 'Log project experience for Stack Points' },
      { name: 'Settings',        page: 'dashboard', tab: 'Settings',        desc: 'Profile form, password reset, Resume Analyser (bio summary)' },
    ],
  },
  {
    name: 'Recruiter', icon: '🎯', color: '#d97706',
    pages: [
      { name: 'Recruiter Dashboard', page: 'recruiter-dashboard', desc: 'Search candidates. Requires Recruiter tier.' },
    ],
  },
  {
    name: 'Admin Pages', icon: '🔒', color: '#dc2626',
    note: 'Password protected — not linked from public navigation',
    pages: [
      { name: 'Admin Test Suite', page: 'sr365-admin-tools', desc: '69 automated tests across 12 suites', pw: 'SR365@AdminTools#2026!Secure' },
      { name: 'Admin Fraud Review', page: 'admin-fraud', desc: 'Review profiles flagged by fraud detection' },
      { name: 'Admin Sitemap', page: 'sr365-sitemap', desc: 'This page', pw: 'SR365@AdminTools#2026!Secure' },
    ],
  },
  {
    name: 'Edge Functions', icon: '⚡', color: '#0891b2',
    note: 'Supabase edge functions — POST to /functions/v1/<name>',
    pages: [
      { name: 'analyse-resume',          fn: 'analyse-resume',          desc: 'Reads a CV PDF and generates a concise 80-word Microsoft-focused profile summary. Supports revise_note for AI regeneration.' },
      { name: 'batch-verify-certs',      fn: 'batch-verify-certs',      desc: 'Batch verifies certifications against cert_catalog using fuzzy + API matching.' },
      { name: 'cert-expiry-reminders',   fn: 'cert-expiry-reminders',   desc: 'Sends email reminders for certs expiring within 90 or 30 days.' },
      { name: 'detect-fake-profiles',    fn: 'detect-fake-profiles',    desc: 'Scans profiles for fraud signals, updates fraud_score and fraud_status.' },
      { name: 'recruiter-match',         fn: 'recruiter-match',         desc: 'Accepts a job description. Uses Claude AI to rank matching candidate profiles.' },
      { name: 'sync-catalog',            fn: 'sync-catalog',            desc: 'Syncs Microsoft certification catalog from MS Learn into cert_catalog table.' },
      { name: 'verify-cert',             fn: 'verify-cert',             desc: 'Verifies a single certification. Updates score_multiplier to 1.00 when verified.' },
      { name: 'verify-reputation',       fn: 'verify-reputation',       desc: 'Checks GitHub, MVP lists, LinkedIn presence to compute reputation_score.' },
    ],
  },
  {
    name: 'Key CTAs — Landing', icon: '🎯', color: '#be185d',
    pages: [
      { name: '🚀 Join the Waitlist',           cta: true, desc: 'Primary CTA → Sign Up' },
      { name: 'View full leaderboard →',        cta: true, desc: '→ ?page=leaderboard' },
      { name: 'View full scoring breakdown →',  cta: true, desc: '→ ?page=scoring' },
      { name: 'Read the full guide →',          cta: true, desc: '→ ?page=how-it-works' },
      { name: 'View Rankings',                  cta: true, desc: '→ ?page=leaderboard' },
      { name: 'Get Early Access',               cta: true, desc: '→ Sign Up' },
    ],
  },
  {
    name: 'Key CTAs — Pricing', icon: '💳', color: '#0d9488',
    pages: [
      { name: 'Get started free',         cta: true, desc: 'Free tier sign-up' },
      { name: 'Start Pro — 14 days free', cta: true, desc: 'Pro tier — Stripe (not yet wired)' },
      { name: 'Start Recruiter trial',    cta: true, desc: 'Recruiter tier — Stripe (not yet wired)' },
    ],
  },
];

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const attempt = async () => {
    setLoading(true); setError('');
    const hash = await sha256(pw);
    if (hash === ADMIN_HASH) { sessionStorage.setItem(SESSION_KEY, '1'); onUnlock(); }
    else { setError('Incorrect password.'); setPw(''); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'-apple-system,sans-serif' }}>
      <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'2rem', width:340, textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:'1rem' }}>🗺️</div>
        <h1 style={{ fontSize:16, fontWeight:700, color:'#f1f5f9', margin:'0 0 .3rem' }}>Admin Sitemap</h1>
        <p style={{ fontSize:12, color:'#64748b', margin:'0 0 1.5rem' }}>StackRank365 — All Features & Pages</p>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder="Admin password" autoFocus
          style={{ width:'100%', padding:'10px 12px', fontSize:14, background:'#0f172a', border:'1px solid #334155', borderRadius:8, color:'#f1f5f9', marginBottom:10, outline:'none', fontFamily:'monospace' }}/>
        {error && <p style={{ fontSize:12, color:'#f87171', margin:'0 0 10px' }}>{error}</p>}
        <button onClick={attempt} disabled={loading||!pw}
          style={{ width:'100%', padding:10, background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', opacity:(!pw||loading)?0.5:1 }}>
          {loading ? 'Checking...' : 'Unlock'}
        </button>
      </div>
    </div>
  );
}

function SitemapContent() {
  const navigate = (page) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:'-apple-system,sans-serif' }}>
      <div style={{ background:'#1e3a5f', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <div>
          <h1 style={{ color:'#fff', fontSize:18, fontWeight:700, margin:0 }}>🗺️ SR365 Admin Sitemap</h1>
          <p style={{ color:'#93c5fd', fontSize:12, margin:'3px 0 0' }}>All pages, features, edge functions, and CTAs</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={()=>navigate('sr365-admin-tools')}
            style={{ padding:'7px 14px', background:'rgba(255,255,255,.1)', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>
            🧪 Test Suite
          </button>
          <button onClick={()=>{ sessionStorage.removeItem(SESSION_KEY); window.location.reload(); }}
            style={{ padding:'7px 14px', background:'rgba(255,255,255,.1)', color:'#fff', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>
            🔒 Lock
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'1.5rem' }}>
        {SECTIONS.map(section => (
          <div key={section.name} style={{ marginBottom:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem', paddingBottom:'0.5rem', borderBottom:'2px solid '+section.color+'33' }}>
              <span style={{ fontSize:18 }}>{section.icon}</span>
              <span style={{ fontSize:14, fontWeight:700, color:'#1e293b' }}>{section.name}</span>
              <span style={{ fontSize:11, color:'#9ca3af' }}>({section.pages.length})</span>
            </div>
            {section.note && <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 0.75rem', fontStyle:'italic' }}>{section.note}</p>}

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:10 }}>
              {section.pages.map(item => (
                <div key={item.name} style={{ background:'#fff', border:'1px solid #e2e8f0', borderLeft:'3px solid '+section.color, borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1e293b', marginBottom:3 }}>{item.name}</div>
                    <div style={{ fontSize:11, color:'#6b7280', lineHeight:1.5 }}>{item.desc}</div>
                    {item.tab && <div style={{ fontSize:10, color:section.color, fontWeight:600, marginTop:4 }}>Tab: {item.tab}</div>}
                    {item.pw && <div style={{ fontSize:10, color:'#9ca3af', marginTop:4, fontFamily:'monospace' }}>PW: {item.pw}</div>}
                    {item.fn && <div style={{ fontSize:10, color:'#9ca3af', marginTop:4, fontFamily:'monospace' }}>/functions/v1/{item.fn}</div>}
                  </div>
                  {item.page && !item.cta && !item.fn && (
                    <button onClick={()=>navigate(item.page)}
                      style={{ padding:'4px 10px', fontSize:11, background:section.color, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>
                      Open →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop:'2rem', padding:'1rem', background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:11, color:'#9ca3af' }}>
          All pages use <code>?page=slug</code> routing.
          Admin Sitemap: <code>?page=sr365-sitemap</code> ·
          Test Suite: <code>?page=sr365-admin-tools</code>
        </div>
      </div>
    </div>
  );
}

export default function AdminSitemap() {
  const [unlocked, setUnlocked] = useState(false);
  useEffect(() => { if (sessionStorage.getItem(SESSION_KEY) === '1') setUnlocked(true); }, []);
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  return <SitemapContent />;
}
