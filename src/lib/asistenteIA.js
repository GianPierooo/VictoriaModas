// ============================================================
// src/lib/asistenteIA.js — cerebro compartido del asistente con IA
// ------------------------------------------------------------
// Lo usan DOS canales serverless distintos:
//   - api/chat.js            → widget de chat del sitio web
//   - api/whatsapp-webhook.js → bot de WhatsApp (Meta Cloud API)
//
// Server-side puro (no usa import.meta.env), por eso SÍ se puede compartir
// entre ambos archivos de /api sin duplicar el system prompt — a diferencia
// de src/lib/supabaseAdmin.js, que no se puede importar desde /api porque
// usa import.meta.env (ver comentario en api/culqi-cobrar.js).
//
// GUARDRAILS (ver systemPrompt): acotado al negocio, nunca inventa precios
// ni stock, siempre deriva el cierre a WhatsApp. Si falla la IA o falta la
// API key, responde un fallback que igual deriva a WhatsApp (nunca revienta).
// ============================================================
import { PRODUCTS } from '../data/products.js'

export const WA_NUMBER = '51994347405'
export const WA_LINK = `https://wa.me/${WA_NUMBER}`
// Modelo rápido y económico de OpenAI (verificar string vigente en
// platform.openai.com/docs/models). Override opcional con OPENAI_MODEL.
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

export const MAX_MESSAGES = 12 // solo se conservan los últimos N turnos
export const MAX_CHARS = 800 // por mensaje

function buildCatalog() {
  return PRODUCTS.map((p) => {
    const colores = (p.colors || []).join(', ')
    const tallas = (p.sizes || []).join(', ')
    return `- ${p.name} (${p.category}, tela ${p.fabric}). Colores: ${colores}. Tallas: ${tallas}.`
  }).join('\n')
}

export function systemPrompt() {
  return `Eres el asistente virtual de Victoria Modas, una boutique de moda femenina hecha en Perú. Tu tono es cálido, cercano y elegante, como una buena asesora de tienda. Sé breve (2 a 4 frases), claro y sin relleno. Evita los emojis (como mucho uno ocasional).

REGLAS ESTRICTAS (obligatorias):
1. Habla SOLO de Victoria Modas: prendas del catálogo, telas, tallas, colores, cómo comprar, pagos, envíos y cambios. Si te preguntan algo ajeno (otros temas, otras marcas, tareas generales), decláralo con amabilidad y reencauza ofreciendo ayuda con la ropa. La venta por mayor es un canal privado: no la ofrezcas ni des precios mayoristas por el chat.
2. NUNCA inventes precios ni des cifras de precio. El precio y el cierre del pedido son por WhatsApp. Si preguntan precio, si quieren comprar o reservar, o piden un total, deriva a WhatsApp: ${WA_LINK} (+51 994 347 405), sugiriendo un mensaje corto que la clienta puede enviar.
3. NUNCA inventes stock ni disponibilidad exacta. Si preguntan si hay stock de algo, di que lo confirmamos al instante por WhatsApp o que revise el indicador de disponibilidad en la página del producto.
4. Responde SIEMPRE en el mismo idioma en que te escribe la clienta (español o inglés).
5. No pidas datos sensibles (documentos, tarjetas). No prometas descuentos ni plazos que no estén en la información de abajo.
6. Recomienda tallas solo de forma orientativa; si dudan, pide medidas (busto, cintura, cadera) y sugiere confirmar por WhatsApp.

CATÁLOGO ACTUAL (no menciones prendas que no estén aquí):
${buildCatalog()}

INFORMACIÓN OFICIAL (FAQ — úsala, no la contradigas):
- Cómo comprar: navegar la colección, elegir color y talla, armar el carrito; el pedido se envía por WhatsApp y ahí se confirma disponibilidad, pago y entrega. Sin registros.
- Pagos: Yape, Plin y transferencia bancaria. En Lima también efectivo contra entrega.
- Envíos: Lima 2 a 4 días hábiles; provincias vía Shalom u Olva Courier 4 a 7 días hábiles (recojo en agencia). Envío gratis en compras mayores a S/ 60.
- Cambios: dentro de los 7 días posteriores a la entrega, prenda sin uso y en su empaque original; se coordina por WhatsApp.
- Tallas: según el modelo, de XS a L. Pedir medidas para recomendar mejor.

WhatsApp de la tienda: ${WA_LINK} (+51 994 347 405).`
}

// Normaliza y acota una conversación (array [{role, content}]).
export function sanitizeMessages(raw) {
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
export function guessLang(messages) {
  const last = [...messages].reverse().find((m) => m.role === 'user')
  const t = (last?.content || '').toLowerCase()
  if (/[áéíóúñ¿¡]/.test(t)) return 'es'
  if (/\b(the|hello|hi|price|size|do|you|how|what|shipping|return)\b/.test(t)) return 'en'
  return 'es'
}

export function fallbackReply(messages) {
  return guessLang(messages) === 'en'
    ? "I can't reply here right now, but we'll gladly help you on WhatsApp: message us and we'll take care of everything."
    : 'Ahora mismo no puedo responderte por aquí, pero te atendemos al instante por WhatsApp: escríbenos y con gusto te ayudamos.'
}

// Llama a OpenAI con la conversación ya saneada y devuelve { reply, fallback }.
// Nunca revienta: ante cualquier falla (sin API key, timeout, error HTTP,
// respuesta vacía) devuelve el fallback que deriva a WhatsApp.
export async function generarRespuesta(messages) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { reply: fallbackReply(messages), fallback: true }
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
      console.error('[asistenteIA] OpenAI HTTP %s: %s', upstream.status, detail.slice(0, 300))
      return { reply: fallbackReply(messages), fallback: true }
    }

    const data = await upstream.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return { reply: fallbackReply(messages), fallback: true }
    }
    return { reply, fallback: false }
  } catch (err) {
    console.error('[asistenteIA] fallo:', err && err.message)
    return { reply: fallbackReply(messages), fallback: true }
  } finally {
    clearTimeout(timeout)
  }
}
