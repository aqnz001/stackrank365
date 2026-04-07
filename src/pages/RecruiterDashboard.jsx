import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useApp } from "../context/AppContext";

const TIERS = ["All","Explorer","Practitioner","Specialist","Principal","Architect"];
const SPECIALIZATIONS = ["All","Dynamics 365","Power Platform","Azure","Microsoft 365","Copilot Studio","Power BI","Security"];
const REGIONS = ["All","New Zealand","Australia","United Kingdom","United States","India","Netherlands","Canada"];
const TIER_COLORS = { Explorer:"#6b7280",Practitioner:"#2563eb",Specialist:"#7c3aed",Principal:"#d97706",Architect:"#dc2626" };

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:"4px" }}>
      <label style={{ fontSize:"11px",fontWeight:600,color:"#73726c",textTransform:"uppercase",letterSpacing:"0.05em" }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ padding:"7px 10px",fontSize:"13px",border:"0.5px solid #d3d1c7",borderRadius:"8px",background:"#fff",color:"#1a1a18" }}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function CandidateCard({ candidate, onContact }) {
  const tierColor = TIER_COLORS[candidate.tier] || "#6b7280";
  const initials = (candidate.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ background:"#fff",border:"0.5px solid #d3d1c7",borderRadius:"12px",padding:"1.25rem",display:"flex",gap:"1rem",alignItems:"flex-start" }}>
      <div style={{ width:"44px",height:"44px",borderRadius:"50%",background:tierColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontWeight:700,fontSize:"15px" }}>{initials}</div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap",marginBottom:"4px" }}>
          <span style={{ fontWeight:600,fontSize:"14px",color:"#1a1a18" }}>{candidate.name}</span>
          {candidate.open_to_work && <span style={{ fontSize:"11px",fontWeight:600,padding:"2px 8px",borderRadius:"20px",background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0" }}>Open to Work</span>}
          <span style={{ fontSize:"11px",fontWeight:600,padding:"2px 8px",borderRadius:"20px",background:tierColor+"22",color:tierColor }}>{candidate.tier}</span>
        </div>
        <p style={{ fontSize:"12px",color:"#73726c",margin:"0 0 6px" }}>{candidate.professional_title||"Microsoft Professional"} · {candidate.region||"—"}</p>
        <div style={{ display:"flex",gap:"12px",flexWrap:"wrap" }}>
          <span style={{ fontSize:"11px",color:"#4b5563" }}>Score: <strong>{candidate.score?.toLocaleString()||"—"}</strong></span>
          <span style={{ fontSize:"11px",color:"#4b5563" }}>Rank: <strong>#{candidate.rank||"—"}</strong></span>
          <span style={{ fontSize:"11px",color:"#4b5563" }}>Certs: <strong>{candidate.cert_count||0}</strong></span>
        </div>
      </div>
      <button onClick={()=>onContact(candidate)} style={{ flexShrink:0,padding:"7px 14px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:"8px",fontSize:"12px",fontWeight:600,cursor:"pointer" }}>Contact</button>
    </div>
  );
}

function ContactModal({ candidate, onClose }) {
  const [message,setMessage] = useState(`Hi ${candidate?.name?.split(" ")[0]||"there"},\n\nI came across your profile on StackRank365 and was impressed by your verified ${candidate?.tier||""} ranking.\n\nI have an opportunity that may interest you. Would you be open to a brief conversation?\n\nBest regards,`);
  const [sent,setSent] = useState(false);
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem" }}>
      <div style={{ background:"#fff",borderRadius:"16px",padding:"2rem",maxWidth:"520px",width:"100%",maxHeight:"90vh",overflowY:"auto" }}>
        {!sent ? (
          <>
            <h3 style={{ fontSize:"16px",fontWeight:600,margin:"0 0 0.5rem" }}>Contact {candidate?.name}</h3>
            <p style={{ fontSize:"12px",color:"#73726c",margin:"0 0 1rem" }}>Message sent to their verified email address.</p>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={8} style={{ width:"100%",padding:"10px 12px",fontSize:"13px",border:"0.5px solid #d3d1c7",borderRadius:"8px",resize:"vertical",fontFamily:"sans-serif",lineHeight:1.6,boxSizing:"border-box" }}/>
            <div style={{ display:"flex",gap:"8px",marginTop:"1rem" }}>
              <button onClick={async()=>{
                try{
                  await fetch("https://shnuwkjkjthvaovoywju.supabase.co/functions/v1/send-contact-request",{
                    method:"POST",
                    headers:{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4"},
                    body:JSON.stringify({candidateId:candidate?.id,message})
                  });
                }catch(e){console.error("Contact relay error:",e);}
                setSent(true);
              }} style={{ flex:1,padding:"10px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer" }}>Send message</button>
              <button onClick={onClose} style={{ flex:1,padding:"10px",background:"transparent",border:"0.5px solid #d3d1c7",borderRadius:"8px",fontSize:"13px",cursor:"pointer" }}>Cancel</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center",padding:"1rem" }}>
            <p style={{ fontSize:"32px",margin:"0 0 1rem" }}>✓</p>
            <p style={{ fontWeight:600,fontSize:"15px" }}>Message sent to {candidate?.name}</p>
            <button onClick={onClose} style={{ padding:"10px 24px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer",marginTop:"1rem" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruiterDashboard({ onNavigate }) {
  const { user, navigate } = useApp();
  const nav = onNavigate || navigate;
  const [candidates,setCandidates] = useState([]);
  const [loading,setLoading] = useState(true);
  const [filters,setFilters] = useState({ tier:"All",specialization:"All",region:"All",openToWork:false,search:"" });
  const [contactTarget,setContactTarget] = useState(null);

  useEffect(() => { if (user && user.tier !== "recruiter") nav("pricing"); }, [user]);
  useEffect(() => { fetchCandidates(); }, [filters]);

  const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4";
  const runAIMatch = async () => {
    if (!jobDesc.trim()) return;
    setAiLoading(true); setAiResults(null);
    try {
      const res = await fetch("https://shnuwkjkjthvaovoywju.supabase.co/functions/v1/recruiter-match",{
        method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+ANON_KEY},
        body:JSON.stringify({ job_description:jobDesc, region:filters.region!=="All"?filters.region:undefined, open_to_work_only:filters.openToWork, limit:20 })
      });
      const data = await res.json();
      setAiResults(Array.isArray(data.candidates)?data.candidates:Array.isArray(data.matches)?data.matches:[]);
    } catch(e){ console.error("AI match:",e); }
    finally { setAiLoading(false); }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      let query = supabase.from("leaderboard").select("id,name,professional_title,region,tier,score,rank,open_to_work,cert_count").order("rank",{ascending:true}).limit(50);
      if (filters.openToWork) query = query.eq("open_to_work",true);
      if (filters.tier !== "All") query = query.eq("tier",filters.tier);
      if (filters.specialization !== "All") query = query.ilike("specialization",`%${filters.specialization}%`);
      if (filters.region !== "All") query = query.ilike("region",`%${filters.region}%`);
      if (filters.search) query = query.ilike("name",`%${filters.search}%`);
      const { data,error } = await query;
      if (error) throw error;
      setCandidates(data||[]);
    } catch(err) { console.error(err); } finally { setLoading(false); }
  };

  const setFilter = (k,v) => setFilters(f=>({...f,[k]:v}));
  const openToWorkCount = candidates.filter(c=>c.open_to_work).length;

  return (
    <div style={{ minHeight:"100vh",background:"#f9fafb" }}>
      <div style={{ background:"#1e3a5f",padding:"2rem 1.5rem" }}>
        <div style={{ maxWidth:"1100px",margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
          <div>
            <h1 style={{ fontSize:"24px",fontWeight:700,color:"#fff",margin:0 }}>Recruiter Dashboard</h1>
            <p style={{ color:"#93c5fd",fontSize:"13px",margin:"4px 0 0" }}>Verified Microsoft talent pool</p>
          </div>
          <div style={{ display:"flex",gap:"12px" }}>
            <div style={{ textAlign:"center",background:"rgba(255,255,255,0.1)",borderRadius:"8px",padding:"8px 16px" }}>
              <p style={{ fontSize:"20px",fontWeight:700,color:"#fff",margin:0 }}>{candidates.length}</p>
              <p style={{ fontSize:"11px",color:"#93c5fd",margin:0 }}>Verified professionals</p>
            </div>
            <div style={{ textAlign:"center",background:"rgba(22,163,74,0.2)",borderRadius:"8px",padding:"8px 16px",border:"1px solid rgba(22,163,74,0.3)" }}>
              <p style={{ fontSize:"20px",fontWeight:700,color:"#4ade80",margin:0 }}>{openToWorkCount}</p>
              <p style={{ fontSize:"11px",color:"#86efac",margin:0 }}>Open to Work</p>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:"1100px",margin:"0 auto",padding:"1.5rem" }}>
        <div style={{ background:"#fff",border:"0.5px solid #d3d1c7",borderRadius:"12px",padding:"1.25rem",marginBottom:"1.25rem" }}>
          <div style={{ display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"flex-end" }}>
            <div style={{ flex:2,minWidth:"180px",display:"flex",flexDirection:"column",gap:"4px" }}>
              <label style={{ fontSize:"11px",fontWeight:600,color:"#73726c",textTransform:"uppercase",letterSpacing:"0.05em" }}>Search</label>
              <input type="text" placeholder="Search by name..." value={filters.search} onChange={e=>setFilter("search",e.target.value)} style={{ padding:"7px 10px",fontSize:"13px",border:"0.5px solid #d3d1c7",borderRadius:"8px" }}/>
            </div>
            <FilterSelect label="Specialization" value={filters.specialization} onChange={v=>setFilters(f=>({...f,specialization:v}))} options={SPECIALIZATIONS}/>
            <FilterSelect label="Tier" value={filters.tier} onChange={v=>setFilter("tier",v)} options={TIERS}/>
            <FilterSelect label="Region" value={filters.region} onChange={v=>setFilter("region",v)} options={REGIONS}/>
            <label style={{ display:"flex",alignItems:"center",gap:"6px",fontSize:"13px",cursor:"pointer",paddingBottom:"4px" }}>
              <input type="checkbox" checked={filters.openToWork} onChange={e=>setFilter("openToWork",e.target.checked)}/> Open to Work only
            </label>
          </div>
        </div>
        {loading ? <p style={{ textAlign:"center",color:"#73726c",padding:"3rem" }}>Loading candidates...</p>
          : candidates.length===0 ? <p style={{ textAlign:"center",color:"#73726c",padding:"3rem" }}>No candidates match your filters.</p>
          : <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>{candidates.map(c=><CandidateCard key={c.id} candidate={c} onContact={setContactTarget}/>)}</div>}
      </div>
      {contactTarget && <ContactModal candidate={contactTarget} onClose={()=>setContactTarget(null)}/>}
    </div>
  );
}