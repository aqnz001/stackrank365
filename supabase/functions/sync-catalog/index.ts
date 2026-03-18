import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };

// Cert types to include (all — including retired mcsa/mcse/mta families)
const ALL_TYPES = ['role-based','fundamentals','specialty','business','mcsa','mcse','mcsd','mta','mos'];

// Retired cert type families
const RETIRED_TYPES = new Set(['mcsa','mcse','mcsd','mta','mos']);

// MS ecosystem roles + UID keywords — used to filter non-MS certs (e.g. GitHub, AWS)
const MS_UID_KEYWORDS = ['dynamics','power-platform','power-apps','power-bi','power-automate','power-pages','copilot-studio','dataverse','azure','office','microsoft-365','d365','pl-','mb-','ms-','dp-','ai-','az-','sc-','mo-'];

function isMsEcosystem(cert) {
  const uid = (cert.uid || '').toLowerCase();
  if (MS_UID_KEYWORDS.some(k => uid.includes(k))) return true;
  const roles = cert.roles || [];
  const msRoles = ['functional-consultant','solution-architect','maker','business-analyst','business-user','business-owner','data-analyst','administrator'];
  // Only include if it has MS-relevant roles AND a known type
  return msRoles.some(r => roles.includes(r)) && ALL_TYPES.includes(cert.certification_type);
}

function mapSpecialism(cert) {
  const uid = (cert.uid || '').toLowerCase();
  const roles = cert.roles || [];
  if (uid.includes('copilot-studio') || uid.includes('power-virtual')) return 'Copilot Studio';
  if (uid.includes('power-apps') || uid.includes('dataverse') || roles.includes('maker')) return 'Power Apps';
  if (uid.includes('power-platform') || uid.includes('power-automate') || uid.includes('power-bi') || uid.includes('power-pages')) return 'Power Platform';
  if (uid.includes('dynamics') || uid.includes('d365') || uid.includes('mb-') || roles.includes('functional-consultant')) return 'Dynamics 365';
  if (uid.includes('azure-ai') || uid.includes('ai-') || uid.includes('azure-openai')) return 'Azure OpenAI';
  if (uid.includes('azure') || uid.includes('az-') || uid.includes('dp-') || uid.includes('sc-')) return 'Azure';
  if (uid.includes('office') || uid.includes('microsoft-365') || uid.includes('ms-') || uid.includes('mo-')) return 'Microsoft 365';
  return 'Microsoft';
}

function mapLevel(cert) {
  const levels = cert.levels || [];
  const type = cert.certification_type || '';
  if (RETIRED_TYPES.has(type)) return 'Legacy';
  if (type === 'fundamentals' || levels.includes('beginner')) return 'Fundamentals';
  if (type === 'specialty') return 'Expert';
  if (levels.includes('advanced')) return 'Expert';
  if (levels.includes('intermediate')) return 'Associate';
  return 'Fundamentals';
}

const PTS = { Fundamentals: 500, Associate: 1500, Expert: 3000, Legacy: 800, 'Applied Skills': 400 };

