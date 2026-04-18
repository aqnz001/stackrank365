import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";

const STATUS_COLOR = {
  submitted:   { bg:"#dbeafe", fg:"#1e40af" },
  shortlisted: { bg:"#fef3c7", fg:"#92400e" },
  rejected:    { bg:"#fee2e2", fg:"#991b1b" },
  hired:       { bg:"#dcfce7", fg:"#166534" },
  withdrawn:   { bg:"#f3f4f6", fg:"#374151" },
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function MyApplications({ onNavigate }) {
  const { user } = useApp();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("applications")
        .select("id, status, created_at, cover_letter, salary_expectation, jobs ( id, title, company, location, remote_ok, specialization, status )")
        .eq("candidate_id", user.id)
        .order("created_at", { ascending:false });
      if (error) console.error(error);
      setApps(data || []);
      setLoading(false);
    })();
  }, [user]);

  const withdraw = async (appId) => {
    if (!confirm("Withdraw this application?")) return;
    await supabase.from("applications").update({ status:"withdrawn" }).eq("id", appId);
    setApps(apps.map(a => a.id === appId ? { ...a, status:"withdrawn" } : a));
  };

  if (!user) {
    return (
      <div style={{ maxWidth:"640px", margin:"4rem auto", padding:"2rem", textAlign:"center" }}>
        <h2>Sign in to view your applications</h2>
        <button onClick={() => onNavigate("signin")} style={primaryBtn}>Sign in</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb" }}>
      <div style={{ background:"#1e3a5f", padding:"2rem 1.5rem" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontSize:"24px", fontWeight:700, color:"#fff", margin:0 }}>My applications</h1>
            <p style={{ color:"#93c5fd", fontSize:"13px", margin:"4px 0 0" }}>Track the roles you&rsquo;ve applied for</p>
          </div>
          <button onClick={() => onNavigate("jobs")} style={ghostBtn}>Browse jobs</button>
        </div>
      </div>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"1.5rem" }}>
        {loading ? <p style={centerMuted}>Loading...</p>
          : apps.length === 0 ? (
            <div style={{ background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"3rem", textAlign:"center" }}>
              <p style={{ color:"#73726c", marginBottom:"1rem" }}>You haven&rsquo;t applied to any jobs yet.</p>
              <button onClick={() => onNavigate("jobs")} style={primaryBtn}>Browse open roles</button>
            </div>
          )
          : <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {apps.map(a => {
                const col = STATUS_COLOR[a.status] || STATUS_COLOR.submitted;
                const job = a.jobs || {};
                return (
                  <div key={a.id} style={{ background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"1.25rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" }}>
                      <div>
                        <h3 style={{ fontSize:"15px", fontWeight:700, color:"#1a1a18", margin:"0 0 4px" }}>{job.title || "Job removed"}</h3>
                        <p style={{ fontSize:"12px", color:"#73726c", margin:0 }}>{job.company || "—"} · {job.location || (job.remote_ok ? "Remote" : "—")}</p>
                        <p style={{ fontSize:"11px", color:"#9ca3af", margin:"4px 0 0" }}>Applied {timeAgo(a.created_at)}</p>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px" }}>
                        <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", background:col.bg, color:col.fg, textTransform:"capitalize" }}>{a.status}</span>
                        {a.status !== "withdrawn" && a.status !== "hired" && a.status !== "rejected" && (
                          <button onClick={() => withdraw(a.id)} style={{ fontSize:"11px", background:"none", border:"none", color:"#dc2626", cursor:"pointer", padding:0 }}>Withdraw</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>}
      </div>
    </div>
  );
}

const primaryBtn = { padding:"10px 24px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const ghostBtn   = { padding:"8px 16px", background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const centerMuted = { textAlign:"center", color:"#73726c", padding:"3rem" };
