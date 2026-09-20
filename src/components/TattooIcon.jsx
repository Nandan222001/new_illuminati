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
    case 'thirteen-steps':
      return (
        <svg viewBox="0 0 100 100" {...stroke} strokeWidth="1.4">
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M26 74 H74 L74.0 71.4 L72.4 71.4 L72.4 68.8 L70.8 68.8 L70.8 66.2 L69.2 66.2 L69.2 63.6 L67.6 63.6 L67.6 61.0 L66.0 61.0 L66.0 58.4 L64.4 58.4 L64.4 55.8 L62.8 55.8 L62.8 53.2 L61.2 53.2 L61.2 50.6 L59.6 50.6 L59.6 48.0 L58.0 48.0 L58.0 45.4 L56.4 45.4 L56.4 42.8 L54.8 42.8 L54.8 40.2 L45.2 40.2 L45.2 42.8 L43.6 42.8 L43.6 45.4 L42.0 45.4 L42.0 48.0 L40.4 48.0 L40.4 50.6 L38.8 50.6 L38.8 53.2 L37.2 53.2 L37.2 55.8 L35.6 55.8 L35.6 58.4 L34.0 58.4 L34.0 61.0 L32.4 61.0 L32.4 63.6 L30.8 63.6 L30.8 66.2 L29.2 66.2 L29.2 68.8 L27.6 68.8 L27.6 71.4 L26.0 71.4 Z" />
          <polygon points="50,20 58,34 42,34" strokeWidth="1.8" />
          <circle cx="50" cy="29" r="2" fill="#e6c878" stroke="none" />
        </svg>
      )
    case 'coiled-serpent':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M34 76C18 66 30 54 46 52C62 50 72 42 62 33C55 27 44 30 45 38" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M45 38l-6-3 1 8z" fill="#e6c878" stroke="none" />
          <circle cx="47" cy="34" r="1.5" fill="#050203" stroke="none" />
          <path d="M39 39l-4 2M39 39l-3-4" strokeWidth="1" />
        </svg>
      )
    case 'anubis':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M36 62L37 44L42 20L48 38L54 24L58 40L80 52L80 57L64 58L60 64Z" strokeLinejoin="round" fill="rgba(230,200,120,.08)" />
          <path d="M43 30L46 39M54 32L56 39" strokeWidth="1.2" opacity=".7" />
          <path d="M55 48l6-2" strokeWidth="2" strokeLinecap="round" />
          <circle cx="56" cy="48" r="1.6" fill="#e6c878" stroke="none" />
          <path d="M30 68Q50 88 70 68" strokeWidth="2.4" />
          <path d="M37 74Q50 86 63 74" strokeWidth="1.2" opacity=".7" />
        </svg>
      )
    case 'metatrons-cube':
      return (
        <svg viewBox="0 0 100 100" {...stroke} strokeWidth="1.2">
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50.0 20.0 L76.0 35.0 L76.0 65.0 L50.0 80.0 L24.0 65.0 L24.0 35.0 Z M50.0 35.0 L63.0 42.5 L63.0 57.5 L50.0 65.0 L37.0 57.5 L37.0 42.5 Z M50.0 20.0 L76.0 65.0 L24.0 65.0 Z M76.0 35.0 L50.0 80.0 L24.0 35.0 Z M50 50L50.0 20.0 M50 50L76.0 35.0 M50 50L76.0 65.0 M50 50L50.0 80.0 M50 50L24.0 65.0 M50 50L24.0 35.0" opacity=".85" />
          <circle cx="50" cy="50" r="4.2" />
          <circle cx="50.0" cy="35.0" r="4.2" />
          <circle cx="63.0" cy="42.5" r="4.2" />
          <circle cx="63.0" cy="57.5" r="4.2" />
          <circle cx="50.0" cy="65.0" r="4.2" />
          <circle cx="37.0" cy="57.5" r="4.2" />
          <circle cx="37.0" cy="42.5" r="4.2" />
          <circle cx="50.0" cy="20.0" r="4.2" />
          <circle cx="76.0" cy="35.0" r="4.2" />
          <circle cx="76.0" cy="65.0" r="4.2" />
          <circle cx="50.0" cy="80.0" r="4.2" />
          <circle cx="24.0" cy="65.0" r="4.2" />
          <circle cx="24.0" cy="35.0" r="4.2" />
        </svg>
      )
    case 'double-eagle':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50 46l6 6-2 18-4 5-4-5-2-18z" fill="rgba(230,200,120,.1)" />
          <path d="M45 52L41 38M55 52l4-14" />
          <circle cx="40" cy="33" r="4.6" />
          <circle cx="60" cy="33" r="4.6" />
          <path d="M35.6 32L29 34.5l6.6 3zM64.4 32L71 34.5l-6.6 3z" fill="#e6c878" stroke="none" />
          <circle cx="41" cy="32" r="1.3" fill="#e6c878" stroke="none" />
          <circle cx="59" cy="32" r="1.3" fill="#e6c878" stroke="none" />
          <g strokeLinejoin="round">
            <path d="M46 52C37 44 26 43 14 47L21 52L16 58L25 59L23 66L32 63L33 70L42 62L46 66" />
            <path d="M54 52C63 44 74 43 86 47L79 52L84 58L75 59L77 66L68 63L67 70L58 62L54 66" />
          </g>
          <path d="M43 78L50 88L57 78M50 75v13" strokeWidth="1.4" />
        </svg>
      )
    case 'lotus-eye':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M50 78C34 74 25 62 27 52c11 1 20 10 23 26z" fill="rgba(230,200,120,.08)" />
          <path d="M50 78c16-4 25-16 23-26-11 1-20 10-23 26z" fill="rgba(230,200,120,.08)" />
          <path d="M50 78C40 68 40 56 50 46c10 10 10 22 0 32z" fill="rgba(230,200,120,.14)" />
          <ellipse cx="50" cy="34" rx="12" ry="6.5" />
          <circle cx="50" cy="34" r="3.2" fill="#e6c878" stroke="none" />
          <path d="M50 20v4M39 23l2 4M61 23l-2 4" strokeWidth="1.4" />
        </svg>
      )
    case 'hourglass':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M32 24h36M32 78h36" strokeWidth="3" strokeLinecap="round" />
          <path d="M36 24c0 16 10 20 14 26c-4 6-14 10-14 28M64 24c0 16-10 20-14 26c4 6 14 10 14 28" />
          <path d="M40 77l20 0-6-11h-8z" fill="#e6c878" stroke="none" opacity=".9" />
          <path d="M43 30h14l-5 8h-4z" fill="#e6c878" stroke="none" opacity=".5" />
          <path d="M50 50v15" strokeWidth="1" />
        </svg>
      )
    case 'xiii-numeral':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <path d="M18 44l14 22M32 44L18 66" strokeWidth="2.6" />
          <path d="M44 44v22M56 44v22M68 44v22M40 44h8M40 66h8M52 44h8M52 66h8M64 44h8M64 66h8" strokeWidth="2.6" />
          <path d="M18 34h58M18 76h58" strokeWidth="1.2" opacity=".7" />
        </svg>
      )
    case 'the-key':
      return (
        <svg viewBox="0 0 100 100" {...stroke}>
          <circle cx="50" cy="50" r="46" strokeWidth="1" opacity=".6" />
          <circle cx="50" cy="26" r="7" />
          <circle cx="41.5" cy="38" r="7" />
          <circle cx="58.5" cy="38" r="7" />
          <circle cx="50" cy="34" r="3" fill="#e6c878" stroke="none" />
          <path d="M50 45v36M50 66h10M50 74h7" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}
