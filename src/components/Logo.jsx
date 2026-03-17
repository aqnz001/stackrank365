// ─── StackRank365 Logo Components ─────────────────────────────────────────
// Three options built — change <LogoMark> import in Nav.jsx to switch
// Currently active: LogoC (Verified Hex — recommended)
// ──────────────────────────────────────────────────────────────────────────

// Logo A — Three interlocking hexagons (D365 blue, Power Platform purple, Copilot cyan)
export function LogoA({ size = 36 }) {
  const s = size;
  return (
    <svg width={s * 1.6} height={s} viewBox="0 0 58 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hex helper: flat-top hex path */}
      {/* Blue hex — left */}
      <polygon points="18,4 28,4 33,13 28,22 18,22 13,13" fill="#0078D4" opacity="0.9"/>
      <polygon points="18,4 28,4 33,13 28,22 18,22 13,13" fill="url(#la_blue)" opacity="0.7"/>
      <circle cx="23" cy="13" r="3.5" fill="white" opacity="0.9"/>
      {/* Purple hex — top right */}
      <polygon points="28,2 38,2 43,11 38,20 28,20 23,11" fill="#7030A0" opacity="0.85"/>
      <circle cx="33" cy="11" r="3" fill="white" opacity="0.9"/>
      {/* Cyan hex — bottom right */}
      <polygon points="28,16 38,16 43,25 38,34 28,34 23,25" fill="#00BCD4" opacity="0.85"/>
      <circle cx="33" cy="25" r="3" fill="white" opacity="0.9"/>
      <defs>
        <linearGradient id="la_blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00A4EF"/>
          <stop offset="100%" stopColor="#0078D4"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Logo B — Leaderboard bars with gold arrow
export function LogoB({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="8" fill="#0D1123"/>
      {/* Bar chart bars */}
      <rect x="4"  y="18" width="8" height="14" rx="2" fill="#0078D4"/>
      <rect x="14" y="10" width="8" height="22" rx="2" fill="#7030A0"/>
      <rect x="24" y="22" width="8" height="10" rx="2" fill="#00BCD4"/>
      {/* Gold arrow above tallest bar */}
      <polygon points="18,3 13,10 23,10" fill="#F59E0B"/>
    </svg>
  );
}

// Logo C — Verified Hex with leaderboard lines (RECOMMENDED — active)
export function LogoC({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded square bg */}
      <rect width="36" height="36" rx="9" fill="#0D1123"/>
      {/* Hex shape — flat top, gradient fill */}
      <path d="M18 3L30 9.5V22.5L18 29L6 22.5V9.5L18 3Z"
        fill="url(#lc_grad)" opacity="0.95"/>
      {/* Leaderboard lines inside hex */}
      <rect x="11" y="11" width="14" height="3" rx="1.5" fill="white" opacity="0.95"/>
      <rect x="12" y="16" width="12" height="3" rx="1.5" fill="white" opacity="0.75"/>
      <rect x="13" y="21" width="10" height="3" rx="1.5" fill="white" opacity="0.55"/>
      {/* Gold verified badge — top right */}
      <circle cx="28" cy="8" r="6" fill="#F59E0B"/>
      <path d="M25 8L27.2 10.2L31 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="lc_grad" x1="6" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6D28D9"/>
          <stop offset="50%" stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#0078D4"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Default export — currently Logo C
export default LogoC;
