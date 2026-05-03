import { useApp } from "../context/AppContext";
import PageHero from '../components/PageHero';
import TWHOSprite from '../components/TWHOSprite';

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    description: "Build your verified professional identity.",
    features: [
      "Public profile + StackRank score",
      "Certification verification via Microsoft Learn",
      "Peer validation (give and receive)",
      "Global and regional leaderboard",
      "Project portfolio (up to 5 projects)",
      "Certification expiry reminders",
    ],
    cta: "Get started free",
    ctaAction: "signup",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    highlight: true,
    badge: "Most popular",
    description: "Stand out and showcase your verified rank.",
    features: [
      "Everything in Free",
      "Unlimited projects",
      "StackRank badge for LinkedIn + profile",
      "Profile analytics (views, ranking movement)",
      "Export profile as PDF",
      "Priority leaderboard placement",
      "Ad-free experience",
    ],
    cta: "Start Pro — 14 days free",
    ctaAction: "pro",
  },
];

function PricingCard({ tier, navigate }) {
  const isHi = tier.highlight;
  return (
    <div style={{
      background: isHi ? 'var(--color-secondary-100)' : '#fff',
      border: isHi ? '1px solid var(--color-accent-105)' : '1px solid var(--color-primary-25)',
      borderRadius: 12,
      padding: '2rem',
      position: 'relative',
      flex: 1,
      minWidth: 280,
      maxWidth: 380,
      color: isHi ? '#fff' : 'var(--color-secondary-100)',
      boxShadow: isHi ? '0 12px 32px rgba(19,41,75,0.18)' : 'none',
      transform: isHi ? 'translateY(-6px)' : 'none',
    }}>
      {tier.badge && (
        <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#ffc83c', color:'#13294b', fontSize:'0.72rem', fontWeight:700, padding:'0.25rem 0.85rem', borderRadius:999, letterSpacing:'0.06em', textTransform:'uppercase' }}>
          {tier.badge}
        </div>
      )}

      <div style={{ marginBottom:'1.5rem' }}>
        <p style={{ fontSize:'0.78rem', fontWeight:700, color: isHi ? 'var(--color-accent-100)' : 'var(--color-accent-110)', margin:'0 0 0.6rem', textTransform:'uppercase', letterSpacing:'0.12em' }}>
          {tier.name}
        </p>
        <div style={{ display:'flex', alignItems:'baseline', gap:'0.35rem', marginBottom:'0.5rem' }}>
          <span style={{ fontSize:'2.4rem', fontWeight:700 }}>{tier.price}</span>
          <span style={{ fontSize:'0.88rem', color: isHi ? 'rgba(255,255,255,0.7)' : 'var(--color-charcoal)' }}>{tier.period}</span>
        </div>
        <p style={{ fontSize:'0.95rem', color: isHi ? 'rgba(255,255,255,0.82)' : 'var(--color-charcoal)', margin:0, lineHeight:1.5 }}>{tier.description}</p>
      </div>

      <button
        onClick={() => {
          if (tier.ctaAction === 'signup') { navigate('signup'); return; }
          if (tier.ctaAction === 'pro') {
            window.open('https://buy.stripe.com/sr365-pro-placeholder', '_blank');
            return;
          }
          navigate(tier.ctaAction);
        }}
        style={{
          width:'100%', padding:'0.85rem',
          background: isHi ? '#fff' : 'transparent',
          color: isHi ? 'var(--color-secondary-100)' : 'var(--color-primary-100)',
          border: isHi ? 'none' : '1.5px solid var(--color-primary-100)',
          borderRadius: 4,
          fontSize:'0.95rem', fontWeight:700, cursor:'pointer',
          marginBottom:'1.5rem', fontFamily:'inherit', transition:'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        {tier.cta}
      </button>

      <ul style={{ listStyle:'none', padding:0, margin:0 }}>
        {tier.features.map((f, i) => (
          <li key={i} style={{ display:'flex', gap:'0.6rem', alignItems:'flex-start', marginBottom:'0.65rem', fontSize:'0.92rem', color: isHi ? 'rgba(255,255,255,0.88)' : 'var(--color-charcoal)', lineHeight:1.5 }}>
            <span style={{ color:'var(--color-accent-110)', fontWeight:700, flexShrink:0 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing({ onNavigate }) {
  const { navigate } = useApp();
  const nav = onNavigate || navigate;

  return (
    <div>
      <TWHOSprite />
      <PageHero
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        subtitle="Free to join and build your verified professional identity. Upgrade when you're ready to stand out."
      />

      <section style={{ background:'#fff', padding:'4rem 0' }}>
        <div className="u-content-width">
          <div style={{ textAlign:'center', fontSize:'0.85rem', color:'var(--color-charcoal)', marginBottom:'2.5rem' }}>
            🔒 Payments secured by <strong style={{ color:'var(--color-secondary-100)' }}>Stripe</strong> · Cancel anytime · No contracts
          </div>
          <div style={{ display:'flex', gap:'1.75rem', flexWrap:'wrap', justifyContent:'center', alignItems:'flex-start' }}>
            {TIERS.map(tier => <PricingCard key={tier.name} tier={tier} navigate={nav} />)}
          </div>
        </div>
      </section>

      <section style={{ background:'var(--color-primary-5)', padding:'4rem 0' }}>
        <div className="u-content-width">
          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <div style={{ display:'inline-block', color:'var(--color-accent-110)', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.75rem' }}>
              FAQ
            </div>
            <h2 style={{ marginTop:0 }}>Common questions</h2>
          </div>
          <div style={{ maxWidth:'42rem', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1rem' }}>
            {[
              ["Is my data ever sold?", "Never. StackRank365 products are ad-free and we do not share personal data with third parties for advertising purposes."],
              ["Can I cancel anytime?", "Yes — cancel with one click from your account settings. No lock-in, no cancellation fees."],
              ["What payment methods do you accept?", "All major credit and debit cards via Stripe. No PayPal at this time."],
              ["Is the Free tier really free forever?", "Yes. Your core profile, certifications, and leaderboard ranking are always free."],
            ].map(([q, a], i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:8, padding:'1.1rem 1.4rem' }}>
                <p style={{ fontWeight:700, fontSize:'1rem', color:'var(--color-secondary-100)', margin:'0 0 0.4rem' }}>{q}</p>
                <p style={{ fontSize:'0.95rem', color:'var(--color-charcoal)', margin:0, lineHeight:1.6 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
