import { RANK_TIERS, CERTIFICATIONS } from '../data/data';
import PageHero from '../components/PageHero';
import TWHOSprite from '../components/TWHOSprite';

const card = {
  base:    { background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:12, padding:'1.5rem' },
  pillBtn: { background:'transparent', color:'var(--color-primary-100)', border:'1.5px solid var(--color-primary-100)', padding:'0.65rem 1.6rem', borderRadius:999, fontSize:'0.95rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'background 0.15s, color 0.15s' },
};

function PillBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={card.pillBtn}
      onMouseEnter={e => { e.currentTarget.style.background='var(--color-primary-100)'; e.currentTarget.style.color='#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--color-primary-100)'; }}>
      {children}
    </button>
  );
}

function Eyebrow({ children }) {
  return (
    <div style={{ display:'inline-block', color:'var(--color-accent-110)', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
      {children}
    </div>
  );
}

function SectionIntro({ eyebrow, title, intro }) {
  return (
    <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ marginTop:0, marginBottom:'0.5rem' }}>{title}</h2>
      {intro && <p style={{ color:'var(--color-charcoal)', fontSize:'1.0625rem', lineHeight:1.55, maxWidth:'42rem', margin:'0 auto' }}>{intro}</p>}
    </div>
  );
}

/* ─── HOW IT WORKS ────────────────────────────────────────────────────────── */
export function HowItWorks({ onNavigate }) {
  const steps = [
    { n:'01', icon:'👤',  title:'Create your profile',         desc:'Join and claim your public URL: stackrank365.com/profile/you. Your profile is your professional identity in the Microsoft ecosystem.' },
    { n:'02', icon:'🎓',  title:'Add your certifications',     desc:'Each cert is weighted by tier. Expert = 3,000 pts. Associate = 1,500. No tricks — every claim is verified against Microsoft Learn.' },
    { n:'03', icon:'🏗️',  title:'Log your projects',           desc:'Add real implementations with privacy controls. Confidential clients stay confidential while you still earn the points.' },
    { n:'04', icon:'✅',  title:'Invite peer validators',       desc:'Ask colleagues to confirm your project experience. Each validation adds 300 points and strengthens your credibility score.' },
    { n:'05', icon:'📊',  title:'Climb the leaderboard',       desc:'Your Stack Points determine your global, country, and city rank. Explorer → Practitioner → Specialist → Architect → Principal Architect.' },
  ];

  return (
    <div>
      <TWHOSprite />
      <PageHero
        eyebrow="How it works"
        title="A transparent, merit-based reputation system"
        subtitle="Built for Microsoft ecosystem professionals — Dynamics 365, Power Platform, Copilot Studio, Azure OpenAI, Dataverse, and Power Apps."
      />

      {/* What is StackRank365 */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="The platform" title="What is StackRank365?" />
          <div style={{ ...card.base, padding:'2rem 2.25rem', maxWidth:'52rem', margin:'0 auto' }}>
            <p style={{ color:'var(--color-charcoal)', lineHeight:1.7, marginTop:0, marginBottom:'1rem' }}>
              StackRank365 is a professional reputation platform designed for specialists working in the Microsoft ecosystem — Dynamics 365, Power Platform, Copilot Studio, Azure OpenAI, Dataverse, and Power Apps.
            </p>
            <p style={{ color:'var(--color-charcoal)', lineHeight:1.7, margin:'0 0 1rem' }}>
              Your <strong style={{ color:'var(--color-secondary-100)' }}>Stack Points</strong> are calculated from verified certifications (weighted by tier level), peer-validated project experience, and community contributions.
            </p>
            <p style={{ color:'var(--color-charcoal)', lineHeight:1.7, margin:0 }}>
              This score determines your ranking on global, country, and city leaderboards — a transparent, merit-based signal of genuine Microsoft expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Five steps */}
      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Simple by design" title="Five steps to your verified rank" intro="The whole process takes minutes." />
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', maxWidth:'52rem', margin:'0 auto' }}>
            {steps.map(s => (
              <div key={s.n} style={{ ...card.base, display:'flex', gap:'1.25rem', alignItems:'center', padding:'1.25rem 1.5rem' }}>
                <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--color-primary-5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'var(--color-primary-100)', fontSize:'1.05rem', flexShrink:0 }}>{s.n}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ margin:'0 0 0.3rem', fontSize:'1.15rem', color:'var(--color-secondary-100)' }}>
                    <span style={{ marginRight:'0.5rem' }}>{s.icon}</span>{s.title}
                  </h3>
                  <p style={{ margin:0, color:'var(--color-charcoal)', fontSize:'0.95rem', lineHeight:1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rank tiers */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Rank tiers" title="From Explorer to Principal Architect" intro="Five tiers. Transparent thresholds. No politics." />
          <ul style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'1rem', listStyle:'none', padding:0, margin:0 }} className="tiers-grid">
            {RANK_TIERS.map((tier, i) => {
              const styles = [
                { bg:'#fafafa',                       border:'1px solid var(--color-pale-charcoal)', nameColor:'var(--color-charcoal)',      pillBg:'#5A5A5A',                   pillColor:'#fff' },
                { bg:'var(--color-primary-5)',        border:'1px solid var(--color-primary-25)',     nameColor:'var(--color-primary-100)',   pillBg:'var(--color-primary-100)',  pillColor:'#fff' },
                { bg:'#e4eef5',                       border:'1px solid var(--color-primary-50)',     nameColor:'var(--color-primary-100)',   pillBg:'var(--color-secondary-100)',pillColor:'#fff' },
                { bg:'#dff1f2',                       border:'1px solid var(--color-accent-105)',     nameColor:'var(--color-accent-110)',    pillBg:'var(--color-accent-110)',   pillColor:'#fff' },
                { bg:'var(--color-secondary-100)',    border:'1px solid #ffc83c',                     nameColor:'#ffd56b',                    pillBg:'#ffc83c',                   pillColor:'#13294b' },
              ][i] || {};
              const isElite = i === 4;
              return (
                <li key={tier.name} style={{ background:styles.bg, border:styles.border, borderRadius:6, padding:'1.4rem 1rem', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'0.5rem', boxShadow: isElite ? '0 8px 24px rgba(19,41,75,0.18)' : 'none', transform: isElite ? 'translateY(-4px)' : 'none' }}>
                  <div style={{ fontSize:'2.1rem', lineHeight:1 }}>{tier.icon}</div>
                  <h3 style={{ margin:0, color:styles.nameColor, fontSize:'1.2rem', fontWeight:700, lineHeight:1.2 }}>{tier.name}</h3>
                  <p style={{ margin:0, fontSize:'1rem', color: isElite ? 'rgba(255,255,255,0.82)' : 'var(--color-charcoal)', lineHeight:1.4 }}>{tier.description}</p>
                  <span style={{ marginTop:'0.35rem', fontSize:'0.88rem', padding:'0.35rem 0.75rem', background:styles.pillBg, color:styles.pillColor, borderRadius:999, fontWeight:700, whiteSpace:'nowrap' }}>
                    {tier.minScore.toLocaleString()}{tier.maxScore === Infinity ? '+' : `–${tier.maxScore.toLocaleString()}`} pts
                  </span>
                </li>
              );
            })}
          </ul>
          <style>{`@media(max-width: 900px){ .tiers-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media(max-width: 480px){ .tiers-grid { grid-template-columns: 1fr !important; } }`}</style>
          <div style={{ textAlign:'center', marginTop:'2.5rem' }}>
            <PillBtn onClick={() => onNavigate('signup')}>Start building your rank →</PillBtn>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── SCORING ─────────────────────────────────────────────────────────────── */
export function Scoring({ onNavigate }) {
  const groups = CERTIFICATIONS.reduce((acc, cert) => {
    if (!acc[cert.specialization]) acc[cert.specialization] = [];
    acc[cert.specialization].push(cert);
    return acc;
  }, {});

  const tierBg = {
    Fundamentals:    { bg:'#f3f4f6', color:'var(--color-charcoal)' },
    Associate:       { bg:'var(--color-primary-5)', color:'var(--color-primary-100)' },
    Expert:          { bg:'#fff7d6', color:'#9b6800' },
    'Applied Skills':{ bg:'#dff1f2', color:'var(--color-accent-110)' },
  };

  return (
    <div>
      <TWHOSprite />
      <PageHero
        eyebrow="Scoring system"
        title="No black boxes. Every point explained."
        subtitle="Stack Points are calculated transparently from verified certifications, peer-validated projects, and community contributions."
      />

      {/* Quick reference */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Quick reference" title="What earns you points" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'1.5rem', maxWidth:'52rem', margin:'0 auto' }} className="scoring-quickref-grid">
            <div style={card.base}>
              <h3 style={{ marginTop:0, marginBottom:'1rem', fontSize:'1.1rem', color:'var(--color-secondary-100)' }}>🎓 Certifications</h3>
              {[['Fundamentals',500],['Associate',1500],['Expert',3000],['Applied Skills',400]].map(([tier, pts]) => (
                <div key={tier} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 0', borderBottom:'1px solid var(--color-pale-charcoal)' }}>
                  <span style={{ fontSize:'0.85rem', padding:'0.25rem 0.6rem', background:tierBg[tier].bg, color:tierBg[tier].color, borderRadius:999, fontWeight:600 }}>{tier}</span>
                  <span style={{ fontWeight:700, color:'var(--color-accent-110)' }}>+{pts.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
            <div style={card.base}>
              <h3 style={{ marginTop:0, marginBottom:'1rem', fontSize:'1.1rem', color:'var(--color-secondary-100)' }}>🏗️ Projects & community</h3>
              {[['Enterprise project',2000],['Standard project',800],['Peer validation',300],['Referral',500]].map(([label, pts]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 0', borderBottom:'1px solid var(--color-pale-charcoal)' }}>
                  <span style={{ fontSize:'0.95rem', color:'var(--color-secondary-100)' }}>{label}</span>
                  <span style={{ fontWeight:700, color:'var(--color-accent-110)' }}>+{pts.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media(max-width: 700px){ .scoring-quickref-grid { grid-template-columns: 1fr !important; } }`}</style>

          {/* Copilot multiplier highlight */}
          <div style={{ ...card.base, background:'#dff1f2', borderColor:'var(--color-accent-105)', maxWidth:'52rem', margin:'1.5rem auto 0', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
            <span style={{ fontSize:'1.6rem', flexShrink:0 }}>🤖</span>
            <div>
              <div style={{ fontWeight:700, color:'var(--color-accent-110)', marginBottom:'0.3rem' }}>Copilot Studio scarcity multiplier</div>
              <p style={{ color:'var(--color-charcoal)', fontSize:'0.95rem', margin:0, lineHeight:1.6 }}>
                Copilot Studio certifications carry a <strong style={{ color:'var(--color-secondary-100)' }}>1.25× multiplier</strong> applied to leaderboard rank calculation. Early adopters earn a meaningful and lasting advantage as Copilot Studio specialists remain rare in the market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How your score is built */}
      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Composition" title="How your score is built" intro="Stack Points have two layers. Your primary score (certifications, projects, profile) is the foundation. Community contribution is an amplifier capped at 15% of your primary score, so it can never replace verified expertise." />

          {(() => {
            const items = [
              { label:'Certifications',        pct:55, color:'#00558c', desc:'Core of your score. Fundamentals through Expert, weighted by tier and verification status.' },
              { label:'Projects',              pct:35, color:'#0c818f', desc:'Real-world implementations. Enterprise and standard weighting with peer validation bonuses.' },
              { label:'Profile and referrals', pct:5,  color:'#5A5A5A', desc:'Profile completeness (+150 pts), founding member bonus, and peer referrals.' },
              { label:'Community bonus',       pct:5,  color:'#9b6800', desc:'Capped at 15% of your primary score. MVP, MCT, speaking, writing, GitHub contributions.' },
            ];
            const size = 260, r = 110, cx = size/2, cy = size/2, C = 2 * Math.PI * r;
            let acc = 0;
            return (
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'3rem', alignItems:'center', maxWidth:'52rem', margin:'0 auto' }} className="composition-grid">
                <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:'rotate(-90deg)' }}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-pale-charcoal)" strokeWidth="42" />
                    {items.map(item => {
                      const dash = (item.pct / 100) * C;
                      const seg = <circle key={item.label} cx={cx} cy={cy} r={r} fill="none" stroke={item.color} strokeWidth="42" strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-acc} />;
                      acc += dash;
                      return seg;
                    })}
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--color-accent-110)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Stack Points</span>
                    <span style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--color-secondary-100)', marginTop:'0.25rem' }}>Composition</span>
                  </div>
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {items.map(item => (
                    <li key={item.label} style={{ display:'flex', gap:'0.85rem', alignItems:'flex-start' }}>
                      <span style={{ width:14, height:14, borderRadius:3, background:item.color, marginTop:'0.3rem', flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:'0.75rem', marginBottom:'0.2rem' }}>
                          <span style={{ fontWeight:700, fontSize:'0.98rem', color:'var(--color-secondary-100)' }}>{item.label}</span>
                          <span style={{ fontSize:'0.95rem', color:item.color, fontWeight:700 }}>~{item.pct}%</span>
                        </div>
                        <p style={{ fontSize:'0.88rem', color:'var(--color-charcoal)', margin:0, lineHeight:1.55 }}>{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
          <style>{`@media(max-width: 720px){ .composition-grid { grid-template-columns: 1fr !important; justify-items: center; } }`}</style>
        </div>
      </section>

      {/* Cert catalog */}
      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Catalog" title="Every tracked Microsoft certification" intro="35+ certifications across the entire Microsoft ecosystem, with point values and verification status." />
          <div style={{ display:'flex', flexDirection:'column', gap:'2rem', maxWidth:'56rem', margin:'0 auto' }}>
            {Object.entries(groups).map(([specialization, certs]) => (
              <div key={specialization}>
                <h3 style={{ marginBottom:'1rem', fontSize:'1.15rem', color:'var(--color-secondary-100)', borderBottom:'1px solid var(--color-pale-charcoal)', paddingBottom:'0.5rem' }}>
                  {specialization}
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                  {certs.map(cert => (
                    <div key={cert.code} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.7rem 1rem', background:'#fff', border:'1px solid var(--color-pale-charcoal)', borderRadius:6 }}>
                      <span style={{ fontFamily:'ui-monospace, monospace', fontSize:'0.92rem', color:'var(--color-primary-100)', width:74, flexShrink:0, fontWeight:600 }}>{cert.code}</span>
                      <span style={{ flex:1, fontSize:'0.92rem', color:'var(--color-secondary-100)' }}>{cert.name}</span>
                      {cert.status === 'upcoming' && <span style={{ fontSize:'0.7rem', padding:'0.18rem 0.55rem', background:'#fff7d6', color:'#9b6800', borderRadius:999, fontWeight:600 }}>Coming soon</span>}
                      {cert.scarcityMultiplier && <span style={{ fontSize:'0.7rem', padding:'0.18rem 0.55rem', background:'#dff1f2', color:'var(--color-accent-110)', borderRadius:999, fontWeight:600 }}>1.25×</span>}
                      <span style={{ fontSize:'0.7rem', padding:'0.18rem 0.55rem', background:tierBg[cert.tier]?.bg, color:tierBg[cert.tier]?.color, borderRadius:999, fontWeight:600 }}>{cert.tier}</span>
                      <span style={{ fontSize:'0.88rem', color:'var(--color-accent-110)', fontWeight:700, flexShrink:0 }}>+{cert.points.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'3rem' }}>
            <PillBtn onClick={() => onNavigate('signup')}>Start earning points →</PillBtn>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── ABOUT ───────────────────────────────────────────────────────────────── */
export function About({ onNavigate }) {
  return (
    <div>
      <TWHOSprite />
      <PageHero
        eyebrow="About"
        title="Built for Microsoft ecosystem professionals"
        subtitle="By professionals, for professionals. The trust layer this community has always needed."
      />

      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Our mission" title="Solve the Microsoft trust problem" />
          <div style={{ ...card.base, padding:'2rem 2.25rem', maxWidth:'52rem', margin:'0 auto' }}>
            <p style={{ color:'var(--color-charcoal)', lineHeight:1.7, marginTop:0, marginBottom:'1rem' }}>
              The Microsoft ecosystem has a trust problem. Certifications alone don't prove consulting ability. LinkedIn endorsements are meaningless. There's no transparent way to tell a genuine D365 architect from someone who passed a Fundamentals exam five years ago.
            </p>
            <p style={{ color:'var(--color-charcoal)', lineHeight:1.7, margin:0 }}>
              StackRank365 is building the trust layer that this community has always needed — a platform where expertise is demonstrated, verified, and ranked transparently.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Our values" title="Three principles, no exceptions" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1.5rem', maxWidth:'52rem', margin:'0 auto' }} className="values-grid">
            {[
              { icon:'🔍', title:'Transparency', desc:'Scoring rules are public. Everyone knows exactly how points are calculated.' },
              { icon:'✅', title:'Verification', desc:'Credentials must be verifiable. Peer validation adds a human layer of trust.' },
              { icon:'⚖️', title:'Fairness',     desc:'Points reward real expertise, not years of service or self-promotion.' },
            ].map(v => (
              <div key={v.title} style={{ ...card.base, textAlign:'center' }}>
                <div style={{ fontSize:'2.2rem', marginBottom:'0.75rem' }}>{v.icon}</div>
                <h3 style={{ fontSize:'1.15rem', marginTop:0, marginBottom:'0.5rem', color:'var(--color-secondary-100)' }}>{v.title}</h3>
                <p style={{ color:'var(--color-charcoal)', fontSize:'0.95rem', margin:0, lineHeight:1.55 }}>{v.desc}</p>
              </div>
            ))}
          </div>
          <style>{`@media(max-width: 700px){ .values-grid { grid-template-columns: 1fr !important; } }`}</style>
          <div style={{ textAlign:'center', marginTop:'3rem' }}>
            <PillBtn onClick={() => onNavigate('signup')}>Join the community →</PillBtn>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── POWER PLATFORM RANKING (SEO landing) ───────────────────────────────── */
export function PowerPlatformRanking({ onNavigate }) {
  return (
    <div>
      <TWHOSprite />
      <PageHero
        eyebrow="Live rankings"
        title="Power Platform Architect Ranking"
        subtitle="The verified ranking of Power Platform professionals worldwide. Scores calculated from Microsoft certifications, real project experience, and peer validation — not self-declarations."
      >
        <div style={{ display:'flex', gap:'0.85rem', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => onNavigate('leaderboard')}
            style={{ padding:'0.85rem 1.5rem', background:'#fff', color:'var(--color-secondary-100)', borderRadius:4, fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.95rem' }}>
            View live rankings →
          </button>
          <button onClick={() => onNavigate('signup')}
            style={{ padding:'0.85rem 1.5rem', background:'transparent', color:'#fff', border:'1.5px solid rgba(255,255,255,0.7)', borderRadius:4, fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:'0.95rem' }}>
            Get your score free
          </button>
        </div>
      </PageHero>

      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Overview" title="What is the Power Platform ranking?" />
          <div style={{ ...card.base, padding:'2rem', maxWidth:'48rem', margin:'0 auto', textAlign:'center' }}>
            <p style={{ color:'var(--color-charcoal)', lineHeight:1.7, margin:0 }}>
              StackRank365 scores every Power Platform professional based on verified certifications (PL-100 through PL-600), real-world project experience, peer validation from colleagues, and community contribution. The result is a transparent, auditable rank — not a follower count.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Scoring" title="How Power Platform professionals are scored" />
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem', maxWidth:'52rem', margin:'0 auto' }}>
            {[
              { icon:'🎓', title:'Microsoft certifications', desc:'PL-900 Fundamentals (+500 pts), PL-200 Functional Consultant (+1,500 pts), PL-400 Developer (+1,500 pts), PL-600 Solution Architect (+3,000 pts). All verified against Microsoft Learn records.' },
              { icon:'🏗️', title:'Project experience',      desc:'Enterprise Power Platform implementations (+2,000 pts each) and standard deployments (+800 pts each). Peer-validated by colleagues who worked on the same engagement.' },
              { icon:'🤝', title:'Peer validation',         desc:'Colleagues confirm your involvement in projects. Each validated peer adds credibility to your score and cannot be self-reported.' },
              { icon:'🌟', title:'Community contribution',  desc:'Global Power Platform Bootcamp speaking, blog posts, GitHub contributions, and MVP/MCT status add a bonus capped at 15% of your primary score.' },
            ].map(item => (
              <div key={item.title} style={{ ...card.base, display:'flex', gap:'1rem', alignItems:'flex-start', padding:'1.25rem 1.5rem' }}>
                <span style={{ fontSize:'1.6rem', flexShrink:0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight:700, marginBottom:'0.3rem', color:'var(--color-secondary-100)', fontSize:'1.05rem' }}>{item.title}</div>
                  <div style={{ color:'var(--color-charcoal)', fontSize:'0.95rem', lineHeight:1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <SectionIntro eyebrow="Tiers" title="Rank tiers for Power Platform professionals" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'1rem', maxWidth:'56rem', margin:'0 auto' }} className="pp-tiers-grid">
            {[
              { tier:'Explorer',           pts:'0–999',       desc:'Getting started' },
              { tier:'Practitioner',       pts:'1,000–3,499', desc:'1–2 certifications' },
              { tier:'Specialist',         pts:'3,500–7,999', desc:'Associate level' },
              { tier:'Architect',          pts:'8,000–14,999',desc:'Expert certified' },
              { tier:'Principal Architect',pts:'15,000+',     desc:'Top 1%' },
            ].map(t => (
              <div key={t.tier} style={{ ...card.base, padding:'1rem 0.85rem', textAlign:'center' }}>
                <div style={{ fontWeight:700, color:'var(--color-secondary-100)', marginBottom:'0.4rem', fontSize:'0.95rem' }}>{t.tier}</div>
                <div style={{ fontSize:'0.85rem', color:'var(--color-primary-100)', fontWeight:700 }}>{t.pts} pts</div>
                <div style={{ fontSize:'0.82rem', color:'var(--color-charcoal)', marginTop:'0.35rem' }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <style>{`@media(max-width: 900px){ .pp-tiers-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media(max-width: 480px){ .pp-tiers-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </section>

      <section style={{ background:'var(--color-secondary-100)', padding:'4rem 0', textAlign:'center', color:'#fff' }}>
        <div className="u-content-width">
          <h2 style={{ color:'#fff', marginTop:0, marginBottom:'0.75rem' }}>Where do you rank among Power Platform professionals?</h2>
          <p style={{ color:'rgba(255,255,255,0.86)', marginBottom:'1.75rem', fontSize:'1.05rem' }}>Create a free profile in 2 minutes. Add your certifications and get your verified Stack Points score.</p>
          <button onClick={() => onNavigate('signup')}
            style={{ padding:'0.85rem 1.75rem', background:'#fff', color:'var(--color-secondary-100)', borderRadius:4, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'1rem' }}>
            Get my Power Platform ranking →
          </button>
        </div>
      </section>
    </div>
  );
}
