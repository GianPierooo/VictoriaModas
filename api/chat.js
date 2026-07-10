// ============================================================
// /api/chat — Asistente con IA acotado (Victoria Modas)
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// Recibe la conversación y llama a la API de OpenAI (chat completions).
// La API key vive SOLO server-side (process.env.OPENAI_API_KEY), NUNCA
// llega al cliente.
//
// GUARDRAILS (ver system prompt):
//  · Acotado a tareas del negocio (producto, tallas, telas, FAQ). Nada fuera
//    de tema.
//  · NUNCA inventa precios: el precio y el cierre son por WhatsApp.
//  · NUNCA inventa stock: deriva a WhatsApp / indicador de la web.
//  · Responde en el idioma del cliente (español o inglés).
//  · Rate-limiting básico + límite de longitud de entrada.
//  · Si falta la API key o falla OpenAI, responde un fallback que igual
//    deriva a WhatsApp (nunca revienta).
//
// SEGMENTACIÓN: products.js NO contiene precios, así que el contexto que se
// envía al modelo tampoco. La invariante pública (sin precios) queda intacta.
// ============================================================
import { PRODUCTS } from '../src/data/products.js'

const WA_NUMBER = '51993357672'
const WA_LINK = `https://wa.me/${WA_NUMBER}`
// Modelo rápido y económico de OpenAI (verificar string vigente en
// platform.openai.com/docs/models). Override opcional con OPENAI_MODEL.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

// Límites de entrada
const MAX_MESSAGES = 12 // solo se conservan los últimos N turnos
const MAX_CHARS = 800 // por mensaje
// Rate limit: por IP, ventana deslizante
const RL_WINDOW_MS = 60_000
const RL_MAX = 20
const rlHits = new Map() // ip -> number[] (timestamps)

// ------------------------------------------------------------
// Contexto del negocio (system prompt)
// ------------------------------------------------------------
function buildCatalog() {
  return PRODUCTS.map((p) => {
    const colores = (p.colors || []).join(', ')
    const tallas = (p.sizes || []).join(', ')
    return `- ${p.name} (${p.category}, tela ${p.fabric}). Colores: ${colores}. Tallas: ${tallas}.`
  }).join('\n')
}

function systemPrompt() {
  return `Eres el asistente virtual de Victoria Modas, una boutique de moda femenina nacida en Gamarra, Lima (Perú). Tu tono es cálido, cercano y elegante, como una buena asesora de tienda. Sé breve (2 a 4 frases), claro y sin relleno. Evita los emojis (como mucho uno ocasional).

REGLAS ESTRICTAS (obligatorias):
1. Habla SOLO de Victoria Modas: prendas del catálogo, telas, tallas, colores, cómo comprar, pagos, envíos, cambios y venta por mayor. Si te preguntan algo ajeno (otros temas, otras marcas, tareas generales), decláralo con amabilidad y reencauza ofreciendo ayuda con la ropa.
2. NUNCA inventes precios ni des cifras de precio. El precio y el cierre del pedido son por WhatsApp. Si preguntan precio, si quieren comprar o reservar, o piden un total, deriva a WhatsApp: ${WA_LINK} (+51 993 357 672), sugiriendo un mensaje corto que la clienta puede enviar.
3. NUNCA inventes stock ni disponibilidad exacta. Si preguntan si hay stock de algo, di que lo confirmamos al instante por WhatsApp o que revise el indicador de disponibilidad en la página del producto.
4. Responde SIEMPRE en el mismo idioma en que te escribe la clienta (español o inglés).
5. No pidas datos sensibles (documentos, tarjetas). No prometas descuentos ni plazos que no estén en la información de abajo.
6. Recomienda tallas solo de forma orientativa; si dudan, pide medidas (busto, cintura, cadera) y sugiere confirmar por WhatsApp.

CATÁLOGO ACTUAL (no menciones prendas que no estén aquí):
${buildCatalog()}

INFORMACIÓN OFICIAL (FAQ — úsala, no la contradigas):
- Cómo comprar: navegar la colección, elegir color y talla, armar el carrito; el pedido se envía por WhatsApp y ahí se confirma disponibilidad, pago y entrega. Sin registros.
- Pagos: Yape, Plin y transferencia bancaria. En Lima también efectivo contra entrega.
- Envíos: Lima 2 a 4 días hábiles; provincias vía Shalom u Olva Courier 4 a 7 días hábiles (recojo en agencia). Envío gratis en compras mayores a S/ 200.
- Cambios: dentro de los 7 días posteriores a la entrega, prenda sin uso y en su empaque original; se coordina por WhatsApp.
- Tallas: según el modelo, de XS a L. Pedir medidas para recomendar mejor.
- Mayoreo: sí atendemos por mayor; se cotiza por WhatsApp indicando modelos y cantidades.

WhatsApp de la tienda: ${WA_LINK} (+51 993 357 672).`
}

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------
function clientIp(req) {
  const h = req.headers || {}
  const xf = h['x-forwarded-for']
  if (xf) return String(xf).split(',')[0].trim()
  return h['x-real-ip'] || 'anon'
}

