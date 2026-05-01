import { useState } from 'react';
import { SAMPLE_USERS } from '../data/data';

const SB_URL   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

/* ─── Site alert banner (TWHO yellow strip) ──────────────────────────────── */
function SiteAlert({ onDismiss }) {
  return (
    <div style={{ background: '#fef4d3', borderBottom: '1px solid #f0d77c', padding: '1rem 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: '#13284b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>!</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem', color: '#13284b' }}>Beta release</h2>
          <p style={{ fontSize: '0.95rem', margin: 0, color: '#4a4a4a', lineHeight: 1.55 }}>
            StackRank365 is in early beta. We're collecting feedback from founding members.{' '}
            <a href="?page=survey" style={{ color: '#00558c', textDecoration: 'underline', fontWeight: 600 }}>Share your feedback</a>.
          </p>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss" style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#13284b', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

/* ─── Waitlist form (kept from prior version) ────────────────────────────── */
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
        headers: {
          apikey: ANON_KEY, Authorization: 'Bearer ' + ANON_KEY,
          'Content-Type': 'application/json', Prefer: 'return=minimal',
        },
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
      <div style={{ padding: '1rem 1.25rem', background: '#e8f5e9', border: '1px solid #66bb6a', borderRadius: 4, color: '#1b5e20', fontSize: '0.95rem' }}>
        ✓ You're on the list. We'll be in touch at <strong>{email}</strong>.
      </div>
    );
  }

  return (
    <form onSubmit={handle} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: 460 }}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ flex: '1 1 220px', minWidth: 0, padding: '0.85rem 1rem', fontSize: '1rem', border: '2px solid #d6d6d3', borderRadius: 4, fontFamily: 'inherit', color: '#1a1a1a', background: '#fff' }}
      />
      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Joining…' : 'Join waitlist'}
      </button>
      {error && <div style={{ width: '100%', fontSize: '0.85rem', color: '#b3261e', marginTop: '0.25rem' }}>{error}</div>}
    </form>
  );
}

/* ─── Tile (TWHO "tile" component — used in topic grids) ─────────────────── */
function Tile({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: '#fff', border: '1px solid #d6d6d3', borderRadius: 4,
        padding: '1.75rem', minHeight: 200, cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#13284b'; e.currentTarget.style.boxShadow = '0 0 0 1px #13284b'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#d6d6d3'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#13284b', margin: '0 0 0.75rem' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: '#4a4a4a', lineHeight: 1.55, margin: 0 }}>{description}</p>
      </div>
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00558c', fontWeight: 600, fontSize: '0.95rem' }}>
        Read more
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path d="M13 1L19 7M19 7L13 13M19 7H1" stroke="#00558c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </button>
  );
}

/* ─── Section intro — h2 + optional intro paragraph ──────────────────────── */
function SectionIntro({ id, heading, intro }) {
  return (
    <div style={{ marginBottom: '2rem', maxWidth: 760 }} id={id}>
      <h2 style={{ fontSize: '2rem', margin: '0 0 0.75rem', color: '#13284b' }}>{heading}</h2>
      {intro && <p style={{ fontSize: '1.05rem', color: '#4a4a4a', lineHeight: 1.65, margin: 0 }}>{intro}</p>}
    </div>
  );
}

/* ─── Full-width CTA block (TWHO navy strip with description + link) ─────── */
function CTABlock({ title, description, ctaLabel, onClick }) {
  return (
    <section style={{ background: '#13284b', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 760 }}>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem', color: '#fff' }}>{title}</h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, marginBottom: '2rem' }}>{description}</p>
          <button
            onClick={onClick}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              background: '#fff', color: '#13284b', border: 'none',
              padding: '1rem 1.75rem', borderRadius: 4, fontFamily: 'inherit',
              fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f3'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            {ctaLabel}
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <path d="M13 1L19 7M19 7L13 13M19 7H1" stroke="#13284b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* decorative pattern strip on right side */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 280, background: 'linear-gradient(135deg, transparent 50%, rgba(48,161,172,0.15) 50%, rgba(48,161,172,0.15) 60%, transparent 60%, transparent 70%, rgba(48,161,172,0.1) 70%)', pointerEvents: 'none' }} />
    </section>
  );
}

