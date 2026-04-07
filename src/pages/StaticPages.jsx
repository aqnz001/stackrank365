import { RANK_TIERS, CERTIFICATIONS, POINT_VALUES } from '../data/data';

export function HowItWorks({ onNavigate }) {
  const steps = [
    { n: '01', icon: '👤', title: 'Create Your Verified Profile', desc: 'Sign up and claim your unique public URL. Your profile is your professional identity in the Microsoft ecosystem.' },
    { n: '02', icon: '🎓', title: 'Add Your Certifications', desc: 'Each certification is weighted by tier. An Expert cert earns 3,000 points vs 500 for Fundamentals. No gaming the system.' },
    { n: '03', icon: '🏗️', title: 'Log Real-World Projects', desc: 'Add project implementations with privacy controls. Enterprise clients can be kept confidential while still earning points.' },
    { n: '04', icon: '✅', title: 'Get Peer Validated', desc: 'Invite colleagues to confirm your project work. Each validation adds 300 points and strengthens your credibility score.' },
    { n: '05', icon: '📊', title: 'Climb the Leaderboard', desc: 'Your Stack Points determine your global, country, and city rank. Explorer → Practitioner → Specialist → Architect → Principal Architect.' },
    { n: '06', icon: '💼', title: 'Get Discovered', desc: 'Recruiters and hiring managers can filter by verified rank, specialization, and location — finding genuinely qualified candidates.' },
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
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Open Sans', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blue)' }}>{s.n}</div>
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
              <div style={{ fontFamily: 'Open Sans', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right', flexShrink: 0 }}>
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
    if (!acc[cert.specialization]) acc[cert.specialization] = [];
    acc[cert.specialization].push(cert);
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
                <span style={{ fontFamily: 'Open Sans', color: 'var(--gold)', fontWeight: 700 }}>+{pts.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🏗️ Project Points</h3>
            {[['Enterprise Project', 2000, 'badge-gold'], ['Standard Project', 800, 'badge-blue'], ['Peer Validation', 300, 'badge-green'], ['Community / Referral', 500, 'badge-purple']].map(([label, pts, cls]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted2)' }}>{label}</span>
                <span style={{ fontFamily: 'Open Sans', color: 'var(--gold)', fontWeight: 700 }}>+{pts.toLocaleString()} pts</span>
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

        {/* Scoring distribution */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>How Your Score Is Built</h2>
          <p style={{ color: 'var(--muted2)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            Stack Points have two layers. Your <strong style={{ color: 'var(--text)' }}>Primary Score</strong> — certifications, projects, and profile completeness — is the foundation. Community contribution is an amplifier capped at <strong style={{ color: 'var(--text)' }}>15% of your primary score</strong>, so it can never replace verified expertise.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.75rem' }}>
            {[
              { label: 'Certifications',        pct: 55, color: 'var(--blue)',   desc: 'Core of your score. Fundamentals through Expert, weighted by tier and verification status.' },
              { label: 'Projects',              pct: 35, color: 'var(--green)',  desc: 'Real-world implementations. Enterprise and standard weighting with peer validation bonuses.' },
              { label: 'Profile and Referrals', pct: 5,  color: 'var(--purple)', desc: 'Profile completeness (+150 pts), founding member bonus, and peer referrals.' },
              { label: 'Community Bonus',       pct: 5,  color: 'var(--gold)',   desc: 'Capped at 15% of your primary score. MVP, MCT, speaking, writing, GitHub contributions.' },
            ].map(function(item) {
              return (
                <div key={item.label} className="card" style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'Open Sans', fontSize: '0.8rem', color: item.color, fontWeight: 700 }}>~{item.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden', marginBottom: '0.3rem' }}>
                    <div style={{ height: '100%', width: item.pct + '%', background: item.color, borderRadius: 99 }} />
                  </div>
                  <p style={{ fontSize: '0.77rem', color: 'var(--muted2)', margin: 0 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Community Contribution — What Counts</h3>
          <p style={{ color: 'var(--muted2)', fontSize: '0.85rem', marginBottom: '0.875rem' }}>
            If your certifications and projects give you 10,000 pts, your community bonus is capped at 1,500 — regardless of how many events you speak at or articles you write. The leaderboard stays anchored to verified expertise.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
            {[
              { label: 'Microsoft MVP',               pts: '+1,500 / yr', cap: '1 active at a time',  auto: true },
              { label: 'Microsoft Certified Trainer', pts: '+800 / yr',   cap: '1 per year',           auto: true },
              { label: 'Speaking — Microsoft event',  pts: '+500 each',   cap: '4 events / yr',        auto: false },
              { label: 'Speaking — Community event',  pts: '+300 each',   cap: '4 events / yr',        auto: false },
              { label: 'Published blog or article',   pts: '+200 each',   cap: '10 posts / yr',        auto: false },
              { label: 'GitHub contributions',        pts: '+200 / yr',   cap: '10 qualifying yrs',    auto: true },
              { label: 'Peer validation given',       pts: '+300 each',   cap: '2,000 pts lifetime',   auto: true },
              { label: 'Peer referral',               pts: '+500 each',   cap: '3,000 pts lifetime',   auto: true },
            ].map(function(row) {
              return (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.85rem', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, color: 'var(--text)', minWidth: 160 }}>{row.label}</span>
                  <span style={{ fontFamily: 'Open Sans', color: 'var(--green)', fontWeight: 700, flexShrink: 0, minWidth: 85, textAlign: 'right' }}>{row.pts}</span>
                  <span style={{ color: 'var(--muted2)', flexShrink: 0, minWidth: 120, fontSize: '0.77rem' }}>{row.cap}</span>
                  <span style={{ flexShrink: 0, fontSize: '0.77rem', fontWeight: 600, color: row.auto ? 'var(--green)' : 'var(--gold)' }}>{row.auto ? '✅ Auto-verified' : '📋 Reported'}</span>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', padding: '0.75rem 1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted2)', margin: 0 }}>
              <strong style={{ color: 'var(--green)' }}>✅ Auto-verified</strong> — confirmed via Microsoft or GitHub APIs automatically.
              {' '}<strong style={{ color: 'var(--gold)' }}>📋 Reported</strong> — self-declared with a supporting URL, visible on profile and flaggable by the community if inaccurate.
            </p>
          </div>
        </div>
        {/* Full cert catalog by specialization */}
        {Object.entries(groups).map(([specialization, certs]) => (
          <div key={specialization} style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              {specialization}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {certs.map(cert => (
                <div key={cert.code} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'Open Sans', fontSize: '0.75rem', color: 'var(--muted)', width: 70, flexShrink: 0 }}>{cert.code}</span>
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text)' }}>{cert.name}</span>
                  {cert.status === 'upcoming' && <span className="badge badge-orange" style={{ fontSize: '0.62rem' }}>Coming Soon</span>}
                  {cert.scarcityMultiplier && <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>1.25×</span>}
                  <span className={`badge ${tierStyle[cert.tier]}`} style={{ fontSize: '0.62rem' }}>{cert.tier}</span>
                  <span style={{ fontFamily: 'Open Sans', fontSize: '0.8rem', color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>+{cert.points.toLocaleString()}</span>
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
            { icon: '📊', title: 'Ranked, not just listed', desc: 'Every candidate has a global rank, country rank, and city rank. Filter by specialization to find the right specialist instantly.' },
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

export function PowerPlatformRanking({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero — keyword rich h1 */}
      <div className="page-hero" style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem' }}>
        <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Live Rankings</div>
        <h1 className="page-hero__title">
          Power Platform Architect Ranking
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--muted2)', maxWidth: 620, margin: '1rem auto 2rem', lineHeight: 1.65 }}>
          The verified ranking of Power Platform professionals worldwide. Scores calculated from Microsoft certifications, real project experience, and peer validation — not self-declarations.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('leaderboard')}>View live rankings →</button>
          <button className="btn btn-ghost"   onClick={() => onNavigate('signup')}>Get your score free</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 5rem' }}>

        {/* What is this */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>What is the Power Platform Ranking?</h2>
          <p style={{ color: 'var(--muted2)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
            StackRank365 scores every Power Platform professional based on verified certifications (PL-100 through PL-600), real-world project experience, peer validation from colleagues, and community contribution. The result is a transparent, auditable rank — not a follower count.
          </p>
        </div>

        {/* How scoring works for PP */}
        <h2 style={{ marginBottom: '1rem' }}>How Power Platform professionals are scored</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '🎓', title: 'Microsoft certifications',    desc: 'PL-900 Fundamentals (+500 pts), PL-200 Functional Consultant (+1,500 pts), PL-400 Developer (+1,500 pts), PL-600 Solution Architect (+3,000 pts). All verified against Microsoft Learn records.' },
            { icon: '🏗️', title: 'Project experience',         desc: 'Enterprise Power Platform implementations (+2,000 pts each) and standard deployments (+800 pts each). Peer-validated by colleagues who worked on the same engagement.' },
            { icon: '🤝', title: 'Peer validation',             desc: 'Colleagues confirm your involvement in projects. Each validated peer adds credibility to your score and cannot be self-reported.' },
            { icon: '🌟', title: 'Community contribution',      desc: 'Global Power Platform Bootcamp speaking, blog posts, GitHub contributions, and MVP/MCT status add a bonus capped at 15% of your primary score.' },
          ].map(item => (
            <div key={item.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{item.title}</div>
                <div style={{ color: 'var(--muted2)', fontSize: '0.88rem', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rank tiers */}
        <h2 style={{ marginBottom: '1rem' }}>Rank tiers for Power Platform professionals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {[
            { tier: 'Explorer',           pts: '0–999',      color: 'var(--muted2)', desc: 'Getting started' },
            { tier: 'Practitioner',       pts: '1,000–3,499',color: 'var(--blue)',   desc: '1–2 certifications' },
            { tier: 'Specialist',         pts: '3,500–7,999',color: 'var(--green)',  desc: 'Associate level' },
            { tier: 'Architect',          pts: '8,000–14,999',color:'var(--gold)',   desc: 'Expert certified' },
            { tier: 'Principal Architect',pts: '15,000+',    color: 'var(--purple)', desc: 'Top 1%' },
          ].map(t => (
            <div key={t.tier} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: t.color, marginBottom: '0.25rem', fontSize: '0.88rem' }}>{t.tier}</div>
              <div style={{ fontFamily: 'Open Sans', fontSize: '0.75rem', color: 'var(--muted2)' }}>{t.pts} pts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted2)', marginTop: '0.25rem' }}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Related specializations */}
        <h2 style={{ marginBottom: '1rem' }}>Related Microsoft professional rankings</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {['Dynamics 365','Azure','Microsoft 365','Copilot Studio','Power BI','Security'].map(spec => (
            <button key={spec} className="btn btn-ghost btn-sm" onClick={() => onNavigate('leaderboard')}>{spec} ranking →</button>
          ))}
        </div>

        {/* CTA */}
        <div className="card" style={{ textAlign: 'center', padding: '3rem', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Where do you rank among Power Platform professionals?</h2>
          <p style={{ color: 'var(--muted2)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Create a free profile in 2 minutes. Add your certifications and get your verified Stack Points score.</p>
          <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }} onClick={() => onNavigate('signup')}>
            Get my Power Platform ranking →
          </button>
        </div>

      </div>
    </div>
  );
}
