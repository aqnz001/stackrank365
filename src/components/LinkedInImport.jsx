import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const FIELD_MAP = {
  headline: "professional_title",
  firstName: "first_name",
  lastName: "last_name",
  location: "region",
  summary: "bio",
};

function parseLinkedInUrl(url) {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? match[1] : null;
}

export default function LinkedInImport({ onImport }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | preview | success | error
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    const handle = parseLinkedInUrl(url.trim());
    if (!handle) { setError("Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname)"); return; }
    setStatus("loading"); setError(null);

    try {
      // Use Supabase edge function to fetch profile via LinkedIn scraping API
      const { data, error: fnError } = await (async () => {
        const _r = await fetch('https://shnuwkjkjthvaovoywju.supabase.co/functions/v1/fetch-linkedin-profile', {
          method: 'POST',
          headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4', Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4', 'Content-Type': 'application/json' },
          body: JSON.stringify({ handle }),
        });
        const _j = await _r.json();
        return _r.ok ? { data: _j.data || _j, error: null } : { data: null, error: { message: _j.error || 'Error ' + _r.status } };
      })();
      if (fnError || data?.error) throw new Error(fnError?.message ?? data?.error ?? "Could not fetch profile");
      setPreview(data);
      setStatus("preview");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setStatus("loading");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        professional_title: preview.headline ?? undefined,
        region: preview.location ?? undefined,
        bio: preview.summary ?? undefined,
        linkedin_url: url.trim(),
      };
      const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (updateError) throw updateError;
      setStatus("success");
      onImport?.(updates);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div style={{ background: "#fff", border: "0.5px solid #d3d1c7", borderRadius: "12px", padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
        <div style={{ width: "32px", height: "32px", background: "#0077b5", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>in</span>
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "14px", margin: 0 }}>Import from LinkedIn</p>
          <p style={{ fontSize: "12px", color: "#73726c", margin: 0 }}>Auto-fill your profile from your LinkedIn URL</p>
        </div>
      </div>

      {status !== "success" && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://linkedin.com/in/your-name"
            style={{ flex: 1, padding: "8px 12px", fontSize: "13px", border: "0.5px solid #d3d1c7", borderRadius: "8px", outline: "none" }}
          />
          <button
            onClick={handleFetch}
            disabled={status === "loading" || !url.trim()}
            style={{ padding: "8px 16px", fontSize: "13px", fontWeight: 500, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", opacity: status === "loading" ? 0.6 : 1 }}
          >
            {status === "loading" ? "Loading…" : "Fetch"}
          </button>
        </div>
      )}

      {error && <p style={{ fontSize: "12px", color: "#A32D2D", margin: "0 0 0.75rem" }}>{error}</p>}

      {status === "preview" && preview && (
        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 0.5rem", color: "#1a1a18" }}>Preview — confirm to import</p>
          {preview.headline && <p style={{ fontSize: "13px", margin: "0 0 0.25rem" }}><strong>Title:</strong> {preview.headline}</p>}
          {preview.location && <p style={{ fontSize: "13px", margin: "0 0 0.25rem" }}><strong>Location:</strong> {preview.location}</p>}
          {preview.summary && <p style={{ fontSize: "13px", margin: "0 0 0.25rem", color: "#4b5563" }}><strong>Bio:</strong> {preview.summary.slice(0, 120)}{preview.summary.length > 120 ? "…" : ""}</p>}
          <p style={{ fontSize: "11px", color: "#73726c", margin: "0.5rem 0 0" }}>Your certifications and projects are not affected. Only title, location, and bio will be updated.</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "0.75rem" }}>
            <button onClick={handleConfirm} style={{ padding: "6px 16px", fontSize: "13px", fontWeight: 500, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Confirm import
            </button>
            <button onClick={() => { setStatus("idle"); setPreview(null); }} style={{ padding: "6px 16px", fontSize: "13px", background: "transparent", border: "0.5px solid #d3d1c7", borderRadius: "8px", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === "success" && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "0.75rem 1rem" }}>
          <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>✓ Profile updated from LinkedIn. Your certifications and rank are unchanged.</p>
        </div>
      )}
    </div>
  );
}