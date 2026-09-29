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

// Hasta cuántos cm fuera del rango de la talla se considera "ligeramente"
// justa/suelta (y todavía aceptable). Más que eso → la talla no se
// recomienda para esa zona. Es un umbral de PRESENTACIÓN sobre la brecha
// real medida contra el rango cargado por el dueño, no un dato de la prenda.
export const UMBRAL_LIGERO_CM = 2
const UMBRAL_FUERTE_CM = 5

// Detalle de UNA medida (cintura o cadera) contra el rango de una talla:
//  - null                       → sin dato cargado para esa talla/medida
//  - { estado:'ideal', diff:0 } → dentro del rango
//  - { estado:'holgado', diff } → el valor de la clienta es MENOR al mínimo
//                                 (le queda suelta); diff = cm que le faltan
//  - { estado:'ajustado', diff }→ el valor es MAYOR al máximo (le queda
//                                 justa); diff = cm que se pasa
function detalleMedida(valor, min, max) {
  if (min == null && max == null) return null
  if (min != null && valor < min) return { estado: 'holgado', diff: min - valor }
  if (max != null && valor > max) return { estado: 'ajustado', diff: valor - max }
  return { estado: 'ideal', diff: 0 }
}

// Nivel de aviso de una zona: 'ok' (ideal) · 'aviso' (a ≤2 cm del rango) ·
// 'mal' (más lejos). null si no hay dato.
export function nivelZona(detalle) {
  if (!detalle) return null
  if (detalle.estado === 'ideal') return 'ok'
  return detalle.diff <= UMBRAL_LIGERO_CM ? 'aviso' : 'mal'
}

// Frase natural para una zona: "ideal", "ligeramente justa", "suelta"...
// (cintura y cadera son femeninas: "te queda ligeramente justa").
export function etiquetaZona(detalle) {
  if (!detalle) return ''
  if (detalle.estado === 'ideal') return 'ideal'
  const grado = detalle.diff <= UMBRAL_LIGERO_CM ? 'ligeramente ' : detalle.diff > UMBRAL_FUERTE_CM ? 'muy ' : ''
  return `${grado}${detalle.estado === 'ajustado' ? 'justa' : 'suelta'}`
}

// Nivel global de una talla: el peor de sus zonas.
//  'ideal' (todo ok) · 'aceptable' (alguna "ligeramente") · 'no' (alguna >2cm)
function nivelTalla(detalles) {
  const niveles = detalles.map(nivelZona).filter(Boolean)
  if (niveles.length === 0) return null
  if (niveles.includes('mal')) return 'no'
  if (niveles.includes('aviso')) return 'aceptable'
  return 'ideal'
}

// "hasta 66 cm" · "66–70 cm" · "más de 70 cm" — para mostrar el rango de
// cuerpo que cubre una talla.
export function textoRango([min, max]) {
  if (min == null && max == null) return null
  if (min == null) return `hasta ${max} cm`
  if (max == null) return `desde ${min} cm`
  return `${min}–${max} cm`
}

// Posición de un valor a lo largo de las tallas puestas una tras otra (S | M | L):
// entero = inicio del tramo de esa talla, fracción = avance dentro de su rango.
// `rangos` = [[min,max], ...] en orden de talla; los extremos abiertos (S sin
// mínimo, L sin máximo) usan el ancho típico de los demás tramos. Devuelve
// { pos: 0..n, fuera: 'bajo' | 'alto' | null } — alimenta el medidor de tallas.
export function posicionEnTallas(valor, rangos) {
  const n = rangos.length
  const cerrados = rangos.filter(([a, b]) => a != null && b != null).map(([a, b]) => b - a).sort((x, y) => x - y)
  const anchoRef = cerrados.length ? cerrados[Math.floor(cerrados.length / 2)] : 6
  const tramos = rangos.map(([min, max]) => ({
    lo: min ?? (max != null ? max - anchoRef : null),
    hi: max ?? (min != null ? min + anchoRef : null),
  }))
  const primero = tramos[0]
  const ultimo = tramos[n - 1]
  if (!primero || !ultimo || primero.lo == null || ultimo.hi == null) return { pos: 0, fuera: null }
  if (valor < primero.lo) return { pos: 0, fuera: 'bajo' }
  if (valor > ultimo.hi) return { pos: n, fuera: 'alto' }
  for (let i = 0; i < n; i++) {
    const { lo, hi } = tramos[i]
    if (lo == null || hi == null) continue
    if (valor <= hi) return { pos: Math.min(n, Math.max(0, i + (valor - lo) / (hi - lo))), fuera: null }
  }
  return { pos: n, fuera: null }
}

