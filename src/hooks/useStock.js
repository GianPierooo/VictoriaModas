// ============================================================
// useStock — indicador de stock en vivo (lee /api/stock)
// ------------------------------------------------------------
// Trae /api/stock UNA vez (cache a nivel de módulo, compartida por toda la
// app) y expone getEstado(id, color, talla).
//
// Robusto por diseño: si la API no existe (p. ej. `vite dev`, que no sirve
// /api), falla o aún no hay hoja conectada (source "none"), NO rompe la web:
// todo queda como 'consultar' y el indicador simplemente no se muestra.
//
// /api/stock devuelve { id, color, talla, stock, estado, precioMenorPEN }.
// El precio es RETAIL (menor); el de mayoreo NUNCA llega por aquí.
// ============================================================
import { useEffect, useState } from 'react'

let cache = null // { source, byKey: Map<string, item> }
let inflight = null

const keyOf = (id, color, talla) =>
  `${String(id).toLowerCase()}|${String(color).toLowerCase()}|${String(talla).toLowerCase()}`

async function loadStock() {
  if (cache) return cache
  if (inflight) return inflight
  inflight = fetch('/api/stock')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`stock HTTP ${r.status}`))))
    .then((data) => {
      const byKey = new Map()
      for (const it of data.items || []) {
        byKey.set(keyOf(it.id, it.color, it.talla), it)
      }
      cache = { source: data.source || 'none', byKey }
      return cache
    })
    .catch(() => {
      // Fallback silencioso: la web nunca se rompe por el stock.
      cache = { source: 'none', byKey: new Map() }
      return cache
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

export function useStock() {
  const [state, setState] = useState(cache)

  useEffect(() => {
    let alive = true
    loadStock().then((c) => {
      if (alive) setState(c)
    })
    return () => {
      alive = false
    }
  }, [])

  const getEstado = (id, color, talla) => {
    if (!state) return 'consultar'
    const it = state.byKey.get(keyOf(id, color, talla))
    return it ? it.estado : 'consultar'
  }

  // Estado AGREGADO por producto (todas sus variantes): útil en cards/listas
  // donde aún no hay color/talla elegidos. Prioridad: alguna disponible →
  // 'disponible'; si no, alguna en últimas → 'ultimas'; si todas agotadas →
  // 'agotado'; sin datos → 'consultar'.
  const getEstadoProducto = (id) => {
    if (!state) return 'consultar'
    const pid = String(id).toLowerCase()
    let any = false
    let best = 'agotado'
    for (const it of state.byKey.values()) {
      if (String(it.id).toLowerCase() !== pid) continue
      any = true
      if (it.estado === 'disponible') return 'disponible'
      if (it.estado === 'ultimas') best = 'ultimas'
    }
    return any ? best : 'consultar'
  }

  // Precio RETAIL (soles) de una variante concreta, o null si no hay dato.
  const getPrecio = (id, color, talla) => {
    if (!state) return null
    const it = state.byKey.get(keyOf(id, color, talla))
    return it && it.precioMenorPEN != null ? it.precioMenorPEN : null
  }

  // Precio RETAIL representativo de un producto (mínimo de sus variantes con
  // precio), para cards/listas sin variante elegida. null si no hay precio.
  const getPrecioProducto = (id) => {
    if (!state) return null
    const pid = String(id).toLowerCase()
    let min = null
    for (const it of state.byKey.values()) {
      if (String(it.id).toLowerCase() !== pid) continue
      const p = it.precioMenorPEN
      if (p != null && (min === null || p < min)) min = p
    }
    return min
  }

  return {
    ready: !!state,
    source: state?.source || 'none',
    getEstado,
    getEstadoProducto,
    getPrecio,
    getPrecioProducto,
  }
}

// Estilo del indicador por estado (paleta clay/ink). Devuelve null para
// 'consultar'/desconocido → en ese caso NO se muestra nada (neutro).
const ESTADO_STYLE = {
  disponible: { label: 'Disponible', color: '#5B5150', dot: '#9C5F4E' },
  ultimas: { label: 'Últimas piezas', color: '#8A5340', dot: '#8A5340' },
  agotado: { label: 'Agotado', color: '#756967', dot: '#756967' },
}

export function estadoStyle(estado) {
  return ESTADO_STYLE[estado] || null
}
