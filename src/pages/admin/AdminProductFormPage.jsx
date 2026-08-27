import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ChevronLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  listCategorias,
  listTallas,
  listColores,
  getProductoAdmin,
  upsertProducto,
  replaceVariantes,
  uploadProductoImagen,
  deleteProductoImagen,
} from '../../lib/supabaseAdmin.js'
import { useToast } from '../../context/ToastContext.jsx'
import { useDocumentMeta } from '../../hooks/useDocumentMeta.js'

const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'
const inputClass =
  'w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-clay focus:outline-none'

function emptyVariante() {
  return { _key: crypto.randomUUID(), talla_id: '', color_id: '', stock: 0, precio_menor_pen: '', precio_mayor_pen: '', canal: 'menor', activo: true }
}

export default function AdminProductFormPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  useDocumentMeta({ title: `${isNew ? 'Nuevo producto' : 'Editar producto'} | Panel admin` })

  const [categorias, setCategorias] = useState([])
  const [tallas, setTallas] = useState([])
  const [colores, setColores] = useState([])

  const [productoId, setProductoId] = useState(id || '')
  const [form, setForm] = useState({ nombre: '', categoria_id: '', tela: '', descripcion: '', badge: '', activo: true })
  const [variantes, setVariantes] = useState([])
  const [imagenes, setImagenes] = useState([])
  const [colorImagenNueva, setColorImagenNueva] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    listCategorias().then(setCategorias).catch(() => {})
    listTallas().then(setTallas).catch(() => {})
    listColores().then(setColores).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    getProductoAdmin(id)
      .then((data) => {
        if (!data) {
          toast.error('Ese producto no existe.')
          navigate('/admin/productos')
          return
        }
        setForm({
          nombre: data.nombre || '',
          categoria_id: data.categoria_id || '',
          tela: data.tela || '',
          descripcion: data.descripcion || '',
          badge: data.badge || '',
          activo: data.activo,
        })
        setVariantes(
          (data.producto_variantes || []).map((v) => ({
            _key: v.id,
            id: v.id,
            talla_id: v.talla_id,
            color_id: v.color_id,
            stock: v.stock,
            precio_menor_pen: v.precio_menor_pen ?? '',
            precio_mayor_pen: v.precio_mayor_pen ?? '',
            canal: v.canal,
            activo: v.activo,
          }))
        )
        setImagenes(data.producto_imagenes || [])
      })
      .catch((err) => toast.error('No se pudo cargar el producto: ' + err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const guardarDatosBasicos = async (e) => {
    e.preventDefault()
    if (isNew && !productoId.trim()) {
      toast.error('Escribe un identificador para el producto (ej. "vestido-nuevo-modelo").')
      return
    }
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio.')
      return
    }
    setGuardando(true)
    try {
      await upsertProducto({ id: productoId.trim(), ...form })
      toast.success('Datos guardados.')
      if (isNew) navigate(`/admin/productos/${productoId.trim()}`, { replace: true })
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const guardarVariantes = async () => {
    const incompletas = variantes.some((v) => !v.talla_id || !v.color_id)
    if (incompletas) {
      toast.error('Cada variante necesita talla y color.')
      return
    }
    setGuardando(true)
    try {
      await replaceVariantes(productoId, variantes)
      toast.success('Variantes guardadas.')
      const data = await getProductoAdmin(productoId)
      setVariantes(
        (data.producto_variantes || []).map((v) => ({
          _key: v.id, id: v.id, talla_id: v.talla_id, color_id: v.color_id, stock: v.stock,
          precio_menor_pen: v.precio_menor_pen ?? '', precio_mayor_pen: v.precio_mayor_pen ?? '',
          canal: v.canal, activo: v.activo,
        }))
      )
    } catch (err) {
      toast.error('No se pudo guardar: ' + (err.message.includes('duplicate') ? 'ya existe una variante con esa talla y color.' : err.message))
    } finally {
      setGuardando(false)
    }
  }

  const actualizarVariante = (key, campo, valor) => {
    setVariantes((prev) => prev.map((v) => (v._key === key ? { ...v, [campo]: valor } : v)))
  }

  const quitarVariante = (key) => {
    setVariantes((prev) => prev.filter((v) => v._key !== key))
  }

  const subirImagen = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!colorImagenNueva) {
      toast.error('Elige a qué color pertenece la foto antes de subirla.')
      e.target.value = ''
      return
    }
    try {
      const nueva = await uploadProductoImagen(productoId, colorImagenNueva, file, imagenes.length)
      const color = colores.find((c) => c.id === colorImagenNueva)
      setImagenes((prev) => [...prev, { ...nueva, colores: { nombre: color?.nombre } }])
      toast.success('Foto subida.')
    } catch (err) {
      toast.error('No se pudo subir la foto: ' + err.message)
    } finally {
      e.target.value = ''
    }
  }

  const borrarImagen = async (imagen) => {
    if (!window.confirm('¿Quitar esta foto del producto?')) return
    try {
      await deleteProductoImagen(imagen)
      setImagenes((prev) => prev.filter((i) => i.id !== imagen.id))
    } catch (err) {
      toast.error('No se pudo quitar: ' + err.message)
    }
  }

  if (loading) return <p className="text-ink-muted">Cargando…</p>

  return (
    <div className="max-w-4xl">
      <Link to="/admin/productos" className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-clay">
        <ChevronLeftIcon className="h-4 w-4" />
        Volver a productos
      </Link>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">
        {isNew ? 'Nuevo producto' : `Editar: ${form.nombre}`}
      </h1>

      {/* ---- Datos básicos ---- */}
      <form onSubmit={guardarDatosBasicos} className="mb-10 space-y-6 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
        <h2 className="font-serif text-lg font-light text-ink">Datos básicos</h2>

        <div>
          <label className={labelClass}>Identificador (id) *</label>
          <input
            type="text"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            disabled={!isNew}
            placeholder="vestido-nuevo-modelo"
            className={`${inputClass} disabled:bg-cream disabled:text-ink-muted`}
          />
          {isNew && <p className="mt-1.5 text-xs text-ink-muted">Minúsculas y guiones, no se puede cambiar después.</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nombre *</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select name="categoria_id" value={form.categoria_id} onChange={handleChange} className={inputClass}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tela</label>
            <input type="text" name="tela" value={form.tela} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Etiqueta (badge)</label>
            <input type="text" name="badge" value={form.badge} onChange={handleChange} placeholder="Nuevo, -20%..." className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink-soft">
          <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="h-4 w-4 rounded border-ink/30 text-clay focus:ring-clay" />
          Producto activo (visible en el panel)
        </label>

        <button type="submit" disabled={guardando} className="rounded-full bg-ink px-8 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay disabled:opacity-60">
          {isNew ? 'Crear producto' : 'Guardar datos'}
        </button>
      </form>

      {!isNew && (
        <>
          {/* ---- Imágenes ---- */}
          <div className="mb-10 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
            <h2 className="mb-5 font-serif text-lg font-light text-ink">Imágenes por color</h2>
            <div className="mb-6 flex flex-wrap items-end gap-3">
              <div>
                <label className={labelClass}>Color de la foto</label>
                <select value={colorImagenNueva} onChange={(e) => setColorImagenNueva(e.target.value)} className={inputClass}>
                  <option value="">Elige un color…</option>
                  {colores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-xs uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink">
                <PlusIcon className="h-4 w-4" />
                Subir foto
                <input type="file" accept="image/*" onChange={subirImagen} className="hidden" />
              </label>
            </div>

            {imagenes.length === 0 ? (
              <p className="text-sm text-ink-muted">Aún no hay fotos.</p>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                {imagenes.map((img) => (
                  <div key={img.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-dark ring-1 ring-ink/10">
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 bg-ink/60 px-1.5 py-1 text-center text-[10px] text-cream">
                      {img.colores?.nombre || 'General'}
                    </span>
                    <button
                      type="button"
                      onClick={() => borrarImagen(img)}
                      className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-cream opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Quitar foto"
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- Variantes ---- */}
          <div className="mb-10 rounded-xl bg-white p-6 shadow-soft ring-1 ring-ink/10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-lg font-light text-ink">Variantes (talla × color × stock)</h2>
              <button
                type="button"
                onClick={() => setVariantes((prev) => [...prev, emptyVariante()])}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-4 py-2 text-xs uppercase tracking-[0.1em] text-ink transition-colors hover:border-ink"
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Agregar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-luxe text-ink-muted">
                    <th className="px-2 py-2">Talla</th>
                    <th className="px-2 py-2">Color</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">P. menor (S/)</th>
                    <th className="px-2 py-2">P. mayor (S/)</th>
                    <th className="px-2 py-2">Canal</th>
                    <th className="px-2 py-2">Activo</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {variantes.map((v) => (
                    <tr key={v._key} className="border-t border-ink/5">
                      <td className="px-2 py-2">
                        <select value={v.talla_id} onChange={(e) => actualizarVariante(v._key, 'talla_id', e.target.value)} className="rounded-md border border-ink/15 px-2 py-1.5 text-sm">
                          <option value="">—</option>
                          {tallas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select value={v.color_id} onChange={(e) => actualizarVariante(v._key, 'color_id', e.target.value)} className="rounded-md border border-ink/15 px-2 py-1.5 text-sm">
                          <option value="">—</option>
                          {colores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" value={v.stock} onChange={(e) => actualizarVariante(v._key, 'stock', e.target.value)} className="w-20 rounded-md border border-ink/15 px-2 py-1.5 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" step="0.01" value={v.precio_menor_pen} onChange={(e) => actualizarVariante(v._key, 'precio_menor_pen', e.target.value)} className="w-24 rounded-md border border-ink/15 px-2 py-1.5 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="number" min="0" step="0.01" value={v.precio_mayor_pen} onChange={(e) => actualizarVariante(v._key, 'precio_mayor_pen', e.target.value)} className="w-24 rounded-md border border-ink/15 px-2 py-1.5 text-sm" />
                      </td>
                      <td className="px-2 py-2">
                        <select value={v.canal} onChange={(e) => actualizarVariante(v._key, 'canal', e.target.value)} className="rounded-md border border-ink/15 px-2 py-1.5 text-sm">
                          <option value="menor">Menor</option>
                          <option value="mayor">Mayor</option>
                          <option value="ambos">Ambos</option>
                        </select>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <input type="checkbox" checked={v.activo} onChange={(e) => actualizarVariante(v._key, 'activo', e.target.checked)} className="h-4 w-4 rounded border-ink/30 text-clay focus:ring-clay" />
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" onClick={() => quitarVariante(v._key)} aria-label="Quitar variante" className="text-ink-muted hover:text-red-500">
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {variantes.length === 0 && <p className="py-4 text-sm text-ink-muted">Sin variantes todavía — agrega la primera.</p>}
            </div>

            <button
              type="button"
              onClick={guardarVariantes}
              disabled={guardando || variantes.length === 0}
              className="mt-6 rounded-full bg-ink px-8 py-3 text-xs uppercase tracking-[0.15em] text-cream transition-colors hover:bg-clay disabled:opacity-60"
            >
              Guardar variantes
            </button>
          </div>
        </>
      )}
    </div>
  )
}
