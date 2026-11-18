import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import BrandMark from './BrandMark'
import SocialLinks from './SocialLinks'

export default function Footer() {
  const { user, isAdmin } = useAuth()
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="foot-top">
        <div className="foot-col foot-about">
          <Link className="foot-brand" to="/">
            <BrandMark className="brand-mark" style={{ width: 40, height: 40 }} />
            <span className="brand-name">ILLUMINATI<small>BROTHERHOOD</small></span>
          </Link>
          <p className="foot-desc">{t('editorial.disclaimer')}</p>
          <p className="foot-desc">{t('editorial.accessDisclosure')}</p>
          <SocialLinks className="social-row footer-social" labels={false} />
        </div>
        <div className="foot-col">
          <h2 className="foot-heading">{t('footer.explore')}</h2>
          <Link to="/stories">{t('editorial.stories')}</Link>
          <Link to="/visuals">{t('editorial.symbols')}</Link>
          <Link to="/archives">{t('nav.archives')}</Link>
          <Link to="/videos">{t('nav.videos')}</Link>
          <Link to="/new-order">{t('nav.newOrder')}</Link>
        </div>
        <div className="foot-col">
          <h2 className="foot-heading">{t('footer.legal')}</h2>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('editorial.contact.title')}</Link>
          <Link to="/privacy">{t('editorial.privacy')}</Link>
          <Link to="/rules#terms">{t('editorial.terms')}</Link>
          <Link to="/about#disclaimer">{t('footer.disclaimer')}</Link>
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
              <Link to="/login">{t('editorial.signIn')}</Link>
              <Link to="/register">{t('editorial.contact.register')}</Link>
            </>
          )}
          <Link to="/archives#library">{t('nav.library')}</Link>
          <Link to="/rituals">{t('nav.rituals')}</Link>
          <Link to="/community">{t('nav.community')}</Link>
          <Link to="/why-999">{t('editorial.catalogue.accessDetails')}</Link>
        </div>
      </div>
      <div className="foot-copy">{t('footer.copyright')}</div>
    </footer>
  )
}
