import { useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const STEP = { IDLE:"idle",UPLOADING:"uploading",ANALYSING:"analysing",PREVIEW:"preview",APPLYING:"applying",DONE:"done",ERROR:"error" };

export default function ResumeAnalyser({ onApply }) {
  const [step,setStep] = useState(STEP.IDLE);
  const [result,setResult] = useState(null);
  const [error,setError] = useState(null);
  const [sel,setSel] = useState({ summary:true,title:true,certifications:true,skills:true,projects:false });
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file || file.type!=="application/pdf") { setError("Please upload a PDF file."); setStep(STEP.ERROR); return; }
    if (file.size > 5*1024*1024) { setError("File must be under 5MB."); setStep(STEP.ERROR); return; }
    setStep(STEP.UPLOADING); setError(null);
    try {
      const base64 = await new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
      setStep(STEP.ANALYSING);
      const { data:{user} } = await supabase.auth.getUser();
      const { data, error:fnErr } = await supabase.functions.invoke("analyse-resume", { body: { pdf_base64: base64, profile_id: user?.id } });
      if (fnErr || data?.error) throw new Error(fnErr?.message ?? data?.error ?? "Analysis failed");
      setResult(data.data); setStep(STEP.PREVIEW);
    } catch(err) { setError(err.message); setStep(STEP.ERROR); }
  };

  const handleApply = async () => {
    setStep(STEP.APPLYING);
    try {
      const { data:{user} } = await supabase.auth.getUser();
      const updates = {};
      if (sel.title && result.professional_title) updates.professional_title = result.professional_title;
      if (sel.summary && result.summary) updates.bio = result.summary;
      if (result.region) updates.region = result.region;
      if (Object.keys(updates).length) await supabase.from("profiles").update(updates).eq("id", user.id);
      if (sel.certifications && result.certifications?.length) {
        await supabase.from("certifications").upsert(result.certifications.map(c=>({ profile_id:user.id, name:c.name, ms_cert_id:c.ms_cert_id??null, issued_date:c.year?`${c.year}-01-01`:null, verification_status:"unverified" })), { onConflict:"profile_id,name", ignoreDuplicates:true });
      }
      if (sel.projects && result.projects?.length) {
        await supabase.from("projects").insert(result.projects.map(p=>({ profile_id:user.id, title:p.title, technology:p.technology, project_date:p.year?`${p.year}-06-01`:null, description:p.description })));
      }
      setStep(STEP.DONE); onApply?.({ updates });
    } catch(err) { setError(err.message); setStep(STEP.ERROR); }
  };

  const reset = () => { setStep(STEP.IDLE); setResult(null); setError(null); };

  return (
    <div style={{ background:"#fff",border:"0.5px solid #d3d1c7",borderRadius:"12px",padding:"1.5rem" }}>
      <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"1rem" }}>
        <div style={{ width:"32px",height:"32px",background:"#1e3a5f",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ color:"#fff",fontSize:"14px" }}>📄</span></div>
        <div><p style={{ fontWeight:600,fontSize:"14px",margin:0 }}>Resume Analyser</p><p style={{ fontSize:"12px",color:"#73726c",margin:0 }}>Upload your CV — we extract your Microsoft skills, certs, and projects</p></div>
      </div>

      {step===STEP.IDLE && <div onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}} style={{ border:"2px dashed #d3d1c7",borderRadius:"8px",padding:"2rem",textAlign:"center",cursor:"pointer" }}>
        <p style={{ fontSize:"24px",margin:"0 0 0.5rem" }}>📎</p>
        <p style={{ fontWeight:500,fontSize:"14px",color:"#1a1a18",margin:"0 0 4px" }}>Drop PDF here or click to browse</p>
        <p style={{ fontSize:"12px",color:"#73726c",margin:0 }}>PDF only · Max 5MB · Analysed by Claude AI</p>
        <input ref={fileRef} type="file" accept="application/pdf" style={{ display:"none" }} onChange={e=>handleFile(e.target.files?.[0])}/>
      </div>}

      {(step===STEP.UPLOADING||step===STEP.ANALYSING) && <div style={{ textAlign:"center",padding:"2rem" }}>
        <p style={{ fontSize:"32px",margin:"0 0 0.5rem" }}>{step===STEP.UPLOADING?"⏫":"🤖"}</p>
        <p style={{ fontWeight:500,fontSize:"14px",margin:0 }}>{step===STEP.UPLOADING?"Uploading...":"Claude is analysing your resume..."}</p>
      </div>}

      {step===STEP.ERROR && <div style={{ background:"#fef2f2",border:"1px solid #fecaca",borderRadius:"8px",padding:"1rem" }}>
        <p style={{ fontSize:"13px",color:"#991b1b",margin:"0 0 0.75rem" }}>⚠️ {error}</p>
        <button onClick={reset} style={{ padding:"6px 14px",fontSize:"12px",background:"transparent",border:"0.5px solid #fecaca",borderRadius:"8px",cursor:"pointer",color:"#991b1b" }}>Try again</button>
      </div>}

      {step===STEP.PREVIEW && result && <div>
        <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"8px",padding:"0.75rem 1rem",marginBottom:"1rem" }}>
          <p style={{ fontSize:"13px",color:"#166534",margin:0 }}>✓ Analysis complete — confidence {result.confidence??0}%</p>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.25rem" }}>
          {result.professional_title && <label style={{ display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",fontSize:"13px" }}><input type="checkbox" checked={sel.title} onChange={()=>setSel(s=>({...s,title:!s.title}))}/> Title: <strong>{result.professional_title}</strong></label>}
          {result.summary && <label style={{ display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",fontSize:"13px" }}><input type="checkbox" checked={sel.summary} onChange={()=>setSel(s=>({...s,summary:!s.summary}))}/> Bio / summary</label>}
          {result.certifications?.length>0 && <label style={{ display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",fontSize:"13px" }}><input type="checkbox" checked={sel.certifications} onChange={()=>setSel(s=>({...s,certifications:!s.certifications}))}/> {result.certifications.length} certifications</label>}
          {result.projects?.length>0 && <label style={{ display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",fontSize:"13px" }}><input type="checkbox" checked={sel.projects} onChange={()=>setSel(s=>({...s,projects:!s.projects}))}/> {result.projects.length} projects (review before importing)</label>}
        </div>
        <p style={{ fontSize:"11px",color:"#b4b2a9",margin:"0 0 0.75rem" }}>Certs imported as self-reported — verify with Microsoft Learn to unlock full score.</p>
        <div style={{ display:"flex",gap:"8px" }}>
          <button onClick={handleApply} style={{ flex:1,padding:"10px",background:"#1e3a5f",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:600,cursor:"pointer" }}>Apply to profile</button>
          <button onClick={reset} style={{ flex:1,padding:"10px",background:"transparent",border:"0.5px solid #d3d1c7",borderRadius:"8px",fontSize:"13px",cursor:"pointer" }}>Cancel</button>
        </div>
      </div>}

      {step===STEP.DONE && <div style={{ textAlign:"center",padding:"1.5rem" }}>
        <p style={{ fontSize:"32px",margin:"0 0 0.5rem" }}>✓</p>
        <p style={{ fontWeight:600,fontSize:"15px",margin:"0 0 0.25rem" }}>Profile updated from resume</p>
        <p style={{ fontSize:"12px",color:"#73726c",margin:"0 0 1rem" }}>Verify certifications with Microsoft Learn to unlock full score weight.</p>
        <button onClick={reset} style={{ padding:"8px 20px",background:"transparent",border:"0.5px solid #d3d1c7",borderRadius:"8px",fontSize:"13px",cursor:"pointer" }}>Analyse another</button>
      </div>}
    </div>
  );
}