// ============================================================
// /api/whatsapp-embedded-signup — completa la conexión de WhatsApp
// Embedded Signup (coexistencia) del lado del servidor.
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM). Se llama UNA sola
// vez, desde public/whatsapp-setup.html (herramienta interna, uso único
// del dueño del negocio), después de que el flujo de Meta (FB.login con
// el config_id de "Embedded Signup con coexistencia") devuelve un `code`
// de un solo uso y el `wabaId` de la cuenta de WhatsApp Business.
//
// Hace 2 llamadas a la Graph API de Meta:
//   1. Intercambia el `code` por un access token (endpoint estándar de
//      OAuth de Facebook — el `code` solo dura ~30 segundos).
//   2. Suscribe esta app (Victoria Modas Bot) a esa WABA
//      (`POST /{waba-id}/subscribed_apps`), para que los mensajes que
//      lleguen a ese número real empiecen a disparar nuestro webhook
//      (api/whatsapp-webhook.js) igual que ya pasa con el número de
//      prueba.
//
// Secretos, SOLO en env vars: META_APP_ID (no es secreto en sí, pero
// vive aquí para no repetirlo) y META_APP_SECRET (nunca al cliente).
// ============================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}')
    } catch {
      body = {}
    }
  }
  body = body || {}

  const code = String(body.code || '').trim()
  const wabaId = String(body.wabaId || '').trim()
  if (!code || !wabaId) {
    return res.status(400).json({ ok: false, error: 'Falta code o wabaId.' })
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) {
    console.error('[whatsapp-embedded-signup] faltan META_APP_ID o META_APP_SECRET en el servidor.')
    return res.status(500).json({ ok: false, error: 'Falta configuración en el servidor (META_APP_ID / META_APP_SECRET).' })
  }

  try {
    // 1. Intercambiar el code por un access token.
    const tokenUrl =
      `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?client_id=${encodeURIComponent(appId)}` +
      `&client_secret=${encodeURIComponent(appSecret)}` +
      `&code=${encodeURIComponent(code)}`
    const tokenResp = await fetch(tokenUrl)
    const tokenData = await tokenResp.json()
    if (!tokenResp.ok || !tokenData.access_token) {
      console.error('[whatsapp-embedded-signup] fallo al intercambiar el code:', JSON.stringify(tokenData).slice(0, 500))
      return res.status(502).json({ ok: false, error: 'No se pudo intercambiar el código con Meta.', detail: tokenData })
    }

    // 2. Suscribir esta app a la WABA (para recibir sus webhooks).
    const subResp = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(wabaId)}/subscribed_apps`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const subData = await subResp.json()
    if (!subResp.ok) {
      console.error('[whatsapp-embedded-signup] fallo al suscribir la app a la WABA:', JSON.stringify(subData).slice(0, 500))
      return res.status(502).json({ ok: false, error: 'No se pudo suscribir la app a la cuenta de WhatsApp.', detail: subData })
    }

    return res.status(200).json({ ok: true, subscribed: subData })
  } catch (err) {
    console.error('[whatsapp-embedded-signup] excepción:', err && err.message)
    return res.status(500).json({ ok: false, error: 'Fallo inesperado en el servidor.' })
  }
}
