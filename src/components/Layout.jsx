import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useConsent } from '../context/ConsentContext'
import Navbar from './Navbar'
import Footer from './Footer'
import ConsentGate from './ConsentGate'
import CountdownBar from './CountdownBar'
import ScrollToTop from './ScrollToTop'

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
      {/* Everything inside #site-shell is inert while the consent gate is up. */}
      <div id="site-shell">
        {/* Membership countdown (upper row) + joined-members total (below it). */}
        <CountdownBar />
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
