import React, { useState, useMemo } from 'react';
import { SAMPLE_USERS, getRankTier, getNextRankTier } from '../data/data';
import { useApp } from '../context/AppContext';

const TIER_BADGE = {
  Fundamentals:    'badge-muted',
  Associate:       'badge-blue',
  Expert:          'badge-gold',
  'Applied Skills':'badge-green',
};

const PRIVACY_ICON = { public: '🌍', anonymised: '👤', confidential: '🔒' };
const PRIVACY_LABEL = { public: 'Public', anonymised: 'Anonymised', confidential: 'Confidential' };

function RankBadge({ score, large }) {
  const tier = getRankTier(score);
  return (
    <span className={`badge ${tier.colorClass}`} style={{ fontSize: large ? '0.88rem' : '0.75rem', padding: large ? '0.35rem 0.9rem' : undefined }}>
      {tier.icon} {tier.name}
    </span>
  );
}


function DisputeButton({ userId, score, showToast }) {
  const [open,    setOpen]    = React.useState(false);
  const [reason,  setReason]  = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sent,    setSent]    = React.useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    setSending(true);
    try {
      const mod = await import('/src/lib/supabase.js').catch(()=>import('/src/lib/supabaseClient.js'));
      const sb  = mod.supabase || mod.default;
      await sb.from('disputes').insert({
        user_id: userId, score_at_dispute: score,
        reason: reason.trim(), status: 'open',
      });
      setSent(true);
      showToast && showToast('Dispute submitted — we will review within 48h', 'success');
    } catch(e) {
      showToast && showToast('Could not submit dispute — try again', 'error');
    }
    setSending(false);
  };

  if (sent) return <span style={{ fontSize:'0.78rem', color:'var(--green)' }}>✓ Dispute submitted</span>;
  if (!open) return (
    <button className="btn btn-ghost btn-sm" style={{ flexShrink:0 }} onClick={()=>setOpen(true)}>
      Dispute score →
    </button>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', minWidth:220 }}>
      <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3}
        placeholder="Describe the issue with your score..."
        style={{ padding:'0.5rem', borderRadius:6, border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:'0.78rem', resize:'vertical', fontFamily:'inherit' }} />
      <div style={{ display:'flex', gap:'0.5rem' }}>
        <button className="btn btn-primary btn-sm" disabled={sending||!reason.trim()} onClick={submit}>
          {sending ? 'Submitting…' : 'Submit dispute'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={()=>setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
}

export default function Profile({ onNavigate, profileUser }) {
  const { user, calcScore } = useApp();
  const [copied, setCopied] = useState(false);

  // Determine whose profile to show
  const isOwnProfile = !profileUser;
  const displayUser = isOwnProfile && user
    ? {
        id: user.id || 'me',
        name: user.name || 'Your Profile',
        username: user.username || 'you',
        headline: user.headline || 'Microsoft Professional',
        location: user.location || '—',
        bio: user.bio || '',
        yearsExp: user.yearsExp || 0,
        specialism: user.specialism || 'Dynamics 365',
        certifications: user.certifications || [],
        projects: user.projects || [],
        score: calcScore(),
        isMe: true,
        isMVP: user.isMVP,
        foundingMember: user.foundingMember,
      }
    : profileUser;

  if (!displayUser) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2>Profile not found</h2>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => onNavigate('leaderboard')}>
            Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  const score = displayUser.score || 0;
  const tier = getRankTier(score);
  const nextTier = getNextRankTier(score);
  const pointsToNext = nextTier ? nextTier.minScore - score : 0;
  const progressPct = nextTier
    ? Math.min(Math.round(((score - tier.minScore) / (nextTier.minScore - tier.minScore)) * 100), 100)
    : 100;

  const certs = displayUser.certifications || [];
  const projects = displayUser.projects || [];

  // Rank calculations from all sample users
  const allScores = useMemo(() => {
    const all = [...SAMPLE_USERS];
    if (displayUser.isMe && !all.find(u => u.id === 'me')) all.push(displayUser);
    return all.sort((a, b) => b.score - a.score);
  }, [displayUser]);

  const globalRank = (() => {
    const idx = allScores.findIndex(u => u.id === displayUser.id);
    return idx >= 0 ? idx + 1 : allScores.length;
  })();
  const totalUsers = allScores.length;
  const avgScore = Math.round(allScores.reduce((s, u) => s + (u.score || 0), 0) / totalUsers);
  const percentile = Math.round(((totalUsers - globalRank + 1) / totalUsers) * 100);
  const scoreDiff = score - avgScore;

  // Nearby professionals (2 above, 2 below)
  const nearbyIdx = allScores.findIndex(u => u.id === displayUser.id);
  const nearby = [
    nearbyIdx > 1  ? allScores[nearbyIdx - 2] : null,
    nearbyIdx > 0  ? allScores[nearbyIdx - 1] : null,
    nearbyIdx < allScores.length - 1 ? allScores[nearbyIdx + 1] : null,
    nearbyIdx < allScores.length - 2 ? allScores[nearbyIdx + 2] : null,
  ].filter(Boolean).slice(0, 4);

  // Similar professionals (same specialism, different user)
  const similar = allScores
    .filter(u => u.specialism === displayUser.specialism && u.id !== displayUser.id)
    .slice(0, 4);

  const profileUrl = `https://www.stackrank365.com/profile/${displayUser.username || displayUser.id}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&title=${encodeURIComponent(`${displayUser.name} — ${displayUser.headline || 'Microsoft Professional'} | StackRank365`)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = () => {
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  // Cert score breakdown by tier
  const certPts = certs.reduce((s, c) => s + (c.points || 500), 0);
  const projectPts = projects.filter(p => p.privacy_mode !== 'confidential').length * 800
    + projects.filter(p => p.enterprise).length * 1200;
  const validationPts = projects.filter(p => p.validated).length * 300;
  const communityPts = Math.max(0, score - certPts - projectPts - validationPts);

  return (
    <div style={{ minHeight: '80vh' }}>

      {/* ─── Hero Banner ─────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #12103a 0%, #0d1a3a 40%, #0e2244 70%, #12103a 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '3.5rem 0 6rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div className="orb" style={{ width: 500, height: 500, background: 'rgba(167,139,250,0.1)', top: -100, left: -100 }} />
        <div className="orb" style={{ width: 350, height: 350, background: 'rgba(0,194,255,0.07)', bottom: -80, right: -80 }} />
        <div className="orb" style={{ width: 200, height: 200, background: 'rgba(255,200,60,0.06)', top: '40%', right: '25%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Avatar + info */}
            <div style={{ flex: 1, display: 'flex', gap: '2rem', alignItems: 'flex-start', minWidth: 280 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 108, height: 108, borderRadius: 22,
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 700, color: '#fff',
                  border: '3px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 12px 40px rgba(124,58,237,0.35)',
                }}>
                  {(displayUser.name || '?')[0].toUpperCase()}
                </div>
                {/* Rank icon badge */}
                <div style={{
                  position: 'absolute', bottom: -8, right: -8,
                  width: 34, height: 34, borderRadius: '50%',
                  background: tier.colorClass === 'badge-gold' ? 'var(--grad-gold)' :
                               tier.colorClass === 'badge-orange' ? 'linear-gradient(135deg, #fb923c, #f59e0b)' :
                               tier.colorClass === 'badge-purple' ? 'var(--grad-purple)' : 'var(--grad-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.05rem', border: '2.5px solid rgba(13,17,23,0.9)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}>
                  {tier.icon}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: '0.2rem', lineHeight: 1.1 }}>
                  {displayUser.name}
                  {displayUser.isMe && (
                    <span style={{ fontSize: '1rem', color: 'var(--blue)', marginLeft: '0.6rem', fontFamily: 'Outfit', fontWeight: 500 }}>
                      (you)
                    </span>
                  )}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
                  @{displayUser.username}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.25rem' }}>
                  {displayUser.headline}
                </p>

                {/* Chips row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {displayUser.location && displayUser.location !== '—' && (
                    <span className="badge badge-white">📍 {displayUser.location}</span>
                  )}
                  {(displayUser.yearsExp || 0) > 0 && (
                    <span className="badge badge-white">🗓️ {displayUser.yearsExp} yrs experience</span>
                  )}
                  {certs.length > 0 && (
                    <span className="badge badge-white">🎓 {certs.length} certification{certs.length !== 1 ? 's' : ''}</span>
                  )}
                  {projects.length > 0 && (
                    <span className="badge badge-white">🏗️ {projects.length} project{projects.length !== 1 ? 's' : ''}</span>
                  )}
                  {displayUser.isMVP && (
                    <span className="badge" style={{ background: 'rgba(255,200,60,0.15)', color: 'var(--gold)', border: '1px solid rgba(255,200,60,0.3)' }}>⭐ Microsoft MVP</span>
                  )}
                  {displayUser.specialism && (
                    <span className="badge badge-purple">{displayUser.specialism}</span>
                  )}
                </div>

                {displayUser.bio && (
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
                    {displayUser.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Score card */}
            <div style={{ flexShrink: 0, minWidth: 250 }}>
              <div style={{
                background: 'rgba(0,194,255,0.07)',
                border: '1px solid rgba(0,194,255,0.25)',
                borderRadius: 18, padding: '1.5rem',
                backdropFilter: 'blur(12px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.1rem' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: 'var(--blue-dim)', border: '1px solid var(--border-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                  }}>🏆</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Stack Points</div>
                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '2.6rem', color: 'var(--blue)', lineHeight: 1 }}>
                      {score.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <RankBadge score={score} large />
                </div>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem' }}>{tier.description}</p>

                {nextTier && (
                  <div style={{ marginBottom: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.35rem' }}>
                      <span>→ {nextTier.icon} {nextTier.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono' }}>{pointsToNext.toLocaleString()} pts</span>
                    </div>
                    <div className="progress-track" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {displayUser.isMe && (
                    <button className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}
                      onClick={() => onNavigate('dashboard')}>
                      ✏️ Edit Profile
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }} onClick={handleCopy}>
                    {copied ? '✓ Copied!' : '🔗 Copy Link'}
                  </button>
                  <button
                    onClick={handleLinkedIn}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 0.85rem', borderRadius: 8, cursor: 'pointer',
                      background: '#0077b5', border: '1px solid #0077b5',
                      color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                      fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#005f8e'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0077b5'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:900px){.container>div:first-child{flex-direction:column!important}}`}</style>
      </div>

      {/* ─── Floating Rank Cards ─────────────────────────── */}
      <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10, marginBottom: '2.5rem' }}>
        <div className="grid-3">
          {[
            { label: 'Global Rank',     value: `#${globalRank}`,     sub: `of ${totalUsers} professionals`, icon: '🌍', color: 'var(--blue)',   border: 'var(--border-blue)' },
            { label: 'Top Percentile',  value: `${percentile}%`,      sub: 'ranked globally',                icon: '📈', color: 'var(--purple)', border: 'rgba(167,139,250,0.3)' },
            {
              label: 'vs Platform Avg',
              value: scoreDiff >= 0 ? `+${scoreDiff.toLocaleString()}` : scoreDiff.toLocaleString(),
              sub: `platform avg: ${avgScore.toLocaleString()} pts`,
              icon: scoreDiff >= 0 ? '📊' : '📉',
              color: scoreDiff >= 0 ? 'var(--green)' : 'var(--orange)',
              border: scoreDiff >= 0 ? 'rgba(0,229,160,0.25)' : 'rgba(251,146,60,0.25)',
            },
          ].map(r => (
            <div key={r.label} style={{
              background: 'var(--surface)',
              border: `1px solid ${r.border}`,
              borderRadius: 16, padding: '1.25rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.6rem' }}>{r.icon}</span>
                <div>
                  <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.75rem', color: r.color, lineHeight: 1 }}>
                    {r.value}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted2)', marginTop: '0.2rem' }}>
                    {r.label} · {r.sub}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.75rem', alignItems: 'start' }}>

          {/* Left column */}
          <div>

            {/* Certifications */}
            {certs.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎓</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Certifications</h3>
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--green)' }}>
                    +{certPts.toLocaleString()} pts
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {certs.map((cert, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                      padding: '0.9rem', background: 'var(--surface2)', borderRadius: 12,
                      border: '1px solid var(--border)',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{
                        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                        background: cert.tier === 'Expert' ? 'var(--gold-dim)' : cert.tier === 'Associate' ? 'var(--blue-dim)' : 'var(--green-dim)',
                        border: cert.tier === 'Expert' ? '1px solid var(--border-gold)' : cert.tier === 'Associate' ? '1px solid var(--border-blue)' : '1px solid rgba(0,229,160,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                      }}>🎓</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', lineHeight: 1.35, marginBottom: '0.3rem' }}>
                          {cert.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.68rem', color: 'var(--muted)' }}>{cert.code}</span>
                          <span className={`badge ${TIER_BADGE[cert.tier] || 'badge-muted'}`} style={{ fontSize: '0.62rem' }}>{cert.tier}</span>
                          {cert.scarcityMultiplier && <span className="badge badge-purple" style={{ fontSize: '0.58rem' }}>1.25×</span>}
                          <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--green)', fontWeight: 700 }}>+{cert.points}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🏗️</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Projects</h3>
                  <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--blue)' }}>
                    {projects.length} logged
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {projects.map((proj, i) => (
                    <div key={i} style={{
                      padding: '1.1rem', background: 'var(--surface2)', borderRadius: 12,
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${proj.privacy_mode === 'confidential' ? 'var(--muted)' : proj.validated ? 'var(--green)' : 'var(--blue)'}`,
                    }}>
                      {proj.privacy_mode === 'confidential' ? (
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.2rem' }}>🔒</span>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--muted2)' }}>Confidential Project</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{proj.industry} · Details withheld by NDA</div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff', flex: 1 }}>{proj.title}</span>
                            <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap' }}>
                              {proj.privacy_mode === 'anonymised' && (
                                <span className="badge badge-muted" style={{ fontSize: '0.62rem' }}>👤 Anonymised</span>
                              )}
                              {proj.enterprise && (
                                <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>Enterprise</span>
                              )}
                              {proj.validated && (
                                <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>✓ Peer Validated</span>
                              )}
                            </div>
                          </div>
                          {proj.role && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--blue)', fontWeight: 600, marginBottom: '0.4rem' }}>{proj.role}</div>
                          )}
                          {proj.description && (
                            <p style={{ fontSize: '0.83rem', color: 'var(--muted2)', lineHeight: 1.65, margin: 0 }}>{proj.description}</p>
                          )}
                          {proj.industry && (
                            <div style={{ marginTop: '0.6rem' }}>
                              <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{proj.industry}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {certs.length === 0 && projects.length === 0 && (
              <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-bright)', borderRadius: 16, padding: '3.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                <h3>Profile being built</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem' }}>
                  {displayUser.isMe ? 'Add certifications and projects from your dashboard.' : 'This professional is still building their profile.'}
                </p>
                {displayUser.isMe && (
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => onNavigate('dashboard')}>
                    Build Profile →
                  </button>
                )}
              </div>
            )}

            {/* Performance insights */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.06) 0%, rgba(167,139,250,0.04) 100%)', border: '1px solid rgba(0,194,255,0.15)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>📊</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Performance Insights</h3>
              </div>
              <div className="grid-3" style={{ gap: '1rem' }}>
                {[
                  { label: 'Stack Points', value: score.toLocaleString(), sub: scoreDiff >= 0 ? `${Math.round((scoreDiff/avgScore)*100)}% above avg` : `${Math.round((-scoreDiff/avgScore)*100)}% below avg`, icon: '🏆', color: 'var(--blue)', positive: scoreDiff >= 0 },
                  { label: 'Platform Avg', value: avgScore.toLocaleString(), sub: `across ${totalUsers} professionals`, icon: '📉', color: 'var(--purple)', positive: true },
                  { label: 'Top Percentile', value: `${percentile}%`, sub: `ranked #${globalRank} globally`, icon: '⚡', color: 'var(--orange)', positive: true },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{s.icon}</div>
                      <div>
                        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.5rem', color: s.color, lineHeight: 1 }}>{s.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted2)' }}>{s.label}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: s.positive ? 'var(--green)' : 'var(--orange)', fontWeight: 600 }}>{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close to ranking */}
            {nearby.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>🎯</span>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Close to {displayUser.isMe ? 'Your' : 'This'} Rank</h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted2)', marginBottom: '1.1rem' }}>
                  Professionals near rank #{globalRank}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  {nearby.map(u => {
                    const uRank = allScores.findIndex(x => x.id === u.id) + 1;
                    const uTier = getRankTier(u.score || 0);
                    return (
                      <div key={u.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.85rem', background: 'var(--surface2)', borderRadius: 10,
                          border: '1px solid var(--border)', cursor: 'pointer',
                          transition: 'border-color 0.2s, transform 0.15s',
                        }}
                        onClick={() => onNavigate('profile', { userData: u })}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-blue)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {(u.name || '?')[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.headline}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 700 }}>#{uRank}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{(u.score || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right sidebar ────────────────────────────── */}
          <div>

            {/* Score breakdown */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.4rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1.1rem', fontSize: '1rem' }}>📊 Score Breakdown</h3>
              {[
                { label: 'Certifications', pts: certPts,      color: 'var(--green)',  icon: '🎓' },
                { label: 'Projects',       pts: projectPts,   color: 'var(--blue)',   icon: '🏗️' },
                { label: 'Validations',    pts: validationPts, color: 'var(--purple)', icon: '✅' },
                { label: 'Community',      pts: communityPts, color: 'var(--gold)',   icon: '🌐' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.28rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>{item.icon} {item.label}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: item.color, fontWeight: 700 }}>
                      {item.pts.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-track" style={{ height: 5 }}>
                    <div className="progress-fill" style={{
                      width: `${score > 0 ? Math.min((item.pts / score) * 100, 100) : 0}%`,
                      background: item.color,
                    }} />
                  </div>
                </div>
              ))}
              <div className="divider" style={{ margin: '1rem 0 0.75rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>Total</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--blue)', fontSize: '1rem' }}>
                  {score.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Rank tier progress */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.4rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>🏆 Rank Journey</h3>
              {[...new Set([tier, nextTier].filter(Boolean))].map((t, i) => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', opacity: t.name === tier.name ? 1 : 0.5 }}>
                  <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.95rem', color: t.name === tier.name ? t.color : 'var(--muted2)' }}>
                      {t.name} {t.name === tier.name && '← current'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                      {t.minScore.toLocaleString()}{t.maxScore === Infinity ? '+' : `–${t.maxScore.toLocaleString()}`} pts
                    </div>
                  </div>
                </div>
              ))}
              {nextTier && (
                <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '0.65rem 0.85rem', fontSize: '0.78rem', color: 'var(--muted2)' }}>
                  <span style={{ color: 'var(--blue)', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{pointsToNext.toLocaleString()} pts</span>
                  {' '}to reach {nextTier.icon} {nextTier.name}
                </div>
              )}
            </div>

            {/* Similar professionals */}
            {similar.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.4rem', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.9rem', fontSize: '1rem' }}>👥 Similar Professionals</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.85rem' }}>
                  Others in {displayUser.specialism}
                </p>
                {similar.map((u, i) => {
                  const uTier = getRankTier(u.score || 0);
                  return (
                    <div key={u.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.65rem',
                        padding: '0.6rem 0',
                        borderBottom: i < similar.length - 1 ? '1px solid var(--border)' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => onNavigate('profile', { userData: u })}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(u.name || '?')[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted2)' }}>{u.location}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--blue)', fontWeight: 700 }}>
                          {(u.score || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.62rem' }}>{uTier.icon}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* CTA for non-own profiles */}
            {!displayUser.isMe && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,194,255,0.08), rgba(167,139,250,0.06))',
                border: '1px solid var(--border-blue)', borderRadius: 16, padding: '1.5rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.6rem' }}>🚀</div>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.95rem' }}>Build your own rank</div>
                <p style={{ color: 'var(--muted2)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Join StackRank365 and get your verified Stack Points score.
                </p>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onNavigate('landing')}>
                  Join the Waitlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

          {/* T23: Reputation dispute/appeals — visible to profile owner only */}
          {displayUser.isMe && (
            <div style={{ marginTop: '1.5rem' }}>
              <div className="card" style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.3rem' }}>Score dispute</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>Think your score is incorrect? Submit a dispute and our team will review your certifications and projects within 48 hours.</div>
                  </div>
                  <DisputeButton userId={displayUser.id} score={displayUser.score} showToast={showToast} />
                </div>
              </div>
            </div>
          )}


      <style>{`
        @media (max-width: 960px) {
          .container > div:last-child { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
