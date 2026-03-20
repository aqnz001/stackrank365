import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OpenToWorkToggle({ initialValue = false, onUpdate }) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const newValue = !enabled;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("profiles")
        .update({ open_to_work: newValue, open_to_work_updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
      setEnabled(newValue);
      onUpdate?.(newValue);
    } catch (err) {
      console.error("OpenToWork toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", background: enabled ? "#f0fdf4" : "#fff", border: `0.5px solid ${enabled ? "#bbf7d0" : "#d3d1c7"}`, borderRadius: "12px", transition: "all .2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: enabled ? "#16a34a" : "#d1d5db", boxShadow: enabled ? "0 0 0 3px #dcfce7" : "none", transition: "all .2s" }} />
        <div>
          <p style={{ fontWeight: 600, fontSize: "14px", color: enabled ? "#166534" : "#1a1a18", margin: 0 }}>
            {enabled ? "Open to Work" : "Not currently looking"}
          </p>
          <p style={{ fontSize: "12px", color: "#73726c", margin: "2px 0 0" }}>
            {enabled ? "Visible to recruiters on the leaderboard" : "Toggle on to signal availability to recruiters"}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        aria-label="Toggle open to work"
        style={{ position: "relative", width: "44px", height: "24px", borderRadius: "12px", border: "none", background: enabled ? "#16a34a" : "#d1d5db", cursor: loading ? "not-allowed" : "pointer", transition: "background .2s", opacity: loading ? 0.7 : 1, flexShrink: 0 }}
      >
        <span style={{ position: "absolute", top: "3px", left: enabled ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s" }} />
      </button>
    </div>
  );
}