import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useConsent } from '../context/ConsentContext'
import Navbar from './Navbar'
import Footer from './Footer'
import ConsentGate from './ConsentGate'
import ScrollToTop from './ScrollToTop'
import ContentProtection from './ContentProtection'

export default function Layout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const { ready: contentReady } = useContent()
  const { consent } = useConsent()
  const enterSite = () => navigate('/archives')

  return (
    <>
      <ScrollToTop />
      <ContentProtection />
      {/* Everything inside #site-shell is inert while the consent gate is up. */}
      <div id="site-shell">
        <Navbar onEnter={enterSite} />
        <main id="site-main">
          {contentReady ? (
            <Outlet context={{ enterSite }} />
          ) : (
            <div className="page-loading">
              <div className="sigil-spinner" aria-label="Loading" />
            </div>
          )}
        </main>
        {!isAdmin && <Footer />}
      </div>
      {!consent && pathname !== '/rules' && <ConsentGate />}
    </>
  )
}
