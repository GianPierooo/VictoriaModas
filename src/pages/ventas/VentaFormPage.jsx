import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { listClientes, listProductosParaVenta, createVenta } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'

const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'
const inputClass = 'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none'

export default function VentaFormPage() {
  useDocumentMeta({ title: 'Nueva venta | Panel de ventas' })
  const navigate = useNavigate()
  const toast = useToast()

  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState([])

  const [productoSel, setProductoSel] = useState('')
  const [varianteSel, setVarianteSel] = useState('')
  const [cantidadSel, setCantidadSel] = useState(1)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    listClientes().then(setClientes).catch((e) => toast.error(e.message))
    listProductosParaVenta().then(setProductos).catch((e) => toast.error(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const productoActual = productos.find((p) => p.id === productoSel)
  const variantesConStock = (productoActual?.producto_variantes || []).filter((v) => v.activo && v.stock > 0)

  const agregarItem = () => {
    const variante = variantesConStock.find((v) => v.id === varianteSel)
    if (!variante) {
      toast.error('Elige un producto y una variante con stock.')
      return
    }
    const cantidad = Number(cantidadSel) || 1
    if (cantidad > variante.stock) {
      toast.error(`Solo hay ${variante.stock} en stock.`)
      return
    }
    setItems((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        variante_id: variante.id,
        producto_nombre: productoActual.nombre,
        talla: variante.tallas?.nombre,
        color: variante.colores?.nombre,
        precio_unitario: Number(variante.precio_menor_pen) || 0,
        cantidad,
        stock_disponible: variante.stock,
      },
    ])
    setVarianteSel('')
    setCantidadSel(1)
  }

  const quitarItem = (key) => setItems((prev) => prev.filter((it) => it.key !== key))

  const total = useMemo(() => items.reduce((sum, it) => sum + it.precio_unitario * it.cantidad, 0), [items])

  const confirmarVenta = async () => {
    if (!clienteId) {
      toast.error('Elige un cliente.')
      return
    }
    if (items.length === 0) {
      toast.error('Agrega al menos un producto.')
      return
    }
    setGuardando(true)
    try {
      await createVenta({
        clienteId,
        items: items.map((it) => ({ variante_id: it.variante_id, cantidad: it.cantidad, precio_unitario: it.precio_unitario })),
      })
      toast.success('Venta registrada — se descontó el stock vendido.')
      navigate('/panel-ventas/ventas')
    } catch (err) {
      toast.error('No se pudo registrar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <Link to="/panel-ventas/ventas" className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-clay">
        <ChevronLeftIcon className="h-4 w-4" />
        Volver a ventas
      </Link>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Nueva venta</h1>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
        <label className={labelClass}>Cliente *</label>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={inputClass}>
          <option value="">Elige un cliente…</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}{c.telefono ? ` — ${c.telefono}` : ''}</option>)}
        </select>
        {clientes.length === 0 && (
          <p className="mt-2 text-xs text-ink-muted">
            No hay clientes todavía —{' '}
            <Link to="/panel-ventas/clientes" className="text-clay underline">regístralo primero</Link>.
          </p>
        )}
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
        <h2 className="mb-5 font-serif text-lg font-light text-ink">Agregar productos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end">
          <div>
            <label className={labelClass}>Producto</label>
            <select value={productoSel} onChange={(e) => { setProductoSel(e.target.value); setVarianteSel('') }} className={inputClass}>
              <option value="">Elige…</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Talla / color</label>
            <select value={varianteSel} onChange={(e) => setVarianteSel(e.target.value)} className={inputClass} disabled={!productoSel}>
              <option value="">Elige…</option>
              {variantesConStock.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.tallas?.nombre} / {v.colores?.nombre} — stock {v.stock} — {formatPEN(v.precio_menor_pen) || 'sin precio'}
                </option>
              ))}
            </select>
            {productoSel && variantesConStock.length === 0 && (
              <p className="mt-1.5 text-xs text-red-400">Sin variantes con stock.</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Cantidad</label>
            <input type="number" min="1" value={cantidadSel} onChange={(e) => setCantidadSel(e.target.value)} className={inputClass} />
          </div>
          <button
            type="button"
            onClick={agregarItem}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
          >
            <PlusIcon className="h-4 w-4" />
            Agregar
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
        <h2 className="mb-5 font-serif text-lg font-light text-ink">Detalle de la venta</h2>
        {items.length === 0 ? (
          <p className="text-sm text-ink-muted">Aún no agregaste productos.</p>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.key} className="flex items-center justify-between border-b border-ink/5 pb-3">
                <div>
                  <p className="font-light text-ink">{it.producto_nombre}</p>
                  <p className="text-xs text-ink-muted">{it.color} / {it.talla} · {it.cantidad} × {formatPEN(it.precio_unitario) || `S/ ${it.precio_unitario}`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-serif text-ink">{formatPEN(it.precio_unitario * it.cantidad) || `S/ ${it.precio_unitario * it.cantidad}`}</p>
                  <button type="button" onClick={() => quitarItem(it.key)} aria-label="Quitar" className="text-ink-muted hover:text-red-500">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] uppercase tracking-luxe text-ink-muted">Total</p>
              <p className="font-serif text-2xl font-light text-ink">{formatPEN(total) || `S/ ${total}`}</p>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={confirmarVenta}
        disabled={guardando}
        className="w-full rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60 sm:w-auto"
      >
        {guardando ? 'Registrando…' : 'Confirmar venta'}
      </button>
    </div>
  )
}
