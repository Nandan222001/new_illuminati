import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { ready, user, isAdmin } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="page-loading">
        <div className="sigil-spinner" aria-label="Loading" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (adminOnly && !isAdmin) return <Navigate to="/profile" replace state={{ denied: true }} />
  return children
}
