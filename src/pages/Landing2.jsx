/*
 * Landing page rebuilt using TWHO's HTML scaffold (Option B).
 * All original SR365 content sections preserved, but rendered through
 * TWHO's component classes (.hero-home, .tiles, .tile, .cta, .component-intro,
 * .page-title, .element, etc — see src/styles/twho.css).
 */
import { useState } from 'react';
import { RANK_TIERS, SAMPLE_USERS } from '../data/data';
import TWHOSprite from '../components/TWHOSprite';

const SB_URL   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

/* ─── site-alert ──────────────────────────────────────────────────────────── */
function SiteAlert({ onDismiss }) {
  return (
    <aside className="site-alert">
      <div className="site-alert-grid">
        <div className="site-alert__decorator">
          <svg className="site-alert__decorator-icon" aria-hidden="true"><use xlinkHref="#alert"/></svg>
        </div>
        <div className="site-alert__content">
          <h2 className="site-alert__heading">Beta release</h2>
          <div className="rich-text">
            StackRank365 is in early beta — we're collecting feedback from founding members.{' '}
            <a href="?page=survey">Share your feedback</a>.
          </div>
        </div>
        <button className="site-alert__dismiss" aria-label="Dismiss this alert" onClick={onDismiss}>
          <svg className="site-alert__dismiss-icon" aria-hidden="true"><use xlinkHref="#close"/></svg>
        </button>
      </div>
    </aside>
  );
}

/* ─── waitlist ────────────────────────────────────────────────────────────── */
function WaitlistForm({ variant = 'hero' }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined]   = useState(false);
  const [error, setError]     = useState('');

  const handle = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setError('Enter a valid email'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(SB_URL + '/rest/v1/waitlist', {
        method: 'POST',
        headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + ANON_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), source: variant }),
      });
      if (res.ok || res.status === 409) {
        setJoined(true);
        fetch(SB_URL + '/functions/v1/send-email', {
          method: 'POST',
          headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: email.toLowerCase().trim(), template_key: 'waitlist_signup', variables: { name: email.split('@')[0] } }),
        }).catch(() => {});
      } else { setError('Something went wrong. Please try again.'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  if (joined) {
    return (
      <div style={{ padding:'1rem 1.25rem', background:'var(--color-pale-success)', border:'1px solid var(--color-solid-success)', color:'#0a3622', borderRadius:4, marginTop:'1.5rem' }}>
        ✓ You&rsquo;re on the list. We&rsquo;ll be in touch at <strong>{email}</strong>.
      </div>
    );
  }

  return (
    <form onSubmit={handle} style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'1.5rem', maxWidth:480 }}>
      <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
        style={{ flex:'1 1 220px', minWidth:0, padding:'0.85rem 1rem', fontSize:'1rem', border:'1px solid var(--color-pale-charcoal)', borderRadius:4, fontFamily:'inherit', minHeight:'var(--min-input-height)' }}/>
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Joining…' : 'Join waitlist'}
      </button>
      {error && <div style={{ width:'100%', fontSize:'0.95rem', color:'var(--color-solid-error)', marginTop:'0.25rem' }}>{error}</div>}
    </form>
  );
}

/* ─── reusable: TWHO tile ─────────────────────────────────────────────────── */
function Tile({ heading, description, onClick, children }) {
  return (
    <li className="tile">
      {children}
      <h3 className="tile__heading">{heading}</h3>
      <p className="tile__description">{description}</p>
      {onClick && (
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="tile__link">
          <span className="sr-only">{heading}</span>
          <svg className="tile__icon tile__icon--go" width="18" height="16" aria-hidden="true">
            <use xlinkHref="#arrow"/>
          </svg>
        </a>
      )}
    </li>
  );
}

