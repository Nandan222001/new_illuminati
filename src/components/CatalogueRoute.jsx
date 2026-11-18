import { useAuth } from '../context/AuthContext'
import { useConsent } from '../context/ConsentContext'
import ContentProtection from './ContentProtection'

// The public preview never renders the member-only player, e-book reader,
// archive body or gallery. Both entitlement and consent are still required.
export default function CatalogueRoute({ preview, children }) {
  const { user, isAdmin } = useAuth()
  const { consent } = useConsent()
  if (!consent || !(isAdmin || user?.paid)) return preview
  return <><ContentProtection />{children}</>
}
