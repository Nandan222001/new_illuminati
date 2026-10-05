import { useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useConsent } from '../context/ConsentContext'
import { CONSENT_VERSION } from '../utils/consent'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'
import TermsDocument from '../components/TermsDocument'

const STEP_KEYS = ['explore', 'join', 'documents', 'help']

export default function Rules() {
  const { t } = useTranslation()
  const { consent, accept } = useConsent()
  const page = PAGES.about
  const acceptedOn = consent && new Date(consent.at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <PageHero kicker={t('rules.kicker')} title={t('rules.title')} sub={t('rules.sub')} image={page.hero} imageMobile={page.heroMobile} />

      <p className="rules-version">
        <b>{t('rules.version')}</b> · {t('rules.versionNote', { version: CONSENT_VERSION })}
      </p>

      {/* The full Terms & Conditions, verbatim from src/data/terms.js — the same
          document the entry gate shows. */}
      <section className="page-section" id="terms">
        <SectionHead title={t('rules.termsTitle')} sub={t('rules.termsSub')} />
        <div className="terms-wrap">
          <TermsDocument />
        </div>
      </section>

      <section className="page-section" id="instructions">
        <SectionHead title={t('rules.instrTitle')} sub={t('rules.instrSub')} />
        <ol className="step-grid">
          {STEP_KEYS.map((k, i) => (
            <li className="step-card" key={k}>
              <span className="rule-num">{String(i + 1).padStart(2, '0')}</span>
              <h4>{t(`rules.steps.${k}.title`)}</h4>
              <p>{t(`rules.steps.${k}.text`)}</p>
            </li>
          ))}
        </ol>
        <p className="rules-wellbeing">{t('rules.wellbeing')}</p>
        <div className="rules-consent">
          {consent
            ? <span>✓ {t('rules.acceptedOn', { date: acceptedOn, version: consent.version || CONSENT_VERSION })}</span>
            : <button type="button" className="btn-gold" onClick={accept}>{t('rules.acceptRules')}</button>}
        </div>
      </section>

      {/* Kept for the footer “Privacy” link and the account/privacy statement. */}
      <section className="page-section" id="rule-privacy">
        <SectionHead title={t('rules.items.privacy.title')} />
        <p className="rules-wellbeing">{t('rules.items.privacy.text')}</p>
      </section>
    </>
  )
}
