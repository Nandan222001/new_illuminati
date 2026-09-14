export default function BrandMark({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="bm-flame-core" cx="50%" cy="72%" r="55%">
          <stop offset="0%" stopColor="#fff2c6" />
          <stop offset="35%" stopColor="#ff9a35" />
          <stop offset="70%" stopColor="#e8541f" stopOpacity=".75" />
          <stop offset="100%" stopColor="#7a1f0a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bm-flame-body" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff5a1a" />
          <stop offset="55%" stopColor="#ffa83c" />
          <stop offset="100%" stopColor="#ffe9a0" />
        </linearGradient>
        <filter id="bm-flame-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <path id="bm-flame-shape" d="M10,0 C4,10 -1,19 3,27 C-1,25 -3,31 1,35 C5,38.5 16,38.5 19,35 C23,31 21,25 17,27 C21,19 16,10 10,0 Z" />
      </defs>

      {/* flame glow + tongues, rendered behind the emblem */}
      <g className="bm-flames">
        <ellipse className="bm-flame-glow" cx="50" cy="66" rx="42" ry="32" fill="url(#bm-flame-core)" filter="url(#bm-flame-blur)" />
        <use href="#bm-flame-shape" className="bm-flame bm-flame-a" transform="translate(24,50) scale(1.2)" fill="url(#bm-flame-body)" opacity=".8" />
        <use href="#bm-flame-shape" className="bm-flame bm-flame-b" transform="translate(39,28) scale(1.55)" fill="url(#bm-flame-body)" opacity=".95" />
        <use href="#bm-flame-shape" className="bm-flame bm-flame-c" transform="translate(58,52) scale(1.15)" fill="url(#bm-flame-body)" opacity=".8" />
      </g>

      <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" fill="rgba(230,200,120,.06)" />
      <polygon points="50,26 78,76 22,76" stroke="#c9a24b" strokeWidth="1.5" fill="none" />
      <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" fill="none" />
      <circle cx="50" cy="60" r="5" fill="#e6c878" />
      <circle cx="50" cy="14" r="2.5" fill="#e6c878" />
    </svg>
  )
}
