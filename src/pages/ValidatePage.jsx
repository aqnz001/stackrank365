import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

async function getSupabase() {
  try {
    const mod = await import('../lib/supabase.js');
    if (mod.SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
    return mod.supabase;
  } catch { return null; }
}

// Shown when someone clicks a validation link:
// stackrank365.com/#validate?token=ABC123
export default function ValidatePage({ token, onNavigate }) {
  const { user } = useApp();
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [done, setDone] = useState(null); // 'accepted' | 'declined'
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setError('Invalid validation link.'); setLoading(false); return; }
    (async () => {
      const sb = await getSupabase();
      if (!sb) { setError('Service unavailable — please try again later.'); setLoading(false); return; }
      const { data, error } = await sb
        .from('validations')
        .select(`*, project:projects(title, role, description, industry), requestor:profiles!requestor_id(name, headline, username)`)
        .eq('token', token)
        .single();
      if (error || !data) { setError('Validation link not found or already used.'); setLoading(false); return; }
      if (data.status !== 'pending') { setDone(data.status); setLoading(false); return; }
      setValidation(data);
      setLoading(false);
    })();
  }, [token]);

  const respond = async (status) => {
    setResponding(true);
    const sb = await getSupabase();
    if (!sb) return;
    const { error } = await sb.from('validations').update({
      status,
      validator_id: user?.id || null,
      responded_at: new Date().toISOString(),
    }).eq('token', token);

    if (!error && status === 'accepted') {
      // Add 300 validation points to the project
      await sb.from('projects').update({ validated: true }).eq('id', validation.project_id);
    }
    if (!error) setDone(status);
    setResponding(false);
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted2)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        Loading validation request…
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Link not valid</h2>
        <p style={{ color: 'var(--muted2)', marginBottom: '1.5rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => onNavigate('landing')}>Go to StackRank365</button>
      </div>
    </div>
  );

  if (done) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{done === 'accepted' ? '✅' : '👋'}</div>
        <h2 style={{ marginBottom: '0.5rem' }}>
          {done === 'accepted' ? 'Validation confirmed!' : 'Response recorded'}
        </h2>
        <p style={{ color: 'var(--muted2)', marginBottom: '1.5rem' }}>
          {done === 'accepted'
            ? 'You\'ve confirmed this project. The professional earns +300 Stack Points.'
            : 'You\'ve declined this validation request.'}
        </p>
        <button className="btn btn-primary" onClick={() => onNavigate('leaderboard')}>View Leaderboard</button>
      </div>
    </div>
  );

  const { project, requestor } = validation;

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '3rem 1rem', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(0,194,255,0.06)', top: -100, right: -100 }} />
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Peer Validation Request</h2>
          <p style={{ color: 'var(--muted2)', fontSize: '0.9rem' }}>
            <strong style={{ color: '#fff' }}>{requestor?.name}</strong> has asked you to confirm they worked on a project.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
          {/* Requestor info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', color: '#fff', flexShrink: 0 }}>
              {(requestor?.name || '?')[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{requestor?.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>{requestor?.headline}</div>
            </div>
          </div>

          {/* Project details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Project to validate</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>{project?.title}</div>
            {project?.role && <div style={{ fontSize: '0.85rem', color: 'var(--blue)', fontWeight: 600, marginBottom: '0.4rem' }}>{project.role}</div>}
            {project?.description && <p style={{ fontSize: '0.85rem', color: 'var(--muted2)', lineHeight: 1.6, margin: '0 0 0.5rem' }}>{project.description}</p>}
            {project?.industry && <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>{project.industry}</span>}
          </div>

          {/* Custom message */}
          {validation.message && (
            <div style={{ padding: '0.85rem 1rem', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--muted2)', fontStyle: 'italic' }}>
              "{validation.message}"
            </div>
          )}

          {/* What this means */}
          <div style={{ padding: '0.85rem 1rem', background: 'var(--blue-dim)', borderRadius: 10, border: '1px solid var(--border-blue)', marginBottom: '1.75rem', fontSize: '0.82rem', color: 'var(--muted2)' }}>
            <strong style={{ color: 'var(--blue)' }}>By confirming:</strong> You're stating that you worked alongside {requestor?.name} on this project and can vouch for their involvement. They will earn +300 Stack Points.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', color: 'var(--muted2)' }}
              disabled={responding} onClick={() => respond('declined')}>
              {responding ? '…' : '✗ Decline'}
            </button>
            <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
              disabled={responding} onClick={() => respond('accepted')}>
              {responding ? 'Confirming…' : '✅ Yes, I can confirm this'}
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Only confirm if you genuinely worked on this project with {requestor?.name?.split(' ')[0]}.
          False validations undermine the platform's integrity.
        </p>
      </div>
    </div>
  );
}
