import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { listProductosAdmin, listCategorias, upsertProducto, deleteProducto } from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'

export default function AdminProductsListPage() {
  useDocumentMeta({ title: 'Productos | Panel admin' })
  const toast = useToast()
  const [productos, setProductos] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [search, setSearch] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')

  const cargar = () => {
    listProductosAdmin()
      .then(setProductos)
      .catch((err) => toast.error('No se pudieron cargar los productos: ' + err.message))
  }

  useEffect(() => {
    cargar()
    listCategorias().then(setCategorias).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(() => {
    if (!productos) return []
    const term = search.trim().toLowerCase()
    return productos.filter((p) => {
      if (categoriaFiltro !== 'todas' && p.categoria_id !== categoriaFiltro) return false
      if (term && !p.nombre.toLowerCase().includes(term)) return false
      return true
    })
  }, [productos, search, categoriaFiltro])

  const toggleActivo = async (producto) => {
    try {
      await upsertProducto({ id: producto.id, activo: !producto.activo })
      cargar()
    } catch (err) {
      toast.error('No se pudo actualizar: ' + err.message)
    }
  }

  const eliminar = async (producto) => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esto borra también sus variantes e imágenes.`)) return
    try {
      await deleteProducto(producto.id)
      toast.success('Producto eliminado.')
      cargar()
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-luxe text-clay">Panel admin</p>
          <h1 className="font-serif text-3xl font-light text-ink">Productos</h1>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay"
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-full border border-ink/15 bg-white py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink-soft focus:border-clay focus:outline-none"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-soft ring-1 ring-ink/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-luxe text-ink-muted">
              <th className="px-5 py-4">Producto</th>
              <th className="px-5 py-4">Categoría</th>
              <th className="px-5 py-4">Variantes</th>
              <th className="px-5 py-4">Stock total</th>
              <th className="px-5 py-4">Activo</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {productos === null && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-muted">Cargando…</td></tr>
            )}
            {productos !== null && filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-ink-muted">Sin productos que coincidan.</td></tr>
            )}
            {filtrados.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-4 font-light text-ink">{p.nombre}</td>
                <td className="px-5 py-4 text-ink-soft">{p.categoriaNombre}</td>
                <td className="px-5 py-4 text-ink-soft">{p.variantesCount}</td>
                <td className="px-5 py-4 text-ink-soft">{p.stockTotal}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleActivo(p)}
                    className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide transition-colors ${
                      p.activo ? 'bg-clay/10 text-clay' : 'bg-ink/5 text-ink-muted'
                    }`}
                  >
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link to={`/admin/productos/${p.id}`} className="mr-4 text-xs uppercase tracking-wide text-clay hover:text-clay-dark">
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminar(p)}
                    className="text-xs uppercase tracking-wide text-ink-muted hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
