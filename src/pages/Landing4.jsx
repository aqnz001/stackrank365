import { useState } from 'react';
import { SAMPLE_USERS } from '../data/data';

/* ─── Design tokens — The Reporting Hub style ─────────────────────
   Font:       Inter, sans-serif
   Body bg:    #f6f9fc
   Primary:    #178ee8  (their exact blue)
   Cyan label: #178ee8 tracked uppercase
   Dark navy:  #0b1632
   Nav bg:     #212529
   Heading:    #1f1f28
   Body text:  #64748b
   Gradient hero: 120deg, #6d28d9 → #4f46e5 → #178ee8
──────────────────────────────────────────────────────────────────── */

const T = {
  blue:     '#178ee8',
  blueDk:   '#0e6fc4',
  purple:   '#7c3aed',
  cyan:     '#00d4ff',
  green:    '#22c55e',
  navy:     '#0b1632',
  bodyBg:   '#f6f9fc',
  white:    '#ffffff',
  heading:  '#1f1f28',
  body:     '#64748b',
  muted:    '#94a3b8',
  border:   'rgba(0,0,0,0.08)',
  shadow:   '0 4px 24px rgba(0,0,0,0.08)',
  grad:     'linear-gradient(120deg, #6d28d9 0%, #4f46e5 45%, #178ee8 100%)',
  gradMid:  'linear-gradient(120deg, #5b21b6 0%, #4338ca 50%, #0e6fc4 100%)',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.sr4 { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f6f9fc; color: #64748b; }
.sr4 * { box-sizing: border-box; }
.sr4 h1,.sr4 h2,.sr4 h3,.sr4 h4 { color: #1f1f28; font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; margin: 0; }
.sr4 p { line-height: 1.75; margin: 0; }
.sr4-wrap { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.sr4-lbl { display: inline-block; font-size: 0.78rem; font-weight: 700; letter-spacing: 5.5px; text-transform: uppercase; color: #178ee8; margin-bottom: 1rem; }
.sr4-lbl-c { color: #00d4ff; }
.sr4-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #178ee8; color: #fff; border: none; border-radius: 6px; padding: 0.78rem 1.75rem; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; white-space: nowrap; text-decoration: none; }
.sr4-btn:hover { background: #0e6fc4; }
.sr4-ghost { display: inline-flex; align-items: center; gap: 0.4rem; background: transparent; color: #fff; border: none; font-size: 1rem; font-weight: 600; cursor: pointer; font-family: inherit; opacity: 0.9; transition: opacity 0.2s; padding: 0.7rem 0; }
.sr4-ghost:hover { opacity: 0.65; }
.sr4-outline { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: #178ee8; border: 2px solid #178ee8; border-radius: 6px; padding: 0.7rem 1.5rem; font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.18s; }
.sr4-outline:hover { background: #178ee8; color: #fff; }
.sr4-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.08); }
.sr4-card-d { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; }
.sr4-input { flex: 1; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 0.75rem 1rem; font-size: 0.95rem; font-family: inherit; outline: none; background: #fff; color: #1f1f28; min-width: 0; }
.sr4-input:focus { border-color: #178ee8; box-shadow: 0 0 0 3px rgba(23,142,232,0.12); }
.sr4-sec { padding: 6rem 0; }
.sr4-sec-sm { padding: 4rem 0; }
.sr4-g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.sr4-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; align-items: start; }
.sr4-g5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; }
.sr4-g6 { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; max-width: 900px; margin: 0 auto; }
.sr4-hr { display: none; }
@media(max-width:960px){
  .sr4-g3,.sr4-g2 { grid-template-columns: 1fr; }
  .sr4-g5 { grid-template-columns: repeat(2,1fr); }
  .sr4-g6 { grid-template-columns: repeat(2,1fr); }
  .sr4-hr { display: none !important; }
}
@media(max-width:600px){
  .sr4-g5,.sr4-g6 { grid-template-columns: 1fr; }
  .sr4-wrap { padding: 0 1.25rem; }
  .sr4-sec { padding: 4rem 0; }
  .sr4-frow { flex-direction: column !important; }
}
`;

function WaitlistForm({ dark = false }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const submit = () => {
    if (!email.includes('@')) { setErr('Please enter a valid email'); return; }
    setDone(true); setErr('');
  };
  if (done) return (
    <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 8, padding: '1rem 1.5rem', color: dark ? '#fff' : T.heading, fontWeight: 700, fontSize: '1rem', maxWidth: 500 }}>
      ✅ You're on the list! We'll be in touch soon.
    </div>
  );
  return (
    <div style={{ maxWidth: 500, width: '100%' }}>
      <div className="sr4-frow" style={{ display: 'flex', gap: '0.75rem' }}>
        <input className="sr4-input" type="email" placeholder="your@email.com" value={email}
          onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          style={dark ? { background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff' } : {}} />
        <button className="sr4-btn" onClick={submit}>🚀 Join the Waitlist</button>
      </div>
      {err && <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.4rem' }}>{err}</p>}
      <p style={{ fontSize: '0.82rem', color: dark ? 'rgba(255,255,255,0.5)' : T.muted, marginTop: '0.6rem' }}>Free to join · No spam · No credit card required</p>
    </div>
  );
}

function RankPill({ score }) {
  const t = score >= 15000 ? { l: 'Principal', c: '#b45309', bg: '#fef3c7' }
          : score >= 8000  ? { l: 'Architect',  c: '#7c3aed', bg: '#ede9fe' }
          : score >= 3500  ? { l: 'Specialist', c: '#178ee8', bg: '#e0f2fe' }
          : score >= 1000  ? { l: 'Practitioner',c:'#059669',bg:'#d1fae5' }
          :                   { l: 'Explorer',   c: '#64748b', bg: '#f1f5f9' };
  return <span style={{ background: t.bg, color: t.c, borderRadius: 20, padding: '0.18rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap', border: `1px solid ${t.c}28` }}>{t.l}</span>;
}

const Tick = ({ color = '#22c55e' }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
    <circle cx="10" cy="10" r="10" fill={color} fillOpacity="0.18"/>
    <path d="M6 10l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* Nav and footer are handled by App.jsx — no embedded nav/footer here */

export default function Landing4({ onNavigate }) {
  const sorted = [...SAMPLE_USERS].sort((a, b) => b.score - a.score);
  const podium = [sorted[1], sorted[0], sorted[2]];
  const rows = sorted.slice(3, 10);

  return (
    <div className="sr4">
      <style>{CSS}</style>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section style={{ background: T.grad, padding: '5rem 0 9rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -100, width: 500, height: 500, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 40, left: '8%', width: 300, height: 300, background: 'rgba(0,212,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="sr4-wrap">
          <div className="sr4-g2" style={{ alignItems: 'flex-start' }}>
            {/* Left */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '0.35rem 1rem', fontSize: '0.82rem', color: '#fff', fontWeight: 600, marginBottom: '1.75rem' }}>
                ⚡ Early Access — Founding Members Get 500 Bonus Points
              </div>

              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                The Verified Talent<br />Ranking Platform for<br />
                <span style={{ color: T.cyan }}>Microsoft Careers</span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', maxWidth: 500, lineHeight: 1.8 }}>
                StackRank365 is the verified talent community for Dynamics 365, Power Platform, Copilot Studio, and Azure OpenAI professionals. Stop listing certifications. Start proving expertise.
              </p>

              <div style={{ marginBottom: '2rem' }}>
                {[
                  'Certification verification via Microsoft Learn API',
                  'Peer-validated project evidence — no self-reporting',
                  'Live global and local rankings by specialization',
                  'Earn prestige points for MVP, MCT, community work',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.75rem', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                    <Tick />
                    {item}
                  </div>
                ))}
              </div>

              <WaitlistForm dark />

              <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap' }}>
                {[['Free', 'to join'], ['+500 pts', 'founding bonus'], ['35+', 'cert types'], ['6', 'specializations']].map(([v, l]) => (
                  <div key={v}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.2rem' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — leaderboard preview */}
            <div className="sr4-hr" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, overflow: 'hidden', display: 'block' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>🏆 Live Rankings</span>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>GLOBAL · ALL SPECIALIZATIONS</span>
              </div>

              {/* Podium */}
              <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1rem 0.5rem', alignItems: 'flex-end' }}>
                {podium.map((u, vi) => {
                  if (!u) return null;
                  const isGold = vi === 1;
                  const heights = ['90px', '120px', '80px'];
                  const medals = ['🥈', '🥇', '🥉'];
                  const avatarBg = isGold ? 'linear-gradient(135deg,#f59e0b,#d97706)' : vi === 0 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#b45309,#92400e)';
                  return (
                    <div key={u.id} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={() => onNavigate('profile', { userData: u })}>
                      <div style={{ height: heights[vi], background: isGold ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isGold ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px 12px 4px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.5rem' }}>
                        <div style={{ width: isGold ? 44 : 36, height: isGold ? 44 : 36, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: isGold ? '1rem' : '0.85rem', color: '#fff' }}>{(u.name||'?')[0]}</div>
                        <div style={{ fontSize: isGold ? '0.88rem' : '0.78rem', fontWeight: 700, color: isGold ? '#fbbf24' : 'rgba(255,255,255,0.9)' }}>{u.name.split(' ')[0]}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: T.cyan }}>{u.score.toLocaleString()}</div>
                        <div>{medals[vi]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rows 4–10 */}
              {rows.map((u, i) => (
                <div key={u.id} onClick={() => onNavigate('profile', { userData: u })} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ width: 20, textAlign: 'right', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', flexShrink: 0 }}>{i + 4}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{(u.name||'?')[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.specialization}</div>
                  </div>
                  <RankPill score={u.score} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem', color: T.cyan, flexShrink: 0 }}>{u.score.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ padding: '0.75rem 1rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="sr4-ghost" style={{ fontSize: '0.85rem' }} onClick={() => onNavigate('leaderboard')}>
                  View full leaderboard — {SAMPLE_USERS.length} professionals →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: T.bodyBg, clipPath: 'polygon(0 100%, 100% 30%, 100% 100%)' }} />
      </section>

      {/* ─── THE PROBLEM ──────────────────────────────────── */}
      <section className="sr4-sec" style={{ background: T.bodyBg }}>
        <div className="sr4-wrap">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="sr4-lbl">A Better Way to Hire Microsoft Talent</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: '1rem' }}>
              Microsoft credentials are <span style={{ color: T.blue }}>impossible to verify</span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: T.body, maxWidth: 620, margin: '0 auto' }}>
              LinkedIn endorsements are unverified. CVs are self-declared. Recruiters waste weeks interviewing candidates who oversell their depth. Skilled consultants get overlooked because they can't prove what they've built.
            </p>
          </div>

          <div className="sr4-g3">
            {[
              { stat: '73%',   desc: 'of hiring managers say Microsoft skills are the hardest to verify before interview', icon: '😤' },
              { stat: '3–6 wks', desc: 'average wasted per bad hire in the Microsoft ecosystem consulting space', icon: '⏱️' },
              { stat: '61%',   desc: 'of certified professionals say their certs are ignored because there\'s no proof of application', icon: '💀' },
            ].map(({ stat, desc, icon }) => (
              <div key={stat} className="sr4-card" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: T.blue, lineHeight: 1, marginBottom: '0.75rem' }}>{stat}</div>
                <p style={{ fontSize: '0.95rem', color: T.body, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE SOLUTION (dark navy) ─────────────────────── */}
      <div style={{ background: T.bodyBg }}>
        <div style={{ background: T.navy, clipPath: 'polygon(0 6%,100% 0,100% 100%,0 100%)', paddingTop: '5rem', paddingBottom: '5rem' }}>
          <div className="sr4-wrap" style={{ paddingTop: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="sr4-lbl sr4-lbl-c">The Solution</span>
              <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: '1rem' }}>A verified rank that speaks louder than a CV</h2>
              <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
                StackRank365 combines Microsoft certification verification, peer-validated project evidence, and community recognition into a single trusted score.
              </p>
            </div>

            <div className="sr4-g3">
              {[
                { icon: '🎓', n: '01', title: 'Tier-Weighted Certifications', desc: 'Each cert earns points by difficulty: Expert (3,000) → Associate (1,500) → Fundamentals (500). An Expert cert proves 6× more than a Fundamentals badge.' },
                { icon: '✅', n: '02', title: 'Peer-Validated Projects', desc: 'Colleagues confirm your real implementations. Clients can be anonymised for NDA obligations. Each validation adds 300 pts and genuine credibility.' },
                { icon: '🤖', n: '03', title: 'Copilot Scarcity Bonus', desc: 'Copilot Studio certifications carry a 1.25× leaderboard multiplier. Early adopters earn a meaningful, lasting edge while the talent pool is still tiny.' },
                { icon: '📊', n: '04', title: 'Global & Local Rankings', desc: 'Your Stack Points determine a global rank, country rank, and city rank. See exactly where you stand against every other verified professional.' },
                { icon: '🏆', n: '05', title: 'Community Prestige', desc: 'Microsoft MVPs, Certified Trainers, FastTrack Architects, and event speakers earn recognition beyond certifications — rewarding the whole professional.' },
                { icon: '🔒', n: '06', title: 'Privacy by Design', desc: 'Control exactly what\'s visible. Projects can be public, anonymised, or confidential. Your rank is always earned — never borrowed from client name-dropping.' },
              ].map(f => (
                <div key={f.n} className="sr4-card-d" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{f.icon}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: T.cyan, fontWeight: 700, letterSpacing: '0.1em' }}>{f.n}</span>
                  </div>
                  <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem' }}>{f.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RANK TIERS ───────────────────────────────────── */}
      <section className="sr4-sec" style={{ background: T.white }}>
        <div className="sr4-wrap">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="sr4-lbl">Rank Tiers</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginBottom: '0.75rem' }}>From Explorer to Principal Architect</h2>
            <p style={{ color: T.body }}>Five tiers. Transparent thresholds. No politics.</p>
          </div>

          <div className="sr4-g5">
            {[
              { icon: '🔍', name: 'Explorer',    sub: 'Beginning the journey', range: '0–999 pts',    color: '#64748b', bg: '#f8fafc' },
              { icon: '⚡', name: 'Practitioner', sub: 'Building credibility',  range: '1,000–3,499',  color: '#059669', bg: '#f0fdf4' },
              { icon: '🎯', name: 'Specialist',   sub: 'Established expert',   range: '3,500–7,999',  color: T.blue,    bg: '#eff6ff' },
              { icon: '🏗️', name: 'Architect',    sub: 'Senior professional',  range: '8,000–14,999', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: '👑', name: 'Principal',    sub: 'Elite tier',            range: '15,000+ pts',  color: '#b45309', bg: '#fffbeb' },
            ].map(t => (
              <div key={t.name} className="sr4-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${t.color}`, background: t.bg }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{t.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: t.color, marginBottom: '0.3rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.82rem', color: T.body, marginBottom: '0.65rem' }}>{t.sub}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#fff', borderRadius: 6, padding: '0.3rem 0.6rem', display: 'inline-block', color: T.body, border: `1px solid ${t.color}20` }}>{t.range}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SIX SPECIALIZATIONS ──────────────────────────────── */}
      <section className="sr4-sec" style={{ background: T.bodyBg }}>
        <div className="sr4-wrap">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="sr4-lbl">Six Core Specializations</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginBottom: '0.75rem' }}>
              Verified credentials across the <span style={{ color: T.blue }}>entire Microsoft ecosystem</span>
            </h2>
          </div>

          <div className="sr4-g6">
            {[
              { icon: '📦', name: 'Dynamics 365',   count: '12 certs',               color: T.blue,    hot: false },
              { icon: '⚡', name: 'Power Platform',  count: '10 certs',               color: '#7c3aed', hot: false },
              { icon: '🤖', name: 'Copilot Studio',  count: '6 certs + 1.25× bonus',  color: '#0ea5e9', hot: true  },
              { icon: '🧠', name: 'Azure OpenAI',    count: '9 certs',                color: '#0099bc', hot: false },
              { icon: '🗄️', name: 'Dataverse',       count: 'Composite score',        color: '#059669', hot: false },
              { icon: '📱', name: 'Power Apps',      count: '5 certs',                color: '#d97706', hot: false },
            ].map(s => (
              <div key={s.name} className="sr4-card" style={{ padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.9rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onClick={() => onNavigate('scoring')}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.12), 0 0 0 2px ${s.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: s.color }}>{s.name}</span>
                    {s.hot && <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.65rem', fontWeight: 800, padding: '0.08rem 0.45rem', borderRadius: 10, letterSpacing: '0.04em' }}>HOT</span>}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: T.muted, marginTop: '0.15rem' }}>{s.count}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="sr4-outline" onClick={() => onNavigate('scoring')}>View full scoring breakdown →</button>
          </div>
        </div>
      </section>

      {/* ─── WHO IS THIS FOR (dark navy) ──────────────────── */}
      <div style={{ background: T.bodyBg }}>
        <div style={{ background: T.navy, clipPath: 'polygon(0 5%,100% 0,100% 95%,0 100%)', paddingTop: '6rem', paddingBottom: '6rem' }}>
          <div className="sr4-wrap">
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="sr4-lbl sr4-lbl-c">Built For Everyone</span>
              <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginBottom: '0.75rem' }}>Built for Microsoft Professionals</h2>
              <p style={{ color: 'rgba(255,255,255,0.58)', maxWidth: 540, margin: '0 auto', fontSize: '1rem' }}>
                Whether you're an independent contractor, senior architect, or rising specialist — your rank works for you.
              </p>
            </div>

            <div className="sr4-g3">
              {[
                { icon: '👷', title: 'Consultants & Contractors', bullets: ['Prove depth beyond a cert list', 'Protect client confidentiality while showing project scale', 'Stand out in a market full of self-declared "experts"', 'Track your rank as you grow'] },
                { icon: '🏗️', title: 'Solution Architects', bullets: ['Showcase enterprise project complexity', 'Earn prestige points for MVP, MCT, FastTrack status', 'Build a public profile that does the talking', 'Get discovered for the right roles'] },
                { icon: '🚀', title: 'Rising Specialists', bullets: ['Enter Copilot Studio early — earn a 1.25× scarcity bonus', 'Stack points with Applied Skills credentials', 'Peer validation gives your projects credibility', 'Build a defensible rank before everyone else does'] },
              ].map(p => (
                <div key={p.title} className="sr4-card" style={{ padding: '2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{p.icon}</div>
                  <h3 style={{ color: T.heading, fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem' }}>{p.title}</h3>
                  {p.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', marginBottom: '0.55rem', fontSize: '0.9rem', color: T.body }}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><path d="M4 8l3 3 5-5" stroke={T.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {b}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SCORING FORMULA ──────────────────────────────── */}
      <section className="sr4-sec" style={{ background: T.white }}>
        <div className="sr4-wrap">
          <div className="sr4-g2">
            <div>
              <span className="sr4-lbl">Scoring System</span>
              <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.4rem)', marginBottom: '1rem' }}>No Black Boxes.<br />Every Point Explained.</h2>
              <p style={{ color: T.body, marginBottom: '1.5rem', lineHeight: 1.8 }}>Your StackRank Score is calculated transparently. Here is exactly how it works.</p>

              <div style={{ background: '#0f172a', borderRadius: 12, padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.88rem', lineHeight: 2.1, marginBottom: '1.5rem', borderLeft: `4px solid ${T.blue}` }}>
                <div style={{ color: '#94a3b8' }}>StackRank Score =</div>
                <div><span style={{ color: '#60a5fa' }}>  (Certifications</span><span style={{ color: '#e2e8f0' }}> × level_weight)</span></div>
                <div><span style={{ color: '#f472b6' }}>+ (Verified Projects</span><span style={{ color: '#e2e8f0' }}> × scale_weight)</span></div>
                <div><span style={{ color: '#34d399' }}>+ (Community Actions</span><span style={{ color: '#e2e8f0' }}> × trust_weight)</span></div>
                <div><span style={{ color: '#fbbf24' }}>+ (Prestige Bonuses</span><span style={{ color: '#e2e8f0' }}> × 1.0)</span></div>
                <div style={{ color: '#94a3b8', marginTop: '0.5rem' }}>────────────────────</div>
                <div style={{ color: '#38bdf8', fontWeight: 800 }}>= Your Global Stack Rank</div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1.1rem 1.25rem', background: '#eff6ff', borderRadius: 10, border: `1px solid ${T.blue}18` }}>
                <div style={{ fontSize: '0.88rem', color: T.body, lineHeight: 1.75 }}>
                  Example: 3× Associate certs (4,500) + 1× Expert cert (3,000)<br />
                  + 2× Enterprise projects (4,000) + MVP bonus (1,500)<br />
                  + 3× peer referrals (1,500) + validations given (900)
                </div>
                <div style={{ fontWeight: 800, color: T.blue, marginTop: '0.65rem', fontSize: '1.05rem' }}>
                  = 15,400 Stack Points → Principal Architect 👑
                </div>
              </div>
            </div>

            <div>
              <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: T.shadow }}>
                <div style={{ background: '#0f172a', padding: '0.85rem 1.25rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: T.cyan, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Points Reference Table</span>
                </div>
                {[
                  { name: 'Sign Up + Complete Profile',     weight: 'Founding', pts: '500 pts',   color: '#059669' },
                  { name: 'Fundamentals Certification',      weight: '×1.0',     pts: '500 pts',   color: T.body },
                  { name: 'Associate Certification',         weight: '×1.5',     pts: '1,500 pts', color: T.blue },
                  { name: 'Expert / Specialty Cert',         weight: '×3.0',     pts: '3,000 pts', color: '#b45309' },
                  { name: 'Applied Skills Credential',       weight: '×0.4',     pts: '400 pts',   color: '#059669' },
                  { name: 'Validated Project (Std)',          weight: '×0.8',     pts: '800 pts',   color: T.blue },
                  { name: 'Validated Project (Enterprise)',  weight: '×2.0',     pts: '2,000 pts', color: '#7c3aed' },
                  { name: 'Copilot Studio certs',            weight: '1.25×',    pts: 'Scarcity',  color: '#0ea5e9' },
                  { name: 'Microsoft MVP',                   weight: 'Prestige', pts: '1,500 pts', color: '#b45309' },
                  { name: 'Peer Referral (both join)',       weight: '×0.5',     pts: '500 pts',   color: T.body },
                ].map((row, i) => (
                  <div key={row.name} style={{ display: 'flex', alignItems: 'center', padding: '0.7rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                    <span style={{ flex: 1, fontSize: '0.88rem', color: T.heading }}>{row.name}</span>
                    <span style={{ fontSize: '0.78rem', color: T.muted, fontFamily: 'monospace', marginRight: '1rem', flexShrink: 0 }}>{row.weight}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: row.color, minWidth: 75, textAlign: 'right', flexShrink: 0 }}>{row.pts}</span>
                  </div>
                ))}
                <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', textAlign: 'right' }}>
                  <button style={{ background: 'none', border: 'none', color: T.blue, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => onNavigate('scoring')}>
                    All points verified — zero self-reported →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE RANKINGS PREVIEW ────────────────────────── */}
      <section className="sr4-sec" style={{ background: T.bodyBg }}>
        <div className="sr4-wrap">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="sr4-lbl">Live Rankings</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', marginBottom: '0.75rem' }}>
              Your Rank Is Waiting. <span style={{ color: T.blue }}>Where Will You Place?</span>
            </h2>
            <p style={{ color: T.body, maxWidth: 520, margin: '0 auto', fontSize: '1rem' }}>
              The leaderboard updates as professionals verify skills and validate projects. This is what you're joining.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* PP UK */}
            <div className="sr4-card" style={{ overflow: 'hidden' }}>
              <div style={{ background: '#0f172a', padding: '0.9rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>⚡ Power Platform</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: T.cyan }}>United Kingdom</span>
              </div>
              {[
                { name: 'Sarah K.',  pts: 9840,  tags: ['PL-600','MVP'],    bg: 'linear-gradient(135deg,#0078d4,#9b72f5)' },
                { name: 'Marcus R.', pts: 8415,  tags: ['PL-400','AI-102'], bg: 'linear-gradient(135deg,#107c10,#0078d4)' },
                { name: 'Priya L.',  pts: 7720,  tags: ['PL-200','Expert'], bg: 'linear-gradient(135deg,#c8a84b,#d13438)' },
                { name: 'James T.',  pts: 6230,  tags: ['PL-400'],           bg: 'linear-gradient(135deg,#486860,#0078d4)' },
                { name: 'Aisha N.',  pts: 5890,  tags: ['PL-600'],           bg: 'linear-gradient(135deg,#5c2d91,#c8a84b)' },
              ].map((row, i) => (
                <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <span style={{ width: 22, textAlign: 'center', fontSize: '0.9rem' }}>{['🥇','🥈','🥉'][i] || i + 1}</span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#fff' }}>
                    {row.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: T.heading }}>{row.name}</div>
                    <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                      {row.tags.map(t => <span key={t} style={{ fontFamily: 'monospace', fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: '#eff6ff', color: T.blue, border: `1px solid ${T.blue}20` }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: T.blue }}>{row.pts.toLocaleString()}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.66rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>pts</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: '0.85rem 1.25rem', background: '#eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: T.body }}>Your projected rank (signup + 2 certs + 1 project):</span>
                <span style={{ fontWeight: 800, color: T.blue }}>~ #8</span>
              </div>
            </div>

            {/* Copilot Studio */}
            <div className="sr4-card" style={{ overflow: 'hidden' }}>
              <div style={{ background: '#0f172a', padding: '0.9rem 1.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>🤖 Copilot Studio</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: T.cyan }}>Global · Emerging</span>
              </div>
              {SAMPLE_USERS.filter(u => u.specialization === 'Copilot Studio').slice(0, 3).map((u, i) => {
                const bgs = ['linear-gradient(135deg,#00b4ff,#9b72f5)', 'linear-gradient(135deg,#9b72f5,#00dfa0)', 'linear-gradient(135deg,#0078d4,#00dfa0)'];
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => onNavigate('profile', { userData: u })}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <span style={{ width: 22, textAlign: 'center', fontSize: '0.9rem' }}>{['🥇','🥈','🥉'][i]}</span>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: bgs[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#fff' }}>
                      {(u.name||'?').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: T.heading }}>{u.name}</div>
                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        {(u.certifications||[]).slice(0,2).map(c => <span key={c.code} style={{ fontFamily: 'monospace', fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: 4, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #7c3aed20' }}>{c.code}</span>)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: T.blue }}>{u.score.toLocaleString()}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.66rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>pts</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg,rgba(23,142,232,0.05),rgba(124,58,237,0.05))', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.9rem', color: T.body, lineHeight: 1.7, marginBottom: '0.75rem' }}>
                  Copilot is the <strong style={{ color: T.heading }}>fastest-growing specialization</strong>. Early movers claim top ranks now — before the competition catches up.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>↑</span>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#22c55e' }}>Fast</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: '0.2rem' }}>Growing</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="sr4-outline" onClick={() => onNavigate('leaderboard')}>View full leaderboard →</button>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section className="sr4-sec" style={{ background: T.white }}>
        <div className="sr4-wrap" style={{ maxWidth: 860 }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="sr4-lbl">Simple by Design</span>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Four Steps to Your Verified Rank</h2>
          </div>
          {[
            { n: '01', icon: '👤', title: 'Create your profile', desc: 'Join and claim your public URL: stackrank365.com/profile/you', color: T.blue },
            { n: '02', icon: '🎓', title: 'Add your certifications', desc: 'Each cert is weighted by tier. Expert = 3,000 pts. Associate = 1,500. No tricks.', color: '#7c3aed' },
            { n: '03', icon: '🏗️', title: 'Log your projects', desc: 'Add real implementations with privacy controls. Confidential clients stay confidential.', color: '#059669' },
            { n: '04', icon: '✅', title: 'Invite peer validators', desc: 'Ask colleagues to confirm your project experience. Each validation adds 300 pts and credibility.', color: '#b45309' },
          ].map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: i % 2 === 0 ? '#f8fafc' : '#fff', borderRadius: 12, marginBottom: '1rem', border: `1px solid ${T.border}`, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>{step.n}</div>
              <div>
                <h3 style={{ color: T.heading, fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.35rem' }}>{step.icon} {step.title}</h3>
                <p style={{ color: T.body, fontSize: '0.95rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="sr4-outline" onClick={() => onNavigate('how-it-works')}>Read the full guide →</button>
          </div>
        </div>
      </section>

      {/* ─── EXPLORE DEMOS ────────────────────────────────── */}
      <section className="sr4-sec-sm" style={{ background: T.bodyBg }}>
        <div className="sr4-wrap">
          <div className="sr4-g3">
            {[
              { title: 'Live Leaderboard', desc: 'See 15 sample professionals ranked',    btn: 'View Rankings',  page: 'leaderboard',                   color: T.blue,    icon: '📊' },
              { title: 'Sample Profile',   desc: 'Explore a detailed pro profile',        btn: 'Browse Profile', page: 'profile', user: SAMPLE_USERS[0], color: '#7c3aed', icon: '👤' },
              { title: 'Full Scoring',     desc: '35+ certs explained with point values', btn: 'See the Math',   page: 'scoring',                       color: '#b45309', icon: '🔢' },
            ].map(d => (
              <div key={d.title} className="sr4-card" style={{ padding: '1.75rem', borderTop: `4px solid ${d.color}`, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{d.icon}</div>
                <h3 style={{ color: T.heading, fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.4rem' }}>{d.title}</h3>
                <p style={{ color: T.body, fontSize: '0.9rem', marginBottom: '1.25rem' }}>{d.desc}</p>
                <button style={{ background: 'none', border: `2px solid ${d.color}`, borderRadius: 6, padding: '0.65rem 1.25rem', color: d.color, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', width: '100%', transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = d.color; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = d.color; }}
                  onClick={() => d.user ? onNavigate(d.page, { userData: d.user }) : onNavigate(d.page)}>
                  {d.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section style={{ background: T.gradMid, padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: T.bodyBg, clipPath: 'polygon(0 0,100% 100%,100% 0)' }} />
        <div className="sr4-wrap" style={{ textAlign: 'center', maxWidth: 700, position: 'relative' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👑</div>
          <h2 style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: '#fff', fontWeight: 900, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Claim your rank before everyone else does
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.8 }}>
            StackRank365 is in early access. Founding members earn <strong style={{ color: '#fbbf24' }}>500 bonus points</strong> — enough to enter the leaderboard the moment we launch. The earlier you join, the higher your starting position.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <WaitlistForm dark />
          </div>
        </div>
      </section>

    </div>
  );
}
