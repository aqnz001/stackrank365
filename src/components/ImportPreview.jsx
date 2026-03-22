import { useState } from 'react';

// ImportPreview — shown before any profile import (LinkedIn or Resume)
// Props:
//   source:  'linkedin' | 'resume'
//   data:    object of fields to import { name, professional_title, location, linkedin_url, ... }
//   current: object of current profile values (to show "was → will be")
//   onApprove: (approvedFields) => void  — called with the final edited fields
//   onCancel:  () => void

export default function ImportPreview({ source, data, current = {}, onApprove, onCancel }) {
  // Build field list — only include fields that have a non-empty value
  const FIELD_LABELS = {
    name:               'Full Name',
    professional_title: 'Professional Title',
    location:           'Location',
    linkedin_url:       'LinkedIn URL',
    bio:                'Bio / Summary',
  };

  // Initialise editable state from incoming data
  const initial = {};
  const initialChecked = {};
  Object.entries(FIELD_LABELS).forEach(([key, label]) => {
    if (data?.[key]) {
      initial[key] = data[key];
      initialChecked[key] = true; // default all checked
    }
  });

  const [fields, setFields] = useState(initial);
  const [checked, setChecked] = useState(initialChecked);

  const anyChecked = Object.values(checked).some(Boolean);
  const fieldCount = Object.keys(initial).length;

  const handleApprove = () => {
    const approved = {};
    Object.entries(fields).forEach(([k, v]) => {
      if (checked[k] && v) approved[k] = v;
    });
    onApprove?.(approved);
  };

  const cardStyle = {
    background: 'var(--surface2, #1c2539)',
    border: '1px solid var(--border, rgba(255,255,255,.07))',
    borderRadius: 12,
    padding: '1.25rem',
    maxWidth: 520,
    margin: '0 auto',
  };
  const labelStyle = { fontSize: '0.7rem', color: 'var(--muted, #64748b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 };
  const inputStyle = { width: '100%', padding: '7px 10px', fontSize: 13, background: 'var(--bg, #0d1117)', border: '1px solid var(--border, rgba(255,255,255,.1))', borderRadius: 6, color: 'var(--text, #e2e8f0)', outline: 'none', boxSizing: 'border-box' };
  const oldValueStyle = { fontSize: 11, color: 'var(--muted, #64748b)', marginTop: 3 };

  if (fieldCount === 0) {
    return (
      <div style={cardStyle}>
        <p style={{ color: 'var(--muted, #64748b)', fontSize: 13, textAlign: 'center', margin: '1rem 0' }}>
          No importable fields found in this {source === 'resume' ? 'CV' : 'profile'}.
        </p>
        <button onClick={onCancel} style={{ width: '100%', padding: '8px', background: 'var(--surface3, #1e2d40)', color: 'var(--text, #e2e8f0)', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border, rgba(255,255,255,.07))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>{source === 'resume' ? '📄' : '🔗'}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #e2e8f0)' }}>
            Review {source === 'resume' ? 'CV' : 'LinkedIn'} Import
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted, #64748b)', margin: 0 }}>
          {fieldCount} field{fieldCount !== 1 ? 's' : ''} found. Tick what to apply, edit if needed, then click Apply.
        </p>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '1rem' }}>
        {Object.entries(initial).map(([key, originalVal]) => (
          <div key={key} style={{ opacity: checked[key] ? 1 : 0.45, transition: 'opacity .15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <input
                type="checkbox"
                checked={!!checked[key]}
                onChange={e => setChecked(c => ({ ...c, [key]: e.target.checked }))}
                style={{ cursor: 'pointer', accentColor: 'var(--blue, #00c2ff)', width: 15, height: 15 }}
              />
              <span style={labelStyle}>{FIELD_LABELS[key]}</span>
            </div>
            <input
              style={{ ...inputStyle, opacity: checked[key] ? 1 : 0.5 }}
              value={fields[key] || ''}
              onChange={e => setFields(f => ({ ...f, [key]: e.target.value }))}
              disabled={!checked[key]}
              placeholder={FIELD_LABELS[key]}
            />
            {current[key] && current[key] !== fields[key] && (
              <div style={oldValueStyle}>
                Current: <span style={{ textDecoration: 'line-through' }}>{current[key]}</span>
                {' → '}<span style={{ color: '#22c55e' }}>{fields[key]}</span>
              </div>
            )}
            {!current[key] && (
              <div style={{ ...oldValueStyle, color: '#22c55e' }}>New field — currently empty</div>
            )}
          </div>
        ))}
      </div>

      {/* Note about Save Changes */}
      <div style={{ background: 'rgba(0,194,255,.06)', border: '1px solid rgba(0,194,255,.15)', borderRadius: 6, padding: '8px 12px', marginBottom: '1rem', fontSize: 11, color: 'var(--muted, #64748b)' }}>
        ℹ️  Applied fields update your profile form. Click <strong>Save Changes</strong> in Profile Settings to persist them.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleApprove}
          disabled={!anyChecked}
          style={{ flex: 1, padding: '9px 0', background: anyChecked ? 'var(--blue, #00c2ff)' : '#334155', color: anyChecked ? '#000' : '#64748b', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: anyChecked ? 'pointer' : 'default', transition: 'background .15s' }}
        >
          Apply {Object.values(checked).filter(Boolean).length} Field{Object.values(checked).filter(Boolean).length !== 1 ? 's' : ''} to Profile
        </button>
        <button
          onClick={onCancel}
          style={{ padding: '9px 16px', background: 'var(--surface3, #1e2d40)', color: 'var(--text, #e2e8f0)', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
