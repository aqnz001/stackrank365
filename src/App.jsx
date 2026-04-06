import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Nav from './components/Nav';
import LogoMark from './components/Logo';
import Landing from './pages/Landing2';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import { HowItWorks, Scoring, About, ForRecruiters, PowerPlatformRanking } from './pages/StaticPages';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import ValidatePage from './pages/ValidatePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Pricing from './pages/Pricing';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminFraud from './pages/AdminFraud';
import AdminTools from './pages/AdminTools';
import AdminSitemap from './pages/AdminSitemap';
import QADashboard from './pages/QADashboard';

function Footer({ onNavigate }) {
  return (
    <footer style={{ background: '#f6f7f8', borderTop: '1px solid rgba(0,0,0,0.06)', padding: '4rem 0 2rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>
          <div>
            <button onClick={() => onNavigate('landing')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <LogoMark size={34} />
              <span style={{ fontFamily: 'Rubik', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.5px' }}>
                StackRank<span style={{ color: 'var(--blue)', fontWeight: 800 }}>365</span>
              </span>
            </button>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.75, maxWidth: 280 }}>
              The verified talent ranking community for Microsoft Dynamics 365, Power Platform, Copilot Studio, and Azure OpenAI professionals.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-gold btn-sm" onClick={() => onNavigate('landing')}>
                ð Join the Waitlist
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '1.1rem' }}>Platform</div>
            {[['how-it-works','How It Works'],['scoring','Scoring'],['leaderboard','Leaderboard'],['pricing','Pricing']].map(([id, label]) => (
              <div key={id} style={{ marginBottom: '0.65rem' }}>
                <button onClick={() => onNavigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', padding: 0, fontFamily: "'Rubik', sans-serif", transition: 'color 400ms ease-in-out' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>{label}</button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '1.1rem' }}>Company</div>
            {[['about','About'],['for-recruiters','For Recruiters']].map(([id, label]) => (
              <div key={id} style={{ marginBottom: '0.65rem' }}>
                <button onClick={() => onNavigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', padding: 0, fontFamily: "'Rubik', sans-serif", transition: 'color 400ms ease-in-out' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>{label}</button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '1.1rem' }}>Legal</div>
            {[['privacy-policy','Privacy Policy']].map(([id, label]) => (
              <div key={id} style={{ marginBottom: '0.65rem' }}>
                <button onClick={() => onNavigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem', padding: 0, fontFamily: "'Rubik', sans-serif", transition: 'color 400ms ease-in-out' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>{label}</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>© 2025 StackRank365 · All rights reserved.</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Built for the Microsoft community</div>
        </div>
      </div>
      <style>{`@media(max-width:768px){ footer .container > div:first-child { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}

function AppInner() {
  const { user, loading } = useApp();
  const [page, setPage] = useState('landing');
  const [profileUsername, setProfileUsername] = useState(null);
  const [pageData, setPageData] = useState(null);

  // âââ Handle URL hash routing for early-adopter links + Supabase callbacks ââ
  useEffect(() => {
    const handleHash = () => {
      // Query string routing: ?page=xxx
      const _params = new URLSearchParams(window.location.search);
      const qPage = _params.get('page');
      const qUser = _params.get('u');
      if (qPage) { setPage(qPage); if (qUser) setProfileUsername(qUser); return; }
      const hash = window.location.hash.replace('#', '');
      const search = window.location.search;
      const fullHash = window.location.hash;

      // Supabase OAuth/magic link callback â token arrives in the hash fragment
      if (fullHash.includes('access_token=') || fullHash.includes('refresh_token=')) {
        // Do NOT clear URL — Supabase SDK needs the hash to establish session
        setPage('dashboard');
        return;
      }
      // Supabase password recovery
      if (search.includes('type=recovery') || fullHash.includes('type=recovery')) {
        setPage('reset-password');
        return;
      }
      // Validation link: /#validate?token=ABC123
      if (hash.startsWith('validate')) {
        const params = new URLSearchParams(fullHash.replace(/^#validate\??/, ''));
        setPageData({ token: params.get('token') });
        setPage('validate');
        return;
      }
      // Hash-based routing for early-adopter links
      if (['signup','signin','dashboard','early-access','reset-password'].includes(hash)) {
        setPage(hash === 'early-access' ? 'signup' : hash);
        window.history.replaceState({}, '', '/');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Redirect to dashboard if already signed in and on auth pages
  useEffect(() => {
    if (user && (page === 'signup' || page === 'signin')) {
      setPage('dashboard');
    }
  }, [user, page]);

  const navigate = (newPage, data = null) => {
    setPage(newPage);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (page) {
      case 'landing':         return <Landing onNavigate={navigate} />;
      case 'leaderboard':     return <Leaderboard onNavigate={navigate} />;
      case 'profile':         return <Profile onNavigate={navigate} profileUsername={profileUsername} profileUser={pageData?.userData} />;
      case 'how-it-works':    return <HowItWorks onNavigate={navigate} />;
      case 'scoring':         return <Scoring onNavigate={navigate} />;
      case 'about':           return <About onNavigate={navigate} />;
      case 'for-recruiters':  return <ForRecruiters onNavigate={navigate} />;
      case 'dashboard':          return (loading ? (
        <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.25rem',background:'var(--bg)'}}>
          <div style={{width:44,height:44,border:'3px solid var(--border-bright)',borderTopColor:'var(--blue)',borderRadius:'50%',animation:'_spin 0.8s linear infinite'}}/>
          <p style={{color:'var(--muted2)',fontSize:'0.88rem',margin:0}}>Signing you in…</p>
          <style>{'@keyframes _spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      ) : <Dashboard onNavigate={navigate} />);
      case 'signup':          return <Auth mode="signup" onNavigate={navigate} />;
      case 'signin':          return <Auth mode="signin" onNavigate={navigate} />;
      case 'reset-password':  return <ResetPassword onNavigate={navigate} />;
      case 'validate':        return <ValidatePage token={pageData?.token} onNavigate={navigate} />;
      case 'sr365-sitemap':          return <AdminSitemap />;
      case 'sr365-admin-tools':   return <AdminTools />;
      case 'sr365-qa':             return <QADashboard />;
      case 'admin-fraud':          return <AdminFraud onNavigate={navigate} />;
      case 'pricing':              return <Pricing onNavigate={navigate} />;
      case 'recruiter-dashboard':  return <RecruiterDashboard onNavigate={navigate} />;
      case 'privacy':              return <PrivacyPolicy onNavigate={navigate} />;
      default:                return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav currentPage={page} onNavigate={navigate} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
