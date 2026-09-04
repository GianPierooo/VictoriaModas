// ============================================================
// GoogleSignInButton — entrar/registrarse con Google (Supabase OAuth)
// ------------------------------------------------------------
// Botón outline en la paleta del sitio (cream/ink/clay) con la "G" oficial
// de Google en sus 4 colores — las guías de marca de Google piden usar el
// logo tal cual, así que ese es el único color ajeno a la paleta.
//
// Si el proveedor de Google no está activado en Supabase, signInWithGoogle
// devuelve error y se avisa con un toast: nunca rompe la página.
// ============================================================
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

function LogoGoogle() {
  return (
    <svg className="h-[18px] w-[18px] flex-shrink-0" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

export default function GoogleSignInButton({ label = 'Continuar con Google' }) {
  const { signInWithGoogle } = useAuth()
  const toast = useToast()
  const [cargando, setCargando] = useState(false)

  const handleClick = async () => {
    setCargando(true)
    const { error } = (await signInWithGoogle()) || {}
    if (error) {
      setCargando(false)
      toast.error('No se pudo entrar con Google. Intenta con tu correo o escríbenos por WhatsApp.')
      return
    }
    // Si no hubo error, el navegador ya está yéndose a Google — se deja el
    // botón en estado "cargando" hasta que se complete la redirección.
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cargando}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/20 bg-white px-9 py-4 text-xs uppercase tracking-[0.15em] text-ink transition-colors duration-500 hover:border-ink disabled:opacity-60"
    >
      <LogoGoogle />
      {cargando ? 'Conectando…' : label}
    </button>
  )
}
