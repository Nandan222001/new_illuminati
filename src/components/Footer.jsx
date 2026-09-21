import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAV_LINKS } from '../data/content'
import { useAuth } from '../context/AuthContext'
import BrandMark from './BrandMark'
import BrandFlame from './BrandFlame'

export default function Footer() {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()
  return (
    <footer>
      <div className="foot-top">
        <div className="foot-col foot-about">
          <div className="foot-brand">
            <BrandFlame />
            <BrandMark className="brand-mark" style={{ width: 40, height: 40 }} />
            <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
          </div>
          <p className="foot-desc">{t('footer.description')}</p>
          <div className="social-row">
            <a href="#" title="Instagram" onClick={(e) => e.preventDefault()}>📷</a>
            <a href="#" title="Discord" onClick={(e) => e.preventDefault()}>🎮</a>
            <a href="#" title="Telegram" onClick={(e) => e.preventDefault()}>✈</a>
            <a href="#" title="YouTube" onClick={(e) => e.preventDefault()}>▶</a>
            <a href="#" title="X" onClick={(e) => e.preventDefault()}>𝕏</a>
          </div>
        </div>
        <div className="foot-col">
          <h6>{t('footer.explore')}</h6>
          {NAV_LINKS.map((l) => <Link key={l.to} to={l.to}>{t(`nav.${l.key}`)}</Link>)}
        </div>
        <div className="foot-col">
          <h6>{t('footer.account')}</h6>
          {user ? (
            <>
              <Link to="/profile">{t('nav.myProfile')}</Link>
              {isAdmin && <Link to="/admin">{t('nav.adminPanel')}</Link>}
            </>
          ) : (
            <>
              <Link to="/login">{t('nav.login')}</Link>
              <Link to="/register">{t('nav.register')}</Link>
            </>
          )}
          <Link to="/about#faq">{t('footer.faq')}</Link>
          <Link to="/rules">{t('footer.guidelines')}</Link>
        </div>
        <div className="foot-col">
          <h6>{t('footer.legal')}</h6>
          <Link to="/rules#rule-privacy">{t('footer.privacy')}</Link>
          <Link to="/rules#rules">{t('footer.terms')}</Link>
          <a href="#" onClick={(e) => e.preventDefault()}>{t('footer.contact')}</a>
        </div>
      </div>
      <div className="foot-copy">{t('footer.copyright')}</div>
    </footer>
  )
}
