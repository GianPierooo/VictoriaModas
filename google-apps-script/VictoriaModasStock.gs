/************************************************************************
 * Victoria Modas — Web App de Stock y Pedidos (Google Apps Script)
 * ---------------------------------------------------------------------
 * Este script convierte la hoja de cálculo en una pequeña API privada:
 *   · GET  → devuelve la pestaña "Stock" como JSON (array de objetos).
 *   · POST → agrega un pedido a la pestaña "Pedidos" (Fase 2).
 *
 * La web (Vercel) NUNCA llama a esta URL directo: la llama la función
 * serverless /api/stock, que descarta los precios y solo publica la
 * disponibilidad. La URL de este web app es SECRETA (va en una variable
 * de entorno de Vercel), por eso puede quedar como "cualquiera con el
 * enlace" sin exponer precios de mayoreo al navegador.
 *
 * ─── CÓMO DESPLEGARLO (una sola vez) ─────────────────────────────────
 * 1. Abre la hoja de cálculo en Google Sheets.
 * 2. Menú  Extensiones → Apps Script.
 * 3. Borra lo que haya y pega TODO este archivo. Guarda (💾).
 * 4. Asegúrate de que la hoja tenga una pestaña llamada exactamente
 *    "Stock" con esta primera fila de encabezados (en este orden):
 *        id | nombre | color | talla | stock | canal |
 *        precioMenorPEN | precioMayorPEN | precioMenorUSD | activo
 *    (la pestaña "Pedidos" se crea sola al recibir el primer pedido).
 * 5. Botón azul  Implementar → Nueva implementación.
 * 6. Tipo (⚙️) → "Aplicación web".
 *        · Descripción:      Victoria Modas Stock
 *        · Ejecutar como:    Yo (el dueño de la hoja)
 *        · Quién tiene acceso: "Cualquier usuario"  (o "Cualquiera con el enlace")
 * 7. Implementar → autoriza los permisos que pida (es tu propia cuenta).
 * 8. Copia la  "URL de la aplicación web"  (termina en /exec).
 *    Esa URL es la que va en Vercel como  SHEETS_WEBAPP_URL.
 *
 * Si más adelante editas este script, usa  Implementar → Gestionar
 * implementaciones → editar (lápiz) → Versión "Nueva" para que la MISMA
 * URL /exec sirva el código actualizado (no cambia la URL).
 ************************************************************************/

var STOCK_SHEET = 'Stock'
var PEDIDOS_SHEET = 'Pedidos'
var PEDIDOS_HEADERS = ['fecha', 'canal', 'cliente', 'telefono', 'items', 'total', 'estado']

/**
 * GET → lee la pestaña "Stock" y la devuelve como JSON: un array de
 * objetos donde las claves son los encabezados de la primera fila.
 */
function doGet() {
  var out = { ok: true, rows: [] }
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(STOCK_SHEET)
    if (!sheet) {
      out = { ok: false, error: 'No existe la pestaña "' + STOCK_SHEET + '"', rows: [] }
    } else {
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
  } catch (err) {
    out = { ok: false, error: String(err), rows: [] }
  }
  return json_(out)
}

/**
 * POST → recibe un pedido en JSON y lo agrega a la pestaña "Pedidos".
 * (Se usará en la Fase 2 desde /api/pedido; queda listo para no volver a
 * desplegar.) Cuerpo esperado (todos opcionales salvo lo que quieras
 * registrar):
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
