import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'
import WhyFee from '../components/WhyFee'
import InitiationModal from '../components/InitiationModal'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../context/SiteSettingsContext'

/**
 * Public "/why-999" page — the same explanation the initiation modal shows
 * before Checkout opens, so the fee can be linked from the terms, the register
 * form, the paywall and the footer.
 */
export default function Why999() {
  const { user, isAdmin } = useAuth()
  const { joiningFee } = useSiteSettings()
  const { t } = useTranslation()
  const [showInitiation, setShowInitiation] = useState(false)
  const paid = isAdmin || !!user?.paid

  return (
    <>
      <PageHero
        kicker={t('whyFee.pageKicker')}
        title={t('whyFee.pageTitle', { fee: joiningFee })}
        sub={t('whyFee.pageSub')}
        image="/assets/about-hero.jpg"
        imageMobile="/assets/about-hero-mobile.jpg"
        compact
      />

      <section className="page-section why-page">
        <WhyFee fee={joiningFee} showTermsLink />

        <div className="why-page-cta">
          {paid ? (
            <Link to="/archives" className="btn-gold">{t('whyFee.ctaPaid')}</Link>
          ) : user ? (
            <button type="button" className="btn-gold" onClick={() => setShowInitiation(true)}>{t('whyFee.continue', { fee: joiningFee })}</button>
          ) : (
            <Link to="/register" className="btn-gold">{t('whyFee.ctaRegister')}</Link>
          )}
          <Link to="/" className="btn-ghost">{t('whyFee.back')}</Link>
        </div>

        {user && !paid && <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />}
      </section>
    </>
  )
}
