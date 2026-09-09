import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import DisclaimerModal from './DisclaimerModal'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <ScrollToTop />
      <Navbar onEnter={() => setModalOpen(true)} />
      <main>
        <Outlet context={{ openDisclaimer: () => setModalOpen(true) }} />
      </main>
      <Footer />
      <DisclaimerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEnter={() => { setModalOpen(false); navigate('/archives') }}
      />
    </>
  )
}
