import { useState } from 'react';
import { RANK_TIERS, SAMPLE_USERS, getRankTier } from '../data/data';

function RankBadge({ score }) {
  const tier = getRankTier(score);
  return (
    <span className={`badge ${tier.colorClass}`} style={{ fontSize: '0.7rem' }}>
      {tier.icon} {tier.name}
    </span>
  );
}

const SB_URL   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

function WaitlistForm({ variant = 'hero' }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [joined,  setJoined]  = useState(false);
  const [error,   setError]   = useState('');

  const handle = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setError('Enter a valid email'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(SB_URL + '/rest/v1/waitlist', {
        method: 'POST',
        headers: {
          apikey:         ANON_KEY,
          Authorization:  'Bearer ' + ANON_KEY,
          'Content-Type': 'application/json',
          Prefer:         'return=minimal',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim(), source: variant }),
      });
      if (res.ok || res.status === 409) {
        setJoined(true);
        // Auto-reply email — fire and forget (don't block UI on failure)
        fetch(SB_URL.replace('/rest/v1','') + '/functions/v1/send-email', {
          method: 'POST',
          headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.toLowerCase().trim(),
            template_key: 'waitlist_signup',
            variables: { name: email.split('@')[0] },
          }),
        }).catch(() => {}); // silent fail — don't break join flow
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (joined) {
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.85rem',
        padding: '0.85rem 1.5rem',
        background: 'rgba(15,188,73,0.1)', border: '1px solid rgba(15,188,73,0.3)', borderRadius: 8,
      }}>
        <span style={{ fontSize: '1.5rem' }}>🎉</span>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--green)', fontSize: '0.95rem' }}>You're on the list!</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>We'll notify you at {email}</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="waitlist-form-row">
      <input
        className="input"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          flex: 1, minWidth: 0, maxWidth: 300,
          ...(error ? { borderColor: 'var(--red)' } : {}),
        }}
      />
      <button className="btn btn-primary" type="submit" disabled={loading}
        style={{ flexShrink: 0 }}>
        {loading ? 'Joining...' : 'Join Waitlist →'}
      </button>
      {error && <div style={{ width: '100%', fontSize: '0.8rem', color: 'var(--red)', marginTop: '0.35rem' }}>{error}</div>}
    </form>
  );
}


