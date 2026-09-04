// Umbral de envío gratis (compartido por AnnouncementBanner, FreeShippingBar,
// CartPage, CheckoutPage, ProductPage, ChatWidget y api/chat.js). Cambiar
// solo aquí y actualizar el texto estático de esos archivos si difiere.
export const FREE_SHIPPING_THRESHOLD = 60

// Formato de precio en soles reutilizable. Devuelve "S/ 89" (o "S/ 1,290",
// "S/ 89.50") para números válidos, o null si no hay precio — así el llamador
// decide el texto de respaldo (p. ej. "Precio a consultar").
export function formatPEN(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (Number.isNaN(n)) return null
  const grouped = n.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return `S/ ${grouped}`
}

// "2026-09-20T00:00:00Z" -> "20/09". Sin año (la vigencia de la oferta ya
// se filtra server-side — ver api/stock.js#ofertaFor). Usado por ProductCard
// y ProductPage para mostrar "Oferta hasta el DD/MM".
export function formatFechaCorta(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

// Total del carrito en soles. `priceOf(item)` devuelve el precio unitario
// retail (o null). Devuelve { total, allPriced }: total = suma de las líneas
// con precio; allPriced = true solo si TODAS las líneas tienen precio (para
// decidir si el total es completo o hay que decir "a consultar").
export function cartTotal(items, priceOf) {
  let total = 0
  let allPriced = items.length > 0
  for (const it of items) {
    const p = priceOf(it)
    if (p == null) {
      allPriced = false
      continue
    }
    total += p * it.quantity
  }
  return { total, allPriced }
}
