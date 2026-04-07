import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CERTIFICATIONS, getRankTier, getNextRankTier, SPECIALIZATIONS } from '../data/data';
import ResumeAnalyser from '../components/ResumeAnalyser';

async function getSupabase() {
  try {
    const mod = await import('../lib/supabase.js');
    if (mod.SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
    return mod.supabase;
  } catch { return null; }
}

// ─── Cert modal ───────────────────────────────────────────────────────────────
function CertModal({ onClose, onAdd }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [issueDate, setIssueDate] = useState('');
  const tierColors = { Fundamentals: 'badge-muted', Associate: 'badge-blue', Expert: 'badge-gold', 'Applied Skills': 'badge-green' };
  const filtered = CERTIFICATIONS.filter(c =>
    c.status !== 'retiring' &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()) || c.specialization.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>Add Certification</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <input className="input" placeholder="Search by name, code or specialization..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '1rem' }} autoFocus />
        <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filtered.map(cert => (
            <div key={cert.code} onClick={() => setSelected(cert)} style={{
              padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
              background: selected?.code === cert.code ? 'var(--blue-dim)' : 'var(--surface2)',
              border: `1px solid ${selected?.code === cert.code ? 'var(--border-blue)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{cert.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'Open Sans' }}>{cert.code} · {cert.specialization}</div>
              </div>
              <span className={`badge ${tierColors[cert.tier]}`} style={{ fontSize: '0.68rem', flexShrink: 0 }}>{cert.tier}</span>
              <span style={{ fontFamily: 'Open Sans', fontSize: '0.78rem', color: 'var(--green)', flexShrink: 0 }}>+{cert.points}</span>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--muted2)' }}>No certifications found</div>}
        </div>
        {selected && (
          <div>
            <div className="form-group">
              <label className="label">Issue Date</label>
              <input className="input" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { if (!issueDate) return; onAdd({ ...selected, issueDate }); onClose(); }}>
                Add {selected.code} (+{selected.points} pts)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Project modal ────────────────────────────────────────────────────────────
function ProjectModal({ onClose, onAdd, project }) {
  const [form, setForm] = useState(project || {
    title: '', role: '', description: '', industry: '',
    privacy_mode: 'public', enterprise: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const pts = form.enterprise ? 2000 : 800;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>{project ? 'Edit Project' : 'Add Project'}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label className="label">Project Title</label>
          <input className="input" placeholder="D365 F&O Finance Implementation" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Your Role</label>
          <input className="input" placeholder="Solution Architect" value={form.role} onChange={e => set('role', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Description</label>
          <textarea className="input" placeholder="Brief description of the project..." value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 72 }} />
        </div>
        <div className="form-group">
          <label className="label">Privacy Mode</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[['public', '🌍 Public'], ['anonymised', '👤 Anonymised'], ['confidential', '🔒 Confidential']].map(([val, label]) => (
              <button key={val} type="button" className={`btn btn-sm ${form.privacy_mode === val ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => set('privacy_mode', val)} style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            {form.privacy_mode === 'anonymised' ? 'Client name hidden, details shown' : form.privacy_mode === 'confidential' ? 'Only project title shown publicly' : 'All details visible'}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text)', marginBottom: '1.25rem' }}>
          <input type="checkbox" checked={form.enterprise} onChange={e => set('enterprise', e.target.checked)} />
          Enterprise project (+2,000 pts)
        </label>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Colleague Validation (Optional)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted2)', marginBottom: '1rem' }}>
            Add a colleague who worked on this project. We'll send them a request to validate your involvement.
          </p>
          <div className="form-group">
            <label className="label">Colleague Full Name</label>
            <input className="input" placeholder="Alex Johnson" value={form.colleague_name || ''} onChange={e => set('colleague_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Their Role on Project</label>
            <input className="input" placeholder="Project Manager" value={form.colleague_role || ''} onChange={e => set('colleague_role', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Your Relationship</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Line Manager', 'Peer', 'Direct Report', 'Client', 'Vendor'].map(rel => (
                <button key={rel} type="button" className={`btn btn-sm ${form.colleague_relationship === rel ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => set('colleague_relationship', rel)} style={{ fontSize: '0.75rem' }}>
                  {rel}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label">Colleague Email</label>
            <input className="input" type="email" placeholder="alex.johnson@company.com" value={form.colleague_email || ''} onChange={e => set('colleague_email', e.target.value)} />
          </div>
        </div>
        <div className="card" style={{ background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.2)', padding: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--green)', fontWeight: 600 }}>This project will earn +{pts.toLocaleString()} Stack Points</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => { if (!form.title) return; onAdd({ ...form, points: pts }); onClose(); }}>
            {project ? 'Save Changes' : `Add Project (+${pts} pts)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Verify tab ───────────────────────────────────────────────────────────────
function VerifyTab({ user, setUser, showToast, authUser }) {
  const [method, setMethod] = useState('ms_learn'); // 'ms_learn' | 'credly'
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [result, setResult] = useState(null);

  const unverified = (user.certifications || []).filter(c => !c.verified);
  const verified   = (user.certifications || []).filter(c => c.verified);

  const handleVerify = async () => {
    if (!url.trim()) { showToast('Paste a URL first', 'error'); return; }
    setStatus('loading'); setResult(null);
    try {
      const { verifyMSLearnTranscript, verifyCredlyBadge } = await import('../lib/certVerify.js');
      const res = method === 'ms_learn' ? await verifyMSLearnTranscript(url) : await verifyCredlyBadge(url);
      if (!res.success) { setStatus('error'); setResult(res); return; }
      // Mark matching certs as verified
      const updatedCerts = (user.certifications || []).map(c => {
        const match = res.certs.find(rc => rc.code === c.code);
        return match ? { ...c, verified: true, verifiedVia: res.source, verifyUrl: url } : c;
      });
      // Also persist to Supabase
      const sb = await getSupabase();
      if (sb && authUser) {
        for (const c of updatedCerts.filter(c => c.verified && c.dbId)) {
          await sb.from('certifications').update({
            verified: true, verified_via: res.source,
            verify_url: url, verified_at: new Date().toISOString(),
          }).eq('id', c.dbId);
        }
      }
      setUser({ ...user, certifications: updatedCerts });
      setStatus('success');
      setResult({ ...res, matched: res.certs.filter(rc => (user.certifications || []).find(c => c.code === rc.code)) });
    } catch (e) {
      setStatus('error'); setResult({ error: 'Verification failed. Please try again.' });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.4rem' }}>Verify Your Certifications</h3>
        <p style={{ color: 'var(--muted2)', fontSize: '0.88rem', margin: 0 }}>
          Verified certifications earn full Stack Points and display a ✓ badge on your profile.
        </p>
      </div>

      {/* Status summary */}
      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.1rem', borderLeft: '3px solid var(--green)' }}>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.6rem', color: 'var(--green)' }}>{verified.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>Verified certifications</div>
        </div>
        <div className="card" style={{ padding: '1.1rem', borderLeft: '3px solid var(--gold)' }}>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.6rem', color: 'var(--gold)' }}>{unverified.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>Awaiting verification</div>
        </div>
      </div>

      {unverified.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.5rem', background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontWeight: 600, color: 'var(--green)' }}>All certifications verified!</div>
        </div>
      )}

      {/* Verification form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Submit verification URL</h4>

        {/* Method selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {[
            ['ms_learn', '🎓 Microsoft Learn Transcript'],
            ['credly',   '🏅 Credly Badge'],
          ].map(([val, label]) => (
            <button key={val} className={`btn btn-sm ${method === val ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setMethod(val); setUrl(''); setStatus(null); setResult(null); }}
              style={{ flex: 1, justifyContent: 'center' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="card" style={{ background: 'var(--surface2)', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--muted2)', lineHeight: 1.6 }}>
          {method === 'ms_learn' ? (
            <>
              <strong style={{ color: 'var(--text)' }}>How to get your transcript share link:</strong><br />
              1. Go to <span style={{ color: 'var(--blue)' }}>learn.microsoft.com</span> → click your profile photo → <strong style={{ color: 'var(--text)' }}>Profile</strong><br />
              2. Click the <strong style={{ color: 'var(--text)' }}>Transcript</strong> tab → click <strong style={{ color: 'var(--text)' }}>Share</strong><br />
              3. Set visibility to <strong style={{ color: 'var(--text)' }}>Public</strong> → copy the share link<br />
              <span style={{ color: 'var(--gold)' }}>⚠ The share link starts with learn.microsoft.com/api/credentials/share/... — your profile URL won't work</span>
            </>
          ) : (
            <>
              <strong style={{ color: 'var(--text)' }}>How to get your Credly badge URL:</strong><br />
              1. Go to <span style={{ color: 'var(--blue)' }}>credly.com</span> → sign in → click your badge<br />
              2. Copy the page URL (e.g. credly.com/badges/abc-123-def)<br />
              3. Make sure the badge is set to <strong style={{ color: 'var(--text)' }}>Public</strong> on Credly<br />
              <span style={{ color: 'var(--gold)' }}>⚠ Only Microsoft exam certifications count (e.g. PL-400, AZ-900) — not achievement or partner badges</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input className="input" style={{ flex: 1 }}
            placeholder={method === 'ms_learn'
              ? 'https://learn.microsoft.com/api/credentials/share/en-us/YourName/abc123'
              : 'https://www.credly.com/badges/abc-123-def-456'
            }
            value={url} onChange={e => setUrl(e.target.value)} />
          <button className="btn btn-primary" onClick={handleVerify} disabled={status === 'loading'} style={{ flexShrink: 0 }}>
            {status === 'loading' ? '⏳ Verifying...' : '✓ Verify'}
          </button>
        </div>

        {/* Result */}
        {status === 'success' && result && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: 'var(--green)', marginBottom: '0.5rem' }}>
              ✅ Verified {result.matched?.length || 0} certification{(result.matched?.length || 0) !== 1 ? 's' : ''}
            </div>
            {(result.matched || []).map(c => (
              <div key={c.code} style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>• {c.code} — {c.name}</div>
            ))}
          </div>
        )}
        {status === 'error' && result && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: '#f87171', marginBottom: '0.25rem' }}>❌ Verification failed</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>{result.error}</div>
          </div>
        )}
      </div>

      {/* Unverified list */}
      {unverified.length > 0 && (
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--muted2)', marginBottom: '0.75rem' }}>Unverified certifications</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {unverified.map((cert, i) => (
              <div key={i} className="card" style={{ padding: '0.85rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '3px solid var(--gold)' }}>
                <span style={{ fontSize: '1.1rem' }}>🎓</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cert.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'Open Sans' }}>{cert.code}</div>
                </div>
                <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function ProfileCompleteBar({ user, certs, projects }) {
  const fields = [
    { label: 'Name', done: !!(user && user.name) },
    { label: 'Headline', done: !!(user && user.headline) },
    { label: 'Bio', done: !!(user && user.bio) },
    { label: 'Location', done: !!(user && user.location) },
    { label: 'Specialization', done: !!(user && user.specialization) },
    { label: 'First certification', done: certs && certs.length > 0 },
    { label: 'First project', done: projects && projects.length > 0 },
  ];
  const done = fields.filter(f => f.done).length;
  const pct = Math.round(done / fields.length * 100);
  const missing = fields.filter(f => !f.done).map(f => f.label).join(', ');
  if (pct === 100) return null;
  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Profile completeness</span>
        <span style={{ fontFamily: 'Open Sans', fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.4rem' }}>
        <div style={{ height: '100%', width: pct + '%', background: 'var(--blue)', borderRadius: 99 }} />
      </div>
      {missing && <p style={{ fontSize: '0.75rem', color: 'var(--muted2)', margin: 0 }}>Still needed: <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{missing}</strong></p>}
    </div>
  );
}

function OnboardingBanner({ score, setActiveTab }) {
  if (score > 0) return null;
  return (
    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>👋</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>Welcome to StackRank365!</div>
        <p style={{ fontSize: '0.83rem', color: 'var(--muted2)', marginBottom: '0.75rem' }}>Complete your profile to get your Stack Points score and appear on the leaderboard.</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('certifications')}>🎓 Add a certification</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('settings')}>✏️ Complete profile</button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { user, setUser, showToast, calcScore, getTierInfo, authUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCertModal, setShowCertModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [communityItems, setCommunityItems] = useState([]);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [communityForm, setCommunityForm] = useState({ type: 'speaking_ms', title: '', url: '', event_date: '' });
  const [validations, setValidations] = useState([]);
  const [validationsLoading, setValidationsLoading] = useState(false);
  const [validatingProject, setValidatingProject] = useState(null);

  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h2>Sign in to access your dashboard</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('signup')}>Create Profile</button>
            <button className="btn btn-outline" onClick={() => onNavigate('signin')}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  const score = calcScore();
  const { rank, nextRank, pointsToNext } = getTierInfo();
  const certs = user.certifications || [];
  const projects = user.projects || [];
  const progressPct = nextRank ? Math.round(((score - rank.minScore) / (nextRank.minScore - rank.minScore)) * 100) : 100;

  const addCert = async (cert) => {
    const sb = await getSupabase();
    let dbId;
    if (sb && authUser) {
      const { data } = await sb.from('certifications').insert({
        user_id: authUser.id, code: cert.code, name: cert.name, tier: cert.tier,
        specialization: cert.specialization, points: cert.points, issue_date: cert.issueDate,
        scarcity_multiplier: !!cert.scarcityMultiplier, verified: false,
      }).select().single();
      dbId = data?.id;
    }
    setUser({ ...user, certifications: [...certs, { ...cert, dbId, verified: false }] });
    showToast(`${cert.code} added! Verify it to earn +${cert.points} Stack Points`, 'success');
  };

  const removeCert = async (code, dbId) => {
    const sb = await getSupabase();
    if (sb && dbId) await sb.from('certifications').delete().eq('id', dbId);
    setUser({ ...user, certifications: certs.filter(c => c.code !== code) });
    showToast('Certification removed', 'info');
  };

  const addProject = async (proj) => {
    const sb = await getSupabase();
    let id = Date.now();
    if (sb && authUser) {
      const { data } = await sb.from('projects').insert({
        user_id: authUser.id, title: proj.title, role: proj.role,
        description: proj.description, industry: proj.industry,
        privacy_mode: proj.privacy_mode, enterprise: proj.enterprise,
        validated: false, points: proj.points,
        colleague_name: proj.colleague_name || null,
        colleague_role: proj.colleague_role || null,
        colleague_relationship: proj.colleague_relationship || null,
        colleague_email: proj.colleague_email || null,
      }).select().single();
      // If colleague email provided, create validation request
      if (data?.id && proj.colleague_email) {
        await sb.from('project_validations').insert({
          project_id: data.id, user_id: authUser.id,
          colleague_name: proj.colleague_name, colleague_email: proj.colleague_email,
          colleague_role: proj.colleague_role, relationship: proj.colleague_relationship,
          status: 'pending',
        });
        showToast('Validation request sent to ' + proj.colleague_name, 'info');
      }
      if (data) id = data.id;
    }
    setUser({ ...user, projects: [...projects, { ...proj, id }] });
    showToast(`Project added! +${proj.points.toLocaleString()} Stack Points`, 'success');
  };

  const removeProject = async (id) => {
    const sb = await getSupabase();
    if (sb) await sb.from('projects').delete().eq('id', id);
    setUser({ ...user, projects: projects.filter(p => p.id !== id) });
    showToast('Project removed', 'info');
  };

  const handleSignOut = async () => {
    const sb = await getSupabase();
    if (sb) await sb.auth.signOut();
    setUser(null);
    showToast('Signed out', 'info');
    onNavigate('landing');
  };

  const loadCommunityItems = async () => {
    const sb = await getSupabase();
    if (!sb || !authUser) return;
    const { data } = await sb.from('community_contributions')
      .select('*').eq('user_id', authUser.id).eq('status', 'active').order('created_at', { ascending: false });
    setCommunityItems(data || []);
  };

  const loadValidations = async () => {
    const sb = await getSupabase();
    if (!sb || !authUser) return;
    setValidationsLoading(true);
    const { data } = await sb.from('project_validations')
      .select(`*, projects(title)`)
      .eq('user_id', authUser.id)
      .order('sent_at', { ascending: false });
    setValidations(data || []);
    setValidationsLoading(false);
  };

  const withdrawValidation = async (id) => {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.from('project_validations').update({ status: 'withdrawn' }).eq('id', id);
    setValidations(v => v.map(x => x.id === id ? { ...x, status: 'withdrawn' } : x));
    showToast('Validation request withdrawn', 'info');
  };

  const resendValidation = async (id) => {
    const sb = await getSupabase();
    if (!sb) return;
    await sb.from('project_validations').update({ status: 'pending', sent_at: new Date().toISOString() }).eq('id', id);
    setValidations(v => v.map(x => x.id === id ? { ...x, status: 'pending' } : x));
    showToast('Validation request resent', 'success');
  };

  const tabs = [
    { id: 'overview',       label: '📊 Overview' },
    { id: 'certifications', label: '🎓 Certifications' },
    { id: 'verify',         label: '✅ Verify' },
    { id: 'projects',       label: '🏗️ Projects' },
    { id: 'community',      label: '⭐ Community' },
    { id: 'validations',    label: '🤝 Validations' },
    { id: 'cv',             label: '📄 CV Analyser' },
    { id: 'settings',       label: '⚙️ Settings' },
  ];

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>Dashboard</div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: '0.25rem' }}>
              Welcome back, {user.first_name || (user.name || '').split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--muted2)', fontSize: '0.95rem' }}>{user.headline} · {user.specialization}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={() => onNavigate('profile')}>👁️ Public Profile</button>
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut} style={{ color: 'var(--muted2)' }}>Sign Out</button>
          </div>
        </div>

        {/* Score overview */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card-glow" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Stack Points</div>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '2.5rem', color: 'var(--blue)', lineHeight: 1 }}>{score.toLocaleString()}</div>
            <div style={{ marginTop: '0.75rem' }}>
              <span className={`badge ${rank.colorClass}`} style={{ fontSize: '0.75rem' }}>{rank.icon} {rank.name}</span>
            </div>
            {nextRank && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted2)', marginBottom: '0.3rem' }}>
                  <span>→ {nextRank.name}</span>
                  <span style={{ fontFamily: 'Open Sans' }}>{pointsToNext.toLocaleString()} pts</span>
                </div>
                <div className="progress-track" style={{ height: 5 }}>
                  <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
          </div>
          {[
            { label: 'Certifications', val: certs.filter(c => c.verified).length, icon: '🎓', sub: 'verified', color: 'var(--green)' },
            { label: 'Projects',       val: projects.length, icon: '🏗️', sub: 'logged', color: 'var(--blue)' },
            { label: 'Pending',        val: certs.filter(c => !c.verified).length, icon: '⏳', sub: 'to verify', color: 'var(--gold)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.8rem', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted2)' }}>{s.label} · {s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => { setActiveTab(t.id); if (t.id === 'validations') loadValidations(); if (t.id === 'community') loadCommunityItems(); }}>
              {t.label}
              {t.id === 'verify' && certs.filter(c => !c.verified).length > 0 && (
                <span style={{ marginLeft: '0.4rem', background: 'var(--gold)', color: '#000', borderRadius: 10, padding: '0 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                  {certs.filter(c => !c.verified).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
          <OnboardingBanner score={calcScore()} setActiveTab={setActiveTab} />
          <ProfileCompleteBar user={user} certs={certs} projects={projects} />
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>📊 Score Breakdown</h3>
              {[
                { label: 'Certifications', pts: certs.filter(c=>c.verified).reduce((s,c)=>s+(c.points||500),0), max: 12000, color: 'var(--green)' },
                { label: 'Projects', pts: projects.length * 800, max: 5000, color: 'var(--blue)' },
                { label: 'Peer Validations', pts: projects.filter(p=>p.validated).length * 300, max: 2000, color: 'var(--purple)' },
                { label: 'Community', pts: 500, max: 1500, color: 'var(--gold)' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'Open Sans', fontSize: '0.8rem', color: item.color }}>{item.pts.toLocaleString()} pts</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min((item.pts/item.max)*100,100)}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>🚀 Boost Your Score</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { icon: '🎓', title: 'Add your certifications', pts: '+500–3,000 pts each', done: certs.length > 0, tab: 'certifications' },
                  { icon: '✅', title: 'Verify your certifications', pts: 'Unlock full points', done: certs.some(c=>c.verified), tab: 'verify' },
                  { icon: '🏗️', title: 'Log project experience', pts: '+800–2,000 pts each', done: projects.length > 0, tab: 'projects' },
                  { icon: '📝', title: 'Complete your bio', pts: '+150 pts', done: !!user.bio, tab: 'settings' },
                ].map(item => (
                  <div key={item.title} onClick={() => setActiveTab(item.tab)} style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', borderRadius: 10, cursor: 'pointer',
                    background: item.done ? 'var(--green-dim)' : 'var(--surface2)',
                    border: `1px solid ${item.done ? 'rgba(0,229,160,0.2)' : 'var(--border)'}`,
                    opacity: item.done ? 0.7 : 1,
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.done ? '✅' : item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: item.done ? 'var(--green)' : '#fff', textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--muted2)' }}>{item.pts}</div>
                    </div>
                    {!item.done && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>→</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

          </>
        )}

        {/* Certifications */}
        {activeTab === 'certifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Your Certifications</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', margin: '0.25rem 0 0' }}>
                  {certs.length} added · {certs.filter(c=>c.verified).length} verified
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowCertModal(true)}>+ Add Certification</button>
            </div>
            {/* T16: Cert expiry warnings */}
            {certs.filter(c => c.issueDate && (() => { const exp = new Date(c.issueDate); exp.setFullYear(exp.getFullYear()+1); const daysLeft = Math.ceil((exp-Date.now())/(1000*60*60*24)); return daysLeft <= 90 && daysLeft > 0; })()).length > 0 && (
              <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.83rem' }}>
                <strong style={{ color:'var(--gold)' }}>⏰ Renewal reminder</strong>
                <span style={{ color:'var(--muted2)', marginLeft:'0.5rem' }}>
                  {certs.filter(c => c.issueDate && (() => { const exp = new Date(c.issueDate); exp.setFullYear(exp.getFullYear()+1); const daysLeft = Math.ceil((exp-Date.now())/(1000*60*60*24)); return daysLeft <= 90 && daysLeft > 0; })()).map(c => c.code || c.name).join(', ')} expire{certs.filter(c => c.issueDate).length===1?'s':''} within 90 days. Renew on Microsoft Learn to keep your score.
                </span>
              </div>
            )}

            {certs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No certifications yet</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Add your Microsoft certifications to earn Stack Points.</p>
                <button className="btn btn-primary" onClick={() => setShowCertModal(true)}>Add your first certification</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {certs.map((cert, i) => (
                  <div key={i} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `3px solid ${cert.verified ? 'var(--green)' : 'var(--gold)'}` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: cert.verified ? 'var(--green-dim)' : 'var(--gold-dim)', border: `1px solid ${cert.verified ? 'rgba(0,229,160,0.2)' : 'rgba(255,200,60,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      {cert.verified ? '✅' : '🎓'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{cert.name}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Open Sans', fontSize: '0.72rem', color: 'var(--muted)' }}>{cert.code}</span>
                        <span className={`badge ${cert.tier === 'Fundamentals' ? 'badge-muted' : cert.tier === 'Associate' ? 'badge-blue' : cert.tier === 'Expert' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>{cert.tier}</span>
                        {cert.verified ? <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Verified via {cert.verifiedVia === 'ms_learn' ? 'MS Learn' : 'Credly'}</span>
                          : <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>⏳ Pending verification</span>}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'Open Sans', fontWeight: 700, color: cert.verified ? 'var(--green)' : 'var(--muted)', fontSize: '0.9rem', flexShrink: 0 }}>
                      {cert.verified ? `+${cert.points.toLocaleString()}` : 'verify to earn'}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeCert(cert.code, cert.dbId)} style={{ color: 'var(--red)', padding: '0.3rem 0.5rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {certs.filter(c => !c.verified).length > 0 && (
              <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                <button className="btn btn-outline" onClick={() => setActiveTab('verify')}>
                  ✅ Verify {certs.filter(c=>!c.verified).length} pending certification{certs.filter(c=>!c.verified).length !== 1 ? 's' : ''} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verify */}
        {activeTab === 'verify' && (
          <VerifyTab user={user} setUser={setUser} showToast={showToast} authUser={authUser} />
        )}

        {/* Projects */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Your Projects</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', margin: '0.25rem 0 0' }}>{projects.length} projects logged</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowProjectModal(true)}>+ Add Project</button>
            </div>
            {projects.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏗️</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No projects yet</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Log your real-world implementations to earn Stack Points.</p>
                <button className="btn btn-primary" onClick={() => setShowProjectModal(true)}>Add your first project</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {projects.map((proj) => (
                  <div key={proj.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{proj.title}</span>
                          {proj.enterprise && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Enterprise</span>}
                          {proj.validated && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Validated</span>}
                        </div>
                        {proj.role && <div style={{ fontSize: '0.82rem', color: 'var(--blue)' }}>{proj.role}</div>}
                        {proj.description && <p style={{ fontSize: '0.82rem', color: 'var(--muted2)', margin: '0.4rem 0 0' }}>{proj.description}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Open Sans', fontWeight: 700, color: 'var(--blue)', fontSize: '0.85rem' }}>+{(proj.enterprise ? 2000 : 800).toLocaleString()}</span>
                        {!proj.validated && (
                          <button className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', gap: '0.3rem' }}
                            onClick={() => setValidatingProject(proj)}>
                            ✅ Request Validation
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => removeProject(proj.id)} style={{ color: 'var(--red)', padding: '0.3rem 0.5rem' }}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {/* Community */}
        {activeTab === 'community' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Community Contributions</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', margin: '0.25rem 0 0' }}>
                  Earn up to 15% bonus on your primary score. Certifications and projects always lead.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowCommunityModal(true)}>+ Add Contribution</button>
            </div>

            {/* Cap progress bar */}
            {(() => {
              const primary = certs.filter(c=>c.verified!==false).reduce((s,c)=>s+(c.points||0),0) + projects.reduce((s,p)=>s+(p.points||0),0);
              const cap = Math.floor(primary * 0.15);
              const earned = communityItems.reduce((s,c)=>s+(c.points_awarded||0),0);
              const applied = Math.min(earned, cap);
              const pct = cap > 0 ? Math.min(100, Math.round(applied/cap*100)) : 0;
              return (
                <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>Community bonus applied</span>
                    <span style={{ fontFamily: 'Open Sans', fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 700 }}>{applied.toLocaleString()} / {cap.toLocaleString()} pts cap</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.4rem' }}>
                    <div style={{ height: '100%', width: pct+'%', background: 'var(--gold)', borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted2)', margin: 0 }}>Add more certifications or projects to raise your 15% cap ceiling.</p>
                </div>
              );
            })()}

            {/* Quick reference */}
            <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.75rem' }}>What earns community points</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {[
                  { label: 'Microsoft MVP',               pts: '+1,500/yr', auto: true  },
                  { label: 'Microsoft Certified Trainer', pts: '+800/yr',   auto: true  },
                  { label: 'Speaking at MS event',        pts: '+500',      auto: false },
                  { label: 'Speaking at community event', pts: '+300',      auto: false },
                  { label: 'Published blog or article',   pts: '+200',      auto: false },
                  { label: 'GitHub contributions',        pts: '+200/yr',   auto: true  },
                  { label: 'Peer validation given',       pts: '+300',      auto: true  },
                  { label: 'Peer referral',               pts: '+500',      auto: true  },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                    <span style={{ flex: 1, color: 'var(--muted2)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'Open Sans', color: 'var(--green)', fontWeight: 700 }}>{item.pts}</span>
                    <span style={{ fontSize: '0.72rem', color: item.auto ? 'var(--green)' : 'var(--gold)' }}>{item.auto ? '✅ Auto' : '📋 Reported'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contributions list */}
            {communityItems.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌟</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No contributions yet</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Add speaking events, blog posts, MVP status, or link your GitHub to earn bonus points.</p>
                <button className="btn btn-primary" onClick={() => setShowCommunityModal(true)}>Add your first contribution</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {communityItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>{item.type?.replace(/_/g,' ')} {item.event_date ? '· '+item.event_date : ''}</div>
                      {item.url && <a href={item.url} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: 'var(--blue)', display: 'block', marginTop: '0.2rem' }}>{item.url.slice(0,60)}</a>}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Open Sans', color: 'var(--gold)', fontWeight: 700 }}>+{(item.points_awarded||0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.72rem', marginTop: '0.2rem', color: item.verified ? 'var(--green)' : 'var(--gold)' }}>{item.verified ? '✅ Verified' : '📋 Reported'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add contribution modal */}
            {showCommunityModal && (
              <div className="modal-overlay" onClick={() => setShowCommunityModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0 }}>Add Community Contribution</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowCommunityModal(false)}>✕</button>
                  </div>
                  <div className="form-group">
                    <label className="label">Contribution Type</label>
                    <select className="input" value={communityForm.type} onChange={e => setCommunityForm(f=>({...f,type:e.target.value}))}>
                      <option value="speaking_ms">Speaking at Microsoft event (+500 pts)</option>
                      <option value="speaking_community">Speaking at community event (+300 pts)</option>
                      <option value="blog">Published blog post or article (+200 pts)</option>
                      <option value="mvp">Microsoft MVP (+1,500 pts/yr)</option>
                      <option value="mct">Microsoft Certified Trainer (+800 pts/yr)</option>
                      <option value="github">GitHub contributions (+200 pts/yr)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Title or Description</label>
                    <input className="input" placeholder="e.g. Power Platform session at Global Bootcamp 2026" value={communityForm.title} onChange={e => setCommunityForm(f=>({...f,title:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">URL (event page, blog post, GitHub profile)</label>
                    <input className="input" type="url" placeholder="https://..." value={communityForm.url} onChange={e => setCommunityForm(f=>({...f,url:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Date</label>
                    <input className="input" type="date" value={communityForm.event_date} onChange={e => setCommunityForm(f=>({...f,event_date:e.target.value}))} />
                  </div>
                  <div className="card" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--muted2)' }}>
                    📋 Self-declared contributions are labelled Reported and visible on your profile. MVP, MCT and GitHub are auto-verified.
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost" onClick={() => setShowCommunityModal(false)}>Cancel</button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={async () => {
                      if (!communityForm.title) { showToast('Add a title', 'error'); return; }
                      const pts = {speaking_ms:500,speaking_community:300,blog:200,mvp:1500,mct:800,github:200}[communityForm.type]||200;
                      const newItem = {...communityForm, points_awarded:pts, verified:false, status:'active'};
                      const sb = await getSupabase();
                      if (sb && authUser) {
                        const { data } = await sb.from('community_contributions').insert({user_id:authUser.id,...newItem}).select().single();
                        if (data) setCommunityItems(items=>[...items,data]);
                      } else { setCommunityItems(items=>[...items,{id:Date.now(),...newItem}]); }
                      setShowCommunityModal(false);
                      setCommunityForm({type:'speaking_ms',title:'',url:'',event_date:''});
                      showToast('Contribution added', 'success');
                    }}>Submit Contribution</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validations */}
        {activeTab === 'validations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Project Validation Requests</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', margin: '0.25rem 0 0' }}>
                  Requests sent to colleagues to validate your project involvement
                </p>
              </div>
            </div>
            {validationsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted2)' }}>Loading...</div>
            ) : validations.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No validation requests yet</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem' }}>
                  Add a colleague email when logging a project to request validation.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {validations.map(v => {
                  const statusColor = { pending: 'var(--gold)', approved: 'var(--green)', rejected: '#f87171', withdrawn: 'var(--muted2)' }[v.status] || 'var(--muted2)';
                  const statusIcon = { pending: '⏳', approved: '✅', rejected: '❌', withdrawn: '↩️' }[v.status] || '❓';
                  const canAct = v.status === 'pending';
                  return (
                    <div key={v.id} className="card" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{v.projects?.title || 'Project'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>
                            Sent to <strong>{v.colleague_name}</strong> ({v.colleague_email})
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted2)', marginTop: '0.25rem' }}>
                            {v.colleague_role} · {v.relationship} · {new Date(v.sent_at).toLocaleDateString()}
                          </div>
                          {v.response_note && (
                            <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--muted2)', marginTop: '0.4rem', borderLeft: '2px solid var(--border)', paddingLeft: '0.5rem' }}>
                              "{v.response_note}"
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: statusColor }}>
                            {statusIcon} {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                          </span>
                          {canAct && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn btn-sm btn-outline" onClick={() => resendValidation(v.id)} style={{ fontSize: '0.75rem' }}>Resend</button>
                              <button className="btn btn-sm" onClick={() => withdrawValidation(v.id)} style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,.15)', color: '#f87171', border: 'none' }}>Withdraw</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CV Analyser */}
        {activeTab === 'cv' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.25rem' }}>CV Analyser</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', margin: 0 }}>
                Upload your CV to generate a professional summary for your profile.
              </p>
            </div>
            <ResumeAnalyser
              onApprove={(summary) => {
                setUser(u => ({ ...u, bio: summary }));
                showToast('Profile summary updated — click Save Changes in Settings to persist', 'success');
              }}
            />
          </div>
        )}
        {/* Settings */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 600 }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Profile Settings</h3>
            <div className="card">
              <SettingsForm user={user} setUser={setUser} showToast={showToast} authUser={authUser} />

            </div>

            {/* T22: Profile Visibility */}
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Profile Visibility</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--muted2)', marginBottom: '1rem' }}>Control who can find and view your profile on StackRank365.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { value: 'public',     label: '🌍 Public',           desc: 'Anyone can find and view your full profile' },
                  { value: 'recruiters', label: '🔍 Recruiters only',  desc: 'Only verified recruiters can view your full profile' },
                  { value: 'private',    label: '🔒 Private',          desc: 'Your profile is hidden from search and leaderboard' },
                ].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', borderRadius: 8, cursor: 'pointer', border: `1px solid ${(user.profile_visibility||'public')===opt.value?'var(--blue)':'var(--border)'}`, background: (user.profile_visibility||'public')===opt.value?'rgba(59,130,246,0.06)':'transparent' }}>
                    <input type="radio" name="visibility" value={opt.value} checked={(user.profile_visibility||'public')===opt.value}
                      onChange={async()=>{
                        const sb = await getSupabase();
                        if(!sb||!authUser) return;
                        await sb.from('profiles').update({profile_visibility:opt.value}).eq('id',authUser.id);
                        setUser(u=>({...u,profile_visibility:opt.value}));
                        showToast('Visibility updated','success');
                      }} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* T23: Referral Link */}
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Your Referral Link</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--muted2)', marginBottom: '0.875rem' }}>Invite Microsoft professionals. Earn <strong style={{ color: 'var(--gold)' }}>+500 pts</strong> for each person who joins and completes their profile (up to 3,000 pts).</p>
              {(() => {
                const code = user.referral_code || (user.username || user.id || '').slice(0,8);
                const link = `https://www.stackrank365.com/?ref=${code}`;
                return (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 0.875rem', fontFamily: 'Open Sans', fontSize: '0.8rem', color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</div>
                    <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={()=>{
                      navigator.clipboard.writeText(link).then(()=>showToast('Referral link copied!','success')).catch(()=>showToast(link,'info'));
                    }}>Copy link</button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {showCertModal && <CertModal onClose={() => setShowCertModal(false)} onAdd={addCert} />}
      {showProjectModal && <ProjectModal onClose={() => setShowProjectModal(false)} onAdd={addProject} />}
      {validatingProject && (
        <ValidationModal
          project={validatingProject}
          user={user}
          authUser={authUser}
          onClose={() => setValidatingProject(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function SettingsForm({ user, setUser, showToast, authUser }) {
  const [form, setForm] = useState({
    name: user.name || '', headline: user.headline || '',
    bio: user.bio || '', location: user.location || '',
    specialization: user.specialization || 'Dynamics 365', yearsExp: user.yearsExp || '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    const sb = await getSupabase();
    if (sb && authUser) {
      await sb.from('profiles').update({
        name: form.name, headline: form.headline, bio: form.bio,
        location: form.location, specialization: form.specialization,
        years_exp: parseInt(form.yearsExp) || 0, updated_at: new Date().toISOString(),
      }).eq('id', authUser.id);
    }
    setUser({ ...user, ...form });
    showToast('Profile updated!', 'success');
  };

  return (
    <form onSubmit={handleSave}>
      <div className="form-group">
        <label className="label">Full Name</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="label">Professional Headline</label>
        <input className="input" value={form.headline} onChange={e => set('headline', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="label">Bio</label>
        <textarea className="input" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell the community about your expertise..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="London, UK" />
        </div>
        <div className="form-group">
          <label className="label">Years Exp</label>
          <input className="input" type="number" min="0" max="40" value={form.yearsExp} onChange={e => set('yearsExp', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Primary Specialization</label>
        <select className="input" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {user.msAccountId && (
        <div style={{ padding: '0.75rem', background: 'rgba(0,114,178,0.08)', border: '1px solid rgba(0,114,178,0.2)', borderRadius: 8, marginBottom: '1rem', fontSize: '0.82rem', color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🟦</span> Microsoft account connected · certifications can be auto-verified
        </div>
      )}
      <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>Save Changes</button>

      <div className="divider" style={{ margin: '1.5rem 0' }} />

      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>Password</div>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted2)', marginBottom: '0.75rem' }}>
          {user.msAccountId ? 'You signed in with Microsoft — no password needed.' : 'Send a reset link to your email address.'}
        </p>
        {!user.msAccountId && (
          <ChangePasswordSection email={user.email} showToast={showToast} />
        )}
      </div>
    </form>
  );
}

function ChangePasswordSection({ email, showToast }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    const sb = await getSupabase();
    if (sb && email) {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}?page=reset-password`,
      });
      if (error) { showToast(error.message, 'error'); setLoading(false); return; }
    }
    setSent(true);
    setLoading(false);
    showToast('Password reset email sent!', 'success');
  };

  if (sent) {
    return (
      <div style={{ padding: '0.75rem 1rem', background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--green)' }}>
        ✓ Reset link sent to {email} — check your inbox
      </div>
    );
  }

  return (
    <button className="btn btn-outline btn-sm" onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : '🔑 Send password reset email'}
    </button>
  );
}

function ValidationModal({ project, user, authUser, onClose, showToast }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) { showToast('Enter a valid email address', 'error'); return; }
    setSending(true);
    const sb = await getSupabase();

    // Generate a unique token
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    const validateUrl = `${window.location.origin}/#validate?token=${token}`;

    if (sb && authUser) {
      const { error } = await sb.from('validations').insert({
        project_id: project.id,
        requestor_id: authUser.id,
        validator_email: email.trim(),
        token,
        message: message.trim() || null,
        status: 'pending',
      });
      if (error) { showToast('Could not create validation request', 'error'); setSending(false); return; }
    }

    // Send email via EmailJS (reuse same service)
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_ea940o4',
          template_id: 'template_64dpxaa',
          user_id: 'IH5Ed3xCPPxvXrFzU',
          template_params: {
            from_email: email,
            source: `Peer Validation Request from ${user?.name || 'a StackRank365 member'}`,
            timestamp: new Date().toLocaleString(),
            validate_url: validateUrl,
            project_title: project.title,
            requestor_name: user?.name || 'A StackRank365 member',
          },
        }),
      });
    } catch {}

    setSent(true);
    setSending(false);
    showToast('Validation request sent!', 'success');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>✅ Request Peer Validation</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
            <h4 style={{ marginBottom: '0.5rem' }}>Request sent!</h4>
            <p style={{ color: 'var(--muted2)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              We've emailed <strong style={{ color: '#fff' }}>{email}</strong> with a validation link.<br />
              You'll earn +300 Stack Points when they confirm.
            </p>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="card" style={{ background: 'var(--surface2)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.25rem' }}>Project</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{project.title}</div>
              {project.role && <div style={{ fontSize: '0.8rem', color: 'var(--blue)', marginTop: '0.2rem' }}>{project.role}</div>}
            </div>

            <div className="form-group">
              <label className="label">Colleague's email address</label>
              <input className="input" type="email" placeholder="colleague@company.com"
                value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
                They'll receive a link to confirm your involvement in this project.
              </div>
            </div>

            <div className="form-group">
              <label className="label">Personal message (optional)</label>
              <textarea className="input" placeholder={`Hi! I've listed our work on "${project.title}" on StackRank365. Would you be able to confirm my involvement?`}
                value={message} onChange={e => setMessage(e.target.value)}
                style={{ minHeight: 80, resize: 'vertical' }} />
            </div>

            <div style={{ padding: '0.75rem 1rem', background: 'var(--blue-dim)', borderRadius: 10, border: '1px solid var(--border-blue)', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--muted2)' }}>
              <strong style={{ color: 'var(--blue)' }}>+300 Stack Points</strong> added to your score when they confirm.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                disabled={sending} onClick={handleSend}>
                {sending ? 'Sending…' : '📧 Send Validation Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
