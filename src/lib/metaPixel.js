// ============================================================
// metaPixel — Meta Pixel (navegador) + Conversions API (servidor)
// ------------------------------------------------------------
// Envía cada evento importante por DOS caminos con el MISMO event_id, para
// que Meta los deduplique (recomendación oficial de Meta):
//   1. El píxel del navegador (fbq) — rápido, pero lo bloquean ad-blockers.
//   2. /api/meta-conversions (servidor) — no lo bloquea nada, mejora el
//      "match quality" al mandar IP/user-agent reales.
//
// FALLBACK: si falta VITE_META_PIXEL_ID, no se carga nada y track()/
// trackPageView() no hacen nada — igual que el resto del proyecto, nunca
// rompe la web por una integración de marketing que aún no está configurada.
//
// PII: solo se manda hasheada (SHA-256) y solo del lado servidor — nunca en
// claro y nunca desde el navegador (ver api/meta-conversions.js).
// ============================================================

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || null
let cargado = false

function cargarScriptPixel() {
  if (cargado || !PIXEL_ID || typeof window === 'undefined') return
  cargado = true

  const f = window
  if (f.fbq) return
  const n = (f.fbq = function (...args) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args)
  })
  f._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []
  const t = document.createElement('script')
  t.async = true
  t.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(t)

  window.fbq('init', PIXEL_ID)
}

// Llamar UNA vez al arrancar la app.
export function initMetaPixel() {
  cargarScriptPixel()
}

function generarEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

// PageView en cada cambio de ruta (SPA — el script solo lo dispara solo una
// vez al cargar, hay que reforzarlo en cada navegación).
export function trackPageView() {
  if (!PIXEL_ID || !window.fbq) return
  window.fbq('track', 'PageView')
}

// Evento de negocio (ViewContent, AddToCart, InitiateCheckout, Lead, ...).
// `customData` = lo que Meta espera en cada evento (content_ids, value,
// currency, etc.); `userData` (opcional) = datos de contacto SIN hashear —
// el hasheo lo hace el servidor, nunca el navegador.
export function trackEvent(eventName, customData = {}, userData = {}) {
  if (!PIXEL_ID) return
  const eventId = generarEventId()

  if (window.fbq) {
    window.fbq('track', eventName, customData, { eventID: eventId })
  }

  // Conversions API — best-effort, nunca bloquea la interacción del usuario.
  try {
    fetch('/api/meta-conversions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventId,
        customData,
        userData,
        url: window.location.href,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* no disponible (SSR, navegador viejo) — el píxel del navegador ya se disparó */
  }
}
