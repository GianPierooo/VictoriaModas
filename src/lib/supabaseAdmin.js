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
// Clientes (ficha de mostrador — no requiere que tengan cuenta en la web;
// si más adelante inician sesión con el mismo correo, `user_id` los liga).
// ---------------------------------------------------------
export async function listClientes() {
  if (guard(true)) return []
  const { data, error } = await supabase.from('clientes').select('*').order('nombre')
  if (error) throw error
  return data
}

export async function createCliente(cliente) {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('clientes')
    .insert({ ...cliente, creado_por: userData?.user?.id || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCliente(id, cliente) {
  const { error } = await supabase.from('clientes').update(cliente).eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------
// Ventas (para "Mis pedidos" del cliente; el panel vendedor las escribe)
// ---------------------------------------------------------

// Ventas del cliente que tiene sesión — busca primero su ficha de cliente
// (por user_id) y luego sus ventas. Si nunca compró (sin ficha), vacío.
export async function listVentasCliente(userId) {
  if (guard(true) || !userId) return []
  const { data: cliente } = await supabase.from('clientes').select('id').eq('user_id', userId).maybeSingle()
  if (!cliente) return []
  const { data, error } = await supabase
    .from('ventas')
    .select('*, venta_items(*)')
    .eq('cliente_id', cliente.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Todas las ventas — para el panel vendedor.
export async function listVentasStaff() {
  if (guard(true)) return []
  const { data, error } = await supabase
    .from('ventas')
    .select('*, clientes(nombre, telefono), venta_items(*, producto_variantes(*, productos(nombre), tallas(nombre), colores(nombre)))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function updateVentaEstado(id, estado) {
  const { error } = await supabase.from('ventas').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

// Catálogo para armar una venta: productos activos con sus variantes (stock,
// precio) y nombre de talla/color — lo que necesita el selector de la nueva
// venta.
export async function listProductosParaVenta() {
  if (guard(true)) return []
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, producto_variantes(*, tallas(nombre), colores(nombre))')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

// Crea la venta + sus items, y descuenta el stock vendido de cada variante
// (PB-002: "integrar las ventas con la actualización de stock"). No es
// atómico (son varias llamadas), pero valida stock disponible ANTES de
// escribir nada — si algo no alcanza, no se crea la venta a medias.
export async function createVenta({ clienteId, items, canal = 'menor', direccionEnvio = '', telefonoContacto = '', notas = '' }) {
  if (!items.length) throw new Error('La venta necesita al menos un producto.')

  // Verifica stock disponible antes de comprometer nada.
  const ids = items.map((it) => it.variante_id)
  const { data: variantesActuales, error: errStock } = await supabase
    .from('producto_variantes')
    .select('id, stock')
    .in('id', ids)
  if (errStock) throw errStock
  for (const it of items) {
    const actual = variantesActuales.find((v) => v.id === it.variante_id)
    if (!actual || actual.stock < it.cantidad) {
      throw new Error(`No hay stock suficiente para uno de los productos elegidos.`)
    }
  }

  const subtotal = items.reduce((sum, it) => sum + it.precio_unitario * it.cantidad, 0)
  const { data: userData } = await supabase.auth.getUser()

  const { data: venta, error: errVenta } = await supabase
    .from('ventas')
    .insert({
      cliente_id: clienteId,
      vendedor_user_id: userData?.user?.id || null,
      canal,
      estado: 'confirmado',
      subtotal,
      total: subtotal,
      direccion_envio: direccionEnvio,
      telefono_contacto: telefonoContacto,
      notas,
    })
    .select()
    .single()
  if (errVenta) throw errVenta

  const filasItems = items.map((it) => ({
    venta_id: venta.id,
    producto_variante_id: it.variante_id,
    cantidad: it.cantidad,
    precio_unitario: it.precio_unitario,
  }))
  const { error: errItems } = await supabase.from('venta_items').insert(filasItems)
  if (errItems) throw errItems

  // Descuenta stock (una actualización por variante — suficiente a esta escala).
  for (const it of items) {
    const actual = variantesActuales.find((v) => v.id === it.variante_id)
    await supabase
      .from('producto_variantes')
      .update({ stock: actual.stock - it.cantidad })
      .eq('id', it.variante_id)
  }

  return venta
}
