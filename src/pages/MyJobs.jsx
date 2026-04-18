import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const STATUS_COLOR = {
  submitted:   { bg:"#dbeafe", fg:"#1e40af" },
  shortlisted: { bg:"#fef3c7", fg:"#92400e" },
  rejected:    { bg:"#fee2e2", fg:"#991b1b" },
  hired:       { bg:"#dcfce7", fg:"#166534" },
  withdrawn:   { bg:"#f3f4f6", fg:"#374151" },
};

function ApplicantsDrawer({ job, onClose }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select("id, status, created_at, cover_letter, phone, salary_expectation, recruiter_notes, candidate_id, profiles:candidate_id ( id, name, username, headline, specialization, tier, region )")
      .eq("job_id", job.id)
      .order("created_at", { ascending:false });
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [job.id]);

  const updateStatus = async (id, status) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    setApps(apps.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", width:"min(640px, 100%)", height:"100%", overflowY:"auto", padding:"2rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
          <div>
            <h2 style={{ fontSize:"18px", fontWeight:700, margin:"0 0 4px" }}>{job.title}</h2>
            <p style={{ fontSize:"12px", color:"#73726c", margin:0 }}>{apps.length} applicant{apps.length === 1 ? "" : "s"}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px", cursor:"pointer", color:"#73726c" }}>×</button>
        </div>
        {loading ? <p style={{ color:"#73726c" }}>Loading...</p>
          : apps.length === 0 ? <p style={{ color:"#73726c" }}>No applications yet.</p>
          : <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {apps.map(a => {
                const col = STATUS_COLOR[a.status] || STATUS_COLOR.submitted;
                const p = a.profiles || {};
                return (
                  <div key={a.id} style={{ border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"1rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", marginBottom:"0.5rem" }}>
                      <div>
                        <h3 style={{ fontSize:"14px", fontWeight:700, margin:"0 0 2px" }}>{p.name || "—"}</h3>
                        <p style={{ fontSize:"12px", color:"#73726c", margin:0 }}>{p.headline || p.specialization || "—"}</p>
                        <p style={{ fontSize:"11px", color:"#9ca3af", margin:"4px 0 0" }}>Applied {timeAgo(a.created_at)}</p>
                      </div>
                      <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", background:col.bg, color:col.fg, textTransform:"capitalize" }}>{a.status}</span>
                    </div>
                    {a.cover_letter && <p style={{ fontSize:"13px", color:"#1a1a18", whiteSpace:"pre-wrap", margin:"0.5rem 0", lineHeight:1.5 }}>{a.cover_letter}</p>}
                    <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", fontSize:"11px", color:"#4b5563", marginBottom:"0.5rem" }}>
                      {a.phone && <span>📞 {a.phone}</span>}
                      {a.salary_expectation && <span>💰 Expects {a.salary_expectation.toLocaleString()}</span>}
                    </div>
                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                      {a.status !== "shortlisted" && <button onClick={() => updateStatus(a.id, "shortlisted")} style={actionBtn("#fef3c7","#92400e")}>Shortlist</button>}
                      {a.status !== "rejected"    && <button onClick={() => updateStatus(a.id, "rejected")}    style={actionBtn("#fee2e2","#991b1b")}>Reject</button>}
                      {a.status !== "hired"       && <button onClick={() => updateStatus(a.id, "hired")}       style={actionBtn("#dcfce7","#166534")}>Mark hired</button>}
                      {p.username && <button onClick={() => window.open(`/?page=profile&u=${p.username}`, "_blank")} style={actionBtn("#e0e7ff","#3730a3")}>View profile</button>}
                    </div>
                  </div>
                );
              })}
            </div>}
      </div>
    </div>
  );
}

const actionBtn = (bg, fg) => ({ fontSize:"11px", fontWeight:600, padding:"5px 10px", borderRadius:"6px", background:bg, color:fg, border:"none", cursor:"pointer" });

