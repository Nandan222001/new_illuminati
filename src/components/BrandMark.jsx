export default function BrandMark({ className = '', style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <polygon points="50,6 95,88 5,88" stroke="#e6c878" strokeWidth="3" fill="rgba(230,200,120,.06)" />
      <polygon points="50,26 78,76 22,76" stroke="#c9a24b" strokeWidth="1.5" fill="none" />
      <ellipse cx="50" cy="60" rx="17" ry="10" stroke="#e6c878" strokeWidth="2" fill="none" />
      <circle cx="50" cy="60" r="5" fill="#e6c878" />
      <circle cx="50" cy="14" r="2.5" fill="#e6c878" />
    </svg>
  )
}
