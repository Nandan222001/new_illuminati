import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { NAV_LINKS } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { socialHandle } from '../utils/social'
import BrandMark from './BrandMark'
import BrandFlame from './BrandFlame'
import SocialLinks from './SocialLinks'

export default function Footer() {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()
  const { social } = useSiteSettings()
  const handle = socialHandle(social.instagram)

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
          {handle && <p className="foot-handle">{handle}</p>}
          <SocialLinks className="social-row footer-social" labels={false} />
        </div>
        <div className="foot-col">
          <h2 className="foot-heading">{t('footer.explore')}</h2>
          {NAV_LINKS.map((l) => <Link key={l.to} to={l.to}>{t(`nav.${l.key}`)}</Link>)}
        </div>
        <div className="foot-col">
          <h2 className="foot-heading">{t('footer.account')}</h2>
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
          <Link to="/about#disclaimer">{t('footer.disclaimer')}</Link>
        </div>
        <div className="foot-col">
          <h2 className="foot-heading">{t('footer.legal')}</h2>
          <Link to="/rules#rule-privacy">{t('footer.privacy')}</Link>
          <Link to="/rules#terms">{t('footer.terms')}</Link>
          <Link to="/rules">{t('footer.guidelines')}</Link>
          <Link to="/community#threads">{t('footer.contact')}</Link>
        </div>
      </div>
      <div className="foot-copy">
        {t('footer.copyright')} · <span className="foot-version">{t('rules.versionNote', { version: '1.1.6' })}</span>
      </div>
    </footer>
  )
}
