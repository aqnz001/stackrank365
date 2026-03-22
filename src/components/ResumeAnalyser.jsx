import { useState, useRef } from 'react';

const SB_URL   = 'https://shnuwkjkjthvaovoywju.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobnV3a2pranRodmFvdm95d2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjcxODQsImV4cCI6MjA4OTAwMzE4NH0.E3jR8tamdJNdiRMiO_XtbSZU1IrDpPFhVnPJmNSN4X4';

export default function ResumeAnalyser({ onApprove }) {
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [reviseNote, setReviseNote] = useState('');
  const [error, setError] = useState('');
  const [filename, setFilename] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef();

  const card = { background:'var(--surface2,#1c2539)', border:'1px solid var(--border,rgba(255,255,255,.07))', borderRadius:10, padding:'1rem', marginBottom:'1rem' };
  const lbl = { fontSize:'0.7rem', color:'var(--muted,#64748b)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:4 };
  const ta  = { width:'100%', padding:'10px 12px', fontSize:13, lineHeight:1.65, background:'var(--bg,#0d1117)', border:'1px solid var(--border,rgba(255,255,255,.1))', borderRadius:6, color:'var(--text,#e2e8f0)', outline:'none', resize:'vertical', minHeight:110, boxSizing:'border-box' };
  const bp  = { padding:'8px 16px', fontSize:13, fontWeight:600, borderRadius:6, cursor:'pointer', border:'none', background:'var(--blue,#00c2ff)', color:'#000' };
  const bs  = { padding:'8px 14px', fontSize:13, fontWeight:600, borderRadius:6, cursor:'pointer', border:'1px solid var(--border,rgba(255,255,255,.1))', background:'transparent', color:'var(--text,#e2e8f0)' };
  const bd  = { padding:'8px 14px', fontSize:13, fontWeight:600, borderRadius:6, cursor:'pointer', border:'none', background:'rgba(239,68,68,.15)', color:'#f87171' };

  const readFile = (file) => new Promise((res, rej) => {
    if (file.type !== 'application/pdf') return rej(new Error('Only PDF files are accepted'));
    if (file.size > 5*1024*1024) return rej(new Error('File must be under 5 MB'));
    const r = new FileReader();
    r.onload = e => res(e.target.result.split(',')[1]);
    r.onerror = () => rej(new Error('Could not read file'));
    r.readAsDataURL(file);
  });

  const analyse = async (base64, note='') => {
    setStatus('uploading'); setError('');
    try {
      const res = await fetch(SB_URL+'/functions/v1/analyse-resume', {
        method:'POST',
        headers:{ apikey:ANON_KEY, Authorization:'Bearer '+ANON_KEY, 'Content-Type':'application/json' },
        body: JSON.stringify({ pdf_base64: base64, revise_note: note }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Analysis failed');
      const text = json.summary || '';
      if (!text) throw new Error('No summary returned');
      setSummary(text); setEditedSummary(text); setStatus('reviewing'); setReviseNote('');
    } catch(e) { setError(e.message); setStatus('idle'); }
  };

  const handleFile = async (file) => {
    try { const b64=await readFile(file); setPdfBase64(b64); setFilename(file.name); await analyse(b64); }
    catch(e) { setError(e.message); setStatus('idle'); }
  };

  const handleApprove = () => { onApprove?.(isEditing ? editedSummary : summary); setStatus('approved'); };
  const handleReset   = () => { setStatus('idle'); setSummary(''); setEditedSummary(''); setReviseNote(''); setError(''); setFilename(''); setPdfBase64(''); setIsEditing(false); };

  return (
    <div style={card}>
      <style>{'@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}'}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'0.875rem'}}>
        <span style={{fontSize:22}}>📄</span>
        <div>
          <p style={{fontSize:'0.88rem',fontWeight:700,color:'var(--text,#e2e8f0)',margin:0}}>Resume Analyser</p>
          <p style={{fontSize:'0.72rem',color:'var(--muted,#64748b)',margin:0}}>
            {status==='idle'&&'Upload your CV — AI generates a short profile summary from your experience'}
            {status==='uploading'&&'Reading your CV and writing summary...'}
            {status==='reviewing'&&'Review your generated summary — edit, ask for a revision, or approve'}
            {status==='approved'&&'Summary added to your profile bio'}
          </p>
        </div>
      </div>

      {/* IDLE */}
      {status==='idle'&&(
        <>
          <div onClick={()=>fileRef.current?.click()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}} onDragOver={e=>e.preventDefault()}
            style={{border:'1.5px dashed var(--border-blue,rgba(0,194,255,.3))',borderRadius:8,padding:'1.5rem',textAlign:'center',cursor:'pointer',background:'rgba(0,194,255,.03)'}}>
            <div style={{fontSize:28,marginBottom:6}}>📎</div>
            <p style={{fontSize:13,color:'var(--muted,#64748b)',margin:0}}>Drop PDF here or click to browse</p>
            <p style={{fontSize:11,color:'var(--muted,#64748b)',margin:'4px 0 0',opacity:0.7}}>PDF only · Max 5 MB · Summary by Claude AI</p>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={e=>{if(e.target.files?.[0])handleFile(e.target.files[0]);}}/>
          {error&&<p style={{fontSize:12,color:'#f87171',margin:'0.5rem 0 0'}}>{error}</p>}
        </>
      )}

      {/* UPLOADING */}
      {status==='uploading'&&(
        <div style={{textAlign:'center',padding:'1.5rem 0'}}>
          <div style={{fontSize:28,marginBottom:8,animation:'spin 1.5s linear infinite',display:'inline-block'}}>⟳</div>
          <p style={{fontSize:13,color:'var(--muted,#64748b)',margin:0}}>Analysing your CV...</p>
          <p style={{fontSize:11,color:'var(--muted,#64748b)',margin:'4px 0 0',opacity:0.6}}>Usually takes 10–20 seconds</p>
        </div>
      )}

      {/* REVIEWING */}
      {status==='reviewing'&&(
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
            <span style={lbl}>Generated Summary</span>
            <button onClick={()=>setIsEditing(!isEditing)} style={{...bs,padding:'4px 10px',fontSize:11}}>
              {isEditing?'View':'✏️ Edit manually'}
            </button>
          </div>

          {isEditing
            ? <textarea style={ta} value={editedSummary} onChange={e=>setEditedSummary(e.target.value)} placeholder="Edit your summary..."/>
            : <div style={{...ta,minHeight:'auto',cursor:'default',whiteSpace:'pre-wrap'}}>{summary}</div>
          }

          <details style={{marginTop:'0.75rem'}}>
            <summary style={{fontSize:12,color:'var(--muted,#64748b)',cursor:'pointer',userSelect:'none'}}>🔄 Ask AI to revise</summary>
            <div style={{marginTop:8}}>
              <span style={lbl}>What should change?</span>
              <textarea style={{...ta,minHeight:60}} placeholder="e.g. Make it shorter, focus on Power Platform, use a more formal tone..." value={reviseNote} onChange={e=>setReviseNote(e.target.value)}/>
              <button onClick={()=>analyse(pdfBase64,reviseNote)} disabled={!reviseNote.trim()} style={{...bs,marginTop:6,opacity:reviseNote.trim()?1:0.5}}>Regenerate ↺</button>
            </div>
          </details>

          <p style={{fontSize:11,color:'var(--muted,#64748b)',margin:'0.75rem 0',opacity:0.7}}>From: {filename} · Will appear on your public profile under Bio.</p>

          <div style={{display:'flex',gap:8}}>
            <button onClick={handleApprove} style={bp}>✓ Add to Profile</button>
            <button onClick={handleReset} style={bd}>Discard</button>
          </div>
        </div>
      )}

      {/* APPROVED */}
      {status==='approved'&&(
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.5rem 0'}}>
          <span style={{fontSize:13,color:'#22c55e'}}>✓ Summary added to profile bio — click Save Changes to persist</span>
          <button onClick={handleReset} style={{...bs,fontSize:11,padding:'4px 10px'}}>Upload new CV</button>
        </div>
      )}
    </div>
  );
}