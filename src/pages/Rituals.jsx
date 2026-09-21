import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useAuth } from '../context/AuthContext'
import { useContent } from '../context/ContentContext'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import Img from '../components/Img'
import InitiationModal from '../components/InitiationModal'

export default function Rituals() {
  const page = PAGES.rituals
  const { user } = useAuth()
  const { rituals: RITUALS, canAccess } = useContent()
  const [showInitiation, setShowInitiation] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <PageHero kicker={t('content.pages.rituals.kicker')} title={t('content.pages.rituals.title')} sub={t('content.pages.rituals.sub')} image={page.hero} imageMobile={page.heroMobile}>
        <p className="page-intro">{t('content.pages.rituals.intro')}</p>
      </PageHero>

      <section className="page-section">
        <SectionHead
          title={t('rituals.stationsTitle')}
          sub={t('rituals.stationsSub')}
          right={!user && <Link to="/register" className="sec-link">{t('rituals.signUpToUnseal')}</Link>}
        />
        <ol className="ritual-timeline">
          {RITUALS.map((r) => {
            const locked = r.category === 'paid'
            const open = canAccess(r.category)
            return (
              <li className="ritual" key={r.slug} id={r.slug}>
                <div className="ritual-step"><span>{r.step}</span></div>
                <div className={`ritual-card${!open ? ' sealed' : ''}`}>
                  <div className="ritual-img">
                    <Img src={r.img} alt={r.title} />
                    {locked && <span className={`seal-badge${open ? ' unsealed' : ''}`}>{open ? t('common.unsealedBadge') : t('common.sealedBadge')}</span>}
                  </div>
                  <div className="ritual-body">
                    <span className="ritual-meta">{r.duration}</span>
                    <h3>{r.title}</h3>
                    {open ? (
                      <p>{r.desc}</p>
                    ) : user ? (
                      <p className="sealed-text">
                        <Trans i18nKey="rituals.sealedUserText" components={[<button type="button" className="link-btn" onClick={() => setShowInitiation(true)} />]} />
                      </p>
                    ) : (
                      <p className="sealed-text">
                        <Trans i18nKey="rituals.sealedGuestText" components={[<Link to="/login" />, <Link to="/register" />]} />
                      </p>
                    )}
                    <div className="tag-row">{r.tags.map((tag) => <span className="tag fact" key={tag}>{tag.toUpperCase()}</span>)}</div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="page-section band">
        <div className="band-inner">
          <div>
            <div className="sec-title">{t('rituals.bandTitle')}</div>
            <p className="band-text">{t('rituals.bandText')}</p>
          </div>
          <div className="band-actions">
            <Link to="/videos" className="btn-gold">{t('rituals.watchDocs')}</Link>
            <Link to="/about#disclaimer" className="btn-ghost">{t('footer.disclaimer')}</Link>
          </div>
        </div>
      </section>

      <InitiationModal open={showInitiation} onClose={() => setShowInitiation(false)} />
    </>
  )
}
