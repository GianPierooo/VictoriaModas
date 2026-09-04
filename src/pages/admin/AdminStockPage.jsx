import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PencilIcon } from '@heroicons/react/24/outline'
import { listStockGeneral, updateVarianteStock } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'

// Mismo criterio en toda la web: nunca "agotado" — a lo sumo "últimas
// piezas" (0 incluido). Ver api/stock.js / useStock.js.
function estadoDe(stock) {
  return stock <= 3 ? 'ultimas' : 'disponible'
}

export default function AdminStockPage() {
  useDocumentMeta({ title: 'Stock | Panel admin' })
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [soloBajo, setSoloBajo] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [valorEditado, setValorEditado] = useState('')

  const cargar = () => listStockGeneral().then(setItems).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    return (items || []).filter((v) => {
      if (soloBajo && v.stock > 3) return false
      if (!term) return true
      return v.productoNombre.toLowerCase().includes(term) || v.color.toLowerCase().includes(term) || v.talla.toLowerCase().includes(term)
    })
  }, [items, busqueda, soloBajo])

  const stockBajoCount = (items || []).filter((v) => v.stock <= 3).length

  const empezarEdicion = (v) => {
    setEditandoId(v.id)
    setValorEditado(String(v.stock))
  }

  const guardarEdicion = async (v) => {
    const nuevo = Math.max(0, Number(valorEditado) || 0)
    setEditandoId(null)
    if (nuevo === v.stock) return
    try {
      await updateVarianteStock(v.id, nuevo)
      setItems((prev) => prev.map((it) => (it.id === v.id ? { ...it, stock: nuevo } : it)))
      toast.success('Stock actualizado.')
    } catch (err) {
      toast.error('No se pudo actualizar: ' + err.message)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
        <h1 className="font-serif text-3xl font-light text-ink">Stock</h1>
        {stockBajoCount > 0 && (
          <p className="mt-2 text-sm font-light text-clay-dark">
            {stockBajoCount} variante{stockBajoCount === 1 ? '' : 's'} con 3 o menos unidades — conviene reponer pronto.
          </p>
        )}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por producto, color o talla..."
          className="w-full max-w-sm rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input type="checkbox" checked={soloBajo} onChange={(e) => setSoloBajo(e.target.checked)} />
          Solo stock bajo (≤3)
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Producto</th>
              <th className="px-5 py-4">Color</th>
              <th className="px-5 py-4">Talla</th>
              <th className="px-5 py-4">Precio</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {items === null && <tr><td colSpan={7} className="px-5 py-8 text-center text-ink-muted">Cargando…</td></tr>}
            {items !== null && filtrados.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-ink-muted">Sin resultados.</td></tr>}
            {filtrados.map((v) => {
              const estado = estadoDe(v.stock)
              return (
                <tr key={v.id} className={`border-b border-ink/5 last:border-0 ${v.activo ? '' : 'opacity-50'}`}>
                  <td className="px-5 py-4 font-light text-ink">
                    <Link to={`/admin/productos/${v.productoId}`} className="hover:text-clay">
                      {v.productoNombre}
                    </Link>
                    {!v.activo && <span className="ml-2 text-[10px] uppercase tracking-wide text-ink-muted">Inactivo</span>}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{v.color}</td>
                  <td className="px-5 py-4 uppercase tracking-[0.08em] text-ink-soft">{v.talla}</td>
                  <td className="px-5 py-4 text-ink-soft">{formatPEN(v.precioMenorPEN) || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide ${estado === 'ultimas' ? 'bg-clay/10 text-clay-dark' : 'bg-ink/5 text-ink-soft'}`}>
                      {estado === 'ultimas' ? 'Últimas piezas' : 'Disponible'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {editandoId === v.id ? (
                      <input
                        type="number"
                        min="0"
                        autoFocus
                        value={valorEditado}
                        onChange={(e) => setValorEditado(e.target.value)}
                        onBlur={() => guardarEdicion(v)}
                        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                        className="w-20 rounded-md border border-clay bg-white px-2.5 py-1.5 text-ink focus:outline-none"
                      />
                    ) : (
                      <span className="text-ink">{v.stock}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {editandoId !== v.id && (
                      <button type="button" onClick={() => empezarEdicion(v)} aria-label={`Editar stock de ${v.productoNombre}`} className="text-ink-muted hover:text-ink">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
