/* SVG sprite for TWHO-scaffold components.
   Icons (arrow, close, alert, chevron, external-link) copied verbatim from
   tewhatuora.govt.nz for visual parity. The "divider-pattern" is replaced
   with a generic hexagonal motif — Pātiki/Tāniko patterns are Māori
   cultural designs and should not be reused outside their context. */
export default function TWHOSprite() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position:'absolute' }}>
      <defs>
        <symbol fill="none" viewBox="0 0 18 16" id="arrow">
          <path fill="currentColor" fillRule="evenodd" d="M8.84 1.518A.833.833 0 1110.017.34l7.07 7.07a.833.833 0 010 1.18l-7.07 7.07a.833.833 0 11-1.179-1.178l5.649-5.648H1.095a.833.833 0 010-1.667h13.393L8.839 1.518z" clipRule="evenodd"/>
        </symbol>
        <symbol fill="none" viewBox="0 0 20 11" id="chevron">
          <path fill="currentColor" d="M.822.293a1 1 0 011.414 0l7.779 7.778L17.793.293a1 1 0 111.414 1.414l-8.485 8.485a1 1 0 01-1.415 0L.822 1.707a1 1 0 010-1.414z"/>
        </symbol>
        <symbol fill="none" viewBox="0 0 18 18" id="close">
          <path fill="currentColor" fillRule="evenodd" d="M1.222 16.778a1 1 0 001.414 0L9 10.414l6.364 6.364a1 1 0 001.414-1.414L10.414 9l6.364-6.364a1 1 0 00-1.414-1.414L9 7.585 2.636 1.222a1 1 0 10-1.414 1.414L7.586 9l-6.364 6.364a1 1 0 000 1.414z" clipRule="evenodd"/>
        </symbol>
        <symbol fill="none" viewBox="0 0 26 22" id="alert">
          <path fill="currentColor" fillRule="evenodd" d="M13 0c.4 0 .8.2 1 .6l11.8 19.5c.4.7-.1 1.6-1 1.6H1.2c-.9 0-1.4-.9-1-1.6L12 .6c.2-.4.6-.6 1-.6zm0 7.5c-.6 0-1 .5-1 1v5.5c0 .6.5 1 1 1s1-.5 1-1v-5.5c0-.6-.5-1-1-1zm0 9.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd"/>
        </symbol>
        {/* Hexagon pattern (replaces TWHO's culturally-specific divider-pattern) */}
        <symbol id="divider-pattern" viewBox="0 0 60 52">
          <polygon points="30,2 56,15 56,38 30,50 4,38 4,15" fill="none" stroke="currentColor" strokeWidth="1.2"/>
          <polygon points="30,14 44,21 44,32 30,38 16,32 16,21" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
        </symbol>
      </defs>
    </svg>
  );
}
