// ============================================================
// /api/whatsapp-webhook — punto de conexión de WhatsApp Business Platform
// (Meta Cloud API), para el bot de WhatsApp (fase posterior, ver CLAUDE.md).
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// Meta llama a este mismo endpoint de dos formas distintas:
//
//   GET  — "handshake" de verificación, UNA vez, cuando pegas esta URL en
//          el panel de Meta ("URL de devolución de llamada") y le das
//          "Verificar y guardar". Manda hub.mode/hub.verify_token/
//          hub.challenge por query string; si el token coincide con el
//          nuestro, hay que devolver el challenge tal cual, como texto
//          plano (no JSON). Si no coincide, 403 — así nadie más puede
//          registrar un webhook falso apuntando a esta URL.
//
//   POST — el evento real: cada vez que alguien escribe al número de
//          WhatsApp conectado, o cambia el estado de un mensaje enviado
//          (entregado/leído/fallido). Por ahora SOLO se registra en los
//          logs — todavía no hay lógica de bot conectada (eso es el
//          siguiente paso, una vez el handshake esté verificado y
//          funcionando). Responder 200 rápido es importante: si Meta no
//          recibe 200, reintenta el mismo evento y puede terminar
//          deshabilitando el webhook por fallas repetidas.
//
// El token de verificación vive SOLO en env vars (WHATSAPP_VERIFY_TOKEN),
// igual que el resto de secretos del proyecto — nunca en el cliente ni en
// el repo.
// ============================================================

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

    if (!verifyToken) {
      // Fail-closed: sin token configurado, nunca se verifica nada.
      console.error('[whatsapp-webhook] falta WHATSAPP_VERIFY_TOKEN en las variables de entorno.')
      return res.status(403).send('No configurado.')
    }
    if (mode === 'subscribe' && token === verifyToken) {
      // Meta espera el challenge tal cual, como texto plano (NO JSON).
      return res.status(200).send(challenge)
    }
    return res.status(403).send('Verificación fallida.')
  }

  if (req.method === 'POST') {
    // Best-effort: nunca revienta, siempre responde 200 rápido para que
    // Meta no reintente ni marque el webhook como fallido.
    try {
      console.log('[whatsapp-webhook] evento recibido:', JSON.stringify(req.body))
    } catch (err) {
      console.error('[whatsapp-webhook] error al procesar el evento:', err && err.message)
    }
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
}
