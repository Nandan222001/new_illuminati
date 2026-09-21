import { useTranslation } from 'react-i18next'
import { PAGES } from '../data/content'
import { useConsent } from '../context/ConsentContext'
import { RULE_KEYS } from '../components/ConsentGate'
import PageHero from '../components/PageHero'
import SectionHead from '../components/SectionHead'

const STEP_KEYS = ['explore', 'join', 'documents', 'help']

export default function Rules() {
  const { t } = useTranslation()
  const { consent, accept } = useConsent()
  const page = PAGES.about
  const acceptedOn = consent && new Date(consent.at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <PageHero kicker={t('rules.kicker')} title={t('rules.title')} sub={t('rules.sub')} image={page.hero} imageMobile={page.heroMobile} />

      <section className="page-section" id="rules">
        <SectionHead title={t('rules.rulesTitle')} sub={t('rules.rulesSub')} />
        <ol className="rule-grid">
          {RULE_KEYS.map((k, i) => (
            <li className="rule-card" key={k} id={`rule-${k}`}>
              <span className="rule-num">{String(i + 1).padStart(2, '0')}</span>
              <h4>{t(`rules.items.${k}.title`)}</h4>
              <p>{t(`rules.items.${k}.text`)}</p>
            </li>
          ))}
        </ol>
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
            ? <span>✓ {t('rules.acceptedOn', { date: acceptedOn })}</span>
            : <button type="button" className="btn-gold" onClick={accept}>{t('rules.acceptRules')}</button>}
        </div>
      </section>
    </>
  )
}
