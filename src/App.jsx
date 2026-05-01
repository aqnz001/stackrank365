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
import Survey from './pages/Survey';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import MyApplications from './pages/MyApplications';
import MyJobs from './pages/MyJobs';

function Footer({ onNavigate }) {
  const linkStyle = { background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '0.95rem', padding: '0.35rem 0', textAlign: 'left', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' };
  const headingStyle = { fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem' };
  return (
    <footer style={{ background: '#13284b', marginTop: 'auto', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 320, height: 220, opacity: 0.1, background: 'repeating-linear-gradient(45deg, transparent, transparent 22px, #30a1ac 22px, #30a1ac 23px)', pointerEvents: 'none' }} />

      <div style={{ padding: '4rem 0 2rem', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="footer-grid-twho" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <button onClick={() => onNavigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <LogoMark size={40} />
                <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>
                  StackRank<span style={{ color: '#30a1ac' }}>365</span>
                </span>
              </button>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 320, margin: 0 }}>
                The verified talent ranking community for Microsoft Dynamics 365, Power Platform, Copilot Studio, and Azure OpenAI professionals.
              </p>
            </div>
            <div>
              <h3 style={headingStyle}>Platform</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[['how-it-works','How it works'],['scoring','Scoring'],['leaderboard','Leaderboard'],['pricing','Pricing']].map(([id, label]) => (
                  <button key={id} onClick={() => onNavigate(id)} style={linkStyle}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 style={headingStyle}>Company</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[['about','About'],['survey','Feedback'],['privacy','Privacy']].map(([id, label]) => (
                  <button key={id} onClick={() => onNavigate(id)} style={linkStyle}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 style={headingStyle}>For recruiters</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[['for-recruiters','Recruiter info'],['recruiter-dashboard','Recruiter dashboard'],['jobs','Jobs board']].map(([id, label]) => (
                  <button key={id} onClick={() => onNavigate(id)} style={linkStyle}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '1.5rem 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>© 2026 StackRank365. Built for the Microsoft community.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button onClick={() => onNavigate('privacy')} style={{ ...linkStyle, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', padding: 0 }}>Privacy</button>
            <button onClick={() => onNavigate('about')} style={{ ...linkStyle, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', padding: 0 }}>Contact</button>
          </div>
        </div>
      </div>

      <style>{`@media(max-width:768px){ .footer-grid-twho { grid-template-columns: 1fr !important; gap: 2rem !important; } }`}</style>
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
      case 'for-recruiters':  return <ForRecruiters onNavigate={navigate} />;
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
      case 'recruiter-dashboard':  return <RecruiterDashboard onNavigate={navigate} />;
      case 'privacy':              return <PrivacyPolicy onNavigate={navigate} />;
      case 'survey':               return <Survey onNavigate={navigate} />;
      case 'jobs':                 return <Jobs onNavigate={navigate} />;
      case 'post-job':             return <PostJob onNavigate={navigate} />;
      case 'my-applications':      return <MyApplications onNavigate={navigate} />;
      case 'my-jobs':              return <MyJobs onNavigate={navigate} />;
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
