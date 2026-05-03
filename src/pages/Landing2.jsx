/*
 * Landing page rebuilt using TWHO's HTML scaffold (Option B).
 * All original SR365 content sections preserved, but rendered through
 * TWHO's component classes (.hero-home, .tiles, .tile, .cta, .component-intro,
 * .page-title, .element, etc — see src/styles/twho.css).
 */
import { useState } from 'react';
import { RANK_TIERS, SAMPLE_USERS } from '../data/data';
import TWHOSprite from '../components/TWHOSprite';
import { displayName, avatarInitials } from '../lib/displayName';

const SB_URL   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

/* ─── site-alert (compact, centered) ─────────────────────────────────────── */
function SiteAlert({ onDismiss }) {
  return (
    <aside style={{ background:'var(--color-accent-5)', borderBottom:'1px solid var(--color-accent-25)', color:'var(--color-primary-100)', position:'relative' }}>
      <div className="u-content-width" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.85rem', padding:'0.55rem 3rem', textAlign:'center' }}>
        <svg width="18" height="16" aria-hidden="true" style={{ flexShrink:0, color:'var(--color-accent-110)' }}><use xlinkHref="#alert"/></svg>
        <div style={{ fontSize:'0.95rem', lineHeight:1.4 }}>
          <strong>Beta release</strong> — StackRank365 is in early beta. <a href="?page=survey">Share your feedback</a>.
        </div>
      </div>
      <button aria-label="Dismiss this alert" onClick={onDismiss}
        style={{ position:'absolute', top:'50%', right:'1rem', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-accent-110)', padding:'0.25rem', display:'flex' }}>
        <svg width="14" height="14" aria-hidden="true"><use xlinkHref="#close"/></svg>
      </button>
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
    <form onSubmit={handle} style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'1.5rem', maxWidth:520 }}>
      <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
        style={{ flex:'1 1 240px', minWidth:0, padding:'0.95rem 1.1rem', fontSize:'1.0625rem', border:'1px solid rgba(255,255,255,0.3)', borderRadius:4, fontFamily:'inherit', minHeight:'var(--min-input-height)', background:'#fff', color:'var(--color-secondary-100)' }}/>
      <button type="submit" disabled={loading} style={{ fontSize:'1.0625rem', padding:'0.95rem 1.5rem', borderRadius:4, fontWeight:600, fontFamily:'inherit', cursor:'pointer', border:'none', background:'var(--color-accent-110)', color:'#fff' }}>
        {loading ? 'Joining…' : 'Join waitlist'}
      </button>
      {error && <div style={{ width:'100%', fontSize:'1rem', color:'#ffb4b0', marginTop:'0.25rem' }}>{error}</div>}
    </form>
  );
}

/* ─── reusable: TWHO tile ─────────────────────────────────────────────────── */
function Tile({ heading, description, onClick, children }) {
  return (
    <li className="tile" style={{ minHeight:'auto', position:'relative' }}>
      {/* corner arrow icon — absolutely positioned, fills entire tile via .tile__link::before */}
      {onClick && (
        <svg aria-hidden="true" width="26" height="22"
          style={{ position:'absolute', top:'1.1rem', right:'1.1rem', color:'var(--color-accent-110)', strokeWidth:2 }}>
          <use xlinkHref="#arrow"/>
        </svg>
      )}
      {children}
      <h3 className="tile__heading" style={{ paddingRight:'2.5rem' }}>{heading}</h3>
      <p className="tile__description" style={{ marginBottom:0 }}>{description}</p>
      {onClick && (
        <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="tile__link"
          style={{ position:'absolute', inset:0, fontSize:0 }}>
          <span className="sr-only">{heading}</span>
        </a>
      )}
    </li>
  );
}

