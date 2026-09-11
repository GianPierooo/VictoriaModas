// ============================================================
// /api/whatsapp-embedded-signup — completa la conexión de WhatsApp
// Embedded Signup (coexistencia) del lado del servidor.
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM). Se llama UNA sola
// vez, desde public/whatsapp-setup.html (herramienta interna, uso único
// del dueño del negocio), después de que Meta redirige de vuelta con un
// `code` de un solo uso en la URL.
//
// NOTA: se usa la redirección clásica de OAuth (navegación de página
// completa a facebook.com/dialog/oauth), NO el popup vía FB.login() del
// SDK de JavaScript — ese popup depende de FedCM (Federated Credential
// Management), una función de navegador que Meta lanzó en beta abierta a
// fines de agosto de 2026 y que, al probarla, falló con "Not signed in
// with the identity provider" incluso con sesión de Facebook iniciada.
// La redirección clásica no usa FedCM, así que evita ese bug.
//
// Como no hay popup, tampoco hay postMessage con el waba_id — este
// endpoint lo DESCUBRE solo con el access token resultante:
//   1. Intercambia el `code` por un access token.
//   2. Lista los negocios del usuario (/me/businesses).
//   3. Para cada negocio, lista sus cuentas de WhatsApp
//      (/{business-id}/owned_whatsapp_business_accounts).
//   4. Si hay una sola WABA candidata (o el cliente ya la pasó), la usa;
//      si hay varias, las devuelve todas para que el dueño elija.
//   5. Suscribe la app a la WABA elegida (/{waba-id}/subscribed_apps).
//
// Secretos, SOLO en env vars: META_APP_ID (no es secreto en sí, pero
// vive aquí para no repetirlo) y META_APP_SECRET (nunca al cliente).
// ============================================================

const GRAPH_VERSION = 'v21.0'

async function graphGet(path, accessToken) {
  const sep = path.includes('?') ? '&' : '?'
  const resp = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}${sep}access_token=${encodeURIComponent(accessToken)}`)
  const data = await resp.json()
  return { ok: resp.ok, data }
}

// Recorre los negocios del usuario y sus WABAs, devolviendo la lista de
// candidatas con su número de teléfono asociado (para poder identificar
// cuál es la real vs. la de prueba).
async function descubrirWabas(accessToken) {
  const candidatas = []
  const { ok: okBiz, data: negocios } = await graphGet('me/businesses?limit=50', accessToken)
  if (!okBiz || !Array.isArray(negocios.data)) return candidatas

  for (const negocio of negocios.data) {
    const { ok: okWaba, data: wabas } = await graphGet(`${negocio.id}/owned_whatsapp_business_accounts?limit=50`, accessToken)
    if (!okWaba || !Array.isArray(wabas.data)) continue
    for (const waba of wabas.data) {
      const { ok: okTel, data: telefonos } = await graphGet(`${waba.id}/phone_numbers?limit=50`, accessToken)
      const numeros = okTel && Array.isArray(telefonos.data) ? telefonos.data : []
      candidatas.push({
        businessId: negocio.id,
        businessName: negocio.name,
        wabaId: waba.id,
        telefonos: numeros.map((n) => ({ id: n.id, numero: n.display_phone_number })),
      })
    }
  }
  return candidatas
}

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
  const wabaIdElegida = String(body.wabaId || '').trim()
  const redirectUri = String(body.redirectUri || '').trim()
  if (!code || !redirectUri) {
    return res.status(400).json({ ok: false, error: 'Falta code o redirectUri.' })
  }

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  if (!appId || !appSecret) {
    console.error('[whatsapp-embedded-signup] faltan META_APP_ID o META_APP_SECRET en el servidor.')
    return res.status(500).json({ ok: false, error: 'Falta configuración en el servidor (META_APP_ID / META_APP_SECRET).' })
  }

  try {
    // 1. Intercambiar el code por un access token (mismo redirect_uri que
    // se usó para pedirlo, exigencia del OAuth de Meta).
    const tokenUrl =
      `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token` +
      `?client_id=${encodeURIComponent(appId)}` +
      `&client_secret=${encodeURIComponent(appSecret)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${encodeURIComponent(code)}`
    const tokenResp = await fetch(tokenUrl)
    const tokenData = await tokenResp.json()
    if (!tokenResp.ok || !tokenData.access_token) {
      console.error('[whatsapp-embedded-signup] fallo al intercambiar el code:', JSON.stringify(tokenData).slice(0, 500))
      return res.status(502).json({ ok: false, error: 'No se pudo intercambiar el código con Meta.', detail: tokenData })
    }
    const accessToken = tokenData.access_token

    // 2. Si el cliente no indicó a qué WABA suscribirse, la descubrimos.
    let wabaId = wabaIdElegida
    let candidatas = []
    if (!wabaId) {
      candidatas = await descubrirWabas(accessToken)
      if (candidatas.length === 0) {
        return res.status(200).json({
          ok: false,
          error: 'Se conectó con Meta pero no se encontró ninguna cuenta de WhatsApp Business asociada todavía. Puede tardar unos minutos en aparecer — intenta de nuevo en un momento.',
        })
      }
      if (candidatas.length > 1) {
        // Varias candidatas: se le muestran al dueño para que elija en vez
        // de adivinar (evita suscribir la WABA equivocada).
        return res.status(200).json({ ok: false, needsChoice: true, candidatas })
      }
      wabaId = candidatas[0].wabaId
    }

    // 3. Suscribir esta app a la WABA elegida (para recibir sus webhooks).
    const subResp = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(wabaId)}/subscribed_apps`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const subData = await subResp.json()
    if (!subResp.ok) {
      console.error('[whatsapp-embedded-signup] fallo al suscribir la app a la WABA:', JSON.stringify(subData).slice(0, 500))
      return res.status(502).json({ ok: false, error: 'No se pudo suscribir la app a la cuenta de WhatsApp.', detail: subData })
    }

    // 4. Devolver el/los número(s) de esa WABA para que el dueño sepa qué
    // Phone Number ID poner en Vercel.
    const { data: telefonos } = await graphGet(`${wabaId}/phone_numbers?limit=50`, accessToken)
    const numeros = Array.isArray(telefonos.data) ? telefonos.data : []

    return res.status(200).json({ ok: true, wabaId, subscribed: subData, telefonos: numeros })
  } catch (err) {
    console.error('[whatsapp-embedded-signup] excepción:', err && err.message)
    return res.status(500).json({ ok: false, error: 'Fallo inesperado en el servidor.' })
  }
}
