// ============================================================
// /api/culqi-cobrar — cobra un pedido con Culqi (tarjeta) y, si el cobro
// se aprueba, descuenta el stock vendido.
// ------------------------------------------------------------
// Función serverless (runtime Node.js de Vercel, ESM).
//
// Regla de oro (dinero real): el MONTO A COBRAR se recalcula SIEMPRE en el
// servidor a partir de Supabase (precio_menor_pen de cada variante) — nunca
// se confía en el total que manda el navegador. Así, aunque alguien manipule
// el `amount` desde la consola del navegador, Culqi solo recibe el monto que
// esta función calculó por su cuenta.
//
// Flujo:
//   1. El cliente llena el Custom Checkout de Culqi en el navegador y obtiene
//      un `token` (los datos de la tarjeta nunca tocan este servidor).
//   2. El navegador manda aquí { token, email, items, cuponCodigo, cliente }.
//   3. Esta función valida stock + recalcula el total real, cobra con la
//      Llave Secreta (CULQI_SECRET_KEY, solo en env de Vercel) y, si el banco
//      aprueba, descuenta el stock vendido y registra el pedido.
//
// FALLBACK / errores: si falta stock, el cupón no es válido o el banco
// deniega, se responde con un error claro y NO se cobra nada a medias. Si el
// cobro se aprobó pero el descuento de stock falla (p. ej. falta la llave de
// servicio), no se revierte el cobro — se loguea para ajustar el stock a
// mano desde /admin/stock (perder una venta ya cobrada sería peor).
// ============================================================
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' })
  }

  const body = parseBody(req.body)
  const token = String(body.token || '').trim()
  const email = String(body.email || '').trim()
  const items = Array.isArray(body.items) ? body.items : []
  const cuponCodigo = String(body.cuponCodigo || '').trim()
  const cliente = body.cliente && typeof body.cliente === 'object' ? body.cliente : {}
  // Token de sesión de la clienta (opcional — solo si compró con la cuenta
  // iniciada). Se VERIFICA server-side contra Supabase Auth antes de usarlo
  // para nada; nunca se confía en un user_id que mande el navegador.
  const accessToken = String(body.accessToken || '').trim()

  if (!token) return res.status(400).json({ ok: false, error: 'Falta el token de pago.' })
  if (!email || email.length < 5) return res.status(400).json({ ok: false, error: 'Ingresa un correo válido.' })
  if (!items.length) return res.status(400).json({ ok: false, error: 'El carrito está vacío.' })
  if (!String(cliente.telefono || '').trim()) {
    return res.status(400).json({ ok: false, error: 'Falta el teléfono de contacto.' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey || !process.env.CULQI_SECRET_KEY) {
    // Sin esto no hay forma de cobrar con seguridad — mejor fallar claro que
    // cobrar a ciegas.
    console.error('[api/culqi-cobrar] faltan variables de entorno (SUPABASE_URL / SUPABASE_ANON_KEY / CULQI_SECRET_KEY).')
    return res.status(200).json({ ok: false, error: 'El pago en línea no está disponible ahora mismo. Escríbenos por WhatsApp.' })
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // ---- 1) Trae las variantes reales (stock + precio retail) ----
  let variantes
  try {
    variantes = await fetchVariantes(supabase)
  } catch (err) {
    console.error('[api/culqi-cobrar] no se pudo leer stock:', err && err.message)
    return res.status(200).json({ ok: false, error: 'No se pudo verificar el stock. Intenta de nuevo.' })
  }

  // ---- 2) Empareja cada línea del carrito con su variante real ----
  const lineas = []
  for (const it of items) {
    const cantidad = Math.max(1, Math.floor(Number(it.cantidad) || 0))
    const match = variantes.find(
      (v) =>
        String(v.productoId).toLowerCase() === String(it.id).toLowerCase() &&
        v.color.toLowerCase() === String(it.color || '').toLowerCase() &&
        v.talla.toLowerCase() === String(it.talla || '').toLowerCase()
    )
    if (!match || match.precioMenorPEN == null) {
      return res.status(200).json({ ok: false, error: `"${it.id}" no está disponible para pago en línea ahora mismo.` })
    }
    if (match.stock < cantidad) {
      return res.status(200).json({ ok: false, error: `Ya no queda stock suficiente de "${it.id}" (${match.color} / ${match.talla}).` })
    }
    lineas.push({ varianteId: match.varianteId, cantidad, precio: match.precioMenorPEN })
  }

  const subtotal = lineas.reduce((sum, l) => sum + l.precio * l.cantidad, 0)

  // ---- 3) Cupón (opcional) — se revalida contra el subtotal real ----
  let cupon = null
  let descuento = 0
  if (cuponCodigo) {
    const resultado = await validarCuponServidor(supabase, cuponCodigo, subtotal)
    if (!resultado.ok) return res.status(200).json({ ok: false, error: resultado.motivo })
    cupon = resultado.cupon
    descuento = calcularDescuentoServidor(cupon, subtotal)
  }

  const total = Math.max(0, subtotal - descuento)
  const amount = Math.round(total * 100) // céntimos
  if (amount < 100) {
    return res.status(200).json({ ok: false, error: 'El monto mínimo para pago en línea es S/ 1.' })
  }

  // ---- 4) Cobro con Culqi ----
  let charge
  try {
    const culqiRes = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency_code: 'PEN',
        email,
        source_id: token,
        capture: true,
        description: 'Victoria Modas — pedido online',
        metadata: {
          cliente: String(cliente.nombre || '').slice(0, 200),
          telefono: String(cliente.telefono || '').slice(0, 200),
          ciudad: String(cliente.ciudad || '').slice(0, 200),
        },
      }),
    })
    charge = await culqiRes.json().catch(() => null)
    if (!culqiRes.ok || !charge || charge.object === 'error') {
      const mensaje = (charge && (charge.user_message || charge.merchant_message)) || 'El banco no aprobó el pago.'
      return res.status(200).json({ ok: false, error: mensaje })
    }
  } catch (err) {
    console.error('[api/culqi-cobrar] error al cobrar con Culqi:', err && err.message)
    return res.status(200).json({ ok: false, error: 'No se pudo procesar el pago. Intenta de nuevo.' })
  }

  // ---- 5) Cobro aprobado: registra la venta REAL (best-effort con llave de
  // servicio) — mismos efectos que si la vendedora la tecleara a mano en
  // /admin/ventas: descuenta stock, crea venta+venta_items, deja constancia
  // del cupón usado (cupones_usados) y genera las recompensas (cupón de
  // recompra siempre; recompensa de referido si el cupón usado era uno de
  // referido). Si algo de esto falla, el cobro NO se revierte (ya se hizo) —
  // queda logueado para reconstruirlo a mano desde el panel.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let ventaId = null
  if (serviceKey) {
    try {
      const admin = createClient(supabaseUrl, serviceKey)

      // Stock: una actualización por variante (igual que createVenta en el panel).
      for (const l of lineas) {
        const { data: actual } = await admin.from('producto_variantes').select('stock').eq('id', l.varianteId).single()
        if (actual) {
          await admin.from('producto_variantes').update({ stock: Math.max(0, actual.stock - l.cantidad) }).eq('id', l.varianteId)
        }
      }

      // Si la clienta tenía sesión iniciada, verifica el token (nunca se
      // confía en un user_id mandado por el navegador) y busca/crea su
      // ficha de cliente para que la venta le aparezca en "Mis pedidos".
      const clienteId = await resolverClienteId(supabase, admin, accessToken, cliente, email)

      const { data: venta, error: errVenta } = await admin
        .from('ventas')
        .insert({
          cliente_id: clienteId,
          canal: 'menor',
          estado: 'confirmado',
          subtotal,
          descuento,
          total,
          cupon_id: cupon?.id || null,
          direccion_envio: String(cliente.ciudad || ''),
          telefono_contacto: String(cliente.telefono || ''),
          notas: String(cliente.notas || ''),
          origen: 'culqi',
          referencia_pago: charge.id,
        })
        .select()
        .single()
      if (errVenta) throw errVenta
      ventaId = venta.id

      await admin.from('venta_items').insert(
        lineas.map((l) => ({ venta_id: venta.id, producto_variante_id: l.varianteId, cantidad: l.cantidad, precio_unitario: l.precio }))
      )

      if (cupon) {
        await admin.from('cupones').update({ usos_actuales: (cupon.usos_actuales || 0) + 1 }).eq('id', cupon.id)
        await admin.from('cupones_usados').insert({ cupon_id: cupon.id, cliente_id: clienteId, venta_id: venta.id, telefono: String(cliente.telefono || '') })
      }

      // Cupón "gracias por tu compra" — best-effort, no debe tumbar una venta
      // que ya quedó bien registrada.
      try {
        await generarCuponRecompra(admin, venta.id)
      } catch (err) {
        console.warn('[culqi-cobrar] no se pudo generar el cupón de recompra:', err && err.message)
      }

      // Si el cupón usado era de referido, recompensa a quien refirió.
      if (cupon?.canal === 'referido' && cupon.created_by) {
        try {
          await generarCuponRecompensaReferido(admin, cupon.created_by, venta.id)
        } catch (err) {
          console.warn('[culqi-cobrar] no se pudo generar la recompensa de referido:', err && err.message)
        }
      }
    } catch (err) {
      // El cobro YA se hizo — no se revierte por esto. Se deja constancia
      // completa para reconstruir la venta a mano desde el panel.
      console.error(
        '[api/culqi-cobrar] cobro OK (chargeId=%s) pero falló registrar la venta — reconstruir a mano en /admin/ventas:',
        charge.id,
        JSON.stringify({ lineas, cupon: cupon?.codigo, total }),
        err && err.message
      )
    }
  } else {
    console.error('[api/culqi-cobrar] cobro OK pero SUPABASE_SERVICE_ROLE_KEY no está configurada — venta NO registrada. Ajustar a mano:', JSON.stringify(lineas))
  }

  // ---- 6) Registro del pedido en la hoja (best-effort, no bloquea la respuesta) ----
  registrarPedidoEnHoja({ cliente, items, total, cupon }).catch(() => {})

  return res.status(200).json({ ok: true, chargeId: charge.id, ventaId, total })
}

