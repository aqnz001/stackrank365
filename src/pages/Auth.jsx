import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SPECIALISMS } from '../data/data';

async function getSupabase() {
  try {
    const mod = await import('../lib/supabase.js');
    if (mod.SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
    return mod.supabase;
  } catch { return null; }
}

// Microsoft logo SVG
function MsLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" style={{ flexShrink: 0 }}>
      <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  );
}

export default function Auth({ mode = 'signup', onNavigate }) {
  const { setUser, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [isReset, setIsReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msLoading, setMsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '', password: '',
    headline: '', specialism: 'Dynamics 365', location: '', yearsExp: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ─── Microsoft OAuth ──────────────────────────────────────────────────────
  const handleMicrosoftLogin = async () => {
    setMsLoading(true);
    const sb = await getSupabase();
    if (!sb) {
      // Dev fallback
      setUser({ name: 'Demo User (MS)', email: 'demo@microsoft.com', username: 'demo.user',
        headline: 'Microsoft Professional', specialism: 'Dynamics 365',
        certifications: [], projects: [], foundingMember: true });
      showToast('Signed in with Microsoft (demo mode)', 'success');
      onNavigate('dashboard');
      setMsLoading(false);
      return;
    }
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid profile email User.Read',
        redirectTo: window.location.origin,
      },
    });
    if (error) { showToast(error.message, 'error'); setMsLoading(false); }
    // Success: Supabase redirects back, onAuthStateChange in AppContext handles the rest
  };

  // ─── Password reset ───────────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (!form.email) { showToast('Enter your email address', 'error'); return; }
    setLoading(true);
    const sb = await getSupabase();
    if (sb) {
      const { error } = await sb.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}?page=reset-password`,
      });
      if (error) showToast(error.message, 'error');
      else setResetSent(true);
    } else {
      setResetSent(true); // demo mode
    }
    setLoading(false);
  };

  // ─── Step 1: account details ──────────────────────────────────────────────
  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name || !form.email || !form.password) { showToast('Fill in all fields', 'error'); return; }
    if (!form.email.includes('@')) { showToast('Enter a valid email', 'error'); return; }
    if (form.password.length < 8) { showToast('Password must be 8+ characters', 'error'); return; }
    setStep(2);
  };

  // ─── Signup ───────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.headline || !form.specialism) { showToast('Fill in all fields', 'error'); return; }
    setLoading(true);
    const sb = await getSupabase();
    if (sb) {
      const { data, error } = await sb.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: (form.first_name + ' ' + form.last_name).trim(),
            first_name: form.first_name,
            last_name: form.last_name,
            preferred_username: form.username || (form.first_name + '.' + form.last_name).toLowerCase().replace(/\s+/g, '.')),
          },
        },
      });
      if (error) { showToast(error.message, 'error'); setLoading(false); return; }
      // Update profile with extra fields
      if (data.user) {
        await sb.from('profiles').update({
          headline: form.headline,
          specialism: form.specialism,
          location: form.location,
          years_exp: parseInt(form.yearsExp) || 0,
          username: form.username || form.name.toLowerCase().replace(/\s+/g, '.'),
        }).eq('id', data.user.id);
      }
      showToast('Welcome to StackRank365! 🎉 Complete your profile to start earning points.', 'success');
      onNavigate('dashboard');
    } else {
      // localStorage fallback
      setUser({
        name: (form.first_name + ' ' + form.last_name).trim(), first_name: form.first_name, last_name: form.last_name, email: form.email,
        username: form.username || form.name.toLowerCase().replace(/\s+/g, '.'),
        headline: form.headline, specialism: form.specialism,
        location: form.location, yearsExp: parseInt(form.yearsExp) || 0,
        certifications: [], projects: [], foundingMember: true,
      });
      showToast('Welcome to StackRank365! 🎉 +500 Founding Member points', 'success');
      onNavigate('dashboard');
    }
    setLoading(false);
  };

  // ─── Sign in ──────────────────────────────────────────────────────────────
  const handleSignin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { showToast('Fill in all fields', 'error'); return; }
    setLoading(true);
    const sb = await getSupabase();
    if (sb) {
      const { error } = await sb.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) { showToast(error.message, 'error'); setLoading(false); return; }
      showToast('Welcome back!', 'success');
      onNavigate('dashboard');
    } else {
      setUser({ name: 'Demo User', first_name: 'Demo', last_name: 'User', email: form.email, username: 'demo.user',
        headline: 'Microsoft Professional', specialism: 'Dynamics 365',
        certifications: [], projects: [], foundingMember: true });
      showToast('Welcome back! (demo mode)', 'success');
      onNavigate('dashboard');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '3rem 1rem', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(0,194,255,0.06)', top: -100, right: -100 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(167,139,250,0.05)', bottom: -50, left: -50 }} />

      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--grad-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(0,194,255,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.8" fill="rgba(255,255,255,0.15)"/>
              <path d="M12 8l-4 2.5v5L12 18l4-2.5v-5L12 8z" fill="white"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '1.7rem', marginBottom: '0.4rem' }}>
            {isReset ? 'Reset password' : isSignup ? 'Create your profile' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--muted2)', fontSize: '0.9rem' }}>
            {isReset ? 'We\'ll email you a reset link' : isSignup ? 'Join the verified Microsoft talent community' : 'Sign in to your StackRank365 account'}
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>

          {/* ─── Password reset ─── */}
          {isReset && (
            resetSent ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📧</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Check your email</h3>
                <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  We sent a password reset link to <strong style={{ color: '#fff' }}>{form.email}</strong>
                </p>
                <button className="btn btn-ghost" onClick={() => { setIsReset(false); setResetSent(false); }}>
                  ← Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset}>
                <div className="form-group">
                  <label className="label">Email Address</label>
                  <input className="input" type="email" placeholder="sarah@company.com" value={form.email} onChange={e => set('email', e.target.value)} autoFocus />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsReset(false)}>← Back to sign in</button>
                </div>
              </form>
            )
          )}

          {/* ─── Sign up / Sign in ─── */}
          {!isReset && (
            <>
              {/* Microsoft OAuth button */}
              <button
                onClick={handleMicrosoftLogin}
                disabled={msLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.65rem', padding: '0.75rem', borderRadius: 10, marginBottom: '1.25rem',
                  background: '#2a3142', border: '1px solid var(--border-bright)',
                  color: '#fff', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s', fontFamily: 'Outfit, sans-serif',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#333d52'}
                onMouseLeave={e => e.currentTarget.style.background = '#2a3142'}
              >
                <MsLogo />
                {msLoading ? 'Connecting to Microsoft...' : isSignup ? 'Sign up with Microsoft' : 'Sign in with Microsoft'}
              </button>

              {/* Recommended badge */}
              <div style={{ textAlign: 'center', marginTop: '-0.75rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--green)', fontWeight: 600 }}>
                  ✓ Recommended — enables automatic certification verification
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>or use email</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Step indicator for signup */}
              {isSignup && (
                <div style={{ display: 'flex', marginBottom: '1.75rem' }}>
                  {['Account', 'Profile'].map((label, i) => (
                    <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= i + 1 ? 1 : 0.4 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--blue)' : 'var(--surface2)',
                        color: step >= i + 1 ? '#000' : 'var(--muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {step > i + 1 ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: step === i + 1 ? '#fff' : 'var(--muted2)' }}>{label}</span>
                      {i === 0 && <div style={{ flex: 1, height: 2, background: step > 1 ? 'var(--blue)' : 'var(--surface2)', marginLeft: '0.5rem', borderRadius: 1 }} />}
                    </div>
                  ))}
                </div>
              )}

              {/* Signup Step 1 */}
              {isSignup && step === 1 && (
                <form onSubmit={handleStep1}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                    <div className="form-group" style={{ margin:0 }}>
                      <label className="label">First Name</label>
                      <input className="input" placeholder="Sarah" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin:0 }}>
                      <label className="label">Last Name</label>
                      <input className="input" placeholder="Mitchell" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="sarah@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Username</label>
                    <input className="input" placeholder="sarah.mitchell" value={form.username}
                      onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.3rem' }}>
                      stackrank365.com/profile/{form.username || 'username'}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Password</label>
                    <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Continue →
                  </button>
                </form>
              )}

              {/* Signup Step 2 */}
              {isSignup && step === 2 && (
                <form onSubmit={handleSignup}>
                  <div className="form-group">
                    <label className="label">Professional Headline</label>
                    <input className="input" placeholder="Dynamics 365 Solution Architect" value={form.headline} onChange={e => set('headline', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Primary Specialism</label>
                    <select className="input" value={form.specialism} onChange={e => set('specialism', e.target.value)}>
                      {SPECIALISMS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="label">Location</label>
                      <input className="input" placeholder="London, UK" value={form.location} onChange={e => set('location', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Years Exp</label>
                      <input className="input" type="number" min="0" max="40" placeholder="5" value={form.yearsExp} onChange={e => set('yearsExp', e.target.value)} />
                    </div>
                  </div>
                  <div className="card" style={{ background: 'var(--gold-dim)', border: '1px solid var(--border-gold)', padding: '0.9rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>🎁 Founding Member Bonus</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted2)', marginTop: '0.25rem' }}>Join now and receive +500 Stack Points as a founding member.</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                      {loading ? 'Creating profile...' : '🚀 Create Profile'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sign in */}
              {!isSignup && (
                <form onSubmit={handleSignin}>
                  <div className="form-group">
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="sarah@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="label">Password</label>
                    <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
                    <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                      <button type="button"
                        style={{ padding: 0, fontSize: '0.85rem', color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                        onClick={() => setIsReset(true)}>
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In →'}
                  </button>
                </form>
              )}

              <div className="divider" />
              <div style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--muted2)' }}>
                {isSignup ? 'Already have an account? ' : 'New to StackRank365? '}
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontWeight: 600, padding: 0, fontSize: '0.88rem' }}
                  onClick={() => { setIsSignup(!isSignup); setStep(1); }}>
                  {isSignup ? 'Sign In' : 'Create Profile'}
                </button>
              </div>
              {!isSignup && (
                <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted2)', fontSize: '0.82rem', padding: 0 }}
                    onClick={() => setIsReset(true)}>
                    Forgot your password?
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Early adopter note */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
          🔒 Early access — by invitation only
        </p>
      </div>
    </div>
  );
}
