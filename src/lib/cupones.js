// ============================================================
// cupones — validación y cálculo de descuento (lado cliente)
// ------------------------------------------------------------
// Lee directo de Supabase (política `cupones_select_publico`: cualquiera
// puede leer cupones activos, igual que el catálogo). Todavía no hay
// pasarela de pago propia: aplicar un cupón aquí solo afecta el total
// MOSTRADO y el mensaje de WhatsApp — la vendedora lo confirma al cerrar
// la venta real (panel de ventas), que es donde se descuenta el uso.
//
// Si Supabase no está configurado, se comporta igual que el resto del
// proyecto: no rompe, solo dice que el cupón no es válido.
// ============================================================
import { supabase } from './supabaseClient.js'

// Busca un cupón por código y valida que se pueda usar para `subtotal`.
// Devuelve { ok: true, cupon } o { ok: false, motivo }.
export async function validarCupon(codigo, subtotal) {
  const code = (codigo || '').trim().toUpperCase()
  if (!code) return { ok: false, motivo: 'Ingresa un código.' }
  if (!supabase) return { ok: false, motivo: 'Cupones no disponibles por ahora.' }

  const { data: cupon, error } = await supabase
    .from('cupones')
    .select('*')
    .ilike('codigo', code)
    .eq('activo', true)
    .maybeSingle()

  if (error) return { ok: false, motivo: 'No se pudo validar el cupón.' }
  if (!cupon) return { ok: false, motivo: 'Ese código no existe o ya no está activo.' }

  const ahora = new Date()
  if (cupon.fecha_inicio && new Date(cupon.fecha_inicio) > ahora) {
    return { ok: false, motivo: 'Ese cupón todavía no está disponible.' }
  }
  if (cupon.fecha_fin && new Date(cupon.fecha_fin) < ahora) {
    return { ok: false, motivo: 'Ese cupón ya venció.' }
  }
  if (cupon.usos_maximos != null && cupon.usos_actuales >= cupon.usos_maximos) {
    return { ok: false, motivo: 'Ese cupón ya alcanzó su límite de usos.' }
  }
  if (cupon.monto_minimo && subtotal < cupon.monto_minimo) {
    return { ok: false, motivo: `Este cupón requiere una compra mínima de S/ ${cupon.monto_minimo}.` }
  }

  return { ok: true, cupon }
}

// Cupón "de bienvenida" a mostrar en el popup de primera visita: el más
// reciente cuyo código empiece con BIENVENIDA y esté activo. Así, si se
// cambia el % desde /admin/cupones, el popup lo refleja solo — no hay un
// valor fijo escrito en la UI.
export async function obtenerCuponBienvenida() {
  if (!supabase) return null
  const { data } = await supabase
    .from('cupones')
    .select('*')
    .ilike('codigo', 'BIENVENIDA%')
    .eq('activo', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data || null
}

// Cupones "premio de ruleta": los activos con canal = 'ruleta'. Si hay 2 o
// más, WelcomePopup muestra la ruleta gamificada en vez del popup directo.
export async function obtenerCuponesRuleta() {
  if (!supabase) return []
  const { data } = await supabase
    .from('cupones')
    .select('*')
    .eq('canal', 'ruleta')
    .eq('activo', true)
    .order('valor', { ascending: true })
    .limit(5)
  return data || []
}

// Descuento en soles que aplica un cupón sobre un subtotal. `envio_gratis`
// no descuenta el subtotal (el envío no es una línea propia todavía) — solo
// se usa para mostrar el mensaje correcto en la UI.
export function calcularDescuento(cupon, subtotal) {
  if (!cupon) return 0
  if (cupon.tipo === 'porcentaje') return Math.round((subtotal * (Number(cupon.valor) || 0)) / 100)
  if (cupon.tipo === 'monto_fijo') return Math.min(Number(cupon.valor) || 0, subtotal)
  return 0 // envio_gratis
}
