// ============================================================
// Cliente de Supabase — Victoria Modas (sistema de ventas/clientes)
// ------------------------------------------------------------
// Proyecto Supabase dedicado a este sistema (independiente del backend de
// facturación electrónica de la tienda física, que vive en otro proyecto).
//
// Claves SOLO desde variables de entorno (Vite: prefijo VITE_, públicas por
// diseño — la `anon key` está pensada para el navegador; la seguridad real
// la da RLS en cada tabla, no el secreto de esta clave).
//
// FALLBACK: si faltan las variables (ej. build sin .env.local), no revienta
// la app — expone `supabase = null` y cada consumidor decide su fallback
// (igual que /api/stock con la hoja de cálculo).
// ============================================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null

if (!supabase && import.meta.env.DEV) {
  console.warn(
    '[supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — el login/registro no funcionará hasta configurarlas en .env.local.'
  )
}