// ------------------------------------------------------------
// Resuelve el cliente_id de la venta: si el navegador mandó un access_token
// de sesión, se verifica CRIPTOGRÁFICAMENTE contra Supabase Auth (nunca se
// confía en un user_id suelto) y se busca/crea su ficha en `clientes` para
// que la compra le aparezca en "Mis pedidos". Sin token válido → null
// (compra de invitado, coherente con el modo invitado del sitio).
// ------------------------------------------------------------
async function resolverClienteId(supabaseAnon, admin, accessToken, cliente, email) {
  if (!accessToken) return null
  try {
    const { data, error } = await supabaseAnon.auth.getUser(accessToken)
    if (error || !data?.user) return null
    const userId = data.user.id

    const { data: existente } = await admin.from('clientes').select('id').eq('user_id', userId).maybeSingle()
    if (existente) return existente.id

    const { data: nuevo, error: errNuevo } = await admin
      .from('clientes')
      .insert({
        user_id: userId,
        nombre: String(cliente.nombre || '').trim(),
        telefono: String(cliente.telefono || '').trim(),
        email,
      })
      .select('id')
      .single()
    if (errNuevo) throw errNuevo
    return nuevo.id
  } catch (err) {
    console.warn('[culqi-cobrar] no se pudo resolver la ficha de cliente (venta queda como invitado):', err && err.message)
    return null
  }
}

