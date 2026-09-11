// ============================================================
// /api/chat — Asistente con IA acotado (Victoria Modas)
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// El cerebro (prompt, catálogo, llamada a OpenAI, fallback) vive en
// src/lib/asistenteIA.js, compartido con api/whatsapp-webhook.js — así el
// widget web y el bot de WhatsApp responden exactamente igual.
//
// Este archivo solo se encarga de lo propio del canal web: parsear el
// body, rate-limiting por IP y el formato de respuesta HTTP.
// ============================================================
import { WA_LINK, sanitizeMessages, guessLang, generarRespuesta } from '../src/lib/asistenteIA.js'

// Rate limit: por IP, ventana deslizante
const RL_WINDOW_MS = 60_000
const RL_MAX = 20
const rlHits = new Map() // ip -> number[] (timestamps)

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

  const { reply, fallback } = await generarRespuesta(messages)
  return res.status(200).json({ ok: true, reply, wa: WA_LINK, ...(fallback ? { fallback: true } : {}) })
}
