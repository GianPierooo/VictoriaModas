// ============================================================
// /api/stock — Stock en vivo (Victoria Modas)
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// Devuelve, por prenda/color/talla:
//   { id, color, talla, stock, estado, precioMenorPEN }
// donde  estado = "disponible" (stock > 3)
//                 "ultimas"     (stock 0–3)
//                 "consultar"   (aún no hay fuente conectada / desconocido)
// Decisión de negocio: NUNCA se expone un estado "agotado" al público — el
// dueño se compromete a mantener stock siempre disponible; en el peor caso
// (stock en 0) se muestra "últimas piezas", nunca un mensaje de cierre.
//   y precioMenorPEN = precio RETAIL en soles (null si la hoja no lo tiene).
//
// REGLAS:
//  · TODA la lectura de datos vive detrás de UNA sola función readStock(),
//    para poder cambiar la fuente (Microsoft Graph ↔ Google Sheets ↔ Supabase) sin
//    tocar el resto del archivo.
//  · Credenciales SOLO desde process.env. Nunca en el cliente.
//  · FALLBACK: si faltan las variables de entorno, readStock() NO revienta;
//    devuelve null y el endpoint responde estado "consultar" para todo, para
//    que la web nunca se rompa mientras se conecta la hoja.
//  · SEGMENTOS: superficie pública = SOLO canal menor/ambos y variantes
//    activas. Se expone el precio RETAIL (precioMenorPEN); el precio de
//    mayoreo (precioMayorPEN) NUNCA sale por aquí — solo por /api/mayoreo
//    tras el código de acceso.
//
// Query opcional para filtrar:  ?id=..  &color=..  &talla=..
// ============================================================

const WORKSHEET = process.env.STOCK_WORKSHEET || 'Stock'

// ------------------------------------------------------------
// Datos de ejemplo (MOCK) — siguen el shape REAL de la hoja `Stock`:
//   id, nombre, color, talla, stock, canal, precioMenorPEN,
//   precioMayorPEN, precioMenorUSD, activo
// Sirven para probar el endpoint end-to-end antes de conectar la hoja.
// Cubren a propósito los estados (disponible / ultimas, incluyendo un caso
// en 0 para probar que se muestra como "últimas" y no como "agotado") e
// incluyen una fila 'mayor' e 'inactivo' para verificar que se filtran.
// ------------------------------------------------------------
const MOCK_ROWS = [
  { id: 'vestido-lame-elegante', nombre: 'Vestido Lame Elegante', color: 'Plomo', talla: 'S', stock: 8, canal: 'ambos', precioMenorPEN: 129, precioMayorPEN: 79, precioMenorUSD: 35, activo: 'sí' },
  { id: 'vestido-lame-elegante', nombre: 'Vestido Lame Elegante', color: 'Plomo', talla: 'M', stock: 2, canal: 'ambos', precioMenorPEN: 129, precioMayorPEN: 79, precioMenorUSD: 35, activo: 'sí' },
  { id: 'vestido-lame-elegante', nombre: 'Vestido Lame Elegante', color: 'Negro', talla: 'M', stock: 0, canal: 'ambos', precioMenorPEN: 129, precioMayorPEN: 79, precioMenorUSD: 35, activo: 'sí' },
  { id: 'vestido-lame-elegante', nombre: 'Vestido Lame Elegante', color: 'Vino', talla: 'L', stock: 5, canal: 'menor', precioMenorPEN: 129, precioMayorPEN: 79, precioMenorUSD: 35, activo: 'sí' },

  { id: 'vestido-suplex-moderno', nombre: 'Vestido Suplex Moderno', color: 'Azul', talla: 'S', stock: 12, canal: 'ambos', precioMenorPEN: 99, precioMayorPEN: 59, precioMenorUSD: 27, activo: 'sí' },
  { id: 'vestido-suplex-moderno', nombre: 'Vestido Suplex Moderno', color: 'Negro', talla: 'M', stock: 3, canal: 'ambos', precioMenorPEN: 99, precioMayorPEN: 59, precioMenorUSD: 27, activo: 'sí' },

  { id: 'blusa-seda-francesa', nombre: 'Blusa Seda Francesa', color: 'Azul', talla: 'S', stock: 1, canal: 'menor', precioMenorPEN: 69, precioMayorPEN: 39, precioMenorUSD: 19, activo: 'sí' },
  { id: 'blusa-seda-francesa', nombre: 'Blusa Seda Francesa', color: 'Negro', talla: 'M', stock: 6, canal: 'ambos', precioMenorPEN: 69, precioMayorPEN: 39, precioMenorUSD: 19, activo: 'sí' },

  { id: 'pantalon-scuba-vena', nombre: 'Pantalón Scuba Vena', color: 'Negro', talla: 'M', stock: 4, canal: 'ambos', precioMenorPEN: 89, precioMayorPEN: 55, precioMenorUSD: 24, activo: 'sí' },
  { id: 'pantalon-scuba-vena', nombre: 'Pantalón Scuba Vena', color: 'Camello', talla: 'L', stock: 0, canal: 'menor', precioMenorPEN: 89, precioMayorPEN: 55, precioMenorUSD: 24, activo: 'sí' },

  // Solo mayoreo → NO debe aparecer en la superficie pública:
  { id: 'pantalon-scuba-correa', nombre: 'Pantalón Scuba con Correa', color: 'Beach', talla: 'M', stock: 20, canal: 'mayor', precioMenorPEN: 95, precioMayorPEN: 58, precioMenorUSD: 26, activo: 'sí' },
  // Inactivo → NO debe aparecer:
  { id: 'pantalon-scuba-correa', nombre: 'Pantalón Scuba con Correa', color: 'Negro', talla: 'S', stock: 7, canal: 'ambos', precioMenorPEN: 95, precioMayorPEN: 58, precioMenorUSD: 26, activo: 'no' },
]

