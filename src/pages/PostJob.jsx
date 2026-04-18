import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";

const SPECIALIZATIONS = ["Dynamics 365","Power Platform","Azure","Microsoft 365","Copilot Studio","Power BI","Security"];
const EMPLOYMENT_TYPES = ["full-time","part-time","contract","temporary"];
const EXPERIENCE_LEVELS = ["entry","mid","senior","lead","principal"];

const inputStyle = { width:"100%", padding:"10px 12px", fontSize:"13px", border:"0.5px solid #d3d1c7", borderRadius:"8px", fontFamily:"inherit", boxSizing:"border-box" };
const labelStyle = { fontSize:"11px", fontWeight:700, color:"#73726c", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:"6px" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:"1rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function PostJob({ onNavigate }) {
  const { user } = useApp();
  const [form, setForm] = useState({
    title:"", company:"", description:"", location:"", remote_ok:false,
    employment_type:"full-time", experience_level:"mid",
    salary_min:"", salary_max:"", salary_currency:"USD",
    specialization:"Dynamics 365",
    required_skills:"", required_certs:"",
    status:"open",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && user.tier !== "recruiter") {
      // Not a recruiter — bounce to pricing
      onNavigate("pricing");
    }
  }, [user]);

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    setErr("");
    if (!form.title.trim() || !form.description.trim()) {
      setErr("Title and description are required.");
      return;
    }
    if (!user) { setErr("Please sign in."); return; }
    setSubmitting(true);
    const payload = {
      posted_by: user.id,
      title: form.title.trim(),
      company: form.company.trim() || null,
      description: form.description.trim(),
      location: form.location.trim() || null,
      remote_ok: !!form.remote_ok,
      employment_type: form.employment_type,
      experience_level: form.experience_level,
      salary_min: form.salary_min ? parseInt(form.salary_min, 10) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max, 10) : null,
      salary_currency: form.salary_currency || "USD",
      specialization: form.specialization,
      required_skills: form.required_skills.split(",").map(s => s.trim()).filter(Boolean),
      required_certs:  form.required_certs.split(",").map(s => s.trim()).filter(Boolean),
      status: form.status,
    };
    const { error } = await supabase.from("jobs").insert([payload]);
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    setSuccess(true);
  };

  if (!user) {
    return (
      <div style={{ maxWidth:"640px", margin:"4rem auto", padding:"2rem", textAlign:"center" }}>
        <h2>Sign in to post a job</h2>
        <button onClick={() => onNavigate("signin")} style={primaryBtn}>Sign in</button>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ maxWidth:"640px", margin:"4rem auto", padding:"2rem", textAlign:"center", background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"16px" }}>
        <p style={{ fontSize:"40px", margin:"0 0 1rem" }}>✓</p>
        <h2 style={{ margin:"0 0 0.5rem" }}>Job posted</h2>
        <p style={{ color:"#73726c", fontSize:"14px" }}>Your job is now visible on the jobs board.</p>
        <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginTop:"1.5rem" }}>
          <button onClick={() => onNavigate("jobs")} style={primaryBtn}>View jobs</button>
          <button onClick={() => { setSuccess(false); setForm({ ...form, title:"", description:"" }); }} style={ghostBtn}>Post another</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f9fafb" }}>
      <div style={{ background:"#1e3a5f", padding:"2rem 1.5rem" }}>
        <div style={{ maxWidth:"760px", margin:"0 auto" }}>
          <h1 style={{ fontSize:"24px", fontWeight:700, color:"#fff", margin:0 }}>Post a job</h1>
          <p style={{ color:"#93c5fd", fontSize:"13px", margin:"4px 0 0" }}>Reach verified Microsoft talent</p>
        </div>
      </div>
      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"1.5rem" }}>
        <div style={{ background:"#fff", border:"0.5px solid #d3d1c7", borderRadius:"12px", padding:"1.75rem" }}>
          <Field label="Job title *">
            <input type="text" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Senior D365 F&O Consultant" style={inputStyle}/>
          </Field>
          <Field label="Company">
            <input type="text" value={form.company} onChange={e => set("company", e.target.value)} style={inputStyle}/>
          </Field>
          <Field label="Description *">
            <textarea rows={8} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Role, responsibilities, team, stack..." style={{ ...inputStyle, lineHeight:1.6 }}/>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <Field label="Location">
              <input type="text" value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Auckland, NZ" style={inputStyle}/>
            </Field>
            <Field label="Remote OK?">
              <label style={{ display:"flex", alignItems:"center", gap:"8px", paddingTop:"8px", fontSize:"13px" }}>
                <input type="checkbox" checked={form.remote_ok} onChange={e => set("remote_ok", e.target.checked)}/> Remote work allowed
              </label>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
            <Field label="Specialization">
              <select value={form.specialization} onChange={e => set("specialization", e.target.value)} style={inputStyle}>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select value={form.employment_type} onChange={e => set("employment_type", e.target.value)} style={inputStyle}>
                {EMPLOYMENT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Experience level">
              <select value={form.experience_level} onChange={e => set("experience_level", e.target.value)} style={inputStyle}>
                {EXPERIENCE_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
            <Field label="Salary min">
              <input type="number" value={form.salary_min} onChange={e => set("salary_min", e.target.value)} style={inputStyle}/>
            </Field>
            <Field label="Salary max">
              <input type="number" value={form.salary_max} onChange={e => set("salary_max", e.target.value)} style={inputStyle}/>
            </Field>
            <Field label="Currency">
              <input type="text" value={form.salary_currency} onChange={e => set("salary_currency", e.target.value)} style={inputStyle}/>
            </Field>
          </div>
          <Field label="Required skills (comma-separated)">
            <input type="text" value={form.required_skills} onChange={e => set("required_skills", e.target.value)} placeholder="D365 F&O, X++, SQL" style={inputStyle}/>
          </Field>
          <Field label="Required certifications (comma-separated)">
            <input type="text" value={form.required_certs} onChange={e => set("required_certs", e.target.value)} placeholder="MB-500, AZ-204" style={inputStyle}/>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
              <option value="draft">Draft (not visible)</option>
              <option value="open">Open (visible to candidates)</option>
            </select>
          </Field>

          {err && <p style={{ color:"#dc2626", fontSize:"13px", margin:"0.5rem 0 1rem" }}>{err}</p>}

          <div style={{ display:"flex", gap:"10px", justifyContent:"flex-end", marginTop:"1rem" }}>
            <button onClick={() => onNavigate("jobs")} style={ghostBtn}>Cancel</button>
            <button onClick={submit} disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.6 : 1 }}>{submitting ? "Posting..." : "Post job"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryBtn = { padding:"10px 24px", background:"#1e3a5f", color:"#fff", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
const ghostBtn   = { padding:"10px 24px", background:"transparent", color:"#1a1a18", border:"0.5px solid #d3d1c7", borderRadius:"8px", fontSize:"13px", fontWeight:600, cursor:"pointer" };
