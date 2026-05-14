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
  return (
    <footer style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '3rem 0 1.75rem', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <button onClick={() => onNavigate('landing')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <LogoMark size={34} />
              <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text)' }}>
                StackRank<span style={{ color: 'var(--blue)' }}>365</span>
              </span>
            </button>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 260 }}>
              The verified talent ranking community for Microsoft Dynamics 365, Power Platform, Copilot Studio, and Azure OpenAI professionals.
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <button className="btn btn-gold btn-sm" onClick={() => onNavigate('landing')}>
                Join the Waitlist
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted2)', marginBottom: '0.9rem' }}>Platform</div>
            {[['how-it-works','How It Works'],['scoring','Scoring'],['leaderboard','Leaderboard']].map(([id, label]) => (
              <div key={id} style={{ marginBottom: '0.5rem' }}>
                <button onClick={() => onNavigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.88rem', padding: 0, fontFamily: 'Outfit', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>{label}</button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted2)', marginBottom: '0.9rem' }}>Company</div>
            {[['about','About'],['survey','Feedback']].map(([id, label]) => (
              <div key={id} style={{ marginBottom: '0.5rem' }}>
                <button onClick={() => onNavigate(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.88rem', padding: 0, fontFamily: 'Outfit', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--text)'} onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>{label}</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>© 2026 StackRank365. All rights reserved.</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Built for the Microsoft community</div>
        </div>
      </div>
      <style>{`@media(max-width:768px){ footer .container > div:first-child { grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}

// URL ↔ page-state mapping. New pages need an entry in both maps.
const PATH_TO_PAGE = {
  '/':                    'landing',
  '/leaderboard':         'leaderboard',
  '/how-it-works':        'how-it-works',
  '/scoring':             'scoring',
  '/about':               'about',
  '/for-recruiters':      'for-recruiters',
  '/dashboard':           'dashboard',
  '/signup':              'signup',
  '/signin':              'signin',
  '/reset-password':      'reset-password',
  '/validate':            'validate',
  '/pricing':             'pricing',
  '/privacy':             'privacy',
  '/feedback':            'survey',
  '/survey':              'survey',
  '/jobs':                'jobs',
  '/post-job':            'post-job',
  '/my-applications':     'my-applications',
  '/my-jobs':             'my-jobs',
  '/recruiter-dashboard': 'recruiter-dashboard',
  '/admin-fraud':         'admin-fraud',
  '/sr365-sitemap':       'sr365-sitemap',
  '/sr365-admin-tools':   'sr365-admin-tools',
};
const PAGE_TO_PATH = {
  landing: '/', leaderboard: '/leaderboard', 'how-it-works': '/how-it-works',
  scoring: '/scoring', about: '/about', 'for-recruiters': '/for-recruiters',
  dashboard: '/dashboard', signup: '/signup', signin: '/signin',
  'reset-password': '/reset-password', validate: '/validate',
  pricing: '/pricing', privacy: '/privacy', survey: '/feedback',
  jobs: '/jobs', 'post-job': '/post-job',
  'my-applications': '/my-applications', 'my-jobs': '/my-jobs',
  'recruiter-dashboard': '/recruiter-dashboard',
  'admin-fraud': '/admin-fraud',
  'sr365-sitemap': '/sr365-sitemap',
  'sr365-admin-tools': '/sr365-admin-tools',
};

function AppInner() {
  const { user, loading } = useApp();
  const [page, setPage] = useState('landing');
  const [profileUsername, setProfileUsername] = useState(null);
  const [pageData, setPageData] = useState(null);

  // Build the URL for a (page, data) pair. Profile is /profile/:username.
  const pathForPage = (p, data) => {
    if (p === 'profile') {
      const username = data?.userData?.username || profileUsername;
      return username ? `/profile/${encodeURIComponent(username)}` : '/profile';
    }
    return PAGE_TO_PATH[p] || '/';
  };

  // Parse the current URL into React state. Used on initial mount + back/forward.
  // Auth-callback flows take precedence over path routing because the Supabase
  // SDK and validation tokens need their query/hash payloads intact.
  const resolveLocation = () => {
    const fullHash = window.location.hash;
    const search   = window.location.search;
    const params   = new URLSearchParams(search);

    // Supabase OAuth / magic-link callback — token in hash fragment.
    // Must NOT alter the URL: the Supabase SDK reads the hash to establish session.
    if (fullHash.includes('access_token=') || fullHash.includes('refresh_token=')) {
      setPage('dashboard');
      return;
    }
    // Supabase password recovery
    if (search.includes('type=recovery') || fullHash.includes('type=recovery')) {
      setPage('reset-password');
      return;
    }
    // Validation link: /#validate?token=ABC123  (legacy share format)
    if (fullHash.startsWith('#validate')) {
      const hp = new URLSearchParams(fullHash.replace(/^#validate\??/, ''));
      setPageData({ token: hp.get('token') });
      setPage('validate');
      return;
    }
    // Legacy query-string routing: ?page=xxx (older share links)
    const qPage = params.get('page');
    if (qPage) {
      setPage(qPage);
      const qUser = params.get('u');
      if (qUser) setProfileUsername(qUser);
      return;
    }
    // Legacy hash shortcuts (#signup etc) — rewrite to clean path.
    const hash = fullHash.replace('#', '');
    if (['signup','signin','dashboard','early-access','reset-password'].includes(hash)) {
      const next = hash === 'early-access' ? 'signup' : hash;
      setPage(next);
      window.history.replaceState({}, '', PAGE_TO_PATH[next] || '/');
      return;
    }
    // Path-based routing — the normal case.
    const rawPath = window.location.pathname.replace(/\/+$/, '') || '/';
    const profileMatch = rawPath.match(/^\/profile\/(.+)$/);
    if (profileMatch) {
      setProfileUsername(decodeURIComponent(profileMatch[1]));
      setPage('profile');
      return;
    }
    if (PATH_TO_PAGE[rawPath]) {
      setPage(PATH_TO_PAGE[rawPath]);
      return;
    }
    // Unknown path — Vercel's catch-all served the SPA, so just show landing.
    setPage('landing');
  };

  useEffect(() => {
    resolveLocation();
    const onPop = () => resolveLocation();
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop); // legacy share links
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to dashboard if already signed in and on auth pages.
  // Replace (not push) so back-button doesn't bounce back to /signin.
  useEffect(() => {
    if (user && (page === 'signup' || page === 'signin')) {
      navigate('dashboard', null, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  const navigate = (newPage, data = null, { replace = false } = {}) => {
    setPage(newPage);
    setPageData(data);
    if (data?.userData?.username) setProfileUsername(data.userData.username);
    const path = pathForPage(newPage, data);
    if (window.location.pathname !== path) {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method]({ page: newPage }, '', path);
    }
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
          <div style={{width:44,height:44,border:'3px solid rgba(255,255,255,0.08)',borderTopColor:'var(--blue)',borderRadius:'50%',animation:'_spin 0.8s linear infinite'}}/>
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
