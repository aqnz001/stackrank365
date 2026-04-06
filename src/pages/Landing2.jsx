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
        background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.25)', borderRadius: 12,
      }}>
        <span style={{ fontSize: '1.5rem' }}>🎉</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.95rem' }}>You're on the list!</div>
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
        background: 'linear-gradient(150deg, #0d1117 0%, #111827 45%, #131e38 100%)',
        padding: '3.5rem 0 3rem',
      }}>
        {/* orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: 'rgba(0,194,255,0.07)', top: -150, right: -150 }} />
        <div className="orb" style={{ width: 400, height: 400, background: 'rgba(167,139,250,0.06)', bottom: -80, left: -80 }} />
        <div className="orb" style={{ width: 280, height: 280, background: 'rgba(255,200,60,0.04)', top: '35%', left: '38%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-grid">
            {/* Left — copy */}
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="badge badge-blue fade-up">⚡ Early Access — Founding Members Get 500 Bonus Points</span>
              </div>

              <h1 className="stagger-1" style={{ marginBottom: '1.25rem', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                The Trust Layer<br/>
                for <span className="gradient-text-blue">Microsoft Careers</span>
              </h1>

              <p className="stagger-2" style={{
                fontSize: '1.15rem', color: 'var(--muted2)', lineHeight: 1.75,
                marginBottom: '2rem', maxWidth: 480,
              }}>
                StackRank365 is the verified talent ranking community for Dynamics 365, Power Platform,
                Copilot Studio, and Azure OpenAI professionals. Verified proof of applied Microsoft expertise.
              </p>

              <div className="stagger-3" style={{ marginBottom: '2rem' }}>
                <WaitlistForm variant="hero" />
              </div>

              <div className="stagger-4 hero-stats">
                {[
                  ['Free', 'to join'],
                  ['+500 pts', 'founding bonus'],
                  ['35+', 'cert types tracked'],
                  ['6', 'specialisms'],
                ].map(([val, label]) => (
                  <div key={val}>
                    <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.35rem', color: 'var(--blue)' }}>{val}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live leaderboard preview */}
            <div className="stagger-2 hero-right">
              {/* Top 3 podium — sorted by score, content inside boxes */}
              {(() => {
                const sorted = [...top5].sort((a, b) => b.score - a.score);
                // Visual order: 2nd (left), 1st (centre/tallest), 3rd (right)
                const visual = [sorted[1], sorted[0], sorted[2]];
                const heights = ['100px', '140px', '110px'];
                const medals  = ['🥈', '🥇', '🥉'];
                const isGolds = [false, true, false];
                const borderColors = [
                  'var(--border)',
                  'rgba(255,200,60,0.4)',
                  'var(--border)',
                ];
                const bgColors = [
                  'var(--surface2)',
                  'linear-gradient(180deg, rgba(255,200,60,0.15), rgba(255,200,60,0.04))',
                  'var(--surface2)',
                ];
                return (
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-end', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '2px' }}>
                    {visual.map((u, vi) => {
                      if (!u) return null;
                      const isGold = isGolds[vi];
                      return (
                        <div key={u.id}
                          style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
                          onClick={() => onNavigate('profile', { userData: u })}
                        >
                          <div style={{
                            height: heights[vi],
                            background: bgColors[vi],
                            border: `1px solid ${borderColors[vi]}`,
                            borderRadius: '10px 10px 4px 4px',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: '0.4rem', padding: '0.75rem 0.5rem',
                            transition: 'transform 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}
                          >
                            {/* Avatar */}
                            <div style={{
                              width: isGold ? 48 : 40, height: isGold ? 48 : 40,
                              borderRadius: '50%', flexShrink: 0,
                              background: isGold ? 'linear-gradient(135deg, #ffc83c, #ff8c00)' : 'var(--grad-blue)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: isGold ? '1.1rem' : '0.9rem',
                              color: isGold ? '#111' : '#fff',
                              border: isGold ? '2px solid rgba(255,200,60,0.6)' : '2px solid rgba(0,194,255,0.3)',
                              boxShadow: isGold ? '0 0 20px rgba(255,200,60,0.35)' : 'none',
                            }}>{(u.name || '?')[0]}</div>
                            {/* Name */}
                            <div style={{ fontSize: isGold ? '0.82rem' : '0.75rem', fontWeight: 700, color: isGold ? 'var(--gold)' : '#fff', lineHeight: 1 }}>
                              {u.name.split(' ')[0]}
                            </div>
                            {/* Score */}
                            <div style={{ fontFamily: 'Open Sans', fontSize: '0.65rem', color: 'var(--blue)', letterSpacing: '0.02em' }}>
                              {u.score.toLocaleString()}
                            </div>
                            {/* Medal */}
                            <div style={{ fontSize: '1.1rem', lineHeight: 1 }}>{medals[vi]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Rows 4–10 */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {[...preview].sort((a, b) => b.score - a.score).slice(3).map((u, i) => (
                  <div
                    key={u.id}
                    onClick={() => onNavigate('profile', { userData: u })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 1rem',
                      borderBottom: i < preview.slice(3).length - 1 ? '1px solid var(--border)' : 'none',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <span style={{ width: 22, textAlign: 'right', fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'Open Sans', flexShrink: 0 }}>
                      {i + 4}
                    </span>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--surface3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.82rem', fontWeight: 700, color: '#fff',
                    }}>{(u.name || '?')[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.headline}</div>
                    </div>
                    <RankBadge score={u.score} />
                    <span style={{ fontFamily: 'Open Sans', fontWeight: 700, fontSize: '0.82rem', color: 'var(--blue)', flexShrink: 0 }}>
                      {u.score.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('leaderboard')}>
                    View full leaderboard — 15 professionals →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── THE PROBLEM ─────────────────────────────────── */}
      <section style={{ padding: '5rem 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '2rem', color: 'var(--purple)', marginBottom: '0.5rem' }}>{s.stat}</div>
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
                color: 'var(--green)', borderColor: 'rgba(0,229,160,0.25)',
              },
              {
                num: '03', icon: '🤖', title: 'Copilot Scarcity Bonus',
                desc: 'Copilot Studio certifications carry a 1.25× leaderboard multiplier. Early adopters earn a meaningful, lasting edge as the talent pool is still tiny.',
                color: 'var(--purple)', borderColor: 'rgba(167,139,250,0.25)',
              },
              {
                num: '04', icon: '📊', title: 'Global & Local Rankings',
                desc: 'Your Stack Points determine a global rank, country rank, and city rank. See exactly where you stand against every other verified professional in the ecosystem.',
                color: 'var(--gold)', borderColor: 'var(--border-gold)',
              },
              {
                num: '05', icon: '🏅', title: 'Community Prestige',
                desc: 'Microsoft MVPs, Certified Trainers, FastTrack Architects, and event speakers earn recognition beyond certifications — rewarding the whole professional.',
                color: 'var(--orange)', borderColor: 'rgba(251,146,60,0.25)',
              },
              {
                num: '06', icon: '🔒', title: 'Privacy by Design',
                desc: 'Control exactly what\'s visible. Projects can be public, anonymised, or confidential. Your rank is always earned — it\'s never borrowed from client name-dropping.',
                color: 'var(--cyan)', borderColor: 'rgba(0,229,255,0.2)',
              },
            ].map(f => (
              <div
                key={f.num}
                className="card"
                style={{
                  borderTop: `3px solid ${f.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{f.icon}</span>
                  <span style={{ fontFamily: 'Open Sans', fontSize: '0.72rem', color: f.color, fontWeight: 700 }}>{f.num}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RANK TIERS ──────────────────────────────────── */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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
                border: `1px solid ${i === 4 ? 'rgba(255,200,60,0.3)' : 'var(--border)'}`,
                borderRadius: 16,
                boxShadow: i === 4 ? '0 8px 32px rgba(255,200,60,0.1)' : 'none',
              }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.6rem' }}>{tier.icon}</div>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.1rem', color: tier.color, marginBottom: '0.3rem' }}>
                  {tier.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted2)', marginBottom: '0.85rem' }}>{tier.description}</div>
                <div style={{ fontFamily: 'Open Sans', fontSize: '0.72rem', color: '#fff', padding: '0.3rem 0.6rem', background: tier.color, borderRadius: 6, display: 'inline-block' }}>
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
                border: `1px solid var(--border)`,
                borderRadius: 999, cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = s.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
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
      <section style={{ padding: '5rem 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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
              <div key={p.title} className="card" style={{ borderTop: `3px solid ${p.color}`, padding: '2rem' }}>
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
                  width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                  background: 'var(--blue-dim)', border: '1px solid var(--border-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Open Sans', fontWeight: 700, fontSize: '0.82rem', color: 'var(--blue)',
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
      <section style={{ padding: '5.5rem 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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
                <div style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '0.6rem' }}>
                  Example Profile Score
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.8, margin: '0 0 0.65rem' }}>
                  3× Associate certs (4,500) + 1× Expert cert (3,000)<br />
                  + 2× Enterprise projects (4,000) + MVP bonus (1,500)<br />
                  + 3× peer referrals (1,500) + validations given (900)
                </p>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.4rem', color: 'var(--gold)' }}>
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
                fontFamily: 'Open Sans, sans-serif', fontSize: '0.65rem',
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
                      fontFamily: 'Open Sans, sans-serif', fontSize: '0.68rem',
                      color: 'var(--muted)', background: 'var(--surface2)',
                      padding: '0.2rem 0.5rem', borderRadius: 4,
                    }}>{row.weight}</span>
                    <span style={{
                      fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1rem',
                      color: row.color, minWidth: '4.5rem', textAlign: 'right',
                    }}>{row.pts}</span>
                  </div>
                ))}
              </div>
              <div style={{
                background: 'var(--blue-dim)', borderTop: '1px solid var(--border-blue)',
                padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--blue)' }}>
                  All points verified — zero self-reported
                </span>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.35rem', color: 'var(--gold)' }}>Transparent</span>
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
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>⚡ Power Platform</span>
                <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>United Kingdom</span>
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
                    <div style={{ width: '1.75rem', textAlign: 'center', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', color: i < 3 ? rankColors[i] : 'var(--muted)', flexShrink: 0 }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.72rem', color: '#fff', background: row.bg }}>
                      {row.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lb-name">{row.name}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {row.tags.map(t => (
                          <span key={t.label} style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.55rem', padding: '0.12rem 0.4rem', borderRadius: 3, background: 'var(--surface3)', color: t.c }}>{t.label}</span>
                        ))}
                      </div>
                    </div>
                    <div className="lb-pts-b">
                      <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue)' }}>{row.pts.toLocaleString()}</div>
                      <div className="lb-pts-label" style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.5rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stack Pts</div>
                    </div>
                  </div>
                );
              })}
              {/* Projected rank row */}
              <div className="proj-rank-row" style={{ background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', borderRadius: 8, padding: '1rem 1.4rem', margin: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.5 }}>
                  Your projected rank after signup + 2 certs + 1 project:<br />
                  <strong style={{ color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: '1rem', fontWeight: 700 }}>~ #8 Power Platform · UK</strong>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  {[{ n: '#8', l: 'UK Rank' }, { n: '#34', l: 'Global' }].map(r => (
                    <div key={r.l} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.6rem', color: 'var(--gold)', lineHeight: 1 }}>{r.n}</div>
                      <div style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.52rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{r.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Copilot Studio panel */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: 'var(--surface2)', padding: '0.85rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🤖 Copilot Studio</span>
                <span style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>Global · Emerging</span>
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
                    <div style={{ width: '1.75rem', textAlign: 'center', fontFamily: 'Open Sans, sans-serif', fontSize: '0.72rem', color: i < 3 ? rankColors[i] : 'var(--muted)', flexShrink: 0 }}>
                      {i < 3 ? medals[i] : i + 1}
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '0.72rem', color: '#fff', background: avatarBgs[i] }}>
                      {(u.name || '?').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontWeight: 600, fontSize: '0.95rem' }}>{u.name}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {(u.certifications || []).slice(0, 2).map(c => (
                          <span key={c.code} style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.55rem', padding: '0.12rem 0.4rem', borderRadius: 3, background: 'var(--surface3)', color: 'var(--purple)' }}>{c.code}</span>
                        ))}
                      </div>
                    </div>
                    <div className="lb-pts-b">
                      <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.1rem', color: 'var(--blue)' }}>{u.score.toLocaleString()}</div>
                      <div className="lb-pts-label" style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.5rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Stack Pts</div>
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
                  <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.4rem', color: 'var(--green)' }}>Fast</span>
                </div>
                <div style={{ fontFamily: 'Open Sans, sans-serif', fontSize: '0.52rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '0.1rem' }}>Growing</div>
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
      <section style={{ padding: '3rem 0', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', justifyContent: 'center' }}>
            {[
              { label: 'Live Leaderboard', desc: 'See 15 sample professionals ranked', btn: 'View Rankings', page: 'leaderboard', color: 'var(--blue)' },
              { label: 'Sample Profile',   desc: 'Explore a detailed pro profile',    btn: 'Browse Profile', page: 'profile', profileUser: SAMPLE_USERS[0], color: 'var(--purple)' },
              { label: 'Full Scoring',     desc: '35+ certs explained with point values', btn: 'See the Math', page: 'scoring', color: 'var(--gold)' },
            ].map(d => (
              <div key={d.label} className="card" style={{ flex: '1 0 220px', maxWidth: 300, borderTop: `3px solid ${d.color}`, textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>{d.label}</div>
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
        background: 'linear-gradient(135deg, rgba(0,194,255,0.06) 0%, rgba(167,139,250,0.05) 50%, rgba(255,200,60,0.04) 100%)',
        borderTop: '1px solid var(--border)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👑</div>
          <h2 style={{ marginBottom: '1rem' }}>
            Claim your rank before everyone else does
          </h2>
          <p style={{ color: 'var(--muted2)', fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            StackRank365 is in early access. Founding members earn <strong style={{ color: 'var(--gold)' }}>500 bonus Stack Points</strong> — 
            enough to enter the leaderboard the moment we launch. The earlier you join, the higher your starting position.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <WaitlistForm variant="footer" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '1rem' }}>
            No spam. No credit card. Just your spot in the community.
          </p>
        </div>
      </section>

    </div>
  );
}
