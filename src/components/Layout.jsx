import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useConsent } from '../context/ConsentContext'
import Navbar from './Navbar'
import Footer from './Footer'
import ConsentGate from './ConsentGate'
import ScrollToTop from './ScrollToTop'
import ContentProtection from './ContentProtection'

export default function Layout({ requiresConsent = false }) {
  const { consent } = useConsent()
  const { t } = useTranslation()
  const blocked = requiresConsent && !consent

  return (
    <>
      <ScrollToTop />
      {requiresConsent && <ContentProtection />}
      <div id="site-shell">
        <a className="skip-to-content" href="#site-main">{t('editorial.skip')}</a>
        <Navbar />
        <main id="site-main" tabIndex={-1}>
          {!blocked && <Outlet />}
        </main>
        <Footer />
      </div>
      {blocked && <ConsentGate />}
    </>
  )
}
