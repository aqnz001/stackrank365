import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_CONFIG = {
  verified:   { label: "Verified",      icon: "✓", bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
  pending:    { label: "Verifying…",    icon: "⏳", bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
  unverified: { label: "Self-reported", icon: "○", bg: "#F1EFE8", text: "#5F5E5A", border: "#B4B2A9" },
  failed:     { label: "Not verified",  icon: "✕", bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
};

const SCORE_WEIGHT = {
  verified: "100%", pending: "50%", unverified: "25%", failed: "0%",
};

export function VerifiedBadge({ status, size = "md", showLabel = true, className = "" }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.unverified;
  const padding = size === "sm" ? "1px 6px" : size === "lg" ? "4px 10px" : "2px 8px";
  const fontSize = size === "sm" ? "10px" : size === "lg" ? "13px" : "11px";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex", alignItems: "center", gap: "4px",
        padding, fontSize, fontWeight: 500, borderRadius: "20px",
        border: `1px solid ${config.border}`,
        background: config.bg, color: config.text,
        whiteSpace: "nowrap", userSelect: "none",
      }}
    >
      <span style={{ lineHeight: 1 }}>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function CertCard({ cert, isOwner = false }) {
  const [status, setStatus] = useState(cert.verification_status ?? "unverified");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setStatus("pending");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-cert", {
        body: { cert_id: cert.id, profile_id: cert.profile_id, ms_cert_id: cert.ms_cert_id },
      });
      if (fnError) throw fnError;
      setStatus(data.status);
    } catch (err) {
      setError("Verification failed — please try again.");
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#fff", border: "0.5px solid #d3d1c7",
      borderRadius: "12px", padding: "1rem 1.25rem",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div>
          <p style={{ fontWeight: 500, fontSize: "14px", margin: 0 }}>{cert.name}</p>
          <p style={{ fontSize: "12px", color: "#73726c", margin: "2px 0 0" }}>
            Issued {new Date(cert.issued_date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
          </p>
        </div>
        <VerifiedBadge status={status} />
      </div>

      {isOwner && (status === "unverified" || status === "failed") && (
        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            alignSelf: "flex-start", fontSize: "12px", padding: "4px 12px",
            borderRadius: "20px", border: "0.5px solid #c8c7c0",
            background: "transparent", color: "#185FA5",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Verifying…" : "Verify with Microsoft"}
        </button>
      )}

      {error && <p style={{ fontSize: "12px", color: "#A32D2D", margin: 0 }}>{error}</p>}

      <div style={{
        display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#73726c",
        borderTop: "0.5px solid #f1efeb", paddingTop: "8px", marginTop: "4px",
      }}>
        <span>Score weight:</span>
        <span style={{
          fontWeight: 500,
          color: status === "verified" ? "#3B6D11" : status === "pending" ? "#854F0B" : "#5F5E5A",
        }}>
          {SCORE_WEIGHT[status] ?? "25%"}
        </span>
        <span style={{ color: "#b4b2a9" }}>
          {status === "verified" ? "— full points" : "— verify to boost your score"}
        </span>
      </div>
    </div>
  );
}