// Build certification paths from uid patterns
// Fundamentals cert → Associate certs with same domain prefix
function buildPaths(certs) {
  const paths = [];
  const fundamentals = certs.filter(c => mapLevel(c) === 'Fundamentals');
  const associates   = certs.filter(c => mapLevel(c) === 'Associate');
  const experts      = certs.filter(c => mapLevel(c) === 'Expert');

  // Domain prefix map from UIDs e.g. "d365-fundamentals" → "d365"
  const domainOf = (cert) => {
    const uid = (cert.uid || '').replace('certification.','');
    // Extract domain prefix from known patterns
    if (uid.includes('d365') || uid.includes('dynamics')) return 'dynamics';
    if (uid.includes('power-platform')) return 'power-platform';
    if (uid.includes('power-apps') || uid.includes('dataverse')) return 'power-apps';
    if (uid.includes('power-bi')) return 'power-bi';
    if (uid.includes('power-automate')) return 'power-automate';
    if (uid.includes('azure-ai') || uid.startsWith('certification.ai-')) return 'azure-ai';
    if (uid.includes('azure')) return 'azure';
    if (uid.includes('security') || uid.includes('sc-')) return 'security';
    if (uid.includes('data') || uid.includes('dp-')) return 'data';
    if (uid.includes('microsoft-365') || uid.includes('ms-')) return 'm365';
    // Fallback: use roles
    const roles = (cert.roles || []).sort().join('-');
    return roles || uid.split('-').slice(0,2).join('-');
  };

  // Fundamentals → Associate (same domain)
  fundamentals.forEach(fund => {
    const fDomain = domainOf(fund);
    const fRoles  = new Set(fund.roles || []);
    associates.forEach(assoc => {
      const aDomain = domainOf(assoc);
      const aRoles  = assoc.roles || [];
      // Connect if same domain OR shared roles
      const sharedRoles = aRoles.filter(r => fRoles.has(r)).length;
      if (fDomain === aDomain || sharedRoles >= 1) {
        paths.push({ from_cert: (fund.uid||'').replace('certification.',''), to_cert: (assoc.uid||'').replace('certification.','') });
      }
    });
  });

  // Associate → Expert (same domain)
  associates.forEach(assoc => {
    const aDomain = domainOf(assoc);
    const aRoles  = new Set(assoc.roles || []);
    experts.forEach(exp => {
      const eDomain = domainOf(exp);
      const eRoles  = exp.roles || [];
      const sharedRoles = eRoles.filter(r => aRoles.has(r)).length;
      if (aDomain === eDomain || sharedRoles >= 1) {
        paths.push({ from_cert: (assoc.uid||'').replace('certification.',''), to_cert: (exp.uid||'').replace('certification.','') });
      }
    });
  });

  return [...new Map(paths.map(p => [p.from_cert+'>'+p.to_cert, p])).values()];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (!req.headers.get('authorization')?.startsWith('Bearer '))
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });

  const sb = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

  try {
    const res = await fetch('https://learn.microsoft.com/api/catalog/?type=certifications&locale=en-us', {
      headers: { 'User-Agent': 'StackRank365/1.0 sync-catalog' }
    });
    if (!res.ok) throw new Error('MS API ' + res.status);
    const { certifications: all = [] } = await res.json();

    // Include ALL certs (including retired) that are MS ecosystem
    const eco = all.filter(isMsEcosystem);

    const rows = eco.map(c => {
      const uid  = (c.uid || '').toLowerCase().replace('certification.', '');
      const tier = mapLevel(c);
      const type = c.certification_type || '';
      const examCodes = (c.exams || [])
        .map(e => typeof e === 'object' ? (e?.uid||'').toUpperCase().replace('EXAM.','') : '')
        .filter(Boolean).join(', ');

      return {
        certification_name:      c.title || '',
        certification_uid:       uid,
        exam_codes:              examCodes,
        program:                 type,
        technology_area:         mapSpecialism(c),
        level:                   tier,
        points:                  PTS[tier] || 500,
        scarcity_multiplier:     uid.includes('copilot-studio') || uid.includes('power-virtual'),
        first_released:          c.last_modified || null,
        retirement_date:         RETIRED_TYPES.has(type) ? '2021-06-30' : null,
        status:                  RETIRED_TYPES.has(type) ? 'Retired' : 'Active',
        renewal_requirement:     RETIRED_TYPES.has(type) ? 'None (retired)' : 'Annual renewal',
        replacement_certification: null,
        official_url:            c.url ? 'https://learn.microsoft.com' + c.url : null,
        notes:                   (c.roles || []).join(', '),
        updated_at:              new Date().toISOString(),
      };
    });

    // Replace cert_catalog
    await sb.from('cert_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 50) {
      const { error } = await sb.from('cert_catalog').insert(rows.slice(i, i + 50));
      if (error) throw new Error('Insert: ' + error.message);
      inserted += Math.min(50, rows.length - i);
    }

    // Rebuild paths
    const paths = buildPaths(eco);
    await sb.from('certification_paths').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (paths.length) {
      const { error } = await sb.from('certification_paths').insert(paths);
      if (error) throw new Error('Paths: ' + error.message);
    }

    return new Response(JSON.stringify({
      success: true, timestamp: new Date().toISOString(),
      certsFromApi: all.length, certsFiltered: eco.length, certsInserted: inserted,
      pathsInserted: paths.length,
      byStatus: { active: rows.filter(r=>r.status==='Active').length, retired: rows.filter(r=>r.status==='Retired').length },
      byTier: { Fundamentals: rows.filter(r=>r.level==='Fundamentals').length, Associate: rows.filter(r=>r.level==='Associate').length, Expert: rows.filter(r=>r.level==='Expert').length, Legacy: rows.filter(r=>r.level==='Legacy').length },
      technologyAreas: [...new Set(rows.map(r=>r.technology_area))].sort(),
    }, null, 2), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch(e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS }); }
});