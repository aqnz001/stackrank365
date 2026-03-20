import { useApp } from "../context/AppContext";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "#6b7280",
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
    color: "#2563eb",
    highlight: true,
    badge: "Most popular",
    description: "Stand out to recruiters and clients.",
    features: [
      "Everything in Free",
      "Unlimited projects",
      "Open to Work visibility badge on leaderboard",
      "StackRank badge for LinkedIn + profile",
      "Profile analytics (views, ranking movement)",
      "Export profile as PDF",
      "Priority in recruiter search results",
      "Ad-free experience",
    ],
    cta: "Start Pro — 14 days free",
    ctaAction: "pro",
  },
  {
    name: "Recruiter",
    price: "$49",
    period: "per month",
    color: "#7c3aed",
    highlight: false,
    description: "Find and contact verified Microsoft talent.",
    features: [
      "Full leaderboard access with filters",
      "Search by tier, specialization, region, availability",
      "View Open to Work candidates first",
      "Contact verified professionals directly",
      "Export candidate shortlists",
      "Team seats (up to 3 users)",
      "API access for ATS integration",
    ],
    cta: "Start Recruiter trial",
    ctaAction: "recruiter",
  },
];

function PricingCard({ tier, navigate }) {
  return (
    <div style={{
      background: "#fff",
      border: tier.highlight ? `2px solid ${tier.color}` : "0.5px solid #d3d1c7",
      borderRadius: "16px",
      padding: "2rem",
      position: "relative",
      flex: 1,
      minWidth: "260px",
      maxWidth: "340px",
    }}>
      {tier.badge && (
        <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: tier.color, color: "#fff", fontSize: "11px", fontWeight: 600, padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap" }}>
          {tier.badge}
        </div>
      )}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: tier.color, margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{tier.name}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "36px", fontWeight: 700, color: "#1a1a18" }}>{tier.price}</span>
          <span style={{ fontSize: "13px", color: "#73726c" }}>{tier.period}</span>
        </div>
        <p style={{ fontSize: "13px", color: "#73726c", margin: 0 }}>{tier.description}</p>
      </div>

      <button
        onClick={() => navigate(tier.ctaAction)}
        style={{ width: "100%", padding: "12px", background: tier.highlight ? tier.color : "transparent", color: tier.highlight ? "#fff" : tier.color, border: `1.5px solid ${tier.color}`, borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem" }}
      >
        {tier.cta}
      </button>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tier.features.map((f, i) => (
          <li key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "0.6rem", fontSize: "13px", color: "#4b5563" }}>
            <span style={{ color: tier.color, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
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
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#1e3a5f", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#fff", margin: "0 0 1rem" }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: "16px", color: "#93c5fd", maxWidth: "520px", margin: "0 auto" }}>
          Free to join and build your verified professional identity. Upgrade when you're ready to stand out.
        </p>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
          {TIERS.map(tier => <PricingCard key={tier.name} tier={tier} navigate={nav} />)}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: "4rem", maxWidth: "640px", margin: "4rem auto 0" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 600, color: "#1a1a18", marginBottom: "1.5rem", textAlign: "center" }}>Common questions</h2>
          {[
            ["Is my data ever sold?", "Never. StackRank365 products are ad-free and we do not share personal data with third parties for advertising purposes."],
            ["Can I cancel anytime?", "Yes — cancel with one click from your account settings. No lock-in, no cancellation fees."],
            ["What payment methods do you accept?", "All major credit and debit cards via Stripe. No PayPal at this time."],
            ["Is the Free tier really free forever?", "Yes. Your core profile, certifications, and leaderboard ranking are always free."],
            ["Do recruiters see my contact details?", "Only if you have Open to Work enabled and have chosen to share contact details in your profile settings."],
          ].map(([q, a], i) => (
            <div key={i} style={{ borderBottom: "0.5px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1rem" }}>
              <p style={{ fontWeight: 600, fontSize: "14px", color: "#1a1a18", margin: "0 0 0.4rem" }}>{q}</p>
              <p style={{ fontSize: "13px", color: "#4b5563", margin: 0, lineHeight: 1.6 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}