export default function Landing({ onNavigate }) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const top5 = [...SAMPLE_USERS].slice(0, 5).sort((a, b) => b.score - a.score);

  return (
    <div style={{ background: '#fff' }}>

      {/* ─── Site alert banner ───────────────────────────────────────────── */}
      {!alertDismissed && <SiteAlert onDismiss={() => setAlertDismissed(true)} />}

      {/* ─── HERO (image+text grid, mimics hero-home) ────────────────────── */}
      <section style={{ background: '#13284b', padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
        {/* corner pattern */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 480, height: '100%', opacity: 0.12, background: 'repeating-linear-gradient(45deg, transparent, transparent 18px, #30a1ac 18px, #30a1ac 19px), repeating-linear-gradient(-45deg, transparent, transparent 18px, #30a1ac 18px, #30a1ac 19px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid-twho">
            {/* Left: text */}
            <div>
              <h1 style={{ fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
                <span style={{ display: 'block', fontSize: '0.55em', fontWeight: 600, color: '#30a1ac', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>Whakatōpū Mātauranga</span>
                The trust layer for Microsoft careers
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, margin: '1.5rem 0 2rem', maxWidth: 540 }}>
                StackRank365 is the verified talent ranking community for Microsoft Dynamics 365, Power Platform, Copilot Studio, and Azure OpenAI professionals.
              </p>
              <WaitlistForm />
              <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                Free to join · +500 founding bonus points · No credit card required
              </p>
            </div>

            {/* Right: leaderboard preview as the "image" */}
            <div className="hero-right-twho" style={{ background: '#fff', borderRadius: 4, padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#00558c' }}>Live leaderboard</div>
                <div style={{ fontSize: '0.78rem', color: '#6c6c6c' }}>Top 5 globally</div>
              </div>
              <div>
                {top5.map((u, i) => (
                  <div key={u.id}
                    onClick={() => onNavigate('profile', { userData: u })}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid #d6d6d3' : 'none', cursor: 'pointer' }}
                  >
                    <span style={{ width: 24, fontSize: '0.85rem', fontWeight: 700, color: '#13284b' }}>{i + 1}</span>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#13284b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                      {(u.name || '?')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6c6c6c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.headline}</div>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#00558c' }}>{u.score.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('leaderboard')}
                style={{ marginTop: '1.25rem', width: '100%', padding: '0.85rem', background: '#fff', color: '#00558c', border: '2px solid #00558c', borderRadius: 4, fontFamily: 'inherit', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#00558c'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#00558c'; }}
              >
                View full leaderboard →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Top topics ──────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '5rem 0' }}>
        <div className="container">
          <SectionIntro
            id="top-topics"
            heading="Top topics"
            intro="Everything you need to start building a verified, ranked Microsoft career profile."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Tile
              title="How it works"
              description="A points-based scoring system that rewards verified certifications, peer validations, and applied project work."
              onClick={() => onNavigate('how-it-works')}
            />
            <Tile
              title="Scoring system"
              description="Transparent breakdown of how StackRank scores are calculated — certs, validations, projects, and tier multipliers."
              onClick={() => onNavigate('scoring')}
            />
            <Tile
              title="Leaderboard"
              description="See who's ranked where, globally and by region, across all six Microsoft specializations."
              onClick={() => onNavigate('leaderboard')}
            />
          </div>
        </div>
      </section>

      {/* ─── Full-width CTA block (TWHO navy strip) ──────────────────────── */}
      <CTABlock
        title="Become a founding member"
        description="Join the early access waitlist and receive +500 bonus points, a founding-member badge, and priority access when we open up profile creation."
        ctaLabel="Join the waitlist"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* ─── We care about Microsoft professionals ───────────────────────── */}
      <section style={{ background: '#f5f5f3', padding: '5rem 0' }}>
        <div className="container">
          <SectionIntro
            id="we-care"
            heading="We care about Microsoft professionals"
            intro="We're here to help D365, Power Platform, Copilot Studio, and Azure professionals get the recognition they deserve for the work they do."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <Tile
              title="Verified certifications"
              description="Auto-verify your Microsoft Learn certifications. No screenshots, no badges to upload — just your live, current credentials."
              onClick={() => onNavigate('how-it-works')}
            />
            <Tile
              title="Peer validation"
              description="Validate the projects of people you've worked with — and have your own work validated by the people who know it best."
              onClick={() => onNavigate('how-it-works')}
            />
            <Tile
              title="Recruiter visibility"
              description="Pro members get an Open to Work badge and priority placement when verified recruiters search the platform."
              onClick={() => onNavigate('pricing')}
            />
          </div>
        </div>
      </section>

      {/* ─── Data and statistics ─────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '5rem 0' }}>
        <div className="container">
          <SectionIntro
            id="data-and-statistics"
            heading="Data and statistics"
            intro="StackRank365 by the numbers."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              ['35+',     'Microsoft cert types tracked'],
              ['6',       'specialization tracks'],
              ['+500',    'bonus points for founding members'],
              ['Free',    'forever for individuals'],
            ].map(([val, label]) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #d6d6d3', borderRadius: 4, padding: '2rem 1.75rem' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#13284b', lineHeight: 1, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: '0.95rem', color: '#4a4a4a' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive — single column under 768px */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid-twho { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
        }
      `}</style>
    </div>
  );
}
