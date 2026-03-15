import { createContext, useContext, useState, useEffect } from 'react';
import { RANK_TIERS, POINT_VALUES } from '../data/data';

let supabase = null;
async function getSupabase() {
  if (supabase) return supabase;
  try {
    const mod = await import('../lib/supabase.js');
    if (mod.SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
    supabase = mod.supabase;
    return supabase;
  } catch { return null; }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProfile = async (sb, userId, email) => {
    const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
    const { data: certs } = await sb.from('certifications').select('*').eq('user_id', userId).order('created_at');
    const { data: projects } = await sb.from('projects').select('*').eq('user_id', userId).order('created_at');

    // If profile exists, use it; otherwise create default profile from email
    const profileData = profile || {
      name: email?.split('@')[0] || 'User',
      username: email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, '.') || 'user',
      headline: '',
      bio: '',
      location: '',
      specialism: 'Dynamics 365',
      years_exp: 0,
    };

    setUserState({
      id: userId,
      name: profileData.name,
      email,
      username: profileData.username,
      headline: profileData.headline || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      specialism: profileData.specialism || 'Dynamics 365',
      yearsExp: profileData.years_exp || 0,
      isMVP: profileData.is_mvp,
      foundingMember: profileData.founding_member,
      msAccountId: profileData.ms_account_id,
      certifications: (certs || []).map(c => ({
        code: c.code, name: c.name, tier: c.tier, specialism: c.specialism,
        points: c.points, issueDate: c.issue_date,
        verified: c.verified, verifiedVia: c.verified_via, verifyUrl: c.verify_url,
        scarcityMultiplier: c.scarcity_multiplier, dbId: c.id,
      })),
      projects: (projects || []).map(p => ({
        id: p.id, title: p.title, role: p.role, description: p.description,
        industry: p.industry, privacy_mode: p.privacy_mode,
        enterprise: p.enterprise, validated: p.validated, points: p.points,
      })),
    });
  };

  useEffect(() => {
    let sub;
    (async () => {
      const sb = await getSupabase();
      if (sb) {
        // 1. Immediately grab any existing session (covers page refresh + OAuth return)
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          setAuthUser(session.user);
          await loadProfile(sb, session.user.id, session.user.email);
        }
        setLoading(false);

        // 2. Also listen for future auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
          setAuthUser(session?.user ?? null);
          if (session?.user) {
            await loadProfile(sb, session.user.id, session.user.email);
          } else {
            setUserState(null);
          }
        });
        sub = subscription;
      } else {
        // localStorage fallback (dev without Supabase keys)
        try {
          const stored = localStorage.getItem('sr365_user');
          if (stored) setUserState(JSON.parse(stored));
        } catch {}
        setLoading(false);
      }
    })();
    return () => sub?.unsubscribe();
  }, []);

  const saveUser = async (u) => {
    setUserState(u);
    const sb = await getSupabase();
    if (!sb || !u) {
      if (u) localStorage.setItem('sr365_user', JSON.stringify(u));
      else localStorage.removeItem('sr365_user');
    } else if (u && authUser) {
      await sb.from('profiles').update({
        name: u.name, headline: u.headline, bio: u.bio,
        location: u.location, specialism: u.specialism, years_exp: u.yearsExp,
        updated_at: new Date().toISOString(),
      }).eq('id', authUser.id);
    }
  };

  const calcScore = (u = user) => {
    if (!u) return 0;
    let score = u.foundingMember ? 500 : 0;
    (u.certifications || []).forEach(c => {
      if (c.verified !== false) {
        score += Math.round((c.points || 500) * (c.scarcityMultiplier ? 1.25 : 1));
      }
    });
    (u.projects || []).forEach(p => { score += p.points || 800; });
    if (u.bio) score += 150;
    return score;
  };

  const getTierInfo = (u = user) => {
    const score = calcScore(u);
    const rank = RANK_TIERS.find(t => score >= t.minScore && score <= t.maxScore) || RANK_TIERS[0];
    const nextRank = RANK_TIERS.find(t => t.minScore > score) || null;
    return { rank, nextRank, pointsToNext: nextRank ? nextRank.minScore - score : 0, score };
  };

  return (
    <AppContext.Provider value={{ user, setUser: saveUser, authUser, showToast, calcScore, getTierInfo, toast, loading }}>
      {children}
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