/* ─── full-width navy CTA ─────────────────────────────────────────────────── */
function CTABlock({ title, description, ctaLabel, onClick }) {
  return (
    <section style={{ position:'relative', padding:'4rem 0', color:'#fff', background:'var(--color-secondary-100)', overflow:'hidden' }}>
      {/* hex pattern overlay — fills the section, not absolutely positioned to a constrained child */}
      <svg aria-hidden="true" width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.18, color:'var(--color-bg-pattern-dark-theme)', pointerEvents:'none' }}>
        <pattern id="cta-hex" patternUnits="userSpaceOnUse" width="60" height="52" x="0" y="0">
          <use xlinkHref="#divider-pattern" width="60" height="52"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#cta-hex)"/>
      </svg>
      <div className="u-content-width" style={{ position:'relative' }}>
        <div style={{ maxWidth:760 }}>
          <h2 style={{ color:'#fff', marginBottom:'1rem' }}>{title}</h2>
          <div style={{ fontSize:'1.0625rem', lineHeight:1.65, color:'rgba(255,255,255,0.92)', marginBottom:'1.5rem' }}>{description}</div>
          <div>
            <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.85rem 1.5rem', background:'#fff', color:'var(--color-secondary-100)', borderRadius:4, fontWeight:600, textDecoration:'none' }}>
              {ctaLabel}
              <svg width="18" height="16" aria-hidden="true"><use xlinkHref="#arrow"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── component-intro (centered + eyebrow tag) ───────────────────────────── */