// Mismo criterio que generarCuponRecompra en src/lib/supabaseAdmin.js —
// duplicado aquí porque ese archivo no se puede importar en /api (usa
// import.meta.env, que no existe en el runtime serverless de Vercel).
function codigoRecompraAleatorio() {
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GRACIAS${sufijo}`
}

async function generarCuponRecompra(admin, ventaId) {
  const fechaFin = new Date()
  fechaFin.setDate(fechaFin.getDate() + 30)
  for (let intento = 0; intento < 3; intento++) {
    const { error } = await admin.from('cupones').insert({
      codigo: codigoRecompraAleatorio(),
      descripcion: `Gracias por tu compra — venta ${ventaId.slice(0, 8)}`,
      tipo: 'porcentaje',
      valor: 10,
      monto_minimo: 0,
      usos_maximos: 1,
      canal: 'recompra',
      fecha_fin: fechaFin.toISOString(),
      activo: true,
    })
    if (!error) return
    if (error.code !== '23505') throw error // no es choque de código → no reintentar
  }
}

async function generarCuponRecompensaReferido(admin, referenteUserId, ventaId) {
  const fechaFin = new Date()
  fechaFin.setDate(fechaFin.getDate() + 30)
  for (let intento = 0; intento < 3; intento++) {
    const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
    const { error } = await admin.from('cupones').insert({
      codigo: `REFE${sufijo}`,
      descripcion: `Recompensa por referir — venta ${ventaId.slice(0, 8)}`,
      tipo: 'monto_fijo',
      valor: 15,
      monto_minimo: 0,
      usos_maximos: 1,
      canal: 'recompensa_referido',
      created_by: referenteUserId,
      fecha_fin: fechaFin.toISOString(),
      activo: true,
    })
    if (!error) return
    if (error.code !== '23505') throw error
  }
}

// ------------------------------------------------------------
// Lee producto_variantes (canal público: menor/ambos, activas) con el mismo
// join que usa /api/stock.js, pero agregando el id de la variante (necesario
// aquí para poder descontar stock después).
// ------------------------------------------------------------
async function fetchVariantes(supabase) {
  const { data, error } = await supabase
    .from('producto_variantes')
    .select('id, producto_id, stock, canal, activo, precio_menor_pen, tallas(nombre), colores(nombre), productos!inner(activo)')
    .eq('activo', true)
    .in('canal', ['menor', 'ambos'])
    .eq('productos.activo', true)
  if (error) throw error
  return (data || []).map((r) => ({
    varianteId: r.id,
    productoId: r.producto_id,
    color: r.colores?.nombre || '',
    talla: r.tallas?.nombre || '',
    stock: r.stock,
    precioMenorPEN: r.precio_menor_pen,
  }))
}

// Misma lógica que src/lib/cupones.js#validarCupon, pero corriendo en el
// servidor (no se puede reusar el archivo del cliente: usa import.meta.env).
async function validarCuponServidor(supabase, codigo, subtotal) {
  const code = codigo.trim().toUpperCase()
  const { data: cupon, error } = await supabase.from('cupones').select('*').ilike('codigo', code).eq('activo', true).maybeSingle()
  if (error) return { ok: false, motivo: 'No se pudo validar el cupón.' }
  if (!cupon) return { ok: false, motivo: 'Ese código no existe o ya no está activo.' }

  const ahora = new Date()
  if (cupon.fecha_inicio && new Date(cupon.fecha_inicio) > ahora) return { ok: false, motivo: 'Ese cupón todavía no está disponible.' }
  if (cupon.fecha_fin && new Date(cupon.fecha_fin) < ahora) return { ok: false, motivo: 'Ese cupón ya venció.' }
  if (cupon.usos_maximos != null && cupon.usos_actuales >= cupon.usos_maximos) return { ok: false, motivo: 'Ese cupón ya alcanzó su límite de usos.' }
  if (cupon.monto_minimo && subtotal < cupon.monto_minimo) return { ok: false, motivo: `Este cupón requiere una compra mínima de S/ ${cupon.monto_minimo}.` }

  return { ok: true, cupon }
}

function calcularDescuentoServidor(cupon, subtotal) {
  if (!cupon) return 0
  if (cupon.tipo === 'porcentaje') return Math.round((subtotal * (Number(cupon.valor) || 0)) / 100)
  if (cupon.tipo === 'monto_fijo') return Math.min(Number(cupon.valor) || 0, subtotal)
  return 0 // envio_gratis
}

// Reusa el mismo Apps Script que /api/pedido.js, marcando el canal como
// pagado en línea para que el dueño lo distinga en la hoja.
async function registrarPedidoEnHoja({ cliente, items, total, cupon }) {
  const url = process.env.SHEETS_WEBAPP_URL
  if (!url) return
  const detalle = items
    .map((it) => `${it.cantidad}× ${it.id}${it.color || it.talla ? ` (${[it.color, it.talla].filter(Boolean).join('/')})` : ''}`)
    .join('; ')
  const extras = [cupon ? `Cupón: ${cupon.codigo}` : ''].filter(Boolean).join(' — ')
  const pedido = {
    canal: 'menor',
    cliente: String(cliente.nombre || '').trim(),
    telefono: String(cliente.telefono || '').trim(),
    items: `[PAGADO ONLINE] ${extras ? `${detalle} — ${extras}` : detalle}`,
    total: `S/ ${total}`,
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
      redirect: 'follow',
      signal: controller.signal,
    })
  } catch (err) {
    console.error('[api/culqi-cobrar] no se pudo registrar en la hoja (el cobro ya se hizo):', err && err.message)
  } finally {
    clearTimeout(timeout)
  }
}

function parseBody(body) {
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  return typeof body === 'object' ? body : {}
}
