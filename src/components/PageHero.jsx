/* Inner-page navy hero — matches TWHO landing rhythm.
   Eyebrow above title, optional subtitle, optional CTA row. Pattern overlay subtle. */
export default function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section style={{ position:'relative', padding:'4rem 0 3.5rem', color:'#fff', background:'var(--color-secondary-100)', overflow:'hidden' }}>
      <svg aria-hidden="true" width="100%" height="100%" style={{ position:'absolute', inset:0, opacity:0.18, color:'var(--color-bg-pattern-dark-theme)', pointerEvents:'none' }}>
        <pattern id="page-hero-hex" patternUnits="userSpaceOnUse" width="60" height="52" x="0" y="0">
          <use xlinkHref="#divider-pattern" width="60" height="52"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#page-hero-hex)"/>
      </svg>
      <div className="u-content-width" style={{ position:'relative', textAlign:'center' }}>
        {eyebrow && (
          <div style={{ display:'inline-block', color:'var(--color-accent-100)', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:'0.85rem' }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ color:'#fff', marginTop:0, marginBottom:'1rem', fontSize:'2.6rem' }}>{title}</h1>
        {subtitle && (
          <p style={{ color:'rgba(255,255,255,0.86)', fontSize:'1.1rem', lineHeight:1.55, maxWidth:'42rem', margin:'0 auto' }}>
            {subtitle}
          </p>
        )}
        {children && <div style={{ marginTop:'1.75rem' }}>{children}</div>}
      </div>
    </section>
  );
}
