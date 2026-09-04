import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import { listVentasStaff, updateVentaEstado } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'

const ESTADOS = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']
const ESTADO_LABEL = { pendiente: 'Pendiente', confirmado: 'Confirmado', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado' }

export default function AdminVentasListPage() {
  useDocumentMeta({ title: 'Ventas | Panel admin' })
  const toast = useToast()
  const [ventas, setVentas] = useState(null)

  const cargar = () => listVentasStaff().then(setVentas).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cambiarEstado = async (venta, estado) => {
    try {
      await updateVentaEstado(venta.id, estado)
      setVentas((prev) => prev.map((v) => (v.id === venta.id ? { ...v, estado } : v)))
    } catch (err) {
      toast.error('No se pudo actualizar: ' + err.message)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
          <h1 className="font-serif text-3xl font-light text-ink">Ventas</h1>
        </div>
        <Link
          to="/admin/ventas/nueva"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay"
        >
          <PlusIcon className="h-4 w-4" />
          Nueva venta
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Artículos</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas === null && <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-muted">Cargando…</td></tr>}
            {ventas !== null && ventas.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-muted">Sin ventas todavía.</td></tr>}
            {(ventas || []).map((v) => (
              <tr key={v.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4 text-ink-soft">
                  {new Date(v.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-4 font-light text-ink">{v.clientes?.nombre || '—'}</td>
                <td className="px-5 py-4 text-ink-soft">
                  {(v.venta_items || []).map((it, i) => (
                    <div key={i}>
                      {it.cantidad}× {it.producto_variantes?.productos?.nombre || 'Producto'}
                      {it.producto_variantes ? ` (${it.producto_variantes.colores?.nombre}/${it.producto_variantes.tallas?.nombre})` : ''}
                    </div>
                  ))}
                </td>
                <td className="px-5 py-4 font-serif text-ink">{formatPEN(v.total) || `S/ ${v.total}`}</td>
                <td className="px-5 py-4">
                  <select
                    value={v.estado}
                    onChange={(e) => cambiarEstado(v, e.target.value)}
                    className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs uppercase tracking-wide text-ink-soft focus:border-clay focus:outline-none"
                  >
                    {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
