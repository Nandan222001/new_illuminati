/** Line-art tattoo motifs drawn in the site's own gold-on-dark style (see SymbolIcon). Keyed by stable slug, not translated name. */
export default function TattooIcon({ slug }) {
  const stroke = { fill: 'none', stroke: '#e6c878', strokeWidth: 2 }
  switch (slug) {
    case 'eye-of-providence':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <polygon points="50,22 78,70 22,70" />
          <ellipse cx="50" cy="58" rx="16" ry="9" />
          <circle cx="50" cy="58" r="4" fill="#e6c878" stroke="none" />
          <path d="M50 30v6M38 34l3 5M62 34l-3 5" strokeWidth="1.4" opacity=".8" />
        </svg>
      )
    case 'silent-owl':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M34 34c-4-8 2-14 8-10M66 34c4-8-2-14-8-10" strokeLinecap="round" />
          <ellipse cx="50" cy="54" rx="20" ry="22" />
          <circle cx="42" cy="50" r="7" />
          <circle cx="58" cy="50" r="7" />
          <circle cx="42" cy="50" r="2.4" fill="#e6c878" stroke="none" />
          <circle cx="58" cy="50" r="2.4" fill="#e6c878" stroke="none" />
          <path d="M50 56l-4 8h8z" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'twin-pillars':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <rect x="30" y="30" width="10" height="46" />
          <rect x="60" y="30" width="10" height="46" />
          <circle cx="35" cy="25" r="6" />
          <circle cx="65" cy="25" r="6" />
          <path d="M24 76h52" strokeWidth="1.6" />
        </svg>
      )
    case 'compass-square':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50 22l25 48H25z" />
          <path d="M30 72h18V54M70 72H52V54" strokeWidth="1.6" opacity=".85" />
          <circle cx="50" cy="50" r="3" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'checkered-floor':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <rect x="28" y="28" width="44" height="44" strokeWidth="1.5" />
          <rect x="28" y="28" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="50" y="28" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="39" y="39" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="61" y="39" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="28" y="50" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="50" y="50" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="39" y="61" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
          <rect x="61" y="61" width="11" height="11" fill="#e6c878" stroke="none" opacity=".85" />
        </svg>
      )
    case 'ouroboros':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="50" r="26" />
          <path d="M50 24c4 3 5 7 2 10" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="46" cy="25" r="2.2" fill="#e6c878" stroke="none" />
        </svg>
      )
    default:
      return null
  }
}
