// ============================================================
// /api/mayoreo — Catálogo PRIVADO de mayoreo (Victoria Modas)
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM). INDEPENDIENTE de
// /api/stock.js.
//
// SEGURIDAD (lo más importante):
//  · El precio de mayoreo (precioMayorPEN) SOLO se devuelve con un código de
//    acceso válido. La verificación es SERVER-SIDE: el código vive en
//    process.env.MAYOREO_ACCESS_CODE, nunca en el repo ni en el cliente.
//  · Sin código válido → 401 y CERO datos (fail-closed: si la variable no
//    está configurada, también 401).
//  · Respuesta con `Cache-Control: private, no-store` para que ni el CDN ni
//    el navegador cacheen precios de mayoreo.
//
// Con código válido: lee la MISMA fuente que /api/stock (Apps Script) y
// devuelve las variantes de canal "mayor"/"ambos" activas, ESTA VEZ con
// precioMayorPEN y el estado de stock. Nunca incluye precioMenor.
// ============================================================

// ---- Mock (para probar en local con STOCK_SOURCE=mock) ----
// Incluye a propósito una fila 'menor' y una inactiva para verificar que se
// excluyen del canal mayorista.
const MOCK_ROWS = [
  { id: 'vestido-lame-elegante', color: 'Plomo', talla: 'S', stock: 8, canal: 'ambos', precioMayorPEN: 79, activo: 'si' },
  { id: 'vestido-lame-elegante', color: 'Plomo', talla: 'M', stock: 2, canal: 'ambos', precioMayorPEN: 79, activo: 'si' },
  { id: 'vestido-lame-elegante', color: 'Negro', talla: 'M', stock: 0, canal: 'mayor', precioMayorPEN: 79, activo: 'si' },
  { id: 'blusa-seda-francesa', color: 'Azul', talla: 'S', stock: 12, canal: 'mayor', precioMayorPEN: 39, activo: 'si' },
  { id: 'pantalon-scuba-vena', color: 'Negro', talla: 'M', stock: 5, canal: 'ambos', precioMayorPEN: 55, activo: 'si' },
  { id: 'blusa-seda-francesa', color: 'Negro', talla: 'M', stock: 6, canal: 'menor', precioMayorPEN: 39, activo: 'si' }, // menor → excluir
  { id: 'pantalon-scuba-vena', color: 'Camello', talla: 'L', stock: 3, canal: 'ambos', precioMayorPEN: 55, activo: 'no' }, // inactivo → excluir
]

// ------------------------------------------------------------
// Lectura de la fuente (mismo patrón que /api/stock, pero conservando el
// precio de mayoreo). Devuelve { source, rows } o null (→ fallback).
// ------------------------------------------------------------
async function readSource() {
  const source = String(process.env.STOCK_SOURCE || '').toLowerCase()
  try {
    if (source === 'mock') return { source: 'mock', rows: MOCK_ROWS }
    if (source === 'sheets') return { source: 'sheets', rows: await readFromSheets() }
  } catch (err) {
    console.error('[api/mayoreo] fuente "%s" falló:', source, err && err.message)
    return null
  }
  return null
}

// ---- Google Sheet vía Apps Script web app (doGet → JSON) ----
// URL SECRETA: solo process.env. Caché corta para no golpear el Apps Script.
let sheetsCache = null // { at: number(ms), rows: [] }
const SHEETS_TTL_MS = 15000

async function readFromSheets() {
  const url = requireEnv('SHEETS_WEBAPP_URL')

  const now = Date.now()
  if (sheetsCache && now - sheetsCache.at < SHEETS_TTL_MS) return sheetsCache.rows

  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`Sheets webapp HTTP ${res.status}`)
  const json = await res.json()
  const list = Array.isArray(json) ? json : json.rows || json.data || []
  const rows = normalizeRows(list)

  sheetsCache = { at: now, rows }
  return rows
}

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------
function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Falta la variable de entorno ${name}`)
  return v
}

// Array de objetos (claves = encabezados) → shape interno CON precioMayorPEN.
function normalizeRows(list) {
  if (!Array.isArray(list)) return []
  const rows = []
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue
    const o = {}
    for (const k of Object.keys(raw)) o[String(k).trim().toLowerCase()] = raw[k]
    const id = String(o.id ?? '').trim()
    if (!id) continue
    rows.push({
      id,
      color: String(o.color ?? '').trim(),
      talla: String(o.talla ?? '').trim(),
      stock: toNumber(o.stock),
      canal: o.canal,
      activo: o.activo,
      precioMayorPEN: toNumber(o.preciomayorpen),
    })
  }
  return rows
}

function toNumber(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(String(v).replace(',', '.'))
  return Number.isNaN(n) ? null : n
}

function toBool(v) {
  if (v === true) return true
  const s = String(v).trim().toLowerCase()
  return s === 'sí' || s === 'si' || s === 'true' || s === '1' || s === 'x' || s === 'activo'
}

function estadoFor(stock) {
  if (stock === null || stock === undefined || Number.isNaN(stock)) return 'consultar'
  if (stock <= 0) return 'agotado'
  if (stock <= 3) return 'ultimas'
  return 'disponible'
}

// Canal mayorista: variantes activas de canal mayor/ambos.
function isMayoreo(row) {
  const canal = String(row.canal || '').trim().toLowerCase()
  return toBool(row.activo) && (canal === 'mayor' || canal === 'ambos')
}

// Proyección mayorista: incluye precioMayorPEN. Nunca precioMenor.
function toMayoreoPublic(row) {
  return {
    id: row.id,
    color: row.color,
    talla: row.talla,
    stock: row.stock,
    estado: estadoFor(row.stock),
    precioMayorPEN: row.precioMayorPEN,
  }
}

// Lee el código de acceso del header o del body.
function extractCode(req, body) {
  const header = req.headers && (req.headers['x-mayoreo-code'] || req.headers['X-Mayoreo-Code'])
  if (header) return String(header)
  if (body && body.code != null) return String(body.code)
  return ''
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

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------
export default async function handler(req, res) {
  // Nunca cachear la respuesta de mayoreo (lleva precios).
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const body = parseBody(req.body)
  const code = extractCode(req, body)
  const expected = process.env.MAYOREO_ACCESS_CODE

  // Fail-closed: sin código configurado o sin coincidencia → 401, cero datos.
  if (!expected || !code || code !== expected) {
    return res.status(401).json({ ok: false, error: 'Código de acceso inválido.' })
  }

  const result = await readSource()

  // Fallback robusto: si no hay fuente, no revienta; catálogo vacío.
  if (!result) {
    return res.status(200).json({ ok: true, source: 'none', fallback: true, count: 0, items: [] })
  }

  const items = result.rows.filter(isMayoreo).map(toMayoreoPublic)

  return res.status(200).json({
    ok: true,
    source: result.source,
    fallback: false,
    count: items.length,
    items,
  })
}