// ------------------------------------------------------------
// PUNTO ÚNICO DE LECTURA.  Cambia SOLO esta función para pasar de
// mock → Graph → Sheets sin tocar el resto del endpoint.
// Devuelve { source, rows } o null (→ fallback "consultar").
// Cualquier error de la fuente se traga aquí para no romper la web.
// ------------------------------------------------------------
async function readStock() {
  const source = String(process.env.STOCK_SOURCE || '').toLowerCase()
  try {
    if (source === 'mock') return { source: 'mock', rows: MOCK_ROWS }
    if (source === 'graph') return { source: 'graph', rows: await readFromGraph() }
    if (source === 'sheets') return { source: 'sheets', rows: await readFromSheets() }
    if (source === 'supabase') return { source: 'supabase', rows: await readFromSupabase() }
  } catch (err) {
    // Nunca romper la web: si la fuente falla, caemos a fallback.
    console.error('[api/stock] fuente "%s" falló:', source, err && err.message)
    return null
  }
  return null // sin fuente configurada → fallback
}

// ---- Fuente A: Excel en OneDrive vía Microsoft Graph (app-only) ----
async function readFromGraph() {
  const tenant = requireEnv('GRAPH_TENANT_ID')
  const clientId = requireEnv('GRAPH_CLIENT_ID')
  const clientSecret = requireEnv('GRAPH_CLIENT_SECRET')
  const driveId = requireEnv('GRAPH_DRIVE_ID')
  const itemId = requireEnv('GRAPH_ITEM_ID')

  // 1) token de aplicación (client credentials)
  const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  })
  if (!tokenRes.ok) throw new Error(`Graph token HTTP ${tokenRes.status}`)
  const { access_token: token } = await tokenRes.json()

  // 2) usedRange de la hoja (solo valores)
  const url =
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}` +
    `/workbook/worksheets('${encodeURIComponent(WORKSHEET)}')/usedRange(valuesOnly=true)?$select=values`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Graph usedRange HTTP ${res.status}`)
  const json = await res.json()
  return normalizeMatrix(json.values || [])
}

