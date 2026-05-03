import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";

const SPECIALIZATIONS = ["All","Dynamics 365","Power Platform","Azure","Microsoft 365","Copilot Studio","Power BI","Security"];
const EMPLOYMENT_TYPES = ["All","full-time","part-time","contract","temporary"];
const EXPERIENCE_LEVELS = ["All","entry","mid","senior","lead","principal"];

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return null;
  const c = job.salary_currency || "USD";
  if (job.salary_min && job.salary_max) return `${c} ${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`;
  return `${c} ${(job.salary_min || job.salary_max).toLocaleString()}+`;
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function JobCard({ job, onOpen }) {
  const salary = formatSalary(job);
  return (
    <button onClick={() => onOpen(job)} style={{ textAlign:"left", background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"1.25rem", cursor:"pointer", width:"100%", display:"block" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", marginBottom:"0.5rem" }}>
        <div>
          <h3 style={{ fontSize:"15px", fontWeight:700, color:"#1a1a18", margin:"0 0 2px" }}>{job.title}</h3>
          <p style={{ fontSize:"12px", color:"#73726c", margin:0 }}>{job.company || "—"} · {job.location || (job.remote_ok ? "Remote" : "—")}</p>
        </div>
        <span style={{ fontSize:"11px", color:"#73726c", whiteSpace:"nowrap" }}>{timeAgo(job.created_at)}</span>
      </div>
      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginTop:"0.5rem" }}>
        {job.specialization && <span style={tagStyle("#e0e7ff", "#3730a3")}>{job.specialization}</span>}
        {job.employment_type && <span style={tagStyle("#f3f4f6", "#374151")}>{job.employment_type}</span>}
        {job.experience_level && <span style={tagStyle("#fef3c7", "#92400e")}>{job.experience_level}</span>}
        {job.remote_ok && <span style={tagStyle("#dcfce7", "#166534")}>Remote OK</span>}
        {salary && <span style={tagStyle("#fce7f3", "#9f1239")}>{salary}</span>}
      </div>
    </button>
  );
}

const tagStyle = (bg, color) => ({ fontSize:"11px", fontWeight:600, padding:"3px 8px", borderRadius:"20px", background:bg, color });

