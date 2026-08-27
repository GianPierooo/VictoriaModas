// ============================================================
// supabaseAdmin — acceso a las tablas del panel admin/vendedor.
// ------------------------------------------------------------
// Todo pasa por el cliente normal (`anon` key) + RLS: la seguridad real
// vive en las políticas de Supabase (solo `perfiles.rol = 'admin'` puede
// escribir en catálogo; ver el esquema). Nunca se usa `service_role` aquí.
//
// Si `supabase` es null (faltan las env vars), cada función devuelve un
// resultado vacío/seguro en vez de reventar — mismo criterio que el resto
// del proyecto (ver `src/lib/supabaseClient.js`).
// ============================================================
import { supabase } from './supabaseClient.js'

const BUCKET = 'productos-imagenes'

function guard(fallback) {
  if (!supabase) {
    console.warn('[supabaseAdmin] Supabase no configurado — devolviendo valor vacío.')
    return fallback
  }
  return null
}

// ---------------------------------------------------------
// Catálogo base: categorías, tallas, colores
// ---------------------------------------------------------
export async function listCategorias() {
  if (guard(true)) return []
  const { data, error } = await supabase.from('categorias').select('*').order('orden')
  if (error) throw error
  return data
}

export async function listTallas() {
  if (guard(true)) return []
  const { data, error } = await supabase.from('tallas').select('*').order('orden')
  if (error) throw error
  return data
}

export async function listColores() {
  if (guard(true)) return []
  const { data, error } = await supabase.from('colores').select('*').order('orden')
  if (error) throw error
  return data
}

const LOOKUP_TABLES = { categorias: 'categorias', tallas: 'tallas', colores: 'colores' }

export async function createLookup(tabla, valores) {
  const { data, error } = await supabase.from(LOOKUP_TABLES[tabla]).insert(valores).select().single()
  if (error) throw error
  return data
}

export async function updateLookup(tabla, id, valores) {
  const { error } = await supabase.from(LOOKUP_TABLES[tabla]).update(valores).eq('id', id)
  if (error) throw error
}

export async function deleteLookup(tabla, id) {
  const { error } = await supabase.from(LOOKUP_TABLES[tabla]).delete().eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------
// Productos
// ---------------------------------------------------------

// Lista para /admin/productos: info básica + conteo de variantes/stock.
export async function listProductosAdmin() {
  if (guard(true)) return []
  const { data, error } = await supabase
    .from('productos')
    .select('*, categorias(nombre), producto_variantes(stock)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((p) => ({
    ...p,
    categoriaNombre: p.categorias?.nombre || '—',
    variantesCount: p.producto_variantes?.length || 0,
    stockTotal: (p.producto_variantes || []).reduce((sum, v) => sum + (v.stock || 0), 0),
  }))
}

// Detalle para el formulario: producto + variantes (con nombre de talla/color) + imágenes.
export async function getProductoAdmin(id) {
  if (guard(null)) return null
  const { data, error } = await supabase
    .from('productos')
    .select(`
      *,
      producto_variantes(*, tallas(nombre), colores(nombre, hex)),
      producto_imagenes(*, colores(nombre))
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

// Crea o actualiza los datos básicos del producto (no toca variantes/imágenes).
export async function upsertProducto(producto) {
  const { data, error } = await supabase.from('productos').upsert(producto).select().single()
  if (error) throw error
  return data
}

export async function deleteProducto(id) {
  const { error } = await supabase.from('productos').delete().eq('id', id)
  if (error) throw error
}

// Reemplaza TODAS las variantes de un producto por la lista dada (batch:
// simple de razonar para un formulario chico como este — borra las que ya
// no están y upsertea el resto).
export async function replaceVariantes(productoId, variantes) {
  const { data: actuales, error: errList } = await supabase
    .from('producto_variantes')
    .select('id')
    .eq('producto_id', productoId)
  if (errList) throw errList

  const idsNuevos = new Set(variantes.filter((v) => v.id).map((v) => v.id))
  const idsABorrar = (actuales || []).map((v) => v.id).filter((id) => !idsNuevos.has(id))
  if (idsABorrar.length) {
    const { error } = await supabase.from('producto_variantes').delete().in('id', idsABorrar)
    if (error) throw error
  }

  const filas = variantes.map((v) => ({
    ...(v.id ? { id: v.id } : {}),
    producto_id: productoId,
    talla_id: v.talla_id,
    color_id: v.color_id,
    stock: Number(v.stock) || 0,
    precio_menor_pen: v.precio_menor_pen === '' ? null : Number(v.precio_menor_pen),
    precio_mayor_pen: v.precio_mayor_pen === '' ? null : Number(v.precio_mayor_pen),
    precio_menor_usd: v.precio_menor_usd === '' ? null : Number(v.precio_menor_usd),
    canal: v.canal || 'menor',
    activo: v.activo !== false,
  }))
  if (filas.length) {
    const { error } = await supabase.from('producto_variantes').upsert(filas)
    if (error) throw error
  }
}

// ---------------------------------------------------------
// Imágenes (Supabase Storage, bucket público `productos-imagenes`)
// ---------------------------------------------------------
export async function uploadProductoImagen(productoId, colorId, file, orden = 0) {
  const ext = file.name.split('.').pop()
  const path = `${productoId}/${colorId || 'general'}-${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file)
  if (upErr) throw upErr
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const { data, error } = await supabase
    .from('producto_imagenes')
    .insert({ producto_id: productoId, color_id: colorId || null, url: pub.publicUrl, orden })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProductoImagen(imagen) {
  // Borra el registro; el archivo en Storage se deja (barato, evita borrar
  // de más si algo más lo referencia) — limpieza de Storage es manual.
  const { error } = await supabase.from('producto_imagenes').delete().eq('id', imagen.id)
  if (error) throw error
}

// ---------------------------------------------------------
// Ventas (para "Mis pedidos" del cliente; el panel vendedor las escribe)
// ---------------------------------------------------------
export async function listVentasCliente(userId) {
  if (guard(true) || !userId) return []
  const { data, error } = await supabase
    .from('ventas')
    .select('*, venta_items(*)')
    .eq('cliente_user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
