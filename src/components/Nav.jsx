import { useState } from 'react';
import { useApp } from '../context/AppContext';

const LogoMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" width="32" height="32">
    <defs>
      <linearGradient id="navHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6d28d9"/>
        <stop offset="50%" stopColor="#4f46e5"/>
        <stop offset="100%" stopColor="#0078d4"/>
      </linearGradient>
      <filter id="navGlow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <polygon points="34,4 58,4 70,24 58,44 34,44 22,24"
      fill="url(#navHexGrad)" filter="url(#navGlow)"/>
    <polyline points="30,25 38,34 52,14"
      fill="none" stroke="white" strokeWidth="5.5"
      strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="58" cy="10" r="11" fill="#f59e0b"/>
    <polygon
      points="58,4 59.8,8.2 64.5,8.2 60.8,11 62.2,15.5 58,13 53.8,15.5 55.2,11 51.5,8.2 56.2,8.2"
      fill="white"/>
  </svg>
);

const NAV_LINKS = [
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'scoring',      label: 'Scoring'      },
  { id: 'leaderboard',  label: 'Leaderboard'  },
  { id: 'about',        label: 'About'         },
];

export default function Nav({ currentPage, onNavigate }) {
  const { user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navTo = (page) => { onNavigate(page); setMenuOpen(false); setUserMenuOpen(false); };

  // Close user menu when clicking outside
  const handleSignOut = async () => {
    try {
      const mod = await import('../lib/supabase.js');
      if (mod.SUPABASE_URL !== 'YOUR_SUPABASE_URL') await mod.supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('sr365_user');
    window.location.reload();
  };

  // Avatar initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Logo */}
        <button onClick={() => navTo('landing')}
          className="nav-logo"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoMark />
          <span className="nav-logo-text">
            StackRank<span style={{ color: 'var(--blue)' }}>365</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <button key={l.id}
              className={`nav-link${currentPage === l.id ? ' active' : ''}`}
              onClick={() => navTo(l.id)}>
              {l.label}
            </button>
          ))}
          {/* Extra nav links for signed-in users */}
          {user && (
            <button
              className={`nav-link${currentPage === 'dashboard' ? ' active' : ''}`}
              onClick={() => navTo('dashboard')}>
              Dashboard
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            /* Signed-in state — user menu */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navTo('profile')} style={{ gap: '0.5rem' }}>
                My Profile
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '0.35rem 0.75rem 0.35rem 0.45rem',
                    cursor: 'pointer', color: 'var(--text)', fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.88rem', fontWeight: 600, transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface2)'}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--grad-blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  {user.name?.split(' ')[0] || 'Account'}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5 }}>
                    <path d="M3 4.5L6 7.5L9 4.5"/>
                  </svg>
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '0.4rem', minWidth: 180,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 1000,
                  }}>
                    <div style={{ padding: '0.5rem 0.75rem 0.6rem', borderBottom: '1px solid var(--border)', marginBottom: '0.3rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{user.email}</div>
                    </div>
                    {[
                      { label: '📊 Dashboard', page: 'dashboard' },
                      { label: '👤 My Profile', page: 'profile' },
                      { label: '⚙️ Settings', page: 'dashboard' },
                    ].map(item => (
                      <button key={item.label} onClick={() => navTo(item.page)} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                        color: 'var(--text)', fontSize: '0.85rem', cursor: 'pointer',
                        borderRadius: 8, fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >{item.label}</button>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.3rem', paddingTop: '0.3rem' }}>
                      <button onClick={handleSignOut} style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                        color: 'var(--red, #f87171)', fontSize: '0.85rem', cursor: 'pointer',
                        borderRadius: 8, fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >🚪 Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Signed-out state */
            <button className="btn btn-gold btn-sm" onClick={() => navTo('landing')}>
              🚀 Join Waitlist
            </button>
          )}

          {/* Mobile hamburger */}
          <button id="mobile-menu-btn" className="btn btn-ghost btn-sm"
            onClick={() => setMenuOpen(o => !o)} style={{ padding: '0.4rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.5rem 1.25rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {NAV_LINKS.map(l => (
            <button key={l.id}
              className={`nav-link${currentPage === l.id ? ' active' : ''}`}
              style={{ textAlign: 'left', width: '100%' }}
              onClick={() => navTo(l.id)}>
              {l.label}
            </button>
          ))}
          {user && (
            <button className="nav-link" style={{ textAlign: 'left', width: '100%' }}
              onClick={() => navTo('dashboard')}>
              Dashboard
            </button>
          )}
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navTo('profile')}>👤 My Profile</button>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => navTo('dashboard')}>📊 Dashboard</button>
                <button style={{ width: '100%', padding: '0.45rem', background: 'none', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem' }}
                  onClick={handleSignOut}>🚪 Sign Out</button>
              </div>
            ) : (
              <button className="btn btn-gold btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navTo('landing')}>
                🚀 Join Waitlist
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        #mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
