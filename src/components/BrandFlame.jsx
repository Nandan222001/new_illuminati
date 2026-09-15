/**
 * Moving flame background for a brand lockup. Render as the first child of a
 * position:relative container holding the icon + wordmark (e.g. `.brand`,
 * `.admin-brand`, `.foot-brand`, `.auth-brand`) so the flame glows behind
 * both, not just the icon. Pass `circle` for icon-only spots.
 */
export default function BrandFlame({ circle = false, button = false }) {
  const variant = button ? ' button' : circle ? ' circle' : ''
  return (
    <span className={`brand-flame-full${variant}`} aria-hidden="true">
      <video autoPlay muted loop playsInline preload="auto">
        <source src="/assets/brand-flame-loop.webm" type="video/webm" />
        <source src="/assets/brand-flame-loop.mp4" type="video/mp4" />
      </video>
      <span className="brand-flame-static" />
    </span>
  )
}
