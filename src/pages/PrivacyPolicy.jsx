// src/pages/PrivacyPolicy.jsx

const Section = ({ title, children }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#1a1a18", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>{title}</h2>
    <div style={{ fontSize: "15px", color: "#4b5563", lineHeight: 1.8 }}>{children}</div>
  </div>
);
const P = ({ children }) => <p style={{ marginBottom: "0.75rem" }}>{children}</p>;
const Ul = ({ items }) => (
  <ul style={{ paddingLeft: "1.5rem", marginBottom: "0.75rem" }}>
    {items.map((item, i) => <li key={i} style={{ marginBottom: "0.4rem" }}>{item}</li>)}
  </ul>
);

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ background: "#1e3a5f", padding: "3rem 1.5rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#ffffff", marginBottom: "0.5rem" }}>Privacy Policy</h1>
        <p style={{ color: "#93c5fd", fontSize: "14px" }}>Last updated: March 2026</p>
      </div>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "1.25rem 1.5rem", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "15px", color: "#1e3a5f", margin: 0, lineHeight: 1.7 }}>
            StackRank365 is an independent platform for Microsoft professionals. We take your privacy seriously.
            This policy explains exactly what data we collect, why, and how you can control it.
            We do not sell your data. We do not run ads targeting personal data. Ever.
          </p>
        </div>

        <Section title="1. Who we are">
          <P>StackRank365 is operated as an independent platform at <strong>www.stackrank365.com</strong>. For privacy enquiries contact <strong>privacy@stackrank365.com</strong>.</P>
          <P>We are not affiliated with, endorsed by, or connected to Microsoft Corporation.</P>
        </Section>

        <Section title="2. What data we collect">
          <P><strong>Data you provide directly:</strong></P>
          <Ul items={["Name and professional title","Email address (account access and notifications)","Work history, certifications, and project details on your profile","Peer validations you give or receive"]} />
          <P><strong>Data collected automatically:</strong></P>
          <Ul items={["Basic usage analytics via Vercel Analytics â no cookies, no fingerprinting","Authentication events (login, logout, password reset)","IP address retained up to 30 days for security purposes only"]} />
          <P><strong>Data from third parties:</strong></P>
          <Ul items={["Microsoft Learn API â used solely to verify certification claims. We store the result (verified/failed) and certification UID only.","Azure OAuth â if you sign in with Microsoft, we receive your name and email only. We never receive or store your Microsoft password."]} />
        </Section>

        <Section title="3. How we use your data">
          <Ul items={["To create and display your public professional profile and ranking","To verify certifications against Microsoft Learn records","To calculate your StackRank score","To send certification expiry reminders and platform notifications (opt out any time)","To detect and prevent fake or fraudulent profiles","To improve the platform using aggregate, anonymised usage patterns"]} />
          <P>We do not use your data for advertising, profiling for third parties, or automated decision-making with legal effects.</P>
        </Section>

        <Section title="4. Who can see your data">
          <P><strong>Public by default:</strong> Your name, professional title, rank, certifications (name and verification status), and specialization are visible to anyone.</P>
          <P><strong>Private by default:</strong> Your email address, confidential project details, peer validation notes, and login history are never shown publicly.</P>
          <P><strong>You are in control:</strong> Set your profile to private at any time from account settings. Private profiles are not indexed and not visible to non-logged-in users.</P>
        </Section>

        <Section title="5. Data retention">
          <Ul items={["Profile data retained while your account is active","Account deletion removes all personal data within 30 days","Certification verification logs retained 12 months then deleted","Email reminder logs retained 90 days","Anonymised aggregate data may be retained indefinitely"]} />
        </Section>

        <Section title="6. Your rights">
          <Ul items={["Access â request a copy of all data we hold about you","Correction â ask us to correct inaccurate data","Deletion â request full account and data deletion","Export â download your profile data as JSON from account settings","Opt out â unsubscribe from all non-essential emails at any time"]} />
          <P>Email <strong>privacy@stackrank365.com</strong>. We respond within 30 days.</P>
        </Section>

        <Section title="7. Security">
          <P>All data is stored on Supabase (PostgreSQL) in AWS ap-southeast-2 (Sydney), encrypted at rest and in transit, protected by row-level security policies. Passwords are never stored â authentication uses bcrypt hashing or Microsoft Azure OAuth.</P>
          <P>Report security vulnerabilities to <strong>security@stackrank365.com</strong> before public disclosure.</P>
        </Section>

        <Section title="8. Cookies">
          <P>StackRank365 uses no tracking cookies â only a single session cookie to keep you logged in. Vercel Analytics is cookie-free and does not track you across sites.</P>
        </Section>

        <Section title="9. Third-party services">
          <Ul items={["Supabase â database and authentication","Vercel â hosting and analytics","EmailJS â transactional emails","Microsoft Azure â OAuth login"]} />
          <P>We do not share your data with any other third parties.</P>
        </Section>

        <Section title="10. Changes to this policy">
          <P>Material changes will be notified by email and platform notice at least 14 days before taking effect. Continued use constitutes acceptance.</P>
        </Section>

        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", marginTop: "1rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <a href="/" style={{ fontSize: "14px", color: "#2563eb", textDecoration: "none" }}>← Back to home</a>
          <a href="mailto:privacy@stackrank365.com" style={{ fontSize: "14px", color: "#2563eb", textDecoration: "none" }}>Contact privacy team</a>
        </div>
      </div>
    </div>
  );
}