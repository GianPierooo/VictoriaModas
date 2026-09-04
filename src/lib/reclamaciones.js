// ============================================================
// reclamaciones — Libro de Reclamaciones virtual (Perú)
// ------------------------------------------------------------
// Cumple el Anexo I del Reglamento del Libro de Reclamaciones
// (D.S. N.° 011-2011-PCM, actualizado por D.S. N.° 101-2022-PCM): las
// 4 secciones obligatorias (identificación del consumidor, del bien
// contratado, detalle de la reclamación/pedido, y observaciones del
// proveedor), tipo Reclamo/Queja, y la constancia impresa/descargable
// para el consumidor. Vive en la propia web (nunca un formulario externo
// ni un Drive — eso es justo lo que Culqi observó).
//
// Cualquiera puede REGISTRAR un reclamo sin cuenta (RLS: insert público).
// Nadie puede leer reclamos ajenos desde el navegador — eso es privado,
// solo lo ve el equipo (admin/vendedor) desde /admin/reclamaciones.
// ============================================================
import { supabase } from './supabaseClient.js'

// "LR-20260904-8F2K" — no hace falta que la genere el servidor: el código
// solo sirve para que la clienta lo tenga como referencia y el equipo lo
// busque rápido; no es un dato de seguridad.
function generarCodigo() {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `LR-${fecha}-${sufijo}`
}

// Registra un reclamo/queja. Reintenta si el código choca (muy improbable).
// Devuelve la fila enviada (incluido el código) para mostrar/imprimir.
//
// A propósito NO se encadena `.select()` tras el insert: la política RLS
// solo permite INSERTAR a quien no tiene sesión (es un derecho del
// consumidor, no requiere cuenta), nunca LEER — y `.select()` obliga a
// Supabase a releer la fila con esos mismos permisos, lo que hace fallar
// TODO el envío con un error de RLS aunque el insert en sí haya sido
// válido. Como ya tenemos los datos en el navegador, no hace falta releerlos.
export async function crearReclamacion(datos) {
  if (!supabase) throw new Error('El libro de reclamaciones no está disponible ahora mismo. Escríbenos por WhatsApp.')

  for (let intento = 0; intento < 3; intento++) {
    const codigo = generarCodigo()
    const { error } = await supabase.from('reclamaciones').insert({ ...datos, codigo })
    if (!error) return { ...datos, codigo }
    if (error.code !== '23505') throw error // no es choque de código → no reintentar
  }
  throw new Error('No se pudo registrar el reclamo. Intenta de nuevo o escríbenos por WhatsApp.')
}
