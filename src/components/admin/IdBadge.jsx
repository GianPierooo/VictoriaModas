// ============================================================
// IdBadge — identificador de fila, en monoespaciado, clic para copiar.
// ------------------------------------------------------------
// Usado en TODAS las tablas/listas del panel admin (productos, stock,
// cupones, clientes, ventas, catálogo base, reclamaciones) para poder
// ubicar una fila exacta en Supabase sin adivinar — pedido explícito del
// dueño ("deben salir en todos, hasta id de los cupones, todo").
//
// `full`: el id de productos es un slug legible (ej. "pantalon-scuba-vena")
// y conviene verlo completo; el resto son UUID — se truncan a 8 caracteres
// (igual que como Supabase y GitHub muestran los suyos) con el valor
// completo en el title y copiado al portapapeles.
// ============================================================
import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'

export default function IdBadge({ value, full = false }) {
  const [copiado, setCopiado] = useState(false)

  if (!value) return <span className="text-ink-muted/40">—</span>

  const texto = full || String(value).length <= 10 ? value : `${String(value).slice(0, 8)}…`

  const copiar = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(String(value))
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1500)
    } catch {
      // Portapapeles bloqueado (sin permiso, contexto no seguro, etc.) — no rompe nada, solo no copia.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title={copiado ? 'Copiado' : `${value} — clic para copiar`}
      className="inline-flex max-w-full items-center gap-1 rounded-md bg-cream-dark px-2 py-1 font-mono text-[11px] text-ink-muted transition-colors hover:text-ink cursor-pointer"
    >
      <span className="truncate">{texto}</span>
      {copiado && <CheckIcon className="h-3 w-3 flex-shrink-0 text-clay" />}
    </button>
  )
}
