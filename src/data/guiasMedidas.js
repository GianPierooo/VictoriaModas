// ============================================================
// GUÍAS DE MEDIDAS (fichas informativas por talla) — Victoria Modas
// ------------------------------------------------------------
// Una imagen por prenda y talla (cintura/cadera/largo/basta de la prenda en
// plano), hechas por el dueño y publicadas tal cual: son el equivalente a la
// ventana "Tallas y medidas" de las tiendas grandes. Los archivos viven en
// public/imagenes/guias-medidas/<id-del-producto>-<talla>.webp.
//
// La calculadora del probador (tabla `tallas_medidas` en Supabase) es aparte:
// esa recomienda talla; esto solo muestra la ficha. Para sumar una prenda
// nueva: copiar sus WebP a esa carpeta y agregar su id aquí.
// ============================================================
const BASE = '/imagenes/guias-medidas'
const TALLAS = ['S', 'M', 'L']

const fichasDe = (productoId) =>
  Object.fromEntries(TALLAS.map((t) => [t, `${BASE}/${productoId}-${t.toLowerCase()}.webp`]))

export const GUIAS_MEDIDAS = {
  'pantalon-scuba-vena': fichasDe('pantalon-scuba-vena'),
  'pantalon-scuba-correa': fichasDe('pantalon-scuba-correa'),
  'pantalon-palazo': fichasDe('pantalon-palazo'),
}

// { S: '/imagenes/...webp', M: ..., L: ... } o null si la prenda no tiene fichas.
export function getGuiasMedidas(productoId) {
  return GUIAS_MEDIDAS[productoId] || null
}
