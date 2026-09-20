/**
 * Keyed by the symbol's stable `slug` (not its translated display name) so
 * the correct icon still renders when the UI language isn't English.
 */
export default function SymbolIcon({ slug }) {
  const stroke = { fill: 'none', stroke: '#e6c878', strokeWidth: 2 }
  switch (slug) {
    case 'the-third-eye':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <ellipse cx="50" cy="50" rx="26" ry="14" />
          <circle cx="50" cy="50" r="7" fill="#e6c878" stroke="none" />
          <circle cx="50" cy="50" r="12" strokeWidth="1" opacity=".7" />
          <path d="M50 18v8M50 74v8M18 50h8M74 50h8" strokeWidth="1.5" />
        </svg>
      )
    case 'the-pyramid':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <polygon points="50,22 76,72 24,72" />
          <polygon points="50,22 59,40 41,40" fill="#e6c878" stroke="none" opacity=".85" />
          <path d="M32 62h36M37 54h26" strokeWidth="1" opacity=".7" />
        </svg>
      )
    case 'the-shadow':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50 24c-10 6-14 16-14 28l-6 24h40l-6-24c0-12-4-22-14-28z" fill="rgba(230,200,120,.1)" />
          <ellipse cx="50" cy="48" rx="8" ry="10" fill="#050203" />
          <circle cx="47" cy="46" r="1.3" fill="#e6c878" stroke="none" />
          <circle cx="53" cy="46" r="1.3" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'the-horned-figure':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M30 30C22 40 24 54 34 60M70 30c8 10 6 24-4 30" strokeLinecap="round" />
          <path d="M38 52c0 10 5 18 12 18s12-8 12-18l-4-6H42z" fill="rgba(230,200,120,.1)" />
          <circle cx="45" cy="56" r="1.6" fill="#e6c878" stroke="none" />
          <circle cx="55" cy="56" r="1.6" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'the-black-sun':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="50" r="10" />
          <g strokeWidth="1.6">
            <path d="M50 26v10M50 64v10M26 50h10M64 50h10M33 33l7 7M60 60l7 7M67 33l-7 7M40 60l-7 7" />
          </g>
          <circle cx="50" cy="50" r="4" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'the-emblem':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="50" r="34" strokeWidth="1" opacity=".8" />
          <polygon points="50,24 72,66 28,66" />
          <ellipse cx="50" cy="54" rx="10" ry="6" strokeWidth="1.5" />
          <circle cx="50" cy="54" r="3" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'the-altar-gate':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <polygon points="50,20 80,74 20,74" />
          <polygon points="50,34 68,66 32,66" fill="rgba(230,200,120,.18)" strokeWidth="1" />
          <path d="M26 80h48" strokeWidth="1.5" />
        </svg>
      )
    case 'the-grimoire-page':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <rect x="30" y="26" width="40" height="48" rx="2" />
          <path d="M38 38h24M38 46h24M38 54h16" strokeWidth="1.4" opacity=".8" />
          <circle cx="58" cy="62" r="5" strokeWidth="1.4" />
        </svg>
      )
    case 'the-owl-of-minerva':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M38 27l4 7M62 27l-4 7" strokeLinecap="round" />
          <ellipse cx="50" cy="42" rx="15" ry="18" fill="rgba(230,200,120,.08)" />
          <circle cx="44" cy="39" r="5.5" />
          <circle cx="56" cy="39" r="5.5" />
          <circle cx="44" cy="39" r="2" fill="#e6c878" stroke="none" />
          <circle cx="56" cy="39" r="2" fill="#e6c878" stroke="none" />
          <path d="M50 43l-3 6h6z" fill="#e6c878" stroke="none" />
          <path d="M43 52q7 4 14 0" strokeWidth="1.2" opacity=".7" />
          <path d="M26 67q12-5 24 0q12-5 24 0v10q-12-5-24 0q-12-5-24 0zM50 67v10" strokeWidth="1.6" />
        </svg>
      )
    case 'the-hexagram':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <polygon points="50,20 76,65 24,65" />
          <polygon points="50,80 24,35 76,35" />
          <circle cx="50" cy="50" r="4" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'the-rose-cross':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50 20v60M26 46h48" strokeWidth="2.4" />
          <circle cx="50" cy="46" r="13" fill="#0a0706" />
          <circle cx="50" cy="46" r="8" strokeWidth="1.4" />
          <path d="M50 38c5 3 5 13 0 16M44 42c3 2 6 6 6 10" strokeWidth="1.1" opacity=".8" />
          <circle cx="50" cy="46" r="2.4" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'the-obelisk':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <polygon points="43,78 46,34 54,34 57,78" />
          <polygon points="46,34 50,22 54,34" fill="#e6c878" stroke="none" opacity=".9" />
          <path d="M37 78h26v5H37zM40 72h20" strokeWidth="1.5" />
          <path d="M50 42v24" strokeWidth="1" opacity=".6" />
        </svg>
      )
    case 'the-flower-of-life':
      return (
        <svg viewBox="0 0 100 100" {...stroke} strokeWidth="1.4">
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="50" r="22" strokeWidth="1.8" />
          <circle cx="50.0" cy="50.0" r="11" />
          <circle cx="61.0" cy="50.0" r="11" />
          <circle cx="55.5" cy="59.5" r="11" />
          <circle cx="44.5" cy="59.5" r="11" />
          <circle cx="39.0" cy="50.0" r="11" />
          <circle cx="44.5" cy="40.5" r="11" />
          <circle cx="55.5" cy="40.5" r="11" />
        </svg>
      )
    case 'the-skull':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M30 46c0-16 9-22 20-22s20 6 20 22c0 6-4 10-8 12v8H38v-8c-4-2-8-6-8-12z" fill="rgba(230,200,120,.08)" />
          <circle cx="42" cy="46" r="6" fill="#050203" />
          <circle cx="58" cy="46" r="6" fill="#050203" />
          <path d="M50 53l-3 6h6z" fill="#e6c878" stroke="none" />
          <path d="M44 66v-5M50 66v-5M56 66v-5" strokeWidth="1.4" opacity=".8" />
          <path d="M32 74l36 10M68 74L32 84" strokeWidth="2.6" strokeLinecap="round" opacity=".85" />
        </svg>
      )
    case 'the-sun-and-moon':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="36" cy="50" r="8" fill="rgba(230,200,120,.12)" />
          <path d="M36 32v6M36 62v6M18 50h6M48 50h2M23 37l4 4M49 37l-4 4M23 63l4-4M49 63l-4-4" strokeWidth="1.6" />
          <path d="M72 32a20 20 0 1 0 0 36a15 15 0 1 1 0-36z" fill="rgba(230,200,120,.12)" />
        </svg>
      )
    case 'the-pentagram':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="52" r="32" strokeWidth="1.2" opacity=".8" />
          <path d="M50 22L68.8 77.1 20.7 43.3H79.3L31.2 77.1z" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}
