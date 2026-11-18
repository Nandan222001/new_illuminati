import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EditorialHeader, { Breadcrumbs } from '../components/EditorialHeader'

export default function About() {
  const { t } = useTranslation()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('nav.about') }]} />
      <EditorialHeader kicker={t('editorial.home.kicker')} title={t('editorial.about.title')} description={t('editorial.about.description')} />
      <div className="editorial-prose" lang="en">
        <section id="editorial">
          <h2>How we write the stories</h2>
          <p>New articles are credited to Illuminati Brotherhood Editorial. We distinguish historical records from later interpretations and from fiction. Where an article discusses a document, object or public speech, look for its source at the end of the article. We use archives, museum and university collections, and published research so readers can check our work.</p>
          <p>If you spot a misleading label, a factual error or a source that no longer opens, <Link to="/contact">tell us which page and what needs changing</Link>. A material revision is reflected in the article’s update date.</p>
        </section>
        <section id="faq">
          <h2>Frequently asked questions</h2>
          <h3>Do I need an account to read the educational articles?</h3>
          <p>No. The <Link to="/stories">public stories</Link> and catalogue previews can be read without signing in or paying.</p>
          <h3>How do the fictional archive and the articles differ?</h3>
          <p>The <Link to="/archives">archive</Link> presents invented characters, settings and scenes. It can draw on historical imagery, but it is not a historical source. The articles link to evidence and label speculation instead of blending it into the historical record.</p>
          <h3>What does paid access cover?</h3>
          <p>Some digital materials are available with paid site access, and the separate book shop may sell a digital download. Neither is admission to an organization. See <Link to="/why-999">what paid site access covers</Link> and read the <Link to="/rules#terms">Terms &amp; Conditions</Link> before any purchase.</p>
        </section>
      </div>
      <section className="editorial-notice editorial-about-notice" id="disclaimer">
        <h2>{t('footer.disclaimer')}</h2>
        <p>{t('editorial.disclaimer')}</p>
        <p>{t('editorial.accessDisclosure')}</p>
        <p>{t('editorial.about.noPromises')}</p>
      </section>
    </div>
  )
}
