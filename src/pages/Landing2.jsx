/*
 * Landing page rebuilt using TWHO's HTML scaffold (Option B).
 * Structure mirrors tewhatuora.govt.nz home page: site-alert →
 * hero-home (page-title bilingual + image) → tiles section
 * (Top topics / We care about) → cta block → component-intro.
 *
 * SR365 content (Microsoft careers, leaderboard, waitlist) is plugged
 * into TWHO's containers. Class names match TWHO's BEM, so all rules
 * in src/styles/twho.css apply automatically.
 */
import { useState } from 'react';
import { SAMPLE_USERS } from '../data/data';
import TWHOSprite from '../components/TWHOSprite';

const SB_URL   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

/* ─── site-alert (TWHO yellow banner pattern) ─────────────────────────────── */
function SiteAlert({ onDismiss }) {
  return (
    <aside className="site-alert">
      <div className="site-alert-grid">
        <div className="site-alert__decorator">
          <svg className="site-alert__decorator-icon" aria-hidden="true">
            <use xlinkHref="#alert"/>
          </svg>
        </div>
        <div className="site-alert__content">
          <h2 className="site-alert__heading">Beta release</h2>
          <div className="rich-text">
            StackRank365 is in early beta — we're collecting feedback from founding members.{' '}
            <a href="?page=survey">Share your feedback</a>.
          </div>
        </div>
        <button className="site-alert__dismiss" aria-label="Dismiss this alert" onClick={onDismiss}>
          <svg className="site-alert__dismiss-icon" aria-hidden="true">
            <use xlinkHref="#close"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

/* ─── waitlist (kept from prior version) ──────────────────────────────────── */
function WaitlistForm() {
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
        body: JSON.stringify({ email: email.toLowerCase().trim(), source: 'hero' }),
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

/* ─── tile component (TWHO .tile pattern exactly) ────────────────────────── */
function Tile({ heading, description, onClick }) {
  return (
    <li className="tile">
      <h3 className="tile__heading">{heading}</h3>
      <p className="tile__description">{description}</p>
      <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }} className="tile__link">
        <span className="sr-only">{heading}</span>
        <svg className="tile__icon tile__icon--go" width="18" height="16" aria-hidden="true">
          <use xlinkHref="#arrow"/>
        </svg>
      </a>
    </li>
  );
}

/* ─── full-width navy CTA (TWHO .cta + .cta__background-pattern pattern) ── */
function CTABlock({ title, description, ctaLabel, onClick }) {
  return (
    <section className="cta element" style={{ position:'relative', padding:'4rem 0', color:'var(--color-white)' }}>
      <div className="cta__background-pattern" style={{ position:'absolute', inset:0, background:'var(--color-secondary-100)', color:'var(--color-bg-pattern-dark-theme)', zIndex:-1 }}>
        {/* hexagon pattern overlay */}
        <svg width="100%" height="100%" style={{ opacity:0.4, color:'var(--color-bg-pattern-dark-theme)' }}>
          <pattern id="cta-hex" patternUnits="userSpaceOnUse" width="60" height="52" x="0" y="0">
            <use xlinkHref="#divider-pattern" width="60" height="52"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#cta-hex)" stroke="currentColor"/>
        </svg>
      </div>
      <div className="u-content-width">
        <div style={{ maxWidth:760 }}>
          <h2 style={{ color:'var(--color-white)', fontSize:'2rem', marginBottom:'1rem' }}>{title}</h2>
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

/* ─── component-intro (h2 + intro line) ──────────────────────────────────── */
function ComponentIntro({ id, heading, intro }) {
  return (
    <div className="component-intro" id={id} tabIndex={-1}>
      <h2 style={{ marginBottom:'0.5rem' }}>{heading}</h2>
      {intro && <div>{intro}</div>}
    </div>
  );
}

/* ─── HERO (mimics .hero-home with .page-title__text--bilingual) ──────────── */
function HeroHome({ onNavigate, top5 }) {
  return (
    <div className="hero-home" style={{ background:'var(--color-bg-pattern-light-theme)', paddingTop:'2rem', paddingBottom:'4rem', position:'relative' }}>
      <div className="hero-home__grid u-grid-standard u-content-width" style={{ position:'relative', zIndex:1 }}>
        <div className="hero-home__text-content" style={{ gridColumn:'1 / -1' }}>
          <h1 className="page-title page-title--bilingual">
            <span className="page-title__text page-title__text--primary" style={{ color:'var(--color-secondary-100)' }}>
              Microsoft Careers
            </span>
            <span className="sr-only">-</span>
            <span className="page-title__text page-title__text--secondary" style={{ color:'var(--color-secondary-100)' }}>
              The verified ranking community for Dynamics 365, Power Platform, Copilot Studio &amp; Azure OpenAI
            </span>
          </h1>
          <div className="page-title__intro-text" style={{ maxWidth:'52rem', color:'var(--color-charcoal)' }}>
            StackRank365 is the trust layer for Microsoft careers — verified certifications, peer validation, and a transparent score that proves applied expertise.
          </div>
          <WaitlistForm />
          <p style={{ marginTop:'0.85rem', fontSize:'0.95rem', color:'var(--color-charcoal)' }}>
            Free to join · +500 founding bonus · No credit card
          </p>
        </div>
      </div>

      {/* TWHO hero-home__image-wrapper — image at the bottom of the hero;
          we substitute SR365's leaderboard preview as the "image" */}
      <div className="hero-home__image-wrapper u-content-width" style={{ marginTop:'2.5rem', position:'relative' }}>
        <div style={{ background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:6, padding:'1.5rem', maxWidth:880, marginLeft:'auto', marginRight:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--color-primary-100)', fontWeight:700 }}>Live leaderboard — top 5 globally</div>
            <button onClick={() => onNavigate('leaderboard')} className="btn btn-ghost btn-sm" style={{ color:'var(--color-primary-100)' }}>View full leaderboard →</button>
          </div>
          {top5.map((u, i) => (
            <div key={u.id} onClick={() => onNavigate('profile', { userData:u })}
              style={{ display:'flex', alignItems:'center', gap:'0.85rem', padding:'0.65rem 0', borderTop: i ? '1px solid var(--color-pale-charcoal)' : 'none', cursor:'pointer' }}>
              <span style={{ width:24, fontWeight:700, color:'var(--color-secondary-100)' }}>{i+1}</span>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--color-secondary-100)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{(u.name||'?')[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</div>
                <div style={{ fontSize:'0.85rem', color:'var(--color-charcoal)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.headline}</div>
              </div>
              <span style={{ fontWeight:700, color:'var(--color-primary-100)' }}>{u.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onNavigate }) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const top5 = [...SAMPLE_USERS].slice(0, 5).sort((a, b) => b.score - a.score);

  return (
    <div style={{ background:'var(--color-white)' }}>
      <TWHOSprite />

      {!alertDismissed && <SiteAlert onDismiss={() => setAlertDismissed(true)} />}

      <HeroHome onNavigate={onNavigate} top5={top5} />

      {/* Top topics (TWHO .tiles pattern) */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro id="top-topics" heading="Top topics" intro="Everything you need to start building a verified Microsoft career profile." />
        <ul className="tiles">
          <Tile heading="How it works" description="A points-based scoring system that rewards verified Microsoft Learn certifications, peer validations, and applied project work." onClick={() => onNavigate('how-it-works')} />
          <Tile heading="Scoring" description="Transparent breakdown of how StackRank scores are calculated — certs, validations, projects, and tier multipliers." onClick={() => onNavigate('scoring')} />
          <Tile heading="Leaderboard" description="See the global and regional ranking across Dynamics 365, Power Platform, Copilot Studio, and Azure professionals." onClick={() => onNavigate('leaderboard')} />
        </ul>
      </section>

      {/* Navy CTA strip */}
      <CTABlock
        title="Become a founding member"
        description="Join the early-access waitlist now and receive +500 bonus points, a founding-member badge, and priority placement when profile creation opens."
        ctaLabel="Join the waitlist"
        onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
      />

      {/* We care about Microsoft professionals (TWHO repeat pattern) */}
      <section className="element u-content-width" style={{ paddingTop:'4rem' }}>
        <ComponentIntro id="we-care" heading="We care about Microsoft professionals" intro="We&rsquo;re here to help D365, Power Platform, Copilot Studio, and Azure professionals get the recognition they deserve for the work they do." />
        <ul className="tiles">
          <Tile heading="Verified certifications" description="Auto-verify your Microsoft Learn certifications — no screenshots, no manual badges. Just live, current credentials." onClick={() => onNavigate('how-it-works')} />
          <Tile heading="Peer validation" description="Validate the projects of people you&rsquo;ve worked with — and have your work validated by those who know it best." onClick={() => onNavigate('how-it-works')} />
          <Tile heading="Recruiter visibility" description="Pro members get an Open to Work badge and priority placement when verified recruiters search the platform." onClick={() => onNavigate('pricing')} />
        </ul>
      </section>

      {/* Data and statistics */}
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