function rateLimited(ip) {
  const now = Date.now()
  const hits = (rlHits.get(ip) || []).filter((t) => now - t < RL_WINDOW_MS)
  hits.push(now)
  rlHits.set(ip, hits)
  return hits.length > RL_MAX
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

// Normaliza y acota la conversación que envía el cliente.
function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return []
  const cleaned = []
  for (const m of raw) {
    if (!m || typeof m !== 'object') continue
    const role = m.role === 'assistant' ? 'assistant' : 'user'
    const content = String(m.content ?? '').trim().slice(0, MAX_CHARS)
    if (!content) continue
    cleaned.push({ role, content })
  }
  return cleaned.slice(-MAX_MESSAGES)
}

// Idioma aproximado para el fallback (cuando no hay modelo que responda).
function guessLang(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  const t = (last?.content || '').toLowerCase()
  if (/[áéíóúñ¿¡]/.test(t)) return 'es'
  if (/\b(the|hello|hi|price|size|do|you|how|what|shipping|return)\b/.test(t)) return 'en'
  return 'es'
}

function fallbackReply(messages) {
  return guessLang(messages) === 'en'
    ? "I can't reply here right now, but we'll gladly help you on WhatsApp: message us and we'll take care of everything."
    : 'Ahora mismo no puedo responderte por aquí, pero te atendemos al instante por WhatsApp: escríbenos y con gusto te ayudamos.'
}

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const messages = sanitizeMessages(parseBody(req.body).messages)
  if (messages.length === 0) {
    return res.status(400).json({ ok: false, error: 'Sin mensaje.', wa: WA_LINK })
  }

  // Rate limit básico.
  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      ok: false,
      error: 'rate_limited',
      reply:
        guessLang(messages) === 'en'
          ? 'You are going a bit fast. Please try again in a moment, or reach us on WhatsApp.'
          : 'Vas un poquito rápido. Intenta de nuevo en un momento, o escríbenos por WhatsApp.',
      wa: WA_LINK,
    })
  }

  // Sin API key → fallback que igual deriva a WhatsApp (no revienta).
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(200).json({ ok: true, reply: fallbackReply(messages), wa: WA_LINK, fallback: true })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)
  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt() }, ...messages],
        temperature: 0.4,
        max_tokens: 400,
      }),
      signal: controller.signal,
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.error('[api/chat] OpenAI HTTP %s: %s', upstream.status, detail.slice(0, 300))
      return res.status(200).json({ ok: true, reply: fallbackReply(messages), wa: WA_LINK, fallback: true })
    }

    const data = await upstream.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return res.status(200).json({ ok: true, reply: fallbackReply(messages), wa: WA_LINK, fallback: true })
    }

    return res.status(200).json({ ok: true, reply, wa: WA_LINK })
  } catch (err) {
    console.error('[api/chat] fallo:', err && err.message)
    return res.status(200).json({ ok: true, reply: fallbackReply(messages), wa: WA_LINK, fallback: true })
  } finally {
    clearTimeout(timeout)
  }
}
