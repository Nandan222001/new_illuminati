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
    default:
      return null
  }
}
