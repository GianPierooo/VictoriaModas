// ============================================================
// /api/meta-conversions — Meta Conversions API (server-side)
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// Recibe un evento desde src/lib/metaPixel.js (trackEvent) y lo reenvía a
// la Graph API de Meta con el token de servidor. El token NUNCA llega al
// navegador — vive solo en META_CAPI_ACCESS_TOKEN (env var de Vercel).
//
// Regla de oro (igual que /api/pedido): esto es marketing, no debe romper
// NADA de la compra. Si falta configuración o falla el envío a Meta,
// responde 200 con ok:false — nunca 500, nunca bloquea al que llama.
//
// PII (teléfono/correo) se hashea con SHA-256 acá, del lado servidor, antes
// de mandarla — nunca en claro (requisito de Meta + buena práctica).
//
// HIGIENE DE DATOS (no es una barrera de seguridad real): este endpoint no
// expone nada sensible — solo reenvía datos hasheados a Meta — así que no
// tiene sentido protegerlo con un "secreto" que de todas formas viajaría en
// el bundle del navegador (cualquiera con curl podría copiarlo). Lo único
// que sí vale la pena, y lo que se hace acá, es rechazar eventos que no
// tengan la FORMA que este sitio realmente manda — nombre de evento fuera
// de los que usa Victoria Modas, o campos con tipos raros — así una llamada
// directa al endpoint no puede meter basura arbitraria a las campañas.
// ============================================================
import crypto from 'node:crypto'

// Los únicos eventos que este sitio dispara de verdad (ver metaPixel.js).
const EVENTOS_PERMITIDOS = new Set(['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Lead', 'Purchase', 'Contact'])

function sha256(valor) {
  return crypto.createHash('sha256').update(String(valor).trim().toLowerCase()).digest('hex')
}

// Valida la FORMA de customData contra lo que este sitio realmente manda —
// no bloquea a nadie decidido a mandar valores falsos con la forma correcta
// (eso es una limitación inherente a cualquier API de conversión reportada
// por el cliente, incluido el propio píxel de Meta), pero sí descarta
// basura obviamente inválida.
function customDataValida(customData) {
  if (customData == null) return true
  if (typeof customData !== 'object' || Array.isArray(customData)) return false
  if (customData.currency != null && customData.currency !== 'PEN') return false
  if (customData.value != null && typeof customData.value !== 'number') return false
  if (customData.num_items != null && typeof customData.num_items !== 'number') return false
  if (customData.content_ids != null) {
    if (!Array.isArray(customData.content_ids)) return false
    if (!customData.content_ids.every((id) => typeof id === 'string' && id.length <= 100)) return false
  }
  return true
}

function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  return typeof body === 'object' ? body : {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID
  const token = process.env.META_CAPI_ACCESS_TOKEN
  if (!pixelId || !token) {
    // No configurado todavía — no es un error, solo no hay nada que mandar.
    return res.status(200).json({ ok: false, skipped: true })
  }

  const body = parseBody(req.body)
  const { eventName, eventId, customData, userData, url } = body
  if (!eventName || !eventId) {
    return res.status(400).json({ ok: false, error: 'Falta eventName o eventId.' })
  }
  if (!EVENTOS_PERMITIDOS.has(eventName)) {
    return res.status(400).json({ ok: false, error: 'eventName no reconocido.' })
  }
  if (!customDataValida(customData)) {
    return res.status(400).json({ ok: false, error: 'customData con forma inválida.' })
  }

  // `req.headers` no existe en el shim de desarrollo (ver vite.config.js) —
  // opcional en todos lados para no reventar en local.
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.headers?.['x-real-ip']
  const userAgent = req.headers?.['user-agent']

  const userDataHasheada = {}
  if (userData?.telefono) userDataHasheada.ph = [sha256(String(userData.telefono).replace(/\D/g, ''))]
  if (userData?.email) userDataHasheada.em = [sha256(userData.email)]
  if (ip) userDataHasheada.client_ip_address = ip
  if (userAgent) userDataHasheada.client_user_agent = userAgent

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: url || undefined,
        action_source: 'website',
        user_data: userDataHasheada,
        custom_data: customData || {},
      },
    ],
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const upstream = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const data = await upstream.json().catch(() => null)
    if (!upstream.ok) {
      console.error('[api/meta-conversions] Meta devolvió error:', upstream.status, JSON.stringify(data))
      return res.status(200).json({ ok: false, error: 'Meta rechazó el evento.' })
    }
    return res.status(200).json({ ok: true, events_received: data?.events_received ?? null })
  } catch (err) {
    console.error('[api/meta-conversions] fallo al enviar:', err && err.message)
    return res.status(200).json({ ok: false, error: 'No se pudo enviar el evento.' })
  } finally {
    clearTimeout(timeout)
  }
}
