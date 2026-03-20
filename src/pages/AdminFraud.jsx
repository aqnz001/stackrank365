import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_COLORS = { flagged:{bg:"#fef2f2",text:"#991b1b",border:"#fecaca"}, clean:{bg:"#f0fdf4",text:"#166534",border:"#bbf7d0"}, suspended:{bg:"#1e3a5f",text:"#fff",border:"#1e3a5f"}, cleared:{bg:"#f0fdf4",text:"#166534",border:"#bbf7d0"} };
const FLAG_LABELS = { rapid_project_addition:"Rapid project additions", all_backdated_unvalidated:"All backdated + unvalidated", high_cert_failure_rate:"High cert failure rate", new_account_high_score:"New account, high score" };

function ProfileCard({ profile, onAction }) {
  const [loading, setLoading] = useState(false);
  const s = STATUS_COLORS[profile.fraud_status] || STATUS_COLORS.clean;
  const takeAction = async (action) => {
    setLoading(true);
    const newStatus = action==="suspend"?"suspended":action==="clear"?"cleared":action==="reinstate"?"clean":profile.fraud_status;
    await supabase.from("profiles").update({ fraud_status: newStatus, fraud_reviewed_at: new Date().toISOString() }).eq("id", profile.id);
    await supabase.from("fraud_audit_log").insert({ profile_id: profile.id, fraud_score: profile.fraud_score, flags: profile.fraud_flags||[], action_taken: action, reviewed_by: "admin" });
    onAction(profile.id, newStatus);
    setLoading(false);
  };
  return (
    <div style={{ background:"#fff",border:"0.5px solid #d3d1c7",borderRadius:"12px",padding:"1.25rem",marginBottom:"10px" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",marginBottom:"0.75rem" }}>
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px" }}>
            <span style={{ fontWeight:600,fontSize:"15px",color:"#1a1a18" }}>{profile.name||"Unknown"}</span>
            <span style={{ fontSize:"11px",fontWeight:700,padding:"3px 10px",borderRadius:"20px",background:s.bg,color:s.text,border:`0.5px solid ${s.border}` }}>{profile.fraud_status?.toUpperCase()}</span>
            <span style={{ fontSize:"12px",color:"#73726c" }}>Score: <strong style={{ color:profile.fraud_score>=50?"#dc2626":"#73726c" }}>{profile.fraud_score}</strong></span>
          </div>
          <p style={{ fontSize:"12px",color:"#73726c",margin:0 }}>{profile.professional_title||"—"} · StackRank score: {profile.score?.toLocaleString()||"—"}</p>
        </div>
        <div style={{ display:"flex",gap:"8px" }}>
          {profile.fraud_status==="flagged" && <>
            <button onClick={()=>takeAction("clear")} disabled={loading} style={{ padding:"6px 14px",background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:"8px",fontSize:"12px",fontWeight:600,cursor:"pointer" }}>Clear</button>
            <button onClick={()=>takeAction("suspend")} disabled={loading} style={{ padding:"6px 14px",background:"#fef2f2",color:"#991b1b",border:"1px solid #fecaca",borderRadius:"8px",fontSize:"12px",fontWeight:600,cursor:"pointer" }}>Suspend</button>
          </>}
          {profile.fraud_status==="suspended" && <button onClick={()=>takeAction("reinstate")} disabled={loading} style={{ padding:"6px 14px",background:"#eff6ff",color:"#1e3a5f",border:"1px solid #bfdbfe",borderRadius:"8px",fontSize:"12px",fontWeight:600,cursor:"pointer" }}>Reinstate</button>}
        </div>
      </div>
      {profile.fraud_flags?.length>0 && <div style={{ display:"flex",flexWrap:"wrap",gap:"4px" }}>{profile.fraud_flags.map((f,i)=><span key={i} style={{ fontSize:"11px",fontWeight:600,padding:"3px 10px",borderRadius:"20px",background:"#fef2f2",color:"#991b1b",border:"0.5px solid #fecaca" }}>{FLAG_LABELS[f.flag]||f.flag} +{f.score}</span>)}</div>}
    </div>
  );
}

export default function AdminFraud() {
  const [profiles,setProfiles] = useState([]);
  const [loading,setLoading] = useState(true);
  const [filter,setFilter] = useState("flagged");
  const [running,setRunning] = useState(false);
  const [lastRun,setLastRun] = useState(null);

  useEffect(()=>{ fetchProfiles(); },[filter]);

  const fetchProfiles = async () => {
    setLoading(true);
    const q = supabase.from("profiles").select("id,name,professional_title,score,created_at,fraud_score,fraud_flags,fraud_status").order("fraud_score",{ascending:false}).limit(100);
    const { data } = filter==="all" ? await q.neq("fraud_status","clean") : await q.eq("fraud_status",filter);
    setProfiles(data||[]);
    setLoading(false);
  };

  const runDetection = async () => {
    setRunning(true);
    const { data } = await supabase.functions.invoke("detect-fake-profiles", { body: {} });
    setLastRun(data);
    await fetchProfiles();
    setRunning(false);
  };

  return (
    <div style={{ minHeight:"100vh",background:"#f9fafb" }}>
      <div style={{ background:"#1e3a5f",padding:"1.5rem" }}>
        <div style={{ maxWidth:"900px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
          <div><h1 style={{ fontSize:"20px",fontWeight:700,color:"#fff",margin:0 }}>Fraud Detection Admin</h1>
          {lastRun && <p style={{ color:"#93c5fd",fontSize:"12px",margin:"4px 0 0" }}>Last run: {lastRun.checked} checked, {lastRun.flagged} flagged</p>}</div>
          <button onClick={runDetection} disabled={running} style={{ padding:"8px 16px",background:"#fff",color:"#1e3a5f",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer",opacity:running?0.7:1 }}>{running?"Running...":"Run detection now"}</button>
        </div>
      </div>
      <div style={{ maxWidth:"900px",margin:"0 auto",padding:"1.5rem" }}>
        <div style={{ display:"flex",gap:"8px",marginBottom:"1.25rem" }}>
          {["flagged","suspended","cleared","all"].map(s=><button key={s} onClick={()=>setFilter(s)} style={{ padding:"6px 14px",fontSize:"12px",fontWeight:600,borderRadius:"20px",cursor:"pointer",background:filter===s?"#1e3a5f":"#fff",color:filter===s?"#fff":"#73726c",border:filter===s?"none":"0.5px solid #d3d1c7" }}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}
        </div>
        {loading ? <p style={{ textAlign:"center",color:"#73726c",padding:"3rem" }}>Loading...</p>
          : profiles.length===0 ? <div style={{ textAlign:"center",padding:"3rem" }}><p style={{ fontSize:"32px",margin:"0 0 1rem" }}>✓</p><p style={{ color:"#73726c" }}>No {filter} profiles</p></div>
          : profiles.map(p=><ProfileCard key={p.id} profile={p} onAction={(id,s)=>setProfiles(ps=>ps.map(pr=>pr.id===id?{...pr,fraud_status:s}:pr))}/>)}
      </div>
    </div>
  );
}