export default function MyJobs({ onNavigate }) {
  const { user } = useApp();
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data: myJobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("posted_by", user.id)
      .order("created_at", { ascending:false });
    setJobs(myJobs || []);
    // application counts per job
    if (myJobs?.length) {
      const { data: apps } = await supabase
        .from("applications")
        .select("job_id, status")
        .in("job_id", myJobs.map(j => j.id));
      const c = {};
      (apps || []).forEach(a => {
        if (!c[a.job_id]) c[a.job_id] = { total:0, shortlisted:0, new:0 };
        c[a.job_id].total++;
        if (a.status === "shortlisted") c[a.job_id].shortlisted++;
        if (a.status === "submitted")   c[a.job_id].new++;
      });
      setCounts(c);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (jobId, status) => {
    await supabase.from("jobs").update({ status }).eq("id", jobId);
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status } : j));
  };

  if (!user) {
    return (
      <div style={{ maxWidth:"640px", margin:"4rem auto", padding:"2rem", textAlign:"center" }}>
        <h2>Sign in to view your posted jobs</h2>
        <button onClick={() => onNavigate("signin")} style={primaryBtn}>Sign in</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb" }}>
      <div style={{ background:"#1e3a5f", padding:"2rem 1.5rem" }}>
        <div style={{ maxWidth:"1000px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontSize:"24px", fontWeight:700, color:"#fff", margin:0 }}>My job posts</h1>
            <p style={{ color:"#93c5fd", fontSize:"13px", margin:"4px 0 0" }}>Manage roles and review applicants</p>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={() => onNavigate("jobs")} style={ghostBtn}>Browse jobs</button>
            <button onClick={() => onNavigate("post-job")} style={primaryBtnInline}>Post a job</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"1.5rem" }}>
        {loading ? <p style={centerMuted}>Loading...</p>
          : jobs.length === 0 ? (
            <div style={{ background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"3rem", textAlign:"center" }}>
              <p style={{ color:"#73726c", marginBottom:"1rem" }}>You haven&rsquo;t posted any jobs yet.</p>
              <button onClick={() => onNavigate("post-job")} style={primaryBtn}>Post your first job</button>
            </div>
          )
          : <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {jobs.map(j => {
                const c = counts[j.id] || { total:0, shortlisted:0, new:0 };
                return (
                  <div key={j.id} style={{ background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"1.25rem" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", flexWrap:"wrap" }}>
                      <div>
                        <h3 style={{ fontSize:"15px", fontWeight:700, color:"#1a1a18", margin:"0 0 4px" }}>{j.title}</h3>
                        <p style={{ fontSize:"12px", color:"#73726c", margin:0 }}>{j.company || "—"} · {j.location || (j.remote_ok ? "Remote" : "—")}</p>
                        <p style={{ fontSize:"11px", color:"#9ca3af", margin:"4px 0 0" }}>Posted {timeAgo(j.created_at)}</p>
                      </div>
                      <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
                        <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", background: j.status === "open" ? "#dcfce7" : "#f3f4f6", color: j.status === "open" ? "#166534" : "#374151", textTransform:"capitalize" }}>{j.status}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"16px", marginTop:"0.75rem", flexWrap:"wrap", fontSize:"12px" }}>
                      <span><strong>{c.total}</strong> total applicants</span>
                      {c.new > 0 && <span style={{ color:"#1e40af" }}><strong>{c.new}</strong> new</span>}
                      {c.shortlisted > 0 && <span style={{ color:"#92400e" }}><strong>{c.shortlisted}</strong> shortlisted</span>}
                    </div>
                    <div style={{ display:"flex", gap:"8px", marginTop:"0.75rem", flexWrap:"wrap" }}>
                      <button onClick={() => setSelected(j)} style={actionBtn("#1e3a5f","#fff")}>View applicants</button>
                      {j.status === "open"    && <button onClick={() => updateStatus(j.id, "closed")} style={actionBtn("#f3f4f6","#374151")}>Close</button>}
                      {j.status === "closed"  && <button onClick={() => updateStatus(j.id, "open")}   style={actionBtn("#dcfce7","#166534")}>Reopen</button>}
                      {j.status !== "filled"  && <button onClick={() => updateStatus(j.id, "filled")} style={actionBtn("#e0e7ff","#3730a3")}>Mark filled</button>}
                    </div>
                  </div>
                );
              })}
            </div>}
      </div>
      {selected && <ApplicantsDrawer job={selected} onClose={() => { setSelected(null); load(); }}/>}
    </div>
  );
}

const primaryBtn       = { padding:"10px 24px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const primaryBtnInline = { padding:"8px 16px",  background:"#fbbf24", color:"#1a1a18", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const ghostBtn         = { padding:"8px 16px",  background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const centerMuted      = { textAlign:"center", color:"#73726c", padding:"3rem" };
