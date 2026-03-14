import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

async function getSupabase() {
  try {
    const mod = await import('../lib/supabase.js');
    if (mod.SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
    return mod.supabase;
  } catch { return null; }
}

export default function ResetPassword({ onNavigate }) {
  const { showToast } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 8) { showToast('Password must be 8+ characters', 'error'); return; }
    if (password !== confirm) { showToast('Passwords do not match', 'error'); return; }
    setLoading(true);
    const sb = await getSupabase();
    if (sb) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) { showToast(error.message, 'error'); setLoading(false); return; }
    }
    setDone(true);
    setLoading(false);
    setTimeout(() => onNavigate('signin'), 3000);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '3rem 1rem', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(0,194,255,0.06)', top: -100, right: -100 }} />
      <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(0,194,255,0.3)', fontSize: '1.6rem' }}>
            🔑
          </div>
          <h2 style={{ fontSize: '1.7rem', marginBottom: '0.4rem' }}>Set new password</h2>
          <p style={{ color: 'var(--muted2)', fontSize: '0.9rem' }}>Choose a strong password for your account</p>
        </div>
        <div className="card" style={{ padding: '2rem' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Password updated!</h3>
              <p style={{ color: 'var(--muted2)', fontSize: '0.9rem' }}>Redirecting you to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label className="label">New Password</label>
                <input className="input" type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
              </div>
              <div className="form-group">
                <label className="label">Confirm Password</label>
                <input className="input" type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