/* ─── full-width navy CTA ─────────────────────────────────────────────────── */
function CTABlock({ title, description, ctaLabel, onClick }) {
  return (
    <section className="cta element" style={{ position:'relative', padding:'4rem 0', color:'var(--color-white)' }}>
      <div className="cta__background-pattern" style={{ position:'absolute', inset:0, background:'var(--color-secondary-100)', color:'var(--color-bg-pattern-dark-theme)', zIndex:-1 }}>
        <svg width="100%" height="100%" style={{ opacity:0.4, color:'var(--color-bg-pattern-dark-theme)' }}>
          <pattern id="cta-hex" patternUnits="userSpaceOnUse" width="60" height="52" x="0" y="0">
            <use xlinkHref="#divider-pattern" width="60" height="52"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#cta-hex)" stroke="currentColor"/>
        </svg>
      </div>
      <div className="u-content-width">
        <div style={{ maxWidth:760 }}>
          <h2 style={{ color:'var(--color-white)', marginBottom:'1rem' }}>{title}</h2>
          <div className="cta__description" style={{ fontSize:'1.0625rem', lineHeight:1.65, color:'rgba(255,255,255,0.92)', marginBottom:'1.5rem' }}>{description}</div>
          <div className="cta__link-wrapper">
            <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.85rem 1.5rem', background:'var(--color-white)', color:'var(--color-secondary-100)', borderRadius:4, fontWeight:600, textDecoration:'none' }}>
              {ctaLabel}
              <svg width="18" height="16" aria-hidden="true"><use xlinkHref="#arrow"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── component-intro ─────────────────────────────────────────────────────── */
function ComponentIntro({ id, heading, intro }) {
  return (
    <div className="component-intro" id={id} tabIndex={-1}>
      <h2 style={{ marginBottom:'0.5rem' }}>{heading}</h2>
      {intro && <div className="rich-text" style={{ fontSize:'1.0625rem', color:'var(--color-charcoal)', maxWidth:'52rem' }}>{intro}</div>}
    </div>
  );
}

/* ─── HERO — 2-col: text+waitlist left, leaderboard right ────────────────── */
function HeroHome({ onNavigate, heroRanks }) {
  const top3 = heroRanks.slice(0, 3);
  const rest = heroRanks.slice(3);
  return (
    <section style={{ background:'var(--color-bg-pattern-light-theme)', paddingTop:'3rem', paddingBottom:'4rem', position:'relative' }}>
      <div className="u-content-width">
        <div className="hero-home-twho-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:'2.5rem', alignItems:'stretch' }}>
          {/* LEFT — copy + waitlist CTA */}
          <div style={{ gridColumn:1, gridRow:1 }} className="hero-twho-left">
            <h1 className="page-title page-title--bilingual" style={{ marginBottom:'1.5rem' }}>
              <span className="page-title__text page-title__text--primary" style={{ color:'var(--color-secondary-100)' }}>
                Microsoft Careers
              </span>
              <span className="sr-only">-</span>
              <span className="page-title__text page-title__text--secondary" style={{ color:'var(--color-secondary-100)' }}>
                The verified ranking community for Dynamics 365, Power Platform, Copilot Studio &amp; Azure OpenAI
              </span>
            </h1>
            <div className="page-title__intro-text" style={{ maxWidth:'30rem', color:'var(--color-charcoal)', fontSize:'1.125rem', lineHeight:1.6 }}>
              StackRank365 is the trust layer for Microsoft careers — verified certifications, peer validation, and a transparent score that proves applied expertise.
            </div>
            <WaitlistForm variant="hero" />
            <p style={{ marginTop:'0.85rem', fontSize:'0.95rem', color:'var(--color-charcoal)' }}>
              Free to join · +500 founding bonus · No credit card
            </p>
            <div style={{ display:'flex', gap:'2rem', marginTop:'1.5rem', flexWrap:'wrap' }}>
              {[['35+','cert types tracked'], ['6','specializations'], ['Free','to join']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--color-secondary-100)' }}>{n}</div>
                  <div style={{ fontSize:'0.85rem', color:'var(--color-charcoal)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — leaderboard preview: podium top-3 + list of remaining */}
          <div style={{ gridColumn:1, gridRow:2 }} className="hero-twho-right">
            <div style={{ background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:6, padding:'1.5rem', height:'100%', display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)', fontWeight:700 }}>Live leaderboard</div>
                <button onClick={() => onNavigate('leaderboard')} className="btn btn-ghost btn-sm" style={{ color:'var(--color-primary-100)' }}>View all →</button>
              </div>

              {/* Podium: 2nd left, 1st centre (tallest), 3rd right */}
              {(() => {
                const visual = [top3[1], top3[0], top3[2]];
                const heights = [110, 150, 120];
                const medals  = ['🥈', '🥇', '🥉'];
                const isGolds = [false, true, false];
                return (
                  <div style={{ display:'flex', gap:'0.65rem', alignItems:'flex-end', marginBottom:'1rem' }}>
                    {visual.map((u, vi) => {
                      if (!u) return null;
                      const isGold = isGolds[vi];
                      return (
                        <div key={u.id} onClick={() => onNavigate('profile', { userData:u })}
                          style={{ flex:1, textAlign:'center', cursor:'pointer' }}>
                          <div style={{
                            height: heights[vi],
                            background: isGold ? 'linear-gradient(180deg, #fff7d6, #ffe69c)' : 'var(--color-primary-5)',
                            border: `1px solid ${isGold ? '#ffc83c' : 'var(--color-primary-25)'}`,
                            borderRadius: '8px 8px 4px 4px',
                            display: 'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'center',
                            gap:'0.35rem', padding:'0.5rem',
                            transition:'transform 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}
                          >
                            <div style={{
                              width: isGold ? 44 : 36, height: isGold ? 44 : 36,
                              borderRadius:'50%',
                              background: isGold ? '#13294b' : 'var(--color-secondary-100)',
                              color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                              fontWeight:700, fontSize: isGold ? '1rem' : '0.85rem',
                              border: isGold ? '2px solid #ffc83c' : 'none',
                            }}>{(u.name || '?')[0]}</div>
                            <div style={{ fontSize: isGold ? '0.85rem' : '0.78rem', fontWeight:700, color:'var(--color-secondary-100)', lineHeight:1.1 }}>
                              {u.name.split(' ')[0]}
                            </div>
                            <div style={{ fontSize:'0.7rem', color:'var(--color-primary-100)', fontWeight:600 }}>
                              {u.score.toLocaleString()}
                            </div>
                            <div style={{ fontSize:'1rem', lineHeight:1 }}>{medals[vi]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Rows 4+ — fills remaining height */}
              <div style={{ flex:1, minHeight:0, overflowY:'auto' }}>
                {rest.map((u, i) => (
                  <div key={u.id} onClick={() => onNavigate('profile', { userData:u })}
                    style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0', borderTop:'1px solid var(--color-pale-charcoal)', cursor:'pointer' }}>
                    <span style={{ width:22, fontWeight:700, color:'var(--color-secondary-100)', fontSize:'0.8rem' }}>{i+4}</span>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--color-secondary-100)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.72rem' }}>{(u.name||'?')[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                      <div style={{ fontSize:'0.72rem', color:'var(--color-charcoal)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.headline}</div>
                    </div>
                    <span style={{ fontWeight:700, color:'var(--color-primary-100)', fontSize:'0.88rem' }}>{u.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(min-width: 900px){
          .hero-home-twho-grid { grid-template-columns: 1.05fr 1fr !important; gap: 4rem !important; }
          .hero-twho-left  { grid-column: 1 !important; grid-row: 1 !important; }
          .hero-twho-right { grid-column: 2 !important; grid-row: 1 !important; }
        }
      `}</style>
    </section>
  );
}

export default function Landing({ onNavigate }) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const heroRanks = [...SAMPLE_USERS].sort((a, b) => b.score - a.score).slice(0, 12);

  return (
    <div style={{ background:'var(--color-white)' }}>
      <TWHOSprite />

      {!alertDismissed && <SiteAlert onDismiss={() => setAlertDismissed(true)} />}

      <HeroHome onNavigate={onNavigate} heroRanks={heroRanks} />

      {/* ─── THE PROBLEM ────────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro
          id="the-problem"
          heading="Microsoft credentials are impossible to verify"
          intro="LinkedIn endorsements are unverified. CVs are self-declared. Recruiters waste weeks interviewing candidates who oversell their depth. Skilled consultants get overlooked because they can't prove what they've built."
        />
        <ul className="tiles">
          {[
            { stat:'73%',     desc:'of hiring managers say Microsoft skills are the hardest to verify before interview' },
            { stat:'3–6 wks', desc:'average wasted per bad hire in the Microsoft ecosystem consulting space' },
            { stat:'61%',     desc:'of certified professionals say their certs are ignored because there\'s no proof of application' },
          ].map(s => (
            <li key={s.stat} className="tile">
              <h3 className="tile__heading" style={{ fontSize:'2.5rem', lineHeight:1, color:'var(--color-secondary-100)' }}>{s.stat}</h3>
              <p className="tile__description">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── THE SOLUTION ────────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro
          id="the-solution"
          heading="A verified rank that speaks louder than a CV"
          intro="StackRank365 combines Microsoft certification verification, peer-validated project evidence, and community recognition into a single trusted score."
        />
        <ul className="tiles" style={{ gridTemplateColumns:'repeat(3, 1fr)' }}>
          <Tile heading="Tier-weighted certifications" description="Each cert earns points by difficulty: Expert (3,000) > Associate (1,500) > Fundamentals (500) > Applied Skills (400). An Expert cert proves 6× more than a Fundamentals badge." onClick={() => onNavigate('scoring')} />
          <Tile heading="Peer-validated projects" description="Colleagues confirm your real implementations. Clients can be anonymised or marked confidential — so enterprise consultants aren't penalised for NDA obligations." onClick={() => onNavigate('how-it-works')} />
          <Tile heading="Copilot scarcity bonus" description="Copilot Studio certifications carry a 1.25× leaderboard multiplier. Early adopters earn a meaningful, lasting edge as the talent pool is still tiny." onClick={() => onNavigate('scoring')} />
          <Tile heading="Global &amp; local rankings" description="Your Stack Points determine a global rank, country rank, and city rank. See exactly where you stand against every other verified professional." onClick={() => onNavigate('leaderboard')} />
          <Tile heading="Community prestige" description="Microsoft MVPs, Certified Trainers, FastTrack Architects, and event speakers earn recognition beyond certifications — rewarding the whole professional." onClick={() => onNavigate('scoring')} />
          <Tile heading="Privacy by design" description="Control exactly what's visible. Projects can be public, anonymised, or confidential. Your rank is always earned — never borrowed from client name-dropping." onClick={() => onNavigate('how-it-works')} />
        </ul>
      </section>

      {/* ─── RANK TIERS ──────────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro
          id="rank-tiers"
          heading="From Explorer to Principal Architect"
          intro="Five tiers. Transparent thresholds. No politics."
        />
        <ul className="tiles" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {RANK_TIERS.map(tier => (
            <li key={tier.name} className="tile" style={{ alignItems:'center', textAlign:'center' }}>
              <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{tier.icon}</div>
              <h3 className="tile__heading" style={{ color:tier.color, fontSize:'1.05rem' }}>{tier.name}</h3>
              <p className="tile__description" style={{ marginBottom:'1rem' }}>{tier.description}</p>
              <span style={{ fontSize:'0.78rem', padding:'0.3rem 0.6rem', background:tier.color, color:'#fff', borderRadius:4, fontWeight:600 }}>
                {tier.minScore.toLocaleString()}{tier.maxScore === Infinity ? '+' : `–${tier.maxScore.toLocaleString()}`} pts
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── SPECIALIZATIONS ─────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro
          id="specializations"
          heading="Six core specializations"
          intro="Verified credentials and project evidence across the entire Microsoft ecosystem."
        />
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.85rem' }}>
          {[
            { name:'Dynamics 365',   icon:'📦', count:'12 certs' },
            { name:'Power Platform', icon:'⚡', count:'10 certs' },
            { name:'Copilot Studio', icon:'🤖', count:'6 certs + 1.25× bonus', hot:true },
            { name:'Azure OpenAI',   icon:'🧠', count:'9 certs' },
            { name:'Dataverse',      icon:'🗄️', count:'Composite score' },
            { name:'Power Apps',     icon:'📱', count:'5 certs' },
          ].map(s => (
            <button key={s.name} onClick={() => onNavigate('scoring')}
              style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1.25rem', background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:999, cursor:'pointer', fontFamily:'inherit', transition:'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--color-accent-105)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--color-primary-25)'}>
              <span style={{ fontSize:'1.25rem' }}>{s.icon}</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--color-secondary-100)' }}>{s.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--color-charcoal)' }}>{s.count}</div>
              </div>
              {s.hot && <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'0.15rem 0.5rem', background:'var(--color-accent-110)', color:'#fff', borderRadius:4 }}>HOT</span>}
            </button>
          ))}
        </div>
        <div style={{ marginTop:'2rem' }}>
          <button className="btn btn-outline" onClick={() => onNavigate('scoring')}>View full scoring breakdown →</button>
        </div>
      </section>

      {/* ─── BUILT FOR MICROSOFT PROFESSIONALS ───────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro id="built-for" heading="Built for Microsoft professionals" />
        <ul className="tiles">
          {[
            { title:'Consultants &amp; Contractors', icon:'🧑‍💻', points:[
              'Prove depth beyond a cert list',
              'Protect client confidentiality while showing project scale',
              'Stand out in a market full of self-declared experts',
              'Track your rank as you grow',
            ]},
            { title:'Solution Architects', icon:'🏗️', points:[
              'Showcase enterprise project complexity',
              'Earn prestige points for MVP, MCT, FastTrack status',
              'Build a public profile that does the talking',
              'Get discovered for the right roles',
            ]},
            { title:'Rising Specialists', icon:'🚀', points:[
              'Enter Copilot Studio early and earn a 1.25× scarcity bonus',
              'Stack points with Applied Skills credentials',
              'Peer validation gives your projects credibility',
              'Build a defensible rank before everyone else does',
            ]},
          ].map(p => (
            <li key={p.title} className="tile">
              <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>{p.icon}</div>
              <h3 className="tile__heading" dangerouslySetInnerHTML={{ __html:p.title }} />
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                {p.points.map(pt => (
                  <li key={pt} style={{ display:'flex', gap:'0.5rem', fontSize:'0.95rem', color:'var(--color-charcoal)', lineHeight:1.55 }}>
                    <span style={{ color:'var(--color-accent-110)', fontWeight:700, flexShrink:0 }}>→</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── FOUR STEPS ──────────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro id="four-steps" heading="Four steps to your verified rank" intro="Simple by design. The whole process takes minutes." />
        <ul className="tiles" style={{ gridTemplateColumns:'1fr', gap:'1rem' }}>
          {[
            { n:'01', title:'Create your profile',         desc:'Join and claim your public URL: stackrank365.com/profile/you' },
            { n:'02', title:'Add your certifications',     desc:'Each cert is weighted by tier. Expert = 3,000 pts. Associate = 1,500. No tricks.' },
            { n:'03', title:'Log your projects',           desc:'Add real implementations with privacy controls. Confidential clients stay confidential.' },
            { n:'04', title:'Invite peer validators',      desc:'Ask colleagues to confirm your project experience. Each validation adds 300 pts and credibility.' },
          ].map(s => (
            <li key={s.n} className="tile" style={{ flexDirection:'row', alignItems:'flex-start', gap:'1.5rem' }}>
              <div style={{ flexShrink:0, width:56, height:56, borderRadius:4, background:'var(--color-primary-5)', border:'1px solid var(--color-primary-25)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--color-primary-100)' }}>{s.n}</div>
              <div>
                <h3 className="tile__heading" style={{ marginBottom:'0.25rem' }}>{s.title}</h3>
                <p className="tile__description" style={{ marginBottom:0 }}>{s.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <div style={{ marginTop:'2rem' }}>
          <button className="btn btn-outline" onClick={() => onNavigate('how-it-works')}>Read the full guide →</button>
        </div>
      </section>

      {/* ─── SCORING SYSTEM ──────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro
          id="scoring-system"
          heading="No black boxes. Every point explained."
          intro="Your StackRank Score is calculated transparently. Here is exactly how it works."
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'2rem', maxWidth:1100 }} className="scoring-twho-grid">
          {/* Equation */}
          <div>
            <pre style={{ background:'var(--color-secondary-100)', color:'#fff', padding:'1.5rem 1.75rem', borderRadius:4, fontSize:'0.95rem', lineHeight:1.7, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', overflow:'auto', margin:'0 0 1.5rem' }}>
{`StackRank Score =
  (Certifications × level_weight)
+ (Verified Projects × scale_weight)
+ (Community Actions × trust_weight)
+ (Prestige Bonuses × 1.0)
─────────────────────────────────
= Your Global Stack Rank`}
            </pre>
            <p style={{ fontSize:'1rem', lineHeight:1.65, color:'var(--color-charcoal)', marginBottom:'1.25rem' }}>
              <strong style={{ color:'var(--color-secondary-100)' }}>Why we show the formula.</strong> Most ranking systems are black boxes. We believe the best professionals deserve to know exactly what they're judged on — and exactly what to invest in next to grow their rank. Every signal is verifiable. Nothing is estimated.
            </p>
            <div style={{ padding:'1.25rem 1.5rem', background:'var(--color-primary-5)', border:'1px solid var(--color-primary-25)', borderRadius:4 }}>
              <div style={{ fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)', fontWeight:700, marginBottom:'0.5rem' }}>Example profile score</div>
              <p style={{ fontSize:'0.95rem', color:'var(--color-charcoal)', lineHeight:1.7, margin:'0 0 0.5rem' }}>
                3× Associate certs (4,500) + 1× Expert cert (3,000) + 2× Enterprise projects (4,000) + MVP bonus (1,500) + 3× peer referrals (1,500) + validations given (900)
              </p>
              <div style={{ fontWeight:700, fontSize:'1.25rem', color:'var(--color-secondary-100)' }}>= 15,400 Stack Points → Principal Architect</div>
            </div>
          </div>

          {/* Reference table */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ background:'var(--color-primary-5)', padding:'1rem 1.5rem', borderBottom:'1px solid var(--color-primary-25)', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)' }}>
              Points reference table
            </div>
            <div style={{ padding:'0 1.5rem' }}>
              {[
                ['Sign Up + Complete Profile',     'Founding',    '500 pts'],
                ['Fundamentals Certification',     '×1.0',        '500 pts'],
                ['Associate Certification',        '×1.5',        '1,500 pts'],
                ['Expert / Specialty Cert',        '×3.0',        '3,000 pts'],
                ['Applied Skills Credential',      '×0.4',        '400 pts'],
                ['Validated Project (Std)',        '×0.8',        '800 pts'],
                ['Validated Project (Enterprise)', '×2.0',        '2,000 pts'],
                ['Copilot Studio certs',           '1.25× bonus', 'Scarcity'],
                ['Microsoft MVP',                  'Prestige',    '1,500 pts'],
                ['Peer Referral (both join)',      '×0.5',        '500 pts'],
              ].map(([name, weight, pts], i, arr) => (
                <div key={name} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'0.75rem', alignItems:'center', padding:'0.75rem 0', borderBottom: i < arr.length - 1 ? '1px solid var(--color-pale-charcoal)' : 'none' }}>
                  <span style={{ fontSize:'0.95rem', color:'var(--color-secondary-100)' }}>{name}</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--color-charcoal)', background:'var(--color-secondary-5)', padding:'0.2rem 0.55rem', borderRadius:4, fontFamily:'ui-monospace, monospace' }}>{weight}</span>
                  <span style={{ fontWeight:700, color:'var(--color-primary-100)', minWidth:'5rem', textAlign:'right' }}>{pts}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--color-primary-5)', borderTop:'1px solid var(--color-primary-25)', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)', fontWeight:600 }}>All points verified — zero self-reported</span>
              <span style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--color-accent-110)' }}>Transparent</span>
            </div>
          </div>
        </div>
        <style>{`@media(min-width: 1024px){ .scoring-twho-grid { grid-template-columns: 1.1fr 1fr !important; } }`}</style>
      </section>

      {/* ─── NAVY CTA STRIP (founding member) ────────────────────────────── */}
      <CTABlock
        title="Become a founding member"
        description="Join the early-access waitlist now and receive +500 bonus Stack Points, a founding-member badge, and priority placement when profile creation opens."
        ctaLabel="Join the waitlist"
        onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
      />

      {/* ─── LIVE RANKINGS PREVIEW ───────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro
          id="live-rankings"
          heading="Your rank is waiting. Where will you place?"
          intro="The leaderboard updates as professionals verify skills and validate projects. This is what you're joining."
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.5rem' }} className="rankings-twho-grid">
          {/* Power Platform UK panel */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ background:'var(--color-primary-5)', padding:'0.85rem 1.4rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-primary-25)' }}>
              <span style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--color-secondary-100)' }}>⚡ Power Platform</span>
              <span style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-charcoal)' }}>United Kingdom</span>
            </div>
            {[
              { initials:'SK', name:'Sarah K.',  pts:9840, tags:['PL-600','MVP'] },
              { initials:'MR', name:'Marcus R.', pts:8415, tags:['PL-400','AI-102'] },
              { initials:'PL', name:'Priya L.',  pts:7720, tags:['PL-200','Expert'] },
              { initials:'JT', name:'James T.',  pts:6230, tags:['PL-400'] },
              { initials:'AN', name:'Aisha N.',  pts:5890, tags:['PL-600'] },
            ].map((row, i) => {
              const medals = ['🥇','🥈','🥉'];
              return (
                <div key={row.name} style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.75rem 1.4rem', borderBottom:'1px solid var(--color-pale-charcoal)' }}>
                  <span style={{ width:'1.5rem', textAlign:'center', fontSize:'0.85rem', color:'var(--color-charcoal)' }}>{i < 3 ? medals[i] : i + 1}</span>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-secondary-100)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.78rem' }}>{row.initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, color:'var(--color-secondary-100)' }}>{row.name}</div>
                    <div style={{ display:'flex', gap:'0.3rem', marginTop:'0.2rem', flexWrap:'wrap' }}>
                      {row.tags.map(t => <span key={t} style={{ fontSize:'0.65rem', padding:'0.15rem 0.45rem', borderRadius:3, background:'var(--color-primary-5)', color:'var(--color-primary-100)' }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, color:'var(--color-primary-100)' }}>{row.pts.toLocaleString()}</div>
                    <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-charcoal)' }}>Stack pts</div>
                  </div>
                </div>
              );
            })}
            <div style={{ background:'var(--color-primary-5)', border:'1px solid var(--color-primary-25)', borderRadius:4, padding:'1rem 1.4rem', margin:'1rem' }}>
              <div style={{ fontSize:'0.95rem', color:'var(--color-charcoal)', lineHeight:1.55 }}>
                Your projected rank after signup + 2 certs + 1 project:<br/>
                <strong style={{ color:'var(--color-secondary-100)' }}>~ #8 Power Platform · UK</strong>
              </div>
            </div>
          </div>

          {/* Copilot Studio panel */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ background:'var(--color-primary-5)', padding:'0.85rem 1.4rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-primary-25)' }}>
              <span style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--color-secondary-100)' }}>🤖 Copilot Studio</span>
              <span style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-charcoal)' }}>Global · Emerging</span>
            </div>
            {SAMPLE_USERS.filter(u => u.specialization === 'Copilot Studio').slice(0, 4).map((u, i) => {
              const medals = ['🥇','🥈','🥉'];
              return (
                <div key={u.id} onClick={() => onNavigate('profile', { userData:u })}
                  style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.75rem 1.4rem', borderBottom:'1px solid var(--color-pale-charcoal)', cursor:'pointer' }}>
                  <span style={{ width:'1.5rem', textAlign:'center', fontSize:'0.85rem', color:'var(--color-charcoal)' }}>{i < 3 ? medals[i] : i + 1}</span>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-accent-110)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.78rem' }}>{(u.name||'?').split(' ').map(n => n[0]).join('')}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, color:'var(--color-secondary-100)' }}>{u.name}</div>
                    <div style={{ display:'flex', gap:'0.3rem', marginTop:'0.2rem', flexWrap:'wrap' }}>
                      {(u.certifications || []).slice(0, 2).map(c => <span key={c.code} style={{ fontSize:'0.65rem', padding:'0.15rem 0.45rem', borderRadius:3, background:'var(--color-primary-5)', color:'var(--color-primary-100)' }}>{c.code}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, color:'var(--color-primary-100)' }}>{u.score.toLocaleString()}</div>
                    <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-charcoal)' }}>Stack pts</div>
                  </div>
                </div>
              );
            })}
            <div style={{ padding:'1rem 1.4rem', margin:'1rem', background:'var(--color-accent-5)', border:'1px solid var(--color-accent-25)', borderRadius:4 }}>
              <p style={{ fontSize:'0.95rem', color:'var(--color-charcoal)', lineHeight:1.55, margin:'0 0 0.5rem' }}>
                Copilot is the <strong style={{ color:'var(--color-secondary-100)' }}>fastest-growing specialization</strong>. Early movers claim top ranks now — before the competition catches up.
              </p>
              <span style={{ fontWeight:700, color:'var(--color-accent-110)' }}>↑ Fast growing</span>
            </div>
          </div>
        </div>
        <style>{`@media(min-width: 900px){ .rankings-twho-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
        <div style={{ textAlign:'center', marginTop:'2rem' }}>
          <button className="btn btn-outline btn-lg" onClick={() => onNavigate('leaderboard')}>View full leaderboard →</button>
        </div>
      </section>

      {/* ─── DEMO CTA ────────────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ul className="tiles">
          {[
            { label:'Live leaderboard', desc:'See 15 sample professionals ranked',  btn:'View rankings',   page:'leaderboard' },
            { label:'Sample profile',   desc:'Explore a detailed pro profile',       btn:'Browse profile',  page:'profile', profileUser:SAMPLE_USERS[0] },
            { label:'Full scoring',     desc:'35+ certs explained with point values',btn:'See the math',    page:'scoring' },
          ].map(d => (
            <li key={d.label} className="tile" style={{ alignItems:'center', textAlign:'center' }}>
              <h3 className="tile__heading">{d.label}</h3>
              <p className="tile__description">{d.desc}</p>
              <button className="btn btn-outline btn-sm"
                onClick={() => d.profileUser ? onNavigate(d.page, { userData:d.profileUser }) : onNavigate(d.page)}>
                {d.btn}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── FINAL WAITLIST ──────────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem', paddingBottom:'5rem', textAlign:'center' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>👑</div>
          <h2 style={{ marginBottom:'1rem' }}>Claim your rank before everyone else does</h2>
          <p style={{ fontSize:'1.0625rem', color:'var(--color-charcoal)', lineHeight:1.65, marginBottom:'2rem' }}>
            StackRank365 is in early access. Founding members earn <strong style={{ color:'var(--color-accent-110)' }}>+500 bonus Stack Points</strong> — enough to enter the leaderboard the moment we launch. The earlier you join, the higher your starting position.
          </p>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <WaitlistForm variant="footer" />
          </div>
        </div>
      </section>

      {/* ─── DATA &amp; STATISTICS ────────────────────────────────────────── */}
      <section className="element u-content-width" style={{ paddingTop:'4rem', paddingBottom:'5rem' }}>
        <ComponentIntro id="data-and-statistics" heading="Data and statistics" intro="StackRank365 by the numbers." />
        <ul className="tiles">
          {[
            ['35+',  'Microsoft cert types tracked'],
            ['6',    'specialization tracks'],
            ['+500', 'bonus points for founding members'],
            ['Free', 'forever for individuals'],
          ].map(([val, label]) => (
            <li key={label} className="tile">
              <h3 className="tile__heading" style={{ fontSize:'2.5rem', lineHeight:1, color:'var(--color-secondary-100)' }}>{val}</h3>
              <p className="tile__description">{label}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
