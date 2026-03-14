import { RANK_TIERS, CERTIFICATIONS, POINT_VALUES } from '../data/data';

export function HowItWorks({ onNavigate }) {
  const steps = [
    { n: '01', icon: '👤', title: 'Create Your Verified Profile', desc: 'Sign up and claim your unique public URL. Your profile is your professional identity in the Microsoft ecosystem.' },
    { n: '02', icon: '🎓', title: 'Add Your Certifications', desc: 'Each certification is weighted by tier. An Expert cert earns 3,000 points vs 500 for Fundamentals. No gaming the system.' },
    { n: '03', icon: '🏗️', title: 'Log Real-World Projects', desc: 'Add project implementations with privacy controls. Enterprise clients can be kept confidential while still earning points.' },
    { n: '04', icon: '✅', title: 'Get Peer Validated', desc: 'Invite colleagues to confirm your project work. Each validation adds 300 points and strengthens your credibility score.' },
    { n: '05', icon: '📊', title: 'Climb the Leaderboard', desc: 'Your Stack Points determine your global, country, and city rank. Explorer → Practitioner → Specialist → Architect → Principal Architect.' },
    { n: '06', icon: '💼', title: 'Get Discovered', desc: 'Recruiters and hiring managers can filter by verified rank, specialism, and location — finding genuinely qualified candidates.' },
  ];

  return (
    <div style={{ padding: '3rem 0' }}>
      {/* Hero */}
      <div className="hero-bg" style={{ padding: '4rem 0', marginBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="orb" style={{ width: 350, height: 350, background: 'rgba(0,194,255,0.07)', top: -80, right: -80 }} />
        <div className="container-sm" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1.25rem' }}>🏆</div>
          <h1 style={{ marginBottom: '1rem' }}>How StackRank365 Works</h1>
          <p style={{ color: 'var(--muted2)', fontSize: '1.1rem', maxWidth: 580, margin: '0 auto' }}>
            A transparent, merit-based reputation system for Microsoft ecosystem professionals
          </p>
        </div>
      </div>

      <div className="container-sm">
        {/* What is it */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.6rem' }}>What is StackRank365?</h2>
          <p style={{ color: 'var(--muted2)', lineHeight: 1.8, marginBottom: '1rem' }}>
            StackRank365 is a professional reputation platform designed for specialists working in the Microsoft ecosystem — Dynamics 365, Power Platform, Copilot Studio, Azure OpenAI, Dataverse, and Power Apps.
          </p>
          <p style={{ color: 'var(--muted2)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Your <strong style={{ color: '#fff' }}>Stack Points</strong> are calculated from verified certifications (weighted by tier level), peer-validated project experience, and community contributions.
          </p>
          <p style={{ color: 'var(--muted2)', lineHeight: 1.8 }}>
            This score determines your ranking on global, country, and city leaderboards — giving recruiters and hiring managers a trustworthy signal of genuine expertise.
          </p>
        </div>

        {/* 6 steps */}
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Six Steps to Your Rank</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {steps.map((s, i) => (
            <div key={s.n} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', borderLeft: `3px solid var(--blue)`, borderRadius: '0 16px 16px 0' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blue)' }}>{s.n}</div>
              <div>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{s.icon} {s.title}</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rank tiers */}
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Rank Tiers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '3rem' }}>
          {RANK_TIERS.map((tier, i) => (
            <div key={tier.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderLeft: `3px solid ${tier.color}` }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{tier.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: tier.color, fontSize: '1.1rem' }}>{tier.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>{tier.description}</div>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}>
                {tier.minScore.toLocaleString()}{tier.maxScore === Infinity ? '+' : `–${tier.maxScore.toLocaleString()}`} pts
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('landing')}>Start Building Your Rank →</button>
        </div>
      </div>
    </div>
  );
}

export function Scoring({ onNavigate }) {
  const groups = CERTIFICATIONS.reduce((acc, cert) => {
    if (!acc[cert.specialism]) acc[cert.specialism] = [];
    acc[cert.specialism].push(cert);
    return acc;
  }, {});

  const tierStyle = { Fundamentals: 'badge-muted', Associate: 'badge-blue', Expert: 'badge-gold', 'Applied Skills': 'badge-green' };

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="hero-bg" style={{ padding: '4rem 0', marginBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Scoring & <span className="gradient-text-gold">Points</span></h1>
          <p style={{ color: 'var(--muted2)', fontSize: '1.1rem' }}>How Stack Points are calculated across certifications, projects, and community</p>
        </div>
      </div>

      <div className="container-sm">
        {/* Quick reference */}
        <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🎓 Certification Points</h3>
            {[['Fundamentals', 500, 'badge-muted'], ['Associate', 1500, 'badge-blue'], ['Expert', 3000, 'badge-gold'], ['Applied Skills', 400, 'badge-green']].map(([tier, pts, cls]) => (
              <div key={tier} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span className={`badge ${cls}`} style={{ fontSize: '0.72rem' }}>{tier}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700 }}>+{pts.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🏗️ Project Points</h3>
            {[['Enterprise Project', 2000, 'badge-gold'], ['Standard Project', 800, 'badge-blue'], ['Peer Validation', 300, 'badge-green'], ['Community / Referral', 500, 'badge-purple']].map(([label, pts, cls]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>{label}</span>
                <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700 }}>+{pts.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copilot scarcity note */}
        <div className="card" style={{ background: 'var(--purple-dim)', border: '1px solid rgba(167,139,250,0.2)', marginBottom: '2.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--purple)', marginBottom: '0.3rem' }}>Copilot Studio Scarcity Multiplier</div>
              <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', margin: 0 }}>
                Copilot Studio certifications carry a <strong style={{ color: '#fff' }}>1.25× multiplier</strong> applied to leaderboard rank calculation. Early adopters earn a meaningful and lasting advantage as Copilot Studio specialists remain rare in the market.
              </p>
            </div>
          </div>
        </div>

        {/* Full cert catalog by specialism */}
        {Object.entries(groups).map(([specialism, certs]) => (
          <div key={specialism} style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {specialism}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {certs.map(cert => (
                <div key={cert.code} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: 'var(--muted)', width: 70, flexShrink: 0 }}>{cert.code}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text)' }}>{cert.name}</span>
                  {cert.status === 'upcoming' && <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>Coming Soon</span>}
                  {cert.scarcityMultiplier && <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>1.25×</span>}
                  <span className={`badge ${tierStyle[cert.tier]}`} style={{ fontSize: '0.62rem' }}>{cert.tier}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>+{cert.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('landing')}>Start Earning Points →</button>
        </div>
      </div>
    </div>
  );
}

export function ForRecruiters({ onNavigate }) {
  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="hero-bg" style={{ padding: '5rem 0', marginBottom: '3rem', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div className="orb" style={{ width: 350, height: 350, background: 'rgba(255,200,60,0.06)', top: -80, right: -80 }} />
        <div className="container-sm" style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-gold" style={{ marginBottom: '1rem' }}>For Hiring Teams</div>
          <h1 style={{ marginBottom: '1rem' }}>Find Verified Microsoft Talent</h1>
          <p style={{ color: 'var(--muted2)', fontSize: '1.1rem', maxWidth: 580, margin: '0 auto 2rem' }}>
            Stop sifting through self-declared LinkedIn skills. StackRank365 gives you pre-ranked, certification-verified professionals in the Microsoft ecosystem.
          </p>
          <button className="btn btn-gold btn-lg" onClick={() => onNavigate('leaderboard')}>Browse the Leaderboard →</button>
        </div>
      </div>

      <div className="container-sm">
        <div className="grid-2" style={{ marginBottom: '3rem' }}>
          {[
            { icon: '✅', title: 'Verified, not self-declared', desc: 'Every certification is backed by a Microsoft credential ID. Points are weighted by tier so an Expert badge means something.' },
            { icon: '🏗️', title: 'Real project evidence', desc: 'Professionals log actual implementations. Peer validation adds a second layer of confirmation from colleagues who worked alongside them.' },
            { icon: '📊', title: 'Ranked, not just listed', desc: 'Every candidate has a global rank, country rank, and city rank. Filter by specialism to find the right specialist instantly.' },
            { icon: '🔒', title: 'Enterprise confidentiality', desc: 'Professionals at enterprise consultancies can list confidential projects. You still see the volume and scale of work without NDA issues.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ borderTop: `3px solid var(--blue)` }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--muted2)', fontSize: '0.88rem', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="card-glow" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Ready to Find Your Next Hire?</h2>
          <p style={{ color: 'var(--muted2)', marginBottom: '1.5rem' }}>The leaderboard is public. No account needed to browse.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('leaderboard')}>Browse Talent</button>
            <button className="btn btn-outline btn-lg" onClick={() => onNavigate('landing')}>Post a Role</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function About({ onNavigate }) {
  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="hero-bg" style={{ padding: '4rem 0', marginBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container-sm" style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>About StackRank365</h1>
          <p style={{ color: 'var(--muted2)', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto' }}>Built by Microsoft ecosystem professionals, for Microsoft ecosystem professionals.</p>
        </div>
      </div>
      <div className="container-sm">
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--muted2)', lineHeight: 1.8, marginBottom: '1rem' }}>
            The Microsoft ecosystem has a trust problem. Certifications alone don't prove consulting ability. LinkedIn endorsements are meaningless. Recruiters can't tell a genuine D365 architect from someone who passed a Fundamentals exam five years ago.
          </p>
          <p style={{ color: 'var(--muted2)', lineHeight: 1.8 }}>
            StackRank365 is building the trust layer that this community has always needed — a platform where expertise is demonstrated, verified, and ranked transparently.
          </p>
        </div>
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          {[
            { icon: '🔍', title: 'Transparency', desc: 'Scoring rules are public. Everyone knows exactly how points are calculated.' },
            { icon: '✅', title: 'Verification', desc: 'Credentials must be verifiable. Peer validation adds a human layer of trust.' },
            { icon: '⚖️', title: 'Fairness', desc: 'Points reward real expertise, not years of service or self-promotion.' },
          ].map(v => (
            <div key={v.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{v.icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{v.title}</h3>
              <p style={{ color: 'var(--muted2)', fontSize: '0.85rem', margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('landing')}>Join the Community</button>
        </div>
      </div>
    </div>
  );
}
