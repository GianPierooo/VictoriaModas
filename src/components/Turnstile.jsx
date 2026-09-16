// ============================================================
// Turnstile — widget de CAPTCHA invisible (Cloudflare) para login/registro/
// recuperar contraseña. Refuerza el rate-limiting por IP que Supabase Auth
// ya trae de fábrica (30 intentos/5min) contra bots automatizados.
// ------------------------------------------------------------
// FALLBACK: si falta VITE_TURNSTILE_SITE_KEY, el componente no renderiza
// nada y `onToken` nunca se llama — el formulario sigue funcionando sin
// captcha (mismo criterio del resto del proyecto: una integración externa
// sin configurar nunca rompe la web). El Secret Key vive SOLO en Supabase
// (Authentication → Settings), nunca en el cliente.
// ============================================================
import { useEffect, useRef } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || null

let scriptPromise = null
function cargarScript() {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  return scriptPromise
}

// `resetToken`: cambia (ej. cuenta que sube) para forzar un reinicio del
// widget desde el padre (por ejemplo, al cambiar de "Ingresar" a
// "Registrarme" o después de un intento fallido).
export default function Turnstile({ onToken, resetToken }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelado = false
    cargarScript().then(() => {
      if (cancelado || !containerRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      })
    })
    return () => {
      cancelado = true
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // el widget ya pudo haberse limpiado solo — no es un error real.
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (resetToken == null) return
    if (widgetIdRef.current != null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      onToken('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken])

  if (!SITE_KEY) return null
  return <div ref={containerRef} className="flex justify-center" />
}
