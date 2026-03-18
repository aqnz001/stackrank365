import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const MS_PRODUCTS = [
  'dynamics-365', 'power-platform', 'power-apps', 'power-automate',
  'power-bi', 'power-pages', 'power-virtual-agents', 'copilot-studio',
  'dataverse', 'azure', 'microsoft-365', 'office-365', 'ms-graph',
  'azure-openai', 'azure-ai-services',
];

function mapSpecialism(products) {
  if (products.some(p => p.includes('copilot-studio') || p.includes('power-virtual'))) return 'Copilot Studio';
  if (products.some(p => p.includes('power-apps') || p.includes('dataverse'))) return 'Power Apps';
  if (products.some(p => p.includes('power-platform') || p.includes('power-automate') || p.includes('power-pages'))) return 'Power Platform';
  if (products.some(p => p.includes('dynamics-365'))) return 'Dynamics 365';
  if (products.some(p => p.includes('azure-openai') || p.includes('azure-ai'))) return 'Azure OpenAI';
  if (products.some(p => p.includes('azure'))) return 'Azure';
  return 'Microsoft 365';
}

function mapLevel(levels) {
  if (!levels || levels.length === 0) return 'Fundamentals';
  const l = levels[0].toLowerCase();
  if (l === 'beginner') return 'Fundamentals';
  if (l === 'intermediate') return 'Associate';
  if (l === 'advanced') return 'Expert';
  return 'Applied Skills';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  );

  try {
    console.log('Fetching MS Learn catalog...');

    const catalogRes = await fetch(
      'https://learn.microsoft.com/api/catalog/?type=certifications&locale=en-us',
      { headers: { 'User-Agent': 'StackRank365/1.0 (sync-catalog)' } }
    );
    if (!catalogRes.ok) throw new Error('Catalog API returned ' + catalogRes.status);
    const catalog = await catalogRes.json();
    const allCerts = catalog.certifications || [];

    console.log('Total certs from MS Learn: ' + allCerts.length);

    const ecosystemCerts = allCerts.filter(c => {
      const products = c.products || [];
      return products.some(p => MS_PRODUCTS.some(mp => p.includes(mp)));
    });

    console.log('Ecosystem certs after filter: ' + ecosystemCerts.length);

    const certRows = ecosystemCerts.map(c => {
      const products  = c.products || [];
      const exams     = c.exams || [];
      const levels    = c.levels || [];
      const tier      = mapLevel(levels);
      const uid       = (c.uid || '').toLowerCase().replace('certification.', '');
      const examCodes = exams
        .map(e => (e.uid || '').toUpperCase().replace('EXAM.', ''))
        .filter(Boolean).join(', ');

      return {
        certification_name:        c.title || '',
        certification_uid:         uid,
        exam_codes:                examCodes,
        program:                   'Role-based',
        technology_area:           mapSpecialism(products),
        level:                     tier,
        first_released:            c.last_modified || null,
        retirement_date:           c.retirement_date || null,
        status:                    c.retirement_date ? 'Retiring' : 'Active',
        renewal_requirement:       'Annual renewal',
        replacement_certification: c.replacement_certification_uid || null,
        official_url:              c.url ? 'https://learn.microsoft.com' + c.url : null,
        notes:                     (c.products || []).join(', '),
        updated_at:                new Date().toISOString(),
      };
    });

    // Replace cert_catalog entirely
    console.log('Clearing cert_catalog...');
    await supabase.from('cert_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    let inserted = 0;
    for (let i = 0; i < certRows.length; i += 50) {
      const { error } = await supabase.from('cert_catalog').insert(certRows.slice(i, i + 50));
      if (error) throw new Error('Insert batch ' + i + ' failed: ' + error.message);
      inserted += Math.min(50, certRows.length - i);
    }
    console.log('Inserted ' + inserted + ' certs into cert_catalog');

    // Rebuild certification_paths
    console.log('Rebuilding certification_paths...');
    const certByUid = {};
    ecosystemCerts.forEach(c => {
      const uid = (c.uid || '').toLowerCase().replace('certification.', '');
      certByUid[uid] = c;
    });

    const pathRows = [];
    ecosystemCerts.forEach(c => {
      const toUid = (c.uid || '').toLowerCase().replace('certification.', '');
      const tier  = mapLevel(c.levels || []);

      // From explicit prerequisites in API
      (c.prerequisites || []).forEach(p => {
        const fromUid = (p.uid || '').toLowerCase().replace('certification.', '');
        if (fromUid && toUid && certByUid[fromUid] && fromUid !== toUid) {
          pathRows.push({ from_cert: fromUid, to_cert: toUid });
        }
      });

      // Infer Fundamentals -> Associate paths via exam code prefix (e.g. MB-910 -> MB-210)
      if (tier === 'Associate') {
        const exams  = c.exams || [];
        const prefix = exams[0]?.uid?.replace('exam.', '').split('-')[0]?.toLowerCase();
        if (prefix) {
          ecosystemCerts.forEach(other => {
            if (mapLevel(other.levels || []) === 'Fundamentals') {
              const otherExams  = other.exams || [];
              const otherPrefix = otherExams[0]?.uid?.replace('exam.', '').split('-')[0]?.toLowerCase();
              if (otherPrefix === prefix) {
                const fromUid = (other.uid || '').toLowerCase().replace('certification.', '');
                if (fromUid && fromUid !== toUid) {
                  pathRows.push({ from_cert: fromUid, to_cert: toUid });
                }
              }
            }
          });
        }
      }
    });

    const uniquePaths = [...new Map(pathRows.map(p => [p.from_cert + '->' + p.to_cert, p])).values()];

    await supabase.from('certification_paths').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (uniquePaths.length > 0) {
      const { error } = await supabase.from('certification_paths').insert(uniquePaths);
      if (error) throw new Error('Path insert failed: ' + error.message);
    }
    console.log('Inserted ' + uniquePaths.length + ' paths');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      certsFromApi: allCerts.length,
      certsFiltered: ecosystemCerts.length,
      certsInserted: inserted,
      pathsInserted: uniquePaths.length,
      technologyAreas: [...new Set(certRows.map(r => r.technology_area))].sort(),
      tierBreakdown: {
        Fundamentals:     certRows.filter(r => r.level === 'Fundamentals').length,
        Associate:        certRows.filter(r => r.level === 'Associate').length,
        Expert:           certRows.filter(r => r.level === 'Expert').length,
        'Applied Skills': certRows.filter(r => r.level === 'Applied Skills').length,
      },
    }, null, 2), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('sync-catalog error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
