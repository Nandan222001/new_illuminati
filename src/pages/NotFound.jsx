import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

export default function NotFound() {
  return (
    <PageHero kicker="THE DOOR IS NOT HERE" title="404" sub="THIS CHAMBER DOES NOT EXIST — OR IT HAS NOT BEEN WRITTEN YET." image="/assets/about-hero.jpg" imageMobile="/assets/about-hero-mobile.jpg">
      <div className="hero-cta center">
        <Link to="/" className="btn-gold">RETURN HOME ›</Link>
        <Link to="/archives" className="btn-ghost">THE ARCHIVES</Link>
      </div>
    </PageHero>
  )
}
