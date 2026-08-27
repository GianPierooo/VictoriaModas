import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import PageLoader from './PageLoader.jsx'

// ============================================================
// RequireRole — protege rutas por rol (admin/vendedor/cliente).
// ------------------------------------------------------------
// Mientras carga la sesión O el perfil (son dos cargas separadas — ver
// AuthContext), muestra el loader de siempre; nunca decide con datos a
// medias. Sin sesión → a /mi-cuenta a iniciar sesión. Con sesión pero rol
// no permitido → al home, con aviso (el aviso vive en un efecto aparte,
// nunca durante el render de este componente).
// ============================================================
export default function RequireRole({ allow, children }) {
  const { user, profile, loading, profileLoading } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/mi-cuenta" replace />
  if (profileLoading) return <PageLoader />
  if (!profile || !allow.includes(profile.rol)) return <Unauthorized />

  return children
}

function Unauthorized() {
  const toast = useToast()
  useEffect(() => {
    toast.error('No tienes permiso para ver esta página.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <Navigate to="/" replace />
}
