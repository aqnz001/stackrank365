import { useState } from 'react';

const TECH_AREAS = [
  'Dynamics 365 CRM / Customer Engagement',
  'Dynamics 365 Finance / Supply Chain / Operations',
  'Power Platform (Power Apps / Automate / BI / Pages)',
  'Azure (Infrastructure / Data / AI / DevOps)',
  'Microsoft 365 / SharePoint / Teams',
  'Copilot Studio / AI / Viva',
  'Multiple areas / cross-platform',
  'Other',
];

const ROLES = [
  'Independent consultant / freelancer',
  'Employed at a Microsoft partner or ISV',
  'Employed at an end-user organisation',
  'Solutions architect / technical lead',
  'Developer / engineer',
  'Functional consultant',
  'Manager / director',
  'Other',
];

const BLOCKERS = [
  'Privacy — I don\'t want my skills or rankings publicly visible',
  'Time — maintaining another profile is too much effort',
  'Trust — I\'m not sure the scoring is fair or accurate',
  'Relevance — my clients or employers don\'t care about it',
  'Already covered — LinkedIn does enough for me',
  'Market maturity — too early, needs more adoption first',
  'Other',
];

const TOTAL_STEPS = 4;

function ProgressBar({ step }) {
  const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted2)', fontWeight: 500 }}>
          Step {step} of {TOTAL_STEPS}
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted2)' }}>{pct}% complete</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Likert({ value, onChange, low, high }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              width: 44, height: 44, borderRadius: 8,
              border: value === n ? 'none' : '1px solid var(--border)',
              background: value === n ? 'var(--blue)' : 'var(--surface2)',
              color: value === n ? '#fff' : 'var(--muted2)',
              fontWeight: value === n ? 700 : 400,
              fontSize: '0.9rem', cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'Open Sans, sans-serif',
            }}
          >{n}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{low}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{high}</span>
      </div>
    </div>
  );
}

function Question({ number, text, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: 'var(--blue-dim)',
          border: '1px solid var(--border-blue)', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)',
        }}>{number}</div>
        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text)', fontSize: '1rem', lineHeight: 1.5 }}>{text}</p>
      </div>
      <div style={{ paddingLeft: '2.5rem' }}>{children}</div>
    </div>
  );
}