// Frase corta de cuánto se aparta una medida del rango de la talla:
// "dentro del rango de M (66–70)" · "3 cm por encima del rango de M (66–70)".
export function textoDiferencia(detalle, talla, rango) {
  const r = textoRango(rango)
  const sufijo = r ? ` (${r.replace(' cm', '')})` : ''
  if (!detalle) return ''
  if (detalle.estado === 'ideal') return `dentro del rango de ${talla}${sufijo}`
  const cm = Math.round(detalle.diff * 10) / 10
  return `${cm} cm por ${detalle.estado === 'ajustado' ? 'encima' : 'debajo'} del rango de ${talla}${sufijo}`
}

// Recomendación por medidas exactas (cintura/cadera en cm) — el modo preciso.
// Devuelve { recomendada, candidatas, fueraDeRango } donde:
//  - candidatas: una entrada por talla con el detalle de cintura/cadera
//    (estado + brecha en cm), su nivel global y `gap` (suma de brechas, 0 =
//    calza perfecto) — alimenta el maniquí y los badges de cada talla.
//  - recomendada: la candidata con menor brecha total (empate: la que menos
//    "aprieta", luego la más chica). null si ninguna sirve.
//  - fueraDeRango: 'grande' / 'chica' si ni la mejor talla queda cómoda
//    (alguna zona a más de 2 cm de su rango) — ahí es honesto decir que no
//    hay talla para ella en vez de forzar una recomendación; 'nada' si no
//    hay datos que comparar.
export function recomendarPorMedidas({ cintura, cadera }, filas) {
  const candidatas = filas.map((f) => {
    const cinturaDet = detalleMedida(cintura, f.cintura_min_cm, f.cintura_max_cm)
    const caderaDet = detalleMedida(cadera, f.cadera_min_cm, f.cadera_max_cm)
    const detalles = [cinturaDet, caderaDet].filter(Boolean)
    return {
      tallaId: f.talla_id,
      tallaNombre: f.tallas.nombre,
      orden: f.tallas.orden || 0,
      cinturaEstado: cinturaDet?.estado ?? null,
      caderaEstado: caderaDet?.estado ?? null,
      cinturaDet,
      caderaDet,
      cinturaRango: [f.cintura_min_cm, f.cintura_max_cm],
      caderaRango: [f.cadera_min_cm, f.cadera_max_cm],
      nivel: nivelTalla(detalles), // 'ideal' | 'aceptable' | 'no' | null
      gap: detalles.length ? detalles.reduce((s, d) => s + d.diff, 0) : null,
      ajustadas: detalles.filter((d) => d.estado === 'ajustado').length,
    }
  })

  const evaluables = candidatas.filter((c) => c.gap != null)
  if (evaluables.length === 0) {
    return { recomendada: null, candidatas, fueraDeRango: 'nada' }
  }

  const mejor = [...evaluables].sort((a, b) => a.gap - b.gap || a.ajustadas - b.ajustadas || a.orden - b.orden)[0]

  if (mejor.nivel === 'no') {
    const quedaJusta = [mejor.cinturaDet, mejor.caderaDet].some((d) => d && d.estado === 'ajustado' && d.diff > UMBRAL_LIGERO_CM)
    return { recomendada: null, mejorAproximada: mejor, candidatas, fueraDeRango: quedaJusta ? 'grande' : 'chica' }
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

// ---- Medidas guardadas en el dispositivo de la clienta -------------------
// Se guardan SOLO en su navegador (localStorage) para que en otra prenda no
// tenga que volver a escribirlas; nunca se envían a ningún servidor. Todo
// está en try/catch: en modo privado o con almacenamiento bloqueado el
// probador simplemente funciona sin recordar nada.
const CLAVE_PERFIL = 'vm_probador_v1'

export function leerPerfilProbador() {
  try {
    const raw = localStorage.getItem(CLAVE_PERFIL)
    if (!raw) return null
    const p = JSON.parse(raw)
    const cintura = Number(p?.cintura)
    const cadera = Number(p?.cadera)
    const tono = Number.isInteger(p?.tono) ? p.tono : null
    return {
      cintura: Number.isFinite(cintura) && cintura > 0 ? cintura : null,
      cadera: Number.isFinite(cadera) && cadera > 0 ? cadera : null,
      tono,
    }
  } catch {
    return null
  }
}

export function guardarPerfilProbador(parcial) {
  try {
    const actual = leerPerfilProbador() || {}
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify({ ...actual, ...parcial }))
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function borrarPerfilProbador() {
  try {
    localStorage.removeItem(CLAVE_PERFIL)
  } catch {
    /* idem */
  }
}
