import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, User, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react';

const LogoMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" width="32" height="32">
    <defs>
      <linearGradient id="navHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0195ff"/>
        <stop offset="100%" stopColor="#0f53fa"/>
      </linearGradient>
    </defs>
    <polygon points="34,4 58,4 70,24 58,44 34,44 22,24" fill="url(#navHexGrad)"/>
    <polyline points="30,25 38,34 52,14"
      fill="none" stroke="white" strokeWidth="5.5"
      strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="58" cy="10" r="11" fill="#ffb30c"/>
    <polygon
      points="58,4 59.8,8.2 64.5,8.2 60.8,11 62.2,15.5 58,13 53.8,15.5 55.2,11 51.5,8.2 56.2,8.2"
      fill="white"/>
  </svg>
);

const NAV_LINKS = [
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'scoring',      label: 'Scoring'      },
  { id: 'leaderboard',  label: 'Leaderboard'  },
  { id: 'about',        label: 'About'        },
];

export default function Nav({ currentPage, onNavigate }) {
  const { user } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navTo = (page) => { onNavigate(page); setMenuOpen(false); setUserMenuOpen(false); };

  const handleSignOut = async () => {
    try {
      const mod = await import('../lib/supabase.js');
      if (mod.SUPABASE_URL !== 'YOUR_SUPABASE_URL') await mod.supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('sr365_user');
    window.location.reload();
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const menuItems = [
    { label: 'Dashboard', page: 'dashboard', icon: <LayoutDashboard size={15}/> },
    { label: 'My Profile', page: 'profile',   icon: <User size={15}/> },
    { label: 'Settings',   page: 'dashboard', icon: <Settings size={15}/> },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Logo */}
        <button onClick={() => navTo('landing')} className="nav-logo"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoMark />
          <span className="nav-logo-text">
            StackRank<span style={{ color: 'var(--blue)', fontWeight: 800 }}>365</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', position: 'relative' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navTo('profile')}>
                My Profile
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                    background: 'var(--surface2)', border: '1px solid #efefef',
                    borderRadius: 5, padding: '8px 14px 8px 10px',
                    cursor: 'pointer', color: 'var(--text)',
                    fontFamily: "'Rubik', sans-serif",
                    fontSize: '0.95rem', fontWeight: 500, transition: 'all 400ms ease-in-out',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#efefef'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'var(--blue)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {initials}
                  </div>
                  {user.name?.split(' ')[0] || 'Account'}
                  <ChevronDown size={12} style={{ opacity: 0.5 }} />
                </button>
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--surface)', border: '1px solid #efefef',
                    borderRadius: 8, padding: '0.4rem', minWidth: 200,
                    boxShadow: 'var(--shadow-modal)', zIndex: 1000,
                  }}>
                    <div style={{ padding: '0.6rem 0.85rem 0.65rem', borderBottom: '1px solid #f0f0f0', marginBottom: '0.3rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{user.email}</div>
                    </div>
                    {menuItems.map(item => (
                      <button key={item.label} onClick={() => navTo(item.page)} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        width: '100%', textAlign: 'left',
                        padding: '0.5rem 0.85rem', background: 'none', border: 'none',
                        color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer',
                        borderRadius: 5, fontFamily: "'Rubik', sans-serif",
                        fontWeight: 400, transition: 'background 400ms ease-in-out',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <span style={{ color: 'var(--muted)' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '0.3rem', paddingTop: '0.3rem' }}>
                      <button onClick={handleSignOut} style={{
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        width: '100%', textAlign: 'left',
                        padding: '0.5rem 0.85rem', background: 'none', border: 'none',
                        color: 'var(--red)', fontSize: '0.9rem', cursor: 'pointer',
                        borderRadius: 5, fontFamily: "'Rubik', sans-serif",
                        fontWeight: 400, transition: 'background 400ms ease-in-out',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(246,65,45,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <LogOut size={15}/> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navTo('landing')}>
              Get Started
            </button>
          )}

          {/* Mobile hamburger */}
          <button id="mobile-menu-btn" className="btn btn-ghost btn-sm"
            onClick={() => setMenuOpen(o => !o)}
            style={{ padding: '0.4rem', color: 'var(--text)' }}
            aria-label="Toggle menu">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.25rem 1.25rem',
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
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0', marginTop: '0.5rem' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => navTo('profile')}><User size={14}/> My Profile</button>
                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
                  onClick={() => navTo('dashboard')}><LayoutDashboard size={14}/> Dashboard</button>
                <button style={{
                  width: '100%', padding: '10px',
                  background: 'rgba(246,65,45,0.06)', border: '1px solid rgba(246,65,45,0.2)',
                  borderRadius: 5, color: 'var(--red)', cursor: 'pointer',
                  fontFamily: "'Rubik', sans-serif", fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
                  onClick={handleSignOut}><LogOut size={14}/> Sign Out</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navTo('landing')}>
                Get Started
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