// ---- Fuente B: Google Sheet vía Apps Script web app (doGet → JSON) ----
// La URL del web app (SHEETS_WEBAPP_URL) es SECRETA: solo desde process.env,
// NUNCA al cliente. Se cachea unos segundos para no golpear el Apps Script en
// cada request (los serverless "calientes" reutilizan este módulo).
let sheetsCache = null // { at: number(ms), rows: [] }
const SHEETS_TTL_MS = 15000

async function readFromSheets() {
  const url = requireEnv('SHEETS_WEBAPP_URL')

  const now = Date.now()
  if (sheetsCache && now - sheetsCache.at < SHEETS_TTL_MS) return sheetsCache.rows

  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`Sheets webapp HTTP ${res.status}`)
  const json = await res.json()
  // Acepta { rows: [...] } (formato del Apps Script) o un array pelado.
  const list = Array.isArray(json) ? json : json.rows || json.data || []
  const rows = normalizeRows(list)

  sheetsCache = { at: now, rows }
  return rows
}

// ---- Fuente C: Supabase (esquema del panel admin — productos/variantes) ----
// Consulta directa a PostgREST con la `anon key` (la escritura del panel
// admin ya está protegida por RLS del lado de Supabase; esta lectura solo
// pide filas activas, que es justo lo que permite la política pública).
// Se cachea unos segundos por el mismo motivo que Sheets.
let supabaseCache = null // { at: number(ms), rows: [] }
const SUPABASE_TTL_MS = 15000

async function readFromSupabase() {
  const url = requireEnv('SUPABASE_URL')
  const key = requireEnv('SUPABASE_ANON_KEY')

  const now = Date.now()
  if (supabaseCache && now - supabaseCache.at < SUPABASE_TTL_MS) return supabaseCache.rows

  const endpoint =
    `${url}/rest/v1/producto_variantes` +
    `?select=producto_id,stock,canal,activo,precio_menor_pen,precio_anterior_pen,oferta_hasta,tallas(nombre),colores(nombre),productos!inner(activo)` +
    `&activo=eq.true&canal=in.(menor,ambos)&productos.activo=eq.true`
  const res = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`)
  const json = await res.json()

  const rows = (Array.isArray(json) ? json : []).map((r) => ({
    id: r.producto_id,
    color: r.colores?.nombre || '',
    talla: r.tallas?.nombre || '',
    stock: r.stock,
    canal: r.canal,
    precioMenorPEN: r.precio_menor_pen,
    precioAnteriorPEN: r.precio_anterior_pen,
    ofertaHasta: r.oferta_hasta,
    activo: r.activo,
  }))

  supabaseCache = { at: now, rows }
  return rows
}

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------

// Lanza si falta una variable → readStock() lo captura y cae a fallback.
function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Falta la variable de entorno ${name}`)
  return v
}

// Matriz [[headers], [fila], ...] → array de objetos con las columnas de `Stock`.
function normalizeMatrix(values) {
  if (!values || values.length < 2) return []
  const headers = values[0].map((h) => String(h).trim().toLowerCase())
  const col = (name) => headers.indexOf(name)
  const rows = []
  for (let i = 1; i < values.length; i++) {
    const r = values[i]
    if (!r || !r.length) continue
    const get = (name) => {
      const j = col(name)
      return j >= 0 ? r[j] : undefined
    }
    rows.push({
      id: String(get('id') ?? '').trim(),
      nombre: get('nombre'),
      color: String(get('color') ?? '').trim(),
      talla: String(get('talla') ?? '').trim(),
      stock: toNumber(get('stock')),
      canal: get('canal'),
      // Retail se expone; el de mayoreo NO se lee aquí (ver toPublic).
      precioMenorPEN: toNumber(get('preciomenorpen')),
      activo: get('activo'),
    })
  }
  return rows
}

