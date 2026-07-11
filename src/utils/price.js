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
