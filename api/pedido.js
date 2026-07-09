// ============================================================
// /api/pedido — registra un pedido en la hoja (pestaña "Pedidos")
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// Recibe un POST con el pedido y lo reenvía al Apps Script web app
// (su doPost agrega la fila a "Pedidos" con fecha/estado). La URL del web
// app es SECRETA: solo desde process.env.SHEETS_WEBAPP_URL, NUNCA al cliente.
//
// Regla de oro (ver CLAUDE.md): registrar el pedido NUNCA debe romper la
// venta. Si falta la URL o el POST falla, responde { ok:false } SIN reventar
// y deja el pedido completo en los logs para recuperarlo a mano (nunca se
// pierde en silencio).
//
// Cuerpo esperado:  { canal, cliente, telefono, items, total }
// ============================================================

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

// Web pública = solo canal "menor". Nunca mayoreo desde esta superficie.
function normalizeCanal(canal) {
  const c = String(canal || '').trim().toLowerCase()
  return c === 'mayor' || c === 'ambos' ? c : 'menor'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const body = parseBody(req.body)
  const pedido = {
    canal: normalizeCanal(body.canal),
    cliente: String(body.cliente || '').trim(),
    telefono: String(body.telefono || '').trim(),
    items: typeof body.items === 'string' ? body.items : JSON.stringify(body.items || []),
    total: body.total ?? '',
  }

  // Validación mínima: hace falta con quién contactar y qué se pidió.
  if (!pedido.telefono || !pedido.items || pedido.items === '[]') {
    return res.status(400).json({ ok: false, error: 'Pedido incompleto (falta teléfono o items).' })
  }

  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) {
    // No perder el pedido: queda en los logs de Vercel para recuperarlo.
    console.error('[api/pedido] SHEETS_WEBAPP_URL no configurada. Pedido NO registrado:', JSON.stringify(pedido))
    return res.status(200).json({ ok: false, error: 'Registro no configurado.' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!upstream.ok) throw new Error(`Apps Script HTTP ${upstream.status}`)

    // El doPost devuelve { ok:true }; lo leemos si se puede (no es crítico).
    let data = null
    try {
      data = await upstream.json()
    } catch {
      /* respuesta no-JSON: la fila ya se agregó igual */
    }
    if (data && data.ok === false) throw new Error(data.error || 'Apps Script devolvió ok:false')

    return res.status(200).json({ ok: true })
  } catch (err) {
    // Nunca reventar: log completo del pedido para recuperarlo a mano.
    console.error('[api/pedido] fallo al registrar. Pedido:', JSON.stringify(pedido), '| error:', err && err.message)
    return res.status(200).json({ ok: false, error: 'No se pudo registrar el pedido.' })
  } finally {
    clearTimeout(timeout)
  }
}
