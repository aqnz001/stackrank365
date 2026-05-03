import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Nav from './components/Nav';
import LogoMark from './components/Logo';
import Landing from './pages/Landing2';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import { HowItWorks, Scoring, About, PowerPlatformRanking } from './pages/StaticPages';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import ValidatePage from './pages/ValidatePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Pricing from './pages/Pricing';
import AdminFraud from './pages/AdminFraud';
import AdminTools from './pages/AdminTools';
import AdminSitemap from './pages/AdminSitemap';
import Survey from './pages/Survey';

/* Compact footer — links available in top Nav are excluded to avoid duplication. */
function Footer({ onNavigate }) {
  const linkStyle = { color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', textDecoration: 'none', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' };
  return (
    <footer style={{ marginTop: 'auto', background: 'var(--color-secondary-100)', color: '#fff' }}>
      <div className="u-content-width" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem 2rem', padding: '1.25rem 0' }}>
        <button onClick={() => onNavigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LogoMark size={28} />
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.15rem', color: '#fff' }}>StackRank<span style={{ color: '#30a1ac' }}>365</span></span>
        </button>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>© 2026 StackRank365. Built for the Microsoft community.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => onNavigate('survey')} style={linkStyle}>Feedback</button>
          <button onClick={() => onNavigate('privacy')} style={linkStyle}>Privacy</button>
        </div>
      </div>
    </footer>
  );
}

function AppInner() {
  const { user, loading } = useApp();
  const [page, setPage] = useState('landing');
  const [profileUsername, setProfileUsername] = useState(null);
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    const handleHash = () => {
      const _params = new URLSearchParams(window.location.search);
      const qPage = _params.get('page');
      const qUser = _params.get('u');
      if (qPage) { setPage(qPage); if (qUser) setProfileUsername(qUser); return; }
      const hash = window.location.hash.replace('#', '');
      const search = window.location.search;
      const fullHash = window.location.hash;

      if (fullHash.includes('access_token=') || fullHash.includes('refresh_token=')) {
        setPage('dashboard');
        return;
      }
      if (search.includes('type=recovery') || fullHash.includes('type=recovery')) {
        setPage('reset-password');
        return;
      }
      if (hash.startsWith('validate')) {
        const params = new URLSearchParams(fullHash.replace(/^#validate\??/, ''));
        setPageData({ token: params.get('token') });
        setPage('validate');
        return;
      }
      if (['signup','signin','dashboard','early-access','reset-password'].includes(hash)) {
        setPage(hash === 'early-access' ? 'signup' : hash);
        window.history.replaceState({}, '', '/');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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
      case 'for-recruiters':  return <Landing onNavigate={navigate} />;
      case 'dashboard':          return (loading ? (
        <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1.25rem',background:'var(--bg)'}}>
          <div style={{width:44,height:44,border:'3px solid rgba(0,0,0,0.08)',borderTopColor:'var(--blue)',borderRadius:'50%',animation:'_spin 0.8s linear infinite'}}/>
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
      case 'admin-fraud':          return <AdminFraud onNavigate={navigate} />;
      case 'pricing':              return <Pricing onNavigate={navigate} />;
      case 'privacy':              return <PrivacyPolicy onNavigate={navigate} />;
      case 'survey':               return <Survey onNavigate={navigate} />;
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
