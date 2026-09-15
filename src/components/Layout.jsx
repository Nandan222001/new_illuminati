import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import Navbar from './Navbar'
import Footer from './Footer'
import DisclaimerModal from './DisclaimerModal'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const { ready: contentReady } = useContent()

  return (
    <>
      <ScrollToTop />
      <Navbar onEnter={() => setModalOpen(true)} />
      <main>
        {contentReady ? (
          <Outlet context={{ openDisclaimer: () => setModalOpen(true) }} />
        ) : (
          <div className="page-loading">
            <div className="sigil-spinner" aria-label="Loading" />
          </div>
        )}
      </main>
      {!isAdmin && <Footer />}
      <DisclaimerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnter={() => { setModalOpen(false); navigate('/archives') }}
      />
    </>
  )
}
