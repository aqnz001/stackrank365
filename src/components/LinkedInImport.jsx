import { useState } from "react";

// LinkedInImport — auto-fill profile from LinkedIn URL
// Note: LinkedIn blocks server-side scraping, so we use a manual fallback form

const SB_URL  = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

export default function LinkedInImport({ onImport }) {
  const [handle, setHandle] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | manual | done | error
  const [manualData, setManualData] = useState({ name: "", professional_title: "", location: "", headline: "" });
  const [message, setMessage] = useState("");

  // Normalise LinkedIn URL/handle to just the handle slug
  const normalise = (val) =>
    val.replace(/https?:\/\//, "").replace(/www\./, "").replace(/linkedin\.com\/in\//, "").replace(/\/$/, "").trim();

  const handleFetch = async () => {
    const clean = normalise(handle);
    if (!clean) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch(SB_URL + "/functions/v1/fetch-linkedin-profile", {
        method: "POST",
        headers: { apikey: ANON_KEY, Authorization: "Bearer " + ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ handle: clean }),
      });
      const json = await res.json();

      if (res.ok && json.data?.name) {
        // Auto-fill succeeded
        const d = json.data;
        onImport?.({ 
          name: d.name,
          professional_title: d.professional_title,
          location: d.location,
          linkedin_url: "https://linkedin.com/in/" + clean,
        });
        setStatus("done");
        setMessage("Profile imported! Your fields have been updated.");
      } else {
        // LinkedIn blocked scraping — show manual form pre-filled with handle
        setManualData({ name: "", professional_title: "", location: "", headline: "" });
        setStatus("manual");
        setMessage("");
      }
    } catch {
      setManualData({ name: "", professional_title: "", location: "", headline: "" });
      setStatus("manual");
    }
  };

  const handleManualApply = () => {
    onImport?.({
      name: manualData.name || undefined,
      professional_title: manualData.professional_title || undefined,
      location: manualData.location || undefined,
      linkedin_url: "https://linkedin.com/in/" + normalise(handle),
    });
    setStatus("done");
    setMessage("Profile updated with your LinkedIn details.");
  };

  const card = {
    background: "var(--surface2, #1c2539)",
    border: "1px solid var(--border, rgba(255,255,255,.07))",
    borderRadius: 10,
    padding: "1rem",
    marginBottom: "1rem",
  };

  const label = { fontSize: "0.72rem", color: "var(--muted, #64748b)", fontWeight: 600, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };
  const input = { width: "100%", padding: "8px 10px", fontSize: 13, background: "var(--bg, #0d1117)", border: "1px solid var(--border, rgba(255,255,255,.1))", borderRadius: 6, color: "var(--text, #e2e8f0)", outline: "none" };
  const btn = (variant) => ({
    padding: "8px 16px", fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: "none",
    background: variant === "primary" ? "var(--blue, #00c2ff)" : "var(--surface3, #1e2d40)",
    color: variant === "primary" ? "#000" : "var(--text, #e2e8f0)",
    opacity: 1,
  });

  return (
    <div style={card}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
        <div style={{ fontSize: 20 }}>&#128279;</div>
        <div>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text, #e2e8f0)", margin: 0 }}>Import from LinkedIn</p>
          <p style={{ fontSize: "0.72rem", color: "var(--muted, #64748b)", margin: 0 }}>
            {status === "manual" ? "LinkedIn blocked auto-import — fill in manually below" : "Auto-fill your profile from your LinkedIn URL"}
          </p>
        </div>
      </div>

      {/* URL input row */}
      {status !== "done" && (
        <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem" }}>
          <input
            style={{ ...input, flex: 1 }}
            placeholder="https://linkedin.com/in/your-name"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          />
          <button style={btn("primary")} onClick={handleFetch} disabled={status === "loading" || !handle.trim()}>
            {status === "loading" ? "..." : "Fetch"}
          </button>
        </div>
      )}

      {/* Manual fallback form */}
      {status === "manual" && (
        <div>
          <div style={{ background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.2)", borderRadius: 6, padding: "8px 12px", marginBottom: "0.75rem", fontSize: 12, color: "#fbbf24" }}>
            &#9888;&#65039; LinkedIn prevents automatic profile fetching. Enter your details below — your LinkedIn URL will still be saved.
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <span style={label}>Full Name</span>
              <input style={input} placeholder="Your full name" value={manualData.name} onChange={(e) => setManualData(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Professional Title</span>
              <input style={input} placeholder="e.g. Dynamics 365 Architect" value={manualData.professional_title} onChange={(e) => setManualData(d => ({ ...d, professional_title: e.target.value }))} />
            </div>
            <div>
              <span style={label}>Location</span>
              <input style={input} placeholder="e.g. London, UK" value={manualData.location} onChange={(e) => setManualData(d => ({ ...d, location: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: "0.75rem" }}>
            <button style={btn("primary")} onClick={handleManualApply}>Apply to Profile</button>
            <button style={btn("secondary")} onClick={() => { setStatus("idle"); setMessage(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Success state */}
      {status === "done" && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#22c55e" }}>&#10003; {message}</span>
          <button style={{ ...btn("secondary"), fontSize: 12, padding: "5px 10px" }} onClick={() => setStatus("idle")}>Import again</button>
        </div>
      )}

      {/* Error */}
      {message && status === "error" && (
        <p style={{ fontSize: 12, color: "#f87171", margin: "0.5rem 0 0" }}>{message}</p>
      )}
    </div>
  );
}