// Array de objetos (claves = encabezados de la hoja) → shape interno.
// Tolerante a mayúsculas/espacios en las claves. Descarta filas sin id.
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
      nombre: o.nombre,
      color: String(o.color ?? '').trim(),
      talla: String(o.talla ?? '').trim(),
      stock: toNumber(o.stock),
      canal: o.canal,
      // Retail se expone; el de mayoreo NO se lee aquí (ver toPublic).
      precioMenorPEN: toNumber(o.preciomenorpen),
      activo: o.activo,
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

// Nunca devuelve "agotado" — a lo sumo "últimas" (0 incluido). Decisión de
// negocio: el dueño mantiene stock siempre disponible; el peor caso visible
// para la clienta es "últimas piezas", nunca un mensaje de cierre.
function estadoFor(stock) {
  if (stock === null || stock === undefined || Number.isNaN(stock)) return 'consultar'
  if (stock <= 3) return 'ultimas'
  return 'disponible'
}

// Solo superficies públicas: variantes activas del canal menor/ambos.
function isPublicRetail(row) {
  const canal = String(row.canal || '').trim().toLowerCase()
  const activo = toBool(row.activo)
  return activo && (canal === '' || canal === 'menor' || canal === 'ambos')
}

// Una oferta es "real" solo si hay un precio de antes MAYOR al de ahora (si
// no, no es una rebaja) y, si tiene fecha de vencimiento, esa fecha no pasó
// todavía. Nunca se inventa un precio de antes — sale directo de lo que el
// dueño cargó en /admin/productos (ver AdminProductFormPage.jsx). Decisión
// de negocio (evita "descuentos ficticios", que en Perú regula INDECOPI):
// si no hay un precio de antes real guardado, JAMÁS se muestra tachado ni
// porcentaje — mismo criterio de honestidad que el resto del sitio (nunca
// "agotado" falso, nunca countdowns de mentira).
function ofertaFor(precio, precioAnterior, ofertaHasta) {
  const antes = toNumber(precioAnterior)
  if (precio == null || antes == null || antes <= precio) return { enOferta: false }
  if (ofertaHasta && new Date(ofertaHasta).getTime() < Date.now()) return { enOferta: false }
  const porcentaje = Math.round(((antes - precio) / antes) * 100)
  return { enOferta: true, precioAnteriorPEN: antes, porcentajeOferta: porcentaje, ofertaHasta: ofertaHasta || null }
}

// Proyección pública: SOLO lo que puede ver el navegador. Incluye el precio
// RETAIL (precioMenorPEN, null si no está en la hoja). NUNCA precioMayorPEN.
function toPublic(row) {
  const precio = toNumber(row.precioMenorPEN)
  const oferta = ofertaFor(precio, row.precioAnteriorPEN, row.ofertaHasta)
  return {
    id: row.id,
    color: row.color,
    talla: row.talla,
    stock: row.stock,
    estado: estadoFor(row.stock),
    precioMenorPEN: precio,
    ...oferta,
  }
}

const norm = (v) => (v === undefined || v === null ? '' : String(v).trim().toLowerCase())

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const result = await readStock()

  // Fallback: sin fuente conectada → la web nunca se rompe.
  if (!result) {
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({
      ok: true,
      source: 'none',
      fallback: true,
      estado: 'consultar',
      count: 0,
      items: [],
    })
  }

  const { source, rows } = result
  const q = req.query || {}
  const fId = norm(q.id)
  const fColor = norm(q.color)
  const fTalla = norm(q.talla)

  const items = rows
    .filter(isPublicRetail)
    .filter(
      (row) =>
        (!fId || norm(row.id) === fId) &&
        (!fColor || norm(row.color) === fColor) &&
        (!fTalla || norm(row.talla) === fTalla)
    )
    .map(toPublic)

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
  return res.status(200).json({
    ok: true,
    source,
    fallback: false,
    count: items.length,
    items,
  })
}
