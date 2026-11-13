// Utilidades compartidas del panel admin (formato, CSV, WhatsApp, plazos).

// Valores de `ventas.estado` (check en la base). "confirmado" = pago validado
// (Culqi o registrado en el panel), por eso se muestra como "Pagado".
export const ESTADOS_VENTA = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado']
export const ESTADO_VENTA_LABEL = {
  pendiente: 'Pendiente',
  confirmado: 'Pagado',
  en_preparacion: 'En preparación',
  enviado: 'Despachado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}
// Documento del cliente. Mismas reglas que el check `clientes_documento_check`.
export const TIPOS_DOCUMENTO = { DNI: 'DNI', RUC: 'RUC', CE: 'Carné de extranjería' }
export function errorDocumento(tipo, documento) {
  if (!documento) return null
  if (tipo === 'DNI' && !/^\d{8}$/.test(documento)) return 'El DNI debe tener 8 dígitos.'
  if (tipo === 'RUC' && !/^(10|15|17|20)\d{9}$/.test(documento)) return 'El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20.'
  if (tipo === 'CE' && !/^[A-Z0-9]{8,12}$/.test(documento)) return 'El carné de extranjería debe tener de 8 a 12 caracteres.'
  return null
}

export const ORIGEN_LABEL = { culqi: 'Web · tarjeta', admin_manual: 'Panel' }
export const origenLabel = (o) => ORIGEN_LABEL[o] || o || '—'

export const MOTIVO_STOCK_LABEL = {
  venta: 'Venta (panel)',
  venta_web: 'Venta web / automático',
  cancelacion: 'Venta cancelada',
  ajuste: 'Ajuste manual',
  reposicion: 'Reposición',
  merma: 'Merma / falla',
  devolucion: 'Devolución',
  conteo: 'Conteo de inventario',
}
export const motivoStockLabel = (m) => MOTIVO_STOCK_LABEL[m] || m

export function fechaCorta(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fechaHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// Teléfono peruano → enlace wa.me (agrega 51 si vienen 9 dígitos).
export function whatsappHref(telefono, mensaje = '') {
  const digitos = String(telefono || '').replace(/\D/g, '')
  if (digitos.length < 9) return null
  const numero = digitos.length === 9 ? `51${digitos}` : digitos
  return `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
}

// Días hábiles (lun–vie) transcurridos desde una fecha. No descuenta
// feriados: cuenta de más, así que el aviso de plazo salta antes, nunca después.
export function diasHabilesTranscurridos(desde) {
  const ahora = new Date()
  let dias = 0
  const cursor = new Date(desde)
  while (cursor < ahora) {
    cursor.setDate(cursor.getDate() + 1)
    const d = cursor.getDay()
    if (d !== 0 && d !== 6 && cursor <= ahora) dias++
  }
  return dias
}

// Descarga un CSV (separador ; y BOM para que Excel en español lo abra bien).
export function descargarCSV(nombreArchivo, columnas, filas) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lineas = [columnas.map((c) => esc(c.label)).join(';')]
  for (const f of filas) lineas.push(columnas.map((c) => esc(c.value(f))).join(';'))
  const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}

export const hoyISO = () => new Date().toISOString().slice(0, 10)
