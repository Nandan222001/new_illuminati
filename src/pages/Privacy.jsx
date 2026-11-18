import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EditorialHeader, { Breadcrumbs } from '../components/EditorialHeader'

export default function Privacy() {
  const { t } = useTranslation()
  return (
    <div className="editorial-frame editorial-page">
      <Breadcrumbs items={[{ label: t('editorial.privacy') }]} />
      <EditorialHeader kicker={t('footer.legal')} title={t('editorial.privacy')} description={t('editorial.privacyIntro')} />
      <div className="editorial-prose" lang="en">
        <section>
          <h2>Reading and device storage</h2>
          <p>You can read the public articles without providing a name or email address. Your browser may store language and sound preferences, a record of the terms you accepted, cached site settings, and a sign-in token if you sign in. The private board can store messages in this browser when its API is offline. That local copy is not a delivery receipt.</p>
          <p>Hosting and API services can receive technical request information such as your IP address and the requested page. Some fonts are provided by Google. External sites and embedded or linked media have their own privacy practices.</p>
        </section>
        <section>
          <h2>Accounts and private correspondence</h2>
          <p>Creating an account provides your name, email and password; the service stores a password hash rather than the password itself. We use account data to sign you in, manage your access and respond to account issues. Messages you submit from a signed-in account are available to you and the site administrators. Use the contact form for support and avoid sending passwords, card numbers or other sensitive information.</p>
        </section>
        <section>
          <h2>Purchases</h2>
          <p>When a checkout is available, <a href="https://razorpay.com/privacy/">Razorpay</a> collects and processes the payment details you supply to it. The site keeps order and payment records needed to confirm the transaction and deliver the digital content, such as payment references, amounts, status and an associated account or checkout email when supplied. Do not send full card details through this site’s message forms.</p>
        </section>
        <section>
          <h2>Your choices and questions</h2>
          <p>You can sign out or clear this site’s browser storage to remove local data. Clearing browser storage does not delete messages, account data or payment records held by the service. To ask about those records or request a correction or deletion, <Link to="/contact">contact the site team</Link>. Some records may still be needed to provide access, resolve disputes or meet legal obligations.</p>
          <p>The <Link to="/rules#terms">Terms &amp; Conditions</Link> describe the separate rules for using the site and its member areas.</p>
        </section>
      </div>
    </div>
  )
}
