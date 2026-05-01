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

/* TWHO-style footer using .footer__main scaffold (rules in src/styles/twho.css). */
function Footer({ onNavigate }) {
  return (
    <footer style={{ marginTop: 'auto' }}>
      <div className="footer__main">
        <div className="footer__inner-grid u-grid-standard u-content-width" style={{ paddingBottom: '2rem' }}>
          <div className="footer__links-group footer__links-group--1">
            <h3 className="footer__links-group-heading">Platform</h3>
            <ul className="footer__links-list">
              {[['how-it-works','How it works'],['scoring','Scoring'],['leaderboard','Leaderboard'],['pricing','Pricing']].map(([id, label]) => (
                <li key={id}><a href="#" className="footer__link" onClick={(e) => { e.preventDefault(); onNavigate(id); }}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer__links-group footer__links-group--2">
            <h3 className="footer__links-group-heading">Company</h3>
            <ul className="footer__links-list">
              {[['about','About'],['survey','Feedback'],['privacy','Privacy']].map(([id, label]) => (
                <li key={id}><a href="#" className="footer__link" onClick={(e) => { e.preventDefault(); onNavigate(id); }}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer__links-group footer__links-group--3">
            <h3 className="footer__links-group-heading">For recruiters</h3>
            <ul className="footer__links-list">
              {[['for-recruiters','Recruiter info'],['recruiter-dashboard','Dashboard'],['jobs','Jobs board']].map(([id, label]) => (
                <li key={id}><a href="#" className="footer__link" onClick={(e) => { e.preventDefault(); onNavigate(id); }}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer__logos">
            <button onClick={() => onNavigate('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LogoMark size={40} />
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>StackRank<span style={{ color: '#30a1ac' }}>365</span></span>
            </button>
          </div>
        </div>
      </div>
      <div className="footer__secondary">
        <div className="u-grid-standard u-content-width">
          <ul className="footer__bottom-links-list" style={{ alignItems: 'center' }}>
            <li style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>© 2026 StackRank365. Built for the Microsoft community.</li>
            <li><a href="#" className="footer__link" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} style={{ fontSize: '0.9rem' }}>Privacy</a></li>
            <li><a href="#" className="footer__link" onClick={(e) => { e.preventDefault(); onNavigate('about'); }} style={{ fontSize: '0.9rem' }}>Contact</a></li>
          </ul>
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
