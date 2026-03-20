import { useState } from "react";

function StackRankBadgeSVG({ name, rank, tier, score, specialization }) {
  const tierColors = { Explorer: "#6b7280", Practitioner: "#2563eb", Specialist: "#7c3aed", Principal: "#d97706", Architect: "#dc2626" };
  const color = tierColors[tier] || "#2563eb";
  const shortName = (name || "").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  return (
    <svg width="320" height="120" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "12px", display: "block" }}>
      <rect width="320" height="120" rx="12" fill="#1e3a5f"/>
      <rect x="0" y="0" width="6" height="120" rx="3" fill={color}/>
      {/* Avatar circle */}
      <circle cx="52" cy="60" r="28" fill={color} opacity="0.2"/>
      <circle cx="52" cy="60" r="22" fill={color}/>
      <text x="52" y="65" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="sans-serif">{shortName}</text>
      {/* Name + tier */}
      <text x="92" y="42" fill="#fff" fontSize="15" fontWeight="700" fontFamily="sans-serif">{(name || "").slice(0,22)}</text>
      <rect x="92" y="50" width={tier ? tier.length * 8 + 16 : 80} height="18" rx="9" fill={color} opacity="0.3"/>
      <text x="100" y="63" fill={color} fontSize="11" fontWeight="600" fontFamily="sans-serif">{tier}</text>
      {/* Specialization */}
      <text x="92" y="82" fill="#93c5fd" fontSize="11" fontFamily="sans-serif">{(specialization || "Microsoft Professional").slice(0,30)}</text>
      {/* Score + rank */}
      <text x="92" y="100" fill="#64748b" fontSize="10" fontFamily="sans-serif">Score {score?.toLocaleString() || "—"}  ·  Rank #{rank || "—"}</text>
      {/* StackRank365 branding */}
      <text x="298" y="112" textAnchor="end" fill="#334155" fontSize="9" fontFamily="sans-serif">StackRank365</text>
    </svg>
  );
}

export default function StackRankBadge({ user }) {
  const [copied, setCopied] = useState(false);
  const profileUrl = `https://www.stackrank365.com/profile/${user?.id || ""}`;
  const linkedinText = `I'm ranked on StackRank365 — the verified ranking platform for Microsoft professionals. Check my profile: ${profileUrl}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodeURIComponent(linkedinText)}`;
    window.open(url, "_blank", "width=600,height=500");
  };

  const copyLinkedInText = async () => {
    await navigator.clipboard.writeText(linkedinText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "#fff", border: "0.5px solid #d3d1c7", borderRadius: "12px", padding: "1.25rem" }}>
      <p style={{ fontWeight: 600, fontSize: "14px", margin: "0 0 1rem", color: "#1a1a18" }}>Your StackRank Badge</p>

      {/* Badge preview */}
      <div style={{ marginBottom: "1rem", borderRadius: "12px", overflow: "hidden" }}>
        <StackRankBadgeSVG
          name={user?.name}
          rank={user?.rank}
          tier={user?.tier}
          score={user?.score}
          specialization={user?.specialization}
        />
      </div>

      {/* Share options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button onClick={shareLinkedIn} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", background: "#0077b5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          <span style={{ fontWeight: 700 }}>in</span> Share on LinkedIn
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={copyLink} style={{ flex: 1, padding: "8px 12px", background: "transparent", border: "0.5px solid #d3d1c7", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "#1a1a18" }}>
            {copied ? "✓ Copied!" : "Copy profile link"}
          </button>
          <button onClick={copyLinkedInText} style={{ flex: 1, padding: "8px 12px", background: "transparent", border: "0.5px solid #d3d1c7", borderRadius: "8px", fontSize: "12px", cursor: "pointer", color: "#1a1a18" }}>
            Copy LinkedIn post
          </button>
        </div>
      </div>

      <p style={{ fontSize: "11px", color: "#b4b2a9", margin: "0.75rem 0 0", textAlign: "center" }}>
        Tip: paste your profile link in the Featured section of your LinkedIn profile
      </p>
    </div>
  );
}