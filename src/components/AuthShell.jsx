import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'
import BrandFlame from './BrandFlame'
import Img from './Img'

/**
 * Two-column layout shared by Login and Register:
 * a full-height key visual on one side and the form on the other.
 */
export default function AuthShell({ image, imageAlt, quote, kicker, title, sub, children, footer, reverse = false }) {
  return (
    <section className={`auth${reverse ? ' reverse' : ''}`}>
      <div className="auth-visual">
        <Img src={image} alt={imageAlt} eager />
        <div className="auth-visual-cap">
          <span className="auth-visual-mark">
            <BrandFlame circle />
            <BrandMark className="brand-mark" style={{ width: 52, height: 52 }} />
          </span>
          <blockquote>{quote}</blockquote>
          <span className="muted">FICTIONAL / ENTERTAINMENT EXPERIENCE</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-box">
          <Link to="/" className="auth-brand"><BrandFlame /><BrandMark className="brand-mark" /><span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span></Link>
          <div className="eyebrow">{kicker}</div>
          <h1>{title}</h1>
          <p className="auth-sub">{sub}</p>
          {children}
          {footer && <div className="auth-foot">{footer}</div>}
        </div>
      </div>
    </section>
  )
}
