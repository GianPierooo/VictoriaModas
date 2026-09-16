// ============================================================
// ProfileCompletionGate — bloqueo GLOBAL mientras el perfil no tenga
// nombre y teléfono.
// ------------------------------------------------------------
// El hueco real: Google Sign-In solo trae el correo — nombre y teléfono
// quedan vacíos para siempre en `perfiles` si nada los pide después. La
// primera versión de este gate vivía solo dentro de "Mi cuenta" (dentro
// de AccountPage), pero eso dejaba a la clienta seguir navegando el
// resto del sitio (menú, otras páginas) sin completarlo — se movió acá,
// montado una sola vez arriba del router (ver main.jsx), para que
// bloquee TODA la web hasta que complete los datos, sin importar en qué
// página esté.
//
// No es descartable (Dialog con onClose vacío: ni Escape ni click afuera
// lo cierran) — pero sí se puede cerrar sesión desde adentro, para no
// dejar a nadie sin salida.
// ============================================================
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import CompleteProfileForm from './CompleteProfileForm.jsx'

// Se monta fuera del <RouterProvider> (ver main.jsx) para poder bloquear
// cualquier ruta por igual, así que NO puede usar useNavigate (requiere
// estar dentro del árbol del router) — cerrar sesión simplemente deja que
// el resto de la app reaccione sola a `user` volviéndose null, sin forzar
// una redirección.
export default function ProfileCompletionGate() {
  const { user, profile, loading, profileLoading, signOut } = useAuth()
  const toast = useToast()

  // Nunca mostrar nada mientras la sesión/perfil todavía están cargando —
  // evita un parpadeo falso del gate en el primer render tras iniciar sesión.
  if (loading || profileLoading || !user || !profile) return null

  const incompleto = !profile.nombre?.trim() || !profile.telefono?.trim()
  if (!incompleto) return null

  const handleLogout = async () => {
    await signOut()
    toast.success('Sesión cerrada.')
  }

  return (
    <Dialog open onClose={() => {}} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-ink/50 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-2xl bg-cream p-6 shadow-soft sm:p-8">
          <p className="mb-1 text-center text-[11px] uppercase tracking-luxe text-clay">Un último paso</p>
          <DialogTitle className="mb-6 text-center font-serif text-2xl font-light text-ink">
            Completa tu perfil
          </DialogTitle>
          <CompleteProfileForm profile={profile} />
          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 block w-full text-center text-[11px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink cursor-pointer"
          >
            Cerrar sesión
          </button>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
