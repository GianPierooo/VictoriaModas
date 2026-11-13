import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownTrayIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { listStockGeneral, updateVarianteStock, listCategorias, listMovimientosStock } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'
import { formatPEN } from '../../utils/price.js'
import IdBadge from '../../components/admin/IdBadge.jsx'
import { PageHeader, StatCard, Chip, Drawer, TablaVacia, btnSecondary, btnPrimary, pillInputClass, inputClass, labelClass } from '../../components/admin/AdminUI.jsx'
import { motivoStockLabel, fechaHora, descargarCSV } from '../../utils/adminUtils.js'

// Mismo criterio en toda la web: nunca "agotado" — a lo sumo "últimas
// piezas" (0 incluido). Ver api/stock.js / useStock.js.
const estadoDe = (stock) => (stock <= 3 ? 'ultimas' : 'disponible')
const MOTIVOS_AJUSTE = ['reposicion', 'conteo', 'merma', 'devolucion', 'ajuste']

export default function AdminStockPage() {
  useDocumentMeta({ title: 'Stock | Panel admin' })
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [filtro, setFiltro] = useState('todo') // todo | bajo | cero | inactivos
  const [ajuste, setAjuste] = useState(null) // { variante, valor, motivo }
  const [historial, setHistorial] = useState(null)

  const cargar = () => listStockGeneral().then(setItems).catch((e) => toast.error(e.message))
  useEffect(() => {
    cargar()
    listCategorias().then(setCategorias).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    return (items || []).filter((v) => {
      const activa = v.activo && v.productoActivo
      if (filtro === 'bajo' && !(activa && v.stock <= 3)) return false
      if (filtro === 'cero' && !(activa && v.stock === 0)) return false
      if (filtro === 'inactivos' && activa) return false
      if (categoria !== 'todas' && v.categoriaId !== categoria) return false
      if (!term) return true
      return [v.productoNombre, v.productoSku, v.color, v.talla, v.codigo].filter(Boolean).some((s) => s.toLowerCase().includes(term))
    })
  }, [items, busqueda, filtro, categoria])

  const resumen = useMemo(() => {
    const activas = (items || []).filter((v) => v.activo && v.productoActivo)
    return {
      unidades: activas.reduce((s, v) => s + v.stock, 0),
      valor: activas.reduce((s, v) => s + v.stock * (Number(v.precioMenorPEN) || 0), 0),
      bajo: activas.filter((v) => v.stock <= 3).length,
      cero: activas.filter((v) => v.stock === 0).length,
    }
  }, [items])

  const guardarAjuste = async (e) => {
    e.preventDefault()
    const { variante, valor, motivo } = ajuste
    const nuevo = Math.max(0, Number(valor) || 0)
    if (nuevo === variante.stock) {
      setAjuste(null)
      return
    }
    try {
      await updateVarianteStock(variante.id, nuevo, motivo)
      setItems((prev) => prev.map((it) => (it.id === variante.id ? { ...it, stock: nuevo } : it)))
      toast.success(`Stock de ${variante.productoNombre} (${variante.color}/${variante.talla}): ${variante.stock} → ${nuevo}`)
      setAjuste(null)
    } catch (err) {
      toast.error('No se pudo actualizar: ' + err.message)
    }
  }

  const exportar = () => {
    descargarCSV(`stock-${new Date().toISOString().slice(0, 10)}.csv`, [
      { label: 'Código', value: (v) => v.codigo },
      { label: 'Producto', value: (v) => v.productoNombre },
      { label: 'SKU', value: (v) => v.productoSku },
      { label: 'Color', value: (v) => v.color },
      { label: 'Talla', value: (v) => v.talla },
      { label: 'Precio', value: (v) => (v.precioMenorPEN != null ? Number(v.precioMenorPEN).toFixed(2) : '') },
      { label: 'Stock', value: (v) => v.stock },
      { label: 'Activa', value: (v) => (v.activo && v.productoActivo ? 'Sí' : 'No') },
    ], filtrados)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader title="Stock">
        <button type="button" onClick={exportar} disabled={!filtrados.length} className={btnSecondary}>
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exportar
        </button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Prendas en stock" value={resumen.unidades} hint="Solo variantes activas" />
        <StatCard label="Valor a precio de venta" value={formatPEN(resumen.valor) || `S/ ${resumen.valor.toFixed(2)}`} />
        <StatCard label="Stock bajo (≤3)" value={resumen.bajo} tone={resumen.bajo ? 'alerta' : 'default'} />
        <StatCard label="En cero" value={resumen.cero} tone={resumen.cero ? 'alerta' : 'default'} hint="En la web se ve como “últimas piezas”" />
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por producto, SKU, color, talla o código..."
            className={`w-full pl-9 ${pillInputClass}`}
          />
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={pillInputClass}>
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)} className={pillInputClass}>
          <option value="todo">Todas las variantes</option>
          <option value="bajo">Stock bajo (≤3)</option>
          <option value="cero">En cero</option>
          <option value="inactivos">Inactivas</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Código</th>
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
            {items === null && <TablaVacia cols={8}>Cargando…</TablaVacia>}
            {items !== null && filtrados.length === 0 && <TablaVacia cols={8}>Sin resultados.</TablaVacia>}
            {filtrados.map((v) => {
              const activa = v.activo && v.productoActivo
              return (
                <tr key={v.id} className={`border-b border-ink/5 last:border-0 ${activa ? '' : 'opacity-50'}`}>
                  <td className="px-5 py-4"><IdBadge value={v.codigo || v.id} /></td>
                  <td className="px-5 py-4 font-light text-ink">
                    <Link to={`/admin/productos/${v.productoId}`} className="hover:text-clay">{v.productoNombre}</Link>
                    {v.productoSku && <span className="block text-xs text-ink-muted">{v.productoSku}</span>}
                    {!v.productoActivo ? (
                      <span className="text-[10px] uppercase tracking-wide text-ink-muted">Producto inactivo</span>
                    ) : !v.activo ? (
                      <span className="text-[10px] uppercase tracking-wide text-ink-muted">Variante inactiva</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{v.color}</td>
                  <td className="px-5 py-4 uppercase tracking-[0.08em] text-ink-soft">{v.talla}</td>
                  <td className="px-5 py-4 text-ink-soft">{formatPEN(v.precioMenorPEN) || '—'}</td>
                  <td className="px-5 py-4">
                    <Chip tone={estadoDe(v.stock) === 'ultimas' ? 'clay' : 'neutral'}>
                      {estadoDe(v.stock) === 'ultimas' ? 'Últimas piezas' : 'Disponible'}
                    </Chip>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setAjuste({ variante: v, valor: String(v.stock), motivo: 'reposicion' })}
                      className="min-w-[3rem] rounded-md px-2.5 py-1.5 text-left text-ink ring-1 ring-ink/10 hover:ring-clay"
                      title="Ajustar stock"
                    >
                      {v.stock}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button type="button" onClick={() => setHistorial(v)} aria-label={`Historial de ${v.productoNombre}`} className="text-ink-muted hover:text-ink" title="Historial">
                      <ClockIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {ajuste && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={() => setAjuste(null)}>
          <form onSubmit={guardarAjuste} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-luxe text-clay">{ajuste.variante.codigo}</p>
            <h2 className="mb-5 font-serif text-lg font-light text-ink">
              {ajuste.variante.productoNombre} · {ajuste.variante.color}/{ajuste.variante.talla}
            </h2>
            <label className={labelClass} htmlFor="nuevo-stock">Stock nuevo (actual: {ajuste.variante.stock})</label>
            <input
              id="nuevo-stock"
              type="number"
              min="0"
              autoFocus
              value={ajuste.valor}
              onChange={(e) => setAjuste((a) => ({ ...a, valor: e.target.value }))}
              className={`mb-4 ${inputClass}`}
            />
            <label className={labelClass} htmlFor="motivo-stock">Motivo</label>
            <select
              id="motivo-stock"
              value={ajuste.motivo}
              onChange={(e) => setAjuste((a) => ({ ...a, motivo: e.target.value }))}
              className={`mb-6 ${inputClass}`}
            >
              {MOTIVOS_AJUSTE.map((m) => <option key={m} value={m}>{motivoStockLabel(m)}</option>)}
            </select>
            <div className="flex gap-3">
              <button type="submit" className={btnPrimary}>Guardar</button>
              <button type="button" onClick={() => setAjuste(null)} className={btnSecondary}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <HistorialStock variante={historial} onClose={() => setHistorial(null)} />
    </div>
  )
}

function HistorialStock({ variante, onClose }) {
  const [movs, setMovs] = useState(null)
  useEffect(() => {
    if (!variante) return
    setMovs(null)
    listMovimientosStock(variante.id).then(setMovs).catch(() => setMovs([]))
  }, [variante])

  if (!variante) return null
  return (
    <Drawer open onClose={onClose} kicker={`${variante.codigo} · historial de stock`} title={`${variante.productoNombre} · ${variante.color}/${variante.talla}`}>
      <p className="mb-4 text-sm font-light text-ink-soft">Stock actual: <span className="text-ink">{variante.stock}</span></p>
      {movs === null && <p className="text-sm text-ink-muted">Cargando…</p>}
      {movs?.length === 0 && (
        <p className="text-sm text-ink-muted">Sin movimientos registrados. El historial empezó a guardarse el 29/10/2026.</p>
      )}
      {movs?.length > 0 && (
        <ul className="divide-y divide-ink/5 rounded-lg ring-1 ring-ink/10">
          {movs.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-light text-ink">
                  {motivoStockLabel(m.motivo)}
                  {m.ventas?.codigo && <span className="ml-2 font-mono text-xs text-ink-muted">{m.ventas.codigo}</span>}
                </p>
                <p className="text-xs text-ink-muted">{fechaHora(m.created_at)} · {m.stock_anterior} → {m.stock_nuevo}</p>
              </div>
              <span className={`font-medium ${m.delta < 0 ? 'text-clay-dark' : 'text-ink'}`}>{m.delta > 0 ? '+' : ''}{m.delta}</span>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}
