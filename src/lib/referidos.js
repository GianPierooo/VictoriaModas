// ============================================================
// referidos — código de referido por clienta + sus recompensas
// ------------------------------------------------------------
// El código de referido de cada clienta ES un cupón real (canal='referido',
// monto_fijo S/15, `created_by` = su user_id) — así se reutiliza TODA la
// infraestructura de cupones ya construida (CouponField, validarCupon,
// aplicar en el carrito/checkout/panel de ventas) sin código nuevo del lado
// de quien lo USA. Solo hace falta generarlo una vez por clienta y guardarlo
// en `perfiles.codigo_referido` para no crear uno nuevo cada vez.
//
// La recompensa para quien refirió (otro cupón, S/15, un solo uso) se
// genera en `createVenta` (supabaseAdmin.js) — el único punto real de
// "transacción confirmada" del sistema — cuando el cupón aplicado en una
// venta resulta ser de canal='referido'.
// ============================================================
import { supabase } from './supabaseClient.js'

const VALOR_REFERIDO = 15 // soles — tanto el descuento de la amiga como la recompensa

function sufijoAleatorio() {
  return Math.random().toString(36).slice(2, 6).toUpperCase()
}

function codigoDesdeNombre(nombre) {
  const base = (nombre || 'AMIGA')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 8) || 'AMIGA'
  return `${base}${sufijoAleatorio()}`
}

// Devuelve el código de referido de esta clienta, creándolo si es la
// primera vez que lo pide. Idempotente: si ya existe en `perfiles`, lo
// reutiliza en vez de generar uno nuevo cada visita.
export async function obtenerOCrearCodigoReferido(userId, nombre) {
  if (!supabase || !userId) return null

  const { data: perfil, error: errPerfil } = await supabase
    .from('perfiles')
    .select('codigo_referido')
    .eq('user_id', userId)
    .maybeSingle()
  if (errPerfil) throw errPerfil
  if (perfil?.codigo_referido) return perfil.codigo_referido

  for (let intento = 0; intento < 3; intento++) {
    const codigo = codigoDesdeNombre(nombre)
    const { error: errCupon } = await supabase.from('cupones').insert({
      codigo,
      descripcion: `Código de referido de ${nombre || 'una clienta'}`,
      tipo: 'monto_fijo',
      valor: VALOR_REFERIDO,
      monto_minimo: 30,
      usos_maximos: null, // puede referir a varias amigas
      canal: 'referido',
      created_by: userId,
      activo: true,
    })
    if (errCupon) {
      if (errCupon.code === '23505') {
        // Único (23505) puede ser por dos motivos: choque del texto del
        // código al azar (poco probable — reintentar con otro sufijo sirve),
        // o la restricción "un solo cupón de referido por usuario"
        // (`cupones_referido_unico`) — esto pasa si esta función se llamó
        // dos veces casi a la vez para la misma clienta (ej. StrictMode en
        // desarrollo, o dos pestañas). En ese segundo caso, el código real
        // ya lo creó la otra llamada — lo leemos y lo devolvemos, en vez de
        // reintentar a ciegas (evita duplicar cupones huérfanos).
        const { data: existente } = await supabase
          .from('cupones')
          .select('codigo')
          .eq('created_by', userId)
          .eq('canal', 'referido')
          .maybeSingle()
        if (existente?.codigo) {
          await supabase.from('perfiles').update({ codigo_referido: existente.codigo }).eq('user_id', userId)
          return existente.codigo
        }
        continue // era choque del texto del código — reintenta con otro sufijo
      }
      throw errCupon
    }
    const { error: errUpdate } = await supabase
      .from('perfiles')
      .update({ codigo_referido: codigo })
      .eq('user_id', userId)
    if (errUpdate) throw errUpdate
    return codigo
  }
  return null
}

// Cupones de recompensa que esta clienta ganó por referir (para mostrar en
// "Mi cuenta").
export async function listarRecompensasReferidos(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('cupones')
    .select('*')
    .eq('created_by', userId)
    .eq('canal', 'recompensa_referido')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const VALOR_REFERIDO_SOLES = VALOR_REFERIDO
