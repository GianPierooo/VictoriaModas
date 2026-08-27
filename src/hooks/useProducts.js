// ============================================================
// useProducts — catálogo de productos, con Supabase como fuente real y
// fallback automático al catálogo estático (src/data/products.js).
// ------------------------------------------------------------
// Patrón "muestra algo ya, mejora después": el primer render SIEMPRE
// devuelve el catálogo estático (nunca vacío, nunca un loader nuevo que
// haya que meter en cada página) — y en segundo plano intenta traer el
// catálogo real de Supabase; si llega, la app se re-renderiza con eso.
// Si Supabase no está configurado, falla, o no tiene productos activos
// todavía, se queda con el estático — la web nunca se rompe.
//
// Devuelve el MISMO shape que ya usaba products.js (id, name, description,
// badge, category, fabric, image, images[], sizes[], colors[],
// colorImages{}), así que los consumidores existentes (ProductCard,
// ProductPage, ProductsPage, SearchModal, ChatWidget, etc.) casi no
// cambian: solo canjean el import estático por este hook.
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { PRODUCTS as STATIC_PRODUCTS } from '../data/products.js'

let cache = null // array ya transformado, una vez que Supabase respondió con datos
let inflight = null // promesa compartida (evita pedir dos veces en paralelo)

function toProductShape(row) {
  const tallas = new Set()
  const colores = new Set()
  const imagesByColor = {}

  for (const v of row.producto_variantes || []) {
    if (v.tallas?.nombre) tallas.add(v.tallas.nombre)
    if (v.colores?.nombre) colores.add(v.colores.nombre)
  }

  const imagenesOrdenadas = [...(row.producto_imagenes || [])].sort((a, b) => a.orden - b.orden)
  for (const img of imagenesOrdenadas) {
    const key = img.colores?.nombre || '__general__'
    if (!imagesByColor[key]) imagesByColor[key] = []
    imagesByColor[key].push(img.url)
  }

  const colorImages = {}
  for (const [color, urls] of Object.entries(imagesByColor)) {
    if (color !== '__general__') colorImages[color] = urls
  }
  const images = imagesByColor.__general__?.length
    ? imagesByColor.__general__
    : Object.values(colorImages)[0] || []

  return {
    id: row.id,
    name: row.nombre,
    description: row.descripcion || '',
    badge: row.badge || '',
    category: row.categorias?.slug || '',
    fabric: row.tela || '',
    image: images[0] || '',
    images,
    sizes: [...tallas],
    colors: [...colores],
    colorImages,
  }
}

async function fetchFromSupabase() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(slug), producto_imagenes(*, colores(nombre)), producto_variantes(*, tallas(nombre), colores(nombre))')
    .eq('activo', true)
  if (error) {
    console.error('[useProducts] Supabase falló, se queda con el catálogo estático:', error.message)
    return null
  }
  if (!data || data.length === 0) return null
  return data.map(toProductShape)
}

export function useProducts() {
  const [products, setProducts] = useState(cache || STATIC_PRODUCTS)
  const [source, setSource] = useState(cache ? 'supabase' : 'static')

  useEffect(() => {
    if (cache) return // ya se resolvió antes en esta sesión de la pestaña
    if (!inflight) inflight = fetchFromSupabase()

    let cancelled = false
    inflight.then((rows) => {
      if (cancelled) return
      if (rows && rows.length) {
        cache = rows
        setProducts(rows)
        setSource('supabase')
      }
      // si no hay filas o falló, se queda con STATIC_PRODUCTS (ya es el valor inicial)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    products,
    source, // 'static' | 'supabase' — útil para depurar, no cambia el comportamiento
    getProductById: (id) => products.find((p) => p.id === id) || null,
    getProductsByCategory: (category) => {
      if (!category) return []
      const slug = category.toLowerCase()
      return products.filter((p) => p.category.toLowerCase() === slug)
    },
    searchProducts: (query) => {
      const term = (query || '').trim().toLowerCase()
      if (!term) return []
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          (p.fabric && p.fabric.toLowerCase().includes(term))
      )
    },
  }
}
