import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RoleRoute({ allow, children }) {
  const { hasRole, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ccs-orange border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const ok = allow.some((r) => hasRole(r))
  if (!ok) {
    return <Navigate to="/" replace />
  }

  return children
}
