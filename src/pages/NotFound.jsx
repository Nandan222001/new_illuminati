import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageHero from '../components/PageHero'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <PageHero kicker={t('notFound.kicker')} title="404" sub={t('notFound.sub')} image="/assets/about-hero.jpg" imageMobile="/assets/about-hero-mobile.jpg">
      <div className="hero-cta center">
        <Link to="/" className="btn-gold">{t('notFound.returnHome')}</Link>
        <Link to="/archives" className="btn-ghost">{t('nav.archives')}</Link>
      </div>
    </PageHero>
  )
}
