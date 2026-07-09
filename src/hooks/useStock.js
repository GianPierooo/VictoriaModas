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
// Nunca recibe precios: /api/stock solo devuelve { id, color, talla, stock,
// estado }.
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

  return { ready: !!state, source: state?.source || 'none', getEstado }
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
