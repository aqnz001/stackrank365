import { useState, useMemo, useEffect } from 'react';
import { SAMPLE_USERS, getRankTier, RANK_TIERS, SPECIALIZATIONS } from '../data/data';
import { useApp } from '../context/AppContext';
import { avatarInitials } from '../lib/displayName';
import PageHero from '../components/PageHero';
import TWHOSprite from '../components/TWHOSprite';

/* TWHO-styled rank pill — replaces old badge-* classes */
function RankPill({ tier }) {
  const tierStyles = {
    'Explorer':            { bg:'#f3f4f6',                   color:'var(--color-charcoal)' },
    'Practitioner':        { bg:'var(--color-primary-5)',    color:'var(--color-primary-100)' },
    'Specialist':          { bg:'#e4eef5',                   color:'var(--color-secondary-100)' },
    'Architect':           { bg:'#dff1f2',                   color:'var(--color-accent-110)' },
    'Principal Architect': { bg:'#fff7d6',                   color:'#9b6800' },
  };
  const s = tierStyles[tier.name] || tierStyles['Explorer'];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'0.3rem', fontSize:'0.78rem', padding:'0.25rem 0.6rem', background:s.bg, color:s.color, borderRadius:999, fontWeight:600, whiteSpace:'nowrap' }}>
      <span>{tier.icon}</span>{tier.name}
    </span>
  );
}

async function getSupabase() {
  try {
    const mod = await import('../lib/supabase.js');
    if (mod.SUPABASE_URL === 'YOUR_SUPABASE_URL') return null;
    return mod.supabase;
  } catch { return null; }
}

// Detect user's country from browser locale as default
function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    // Map common timezones to countries
    const tzMap = {
      'Pacific/Auckland': 'New Zealand', 'Australia/Sydney': 'Australia',
      'Australia/Melbourne': 'Australia', 'Europe/London': 'United Kingdom',
      'America/New_York': 'United States', 'America/Los_Angeles': 'United States',
      'America/Chicago': 'United States', 'Europe/Paris': 'France',
      'Europe/Berlin': 'Germany', 'Asia/Dubai': 'UAE',
      'Asia/Kolkata': 'India', 'Asia/Singapore': 'Singapore',
      'America/Toronto': 'Canada', 'Europe/Amsterdam': 'Netherlands',
    };
    return tzMap[tz] || 'Global';
  } catch { return 'Global'; }
}

function RankBadge({ score }) {
  const tier = getRankTier(score);
  return <RankPill tier={tier} />;
}

const MEDAL = ['🥇', '🥈', '🥉'];

// Get unique countries from user list
function getCountries(users) {
  const countries = [...new Set(users.map(u => u.location?.split(',').pop()?.trim()).filter(Boolean))].sort();
  return countries;
}

