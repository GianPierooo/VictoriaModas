// ============================================================
// tallas.js — guía de tallas inteligente (lógica de recomendación)
// ------------------------------------------------------------
// Compara las medidas de la clienta contra la tabla de medidas REALES de
// una prenda específica (tabla `tallas_medidas`, cargada por el dueño en
// /admin — nunca inventada ni calculada por fórmulas genéricas de
// peso→cm, ver política de precios honestos).
//
// Dos modos, independientes entre sí (cada uno usa sus propias columnas):
//  - "medidas": cintura/cadera en cm — el más preciso.
//  - "pesoAltura": peso/altura — rápido, para quien no sabe sus medidas.
// Si el dueño no cargó datos para un modo en una prenda, ese modo
// simplemente no está disponible ahí (nunca se estima/inventa).
// ============================================================
import { supabase } from './supabaseClient.js'

// Trae la tabla de medidas de una prenda, ordenada por talla (XS→L→...).
// Devuelve [] si no hay Supabase, no hay filas, o falla — nunca revienta.
export async function fetchMedidasProducto(productoId) {
  if (!supabase || !productoId) return []
  const { data, error } = await supabase
    .from('tallas_medidas')
    .select('*, tallas(nombre, orden)')
    .eq('producto_id', productoId)
  if (error) {
    console.warn('[tallas] no se pudo cargar la guía de tallas:', error.message)
    return []
  }
  return (data || [])
    .filter((f) => f.tallas) // por si la talla fue borrada del catálogo
    .sort((a, b) => (a.tallas.orden || 0) - (b.tallas.orden || 0))
}

// ¿Esta prenda tiene guía de tallas cargada (en al menos un modo)?
export function tieneGuiaDeTallas(filas) {
  return filas.some(
    (f) =>
      f.cintura_min_cm != null ||
      f.cintura_max_cm != null ||
      f.cadera_min_cm != null ||
      f.cadera_max_cm != null ||
      f.peso_min_kg != null ||
      f.peso_max_kg != null ||
      f.altura_min_cm != null ||
      f.altura_max_cm != null
  )
}

export function tieneModoMedidas(filas) {
  return filas.some((f) => f.cintura_min_cm != null || f.cintura_max_cm != null || f.cadera_min_cm != null || f.cadera_max_cm != null)
}

export function tieneModoPesoAltura(filas) {
  return filas.some((f) => f.peso_min_kg != null || f.peso_max_kg != null || f.altura_min_cm != null || f.altura_max_cm != null)
}

// Estado de UNA medida (cintura o cadera) contra el rango de una talla:
//  - null     → sin dato cargado para esa talla/medida (no se evalúa)
//  - 'ideal'  → dentro del rango
//  - 'holgado'  → el valor de la clienta es MENOR al mínimo (le quedará grande)
//  - 'ajustado' → el valor de la clienta es MAYOR al máximo (le quedará chico)
function estadoMedida(valor, min, max) {
  if (min == null && max == null) return null
  if (min != null && valor < min) return 'holgado'
  if (max != null && valor > max) return 'ajustado'
  return 'ideal'
}

// Recomendación por medidas exactas (cintura/cadera en cm) — el modo preciso.
// Devuelve { recomendada, candidatas, fueraDeRango } donde:
//  - candidatas: una entrada por talla con estado de cintura/cadera y un
//    score (0 = calza perfecto en ambas) — para el medidor visual.
//  - recomendada: la candidata con mejor score (o null si ninguna sirve).
//  - fueraDeRango: 'grande' si la clienta mide más que la talla más grande
//    disponible (no hay nada que le calce), 'nada' si no hay datos.
export function recomendarPorMedidas({ cintura, cadera }, filas) {
  const candidatas = filas.map((f) => {
    const cinturaEstado = estadoMedida(cintura, f.cintura_min_cm, f.cintura_max_cm)
    const caderaEstado = estadoMedida(cadera, f.cadera_min_cm, f.cadera_max_cm)
    const estados = [cinturaEstado, caderaEstado].filter(Boolean)
    const score = estados.filter((e) => e !== 'ideal').length
    return {
      tallaId: f.talla_id,
      tallaNombre: f.tallas.nombre,
      orden: f.tallas.orden || 0,
      cinturaEstado,
      caderaEstado,
      cinturaRango: [f.cintura_min_cm, f.cintura_max_cm],
      caderaRango: [f.cadera_min_cm, f.cadera_max_cm],
      score: estados.length ? score : null, // null = sin datos para comparar
    }
  })

  const evaluables = candidatas.filter((c) => c.score != null)
  if (evaluables.length === 0) {
    return { recomendada: null, candidatas, fueraDeRango: 'nada' }
  }

  const mejor = [...evaluables].sort((a, b) => a.score - b.score || a.orden - b.orden)[0]

  // ¿Le queda chica incluso la talla más grande? (ajustada en ambas medidas
  // en la última talla de la tabla) — ahí sí es honesto decir que no hay
  // talla disponible, en vez de recomendar la más grande igual.
  const masGrande = evaluables[evaluables.length - 1]
  const ajustadaEnGrande = masGrande.cinturaEstado === 'ajustado' && masGrande.caderaEstado === 'ajustado'
  if (mejor.score > 0 && ajustadaEnGrande) {
    return { recomendada: null, candidatas, fueraDeRango: 'grande' }
  }

  return { recomendada: mejor, candidatas, fueraDeRango: null }
}

// Recomendación por peso/altura — el modo rápido. Solo funciona si el dueño
// cargó rangos de peso/altura para esta prenda (nunca se estima con una
// fórmula genérica peso→talla, ver cabecera del archivo).
export function recomendarPorPesoAltura({ peso, altura }, filas) {
  const candidatas = filas
    .filter((f) => f.peso_min_kg != null || f.peso_max_kg != null || f.altura_min_cm != null || f.altura_max_cm != null)
    .map((f) => {
      const pesoOk = (f.peso_min_kg == null || peso >= f.peso_min_kg) && (f.peso_max_kg == null || peso <= f.peso_max_kg)
      const alturaOk = (f.altura_min_cm == null || altura >= f.altura_min_cm) && (f.altura_max_cm == null || altura <= f.altura_max_cm)
      return { tallaId: f.talla_id, tallaNombre: f.tallas.nombre, orden: f.tallas.orden || 0, calza: pesoOk && alturaOk }
    })
    .sort((a, b) => a.orden - b.orden)

  const coinciden = candidatas.filter((c) => c.calza)
  return { recomendadas: coinciden, todas: candidatas }
}
