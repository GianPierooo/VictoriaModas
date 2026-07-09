/************************************************************************
 * Victoria Modas — Web App de Stock y Pedidos (Google Apps Script)
 * ---------------------------------------------------------------------
 * Este script convierte la hoja de cálculo en una pequeña API privada:
 *   · GET  → devuelve la pestaña de stock como JSON (array de objetos).
 *   · POST → agrega un pedido a la pestaña "Pedidos" (Fase 2).
 *
 * La web (Vercel) NUNCA llama a esta URL directo: la llama la función
 * serverless /api/stock, que descarta los precios y solo publica la
 * disponibilidad. La URL de este web app es SECRETA (va en una variable
 * de entorno de Vercel), por eso puede quedar como "cualquiera con el
 * enlace" sin exponer precios de mayoreo al navegador.
 *
 * La pestaña de stock se resuelve de forma TOLERANTE (ver resolveStockSheet_):
 *   a) la que se llame "Stock" (sin importar mayúsculas/espacios), si existe;
 *   b) si no, la primera cuya fila 1 tenga los encabezados esperados
 *      (id, color, talla, stock);
 *   c) si no, la primera pestaña que no sea "Pedidos".
 * Nunca falla por el nombre: si no hay datos, devuelve { ok:true, rows:[] }.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║ TRAS EDITAR: copia TODO este archivo a Extensiones > Apps Script, ║
 * ║ guarda, y ve a Implementar > Gestionar implementaciones > editar  ║
 * ║ (lápiz) > Versión: NUEVA > Implementar. USA "VERSIÓN NUEVA" PARA   ║
 * ║ NO CAMBIAR LA URL /exec.                                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ─── CÓMO DESPLEGARLO (la primera vez) ───────────────────────────────
 * 1. Abre la hoja de cálculo en Google Sheets.
 * 2. Menú  Extensiones → Apps Script.
 * 3. Borra lo que haya y pega TODO este archivo. Guarda (💾).
 * 4. La pestaña de stock puede llamarse "Stock" o cualquier otro nombre:
 *    basta con que su PRIMERA FILA tenga estos encabezados (mismo texto,
 *    en cualquier orden):
 *        id | nombre | color | talla | stock | canal |
 *        precioMenorPEN | precioMayorPEN | precioMenorUSD | activo
 *    (la pestaña "Pedidos" se crea sola al recibir el primer pedido).
 * 5. Botón azul  Implementar → Nueva implementación.
 * 6. Tipo (⚙️) → "Aplicación web".
 *        · Descripción:      Victoria Modas Stock
 *        · Ejecutar como:    Yo (el dueño de la hoja)
 *        · Quién tiene acceso: "Cualquier usuario"
 * 7. Implementar → autoriza los permisos que pida (es tu propia cuenta).
 * 8. Copia la  "URL de la aplicación web"  (termina en /exec).
 *    Esa URL es la que va en Vercel como  SHEETS_WEBAPP_URL.
 ************************************************************************/

var STOCK_SHEET = 'Stock'
var PEDIDOS_SHEET = 'Pedidos'
var PEDIDOS_HEADERS = ['fecha', 'canal', 'cliente', 'telefono', 'items', 'total', 'estado']
// Encabezados mínimos que identifican a la pestaña de stock.
var EXPECTED_HEADERS = ['id', 'color', 'talla', 'stock']

/**
 * GET → lee la pestaña de stock (resuelta de forma tolerante) y la devuelve
 * como JSON: un array de objetos donde las claves son los encabezados de la
 * primera fila. Nunca falla por el nombre de la pestaña.
 */
function doGet() {
  var out = { ok: true, rows: [] }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = resolveStockSheet_(ss)
    if (sheet) {
      var values = sheet.getDataRange().getValues()
      if (values.length >= 2) {
        var headers = values[0].map(function (h) { return String(h).trim() })
        for (var i = 1; i < values.length; i++) {
          var row = values[i]
          // Salta filas totalmente vacías.
          var empty = row.every(function (c) { return c === '' || c === null })
          if (empty) continue
          var obj = {}
          for (var c = 0; c < headers.length; c++) {
            if (!headers[c]) continue
            obj[headers[c]] = row[c]
          }
          out.rows.push(obj)
        }
      }
    }
    // Si no hay pestaña/datos, out queda como { ok:true, rows:[] } (sin error).
  } catch (err) {
    out = { ok: false, error: String(err), rows: [] }
  }
  return json_(out)
}

/**
 * Resuelve la pestaña de stock con esta prioridad:
 *   a) la llamada "Stock" (case-insensitive, ignorando espacios);
 *   b) la primera cuya fila 1 contenga los encabezados esperados;
 *   c) la primera pestaña que no sea "Pedidos" (o la primera que haya).
 * Devuelve null solo si el libro no tiene ninguna pestaña.
 */
function resolveStockSheet_(ss) {
  var sheets = ss.getSheets()
  if (!sheets.length) return null

  // a) por nombre "Stock" tolerante.
  for (var i = 0; i < sheets.length; i++) {
    if (normName_(sheets[i].getName()) === normName_(STOCK_SHEET)) return sheets[i]
  }
  // b) por encabezados esperados en la fila 1.
  for (var j = 0; j < sheets.length; j++) {
    if (hasExpectedHeaders_(sheets[j])) return sheets[j]
  }
  // c) la primera que no sea "Pedidos".
  for (var k = 0; k < sheets.length; k++) {
    if (normName_(sheets[k].getName()) !== normName_(PEDIDOS_SHEET)) return sheets[k]
  }
  // c-bis) si todo lo anterior falla, la primera del libro.
  return sheets[0]
}

/** Normaliza un nombre de pestaña: sin espacios y en minúsculas. */
function normName_(name) {
  return String(name).replace(/\s+/g, '').toLowerCase()
}

/** ¿La fila 1 de la pestaña contiene todos los encabezados esperados? */
function hasExpectedHeaders_(sheet) {
  var lastCol = sheet.getLastColumn()
  if (lastCol < 1) return false
  var header = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
  var present = {}
  for (var i = 0; i < header.length; i++) {
    present[String(header[i]).trim().toLowerCase()] = true
  }
  for (var k = 0; k < EXPECTED_HEADERS.length; k++) {
    if (!present[EXPECTED_HEADERS[k]]) return false
  }
  return true
}

/**
 * POST → recibe un pedido en JSON y lo agrega a la pestaña "Pedidos".
 * (Se usa desde /api/pedido.) La pestaña "Pedidos" se crea si no existe.
 * Cuerpo esperado (todos opcionales salvo lo que quieras registrar):
 *   { canal, cliente, telefono, items, total, estado }
 * `items` puede ser texto o un array/objeto (se guarda como JSON).
 */
function doPost(e) {
  try {
    var body = {}
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents)
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet()
    var sheet = ss.getSheetByName(PEDIDOS_SHEET)
    if (!sheet) {
      sheet = ss.insertSheet(PEDIDOS_SHEET)
      sheet.appendRow(PEDIDOS_HEADERS)
    }
    var items = typeof body.items === 'string'
      ? body.items
      : JSON.stringify(body.items || [])
    sheet.appendRow([
      new Date(),
      body.canal || 'menor',
      body.cliente || '',
      body.telefono || '',
      items,
      body.total != null ? body.total : '',
      body.estado || 'nuevo',
    ])
    return json_({ ok: true })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

/** Helper: respuesta JSON con el Content-Type correcto. */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
}