export default function Leaderboard({ onNavigate }) {
  const { user } = useApp();
  const [filterSpec, setFilterSpec]   = useState('all');
  const [filterRank, setFilterRank]   = useState('all');
  const [filterScope, setFilterScope] = useState('global'); // 'global' | 'country'
  const [filterCountry, setFilterCountry] = useState('');
  const [search, setSearch] = useState('');
  const [liveUsers, setLiveUsers] = useState(null);
  const [usingLive, setUsingLive] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);

  // Detect user's country on mount
  useEffect(() => {
    const country = detectCountry();
    setFilterCountry(country === 'Global' ? '' : country);
  }, []);

  // Load real users from Supabase — only for signed-in users
  useEffect(() => {
    if (!user) return;
    (async () => {
      const sb = await getSupabase();
      if (!sb) return;
      try {
        const { data, error } = await sb
          .from('leaderboard').select('*')
          .order('score', { ascending: false }).limit(200);
        if (!error && data && data.length > 0) {
          setLoadedAt(new Date());
          const normalised = data.map(u => ({
            id: u.id,
            name: u.name || 'Anonymous',
            username: u.username || u.id,
            headline: u.headline || '',
            location: u.location || '',
            specialization: u.specialization || 'Dynamics 365',
            score: Number(u.score) || 0,
            certifications: Array(Number(u.cert_count) || 0).fill({}),
            projects: Array(Number(u.project_count) || 0).fill({}),
            isMVP: u.is_mvp,
            foundingMember: u.founding_member,
          }));
          setLiveUsers(normalised);
          setUsingLive(true);
        } else {
          setLiveUsers([]);
        }
      } catch { setLiveUsers([]); }
    })();
  }, [user]);

  const allUsers = (usingLive && liveUsers?.length > 0) ? liveUsers : SAMPLE_USERS;

  // Get available countries from current user set
  const countries = useMemo(() => getCountries(allUsers), [allUsers]);

  // Filter users — country scope applied first
  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      // Country scope filter
      if (filterScope === 'country' && filterCountry) {
        const userCountry = u.location?.split(',').pop()?.trim() || '';
        if (!userCountry.toLowerCase().includes(filterCountry.toLowerCase())) return false;
      }
      if (filterSpec !== 'all' && u.specialization !== filterSpec) return false;
      if (filterRank !== 'all') {
        const tier = getRankTier(u.score);
        if (tier.name !== filterRank) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) &&
            !(u.headline || '').toLowerCase().includes(q) &&
            !(u.location || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allUsers, filterScope, filterCountry, filterSpec, filterRank, search]);

  const stats = useMemo(() => {
    const src = filterScope === 'country' && filterCountry ? filtered : allUsers;
    const total = src.length;
    const avg = total ? Math.round(src.reduce((s, u) => s + u.score, 0) / total) : 0;
    const top = src[0]?.score || 0;
    const specs = new Set(src.map(u => u.specialization)).size;
    return { total, avg, top, specs };
  }, [allUsers, filtered, filterScope, filterCountry]);

  // Find logged-in user's rank in current view
  const myRank = useMemo(() => {
    if (!user) return null;
    const idx = filtered.findIndex(u => u.id === user.id || u.username === user.username);
    return idx >= 0 ? idx + 1 : null;
  }, [filtered, user]);

  const isFiltered = filterSpec !== 'all' || filterRank !== 'all' || !!search;

  // Podium: top 1–3, table: rest (with graceful handling for < 3)
  const podiumUsers = !isFiltered ? filtered.slice(0, Math.min(3, filtered.length)) : [];
  const tableUsers  = !isFiltered ? filtered.slice(podiumUsers.length) : filtered;

  const scopeLabel = filterScope === 'country' && filterCountry
    ? filterCountry : 'Global';

  // Inline styles reused
  const card    = { background:'#fff', border:'1px solid var(--color-primary-25)', borderRadius:8 };
  const inputSt = { padding:'0.55rem 0.85rem', fontSize:'0.95rem', fontFamily:'inherit', background:'#fff', color:'var(--color-secondary-100)', border:'1px solid var(--color-primary-25)', borderRadius:6, outline:'none' };

  return (
    <div>
      <TWHOSprite />
      <PageHero
        eyebrow="Live rankings"
        title={`${scopeLabel} Leaderboard`}
        subtitle="Microsoft ecosystem professionals ranked by verified Stack Points."
      >
        <div style={{ display:'inline-flex', gap:'0.85rem', alignItems:'center', flexWrap:'wrap', justifyContent:'center', fontSize:'0.85rem', color:'rgba(255,255,255,0.78)' }}>
          {loadedAt && (
            <span>Updated {Math.round((Date.now()-loadedAt.getTime())/60000) < 1 ? 'just now' : Math.round((Date.now()-loadedAt.getTime())/60000)+' min ago'}</span>
          )}
          {usingLive && (
            <span style={{ padding:'0.2rem 0.65rem', background:'var(--color-accent-110)', color:'#fff', borderRadius:999, fontWeight:700, fontSize:'0.78rem' }}>
              ✓ Live · {liveUsers.length} {liveUsers.length === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>
      </PageHero>

      <section style={{ background:'#fff', padding:'3rem 0' }}>
        <div className="u-content-width">

          {/* Scope toggle — Global vs Country */}
          <div style={{ display:'flex', gap:'0.6rem', marginBottom:'1.5rem', flexWrap:'wrap', alignItems:'center' }}>
            {['global','country'].map(scope => {
              const active = filterScope === scope;
              return (
                <button key={scope}
                  onClick={() => setFilterScope(scope)}
                  style={{ padding:'0.5rem 1.1rem', borderRadius:999, fontWeight:600, fontSize:'0.9rem', cursor:'pointer', fontFamily:'inherit', border:`1.5px solid ${active ? 'var(--color-secondary-100)' : 'var(--color-primary-25)'}`, background: active ? 'var(--color-secondary-100)' : '#fff', color: active ? '#fff' : 'var(--color-secondary-100)' }}>
                  {scope === 'global' ? '🌍 Global' : `🏳️ ${filterCountry || 'Country'}`}
                </button>
              );
            })}
            {filterScope === 'country' && (
              <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                style={{ ...inputSt, minWidth:180 }}>
                <option value="">All countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            {myRank && (
              <div style={{ marginLeft:'auto', padding:'0.4rem 0.95rem', background:'var(--color-primary-5)', border:'1px solid var(--color-primary-25)', borderRadius:999, fontSize:'0.88rem', color:'var(--color-primary-100)', fontWeight:700 }}>
                You are #{myRank} {filterScope === 'country' && filterCountry ? `in ${filterCountry}` : 'globally'}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'1.75rem' }} className="lb-stats-grid">
            {[
              { label: filterScope === 'country' && filterCountry ? `In ${filterCountry}` : 'Professionals', value: stats.total.toLocaleString() },
              { label: 'Avg score',      value: stats.avg.toLocaleString() },
              { label: 'Top score',      value: stats.top.toLocaleString() },
              { label: 'Specializations',value: stats.specs },
            ].map(s => (
              <div key={s.label} style={{ ...card, textAlign:'center', padding:'1.25rem 1rem' }}>
                <div style={{ fontWeight:700, fontSize:'1.75rem', color:'var(--color-secondary-100)', lineHeight:1.1 }}>{s.value}</div>
                <div style={{ fontSize:'0.85rem', color:'var(--color-charcoal)', marginTop:'0.4rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <style>{`@media(max-width: 768px){ .lb-stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>

          {/* Filters */}
          <div style={{ ...card, padding:'1rem 1.25rem', marginBottom:'1.5rem', display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
            <input placeholder="Search name, role or location…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...inputSt, flex:1, minWidth:220, maxWidth:320 }} />
            <select value={filterSpec} onChange={e => setFilterSpec(e.target.value)} style={{ ...inputSt, minWidth:170 }}>
              <option value="all">All specializations</option>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterRank} onChange={e => setFilterRank(e.target.value)} style={{ ...inputSt, minWidth:170 }}>
              <option value="all">All ranks</option>
              {RANK_TIERS.map(t => <option key={t.name} value={t.name}>{t.icon} {t.name}</option>)}
            </select>
            {isFiltered && (
              <button onClick={() => { setFilterSpec('all'); setFilterRank('all'); setSearch(''); }}
                style={{ padding:'0.5rem 0.95rem', borderRadius:999, background:'transparent', color:'var(--color-charcoal)', border:'1px solid var(--color-primary-25)', cursor:'pointer', fontFamily:'inherit', fontSize:'0.88rem', fontWeight:600 }}>
                Clear ✕
              </button>
            )}
            <div style={{ marginLeft:'auto', fontSize:'0.88rem', color:'var(--color-charcoal)' }}>
              {filtered.length} of {allUsers.length} professionals
            </div>
          </div>

          {/* Rankings card */}
          <div style={{ ...card, padding:0, overflow:'hidden' }}>

            {/* Podium */}
            {podiumUsers.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:`repeat(${podiumUsers.length}, 1fr)`, borderBottom:'1px solid var(--color-pale-charcoal)' }}>
                {podiumUsers.map((u, i) => {
                  const isMe = user && (u.id === user.id || u.username === user.username);
                  const isGold = i === 0;
                  return (
                    <div key={u.id}
                      onClick={() => onNavigate('profile', { userData: u })}
                      style={{
                        padding:'1.5rem',
                        display:'flex', flexDirection:'column', gap:'0.65rem',
                        cursor:'pointer', transition:'background 0.15s',
                        borderRight: i < podiumUsers.length - 1 ? '1px solid var(--color-pale-charcoal)' : 'none',
                        background: isMe ? 'var(--color-primary-5)' : (isGold ? 'linear-gradient(180deg, #fff7d6, #fff)' : 'transparent'),
                      }}
                      onMouseEnter={e => { if (!isMe && !isGold) e.currentTarget.style.background = 'var(--color-primary-5)'; }}
                      onMouseLeave={e => { if (!isMe && !isGold) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <span style={{ fontSize:'1.7rem', flexShrink:0 }}>{MEDAL[i] || `#${i+1}`}</span>
                        <div style={{
                          width:48, height:48, borderRadius:'50%', flexShrink:0,
                          background: isGold ? '#13294b' : 'var(--color-secondary-100)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:700, fontSize:'0.95rem', color:'#fff',
                          border: isGold ? '2px solid #ffc83c' : 'none',
                        }}>{avatarInitials(u.name)}</div>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--color-secondary-100)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {u.name}{isMe && <span style={{ color:'var(--color-primary-100)', fontSize:'0.78rem', marginLeft:'0.4rem' }}>(you)</span>}
                          </div>
                          <div style={{ fontSize:'0.85rem', color:'var(--color-charcoal)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {u.location}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize:'0.9rem', color:'var(--color-charcoal)', lineHeight:1.4 }}>{u.headline}</div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'0.2rem' }}>
                        <RankBadge score={u.score} />
                        <span style={{ fontWeight:700, fontSize:'1.25rem', color: isGold ? '#9b6800' : 'var(--color-primary-100)' }}>
                          {u.score.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize:'0.82rem', color:'var(--color-primary-100)', fontWeight:600 }}>View profile →</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Table */}
            {tableUsers.length > 0 && (
              <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'inherit' }}>
                <thead>
                  <tr style={{ background:'var(--color-primary-5)' }}>
                    {['#','Professional','Location','Rank','Certs','Score'].map((h, i) => (
                      <th key={h} style={{
                        textAlign: i === 5 ? 'right' : 'left',
                        padding:'0.85rem 1rem',
                        paddingLeft: i === 0 ? '1.25rem' : '1rem',
                        paddingRight: i === 5 ? '1.25rem' : '1rem',
                        fontSize:'0.78rem', fontWeight:700,
                        color:'var(--color-secondary-100)',
                        textTransform:'uppercase', letterSpacing:'0.06em',
                        borderBottom:'1px solid var(--color-pale-charcoal)',
                        width: i === 0 ? 56 : undefined,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableUsers.map((u, i) => {
                    const rank = isFiltered ? i + 1 : podiumUsers.length + i + 1;
                    const isMe = user && (u.id === user.id || u.username === user.username);
                    return (
                      <tr key={u.id}
                        onClick={() => onNavigate('profile', { userData: u })}
                        style={{ cursor:'pointer', background: isMe ? 'var(--color-primary-5)' : 'transparent', transition:'background 0.15s' }}
                        onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = '#fafbfc'; }}
                        onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ paddingLeft:'1.25rem', padding:'0.95rem 1rem 0.95rem 1.25rem', borderBottom:'1px solid var(--color-pale-charcoal)', fontSize:'0.95rem', color:'var(--color-charcoal)', fontWeight:600 }}>{rank}</td>
                        <td style={{ padding:'0.95rem 1rem', borderBottom:'1px solid var(--color-pale-charcoal)' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
                            <div style={{ width:38, height:38, borderRadius:'50%', flexShrink:0, background:'var(--color-secondary-100)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, color:'#fff', border: isMe ? '2px solid var(--color-primary-100)' : 'none' }}>
                              {avatarInitials(u.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:'1rem', color:'var(--color-secondary-100)' }}>
                                {u.name}
                                {isMe && <span style={{ color:'var(--color-primary-100)', fontSize:'0.78rem', marginLeft:'0.4rem' }}>(you)</span>}
                                {u.isMVP && <span style={{ display:'inline-block', marginLeft:'0.5rem', fontSize:'0.7rem', padding:'0.15rem 0.5rem', background:'#fff7d6', color:'#9b6800', borderRadius:999, fontWeight:700 }}>MVP</span>}
                                {u.foundingMember && <span style={{ display:'inline-block', marginLeft:'0.4rem', fontSize:'0.7rem', padding:'0.15rem 0.5rem', background:'#dff1f2', color:'var(--color-accent-110)', borderRadius:999, fontWeight:700 }}>Founding</span>}
                              </div>
                              <div style={{ fontSize:'0.85rem', color:'var(--color-charcoal)' }}>{u.headline}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'0.95rem 1rem', borderBottom:'1px solid var(--color-pale-charcoal)', fontSize:'0.9rem', color:'var(--color-charcoal)' }}>{u.location}</td>
                        <td style={{ padding:'0.95rem 1rem', borderBottom:'1px solid var(--color-pale-charcoal)' }}><RankBadge score={u.score} /></td>
                        <td style={{ padding:'0.95rem 1rem', borderBottom:'1px solid var(--color-pale-charcoal)', fontSize:'0.95rem', color:'var(--color-secondary-100)' }}>{(u.certifications || []).length}</td>
                        <td style={{ padding:'0.95rem 1.25rem 0.95rem 1rem', borderBottom:'1px solid var(--color-pale-charcoal)', textAlign:'right' }}>
                          <span style={{ fontWeight:700, fontSize:'1rem', color: isMe ? '#9b6800' : 'var(--color-primary-100)' }}>
                            {u.score.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {filtered.length === 0 && (
              <div style={{ padding:'3.5rem', textAlign:'center', color:'var(--color-charcoal)' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🔍</div>
                <div style={{ fontSize:'1rem' }}>
                  {filterScope === 'country' && filterCountry
                    ? `No professionals found in ${filterCountry} yet. Be the first!`
                    : 'No professionals match your filters.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ background:'var(--color-secondary-100)', padding:'3.5rem 0', color:'#fff' }}>
        <div className="u-content-width" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem' }}>
          <div style={{ flex:'1 1 360px', minWidth:0 }}>
            <h2 style={{ color:'#fff', marginTop:0, marginBottom:'0.5rem', fontSize:'1.6rem' }}>Where would you rank?</h2>
            <p style={{ color:'rgba(255,255,255,0.86)', fontSize:'1rem', margin:0, lineHeight:1.5 }}>
              {usingLive ? 'Sign up to claim your place on the live leaderboard.' : 'Sign in to see the live leaderboard. StackRank365 is in early access — join now to be a Founding Member.'}
            </p>
          </div>
          <button onClick={() => onNavigate(usingLive ? 'signup' : 'landing')}
            style={{ padding:'0.85rem 1.6rem', background:'#fff', color:'var(--color-secondary-100)', borderRadius:4, fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'1rem' }}>
            🚀 {usingLive ? 'Claim Your Rank' : 'Join the Waitlist'}
          </button>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .lb-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