export default function Landing({ onNavigate }) {
  const top5 = SAMPLE_USERS.slice(0, 5);
  const preview = SAMPLE_USERS.slice(0, 10);

  return (
    <div>

      {/* ─── HERO ────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #f3f5ff 0%, #fbfbfd 100%)',
        padding: '5rem 0 6rem',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* Dot pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(15,83,250,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
        {/* Soft glow orbs */}
        <div className="orb" style={{ width: 500, height: 500, background: 'rgba(15,83,250,0.06)', top: -150, right: -100, opacity: 1 }} />
        <div className="orb" style={{ width: 350, height: 350, background: 'rgba(1,149,255,0.05)', bottom: -80, left: -60, opacity: 1 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid">
            {/* Left — copy */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 1.1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 500, background: 'rgba(15,83,250,0.08)', border: '1px solid rgba(15,83,250,0.2)', color: 'var(--blue)' }} className="fade-up">⚡ Early Access — Founding Members Get 500 Bonus Points</span>
              </div>

              <h1 className="stagger-1" style={{ marginBottom: '1.25rem', fontSize: 'clamp(2.2rem, 5vw, 3.75rem)', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
                The Trust Layer<br/>
                for <span style={{ color: 'var(--blue)' }}>Microsoft Careers</span>
              </h1>

              <p className="stagger-2" style={{
                fontSize: '1.1875rem', color: 'var(--muted2)', lineHeight: 1.75,
                marginBottom: '2rem', maxWidth: 480,
              }}>
                StackRank365 is the verified talent ranking community for Dynamics 365, Power Platform,
                Copilot Studio, and Azure OpenAI professionals. Verified proof of applied Microsoft expertise.
              </p>

              <div className="stagger-3" style={{ marginBottom: '2rem' }}>
                <WaitlistForm variant="hero" />
              </div>

              <div className="stagger-4" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {[
                  { val: 'Free',     label: 'to join',       bg: 'rgba(15,188,73,0.1)',   emoji: '✨' },
                  { val: '+500 pts', label: 'founding bonus', bg: 'rgba(255,179,12,0.1)',  emoji: '⭐' },
                  { val: '35+',      label: 'cert types',     bg: 'rgba(15,83,250,0.08)',  emoji: '🎓' },
                  { val: '6',        label: 'specialisms',    bg: 'rgba(106,38,218,0.08)', emoji: '🏆' },
                ].map(s => (
                  <div key={s.val} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{s.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.15rem' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live leaderboard preview */}
            <div className="stagger-2 hero-right">
              {/* Clean white card */}
              <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0px 20px 40px 0px rgba(5,5,5,0.08)', overflow: 'hidden', border: '1px solid #efefef' }}>
                {/* Card header */}
                <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6f7f8' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0fbc49', display: 'inline-block' }} />
                    Live Rankings
                  </span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(15,83,250,0.08)', color: 'var(--blue)', padding: '0.2rem 0.65rem', borderRadius: 100, fontFamily: 'JetBrains Mono', fontWeight: 500 }}>All Specialisms</span>
                </div>

                {/* Top 3 podium */}
                {(() => {
                  const sorted = [...top5].sort((a, b) => b.score - a.score);
                  const visual = [sorted[1], sorted[0], sorted[2]];
                  const heights = ['88px', '118px', '94px'];
                  const medals  = ['🥈', '🥇', '🥉'];
                  const isGolds = [false, true, false];
                  const podiumStyle = [
                    { bg: '#f3f5ff', border: 'rgba(15,83,250,0.12)', nameColor: 'var(--muted2)', scoreColor: 'var(--blue)' },
                    { bg: 'linear-gradient(180deg, #fff9e6, #fff3cc)', border: 'rgba(255,179,12,0.4)', nameColor: 'var(--text)', scoreColor: '#e09f00' },
                    { bg: '#f3f5ff', border: 'rgba(15,83,250,0.12)', nameColor: 'var(--muted2)', scoreColor: 'var(--blue)' },
                  ];
                  return (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', padding: '1rem 1rem 0.5rem', background: '#f6f7f8' }}>
                      {visual.map((u, vi) => {
                        if (!u) return null;
                        const isGold = isGolds[vi];
                        const ps = podiumStyle[vi];
                        return (
                          <div key={u.id} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => onNavigate('profile', { userData: u })}>
                            <div style={{
                              height: heights[vi],
                              background: ps.bg,
                              border: `1px solid ${ps.border}`,
                              borderRadius: '10px 10px 4px 4px',
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              gap: '0.3rem', padding: '0.6rem 0.4rem',
                              transition: 'transform 0.15s',
                              boxShadow: isGold ? '0 4px 16px rgba(245,158,11,0.15)' : '0 2px 6px rgba(15,23,42,0.04)',
                            }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = ''}
                            >
                              <div style={{
                                width: isGold ? 44 : 36, height: isGold ? 44 : 36,
                                borderRadius: '50%', flexShrink: 0,
                                background: isGold ? 'linear-gradient(135deg, #ffb30c, #ff8c00)' : 'var(--blue)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: isGold ? '1rem' : '0.82rem',
                                color: isGold ? '#111' : '#fff',
                                boxShadow: isGold ? '0 0 16px rgba(245,158,11,0.25)' : 'none',
                              }}>{(u.name || '?')[0]}</div>
                              <div style={{ fontSize: isGold ? '0.75rem' : '0.68rem', fontWeight: 700, color: ps.nameColor, lineHeight: 1 }}>
                                {u.name.split(' ')[0]}
                              </div>
                              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.6rem', color: ps.scoreColor }}>
                                {u.score.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '1rem', lineHeight: 1 }}>{medals[vi]}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Rows 4–10 */}
                <div>
                  {[...preview].sort((a, b) => b.score - a.score).slice(3).map((u, i) => (
                    <div
                      key={u.id}
                      onClick={() => onNavigate('profile', { userData: u })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.65rem',
                        padding: '0.55rem 1rem',
                        borderBottom: i < preview.slice(3).length - 1 ? '1px solid rgba(15,23,42,0.05)' : 'none',
                        cursor: 'pointer', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f3f5ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <span style={{ width: 20, textAlign: 'right', fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'JetBrains Mono', flexShrink: 0 }}>
                        {i + 4}
                      </span>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                        {(u.name || '?')[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.headline}</div>
                      </div>
                      <RankBadge score={u.score} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.78rem', color: 'var(--blue)', flexShrink: 0 }}>
                        {u.score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid #f0f0f0', textAlign: 'center', background: '#f6f7f8' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: '0.82rem', fontFamily: "'Rubik', sans-serif", fontWeight: 500 }}
                      onClick={() => onNavigate('leaderboard')}>
                      View full leaderboard — 15 professionals →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── THE PROBLEM ─────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#f6f7f8', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <div className="badge badge-muted" style={{ marginBottom: '1rem' }}>The Problem</div>
          <h2 style={{ marginBottom: '1.25rem' }}>
            Microsoft credentials are <span className="gradient-text-purple">impossible to verify</span>
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted2)', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 2.5rem' }}>
            LinkedIn endorsements are unverified. CVs are self-declared. Recruiters waste weeks interviewing candidates 
            who oversell their depth. Skilled consultants get overlooked because they can't prove what they've built.
          </p>
          <div className="grid-3">
            {[
              { icon: '😤', stat: '73%', desc: 'of hiring managers say Microsoft skills are the hardest to verify before interview' },
              { icon: '⏱️', stat: '3–6 wks', desc: 'average wasted per bad hire in the Microsoft ecosystem consulting space' },
              { icon: '👻', stat: '61%', desc: 'of certified professionals say their certs are ignored because there\'s no proof of application' },
            ].map(s => (
              <div key={s.stat} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '2rem', color: 'var(--blue)', marginBottom: '0.5rem' }}>{s.stat}</div>
                <p style={{ color: 'var(--muted2)', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE SOLUTION ────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>The Solution</div>
            <h2 style={{ marginBottom: '1rem' }}>
              A verified rank that speaks<br/>louder than a CV
            </h2>
            <p style={{ color: 'var(--muted2)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>
              StackRank365 combines Microsoft certification verification, peer-validated project evidence, 
              and community recognition into a single trusted score.
            </p>
          </div>

          <div className="grid-3">
            {[
              {
                num: '01', icon: '🎓', title: 'Tier-Weighted Certifications',
                desc: 'Each cert earns points by difficulty: Expert (3,000) > Associate (1,500) > Fundamentals (500) > Applied Skills (400). An Expert cert proves 6× more than a Fundamentals badge.',
                color: 'var(--blue)', borderColor: 'var(--border-blue)',
              },
              {
                num: '02', icon: '✅', title: 'Peer-Validated Projects',
                desc: 'Colleagues confirm your real implementations. Clients can be anonymised or marked confidential — so enterprise consultants aren\'t penalised for NDA obligations.',
                color: 'var(--green)', borderColor: 'rgba(16,185,129,0.25)',
              },
              {
                num: '03', icon: '🤖', title: 'Copilot Scarcity Bonus',
                desc: 'Copilot Studio certifications carry a 1.25× leaderboard multiplier. Early adopters earn a meaningful, lasting edge as the talent pool is still tiny.',
                color: 'var(--purple)', borderColor: 'rgba(124,58,237,0.2)',
              },
              {
                num: '04', icon: '📊', title: 'Global & Local Rankings',
                desc: 'Your Stack Points determine a global rank, country rank, and city rank. See exactly where you stand against every other verified professional in the ecosystem.',
                color: 'var(--gold)', borderColor: 'var(--border-gold)',
              },
              {
                num: '05', icon: '🏅', title: 'Community Prestige',
                desc: 'Microsoft MVPs, Certified Trainers, FastTrack Architects, and event speakers earn recognition beyond certifications — rewarding the whole professional.',
                color: 'var(--orange)', borderColor: 'rgba(249,115,22,0.2)',
              },
              {
                num: '06', icon: '🔒', title: 'Privacy by Design',
                desc: 'Control exactly what\'s visible. Projects can be public, anonymised, or confidential. Your rank is always earned — it\'s never borrowed from client name-dropping.',
                color: 'var(--cyan)', borderColor: 'rgba(14,165,233,0.2)',
              },
            ].map(f => (
              <div
                key={f.num}
                className="card"
                style={{
                  borderTop: `3px solid ${f.color}`,
                  transition: 'transform 400ms ease-in-out, box-shadow 400ms ease-in-out',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{f.icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: f.color, fontWeight: 700 }}>{f.num}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RANK TIERS ──────────────────────────────────── */}
      <section style={{ padding: '4.5rem 0', background: '#f6f7f8', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>Rank Tiers</div>
            <h2>From <span className="gradient-text-gold">Explorer</span> to <span className="gradient-text-gold">Principal Architect</span></h2>
            <p style={{ color: 'var(--muted2)', marginTop: '0.75rem' }}>Five tiers. Transparent thresholds. No politics.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {RANK_TIERS.map((tier, i) => (
              <div key={tier.name} style={{
                flex: '1 0 190px', textAlign: 'center', padding: '1.75rem 1rem',
                background: i === 4
                  ? 'linear-gradient(135deg, rgba(255,200,60,0.12), rgba(255,140,0,0.06))'
                  : 'var(--surface)',
                border: `1px solid ${i === 4 ? 'rgba(255,179,12,0.3)' : '#efefef'}`,
                borderRadius: 16,
                boxShadow: i === 4 ? 'var(--shadow-gold)' : 'var(--shadow-card)',
              }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.6rem' }}>{tier.icon}</div>
                <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.1rem', color: tier.color, marginBottom: '0.3rem' }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted2)', marginBottom: '0.85rem' }}>{tier.description}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.72rem', color: 'var(--muted)', padding: '0.3rem 0.6rem', background: 'var(--surface2)', borderRadius: 6, display: 'inline-block' }}>
                  {tier.minScore.toLocaleString()}{tier.maxScore === Infinity ? '+' : `–${tier.maxScore.toLocaleString()}`} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPECIALISMS ─────────────────────────────────── */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>Six Core Specialisms</h2>
            <p style={{ color: 'var(--muted2)', marginTop: '0.5rem' }}>
              Verified credentials and project evidence across the entire Microsoft ecosystem
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center' }}>
            {[
              { name: 'Dynamics 365',   icon: '📦', color: 'var(--blue)',   glow: 'rgba(0,194,255,0.12)',   count: '12 certs' },
              { name: 'Power Platform', icon: '⚡', color: 'var(--purple)', glow: 'rgba(167,139,250,0.1)',  count: '10 certs' },
              { name: 'Copilot Studio', icon: '🤖', color: 'var(--pink)',   glow: 'rgba(244,114,182,0.1)',  count: '6 certs + 1.25× bonus', hot: true },
              { name: 'Azure OpenAI',   icon: '🧠', color: 'var(--cyan)',   glow: 'rgba(0,229,255,0.1)',    count: '9 certs' },
              { name: 'Dataverse',      icon: '🗄️', color: 'var(--green)',  glow: 'rgba(0,229,160,0.1)',   count: 'Composite score' },
              { name: 'Power Apps',     icon: '📱', color: 'var(--orange)', glow: 'rgba(251,146,60,0.1)',  count: '5 certs' },
            ].map(s => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem 1.5rem',
                background: 'var(--surface)',
                border: `1px solid #efefef`,
                borderRadius: 100, cursor: 'pointer',
                transition: 'transform 400ms ease-in-out, border-color 400ms ease-in-out',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#efefef'; }}
              onClick={() => onNavigate('scoring')}
              >
                <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: s.color }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted2)' }}>{s.count}</div>
                </div>
                {s.hot && <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem', marginLeft: '0.25rem' }}>HOT</span>}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => onNavigate('scoring')}>
              View full scoring breakdown →
            </button>
          </div>
        </div>
      </section>

      {/* ─── WHO IS THIS FOR ─────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: '#f6f7f8', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Built for Microsoft Professionals</h2>
          </div>
          <div className="grid-3">
            {[
              {
                icon: '🧑‍💻', title: 'Consultants & Contractors',
                points: [
                  'Prove depth beyond a cert list',
                  'Protect client confidentiality while showing project scale',
                  'Stand out in a market full of self-declared "experts"',
                  'Track your rank as you grow',
                ],
                color: 'var(--blue)',
              },
              {
                icon: '🏗️', title: 'Solution Architects',
                points: [
                  'Showcase enterprise project complexity',
                  'Earn prestige points for MVP, MCT, FastTrack status',
                  'Build a public profile that does the talking',
                  'Get discovered for the right roles',
                ],
                color: 'var(--purple)',
              },
              {
                icon: '🚀', title: 'Rising Specialists',
                points: [
                  'Enter Copilot Studio early and earn a 1.25× scarcity bonus',
                  'Stack points with Applied Skills credentials',
                  'Peer validation gives your projects credibility',
                  'Build a defensible rank before everyone else does',
                ],
                color: 'var(--gold)',
              },
            ].map(p => (
              <div key={p.title} className="card card-hover" style={{ borderTop: `3px solid ${p.color}`, padding: '2rem' }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{p.icon}</div>
                <h3 style={{ marginBottom: '1.1rem', fontSize: '1.15rem' }}>{p.title}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {p.points.map(pt => (
                    <li key={pt} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--muted2)', lineHeight: 1.55 }}>
                      <span style={{ color: p.color, flexShrink: 0, fontWeight: 700 }}>→</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (condensed) ────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container-sm">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-green" style={{ marginBottom: '1rem' }}>Simple by Design</div>
            <h2>Four Steps to Your Verified Rank</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '2.5rem' }}>
            {[
              { n: '01', title: 'Create your profile', desc: 'Join and claim your public URL: stackrank365.com/profile/you', icon: '👤' },
              { n: '02', title: 'Add your certifications', desc: 'Each cert is weighted by tier. Expert = 3,000 pts. Associate = 1,500. No tricks.', icon: '🎓' },
              { n: '03', title: 'Log your projects', desc: 'Add real implementations with privacy controls. Confidential clients stay confidential.', icon: '🏗️' },
              { n: '04', title: 'Invite peer validators', desc: 'Ask colleagues to confirm your project experience. Each validation adds 300 pts and credibility.', icon: '✅' },
            ].map(s => (
              <div key={s.n} className="card" style={{
                display: 'flex', gap: '1.25rem', alignItems: 'flex-start',
                borderLeft: '3px solid var(--blue)',
                borderRadius: '0 16px 16px 0',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 8, flexShrink: 0,
                  background: 'var(--blue)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Rubik', fontWeight: 700, fontSize: '0.95rem', color: '#fff',
                }}>{s.n}</div>
                <div style={{ paddingTop: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{s.icon} {s.title}</h3>
                  <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-outline btn-lg" onClick={() => onNavigate('how-it-works')}>
              Read the full guide →
            </button>
          </div>
        </div>
      </section>

      {/* ─── SCORING FORMULA ─────────────────────────────── */}
      <section style={{ padding: '5.5rem 0', background: 'var(--surface)', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Scoring System</div>
          <h2 style={{ marginBottom: '0.6rem' }}>No Black Boxes.<br />Every Point Explained.</h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted2)', lineHeight: 1.7, maxWidth: 520, marginBottom: '3rem' }}>
            Your StackRank Score is calculated transparently. Here is exactly how it works.
          </p>

          <div className="scoring-grid-b">
            {/* Left: equation + example */}
            <div>
              {/* Equation block */}
              <div className="formula-eq">
                <span style={{ color: 'var(--blue)' }}>StackRank Score</span>
                {' '}<span style={{ color: 'var(--gold)' }}>=</span><br />
                &nbsp;&nbsp;(<span style={{ color: 'var(--blue)' }}>Certifications</span>
                {' '}<span style={{ color: 'var(--gold)' }}>×</span> level_weight)<br />
                <span style={{ color: 'var(--gold)' }}>+</span> (<span style={{ color: 'var(--blue)' }}>Verified Projects</span>
                {' '}<span style={{ color: 'var(--gold)' }}>×</span> scale_weight)<br />
                <span style={{ color: 'var(--gold)' }}>+</span> (<span style={{ color: 'var(--blue)' }}>Community Actions</span>
                {' '}<span style={{ color: 'var(--gold)' }}>×</span> trust_weight)<br />
                <span style={{ color: 'var(--gold)' }}>+</span> (<span style={{ color: 'var(--blue)' }}>Prestige Bonuses</span>
                {' '}<span style={{ color: 'var(--gold)' }}>×</span> 1.0)<br />
                <span style={{ color: 'var(--gold)', display: 'block', marginTop: '0.25rem' }}>──────────────────────</span>
                <span style={{ color: 'var(--green)', fontWeight: 500 }}>= Your Global Stack Rank</span>
              </div>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--muted2)', marginBottom: '1.5rem' }}>
                <strong style={{ color: 'var(--text)' }}>Why we show the formula.</strong> Most ranking systems are black boxes. We believe
                the best professionals deserve to know exactly what they're judged on — and
                exactly what to invest in next to grow their rank. Every signal is verifiable. Nothing is estimated.
              </p>

              {/* Example box */}
              <div style={{ padding: '1.1rem 1.4rem', background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', borderRadius: 8 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.6rem' }}>
                  Example Profile Score
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.8, margin: '0 0 0.65rem' }}>
                  3× Associate certs (4,500) + 1× Expert cert (3,000)<br />
                  + 2× Enterprise projects (4,000) + MVP bonus (1,500)<br />
                  + 3× peer referrals (1,500) + validations given (900)
                </p>
                <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.4rem', color: 'var(--gold)' }}>
                  = 15,400 Stack Points → Principal Architect
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button className="btn btn-outline" onClick={() => onNavigate('scoring')}>
                  View full scoring breakdown →
                </button>
              </div>
            </div>

            {/* Right: points reference table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-blue)' }}>
              <div style={{
                background: 'var(--blue-dim)', padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-blue)',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ opacity: 0.5 }}>{'{ }'}</span> Points Reference Table
              </div>
              <div style={{ padding: '0 1.5rem' }}>
                {[
                  { name: 'Sign Up + Complete Profile',      weight: 'Founding',    pts: '500 pts',   color: 'var(--green)'  },
                  { name: 'Fundamentals Certification',      weight: '×1.0',        pts: '500 pts',   color: 'var(--muted2)' },
                  { name: 'Associate Certification',         weight: '×1.5',        pts: '1,500 pts', color: 'var(--blue)'   },
                  { name: 'Expert / Specialty Cert',        weight: '×3.0',        pts: '3,000 pts', color: 'var(--gold)'   },
                  { name: 'Applied Skills Credential',      weight: '×0.4',        pts: '400 pts',   color: 'var(--green)'  },
                  { name: 'Validated Project (Std)',         weight: '×0.8',        pts: '800 pts',   color: 'var(--blue)'   },
                  { name: 'Validated Project (Enterprise)', weight: '×2.0',        pts: '2,000 pts', color: 'var(--purple)' },
                  { name: 'Copilot Studio certs',           weight: '1.25× bonus', pts: 'Scarcity',  color: 'var(--pink)'   },
                  { name: 'Microsoft MVP',                  weight: 'Prestige',    pts: '1,500 pts', color: 'var(--gold)'   },
                  { name: 'Peer Referral (both join)',      weight: '×0.5',        pts: '500 pts',   color: 'var(--muted2)' },
                ].map((row, i, arr) => (
                  <div key={row.name} className="pts-row" style={{
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{row.name}</span>
                    <span className="pts-weight" style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem',
                      color: 'var(--muted)', background: 'var(--surface2)',
                      padding: '0.2rem 0.5rem', borderRadius: 4,
                    }}>{row.weight}</span>
                    <span style={{
                      fontFamily: 'Rubik', fontWeight: 700, fontSize: '1rem',
                      color: row.color, minWidth: '4.5rem', textAlign: 'right',
                    }}>{row.pts}</span>
                  </div>
                ))}
              </div>
              <div style={{
                background: 'var(--blue-dim)', borderTop: '1px solid var(--border-blue)',
                padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)' }}>
                  All points verified — zero self-reported
                </span>
                <span style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.35rem', color: 'var(--gold)' }}>Transparent</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE RANKINGS PREVIEW ───────────────────────── */}
      <section style={{ padding: '5.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="badge badge-muted" style={{ marginBottom: '1rem' }}>Live Rankings</div>
          <h2 style={{ marginBottom: '0.6rem' }}>Your Rank Is Waiting.<br />Where Will You Place?</h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted2)', lineHeight: 1.7, maxWidth: 520, marginBottom: '3rem' }}>
            The leaderboard updates as professionals verify skills and validate projects. This is what you're joining.
          </p>

          <div className="rankings-grid-b">

            {/* Power Platform UK panel */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--surface2)', padding: '0.85rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>⚡ Power Platform</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>United Kingdom</span>
              </div>
              {[
                { initials: 'SK', name: 'Sarah K.',  tags: [{ label: 'PL-600', c: 'var(--gold)'   }, { label: 'MVP',    c: 'var(--gold)'   }], pts: 9840,  bg: 'linear-gradient(135deg,#0078d4,#9b72f5)', rank: 0 },
                { initials: 'MR', name: 'Marcus R.', tags: [{ label: 'PL-400', c: 'var(--blue)'   }, { label: 'AI-102', c: 'var(--purple)' }], pts: 8415,  bg: 'linear-gradient(135deg,#107c10,#0078d4)', rank: 1 },
                { initials: 'PL', name: 'Priya L.',  tags: [{ label: 'PL-200', c: 'var(--blue)'   }, { label: 'Expert', c: 'var(--gold)'   }], pts: 7720,  bg: 'linear-gradient(135deg,#c8a84b,#d13438)', rank: 2 },
                { initials: 'JT', name: 'James T.',  tags: [{ label: 'PL-400', c: 'var(--blue)'   }],                                         pts: 6230,  bg: 'linear-gradient(135deg,#486860,#0078d4)', rank: 3 },
                { initials: 'AN', name: 'Aisha N.',  tags: [{ label: 'PL-600', c: 'var(--purple)' }],                                         pts: 5890,  bg: 'linear-gradient(135deg,#5c2d91,#c8a84b)', rank: 4 },
              ].map((row, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const rankColors = ['var(--gold)', '#a0aab5', '#cd8b4a'];
                return (
                  <div key={row.name} className="lb-row-b"
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ width: '1.75rem', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: i < 3 ? rankColors[i] : 'var(--muted)', flexShrink: 0 }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rubik', fontWeight: 600, fontSize: '0.75rem', color: '#fff', background: row.bg }}>
                      {row.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lb-name">{row.name}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {row.tags.map(t => (
                          <span key={t.label} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', padding: '0.12rem 0.4rem', borderRadius: 3, background: 'var(--surface3)', color: t.c }}>{t.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="lb-pts-b">
                      <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue)' }}>{row.pts.toLocaleString()}</div>
                      <div className="lb-pts-label" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stack Pts</div>
                    </div>
                  </div>
                );
              })}
              {/* Projected rank row */}
              <div className="proj-rank-row" style={{ background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', borderRadius: 8, padding: '1rem 1.4rem', margin: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.5 }}>
                  Your projected rank after signup + 2 certs + 1 project:<br />
                  <strong style={{ color: 'var(--text)', fontFamily: 'Rubik', fontSize: '1rem', fontWeight: 700 }}>~ #8 Power Platform · UK</strong>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  {[{ n: '#8', l: 'UK Rank' }, { n: '#34', l: 'Global' }].map(r => (
                    <div key={r.l} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.6rem', color: 'var(--gold)', lineHeight: 1 }}>{r.n}</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{r.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Copilot Studio panel */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--surface2)', padding: '0.85rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🤖 Copilot Studio</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Global · Emerging</span>
              </div>
              {SAMPLE_USERS.filter(u => u.specialism === 'Copilot Studio').slice(0, 4).map((u, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const rankColors = ['var(--gold)', '#a0aab5', '#cd8b4a'];
                const avatarBgs = [
                  'linear-gradient(135deg,#00b4ff,#9b72f5)',
                  'linear-gradient(135deg,#9b72f5,#00dfa0)',
                  'linear-gradient(135deg,#0078d4,#00dfa0)',
                  'linear-gradient(135deg,#f0c040,#9b72f5)',
                ];
                return (
                  <div key={u.id} className="lb-row-b"
                    onClick={() => onNavigate('profile', { userData: u })}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <div style={{ width: '1.75rem', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: i < 3 ? rankColors[i] : 'var(--muted)', flexShrink: 0 }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rubik', fontWeight: 700, fontSize: '0.72rem', color: '#fff', background: avatarBgs[i] }}>
                      {(u.name || '?').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Rubik', sans-serif", fontWeight: 600, fontSize: '0.95rem' }}>{u.name}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {(u.certifications || []).slice(0, 2).map(c => (
                          <span key={c.code} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', padding: '0.12rem 0.4rem', borderRadius: 3, background: 'var(--surface2)', color: 'var(--blue)' }}>{c.code}</span>
                        ))}
                      </div>
                    </div>
                    <div className="lb-pts-b">
                      <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue)' }}>{u.score.toLocaleString()}</div>
                      <div className="lb-pts-label" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stack Pts</div>
                    </div>
                  </div>
                );
              })}
              {/* Fast-growing callout */}
              <div style={{ padding: '1.1rem 1.4rem', margin: '1rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted2)', lineHeight: 1.65, margin: '0 0 0.6rem' }}>
                  Copilot is the <strong style={{ color: 'var(--text)' }}>fastest-growing specialism</strong>. Early movers claim top ranks now — before the competition catches up.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--green)', fontSize: '1.1rem' }}>↑</span>
                  <span style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.4rem', color: 'var(--green)' }}>Fast</span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.52rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '0.1rem' }}>Growing</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn btn-outline btn-lg" onClick={() => onNavigate('leaderboard')}>
              View full leaderboard →
            </button>
          </div>
        </div>
      </section>

      {/* ─── DEMO CTA ────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', background: '#f6f7f8', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', justifyContent: 'center' }}>
            {[
              { label: 'Live Leaderboard', desc: 'See 15 sample professionals ranked', btn: 'View Rankings', page: 'leaderboard', color: 'var(--blue)' },
              { label: 'Sample Profile',   desc: 'Explore a detailed pro profile',    btn: 'Browse Profile', page: 'profile', profileUser: SAMPLE_USERS[0], color: 'var(--purple)' },
              { label: 'Full Scoring',     desc: '35+ certs explained with point values', btn: 'See the Math', page: 'scoring', color: 'var(--gold)' },
            ].map(d => (
              <div key={d.label} className="card" style={{ flex: '1 0 220px', maxWidth: 300, borderTop: `3px solid ${d.color}`, textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>{d.label}</div>
                <p style={{ color: 'var(--muted2)', fontSize: '0.84rem', marginBottom: '1.1rem' }}>{d.desc}</p>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => d.profileUser
                    ? onNavigate(d.page, { userData: d.profileUser })
                    : onNavigate(d.page)
                  }
                >
                  {d.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL WAITLIST CTA ──────────────────────────── */}
      <section style={{
        padding: '6rem 0',
        background: 'linear-gradient(180deg, #1d293f 0%, #282B38 100%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 1.1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 500, background: 'rgba(15,83,250,0.2)', border: '1px solid rgba(15,83,250,0.3)', color: '#7fb8ff', marginBottom: '1.5rem' }}>
            ⚡ Early Access Open
          </div>
          <h2 style={{ marginBottom: '1rem', color: '#fff', fontSize: 'clamp(1.9rem, 4vw, 3rem)' }}>
            Claim your rank before<br/>everyone else does
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            StackRank365 is in early access. Founding members earn <strong style={{ color: '#ffb30c' }}>500 bonus Stack Points</strong> —
            enough to enter the leaderboard the moment we launch.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <WaitlistForm variant="footer" />
          </div>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>
            No spam. No credit card. Just your spot in the community.
          </p>
        </div>
      </section>

    </div>
  );
}