function JobDetail({ job, onClose, user, onApplied }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [salary, setSalary] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [applied, setApplied] = useState(false);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("applications").select("id,status").eq("job_id", job.id).eq("candidate_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setExisting(data); });
  }, [job.id, user]);

  const apply = async () => {
    if (!user) return;
    setSubmitting(true); setErr("");
    const { error } = await supabase.from("applications").insert([{
      job_id: job.id,
      candidate_id: user.id,
      cover_letter: coverLetter || null,
      salary_expectation: salary ? parseInt(salary, 10) : null,
      phone: phone || null,
    }]);
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    setApplied(true);
    onApplied && onApplied();
  };

  const salaryStr = formatSalary(job);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:"1rem", overflowY:"auto" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"16px", padding:"2rem", maxWidth:"680px", width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.5rem" }}>
          <h2 style={{ fontSize:"20px", fontWeight:700, margin:0 }}>{job.title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:"22px", cursor:"pointer", color:"#73726c", lineHeight:1 }}>×</button>
        </div>
        <p style={{ fontSize:"13px", color:"#73726c", margin:"0 0 1rem" }}>{job.company || "—"} · {job.location || (job.remote_ok ? "Remote" : "—")} · posted {timeAgo(job.created_at)}</p>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"1.25rem" }}>
          {job.specialization && <span style={tagStyle("#e0e7ff", "#3730a3")}>{job.specialization}</span>}
          {job.employment_type && <span style={tagStyle("#f3f4f6", "#374151")}>{job.employment_type}</span>}
          {job.experience_level && <span style={tagStyle("#fef3c7", "#92400e")}>{job.experience_level}</span>}
          {job.remote_ok && <span style={tagStyle("#dcfce7", "#166534")}>Remote OK</span>}
          {salaryStr && <span style={tagStyle("#fce7f3", "#9f1239")}>{salaryStr}</span>}
        </div>
        <h3 style={sectionH}>Description</h3>
        <p style={{ fontSize:"14px", color:"#1a1a18", whiteSpace:"pre-wrap", lineHeight:1.6, margin:"0 0 1.25rem" }}>{job.description}</p>
        {(job.required_skills?.length > 0) && (
          <>
            <h3 style={sectionH}>Required skills</h3>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"1.25rem" }}>
              {job.required_skills.map(s => <span key={s} style={tagStyle("#f3f4f6", "#374151")}>{s}</span>)}
            </div>
          </>
        )}
        {(job.required_certs?.length > 0) && (
          <>
            <h3 style={sectionH}>Required certs</h3>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"1.25rem" }}>
              {job.required_certs.map(s => <span key={s} style={tagStyle("#dbeafe", "#1e40af")}>{s}</span>)}
            </div>
          </>
        )}

        <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:"1.25rem", marginTop:"1rem" }}>
          {!user ? (
            <p style={{ fontSize:"13px", color:"#73726c", margin:0 }}>Sign in to apply for this role.</p>
          ) : existing ? (
            <p style={{ fontSize:"13px", color:"#166534", margin:0, fontWeight:600 }}>✓ You applied — status: {existing.status}</p>
          ) : applied ? (
            <p style={{ fontSize:"13px", color:"#166534", margin:0, fontWeight:600 }}>✓ Application submitted</p>
          ) : (
            <>
              <h3 style={sectionH}>Apply for this role</h3>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={5} placeholder="Cover letter (optional — tell the recruiter why you're a fit)" style={inputStyle}/>
              <div style={{ display:"flex", gap:"10px", marginTop:"10px" }}>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" style={{ ...inputStyle, flex:1 }}/>
                <input type="number" value={salary} onChange={e => setSalary(e.target.value)} placeholder="Salary expectation (optional)" style={{ ...inputStyle, flex:1 }}/>
              </div>
              {err && <p style={{ color:"#dc2626", fontSize:"12px", margin:"10px 0 0" }}>{err}</p>}
              <button onClick={apply} disabled={submitting} style={{ marginTop:"1rem", padding:"10px 24px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor: submitting ? "wait":"pointer" }}>
                {submitting ? "Submitting..." : "Submit application"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const sectionH = { fontSize:"12px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", color:"#73726c", margin:"0 0 0.5rem" };
const inputStyle = { width:"100%", padding:"10px 12px", fontSize:"13px", border:"0.5px solid #d3d1c7", borderRadius:"8px", fontFamily:"inherit", lineHeight:1.5, boxSizing:"border-box" };

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
      <label style={{ fontSize:"11px", fontWeight:600, color:"#73726c", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding:"7px 10px", fontSize:"13px", border:"0.5px solid #d3d1c7", borderRadius:"8px", background:"#fff" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function Jobs({ onNavigate }) {
  const { user } = useApp();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ specialization:"All", employment_type:"All", experience_level:"All", remote_only:false, search:"" });
  const [selected, setSelected] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    let q = supabase.from("jobs").select("*").eq("status","open").order("created_at", { ascending:false }).limit(100);
    if (filters.specialization !== "All")    q = q.eq("specialization", filters.specialization);
    if (filters.employment_type !== "All")   q = q.eq("employment_type", filters.employment_type);
    if (filters.experience_level !== "All")  q = q.eq("experience_level", filters.experience_level);
    if (filters.remote_only)                 q = q.eq("remote_ok", true);
    if (filters.search)                      q = q.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    const { data, error } = await q;
    if (error) console.error(error);
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, [filters]);

  const setF = (k,v) => setFilters(f => ({ ...f, [k]:v }));

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb" }}>
      <div style={{ background:"#1e3a5f", padding:"2rem 1.5rem" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 style={{ fontSize:"24px", fontWeight:700, color:"#fff", margin:0 }}>Jobs</h1>
            <p style={{ color:"#93c5fd", fontSize:"13px", margin:"4px 0 0" }}>Verified Microsoft ecosystem roles</p>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            {user && (
              <button onClick={() => onNavigate("my-applications")} style={ghostBtn}>My applications</button>
            )}
            {user?.tier === "recruiter" && (
              <button onClick={() => onNavigate("post-job")} style={primaryBtn}>Post a job</button>
            )}
          </div>
        </div>
      </div>
      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"1.5rem" }}>
        <div style={{ background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"1.25rem", marginBottom:"1.25rem" }}>
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap", alignItems:"flex-end" }}>
            <div style={{ flex:2, minWidth:"180px", display:"flex", flexDirection:"column", gap:"4px" }}>
              <label style={{ fontSize:"11px", fontWeight:600, color:"#73726c", textTransform:"uppercase", letterSpacing:"0.05em" }}>Search</label>
              <input type="text" placeholder="Title, company, keyword..." value={filters.search} onChange={e => setF("search", e.target.value)} style={{ padding:"7px 10px", fontSize:"13px", border:"0.5px solid #d3d1c7", borderRadius:"8px" }}/>
            </div>
            <FilterSelect label="Specialization"    value={filters.specialization}    onChange={v => setF("specialization", v)}    options={SPECIALIZATIONS}/>
            <FilterSelect label="Type"              value={filters.employment_type}   onChange={v => setF("employment_type", v)}   options={EMPLOYMENT_TYPES}/>
            <FilterSelect label="Level"             value={filters.experience_level}  onChange={v => setF("experience_level", v)}  options={EXPERIENCE_LEVELS}/>
            <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"13px", paddingBottom:"4px", cursor:"pointer" }}>
              <input type="checkbox" checked={filters.remote_only} onChange={e => setF("remote_only", e.target.checked)}/> Remote only
            </label>
          </div>
        </div>
        {loading ? <p style={centerMuted}>Loading jobs...</p>
          : jobs.length === 0 ? <p style={centerMuted}>No jobs match your filters yet.</p>
          : <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>{jobs.map(j => <JobCard key={j.id} job={j} onOpen={setSelected}/>)}</div>}
      </div>
      {selected && <JobDetail job={selected} user={user} onClose={() => setSelected(null)} onApplied={fetchJobs}/>}
    </div>
  );
}

const ghostBtn   = { padding:"8px 16px", background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const primaryBtn = { padding:"8px 16px", background:"#fbbf24", color:"#1a1a18", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const centerMuted = { textAlign:"center", color:"#73726c", padding:"3rem" };
