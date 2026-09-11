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
//          (entregado/leído/fallido). Si el evento trae un mensaje de
//          texto, se responde con el mismo cerebro de IA que el widget web
//          (src/lib/asistenteIA.js) y se envía la respuesta de vuelta por
//          la API de WhatsApp. Responder 200 rápido es importante: si Meta
//          no recibe 200, reintenta el mismo evento y puede terminar
//          deshabilitando el webhook por fallas repetidas.
//
// Secretos, SOLO en env vars (nunca en el cliente ni en el repo):
//   WHATSAPP_VERIFY_TOKEN  — el handshake de verificación (GET).
//   WHATSAPP_ACCESS_TOKEN  — para poder enviar mensajes (Graph API).
//   WHATSAPP_PHONE_NUMBER_ID — el número (de prueba, por ahora) desde el
//                              que responde el bot.
//
// LÍMITE CONOCIDO: el "de-dupe" de mensajes ya procesados es en memoria
// (Set), así que solo protege contra reintentos DENTRO de una misma
// instancia serverless caliente — no es una garantía entre invocaciones
// frías. Aceptable para un bot conversacional (una respuesta repetida no
// es grave); no usar este patrón si algún día hay una acción con efecto
// de dinero real disparada desde aquí.
// ============================================================
import { WA_LINK, sanitizeMessages, generarRespuesta } from '../src/lib/asistenteIA.js'

const GRAPH_VERSION = 'v21.0'
const MENSAJES_VISTOS = new Set() // ids de mensajes ya respondidos (best-effort)
const MENSAJES_VISTOS_MAX = 500

function recordarVisto(id) {
  if (!id) return
  MENSAJES_VISTOS.add(id)
  if (MENSAJES_VISTOS.size > MENSAJES_VISTOS_MAX) {
    // Se pasó del límite: se limpia entero (simple, no hace falta más para
    // este volumen de mensajes).
    MENSAJES_VISTOS.clear()
  }
}

// Extrae los mensajes de texto entrantes del payload de Meta. Ignora
// actualizaciones de estado (entregado/leído) y no revienta con formas
// inesperadas del payload.
function extraerMensajes(body) {
  const mensajes = []
  const entradas = body?.entry
  if (!Array.isArray(entradas)) return mensajes
  for (const entrada of entradas) {
    const cambios = entrada?.changes
    if (!Array.isArray(cambios)) continue
    for (const cambio of cambios) {
      const valor = cambio?.value
      if (!valor || !Array.isArray(valor.messages)) continue
      for (const msg of valor.messages) {
        if (msg && msg.from) mensajes.push(msg)
      }
    }
  }
  return mensajes
}

async function enviarMensajeWhatsApp(destinatario, texto) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneNumberId) {
    console.error('[whatsapp-webhook] faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID.')
    return
  }
  try {
    const resp = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: destinatario,
        type: 'text',
        text: { body: texto },
      }),
    })
    if (!resp.ok) {
      const detalle = await resp.text().catch(() => '')
      console.error('[whatsapp-webhook] error al enviar (HTTP %s): %s', resp.status, detalle.slice(0, 300))
    }
  } catch (err) {
    console.error('[whatsapp-webhook] excepción al enviar:', err && err.message)
  }
}

// Procesa un mensaje entrante: genera la respuesta con el mismo cerebro
// del widget web y la envía de vuelta. Best-effort — nunca deja que un
// fallo tumbe el 200 que ya se le devolvió a Meta.
async function procesarMensaje(msg) {
  if (MENSAJES_VISTOS.has(msg.id)) return
  recordarVisto(msg.id)

  const texto = msg.type === 'text' ? msg.text?.body : null
  const contenido = texto
    ? texto
    : 'Recibí un mensaje que no puedo leer todavía (foto, audio u otro formato). Escríbeme en palabras qué prenda buscas y con gusto te ayudo.'

  if (!texto) {
    // No hace falta pasar por la IA para este caso fijo.
    await enviarMensajeWhatsApp(msg.from, contenido)
    return
  }

  const mensajes = sanitizeMessages([{ role: 'user', content: contenido }])
  const { reply } = await generarRespuesta(mensajes)
  await enviarMensajeWhatsApp(msg.from, reply || `Escríbenos y con gusto te ayudamos: ${WA_LINK}`)
}

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
    // Best-effort: nunca revienta, siempre responde 200 para que Meta no
    // reintente ni marque el webhook como fallido.
    try {
      const mensajes = extraerMensajes(req.body)
      // Se espera la respuesta antes de devolver 200 (igual que api/chat.js,
      // con su propio timeout de 20s) para no dejar mensajes sin contestar
      // si la función serverless termina apenas responde.
      for (const msg of mensajes) {
        await procesarMensaje(msg)
      }
    } catch (err) {
      console.error('[whatsapp-webhook] error al procesar el evento:', err && err.message)
    }
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
}