function CheckList({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {options.map(opt => {
        const checked = selected.includes(opt);
        return (
          <label key={opt} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 1rem', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${checked ? 'var(--border-blue)' : 'var(--border)'}`,
            background: checked ? 'var(--blue-dim)' : 'var(--surface2)',
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${checked ? 'var(--blue)' : 'var(--border-bright)'}`,
              background: checked ? 'var(--blue)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
            </div>
            <input type="checkbox" checked={checked} onChange={() => onToggle(opt)} style={{ display: 'none' }} />
            <span style={{ fontSize: '0.9rem', color: checked ? 'var(--text)' : 'var(--muted2)' }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function RadioList({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {options.map(opt => {
        const active = selected === opt;
        return (
          <label key={opt} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 1rem', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${active ? 'var(--border-blue)' : 'var(--border)'}`,
            background: active ? 'var(--blue-dim)' : 'var(--surface2)',
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${active ? 'var(--blue)' : 'var(--border-bright)'}`,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)' }} />}
            </div>
            <input type="radio" checked={active} onChange={() => onSelect(opt)} style={{ display: 'none' }} />
            <span style={{ fontSize: '0.9rem', color: active ? 'var(--text)' : 'var(--muted2)' }}>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function ThankYou({ onNavigate }) {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '3rem 1.25rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--green-dim)', border: '1px solid rgba(0,229,160,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7 13-13" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ color: 'var(--text)', marginBottom: '0.75rem' }}>Thank you for your feedback</h2>
        <p style={{ color: 'var(--muted2)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Every response directly shapes what we build next. Your input is genuinely valuable
          and we appreciate you taking the time.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('landing')}>
            Back to Home
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('leaderboard')}>
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Survey({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    tech_areas: [],
    role: '',
    first_impression: null,
    clarity: null,
    industry_need: null,
    biggest_blocker: '',
    feature_stack_points: null,
    feature_cert_verify: null,
    feature_cv_analyser: null,
    most_important: '',
    will_revisit: '',
    overall_rating: null,
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleArea = (area) => set('tech_areas',
    form.tech_areas.includes(area)
      ? form.tech_areas.filter(a => a !== area)
      : [...form.tech_areas, area]
  );

  const canAdvance = () => {
    if (step === 1) return form.tech_areas.length > 0 && form.role;
    if (step === 2) return form.first_impression && form.clarity && form.industry_need;
    if (step === 3) return form.biggest_blocker && form.feature_stack_points && form.feature_cert_verify && form.feature_cv_analyser;
    if (step === 4) return form.will_revisit && form.overall_rating;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { supabase } = await import('../lib/supabase.js');
      const payload = { ...form, will_revisit: form.will_revisit.toLowerCase().replace(' ', '_') };
      const { error: dbErr } = await supabase.from('survey_responses').insert([payload]);
      if (dbErr) throw dbErr;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <ThankYou onNavigate={onNavigate} />;

  const STEP_TITLES = [
    'About You',
    'First Impressions',
    'Value & Features',
    'Final Thoughts',
  ];

  return (
    <div style={{ minHeight: '80vh', padding: '3rem 1.25rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="badge badge-blue" style={{ marginBottom: '1rem' }}>Beta Feedback Survey</div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '0.5rem' }}>
            Help us build the right product
          </h1>
          <p style={{ color: 'var(--muted2)', maxWidth: 480, margin: '0 auto' }}>
            Takes 3–4 minutes. No right or wrong answers — honest reactions help most.
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <ProgressBar step={step} />

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{STEP_TITLES[step - 1]}</h3>
            <div style={{ height: 2, width: 40, background: 'var(--blue)', borderRadius: 2 }} />
          </div>

          {/* ── STEP 1: About You ── */}
          {step === 1 && (
            <>
              <Question number="1" text="What is your primary Microsoft technology area? (select all that apply)">
                <CheckList options={TECH_AREAS} selected={form.tech_areas} onToggle={toggleArea} />
              </Question>
              <Question number="2" text="What best describes your current role?">
                <RadioList options={ROLES} selected={form.role} onSelect={v => set('role', v)} />
              </Question>
            </>
          )}

          {/* ── STEP 2: First Impressions ── */}
          {step === 2 && (
            <>
              <Question number="3" text="My first impression of StackRank365 was positive.">
                <Likert value={form.first_impression} onChange={v => set('first_impression', v)}
                  low="Strongly disagree" high="Strongly agree" />
              </Question>
              <Question number="4" text="I understood what StackRank365 does within the first 30 seconds.">
                <Likert value={form.clarity} onChange={v => set('clarity', v)}
                  low="Strongly disagree" high="Strongly agree" />
              </Question>
              <Question number="5" text="A ranking or score system for Microsoft professionals is something the industry actually needs.">
                <Likert value={form.industry_need} onChange={v => set('industry_need', v)}
                  low="Definitely not needed" high="Definitely needed" />
              </Question>
            </>
          )}

          {/* ── STEP 3: Value & Features ── */}
          {step === 3 && (
            <>
              <Question number="6" text="What is the biggest reason you might NOT use StackRank365, even if you liked it?">
                <RadioList options={BLOCKERS} selected={form.biggest_blocker} onSelect={v => set('biggest_blocker', v)} />
              </Question>
              <Question number="7" text="Rate these features from 1 (not valuable) to 7 (essential):">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { key: 'feature_stack_points', label: 'Stack Points score based on certifications' },
                    { key: 'feature_cert_verify',  label: 'Certification verification via MS Learn' },
                    { key: 'feature_cv_analyser',  label: 'CV Analyser — AI-generated profile summary' },
                  ].map(f => (
                    <div key={f.key}>
                      <p style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', color: 'var(--muted2)', fontWeight: 500 }}>{f.label}</p>
                      <Likert value={form[f.key]} onChange={v => set(f.key, v)}
                        low="Not valuable" high="Essential" />
                    </div>
                  ))}
                </div>
              </Question>
            </>
          )}

          {/* ── STEP 4: Final Thoughts ── */}
          {step === 4 && (
            <>
              <Question number="8" text="What is the single most important thing StackRank365 must get right to earn your trust and regular use?">
                <textarea
                  className="input"
                  style={{ height: 110, padding: '0.75rem 1rem', resize: 'vertical' }}
                  placeholder="Be as honest as you like..."
                  value={form.most_important}
                  onChange={e => set('most_important', e.target.value)}
                />
              </Question>
              <Question number="9" text="Will you revisit StackRank365 in the next 30 days without being prompted?">
                <RadioList
                  options={['Yes', 'No', 'Not sure']}
                  selected={form.will_revisit}
                  onSelect={v => set('will_revisit', v)}
                />
              </Question>
              <Question number="10" text="Overall, how would you rate StackRank365 at this stage?">
                <Likert value={form.overall_rating} onChange={v => set('overall_rating', v)}
                  low="Very poor" high="Excellent" />
              </Question>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              color: 'var(--red)', fontSize: '0.88rem',
            }}>{error}</div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setStep(s => s - 1)}
              style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            >
              ← Back
            </button>
            {step < TOTAL_STEPS ? (
              <button
                className="btn btn-primary"
                onClick={() => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={!canAdvance()}
                style={{ opacity: canAdvance() ? 1 : 0.45 }}
              >
                Next →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !canAdvance()}
                style={{ opacity: (submitting || !canAdvance()) ? 0.45 : 1 }}
              >
                {submitting ? 'Submitting…' : 'Submit feedback'}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
          Responses are anonymous and used solely to improve StackRank365.
        </p>
      </div>
    </div>
  );
}
