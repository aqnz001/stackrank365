import { useState, useMemo, useEffect } from 'react';
import { SAMPLE_USERS, getRankTier, RANK_TIERS, SPECIALISMS } from '../data/data';
import { useApp } from '../context/AppContext';

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
  return (
    <span className={`badge ${tier.colorClass}`} style={{ fontSize: '0.72rem' }}>
      {tier.icon} {tier.name}
    </span>
  );
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

  // Detect user's country on mount
  useEffect(() => {
    const country = detectCountry();
    setFilterCountry(country === 'Global' ? '' : country);
  }, []);

  // Load real users from Supabase — only for signed-in users
  useEffect(() => {
    (async () => {
      if (!user) return; // guests see demo data only
      const sb = await getSupabase();
      if (!sb) return;
      try {
        const { data, error } = await sb
          .from('leaderboard').select('*')
          .order('score', { ascending: false }).limit(200);
        if (!error && data && data.length > 0) {
          const normalised = data.map(u => ({
            id: u.id,
            name: u.name || 'Anonymous',
            username: u.username || u.id,
            headline: u.headline || '',
            location: u.location || '',
            specialism: u.specialism || 'Dynamics 365',
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
      if (filterSpec !== 'all' && u.specialism !== filterSpec) return false;
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
    const specs = new Set(src.map(u => u.specialism)).size;
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

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div className="badge badge-gold">🏆 Live Rankings</div>
            {usingLive && (
              <div className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                ✓ Live · {liveUsers.length} {liveUsers.length === 1 ? 'member' : 'members'}
              </div>
            )}
            {!usingLive && liveUsers !== null && (
              <div className="badge badge-muted" style={{ fontSize: '0.68rem' }}>Sample data — sign up to appear here</div>
            )}
          </div>
          <h1 style={{ marginBottom: '0.4rem' }}>
            <span className="gradient-text-blue">{scopeLabel}</span> Leaderboard
          </h1>
          <p style={{ color: 'var(--muted2)', fontSize: '1rem', maxWidth: 560 }}>
            Microsoft ecosystem professionals ranked by verified Stack Points.
          </p>
        </div>

        {/* Scope toggle — Global vs Country */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {['global','country'].map(scope => (
            <button key={scope}
              className={`btn btn-sm ${filterScope === scope ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilterScope(scope)}>
              {scope === 'global' ? '🌍 Global' : `🏳️ ${filterCountry || 'Country'}`}
            </button>
          ))}
          {filterScope === 'country' && (
            <select className="input" value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              style={{ width: 'auto', minWidth: 160 }}>
              <option value="">All countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {/* My rank indicator */}
          {myRank && (
            <div style={{ marginLeft: 'auto', padding: '0.35rem 0.85rem', background: 'var(--blue-dim)', border: '1px solid var(--border-blue)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--blue)', fontWeight: 600 }}>
              You are #{myRank} {filterScope === 'country' && filterCountry ? `in ${filterCountry}` : 'globally'}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
          {[
            { label: filterScope === 'country' && filterCountry ? `In ${filterCountry}` : 'Professionals', value: stats.total,               icon: '👥', color: 'var(--blue)'   },
            { label: 'Avg Score',     value: stats.avg.toLocaleString(), icon: '📊', color: 'var(--purple)' },
            { label: 'Top Score',     value: stats.top.toLocaleString(), icon: '🥇', color: 'var(--gold)'   },
            { label: 'Specialisms',   value: stats.specs,                icon: '🎯', color: 'var(--green)'  },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.1rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.6rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted2)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" placeholder="Search name, role or location…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 180, maxWidth: 280 }} />
          <select className="input" value={filterSpec} onChange={e => setFilterSpec(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="all">All Specialisms</option>
            {SPECIALISMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={filterRank} onChange={e => setFilterRank(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="all">All Ranks</option>
            {RANK_TIERS.map(t => <option key={t.name} value={t.name}>{t.icon} {t.name}</option>)}
          </select>
          {(isFiltered) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFilterSpec('all'); setFilterRank('all'); setSearch(''); }}>
              Clear ✕
            </button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--muted2)' }}>
            {filtered.length} of {allUsers.length} professionals
          </div>
        </div>

        {/* Rankings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Podium — 1, 2, or 3 users */}
          {podiumUsers.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${podiumUsers.length}, 1fr)`,
              borderBottom: '1px solid var(--border)',
            }}>
              {podiumUsers.map((u, i) => {
                const medalColors = ['var(--gold)', 'rgba(200,210,230,0.9)', 'var(--orange)'];
                const isMe = user && (u.id === user.id || u.username === user.username);
                return (
                  <div key={u.id}
                    onClick={() => onNavigate('profile', { userData: u })}
                    style={{
                      padding: '1.5rem',
                      display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      cursor: 'pointer', transition: 'filter 0.15s',
                      borderRight: i < podiumUsers.length - 1 ? '1px solid var(--border)' : 'none',
                      background: isMe ? 'rgba(0,194,255,0.04)' : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.filter = ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{MEDAL[i] || `#${i+1}`}</span>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: i === 0 ? 'linear-gradient(135deg, #ffc83c, #ff8c00)' : 'var(--grad-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1.2rem', color: i === 0 ? '#111' : '#fff',
                        boxShadow: i === 0 ? '0 4px 16px rgba(255,200,60,0.35)' : '0 4px 16px rgba(0,194,255,0.2)',
                        border: isMe ? '2px solid var(--blue)' : 'none',
                      }}>{(u.name || '?')[0]}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: i === 0 ? 'var(--gold)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name}{isMe && <span style={{ color: 'var(--blue)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>(you)</span>}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.location}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted2)', lineHeight: 1.4 }}>{u.headline}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      <RankBadge score={u.score} />
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '1.1rem', color: medalColors[i] || 'var(--text)' }}>
                        {u.score.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--blue)' }}>View profile →</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table */}
          {tableUsers.length > 0 && (
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 48, paddingLeft: '1.25rem' }}>#</th>
                  <th>Professional</th>
                  <th>Location</th>
                  <th>Rank</th>
                  <th>Certs</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {tableUsers.map((u, i) => {
                  const rank = isFiltered ? i + 1 : podiumUsers.length + i + 1;
                  const isMe = user && (u.id === user.id || u.username === user.username);
                  return (
                    <tr key={u.id}
                      onClick={() => onNavigate('profile', { userData: u })}
                      style={{ cursor: 'pointer', background: isMe ? 'rgba(0,194,255,0.04)' : 'transparent' }}
                      onMouseEnter={e => { Array.from(e.currentTarget.cells).forEach(td => td.style.background = 'var(--surface2)'); }}
                      onMouseLeave={e => { Array.from(e.currentTarget.cells).forEach(td => td.style.background = isMe ? 'rgba(0,194,255,0.04)' : ''); }}
                    >
                      <td style={{ paddingLeft: '1.25rem' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.78rem', color: 'var(--muted)' }}>{rank}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#fff', border: isMe ? '2px solid var(--blue)' : '1px solid var(--border)' }}>
                            {(u.name || '?')[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                              {u.name}
                              {isMe && <span style={{ color: 'var(--blue)', fontSize: '0.72rem', marginLeft: '0.4rem' }}>(you)</span>}
                              {u.isMVP && <span className="badge badge-gold" style={{ fontSize: '0.6rem', marginLeft: '0.4rem' }}>MVP</span>}
                              {u.foundingMember && <span className="badge badge-purple" style={{ fontSize: '0.6rem', marginLeft: '0.4rem' }}>Founding</span>}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted2)' }}>{u.headline}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ fontSize: '0.82rem', color: 'var(--muted2)' }}>{u.location}</span></td>
                      <td><RankBadge score={u.score} /></td>
                      <td><span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{(u.certifications || []).length}</span></td>
                      <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.9rem', color: isMe ? 'var(--gold)' : 'var(--blue)' }}>
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
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
              {filterScope === 'country' && filterCountry
                ? `No professionals found in ${filterCountry} yet. Be the first!`
                : 'No professionals match your filters.'}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '2.5rem', padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, rgba(0,194,255,0.07), rgba(167,139,250,0.05))',
          border: '1px solid var(--border-blue)', borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem',
        }}>
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.3rem' }}>
              Where would you rank?
            </div>
            <p style={{ color: 'var(--muted2)', fontSize: '0.9rem', margin: 0 }}>
              {usingLive ? 'Sign up to claim your place on the live leaderboard.' : 'Sign in to see the live leaderboard. StackRank365 is in early access — join now to be a Founding Member.'}
            </p>
          </div>
          <button className="btn btn-gold" onClick={() => onNavigate(usingLive ? 'signup' : 'landing')}>
            🚀 {usingLive ? 'Claim Your Rank' : 'Join the Waitlist'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .table th:nth-child(3), .table td:nth-child(3),
          .table th:nth-child(5), .table td:nth-child(5) { display: none; }
          .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