function ComponentIntro({ id, heading, intro, eyebrow, align = 'center' }) {
  const isCenter = align === 'center';
  return (
    <div className="component-intro" id={id} tabIndex={-1} style={{ textAlign: isCenter ? 'center' : 'left', marginBottom:'2.5rem' }}>
      {eyebrow && (
        <div style={{ display:'inline-block', color:'var(--color-accent-110)', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{ marginBottom:'0.5rem' }}>{heading}</h2>
      {intro && (
        <div className="rich-text" style={{ fontSize:'1.0625rem', color:'var(--color-charcoal)', maxWidth: isCenter ? '42rem' : 'none', margin: isCenter ? '0 auto' : 0 }}>
          {intro}
        </div>
      )}
    </div>
  );
}

/* ─── HERO — 2-col: text+waitlist left, leaderboard right ────────────────── */
function HeroHome({ onNavigate, heroRanks }) {
  const top3 = heroRanks.slice(0, 3);
  const rest = heroRanks.slice(3);
  return (
    <section style={{ background:'var(--color-secondary-100)', paddingTop:'3.5rem', paddingBottom:'4rem', position:'relative', color:'#fff' }}>
      {/* subtle teal corner accent */}
      <div style={{ position:'absolute', top:0, right:0, width:'40%', height:'100%', background:'radial-gradient(ellipse at top right, rgba(48,161,172,0.25), transparent 70%)', pointerEvents:'none' }} />

      <div className="u-content-width" style={{ position:'relative' }}>
        <div className="hero-home-twho-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:'2.5rem', alignItems:'stretch' }}>
          {/* LEFT — copy + waitlist CTA */}
          <div style={{ gridColumn:1, gridRow:1 }} className="hero-twho-left">
            <h1 className="page-title" style={{ marginBottom:'1.5rem' }}>
              <span className="page-title__text" style={{ color:'#fff', fontSize:'3rem' }}>
                The Trust Layer for <span style={{ color:'var(--color-accent-100)' }}>Microsoft Careers</span>
              </span>
            </h1>
            <div className="page-title__intro-text" style={{ maxWidth:'34rem', color:'rgba(255,255,255,0.88)', fontSize:'1.25rem', lineHeight:1.6 }}>
              StackRank365 is the verified talent ranking community for Dynamics 365, Power Platform, Copilot Studio, and Azure OpenAI professionals. Verified proof of applied Microsoft expertise.
            </div>
            <WaitlistForm variant="hero" />
            <p style={{ marginTop:'0.85rem', fontSize:'1.0625rem', color:'rgba(255,255,255,0.7)' }}>
              Free to join · +500 founding bonus · No credit card
            </p>
            <div style={{ display:'flex', gap:'2.5rem', marginTop:'2rem', flexWrap:'wrap', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.15)' }}>
              {[['Free','to join'], ['+500','founding bonus'], ['35+','cert types'], ['6','specializations']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--color-accent-100)', lineHeight:1.1 }}>{n}</div>
                  <div style={{ fontSize:'0.88rem', color:'rgba(255,255,255,0.7)', marginTop:'0.15rem' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — leaderboard preview: podium top-3 + list of remaining */}
          <div style={{ gridColumn:1, gridRow:2 }} className="hero-twho-right">
            <div style={{ background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:6, padding:'1.5rem', height:'100%', display:'flex', flexDirection:'column', color:'var(--color-secondary-100)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ fontSize:'0.95rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)', fontWeight:700 }}>Live leaderboard</div>
                <button onClick={() => onNavigate('leaderboard')} className="btn btn-ghost btn-sm" style={{ color:'var(--color-primary-100)', fontSize:'0.95rem' }}>View all →</button>
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
                            position:'relative',
                            height: heights[vi],
                            background: isGold ? 'linear-gradient(180deg, #fff7d6, #ffe69c)' : 'var(--color-primary-5)',
                            border: `1px solid ${isGold ? '#ffc83c' : 'var(--color-primary-25)'}`,
                            borderRadius: '8px 8px 4px 4px',
                            display: 'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'center',
                            gap:'0.3rem', padding:'0.5rem',
                            transition:'transform 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}
                          >
                            {/* medal badge top-right */}
                            <div style={{ position:'absolute', top:6, right:8, fontSize:'1.2rem', lineHeight:1 }}>{medals[vi]}</div>
                            <div style={{
                              width: isGold ? 50 : 42, height: isGold ? 50 : 42,
                              borderRadius:'50%',
                              background: isGold ? '#13294b' : 'var(--color-secondary-100)',
                              color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                              fontWeight:700, fontSize: isGold ? '1.2rem' : '1rem',
                              border: isGold ? '2px solid #ffc83c' : 'none',
                            }}>{avatarInitials(u.name)}</div>
                            <div style={{ fontSize:'1.05rem', fontWeight:600, color:'var(--color-secondary-100)', lineHeight:1.1 }}>
                              {displayName(u.name)}
                            </div>
                            <div style={{ fontSize:'1.1rem', color:'var(--color-primary-100)', fontWeight:700 }}>
                              {u.score.toLocaleString()}
                            </div>
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
                    style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.7rem 0', borderTop:'1px solid var(--color-pale-charcoal)', cursor:'pointer' }}>
                    <span style={{ width:24, fontWeight:700, color:'var(--color-secondary-100)', fontSize:'1rem' }}>{i+4}</span>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--color-secondary-100)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>{avatarInitials(u.name)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName(u.name)}</div>
                      <div style={{ fontSize:'0.85rem', color:'var(--color-charcoal)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.headline}</div>
                    </div>
                    <span style={{ fontWeight:700, color:'var(--color-primary-100)', fontSize:'1.05rem' }}>{u.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media(min-width: 900px){
          .hero-home-twho-grid { grid-template-columns: 1.5fr 1fr !important; gap: 3.5rem !important; }
          .hero-twho-left  { grid-column: 1 !important; grid-row: 1 !important; }
          .hero-twho-right { grid-column: 2 !important; grid-row: 1 !important; }
        }
      `}</style>
    </section>
  );
}

export default function Landing({ onNavigate }) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const heroRanks = [...SAMPLE_USERS].sort((a, b) => b.score - a.score).slice(0, 7);

  return (
    <div style={{ background:'var(--color-white)' }}>
      <TWHOSprite />

      {!alertDismissed && <SiteAlert onDismiss={() => setAlertDismissed(true)} />}

      <HeroHome onNavigate={onNavigate} heroRanks={heroRanks} />

      {/* ─── THE PROBLEM ────────────────────────────────────────────────── */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro
          id="the-problem"
          eyebrow="The problem"
          heading="Microsoft credentials are impossible to verify"
          intro="LinkedIn endorsements are unverified. CVs are self-declared. Skilled Microsoft professionals get overlooked because there's no trustworthy way to prove what they've built."
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'2rem' }}>
          {[
            { stat:'73%',     desc:'of Microsoft professionals say their applied skills are the hardest credential to prove' },
            { stat:'3–6 wks', desc:'average time wasted in the Microsoft ecosystem proving applied expertise from scratch' },
            { stat:'61%',     desc:'of certified professionals say their certs are ignored because there\'s no proof of application' },
          ].map(s => (
            <div key={s.stat} style={{ background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:4, padding:'1.5rem', alignSelf:'start' }}>
              <h3 style={{ margin:'0 0 0.75rem', fontSize:'2.5rem', lineHeight:1, fontWeight:700, color:'var(--color-secondary-100)' }}>{s.stat}</h3>
              <p style={{ margin:0, fontSize:'1rem', lineHeight:1.5, color:'var(--color-charcoal)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ─── THE SOLUTION ────────────────────────────────────────────────── */}
      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro
          id="the-solution"
          eyebrow="The solution"
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
        </div>
      </section>

      {/* ─── RANK TIERS ──────────────────────────────────────────────────── */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro
          id="rank-tiers"
          eyebrow="Rank tiers"
          heading="From Explorer to Principal Architect"
          intro="Five tiers. Transparent thresholds. No politics."
        />
        <ul style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'1rem', listStyle:'none', padding:0, margin:0 }}>
          {RANK_TIERS.map((tier, i) => {
            // Progressive importance — each tier visually richer than the last
            const styles = [
              // Explorer — neutral, lightest
              { bg:'#fafafa',                       border:'1px solid var(--color-pale-charcoal)', nameColor:'var(--color-charcoal)',      pillBg:'#5A5A5A',                   pillColor:'#fff' },
              // Practitioner — pale blue
              { bg:'var(--color-primary-5)',        border:'1px solid var(--color-primary-25)',     nameColor:'var(--color-primary-100)',   pillBg:'var(--color-primary-100)',  pillColor:'#fff' },
              // Specialist — deeper blue tint
              { bg:'#e4eef5',                       border:'1px solid var(--color-primary-50)',     nameColor:'var(--color-primary-100)',   pillBg:'var(--color-secondary-100)',pillColor:'#fff' },
              // Architect — teal tint, premium step
              { bg:'#dff1f2',                       border:'1px solid var(--color-accent-105)',     nameColor:'var(--color-accent-110)',    pillBg:'var(--color-accent-110)',   pillColor:'#fff' },
              // Principal Architect — navy bg + gold (elite)
              { bg:'var(--color-secondary-100)',    border:'1px solid #ffc83c',                     nameColor:'#ffd56b',                    pillBg:'#ffc83c',                   pillColor:'#13294b' },
            ];
            const s = styles[i] || styles[0];
            const isElite = i === styles.length - 1;
            return (
              <li key={tier.name} style={{ background:s.bg, border:s.border, borderRadius:6, padding:'1.4rem 1rem', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'0.5rem', boxShadow: isElite ? '0 8px 24px rgba(19,41,75,0.18)' : 'none', transform: isElite ? 'translateY(-4px)' : 'none' }}>
                <div style={{ fontSize:'2.1rem', lineHeight:1 }}>{tier.icon}</div>
                <h3 style={{ margin:0, color:s.nameColor, fontSize:'1.2rem', fontWeight:700, lineHeight:1.2 }}>{tier.name}</h3>
                <p style={{ margin:0, fontSize:'1rem', color: isElite ? 'rgba(255,255,255,0.82)' : 'var(--color-charcoal)', lineHeight:1.4 }}>{tier.description}</p>
                <span style={{ marginTop:'0.35rem', fontSize:'0.88rem', padding:'0.35rem 0.75rem', background:s.pillBg, color:s.pillColor, borderRadius:999, fontWeight:700, whiteSpace:'nowrap' }}>
                  {tier.minScore.toLocaleString()}{tier.maxScore === Infinity ? '+' : `–${tier.maxScore.toLocaleString()}`} pts
                </span>
              </li>
            );
          })}
        </ul>
        </div>
      </section>

      {/* ─── SPECIALIZATIONS ─────────────────────────────────────────────── */}
      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro
          id="specializations"
          eyebrow="Six specializations"
          heading="Verified across the entire Microsoft ecosystem"
          intro="Verified credentials and project evidence across the entire Microsoft ecosystem."
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1.25rem' }}>
          {[
            // Tier 1 — Most established / largest cert footprint
            { name:'Dynamics 365',   icon:'/icons/microsoft/dynamics-365.svg',   count:'12 certs',         tier:'core' },
            { name:'Power Platform', icon:'/icons/microsoft/power-platform.svg', count:'10 certs',         tier:'core' },
            // Tier 2 — Hottest growth track (scarcity bonus)
            { name:'Copilot Studio', icon:'/icons/microsoft/copilot-studio.svg', count:'6 certs + 1.25× bonus', tier:'hot', hot:true },
            // Tier 3 — Strong but mid-volume
            { name:'Azure OpenAI',   icon:'/icons/microsoft/azure-openai.svg',   count:'9 certs',          tier:'mid' },
            { name:'Dataverse',      icon:'/icons/microsoft/dataverse.svg',      count:'Composite score',  tier:'mid' },
            { name:'Power Apps',     icon:'/icons/microsoft/power-apps.svg',     count:'5 certs',          tier:'mid' },
          ].map(s => {
            const styles = {
              core: { bg:'#fff',                       border:'1px solid var(--color-primary-50)', nameColor:'var(--color-secondary-100)', countColor:'var(--color-primary-100)' },
              hot:  { bg:'var(--color-secondary-100)', border:'1px solid var(--color-accent-105)', nameColor:'#fff',                       countColor:'var(--color-accent-100)'  },
              mid:  { bg:'var(--color-primary-5)',    border:'1px solid var(--color-primary-25)', nameColor:'var(--color-secondary-100)', countColor:'var(--color-charcoal)'    },
            }[s.tier];
            const isHot = s.tier === 'hot';
            return (
              <button key={s.name} onClick={() => onNavigate('scoring')}
                style={{ position:'relative', display:'flex', alignItems:'center', gap:'1.1rem', padding:'1.4rem 1.6rem', background:styles.bg, border:styles.border, borderRadius:12, cursor:'pointer', fontFamily:'inherit', transition:'transform 0.15s, box-shadow 0.15s', width:'100%', minWidth:0, boxShadow: isHot ? '0 10px 28px rgba(19,41,75,0.22)' : 'none', transform: isHot ? 'translateY(-3px)' : 'none' }}
                onMouseEnter={e => { e.currentTarget.style.transform = isHot ? 'translateY(-6px)' : 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = isHot ? 'translateY(-3px)' : 'none'; }}>
                <img src={s.icon} alt="" width="44" height="44" style={{ flexShrink:0, display:'block' }} />
                <div style={{ textAlign:'left', minWidth:0, flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:'1.2rem', color:styles.nameColor, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                  <div style={{ fontSize:'0.95rem', color:styles.countColor, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:'0.15rem', fontWeight: isHot ? 600 : 400 }}>{s.count}</div>
                </div>
                {s.hot && <span style={{ position:'absolute', top:-10, right:14, fontSize:'0.72rem', fontWeight:700, padding:'0.25rem 0.7rem', background:'#ffc83c', color:'#13294b', borderRadius:999, letterSpacing:'0.06em' }}>HOT</span>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop:'2.5rem', textAlign:'center' }}>
          <button onClick={() => onNavigate('scoring')}
            style={{ background:'transparent', color:'var(--color-primary-100)', border:'1.5px solid var(--color-primary-100)', padding:'0.65rem 1.6rem', borderRadius:999, fontSize:'0.95rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--color-primary-100)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--color-primary-100)'; }}>
            View full scoring breakdown →
          </button>
        </div>
        </div>
      </section>

      {/* ─── BUILT FOR MICROSOFT PROFESSIONALS ───────────────────────────── */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro id="built-for" eyebrow="Built for" heading="Made for Microsoft professionals" />
        <ul className="tiles" style={{ gridTemplateColumns:'repeat(3, 1fr)', gridAutoRows:'auto' }}>
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
            <li key={p.title} className="tile" style={{ minHeight:'auto' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                <span style={{ fontSize:'1.75rem' }}>{p.icon}</span>
                <h3 className="tile__heading" style={{ margin:0 }} dangerouslySetInnerHTML={{ __html:p.title }} />
              </div>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                {p.points.map(pt => (
                  <li key={pt} style={{ display:'flex', gap:'0.5rem', fontSize:'0.95rem', color:'var(--color-charcoal)', lineHeight:1.5 }}>
                    <span style={{ color:'var(--color-accent-110)', fontWeight:700, flexShrink:0 }}>→</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        </div>
      </section>

      {/* ─── FIVE STEPS ──────────────────────────────────────────────────── */}
      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro id="five-steps" eyebrow="Simple by design" heading="Five steps to your verified rank" intro="Simple by design. The whole process takes minutes." />
        <div className="five-steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'1.2rem' }}>
          {[
            { n:'01', title:'Create your profile',     desc:'Join and claim your public URL: stackrank365.com/profile/you',                                              cta:'Get started' },
            { n:'02', title:'Add your certifications', desc:'Each cert is weighted by tier. Expert = 3,000 pts. Associate = 1,500. No tricks.',                          cta:'See scoring' },
            { n:'03', title:'Log your projects',       desc:'Add real implementations with privacy controls. Confidential clients stay confidential.',                   cta:'How it works' },
            { n:'04', title:'Invite peer validators',  desc:'Ask colleagues to confirm your project experience. Each validation adds 300 pts and credibility.',          cta:'Learn more' },
            { n:'05', title:'Climb the leaderboard',   desc:'Your Stack Points determine your global, country, and city rank — Explorer through Principal Architect.',   cta:'View rankings' },
          ].map(s => (
            <div key={s.n} style={{ background:'#fff', border:'2px solid var(--color-primary-25)', borderRadius:16, padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.1rem', transition:'border-color 0.15s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--color-accent-105)'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--color-primary-25)'; e.currentTarget.style.transform='none'; }}>
              <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--color-primary-5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--color-primary-100)', fontSize:'1.15rem' }}>{s.n}</div>
              <h3 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'var(--color-secondary-100)', lineHeight:1.3 }}>{s.title}</h3>
              <p style={{ margin:0, fontSize:'0.95rem', color:'var(--color-charcoal)', lineHeight:1.55, fontStyle:'italic', flex:1 }}>{s.desc}</p>
              <button onClick={() => onNavigate('how-it-works')} style={{ alignSelf:'flex-start', background:'transparent', color:'var(--color-primary-100)', border:'1.5px solid var(--color-primary-100)', padding:'0.45rem 1.1rem', borderRadius:999, fontSize:'0.85rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--color-primary-100)'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--color-primary-100)'; }}>
                {s.cta}
              </button>
            </div>
          ))}
        </div>
        <style>{`
          @media(max-width: 1199px){ .five-steps-grid { grid-template-columns: repeat(3, 1fr) !important; } }
          @media(max-width: 800px){ .five-steps-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media(max-width: 500px){ .five-steps-grid { grid-template-columns: 1fr !important; } }
        `}</style>
        </div>
      </section>

      {/* ─── SCORING SYSTEM ──────────────────────────────────────────────── */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro
          id="scoring-system"
          eyebrow="Scoring system"
          heading="No black boxes. Every point explained."
          intro="Your StackRank Score is calculated transparently. Here is exactly how it works."
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'2rem' }} className="scoring-twho-grid">
          {/* LEFT — Why → formula → example */}
          <div>
            <p style={{ fontSize:'1.05rem', lineHeight:1.65, color:'var(--color-charcoal)', marginTop:0, marginBottom:'1.5rem' }}>
              <strong style={{ color:'var(--color-secondary-100)' }}>Why we show the formula.</strong> Most ranking systems are black boxes. We believe the best professionals deserve to know exactly what they're judged on — and exactly what to invest in next to grow their rank. Every signal is verifiable. Nothing is estimated.
            </p>

            <pre style={{ background:'var(--color-secondary-100)', color:'#fff', padding:'1.5rem 1.75rem', borderRadius:4, fontSize:'0.95rem', lineHeight:1.7, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', overflow:'auto', margin:'0 0 1.5rem' }}>
{`StackRank Score =
  (Certifications × level_weight)
+ (Verified Projects × scale_weight)
+ (Community Actions × trust_weight)
+ (Prestige Bonuses × 1.0)
─────────────────────────────────
= Your Global Stack Rank`}
            </pre>

            <pre style={{ background:'var(--color-secondary-100)', color:'#fff', padding:'1.5rem 1.75rem', borderRadius:4, fontSize:'0.95rem', lineHeight:1.7, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', overflow:'auto', margin:0 }}>
{`# Example profile score
  3 × Associate certs        =  4,500
  1 × Expert cert            =  3,000
  2 × Enterprise projects    =  4,000
  MVP bonus                  =  1,500
  3 × peer referrals         =  1,500
  validations given          =    900
─────────────────────────────────
= 15,400 Stack Points → Principal Architect`}
            </pre>
          </div>

          {/* RIGHT — Reference table */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ background:'var(--color-primary-5)', padding:'1rem 1.5rem', borderBottom:'1px solid var(--color-primary-25)', fontSize:'0.78rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)' }}>
              Points reference table
            </div>
            <div>
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
                <div key={name} style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:'1rem', alignItems:'center', padding:'0.85rem 1.5rem', borderBottom: i < arr.length - 1 ? '1px solid var(--color-pale-charcoal)' : 'none', background: i % 2 === 1 ? 'var(--color-primary-5)' : 'transparent' }}>
                  <span style={{ fontSize:'0.95rem', color:'var(--color-secondary-100)', fontWeight:500 }}>{name}</span>
                  <span style={{ fontSize:'0.78rem', color:'var(--color-primary-100)', background:'#fff', border:'1px solid var(--color-primary-25)', padding:'0.3rem 0.7rem', borderRadius:999, fontWeight:600, fontFamily:'ui-monospace, monospace', whiteSpace:'nowrap' }}>{weight}</span>
                  <span style={{ fontWeight:700, color:'var(--color-accent-110)', minWidth:'5rem', textAlign:'right', fontSize:'0.95rem' }}>{pts}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'var(--color-primary-5)', borderTop:'1px solid var(--color-primary-25)', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)', fontWeight:600 }}>All points verified — zero self-reported</span>
              <span style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--color-accent-110)' }}>Transparent</span>
            </div>
          </div>
        </div>
        <style>{`@media(min-width: 1024px){ .scoring-twho-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; } }`}</style>
        </div>
      </section>

      {/* ─── NAVY CTA STRIP (founding member) + demo cards ──────────────── */}
      <section style={{ position:'relative', padding:'4rem 0', color:'#fff', background:'var(--color-secondary-100)', overflow:'hidden' }}>
        <svg aria-hidden="true" width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.18, color:'var(--color-bg-pattern-dark-theme)', pointerEvents:'none' }}>
          <pattern id="cta-hex-2" patternUnits="userSpaceOnUse" width="60" height="52" x="0" y="0">
            <use xlinkHref="#divider-pattern" width="60" height="52"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#cta-hex-2)"/>
        </svg>
        <div className="u-content-width" style={{ position:'relative' }}>
          <div style={{ maxWidth:760, margin:'0 auto', textAlign:'center' }}>
            <h2 style={{ color:'#fff', marginBottom:'1rem' }}>Become a founding member</h2>
            <div style={{ fontSize:'1.0625rem', lineHeight:1.65, color:'rgba(255,255,255,0.92)', marginBottom:'1.75rem' }}>
              Join the early-access waitlist now and receive +500 bonus Stack Points, a founding-member badge, and priority placement when profile creation opens.
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }); }}
              style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.85rem 1.5rem', background:'#fff', color:'var(--color-secondary-100)', borderRadius:4, fontWeight:600, textDecoration:'none' }}>
              Join the waitlist
              <svg width="18" height="16" aria-hidden="true"><use xlinkHref="#arrow"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ─── LIVE RANKINGS PREVIEW ───────────────────────────────────────── */}
      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
        <ComponentIntro
          id="live-rankings"
          eyebrow="Live rankings"
          heading="Your rank is waiting. Where will you place?"
          intro="The leaderboard updates as professionals verify skills and validate projects. This is what you're joining."
        />
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.5rem' }} className="rankings-twho-grid">
          {/* Power Platform UK panel */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ background:'var(--color-primary-5)', padding:'0.85rem 1.4rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--color-primary-25)' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:700, fontSize:'1.05rem', color:'var(--color-secondary-100)' }}>
                <img src="/icons/microsoft/power-platform.svg" alt="" width="22" height="22" style={{ display:'block' }} />
                Power Platform
              </span>
              <span style={{ fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-charcoal)' }}>United Kingdom</span>
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
                <div key={row.name} style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.85rem 1.4rem', borderBottom:'1px solid var(--color-pale-charcoal)' }}>
                  <span style={{ width:'2rem', textAlign:'center', fontSize:'1.1rem', color:'var(--color-charcoal)' }}>{i < 3 ? medals[i] : i + 1}</span>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--color-secondary-100)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem' }}>{row.initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'1rem', color:'var(--color-secondary-100)' }}>{row.name}</div>
                    <div style={{ display:'flex', gap:'0.35rem', marginTop:'0.25rem', flexWrap:'wrap' }}>
                      {row.tags.map(t => <span key={t} style={{ fontSize:'0.8rem', padding:'0.2rem 0.55rem', borderRadius:3, background:'var(--color-primary-5)', color:'var(--color-primary-100)' }}>{t}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--color-primary-100)' }}>{row.pts.toLocaleString()}</div>
                    <div style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-charcoal)' }}>Stack pts</div>
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
              <span style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontWeight:700, fontSize:'1.05rem', color:'var(--color-secondary-100)' }}>
                <img src="/icons/microsoft/copilot-studio.svg" alt="" width="22" height="22" style={{ display:'block' }} />
                Copilot Studio
              </span>
              <span style={{ fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-charcoal)' }}>Global · Emerging</span>
            </div>
            {SAMPLE_USERS.filter(u => u.specialization === 'Copilot Studio').slice(0, 4).map((u, i) => {
              const medals = ['🥇','🥈','🥉'];
              return (
                <div key={u.id} onClick={() => onNavigate('profile', { userData:u })}
                  style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.85rem 1.4rem', borderBottom:'1px solid var(--color-pale-charcoal)', cursor:'pointer' }}>
                  <span style={{ width:'2rem', textAlign:'center', fontSize:'1.1rem', color:'var(--color-charcoal)' }}>{i < 3 ? medals[i] : i + 1}</span>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'var(--color-accent-110)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem' }}>{avatarInitials(u.name)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'1rem', color:'var(--color-secondary-100)' }}>{displayName(u.name)}</div>
                    <div style={{ display:'flex', gap:'0.35rem', marginTop:'0.25rem', flexWrap:'wrap' }}>
                      {(u.certifications || []).slice(0, 2).map(c => <span key={c.code} style={{ fontSize:'0.8rem', padding:'0.2rem 0.55rem', borderRadius:3, background:'var(--color-primary-5)', color:'var(--color-primary-100)' }}>{c.code}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--color-primary-100)' }}>{u.score.toLocaleString()}</div>
                    <div style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--color-charcoal)' }}>Stack pts</div>
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
        </div>
      </section>

      {/* ─── FINAL WAITLIST ──────────────────────────────────────────────── */}
      <section style={{ background:'var(--color-secondary-100)', padding:'4rem 0' }}>
        <div className="u-content-width">
        <div className="final-waitlist-grid" style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'2.5rem', alignItems:'center', background:'var(--color-bg-pattern-light-theme)', border:'1px solid var(--color-primary-25)', borderRadius:6, padding:'1.75rem 2.5rem' }}>
          <div>
            <h2 style={{ marginTop:0, marginBottom:'0.75rem' }}>Claim your rank before everyone else does</h2>
            <p style={{ fontSize:'1.0625rem', color:'var(--color-charcoal)', lineHeight:1.55, margin:0 }}>
              StackRank365 is in early access. Founding members earn <strong style={{ color:'var(--color-accent-110)' }}>+500 bonus Stack Points</strong> — enough to enter the leaderboard the moment we launch. The earlier you join, the higher your starting position.
            </p>
          </div>
          <div>
            <WaitlistForm variant="footer" />
          </div>
        </div>
        <style>{`@media(max-width: 900px){ .final-waitlist-grid { grid-template-columns: 1fr !important; padding: 1.75rem !important; } }`}</style>
        </div>
      </section>

      {/* ─── DATA &amp; STATISTICS ────────────────────────────────────────── */}
      <section style={{ background:'#fff', padding:'4rem 0 5rem' }}>
        <div className="u-content-width">
        <ComponentIntro id="data-and-statistics" eyebrow="By the numbers" heading="Data and statistics" intro="StackRank365 by the numbers." />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'2rem' }}>
          {[
            ['35+',  'Microsoft cert types tracked'],
            ['6',    'specialization tracks'],
            ['+500', 'bonus points for founding members'],
            ['Free', 'forever for individuals'],
          ].map(([val, label]) => (
            <div key={label} style={{ background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:4, padding:'1.5rem', alignSelf:'start' }}>
              <h3 style={{ margin:'0 0 0.75rem', fontSize:'2.5rem', lineHeight:1, fontWeight:700, color:'var(--color-secondary-100)' }}>{val}</h3>
              <p style={{ margin:0, fontSize:'1rem', lineHeight:1.5, color:'var(--color-charcoal)' }}>{label}</p>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
